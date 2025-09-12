/**
 * Horizontal Split Plugin - Adds horizontal split functionality
 */
class HorizontalSplitPlugin {
  constructor(pluginAPI) {
    this.pluginAPI = pluginAPI;
    this.isActive = false;
  }

  async init() {
    console.log('[HorizontalSplitPlugin] Initializing...');
    
    // Add settings integration
    this.addSettingsIntegration();
    
    this.isActive = true;
    console.log('[HorizontalSplitPlugin] Initialized successfully');
  }

  addSettingsIntegration() {
    // Register settings extension
    const extension = {
      get: () => localStorage.getItem('markdownViewer_defaultSplitOrientation') || 'vertical',
      set: (value) => localStorage.setItem('markdownViewer_defaultSplitOrientation', value),
      metadata: {
        name: 'defaultSplitOrientation',
        description: 'Default split orientation setting'
      }
    };
    this.pluginAPI.registerExtension('settings', extension);
  }

  async destroy() {
    console.log('[HorizontalSplitPlugin] Destroying...');
    
    // Remove settings integration
    this.pluginAPI.unregisterExtension('settings', 'defaultSplitOrientation');
    
    this.isActive = false;
    console.log('[HorizontalSplitPlugin] Destroyed successfully');
  }
}

// Plugin metadata
HorizontalSplitPlugin.metadata = {
  name: 'Horizontal Split Plugin',
  version: '1.0.0',
  description: 'Adds horizontal split functionality to the split mode',
  author: 'Markdown Editor'
};

window.HorizontalSplitPlugin = HorizontalSplitPlugin;