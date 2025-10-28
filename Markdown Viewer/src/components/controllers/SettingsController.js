/**
 * Settings Controller - Manages application settings and persistence
 */
class SettingsController extends BaseComponent {
  constructor(options = {}) {
    super('SettingsController', options);
    
    // Settings state
    this.theme = 'light';
    this.isRetroTheme = false;
    this.defaultMode = 'preview';
    this.suggestionsEnabled = true;
    this.centeredLayoutEnabled = false;
    this.isToolbarEnabled = true;
    this.pinnedTabsEnabled = false;
    this.isSplashEnabled = true;
    this.splashDuration = 2;
    this.currentPageSize = 'a4';
    this.mainToolbarSize = 'medium';
    this.mdToolbarSize = 'medium';
    this.statusBarSize = 'medium';
    this.pluginsEnabled = true;
    this.animationsEnabled = true;
    
    // Performance tracking
    this.startupTime = 0;
    this.lastFileOpenTime = 0;
    this.lastModeSwitchTime = 0;
    
    // Track if this is initial startup
    this.isInitialStartup = true;
  }

  async onInit() {
    this.loadSettings();
    this.setupSettingsControls();
    // Ensure settings display is updated after initialization
    setTimeout(() => this.updateSettingsDisplay(), 100);
  }

  loadSettings() {
    // Load theme settings
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.isRetroTheme = localStorage.getItem('markdownViewer_retroTheme') === 'true';
    
    // Load UI settings
    this.defaultMode = localStorage.getItem('markdownViewer_defaultMode') || 'preview';
    this.suggestionsEnabled = localStorage.getItem('markdownViewer_suggestionsEnabled') !== 'false';
    this.centeredLayoutEnabled = localStorage.getItem('markdownViewer_centeredLayout') === 'true';
    this.isToolbarEnabled = localStorage.getItem('markdownViewer_toolbarEnabled') !== 'false';
    this.pinnedTabsEnabled = localStorage.getItem('markdownViewer_pinnedTabs') === 'true';
    this.isSplashEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration')) || 2;
    this.currentPageSize = localStorage.getItem('markdownViewer_pageSize') || 'a4';
    this.mainToolbarSize = localStorage.getItem('markdownViewer_mainToolbarSize') || 'medium';
    this.mdToolbarSize = localStorage.getItem('markdownViewer_mdToolbarSize') || 'medium';
    this.statusBarSize = localStorage.getItem('markdownViewer_statusBarSize') || 'medium';
    this.pluginsEnabled = localStorage.getItem('markdownViewer_pluginsEnabled') !== 'false';
    this.animationsEnabled = localStorage.getItem('markdownViewer_animationsEnabled') !== 'false';
  }

  applySettings() {
    this.applyTheme();
    this.applyCenteredLayout();
    this.applyMarkdownToolbarVisibility();
    this.applyPinnedTabsVisibility();
    this.applyPageSize();
    this.applyToolbarSizes();
    this.applyAnimationsEnabled();
    
    // Play retro sound only once during initial startup if retro theme is enabled
    if (this.isInitialStartup && this.isRetroTheme) {
      this.playRetroStartupSound();
    }
    
    // Mark startup as complete
    this.isInitialStartup = false;
  }

  applyTheme() {
    document.body.classList.remove('light-theme', 'dark-theme', 'contrast-theme', 'retro-theme');
    
    if (this.isRetroTheme) {
      document.body.classList.add('retro-theme');
    } else {
      document.body.classList.add(`${this.theme}-theme`);
    }
    
    document.body.setAttribute('data-theme', this.theme);
  }

  applyCenteredLayout() {
    document.body.classList.toggle('centered-layout', this.centeredLayoutEnabled);
  }

  applyMarkdownToolbarVisibility() {
    const markdownToolbar = document.querySelector('.markdown-toolbar');
    if (markdownToolbar) {
      markdownToolbar.style.display = this.isToolbarEnabled ? 'flex' : 'none';
    }
  }

  applyPinnedTabsVisibility() {
    const pinnedTabsBar = document.getElementById('pinned-tabs-bar');
    if (pinnedTabsBar) {
      pinnedTabsBar.style.display = this.pinnedTabsEnabled ? 'flex' : 'none';
    }
  }

  applyPageSize() {
    document.body.setAttribute('data-page-size', this.currentPageSize);
  }

  applyToolbarSizes() {
    document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
    document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
    document.body.setAttribute('data-status-bar-size', this.statusBarSize);
  }

  applyAnimationsEnabled() {
    if (this.animationsEnabled) {
      document.body.classList.remove('animations-disabled');
    } else {
      document.body.classList.add('animations-disabled');
    }
  }

  updateSettingsDisplay() {
    this.updateSystemInfo();
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
    
    // Update mode buttons
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
    
    // Update all other settings buttons
    const allSettings = {
      'suggestions-on-btn': this.suggestionsEnabled,
      'suggestions-off-btn': !this.suggestionsEnabled,
      'layout-on-btn': this.centeredLayoutEnabled,
      'layout-off-btn': !this.centeredLayoutEnabled,
      'toolbar-on-btn': this.isToolbarEnabled,
      'toolbar-off-btn': !this.isToolbarEnabled,
      'pinned-tabs-on-btn': this.pinnedTabsEnabled,
      'pinned-tabs-off-btn': !this.pinnedTabsEnabled,
      'splash-on-btn': this.isSplashEnabled,
      'splash-off-btn': !this.isSplashEnabled,
      'plugins-on-btn': this.pluginsEnabled,
      'plugins-off-btn': !this.pluginsEnabled,
      'animations-on-btn': this.animationsEnabled,
      'animations-off-btn': !this.animationsEnabled
    };
    
    Object.entries(allSettings).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Update splash duration buttons
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
    
    // Update page size buttons and visibility
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
    
    // Show/hide centered layout info icon
    const centeredLayoutInfo = document.getElementById('centered-layout-info');
    if (centeredLayoutInfo) {
      centeredLayoutInfo.style.display = this.centeredLayoutEnabled ? 'inline' : 'none';
    }
    
    // Update toolbar size buttons
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

  updatePerformanceDashboard(performanceOptimizer, tabManager) {
    if (performanceOptimizer) {
      performanceOptimizer.updatePerformanceDashboard();
    } else {
      // Fallback: Update performance info manually if optimizer not available
      const tabCount = tabManager ? tabManager.getTabsCount() : 0;
      const performanceInfo = {
        'perf-tab-count': `${tabCount} (0 virtual)`,
        'perf-memory': this.getMemoryUsage(),
        'perf-startup': this.startupTime ? `${this.startupTime.toFixed(2)}ms` : 'N/A',
        'perf-tab-switch': this.lastModeSwitchTime ? `${this.lastModeSwitchTime.toFixed(2)}ms` : 'N/A'
      };
      
      Object.entries(performanceInfo).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });
      
      // Update performance status
      const perfStatus = document.getElementById('perf-status');
      if (perfStatus) {
        let status = 'Good';
        let statusClass = 'status-good';
        
        if (tabCount > 50) {
          status = 'Warning';
          statusClass = 'status-warning';
        }
        if (tabCount > 100) {
          status = 'Critical';
          statusClass = 'status-critical';
        }
        
        perfStatus.textContent = status;
        perfStatus.className = statusClass;
      }
    }
  }

  updateSystemInfo(editorComponent = null, previewComponent = null, currentMode = null) {
    // Use stored references if not provided
    if (!editorComponent || !previewComponent || !currentMode) {
      // Will be called from MarkdownEditor with proper references
      return;
    }
    const systemInfo = {
      'info-default-mode': this.defaultMode,
      'info-current-mode': currentMode || 'preview',
      'info-monaco': (editorComponent && editorComponent.isMonacoLoaded === true) ? 'Loaded' : 'Not Loaded',
      'info-mermaid': (previewComponent && previewComponent.mermaidInitialized === true) ? 'Loaded' : 'Not Loaded',
      'info-katex': (previewComponent && previewComponent.katexInitialized === true) ? 'Loaded' : 'Not Loaded'
    };
    
    Object.entries(systemInfo).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  getMemoryUsage() {
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      return `${used}MB / ${total}MB`;
    }
    return 'Not Available';
  }

  async playRetroStartupSound() {
    const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch('assets/windows95_startup_hifi.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = 0.5;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('[SettingsController] Retro sound failed:', error);
    }
  }

  setupSettingsControls() {
    // Theme controls
    const themeBtns = ['theme-light-btn', 'theme-dark-btn', 'theme-retro-btn', 'theme-contrast-btn'];
    themeBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          if (id === 'theme-light-btn') {
            this.theme = 'light';
            this.isRetroTheme = false;
            document.body.classList.remove('retro-theme');
          } else if (id === 'theme-dark-btn') {
            this.theme = 'dark';
            this.isRetroTheme = false;
            document.body.classList.remove('retro-theme');
          } else if (id === 'theme-contrast-btn') {
            this.theme = 'contrast';
            this.isRetroTheme = false;
            document.body.classList.remove('retro-theme');
          } else {
            this.theme = 'light';
            this.isRetroTheme = true;
            document.body.classList.add('retro-theme');
          }
          localStorage.setItem('markdownViewer_defaultTheme', this.theme);
          localStorage.setItem('markdownViewer_retroTheme', this.isRetroTheme.toString());
          this.applyTheme();
          
          this.emit('theme-changed', { theme: this.theme, isRetroTheme: this.isRetroTheme });
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Mode controls
    ['mode-code-btn', 'mode-preview-btn', 'mode-split-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          const mode = id.replace('mode-', '').replace('-btn', '');
          this.defaultMode = mode;
          localStorage.setItem('markdownViewer_defaultMode', mode);
          this.updateSettingsDisplay();
          this.emit('settings-changed');
        });
      }
    });
    
    // Retro sound controls
    const retroSoundCheckbox = document.getElementById('retro-sound-checkbox');
    const testSoundBtn = document.getElementById('test-startup-sound-btn');
    
    if (retroSoundCheckbox) {
      retroSoundCheckbox.addEventListener('change', (e) => {
        localStorage.setItem('markdownViewer_retroSound', e.target.checked.toString());
      });
    }
    
    if (testSoundBtn) {
      testSoundBtn.addEventListener('click', () => {
        this.playRetroStartupSound();
      });
    }
    
    // Suggestions controls
    ['suggestions-on-btn', 'suggestions-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.suggestionsEnabled = id === 'suggestions-on-btn';
          localStorage.setItem('markdownViewer_suggestionsEnabled', this.suggestionsEnabled.toString());
          this.emit('suggestions-changed', { enabled: this.suggestionsEnabled });
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Layout controls
    ['layout-on-btn', 'layout-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.centeredLayoutEnabled = id === 'layout-on-btn';
          localStorage.setItem('markdownViewer_centeredLayout', this.centeredLayoutEnabled.toString());
          this.applyCenteredLayout();
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Toolbar controls
    ['toolbar-on-btn', 'toolbar-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.isToolbarEnabled = id === 'toolbar-on-btn';
          localStorage.setItem('markdownViewer_toolbarEnabled', this.isToolbarEnabled.toString());
          this.applyMarkdownToolbarVisibility();
          this.emit('toolbar-enabled-changed', { enabled: this.isToolbarEnabled });
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Pinned tabs controls
    ['pinned-tabs-on-btn', 'pinned-tabs-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.pinnedTabsEnabled = id === 'pinned-tabs-on-btn';
          localStorage.setItem('markdownViewer_pinnedTabs', this.pinnedTabsEnabled.toString());
          this.applyPinnedTabsVisibility();
          this.emit('pinned-tabs-changed', { enabled: this.pinnedTabsEnabled });
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Splash controls
    ['splash-on-btn', 'splash-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.isSplashEnabled = id === 'splash-on-btn';
          localStorage.setItem('markdownViewer_splashEnabled', this.isSplashEnabled.toString());
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Splash duration controls
    for (let i = 1; i <= 5; i++) {
      const btn = document.getElementById(`splash-${i}s-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.splashDuration = i;
          localStorage.setItem('markdownViewer_splashDuration', i.toString());
          this.updateSettingsDisplay();
        });
      }
    }
    
    // Page size controls
    ['page-a4-btn', 'page-letter-btn', 'page-a3-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.currentPageSize = id.replace('page-', '').replace('-btn', '');
          localStorage.setItem('markdownViewer_pageSize', this.currentPageSize);
          this.applyPageSize();
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Toolbar size controls
    ['main-toolbar-small', 'main-toolbar-medium', 'main-toolbar-large'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.mainToolbarSize = id.replace('main-toolbar-', '');
          localStorage.setItem('markdownViewer_mainToolbarSize', this.mainToolbarSize);
          document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
          this.updateSettingsDisplay();
        });
      }
    });
    
    ['md-toolbar-small', 'md-toolbar-medium', 'md-toolbar-large'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.mdToolbarSize = id.replace('md-toolbar-', '');
          localStorage.setItem('markdownViewer_mdToolbarSize', this.mdToolbarSize);
          document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
          this.updateSettingsDisplay();
        });
      }
    });
    
    ['status-bar-small', 'status-bar-medium', 'status-bar-large'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.statusBarSize = id.replace('status-bar-', '');
          localStorage.setItem('markdownViewer_statusBarSize', this.statusBarSize);
          document.body.setAttribute('data-status-bar-size', this.statusBarSize);
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Plugin controls
    ['plugins-on-btn', 'plugins-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.pluginsEnabled = id === 'plugins-on-btn';
          localStorage.setItem('markdownViewer_pluginsEnabled', this.pluginsEnabled.toString());
          this.emit('plugins-enabled-changed', { enabled: this.pluginsEnabled });
          this.updateSettingsDisplay();
          
          // Show restart warning
          alert('Plugin system changes require a manual restart to take effect. Please restart the application.')
        });
      }
    });
    
    // Animation controls
    ['animations-on-btn', 'animations-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.animationsEnabled = id === 'animations-on-btn';
          localStorage.setItem('markdownViewer_animationsEnabled', this.animationsEnabled.toString());
          this.applyAnimationsEnabled();
          this.emit('animations-enabled-changed', { enabled: this.animationsEnabled });
          this.updateSettingsDisplay();
        });
      }
    });
  }

  // Getters for other components to access settings
  getTheme() {
    return { theme: this.theme, isRetroTheme: this.isRetroTheme };
  }

  getDefaultMode() {
    return this.defaultMode;
  }

  getSuggestionsEnabled() {
    return this.suggestionsEnabled;
  }

  getToolbarEnabled() {
    return this.isToolbarEnabled;
  }

  getPinnedTabsEnabled() {
    return this.pinnedTabsEnabled;
  }
  
  getPluginsEnabled() {
    return this.pluginsEnabled;
  }
  
  getAnimationsEnabled() {
    return this.animationsEnabled;
  }

  // Performance tracking methods
  setStartupTime(time) {
    this.startupTime = time;
  }

  setLastFileOpenTime(time) {
    this.lastFileOpenTime = time;
  }

  setLastModeSwitchTime(time) {
    this.lastModeSwitchTime = time;
  }
}

// Export for use in other components
window.SettingsController = SettingsController;