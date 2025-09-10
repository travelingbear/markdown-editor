/**
 * Plugin Manager - Manages plugin registration, lifecycle, and API access
 */
class PluginManager {
  constructor(markdownEditor) {
    this.markdownEditor = markdownEditor;
    this.plugins = new Map();
    this.activePlugins = new Set();
    this.pluginAPI = null;
    this.pluginConfig = new PluginConfig();
    
    this.initializeAPI();
  }

  initializeAPI() {
    // Create plugin API interface
    this.pluginAPI = {
      // Core components access
      getEditor: () => this.markdownEditor.editorComponent,
      getPreview: () => this.markdownEditor.previewComponent,
      getToolbar: () => this.markdownEditor.toolbarComponent,
      getTabManager: () => this.markdownEditor.tabManager,
      
      // Controllers access
      getFileController: () => this.markdownEditor.fileController,
      getUIController: () => this.markdownEditor.uiController,
      getSettingsController: () => this.markdownEditor.settingsController,
      getModeController: () => this.markdownEditor.modeController,
      getMarkdownActionController: () => this.markdownEditor.markdownActionController,
      
      // Extension registration
      registerExtension: (controller, extension) => {
        const controllerInstance = this.getControllerByName(controller);
        if (controllerInstance && controllerInstance.registerExtension) {
          return controllerInstance.registerExtension(extension);
        }
        return false;
      },
      
      // Hook registration
      addHook: (controller, hookName, callback, priority = 100) => {
        const controllerInstance = this.getControllerByName(controller);
        if (controllerInstance && controllerInstance.addHook) {
          controllerInstance.addHook(hookName, callback, priority);
          return true;
        }
        return false;
      }
    };
  }

  getControllerByName(controllerName) {
    switch (controllerName) {
      case 'file': return this.markdownEditor.fileController;
      case 'ui': return this.markdownEditor.uiController;
      case 'settings': return this.markdownEditor.settingsController;
      case 'mode': return this.markdownEditor.modeController;
      case 'markdownAction': return this.markdownEditor.markdownActionController;
      case 'tabUI': return this.markdownEditor.tabUIController;
      case 'export': return this.markdownEditor.exportController;
      default: return null;
    }
  }

  registerPlugin(pluginId, pluginClass, metadata = {}) {
    if (this.plugins.has(pluginId)) {
      console.warn(`[PluginManager] Plugin ${pluginId} already registered`);
      return false;
    }

    try {
      const plugin = {
        id: pluginId,
        class: pluginClass,
        instance: null,
        metadata: {
          name: metadata.name || pluginId,
          version: metadata.version || '1.0.0',
          description: metadata.description || '',
          author: metadata.author || '',
          ...metadata
        },
        isActive: false
      };

      this.plugins.set(pluginId, plugin);
      console.log(`[PluginManager] Plugin ${pluginId} registered successfully`);
      return true;
    } catch (error) {
      console.error(`[PluginManager] Failed to register plugin ${pluginId}:`, error);
      return false;
    }
  }

  async activatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`[PluginManager] Plugin ${pluginId} not found`);
      return false;
    }

    if (plugin.isActive) {
      console.warn(`[PluginManager] Plugin ${pluginId} already active`);
      return true;
    }

    try {
      // Create plugin instance
      plugin.instance = new plugin.class(this.pluginAPI);
      
      // Initialize plugin
      if (plugin.instance.init) {
        await plugin.instance.init();
      }

      plugin.isActive = true;
      this.activePlugins.add(pluginId);
      
      console.log(`[PluginManager] Plugin ${pluginId} activated successfully`);
      return true;
    } catch (error) {
      console.error(`[PluginManager] Failed to activate plugin ${pluginId}:`, error);
      plugin.instance = null;
      return false;
    }
  }

  async deactivatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.isActive) {
      return false;
    }

    try {
      // Cleanup plugin
      if (plugin.instance && plugin.instance.destroy) {
        await plugin.instance.destroy();
      }

      plugin.instance = null;
      plugin.isActive = false;
      this.activePlugins.delete(pluginId);
      
      console.log(`[PluginManager] Plugin ${pluginId} deactivated successfully`);
      return true;
    } catch (error) {
      console.error(`[PluginManager] Failed to deactivate plugin ${pluginId}:`, error);
      return false;
    }
  }

  unregisterPlugin(pluginId) {
    if (this.activePlugins.has(pluginId)) {
      this.deactivatePlugin(pluginId);
    }
    
    return this.plugins.delete(pluginId);
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  getActivePlugins() {
    return Array.from(this.activePlugins).map(id => this.plugins.get(id));
  }

  isPluginActive(pluginId) {
    return this.activePlugins.has(pluginId);
  }

  isPluginEnabled(pluginId) {
    return this.pluginConfig.isPluginEnabled(pluginId);
  }

  enablePlugin(pluginId) {
    const enabled = this.pluginConfig.enablePlugin(pluginId);
    if (enabled && this.plugins.has(pluginId)) {
      this.activatePlugin(pluginId);
    }
    return enabled;
  }

  disablePlugin(pluginId) {
    const disabled = this.pluginConfig.disablePlugin(pluginId);
    if (disabled && this.activePlugins.has(pluginId)) {
      this.deactivatePlugin(pluginId);
    }
    return disabled;
  }

  getPluginConfig() {
    return this.pluginConfig;
  }

  async autoActivatePlugins() {
    const enabledPlugins = this.pluginConfig.getEnabledPlugins();
    for (const pluginId of enabledPlugins) {
      if (this.plugins.has(pluginId) && !this.activePlugins.has(pluginId)) {
        await this.activatePlugin(pluginId);
      }
    }
  }

  async destroy() {
    // Deactivate all plugins
    for (const pluginId of this.activePlugins) {
      await this.deactivatePlugin(pluginId);
    }
    
    this.plugins.clear();
    this.activePlugins.clear();
    this.pluginAPI = null;
    this.pluginConfig = null;
  }
}

window.PluginManager = PluginManager;