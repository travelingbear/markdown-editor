/**
 * Plugin Manager - Manages plugin registration, lifecycle, and API access
 */
class PluginManager {
  constructor(markdownEditor) {
    this.markdownEditor = markdownEditor;
    this.plugins = new Map();
    this.activePlugins = new Set();
    this.pluginResources = new Map();
    this.pluginAPI = null;
    this.pluginConfig = new PluginConfig();
    
    this.initializeAPI();
  }

  initializeAPI() {
    // Keep an unscoped API for compatibility and diagnostics. Activated
    // plugins receive their own scoped API so registrations can be cleaned up.
    this.pluginAPI = this.createPluginAPI();
  }

  createPluginAPI(pluginId = null) {
    const trackCleanup = (cleanup) => {
      if (!pluginId || typeof cleanup !== 'function') return cleanup;
      if (!this.pluginResources.has(pluginId)) {
        this.pluginResources.set(pluginId, []);
      }
      this.pluginResources.get(pluginId).push(cleanup);
      return cleanup;
    };

    return {
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
          const extensionName = extension.metadata?.name || 'unnamed-extension';
          try {
            controllerInstance.registerExtension(extensionName, extension);
            trackCleanup(() => controllerInstance.unregisterExtension?.(extensionName));
            return true;
          } catch (error) {
            console.error(`[PluginManager] Failed to register extension ${extensionName}:`, error);
          }
        }
        return false;
      },
      
      // Hook registration
      addHook: (controller, hookName, callback, priority = 100) => {
        const controllerInstance = this.getControllerByName(controller);
        if (controllerInstance && controllerInstance.addHook) {
          controllerInstance.addHook(hookName, callback, priority);
          return trackCleanup(() => controllerInstance.removeHook?.(hookName, callback));
        }
        return false;
      },

      // Subscribe to controller events with an automatic disposer. Events are
      // distinct from before/after operation hooks in BaseComponent.
      on: (controller, eventName, callback) => {
        const controllerInstance = this.getControllerByName(controller);
        if (controllerInstance?.on && controllerInstance?.off) {
          controllerInstance.on(eventName, callback);
          return trackCleanup(() => controllerInstance.off(eventName, callback));
        }
        return false;
      },

      registerCleanup: (cleanup) => trackCleanup(cleanup),

      // Plugin-scoped persistent settings. Keeping these methods scoped means
      // plugins cannot accidentally read or overwrite another plugin's data.
      getSetting: (key, defaultValue = null) => {
        if (!pluginId) return defaultValue;
        return this.pluginConfig.getPluginSetting(pluginId, key, defaultValue);
      },
      setSetting: (key, value) => {
        if (!pluginId) return false;
        return this.pluginConfig.setPluginSetting(pluginId, key, value);
      },

      // Renderer ids are namespaced to their owning plugin. The automatic
      // cleanup removes renderer behavior as soon as a plugin is disabled.
      registerRenderer: (rendererId, renderer, options = {}) => {
        if (!pluginId || typeof rendererId !== 'string') return false;
        const scopedId = `${pluginId}.${rendererId}`;
        this.markdownEditor.rendererRegistry.register(scopedId, renderer, options);
        trackCleanup(() => this.markdownEditor.rendererRegistry.unregister(scopedId));
        return true;
      },
      unregisterRenderer: (rendererId) => {
        if (!pluginId || typeof rendererId !== 'string') return false;
        return this.markdownEditor.rendererRegistry.unregister(`${pluginId}.${rendererId}`);
      },
      
      // Extension unregistration
      unregisterExtension: (controller, extensionName) => {
        const controllerInstance = this.getControllerByName(controller);
        if (controllerInstance && controllerInstance.unregisterExtension) {
          return controllerInstance.unregisterExtension(extensionName);
        }
        return false;
      }
    };
  }

  async cleanupPluginResources(pluginId) {
    const cleanups = this.pluginResources.get(pluginId) || [];
    this.pluginResources.delete(pluginId);

    for (const cleanup of [...cleanups].reverse()) {
      try {
        await cleanup();
      } catch (error) {
        console.error(`[PluginManager] Plugin ${pluginId} resource cleanup failed:`, error);
      }
    }
  }

  getControllerByName(controllerName) {
    switch (controllerName) {
      case 'file': return this.markdownEditor.fileController;
      case 'ui': return this.markdownEditor.uiController;
      case 'settings': return this.markdownEditor.settingsController;
      case 'mode': return this.markdownEditor.modeController;
      case 'markdownAction': return this.markdownEditor.markdownActionController;
      case 'tabUI': return this.markdownEditor.tabUIController;
      case 'tab': return this.markdownEditor.tabManager;
      case 'export': return this.markdownEditor.exportController;
      default: return null;
    }
  }

  registerPlugin(pluginId, pluginClass, metadata = {}, validationResult = null) {
    if (this.plugins.has(pluginId)) {
      console.warn(`[PluginManager] Plugin ${pluginId} already registered`);
      return false;
    }

    if (typeof pluginId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(pluginId)) {
      console.error(`[PluginManager] Invalid plugin id: ${pluginId}`);
      return false;
    }

    if (typeof pluginClass !== 'function') {
      console.error(`[PluginManager] Plugin ${pluginId} must provide a constructor`);
      return false;
    }

    if (validationResult && !validationResult.isValid) {
      console.error(`[PluginManager] Plugin ${pluginId} failed validation`, validationResult.errors);
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
        validationResult: validationResult,
        isActive: false,
        transitionPromise: null,
        status: 'inactive',
        lastError: null
      };

      this.plugins.set(pluginId, plugin);
      this.pluginConfig.ensurePluginDefault(pluginId, plugin.metadata.defaultEnabled === true);
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

    // A rapid enable/disable sequence must finish the current lifecycle step
    // before starting the next one.
    if (plugin.transitionPromise) {
      const previousTransitionSucceeded = await plugin.transitionPromise;
      if (plugin.isActive) return true;
      if (!previousTransitionSucceeded && plugin.status === 'error') return false;
    }

    const transition = (async () => {
      try {
        plugin.status = 'activating';
        plugin.lastError = null;
        plugin.instance = new plugin.class(this.createPluginAPI(pluginId));
        await plugin.instance.init?.();

        plugin.isActive = true;
        plugin.status = 'active';
        this.activePlugins.add(pluginId);
        this.refreshSystemInfo();
        console.log(`[PluginManager] Plugin ${pluginId} activated successfully`);
        return true;
      } catch (error) {
        console.error(`[PluginManager] Failed to activate plugin ${pluginId}:`, error);
        plugin.status = 'error';
        plugin.lastError = this.describeError(error);
        try {
          await plugin.instance?.destroy?.();
        } catch (cleanupError) {
          console.error(`[PluginManager] Failed to clean up plugin ${pluginId} after activation error:`, cleanupError);
        }
        await this.cleanupPluginResources(pluginId);
        plugin.instance = null;
        plugin.isActive = false;
        this.activePlugins.delete(pluginId);
        this.refreshSystemInfo();
        return false;
      } finally {
        if (plugin.transitionPromise === transition) plugin.transitionPromise = null;
      }
    })();

    plugin.transitionPromise = transition;
    return await transition;
  }

  async deactivatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    if (plugin.transitionPromise) {
      await plugin.transitionPromise;
    }

    if (!plugin.isActive) return true;

    const transition = (async () => {
      try {
        let cleanupError = null;
        plugin.status = 'deactivating';

        try {
          await plugin.instance?.destroy?.();
        } catch (error) {
          cleanupError = error;
        }

        // Scoped resources must be removed even if destroy reports an error.
        await this.cleanupPluginResources(pluginId);
        plugin.instance = null;
        plugin.isActive = false;
        this.activePlugins.delete(pluginId);

        if (cleanupError) throw cleanupError;
        plugin.status = 'inactive';
        plugin.lastError = null;
        this.refreshSystemInfo();
        console.log(`[PluginManager] Plugin ${pluginId} deactivated successfully`);
        return true;
      } catch (error) {
        console.error(`[PluginManager] Failed to deactivate plugin ${pluginId}:`, error);
        plugin.instance = null;
        plugin.isActive = false;
        plugin.status = 'error';
        plugin.lastError = this.describeError(error);
        this.activePlugins.delete(pluginId);
        this.refreshSystemInfo();
        return false;
      } finally {
        if (plugin.transitionPromise === transition) plugin.transitionPromise = null;
      }
    })();

    plugin.transitionPromise = transition;
    return await transition;
  }

  async unregisterPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    await this.deactivatePlugin(pluginId);
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

  getPluginStatus(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return null;
    return {
      status: plugin.status,
      isActive: plugin.isActive,
      isEnabled: this.pluginConfig.isPluginEnabled(pluginId),
      isSystemEnabled: this.pluginConfig.isSystemEnabled(),
      lastError: plugin.lastError
    };
  }

  describeError(error) {
    if (error instanceof Error) return error.message;
    return typeof error === 'string' ? error : 'Unknown plugin error';
  }

  refreshSystemInfo() {
    const editor = this.markdownEditor;
    const settings = editor?.settingsController;
    const mode = editor?.modeController?.getCurrentMode?.();
    if (!settings || !editor.editorComponent || !editor.previewComponent || !mode) return;
    settings.updateSystemInfo(editor.editorComponent, editor.previewComponent, mode);
  }

  isPluginEnabled(pluginId) {
    return this.pluginConfig.isPluginEnabled(pluginId);
  }

  isPluginSystemEnabled() {
    return this.pluginConfig.isSystemEnabled();
  }

  async setPluginSystemEnabled(enabled) {
    const shouldEnable = enabled === true;
    this.pluginConfig.setSystemEnabled(shouldEnable);

    if (shouldEnable) {
      await this.autoActivatePlugins();
      const succeeded = this.getActivePlugins().length === this.pluginConfig.getEnabledPlugins()
        .filter((pluginId) => this.plugins.has(pluginId)).length;
      this.refreshSystemInfo();
      return succeeded;
    }

    let succeeded = true;
    for (const pluginId of [...this.activePlugins]) {
      succeeded = await this.deactivatePlugin(pluginId) && succeeded;
    }
    this.refreshSystemInfo();
    return succeeded;
  }

  async enablePlugin(pluginId) {
    if (!this.plugins.has(pluginId)) return false;

    const wasEnabled = this.pluginConfig.isPluginEnabled(pluginId);
    if (!wasEnabled) {
      this.pluginConfig.enablePlugin(pluginId);
    }

    // Enabling a plugin while the system is paused records the user's choice
    // without activating code. The choice is restored when the system resumes.
    if (!this.pluginConfig.isSystemEnabled()) {
      this.refreshSystemInfo();
      return true;
    }

    const activated = await this.activatePlugin(pluginId);
    if (!activated) {
      this.pluginConfig.disablePlugin(pluginId);
    }
    this.refreshSystemInfo();
    return activated;
  }

  async disablePlugin(pluginId) {
    if (!this.plugins.has(pluginId)) return false;

    const deactivated = await this.deactivatePlugin(pluginId);
    if (this.pluginConfig.isPluginEnabled(pluginId)) {
      this.pluginConfig.disablePlugin(pluginId);
    }
    this.refreshSystemInfo();
    return deactivated;
  }

  getPluginConfig() {
    return this.pluginConfig;
  }

  async autoActivatePlugins() {
    if (!this.pluginConfig.isSystemEnabled()) return;

    const enabledPlugins = this.pluginConfig.getEnabledPlugins();
    for (const pluginId of enabledPlugins) {
      if (this.plugins.has(pluginId) && !this.activePlugins.has(pluginId)) {
        await this.enablePlugin(pluginId);
      }
    }
  }

  async resetAllPluginConfig() {
    let succeeded = true;

    for (const plugin of this.getAllPlugins()) {
      try {
        const resetConfig = plugin.instance?.resetConfig || plugin.class?.resetConfig;
        if (typeof resetConfig === 'function') {
          await resetConfig.call(plugin.instance || plugin.class);
        }
      } catch (error) {
        succeeded = false;
        console.error(`[PluginManager] Failed to reset config for ${plugin.id}:`, error);
      }

      const deactivated = await this.disablePlugin(plugin.id);
      succeeded = deactivated && succeeded;
    }

    this.pluginConfig.resetAllConfig();
    return succeeded;
  }

  async resetPluginConfig(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    const wasActive = plugin.isActive;
    try {
      const resetConfig = plugin.instance?.resetConfig || plugin.class?.resetConfig;
      if (typeof resetConfig === 'function') {
        await resetConfig.call(plugin.instance || plugin.class);
      }
      this.pluginConfig.resetPluginSettings(pluginId);

      if (wasActive) {
        const deactivated = await this.deactivatePlugin(pluginId);
        if (!deactivated) return false;
        return await this.enablePlugin(pluginId);
      }
      return true;
    } catch (error) {
      plugin.status = 'error';
      plugin.lastError = this.describeError(error);
      console.error(`[PluginManager] Failed to reset config for ${pluginId}:`, error);
      return false;
    }
  }

  async destroy() {
    // Deactivate all plugins
    for (const pluginId of [...this.plugins.keys()]) {
      await this.deactivatePlugin(pluginId);
    }
    
    this.plugins.clear();
    this.activePlugins.clear();
    this.pluginResources.clear();
    this.pluginAPI = null;
    this.pluginConfig = null;
  }
}

window.PluginManager = PluginManager;
