/**
 * Markdown Editor - Main Component Orchestrator
 * Manages all components and maintains existing functionality
 */
class MarkdownEditor extends BaseComponent {
  constructor(options = {}) {
    super('MarkdownEditor', options);
    
    // Component instances
    this.documentComponent = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.tabManager = null;
    this.fileController = null;
    this.uiController = null;
    this.keyboardController = null;
    this.settingsController = null;
    
    // Application state
    this.currentMode = 'preview';
    
    // Enhanced tab features state
    this.contextMenuTabId = null;
    
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
    // Create settings controller first
    this.settingsController = new SettingsController();
    this.addChild(this.settingsController);
    await this.settingsController.init();
    
    // Create UI controller
    this.uiController = new UIController();
    this.addChild(this.uiController);
    await this.uiController.init();
    
    // Create file controller
    this.fileController = new FileController();
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
  }

  setupComponentCommunication() {
    // Tab Manager Events
    this.tabManager.on('tab-created', (data) => {
      // Phase 6: Track tab creation performance for all new tabs
      if (this.performanceOptimizer) {
        this.performanceOptimizer.trackTabAccess(data.tab.id);
      }
      
      this.updateTabUI();
      
      // Update pinned tabs
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.updatePinnedTabs();
      }
      
      this.switchToTab(data.tab.id);
      
      // Switch to default mode when first document is opened
      if (this.currentMode === 'preview' && this.tabManager.getTabsCount() === 1) {
        const defaultMode = this.settingsController.getDefaultMode();
        this.setMode(defaultMode);
      }
    });
    
    this.tabManager.on('tab-removed', (data) => {
      this.updateTabUI();
      
      // Update pinned tabs
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.updatePinnedTabs();
      }
      
      // Update tab modal if it's open
      const tabModal = document.getElementById('tab-modal');
      if (tabModal && tabModal.style.display === 'flex') {
        if (this.tabManager.hasTabs()) {
          this.showTabModal();
        } else {
          this.hideTabModal();
        }
      }
      
      if (!this.tabManager.hasTabs()) {
        this.showWelcomePage();
      }
    });
    
    this.tabManager.on('tab-activated', (data) => {
      this.loadTabContent(data.tab);
      this.updateTabUI();
    });
    
    this.tabManager.on('tab-content-updated', (data) => {
      this.updateTabUI();
    });
    
    this.tabManager.on('tab-saved', (data) => {
      this.updateTabUI();
    });
    

    
    this.tabManager.on('tab-restored', (data) => {
      // Tab restored from persistence
    });
    
    this.tabManager.on('all-tabs-closed', (data) => {
      // Close tab modal if open
      const tabModal = document.getElementById('tab-modal');
      if (tabModal && tabModal.style.display === 'flex') {
        this.hideTabModal();
      }
      
      // Clear virtual tabs from memory
      if (this.performanceOptimizer) {
        this.performanceOptimizer.clearAllVirtualTabs();
      }
      
      // Update pinned tabs
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.updatePinnedTabs();
      }
      
      this.showWelcomePage();
      this.updateTabUI();
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
      if (this.currentMode === 'preview' && currentTabCount === 0) {
        const defaultMode = this.settingsController.getDefaultMode();
        this.setMode(defaultMode);
      }
      
      // Phase 6: Track file open performance for all file opens (including from Explorer)
      if (this.performanceOptimizer && this.tabManager.getTabsCount() > currentTabCount) {
        this.performanceOptimizer.benchmarkTabOperation('File Open', startTime, currentTabCount + 1);
      }
    });
    
    this.documentComponent.on('document-new', (data) => {
      // Create new tab
      this.tabManager.createNewTab(data.content);
      this.setMode('code'); // New files always start in code mode
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
        this.updateTabUI();
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
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
    });
    
    this.editorComponent.on('markdown-action', (data) => {
      this.handleMarkdownAction(data.action);
    });
    
    // Preview Component Events
    this.previewComponent.on('task-toggled', (data) => {
      // Add small delay to ensure preview has finished processing
      setTimeout(() => {
        this.updateTaskInMarkdown(data.taskText, data.checked);
      }, 10);
    });
    
    this.previewComponent.on('external-link-clicked', (data) => {
      this.openExternalLink(data.href);
    });
    
    this.previewComponent.on('preview-error', (data) => {
      this.handleError(new Error(data.error), 'Preview');
    });
    
    this.previewComponent.on('mermaid-loaded', () => {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
    });
    
    this.previewComponent.on('katex-loaded', () => {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
    });
    
    // File Controller Events
    this.fileController.on('file-new-completed', () => {
      this.setMode('code');
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
      this.setMode(data.mode);
    });
    
    this.toolbarComponent.on('export-html-requested', () => {
      this.exportToHtml();
    });
    
    this.toolbarComponent.on('export-pdf-requested', () => {
      this.exportToPdf();
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
    
    this.toolbarComponent.on('markdown-action', (data) => {
      this.handleMarkdownAction(data.action);
    });
    
    this.toolbarComponent.on('find-replace-requested', () => {
      this.openFindReplace();
    });
    
    this.toolbarComponent.on('file-reload-requested', () => {
      this.reloadCurrentFile();
    });
    
    this.toolbarComponent.on('markdown-insert', (data) => {
      this.insertMarkdownText(data.text);
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
        this.updatePinnedTabs();
      }
    });
    
    // Update system info when settings change
    this.settingsController.on('settings-changed', () => {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
    });
  }

  applyInitialSettings() {
    // Apply settings through controllers
    this.settingsController.applySettings();
    
    // Initialize pinned tabs if enabled
    if (this.settingsController.getPinnedTabsEnabled()) {
      this.updatePinnedTabs();
    }
    
    // Show welcome page initially - always show in preview pane regardless of default mode
    this.previewComponent.showWelcome();
    
    // Set initial mode to preview for welcome screen, will switch to default mode when document opens
    this.currentMode = 'preview';
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
    this.updateTabUI();
    
    // Initialize system info
    this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
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
    
    // Tab dropdown
    this.setupTabDropdown();
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
            this.setMode('code');
          }
          break;
        case '2':
          if (!e.shiftKey) {
            e.preventDefault();
            this.setMode('preview');
          }
          break;
        case '3':
          if (!e.shiftKey) {
            e.preventDefault();
            this.setMode('split');
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
            this.showTabModal();
          }
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportToPdf();
          }
          break;
        case 'e':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportToHtml();
          }
          break;
        case 'f':
          if (this.currentMode !== 'preview') {
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
        if (this.currentMode === 'code') {
          this.toolbarComponent.changeFontSize(2);
        } else if (this.currentMode === 'preview' || this.currentMode === 'split') {
          this.toolbarComponent.changeZoom(0.1);
        }
      } else if (e.deltaY > 0) { // Scroll down
        if (this.currentMode === 'code') {
          this.toolbarComponent.changeFontSize(-2);
        } else if (this.currentMode === 'preview' || this.currentMode === 'split') {
          this.toolbarComponent.changeZoom(-0.1);
        }
      }
      return;
    }
    
    // Ctrl+Shift+Mouse wheel: Switch between modes
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      const modes = ['code', 'preview', 'split'];
      const currentIndex = modes.indexOf(this.currentMode);
      
      if (e.deltaY < 0) { // Scroll up - next mode
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setMode(modes[nextIndex]);
      } else if (e.deltaY > 0) { // Scroll down - previous mode
        const prevIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
        this.setMode(modes[prevIndex]);
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



  // Mode Management
  async setMode(mode) {
    if (this.currentMode === mode) return;
    
    const startTime = performance.now();
    
    // Check if we have tabs or document content
    const hasContent = this.tabManager.hasTabs() || this.documentComponent.getDocumentState().hasDocument;
    if (!hasContent && (mode === 'code' || mode === 'split')) {
      return;
    }
    
    // Save current scroll position to active tab
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      this.saveScrollPositionToTab(activeTab);
    }
    
    // Load Monaco Editor lazily when switching to code or split mode
    if ((mode === 'code' || mode === 'split') && !this.editorComponent.isMonacoLoaded) {
      try {
        await this.editorComponent.loadMonacoEditor();
      } catch (error) {
        console.error('[MarkdownEditor] Failed to load Monaco Editor:', error);
        mode = 'preview'; // Fall back to preview mode
      }
    }
    
    this.currentMode = mode;
    

    
    // Update main content class
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add(`${mode}-mode`);
    }
    
    // Update body class for CSS selectors
    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Show/hide appropriate panes based on mode
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const splitter = document.getElementById('splitter');
    
    if (editorPane && previewPane && splitter) {
      // Immediately reset all displays to prevent dual pane issues
      editorPane.style.display = 'none';
      previewPane.style.display = 'none';
      splitter.style.display = 'none';
      
      // Force a reflow to ensure the reset takes effect
      editorPane.offsetHeight;
      previewPane.offsetHeight;
      
      // Apply mode-specific display settings
      switch (mode) {
        case 'code':
          editorPane.style.display = 'block';
          break;
        case 'preview':
          previewPane.style.display = 'block';
          break;
        case 'split':
          editorPane.style.display = 'block';
          previewPane.style.display = 'block';
          splitter.style.display = 'block';
          break;
      }
      
      // Trigger Monaco layout after display changes
      if (this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
        setTimeout(() => {
          this.editorComponent.monacoEditor.layout();
        }, 50);
      }
    }
    
    // Notify toolbar component
    this.toolbarComponent.emit('mode-changed', { mode });
    
    // Update system info with new mode
    this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
    
    // Update scroll sync button visibility and tooltip
    this.updateScrollSyncButton();
    
    // Layout update is now handled in the display logic above
    
    // Restore scroll position after layout
    setTimeout(() => {
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.restoreScrollPositionFromTab(activeTab);
      }
    }, 100);
    
    this.lastModeSwitchTime = performance.now() - startTime;
    this.settingsController.setLastModeSwitchTime(this.lastModeSwitchTime);
  }
  
  saveScrollPositionToTab(tab) {
    const editor = this.editorComponent.monacoEditor;
    const previewPane = document.querySelector('.preview-pane');
    
    if (editor) {
      const viewState = editor.saveViewState();
      this.tabManager.saveTabEditorState(tab.id, viewState);
    }
    
    if (previewPane) {
      this.tabManager.updateTabScroll(tab.id, null, previewPane.scrollTop);
    }
  }
  
  restoreScrollPositionFromTab(tab) {
    const editor = this.editorComponent.monacoEditor;
    const previewPane = document.querySelector('.preview-pane');
    
    if ((this.currentMode === 'code' || this.currentMode === 'split') && editor && tab.editorViewState) {
      editor.restoreViewState(tab.editorViewState);
    }
    
    if ((this.currentMode === 'preview' || this.currentMode === 'split') && previewPane && tab.scrollPosition?.preview) {
      previewPane.scrollTop = tab.scrollPosition.preview;
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



  // Export Functions
  async exportToHtml() {
    try {
      const content = this.editorComponent.getContent();
      const previewHtml = document.getElementById('preview').innerHTML;
      
      const htmlDocument = this.createExportHtmlDocument(previewHtml);
      await this.saveHtmlFile(htmlDocument);
      
    } catch (error) {
      this.handleError(error, 'HTML Export');
    }
  }

  async exportToPdf() {
    try {
      window.print();
    } catch (error) {
      this.handleError(error, 'PDF Export');
    }
  }

  createExportHtmlDocument(previewHtml) {
    const styles = `body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #24292f;
    }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    code { background-color: #f6f8fa; padding: 0.2em 0.4em; border-radius: 6px; }
    pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    blockquote { border-left: 0.25em solid #d0d7de; padding: 0 1em; color: #656d76; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 6px 13px; text-align: left; }
    th { background-color: #f6f8fa; }
    .task-list-item { list-style: none; }
    .mermaid-diagram { text-align: center; margin: 20px 0; }`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>${styles}</style>
</head>
<body>
    ${previewHtml}
</body>
</html>`;
  }

  async saveHtmlFile(htmlDocument) {
    if (!window.__TAURI__) return;
    
    const filePath = await window.__TAURI__.dialog.save({
      filters: [{ name: 'HTML', extensions: ['html'] }]
    });
    
    if (filePath) {
      await window.__TAURI__.fs.writeTextFile(filePath, htmlDocument);
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

  handleMarkdownAction(action) {
    if (!this.editorComponent.isMonacoLoaded || !this.editorComponent.monacoEditor) return;
    
    const editor = this.editorComponent.monacoEditor;
    const model = editor.getModel();
    const selection = editor.getSelection();
    const position = editor.getPosition();
    let selectedText = '';
    let isMultiLine = false;
    
    if (selection && !selection.isEmpty()) {
      selectedText = model.getValueInRange(selection);
      isMultiLine = selection.startLineNumber !== selection.endLineNumber;
    }
    
    // Handle multi-line selections
    if (isMultiLine && ['bold', 'italic', 'strikethrough', 'underline', 'h1', 'h2', 'h3', 'ul', 'ol', 'task', 'quote', 'code'].includes(action)) {
      this.handleMultiLineFormatting(editor, selection, action);
      return;
    }
    
    let replacement = '';
    let insertAtNewLine = false;
    let cursorOffset = 0;
    
    switch (action) {
      // Text formatting
      case 'bold':
        replacement = selectedText ? `**${selectedText}**` : '**text**';
        cursorOffset = selectedText ? 0 : -6;
        break;
      case 'italic':
        replacement = selectedText ? `*${selectedText}*` : '*text*';
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'strikethrough':
        replacement = selectedText ? `~~${selectedText}~~` : '~~text~~';
        cursorOffset = selectedText ? 0 : -6;
        break;
      case 'underline':
        replacement = selectedText ? `<u>${selectedText}</u>` : '<u>text</u>';
        cursorOffset = selectedText ? 0 : -7;
        break;
        
      // Headings
      case 'h1':
        replacement = selectedText ? `# ${selectedText}` : '# Heading 1';
        insertAtNewLine = true;
        break;
      case 'h2':
        replacement = selectedText ? `## ${selectedText}` : '## Heading 2';
        insertAtNewLine = true;
        break;
      case 'h3':
        replacement = selectedText ? `### ${selectedText}` : '### Heading 3';
        insertAtNewLine = true;
        break;
        
      // Links and media
      case 'link':
        replacement = selectedText ? `[${selectedText}](url)` : '[link text](url)';
        cursorOffset = selectedText ? -4 : -4;
        break;
      case 'image':
        replacement = selectedText ? `![${selectedText}](image-url)` : '![alt text](image-url)';
        cursorOffset = selectedText ? -12 : -12;
        break;
        
      // Lists
      case 'ul':
        replacement = selectedText ? `- ${selectedText}` : '- List item';
        insertAtNewLine = true;
        break;
      case 'ol':
        replacement = selectedText ? `1. ${selectedText}` : '1. List item';
        insertAtNewLine = true;
        break;
      case 'task':
        replacement = selectedText ? `- [ ] ${selectedText}` : '- [ ] Task item';
        insertAtNewLine = true;
        break;
        
      // Table
      case 'table':
        replacement = `| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |`;
        insertAtNewLine = true;
        break;
        
      // Code
      case 'code':
        replacement = selectedText ? `\`${selectedText}\`` : '`code`';
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'codeblock':
        replacement = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\ncode block\n```';
        cursorOffset = selectedText ? 0 : -15;
        insertAtNewLine = true;
        break;
        
      // Quote
      case 'quote':
        replacement = selectedText ? `> ${selectedText}` : '> Quote text';
        insertAtNewLine = true;
        break;
        
      // Text alignment
      case 'align-left':
      case 'align-center':
      case 'align-right':
      case 'align-justify':
        if (isMultiLine) {
          this.handleMultiLineAlignment(editor, selection, action);
          return;
        }
        
        if (action === 'align-left') {
          if (selectedText) {
            let cleanText = selectedText
              .replace(/<div align="(center|right|justify)">([\s\S]*?)<\/div>/gi, '$2')
              .replace(/^\s+|\s+$/g, '');
            replacement = cleanText;
          } else {
            return;
          }
        } else {
          const alignType = action.replace('align-', '');
          if (selectedText) {
            let cleanText = selectedText
              .replace(/<div align="(left|center|right|justify)">([\s\S]*?)<\/div>/gi, '$2')
              .replace(/^\s+|\s+$/g, '');
            replacement = `<div align="${alignType}">${cleanText}</div>`;
          } else {
            replacement = `<div align="${alignType}">Text aligned ${alignType}</div>`;
          }
        }
        break;
        
      default:
        return;
    }
    
    // Handle insertion
    if (insertAtNewLine && !selectedText) {
      const lineContent = model.getLineContent(position.lineNumber);
      if (lineContent.trim() === '') {
        editor.executeEdits('markdown-toolbar', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column),
          text: replacement
        }]);
      } else {
        editor.executeEdits('markdown-toolbar', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: `\n${replacement}`
        }]);
      }
    } else if (selection && !selection.isEmpty()) {
      editor.executeEdits('markdown-toolbar', [{
        range: selection,
        text: replacement
      }]);
    } else {
      editor.executeEdits('markdown-toolbar', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: replacement
      }]);
      
      if (cursorOffset !== 0) {
        const newPosition = editor.getPosition();
        const targetColumn = newPosition.column + cursorOffset;
        editor.setPosition({
          lineNumber: newPosition.lineNumber,
          column: Math.max(1, targetColumn)
        });
      }
    }
    
    editor.focus();
    this.documentComponent.handleContentChange(editor.getValue());
  }
  
  handleMultiLineFormatting(editor, selection, action) {
    const model = editor.getModel();
    const edits = [];
    
    for (let lineNum = selection.startLineNumber; lineNum <= selection.endLineNumber; lineNum++) {
      const lineContent = model.getLineContent(lineNum);
      if (lineContent.trim() === '') continue;
      
      let newContent = '';
      
      switch (action) {
        case 'bold':
          newContent = `**${lineContent}**`;
          break;
        case 'italic':
          newContent = `*${lineContent}*`;
          break;
        case 'strikethrough':
          newContent = `~~${lineContent}~~`;
          break;
        case 'underline':
          newContent = `<u>${lineContent}</u>`;
          break;
        case 'h1':
          newContent = `# ${lineContent}`;
          break;
        case 'h2':
          newContent = `## ${lineContent}`;
          break;
        case 'h3':
          newContent = `### ${lineContent}`;
          break;
        case 'ul':
          newContent = `- ${lineContent}`;
          break;
        case 'ol':
          newContent = `${lineNum - selection.startLineNumber + 1}. ${lineContent}`;
          break;
        case 'task':
          newContent = `- [ ] ${lineContent}`;
          break;
        case 'quote':
          newContent = `> ${lineContent}`;
          break;
        case 'code':
          newContent = `\`${lineContent}\``;
          break;
      }
      
      edits.push({
        range: new monaco.Range(lineNum, 1, lineNum, lineContent.length + 1),
        text: newContent
      });
    }
    
    editor.executeEdits('markdown-toolbar-multiline', edits);
    this.documentComponent.handleContentChange(editor.getValue());
  }
  
  handleMultiLineAlignment(editor, selection, action) {
    const model = editor.getModel();
    const edits = [];
    const alignType = action.replace('align-', '');
    
    for (let lineNum = selection.startLineNumber; lineNum <= selection.endLineNumber; lineNum++) {
      const lineContent = model.getLineContent(lineNum);
      if (lineContent.trim() === '') continue;
      
      let newContent = '';
      
      if (alignType === 'left') {
        // Remove existing alignment
        newContent = lineContent.replace(/<div align="(center|right|justify)">([\s\S]*?)<\/div>/gi, '$2').trim();
      } else {
        // Remove existing alignment first, then apply new alignment
        let cleanContent = lineContent.replace(/<div align="(left|center|right|justify)">([\s\S]*?)<\/div>/gi, '$2').trim();
        newContent = `<div align="${alignType}">${cleanContent}</div>`;
      }
      
      edits.push({
        range: new monaco.Range(lineNum, 1, lineNum, lineContent.length + 1),
        text: newContent
      });
    }
    
    editor.executeEdits('markdown-toolbar-alignment', edits);
    this.documentComponent.handleContentChange(editor.getValue());
  }
  
  insertMarkdownText(text) {
    if (!this.editorComponent.isMonacoLoaded || !this.editorComponent.monacoEditor) {
      return;
    }
    
    const editor = this.editorComponent.monacoEditor;
    const position = editor.getPosition();
    
    editor.executeEdits('markdown-insert', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: text
    }]);
    
    editor.focus();
    this.documentComponent.handleContentChange(editor.getValue());
  }

  updateTaskInMarkdown(taskText, checked) {
    const content = this.editorComponent.getContent();
    const lines = content.split('\n');
    let inCodeBlock = false;
    let matchingLines = [];
    
    // Normalize task text for better matching
    const normalizeText = (text) => {
      return text
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .replace(/[\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, ' ') // Replace various unicode spaces
        .trim()
        .toLowerCase();
    };
    
    const normalizedTaskText = normalizeText(taskText);
    
    // Find all lines that contain the task text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track code blocks
      if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      if (inCodeBlock) continue;
      
      // Enhanced task list patterns with more comprehensive regex
      const taskPatterns = [
        /^(\s*)[-*+] \[([ xX])\]\s*(.*)$/,     // Standard bullets with x or X
        /^(\s*)\d+\. \[([ xX])\]\s*(.*)$/,    // Numbered lists
        /^(\s*)[-*+]\s*\[([ xX])\]\s*(.*)$/,  // Bullets without space before bracket
        /^(\s*)\d+\.\s*\[([ xX])\]\s*(.*)$/   // Numbered without space before bracket
      ];
      
      for (const pattern of taskPatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, indent, checkState, taskContent] = match;
          const normalizedLineText = normalizeText(taskContent);
          
          // Multiple matching strategies for better accuracy
          const isMatch = 
            normalizedLineText === normalizedTaskText ||                    // Exact match
            normalizedLineText.includes(normalizedTaskText) ||              // Contains match
            normalizedTaskText.includes(normalizedLineText) ||              // Reverse contains
            this.fuzzyMatch(normalizedLineText, normalizedTaskText, 0.8);   // Fuzzy match
          
          if (isMatch) {
            matchingLines.push({ 
              index: i, 
              indent, 
              checkState: checkState.toLowerCase(),
              taskContent: taskContent.trim(),
              normalizedContent: normalizedLineText,
              similarity: this.calculateSimilarity(normalizedLineText, normalizedTaskText)
            });
            break;
          }
        }
      }
    }
    
    // If multiple matches, prefer the one with highest similarity
    if (matchingLines.length > 1) {
      // Sort by similarity (highest first)
      matchingLines.sort((a, b) => b.similarity - a.similarity);
      
      // If top matches have very similar scores, show conflict modal
      if (matchingLines.length > 1 && 
          Math.abs(matchingLines[0].similarity - matchingLines[1].similarity) < 0.1) {
        this.showTaskConflictModal(taskText, matchingLines.length);
        return;
      }
      
      // Use the best match
      matchingLines = [matchingLines[0]];
    }
    
    // Update the matching task
    if (matchingLines.length === 1) {
      const match = matchingLines[0];
      const lineIndex = match.index;
      const line = lines[lineIndex];
      
      // Update checkbox state while preserving all formatting
      const updatedLine = line.replace(/\[([ xX])\]/, checked ? '[x]' : '[ ]');
      lines[lineIndex] = updatedLine;
      
      const newContent = lines.join('\n');
      this.editorComponent.setContent(newContent);
      this.documentComponent.handleContentChange(newContent);
    } else {
      console.warn('[MarkdownEditor] Could not find matching task for:', taskText);
    }
  }
  
  // Helper method for fuzzy string matching
  fuzzyMatch(str1, str2, threshold = 0.8) {
    const similarity = this.calculateSimilarity(str1, str2);
    return similarity >= threshold;
  }
  
  // Calculate similarity between two strings using Levenshtein distance
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }
  
  showTaskConflictModal(taskText, count) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('task-conflict-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'task-conflict-modal';
      modal.className = 'task-conflict-modal';
      modal.innerHTML = `
        <div class="task-conflict-overlay"></div>
        <div class="task-conflict-window">
          <div class="task-conflict-header">
            <h3>Task Conflict Detected</h3>
          </div>
          <div class="task-conflict-content">
            <p>Multiple tasks with the same name were found:</p>
            <p><strong id="conflict-task-text"></strong></p>
            <p>Found <span id="conflict-count"></span> tasks with this name. Please use unique task names to avoid conflicts.</p>
          </div>
          <div class="task-conflict-buttons">
            <button id="conflict-ok-btn" class="task-conflict-btn primary">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listeners
      const okBtn = modal.querySelector('#conflict-ok-btn');
      const overlay = modal.querySelector('.task-conflict-overlay');
      
      const closeModal = () => {
        modal.style.display = 'none';
      };
      
      okBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);
    }
    
    // Update modal content
    modal.querySelector('#conflict-task-text').textContent = taskText;
    modal.querySelector('#conflict-count').textContent = count;
    
    // Show modal
    modal.style.display = 'flex';
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
    if (this.currentMode === 'preview') {
      // Use browser's native find for preview mode
      document.execCommand('find');
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
    this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
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
          this.setMode(defaultMode);
        }
        return;
      }
      
      // Code mode: insert file paths
      if (this.currentMode === 'code' && this.editorComponent.isMonacoLoaded) {
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
      if (isScrolling || this.currentMode !== 'split') return;
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
      if (isScrolling || this.currentMode !== 'split') return;
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
    
    if (this.currentMode === 'code' && activeTab.scrollPosition?.preview !== undefined) {
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
      scrollRatio = Math.min(1, scrollRatio * 5);
      
      const editorScrollHeight = editor.getScrollHeight();
      const editorHeight = editor.getLayoutInfo().height;
      const editorMaxScroll = Math.max(0, editorScrollHeight - editorHeight);
      const targetScroll = scrollRatio * editorMaxScroll;
      
      editor.setScrollTop(targetScroll);
      
      if (wasHidden) {
        previewPane.style.display = 'none';
      }
      
    } else if (this.currentMode === 'preview') {
      // Sync from Code to Preview
      const editorScrollTop = editor.getScrollTop();
      const editorHeight = editor.getLayoutInfo().height;
      const editorScrollHeight = editor.getScrollHeight();
      const editorMaxScroll = Math.max(0, editorScrollHeight - editorHeight);
      
      let scrollRatio = 0;
      if (editorMaxScroll > 0) {
        scrollRatio = editorScrollTop / editorMaxScroll;
      }
      
      const amplifiedRatio = Math.min(1, scrollRatio * 1.3);
      
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
    const showButton = hasDocument && !isWelcomeVisible && (this.currentMode === 'code' || this.currentMode === 'preview');
    
    scrollSyncBtn.style.display = showButton ? 'inline-flex' : 'none';
    
    if (showButton) {
      if (this.currentMode === 'code') {
        scrollSyncBtn.setAttribute('title', 'Sync from Preview');
      } else if (this.currentMode === 'preview') {
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
      if (previewPane) {
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
    if (this.currentMode === 'preview' || this.currentMode === 'split') {
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
      this.setMode(this.currentMode);
    }, 10);
    
    // Restore preview scroll position
    if (tab.scrollPosition?.preview) {
      setTimeout(() => {
        const previewPane = document.querySelector('.preview-pane');
        if (previewPane) {
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
      if (this.currentMode === 'preview' || this.currentMode === 'split') {
        this.previewComponent.showPreview();
      }
      
      // Ensure current mode is maintained after tab switch
      this.setMode(this.currentMode);
      
      // Restore preview scroll position
      if (tab.scrollPosition?.preview) {
        setTimeout(() => {
          const previewPane = document.querySelector('.preview-pane');
          if (previewPane) {
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
    this.setMode('preview');
    
    // Force update tab UI to show Welcome instead of tabs
    this.updateTabUIForWelcome();
    
    // Update scroll sync button
    this.updateScrollSyncButton();
  }
  
  updateTabUI() {
    const filenameBtn = document.getElementById('filename');
    const tabDropdownList = document.getElementById('tab-dropdown-list');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    
    if (!filenameBtn || !tabDropdownList || !tabMoreBtn) return;
    
    // Update pinned tabs if enabled
    if (this.pinnedTabsEnabled) {
      this.updatePinnedTabs();
    }
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    // Check if we're on welcome screen
    const welcomePage = document.getElementById('welcome-page');
    const isWelcomeVisible = welcomePage && welcomePage.style.display !== 'none';
    
    if (tabs.length === 0) {
      // No tabs - show default filename
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.remove('has-tabs');
      tabMoreBtn.style.display = 'none';
      this.updateScrollSyncButton();
      return;
    }
    
    // If on welcome screen but have tabs, show Welcome but enable tab functionality
    if (isWelcomeVisible) {
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.add('has-tabs'); // Enable dropdown functionality
    } else if (activeTab) {
      // Show active tab name when not on welcome screen
      const displayName = `${activeTab.fileName}${activeTab.isDirty ? ' *' : ''}`;
      filenameBtn.textContent = displayName;
      filenameBtn.classList.add('has-tabs');
    }
    
    // Clear existing dropdown items
    tabDropdownList.innerHTML = '';
    
    // Show up to 9 most recent tabs in dropdown (newest first)
    const visibleTabs = tabs.slice(0, 9);
    const showMoreBtn = tabs.length > 9;
    
    visibleTabs.forEach((tab, index) => {
      const tabElement = this.createDropdownTabElement(tab, activeTab, index);
      tabDropdownList.appendChild(tabElement);
    });
    
    // Show/hide more button
    tabMoreBtn.style.display = showMoreBtn ? 'block' : 'none';
    
    // Auto-scroll dropdown to active tab if dropdown is open
    if (activeTab) {
      setTimeout(() => {
        const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
        if (tabDropdownMenu && tabDropdownMenu.classList.contains('show')) {
          const activeElement = tabDropdownList.querySelector('.tab-dropdown-item.active');
          if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 50);
    }
    
    // Update scroll sync button
    this.updateScrollSyncButton();
  }
  
  updateTabUIForWelcome() {
    const filenameBtn = document.getElementById('filename');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    
    if (filenameBtn) {
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.remove('has-tabs');
    }
    
    if (tabMoreBtn) {
      tabMoreBtn.style.display = 'none';
    }
  }
  
  createDropdownTabElement(tab, activeTab, index) {
    const tabElement = document.createElement('div');
    tabElement.className = `tab-dropdown-item ${tab.id === activeTab?.id ? 'active' : ''}`;
    tabElement.title = tab.filePath || tab.fileName;
    
    // Tab number
    const tabNumber = document.createElement('div');
    tabNumber.className = 'tab-dropdown-number';
    tabNumber.textContent = (index + 1).toString();
    tabElement.appendChild(tabNumber);
    
    // Tab info
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-dropdown-info';
    
    const tabName = document.createElement('div');
    tabName.className = `tab-dropdown-name ${tab.isDirty ? 'dirty' : ''}`;
    tabName.textContent = tab.fileName;
    tabInfo.appendChild(tabName);
    
    tabElement.appendChild(tabInfo);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-dropdown-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.tabManager.closeTab(tab.id);
      this.hideTabDropdown();
    };
    tabElement.appendChild(closeBtn);
    
    // Click to switch tab
    tabElement.onclick = () => {
      this.switchToTab(tab.id);
      this.hideTabDropdown();
    };
    
    // Right-click for context menu
    tabElement.oncontextmenu = (e) => {
      this.showTabContextMenu(e, tab.id);
    };
    
    return tabElement;
  }
  
  setupTabDropdown() {
    const filenameBtn = document.getElementById('filename');
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    const tabModal = document.getElementById('tab-modal');
    const tabModalClose = document.getElementById('tab-modal-close');
    const tabModalOverlay = document.querySelector('.tab-modal-overlay');
    const tabSearchInput = document.getElementById('tab-search');
    
    // Filename button click to toggle dropdown
    if (filenameBtn) {
      filenameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.tabManager.hasTabs()) {
          this.toggleTabDropdown();
        }
      });
    }
    
    // More button click to show modal
    if (tabMoreBtn) {
      tabMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideTabDropdown();
        this.showTabModal();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (tabDropdownMenu && !tabDropdownMenu.contains(e.target) && e.target !== filenameBtn) {
        this.hideTabDropdown();
      }
    });
    
    // Tab modal handlers
    if (tabModalClose) {
      tabModalClose.addEventListener('click', () => {
        this.hideTabModal();
      });
    }
    
    if (tabModalOverlay) {
      tabModalOverlay.addEventListener('click', () => {
        this.hideTabModal();
      });
    }
    
    // Tab search functionality
    if (tabSearchInput) {
      tabSearchInput.addEventListener('input', (e) => {
        this.filterTabModal(e.target.value);
      });
      
      // Keyboard navigation in search
      tabSearchInput.addEventListener('keydown', (e) => {
        this.handleTabModalKeyboard(e);
      });
    }
    
    // Global keyboard shortcuts for tab navigation
    this.setupTabKeyboardShortcuts();
    
    // Context menu setup
    this.setupTabContextMenu();
  }
  
  toggleTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      const isVisible = tabDropdownMenu.classList.contains('show');
      if (isVisible) {
        this.hideTabDropdown();
      } else {
        this.showTabDropdown();
      }
    }
  }
  
  showTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      tabDropdownMenu.classList.add('show');
      
      // Auto-scroll to active tab when dropdown opens
      setTimeout(() => {
        const tabDropdownList = document.getElementById('tab-dropdown-list');
        const activeElement = tabDropdownList?.querySelector('.tab-dropdown-item.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }
  
  hideTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      tabDropdownMenu.classList.remove('show');
    }
  }
  
  showTabModal() {
    const tabModal = document.getElementById('tab-modal');
    const tabModalList = document.getElementById('tab-modal-list');
    const tabSearchInput = document.getElementById('tab-search');
    
    if (!tabModal || !tabModalList) return;
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    // Clear existing items
    tabModalList.innerHTML = '';
    
    // Show modal even with no tabs or few tabs
    if (tabs.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'tab-modal-empty';
      emptyMessage.textContent = 'No tabs open';
      tabModalList.appendChild(emptyMessage);
    } else {
      tabs.forEach(tab => {
        const item = this.createTabModalItem(tab, activeTab);
        tabModalList.appendChild(item);
      });
    }
    
    // Clear search and focus
    if (tabSearchInput) {
      tabSearchInput.value = '';
      setTimeout(() => tabSearchInput.focus(), 100);
    }
    
    tabModal.style.display = 'flex';
  }
  
  hideTabModal() {
    const tabModal = document.getElementById('tab-modal');
    if (tabModal) {
      tabModal.style.display = 'none';
      
      // Clear keyboard focus
      const items = tabModal.querySelectorAll('.tab-modal-item');
      items.forEach(item => item.classList.remove('keyboard-focus'));
    }
  }
  
  createTabModalItem(tab, activeTab) {
    const item = document.createElement('div');
    item.className = `tab-modal-item ${tab.id === activeTab?.id ? 'active' : ''}`;
    
    // Check if this tab is in the top 9 (dropdown)
    const allTabs = this.tabManager.getAllTabs();
    const tabIndex = allTabs.findIndex(t => t.id === tab.id);
    const isInDropdown = tabIndex < 9;
    
    // Add position number for top 9 tabs
    if (isInDropdown) {
      const number = document.createElement('div');
      number.className = 'tab-modal-number';
      number.textContent = (tabIndex + 1).toString();
      item.appendChild(number);
    }
    
    const info = document.createElement('div');
    info.className = 'tab-modal-info';
    
    const name = document.createElement('div');
    name.className = 'tab-modal-name';
    name.textContent = `${tab.fileName}${tab.isDirty ? ' •' : ''}`;
    info.appendChild(name);
    
    if (tab.filePath) {
      const path = document.createElement('div');
      path.className = 'tab-modal-path';
      path.textContent = tab.filePath;
      info.appendChild(path);
    }
    
    item.appendChild(info);
    
    const actions = document.createElement('div');
    actions.className = 'tab-modal-actions';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-modal-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.tabManager.closeTab(tab.id);
      // Modal will be updated by the tab-removed event handler
    };
    actions.appendChild(closeBtn);
    
    item.appendChild(actions);
    
    // Click to switch tab
    item.onclick = () => {
      this.switchToTab(tab.id);
      this.hideTabModal();
    };
    
    // Right-click for context menu
    item.oncontextmenu = (e) => {
      this.showTabContextMenu(e, tab.id);
    };
    
    return item;
  }

  // Enhanced Tab Features - Phase 4
  
  setupTabKeyboardShortcuts() {
    // Alt+1-9 for switching to numbered tabs in dropdown (most recent first)
    // On macOS, also support Cmd+1-9 as an alternative
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const useAltKey = e.altKey || (isMac && e.metaKey);
      
      if (useAltKey && e.key >= '1' && e.key <= '9') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = this.tabManager.getAllTabs();
        const availableTabs = tabs.slice(0, 9); // First 9 tabs (most recent first)
        
        if (availableTabs[tabIndex]) {
          e.preventDefault();
          this.switchToTab(availableTabs[tabIndex].id);
        }
      }
    });
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
  
  setupTabContextMenu() {
    // Create context menu if it doesn't exist
    let contextMenu = document.getElementById('tab-context-menu');
    if (!contextMenu) {
      contextMenu = document.createElement('div');
      contextMenu.id = 'tab-context-menu';
      contextMenu.className = 'tab-context-menu';
      contextMenu.innerHTML = `
        <div class="tab-context-item submenu-parent" data-action="move-to">
          Move to...
          <span class="submenu-arrow">▶</span>
          <div class="tab-context-submenu">
            <button class="tab-context-item" data-action="move-to-1">Position 1</button>
            <button class="tab-context-item" data-action="move-to-2">Position 2</button>
            <button class="tab-context-item" data-action="move-to-3">Position 3</button>
            <button class="tab-context-item" data-action="move-to-4">Position 4</button>
            <button class="tab-context-item" data-action="move-to-5">Position 5</button>
          </div>
        </div>
        <div class="tab-context-separator"></div>
        <button class="tab-context-item" data-action="close">Close Tab</button>
        <button class="tab-context-item" data-action="close-others">Close Others</button>
        <button class="tab-context-item" data-action="close-all">Close All</button>
        <div class="tab-context-separator"></div>
        <button class="tab-context-item" data-action="toggle-pinned">Toggle Pinned Tabs</button>
        <button class="tab-context-item" data-action="duplicate">Duplicate Tab</button>
        <button class="tab-context-item" data-action="reveal">Reveal in Explorer</button>
      `;
      document.body.appendChild(contextMenu);
      
      // Add submenu hover functionality
      const submenuParent = contextMenu.querySelector('.submenu-parent');
      if (submenuParent) {
        submenuParent.addEventListener('mouseenter', () => {
          submenuParent.classList.add('submenu-open');
        });
        submenuParent.addEventListener('mouseleave', () => {
          submenuParent.classList.remove('submenu-open');
        });
      }
    }
    
    // Context menu event handlers
    contextMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action && this.contextMenuTabId) {
        this.handleTabContextAction(action, this.contextMenuTabId);
      }
      this.hideTabContextMenu();
    });
    
    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!contextMenu.contains(e.target)) {
        this.hideTabContextMenu();
      }
    });
  }
  
  showTabContextMenu(e, tabId) {
    e.preventDefault();
    e.stopPropagation();
    
    const contextMenu = document.getElementById('tab-context-menu');
    if (!contextMenu) return;
    
    this.contextMenuTabId = tabId;
    
    // Show menu first to get dimensions
    contextMenu.classList.add('show');
    
    // Calculate position to prevent overflow
    const menuRect = contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = e.clientX;
    let top = e.clientY;
    
    // Adjust horizontal position if menu would overflow
    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 10;
    }
    
    // Adjust vertical position if menu would overflow
    if (top + menuRect.height > viewportHeight) {
      top = viewportHeight - menuRect.height - 10;
    }
    
    // Ensure menu doesn't go off-screen
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
    
    // Update menu items based on context
    const tabs = this.tabManager.getAllTabs();
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const closeOthersBtn = contextMenu.querySelector('[data-action="close-others"]');
    const closeAllBtn = contextMenu.querySelector('[data-action="close-all"]');
    const revealBtn = contextMenu.querySelector('[data-action="reveal"]');
    
    // Update position buttons - disable current position
    for (let i = 1; i <= 5; i++) {
      const posBtn = contextMenu.querySelector(`[data-action="move-to-${i}"]`);
      if (posBtn) {
        posBtn.disabled = tabIndex === (i - 1);
      }
    }
    
    if (closeOthersBtn) {
      closeOthersBtn.disabled = tabs.length <= 1;
    }
    if (closeAllBtn) {
      closeAllBtn.disabled = tabs.length === 0;
    }
    if (revealBtn) {
      const tab = this.tabManager.getTab(tabId);
      revealBtn.disabled = !tab || !tab.filePath;
    }
  }
  
  hideTabContextMenu() {
    const contextMenu = document.getElementById('tab-context-menu');
    if (contextMenu) {
      contextMenu.classList.remove('show');
    }
    this.contextMenuTabId = null;
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
        const position = parseInt(action.split('-')[2]) - 1; // Convert to 0-based index
        this.moveTabToPosition(tabId, position);
        // Refresh modal if it's open
        const tabModal = document.getElementById('tab-modal');
        if (tabModal && tabModal.style.display === 'flex') {
          this.showTabModal();
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
        this.togglePinnedTabs();
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
  
  filterTabModal(searchTerm) {
    const tabModalList = document.getElementById('tab-modal-list');
    if (!tabModalList) return;
    
    const items = tabModalList.querySelectorAll('.tab-modal-item');
    const term = searchTerm.toLowerCase().trim();
    
    let visibleCount = 0;
    items.forEach(item => {
      const name = item.querySelector('.tab-modal-name')?.textContent?.toLowerCase() || '';
      const path = item.querySelector('.tab-modal-path')?.textContent?.toLowerCase() || '';
      
      const matches = !term || name.includes(term) || path.includes(term);
      
      if (matches) {
        item.classList.remove('filtered-out');
        visibleCount++;
      } else {
        item.classList.add('filtered-out');
      }
    });
    
    // Show empty state if no matches
    let emptyState = tabModalList.querySelector('.tab-modal-empty');
    if (visibleCount === 0 && term) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'tab-modal-empty';
        emptyState.textContent = 'No tabs match your search';
        tabModalList.appendChild(emptyState);
      }
      emptyState.style.display = 'block';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
  
  handleTabModalKeyboard(e) {
    const tabModalList = document.getElementById('tab-modal-list');
    if (!tabModalList) return;
    
    const visibleItems = Array.from(tabModalList.querySelectorAll('.tab-modal-item:not(.filtered-out)'));
    if (visibleItems.length === 0) return;
    
    let currentIndex = visibleItems.findIndex(item => item.classList.contains('keyboard-focus'));
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < visibleItems.length - 1) {
          this.setTabModalKeyboardFocus(currentIndex + 1, visibleItems);
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          this.setTabModalKeyboardFocus(currentIndex - 1, visibleItems);
        } else if (currentIndex === -1 && visibleItems.length > 0) {
          this.setTabModalKeyboardFocus(visibleItems.length - 1, visibleItems);
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && visibleItems[currentIndex]) {
          visibleItems[currentIndex].click();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.hideTabModal();
        break;
    }
  }
  
  setTabModalKeyboardFocus(index, items) {
    // Remove existing focus
    items.forEach(item => item.classList.remove('keyboard-focus'));
    
    // Set new focus
    if (index >= 0 && index < items.length) {
      items[index].classList.add('keyboard-focus');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }
  
  // Move tab to specific position
  moveTabToPosition(tabId, targetIndex) {
    if (this.tabManager.moveTabToPosition(tabId, targetIndex)) {
      this.tabManager.persistTabs();
      this.updateTabUI();
    }
  }
  
  // Pinned Tabs Methods

  
  togglePinnedTabs() {
    const currentEnabled = this.settingsController.getPinnedTabsEnabled();
    this.settingsController.pinnedTabsEnabled = !currentEnabled;
    localStorage.setItem('markdownViewer_pinnedTabs', (!currentEnabled).toString());
    this.settingsController.applyPinnedTabsVisibility();
    if (!currentEnabled) {
      this.updatePinnedTabs();
    }
    this.updateSettingsDisplay();
  }
  
  updatePinnedTabs() {
    const pinnedTabsList = document.getElementById('pinned-tabs-list');
    if (!pinnedTabsList) return;
    
    pinnedTabsList.innerHTML = '';
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    tabs.forEach((tab, index) => {
      const pinnedTab = document.createElement('div');
      pinnedTab.className = `pinned-tab ${tab.id === activeTab?.id ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`;
      
      // Add number for first 9 tabs
      if (index < 9) {
        const tabNumber = document.createElement('div');
        tabNumber.className = 'pinned-tab-number';
        tabNumber.textContent = (index + 1).toString();
        pinnedTab.appendChild(tabNumber);
      }
      
      const tabName = document.createElement('div');
      tabName.className = 'pinned-tab-name';
      tabName.textContent = tab.fileName;
      tabName.title = tab.filePath || tab.fileName;
      pinnedTab.appendChild(tabName);
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'pinned-tab-close';
      closeBtn.innerHTML = '×';
      closeBtn.title = 'Close tab';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.tabManager.closeTab(tab.id);
      };
      pinnedTab.appendChild(closeBtn);
      
      pinnedTab.onclick = () => {
        this.switchToTab(tab.id);
      };
      
      pinnedTab.oncontextmenu = (e) => {
        this.showTabContextMenu(e, tab.id);
      };
      
      pinnedTabsList.appendChild(pinnedTab);
    });
    
    // Auto-scroll to active tab
    if (activeTab) {
      setTimeout(() => {
        const activeElement = pinnedTabsList.querySelector('.pinned-tab.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
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
        } else if (this.currentMode === 'code' && this.editorComponent.isMonacoLoaded) {
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
    
    // Clean up context menu
    const contextMenu = document.getElementById('tab-context-menu');
    if (contextMenu) {
      contextMenu.remove();
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
    this.currentMode = 'preview';
    this.isDistractionFree = false;
  }
}

// Export for use in main application
window.MarkdownEditor = MarkdownEditor;