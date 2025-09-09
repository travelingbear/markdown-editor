/**
 * Markdown Editor - Main Component Orchestrator
 * Manages all components and maintains existing functionality
 */
class MarkdownEditor extends BaseComponent {
  constructor(options = {}) {
    super('MarkdownEditor', options);
    
    // Controller registry for dynamic management
    this.registry = options.registry || new ControllerRegistry();
    
    // Extract controllers from options or set to null for default creation
    this.controllers = options.controllers || {};
    
    // Component instances
    this.documentComponent = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.tabManager = null;
    this.fileController = this.controllers.fileController || null;
    this.uiController = this.controllers.uiController || null;
    this.keyboardController = this.controllers.keyboardController || null;
    this.settingsController = this.controllers.settingsController || null;
    this.tabUIController = this.controllers.tabUIController || null;
    this.modeController = this.controllers.modeController || null;
    this.markdownActionController = this.controllers.markdownActionController || null;
    this.exportController = this.controllers.exportController || null;
    
    // Performance tracking
    this.startupTime = 0;
    this.lastFileOpenTime = 0;
    this.lastModeSwitchTime = 0;
    this.performanceOptimizer = window.PerformanceOptimizer ? new window.PerformanceOptimizer() : null;
    
    // Status bar elements
    this.cursorPos = null;
    this.filename = null;
  }

  async onInit() {
    const startupStartTime = performance.now();
    
    try {
      // Initialize performance optimizer early
      if (this.performanceOptimizer) {
        this.performanceOptimizer.detectOlderHardware();
        this.performanceOptimizer.optimizeForMultiTabs();
      }
      
      // Update splash screen progress
      this.updateSplashProgress(10, 'Initializing components...');
      
      // Initialize DOM elements
      this.initializeElements();
      
      this.updateSplashProgress(25, 'Creating components...');
      
      // Create and initialize components
      await this.createComponents();
      
      this.updateSplashProgress(50, 'Setting up communication...');
      
      // Set up inter-component communication
      this.setupComponentCommunication();
      
      this.updateSplashProgress(70, 'Applying settings...');
      
      // Apply initial settings
      this.applyInitialSettings();
      
      this.updateSplashProgress(85, 'Setting up event handlers...');
      
      // Set up global event handlers
      this.setupGlobalEventHandlers();
      
      this.updateSplashProgress(95, 'Finalizing...');
      
      // Complete initialization
      this.startupTime = performance.now() - startupStartTime;
      this.settingsController.setStartupTime(this.startupTime);
      
      this.updateSplashProgress(100, 'Ready!');
      await new Promise(resolve => setTimeout(resolve, 500));
      this.hideSplash();
      
      // Check for startup file
      await this.checkStartupFile();
      
      // Play retro sound if enabled
      const themeData = this.settingsController.getTheme();
      if (themeData.isRetroTheme) {
        this.settingsController.playRetroStartupSound();
      }
      
      console.log(`[MarkdownEditor] Initialized in ${this.startupTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('[MarkdownEditor] Initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  initializeElements() {
    // Status bar elements
    this.cursorPos = document.getElementById('cursor-pos');
    this.filename = document.getElementById('filename');
    
    if (!this.cursorPos || !this.filename) {
      throw new Error('Status bar elements not found');
    }
  }

  async createComponents() {
    // Register default controllers in registry
    this.registry.register('settings', SettingsController);
    this.registry.register('ui', UIController);
    this.registry.register('file', FileController);
    this.registry.register('mode', ModeController);
    this.registry.register('tabUI', TabUIController);
    this.registry.register('markdownAction', MarkdownActionController);
    this.registry.register('export', ExportController);
    
    // Create settings controller first (or use injected one)
    if (!this.settingsController) {
      this.settingsController = this.registry.createInstance('settings');
    }
    this.addChild(this.settingsController);
    await this.settingsController.init();
    
    // Create UI controller (or use injected one)
    if (!this.uiController) {
      this.uiController = this.registry.createInstance('ui');
    }
    this.addChild(this.uiController);
    await this.uiController.init();
    
    // Create file controller (or use injected one)
    if (!this.fileController) {
      this.fileController = this.registry.createInstance('file');
    }
    this.addChild(this.fileController);
    await this.fileController.init();
    this.fileController.setPerformanceOptimizer(this.performanceOptimizer);
    
    // Create tab manager
    this.tabManager = new TabManager();
    this.addChild(this.tabManager);
    await this.tabManager.init();
    
    // Create document component
    this.documentComponent = new DocumentComponent();
    this.addChild(this.documentComponent);
    await this.documentComponent.init();
    
    // Create editor component
    this.editorComponent = new EditorComponent();
    this.addChild(this.editorComponent);
    await this.editorComponent.init();
    
    // Create preview component
    this.previewComponent = new PreviewComponent();
    this.addChild(this.previewComponent);
    await this.previewComponent.init();
    
    // Create toolbar component
    this.toolbarComponent = new ToolbarComponent();
    this.addChild(this.toolbarComponent);
    await this.toolbarComponent.init();
    
    // Create mode controller (or use injected one)
    if (!this.modeController) {
      this.modeController = this.registry.createInstance('mode');
    }
    this.addChild(this.modeController);
    await this.modeController.init();
    this.modeController.setDependencies(this.editorComponent, this.previewComponent, this.toolbarComponent, this.settingsController, this.tabManager);
    
    // Create tab UI controller (or use injected one)
    if (!this.tabUIController) {
      this.tabUIController = this.registry.createInstance('tabUI');
    }
    this.addChild(this.tabUIController);
    await this.tabUIController.init();
    this.tabUIController.setDependencies(this.tabManager, this.settingsController, this.performanceOptimizer);
    
    // Create markdown action controller (or use injected one)
    if (!this.markdownActionController) {
      this.markdownActionController = this.registry.createInstance('markdownAction');
    }
    this.addChild(this.markdownActionController);
    await this.markdownActionController.init();
    this.markdownActionController.setDependencies(this.editorComponent, this.documentComponent);
    
    // Create export controller (or use injected one)
    if (!this.exportController) {
      this.exportController = this.registry.createInstance('export');
    }
    this.addChild(this.exportController);
    await this.exportController.init();
    this.exportController.setDependencies(this.editorComponent);
  }

  setupComponentCommunication() {
    // Tab Manager Events
    this.tabManager.on('tab-created', (data) => {
      // Phase 6: Track tab creation performance for all new tabs
      if (this.performanceOptimizer) {
        this.performanceOptimizer.trackTabAccess(data.tab.id);
      }
      
      this.tabUIController.updateTabUI();
      
      // Update pinned tabs
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.tabUIController.updatePinnedTabs();
      }
      
      this.switchToTab(data.tab.id);
      
      // Switch to default mode when first document is opened
      if (this.modeController.getCurrentMode() === 'preview' && this.tabManager.getTabsCount() === 1) {
        const defaultMode = this.settingsController.getDefaultMode();
        this.modeController.setMode(defaultMode);
      }
    });
    
    this.tabManager.on('tab-removed', (data) => {
      this.tabUIController.updateTabUI();
      
      // Update pinned tabs
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.tabUIController.updatePinnedTabs();
      }
      
      // Update tab modal if it's open
      const tabModal = document.getElementById('tab-modal');
      if (tabModal && tabModal.style.display === 'flex') {
        if (this.tabManager.hasTabs()) {
          this.tabUIController.showTabModal();
        } else {
          this.tabUIController.hideTabModal();
        }
      }
      
      if (!this.tabManager.hasTabs()) {
        this.showWelcomePage();
      }
    });
    
    this.tabManager.on('tab-activated', (data) => {
      this.loadTabContent(data.tab);
      this.tabUIController.updateTabUI();
    });
    
    this.tabManager.on('tab-content-updated', (data) => {
      this.tabUIController.updateTabUI();
    });
    
    this.tabManager.on('tab-saved', (data) => {
      this.tabUIController.updateTabUI();
    });
    

    
    this.tabManager.on('tab-restored', (data) => {
      // Tab restored from persistence
    });
    
    this.tabManager.on('all-tabs-closed', (data) => {
      // Close tab modal if open
      const tabModal = document.getElementById('tab-modal');
      if (tabModal && tabModal.style.display === 'flex') {
        this.tabUIController.hideTabModal();
      }
      
      // Clear virtual tabs from memory
      if (this.performanceOptimizer) {
        this.performanceOptimizer.clearAllVirtualTabs();
      }
      
      // Update pinned tabs
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.tabUIController.updatePinnedTabs();
      }
      
      this.showWelcomePage();
      this.tabUIController.updateTabUI();
    });
    
    // Document Component Events
    this.documentComponent.on('document-opened', (data) => {
      const startTime = performance.now();
      const currentTabCount = this.tabManager.getTabsCount();
      
      // Open file in new tab or existing tab
      this.tabManager.openFileInTab(data.filePath, data.content);
      this.lastFileOpenTime = performance.now();
      this.settingsController.setLastFileOpenTime(this.lastFileOpenTime);
      
      // Switch to default mode when first document is opened
      if (this.modeController.getCurrentMode() === 'preview' && currentTabCount === 0) {
        const defaultMode = this.settingsController.getDefaultMode();
        this.modeController.setMode(defaultMode);
      }
      
      // Phase 6: Track file open performance for all file opens (including from Explorer)
      if (this.performanceOptimizer && this.tabManager.getTabsCount() > currentTabCount) {
        this.performanceOptimizer.benchmarkTabOperation('File Open', startTime, currentTabCount + 1);
      }
    });
    
    this.documentComponent.on('document-new', (data) => {
      // Create new tab
      this.tabManager.createNewTab(data.content);
      this.modeController.setMode('code'); // New files always start in code mode
    });
    
    this.documentComponent.on('document-closed', () => {
      // Close active tab
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.tabManager.closeTab(activeTab.id);
      }
    });
    
    this.documentComponent.on('document-dirty-changed', (data) => {
      // Update active tab dirty state
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        activeTab.isDirty = data.isDirty;
        this.tabUIController.updateTabUI();
        this.updateFilename(null, data.isDirty);
        this.toolbarComponent.emit('document-state-changed', { 
          hasDocument: true, 
          isDirty: data.isDirty 
        });
      }
    });
    
    this.documentComponent.on('document-saved', (data) => {
      // Update active tab after save
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.tabManager.markTabSaved(activeTab.id, data.filePath);
      }
    });
    
    this.documentComponent.on('document-error', (data) => {
      this.handleError(new Error(data.error), data.type);
    });
    
    this.documentComponent.on('document-content-updated', (data) => {
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        activeTab.setContent(data.content);
        this.editorComponent.emit('set-content', data);
        this.previewComponent.emit('update-preview', { 
          content: data.content,
          filePath: activeTab.filePath 
        });
      }
    });
    
    // Editor Component Events
    this.editorComponent.on('content-changed', (data) => {
      // Update active tab content
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        // Update tab content but don't update the Monaco model since it's the source
        activeTab.setContent(data.content);
        this.tabManager.persistTabs();
        // Also update document component to keep it in sync
        this.documentComponent.content = data.content;
      }
      this.documentComponent.emit('content-changed', data);
      
      this.previewComponent.emit('update-preview', { 
        content: data.content,
        filePath: activeTab?.filePath 
      });
      
      // Immediately update toolbar state for save button color
      this.toolbarComponent.emit('document-state-changed', { 
        hasDocument: true, 
        isDirty: true 
      });
    });
    
    this.editorComponent.on('cursor-position-changed', (data) => {
      this.updateCursorPosition(data.line, data.col);
      
      // Update active tab cursor position
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.tabManager.updateTabCursor(activeTab.id, data.line, data.col);
      }
    });
    
    this.editorComponent.on('monaco-loaded', () => {
      // Monaco editor loaded successfully
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.modeController.getCurrentMode());
    });
    
    this.editorComponent.on('markdown-action', (data) => {
      this.markdownActionController.handleMarkdownAction(data.action);
    });
    
    // Preview Component Events
    this.previewComponent.on('task-toggled', (data) => {
      // Add small delay to ensure preview has finished processing
      setTimeout(() => {
        this.markdownActionController.updateTaskInMarkdown(data.taskText, data.checked);
      }, 10);
    });
    
    this.previewComponent.on('external-link-clicked', (data) => {
      this.openExternalLink(data.href);
    });
    
    this.previewComponent.on('preview-error', (data) => {
      this.handleError(new Error(data.error), 'Preview');
    });
    
    this.previewComponent.on('mermaid-loaded', () => {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.modeController.getCurrentMode());
    });
    
    this.previewComponent.on('katex-loaded', () => {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.modeController.getCurrentMode());
    });
    
    // File Controller Events
    this.fileController.on('file-new-completed', () => {
      this.modeController.setMode('code');
    });
    
    this.fileController.on('file-error', (data) => {
      this.handleError(data.error, data.type);
    });
    
    // Toolbar Component Events
    this.toolbarComponent.on('file-new-requested', () => {
      this.fileController.newFile(this.tabManager);
    });
    
    this.toolbarComponent.on('file-open-requested', () => {
      this.fileController.openFile(this.documentComponent, this.tabManager);
    });
    
    this.toolbarComponent.on('file-save-requested', () => {
      this.fileController.saveFile(this.documentComponent, this.tabManager);
    });
    
    this.toolbarComponent.on('file-save-as-requested', () => {
      this.fileController.saveAsFile(this.documentComponent, this.tabManager);
    });
    
    this.toolbarComponent.on('file-close-requested', () => {
      this.fileController.closeFile(this.tabManager, this.performanceOptimizer);
    });
    
    this.toolbarComponent.on('mode-change-requested', (data) => {
      this.modeController.setMode(data.mode);
    });
    
    this.toolbarComponent.on('export-html-requested', () => {
      this.exportController.exportToHtml();
    });
    
    this.toolbarComponent.on('export-pdf-requested', () => {
      this.exportController.exportToPdf();
    });
    
    this.toolbarComponent.on('distraction-free-toggle', () => {
      this.uiController.toggleDistractionFree();
    });
    
    this.toolbarComponent.on('theme-toggle', () => {
      const themeData = this.uiController.toggleTheme();
      this.handleThemeChange(themeData);
    });
    
    this.toolbarComponent.on('settings-show', () => {
      this.uiController.showSettings();
    });
    
    this.toolbarComponent.on('help-show', () => {
      this.uiController.showHelp();
    });
    
    this.toolbarComponent.on('font-size-changed', (data) => {
      this.editorComponent.emit('font-size-changed', data);
    });
    
    this.toolbarComponent.on('zoom-changed', (data) => {
      this.previewComponent.emit('zoom-changed', data);
    });
    
    this.toolbarComponent.on('editor-undo', () => {
      this.editorComponent.undo();
    });
    
    this.toolbarComponent.on('editor-redo', () => {
      this.editorComponent.redo();
    });
    
    this.toolbarComponent.on('markdown-action', async (data) => {
      await this.markdownActionController.handleMarkdownAction(data.action);
    });
    
    this.toolbarComponent.on('find-replace-requested', () => {
      this.openFindReplace();
    });
    
    this.toolbarComponent.on('file-reload-requested', () => {
      this.reloadCurrentFile();
    });
    
    this.toolbarComponent.on('markdown-insert', (data) => {
      this.markdownActionController.insertMarkdownText(data.text);
    });
    
    // UI Controller Events
    this.uiController.on('theme-changed', (data) => {
      this.handleThemeChange(data);
    });
    
    this.uiController.on('distraction-free-changed', (data) => {
      this.toolbarComponent.emit('distraction-free-changed', data);
    });
    
    this.uiController.on('suggestions-changed', (data) => {
      this.editorComponent.emit('suggestions-changed', data);
    });
    
    // Settings Controller Events
    this.settingsController.on('theme-changed', (data) => {
      this.handleThemeChange(data);
    });
    
    this.settingsController.on('suggestions-changed', (data) => {
      this.editorComponent.emit('suggestions-changed', data);
    });
    
    this.settingsController.on('toolbar-enabled-changed', (data) => {
      this.toolbarComponent.isToolbarEnabled = data.enabled;
      this.toolbarComponent.updateToolbarVisibility();
    });
    
    this.settingsController.on('pinned-tabs-changed', (data) => {
      if (data.enabled) {
        this.tabUIController.updatePinnedTabs();
      }
    });
    
    // Update system info when settings change
    this.settingsController.on('settings-changed', () => {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.modeController.getCurrentMode());
    });
    
    // Mode Controller Events
    this.modeController.on('mode-changed', (data) => {
      this.updateScrollSyncButton();
    });
    
    // Tab UI Controller Events
    this.tabUIController.on('tab-switch-requested', (data) => {
      this.switchToTab(data.tabId);
    });
    
    this.tabUIController.on('tab-context-action', (data) => {
      this.handleTabContextAction(data.action, data.tabId);
    });
    
    this.tabUIController.on('settings-update-requested', () => {
      this.updateSettingsDisplay();
    });
    
    // Export Controller Events
    this.exportController.on('export-error', (data) => {
      this.handleError(data.error, data.type);
    });
  }

  applyInitialSettings() {
    // Apply settings through controllers
    this.settingsController.applySettings();
    
    // Initialize pinned tabs if enabled
    if (this.settingsController.getPinnedTabsEnabled()) {
      this.tabUIController.updatePinnedTabs();
    }
    
    // Show welcome page initially - always show in preview pane regardless of default mode
    this.previewComponent.showWelcome();
    
    // Set initial mode to preview for welcome screen manually (avoid ModeController during init)
    this.modeController.currentMode = 'preview';
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const splitter = document.getElementById('splitter');
    
    if (editorPane && previewPane && splitter) {
      editorPane.style.display = 'none';
      previewPane.style.display = 'block';
      splitter.style.display = 'none';
    }
    
    // Update main content and body classes for welcome screen
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add('preview-mode');
    }
    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add('preview-mode');
    
    // Update filename
    this.updateFilename('Welcome', false);
    
    // Update cursor position
    this.updateCursorPosition(1, 1);
    
    // Update toolbar state for no document
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: false, 
      isDirty: false 
    });
    
    // Notify toolbar of current mode (preview for welcome screen)
    this.toolbarComponent.emit('mode-changed', { mode: 'preview' });
    
    // Update theme button
    const themeData = this.settingsController.getTheme();
    this.toolbarComponent.updateThemeButton(themeData.theme, themeData.isRetroTheme);
    
    // Initialize tab UI
    this.tabUIController.updateTabUI();
    
    // Initialize system info
    this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.modeController.getCurrentMode());
  }

  setupGlobalEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
    
    // Mouse wheel shortcuts
    document.addEventListener('wheel', (e) => {
      this.handleMouseWheelShortcuts(e);
    }, { passive: false });
    
    // Window close handler
    this.setupWindowCloseHandler();
    
    // Single instance handler
    this.setupSingleInstanceHandler();
    
    // Drag and drop - immediate setup
    this.setupDragAndDrop();
    this.setupTauriFileDrop();
    
    // Splitter and scroll sync
    this.setupSplitter();
    this.setupScrollSync();
    
    // Scroll sync button
    this.setupScrollSyncButton();
    
    // Modal event handlers
    this.setupModalEventHandlers();
    

  }

  handleKeyboardShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const useCtrlForModes = e.ctrlKey || (!isMac && e.metaKey);
    const useCtrlForOther = e.ctrlKey || e.metaKey;
    
    if (useCtrlForOther) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.fileController.newFile(this.tabManager);
          break;
        case 'o':
          e.preventDefault();
          this.fileController.openFile(this.documentComponent, this.tabManager);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          if (e.shiftKey) {
            this.fileController.saveAsFile(this.documentComponent, this.tabManager);
          } else {
            this.fileController.saveFile(this.documentComponent, this.tabManager);
          }
          break;
        case 'w':
          e.preventDefault();
          this.fileController.closeFile(this.tabManager, this.performanceOptimizer);
          break;
      }
    }
    
    // Mode switching: always use Ctrl+1-3 (even on macOS)
    if (useCtrlForModes) {
      switch (e.key) {
        case '1':
          if (!e.shiftKey) {
            e.preventDefault();
            this.modeController.setMode('code');
          }
          break;
        case '2':
          if (!e.shiftKey) {
            e.preventDefault();
            this.modeController.setMode('preview');
          }
          break;
        case '3':
          if (!e.shiftKey) {
            e.preventDefault();
            this.modeController.setMode('split');
          }
          break;
      }
    }
    
    if (useCtrlForOther) {
      switch (e.key) {
        case 't':
        case '/':
          e.preventDefault();
          const themeData = this.uiController.toggleTheme();
          this.handleThemeChange(themeData);
          break;
        case ',':
          e.preventDefault();
          this.uiController.showSettings();
          break;
        case 'm':
        case 'M':
          if (e.shiftKey) {
            e.preventDefault();
            this.tabUIController.showTabModal();
          }
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportController.exportToPdf();
          }
          break;
        case 'e':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportController.exportToHtml();
          }
          break;
        case 'f':
          if (this.modeController.getCurrentMode() !== 'preview') {
            e.preventDefault();
            this.openFindReplace();
          }
          break;
        case 'r':
          e.preventDefault();
          this.performManualScrollSync();
          break;
        case '/':
        case '?':
          if (e.shiftKey) {
            e.preventDefault();
            this.toggleMarkdownToolbar();
          }
          break;


      }
    }
    
    // Handle Ctrl+Tab and Ctrl+Shift+Tab separately
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        this.switchToPreviousTab();
      } else {
        this.switchToNextTab();
      }
      return;
    }
    
    // Function keys
    switch (e.key) {
      case 'F1':
        e.preventDefault();
        this.uiController.showHelp();
        break;
      case 'F5':
        e.preventDefault();
        this.reloadCurrentFile();
        break;
      case 'F11':
        e.preventDefault();
        if (e.shiftKey) {
          this.uiController.toggleDistractionFree();
        } else {
          this.toggleFullscreen();
        }
        break;
      case 'Escape':
        // Close modals first, then exit distraction-free mode
        const settingsModal = document.getElementById('settings-modal');
        const helpModal = document.getElementById('help-modal');
        const aboutModal = document.getElementById('about-modal');
        const linkModal = document.getElementById('link-modal');
        const imageModal = document.getElementById('image-modal');
        
        if (settingsModal && settingsModal.style.display === 'flex') {
          this.uiController.hideSettings();
        } else if (helpModal && helpModal.style.display === 'flex') {
          this.uiController.hideHelp();
        } else if (aboutModal && aboutModal.style.display === 'flex') {
          this.uiController.hideAbout();
        } else if (linkModal && linkModal.style.display === 'flex') {
          this.toolbarComponent.hideLinkModal();
        } else if (imageModal && imageModal.style.display === 'flex') {
          this.toolbarComponent.hideImageModal();
        } else if (this.uiController.isDistractionFree) {
          this.uiController.exitDistractionFree();
        } else if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  }

  handleMouseWheelShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    // Ctrl+Mouse wheel: Font size in Code mode, Zoom in Preview mode
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      if (e.deltaY < 0) { // Scroll up
        if (this.modeController.getCurrentMode() === 'code') {
          this.toolbarComponent.changeFontSize(2);
        } else if (this.modeController.getCurrentMode() === 'preview' || this.modeController.getCurrentMode() === 'split') {
          this.toolbarComponent.changeZoom(0.1);
        }
      } else if (e.deltaY > 0) { // Scroll down
        if (this.modeController.getCurrentMode() === 'code') {
          this.toolbarComponent.changeFontSize(-2);
        } else if (this.modeController.getCurrentMode() === 'preview' || this.modeController.getCurrentMode() === 'split') {
          this.toolbarComponent.changeZoom(-0.1);
        }
      }
      return;
    }
    
    // Ctrl+Shift+Mouse wheel: Switch between modes
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      
      if (e.deltaY < 0) { // Scroll up - next mode
        this.modeController.cycleMode(1);
      } else if (e.deltaY > 0) { // Scroll down - previous mode
        this.modeController.cycleMode(-1);
      }
      return;
    }
    
    // Alt+Mouse wheel (Cmd+Mouse wheel on macOS): Cycle between tabs
    const useAltKey = e.altKey || (isMac && e.metaKey && !e.ctrlKey);
    if (useAltKey && this.tabManager.hasTabs()) {
      e.preventDefault();
      
      if (e.deltaY < 0) { // Scroll up - previous tab
        this.switchToPreviousTab();
      } else if (e.deltaY > 0) { // Scroll down - next tab
        this.switchToNextTab();
      }
      return;
    }
  }





  // Theme change handler
  handleThemeChange(themeData) {
    // Notify components
    this.editorComponent.emit('theme-changed', { theme: themeData.theme });
    this.previewComponent.emit('theme-changed', { theme: themeData.theme });
    this.toolbarComponent.updateThemeButton(themeData.theme, themeData.isRetroTheme);
    
    // Refresh preview if we have active tab content
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      this.previewComponent.emit('update-preview', { 
        content: activeTab.content,
        filePath: activeTab.filePath 
      });
    }
  }





  // Utility Functions
  updateCursorPosition(line, col) {
    if (this.cursorPos) {
      this.cursorPos.textContent = `Line ${line}, Col ${col}`;
    }
  }

  updateFilename(name = null, isDirty = null) {
    const filenameBtn = document.getElementById('filename');
    if (!filenameBtn) return;
    
    // If we have tabs, the filename is managed by updateTabUI
    if (this.tabManager && this.tabManager.hasTabs()) {
      return;
    }
    
    const documentState = this.documentComponent.getDocumentState();
    
    if (name === null) {
      if (documentState.currentFile) {
        name = documentState.fileName;
      } else if (documentState.hasDocument) {
        name = 'untitled.md';
      } else {
        name = 'Welcome';
      }
    }
    
    if (isDirty === null) {
      isDirty = documentState.isDirty;
    }
    
    filenameBtn.textContent = `${name}${isDirty ? ' *' : ''}`;
    filenameBtn.classList.remove('has-tabs');
  }



  async openExternalLink(href) {
    try {
      if (window.__TAURI__?.core?.invoke) {
        await window.__TAURI__.core.invoke('plugin:opener|open_url', { url: href });
      } else {
        window.open(href, '_blank');
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error opening external link:', error);
    }
  }
  
  openFindReplace() {
    if (this.modeController.getCurrentMode() === 'preview') {
      // Get selected text from code mode if available
      let searchText = '';
      if (this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
        const selection = this.editorComponent.monacoEditor.getSelection();
        if (selection && !selection.isEmpty()) {
          searchText = this.editorComponent.monacoEditor.getModel().getValueInRange(selection);
        }
      }
      
      // Use browser's native find for preview mode
      if (searchText && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(searchText).then(() => {
          document.execCommand('find');
        }).catch(() => {
          document.execCommand('find');
        });
      } else {
        document.execCommand('find');
      }
      return;
    }
    
    if (!this.editorComponent.isMonacoLoaded || !this.editorComponent.monacoEditor) {
      return;
    }
    
    // Toggle Monaco's find widget
    const editor = this.editorComponent.monacoEditor;
    const findController = editor.getContribution('editor.contrib.findController');
    if (findController) {
      if (findController.getState().isRevealed) {
        findController.closeFindWidget();
      } else {
        findController.start({
          forceRevealReplace: true,
          seedSearchStringFromSelection: 'single',
          seedSearchStringFromNonEmptySelection: true,
          shouldFocus: 1
        });
      }
    }
    editor.focus();
  }
  
  toggleMarkdownToolbar() {
    const currentEnabled = this.settingsController.getToolbarEnabled();
    this.settingsController.isToolbarEnabled = !currentEnabled;
    localStorage.setItem('markdownViewer_toolbarEnabled', (!currentEnabled).toString());
    this.settingsController.applyMarkdownToolbarVisibility();
    this.toolbarComponent.isToolbarEnabled = !currentEnabled;
    this.toolbarComponent.updateToolbarVisibility();
  }
  
  async reloadCurrentFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab && activeTab.filePath) {
      try {
        const newContent = await this.documentComponent.readFile(activeTab.filePath);
        if (newContent !== activeTab.content) {
          activeTab.setContent(newContent);
          this.editorComponent.emit('set-content', { content: newContent });
          this.previewComponent.emit('update-preview', { 
            content: newContent,
            filePath: activeTab.filePath 
          });
          this.documentComponent.content = newContent;
          this.documentComponent.markClean();
        }
      } catch (error) {
        console.error('Failed to reload file:', error);
      }
    }
  }

  refreshPreview() {
    const content = this.editorComponent.getContent();
    
    // Phase 6: Use debounced preview updates for better performance
    if (this.performanceOptimizer && window.PerformanceUtils) {
      if (!this.debouncedPreviewUpdate) {
        this.debouncedPreviewUpdate = window.PerformanceUtils.debounce((content) => {
          const activeTab = this.tabManager.getActiveTab();
          this.previewComponent.emit('update-preview', { 
            content,
            filePath: activeTab?.filePath 
          });
        }, 150);
      }
      this.debouncedPreviewUpdate(content);
    } else {
      const activeTab = this.tabManager.getActiveTab();
      this.previewComponent.emit('update-preview', { 
        content,
        filePath: activeTab?.filePath 
      });
    }
  }

  async toggleFullscreen() {
    try {
      if (window.__TAURI__?.window) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const appWindow = getCurrentWindow();
        const isFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!isFullscreen);
      } else {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error toggling fullscreen:', error);
    }
  }

  setupModalEventHandlers() {
    // Welcome page buttons
    const welcomeNewBtn = document.getElementById('welcome-new-btn');
    const welcomeOpenBtn = document.getElementById('welcome-open-btn');
    const welcomeHelpBtn = document.getElementById('welcome-help-btn');
    const welcomeAboutBtn = document.getElementById('welcome-about-btn');
    const welcomeSettingsBtn = document.getElementById('welcome-settings-btn');
    
    if (welcomeNewBtn) {
      welcomeNewBtn.addEventListener('click', () => this.fileController.newFile(this.tabManager));
    }
    if (welcomeOpenBtn) {
      welcomeOpenBtn.addEventListener('click', () => this.fileController.openFile(this.documentComponent, this.tabManager));
    }
    if (welcomeHelpBtn) {
      welcomeHelpBtn.addEventListener('click', () => this.uiController.showHelp());
    }
    if (welcomeAboutBtn) {
      welcomeAboutBtn.addEventListener('click', () => this.uiController.showAbout());
    }
    if (welcomeSettingsBtn) {
      welcomeSettingsBtn.addEventListener('click', () => this.uiController.showSettings());
    }
    
    // Clear history button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => this.clearFileHistory());
    }
  }


  
  updateSettingsDisplay() {
    this.settingsController.updateSettingsDisplay();
    this.settingsController.updatePerformanceDashboard(this.performanceOptimizer, this.tabManager);
    this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.modeController.getCurrentMode());
  }
  

  
  clearFileHistory() {
    this.documentComponent.fileHistory = [];
    localStorage.removeItem('markdownViewer_fileHistory');
    this.documentComponent.updateFileHistoryDisplay();
  }
  


  async handleUnsavedChanges() {
    try {
      if (window.__TAURI__) {
        return await window.__TAURI__.dialog.confirm(
          'Close without saving changes?',
          { title: 'Unsaved Changes' }
        );
      }
      return confirm('Close without saving changes?');
    } catch (error) {
      return false;
    }
  }

  async setupWindowCloseHandler() {
    if (!window.__TAURI__?.window) return;
    
    try {
      const { getCurrentWindow } = window.__TAURI__.window;
      const appWindow = getCurrentWindow();
      
      await appWindow.onCloseRequested(async (event) => {
        // Always persist tabs before closing (including unsaved changes)
        if (this.tabManager) {
          this.tabManager.persistTabs();
        }
        // Allow the application to close without confirmation
      });
    } catch (error) {
      console.error('[MarkdownEditor] Error setting up close handler:', error);
    }
  }

  async setupSingleInstanceHandler() {
    if (!window.__TAURI__?.event) return;
    
    try {
      const { listen } = window.__TAURI__.event;
      
      // Listen for single instance events
      await listen('single-instance-args', (event) => {
        const files = event.payload;
        if (Array.isArray(files) && files.length > 0) {
          // Open each file in a new tab
          files.forEach(filePath => {
            this.documentComponent.openFile(filePath);
          });
        }
        
        // Focus the window
        this.focusWindow();
      });

      

      
    } catch (error) {
      console.error('[MarkdownEditor] Error setting up single instance handler:', error);
    }
  }

  async focusWindow() {
    try {
      if (window.__TAURI__?.window) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const appWindow = getCurrentWindow();
        await appWindow.setFocus();
        await appWindow.unminimize();
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error focusing window:', error);
    }
  }

  setupDragAndDrop() {

    
    // Test if events are working at all
    document.addEventListener('click', () => {
      console.log('[DEBUG] Click event works - DOM is ready');
    }, { once: true });
    
    const dragEnterHandler = (e) => {
      console.log('[DEBUG] DRAGENTER triggered on:', e.target.tagName);
      e.preventDefault();
      e.stopPropagation();
      document.body.classList.add('drag-over');
    };
    
    const dragOverHandler = (e) => {
      console.log('[DEBUG] DRAGOVER triggered');
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    };
    
    const dragLeaveHandler = (e) => {
      console.log('[DEBUG] DRAGLEAVE triggered');
      e.preventDefault();
      e.stopPropagation();
      // Only remove if leaving the window entirely
      if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
        document.body.classList.remove('drag-over');
      }
    };
    
    const dropHandler = async (e) => {
      console.log('[DEBUG] DROP triggered with files:', e.dataTransfer?.files?.length || 0);
      e.preventDefault();
      e.stopPropagation();
      document.body.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length === 0) {
        console.log('[DEBUG] No files in drop event');
        return;
      }
      
      console.log('[DEBUG] Processing files:', files.map(f => f.name));
      
      // Welcome screen: open .md files
      const welcomePage = document.getElementById('welcome-page');
      const isWelcomeVisible = welcomePage && welcomePage.style.display !== 'none';
      
      if (isWelcomeVisible || !this.tabManager.hasTabs()) {
        const mdFile = files.find(f => /\.(md|markdown|txt)$/i.test(f.name));
        if (mdFile) {
          const content = await mdFile.text();
          this.tabManager.createNewTab(content);
          const defaultMode = this.uiController.defaultMode;
          this.modeController.setMode(defaultMode);
        }
        return;
      }
      
      // Code mode: insert file paths
      if (this.modeController.getCurrentMode() === 'code' && this.editorComponent.isMonacoLoaded) {
        const editor = this.editorComponent.monacoEditor;
        const position = editor.getPosition();
        const filePaths = files.map(f => f.name);
        const insertText = filePaths.join('\n');
        
        editor.executeEdits('drag-drop', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: insertText
        }]);
        
        this.documentComponent.handleContentChange(editor.getValue());
      }
    };
    
    // Add listeners to document and body
    document.addEventListener('dragenter', dragEnterHandler, true);
    document.addEventListener('dragover', dragOverHandler, true);
    document.addEventListener('dragleave', dragLeaveHandler, true);
    document.addEventListener('drop', dropHandler, true);
    
    document.body.addEventListener('dragenter', dragEnterHandler);
    document.body.addEventListener('dragover', dragOverHandler);
    document.body.addEventListener('dragleave', dragLeaveHandler);
    document.body.addEventListener('drop', dropHandler);
    

  }

  async checkStartupFile() {
    try {
      if (window.__TAURI__?.core?.invoke) {
        const startupFile = await window.__TAURI__.core.invoke('get_startup_file');
        
        if (startupFile && typeof startupFile === 'string' && startupFile.trim()) {
          await this.documentComponent.openFile(startupFile);
          
          try {
            await window.__TAURI__.core.invoke('clear_startup_file');
          } catch (clearError) {
            console.warn('[MarkdownEditor] Failed to clear startup file:', clearError);
          }
          return true;
        }
      }
      

    } catch (error) {
      console.error('[MarkdownEditor] Error checking startup file:', error);
    }
    
    return false;
  }

  updateSplashProgress(progress, message) {
    if (window.splashScreen) {
      window.splashScreen.updateProgress(progress, message);
    }
  }

  hideSplash() {
    if (window.splashScreen) {
      window.splashScreen.hideSplash();
    }
  }

  handleInitializationError(error) {
    this.hideSplash();
    console.error('[MarkdownEditor] Initialization error:', error);
    
    // Show basic interface even if advanced features fail
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
      welcomePage.style.display = 'flex';
    }
  }

  handleError(error, context = 'Unknown') {
    console.error(`[MarkdownEditor] ${context} error:`, error);
    
    if (window.__TAURI__?.dialog) {
      window.__TAURI__.dialog.message(
        `${context} Error: ${error.message}`,
        { title: 'Error', type: 'error' }
      ).catch(() => console.error('[MarkdownEditor] Failed to show error dialog'));
    }
  }

  setupSplitter() {
    const splitter = document.getElementById('splitter');
    const mainContent = document.querySelector('.main-content');
    if (!splitter || !mainContent) return;
    
    let isResizing = false;
    
    splitter.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const containerRect = mainContent.getBoundingClientRect();
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (percentage > 20 && percentage < 80) {
        mainContent.style.setProperty('--editor-width', `${percentage}%`);
        mainContent.style.setProperty('--preview-width', `${100 - percentage}%`);
        
        if (this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
          requestAnimationFrame(() => {
            this.editorComponent.monacoEditor.layout();
          });
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = 'default';
    });
  }
  
  setupScrollSync() {
    let isScrolling = false;
    
    const syncEditorToPreview = () => {
      if (isScrolling || this.modeController.getCurrentMode() !== 'split') return;
      isScrolling = true;
      
      const editor = this.editorComponent.monacoEditor;
      const previewPane = document.querySelector('.preview-pane');
      
      if (editor && previewPane) {
        const editorScrollTop = editor.getScrollTop();
        const editorScrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
        const scrollRatio = editorScrollHeight > 0 ? editorScrollTop / editorScrollHeight : 0;
        const previewScrollHeight = previewPane.scrollHeight - previewPane.clientHeight;
        
        if (previewScrollHeight > 0) {
          previewPane.scrollTop = scrollRatio * previewScrollHeight;
        }
      }
      
      setTimeout(() => { isScrolling = false; }, 50);
    };
    
    const syncPreviewToEditor = () => {
      if (isScrolling || this.modeController.getCurrentMode() !== 'split') return;
      isScrolling = true;
      
      const editor = this.editorComponent.monacoEditor;
      const previewPane = document.querySelector('.preview-pane');
      
      if (editor && previewPane) {
        const previewScrollTop = previewPane.scrollTop;
        const previewScrollHeight = previewPane.scrollHeight - previewPane.clientHeight;
        const scrollRatio = previewScrollHeight > 0 ? previewScrollTop / previewScrollHeight : 0;
        const editorScrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
        
        if (editorScrollHeight > 0) {
          editor.setScrollTop(scrollRatio * editorScrollHeight);
        }
      }
      
      setTimeout(() => { isScrolling = false; }, 50);
    };
    
    this.editorComponent.on('monaco-loaded', () => {
      if (this.editorComponent.monacoEditor) {
        this.editorComponent.monacoEditor.onDidScrollChange(syncEditorToPreview);
      }
    });
    
    if (this.editorComponent.isMonacoLoaded) {
      this.editorComponent.monacoEditor.onDidScrollChange(syncEditorToPreview);
    }
    
    const previewPane = document.querySelector('.preview-pane');
    if (previewPane) {
      previewPane.addEventListener('scroll', syncPreviewToEditor);
      
      // Save scroll position for active tab
      previewPane.addEventListener('scroll', () => {
        const activeTab = this.tabManager.getActiveTab();
        if (activeTab) {
          this.tabManager.updateTabScroll(activeTab.id, null, previewPane.scrollTop);
        }
      });
    }
  }
  
  setupScrollSyncButton() {
    const scrollSyncBtn = document.getElementById('scroll-sync-btn');
    if (!scrollSyncBtn) return;
    
    scrollSyncBtn.addEventListener('click', () => {
      this.performManualScrollSync();
    });
  }
  
  performManualScrollSync() {
    const previewPane = document.querySelector('.preview-pane');
    const activeTab = this.tabManager.getActiveTab();
    const editor = this.editorComponent.monacoEditor;
    
    if (!previewPane || !activeTab || !this.editorComponent.isMonacoLoaded || !editor) {
      return;
    }
    
    if (this.modeController.getCurrentMode() === 'code' && activeTab.scrollPosition?.preview !== undefined) {
      // Sync from Preview to Code
      let previewScroll = activeTab.scrollPosition.preview;
      
      if (previewPane.style.display !== 'none') {
        previewScroll = previewPane.scrollTop;
      }
      
      const wasHidden = previewPane.style.display === 'none';
      if (wasHidden) {
        previewPane.style.display = 'block';
        this.previewComponent.emit('update-preview', { 
          content: activeTab.content,
          filePath: activeTab.filePath 
        });
        previewPane.offsetHeight;
      }
      
      const previewHeight = previewPane.clientHeight;
      const previewScrollHeight = previewPane.scrollHeight;
      const previewMaxScroll = Math.max(0, previewScrollHeight - previewHeight);
      
      let scrollRatio = previewMaxScroll > 0 ? previewScroll / previewMaxScroll : 0;
      
      const editorScrollHeight = editor.getScrollHeight();
      const editorHeight = editor.getLayoutInfo().height;
      const editorMaxScroll = Math.max(0, editorScrollHeight - editorHeight);
      const targetScroll = scrollRatio * editorMaxScroll;
      
      editor.setScrollTop(targetScroll);
      
      if (wasHidden) {
        previewPane.style.display = 'none';
      }
      
    } else if (this.modeController.getCurrentMode() === 'preview') {
      // Sync from Code to Preview
      const editorScrollTop = editor.getScrollTop();
      const editorHeight = editor.getLayoutInfo().height;
      const editorScrollHeight = editor.getScrollHeight();
      const editorMaxScroll = Math.max(0, editorScrollHeight - editorHeight);
      
      let scrollRatio = 0;
      if (editorMaxScroll > 0) {
        scrollRatio = editorScrollTop / editorMaxScroll;
      }
      
      const amplifiedRatio = scrollRatio;
      
      const previewHeight = previewPane.clientHeight;
      const previewScrollHeight = previewPane.scrollHeight;
      const previewMaxScroll = Math.max(0, previewScrollHeight - previewHeight);
      const targetScroll = amplifiedRatio * previewMaxScroll;
      
      previewPane.scrollTop = Math.max(0, Math.min(targetScroll, previewMaxScroll));
    }
  }
  
  updateScrollSyncButton() {
    const scrollSyncBtn = document.getElementById('scroll-sync-btn');
    if (!scrollSyncBtn) return;
    
    const hasDocument = this.tabManager.hasTabs();
    const welcomePage = document.getElementById('welcome-page');
    const isWelcomeVisible = welcomePage && welcomePage.style.display !== 'none';
    const showButton = hasDocument && !isWelcomeVisible && (this.modeController.getCurrentMode() === 'code' || this.modeController.getCurrentMode() === 'preview');
    
    scrollSyncBtn.style.display = showButton ? 'inline-flex' : 'none';
    
    if (showButton) {
      if (this.modeController.getCurrentMode() === 'code') {
        scrollSyncBtn.setAttribute('title', 'Sync from Preview');
      } else if (this.modeController.getCurrentMode() === 'preview') {
        scrollSyncBtn.setAttribute('title', 'Sync from Code');
      }
    }
  }

  // Tab Management Methods - Phase 6 Enhanced
  switchToTab(tabId) {
    const startTime = performance.now();
    const currentTab = this.tabManager.getActiveTab();
    const currentTabId = currentTab?.id;
    
    // Check if tab exists
    const targetTab = this.tabManager.getTab(tabId);
    if (!targetTab) return;
    
    // Phase 6: Handle virtualized tabs FIRST
    if (this.performanceOptimizer && this.performanceOptimizer.virtualizedTabs.has(tabId)) {
      this.performanceOptimizer.restoreTab(tabId);
    }
    
    // Save current tab's cursor position and editor state before switching
    if (currentTab && this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
      // Save Monaco Editor view state to preserve undo/redo history and scroll position
      const viewState = this.editorComponent.monacoEditor.saveViewState();
      this.tabManager.saveTabEditorState(currentTab.id, viewState);
    }
    
    // Save preview pane scroll position
    if (currentTab) {
      const previewPane = document.querySelector('.preview-pane');
      if (previewPane && previewPane.style.display !== 'none') {
        this.tabManager.updateTabScroll(currentTab.id, null, previewPane.scrollTop);
      }
    }
    
    // Phase 6: Track tab access and performance
    if (this.performanceOptimizer) {
      this.performanceOptimizer.trackTabAccess(tabId);
    }
    
    const success = this.tabManager.switchToTab(tabId);
    if (!success) return;
    
    // Phase 6: Track tab switch performance
    const duration = performance.now() - startTime;
    if (this.performanceOptimizer) {
      const allTabs = this.tabManager.getAllTabs();
      this.performanceOptimizer.trackTabSwitch(duration, currentTabId, tabId);
      this.performanceOptimizer.benchmarkTabOperation('Tab Switch', startTime, allTabs.length);
    }
  }
  
  loadTabContent(tab) {
    const startTime = performance.now();
    
    // Phase 6: Check if content should be lazy loaded
    const allTabs = this.tabManager.getAllTabs();
    const tabIndex = allTabs.findIndex(t => t.id === tab.id);
    
    if (this.performanceOptimizer && this.performanceOptimizer.shouldLazyLoadTab(tabIndex, allTabs.length)) {
      // Lazy load: only load essential content
      this.loadTabContentLazy(tab);
    } else {
      // Full load: load all content immediately
      this.loadTabContentFull(tab);
    }
    
    // Phase 6: Track tab load performance
    if (this.performanceOptimizer) {
      this.performanceOptimizer.benchmarkTabOperation('Tab Load', startTime, allTabs.length);
    }
  }
  
  // Phase 6: Full tab content loading
  loadTabContentFull(tab) {
    // Load tab content into editor with model preservation
    if (this.editorComponent.isMonacoLoaded) {
      const model = tab.getMonacoModel();
      this.editorComponent.setMonacoModel(model, tab.editorViewState);
    } else {
      this.editorComponent.emit('set-content', { content: tab.content });
    }
    this.previewComponent.emit('update-preview', { 
      content: tab.content,
      filePath: tab.filePath 
    });
    
    // Only show preview if we're in preview or split mode
    if (this.modeController.getCurrentMode() === 'preview' || this.modeController.getCurrentMode() === 'split') {
      this.previewComponent.showPreview();
    }
    
    // Update filename and document state
    this.updateFilename(tab.fileName, tab.isDirty);
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: true, 
      isDirty: tab.isDirty 
    });
    
    // Ensure current mode is maintained after tab switch
    setTimeout(() => {
      this.modeController.setMode(this.modeController.getCurrentMode());
    }, 10);
    
    // Restore preview scroll position
    if (tab.scrollPosition?.preview !== undefined) {
      setTimeout(() => {
        const previewPane = document.querySelector('.preview-pane');
        if (previewPane && previewPane.style.display !== 'none') {
          previewPane.scrollTop = tab.scrollPosition.preview;
        }
      }, 100);
    }
  }
  
  // Phase 6: Lazy tab content loading
  loadTabContentLazy(tab) {
    // Load minimal content first
    this.updateFilename(tab.fileName, tab.isDirty);
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: true, 
      isDirty: tab.isDirty 
    });
    
    // Defer heavy operations
    const deferCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
    deferCallback(() => {
      if (this.editorComponent.isMonacoLoaded) {
        const model = tab.getMonacoModel();
        this.editorComponent.setMonacoModel(model, tab.editorViewState);
      } else {
        this.editorComponent.emit('set-content', { content: tab.content });
      }
      this.previewComponent.emit('update-preview', { 
        content: tab.content,
        filePath: tab.filePath 
      });
      
      // Only show preview if we're in preview or split mode
      if (this.modeController.getCurrentMode() === 'preview' || this.modeController.getCurrentMode() === 'split') {
        this.previewComponent.showPreview();
      }
      
      // Ensure current mode is maintained after tab switch
      this.modeController.setMode(this.modeController.getCurrentMode());
      
      // Restore preview scroll position
      if (tab.scrollPosition?.preview !== undefined) {
        setTimeout(() => {
          const previewPane = document.querySelector('.preview-pane');
          if (previewPane && previewPane.style.display !== 'none') {
            previewPane.scrollTop = tab.scrollPosition.preview;
          }
        }, 100);
      }
    }, { timeout: 1000 });
  }
  
  showWelcomePage() {
    this.editorComponent.emit('set-content', { content: '' });
    this.previewComponent.emit('update-preview', { 
      content: '',
      filePath: null 
    });
    this.previewComponent.showWelcome();
    this.updateFilename('Welcome', false);
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: false, 
      isDirty: false 
    });
    this.modeController.setMode('preview');
    
    // Force update tab UI to show Welcome instead of tabs
    this.tabUIController.updateTabUIForWelcome();
    
    // Update scroll sync button
    this.updateScrollSyncButton();
  }
  

  
  switchToNextTab() {
    const tabs = this.tabManager.getAllTabs();
    if (tabs.length <= 1) return;
    
    const activeTab = this.tabManager.getActiveTab();
    if (!activeTab) {
      this.switchToTab(tabs[0].id);
      return;
    }
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab.id);
    const nextIndex = (currentIndex + 1) % tabs.length;
    this.switchToTab(tabs[nextIndex].id);
  }
  
  switchToPreviousTab() {
    const tabs = this.tabManager.getAllTabs();
    if (tabs.length <= 1) return;
    
    const activeTab = this.tabManager.getActiveTab();
    if (!activeTab) {
      this.switchToTab(tabs[tabs.length - 1].id);
      return;
    }
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab.id);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    this.switchToTab(tabs[prevIndex].id);
  }
  

  
  async handleTabContextAction(action, tabId) {
    const tab = this.tabManager.getTab(tabId);
    if (!tab) return;
    
    switch (action) {
      case 'move-to-1':
      case 'move-to-2':
      case 'move-to-3':
      case 'move-to-4':
      case 'move-to-5':
      case 'move-to-6':
      case 'move-to-7':
      case 'move-to-8':
      case 'move-to-9':
        const position = parseInt(action.split('-')[2]) - 1; // Convert to 0-based index
        this.moveTabToPosition(tabId, position);
        // Refresh modal if it's open
        const tabModal = document.getElementById('tab-modal');
        if (tabModal && tabModal.style.display === 'flex') {
          this.tabUIController.showTabModal();
        }
        break;
        
      case 'close':
        await this.tabManager.closeTab(tabId);
        break;
        
      case 'close-others':
        const allTabs = this.tabManager.getAllTabs();
        for (const otherTab of allTabs) {
          if (otherTab.id !== tabId) {
            await this.tabManager.closeTab(otherTab.id);
          }
        }
        break;
        
      case 'close-all':
        await this.tabManager.closeAllTabs();
        break;
        
      case 'duplicate':
        this.tabManager.createNewTab(tab.content);
        break;
        
      case 'toggle-pinned':
        this.tabUIController.togglePinnedTabs();
        break;
        
      case 'reveal':
        if (tab.filePath && window.__TAURI__?.core?.invoke) {
          try {
            await window.__TAURI__.core.invoke('show_in_folder', { path: tab.filePath });
          } catch (error) {
            console.warn('[MarkdownEditor] Failed to reveal file:', error);
          }
        }
        break;
    }
  }
  
  // Move tab to specific position
  moveTabToPosition(tabId, targetIndex) {
    if (this.tabManager.moveTabToPosition(tabId, targetIndex)) {
      this.tabManager.persistTabs();
      this.tabUIController.updateTabUI();
    }
  }
  
  async setupTauriFileDrop() {
    if (!window.__TAURI__?.event) {
      console.log('[DEBUG] Tauri not available');
      return;
    }
    

    const { listen } = window.__TAURI__.event;
    
    try {
      await listen('tauri://file-drop', async (event) => {
        console.log('[DEBUG] TAURI FILE DROP:', event.payload);
        const files = event.payload;
        if (!Array.isArray(files) || files.length === 0) return;
        
        const welcomePage = document.getElementById('welcome-page');
        const isWelcomeVisible = welcomePage && welcomePage.style.display !== 'none';
        
        if (isWelcomeVisible || !this.tabManager.hasTabs()) {
          const mdFile = files.find(f => /\.(md|markdown|txt)$/i.test(f));
          if (mdFile) {
            await this.documentComponent.openFile(mdFile);
          }
        } else if (this.modeController.getCurrentMode() === 'code' && this.editorComponent.isMonacoLoaded) {
          const editor = this.editorComponent.monacoEditor;
          const position = editor.getPosition();
          const insertText = files.join('\n');
          
          editor.executeEdits('tauri-file-drop', [{
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: insertText
          }]);
          
          this.documentComponent.handleContentChange(editor.getValue());
        }
      });

      
      await listen('tauri://file-drop-hover', () => {
        console.log('[DEBUG] TAURI HOVER');
        document.body.classList.add('drag-over');
      });

      
      await listen('tauri://file-drop-cancelled', () => {
        console.log('[DEBUG] TAURI CANCELLED');
        document.body.classList.remove('drag-over');
      });

      
    } catch (error) {
      console.error('[DEBUG] Error setting up Tauri listeners:', error);
    }
  }

  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  onDestroy() {
    // Clean up debounced functions
    if (this.debouncedPreviewUpdate) {
      this.debouncedPreviewUpdate = null;
    }
    
    // Phase 6: Clean up performance optimizer
    if (this.performanceOptimizer) {
      this.performanceOptimizer.destroy();
    }
    
    // Clean up controller registry
    if (this.registry) {
      this.registry.destroy();
    }
    

    
    // Clean up all child components
    if (this.tabManager) {
      this.tabManager.destroy();
    }
    if (this.documentComponent) {
      this.documentComponent.destroy();
    }
    if (this.editorComponent) {
      this.editorComponent.destroy();
    }
    if (this.previewComponent) {
      this.previewComponent.destroy();
    }
    if (this.toolbarComponent) {
      this.toolbarComponent.destroy();
    }
    
    // Reset state
    this.isDistractionFree = false;
  }
}

// Factory function for creating MarkdownEditor with default controllers
function createMarkdownEditor(options = {}) {
  // Create default controllers if not provided
  const controllers = options.controllers || {};
  const registry = options.registry || new ControllerRegistry();
  
  return new MarkdownEditor({
    ...options,
    controllers,
    registry
  });
}

// Export for use in main application
window.MarkdownEditor = MarkdownEditor;
window.createMarkdownEditor = createMarkdownEditor;