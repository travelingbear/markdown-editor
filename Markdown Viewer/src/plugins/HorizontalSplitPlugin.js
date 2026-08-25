import {
  horizontalSplitConfigKeys,
  horizontalSplitMetadata,
  resetHorizontalSplitConfig
} from './horizontalSplitManifest.js';
import { HORIZONTAL_SPLIT_CSS } from './horizontalSplitStyles.js';

/**
 * Horizontal Split Plugin - Adds horizontal split functionality
 */
class HorizontalSplitPlugin {
  static configKeys = horizontalSplitConfigKeys;

  static resetConfig() {
    resetHorizontalSplitConfig();
  }

  constructor(pluginAPI) {
    this.pluginAPI = pluginAPI;
    this.isActive = false;
    this.originalSplitButton = null;
    this.dropdownContainer = null;
    this.styleElement = null;
    this.savedPaneSizes = null;
    this.pendingTimeouts = new Set();
    
  }

  getSetting(key, defaultValue) {
    return this.pluginAPI.getSetting?.(key, defaultValue) ?? defaultValue;
  }

  setSetting(key, value) {
    return this.pluginAPI.setSetting?.(key, value) ?? false;
  }

  migrateLegacySettings() {
    const settings = [
      ['defaultSplitOrientation', 'markdownViewer_defaultSplitOrientation', 'vertical'],
      ['horizontalSplitToolbar', 'markdownViewer_horizontalSplitToolbar', 'show'],
      ['horizontalSplitPaneOrder', 'markdownViewer_horizontalSplitPaneOrder', 'preview-top']
    ];

    for (const [settingKey, legacyKey, defaultValue] of settings) {
      const configuredValue = this.pluginAPI.getSetting?.(settingKey, undefined);
      if (configuredValue === undefined || configuredValue === null) {
        this.setSetting(settingKey, localStorage.getItem(legacyKey) ?? defaultValue);
      }
      localStorage.removeItem(legacyKey);
    }
  }

  async init() {
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
    this.schedule(() => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent && mainContent.classList.contains('split-mode')) {
        this.applySplitOrientation();
        this.applyToolbarVisibility();
        this.applyPaneOrder();
      }
    }, 100);
    
    this.isActive = true;
  }

  schedule(callback, delay) {
    const timeoutId = setTimeout(() => {
      this.pendingTimeouts.delete(timeoutId);
      if (this.isActive) callback();
    }, delay);
    this.pendingTimeouts.add(timeoutId);
    return timeoutId;
  }

  clearScheduledTasks() {
    for (const timeoutId of this.pendingTimeouts) clearTimeout(timeoutId);
    this.pendingTimeouts.clear();
  }

  addSettingsIntegration() {
    this.migrateLegacySettings();
    
    // Register split orientation setting
    const orientationExtension = {
      get: () => this.getSetting('defaultSplitOrientation', 'vertical'),
      set: (value) => this.setSetting('defaultSplitOrientation', value),
      metadata: {
        name: 'defaultSplitOrientation',
        description: 'Default split orientation setting'
      }
    };
    this.pluginAPI.registerExtension('settings', orientationExtension);

    // Register toolbar visibility setting
    const toolbarExtension = {
      get: () => this.getSetting('horizontalSplitToolbar', 'show'),
      set: (value) => this.setSetting('horizontalSplitToolbar', value),
      metadata: {
        name: 'horizontalSplitToolbar',
        description: 'Markdown toolbar visibility in horizontal split'
      }
    };
    this.pluginAPI.registerExtension('settings', toolbarExtension);

    // Register pane order setting
    const paneOrderExtension = {
      get: () => this.getSetting('horizontalSplitPaneOrder', 'preview-top'),
      set: (value) => this.setSetting('horizontalSplitPaneOrder', value),
      metadata: {
        name: 'horizontalSplitPaneOrder',
        description: 'Pane order in horizontal split mode'
      }
    };
    this.pluginAPI.registerExtension('settings', paneOrderExtension);
  }

  injectSettingsUI() {
    const settingsHost = document.querySelector('[data-plugin-settings-host="horizontal-split-plugin"]');
    if (settingsHost) this.mountSettings(settingsHost);
  }

  mountSettings(settingsHost) {
    if (!settingsHost) return;
    this.settingsSection?.remove();

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

    settingsHost.replaceChildren(this.settingsSection);

    // Add event listeners and update UI
    this.addSettingsListeners();
    this.updateSettingsUI();
  }

  addSettingsListeners() {
    // Orientation buttons
    this.settingsSection?.querySelector('#hsplit-vertical-btn')?.addEventListener('click', () => {
      this.setSetting('defaultSplitOrientation', 'vertical');
      this.updateSettingsUI();
      this.updateDropdownOptions();
    });
    this.settingsSection?.querySelector('#hsplit-horizontal-btn')?.addEventListener('click', () => {
      this.setSetting('defaultSplitOrientation', 'horizontal');
      this.updateSettingsUI();
      this.updateDropdownOptions();
    });

    // Toolbar buttons
    this.settingsSection?.querySelector('#hsplit-toolbar-show-btn')?.addEventListener('click', () => {
      this.setSetting('horizontalSplitToolbar', 'show');
      this.updateSettingsUI();
      this.schedule(() => this.applyToolbarVisibility(), 50);
    });
    this.settingsSection?.querySelector('#hsplit-toolbar-hide-btn')?.addEventListener('click', () => {
      this.setSetting('horizontalSplitToolbar', 'hide');
      this.updateSettingsUI();
      this.schedule(() => this.applyToolbarVisibility(), 50);
    });

    // Pane order buttons
    this.settingsSection?.querySelector('#hsplit-preview-top-btn')?.addEventListener('click', () => {
      this.setSetting('horizontalSplitPaneOrder', 'preview-top');
      this.updateSettingsUI();
      this.applyPaneOrder();
    });
    this.settingsSection?.querySelector('#hsplit-code-top-btn')?.addEventListener('click', () => {
      this.setSetting('horizontalSplitPaneOrder', 'code-top');
      this.updateSettingsUI();
      this.applyPaneOrder();
    });
  }

  updateSettingsUI() {
    // Update orientation buttons
    const orientation = this.getSetting('defaultSplitOrientation', 'vertical');
    this.settingsSection?.querySelector('#hsplit-vertical-btn')?.classList.toggle('active', orientation === 'vertical');
    this.settingsSection?.querySelector('#hsplit-horizontal-btn')?.classList.toggle('active', orientation === 'horizontal');

    // Update toolbar buttons
    const toolbar = this.getSetting('horizontalSplitToolbar', 'show');
    this.settingsSection?.querySelector('#hsplit-toolbar-show-btn')?.classList.toggle('active', toolbar === 'show');
    this.settingsSection?.querySelector('#hsplit-toolbar-hide-btn')?.classList.toggle('active', toolbar === 'hide');

    // Update pane order buttons
    const paneOrder = this.getSetting('horizontalSplitPaneOrder', 'preview-top');
    this.settingsSection?.querySelector('#hsplit-preview-top-btn')?.classList.toggle('active', paneOrder === 'preview-top');
    this.settingsSection?.querySelector('#hsplit-code-top-btn')?.classList.toggle('active', paneOrder === 'code-top');
  }

  hookSplitButton() {
    const splitButton = document.getElementById('split-btn');
    if (!splitButton) {
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
    this.schedule(() => {
      this.applySplitOrientation();
      this.applyToolbarVisibility();
    }, 100);
  }

  createDropdownUI() {
    const splitButton = document.getElementById('split-btn');
    if (!splitButton) {
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
    
    // Close dropdown when clicking outside. Registering the cleanup with the
    // scoped plugin API prevents a disabled plugin retaining the menu in memory.
    const closeDropdown = () => {
      dropdownMenu.style.display = 'none';
    };
    document.addEventListener('click', closeDropdown);
    this.pluginAPI.registerCleanup(() => document.removeEventListener('click', closeDropdown));
  }

  handleOrientationChange(orientation) {
    this.setSetting('defaultSplitOrientation', orientation);
    
    const splitButton = document.getElementById('split-btn');
    if (splitButton) {
      splitButton.click();
      this.schedule(() => {
        this.applySplitOrientation();
        this.applyToolbarVisibility();
        this.updateDropdownOptions();
      }, 100);
    }
  }
  
  updateDropdownOptions() {
    const dropdownMenu = document.getElementById('split-orientation-menu');
    if (!dropdownMenu) return;
    
    const currentOrientation = this.getSetting('defaultSplitOrientation', 'vertical');
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
    // Mode changes are controller events. The scoped subscription is removed
    // automatically when this plugin is disabled.
    this.pluginAPI.on('mode', 'mode-changed', (data) => {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;
      
      if (data && data.mode === 'split') {
        this.applySplitOrientation();
        this.applyToolbarVisibility();
        this.applyPaneOrder();
        this.updateDropdownOptions();
      } else {
        // Save horizontal state before clearing
        this.wasHorizontal = mainContent?.classList.contains('split-horizontal');
        this.clearSplitStyles();
        this.clearToolbarVisibility();
        this.updateDropdownOptions();
      }
    });
    
    // Listen for settings changes
    this.pluginAPI.on('settings', 'settings-changed', (data) => {
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
    
    // Listen for centered layout toggle
    const centeredBtn = document.querySelector('[data-setting="centered-layout"]');
    if (centeredBtn) {
      const handleCenteredLayout = () => {
        this.schedule(() => {
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
      };
      centeredBtn.addEventListener('click', handleCenteredLayout);
      this.pluginAPI.registerCleanup(() => centeredBtn.removeEventListener('click', handleCenteredLayout));
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
          this.schedule(() => this.applySplitOrientation(), 100);
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    this.distractionObserver = observer;
    this.pluginAPI.registerCleanup(() => observer.disconnect());
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
    const orientation = this.getSetting('defaultSplitOrientation', 'vertical');
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
        this.schedule(() => this.restorePaneSizes(), 100);
      } else {
        mainContent.classList.remove('split-horizontal', 'code-top');
        mainContent.classList.remove('horizontal-toolbar-hidden');
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
    const toolbarSetting = this.getSetting('horizontalSplitToolbar', 'show');
    const mainContent = document.querySelector('.main-content');

    if (!mainContent) return;
    const isHorizontalSplit = mainContent.classList.contains('split-mode')
      && mainContent.classList.contains('split-horizontal');
    mainContent.classList.toggle(
      'horizontal-toolbar-hidden',
      isHorizontalSplit && toolbarSetting === 'hide'
    );
  }
  
  clearToolbarVisibility() {
    document.body.classList.remove('horizontal-split-hide-toolbar');
    document.querySelector('.main-content')?.classList.remove('horizontal-toolbar-hidden');
  }
  
  applyPaneOrder() {
    const paneOrder = this.getSetting('horizontalSplitPaneOrder', 'preview-top');
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
    if (!splitter || this.resizeCleanupRegistered) return;
    this.resizeCleanupRegistered = true;
    
    let isResizing = false;
    
    const handleMouseDown = (e) => {
      if (!document.querySelector('.main-content.split-horizontal')) return;
      isResizing = true;
      e.preventDefault();
    };
    
    const handleMouseMove = (e) => {
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
    };
    
    const handleMouseUp = () => {
      isResizing = false;
    };

    splitter.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    this.pluginAPI.registerCleanup(() => {
      splitter.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this.resizeCleanupRegistered = false;
    });
  }

  injectCSS() {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = HORIZONTAL_SPLIT_CSS;
    document.head.appendChild(this.styleElement);
  }

  async destroy() {
    this.isActive = false;
    this.clearScheduledTasks();

    // Restore original Split button behavior
    const splitButton = document.getElementById('split-btn');
    if (splitButton) {
      splitButton.onclick = this.originalSplitHandler || null;
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
    
    // Remove settings integration
    this.pluginAPI.unregisterExtension('settings', 'defaultSplitOrientation');
    this.pluginAPI.unregisterExtension('settings', 'horizontalSplitToolbar');
    this.pluginAPI.unregisterExtension('settings', 'horizontalSplitPaneOrder');
    
  }

  resetConfig() {
    HorizontalSplitPlugin.resetConfig();
  }
}

// Plugin metadata
HorizontalSplitPlugin.metadata = horizontalSplitMetadata;

export { HorizontalSplitPlugin };
export default HorizontalSplitPlugin;
