/**
 * Sample Plugin - Demonstrates plugin functionality
 * Adds a toolbar button and shows plugin capabilities
 */
class SamplePlugin {
  constructor(pluginAPI) {
    this.pluginAPI = pluginAPI;
    this.toolbarButton = null;
    this.isActive = false;
  }

  async init() {
    console.log('[SamplePlugin] Initializing...');
    
    // Add toolbar button
    this.addToolbarButton();
    
    // Register hooks
    this.registerHooks();
    
    this.isActive = true;
    console.log('[SamplePlugin] Initialized successfully');
  }

  addToolbarButton() {
    // Remove existing button if it exists
    this.removeToolbarButton();
    
    // Create sample button
    this.toolbarButton = document.createElement('button');
    this.toolbarButton.className = 'toolbar-btn sample-plugin-btn';
    this.toolbarButton.innerHTML = '🔌 Sample';
    this.toolbarButton.title = 'Sample Plugin Action';
    
    // Add click handler
    this.toolbarButton.addEventListener('click', () => {
      this.handleButtonClick();
    });
    
    // Insert into toolbar
    const toolbarRight = document.querySelector('.toolbar-right');
    if (toolbarRight) {
      toolbarRight.insertBefore(this.toolbarButton, toolbarRight.firstChild);
    }
  }
  
  removeToolbarButton() {
    if (this.toolbarButton && this.toolbarButton.parentNode) {
      this.toolbarButton.parentNode.removeChild(this.toolbarButton);
      this.toolbarButton = null;
    }
  }

  registerHooks() {
    // Register file operation hooks
    this.pluginAPI.addHook('file', 'beforeNewFile', () => {
      console.log('[SamplePlugin] Before new file created');
    });
    
    this.pluginAPI.addHook('file', 'afterNewFile', () => {
      console.log('[SamplePlugin] After new file created');
    });
    
    // Register theme hooks
    this.pluginAPI.addHook('ui', 'beforeThemeChange', (data) => {
      console.log('[SamplePlugin] Theme changing to:', data.theme);
    });
  }

  handleButtonClick() {
    const editor = this.pluginAPI.getEditor();
    const preview = this.pluginAPI.getPreview();
    const tabManager = this.pluginAPI.getTabManager();
    
    // Show plugin info
    const info = {
      pluginName: 'Sample Plugin',
      editorLoaded: editor?.isMonacoLoaded || false,
      previewVisible: preview ? true : false,
      activeTabs: tabManager?.getTabsCount() || 0,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Insert plugin info into editor if available
    if (editor && editor.isMonacoLoaded && editor.monacoEditor) {
      const position = editor.monacoEditor.getPosition();
      const insertText = `\n<!-- Sample Plugin Info -->\n${JSON.stringify(info, null, 2)}\n`;
      
      editor.monacoEditor.executeEdits('sample-plugin', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: insertText
      }]);
    } else {
      // Show in console if editor not available
      console.log('[SamplePlugin] Plugin Info:', info);
      alert('Sample Plugin activated! Check console for details.');
    }
  }

  async destroy() {
    console.log('[SamplePlugin] Destroying...');
    
    // Remove toolbar button
    this.removeToolbarButton();
    
    this.isActive = false;
    console.log('[SamplePlugin] Destroyed successfully');
  }
}

// Plugin metadata
SamplePlugin.metadata = {
  name: 'Sample Plugin',
  version: '1.0.0',
  description: 'A sample plugin demonstrating plugin capabilities',
  author: 'Markdown Editor'
};

window.SamplePlugin = SamplePlugin;