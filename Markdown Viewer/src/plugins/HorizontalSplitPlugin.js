/**
 * Horizontal Split Plugin - Adds horizontal split functionality
 */
class HorizontalSplitPlugin {
  constructor(pluginAPI) {
    this.pluginAPI = pluginAPI;
    this.isActive = false;
    this.originalSplitButton = null;
    this.dropdownContainer = null;
    this.styleElement = null;
  }

  async init() {
    console.log('[HorizontalSplitPlugin] Initializing...');
    
    // Add settings integration
    this.addSettingsIntegration();
    
    // Hook into Split button behavior
    this.hookSplitButton();
    
    // Create dropdown UI
    this.createDropdownUI();
    
    // Inject CSS
    this.injectCSS();
    
    // Listen for mode changes
    this.addModeListener();
    
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

  hookSplitButton() {
    const splitButton = document.getElementById('split-btn');
    if (!splitButton) {
      console.warn('[HorizontalSplitPlugin] Split button not found');
      return;
    }

    // Store original click handler
    this.originalSplitHandler = splitButton.onclick;
    
    // Override Split button behavior
    splitButton.onclick = (e) => {
      e.preventDefault();
      this.handleSplitClick();
    };
  }

  handleSplitClick() {
    // Split button click is handled by original handler
    // We just need to apply orientation after split mode is active
    setTimeout(() => this.applySplitOrientation(), 100);
  }

  createDropdownUI() {
    const splitButton = document.getElementById('split-btn');
    if (!splitButton) {
      console.warn('[HorizontalSplitPlugin] Split button not found');
      return;
    }

    // Create dropdown container matching Save button structure
    this.dropdownContainer = document.createElement('div');
    this.dropdownContainer.className = 'dropdown-container';
    
    this.dropdownContainer.innerHTML = `
      <button id="split-orientation-arrow" class="mode-btn dropdown-arrow" title="Split orientation options">▼</button>
      <div id="split-orientation-menu" class="dropdown-menu">
        <button class="dropdown-item" data-orientation="vertical">Vertically</button>
        <button class="dropdown-item" data-orientation="horizontal">Horizontally</button>
      </div>
    `;
    
    // Insert immediately after split button with no gap
    this.dropdownContainer.style.marginLeft = '-10px';
    splitButton.parentNode.insertBefore(this.dropdownContainer, splitButton.nextSibling);
    
    // Add event listeners
    this.addDropdownListeners();
  }

  addDropdownListeners() {
    const dropdownBtn = document.getElementById('split-orientation-arrow');
    const dropdownMenu = document.getElementById('split-orientation-menu');
    
    if (!dropdownBtn || !dropdownMenu) return;
    
    // Toggle dropdown
    dropdownBtn.addEventListener('click', (e) => {
      if (document.querySelector('.welcome-page') && document.querySelector('.welcome-page').style.display !== 'none') {
        return; // Disable in welcome screen
      }
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Handle dropdown selections
    dropdownMenu.addEventListener('click', (e) => {
      if (document.querySelector('.welcome-page') && document.querySelector('.welcome-page').style.display !== 'none') {
        return; // Disable in welcome screen
      }
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      
      const orientation = item.dataset.orientation;
      this.handleOrientationChange(orientation);
      dropdownMenu.style.display = 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdownMenu.style.display = 'none';
    });
  }

  handleOrientationChange(orientation) {
    localStorage.setItem('markdownViewer_defaultSplitOrientation', orientation);
    
    const splitButton = document.getElementById('split-btn');
    if (splitButton) {
      splitButton.click();
      setTimeout(() => this.applySplitOrientation(), 100);
    }
  }

  addModeListener() {
    // Listen for mode changes to apply orientation
    this.pluginAPI.addHook('mode', 'mode-changed', (data) => {
      if (data && data.mode === 'split') {
        this.applySplitOrientation();
      }
    });
  }

  applySplitOrientation() {
    const orientation = localStorage.getItem('markdownViewer_defaultSplitOrientation') || 'vertical';
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent) {
      if (orientation === 'horizontal') {
        mainContent.classList.add('split-horizontal');
        // Enable horizontal splitter resizing
        this.enableHorizontalResize();
      } else {
        mainContent.classList.remove('split-horizontal');
      }
    }
  }

  enableHorizontalResize() {
    const splitter = document.getElementById('splitter');
    if (!splitter) return;
    
    let isResizing = false;
    
    splitter.addEventListener('mousedown', (e) => {
      if (!document.querySelector('.main-content.split-horizontal')) return;
      isResizing = true;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing || !document.querySelector('.main-content.split-horizontal')) return;
      
      const mainContent = document.querySelector('.main-content');
      const rect = mainContent.getBoundingClientRect();
      const percentage = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (percentage > 10 && percentage < 90) {
        const previewPane = document.querySelector('.preview-pane');
        const editorPane = document.querySelector('.editor-pane');
        
        if (previewPane && editorPane) {
          previewPane.style.height = percentage + '%';
          editorPane.style.height = (100 - percentage) + '%';
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }

  injectCSS() {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      /* TODO: Fix hover highlighting - needs to match Save As dropdown behavior */
      /* Remove left border and fix dropdown styling */
      #split-orientation-arrow {
        border-left: none;
      }
      
      #split-orientation-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 120px;
        display: none;
      }
      
      #split-orientation-menu .dropdown-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        color: var(--text-primary);
        transition: background-color 0.2s;
      }
      
      #split-orientation-menu .dropdown-item:hover {
        background: var(--bg-hover);
      }
      
      /* Retro theme support */
      body.retro-theme #split-orientation-menu {
        background: #c0c0c0;
        border: 2px outset #c0c0c0;
        border-radius: 0;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
      
      body.retro-theme #split-orientation-menu .dropdown-item {
        background: #c0c0c0;
        color: #000000;
        font-family: 'MS Sans Serif', sans-serif, 'Courier New';
        font-size: 11px;
        border-radius: 0;
      }
      
      body.retro-theme #split-orientation-menu .dropdown-item:hover {
        background: #000080 !important;
        color: #ffffff !important;
      }
      
      .split-horizontal {
        flex-direction: column;
      }
      
      .split-horizontal .preview-pane {
        width: 100%;
        height: 50%;
        order: 1;
        border-bottom: none;
        border-right: none;
      }
      
      .split-horizontal .editor-pane {
        width: 100%;
        height: 50%;
        order: 3;
        border-right: none;
        border-top: none;
      }
      
      .split-horizontal .splitter {
        width: 100%;
        height: 6px;
        cursor: row-resize;
        order: 2;
        border-bottom: 1px solid var(--border-primary);
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  async destroy() {
    console.log('[HorizontalSplitPlugin] Destroying...');
    
    // Restore original Split button behavior
    const splitButton = document.getElementById('split-btn');
    if (splitButton && this.originalSplitHandler) {
      splitButton.onclick = this.originalSplitHandler;
    }
    
    // Remove dropdown button
    if (this.dropdownContainer) {
      this.dropdownContainer.remove();
    }
    
    // Remove horizontal split class
    const container = document.querySelector('.split-container, .content-container');
    if (container) {
      container.classList.remove('split-horizontal');
    }
    
    // Remove injected CSS
    if (this.styleElement) {
      this.styleElement.remove();
    }
    
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