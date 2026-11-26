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
      if (!stored) return this.createDefaultConfig();

      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Plugin configuration must be an object');
      }

      return {
        systemEnabled: parsed.systemEnabled !== false,
        enabledPlugins: Array.isArray(parsed.enabledPlugins)
          ? [...new Set(parsed.enabledPlugins.filter((pluginId) => typeof pluginId === 'string'))]
          : [],
        initializedPlugins: Array.isArray(parsed.initializedPlugins)
          ? [...new Set(parsed.initializedPlugins.filter((pluginId) => typeof pluginId === 'string'))]
          : [],
        pluginSettings: parsed.pluginSettings
          && typeof parsed.pluginSettings === 'object'
          && !Array.isArray(parsed.pluginSettings)
          ? parsed.pluginSettings
          : {}
      };
    } catch (error) {
      console.error('[PluginConfig] Failed to load config:', error);
      return this.createDefaultConfig();
    }
  }

  createDefaultConfig() {
    return { systemEnabled: true, enabledPlugins: [], initializedPlugins: [], pluginSettings: {} };
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

  isSystemEnabled() {
    return this.config.systemEnabled !== false;
  }

  setSystemEnabled(enabled) {
    this.config.systemEnabled = enabled === true;
    return this.saveConfig();
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

  ensurePluginDefault(pluginId, enabledByDefault = false) {
    if (this.config.initializedPlugins.includes(pluginId)) return false;

    this.config.initializedPlugins.push(pluginId);
    if (enabledByDefault && !this.config.enabledPlugins.includes(pluginId)) {
      this.config.enabledPlugins.push(pluginId);
    }
    this.saveConfig();
    return enabledByDefault;
  }

  getPluginSetting(pluginId, key, defaultValue = null) {
    return this.config.pluginSettings[pluginId]?.[key] ?? defaultValue;
  }

  setPluginSetting(pluginId, key, value) {
    if (!this.config.pluginSettings[pluginId]) {
      this.config.pluginSettings[pluginId] = {};
    }
    this.config.pluginSettings[pluginId][key] = value;
    return this.saveConfig();
  }

  getPluginSettings(pluginId) {
    return { ...this.config.pluginSettings[pluginId] } || {};
  }

  resetPluginSettings(pluginId) {
    delete this.config.pluginSettings[pluginId];
    this.saveConfig();
  }

  resetAllConfig() {
    const initializedPlugins = [...this.config.initializedPlugins];
    this.config = { ...this.createDefaultConfig(), initializedPlugins };
    this.saveConfig();
  }
}

window.PluginConfig = PluginConfig;
