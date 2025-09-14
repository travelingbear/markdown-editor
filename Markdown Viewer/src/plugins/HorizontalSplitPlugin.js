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
    this.savedPaneSizes = null;
    
    // State management for different modes
    this.modeStates = {
      code: { previewPaneStyles: '', editorPaneStyles: '' },
      preview: { previewPaneStyles: '', editorPaneStyles: '' },
      split: { previewPaneStyles: '', editorPaneStyles: '' }
    };
  }

  async init() {
    console.log('[HorizontalSplitPlugin] Initializing...');
    
    // Add settings integration
    this.addSettingsIntegration();
    
    // Inject settings UI
    this.injectSettingsUI();
    
    // Hook into Split button behavior
    this.hookSplitButton();
    
    // Create dropdown UI
    this.createDropdownUI();
    
    // Inject CSS
    this.injectCSS();
    
    // Listen for mode changes
    this.addModeListener();
    
    // Apply initial settings if in split mode
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent && mainContent.classList.contains('split-mode')) {
        this.applySplitOrientation();
        this.applyToolbarVisibility();
        this.applyPaneOrder();
      }
    }, 100);
    
    this.isActive = true;
    console.log('[HorizontalSplitPlugin] Initialized successfully');
  }

  addSettingsIntegration() {
    // Initialize default values if not set
    if (!localStorage.getItem('markdownViewer_defaultSplitOrientation')) {
      localStorage.setItem('markdownViewer_defaultSplitOrientation', 'vertical');
    }
    if (!localStorage.getItem('markdownViewer_horizontalSplitToolbar')) {
      localStorage.setItem('markdownViewer_horizontalSplitToolbar', 'show');
    }
    if (!localStorage.getItem('markdownViewer_horizontalSplitPaneOrder')) {
      localStorage.setItem('markdownViewer_horizontalSplitPaneOrder', 'preview-top');
    }
    
    // Register split orientation setting
    const orientationExtension = {
      get: () => localStorage.getItem('markdownViewer_defaultSplitOrientation') || 'vertical',
      set: (value) => localStorage.setItem('markdownViewer_defaultSplitOrientation', value),
      metadata: {
        name: 'defaultSplitOrientation',
        description: 'Default split orientation setting'
      }
    };
    this.pluginAPI.registerExtension('settings', orientationExtension);

    // Register toolbar visibility setting
    const toolbarExtension = {
      get: () => localStorage.getItem('markdownViewer_horizontalSplitToolbar') || 'show',
      set: (value) => localStorage.setItem('markdownViewer_horizontalSplitToolbar', value),
      metadata: {
        name: 'horizontalSplitToolbar',
        description: 'Markdown toolbar visibility in horizontal split'
      }
    };
    this.pluginAPI.registerExtension('settings', toolbarExtension);

    // Register pane order setting
    const paneOrderExtension = {
      get: () => localStorage.getItem('markdownViewer_horizontalSplitPaneOrder') || 'preview-top',
      set: (value) => localStorage.setItem('markdownViewer_horizontalSplitPaneOrder', value),
      metadata: {
        name: 'horizontalSplitPaneOrder',
        description: 'Pane order in horizontal split mode'
      }
    };
    this.pluginAPI.registerExtension('settings', paneOrderExtension);
  }

  injectSettingsUI() {
    const settingsContent = document.querySelector('.settings-content');
    if (!settingsContent) {
      console.warn('[HorizontalSplitPlugin] Settings content not found');
      return;
    }

    // Create horizontal split settings section
    this.settingsSection = document.createElement('div');
    this.settingsSection.className = 'settings-section';
    this.settingsSection.innerHTML = `
      <h3>Horizontal Split</h3>
      <div class="setting-item">
        <label>Default Split Orientation</label>
        <div class="setting-control">
          <button id="hsplit-vertical-btn" class="setting-btn">Vertical</button>
          <button id="hsplit-horizontal-btn" class="setting-btn">Horizontal</button>
        </div>
      </div>
      <div class="setting-item">
        <label>Markdown Toolbar</label>
        <div class="setting-control">
          <button id="hsplit-toolbar-show-btn" class="setting-btn">Show</button>
          <button id="hsplit-toolbar-hide-btn" class="setting-btn">Hide</button>
        </div>
      </div>
      <div class="setting-item">
        <label>Pane Order</label>
        <div class="setting-control">
          <button id="hsplit-preview-top-btn" class="setting-btn">Preview Top</button>
          <button id="hsplit-code-top-btn" class="setting-btn">Code Top</button>
        </div>
      </div>
    `;

    // Insert before plugins section
    const pluginsSection = settingsContent.querySelector('.settings-section:last-child');
    settingsContent.insertBefore(this.settingsSection, pluginsSection);

    // Add event listeners and update UI
    this.addSettingsListeners();
    this.updateSettingsUI();
  }

  addSettingsListeners() {
    // Orientation buttons
    document.getElementById('hsplit-vertical-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_defaultSplitOrientation', 'vertical');
      this.updateSettingsUI();
      this.updateDropdownOptions();
    });
    document.getElementById('hsplit-horizontal-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_defaultSplitOrientation', 'horizontal');
      this.updateSettingsUI();
      this.updateDropdownOptions();
    });

    // Toolbar buttons
    document.getElementById('hsplit-toolbar-show-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_horizontalSplitToolbar', 'show');
      this.updateSettingsUI();
      setTimeout(() => this.applyToolbarVisibility(), 50);
    });
    document.getElementById('hsplit-toolbar-hide-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_horizontalSplitToolbar', 'hide');
      this.updateSettingsUI();
      setTimeout(() => this.applyToolbarVisibility(), 50);
    });

    // Pane order buttons
    document.getElementById('hsplit-preview-top-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_horizontalSplitPaneOrder', 'preview-top');
      this.updateSettingsUI();
      this.applyPaneOrder();
    });
    document.getElementById('hsplit-code-top-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_horizontalSplitPaneOrder', 'code-top');
      this.updateSettingsUI();
      this.applyPaneOrder();
    });
  }

  updateSettingsUI() {
    // Update orientation buttons
    const orientation = localStorage.getItem('markdownViewer_defaultSplitOrientation') || 'vertical';
    document.getElementById('hsplit-vertical-btn')?.classList.toggle('active', orientation === 'vertical');
    document.getElementById('hsplit-horizontal-btn')?.classList.toggle('active', orientation === 'horizontal');

    // Update toolbar buttons
    const toolbar = localStorage.getItem('markdownViewer_horizontalSplitToolbar') || 'show';
    document.getElementById('hsplit-toolbar-show-btn')?.classList.toggle('active', toolbar === 'show');
    document.getElementById('hsplit-toolbar-hide-btn')?.classList.toggle('active', toolbar === 'hide');

    // Update pane order buttons
    const paneOrder = localStorage.getItem('markdownViewer_horizontalSplitPaneOrder') || 'preview-top';
    document.getElementById('hsplit-preview-top-btn')?.classList.toggle('active', paneOrder === 'preview-top');
    document.getElementById('hsplit-code-top-btn')?.classList.toggle('active', paneOrder === 'code-top');
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
    // Call original handler first, then apply all settings
    if (this.originalSplitHandler) {
      this.originalSplitHandler();
    }
    setTimeout(() => {
      this.applySplitOrientation();
      this.applyToolbarVisibility();
    }, 100);
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
    
    // Update dropdown to show only alternative option
    this.updateDropdownOptions();
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
      setTimeout(() => {
        this.applySplitOrientation();
        this.applyToolbarVisibility();
        this.updateDropdownOptions();
      }, 100);
    }
  }
  
  updateDropdownOptions() {
    const dropdownMenu = document.getElementById('split-orientation-menu');
    if (!dropdownMenu) return;
    
    const currentOrientation = localStorage.getItem('markdownViewer_defaultSplitOrientation') || 'vertical';
    const verticalItem = dropdownMenu.querySelector('[data-orientation="vertical"]');
    const horizontalItem = dropdownMenu.querySelector('[data-orientation="horizontal"]');
    
    if (verticalItem && horizontalItem) {
      if (currentOrientation === 'vertical') {
        // Show only horizontal option
        verticalItem.style.display = 'none';
        horizontalItem.style.display = 'block';
      } else {
        // Show only vertical option
        verticalItem.style.display = 'block';
        horizontalItem.style.display = 'none';
      }
    }
  }

  addModeListener() {
    // Listen for mode changes to apply orientation
    this.pluginAPI.addHook('mode', 'mode-changed', (data) => {
      // Save current mode state before switching
      const mainContent = document.querySelector('.main-content');
      if (mainContent.classList.contains('code-mode')) {
        this.saveCurrentModeState('code');
      } else if (mainContent.classList.contains('preview-mode')) {
        this.saveCurrentModeState('preview');
      } else if (mainContent.classList.contains('split-mode')) {
        this.saveCurrentModeState('split');
      }
      
      if (data && data.mode === 'split') {
        this.applySplitOrientation();
        this.applyToolbarVisibility();
        this.applyPaneOrder();
        this.updateDropdownOptions();
        // Restore split mode state
        setTimeout(() => this.restoreModeState('split'), 50);
      } else {
        // Save horizontal state before clearing
        this.wasHorizontal = mainContent?.classList.contains('split-horizontal');
        this.clearSplitStyles();
        this.clearToolbarVisibility();
        this.updateDropdownOptions();
        // Restore the appropriate mode state
        setTimeout(() => this.restoreModeState(data.mode), 50);
      }
    });
    
    // Listen for settings changes
    this.pluginAPI.addHook('settings', 'settings-changed', (data) => {
      if (data && data.setting) {
        if (data.setting === 'horizontalSplitToolbar') {
          this.applyToolbarVisibility();
        } else if (data.setting === 'horizontalSplitPaneOrder') {
          this.applyPaneOrder();
        } else if (data.setting === 'defaultSplitOrientation') {
          this.updateDropdownOptions();
        }
      }
    });
    
    // Also listen for direct settings button clicks
    setTimeout(() => {
      const toolbarShowBtn = document.getElementById('hsplit-toolbar-show-btn');
      const toolbarHideBtn = document.getElementById('hsplit-toolbar-hide-btn');
      
      if (toolbarShowBtn) {
        toolbarShowBtn.addEventListener('click', () => {
          setTimeout(() => this.applyToolbarVisibility(), 100);
        });
      }
      if (toolbarHideBtn) {
        toolbarHideBtn.addEventListener('click', () => {
          setTimeout(() => this.applyToolbarVisibility(), 100);
        });
      }
    }, 200);
    
    // Also listen for non-split mode button clicks directly
    const codeBtn = document.getElementById('code-btn');
    const previewBtn = document.getElementById('preview-btn');
    const distractionBtn = document.getElementById('distraction-btn');
    
    if (codeBtn) {
      codeBtn.addEventListener('click', () => {
        setTimeout(() => {
          if (!document.body.classList.contains('distraction-free')) {
            this.clearSplitStyles();
          }
        }, 100);
      });
    }
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        setTimeout(() => {
          if (!document.body.classList.contains('distraction-free')) {
            this.clearSplitStyles();
          }
        }, 100);
      });
    }
    if (distractionBtn) {
      distractionBtn.addEventListener('click', () => {
        setTimeout(() => this.clearSplitStyles(), 100);
      });
    }
    
    // Listen for welcome screen display (when all tabs are closed)
    this.pluginAPI.addHook('tab', 'all-tabs-closed', () => {
      console.log('[HorizontalSplitPlugin] All tabs closed, restarting application...');
      this.restartApplication();
    });
    
    // Also monitor welcome page visibility as backup
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
      const observer = new MutationObserver(() => {
        if (welcomePage.style.display === 'flex') {
          console.log('[HorizontalSplitPlugin] Welcome page shown, restarting...');
          this.restartApplication();
        }
      });
      observer.observe(welcomePage, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Listen for centered layout toggle
    const centeredBtn = document.querySelector('[data-setting="centered-layout"]');
    if (centeredBtn) {
      centeredBtn.addEventListener('click', () => {
        setTimeout(() => {
          const mainContent = document.querySelector('.main-content');
          if (mainContent && mainContent.classList.contains('split-mode') && mainContent.classList.contains('split-horizontal')) {
            // Reapply horizontal split settings for centered layout
            this.applySplitOrientation();
            this.applyToolbarVisibility();
            this.applyPaneOrder();
          } else {
            this.clearSplitStyles();
          }
        }, 100);
      });
    }
    
    // Monitor for distraction-free mode changes (including keyboard shortcuts)
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('distraction-free')) {
        // Only clear inline styles, preserve split orientation
        this.clearInlineStyles();
      } else {
        // Exiting distraction-free mode - restore split orientation if in split mode
        const mainContent = document.querySelector('.main-content');
        if (mainContent && mainContent.classList.contains('split-mode')) {
          setTimeout(() => this.applySplitOrientation(), 100);
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    this.distractionObserver = observer;
    
    // Intercept keyboard shortcuts
    this.keydownHandler = (e) => {
      if (e.ctrlKey) {
        if (e.key === '1' || e.key === '2') {
          // Code/Preview mode - only clear styles if NOT in distraction-free mode
          setTimeout(() => {
            if (!document.body.classList.contains('distraction-free')) {
              this.clearSplitStyles();
            }
          }, 100);
        } else if (e.key === '3') {
          // Split mode - apply all settings after mode change
          setTimeout(() => {
            this.applySplitOrientation();
            this.applyToolbarVisibility();
            this.applyPaneOrder();
          }, 100);
        }
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }
  
  clearSplitStyles() {
    // Only clear styles if NOT in split mode
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.classList.contains('split-mode')) {
      // Save current pane sizes if in horizontal mode
      if (mainContent.classList.contains('split-horizontal')) {
        this.savePaneSizes();
      }
      
      mainContent.classList.remove('split-horizontal');
      this.clearInlineStyles();
    }
  }
  
  refreshForWelcomeScreen() {
    // Force clear all horizontal split styles when returning to welcome screen
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('split-horizontal', 'code-top');
    }
    
    // Force clear preview-content styles for welcome screen
    const previewContent = document.querySelector('.preview-content');
    if (previewContent) {
      previewContent.style.cssText = '';
    }
    
    // Clear all inline styles completely
    this.clearInlineStyles();
    
    // Clear toolbar visibility
    this.clearToolbarVisibility();
  }
  
  saveCurrentModeState(mode) {
    const previewPane = document.querySelector('.preview-pane');
    const editorPane = document.querySelector('.editor-pane');
    
    if (previewPane && editorPane && this.modeStates[mode]) {
      this.modeStates[mode].previewPaneStyles = previewPane.style.cssText;
      this.modeStates[mode].editorPaneStyles = editorPane.style.cssText;
    }
  }
  
  restoreModeState(mode) {
    const previewPane = document.querySelector('.preview-pane');
    const editorPane = document.querySelector('.editor-pane');
    
    if (previewPane && editorPane && this.modeStates[mode]) {
      previewPane.style.cssText = this.modeStates[mode].previewPaneStyles;
      editorPane.style.cssText = this.modeStates[mode].editorPaneStyles;
    }
  }
  
  clearInlineStyles() {
    // Only clear horizontal split specific styles, preserve others
    const previewPane = document.querySelector('.preview-pane');
    const editorPane = document.querySelector('.editor-pane');
    
    if (previewPane) {
      previewPane.style.removeProperty('height');
    }
    if (editorPane) {
      editorPane.style.removeProperty('height');
    }
  }
  
  async restartApplication() {
    try {
      if (window.__TAURI__?.process) {
        await window.__TAURI__.process.relaunch();
      } else {
        location.reload();
      }
    } catch (error) {
      console.error('Failed to restart application:', error);
      location.reload();
    }
  }
  
  savePaneSizes() {
    const previewPane = document.querySelector('.preview-pane');
    const editorPane = document.querySelector('.editor-pane');
    
    if (previewPane && editorPane) {
      this.savedPaneSizes = {
        previewHeight: previewPane.style.height || '50%',
        editorHeight: editorPane.style.height || '50%'
      };

    }
  }
  
  restorePaneSizes() {
    if (this.savedPaneSizes) {
      const previewPane = document.querySelector('.preview-pane');
      const editorPane = document.querySelector('.editor-pane');
      
      if (previewPane && editorPane) {
        previewPane.style.height = this.savedPaneSizes.previewHeight;
        editorPane.style.height = this.savedPaneSizes.editorHeight;

      }
    }
  }

  applySplitOrientation() {
    const orientation = localStorage.getItem('markdownViewer_defaultSplitOrientation') || 'vertical';
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent) {
      // If we were previously in horizontal mode, restore that regardless of default setting
      const shouldBeHorizontal = this.wasHorizontal || orientation === 'horizontal';
      
      if (shouldBeHorizontal) {
        mainContent.classList.add('split-horizontal');
        // Apply pane order immediately after adding horizontal class
        this.applyPaneOrder();
        // Enable horizontal splitter resizing
        this.enableHorizontalResize();
        // Restore saved pane sizes
        setTimeout(() => this.restorePaneSizes(), 100);
      } else {
        mainContent.classList.remove('split-horizontal', 'code-top');
        // Clear height styles when switching to vertical
        const previewPane = document.querySelector('.preview-pane');
        const editorPane = document.querySelector('.editor-pane');
        if (previewPane) {
          previewPane.style.removeProperty('height');
        }
        if (editorPane) {
          editorPane.style.removeProperty('height');
        }
      }
      
      // Reset the flag after use
      this.wasHorizontal = false;
    }
  }
  
  applyToolbarVisibility() {
    const toolbarSetting = localStorage.getItem('markdownViewer_horizontalSplitToolbar') || 'show';
    const mainContent = document.querySelector('.main-content');
    const toolbar = document.querySelector('.markdown-toolbar');
    const editorPane = document.querySelector('.editor-pane');
    
    if (mainContent && mainContent.classList.contains('split-mode') && mainContent.classList.contains('split-horizontal')) {
      // Move toolbar inside editor pane if not already there
      if (toolbar && editorPane && !editorPane.contains(toolbar)) {
        // Store original parent for restoration later
        this.originalToolbarParent = toolbar.parentNode;
        this.originalToolbarNextSibling = toolbar.nextSibling;
        
        // Move toolbar to be the first child of editor pane
        editorPane.insertBefore(toolbar, editorPane.firstChild);
      }
      
      if (toolbar) {
        if (toolbarSetting === 'hide') {
          toolbar.style.setProperty('display', 'none', 'important');
          toolbar.classList.remove('visible');
        } else {
          toolbar.classList.add('visible');
          toolbar.style.setProperty('height', 'auto', 'important');
          toolbar.style.setProperty('opacity', '1', 'important');
          toolbar.style.setProperty('display', 'block', 'important');
          toolbar.style.setProperty('visibility', 'visible', 'important');
        }
      }
    }
  }
  
  clearToolbarVisibility() {
    document.body.classList.remove('horizontal-split-hide-toolbar');
    
    // Restore toolbar to original position
    const toolbar = document.querySelector('.markdown-toolbar');
    if (toolbar && this.originalToolbarParent) {
      if (this.originalToolbarNextSibling) {
        this.originalToolbarParent.insertBefore(toolbar, this.originalToolbarNextSibling);
      } else {
        this.originalToolbarParent.appendChild(toolbar);
      }
      
      // Clear stored references
      this.originalToolbarParent = null;
      this.originalToolbarNextSibling = null;
    }
  }
  
  applyPaneOrder() {
    const paneOrder = localStorage.getItem('markdownViewer_horizontalSplitPaneOrder') || 'preview-top';
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent && mainContent.classList.contains('split-mode') && mainContent.classList.contains('split-horizontal')) {
      if (paneOrder === 'code-top') {
        mainContent.classList.add('code-top');
      } else {
        mainContent.classList.remove('code-top');
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
        const isCodeTop = mainContent.classList.contains('code-top');
        
        if (previewPane && editorPane) {
          if (isCodeTop) {
            // Code pane is on top (order: 1), preview pane is on bottom (order: 3)
            editorPane.style.height = percentage + '%';
            previewPane.style.height = (100 - percentage) + '%';
          } else {
            // Preview pane is on top (order: 1), code pane is on bottom (order: 3)
            previewPane.style.height = percentage + '%';
            editorPane.style.height = (100 - percentage) + '%';
          }
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
      
      /* ONLY apply horizontal split when in split mode */
      .main-content.split-mode.split-horizontal {
        flex-direction: column;
      }
      
      .main-content.split-mode.split-horizontal .preview-pane {
        width: 100%;
        height: 50%;
        order: 1;
        border-bottom: none;
        border-right: none;
      }
      
      .main-content.split-mode.split-horizontal .editor-pane {
        width: 100%;
        height: 50%;
        order: 3;
        border-right: none;
        border-top: none;
      }
      
      .main-content.split-mode.split-horizontal .splitter {
        width: 100%;
        height: 6px;
        cursor: row-resize;
        order: 2;
        border-bottom: 1px solid var(--border-primary);
      }
      
      /* Code Top Variant */
      .main-content.split-mode.split-horizontal.code-top .preview-pane {
        order: 3;
        height: 50%;
      }
      .main-content.split-mode.split-horizontal.code-top .editor-pane {
        order: 1;
        height: 50%;
      }
      
      /* Toolbar positioning inside editor pane */
      .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar {
        position: relative !important;
        z-index: 999 !important;
      }
      
      /* Force markdown toolbar visibility in horizontal split mode with maximum specificity */
      body.app-initialized .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar,
      .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar,
      .split-horizontal .editor-pane .markdown-toolbar {
        display: block !important;
        visibility: visible !important;
        height: auto !important;
        opacity: 1 !important;
        overflow: visible !important;
        position: relative !important;
        z-index: 999 !important;
        background: var(--bg-tertiary) !important;
        border-bottom: 1px solid var(--border-primary) !important;
        padding: 0 !important;
      }
      
      /* Fix Monaco editor container height in horizontal split to account for status bar */
      .main-content.split-mode.split-horizontal .editor-pane .monaco-editor-container {
        height: calc(100% - 24px) !important;
      }
      
      /* Adjust for different status bar sizes */
      [data-status-bar-size="small"] .main-content.split-mode.split-horizontal .editor-pane .monaco-editor-container {
        height: calc(100% - 18px) !important;
      }
      
      [data-status-bar-size="large"] .main-content.split-mode.split-horizontal .editor-pane .monaco-editor-container {
        height: calc(100% - 32px) !important;
      }
      
      /* Account for markdown toolbar when visible */
      .main-content.split-mode.split-horizontal .editor-pane:has(.markdown-toolbar.visible) .monaco-editor-container {
        height: calc(100% - 24px - 40px) !important;
      }
      
      [data-status-bar-size="small"] .main-content.split-mode.split-horizontal .editor-pane:has(.markdown-toolbar.visible) .monaco-editor-container {
        height: calc(100% - 18px - 30px) !important;
      }
      
      [data-status-bar-size="large"] .main-content.split-mode.split-horizontal .editor-pane:has(.markdown-toolbar.visible) .monaco-editor-container {
        height: calc(100% - 32px - 48px) !important;
      }
      
      /* Fallback for browsers without :has() support */
      .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar.visible ~ .monaco-editor-container {
        height: calc(100% - 24px - 40px) !important;
      }
      
      /* Distraction-free mode horizontal split support */
      body.distraction-free .main-content.split-mode.split-horizontal {
        flex-direction: column !important;
        height: 100vh !important;
        padding: 0 !important;
      }
      
      body.distraction-free .main-content.split-mode.split-horizontal .preview-pane,
      body.distraction-free .main-content.split-mode.split-horizontal .editor-pane {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      body.distraction-free .main-content.split-mode.split-horizontal .splitter {
        display: block !important;
        width: 100% !important;
        height: 6px !important;
        cursor: row-resize !important;
      }
      
      /* Code top in distraction-free mode */
      body.distraction-free .main-content.split-mode.split-horizontal.code-top .preview-pane {
        order: 3 !important;
      }
      body.distraction-free .main-content.split-mode.split-horizontal.code-top .editor-pane {
        order: 1 !important;
      }
      
      /* Centered layout compatibility */
      body.centered-layout .main-content.split-mode.split-horizontal {
        max-width: var(--content-max-width, 1200px) !important;
        margin: 0 auto !important;
        width: 100% !important;
      }
      
      body.centered-layout .main-content.split-mode.split-horizontal .preview-pane,
      body.centered-layout .main-content.split-mode.split-horizontal .editor-pane {
        width: 100% !important;
        max-width: none !important;
      }
      
      body.centered-layout .main-content.split-mode.split-horizontal .splitter {
        width: 100% !important;
        max-width: none !important;
      }
      
      body.centered-layout .main-content.split-mode.split-horizontal .preview-content {
        display: table !important;
        min-height: 100% !important;
        width: 100% !important;
      }
      
      /* Distraction-free mode with centered layout */
      body.distraction-free.centered-layout .main-content.split-mode.split-horizontal .preview-content {
        display: table !important;
        min-height: 100% !important;
      }
      
      /* Container-based responsive toolbar for narrow editor panes */
      .main-content.split-mode.split-horizontal .editor-pane {
        container-type: inline-size;
      }
      
      @container (max-width: 600px) {
        .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar .toolbar-btn {
          padding: 3px 4px !important;
          font-size: 10px !important;
          min-width: 24px !important;
        }
        
        .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar .toolbar-btn .btn-text {
          display: none !important;
        }
        
        .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar {
          gap: 1px !important;
          padding: 2px !important;
        }
      }
      
      /* Force preview display in both normal and distraction-free mode */
      #preview {
        display: block !important;
      }
      
      /* Responsive markdown toolbar for horizontal split mode */
      @media (max-width: 1200px) {
        .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar .toolbar-btn {
          padding: 4px 6px !important;
          font-size: 11px !important;
          min-width: auto !important;
        }
        
        .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar .toolbar-btn .btn-text {
          display: none !important;
        }
        
        .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar {
          gap: 2px !important;
        }
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
    
    // Remove settings UI
    if (this.settingsSection) {
      this.settingsSection.remove();
      this.settingsSection = null;
    }

    // Remove horizontal split classes
    const container = document.querySelector('.main-content');
    if (container) {
      container.classList.remove('split-horizontal', 'code-top');
    }
    
    // Clear toolbar visibility
    this.clearToolbarVisibility();
    
    // Remove injected CSS
    if (this.styleElement) {
      this.styleElement.remove();
    }
    
    // Disconnect distraction-free observer
    if (this.distractionObserver) {
      this.distractionObserver.disconnect();
    }
    
    // Remove keyboard event listener
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    
    // Remove settings integration
    this.pluginAPI.unregisterExtension('settings', 'defaultSplitOrientation');
    this.pluginAPI.unregisterExtension('settings', 'horizontalSplitToolbar');
    this.pluginAPI.unregisterExtension('settings', 'horizontalSplitPaneOrder');
    
    // Clear plugin settings from localStorage
    localStorage.removeItem('markdownViewer_defaultSplitOrientation');
    localStorage.removeItem('markdownViewer_horizontalSplitToolbar');
    localStorage.removeItem('markdownViewer_horizontalSplitPaneOrder');
    
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