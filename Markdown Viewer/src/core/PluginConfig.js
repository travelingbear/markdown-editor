/**
 * Plugin Configuration - Manages plugin settings and persistence
 */
class PluginConfig {
  constructor() {
    this.storageKey = 'markdownViewer_pluginConfig';
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        enabledPlugins: ['sample-plugin'], // Sample plugin enabled by default
        pluginSettings: {}
      };
    } catch (error) {
      console.error('[PluginConfig] Failed to load config:', error);
      return {
        enabledPlugins: ['sample-plugin'],
        pluginSettings: {}
      };
    }
  }

  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      return true;
    } catch (error) {
      console.error('[PluginConfig] Failed to save config:', error);
      return false;
    }
  }

  isPluginEnabled(pluginId) {
    return this.config.enabledPlugins.includes(pluginId);
  }

  enablePlugin(pluginId) {
    if (!this.config.enabledPlugins.includes(pluginId)) {
      this.config.enabledPlugins.push(pluginId);
      this.saveConfig();
      return true;
    }
    return false;
  }

  disablePlugin(pluginId) {
    const index = this.config.enabledPlugins.indexOf(pluginId);
    if (index > -1) {
      this.config.enabledPlugins.splice(index, 1);
      this.saveConfig();
      return true;
    }
    return false;
  }

  getEnabledPlugins() {
    return [...this.config.enabledPlugins];
  }

  getPluginSetting(pluginId, key, defaultValue = null) {
    return this.config.pluginSettings[pluginId]?.[key] ?? defaultValue;
  }

  setPluginSetting(pluginId, key, value) {
    if (!this.config.pluginSettings[pluginId]) {
      this.config.pluginSettings[pluginId] = {};
    }
    this.config.pluginSettings[pluginId][key] = value;
    this.saveConfig();
  }

  getPluginSettings(pluginId) {
    return { ...this.config.pluginSettings[pluginId] } || {};
  }

  resetPluginSettings(pluginId) {
    delete this.config.pluginSettings[pluginId];
    this.saveConfig();
  }

  resetAllConfig() {
    this.config = {
      enabledPlugins: [],
      pluginSettings: {}
    };
    this.saveConfig();
  }
}

window.PluginConfig = PluginConfig;