import { message as showMessage } from '@tauri-apps/plugin-dialog';

/**
 * Markdown Editor - Main Component Orchestrator
 * Manages all components and maintains existing functionality
 */
class MarkdownEditor extends BaseComponent {
  constructor(options = {}) {
    super('MarkdownEditor', options);
    
    // Controller registry for dynamic management
    this.registry = options.registry || new ControllerRegistry();
    
    // Plugin manager will be initialized after components are created
    this.pluginManager = null;
    this.rendererRegistry = options.rendererRegistry || new RendererRegistry();
    
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
    this.scrollCoordinator = this.controllers.scrollCoordinator || null;
    this.tabSessionController = this.controllers.tabSessionController || null;
    this.documentLifecycleController = this.controllers.documentLifecycleController || null;
    this.editorLifecycleController = this.controllers.editorLifecycleController || null;
    this.previewLifecycleController = this.controllers.previewLifecycleController || null;
    this.toolbarLifecycleController = this.controllers.toolbarLifecycleController || null;
    this.settingsCoordinator = this.controllers.settingsCoordinator || null;
    this.markdownActionController = this.controllers.markdownActionController || null;
    this.exportController = this.controllers.exportController || null;
    this.pluginModalController = this.controllers.pluginModalController || null;
    this.nativeWindowController = this.controllers.nativeWindowController || null;
    this.fileDropController = this.controllers.fileDropController || null;
    this.splitPaneController = this.controllers.splitPaneController || null;
    this.welcomeController = this.controllers.welcomeController || null;
    this.statusBarController = this.controllers.statusBarController || null;
    this.searchController = this.controllers.searchController || null;
    this.markdownDialogController = this.controllers.markdownDialogController || null;
    
    // Performance tracking
    this.startupTime = 0;
    this.lastModeSwitchTime = 0;
    this.performanceOptimizer = window.PerformanceOptimizer ? new window.PerformanceOptimizer() : null;
    
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
      
      this.updateSplashProgress(25, 'Creating components...');
      
      // Create and initialize components
      await this.createComponents();
      
      this.updateSplashProgress(70, 'Applying settings...');
      
      // Apply initial settings
      this.applyInitialSettings();
      
      this.updateSplashProgress(85, 'Setting up event handlers...');
      
      // Set up global event handlers
      this.setupGlobalEventHandlers();
      
      this.updateSplashProgress(95, 'Finalizing...');
      
      // Initialize plugin manager
      this.updateSplashProgress(90, 'Initializing plugins...');
      this.pluginManager = new PluginManager(this);
      
      // Initialize plugin loader
      this.pluginLoader = new PluginLoader(this.pluginManager);
      
      // Discover and register plugins
      await this.pluginLoader.loadAndRegisterPlugins();

      this.pluginModalController.setDependencies({
        pluginManager: this.pluginManager,
        pluginLoader: this.pluginLoader,
        uiController: this.uiController
      });
      
      // Auto-activate enabled plugins
      await this.pluginManager.autoActivatePlugins();
      this.pluginModalController.refresh();
      
      // Complete initialization
      this.startupTime = performance.now() - startupStartTime;
      this.settingsController.setStartupTime(this.startupTime);
      
      this.updateSplashProgress(100, 'Ready!');
      this.hideSplash();
      
      // Mark app as initialized to show hidden elements
      document.body.classList.add('app-initialized');
      
      // Check for startup file
      await this.fileController.checkStartupFile(this.documentComponent);
      
      // Retro sound is already played by UIController.setTheme() during applyInitialSettings()
      
      console.log(`[MarkdownEditor] Initialized in ${this.startupTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('[MarkdownEditor] Initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  async createComponents() {
    // Register default controllers in registry
    this.registry.register('settings', SettingsController);
    this.registry.register('ui', UIController);
    this.registry.register('file', FileController);
    this.registry.register('keyboard', KeyboardController);
    this.registry.register('mode', ModeController);
    this.registry.register('tabUI', TabUIController);
    this.registry.register('scroll', ScrollCoordinator);
    this.registry.register('tabSession', TabSessionController);
    this.registry.register('documentLifecycle', DocumentLifecycleController);
    this.registry.register('editorLifecycle', EditorLifecycleController);
    this.registry.register('previewLifecycle', PreviewLifecycleController);
    this.registry.register('toolbarLifecycle', ToolbarLifecycleController);
    this.registry.register('settingsCoordinator', SettingsCoordinator);
    this.registry.register('markdownAction', MarkdownActionController);
    this.registry.register('export', ExportController);
    this.registry.register('nativeWindow', NativeWindowController);
    this.registry.register('fileDrop', FileDropController);
    this.registry.register('splitPane', SplitPaneController);
    this.registry.register('welcome', WelcomeController);
    this.registry.register('statusBar', StatusBarController);
    this.registry.register('search', SearchController);
    this.registry.register('markdownDialog', MarkdownDialogController);
    this.registry.register('pluginModal', PluginModalController);
    
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
    
    if (!this.statusBarController) {
      this.statusBarController = this.registry.createInstance('statusBar');
    }
    this.statusBarController.setDependencies({
      documentComponent: this.documentComponent,
      tabManager: this.tabManager
    });
    this.addChild(this.statusBarController);
    await this.statusBarController.init();

    // Create editor component
    this.editorComponent = new EditorComponent();
    this.addChild(this.editorComponent);
    await this.editorComponent.init();
    
    // Create preview component
    this.previewComponent = new PreviewComponent({ rendererRegistry: this.rendererRegistry });
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

    if (!this.searchController) {
      this.searchController = this.registry.createInstance('search');
    }
    this.searchController.setDependencies({
      editorComponent: this.editorComponent,
      modeController: this.modeController
    });
    this.addChild(this.searchController);
    await this.searchController.init();

    if (!this.scrollCoordinator) {
      this.scrollCoordinator = this.registry.createInstance('scroll');
    }
    this.scrollCoordinator.setDependencies({
      editorComponent: this.editorComponent,
      previewComponent: this.previewComponent,
      tabManager: this.tabManager,
      modeController: this.modeController
    });
    this.addChild(this.scrollCoordinator);
    await this.scrollCoordinator.init();
    this.modeController.setScrollCoordinator(this.scrollCoordinator);
    
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
    
    if (!this.markdownDialogController) {
      this.markdownDialogController = this.registry.createInstance('markdownDialog');
    }
    this.markdownDialogController.setDependencies({
      markdownActionController: this.markdownActionController
    });
    this.addChild(this.markdownDialogController);
    await this.markdownDialogController.init();

    // Create export controller (or use injected one)
    if (!this.exportController) {
      this.exportController = this.registry.createInstance('export');
    }
    this.addChild(this.exportController);
    await this.exportController.init();
    this.exportController.setDependencies({
      editorComponent: this.editorComponent,
      handleError: (error, context) => this.handleError(error, context)
    });

    if (!this.pluginModalController) {
      this.pluginModalController = this.registry.createInstance('pluginModal');
    }
    this.addChild(this.pluginModalController);
    await this.pluginModalController.init();

    if (!this.nativeWindowController) {
      this.nativeWindowController = this.registry.createInstance('nativeWindow');
    }
    this.nativeWindowController.setDependencies({
      tabManager: this.tabManager,
      documentComponent: this.documentComponent
    });
    this.addChild(this.nativeWindowController);
    await this.nativeWindowController.init();

    if (!this.fileDropController) {
      this.fileDropController = this.registry.createInstance('fileDrop');
    }
    this.fileDropController.setDependencies({
      tabManager: this.tabManager,
      settingsController: this.settingsController,
      modeController: this.modeController,
      editorComponent: this.editorComponent,
      documentComponent: this.documentComponent,
      switchToTab: (tabId) => this.tabSessionController.switchToTab(tabId)
    });
    this.addChild(this.fileDropController);
    await this.fileDropController.init();

    if (!this.splitPaneController) {
      this.splitPaneController = this.registry.createInstance('splitPane');
    }
    this.splitPaneController.setDependencies({ editorComponent: this.editorComponent });
    this.addChild(this.splitPaneController);
    await this.splitPaneController.init();

    if (!this.welcomeController) {
      this.welcomeController = this.registry.createInstance('welcome');
    }
    this.welcomeController.setDependencies({
      fileController: this.fileController,
      documentComponent: this.documentComponent,
      tabManager: this.tabManager,
      uiController: this.uiController,
      editorComponent: this.editorComponent,
      previewComponent: this.previewComponent,
      toolbarComponent: this.toolbarComponent,
      modeController: this.modeController,
      tabUIController: this.tabUIController,
      scrollCoordinator: this.scrollCoordinator,
      statusBarController: this.statusBarController
    });
    this.addChild(this.welcomeController);
    await this.welcomeController.init();

    if (!this.tabSessionController) {
      this.tabSessionController = this.registry.createInstance('tabSession');
    }
    this.tabSessionController.setDependencies({
      tabManager: this.tabManager,
      editorComponent: this.editorComponent,
      previewComponent: this.previewComponent,
      documentComponent: this.documentComponent,
      toolbarComponent: this.toolbarComponent,
      modeController: this.modeController,
      settingsController: this.settingsController,
      tabUIController: this.tabUIController,
      scrollCoordinator: this.scrollCoordinator,
      performanceOptimizer: this.performanceOptimizer,
      updateFilename: (fileName, isDirty) =>
        this.statusBarController.updateFilename(fileName, isDirty),
      showWelcomePage: () => this.welcomeController.showWelcomePage()
    });
    this.addChild(this.tabSessionController);
    await this.tabSessionController.init();

    if (!this.documentLifecycleController) {
      this.documentLifecycleController = this.registry.createInstance('documentLifecycle');
    }
    this.documentLifecycleController.setDependencies({
      documentComponent: this.documentComponent,
      tabManager: this.tabManager,
      modeController: this.modeController,
      settingsController: this.settingsController,
      tabUIController: this.tabUIController,
      toolbarComponent: this.toolbarComponent,
      editorComponent: this.editorComponent,
      previewComponent: this.previewComponent,
      performanceOptimizer: this.performanceOptimizer,
      switchToTab: (tabId) => this.tabSessionController.switchToTab(tabId),
      fileController: this.fileController,
      updateFilename: (fileName, isDirty) =>
        this.statusBarController.updateFilename(fileName, isDirty),
      handleError: (error, context) => this.handleError(error, context)
    });
    this.addChild(this.documentLifecycleController);
    await this.documentLifecycleController.init();

    if (!this.editorLifecycleController) {
      this.editorLifecycleController = this.registry.createInstance('editorLifecycle');
    }
    this.editorLifecycleController.setDependencies({
      editorComponent: this.editorComponent,
      documentComponent: this.documentComponent,
      previewComponent: this.previewComponent,
      tabManager: this.tabManager,
      tabUIController: this.tabUIController,
      settingsController: this.settingsController,
      modeController: this.modeController,
      markdownActionController: this.markdownActionController,
      updateCursorPosition: (line, col) =>
        this.statusBarController.updateCursorPosition(line, col)
    });
    this.addChild(this.editorLifecycleController);
    await this.editorLifecycleController.init();

    if (!this.previewLifecycleController) {
      this.previewLifecycleController = this.registry.createInstance('previewLifecycle');
    }
    this.previewLifecycleController.setDependencies({
      previewComponent: this.previewComponent,
      editorComponent: this.editorComponent,
      documentComponent: this.documentComponent,
      tabManager: this.tabManager,
      modeController: this.modeController,
      settingsController: this.settingsController,
      markdownActionController: this.markdownActionController,
      fileController: this.fileController,
      exportController: this.exportController,
      scrollCoordinator: this.scrollCoordinator,
      handleError: (error, context) => this.handleError(error, context)
    });
    this.addChild(this.previewLifecycleController);
    await this.previewLifecycleController.init();

    // ToolbarLifecycleController is the sole owner of toolbar command routing.
    if (!this.toolbarLifecycleController) {
      this.toolbarLifecycleController = this.registry.createInstance('toolbarLifecycle');
    }
    this.toolbarLifecycleController.setDependencies({
      toolbarComponent: this.toolbarComponent,
      documentComponent: this.documentComponent,
      editorComponent: this.editorComponent,
      previewComponent: this.previewComponent,
      tabManager: this.tabManager,
      fileController: this.fileController,
      modeController: this.modeController,
      exportController: this.exportController,
      uiController: this.uiController,
      settingsController: this.settingsController,
      markdownActionController: this.markdownActionController,
      previewLifecycleController: this.previewLifecycleController,
      performanceOptimizer: this.performanceOptimizer,
      actions: {
        toggleFindReplace: (showReplace) => this.searchController.toggle(showReplace)
      }
    });
    this.addChild(this.toolbarLifecycleController);
    await this.toolbarLifecycleController.init();

    // SettingsCoordinator is the sole owner of Settings/UI/Plugin Manager
    // communication and the canonical Settings refresh.
    if (!this.settingsCoordinator) {
      this.settingsCoordinator = this.registry.createInstance('settingsCoordinator');
    }
    this.settingsCoordinator.setDependencies({
      settingsController: this.settingsController,
      uiController: this.uiController,
      pluginModalController: this.pluginModalController,
      toolbarComponent: this.toolbarComponent,
      editorComponent: this.editorComponent,
      previewComponent: this.previewComponent,
      tabManager: this.tabManager,
      tabUIController: this.tabUIController,
      modeController: this.modeController,
      performanceOptimizer: this.performanceOptimizer
    });
    this.addChild(this.settingsCoordinator);
    await this.settingsCoordinator.init();

    // KeyboardController is the sole owner of application-level shortcuts.
    if (!this.keyboardController) {
      this.keyboardController = this.registry.createInstance('keyboard');
    }
    this.keyboardController.setDependencies({
      documentComponent: this.documentComponent,
      fileController: this.fileController,
      uiController: this.uiController,
      tabManager: this.tabManager,
      modeController: this.modeController,
      toolbarComponent: this.toolbarComponent,
      markdownActionController: this.markdownActionController,
      pluginModalController: this.pluginModalController,
      markdownDialogController: this.markdownDialogController,
      tabUIController: this.tabUIController,
      exportController: this.exportController,
      performanceOptimizer: this.performanceOptimizer,
      actions: {
        toggleFindReplace: (showReplace) => this.searchController.toggle(showReplace),
        performManualScrollSync: () => this.scrollCoordinator.alignBothPanes(),
        toggleMarkdownToolbar: () => this.settingsCoordinator.toggleMarkdownToolbar(),
        switchToPreviousTab: () => this.tabSessionController.switchToPreviousTab(),
        switchToNextTab: () => this.tabSessionController.switchToNextTab(),
        switchToTab: (tabId) => this.tabSessionController.switchToTab(tabId),
        reloadCurrentFile: () => this.previewLifecycleController.reloadCurrentFile(),
        toggleFullscreen: () => this.nativeWindowController.toggleFullscreen()
      }
    });
    this.addChild(this.keyboardController);
    await this.keyboardController.init();
  }

  applyInitialSettings() {
    // Apply settings through controllers
    this.settingsController.applySettings();
    this.settingsCoordinator.syncToolbarQuickSettings();
    
    // Initialize pinned tabs if enabled
    if (this.settingsController.getPinnedTabsEnabled()) {
      this.tabUIController.updatePinnedTabs();
    }
    
    // Welcome is an application state, not an empty preview document.
    this.modeController.enterWelcomeMode();
    
    // Seed the status bar for the welcome state
    this.statusBarController.updateFilename('Welcome', false);
    this.statusBarController.updateCursorPosition(1, 1);
    
    // Update toolbar state for no document
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: false, 
      isDirty: false 
    });
    
    // Update theme button
    const themeData = this.settingsController.getTheme();
    this.toolbarComponent.updateThemeButton(themeData.theme, themeData.isRetroTheme);
    
    // Initialize tab UI
    this.tabUIController.updateTabUI();
    
    // Initialize system info
    this.settingsCoordinator.refreshSystemInfo();
  }

  setupGlobalEventHandlers() {
    // Native close and single-instance listeners are owned by their controller.
    this.nativeWindowController.setup();
    
    // Browser and native file-drop listeners are owned by their controller.
    this.fileDropController.setup();
    
    // Vertical split resizing is owned by its lifecycle-managed controller.
    this.splitPaneController.setup();
    
    // Welcome actions are owned by their lifecycle-managed controller.
    this.welcomeController.setup();
    

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
    document.body.dataset.startupError = 'true';
    document.body.classList.add('app-initialized');
    console.error('[MarkdownEditor] Initialization error:', error);

    // Show basic interface even if advanced features fail
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
      welcomePage.style.display = 'flex';
    }
  }

  handleError(error, context = 'Unknown') {
    console.error(`[MarkdownEditor] ${context} error:`, error);

    if (window.__TAURI__?.core?.invoke) {
      showMessage(
        `${context} Error: ${error.message}`,
        { title: 'Error', type: 'error' }
      ).catch(() => console.error('[MarkdownEditor] Failed to show error dialog'));
    }
  }

  onDestroy() {
    // Phase 6: Clean up performance optimizer
    if (this.performanceOptimizer) {
      this.performanceOptimizer.destroy();
    }
    
    // Clean up plugin manager and loader
    if (this.pluginManager) {
      this.pluginManager.destroy();
    }
    if (this.pluginLoader) {
      this.pluginLoader = null;
    }
    this.rendererRegistry?.clear();
    
    // BaseComponent owns child destruction. Clear the registry's references so
    // controllers are disposed exactly once during the subsequent cleanup.
    this.registry?.clear();
    
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
