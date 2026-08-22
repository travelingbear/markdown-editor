import { RetroSoundPlayer } from '../../audio/RetroSoundPlayer.js';

/**
 * UI Controller - Manages UI state, themes, modals, and layout
 * Extracted from MarkdownEditor for better separation of concerns
 */
class UIController extends BaseComponent {
  constructor(options = {}) {
    super('UIController', options);
    
    // Theme state
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.isRetroTheme = localStorage.getItem('markdownViewer_retroTheme') === 'true';
    
    // Layout state
    this.isDistractionFree = false;
    this.centeredLayoutEnabled = localStorage.getItem('markdownViewer_centeredLayout') === 'true';
    this.isToolbarEnabled = localStorage.getItem('markdownViewer_toolbarEnabled') !== 'false';
    this.currentPageSize = localStorage.getItem('markdownViewer_pageSize') || 'a4';
    this.pinnedTabsEnabled = localStorage.getItem('markdownViewer_pinnedTabs') === 'true';
    
    // Toolbar sizes
    this.mainToolbarSize = localStorage.getItem('markdownViewer_mainToolbarSize') || 'medium';
    this.mdToolbarSize = localStorage.getItem('markdownViewer_mdToolbarSize') || 'medium';
    this.statusBarSize = localStorage.getItem('markdownViewer_statusBarSize') || 'medium';
    
    // Splash settings
    this.isSplashEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration') || '1');
    
    // Other settings
    this.defaultMode = localStorage.getItem('markdownViewer_defaultMode') || 'preview';
    this.retroSoundPlayer = new RetroSoundPlayer();
    this.modalDomListeners = [];
  }

  async onInit() {
    this.setupModalEventHandlers();
    await this.applyInitialSettings();
    this.setupExtensionPoints();
  }

  setupExtensionPoints() {
    // Theme extension points
    this.addHook('beforeThemeToggle', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.beforeThemeToggle) {
          await ext.instance.beforeThemeToggle(data);
        }
      }
    });

    this.addHook('afterThemeToggle', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.afterThemeToggle) {
          await ext.instance.afterThemeToggle(data);
        }
      }
    });

    this.addHook('beforeThemeChange', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.beforeThemeChange) {
          await ext.instance.beforeThemeChange(data);
        }
      }
    });

    this.addHook('afterThemeChange', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.afterThemeChange) {
          await ext.instance.afterThemeChange(data);
        }
      }
    });
  }

  // Theme Management
  toggleTheme() {
    // Define rotation order for extensibility
    const THEME_ROTATION = ['light', 'dark'];
    
    // Get current theme from localStorage (always fresh)
    const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    const isRetro = localStorage.getItem('markdownViewer_retroTheme') === 'true';
    
    this.executeHook('beforeThemeToggle', { currentTheme, isRetroTheme: isRetro });
    
    // Simple rotation logic: cycle through THEME_ROTATION, non-rotation themes go to light
    let newTheme;
    if (!isRetro && THEME_ROTATION.includes(currentTheme)) {
      const currentIndex = THEME_ROTATION.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % THEME_ROTATION.length;
      newTheme = THEME_ROTATION[nextIndex];
    } else {
      // Any non-rotation theme (retro, contrast, etc.) goes to light
      newTheme = 'light';
    }
    
    // Use setTheme() method for consistent DOM manipulation
    this.setTheme(newTheme, false);
    
    this.executeHook('afterThemeToggle', { theme: this.theme, isRetroTheme: this.isRetroTheme });
    
    return { theme: this.theme, isRetroTheme: this.isRetroTheme };
  }

  async setTheme(theme, isRetro = false) {
    this.executeHook('beforeThemeChange', { oldTheme: this.theme, newTheme: theme, oldRetro: this.isRetroTheme, newRetro: isRetro });
    
    // Update internal state
    this.theme = theme;
    this.isRetroTheme = isRetro;
    
    // Update localStorage
    localStorage.setItem('markdownViewer_defaultTheme', this.theme);
    localStorage.setItem('markdownViewer_retroTheme', this.isRetroTheme.toString());
    
    // Apply theme using StyleManager for dynamic loading
    document.body.classList.remove('light-theme', 'dark-theme', 'contrast-theme', 'retro-theme');
    
    if (this.isRetroTheme) {
      document.body.classList.add('retro-theme');
      await this.playRetroStartupSound();
      // Load retro theme dynamically
      if (window.styleManager) {
        await window.styleManager.loadTheme('retro');
      }
    } else {
      document.body.classList.add(`${this.theme}-theme`);
      // Load theme dynamically if not light
      if (window.styleManager && this.theme !== 'light') {
        await window.styleManager.loadTheme(this.theme);
      }
    }
    
    document.body.setAttribute('data-theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    
    this.executeHook('afterThemeChange', { theme: this.theme, isRetroTheme: this.isRetroTheme });
    this.emit('theme-changed', { theme: this.theme, isRetroTheme: this.isRetroTheme });
  }



  // Distraction-Free Mode
  toggleDistractionFree() {
    if (this.isDistractionFree) {
      this.exitDistractionFree();
    } else {
      this.enterDistractionFree();
    }
    return this.isDistractionFree;
  }

  enterDistractionFree() {
    this.isDistractionFree = true;
    document.body.classList.add('distraction-free');
    this.emit('distraction-free-changed', { isDistractionFree: true });
  }

  exitDistractionFree() {
    this.isDistractionFree = false;
    document.body.classList.remove('distraction-free');
    this.emit('distraction-free-changed', { isDistractionFree: false });
  }

  // Layout Management
  setCenteredLayout(enabled) {
    this.centeredLayoutEnabled = enabled;
    localStorage.setItem('markdownViewer_centeredLayout', enabled.toString());
    this.applyCenteredLayout();
  }

  applyCenteredLayout() {
    if (this.centeredLayoutEnabled) {
      document.body.classList.add('centered-layout');
    } else {
      document.body.classList.remove('centered-layout');
    }
  }

  setPageSize(pageSize) {
    this.currentPageSize = pageSize;
    localStorage.setItem('markdownViewer_pageSize', pageSize);
    this.applyPageSize();
  }

  applyPageSize() {
    const pageSizeMap = {
      'a4': 'var(--page-width-a4)',
      'letter': 'var(--page-width-letter)',
      'a3': 'var(--page-width-a3)'
    };
    
    const pageWidth = pageSizeMap[this.currentPageSize] || 'var(--page-width-a4)';
    document.documentElement.style.setProperty('--current-page-width', pageWidth);
  }

  setToolbarEnabled(enabled) {
    this.isToolbarEnabled = enabled;
    localStorage.setItem('markdownViewer_toolbarEnabled', enabled.toString());
    this.applyMarkdownToolbarVisibility();
  }

  applyMarkdownToolbarVisibility() {
    const markdownToolbar = document.getElementById('markdown-toolbar');
    if (markdownToolbar) {
      if (this.isToolbarEnabled) {
        markdownToolbar.classList.add('visible');
        markdownToolbar.style.display = '';
      } else {
        markdownToolbar.classList.remove('visible');
        markdownToolbar.style.display = 'none';
      }
    }
  }

  setPinnedTabsEnabled(enabled) {
    this.pinnedTabsEnabled = enabled;
    localStorage.setItem('markdownViewer_pinnedTabs', enabled.toString());
    this.applyPinnedTabsVisibility();
  }

  applyPinnedTabsVisibility() {
    const pinnedTabsBar = document.getElementById('pinned-tabs-bar');
    if (pinnedTabsBar) {
      pinnedTabsBar.style.display = this.pinnedTabsEnabled ? 'flex' : 'none';
    }
  }

  setToolbarSizes(mainSize, mdSize, statusSize) {
    if (mainSize) {
      this.mainToolbarSize = mainSize;
      localStorage.setItem('markdownViewer_mainToolbarSize', mainSize);
      document.body.setAttribute('data-main-toolbar-size', mainSize);
    }
    
    if (mdSize) {
      this.mdToolbarSize = mdSize;
      localStorage.setItem('markdownViewer_mdToolbarSize', mdSize);
      document.body.setAttribute('data-md-toolbar-size', mdSize);
    }
    
    if (statusSize) {
      this.statusBarSize = statusSize;
      localStorage.setItem('markdownViewer_statusBarSize', statusSize);
      document.body.setAttribute('data-status-bar-size', statusSize);
    }
  }

  // Modal Management
  async showSettings() {
    // Load settings modal CSS
    if (window.styleManager) {
      await window.styleManager.loadSettingsModal();
    }
    
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'flex';
      this.updateSettingsDisplay();
      this.emit('settings-shown');
    }
  }
  
  hideSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'none';
    }
  }

  showHelp() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.style.display = 'flex';
    }
  }
  
  hideHelp() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.style.display = 'none';
    }
  }
  
  showAbout() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
      aboutModal.style.display = 'flex';
    }
  }
  
  hideAbout() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
      aboutModal.style.display = 'none';
    }
  }

  // Settings Management
  setSetting(key, value) {
    switch (key) {
      case 'theme':
        this.setTheme(value);
        break;
      case 'retroTheme':
        this.setTheme(this.theme, value);
        break;
      case 'defaultMode':
        this.defaultMode = value;
        localStorage.setItem('markdownViewer_defaultMode', value);
        break;
      case 'centeredLayout':
        this.setCenteredLayout(value);
        break;
      case 'toolbarEnabled':
        this.setToolbarEnabled(value);
        break;
      case 'pinnedTabs':
        this.setPinnedTabsEnabled(value);
        break;
      case 'splashEnabled':
        this.isSplashEnabled = value;
        localStorage.setItem('markdownViewer_splashEnabled', value.toString());
        break;
      case 'splashDuration':
        this.splashDuration = value;
        localStorage.setItem('markdownViewer_splashDuration', value.toString());
        break;
      case 'pageSize':
        this.setPageSize(value);
        break;
    }
  }

  async applyInitialSettings() {
    // Apply theme
    await this.setTheme(this.theme, this.isRetroTheme);
    
    // Apply centered layout
    this.applyCenteredLayout();
    
    // Apply page size
    this.applyPageSize();
    
    // Apply markdown toolbar visibility
    this.applyMarkdownToolbarVisibility();
    
    // Apply toolbar sizes
    document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
    document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
    document.body.setAttribute('data-status-bar-size', this.statusBarSize);
    
    // Apply pinned tabs visibility
    this.applyPinnedTabsVisibility();
  }

  setupModalEventHandlers() {
    // Settings modal
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const settingsOverlay = document.querySelector('.settings-overlay');
    if (settingsCloseBtn) {
      this.addModalListener(settingsCloseBtn, () => this.hideSettings());
    }
    if (settingsOverlay) {
      this.addModalListener(settingsOverlay, () => this.hideSettings());
    }
    
    // Help modal
    const helpCloseBtn = document.getElementById('help-close-btn');
    const helpOverlay = document.querySelector('.help-overlay');
    if (helpCloseBtn) {
      this.addModalListener(helpCloseBtn, () => this.hideHelp());
    }
    if (helpOverlay) {
      this.addModalListener(helpOverlay, () => this.hideHelp());
    }
    
    // About modal
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const aboutOverlay = document.querySelector('.about-overlay');
    if (aboutCloseBtn) {
      this.addModalListener(aboutCloseBtn, () => this.hideAbout());
    }
    if (aboutOverlay) {
      this.addModalListener(aboutOverlay, () => this.hideAbout());
    }
  }

  addModalListener(element, handler) {
    element.addEventListener('click', handler);
    this.modalDomListeners.push({ element, handler });
  }

  updateSettingsDisplay() {
    // Theme buttons
    const themeButtons = {
      'theme-light-btn': this.theme === 'light' && !this.isRetroTheme,
      'theme-dark-btn': this.theme === 'dark' && !this.isRetroTheme,
      'theme-retro-btn': this.isRetroTheme,
      'theme-contrast-btn': this.theme === 'contrast' && !this.isRetroTheme
    };
    
    Object.entries(themeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Show/hide retro sound setting
    const retroSoundSetting = document.querySelector('.retro-sound-setting');
    if (retroSoundSetting) {
      retroSoundSetting.style.display = this.isRetroTheme ? 'flex' : 'none';
    }
    
    // Update retro sound checkbox
    const retroSoundCheckbox = document.getElementById('retro-sound-checkbox');
    if (retroSoundCheckbox) {
      const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
      retroSoundCheckbox.checked = soundEnabled;
    }
    
    // Mode buttons
    const modeButtons = {
      'mode-code-btn': this.defaultMode === 'code',
      'mode-preview-btn': this.defaultMode === 'preview',
      'mode-split-btn': this.defaultMode === 'split'
    };
    
    Object.entries(modeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // All other settings
    const allSettings = {
      'layout-on-btn': this.centeredLayoutEnabled,
      'layout-off-btn': !this.centeredLayoutEnabled,
      'toolbar-on-btn': this.isToolbarEnabled,
      'toolbar-off-btn': !this.isToolbarEnabled,
      'pinned-tabs-on-btn': this.pinnedTabsEnabled,
      'pinned-tabs-off-btn': !this.pinnedTabsEnabled,
      'splash-on-btn': this.isSplashEnabled,
      'splash-off-btn': !this.isSplashEnabled
    };
    
    Object.entries(allSettings).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Splash duration buttons
    for (let i = 1; i <= 5; i++) {
      const btn = document.getElementById(`splash-${i}s-btn`);
      if (btn) {
        btn.classList.toggle('active', this.splashDuration === i);
      }
    }
    
    // Show/hide splash duration setting
    const durationSetting = document.getElementById('splash-duration-setting');
    if (durationSetting) {
      durationSetting.style.display = this.isSplashEnabled ? 'flex' : 'none';
    }
    
    // Page size buttons
    const pageSizeButtons = {
      'page-a4-btn': this.currentPageSize === 'a4',
      'page-letter-btn': this.currentPageSize === 'letter',
      'page-a3-btn': this.currentPageSize === 'a3'
    };
    
    Object.entries(pageSizeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Show/hide page size section based on centered layout setting
    const pageA4Btn = document.getElementById('page-a4-btn');
    if (pageA4Btn) {
      const pageSizeSetting = pageA4Btn.closest('.setting-item');
      if (pageSizeSetting) {
        pageSizeSetting.style.display = this.centeredLayoutEnabled ? 'flex' : 'none';
      }
    }
    
    // Toolbar size buttons
    const toolbarSizeButtons = {
      'main-toolbar-small': this.mainToolbarSize === 'small',
      'main-toolbar-medium': this.mainToolbarSize === 'medium',
      'main-toolbar-large': this.mainToolbarSize === 'large',
      'md-toolbar-small': this.mdToolbarSize === 'small',
      'md-toolbar-medium': this.mdToolbarSize === 'medium',
      'md-toolbar-large': this.mdToolbarSize === 'large',
      'status-bar-small': this.statusBarSize === 'small',
      'status-bar-medium': this.statusBarSize === 'medium',
      'status-bar-large': this.statusBarSize === 'large'
    };
    
    Object.entries(toolbarSizeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
  }

  async playRetroStartupSound() {
    const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
    if (!soundEnabled) return;
    
    try {
      await this.retroSoundPlayer.play();
    } catch (error) {
      console.warn('[UIController] Retro sound failed:', error);
    }
  }

  onDestroy() {
    this.modalDomListeners.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.modalDomListeners = [];
    this.retroSoundPlayer.dispose().catch((error) => {
      console.warn('[UIController] Failed to release Retro audio:', error);
    });
  }

  // Getters for current state
  getTheme() {
    return { theme: this.theme, isRetroTheme: this.isRetroTheme };
  }

  getLayoutSettings() {
    return {
      centeredLayout: this.centeredLayoutEnabled,
      toolbarEnabled: this.isToolbarEnabled,
      pinnedTabs: this.pinnedTabsEnabled,
      pageSize: this.currentPageSize,
      mainToolbarSize: this.mainToolbarSize,
      mdToolbarSize: this.mdToolbarSize,
      statusBarSize: this.statusBarSize
    };
  }

  getSettings() {
    return {
      theme: this.theme,
      isRetroTheme: this.isRetroTheme,
      defaultMode: this.defaultMode,
      centeredLayoutEnabled: this.centeredLayoutEnabled,
      isToolbarEnabled: this.isToolbarEnabled,
      pinnedTabsEnabled: this.pinnedTabsEnabled,
      isSplashEnabled: this.isSplashEnabled,
      splashDuration: this.splashDuration,
      currentPageSize: this.currentPageSize,
      mainToolbarSize: this.mainToolbarSize,
      mdToolbarSize: this.mdToolbarSize,
      statusBarSize: this.statusBarSize
    };
  }

  // Extension API methods
  addUIExtension(name, extension) {
    this.registerExtension(name, extension);
    if (extension.activate) {
      this.extensionAPI.activate(name);
    }
  }

  removeUIExtension(name) {
    return this.unregisterExtension(name);
  }
}

// Export for use in other components
window.UIController = UIController;
