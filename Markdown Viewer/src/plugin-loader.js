/**
 * Plugin Loader - Demonstrates plugin registration and activation
 */
function loadSamplePlugin() {
  if (!window.markdownEditor || !window.markdownEditor.pluginManager) {
    console.error('[PluginLoader] Plugin manager not available');
    return false;
  }

  const pluginManager = window.markdownEditor.pluginManager;
  
  try {
    // Register the sample plugin
    const registered = pluginManager.registerPlugin(
      'sample-plugin',
      SamplePlugin,
      SamplePlugin.metadata
    );
    
    if (registered) {
      console.log('[PluginLoader] Sample plugin registered successfully');
      
      // Activate the plugin
      pluginManager.activatePlugin('sample-plugin').then(activated => {
        if (activated) {
          console.log('[PluginLoader] Sample plugin activated successfully');
        } else {
          console.error('[PluginLoader] Failed to activate sample plugin');
        }
      });
      
      return true;
    } else {
      console.error('[PluginLoader] Failed to register sample plugin');
      return false;
    }
  } catch (error) {
    console.error('[PluginLoader] Error loading sample plugin:', error);
    return false;
  }
}

// Auto-load sample plugin when markdown editor is ready
function initSamplePlugin() {
  // Plugin loading is now handled in MarkdownEditor component
  // This function is kept for backward compatibility
  console.log('[PluginLoader] Plugin loading handled by MarkdownEditor component');
}

// Test functions for console
window.testSamplePlugin = function() {
  console.log('=== Sample Plugin Test ===');
  
  const pluginManager = window.markdownEditor?.pluginManager;
  if (!pluginManager) {
    console.error('Plugin manager not available');
    return;
  }
  
  console.log('Registered plugins:', pluginManager.getAllPlugins());
  console.log('Active plugins:', pluginManager.getActivePlugins());
  console.log('Sample plugin active:', pluginManager.isPluginActive('sample-plugin'));
};

window.toggleSamplePlugin = function() {
  const pluginManager = window.markdownEditor?.pluginManager;
  if (!pluginManager) {
    console.error('Plugin manager not available');
    return;
  }
  
  if (pluginManager.isPluginActive('sample-plugin')) {
    pluginManager.deactivatePlugin('sample-plugin');
    console.log('Sample plugin deactivated');
  } else {
    pluginManager.activatePlugin('sample-plugin');
    console.log('Sample plugin activated');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSamplePlugin);
} else {
  initSamplePlugin();
}