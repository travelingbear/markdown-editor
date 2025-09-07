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
    
    // Application state
    this.currentMode = 'preview';
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.isRetroTheme = localStorage.getItem('markdownViewer_retroTheme') === 'true';
    this.defaultMode = localStorage.getItem('markdownViewer_defaultMode') || 'preview';
    this.isDistractionFree = false;
    this.centeredLayoutEnabled = localStorage.getItem('markdownViewer_centeredLayout') === 'true';
    this.suggestionsEnabled = localStorage.getItem('markdownViewer_suggestionsEnabled') === 'true';
    this.isToolbarEnabled = localStorage.getItem('markdownViewer_toolbarEnabled') !== 'false';
    this.isSplashEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration') || '1');
    this.mainToolbarSize = localStorage.getItem('markdownViewer_mainToolbarSize') || 'medium';
    this.mdToolbarSize = localStorage.getItem('markdownViewer_mdToolbarSize') || 'medium';
    this.statusBarSize = localStorage.getItem('markdownViewer_statusBarSize') || 'medium';
    this.currentPageSize = localStorage.getItem('markdownViewer_pageSize') || 'a4';
    this.pinnedTabsEnabled = localStorage.getItem('markdownViewer_pinnedTabs') === 'true';
    
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
      
      this.updateSplashProgress(100, 'Ready!');
      await new Promise(resolve => setTimeout(resolve, 500));
      this.hideSplash();
      
      // Check for startup file
      await this.checkStartupFile();
      
      // Play retro sound if enabled
      if (this.isRetroTheme) {
        this.playRetroStartupSound();
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
    // Create tab manager first
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
      this.switchToTab(data.tab.id);
      
      // Switch to default mode when first document is opened
      if (this.currentMode === 'preview' && this.tabManager.getTabsCount() === 1) {
        this.setMode(this.defaultMode);
      }
    });
    
    this.tabManager.on('tab-removed', (data) => {
      this.updateTabUI();
      
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
      
      // Switch to default mode when first document is opened
      if (this.currentMode === 'preview' && currentTabCount === 0) {
        this.setMode(this.defaultMode);
      }
      
      // Phase 6: Track file open performance for all file opens (including from Explorer)
      if (this.performanceOptimizer && this.tabManager.getTabsCount() > currentTabCount) {
        this.performanceOptimizer.benchmarkTabOperation('File Open', startTime, currentTabCount + 1);
      }
    });
    
    this.documentComponent.on('document-new', (data) => {
      // Create new tab
      this.tabManager.createNewTab(data.content);
      this.setMode(this.defaultMode); // New files start in default mode
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
        this.previewComponent.emit('update-preview', data);
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
      this.previewComponent.emit('update-preview', data);
      
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
    });
    
    this.editorComponent.on('markdown-action', (data) => {
      this.handleMarkdownAction(data.action);
    });
    
    // Preview Component Events
    this.previewComponent.on('task-toggled', (data) => {
      this.updateTaskInMarkdown(data.taskText, data.checked);
    });
    
    this.previewComponent.on('external-link-clicked', (data) => {
      this.openExternalLink(data.href);
    });
    
    this.previewComponent.on('preview-error', (data) => {
      this.handleError(new Error(data.error), 'Preview');
    });
    
    // Toolbar Component Events
    this.toolbarComponent.on('file-new-requested', () => {
      this.newFile();
    });
    
    this.toolbarComponent.on('file-open-requested', () => {
      this.openFile();
    });
    
    this.toolbarComponent.on('file-save-requested', () => {
      this.saveFile();
    });
    
    this.toolbarComponent.on('file-save-as-requested', () => {
      this.saveAsFile();
    });
    
    this.toolbarComponent.on('file-close-requested', () => {
      this.closeFile();
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
      this.toggleDistractionFree();
    });
    
    this.toolbarComponent.on('theme-toggle', () => {
      this.toggleTheme();
    });
    
    this.toolbarComponent.on('settings-show', () => {
      this.showSettings();
    });
    
    this.toolbarComponent.on('help-show', () => {
      this.showHelp();
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
  }

  applyInitialSettings() {
    // Apply theme
    this.applyTheme();
    
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
    this.toolbarComponent.updateThemeButton(this.theme, this.isRetroTheme);
    
    // Initialize tab UI
    this.updateTabUI();
  }

  setupGlobalEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
    
    // Window close handler
    this.setupWindowCloseHandler();
    
    // Single instance handler
    this.setupSingleInstanceHandler();
    
    // Drag and drop
    this.setupDragAndDrop();
    
    // Splitter and scroll sync
    this.setupSplitter();
    this.setupScrollSync();
    
    // Scroll sync button
    this.setupScrollSyncButton();
    
    // Modal event handlers
    this.setupModalEventHandlers();
    
    // Settings controls
    this.setupSettingsControls();
    
    // Tab dropdown
    this.setupTabDropdown();
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.newFile();
          break;
        case 'o':
          e.preventDefault();
          this.openFile();
          break;
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            this.saveAsFile();
          } else {
            this.saveFile();
          }
          break;
        case 'w':
          e.preventDefault();
          this.closeFile();
          break;
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
        case 't':
        case '/':
          e.preventDefault();
          this.toggleTheme();
          break;
        case ',':
          e.preventDefault();
          this.showSettings();
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
        this.showTabModal();
      } else {
        this.switchToNextTab();
      }
      return;
    }
    
    // Function keys
    switch (e.key) {
      case 'F1':
        e.preventDefault();
        this.showHelp();
        break;
      case 'F5':
        e.preventDefault();
        this.reloadCurrentFile();
        break;
      case 'F11':
        e.preventDefault();
        if (e.shiftKey) {
          this.toggleDistractionFree();
        } else {
          this.toggleFullscreen();
        }
        break;
      case 'Escape':
        // Close modals first, then exit distraction-free mode
        const settingsModal = document.getElementById('settings-modal');
        const helpModal = document.getElementById('help-modal');
        const aboutModal = document.getElementById('about-modal');
        
        if (settingsModal && settingsModal.style.display === 'flex') {
          this.hideSettings();
        } else if (helpModal && helpModal.style.display === 'flex') {
          this.hideHelp();
        } else if (aboutModal && aboutModal.style.display === 'flex') {
          this.hideAbout();
        } else if (this.isDistractionFree) {
          this.exitDistractionFree();
        } else if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  }

  // File Operations - Phase 6 Enhanced
  async newFile() {
    const startTime = performance.now();
    
    // Phase 6: Check tab limits for performance
    const currentTabCount = this.tabManager.getTabsCount();
    if (this.performanceOptimizer && currentTabCount >= this.performanceOptimizer.performanceTargets.maxTabs) {
      const shouldContinue = confirm(`You have ${currentTabCount} tabs open. Opening more tabs may affect performance. Continue?`);
      if (!shouldContinue) return;
    }
    
    // Always create new tab for new files
    this.tabManager.createNewTab();
    
    // Switch to default mode for new files
    this.setMode(this.defaultMode);
    
    // Phase 6: Track tab creation performance
    if (this.performanceOptimizer) {
      this.performanceOptimizer.benchmarkTabOperation('Tab Create', startTime, currentTabCount + 1);
    }
  }

  async openFile() {
    // Phase 6: Check tab limits before opening
    const currentTabCount = this.tabManager.getTabsCount();
    if (this.performanceOptimizer && currentTabCount >= this.performanceOptimizer.performanceTargets.maxTabs) {
      const shouldContinue = confirm(`You have ${currentTabCount} tabs open. Opening more files may affect performance. Continue?`);
      if (!shouldContinue) return;
    }
    
    const startTime = performance.now();
    await this.documentComponent.openFile();
    
    // Phase 6: Track file open performance only if file was actually opened
    if (this.performanceOptimizer && this.tabManager.getTabsCount() > currentTabCount) {
      this.performanceOptimizer.benchmarkTabOperation('File Open', startTime, currentTabCount + 1);
    }
  }

  async saveFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      // Update document component with active tab content
      this.documentComponent.currentFile = activeTab.filePath;
      this.documentComponent.content = activeTab.content;
      this.documentComponent.isDirty = activeTab.isDirty;
      
      try {
        await this.documentComponent.saveFile();
        this.tabManager.markTabSaved(activeTab.id, this.documentComponent.currentFile);
      } catch (error) {
        this.handleError(error, 'Save');
      }
    }
  }

  async saveAsFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      // Update document component with active tab content
      this.documentComponent.currentFile = activeTab.filePath;
      this.documentComponent.content = activeTab.content;
      this.documentComponent.isDirty = activeTab.isDirty;
      
      try {
        await this.documentComponent.saveAsFile();
        this.tabManager.markTabSaved(activeTab.id, this.documentComponent.currentFile);
      } catch (error) {
        this.handleError(error, 'Save As');
      }
    }
  }

  async closeFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      // Check for unsaved changes first, before animation
      if (activeTab.isDirty) {
        const shouldClose = await this.tabManager.confirmCloseUnsaved(activeTab);
        if (!shouldClose) return;
      }
      
      // Add close animation only after confirmation
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.animation = 'fadeOut 0.2s ease-out';
        await new Promise(resolve => setTimeout(resolve, 200));
        mainContent.style.animation = '';
      }
      
      // Phase 6: Clean up performance tracking for closed tab
      if (this.performanceOptimizer) {
        this.performanceOptimizer.cleanupTabTracking(activeTab.id);
      }
      
      // Remove tab without additional confirmation since we already confirmed
      this.tabManager.tabCollection.removeTab(activeTab.id);
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

  // Theme Management
  toggleTheme() {
    const isRetro = document.body.classList.contains('retro-theme');
    if (isRetro) {
      // Exit retro mode and go to light theme
      document.body.classList.remove('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'false');
      this.theme = 'light';
      localStorage.setItem('markdownViewer_defaultTheme', 'light');
      this.isRetroTheme = false;
    } else {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('markdownViewer_defaultTheme', this.theme);
    }
    
    this.applyTheme();
    
    // Notify components
    this.editorComponent.emit('theme-changed', { theme: this.theme });
    this.previewComponent.emit('theme-changed', { theme: this.theme });
    this.toolbarComponent.updateThemeButton(this.theme, this.isRetroTheme);
    
    // Refresh preview if we have active tab content
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      this.previewComponent.emit('update-preview', { content: activeTab.content });
    }
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    
    if (this.isRetroTheme) {
      document.body.classList.add('retro-theme');
    }
  }

  // Distraction-Free Mode
  toggleDistractionFree() {
    if (this.isDistractionFree) {
      this.exitDistractionFree();
    } else {
      this.enterDistractionFree();
    }
  }

  enterDistractionFree() {
    this.isDistractionFree = true;
    document.body.classList.add('distraction-free');
    document.body.classList.add(`${this.currentMode}-mode`);
    
    this.toolbarComponent.emit('distraction-free-changed', { 
      isDistractionFree: true 
    });
  }

  exitDistractionFree() {
    this.isDistractionFree = false;
    document.body.classList.remove('distraction-free');
    
    this.toolbarComponent.emit('distraction-free-changed', { 
      isDistractionFree: false 
    });
  }

  // Layout Management
  applyCenteredLayout() {
    if (this.centeredLayoutEnabled) {
      document.body.classList.add('centered-layout');
    } else {
      document.body.classList.remove('centered-layout');
    }
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
              .replace(/<div align="(center|right|justify)">\s*([\s\S]*?)\s*<\/div>/gi, '$2')
              .trim();
            replacement = cleanText;
          } else {
            return;
          }
        } else {
          const alignType = action.replace('align-', '');
          if (selectedText) {
            let cleanText = selectedText
              .replace(/<div align="(left|center|right|justify)">\s*([\s\S]*?)\s*<\/div>/gi, '$2')
              .trim();
            replacement = `<div align="${alignType}">\n${cleanText}\n</div>`;
            insertAtNewLine = true;
          } else {
            replacement = `<div align="${alignType}">\nText aligned ${alignType}\n</div>`;
            insertAtNewLine = true;
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
        newContent = lineContent.replace(/<div align="(center|right|justify)">\s*([\s\S]*?)\s*<\/div>/gi, '$2').trim();
      } else {
        // Remove existing alignment first, then apply new alignment
        let cleanContent = lineContent.replace(/<div align="(left|center|right|justify)">\s*([\s\S]*?)\s*<\/div>/gi, '$2').trim();
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

  updateTaskInMarkdown(taskText, checked) {
    const content = this.editorComponent.getContent();
    const lines = content.split('\n');
    let inCodeBlock = false;
    let matchingLines = [];
    
    // Clean task text for better matching (remove HTML and extra whitespace)
    const cleanTaskText = taskText.replace(/<[^>]*>/g, '').trim();
    
    // Find all lines that contain the task text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      if (inCodeBlock) continue;
      
      // Check for task list patterns with various indentation levels
      const taskPatterns = [
        /^(\s*)- \[([ x])\]\s*(.*)$/,  // Standard task list
        /^(\s*)\* \[([ x])\]\s*(.*)$/,  // Alternative bullet
        /^(\s*)\+ \[([ x])\]\s*(.*)$/,  // Alternative bullet
        /^(\s*)\d+\. \[([ x])\]\s*(.*)$/,  // Numbered task list
      ];
      
      for (const pattern of taskPatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, indent, checkState, taskContent] = match;
          const cleanLineTaskText = taskContent.trim();
          
          // More flexible matching - check if the task text is contained in the line
          if (cleanLineTaskText === cleanTaskText || 
              cleanLineTaskText.includes(cleanTaskText) || 
              cleanTaskText.includes(cleanLineTaskText)) {
            matchingLines.push({ index: i, indent, pattern: pattern.source, taskContent: cleanLineTaskText });
            break;
          }
        }
      }
    }
    
    // Check for conflicts (multiple tasks with same text)
    if (matchingLines.length > 1) {
      this.showTaskConflictModal(taskText, matchingLines.length);
      return;
    }
    
    // Update the single matching task
    if (matchingLines.length === 1) {
      const match = matchingLines[0];
      const lineIndex = match.index;
      const line = lines[lineIndex];
      
      // Update the checkbox state while preserving indentation and formatting
      const updatedLine = line.replace(/\[([ x])\]/, checked ? '[x]' : '[ ]');
      lines[lineIndex] = updatedLine;
      
      const newContent = lines.join('\n');
      this.editorComponent.setContent(newContent);
      this.documentComponent.handleContentChange(newContent);
      

    }
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
    
    // Open Monaco's find and replace widget for code/split mode
    const editor = this.editorComponent.monacoEditor;
    const findController = editor.getContribution('editor.contrib.findController');
    if (findController) {
      findController.start({
        forceRevealReplace: true,
        seedSearchStringFromSelection: 'single',
        seedSearchStringFromNonEmptySelection: true,
        shouldFocus: 1
      });
    }
    editor.focus();
  }
  
  toggleMarkdownToolbar() {
    this.isToolbarEnabled = !this.isToolbarEnabled;
    localStorage.setItem('markdownViewer_toolbarEnabled', this.isToolbarEnabled.toString());
    this.applyMarkdownToolbarVisibility();
    this.toolbarComponent.isToolbarEnabled = this.isToolbarEnabled;
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
          this.previewComponent.emit('update-preview', { content: newContent });
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
          this.previewComponent.emit('update-preview', { content });
        }, 150);
      }
      this.debouncedPreviewUpdate(content);
    } else {
      this.previewComponent.emit('update-preview', { content });
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
    // Settings modal
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const settingsOverlay = document.querySelector('.settings-overlay');
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', () => this.hideSettings());
    }
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', () => this.hideSettings());
    }
    
    // Help modal
    const helpCloseBtn = document.getElementById('help-close-btn');
    const helpOverlay = document.querySelector('.help-overlay');
    if (helpCloseBtn) {
      helpCloseBtn.addEventListener('click', () => this.hideHelp());
    }
    if (helpOverlay) {
      helpOverlay.addEventListener('click', () => this.hideHelp());
    }
    
    // About modal
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const aboutOverlay = document.querySelector('.about-overlay');
    if (aboutCloseBtn) {
      aboutCloseBtn.addEventListener('click', () => this.hideAbout());
    }
    if (aboutOverlay) {
      aboutOverlay.addEventListener('click', () => this.hideAbout());
    }
    
    // Welcome page buttons
    const welcomeNewBtn = document.getElementById('welcome-new-btn');
    const welcomeOpenBtn = document.getElementById('welcome-open-btn');
    const welcomeHelpBtn = document.getElementById('welcome-help-btn');
    const welcomeAboutBtn = document.getElementById('welcome-about-btn');
    const welcomeSettingsBtn = document.getElementById('welcome-settings-btn');
    
    if (welcomeNewBtn) {
      welcomeNewBtn.addEventListener('click', () => this.newFile());
    }
    if (welcomeOpenBtn) {
      welcomeOpenBtn.addEventListener('click', () => this.openFile());
    }
    if (welcomeHelpBtn) {
      welcomeHelpBtn.addEventListener('click', () => this.showHelp());
    }
    if (welcomeAboutBtn) {
      welcomeAboutBtn.addEventListener('click', () => this.showAbout());
    }
    if (welcomeSettingsBtn) {
      welcomeSettingsBtn.addEventListener('click', () => this.showSettings());
    }
    
    // Clear history button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => this.clearFileHistory());
    }
  }

  showSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'flex';
      this.updateSettingsDisplay();
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
  
  updateSettingsDisplay() {
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
      'splash-off-btn': !this.isSplashEnabled
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
    
    // Update performance info
    const tabCount = this.tabManager.getTabsCount();
    const virtualCount = this.performanceOptimizer ? this.performanceOptimizer.virtualizedTabs.size : 0;
    const performanceInfo = {
      'perf-tab-count': `${tabCount} (${virtualCount} virtual)`,
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
    
    // Update system info
    const systemInfo = {
      'info-default-mode': this.defaultMode,
      'info-current-mode': this.currentMode,
      'info-monaco': this.editorComponent.isMonacoLoaded ? 'Loaded' : 'Not Loaded',
      'info-mermaid': this.previewComponent.mermaidInitialized ? 'Loaded' : 'Not Loaded',
      'info-katex': this.previewComponent.katexInitialized ? 'Loaded' : 'Not Loaded'
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
      console.warn('[MarkdownEditor] Retro sound failed:', error);
    }
  }
  
  clearFileHistory() {
    this.documentComponent.fileHistory = [];
    localStorage.removeItem('markdownViewer_fileHistory');
    this.documentComponent.updateFileHistoryDisplay();
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
            this.playRetroStartupSound();
          }
          localStorage.setItem('markdownViewer_defaultTheme', this.theme);
          localStorage.setItem('markdownViewer_retroTheme', this.isRetroTheme.toString());
          this.applyTheme();
          this.editorComponent.emit('theme-changed', { theme: this.theme });
          this.previewComponent.emit('theme-changed', { theme: this.theme });
          
          // Refresh preview if we have active tab content
          const activeTab = this.tabManager.getActiveTab();
          if (activeTab) {
            this.previewComponent.emit('update-preview', { content: activeTab.content });
          }
          
          // Update theme button
          this.toolbarComponent.updateThemeButton(this.theme, this.isRetroTheme);
          
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
          this.editorComponent.emit('suggestions-changed', { enabled: this.suggestionsEnabled });
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
          if (this.pinnedTabsEnabled) {
            this.updatePinnedTabs();
          }
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
        const documentState = this.documentComponent.getDocumentState();
        if (documentState.isDirty) {
          event.preventDefault();
          
          const shouldClose = await this.handleUnsavedChanges();
          if (shouldClose) {
            await appWindow.close();
          }
        }
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
      
// Single instance handler set up
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
    let dragCounter = 0;
    
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      document.body.classList.add('drag-over');
    });
    
    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        document.body.classList.remove('drag-over');
      }
    });
    
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    document.addEventListener('drop', async (e) => {
      e.preventDefault();
      dragCounter = 0;
      document.body.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length === 0) return;
      
      try {
        const documentState = this.documentComponent.getDocumentState();
        
        // Welcome screen: open .md files
        if (!documentState.hasDocument) {
          const mdFile = files.find(f => /\.(md|markdown|txt)$/i.test(f.name));
          if (mdFile) {
            const content = await mdFile.text();
            this.documentComponent.setContent(content);
            this.documentComponent.emit('document-new', { content });
          }
          return;
        }
        
        // Code mode: insert file paths
        if (this.currentMode === 'code') {
          const filePaths = files.map(f => f.name);
          const insertText = filePaths.join('\n');
          
          // Insert at current cursor position
          const currentContent = this.editorComponent.getContent();
          const newContent = currentContent + '\n' + insertText;
          this.editorComponent.setContent(newContent);
          this.documentComponent.handleContentChange(newContent);
        }
      } catch (error) {
        console.error('[MarkdownEditor] Error processing drop:', error);
      }
    });
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
        this.previewComponent.emit('update-preview', { content: activeTab.content });
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
      
      // Check if tab should be restored from virtual state
      if (this.performanceOptimizer.virtualizedTabs.has(tabId)) {
        this.performanceOptimizer.restoreTab(tabId);
      }
    }
    
    this.tabManager.switchToTab(tabId);
    
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
    this.previewComponent.emit('update-preview', { content: tab.content });
    
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
    requestIdleCallback(() => {
      if (this.editorComponent.isMonacoLoaded) {
        const model = tab.getMonacoModel();
        this.editorComponent.setMonacoModel(model, tab.editorViewState);
      } else {
        this.editorComponent.emit('set-content', { content: tab.content });
      }
      this.previewComponent.emit('update-preview', { content: tab.content });
      
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
    this.previewComponent.emit('update-preview', { content: '' });
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
    
    // Show up to 5 most recent tabs in dropdown (newest first)
    const visibleTabs = tabs.slice(0, 5);
    const showMoreBtn = tabs.length > 5;
    
    visibleTabs.forEach((tab, index) => {
      const tabElement = this.createDropdownTabElement(tab, activeTab, index);
      tabDropdownList.appendChild(tabElement);
    });
    
    // Show/hide more button
    tabMoreBtn.style.display = showMoreBtn ? 'block' : 'none';
    
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
    
    // Check if this tab is in the top 5 (dropdown)
    const allTabs = this.tabManager.getAllTabs();
    const tabIndex = allTabs.findIndex(t => t.id === tab.id);
    const isInDropdown = tabIndex < 5;
    
    // Add position number for top 5 tabs
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
    // Alt+1-5 for switching to numbered tabs in dropdown (most recent first)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = this.tabManager.getAllTabs();
        const visibleTabs = tabs.slice(0, 5); // First 5 tabs (most recent first)
        
        if (visibleTabs[tabIndex]) {
          e.preventDefault();
          this.switchToTab(visibleTabs[tabIndex].id);
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
  applyPinnedTabsVisibility() {
    const pinnedTabsBar = document.getElementById('pinned-tabs-bar');
    if (pinnedTabsBar) {
      pinnedTabsBar.style.display = this.pinnedTabsEnabled ? 'flex' : 'none';
    }
  }
  
  togglePinnedTabs() {
    this.pinnedTabsEnabled = !this.pinnedTabsEnabled;
    localStorage.setItem('markdownViewer_pinnedTabs', this.pinnedTabsEnabled.toString());
    this.applyPinnedTabsVisibility();
    if (this.pinnedTabsEnabled) {
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
      
      // Add number for first 5 tabs
      if (index < 5) {
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
  }
  
  onDestroy() {
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