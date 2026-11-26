import { PluginValidator } from './PluginValidator.js';
import { getBundledPluginDefinitions } from '../plugins/registry.js';

/**
 * Plugin Loader - Discovers and loads registered plugin modules
 */
class PluginLoader {
  constructor(pluginManager, options = {}) {
    this.pluginManager = pluginManager;
    this.pluginDirectories = [
      '/plugins'
    ];
    this.pluginDefinitions = options.pluginDefinitions ?? getBundledPluginDefinitions();
    this.loadedPlugins = new Set();
    this.validator = new PluginValidator();
    this.diagnostics = [];
  }

  async discoverPlugins() {
    const discoveredPlugins = [];
    this.diagnostics = [];
    
    for (const directory of this.pluginDirectories) {
      try {
        const plugins = await this.scanDirectory(directory);
        discoveredPlugins.push(...plugins);
      } catch (error) {
        console.warn(`[PluginLoader] Failed to scan directory ${directory}:`, error);
        this.addDiagnostic('loader', 'error', `Failed to scan ${directory}: ${error.message}`);
      }
    }
    
    return discoveredPlugins;
  }

  async scanDirectory(directory) {
    const plugins = [];
    
    try {
      const normalizedDirectory = directory.replace(/\/$/, '');
      const definitions = this.pluginDefinitions.filter((definition) =>
        typeof definition?.path === 'string'
        && typeof definition?.load === 'function'
        && definition.path.startsWith(`${normalizedDirectory}/`)
      );

      for (const definition of definitions) {
        try {
          const plugin = await this.loadPluginDefinition(definition);
          if (plugin) {
            plugins.push(plugin);
          }
        } catch (error) {
          console.warn(`[PluginLoader] Failed to load plugin ${definition.id}:`, error);
          this.addDiagnostic(definition.id || definition.path, 'error', error.message);
        }
      }
    } catch (error) {
      console.error(`[PluginLoader] Error scanning directory ${directory}:`, error);
    }
    
    return plugins;
  }

  async loadPluginFile(pluginPath) {
    const definition = this.pluginDefinitions.find((item) => item.path === pluginPath);
    if (!definition) {
      console.error(`[PluginLoader] Plugin is not registered: ${pluginPath}`);
      return null;
    }

    return this.loadPluginDefinition(definition);
  }

  async loadPluginDefinition(definition) {
    try {
      const pluginId = definition.id || this.extractPluginId(definition.path);
      
      if (this.loadedPlugins.has(pluginId)) {
        return null; // Silently skip already loaded plugins
      }
      
      const pluginClass = this.createLazyPluginClass(definition, pluginId);
      
      // Validate the lightweight manifest/proxy during discovery. The actual
      // implementation is loaded and validated on first activation.
      const validationResult = await this.validatePlugin(pluginClass, pluginId);

      if (!validationResult.isValid) {
        console.error(`[PluginLoader] Plugin validation failed for ${definition.path}:`, validationResult.errors);
        if (validationResult.warnings.length > 0) {
          console.warn(`[PluginLoader] Plugin warnings for ${definition.path}:`, validationResult.warnings);
        }
        this.addDiagnostic(pluginId, 'error', validationResult.errors.join('; '));
        return null;
      }
      
      const metadata = pluginClass.metadata || {};
      this.loadedPlugins.add(pluginId);
      
      return {
        id: pluginId,
        path: definition.path,
        class: pluginClass,
        metadata: metadata,
        isLoaded: true,
        validationResult: validationResult
      };
    } catch (error) {
      console.error(`[PluginLoader] Failed to load plugin from ${definition.path}:`, error);
      this.addDiagnostic(definition.id || definition.path, 'error', error.message);
      return null;
    }
  }

  async loadScript(scriptPath) {
    const definition = this.pluginDefinitions.find((item) => item.path === scriptPath);
    if (!definition) {
      throw new Error(`Plugin is not registered: ${scriptPath}`);
    }

    return definition.load();
  }

  extractPluginId(pluginPath) {
    const filename = pluginPath.split('/').pop().split('\\').pop();
    const nameWithoutExt = filename.replace(/\.js$/, '');
    
    // Convert CamelCase to kebab-case
    return nameWithoutExt
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  async validatePlugin(pluginClass, pluginId) {
    try {
      const metadata = pluginClass.metadata || {};
      return await this.validator.validatePlugin(pluginClass, metadata, pluginId);
    } catch (error) {
      console.error(`[PluginLoader] Plugin validation error:`, error);
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: []
      };
    }
  }

  createLazyPluginClass(definition, pluginId) {
    const validator = this.validator;
    const metadata = definition.metadata || {};

    return class LazyPluginModule {
      static metadata = metadata;

      static resetConfig() {
        return definition.resetConfig?.();
      }

      constructor(pluginAPI) {
        this.pluginAPI = pluginAPI;
        this.instance = null;
      }

      async init() {
        const pluginModule = await definition.load();
        const PluginClass = definition.exportName
          ? pluginModule[definition.exportName]
          : pluginModule.default;

        if (typeof PluginClass !== 'function') {
          throw new Error(`Plugin module has no usable export for ${pluginId}`);
        }

        const runtimeMetadata = PluginClass.metadata || metadata;
        const validation = await validator.validatePlugin(
          PluginClass,
          runtimeMetadata,
          pluginId
        );
        if (!validation.isValid) {
          throw new Error(`Plugin validation failed: ${validation.errors.join('; ')}`);
        }

        this.instance = new PluginClass(this.pluginAPI);
        await this.instance.init?.();
      }

      async destroy() {
        try {
          await this.instance?.destroy?.();
        } finally {
          this.instance = null;
        }
      }

      async resetConfig() {
        if (this.instance?.resetConfig) {
          return this.instance.resetConfig();
        }
        return definition.resetConfig?.();
      }

      mountSettings(container) {
        return this.instance?.mountSettings?.(container);
      }
    };
  }

  async loadAndRegisterPlugins() {
    try {
      const discoveredPlugins = await this.discoverPlugins();
      const registeredPlugins = [];
      
      console.log(`[PluginLoader] Discovered ${discoveredPlugins.length} plugins`);
      
      for (const plugin of discoveredPlugins) {
        try {
          const dependencyResult = this.validator.validateDependencies(plugin.metadata, discoveredPlugins);
          if (!dependencyResult.isValid) {
            const details = [
              ...dependencyResult.missing.map((id) => `missing dependency ${id}`),
              ...dependencyResult.conflicts
            ];
            this.loadedPlugins.delete(plugin.id);
            this.addDiagnostic(plugin.id, 'error', details.join('; '));
            console.error(`[PluginLoader] Plugin dependency validation failed for ${plugin.id}:`, details);
            continue;
          }

          const registered = this.pluginManager.registerPlugin(
            plugin.id,
            plugin.class,
            plugin.metadata,
            plugin.validationResult
          );
          
          if (registered) {
            registeredPlugins.push(plugin);
            console.log(`[PluginLoader] Registered plugin: ${plugin.id}`);
          } else {
            console.warn(`[PluginLoader] Failed to register plugin: ${plugin.id}`);
            this.loadedPlugins.delete(plugin.id);
            this.addDiagnostic(plugin.id, 'error', 'Plugin registration was rejected');
          }
        } catch (error) {
          console.error(`[PluginLoader] Error registering plugin ${plugin.id}:`, error);
        }
      }
      
      return registeredPlugins;
    } catch (error) {
      console.error('[PluginLoader] Failed to load and register plugins:', error);
      return [];
    }
  }

  async reloadPlugins() {
    // Save current plugin states
    const allPlugins = this.pluginManager.getAllPlugins();
    const pluginStates = new Map();
    
    for (const plugin of allPlugins) {
      pluginStates.set(plugin.id, {
        enabled: this.pluginManager.isPluginEnabled(plugin.id),
        active: this.pluginManager.isPluginActive(plugin.id)
      });
    }
    
    // Clear loaded plugins cache
    this.loadedPlugins.clear();
    
    // Clear registered plugins from manager
    for (const plugin of allPlugins) {
      await this.pluginManager.unregisterPlugin(plugin.id);
    }
    
    // Reload all plugins
    const reloadedPlugins = await this.loadAndRegisterPlugins();
    
    // Restore plugin states
    for (const plugin of reloadedPlugins) {
      const savedState = pluginStates.get(plugin.id);
      if (savedState) {
        if (savedState.enabled) {
          await this.pluginManager.enablePlugin(plugin.id);
        } else {
          // Ensure plugin stays disabled
          await this.pluginManager.disablePlugin(plugin.id);
        }
      }
    }
    
    return reloadedPlugins;
  }

  getLoadedPlugins() {
    return Array.from(this.loadedPlugins);
  }

  isPluginLoaded(pluginId) {
    return this.loadedPlugins.has(pluginId);
  }

  addDiagnostic(pluginId, severity, message) {
    this.diagnostics.push({ pluginId, severity, message });
  }

  getDiagnostics() {
    return this.diagnostics.map((diagnostic) => ({ ...diagnostic }));
  }
}

window.PluginLoader = PluginLoader;

export { PluginLoader };
