/**
 * Plugin Loader - Discovers and loads plugins from filesystem
 */
class PluginLoader {
  constructor(pluginManager) {
    this.pluginManager = pluginManager;
    this.pluginDirectories = [
      './src/plugins',
      './plugins'
    ];
    this.loadedPlugins = new Set();
    this.validator = new PluginValidator();
  }

  async discoverPlugins() {
    const discoveredPlugins = [];
    
    for (const directory of this.pluginDirectories) {
      try {
        const plugins = await this.scanDirectory(directory);
        discoveredPlugins.push(...plugins);
      } catch (error) {
        console.warn(`[PluginLoader] Failed to scan directory ${directory}:`, error);
      }
    }
    
    return discoveredPlugins;
  }

  async scanDirectory(directory) {
    const plugins = [];
    
    try {
      // For now, we'll use a simple approach since we can't access filesystem directly
      // In a real implementation, this would use Tauri commands to scan directories
      
      // Check for known plugins in the plugins directory
      const knownPlugins = [
        'SamplePlugin.js'
      ];
      
      for (const pluginFile of knownPlugins) {
        try {
          const pluginPath = `${directory}/${pluginFile}`;
          const plugin = await this.loadPluginFile(pluginPath);
          if (plugin) {
            plugins.push(plugin);
          }
        } catch (error) {
          console.warn(`[PluginLoader] Failed to load plugin ${pluginFile}:`, error);
        }
      }
    } catch (error) {
      console.error(`[PluginLoader] Error scanning directory ${directory}:`, error);
    }
    
    return plugins;
  }

  async loadPluginFile(pluginPath) {
    try {
      // Extract plugin ID from filename
      const pluginId = this.extractPluginId(pluginPath);
      
      if (this.loadedPlugins.has(pluginId)) {
        console.warn(`[PluginLoader] Plugin ${pluginId} already loaded`);
        return null;
      }
      
      // Validate plugin before loading
      const validationResult = await this.validatePlugin(pluginPath);

      if (!validationResult.isValid) {
        console.error(`[PluginLoader] Plugin validation failed for ${pluginPath}:`, validationResult.errors);
        if (validationResult.warnings.length > 0) {
          console.warn(`[PluginLoader] Plugin warnings for ${pluginPath}:`, validationResult.warnings);
        }
        return null;
      }
      
      // For now, we'll handle known plugins directly
      // In a real implementation, this would dynamically import the plugin
      if (pluginId === 'sample-plugin' && window.SamplePlugin) {
        const pluginClass = window.SamplePlugin;
        const metadata = pluginClass.metadata || {};
        
        this.loadedPlugins.add(pluginId);
        
        return {
          id: pluginId,
          path: pluginPath,
          class: pluginClass,
          metadata: metadata,
          isLoaded: true,
          validationResult: validationResult
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[PluginLoader] Failed to load plugin from ${pluginPath}:`, error);
      return null;
    }
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

  async validatePlugin(pluginPath) {
    try {
      const pluginId = this.extractPluginId(pluginPath);
      
      // For known plugins, validate using enhanced validator
      if (pluginId === 'sample-plugin' && window.SamplePlugin) {
        const pluginClass = window.SamplePlugin;
        const metadata = pluginClass.metadata || {};
        
        return await this.validator.validatePlugin(pluginClass, metadata, pluginId);
      }
      
      return {
        isValid: false,
        errors: ['Unknown plugin or plugin not loaded'],
        warnings: []
      };
    } catch (error) {
      console.error(`[PluginLoader] Plugin validation error:`, error);
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: []
      };
    }
  }

  async loadAndRegisterPlugins() {
    try {
      const discoveredPlugins = await this.discoverPlugins();
      
      console.log(`[PluginLoader] Discovered ${discoveredPlugins.length} plugins`);
      
      for (const plugin of discoveredPlugins) {
        try {
          const registered = this.pluginManager.registerPlugin(
            plugin.id,
            plugin.class,
            plugin.metadata,
            plugin.validationResult
          );
          
          if (registered) {
            console.log(`[PluginLoader] Registered plugin: ${plugin.id}`);
          } else {
            console.warn(`[PluginLoader] Failed to register plugin: ${plugin.id}`);
          }
        } catch (error) {
          console.error(`[PluginLoader] Error registering plugin ${plugin.id}:`, error);
        }
      }
      
      return discoveredPlugins;
    } catch (error) {
      console.error('[PluginLoader] Failed to load and register plugins:', error);
      return [];
    }
  }

  async reloadPlugins() {
    // Clear loaded plugins cache
    this.loadedPlugins.clear();
    
    // Reload all plugins
    return await this.loadAndRegisterPlugins();
  }

  getLoadedPlugins() {
    return Array.from(this.loadedPlugins);
  }

  isPluginLoaded(pluginId) {
    return this.loadedPlugins.has(pluginId);
  }
}

window.PluginLoader = PluginLoader;