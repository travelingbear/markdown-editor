// Phase 4: Polish & OS Integration - Complete Implementation

class MarkdownViewer {
  constructor() {
    // Essential properties only - minimal constructor
    this.currentFile = null;
    this.isDirty = false;
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.isRetroTheme = localStorage.getItem('markdownViewer_retroTheme') === 'true';
    this.defaultMode = localStorage.getItem('markdownViewer_defaultMode') || 'preview';
    this.currentMode = 'preview';
    this.monacoEditor = null;
    this.isMonacoLoaded = false;
    this.isInitialized = false;
    
    // Initialize performance optimizer
    this.performanceOptimizer = window.PerformanceOptimizer ? new window.PerformanceOptimizer() : null;
    
    // Start async initialization immediately
    this.initPromise = this.init();
  }
  
  async init() {
    const startupStartTime = performance.now();
    
    try {
      // Initialize performance optimizer early
      if (this.performanceOptimizer) {
        this.performanceOptimizer.detectOlderHardware();
        this.performanceOptimizer.optimizeForMultiTabs();
      }
      
      // Initialize properties in batches for better performance
      this.initializeProperties();
      
      // Update splash screen progress
      this.updateSplashProgress(10, 'Initializing interface...');
    
      
      this.initializeElements();
      this.updateSplashProgress(25, 'Setting up event listeners...');
      
      this.setupEventListeners();
      this.updateSplashProgress(40, 'Configuring interface...');
      
      // Basic UI setup
      this.setMode('preview');
      this.updateCursorPosition();
      this.updateModeButtons();
      this.applyDefaultTheme();
      if (this.isRetroTheme) {
        document.body.classList.add('retro-theme');
        this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" style="vertical-align: middle;"><g fill="currentColor"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></g></svg>';
        // Play startup sound only when app starts with retro theme enabled
        this.playRetroStartupSound();
      }
      this.applyCenteredLayout();
      this.updateFileHistoryDisplay();
      this.initializeMarkdownToolbar();
      this.applyFontSize();
      this.applyZoom();
      this.applyToolbarSizes();
      this.applyStatusBarSize();
      
      this.updateSplashProgress(60, 'Loading advanced features...');
      await this.initializeAdvancedFeatures();
      
      this.updateSplashProgress(80, 'Finalizing...');
      
      // Finalize setup
      this.updateToolbarVisibility();
      this.checkExportLibraries();
      
      // Setup async operations
      await Promise.all([
        this.setupWindowCloseHandler(),
        this.setupTauriDragDrop()
      ]);
      
      this.startMemoryOptimization();
      
      this.startupTime = performance.now() - startupStartTime;
      this.isInitialized = true;
      
      // Complete initialization
      this.updateSplashProgress(100, 'Ready!');
      // Use Promise-based approach instead of nested setTimeout
      await new Promise(resolve => setTimeout(resolve, 500));
      this.hideSplash();
      
      // Performance validation
      this.validatePerformance(startupStartTime);
      
      // Check for startup file and load Monaco if needed
      const hasStartupFile = await this.checkStartupFile();
      
      // Load Monaco Editor lazily when needed
      if (hasStartupFile && (this.defaultMode === 'code' || this.defaultMode === 'split')) {
        try {
          await this.loadMonacoEditor();
        } catch (error) {
          console.warn('[Startup] Monaco loading failed, continuing with fallback editor');
        }
      }
      
    } catch (error) {
      console.error('[Init] Initialization failed:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
      this.handleInitializationError(error);
    }
  }
  
  initializeProperties() {
    // Batch property initialization for better performance
    Object.assign(this, {
      isScrollSyncing: false,
      lastKeyboardNavigation: 0,
      suggestionsEnabled: localStorage.getItem('markdownViewer_suggestionsEnabled') === 'true',
      fontSize: parseInt(localStorage.getItem('markdownViewer_fontSize') || '14'),
      previewZoom: 1.0,
      mainToolbarSize: localStorage.getItem('markdownViewer_mainToolbarSize') || 'medium',
      mdToolbarSize: localStorage.getItem('markdownViewer_mdToolbarSize') || 'medium',
      statusBarSize: localStorage.getItem('markdownViewer_statusBarSize') || 'medium',
      isLoadingFile: false,
      lastEditorScrollTop: 0,
      lastPreviewScrollTop: 0,
      lastPreviewMaxScroll: 0,
      lastEditorMaxScroll: 0,
      lastSelection: null,
      lastSelectedText: '',
      mermaidInitialized: false,
      katexInitialized: false,
      taskListStates: new Map(),
      isTyping: false,
      typingTimeout: null,
      previewUpdateTimeout: null,
      performanceMetrics: {
        lastUpdateTime: 0,
        updateCount: 0,
        averageUpdateTime: 0
      },
      startupTime: 0,
      lastFileOpenTime: 0,
      lastModeSwitchTime: 0,
      closeHandlerUnlisten: null,
      isDistractionFree: false,
      preDistractionMode: null,
      centeredLayoutEnabled: localStorage.getItem('markdownViewer_centeredLayout') === 'true',
      currentPageSize: localStorage.getItem('markdownViewer_pageSize') || 'a4',
      pageMargins: {
        top: localStorage.getItem('markdownViewer_marginTop') || '1in',
        bottom: localStorage.getItem('markdownViewer_marginBottom') || '1in',
        left: localStorage.getItem('markdownViewer_marginLeft') || '1in',
        right: localStorage.getItem('markdownViewer_marginRight') || '1in'
      },
      fileHistory: JSON.parse(localStorage.getItem('markdownViewer_fileHistory') || '[]')
    });
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
  
  validatePerformance(startupStartTime) {
    const target = this.performanceOptimizer ? this.performanceOptimizer.performanceTargets.startupTime : 2000;
    if (this.startupTime > target) {
      console.warn(`[Performance] Startup time exceeded target: ${this.startupTime.toFixed(2)}ms > ${target}ms`);
    }
    
    if (this.performanceOptimizer) {
      this.performanceOptimizer.benchmarkTabOperation('App Startup', startupStartTime);
    }
  }
  
  handleInitializationError(error) {
    // Graceful degradation on initialization failure
    this.isInitialized = false;
    if (window.splashScreen) {
      window.splashScreen.hideSplash();
    }
    // Show basic interface even if advanced features fail
    this.showBasicInterface();
  }
  
  showBasicInterface() {
    // Minimal interface for error recovery
    if (this.welcomePage) {
      this.welcomePage.style.display = 'flex';
    }
  }

  initializeElements() {
    this.editor = document.getElementById('editor');
    this.monacoContainer = document.getElementById('monaco-editor');
    this.preview = document.getElementById('preview');
    this.welcomePage = document.getElementById('welcome-page');
    this.newBtn = document.getElementById('new-btn');
    this.openBtn = document.getElementById('open-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.saveDropdownArrow = document.getElementById('save-dropdown-arrow');
    this.saveDropdownMenu = document.getElementById('save-dropdown-menu');
    this.saveAsBtn = document.getElementById('save-as-btn');
    this.closeBtn = document.getElementById('close-btn');
    this.distractionBtn = document.getElementById('distraction-btn');
    this.themeBtn = document.getElementById('theme-btn');
    this.codeBtn = document.getElementById('code-btn');
    this.previewBtn = document.getElementById('preview-btn');
    this.splitBtn = document.getElementById('split-btn');
    this.cursorPos = document.getElementById('cursor-pos');
    this.filename = document.getElementById('filename');
    this.mainContent = document.querySelector('.main-content');
    this.splitter = document.getElementById('splitter');
    this.exportBtn = document.getElementById('export-btn');
    this.exportDropdownMenu = document.getElementById('export-dropdown-menu');
    this.exportHtmlBtn = document.getElementById('export-html-btn');
    this.exportPdfBtn = document.getElementById('export-pdf-btn');
    this.welcomeNewBtn = document.getElementById('welcome-new-btn');
    this.welcomeOpenBtn = document.getElementById('welcome-open-btn');
    this.fileHistorySection = document.getElementById('file-history-section');
    this.fileHistoryList = document.getElementById('file-history-list');
    this.clearHistoryBtn = document.getElementById('clear-history-btn');
    this.settingsModal = document.getElementById('settings-modal');
    this.settingsCloseBtn = document.getElementById('settings-close-btn');
    this.settingsOverlay = document.querySelector('.settings-overlay');
    this.markdownToolbar = document.getElementById('markdown-toolbar');
    this.toolbarContent = document.querySelector('.toolbar-content');
    this.isToolbarEnabled = localStorage.getItem('markdownViewer_toolbarEnabled') !== 'false';
    this.isSplashEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration') || '1');
    
    // Phase 8.5 elements
    this.splashScreen = document.getElementById('splash-screen');
    this.helpStatusBtn = document.getElementById('help-status-btn');
    this.welcomeHelpBtn = document.getElementById('welcome-help-btn');
    this.welcomeAboutBtn = document.getElementById('welcome-about-btn');
    this.welcomeSettingsBtn = document.getElementById('welcome-settings-btn');
    this.helpModal = document.getElementById('help-modal');
    this.helpCloseBtn = document.getElementById('help-close-btn');
    this.helpOverlay = document.querySelector('.help-overlay');
    this.aboutModal = document.getElementById('about-modal');
    this.aboutCloseBtn = document.getElementById('about-close-btn');
    this.aboutOverlay = document.querySelector('.about-overlay');
    
    // Font size controls
    this.fontSizeDisplay = document.getElementById('font-size-display');
    this.fontSizeIncrease = document.getElementById('font-size-increase');
    this.fontSizeDecrease = document.getElementById('font-size-decrease');
    this.fontSizeReset = document.getElementById('font-size-reset');
    
    // Zoom controls
    this.zoomControls = document.getElementById('zoom-controls');
    this.zoomDisplay = document.getElementById('zoom-display');
    this.zoomIn = document.getElementById('zoom-in');
    this.zoomOut = document.getElementById('zoom-out');
    this.zoomReset = document.getElementById('zoom-reset');
    
    // Undo/Redo controls
    this.undoBtn = document.getElementById('undo-btn');
    this.redoBtn = document.getElementById('redo-btn');
  }

  async initializeAdvancedFeatures() {
    try {
      // Initializing advanced features with dynamic imports
      
      // Load Mermaid using dynamic import to avoid AMD conflicts
      try {
        const mermaidModule = await import('https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.esm.min.mjs');
        this.mermaid = mermaidModule.default;
        this.mermaid.initialize({
          startOnLoad: false,
          theme: this.theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          pie: {
            useMaxWidth: true
          }
        });
        this.mermaidInitialized = true;
        // Mermaid loaded successfully
      } catch (error) {
        console.warn('[Mermaid] Failed to load via ES module:', error);
        this.mermaidInitialized = false;
      }
      
      // Load KaTeX using dynamic import
      try {
        const katexModule = await import('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs');
        this.katex = katexModule.default;
        this.katexInitialized = true;
        // KaTeX loaded successfully
      } catch (error) {
        console.warn('[KaTeX] Failed to load via ES module:', error);
        this.katexInitialized = false;
      }
      
      // Update preview after libraries are loaded
      this.updatePreview();
      
    } catch (error) {
      console.error('[Advanced] Error initializing advanced features:', error);
    }
  }

  async initializeMonacoEditorLazy() {
    // Monaco Editor lazy loading - defer until actually needed
    try {
      // Update preview and cursor position
      if (!this.currentFile) {
        this.updatePreview();
      }
      this.updateCursorPosition();
    } catch (error) {
      console.error('[Monaco] Lazy initialization failed:', encodeURIComponent(error.message || error));
    }
  }
  
  async loadMonacoEditor() {
    // If Monaco instance already exists, just show it
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.editor.style.display = 'none';
      this.monacoContainer.style.display = 'block';
      return;
    }
    
    // If Monaco library is loaded but no instance, create one
    if (window.monaco?.editor && !this.monacoEditor) {
      this.createMonacoInstance();
      return;
    }
    
    // Load Monaco library if not loaded
    if (!window.MONACO_SINGLETON) {
      window.MONACO_SINGLETON = this.loadMonacoSingleton();
    }
    
    try {
      await window.MONACO_SINGLETON;
      this.createMonacoInstance();
    } catch (error) {
      console.error('[Monaco] Failed to load Monaco Editor:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
      this.fallbackToTextarea();
      throw error;
    }
  }
  
  loadMonacoSingleton() {
    // Return immediately if Monaco is already loaded
    if (window.monaco?.editor) {
      return Promise.resolve();
    }
    
    return this.createMonacoSingleton();
  }
  
  createMonacoSingleton() {
    return new Promise((resolve, reject) => {
      // Double-check Monaco isn't already loaded
      if (window.monaco?.editor) {
        resolve();
        return;
      }
      
      // Load require.js if not present
      if (!window.require) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
        script.onload = () => this.loadMonacoModule(resolve, reject);
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        this.loadMonacoModule(resolve, reject);
      }
    });
  }
  
  loadMonacoModule(resolve, reject) {
    // Configure require.js only once globally with error handling
    if (!window.MONACO_CONFIGURED) {
      try {
        require.config({ 
          paths: { 
            'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
          },
          // Add timeout and error handling
          waitSeconds: 30,
          onError: function(err) {
            console.error('[Monaco] RequireJS error:', err);
            reject(new Error('Monaco RequireJS configuration failed: ' + err.message));
          }
        });
        window.MONACO_CONFIGURED = true;
      } catch (configError) {
        console.error('[Monaco] Configuration error:', configError);
        reject(configError);
        return;
      }
    }
    
    // Check if Monaco is already available after config
    if (window.monaco?.editor) {
      resolve();
      return;
    }
    
    // Only load if not already defined to prevent duplicates
    if (window.require.defined?.('vs/editor/editor.main')) {
      // Module already loaded, Monaco should be available
      if (window.monaco?.editor) {
        resolve();
      } else {
        // Wait a bit for Monaco to initialize with timeout
        const timeout = setTimeout(() => {
          reject(new Error('Monaco initialization timeout'));
        }, 5000);
        
        const checkMonaco = () => {
          if (window.monaco?.editor) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkMonaco, 100);
          }
        };
        checkMonaco();
      }
      return;
    }
    
    // Load Monaco main module for the first time with timeout
    const loadTimeout = setTimeout(() => {
      reject(new Error('Monaco module loading timeout'));
    }, 15000);
    
    try {
      require(['vs/editor/editor.main'], () => {
        clearTimeout(loadTimeout);
        // Ensure Monaco is actually available
        if (window.monaco?.editor) {
          resolve();
        } else {
          reject(new Error('Monaco module loaded but editor not available'));
        }
      }, (err) => {
        clearTimeout(loadTimeout);
        console.error('[Monaco] Module loading error:', err);
        reject(new Error('Monaco module loading failed: ' + (err.message || err)));
      });
    } catch (requireError) {
      clearTimeout(loadTimeout);
      console.error('[Monaco] Require call error:', requireError);
      reject(requireError);
    }
  }
  
  fallbackToTextarea() {
    if (this.monacoContainer) {
      this.monacoContainer.style.display = 'none';
    }
    if (this.editor) {
      this.editor.style.display = 'block';
    }
    this.isMonacoLoaded = false;
  }

  createMonacoInstance() {
    if (this.isMonacoLoaded || !window.monaco) return;
    
    try {
      // Optimized Monaco Editor configuration
      const editorOptions = {
        value: this.getEditorContent(),
        language: 'markdown',
        theme: this.theme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        wordWrap: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: this.fontSize,
        lineHeight: 1.45,
        fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
        renderWhitespace: 'selection',
        folding: true,
        lineNumbers: 'on',
        glyphMargin: false,
        scrollbar: { vertical: 'auto', horizontal: 'auto' },
        suggest: {
          showKeywords: this.suggestionsEnabled,
          showSnippets: this.suggestionsEnabled,
          showWords: this.suggestionsEnabled
        },
        quickSuggestions: this.suggestionsEnabled
      };
      
      this.monacoEditor = monaco.editor.create(this.monacoContainer, editorOptions);
      this.isMonacoLoaded = true;

      // Setup Monaco event listeners
      this.setupMonacoEventListeners();
      
      // Switch to Monaco display
      this.editor.style.display = 'none';
      this.monacoContainer.style.display = 'block';
      
    } catch (error) {
      console.error('[Monaco] Failed to create editor instance:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
      this.fallbackToTextarea();
    }
  }

  setupMonacoEventListeners() {
    if (!this.monacoEditor) return;

    // Content change events with debounced preview updates
    this.monacoEditor.onDidChangeModelContent(() => {
      this.debouncedUpdatePreview();
      this.markDirty();
      this.updateCursorPosition();
      
      // Enable cursor-based scroll sync during typing
      this.isTyping = true;
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
      }, 500); // Reduced timeout for better responsiveness
      
      // Sync preview to cursor position when typing
      if (this.currentMode === 'split') {
        this.syncPreviewToCursor();
      }
    });
    


    // Cursor position change events
    this.monacoEditor.onDidChangeCursorPosition((e) => {
      try {
        this.updateCursorPosition();
        
        // Only sync preview to cursor position when:
        // 1. Actively typing (content is being modified)
        // 2. Using keyboard navigation (arrow keys, page up/down, etc.)
        // 3. Cursor reaches top or bottom of visible area (natural scroll boundary)
        if (this.currentMode === 'split' && !this.isScrollSyncing && e) {
          const shouldSync = this.isTyping || this.shouldSyncOnCursorMove(e);
          if (shouldSync) {
            this.syncPreviewToCursor();
          }
        }
      } catch (error) {
        console.warn('[Monaco] Cursor position change error:', error);
      }
    });

    // Selection change events - track current selection for toolbar
    this.monacoEditor.onDidChangeCursorSelection((e) => {
      // Only store non-empty selections
      if (!e.selection.isEmpty()) {
        this.lastSelection = e.selection;
        this.lastSelectedText = this.monacoEditor.getModel().getValueInRange(e.selection);
      }
    });

    // Scroll synchronization
    this.monacoEditor.onDidScrollChange((e) => {
      try {
        if (this.currentMode === 'split' && !this.isScrollSyncing) {
          // Only use traditional scroll sync when not typing
          if (!this.isTyping) {
            this.syncScrollToPreview(e.scrollTop, e.scrollHeight);
          }
        }
      } catch (error) {
        console.warn('[Monaco] Scroll change error:', error);
      }
    });

    // Focus events for better UX
    this.monacoEditor.onDidFocusEditorText(() => {
      // Editor focused - no logging needed
    });

    // Auto-continuation for lists and tasks
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Dummy command to prevent conflicts
    });
    
    // Add markdown formatting shortcuts
    this.setupMonacoMarkdownShortcuts();
    
    // Track keyboard navigation for cursor sync
    this.monacoEditor.onKeyDown((e) => {
      // Mark that we're using keyboard navigation
      this.lastKeyboardNavigation = performance.now();
      
      if (e.keyCode === monaco.KeyCode.Enter && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.handleEnterKeyForLists(e);
        
        // Immediately sync preview to cursor when Enter is pressed
        if (this.currentMode === 'split') {
          // Use a small delay to allow the cursor position to update
          setTimeout(() => {
            this.syncPreviewToCursor();
          }, 50);
        }
      }
    });
  }

  setupEventListeners() {
    // File operations
    this.newBtn.addEventListener('click', () => {
      this.newFile();
    });
    this.openBtn.addEventListener('click', () => {
      this.openFile();
    });
    // Save functionality with dropdown
    this.saveBtn.addEventListener('click', () => {
      this.saveFile();
    });
    this.saveDropdownArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSaveDropdown();
    });
    this.saveAsBtn.addEventListener('click', () => {
      this.hideSaveDropdown();
      this.saveAsFile();
    });
    this.closeBtn.addEventListener('click', () => {
      this.closeFile();
    });
    
    // Welcome page buttons
    if (this.welcomeNewBtn) {
      this.welcomeNewBtn.addEventListener('click', () => {
        this.newFile();
      });
    }
    if (this.welcomeOpenBtn) {
      this.welcomeOpenBtn.addEventListener('click', () => {
        this.openFile();
      });
    }
    

    
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener('click', () => {
        this.clearFileHistory();
      });
    }
    
    // Phase 8.5 event listeners
    if (this.helpStatusBtn) {
      this.helpStatusBtn.addEventListener('click', () => {
        this.showHelp();
      });
    }
    
    if (this.welcomeHelpBtn) {
      this.welcomeHelpBtn.addEventListener('click', () => {
        this.showHelp();
      });
    }
    
    if (this.welcomeAboutBtn) {
      this.welcomeAboutBtn.addEventListener('click', () => {
        this.showAbout();
      });
    }
    
    if (this.welcomeSettingsBtn) {
      this.welcomeSettingsBtn.addEventListener('click', () => {
        this.showEnhancedSettings();
      });
    }
    
    // Settings button in main toolbar
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showEnhancedSettings();
      });
    }
    
    // Help modal events
    if (this.helpCloseBtn) {
      this.helpCloseBtn.addEventListener('click', () => this.hideHelp());
    }
    if (this.helpOverlay) {
      this.helpOverlay.addEventListener('click', () => this.hideHelp());
    }
    
    // About modal events
    if (this.aboutCloseBtn) {
      this.aboutCloseBtn.addEventListener('click', () => this.hideAbout());
    }
    if (this.aboutOverlay) {
      this.aboutOverlay.addEventListener('click', () => this.hideAbout());
    }
    

    

    
    // Enhanced settings modal events
    if (this.settingsCloseBtn) {
      this.settingsCloseBtn.addEventListener('click', () => this.hideEnhancedSettings());
    }
    if (this.settingsOverlay) {
      this.settingsOverlay.addEventListener('click', () => this.hideEnhancedSettings());
    }
    
    // Settings control buttons
    this.setupSettingsControls();
    
    // Markdown toolbar events
    this.setupMarkdownToolbarEvents();
    

    
    // Distraction-free mode toggle
    this.distractionBtn.addEventListener('click', () => this.toggleDistractionFree());
    
    // Theme toggle
    this.themeBtn.addEventListener('click', () => this.toggleTheme());
    
    // Mode switching
    this.codeBtn.addEventListener('click', () => this.setMode('code'));
    this.previewBtn.addEventListener('click', () => this.setMode('preview'));
    this.splitBtn.addEventListener('click', () => this.setMode('split'));
    
    // Export dropdown functionality
    this.exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExportDropdown();
    });
    this.exportHtmlBtn.addEventListener('click', () => {
      this.hideExportDropdown();
      this.exportToHtml();
    });
    this.exportPdfBtn.addEventListener('click', () => {
      this.hideExportDropdown();
      this.exportToPdf();
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.hideExportDropdown();
        this.hideSaveDropdown();
      }
    });
    
    // Fallback editor events
    this.editor.addEventListener('input', () => {
      if (!this.isMonacoLoaded) {
        this.updatePreview();
        this.markDirty();
        this.updateCursorPosition();
        
        // Sync preview to cursor position when typing
        if (this.currentMode === 'split') {
          this.syncPreviewToCursorFallback();
        }
      }
    });
    

    
    this.editor.addEventListener('keyup', (e) => {
      if (!this.isMonacoLoaded) {
        this.updateCursorPosition();
        
        // Only sync on keyboard navigation, not on simple clicks
        if (this.currentMode === 'split' && !this.isScrollSyncing && (this.isKeyboardNavigation(e) || this.isTyping)) {
          this.syncPreviewToCursorFallback();
        }
      }
    });
    
    this.editor.addEventListener('keydown', (e) => {
      if (!this.isMonacoLoaded) {
        // Track keyboard navigation for fallback editor too
        this.lastKeyboardNavigation = performance.now();
        
        if (e.key === 'Enter' && this.currentMode === 'split') {
          // Immediately sync preview to cursor when Enter is pressed
          setTimeout(() => {
            this.syncPreviewToCursorFallback();
          }, 50);
        }
      }
    });
    
    this.editor.addEventListener('click', () => {
      if (!this.isMonacoLoaded) {
        this.updateCursorPosition();
        
        // Don't sync preview on simple clicks - only on scroll or keyboard navigation
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Handle Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Special handling for Ctrl+Shift+M (toolbar toggle)
        if (e.key === 'M' && e.shiftKey) {
          e.preventDefault();
          this.toggleMarkdownToolbar();
          return;
        }
        
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
          case 'q':
            // Quit application (Ctrl+Q)
            e.preventDefault();
            this.quitApplication();
            break;
          case '1':
            e.preventDefault();
            this.setMode('code');
            break;
          case '2':
            e.preventDefault();
            this.setMode('preview');
            break;
          case '3':
            e.preventDefault();
            this.setMode('split');
            break;
          case 'i':
            if (e.shiftKey) {
              e.preventDefault();
              this.toggleSuggestions();
            }
            break;
          case 'e':
            if (e.shiftKey) {
              // Export to HTML (Ctrl+Shift+E)
              e.preventDefault();
              this.exportToHtml();
            }
            break;
          case 'p':
            if (e.shiftKey) {
              // Export to PDF (Ctrl+Shift+P)
              e.preventDefault();
              this.exportToPdf();
            } else {
              // Print (Ctrl+P) - use direct browser print
              e.preventDefault();
              this.directPrint();
            }
            break;
          case ',':
            // Settings/Preferences (Ctrl+,)
            e.preventDefault();
            this.showSettings();
            break;
          case '/':
            // Toggle theme (Ctrl+/)
            e.preventDefault();
            this.toggleTheme();
            break;
          case 't':
            // Toggle theme (Ctrl+T)
            e.preventDefault();
            this.toggleTheme();
            break;
          case 'm':
            if (e.shiftKey) {
              // Toggle markdown toolbar (Ctrl+Shift+M)
              e.preventDefault();
              this.toggleMarkdownToolbar();
            }
            break;
          case '=':
          case '+':
            // Zoom in (Ctrl+=)
            if (this.currentMode === 'preview') {
              e.preventDefault();
              this.changeZoom(0.1);
            }
            break;
          case '-':
            // Zoom out (Ctrl+-)
            if (this.currentMode === 'preview') {
              e.preventDefault();
              this.changeZoom(-0.1);
            }
            break;
          case '0':
            // Reset zoom (Ctrl+0)
            if (this.currentMode === 'preview') {
              e.preventDefault();
              this.resetZoom();
            }
            break;










          case 'f':
            // Find in editor (handled by Monaco)
            if (!e.shiftKey) {
              // Let Monaco handle Ctrl+F
              return;
            }
            break;

          case 'h':
            if (e.shiftKey) {
              // Find and replace (handled by Monaco)
              return;
            }
            break;
          case 'z':
            // Undo/Redo (handled by Monaco)
            return;
          case 'y':
            // Redo (handled by Monaco)
            return;
          case 'r':
            if (e.shiftKey && e.altKey) {
              // Secret retro theme (Ctrl+Shift+Alt+R)
              e.preventDefault();
              this.toggleRetroTheme();
            }
            break;
          case 'a':
            // Select all (handled by Monaco)
            return;
          case 'c':
          case 'v':
          case 'x':
            // Copy/Paste/Cut (handled by Monaco)
            return;
        }
      }
      
      // Handle function keys
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          this.showHelp();
          break;
        case 'F5':
          e.preventDefault();
          this.refreshPreview();
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
          // Close modals first, then exit distraction-free mode, then fullscreen
          if (this.helpModal && this.helpModal.style.display === 'flex') {
            this.hideHelp();
          } else if (this.aboutModal && this.aboutModal.style.display === 'flex') {
            this.hideAbout();
          } else if (this.settingsModal && this.settingsModal.style.display === 'flex') {
            this.hideEnhancedSettings();
          } else if (this.isDistractionFree) {
            this.exitDistractionFree();
          } else if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    });
    
    // Splitter functionality
    this.setupSplitter();
    
    // Scroll synchronization for preview
    this.setupScrollSync();
    
    // Enhanced drag and drop functionality set up in constructor
    
    // Zoom controls
    if (this.zoomIn) {
      this.zoomIn.addEventListener('click', () => this.changeZoom(0.1));
    }
    if (this.zoomOut) {
      this.zoomOut.addEventListener('click', () => this.changeZoom(-0.1));
    }
    if (this.zoomReset) {
      this.zoomReset.addEventListener('click', () => this.resetZoom());
    }
  }

  setupSplitter() {
    let isResizing = false;
    
    this.splitter.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const containerRect = this.mainContent.getBoundingClientRect();
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (percentage > 20 && percentage < 80) {
        this.mainContent.style.setProperty('--editor-width', `${percentage}%`);
        this.mainContent.style.setProperty('--preview-width', `${100 - percentage}%`);
        
        // Trigger Monaco layout update with Promise-based approach
        if (this.isMonacoLoaded && this.monacoEditor) {
          // Use Promise.resolve for immediate async execution
          Promise.resolve().then(() => {
            this.monacoEditor.layout();
          });
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = 'default';
    });
  }

  getEditorContent() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      return this.monacoEditor.getValue();
    }
    return this.editor.value;
  }

  setEditorContent(content) {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.setValue(content);
    } else {
      this.editor.value = content;
    }
  }

  async openFile() {
    const startTime = performance.now();
    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available');
      }
      
      const selected = await window.__TAURI__.dialog.open({
        multiple: false,
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      });
      
      if (selected) {
        // Batch file operations for better performance
        await this.loadFileContent(selected, startTime);
      }
    } catch (error) {
      this.handleError(error, 'File Opening');
    }
  }
  
  async loadFileContent(filePath, startTime) {
    try {
      const content = await window.__TAURI__.fs.readTextFile(filePath);
      
      // Batch all UI updates to minimize reflows
      this.isLoadingFile = true;
      
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        this.setEditorContent(content);
        this.isLoadingFile = false;
        this.showEditor();
        this.currentFile = filePath;
        this.isDirty = false;
        
        // Batch filename and history updates
        this.addToFileHistory(filePath);
        this.updateFilename();
        this.updateModeButtons();
        
        // Update preview after DOM updates
        requestAnimationFrame(() => {
          this.updatePreview();
          this.setMode(this.defaultMode);
          this.resetZoom();
          
          this.benchmarkOperation('File Open', startTime);
        });
      });
    } catch (error) {
      this.isLoadingFile = false;
      throw error;
    }
  }

  async saveFile() {
    const startTime = performance.now();
    const content = this.getEditorContent();
    
    if (!window.__TAURI__) {
      console.error('[File] Tauri API not available');
      return;
    }
    
    try {
      if (this.currentFile) {
        await this.saveExistingFile(content);
      } else {
        await this.saveNewFile(content);
      }
      this.benchmarkOperation('File Save', startTime);
    } catch (error) {
      console.error('[File] Save failed:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
      await this.showErrorDialog('Failed to save file: ' + (error.message || error));
    }
  }
  
  async saveExistingFile(content) {
    await window.__TAURI__.fs.writeTextFile(this.currentFile, content);
    
    // Batch UI updates
    requestAnimationFrame(() => {
      this.isDirty = false;
      this.saveBtn.classList.remove('dirty');
      this.updateFilename();
    });
  }
  
  async saveNewFile(content) {
    const filePath = await window.__TAURI__.dialog.save({
      filters: [{
        name: 'Markdown',
        extensions: ['md']
      }]
    });
    
    if (filePath) {
      await window.__TAURI__.fs.writeTextFile(filePath, content);
      
      // Batch UI updates
      requestAnimationFrame(() => {
        this.currentFile = filePath;
        this.isDirty = false;
        this.saveBtn.classList.remove('dirty');
        this.updateFilename();
        this.addToFileHistory(filePath);
      });
    }
    // If filePath is null (user cancelled), do nothing - keep the current document
  }

  async saveAsFile() {
    try {
      const content = this.getEditorContent();
      
      const { save } = window.__TAURI__.dialog;
      const { writeTextFile } = window.__TAURI__.fs;
      
      const filePath = await save({
        filters: [{
          name: 'Markdown',
          extensions: ['md']
        }]
      });
      
      if (filePath) {
        await writeTextFile(filePath, content);
        this.currentFile = filePath;
        this.isDirty = false;
        this.updateFilename();
      }
    } catch (error) {
      this.handleError(error, 'Save As');
    }
  }

  async closeFile() {
    if (this.isDirty) {
      const shouldClose = await this.handleUnsavedChanges();
      if (shouldClose) {
        this.doClose();
      }
      // If shouldClose is false, do nothing - keep the current document
    } else {
      this.doClose();
    }
  }
  
  async handleUnsavedChanges() {
    try {
      const closeWithoutSaving = await window.__TAURI__.dialog.confirm(
        'Close without saving changes?',
        { title: 'Unsaved Changes' }
      );
      return closeWithoutSaving;
    } catch (error) {
      return false; // Don't close on dialog error
    }
  }

  async newFile() {
    if (this.isDirty) {
      // Ask to save current file first
      const shouldClose = await this.handleUnsavedChanges();
      if (shouldClose) {
        this.doNewFile();
      }
      // If shouldClose is false, do nothing - keep the current document
    } else {
      this.doNewFile();
    }
  }
  
  doNewFile() {
    this.currentFile = null;
    const defaultContent = '# New Document\n\nStart typing your markdown here...';
    this.isLoadingFile = true;
    this.setEditorContent(defaultContent);
    this.isLoadingFile = false;
    this.showEditor();
    this.updatePreview();
    this.updateFilename();
    this.updateModeButtons();
    this.setMode('code'); // New files always start in code mode
    this.isDirty = false;
    this.saveBtn.classList.remove('dirty');
    this.resetZoom();
  }
  
  doClose() {
    this.currentFile = null;
    // Clear editor content
    this.isLoadingFile = true;
    this.setEditorContent('');
    this.isLoadingFile = false;
    // Clear preview content
    this.preview.innerHTML = '';
    this.showWelcomePage();
    this.isDirty = false;
    this.saveBtn.classList.remove('dirty');
    this.updateFilename();
    this.updateModeButtons();
  }
  
  showWelcomePage() {
    if (this.welcomePage && this.preview) {
      this.welcomePage.style.display = 'flex';
      this.preview.style.display = 'none';
      this.updateFilename();
    }
  }
  
  showEditor() {
    if (this.welcomePage && this.preview) {
      this.welcomePage.style.display = 'none';
      this.preview.style.display = 'block';
    }
  }

  async updatePreview() {
    let markdown = this.getEditorContent();
    
    // Sanitize markdown input to prevent code injection
    if (window.SecurityUtils) {
      markdown = window.SecurityUtils.sanitizeMarkdownInput(markdown);
    }
    
    if (typeof marked === 'undefined') {
      console.error('[Preview] marked.js not loaded');
      this.preview.innerHTML = '<p>Markdown parser not loaded</p>';
      return;
    }

    try {
      // Configure marked with basic settings and custom renderer
      
      // Check if we're using the new marked API (v5+)
      if (marked.use) {
        
        marked.use({
          breaks: true,
          gfm: true,
          renderer: {
            image(href, title, text) {
              const titleAttr = title ? ` title="${title}"` : '';
              const altAttr = text ? ` alt="${text}"` : '';
              
              // Fix: Properly extract href string from token object
              const hrefStr = typeof href === 'object' ? (href.href || href.raw || '') : String(href || '');
              const escapedHref = hrefStr.replace(/"/g, '&quot;');
              
              // Mark image for processing
              return `<img data-original-src="${escapedHref}" src="${escapedHref}"${altAttr}${titleAttr} style="max-width: 100%; height: auto;" class="markdown-image">`;
            }
          }
        });
      } else {
        
        // Legacy API (marked v4 and below)
        const renderer = new marked.Renderer();
        
        renderer.image = function(href, title, text) {
          const titleAttr = title ? ` title="${title}"` : '';
          const altAttr = text ? ` alt="${text}"` : '';
          
          // Fix: Properly extract href string from token object
          const hrefStr = typeof href === 'object' ? (href.href || href.raw || '') : String(href || '');
          const escapedHref = hrefStr.replace(/"/g, '&quot;');
          
          // Mark image for processing
          return `<img data-original-src="${escapedHref}" src="${escapedHref}"${altAttr}${titleAttr} style="max-width: 100%; height: auto;" class="markdown-image">`;
        };
        
        marked.setOptions({
          breaks: true,
          gfm: true,
          renderer: renderer
        });
      }
      
      // Parse markdown to HTML first
      let html = marked.parse(markdown);
      
      // Process math expressions in the HTML (after markdown processing)
      html = this.processMathInHtml(html);
      
      // Process Mermaid code blocks
      html = this.processMermaidInHtml(html);
      
      // Process task lists
      html = this.processTaskListsInHtml(html);
      
      // Process footnotes
      html = this.processFootnotesInHtml(html);
      
      // Process superscript and subscript
      html = this.processSupSubScript(html);
      
      // Post-process HTML to handle img tags that bypass markdown renderer
      html = this.postProcessHtmlImages(html);
      
      // Set the HTML content
      this.preview.innerHTML = html;
      
      // Render Mermaid diagrams
      await this.renderMermaidDiagrams();
      
      // Setup task list interactions
      this.setupTaskListInteractions();
      
      // Setup anchor link navigation
      this.setupAnchorLinks();
      
      // Apply syntax highlighting to code blocks
      this.applySyntaxHighlighting();
      
      // Setup code block buttons after syntax highlighting
      this.setupCodeBlockButtons();
      
      // Process images for local file conversion (may cause brief flicker on first load)
      await this.processImages();
      
    } catch (error) {
      console.error('[Preview] Error updating preview:', error);
      this.showMarkdownErrorModal(error, markdown);
      this.preview.innerHTML = '<p>⚠️ Markdown rendering error - see error dialog for details</p>';
    }
  }

  showMarkdownErrorModal(error, markdown) {
    const errorMessage = `Markdown Rendering Error

The markdown content contains syntax that could not be processed:

${error.message}

This could be due to:
• Unsupported markdown syntax
• Malformed links or images
• Invalid HTML tags
• Special characters in URLs

Please check your markdown syntax and try again.`;
    
    if (window.__TAURI__?.dialog) {
      window.__TAURI__.dialog.message(errorMessage, { title: 'Markdown Error', type: 'error' }).catch(() => console.error('[Dialog] Failed to show error'));
    } else {
      console.error('[Dialog] Error:', errorMessage);
    }
  }

  showLinkErrorModal(href, error) {
    const errorMessage = `Link Error

Failed to open link: ${href}

Error: ${error.message}

This could be due to:
• Invalid URL format
• Unsupported protocol
• System restrictions

Please check the link format and try again.`;
    
    if (window.__TAURI__?.dialog) {
      window.__TAURI__.dialog.message(errorMessage, { title: 'Link Error', type: 'error' }).catch(() => console.error('[Dialog] Failed to show error'));
    } else {
      console.error('[Dialog] Error:', errorMessage);
    }
  }

  updateCursorPosition() {
    // Debounce cursor position updates for better performance
    clearTimeout(this.cursorUpdateTimeout);
    this.cursorUpdateTimeout = setTimeout(() => {
      let line = 1, col = 1;
      
      if (this.isMonacoLoaded && this.monacoEditor) {
        const position = this.monacoEditor.getPosition();
        if (position) {
          line = position.lineNumber;
          col = position.column;
        }
      } else {
        const textarea = this.editor;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        const lines = text.substring(0, cursorPos).split('\n');
        line = lines.length;
        col = lines[lines.length - 1].length + 1;
      }
      
      this.cursorPos.textContent = `Line ${line}, Col ${col}`;
    }, 50);
  }

  updateFilename() {
    if (this.currentFile) {
      const filename = this.getFilenameFromPath(this.currentFile);
      this.filename.textContent = `${filename}${this.isDirty ? ' *' : ''}`;
    } else if (this.welcomePage && this.welcomePage.style.display !== 'none') {
      this.filename.textContent = 'Welcome';
    } else {
      this.filename.textContent = `untitled.md${this.isDirty ? ' *' : ''}`;
    }
  }
  
  updateModeButtons() {
    const hasDocument = this.currentFile || (this.welcomePage && this.welcomePage.style.display === 'none');
    
    // Use CSS-based approach with data attribute for better performance
    document.body.setAttribute('data-has-document', hasDocument.toString());
    
    // Batch DOM operations for better performance
    this.setBatchButtonState(hasDocument);
    
    if (!hasDocument) {
      // Force preview mode when no document
      this.setMode('preview');
    }
    
    // Update zoom controls visibility
    this.updateZoomControlsVisibility();
  }
  
  setBatchButtonState(hasDocument) {
    // Batch all button state changes to minimize DOM manipulation
    const buttons = [
      this.codeBtn, this.previewBtn, this.splitBtn,
      this.saveBtn, this.saveAsBtn, this.closeBtn,
      this.exportBtn, this.exportHtmlBtn, this.exportPdfBtn
    ];
    
    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      buttons.forEach(btn => {
        if (btn) {
          btn.disabled = !hasDocument;
          btn.classList.toggle('disabled', !hasDocument);
        }
      });
    });
  }

  markDirty() {
    if (!this.isDirty && !this.isLoadingFile) {
      this.isDirty = true;
      this.updateFilename();
      this.saveBtn.classList.add('dirty');
    }
  }

  async setMode(mode) {
    // Ensure initialization is complete before mode switching
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise;
    }
    
    const startTime = performance.now();
    
    // Check if mode switching is allowed
    const hasDocument = this.currentFile || (this.welcomePage && this.welcomePage.style.display === 'none');
    if (!hasDocument && (mode === 'code' || mode === 'split')) {
      return;
    }
    
    // Load Monaco Editor lazily when switching to code or split mode
    if ((mode === 'code' || mode === 'split') && !this.isMonacoLoaded) {
      try {
        await this.loadMonacoEditor();
      } catch (error) {
        console.error('[Monaco] Failed to load Monaco Editor for mode switch:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
        // Fall back to preview mode if Monaco fails to load
        mode = 'preview';
      }
    }
    
    // Store current scroll positions before switching
    this.storeScrollPositions();
    
    // Remove active class from all mode buttons
    this.codeBtn.classList.remove('active');
    this.previewBtn.classList.remove('active');
    this.splitBtn.classList.remove('active');
    
    // Add active class to current mode button
    switch (mode) {
      case 'code':
        this.codeBtn.classList.add('active');
        break;
      case 'preview':
        this.previewBtn.classList.add('active');
        break;
      case 'split':
        this.splitBtn.classList.add('active');
        break;
    }
    
    // Update main content class - remove all mode classes first
    this.mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
    this.mainContent.classList.add(`${mode}-mode`);
    
    // Also update body class for distraction-free mode CSS selectors
    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add(`${mode}-mode`);
    
    this.currentMode = mode;
    
    // Update toolbar visibility
    this.updateToolbarVisibility();
    
    // Update zoom controls visibility
    this.updateZoomControlsVisibility();
    
    // Trigger Monaco layout update and restore scroll positions
    if (this.isMonacoLoaded && this.monacoEditor) {
      // Use requestAnimationFrame instead of setTimeout for better performance
      requestAnimationFrame(() => {
        this.monacoEditor.layout();
        this.restoreScrollPositions();
        this.lastModeSwitchTime = performance.now() - startTime;
        this.benchmarkOperation('Mode Switch', startTime);
      });
    } else {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        this.restoreScrollPositions();
        this.lastModeSwitchTime = performance.now() - startTime;
        this.benchmarkOperation('Mode Switch', startTime);
      });
    }
  }

  setupScrollSync() {
    // Remove any existing scroll listeners to prevent duplicates
    this.cleanupScrollSyncHandlers();
    
    // Cache scroll elements
    this.cachedScrollElements = {
      preview: this.preview,
      previewPane: document.querySelector('.preview-pane')
    };
    
    // Create unified scroll handler
    const handlePreviewScroll = (event) => {
      if (this.currentMode === 'split' && !this.isScrollSyncing) {
        const activeScrollElement = this.getActiveScrollElement();
        if (event.target === activeScrollElement) {
          // Only sync back to editor when user manually scrolls preview (not typing)
          if (!this.isTyping) {
            this.isScrollSyncing = true;
            this.syncScrollToEditor();
            requestAnimationFrame(() => {
              this.isScrollSyncing = false;
            });
          }
        }
      }
    };
    
    // Store handlers for cleanup
    this.previewScrollHandler = handlePreviewScroll;
    this.previewPaneScrollHandler = handlePreviewScroll;
    
    // Add listeners to cached elements
    if (this.cachedScrollElements.preview) {
      this.cachedScrollElements.preview.addEventListener('scroll', this.previewScrollHandler);
    }
    
    if (this.cachedScrollElements.previewPane) {
      this.cachedScrollElements.previewPane.addEventListener('scroll', this.previewPaneScrollHandler);
    }
  }
  
  cleanupScrollSyncHandlers() {
    if (this.previewScrollHandler && this.cachedScrollElements?.preview) {
      this.cachedScrollElements.preview.removeEventListener('scroll', this.previewScrollHandler);
    }
    if (this.previewPaneScrollHandler && this.cachedScrollElements?.previewPane) {
      this.cachedScrollElements.previewPane.removeEventListener('scroll', this.previewPaneScrollHandler);
    }
  }

  setupDragAndDrop() {
    
    // Enhanced drag-and-drop with visual feedback
    let dragCounter = 0;
    
    // Prevent default drag behaviors on document
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      
      // Add visual feedback
      document.body.classList.add('drag-over');
    });
    
    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      
      // Remove visual feedback when completely leaving
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
      
      console.log('[DragDrop] Drop detected!');
      console.log('[DragDrop] DataTransfer:', e.dataTransfer);
      console.log('[DragDrop] Files:', e.dataTransfer?.files);
      
      const files = Array.from(e.dataTransfer?.files || []);
      console.log('[DragDrop] Files array:', files);
      console.log('[DragDrop] Files count:', files.length);
      
      if (files.length === 0) {
        console.log('[DragDrop] No files detected in drop event');
        return;
      }
      
      try {
        // Welcome screen: open .md files
        if (this.welcomePage && this.welcomePage.style.display !== 'none') {
          console.log('[DragDrop] Processing drop on welcome screen');
          const mdFile = files.find(f => /\.(md|markdown|txt)$/i.test(f.name));
          if (mdFile) {
            console.log('[DragDrop] Found markdown file:', mdFile.name);
            const content = await mdFile.text();
            this.isLoadingFile = true;
            this.setEditorContent(content);
            this.isLoadingFile = false;
            this.showEditor();
            this.updatePreview();
            this.currentFile = null; // No save path for drag-dropped files
            this.isDirty = false; // Don't mark as dirty for successful file open
            // Note: Don't add to history for drag-dropped files without save path
            this.updateFilename();
            this.updateModeButtons();
            this.setMode(this.defaultMode);
            console.log('[DragDrop] Successfully opened markdown file (no save path)');
          } else {
            console.log('[DragDrop] No markdown files found in drop');
          }
          return;
        }
        
        // Code mode: Enhanced path resolution
        if (this.currentMode === 'code') {
          console.log('[DragDrop] Processing drop in code mode');
          
          let filePaths = [];
          
          for (const file of files) {
            console.log('[DragDrop] Processing file:', file.name);
            
            // Use filename only for now (absolute path resolution to be implemented later)
            filePaths.push(file.name);
            console.log('[DragDrop] Added filename:', file.name);
          }
          
          // Insert paths into editor
          if (this.isMonacoLoaded && this.monacoEditor) {
            const insertText = filePaths.join('\n');
            const position = this.monacoEditor.getPosition();
            
            this.monacoEditor.executeEdits('drop', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: insertText
            }]);
            
            this.markDirty();
            console.log('[DragDrop] Inserted paths into Monaco:', filePaths);
          } else {
            // Fallback to textarea
            const insertText = filePaths.join('\n');
            const cursorPos = this.editor.selectionStart;
            const textBefore = this.editor.value.substring(0, cursorPos);
            const textAfter = this.editor.value.substring(cursorPos);
            this.editor.value = textBefore + insertText + textAfter;
            this.editor.selectionStart = this.editor.selectionEnd = cursorPos + insertText.length;
            this.markDirty();
            console.log('[DragDrop] Inserted paths into textarea:', filePaths);
          }
        } else {
          console.log('[DragDrop] Drop ignored - not in code mode or welcome screen');
        }
      } catch (error) {
        console.error('[DragDrop] Error processing drop:', error);
      }
    });
    
    console.log('[DragDrop] Browser drag-and-drop event listeners registered');
  }
  
  async setupWindowCloseHandler() {
    if (!window.__TAURI__?.window) return;
    
    try {
      const { getCurrentWindow } = window.__TAURI__.window;
      const appWindow = getCurrentWindow();
      
      const unlisten = await appWindow.onCloseRequested(async (event) => {
        if (this.isDirty) {
          event.preventDefault();
          
          const shouldClose = await this.handleUnsavedChanges();
          if (shouldClose) {
            // Only close if user confirmed they want to close without saving
            this.isDirty = false;
            await appWindow.close();
          }
          // If shouldClose is false, do nothing - keep the window open and preserve content
        }
      });
      
      this.closeHandlerUnlisten = unlisten;
      
    } catch (error) {
      console.error('[Close] Error setting up close handler:', error);
    }
  }
  


  syncScrollToPreview(editorScrollTop, editorScrollHeight) {
    if (this.isScrollSyncing) return;
    
    // Validate input parameters
    if (typeof editorScrollTop !== 'number' || typeof editorScrollHeight !== 'number') {
      console.warn('[Scroll] Invalid scroll parameters:', { editorScrollTop, editorScrollHeight });
      return;
    }
    
    this.isScrollSyncing = true;
    
    try {
      // Use cached scroll info or calculate if needed
      this.updateCachedScrollInfo();
      
      // Ensure cached scroll info exists
      if (!this.cachedScrollInfo) {
        this.isScrollSyncing = false;
        return;
      }
      
      // Calculate scroll percentage using cached values
      const maxEditorScroll = Math.max(0, editorScrollHeight - this.cachedScrollInfo.editorViewHeight);
      const scrollPercentage = maxEditorScroll > 0 ? editorScrollTop / maxEditorScroll : 0;
      
      // Get the actual scrolling element
      const targetElement = this.getActiveScrollElement();
      
      if (targetElement) {
        const maxScroll = Math.max(0, targetElement.scrollHeight - targetElement.clientHeight);
        targetElement.scrollTop = scrollPercentage * maxScroll;
      }
    } catch (error) {
      console.warn('[Scroll] Error in syncScrollToPreview:', error);
    } finally {
      // Use requestAnimationFrame instead of setTimeout
      requestAnimationFrame(() => {
        this.isScrollSyncing = false;
      });
    }
  }
  
  syncPreviewToCursor() {
    if (!this.isMonacoLoaded || !this.monacoEditor || this.isScrollSyncing) return;
    
    this.isScrollSyncing = true;
    
    try {
      const position = this.monacoEditor.getPosition();
      if (!position) {
        this.isScrollSyncing = false;
        return;
      }
      
      const model = this.monacoEditor.getModel();
      if (!model) {
        this.isScrollSyncing = false;
        return;
      }
      
      const totalLines = model.getLineCount();
      const currentLine = position.lineNumber;
      
      // Calculate the percentage of cursor position in the document
      const cursorPercentage = Math.max(0, Math.min(1, (currentLine - 1) / Math.max(1, totalLines - 1)));
      
      // Get the preview scrolling element
      const targetElement = this.getActiveScrollElement();
      
      if (targetElement) {
        const maxScroll = Math.max(0, targetElement.scrollHeight - targetElement.clientHeight);
        let targetScrollTop = cursorPercentage * maxScroll;
        
        // Try to center the corresponding content in the viewport
        const viewportHeight = targetElement.clientHeight;
        const centerOffset = viewportHeight * 0.3; // Position at 30% from top for better visibility
        targetScrollTop = Math.max(0, targetScrollTop - centerOffset);
        
        // Smooth scroll to the target position
        try {
          targetElement.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        } catch (scrollError) {
          // Fallback to direct scrollTop assignment if scrollTo fails
          targetElement.scrollTop = targetScrollTop;
        }
      }
    } catch (error) {
      console.warn('[Scroll] Cursor sync error:', error);
    } finally {
      // Use requestAnimationFrame to reset the flag
      requestAnimationFrame(() => {
        this.isScrollSyncing = false;
      });
    }
  }
  
  syncPreviewToCursorFallback() {
    if (this.isScrollSyncing) return;
    
    this.isScrollSyncing = true;
    
    try {
      const textarea = this.editor;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      // Calculate current line number
      const textBeforeCursor = text.substring(0, cursorPos);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      
      // Calculate total lines
      const totalLines = text.split('\n').length;
      
      // Calculate the percentage of cursor position in the document
      const cursorPercentage = Math.max(0, Math.min(1, (currentLine - 1) / Math.max(1, totalLines - 1)));
      
      // Get the preview scrolling element
      const targetElement = this.getActiveScrollElement();
      
      if (targetElement) {
        const maxScroll = Math.max(0, targetElement.scrollHeight - targetElement.clientHeight);
        let targetScrollTop = cursorPercentage * maxScroll;
        
        // Try to center the corresponding content in the viewport
        const viewportHeight = targetElement.clientHeight;
        const centerOffset = viewportHeight * 0.3; // Position at 30% from top for better visibility
        targetScrollTop = Math.max(0, targetScrollTop - centerOffset);
        
        // Smooth scroll to the target position
        targetElement.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.warn('[Scroll] Fallback cursor sync error:', error);
    } finally {
      // Use requestAnimationFrame to reset the flag
      requestAnimationFrame(() => {
        this.isScrollSyncing = false;
      });
    }
  }
  
  updateCachedScrollInfo() {
    try {
      const now = performance.now();
      
      // Only update cache if it's stale (older than 100ms) or doesn't exist
      if (!this.cachedScrollInfo || (now - this.cachedScrollInfo.timestamp) > 100) {
        const editorElement = this.monacoEditor?.getDomNode();
        
        this.cachedScrollInfo = {
          editorViewHeight: editorElement ? editorElement.clientHeight : 0,
          previewMaxScroll: this.preview ? Math.max(0, this.preview.scrollHeight - this.preview.clientHeight) : 0,
          timestamp: now
        };
      }
    } catch (error) {
      console.warn('[Scroll] Error updating cached scroll info:', error);
      // Provide fallback cached info
      this.cachedScrollInfo = {
        editorViewHeight: 0,
        previewMaxScroll: 0,
        timestamp: performance.now()
      };
    }
  }
  
  getActiveScrollElement() {
    try {
      // Determine which element is actually scrolling based on layout mode
      const previewPane = document.querySelector('.preview-pane');
      const isCentered = document.body.classList.contains('centered-layout');
      
      if (isCentered) {
        // In centered layout, preview-pane is the scrolling element
        return previewPane && previewPane.scrollHeight > previewPane.clientHeight ? previewPane : null;
      } else {
        // In normal layout, preview-content is the scrolling element
        return this.preview && this.preview.scrollHeight > this.preview.clientHeight ? this.preview : null;
      }
    } catch (error) {
      console.warn('[Scroll] Error getting active scroll element:', error);
      return null;
    }
  }

  syncScrollToEditor() {
    if (!this.isMonacoLoaded || !this.monacoEditor) return;
    
    try {
      // Get the actual scrolling element
      const sourceElement = this.getActiveScrollElement();
      if (!sourceElement) return;
      
      // Calculate scroll percentage from the active scroll element
      const previewMaxScroll = Math.max(0, sourceElement.scrollHeight - sourceElement.clientHeight);
      const scrollPercentage = previewMaxScroll > 0 ? sourceElement.scrollTop / previewMaxScroll : 0;
      
      // Get Monaco editor scroll info
      const scrollHeight = this.monacoEditor.getScrollHeight();
      const layoutInfo = this.monacoEditor.getLayoutInfo();
      if (!layoutInfo) return;
      
      const viewHeight = layoutInfo.height;
      const maxScroll = Math.max(0, scrollHeight - viewHeight);
      const targetScrollTop = scrollPercentage * maxScroll;
      
      this.monacoEditor.setScrollTop(targetScrollTop);
    } catch (error) {
      console.warn('[Scroll] Error syncing scroll to editor:', error);
    }
  }
  
  // Helper method to determine if cursor movement was caused by keyboard navigation
  isKeyboardNavigation(e) {
    if (!e) return false;
    
    // Consider these keys as navigation that should trigger sync
    const navigationKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End',
      'Tab'
    ];
    
    return navigationKeys.includes(e.key);
  }
  
  // Helper method to determine if cursor movement should trigger sync in Monaco
  shouldSyncOnCursorMove(e) {
    try {
      // If we recently used keyboard navigation (within 200ms), allow sync
      if (this.lastKeyboardNavigation && (performance.now() - this.lastKeyboardNavigation) < 200) {
        return true;
      }
      
      // Check if cursor moved to top or bottom of visible area (natural scroll boundary)
      if (this.monacoEditor && e && e.position) {
        const visibleRanges = this.monacoEditor.getVisibleRanges();
        if (visibleRanges && visibleRanges.length > 0) {
          const visibleRange = visibleRanges[0];
          if (visibleRange) {
            const cursorLine = e.position.lineNumber;
            const topLine = visibleRange.startLineNumber;
            const bottomLine = visibleRange.endLineNumber;
            
            // Sync if cursor is at the very top or bottom of visible area
            return cursorLine <= topLine + 1 || cursorLine >= bottomLine - 1;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.warn('[Scroll] Error checking cursor sync condition:', error);
      return false;
    }
  }

  toggleSuggestions() {
    this.suggestionsEnabled = !this.suggestionsEnabled;
    
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.updateOptions({
        suggest: {
          showKeywords: this.suggestionsEnabled,
          showSnippets: this.suggestionsEnabled,
          showWords: this.suggestionsEnabled
        },
        quickSuggestions: this.suggestionsEnabled
      });
    }
  }

  storeScrollPositions() {
    try {
      // Store editor scroll position and dimensions
      if (this.isMonacoLoaded && this.monacoEditor) {
        this.lastEditorScrollTop = this.monacoEditor.getScrollTop();
        const scrollHeight = this.monacoEditor.getScrollHeight();
        const layoutInfo = this.monacoEditor.getLayoutInfo();
        if (layoutInfo) {
          const viewHeight = layoutInfo.height;
          this.lastEditorMaxScroll = Math.max(0, scrollHeight - viewHeight);
        }
      }
      
      // Store preview scroll position from the active scroll element
      const activeScrollElement = this.getActiveScrollElement();
      if (activeScrollElement) {
        this.lastPreviewScrollTop = activeScrollElement.scrollTop;
        this.lastPreviewMaxScroll = Math.max(0, activeScrollElement.scrollHeight - activeScrollElement.clientHeight);
      }
    } catch (error) {
      console.warn('[Scroll] Error storing scroll positions:', error);
    }
  }
  
  restoreScrollPositions() {
    try {
      const activeScrollElement = this.getActiveScrollElement();
      
      if (this.currentMode === 'code') {
        // When switching to code mode, sync preview scroll to editor
        if (this.isMonacoLoaded && this.monacoEditor) {
          const scrollPercentage = this.lastPreviewMaxScroll > 0 ? this.lastPreviewScrollTop / this.lastPreviewMaxScroll : 0;
          const scrollHeight = this.monacoEditor.getScrollHeight();
          const layoutInfo = this.monacoEditor.getLayoutInfo();
          if (layoutInfo) {
            const viewHeight = layoutInfo.height;
            const maxScroll = Math.max(0, scrollHeight - viewHeight);
            const targetScrollTop = scrollPercentage * maxScroll;
            this.monacoEditor.setScrollTop(targetScrollTop);
          }
        }
      } else if (this.currentMode === 'preview') {
        // When switching to preview mode, sync editor scroll to preview
        if (this.isMonacoLoaded && this.monacoEditor && activeScrollElement) {
          const scrollPercentage = this.lastEditorMaxScroll > 0 ? this.lastEditorScrollTop / this.lastEditorMaxScroll : 0;
          const previewMaxScroll = Math.max(0, activeScrollElement.scrollHeight - activeScrollElement.clientHeight);
          const previewScrollTop = scrollPercentage * previewMaxScroll;
          activeScrollElement.scrollTop = previewScrollTop;
        }
      } else if (this.currentMode === 'split') {
        // In split mode, restore both positions using active scroll element
        if (this.isMonacoLoaded && this.monacoEditor && activeScrollElement) {
          this.monacoEditor.setScrollTop(this.lastEditorScrollTop);
          activeScrollElement.scrollTop = this.lastPreviewScrollTop;
        }
      }
    } catch (error) {
      console.warn('[Scroll] Error restoring scroll positions:', error);
    }
  }

  processMathInHtml(html) {
    if (this.katexInitialized && this.katex) {
      // Cache regex patterns for better performance
      if (!this.mathRegexCache) {
        this.mathRegexCache = {
          displayMath: /\$\$([^$]+)\$\$/g,
          inlineMath: /\$([^$\n]+)\$/g
        };
      }
      
      // Process display math: $$...$$ (not inside code blocks)
      html = html.replace(this.mathRegexCache.displayMath, (match, math, offset, string) => {
        // Check if this match is inside a code block or inline code
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match; // Return unchanged if inside code
        }
        
        try {
          const rendered = this.katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false
          });
          return `<div class="math-display">${rendered}</div>`;
        } catch (error) {
          console.warn('[Math] KaTeX display math error:', error);
          return `<div class="math-display math-error"><code>${math.trim()}</code></div>`;
        }
      });
      
      // Process inline math: $...$ (not inside code blocks)
      html = html.replace(this.mathRegexCache.inlineMath, (match, math, offset, string) => {
        // Check if this match is inside a code block or inline code
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match; // Return unchanged if inside code
        }
        
        try {
          const rendered = this.katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false
          });
          return `<span class="math-inline">${rendered}</span>`;
        } catch (error) {
          console.warn('[Math] KaTeX inline math error:', error);
          return `<span class="math-inline math-error"><code>${math.trim()}</code></span>`;
        }
      });
    } else {
      
      // Fallback styling without external libraries using cached patterns
      if (!this.mathRegexCache) {
        this.mathRegexCache = {
          displayMath: /\$\$([^$]+)\$\$/g,
          inlineMath: /\$([^$\n]+)\$/g
        };
      }
      
      html = html.replace(this.mathRegexCache.displayMath, (match, math, offset, string) => {
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match;
        }
        return `<div class="math-display math-fallback"><code>${math.trim()}</code></div>`;
      });
      
      html = html.replace(this.mathRegexCache.inlineMath, (match, math, offset, string) => {
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match;
        }
        return `<span class="math-inline math-fallback"><code>${math.trim()}</code></span>`;
      });
    }
    
    return html;
  }
  
  isInsideCodeBlock(html, offset, matchLength) {
    // Check if the match is inside <code> or <pre> tags
    const beforeMatch = html.substring(0, offset);
    const afterMatch = html.substring(offset + matchLength);
    
    // Count opening and closing code/pre tags before the match
    const codeOpenBefore = (beforeMatch.match(/<code[^>]*>/g) || []).length;
    const codeCloseBefore = (beforeMatch.match(/<\/code>/g) || []).length;
    const preOpenBefore = (beforeMatch.match(/<pre[^>]*>/g) || []).length;
    const preCloseBefore = (beforeMatch.match(/<\/pre>/g) || []).length;
    
    // If we're inside an unclosed code or pre tag, skip processing
    return (codeOpenBefore > codeCloseBefore) || (preOpenBefore > preCloseBefore);
  }
  
  processMermaidInHtml(html) {
    if (this.mermaidInitialized && this.mermaid) {
      
      // Replace mermaid code blocks with containers for rendering
      html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
        const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        return `<div class="mermaid-diagram" id="${id}" data-mermaid-code="${encodeURIComponent(decodedCode.trim())}"></div>`;
      });
    } else {
      
      // Fallback placeholders
      html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
        const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
        return `<div class="mermaid-placeholder mermaid-fallback">
          <div class="placeholder-header">📊 Mermaid Diagram</div>
          <pre class="diagram-code">${decodedCode}</pre>
          <div class="placeholder-note">Mermaid.js not loaded - showing code instead</div>
        </div>`;
      });
    }
    
    return html;
  }
  
  processSupSubScript(html) {
    // Process superscript: ^text^ or ^(text with spaces)^
    html = html.replace(/\^\(([^)]+)\)\^/g, '<sup>$1</sup>');
    html = html.replace(/\^([^\s^]+)\^/g, '<sup>$1</sup>');
    
    // Process subscript: ~text~ or ~(text with spaces)~
    html = html.replace(/~\(([^)]+)\)~/g, '<sub>$1</sub>');
    html = html.replace(/~([^\s~]+)~/g, '<sub>$1</sub>');
    
    return html;
  }
  
  processFootnotesInHtml(html) {
    const footnotes = new Map();
    
    // Collect definitions - simpler pattern
    html.replace(/\[\^([^\]]+)\]:\s*(.+?)(?=\n|$)/g, (match, id, definition) => {
      footnotes.set(id, definition.trim());
    });
    
    // Remove definition paragraphs
    html = html.replace(/<p>\[\^[^\]]+\]:[^<]*<\/p>/g, '');
    
    // Process references
    html = html.replace(/\[\^([^\]]+)\]/g, (match, id) => {
      return footnotes.has(id) ? 
        `<sup><a href="#footnote-${id}" id="footnote-ref-${id}" class="footnote-ref">${id}</a></sup>` : 
        match;
    });
    
    // Add footnotes section
    if (footnotes.size > 0) {
      let footnotesHtml = '<div class="footnotes"><hr><ol>';
      for (const [id, definition] of footnotes) {
        footnotesHtml += `<li id="footnote-${id}">${definition} <a href="#footnote-ref-${id}" class="footnote-backref">↩</a></li>`;
      }
      footnotesHtml += '</ol></div>';
      html += footnotesHtml;
    }
    
    return html;
  }
  
  processTaskListsInHtml(html) {
    let taskCount = 0;
    
    // First, handle any existing disabled checkboxes in li elements (not in code blocks)
    html = html.replace(/<li><input[^>]*disabled[^>]*type="checkbox"[^>]*>\s*([^<]*)<\/li>/g, (match, content, offset, string) => {
      if (this.isInsideCodeBlock(string, offset, match.length)) {
        return match; // Keep original if inside code block
      }
      
      const isChecked = /\bchecked\b[="']?/.test(match);
      const id = 'task-' + Date.now() + '-' + taskCount;
      taskCount++;

      return `<div class="task-list-item dash-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${content.trim()}</label></div>`;
    });
    
    // Handle dash-prefixed task lists in li elements (not in code blocks)
    html = html.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/gs, (match, checked, content, offset, string) => {
      if (this.isInsideCodeBlock(string, offset, match.length)) {
        return match; // Keep original if inside code block
      }
      
      const isChecked = checked === 'x';
      const id = 'task-' + Date.now() + '-' + taskCount;
      taskCount++;

      return `<div class="task-list-item dash-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${content}</label></div>`;
    });
    
    // Handle standalone checkbox patterns in paragraphs (not in code blocks)
    html = html.replace(/<p>\[([ x])\]\s*([^<]*?)<\/p>/g, (match, checked, content, offset, string) => {
      if (this.isInsideCodeBlock(string, offset, match.length)) {
        return match; // Keep original if inside code block
      }
      
      const isChecked = checked === 'x';
      const cleanContent = content.trim();
      const id = 'task-' + Date.now() + '-' + taskCount;
      taskCount++;

      return `<div class="task-list-item standalone-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${cleanContent}</label></div>`;
    });
    
    return html;
  }
  
  async renderMermaidDiagrams() {
    if (!this.mermaidInitialized || !this.mermaid) {
      return;
    }
    
    const diagrams = document.querySelectorAll('.mermaid-diagram');
    
    for (let i = 0; i < diagrams.length; i++) {
      const diagram = diagrams[i];
      const code = decodeURIComponent(diagram.getAttribute('data-mermaid-code'));
      
      try {
        // Clear any existing content
        diagram.innerHTML = '';
        
        // Render the diagram
        const { svg } = await this.mermaid.render(diagram.id + '-svg', code);
        diagram.innerHTML = svg;
      } catch (error) {
        console.error(`[Mermaid] Error rendering diagram ${i + 1}:`, error);
        diagram.innerHTML = `
          <div class="mermaid-error">
            <div class="error-header">⚠️ Mermaid Rendering Error</div>
            <pre class="diagram-code">${code}</pre>
            <div class="error-message">${error.message}</div>
          </div>
        `;
      }
    }

  }
  
  setupTaskListInteractions() {
    
    if (this.taskChangeHandler) {
      this.preview.removeEventListener('change', this.taskChangeHandler);
    }
    
    this.taskChangeHandler = (e) => {
      if (e.target.type === 'checkbox' && e.target.closest('.task-list-item')) {
        const label = e.target.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
          const taskText = label.textContent.trim();
          
          // Check for duplicate tasks
          if (this.hasDuplicateTask(taskText)) {
            // Revert checkbox state and show warning
            e.target.checked = !e.target.checked;
            this.showTaskConflictModal();
            return;
          }
          
          this.updateTaskInMarkdown(taskText, e.target.checked);
          this.markDirty();
        }
      }
    };
    
    this.preview.addEventListener('change', this.taskChangeHandler);
  }
  


  async openExternalLink(href) {
    // Strict validation - reject anything that doesn't meet standards
    if (!href || typeof href !== 'string' || href.trim().length === 0) {
      this.showLinkErrorModal(href, new Error('Empty or invalid link'));
      return;
    }
    
    const cleanHref = href.trim();
    
    // Only allow well-formed URLs
    if (!this.isStrictlyValidUrl(cleanHref)) {
      this.showLinkErrorModal(cleanHref, new Error('Invalid URL format - please use proper format like https://example.com or mailto:user@domain.com'));
      return;
    }
    
    try {
      if (window.__TAURI__?.core?.invoke) {
        // Wrap Tauri call in additional safety
        await Promise.race([
          window.__TAURI__.core.invoke('plugin:opener|open_url', { url: cleanHref }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } else {
        window.open(cleanHref, '_blank');
      }
    } catch (error) {
      console.error('[Links] Error opening external link:', error);
      this.showLinkErrorModal(cleanHref, error);
    }
  }

  isValidUrl(string) {
    try {
      // Basic validation for common protocols
      if (string.startsWith('mailto:')) {
        return string.includes('@') && string.length > 7;
      }
      if (string.startsWith('http://') || string.startsWith('https://')) {
        new URL(string);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  isStrictlyValidUrl(string) {
    try {
      if (string.startsWith('mailto:')) {
        // Strict email validation
        const email = string.substring(7);
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      }
      if (string.startsWith('http://') || string.startsWith('https://')) {
        const url = new URL(string);
        return url.hostname.includes('.') && url.hostname.length > 3;
      }
      return false;
    } catch {
      return false;
    }
  }

  looksLikeEmail(string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(string);
  }

  setupAnchorLinks() {
    
    // Add IDs to headers for anchor navigation
    const headers = this.preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      if (!header.id) {
        const id = header.textContent.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
        header.id = id;
      }
    });
    
    // Handle anchor link clicks
    if (this.anchorClickHandler) {
      this.preview.removeEventListener('click', this.anchorClickHandler);
    }
    
    this.anchorClickHandler = (e) => {
      // Handle both direct links and image links
      let linkElement = null;
      let href = null;
      
      if (e.target.tagName === 'A') {
        linkElement = e.target;
        href = linkElement.getAttribute('href');
      } else if (e.target.tagName === 'IMG' && e.target.parentElement.tagName === 'A') {
        // Handle image inside link (clickable image)
        linkElement = e.target.parentElement;
        href = linkElement.getAttribute('href');
      }
      
      if (!href || !linkElement) return;
      
      // Handle internal anchor links
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = this.preview.querySelector(`#${targetId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      // Handle external links - open in browser (including image links)
      else if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || this.looksLikeEmail(href)) {
        e.preventDefault();
        // Always prevent default and show error for invalid links
        try {
          // Convert plain email to mailto format only if it's a valid email
          let finalHref = href;
          if (this.looksLikeEmail(href) && !href.startsWith('mailto:')) {
            if (this.isStrictlyValidUrl(`mailto:${href}`)) {
              finalHref = `mailto:${href}`;
            } else {
              this.showLinkErrorModal(href, new Error('Invalid email format - please use format: user@domain.com'));
              return;
            }
          }
          this.openExternalLink(finalHref);
        } catch (error) {
          console.error('[Links] Error opening link:', error);
          this.showLinkErrorModal(href, error);
        }
      }
      // Catch any other link types and show error
      else if (href && href !== '#') {
        e.preventDefault();
        this.showLinkErrorModal(href, new Error('Unsupported link format - please use http://, https://, or mailto: links'));
      }
    };
    
    this.preview.addEventListener('click', this.anchorClickHandler);

  }
  

  
  hasDuplicateTask(taskText) {
    const currentContent = this.getEditorContent();
    const lines = currentContent.split('\n');
    let count = 0;
    let inCodeBlock = false;
    
    for (const line of lines) {
      // Check for code block boundaries
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      // Skip lines inside code blocks
      if (inCodeBlock) continue;
      
      if ((line.includes('- [ ]') || line.includes('- [x]') || line.includes('[ ]') || line.includes('[x]')) && line.includes(taskText)) {
        count++;
        if (count > 1) return true;
      }
    }
    return false;
  }
  
  showTaskConflictModal() {
    const modal = document.getElementById('task-conflict-modal');
    const okBtn = document.getElementById('task-conflict-ok');
    
    modal.style.display = 'flex';
    
    const handleOk = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
    };
    
    okBtn.addEventListener('click', handleOk);
  }
  
  updateTaskInMarkdown(taskText, checked) {
    const currentContent = this.getEditorContent();
    const lines = currentContent.split('\n');
    let inCodeBlock = false;
    
    let updated = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for code block boundaries
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      // Skip lines inside code blocks
      if (inCodeBlock) continue;
      
      if (line.includes(taskText)) {
        // Handle dash-prefixed tasks: - [ ] or - [x]
        if (line.includes('- [ ]') || line.includes('- [x]')) {
          if (checked) {
            lines[i] = line.replace('- [ ]', '- [x]');
          } else {
            lines[i] = line.replace('- [x]', '- [ ]');
          }
          updated = true;
          break;
        }
        // Handle standalone tasks: [ ] or [x]
        else if (line.includes('[ ]') || line.includes('[x]')) {
          if (checked) {
            lines[i] = line.replace('[ ]', '[x]');
          } else {
            lines[i] = line.replace('[x]', '[ ]');
          }
          updated = true;
          break;
        }
      }
    }
    
    if (updated) {
      const newContent = lines.join('\n');
      this.setEditorContent(newContent);
    }
  }
  
  async exportToHtml() {
    try {
      const content = this.getEditorContent();
      const previewHtml = this.preview.innerHTML;
      
      // Use extracted template method
      const htmlDocument = this.createExportHtmlDocument(previewHtml);
      
      // Save HTML file using helper method
      await this.saveHtmlFile(htmlDocument);
      
    } catch (error) {
      this.handleExportError(error, 'HTML');
    }
  }
  
  createExportHtmlDocument(previewHtml) {
    return this.getHtmlDocumentTemplate(previewHtml, 'Exported Markdown', this.getExportHtmlStyles());
  }
  
  getHtmlDocumentTemplate(content, title, styles) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
        ${styles}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }
  
  getExportHtmlStyles() {
    return `body {
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
  }
  
  async saveHtmlFile(htmlDocument) {
    await this.saveFileWithDialog(htmlDocument, 'HTML', ['html']);
  }
  
  async saveFileWithDialog(content, filterName, extensions) {
    if (!window.__TAURI__) return;
    
    const filePath = await window.__TAURI__.dialog.save({
      filters: [{ name: filterName, extensions }]
    });
    
    if (filePath) {
      await window.__TAURI__.fs.writeTextFile(filePath, content);
    }
  }
  
  handleExportError(error, type) {
    this.showErrorMessage(`Error exporting to ${type}: ${error.message}`, 'Export Error');
  }
  
  showErrorMessage(message, title = 'Error') {
    if (window.__TAURI__) {
      window.__TAURI__.dialog.message(message, { title, type: 'error' });
    } else {
      alert(message);
    }
  }
  
  async exportToPdf() {
    try {
      // Create a print-optimized version and open print dialog
      await this.openPrintDialog();
      
    } catch (error) {
      console.error('[Export] PDF export failed:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
      await this.showErrorDialog('PDF Export Error: ' + error.message + '\n\nTip: Use Ctrl+P to print directly, or try HTML Export and print from your browser.');
    }
  }
  
  async printContent() {
    try {
      
      // Get content based on current mode
      let contentToPrint = '';
      let printTitle = 'Markdown Document';
      
      if (this.currentMode === 'code') {
        // Print Monaco editor content with syntax highlighting
        const editorContent = this.getEditorContent();
        contentToPrint = `<pre><code class="language-markdown hljs">${this.escapeHtml(editorContent)}</code></pre>`;
        printTitle = 'Markdown Source Code';
      } else {
        // Print rendered markdown (preview mode or split mode)
        contentToPrint = this.getPreviewContentForPrint();
        printTitle = 'Rendered Markdown';
      }
      
      // Create print-optimized HTML
      const printHtml = this.createPrintHtml(contentToPrint, printTitle);
      
      // Try to use Tauri's print functionality first
      if (window.__TAURI__ && window.__TAURI__.shell) {
        try {
          // Create temporary HTML file and open with system print
          const tempPath = await this.createTempPrintFile(printHtml);
          await window.__TAURI__.shell.open(tempPath);
          return;
        } catch (error) {
          console.warn('[Export] Tauri print failed, falling back to browser print:', encodeURIComponent(error.message || error));
        }
      }
      
      // Fallback to browser print without popup
      this.printViaBrowserDirect(printHtml);
      
    } catch (error) {
      console.error('[Export] Print content failed:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
      throw error;
    }
  }
  
  createPrintHtml(content, title) {
    return this.getPrintHtmlTemplate(content, title);
  }
  
  getPrintHtmlTemplate(content, title) {
    return this.getPrintDocumentTemplate(content, title, this.getPrintStyles(), this.getPrintScript());
  }
  
  getPrintDocumentTemplate(content, title, styles, script) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    ${styles}
  </style>
</head>
<body>
  ${content}
  <script>
    ${script}
  </script>
</body>
</html>`;
  }
  
  getPrintStyles() {
    return `body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: none;
      margin: 0;
      padding: 15px;
      color: #24292f;
      background: white;
    }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    code { background-color: #f6f8fa; padding: 0.2em 0.4em; border-radius: 6px; }
    pre { 
      background-color: transparent !important; 
      padding: 16px; 
      border-radius: 6px; 
      overflow: visible;
      page-break-inside: avoid;
      border: none;
    }
    pre code { 
      white-space: pre-wrap; 
      word-wrap: break-word;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
      font-size: 14px;
      line-height: 1.4;
    }
    .hljs { background: transparent !important; }
    .hljs-keyword { color: #d73a49 !important; }
    .hljs-string { color: #032f62 !important; }
    .hljs-comment { color: #6a737d !important; }
    .hljs-number { color: #005cc5 !important; }
    .hljs-title { color: #6f42c1 !important; }
    blockquote { border-left: 0.25em solid #d0d7de; padding: 0 1em; color: #656d76; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 6px 13px; text-align: left; }
    th { background-color: #f6f8fa; }
    .task-list-item { list-style: none; margin-bottom: 4px; }
    .mermaid-diagram { 
      text-align: center; 
      margin: 20px 0;
      page-break-inside: avoid;
      max-width: 100%;
      overflow: hidden;
    }
    .mermaid-diagram svg { 
      max-width: 100% !important; 
      height: auto !important;
      max-height: 600px !important;
      page-break-inside: avoid;
    }
    @media print {
      body { margin: 0; padding: 15px; }
      .no-print { display: none !important; }
      .toolbar, .status-bar, .welcome-page { display: none !important; }
      pre, .mermaid-diagram, blockquote, table { 
        page-break-inside: avoid;
        break-inside: avoid;
      }
      h1, h2, h3, h4, h5, h6 { 
        page-break-after: avoid;
        break-after: avoid;
      }
      img, svg { 
        max-width: 100% !important; 
        height: auto !important;
        page-break-inside: avoid;
      }
      * {
        color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    @page {
      margin: 0.6in;
      size: letter;
    }`;
  }
  
  getPrintScript() {
    return `document.addEventListener('DOMContentLoaded', function() {
      if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach(function(block) {
          if (!block.classList.contains('hljs')) {
            hljs.highlightElement(block);
          }
        });
      }
    });`;
  }
  
  async createTempPrintFile(htmlContent) {
    const tempDir = await window.__TAURI__.path.tempDir();
    const tempFile = await window.__TAURI__.path.join(tempDir, 'markdown-print.html');
    await window.__TAURI__.fs.writeTextFile(tempFile, htmlContent);
    return tempFile;
  }
  
  async openPrintDialog() {
    try {
      // Simply use the browser's native print dialog
      this.directPrint();
      
    } catch (error) {
      console.error('[Export] Print dialog failed:', encodeURIComponent(error.message || error));
      this.showPrintInstructions();
    }
  }
  

  
  directPrint() {
    try {
      // Simply trigger the browser's print dialog
      window.print();
      
    } catch (error) {
      console.error('[Export] Direct print failed:', encodeURIComponent(error.message || error));
      this.showPrintInstructions();
    }
  }
  
  async showPrintInstructions() {
    const message = `Print Setup Instructions:

1. Press Ctrl+P (or Cmd+P on Mac) to open the print dialog
2. Select "Save as PDF" or your preferred printer
3. Adjust print settings as needed

Current mode: ${this.currentMode}
• Code mode: Prints the markdown source code
• Preview mode: Prints the rendered markdown
• Split mode: Prints the rendered markdown

Tip: You can also use HTML Export and then print from your browser.`;
    
    await this.showErrorDialog(message);
  }
  
  getPreviewContentForPrint() {
    // Clone the preview content and ensure syntax highlighting is applied
    const previewClone = this.preview.cloneNode(true);
    
    // Apply syntax highlighting to code blocks in the clone
    if (typeof hljs !== 'undefined') {
      previewClone.querySelectorAll('pre code').forEach((block) => {
        if (!block.classList.contains('hljs')) {
          hljs.highlightElement(block);
        }
      });
    }
    
    return previewClone.innerHTML;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  applySyntaxHighlighting() {
    // Apply highlight.js syntax highlighting to code blocks
    if (typeof hljs !== 'undefined') {
      this.preview.querySelectorAll('pre code').forEach((block) => {
        // Clear any existing highlighting to prevent security warnings
        if (block.classList.contains('hljs')) {
          block.classList.remove('hljs');
          block.removeAttribute('data-highlighted');
          // Remove all hljs-* classes
          const classes = Array.from(block.classList);
          classes.forEach(cls => {
            if (cls.startsWith('hljs-')) {
              block.classList.remove(cls);
            }
          });
        }
        
        // Apply highlighting
        hljs.highlightElement(block);
        block.setAttribute('data-highlighted', 'yes');
      });
    } else {
      console.warn('[Syntax] highlight.js not loaded');
    }
  }

  setupCodeBlockButtons() {
    // Only add buttons in preview mode and not in distraction-free mode
    if (this.currentMode !== 'preview' || this.isDistractionFree) return;
    
    this.preview.querySelectorAll('pre').forEach((pre) => {
      // Skip if buttons already exist
      if (pre.querySelector('.code-block-buttons')) return;
      
      const codeElement = pre.querySelector('code');
      if (!codeElement) return;
      
      // Get text content (works with both plain and highlighted code)
      const originalText = codeElement.textContent || codeElement.innerText;
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'code-block-buttons';
      
      // Create copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-btn copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.title = 'Copy code';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(originalText).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy', 1000);
        });
      });
      
      // Create break line button
      const breakBtn = document.createElement('button');
      breakBtn.className = 'code-btn break-btn';
      breakBtn.textContent = 'Wrap';
      breakBtn.title = 'Toggle line wrapping';
      breakBtn.addEventListener('click', () => {
        const isWrapped = codeElement.style.whiteSpace === 'pre-wrap';
        if (isWrapped) {
          codeElement.style.whiteSpace = '';
          codeElement.style.wordBreak = '';
          breakBtn.textContent = 'Wrap';
        } else {
          codeElement.style.whiteSpace = 'pre-wrap';
          codeElement.style.wordBreak = 'break-word';
          breakBtn.textContent = 'Unwrap';
        }
      });
      
      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(breakBtn);
      pre.appendChild(buttonContainer);
    });
  }

  async processImages() {
    const images = this.preview.querySelectorAll('img.markdown-image');
    
    if (images.length === 0) return;
    
    // Process images in smaller batches to avoid overwhelming the system
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < images.length; i += batchSize) {
      batches.push(Array.from(images).slice(i, i + batchSize));
    }
    
    // Process batches sequentially for better performance
    for (const batch of batches) {
      const batchPromises = batch.map(img => this.processImage(img));
      
      try {
        await Promise.race([
          Promise.all(batchPromises),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Batch timeout')), 3000))
        ]);
      } catch (error) {
        console.warn('[Images] Batch processing timeout:', error);
        // Continue with next batch even if current batch fails
      }
    }
  }
  
  async processImage(img) {
    let originalSrc = img.getAttribute('data-original-src');
    
    if (!originalSrc) return;
    
    // Decode URL-encoded paths
    if (originalSrc.includes('%')) {
      try {
        originalSrc = decodeURIComponent(originalSrc);
      } catch (e) {
        return;
      }
    }
    
    try {
      const isTauriDevUrl = originalSrc.startsWith('http://127.0.0.1:') || originalSrc.startsWith('http://localhost:');
      const isLocalFile = !originalSrc.startsWith('http://') && !originalSrc.startsWith('https://') && !originalSrc.startsWith('data:');
      
      if (isLocalFile || isTauriDevUrl) {
        if (window.__TAURI__?.core?.invoke) {
          try {
            let resolvedPath = originalSrc;
            
            if (isTauriDevUrl) {
              resolvedPath = this.improveDevServerPathResolution(originalSrc);
            }
            
            if (!isTauriDevUrl && this.currentFile && !this.isAbsolutePath(resolvedPath)) {
              const currentDir = this.currentFile.substring(0, Math.max(this.currentFile.lastIndexOf('/'), this.currentFile.lastIndexOf('\\')));
              if (currentDir) {
                resolvedPath = this.joinPaths(currentDir, resolvedPath);
              }
            }
            
            let dataUrl;
            if (window.safeIPC?.isAvailable) {
              dataUrl = await window.safeIPC.invoke('convert_local_image_path', { filePath: resolvedPath });
            } else {
              dataUrl = await Promise.race([
                window.__TAURI__.core.invoke('convert_local_image_path', { filePath: resolvedPath }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Image conversion timeout')), 2000))
              ]);
            }
            
            if (dataUrl && typeof dataUrl === 'string') {
              img.src = dataUrl;
              img.classList.add('local-image');
            } else {
              throw new Error('Invalid image data returned');
            }
          } catch (error) {
            img.classList.add('image-error');
            const errorMessage = typeof error === 'string' ? error : (error.message || error.toString() || 'Unknown error');
            img.title = `Image not found: ${originalSrc}\nError: ${errorMessage}`;
          }
        } else {
          img.classList.add('image-error');
          img.title = `Local image requires Tauri: ${originalSrc}`;
        }
      } else {
        img.classList.add('remote-image');
      }
    } catch (error) {
      img.classList.add('image-error');
      img.title = `Error loading image: ${error.message}`;
    }
  }
  
  postProcessHtmlImages(html) {
    // Post-process HTML to add markdown-image class to all img tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const allImages = tempDiv.querySelectorAll('img');
    allImages.forEach(img => {
      if (!img.classList.contains('markdown-image')) {
        img.classList.add('markdown-image');
        // Ensure data-original-src is set with proper src value
        let srcValue = img.getAttribute('src') || img.src;
        // Don't encode the src value when setting data-original-src
        img.setAttribute('data-original-src', srcValue);
        // Add proper styling
        if (!img.style.maxWidth) {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
      }
    });
    
    return tempDiv.innerHTML;
  }

  toggleTheme() {
    const isRetro = document.body.classList.contains('retro-theme');
    if (isRetro) {
      // Exit retro mode and go to light theme
      document.body.classList.remove('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'false');
      this.theme = 'light';
      localStorage.setItem('markdownViewer_defaultTheme', 'light');
      this.applyDefaultTheme();
      this.themeBtn.textContent = '🌙';
      if (this.isMonacoLoaded && this.monacoEditor) {
        monaco.editor.setTheme('vs');
      }
    } else {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
      this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
      
      // Update Monaco theme
      if (this.isMonacoLoaded && this.monacoEditor) {
        monaco.editor.setTheme(this.theme === 'dark' ? 'vs-dark' : 'vs');
      }
    }
    
    // Update Mermaid theme and re-render diagrams
    if (this.mermaidInitialized && this.mermaid) {
      this.mermaid.initialize({
        theme: this.theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
      // Re-render all Mermaid diagrams with new theme
      this.updatePreview();
    }
  }
  
  toggleRetroTheme() {
    const isRetro = document.body.classList.contains('retro-theme');
    if (isRetro) {
      document.body.classList.remove('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'false');
      this.isRetroTheme = false;
      this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    } else {
      document.body.classList.add('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'true');
      this.isRetroTheme = true;
      this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" style="vertical-align: middle;"><g fill="currentColor"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></g></svg>';
      // Don't play startup sound when switching themes - only on app startup
    }
    
    // Update Monaco theme for retro
    if (this.isMonacoLoaded && this.monacoEditor) {
      monaco.editor.setTheme(isRetro ? (this.theme === 'dark' ? 'vs-dark' : 'vs') : 'vs');
    }
  }
  
  async playRetroStartupSound() {
    const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
    
    if (soundEnabled) {
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
        // Silent fail for audio issues
      }
    }
  }
  
  async testRetroStartupSound() {
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
      this.showSoundTestError();
    }
  }
  
  showSoundTestError() {
    const message = 'Could not play startup sound. Please check that the sound files are present in the assets folder.\n\nTried paths:\n• assets/windows95_startup_hifi.mp3\n• assets/windows95_startup_hifi.ogg\n• assets/windows95_startup_hifi.wav';
    
    if (window.__TAURI__?.dialog) {
      window.__TAURI__.dialog.message(message, { title: 'Sound Test Failed', type: 'error' }).catch(() => console.error('[Dialog] Failed to show error'));
    } else {
      console.error('[Dialog] Error:', message);
    }
  }
  
  checkExportLibraries() {
    // Performance monitoring for export libraries
    this.exportLibrariesStatus = {
      katex: this.katexInitialized,
      mermaid: this.mermaidInitialized,
      hljs: typeof hljs !== 'undefined',
      marked: typeof marked !== 'undefined'
    };
  }

  async checkStartupFile() {
    try {
      if (window.safeIPC?.isAvailable) {
        // Use safe IPC wrapper
        const startupFile = await window.safeIPC.invoke('get_startup_file');
        
        if (startupFile && typeof startupFile === 'string' && startupFile.trim()) {
          try {
            const content = await window.safeIPC.invoke('open_file_direct', { filePath: startupFile });
            
            if (content && typeof content === 'string') {
              this.currentFile = startupFile;
              this.isLoadingFile = true;
              this.setEditorContent(content);
              this.isLoadingFile = false;
              this.isDirty = false;
              this.addToFileHistory(startupFile);
              this.showEditor();
              this.updatePreview();
              this.updateFilename();
              this.updateModeButtons();
              this.setMode(this.defaultMode);
              
              // Clear startup file
              try {
                await window.safeIPC.invoke('clear_startup_file');
              } catch (clearError) {
                console.warn('[Startup] Failed to clear startup file:', clearError);
              }
              return true;
            }
          } catch (fileError) {
            console.error('[Startup] Failed to load startup file:', fileError);
            try {
              await window.safeIPC.invoke('clear_startup_file');
            } catch (clearError) {
              console.warn('[Startup] Failed to clear startup file after error:', clearError);
            }
          }
        }
      } else if (window.__TAURI__?.core?.invoke) {
        // Fallback to direct Tauri calls with timeout
        const startupFile = await Promise.race([
          window.__TAURI__.core.invoke('get_startup_file'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        
        if (startupFile && typeof startupFile === 'string' && startupFile.trim()) {
          try {
            const content = await Promise.race([
              window.__TAURI__.core.invoke('open_file_direct', { filePath: startupFile }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (content && typeof content === 'string') {
              this.currentFile = startupFile;
              this.isLoadingFile = true;
              this.setEditorContent(content);
              this.isLoadingFile = false;
              this.isDirty = false;
              this.addToFileHistory(startupFile);
              this.showEditor();
              this.updatePreview();
              this.updateFilename();
              this.updateModeButtons();
              this.setMode(this.defaultMode);
              
              try {
                await window.__TAURI__.core.invoke('clear_startup_file');
              } catch (clearError) {
                console.warn('[Startup] Failed to clear startup file:', clearError);
              }
              return true;
            }
          } catch (fileError) {
            console.error('[Startup] Failed to load startup file:', fileError);
            try {
              await window.__TAURI__.core.invoke('clear_startup_file');
            } catch (clearError) {
              console.warn('[Startup] Failed to clear startup file after error:', clearError);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Startup] Error:', error?.message || 'Unknown startup file error');
    }
    
    this.showWelcomePage();
    return false;
  }

  async openSpecificFile(filePath) {
    try {
      if (!filePath) {
        console.warn('[File] No file path provided');
        return;
      }
      
      if (!window.__TAURI__) {
        console.error('[File] Tauri API not available');
        return;
      }
      
      const content = await window.__TAURI__.fs.readTextFile(filePath);
      
      this.isLoadingFile = true;
      this.setEditorContent(content);
      this.isLoadingFile = false;
      this.showEditor();
      this.updatePreview();
      this.currentFile = filePath;
      this.isDirty = false;
      this.addToFileHistory(filePath);
      this.updateFilename();
      this.updateModeButtons();
      this.setMode(this.defaultMode);
      this.resetZoom();
    } catch (error) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('[File] Error opening file:', filePath, errorMessage);
      this.handleError(new Error(`Failed to open file: ${errorMessage}`), 'File Association');
    }
  }

  async quitApplication() {
    if (this.isDirty) {
      const shouldSave = await window.__TAURI__.dialog.confirm(
        'You have unsaved changes. Do you want to save before quitting?',
        { title: 'Unsaved Changes' }
      );
      
      if (shouldSave) {
        try {
          await this.saveFile();
          // Only quit if save was successful and file was actually saved
          if (!this.isDirty) {
            // File was saved successfully, proceed with quit
          } else {
            // Save was cancelled or failed, don't quit
            return;
          }
        } catch (error) {
          console.error('[App] Error saving before quit:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error.message || error) : encodeURIComponent(error.message || error));
          return; // Don't quit if save failed
        }
      } else {
        const confirmQuit = await window.__TAURI__.dialog.confirm(
          'Quit without saving?',
          { title: 'Confirm Quit' }
        );
        if (!confirmQuit) {
          return; // Don't quit if user cancels
        }
      }
    }
    
    try {
      if (window.__TAURI__?.core?.invoke) {
        await window.__TAURI__.core.invoke('tauri', { __tauriModule: 'Process', message: { cmd: 'exit', exitCode: 0 } });
      } else if (window.__TAURI__?.window) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const appWindow = getCurrentWindow();
        await appWindow.close();
      }
    } catch (error) {
      console.warn('[App] Could not close window via Tauri, using fallback');
      // Fallback: just hide the window or do nothing
    }
  }

  showSettings() {
    this.showEnhancedSettings();
  }

  showEnhancedSettings() {
    this.updateSettingsDisplay();
    this.settingsModal.style.display = 'flex';
  }

  hideEnhancedSettings() {
    this.settingsModal.style.display = 'none';
  }

  showAbout() {
    this.aboutModal.style.display = 'flex';
  }

  hideAbout() {
    this.aboutModal.style.display = 'none';
  }

  showSplashScreen() {
    if (!this.splashScreen) return;
    
    this.splashScreen.style.display = 'flex';
    
    // Hide splash screen after 2.5 seconds
    setTimeout(() => {
      this.hideSplashScreen();
    }, 2500);
  }

  hideSplashScreen() {
    if (!this.splashScreen) return;
    
    this.splashScreen.classList.add('fade-out');
    
    // Remove from DOM after fade animation
    setTimeout(() => {
      this.splashScreen.style.display = 'none';
      this.splashScreen.classList.remove('fade-out');
    }, 500);
  }





  updateSettingsDisplay() {
    // Update theme buttons
    const isRetro = document.body.classList.contains('retro-theme');
    document.getElementById('theme-light-btn').classList.toggle('active', this.theme === 'light' && !isRetro);
    document.getElementById('theme-dark-btn').classList.toggle('active', this.theme === 'dark' && !isRetro);
    document.getElementById('theme-retro-btn').classList.toggle('active', isRetro);
    
    // Show/hide retro sound setting
    const retroSoundSetting = document.querySelector('.retro-sound-setting');
    if (retroSoundSetting) {
      retroSoundSetting.style.display = isRetro ? 'flex' : 'none';
    }
    
    // Update retro sound checkbox
    const soundCheckbox = document.getElementById('retro-sound-checkbox');
    if (soundCheckbox) {
      const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
      soundCheckbox.checked = soundEnabled;
    }
    
    // Update mode buttons
    document.getElementById('mode-code-btn').classList.toggle('active', this.defaultMode === 'code');
    document.getElementById('mode-preview-btn').classList.toggle('active', this.defaultMode === 'preview');
    document.getElementById('mode-split-btn').classList.toggle('active', this.defaultMode === 'split');
    
    // Update suggestions buttons
    document.getElementById('suggestions-on-btn').classList.toggle('active', this.suggestionsEnabled);
    document.getElementById('suggestions-off-btn').classList.toggle('active', !this.suggestionsEnabled);
    
    // Update layout buttons
    document.getElementById('layout-on-btn').classList.toggle('active', this.centeredLayoutEnabled);
    document.getElementById('layout-off-btn').classList.toggle('active', !this.centeredLayoutEnabled);
    
    // Update page size buttons
    document.getElementById('page-a4-btn').classList.toggle('active', this.currentPageSize === 'a4');
    document.getElementById('page-letter-btn').classList.toggle('active', this.currentPageSize === 'letter');
    document.getElementById('page-a3-btn').classList.toggle('active', this.currentPageSize === 'a3');
    
    // Update toolbar buttons
    document.getElementById('toolbar-on-btn').classList.toggle('active', this.isToolbarEnabled);
    document.getElementById('toolbar-off-btn').classList.toggle('active', !this.isToolbarEnabled);
    
    // Update splash screen buttons
    document.getElementById('splash-on-btn').classList.toggle('active', this.isSplashEnabled);
    document.getElementById('splash-off-btn').classList.toggle('active', !this.isSplashEnabled);
    
    // Update splash duration buttons
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`splash-${i}s-btn`).classList.toggle('active', this.splashDuration === i);
    }
    
    // Update toolbar size buttons
    document.getElementById('main-toolbar-small').classList.toggle('active', this.mainToolbarSize === 'small');
    document.getElementById('main-toolbar-medium').classList.toggle('active', this.mainToolbarSize === 'medium');
    document.getElementById('main-toolbar-large').classList.toggle('active', this.mainToolbarSize === 'large');
    
    document.getElementById('md-toolbar-small').classList.toggle('active', this.mdToolbarSize === 'small');
    document.getElementById('md-toolbar-medium').classList.toggle('active', this.mdToolbarSize === 'medium');
    document.getElementById('md-toolbar-large').classList.toggle('active', this.mdToolbarSize === 'large');
    
    document.getElementById('status-bar-small').classList.toggle('active', this.statusBarSize === 'small');
    document.getElementById('status-bar-medium').classList.toggle('active', this.statusBarSize === 'medium');
    document.getElementById('status-bar-large').classList.toggle('active', this.statusBarSize === 'large');
    

    
    // Show/hide duration setting based on splash enabled state
    const durationSetting = document.getElementById('splash-duration-setting');
    if (durationSetting) {
      if (this.isSplashEnabled) {
        durationSetting.classList.add('visible');
        durationSetting.style.display = 'flex';
      } else {
        durationSetting.classList.remove('visible');
        durationSetting.style.display = 'none';
      }
    }
    
    // Update system info
    document.getElementById('info-default-mode').textContent = this.defaultMode;
    document.getElementById('info-current-mode').textContent = this.currentMode;
    document.getElementById('info-monaco').textContent = this.isMonacoLoaded ? 'Loaded' : 'Not Loaded';
    document.getElementById('info-mermaid').textContent = this.mermaidInitialized ? 'Loaded' : 'Not Loaded';
    document.getElementById('info-katex').textContent = this.katexInitialized ? 'Loaded' : 'Not Loaded';
    
    // Update performance stats
    const performanceStats = this.getPerformanceStats();
    document.getElementById('perf-startup').textContent = `${performanceStats.benchmarks.startupTime.toFixed(2)}ms`;
    document.getElementById('perf-file-open').textContent = `${performanceStats.benchmarks.fileOpenTime.toFixed(2)}ms`;
    document.getElementById('perf-mode-switch').textContent = `${performanceStats.benchmarks.modeSwitchTime.toFixed(2)}ms`;
    document.getElementById('perf-preview-update').textContent = `${performanceStats.benchmarks.previewUpdateTime.toFixed(2)}ms`;
    document.getElementById('perf-update-count').textContent = performanceStats.updateCount.toString();
    
    if (performanceStats.memoryUsage) {
      document.getElementById('perf-memory').textContent = `${performanceStats.memoryUsage.used}MB / ${performanceStats.memoryUsage.total}MB`;
    } else {
      document.getElementById('perf-memory').textContent = 'N/A';
    }
  }

  setupSettingsControls() {
    // Theme controls
    document.getElementById('theme-light-btn').addEventListener('click', () => {
      document.body.classList.remove('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'false');
      if (this.theme !== 'light') {
        this.theme = 'light';
        localStorage.setItem('markdownViewer_defaultTheme', this.theme);
        this.applyDefaultTheme();
        if (this.isMonacoLoaded && this.monacoEditor) {
          monaco.editor.setTheme('vs');
        }
        if (this.mermaidInitialized && this.mermaid) {
          this.mermaid.initialize({ theme: 'default', securityLevel: 'loose', fontFamily: 'inherit' });
          this.updatePreview();
        }
      }
      this.themeBtn.textContent = '🌙';
      this.updateSettingsDisplay();
    });
    document.getElementById('theme-dark-btn').addEventListener('click', () => {
      document.body.classList.remove('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'false');
      if (this.theme !== 'dark') {
        this.theme = 'dark';
        localStorage.setItem('markdownViewer_defaultTheme', this.theme);
        this.applyDefaultTheme();
        if (this.isMonacoLoaded && this.monacoEditor) {
          monaco.editor.setTheme('vs-dark');
        }
        if (this.mermaidInitialized && this.mermaid) {
          this.mermaid.initialize({ theme: 'dark', securityLevel: 'loose', fontFamily: 'inherit' });
          this.updatePreview();
        }
      }
      this.themeBtn.textContent = '☀️';
      this.updateSettingsDisplay();
    });
    document.getElementById('theme-retro-btn').addEventListener('click', () => {
      document.body.classList.add('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'true');
      this.isRetroTheme = true;
      this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" style="vertical-align: middle;"><g fill="currentColor"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></g></svg>';
      // Don't play startup sound when switching themes - only on app startup
      this.updateSettingsDisplay();
    });
    
    // Retro sound checkbox
    document.getElementById('retro-sound-checkbox').addEventListener('change', (e) => {
      localStorage.setItem('markdownViewer_retroSound', e.target.checked.toString());
    });
    
    // Test startup sound button
    document.getElementById('test-startup-sound-btn').addEventListener('click', () => {
      this.testRetroStartupSound();
    });
    
    // Mode controls
    document.getElementById('mode-code-btn').addEventListener('click', () => {
      this.defaultMode = 'code';
      localStorage.setItem('markdownViewer_defaultMode', this.defaultMode);
      this.updateSettingsDisplay();
    });
    document.getElementById('mode-preview-btn').addEventListener('click', () => {
      this.defaultMode = 'preview';
      localStorage.setItem('markdownViewer_defaultMode', this.defaultMode);
      this.updateSettingsDisplay();
    });
    document.getElementById('mode-split-btn').addEventListener('click', () => {
      this.defaultMode = 'split';
      localStorage.setItem('markdownViewer_defaultMode', this.defaultMode);
      this.updateSettingsDisplay();
    });
    
    // Suggestions controls
    document.getElementById('suggestions-on-btn').addEventListener('click', () => {
      this.suggestionsEnabled = true;
      localStorage.setItem('markdownViewer_suggestionsEnabled', 'true');
      if (this.isMonacoLoaded && this.monacoEditor) {
        this.monacoEditor.updateOptions({
          suggest: { showKeywords: true, showSnippets: true, showWords: true },
          quickSuggestions: true
        });
      }
      this.updateSettingsDisplay();
    });
    document.getElementById('suggestions-off-btn').addEventListener('click', () => {
      this.suggestionsEnabled = false;
      localStorage.setItem('markdownViewer_suggestionsEnabled', 'false');
      if (this.isMonacoLoaded && this.monacoEditor) {
        this.monacoEditor.updateOptions({
          suggest: { showKeywords: false, showSnippets: false, showWords: false },
          quickSuggestions: false
        });
      }
      this.updateSettingsDisplay();
    });
    
    // Layout controls
    document.getElementById('layout-on-btn').addEventListener('click', () => {
      this.centeredLayoutEnabled = true;
      localStorage.setItem('markdownViewer_centeredLayout', 'true');
      this.applyCenteredLayout();
      this.updateSettingsDisplay();
    });
    document.getElementById('layout-off-btn').addEventListener('click', () => {
      this.centeredLayoutEnabled = false;
      localStorage.setItem('markdownViewer_centeredLayout', 'false');
      this.applyCenteredLayout();
      this.updateSettingsDisplay();
    });
    
    // Page size controls
    document.getElementById('page-a4-btn').addEventListener('click', () => {
      this.setPageSize('a4');
      this.updateSettingsDisplay();
    });
    document.getElementById('page-letter-btn').addEventListener('click', () => {
      this.setPageSize('letter');
      this.updateSettingsDisplay();
    });
    document.getElementById('page-a3-btn').addEventListener('click', () => {
      this.setPageSize('a3');
      this.updateSettingsDisplay();
    });
    
    // Toolbar controls
    document.getElementById('toolbar-on-btn').addEventListener('click', () => {
      this.isToolbarEnabled = true;
      localStorage.setItem('markdownViewer_toolbarEnabled', 'true');
      this.updateToolbarVisibility();
      this.updateSettingsDisplay();
    });
    document.getElementById('toolbar-off-btn').addEventListener('click', () => {
      this.isToolbarEnabled = false;
      localStorage.setItem('markdownViewer_toolbarEnabled', 'false');
      this.updateToolbarVisibility();
      this.updateSettingsDisplay();
    });
    
    // Splash screen controls
    document.getElementById('splash-on-btn').addEventListener('click', () => {
      this.isSplashEnabled = true;
      localStorage.setItem('markdownViewer_splashEnabled', 'true');
      this.updateSettingsDisplay();
    });
    document.getElementById('splash-off-btn').addEventListener('click', () => {
      this.isSplashEnabled = false;
      localStorage.setItem('markdownViewer_splashEnabled', 'false');
      this.updateSettingsDisplay();
    });
    
    // Splash duration controls
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`splash-${i}s-btn`).addEventListener('click', () => {
        this.splashDuration = i;
        localStorage.setItem('markdownViewer_splashDuration', i.toString());
        this.updateSettingsDisplay();
      });
    }
    
    // Main toolbar size controls
    document.getElementById('main-toolbar-small').addEventListener('click', () => {
      this.setMainToolbarSize('small');
    });
    document.getElementById('main-toolbar-medium').addEventListener('click', () => {
      this.setMainToolbarSize('medium');
    });
    document.getElementById('main-toolbar-large').addEventListener('click', () => {
      this.setMainToolbarSize('large');
    });
    
    // Markdown toolbar size controls
    document.getElementById('md-toolbar-small').addEventListener('click', () => {
      this.setMdToolbarSize('small');
    });
    document.getElementById('md-toolbar-medium').addEventListener('click', () => {
      this.setMdToolbarSize('medium');
    });
    document.getElementById('md-toolbar-large').addEventListener('click', () => {
      this.setMdToolbarSize('large');
    });
    
    // Status bar size controls
    document.getElementById('status-bar-small').addEventListener('click', () => {
      this.setStatusBarSize('small');
    });
    document.getElementById('status-bar-medium').addEventListener('click', () => {
      this.setStatusBarSize('medium');
    });
    document.getElementById('status-bar-large').addEventListener('click', () => {
      this.setStatusBarSize('large');
    });
    

  }

  async showLegacySettings() {
    const performanceStats = this.getPerformanceStats();
    
    // Show current settings and stats
    const currentSettings = [
      `CURRENT SETTINGS:`,
      `• Theme: ${this.theme}`,
      `• Default Mode: ${this.defaultMode}`,
      `• Text Suggestions: ${this.suggestionsEnabled ? 'Enabled' : 'Disabled'}`,
      `• Centered Layout: ${this.centeredLayoutEnabled ? 'Enabled' : 'Disabled'}`,
      `• Page Size: ${this.currentPageSize.toUpperCase()}`,
      `• Margins: T:${this.pageMargins.top} B:${this.pageMargins.bottom} L:${this.pageMargins.left} R:${this.pageMargins.right}`,
      ``,
      `SYSTEM INFO:`,
      `• Current Mode: ${this.currentMode}`,
      `• Mermaid: ${this.mermaidInitialized ? 'Loaded' : 'Not Loaded'}`,
      `• KaTeX: ${this.katexInitialized ? 'Loaded' : 'Not Loaded'}`,
      `• Monaco Editor: ${this.isMonacoLoaded ? 'Loaded' : 'Not Loaded'}`,
      ``,
      `PERFORMANCE BENCHMARKS:`,
      `• Startup Time: ${performanceStats.benchmarks.startupTime.toFixed(2)}ms`,
      `• File Open Time: ${performanceStats.benchmarks.fileOpenTime.toFixed(2)}ms`,
      `• Mode Switch Time: ${performanceStats.benchmarks.modeSwitchTime.toFixed(2)}ms`,
      `• Preview Update Time: ${performanceStats.benchmarks.previewUpdateTime.toFixed(2)}ms`,
      ``,
      `PERFORMANCE STATS:`,
      `• Updates: ${performanceStats.updateCount}`,
      `• Average Update: ${performanceStats.averageUpdateTime.toFixed(2)}ms`
    ];
    
    if (performanceStats.memoryUsage) {
      currentSettings.push(
        `• Memory Used: ${performanceStats.memoryUsage.used}MB / ${performanceStats.memoryUsage.total}MB`
      );
    }
    
    const settingsText = currentSettings.join('\n');
    
    // Show settings and ask what to change
    try {
      const choice = await window.__TAURI__.dialog.ask(
        `${settingsText}\n\nWhat would you like to change?\n\n1 - Theme\n2 - Default Mode\n3 - Text Suggestions\n4 - Centered Layout\n5 - Page Size\n6 - Page Margins\n7 - Clear Error Logs\n8 - Performance Report\n\nEnter 1-8:`,
        { title: 'Settings' }
      );
      
      if (choice) {
        const input = await this.getSettingsInput();
        switch (input) {
          case '1':
            await this.changeDefaultTheme();
            break;
          case '2':
            await this.changeDefaultMode();
            break;
          case '3':
            await this.changeTextSuggestions();
            break;
          case '4':
            await this.changeCenteredLayout();
            break;
          case '5':
            await this.changePageSize();
            break;
          case '6':
            await this.changePageMargins();
            break;
          case '7':
            this.clearErrorLogs();
            await window.__TAURI__.dialog.message('Error logs cleared successfully.', { title: 'Success' });
            break;
          case '8':
            await this.showPerformanceReport();
            break;
          default:
            if (input) {
              await window.__TAURI__.dialog.message('Invalid choice. Please enter 1-8.', { title: 'Error' });
            }
            break;
        }
      }
    } catch (error) {
      console.error('[Settings] Dialog error:', encodeURIComponent(error.message || error));
    }
  }

  async showPerformanceReport() {
    const stats = this.getPerformanceStats();
    const targets = {
      startupTime: 2000,
      fileOpenTime: 500,
      modeSwitchTime: 100,
      previewUpdateTime: 300
    };
    
    const report = [
      'PERFORMANCE REPORT:',
      '',
      'Benchmark Results:'
    ];
    
    Object.entries(stats.benchmarks).forEach(([key, value]) => {
      const target = targets[key];
      const status = target && value > target ? '❌ SLOW' : '✅ GOOD';
      const targetText = target ? ` (target: <${target}ms)` : '';
      report.push(`• ${key}: ${value.toFixed(2)}ms ${status}${targetText}`);
    });
    
    if (stats.memoryUsage) {
      report.push('');
      report.push('Memory Usage:');
      report.push(`• Used: ${stats.memoryUsage.used}MB`);
      report.push(`• Total: ${stats.memoryUsage.total}MB`);
      report.push(`• Limit: ${stats.memoryUsage.limit}MB`);
    }
    
    try {
      await window.__TAURI__.dialog.message(report.join('\n'), { title: 'Performance Report' });
    } catch (error) {
      console.error('[Performance] Report error:', encodeURIComponent(error.message || error));
    }
  }
  
  async changeDefaultTheme() {
    try {
      const confirmed = await window.__TAURI__.dialog.confirm(
        `Current theme: ${this.theme}\n\nSwitch to ${this.theme === 'light' ? 'dark' : 'light'} theme?`,
        { title: 'Change Theme' }
      );
      
      if (confirmed) {
        this.toggleTheme();
        await window.__TAURI__.dialog.message(`Theme changed to: ${this.theme}`, { title: 'Success' });
      }
    } catch (error) {
      console.error('[Settings] Theme change error:', encodeURIComponent(error.message || error));
    }
  }
  
  async changeDefaultMode() {
    const modes = ['code', 'preview', 'split'];
    const currentIndex = modes.indexOf(this.defaultMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    try {
      const confirmed = await window.__TAURI__.dialog.confirm(
        `Current default mode: ${this.defaultMode}\n\nChange to: ${nextMode}?`,
        { title: 'Change Default Mode' }
      );
      
      if (confirmed) {
        this.defaultMode = nextMode;
        localStorage.setItem('markdownViewer_defaultMode', this.defaultMode);
        await window.__TAURI__.dialog.message(`Default mode changed to: ${this.defaultMode}`, { title: 'Success' });
      }
    } catch (error) {
      console.error('[Settings] Mode change error:', encodeURIComponent(error.message || error));
    }
  }
  
  async changeTextSuggestions() {
    try {
      const confirmed = await window.__TAURI__.dialog.confirm(
        `Current text suggestions: ${this.suggestionsEnabled ? 'Enabled' : 'Disabled'}\n\n${this.suggestionsEnabled ? 'Disable' : 'Enable'} text suggestions?`,
        { title: 'Change Text Suggestions' }
      );
      
      if (confirmed) {
        this.suggestionsEnabled = !this.suggestionsEnabled;
        localStorage.setItem('markdownViewer_suggestionsEnabled', this.suggestionsEnabled.toString());
        
        // Apply setting immediately if Monaco is loaded
        if (this.isMonacoLoaded && this.monacoEditor) {
          this.monacoEditor.updateOptions({
            suggest: {
              showKeywords: this.suggestionsEnabled,
              showSnippets: this.suggestionsEnabled,
              showWords: this.suggestionsEnabled
            },
            quickSuggestions: this.suggestionsEnabled
          });
        }
        
        await window.__TAURI__.dialog.message(`Text suggestions ${this.suggestionsEnabled ? 'enabled' : 'disabled'}`, { title: 'Success' });
      }
    } catch (error) {
      console.error('[Settings] Suggestions change error:', encodeURIComponent(error.message || error));
    }
  }

  async changeCenteredLayout() {
    try {
      const confirmed = await window.__TAURI__.dialog.confirm(
        `Current centered layout: ${this.centeredLayoutEnabled ? 'Enabled' : 'Disabled'}\n\n${this.centeredLayoutEnabled ? 'Disable' : 'Enable'} centered layout?`,
        { title: 'Change Centered Layout' }
      );
      
      if (confirmed) {
        this.centeredLayoutEnabled = !this.centeredLayoutEnabled;
        localStorage.setItem('markdownViewer_centeredLayout', this.centeredLayoutEnabled.toString());
        this.applyCenteredLayout();
        
        await window.__TAURI__.dialog.message(`Centered layout ${this.centeredLayoutEnabled ? 'enabled' : 'disabled'}`, { title: 'Success' });
      }
    } catch (error) {
      console.error('[Settings] Layout change error:', encodeURIComponent(error.message || error));
    }
  }

  async changePageSize() {
    const sizes = ['a4', 'letter', 'legal'];
    const currentIndex = sizes.indexOf(this.currentPageSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextSize = sizes[nextIndex];
    
    try {
      const confirmed = await window.__TAURI__.dialog.confirm(
        `Current page size: ${this.currentPageSize.toUpperCase()}\n\nChange to: ${nextSize.toUpperCase()}?`,
        { title: 'Change Page Size' }
      );
      
      if (confirmed) {
        this.setPageSize(nextSize);
        await window.__TAURI__.dialog.message(`Page size changed to: ${nextSize.toUpperCase()}`, { title: 'Success' });
      }
    } catch (error) {
      console.error('[Settings] Page size change error:', encodeURIComponent(error.message || error));
    }
  }

  async changePageMargins() {
    const currentMargins = `Top: ${this.pageMargins.top}, Bottom: ${this.pageMargins.bottom}, Left: ${this.pageMargins.left}, Right: ${this.pageMargins.right}`;
    
    try {
      await window.__TAURI__.dialog.message(
        `Current margins: ${currentMargins}\n\nUse the enhanced settings dialog to change margins.`,
        { title: 'Page Margins' }
      );
    } catch (error) {
      console.error('[Settings] Margins dialog error:', encodeURIComponent(error.message || error));
    }
  }

  async changeSpecificMargin(side) {
    const currentValue = this.pageMargins[side];
    
    try {
      await window.__TAURI__.dialog.message(
        `Current ${side} margin: ${currentValue}\n\nUse the enhanced settings dialog to change margins.`,
        { title: 'Change Margin' }
      );
    } catch (error) {
      console.error('[Settings] Margin dialog error:', encodeURIComponent(error.message || error));
    }
  }

  async changeAllMargins() {
    try {
      await window.__TAURI__.dialog.message(
        'Use the enhanced settings dialog to change all margins.',
        { title: 'Change All Margins' }
      );
    } catch (error) {
      console.error('[Settings] All margins dialog error:', encodeURIComponent(error.message || error));
    }
  }

  async getSettingsInput() {
    // Simple input method - cycle through options
    return '1'; // Default to theme change for simplicity
  }

  showHelp() {
    this.helpModal.style.display = 'flex';
  }

  hideHelp() {
    this.helpModal.style.display = 'none';
  }

  refreshPreview() {
    this.updatePreview();
  }

  async toggleFullscreen() {
    try {
      if (window.__TAURI__?.window) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const appWindow = getCurrentWindow();
        const isFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!isFullscreen);
      } else {
        // Fallback to browser fullscreen
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('[UI] Error toggling fullscreen:', encodeURIComponent(error.message || error));
    }
  }

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
    
    // Ensure current mode class is on body for CSS selectors
    document.body.classList.add(`${this.currentMode}-mode`);
    
    // Update toolbar visibility
    this.updateToolbarVisibility();
    
    // Setup hover detection for exit hint
    this.setupDistractionFreeHover();
  }

  exitDistractionFree() {
    this.isDistractionFree = false;
    document.body.classList.remove('distraction-free');
    
    // Update toolbar visibility
    this.updateToolbarVisibility();
    
    // Remove hover detection
    this.removeDistractionFreeHover();
  }

  setupDistractionFreeHover() {
    // Remove any existing hover handler
    this.removeDistractionFreeHover();
    
    this.distractionFreeMouseHandler = (e) => {
      if (this.isDistractionFree) {
        // Show hint only when mouse is in top 60px of screen
        if (e.clientY <= 60) {
          document.body.classList.add('show-exit-hint');
        } else {
          document.body.classList.remove('show-exit-hint');
        }
      }
    };
    
    document.addEventListener('mousemove', this.distractionFreeMouseHandler);
  }

  removeDistractionFreeHover() {
    if (this.distractionFreeMouseHandler) {
      document.removeEventListener('mousemove', this.distractionFreeMouseHandler);
      this.distractionFreeMouseHandler = null;
    }
    document.body.classList.remove('show-exit-hint');
  }

  debouncedUpdatePreview() {
    // Clear existing timeout
    clearTimeout(this.previewUpdateTimeout);
    
    // Use performance optimizer cache if available
    if (this.performanceOptimizer) {
      const content = this.getEditorContent();
      const cached = this.performanceOptimizer.getCachedPreview(content);
      
      if (cached && (Date.now() - cached.timestamp) < 30000) { // 30 second cache
        this.preview.innerHTML = cached.html;
        this.setupTaskListInteractions();
        this.setupAnchorLinks();
        return;
      }
    }
    
    // Set new timeout for debounced update with optimized delay
    this.previewUpdateTimeout = setTimeout(() => {
      this.updatePreviewWithMetrics();
    }, 200); // Reduced debounce to 200ms for better responsiveness
  }

  updatePreviewWithMetrics() {
    const startTime = performance.now();
    
    this.updatePreview().then(() => {
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Cache the result if performance optimizer is available
      if (this.performanceOptimizer && this.preview) {
        const content = this.getEditorContent();
        this.performanceOptimizer.setCachedPreview(content, this.preview.innerHTML);
      }
      
      // Update performance metrics
      this.performanceMetrics.updateCount++;
      this.performanceMetrics.lastUpdateTime = updateTime;
      this.performanceMetrics.averageUpdateTime = 
        (this.performanceMetrics.averageUpdateTime * (this.performanceMetrics.updateCount - 1) + updateTime) / 
        this.performanceMetrics.updateCount;
      
      // Log performance if update takes too long
      if (updateTime > 500) { // Reduced threshold from 1000ms to 500ms
        console.warn(`[Performance] Slow preview update: ${updateTime.toFixed(2)}ms`);
      }
    }).catch(error => {
      console.error('[Performance] Preview update error:', error);
      this.showMarkdownErrorModal(error, this.getEditorContent());
      if (this.preview) {
        this.preview.innerHTML = '<p>⚠️ Preview update failed - see error dialog</p>';
      }
    });
  }

  getPerformanceStats() {
    // Use performance optimizer if available
    if (this.performanceOptimizer) {
      const report = this.performanceOptimizer.getPerformanceReport();
      return {
        ...this.performanceMetrics,
        ...report,
        benchmarks: this.getBenchmarkResults()
      };
    }
    
    // Fallback to original implementation
    return {
      ...this.performanceMetrics,
      memoryUsage: this.getMemoryUsage(),
      benchmarks: this.getBenchmarkResults()
    };
  }

  getBenchmarkResults() {
    return {
      startupTime: this.startupTime || 0,
      fileOpenTime: this.lastFileOpenTime || 0,
      modeSwitchTime: this.lastModeSwitchTime || 0,
      previewUpdateTime: this.performanceMetrics.lastUpdateTime || 0
    };
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    
    // Fallback for non-Chromium browsers
    if (navigator.deviceMemory) {
      return {
        used: 'Unknown',
        total: `${navigator.deviceMemory}GB`,
        limit: 'Unknown'
      };
    }
    
    return {
      used: 'Unknown',
      total: 'Unknown', 
      limit: 'Unknown'
    };
  }

  benchmarkOperation(operation, startTime) {
    const duration = performance.now() - startTime;
    
    // Use performance optimizer if available
    if (this.performanceOptimizer) {
      return this.performanceOptimizer.benchmarkTabOperation(operation, startTime);
    }
    
    // Fallback to original implementation
    // Store benchmark results
    switch (operation) {
      case 'File Open':
        this.lastFileOpenTime = duration;
        break;
      case 'Mode Switch':
        this.lastModeSwitchTime = duration;
        break;
    }
    
    // Warn if performance targets are not met
    const targets = {
      'File Open': 500,
      'Mode Switch': 100,
      'Preview Update': 300
    };
    
    if (targets[operation] && duration > targets[operation]) {
      console.warn(`[Performance] ${operation} exceeded target: ${duration.toFixed(2)}ms > ${targets[operation]}ms`);
    }
    
    return duration;
  }

  optimizeMemory() {
    // Use performance optimizer if available
    if (this.performanceOptimizer) {
      this.performanceOptimizer.performMemoryCleanup();
      return;
    }
    
    // Fallback to original implementation
    // Clear any cached data that's no longer needed
    if (this.taskListStates.size > 100) {
      this.taskListStates.clear();
    }
    
    // Clear path cache if too large
    if (this.pathCache && this.pathCache.size > 50) {
      this.pathCache.clear();
    }
    
    // Clear filename cache if too large
    if (this.filenameCache && this.filenameCache.size > 50) {
      this.filenameCache.clear();
    }
    
    // Clear old error logs
    const errors = this.getErrorLogs();
    if (errors.length > 10) {
      this.clearErrorLogs();
    }
    
    // Clear performance metrics if too many
    if (this.performanceMetrics.updateCount > 1000) {
      this.performanceMetrics.updateCount = 0;
      this.performanceMetrics.averageUpdateTime = 0;
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Auto-optimize memory periodically
  startMemoryOptimization() {
    // Store interval ID for proper cleanup
    this.memoryOptimizationInterval = setInterval(() => {
      this.optimizeMemory();
    }, 300000); // Every 5 minutes
  }
  
  stopMemoryOptimization() {
    if (this.memoryOptimizationInterval) {
      clearInterval(this.memoryOptimizationInterval);
      this.memoryOptimizationInterval = null;
    }
  }
  
  cleanupEventListeners() {
    // Cleanup Tauri event listeners
    if (this.tauriDropUnlisten) {
      this.tauriDropUnlisten();
      this.tauriDropUnlisten = null;
    }
    
    if (this.closeHandlerUnlisten) {
      this.closeHandlerUnlisten();
      this.closeHandlerUnlisten = null;
    }
    
    // Cleanup scroll sync event handlers using cached elements
    this.cleanupScrollSyncHandlers();
    
    // Clear cached elements
    this.cachedScrollElements = null;
    this.cachedToolbarElements = null;
    this.cachedPreviewPane = null;
    this.mathRegexCache = null;
    
    // Cleanup other event handlers
    if (this.taskChangeHandler) {
      this.preview.removeEventListener('change', this.taskChangeHandler);
      this.taskChangeHandler = null;
    }
    
    if (this.anchorClickHandler) {
      this.preview.removeEventListener('click', this.anchorClickHandler);
      this.anchorClickHandler = null;
    }
    
    // Cleanup Monaco event listeners
    if (this.monacoEditor && this.monacoEditor.dispose) {
      this.monacoEditor.dispose();
    }
    
    // Cleanup timeout handlers
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    
    if (this.previewUpdateTimeout) {
      clearTimeout(this.previewUpdateTimeout);
      this.previewUpdateTimeout = null;
    }
    
    this.removeDistractionFreeHover();
    this.stopMemoryOptimization();
    
    // Cleanup performance optimizer
    if (this.performanceOptimizer && this.performanceOptimizer.stopMemoryMonitoring) {
      this.performanceOptimizer.stopMemoryMonitoring();
    }
  }
  
  improveDevServerPathResolution(originalSrc) {
    // Cache filename extraction results
    if (!this.pathCache) {
      this.pathCache = new Map();
    }
    
    if (this.pathCache.has(originalSrc)) {
      return this.pathCache.get(originalSrc);
    }
    
    let result = originalSrc;
    
    // Handle Tauri dev server URLs more robustly
    if (originalSrc.startsWith('http://127.0.0.1:') || originalSrc.startsWith('http://localhost:')) {
      try {
        const url = new URL(originalSrc);
        let pathname = url.pathname;
        
        // Remove leading slash and handle nested paths
        if (pathname.startsWith('/')) {
          pathname = pathname.substring(1);
        }
        
        // If it's just a filename, assume it's in project root
        if (!pathname.includes('/') && !pathname.includes('\\')) {
          result = pathname; // Just the filename for project root
        } else {
          result = pathname;
        }
      } catch (error) {
        result = originalSrc;
      }
    }
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (this.pathCache.size > 100) {
      const firstKey = this.pathCache.keys().next().value;
      this.pathCache.delete(firstKey);
    }
    this.pathCache.set(originalSrc, result);
    
    return result;
  }
  
  getFilenameFromPath(filePath) {
    // Cache filename extraction results for better performance
    if (!this.filenameCache) {
      this.filenameCache = new Map();
    }
    
    if (this.filenameCache.has(filePath)) {
      return this.filenameCache.get(filePath);
    }
    
    const filename = filePath.split(/[\\\/]/).pop();
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (this.filenameCache.size > 50) {
      const firstKey = this.filenameCache.keys().next().value;
      this.filenameCache.delete(firstKey);
    }
    this.filenameCache.set(filePath, filename);
    
    return filename;
  }
  
  isAbsolutePath(path) {
    // Check for Windows absolute paths (C:\, D:\, etc.) or Unix absolute paths (/)
    return /^[A-Za-z]:\\/.test(path) || path.startsWith('/');
  }
  
  joinPaths(dir, file) {
    // Simple path joining that works for both Windows and Unix
    const separator = dir.includes('\\') ? '\\' : '/';
    return dir + separator + file;
  }

  async setupTauriDragDrop() {
    try {
      if (window.safeIPC?.isAvailable) {
        // Use safe IPC wrapper for event listening
        const unlisten = await window.safeIPC.listen('tauri://drag-drop', async (event) => {
          try {
            // Safely extract paths from payload
            const filePaths = event?.payload?.paths || [];
            if (!Array.isArray(filePaths) || filePaths.length === 0) {
              console.warn('[TauriDrop] No valid file paths in drop event');
              return;
            }
            
            // Welcome screen: open .md files
            if (this.welcomePage && this.welcomePage.style.display !== 'none') {
              const mdFile = filePaths.find(f => f && /\.(md|markdown|txt)$/i.test(f));
              if (mdFile) {
                await this.openSpecificFile(mdFile);
              }
              return;
            }
            
            // Code mode: insert absolute file paths
            if (this.currentMode === 'code') {
              if (this.isMonacoLoaded && this.monacoEditor) {
                const insertText = filePaths.join('\n');
                const position = this.monacoEditor.getPosition();
                
                this.monacoEditor.executeEdits('drop', [{
                  range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                  text: insertText
                }]);
                
                this.markDirty();
              } else {
                // Fallback to textarea
                const insertText = filePaths.join('\n');
                const cursorPos = this.editor.selectionStart;
                const textBefore = this.editor.value.substring(0, cursorPos);
                const textAfter = this.editor.value.substring(cursorPos);
                this.editor.value = textBefore + insertText + textAfter;
                this.editor.selectionStart = this.editor.selectionEnd = cursorPos + insertText.length;
                this.markDirty();
              }
            }
          } catch (dropError) {
            console.error('[TauriDrop] Error processing drop event:', dropError);
          }
        });
        
        this.tauriDropUnlisten = unlisten;
      } else if (window.__TAURI__?.event) {
        // Fallback to direct Tauri event system
        const unlisten = await window.__TAURI__.event.listen('tauri://drag-drop', async (event) => {
          try {
            const filePaths = event?.payload?.paths || [];
            if (!Array.isArray(filePaths) || filePaths.length === 0) {
              console.warn('[TauriDrop] No valid file paths in drop event');
              return;
            }
            
            if (this.welcomePage && this.welcomePage.style.display !== 'none') {
              const mdFile = filePaths.find(f => f && /\.(md|markdown|txt)$/i.test(f));
              if (mdFile) {
                await this.openSpecificFile(mdFile);
              }
              return;
            }
            
            if (this.currentMode === 'code') {
              if (this.isMonacoLoaded && this.monacoEditor) {
                const insertText = filePaths.join('\n');
                const position = this.monacoEditor.getPosition();
                
                this.monacoEditor.executeEdits('drop', [{
                  range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                  text: insertText
                }]);
                
                this.markDirty();
              } else {
                const insertText = filePaths.join('\n');
                const cursorPos = this.editor.selectionStart;
                const textBefore = this.editor.value.substring(0, cursorPos);
                const textAfter = this.editor.value.substring(cursorPos);
                this.editor.value = textBefore + insertText + textAfter;
                this.editor.selectionStart = this.editor.selectionEnd = cursorPos + insertText.length;
                this.markDirty();
              }
            }
          } catch (dropError) {
            console.error('[TauriDrop] Error processing drop event:', dropError);
          }
        });
        
        this.tauriDropUnlisten = unlisten;
      }
    } catch (error) {
      console.error('[TauriDrop] Error setting up drag-drop listener:', error);
    }
  }

  handleError(error, context = 'Unknown', showUser = true) {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      context: context,
      timestamp: new Date().toISOString()
    };
    
    console.error(`[Error] ${context}:`, window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(errorInfo) : errorInfo);
    
    if (showUser) {
      const userMessage = this.getUserFriendlyErrorMessage(error, context);
      this.showErrorDialog(userMessage);
    }
    
    this.logError(errorInfo);
    this.attemptErrorRecovery(error, context);
  }

  async showErrorDialog(message) {
    // Sanitize message to prevent XSS
    const sanitizedMessage = window.SecurityUtils ? window.SecurityUtils.sanitizeUserInput(message) : message;
    
    if (window.__TAURI__) {
      try {
        await window.__TAURI__.dialog.message(sanitizedMessage, { title: 'Error', type: 'error' });
      } catch {
        // Fallback to console if dialog fails
        console.error('[Dialog] Error:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(sanitizedMessage) : encodeURIComponent(sanitizedMessage));
      }
    } else {
      console.error('[Dialog] Error:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(sanitizedMessage) : encodeURIComponent(sanitizedMessage));
    }
  }





  getRecoveryOptions(error, context) {
    const options = [];
    
    if (context === 'File Opening' || context === 'File Saving') {
      options.push('• Try selecting a different file location');
      options.push('• Check file permissions');
      options.push('• Ensure the file is not open in another application');
    }
    
    if (context === 'Preview Update' || context === 'Advanced Features') {
      options.push('• Try refreshing the preview (F5)');
      options.push('• Check your internet connection for external libraries');
      options.push('• Try switching to a different view mode');
    }
    
    options.push('• Restart the application if problems persist');
    options.push('• Check the console (F12) for technical details');
    
    return 'Recovery Options:\n' + options.join('\n');
  }

  attemptErrorRecovery(error, context) {
    // Automatic recovery strategies
    switch (context) {
      case 'Preview Update':
        // Clear preview and try basic markdown rendering
        setTimeout(() => {
          try {
            this.preview.innerHTML = '<p>Preview temporarily unavailable. Try refreshing (F5).</p>';
          } catch (e) {
            console.error('[Recovery] Preview recovery failed:', encodeURIComponent(e.message || e));
          }
        }, 1000);
        break;
        
      case 'Advanced Features':
        // Disable advanced features temporarily
        this.mermaidInitialized = false;
        this.katexInitialized = false;
        break;
        
      case 'Monaco Editor':
        // Fall back to textarea editor
        if (this.editor) {
          this.editor.style.display = 'block';
          this.monacoContainer.style.display = 'none';
          this.isMonacoLoaded = false;
        }
        break;
    }
  }

  getUserFriendlyErrorMessage(error, context) {
    const errorMessage = error?.message || 'Unknown error';
    
    // Provide specific guidance based on error type
    if (errorMessage.includes('Tauri API not available')) {
      return 'Application environment error. Please restart the application.';
    }
    
    if (errorMessage.includes('Permission denied')) {
      return 'Permission denied. Please check file permissions and try again.';
    }
    
    if (errorMessage.includes('Network')) {
      return 'Network error. Please check your internet connection.';
    }
    
    if (errorMessage.includes('library not loaded')) {
      return 'Required libraries failed to load. Please refresh the page.';
    }
    
    // Generic error message
    return `An error occurred in ${context}. Please try again or restart the application.`;
  }

  logError(errorInfo) {
    // Store error locally for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('markdownViewer_errors') || '[]');
      errors.push(errorInfo);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('markdownViewer_errors', JSON.stringify(errors));
    } catch (e) {
      console.warn('[Error] Could not store error log:', e);
    }
  }

  getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('markdownViewer_errors') || '[]');
    } catch (e) {
      console.warn('[Error] Could not retrieve error logs:', e);
      return [];
    }
  }

  clearErrorLogs() {
    try {
      localStorage.removeItem('markdownViewer_errors');
      // Error logs cleared
    } catch (e) {
      console.warn('[Error] Could not clear error logs:', encodeURIComponent(e.message || e));
    }
  }
  
  applyDefaultTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    // Default theme applied
  }

  applyCenteredLayout() {
    // Apply centered layout class
    if (this.centeredLayoutEnabled) {
      document.body.classList.add('centered-layout');
    } else {
      document.body.classList.remove('centered-layout');
    }
    
    // Apply page size and margins
    this.updatePageLayout();
    
    // Re-setup scroll sync when layout changes
    if (this.isInitialized) {
      this.setupScrollSync();
    }
    
    // Centered layout applied
  }

  updatePageLayout() {
    const root = document.documentElement;
    
    // Set page width based on current page size
    const pageWidths = {
      'a4': 'var(--page-width-a4)',
      'letter': 'var(--page-width-letter)',
      'a3': 'var(--page-width-a3)'
    };
    
    root.style.setProperty('--current-page-width', pageWidths[this.currentPageSize] || pageWidths['a4']);
    
    // Set margins
    root.style.setProperty('--page-margin-top', this.pageMargins.top);
    root.style.setProperty('--page-margin-bottom', this.pageMargins.bottom);
    root.style.setProperty('--page-margin-left', this.pageMargins.left);
    root.style.setProperty('--page-margin-right', this.pageMargins.right);
    
    // Page layout updated
  }

  toggleCenteredLayout() {
    this.centeredLayoutEnabled = !this.centeredLayoutEnabled;
    localStorage.setItem('markdownViewer_centeredLayout', this.centeredLayoutEnabled.toString());
    this.applyCenteredLayout();
    
    // Centered layout toggled
  }

  setPageSize(size) {
    if (['a4', 'letter', 'a3'].includes(size)) {
      this.currentPageSize = size;
      localStorage.setItem('markdownViewer_pageSize', size);
      this.updatePageLayout();
      // Page size changed
    }
  }

  setPageMargins(margins) {
    this.pageMargins = { ...this.pageMargins, ...margins };
    
    // Save to localStorage
    Object.keys(margins).forEach(key => {
      localStorage.setItem(`markdownViewer_margin${key.charAt(0).toUpperCase() + key.slice(1)}`, margins[key]);
    });
    
    this.updatePageLayout();
    // Margins updated
  }

  addToFileHistory(filePath) {
    if (!filePath) return;
    
    // Remove if already exists
    this.fileHistory = this.fileHistory.filter(item => item.path !== filePath);
    
    // Add to beginning with cached filename
    this.fileHistory.unshift({
      path: filePath,
      name: this.getFilenameFromPath(filePath),
      date: new Date().toISOString()
    });
    
    // Keep only last 3
    this.fileHistory = this.fileHistory.slice(0, 3);
    
    // Save to localStorage
    localStorage.setItem('markdownViewer_fileHistory', JSON.stringify(this.fileHistory));
    
    // Update display
    this.updateFileHistoryDisplay();
    
    // File added to history
  }

  updateFileHistoryDisplay() {
    if (!this.fileHistorySection || !this.fileHistoryList) return;
    
    if (this.fileHistory.length === 0) {
      this.fileHistorySection.style.display = 'none';
      return;
    }
    
    this.fileHistorySection.style.display = 'block';
    this.fileHistoryList.innerHTML = '';
    
    this.fileHistory.forEach(file => {
      const item = document.createElement('div');
      item.className = 'file-history-item';
      item.innerHTML = `
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-path">${file.path}</div>
        </div>
        <div class="file-date">${this.formatDate(file.date)}</div>
      `;
      
      item.addEventListener('click', () => {
        this.openSpecificFile(file.path);
      });
      
      this.fileHistoryList.appendChild(item);
    });
    
    // File history display updated
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  clearFileHistory() {
    this.fileHistory = [];
    localStorage.removeItem('markdownViewer_fileHistory');
    this.updateFileHistoryDisplay();
    // File history cleared
  }
  
  changeFontSize(delta) {
    const newSize = Math.max(10, Math.min(24, this.fontSize + delta));
    if (newSize !== this.fontSize) {
      this.fontSize = newSize;
      localStorage.setItem('markdownViewer_fontSize', this.fontSize.toString());
      this.applyFontSize();
      this.updateSettingsDisplay();
    }
  }
  
  resetFontSize() {
    this.fontSize = 14;
    localStorage.setItem('markdownViewer_fontSize', this.fontSize.toString());
    this.applyFontSize();
    this.updateSettingsDisplay();
  }
  
  applyFontSize() {
    // Apply to Monaco Editor
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.updateOptions({
        fontSize: this.fontSize
      });
    }
    
    // Apply to fallback editor
    if (this.editor) {
      this.editor.style.fontSize = `${this.fontSize}px`;
    }
    
    // Apply to preview content
    if (this.preview) {
      this.preview.style.fontSize = `${this.fontSize}px`;
    }
    
    // Update display
    if (this.fontSizeDisplay) {
      this.fontSizeDisplay.textContent = `${this.fontSize}px`;
    }
  }
  
  changeZoom(delta) {
    const newZoom = Math.max(0.5, Math.min(3.0, this.previewZoom + delta));
    if (newZoom !== this.previewZoom) {
      this.previewZoom = newZoom;
      this.applyZoom();
    }
  }
  
  resetZoom() {
    this.previewZoom = 1.0;
    this.applyZoom();
  }
  
  applyZoom() {
    if (this.preview) {
      this.preview.style.setProperty('--zoom-scale', this.previewZoom);
    }
    
    if (this.zoomDisplay) {
      this.zoomDisplay.textContent = `${Math.round(this.previewZoom * 100)}%`;
    }
    
    // Cache preview pane element
    if (!this.cachedPreviewPane) {
      this.cachedPreviewPane = document.querySelector('.preview-pane');
    }
    
    if (this.cachedPreviewPane) {
      this.cachedPreviewPane.setAttribute('data-zoom-above-100', this.previewZoom > 1.0 ? 'true' : 'false');
    }
  }
  
  updateZoomControlsVisibility() {
    if (this.zoomControls) {
      const hasDocument = this.currentFile || (this.welcomePage && this.welcomePage.style.display === 'none');
      const shouldShow = this.currentMode === 'preview' && !this.isDistractionFree && hasDocument;
      this.zoomControls.style.display = shouldShow ? 'flex' : 'none';
    }
    
    // Show font size controls only in code mode
    const fontSizeControls = document.getElementById('font-size-controls');
    if (fontSizeControls) {
      const hasDocument = this.currentFile || (this.welcomePage && this.welcomePage.style.display === 'none');
      const shouldShow = this.currentMode === 'code' && !this.isDistractionFree && hasDocument;
      fontSizeControls.style.display = shouldShow ? 'flex' : 'none';
    }
  }
  
  executeUndo() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.trigger('toolbar', 'undo', null);
    } else if (this.editor && document.execCommand) {
      document.execCommand('undo');
    }
  }
  
  executeRedo() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.trigger('toolbar', 'redo', null);
    } else if (this.editor && document.execCommand) {
      document.execCommand('redo');
    }
  }
  
  setMainToolbarSize(size) {
    this.mainToolbarSize = size;
    localStorage.setItem('markdownViewer_mainToolbarSize', size);
    this.applyToolbarSizes();
    this.updateSettingsDisplay();
  }
  
  setMdToolbarSize(size) {
    this.mdToolbarSize = size;
    localStorage.setItem('markdownViewer_mdToolbarSize', size);
    this.applyToolbarSizes();
    this.updateSettingsDisplay();
  }
  
  applyToolbarSizes() {
    document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
    document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
  }
  
  setStatusBarSize(size) {
    this.statusBarSize = size;
    localStorage.setItem('markdownViewer_statusBarSize', size);
    this.applyStatusBarSize();
    this.updateSettingsDisplay();
  }
  
  applyStatusBarSize() {
    document.body.setAttribute('data-status-bar-size', this.statusBarSize);
  }

  setupMonacoMarkdownShortcuts() {
    if (!this.monacoEditor) return;
    
    // Bold - Ctrl+B
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      this.executeMarkdownAction('bold');
    });
    
    // Italic - Ctrl+I
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      this.executeMarkdownAction('italic');
    });
    
    // Headers - Ctrl+Shift+1/2/3
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Digit1, () => {
      this.executeMarkdownAction('h1');
    });
    
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Digit2, () => {
      this.executeMarkdownAction('h2');
    });
    
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Digit3, () => {
      this.executeMarkdownAction('h3');
    });
  }

  // Markdown Toolbar Methods
  initializeMarkdownToolbar() {

    
    if (!this.markdownToolbar) {
      console.warn('[Toolbar] Toolbar elements not found');
      return;
    }
    
    // Update toolbar visibility based on current mode and setting
    this.updateToolbarVisibility();
    

  }

  setupMarkdownToolbarEvents() {
    if (!this.markdownToolbar) return;
    
    // Cache DOM elements to prevent repeated queries
    this.cachedToolbarElements = {
      dropdownToggles: this.markdownToolbar.querySelectorAll('.dropdown-toggle'),
      mdButtons: this.markdownToolbar.querySelectorAll('.md-btn'),
      dropdownContents: this.markdownToolbar.querySelectorAll('.dropdown-content')
    };
    
    // Setup responsive behavior
    this.setupResponsiveToolbar();
    
    // Dropdown toggle buttons
    const dropdownToggles = this.cachedToolbarElements.dropdownToggles;
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only allow dropdown if not in inline mode
        if (!this.isToolbarInlineMode()) {
          const dropdownId = toggle.getAttribute('data-dropdown');
          this.toggleToolbarDropdown(dropdownId, toggle);
        }
      });
    });
    
    // Markdown formatting buttons
    const mdButtons = this.cachedToolbarElements.mdButtons;
    mdButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Skip dropdown toggles in inline mode
        if (btn.classList.contains('dropdown-toggle') && !this.isToolbarInlineMode()) {
          return;
        }
        
        // Check target and parent for data-action attribute
        let action = e.target.getAttribute('data-action');
        if (!action && e.target.parentElement) {
          action = e.target.parentElement.getAttribute('data-action');
        }
        if (!action) {
          action = btn.getAttribute('data-action');
        }
        if (action) {
          this.executeMarkdownAction(action);
          // Close any open dropdowns after action
          this.closeAllToolbarDropdowns();
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.toolbar-dropdown')) {
        this.closeAllToolbarDropdowns();
      }
    });
    
    // Font size controls
    if (this.fontSizeIncrease) {
      this.fontSizeIncrease.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeFontSize(2);
      });
    }
    if (this.fontSizeDecrease) {
      this.fontSizeDecrease.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeFontSize(-2);
      });
    }
    if (this.fontSizeReset) {
      this.fontSizeReset.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetFontSize();
      });
    }
    
    // Undo/Redo controls
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.executeUndo();
      });
    }
    if (this.redoBtn) {
      this.redoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.executeRedo();
      });
    }
  }



  updateToolbarVisibility() {
    if (!this.markdownToolbar) return;
    
    // Show only in code mode, not in split or preview mode, not in distraction-free mode, and when enabled
    const shouldShow = this.currentMode === 'code' && !this.isDistractionFree && this.isToolbarEnabled;
    
    if (shouldShow) {
      this.markdownToolbar.style.display = 'block';
      this.markdownToolbar.classList.add('visible');
    } else {
      this.markdownToolbar.style.display = 'none';
      this.markdownToolbar.classList.remove('visible');
    }
  }

  toggleMarkdownToolbar() {
    this.isToolbarEnabled = !this.isToolbarEnabled;
    localStorage.setItem('markdownViewer_toolbarEnabled', this.isToolbarEnabled.toString());
    this.updateToolbarVisibility();
    // Toolbar visibility updated
  }

  setupResponsiveToolbar() {
    // Setup resize listener for responsive behavior
    const handleResize = () => {
      if (this.isToolbarInlineMode()) {
        this.closeAllToolbarDropdowns();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Store reference for cleanup
    this.toolbarResizeHandler = handleResize;
  }
  
  isToolbarInlineMode() {
    return window.innerWidth > 800;
  }
  
  toggleToolbarDropdown(dropdownId, toggleButton) {
    const dropdown = document.getElementById(`${dropdownId}-dropdown`);
    if (!dropdown) return;
    
    // Don't allow dropdown in inline mode
    if (this.isToolbarInlineMode()) return;
    
    const isOpen = dropdown.classList.contains('show');
    
    // Close all other dropdowns first
    this.closeAllToolbarDropdowns();
    
    if (!isOpen) {
      // Open this dropdown
      dropdown.classList.add('show');
      toggleButton.classList.add('active');
    }
  }

  closeAllToolbarDropdowns() {
    const dropdowns = this.cachedToolbarElements?.dropdownContents || this.markdownToolbar.querySelectorAll('.dropdown-content');
    const toggles = this.cachedToolbarElements?.dropdownToggles || this.markdownToolbar.querySelectorAll('.dropdown-toggle');
    
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('show');
    });
    
    toggles.forEach(toggle => {
      toggle.classList.remove('active');
    });
  }

  executeMarkdownAction(action) {
    if (!this.isMonacoLoaded || !this.monacoEditor) {
      this.executeMarkdownActionFallback(action);
      return;
    }
    
    const model = this.monacoEditor.getModel();
    let selection = this.monacoEditor.getSelection();
    let selectedText = '';
    
    // Always use current selection/cursor position
    if (selection && !selection.isEmpty()) {
      selectedText = model.getValueInRange(selection);
    }
    
    this.performMarkdownAction(action, selection, model, selectedText);
  }

  performMarkdownAction(action, selection, model, selectedText) {
    // If no selectedText provided, try to get word at cursor
    if (!selectedText && model) {
      try {
        const position = this.monacoEditor.getPosition();
        if (position) {
          const wordAtPosition = model.getWordAtPosition(position);
          if (wordAtPosition) {
            selectedText = wordAtPosition.word;
            selection = new monaco.Selection(
              position.lineNumber,
              wordAtPosition.startColumn,
              position.lineNumber,
              wordAtPosition.endColumn
            );
          }
        }
      } catch (error) {
        console.warn('[Toolbar] Word detection error:', error);
      }
    }
    
    let replacement = '';
    let newSelection = null;
    
    switch (action) {
      case 'h1':
        replacement = this.wrapWithHeading(selectedText, 1);
        break;
      case 'h2':
        replacement = this.wrapWithHeading(selectedText, 2);
        break;
      case 'h3':
        replacement = this.wrapWithHeading(selectedText, 3);
        break;
      case 'bold':
        replacement = this.wrapWithMarkers(selectedText, '**', '**');
        break;
      case 'italic':
        replacement = this.wrapWithMarkers(selectedText, '*', '*');
        break;
      case 'strikethrough':
        replacement = this.wrapWithMarkers(selectedText, '~~', '~~');
        break;
      case 'code':
        replacement = this.wrapWithMarkers(selectedText, '`', '`');
        break;
      case 'link':
        replacement = this.createLink(selectedText);
        break;
      case 'image':
        replacement = this.createImage(selectedText);
        break;
      case 'ul':
        replacement = this.createList(selectedText, 'ul');
        break;
      case 'ol':
        replacement = this.createList(selectedText, 'ol');
        break;
      case 'task':
        replacement = this.createTaskList(selectedText);
        break;
      case 'table':
        replacement = this.createTable();
        break;
      case 'hr':
        replacement = this.createHorizontalRule();
        break;
      case 'quote':
        replacement = this.createBlockquote(selectedText);
        break;
      case 'underline':
        replacement = this.wrapWithHtml(selectedText, 'u');
        break;
      case 'codeblock':
        replacement = this.createCodeBlock(selectedText);
        break;
      case 'align-left':
        replacement = this.createAlignment(selectedText, 'left');
        break;
      case 'align-center':
        replacement = this.createAlignment(selectedText, 'center');
        break;
      case 'align-right':
        replacement = this.createAlignment(selectedText, 'right');
        break;
      case 'align-justify':
        replacement = this.createAlignment(selectedText, 'justify');
        break;
      default:
        return;
    }
    
    if (!replacement) {
      return;
    }
    
    // Apply the replacement - ensure we have a valid selection
    if (!selection || selection.isEmpty()) {
      const position = this.monacoEditor.getPosition();
      if (position) {
        this.monacoEditor.executeEdits('markdown-toolbar', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: replacement
        }]);
      }
    } else {
      this.monacoEditor.executeEdits('markdown-toolbar', [{
        range: selection,
        text: replacement
      }]);
    }
    
    // Simple selection preservation - select the new text with Promise-based approach
    Promise.resolve().then(() => {
      if (selection && !selection.isEmpty()) {
        const newSelection = new monaco.Selection(
          selection.startLineNumber,
          selection.startColumn,
          selection.startLineNumber,
          selection.startColumn + replacement.length
        );
        this.monacoEditor.setSelection(newSelection);
      }
      this.monacoEditor.focus();
    });
    
    // Mark as dirty
    this.markDirty();
  }

  executeMarkdownActionFallback(action) {
    // Fallback for textarea editor
    const textarea = this.editor;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    
    switch (action) {
      case 'h1':
        replacement = this.wrapWithHeading(selectedText, 1);
        break;
      case 'h2':
        replacement = this.wrapWithHeading(selectedText, 2);
        break;
      case 'h3':
        replacement = this.wrapWithHeading(selectedText, 3);
        break;
      case 'bold':
        replacement = this.wrapWithMarkers(selectedText, '**', '**');
        break;
      case 'italic':
        replacement = this.wrapWithMarkers(selectedText, '*', '*');
        break;
      case 'strikethrough':
        replacement = this.wrapWithMarkers(selectedText, '~~', '~~');
        break;
      case 'code':
        replacement = this.wrapWithMarkers(selectedText, '`', '`');
        break;
      case 'link':
        replacement = this.createLink(selectedText);
        break;
      case 'image':
        replacement = this.createImage(selectedText);
        break;
      case 'ul':
        replacement = this.createList(selectedText, 'ul');
        break;
      case 'ol':
        replacement = this.createList(selectedText, 'ol');
        break;
      case 'task':
        replacement = this.createTaskList(selectedText);
        break;
      case 'table':
        replacement = this.createTable();
        break;
      case 'hr':
        replacement = this.createHorizontalRule();
        break;
      case 'quote':
        replacement = this.createBlockquote(selectedText);
        break;
      case 'underline':
        replacement = this.wrapWithHtml(selectedText, 'u');
        break;
      case 'codeblock':
        replacement = this.createCodeBlock(selectedText);
        break;
      case 'align-left':
        replacement = this.createAlignment(selectedText, 'left');
        break;
      case 'align-center':
        replacement = this.createAlignment(selectedText, 'center');
        break;
      case 'align-right':
        replacement = this.createAlignment(selectedText, 'right');
        break;
      case 'align-justify':
        replacement = this.createAlignment(selectedText, 'justify');
        break;
      default:
        return;
    }
    
    // Replace text in textarea
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + replacement + after;
    
    // Set cursor position
    const newPos = start + replacement.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    
    // Focus back to textarea
    textarea.focus();
    
    // Mark as dirty
    this.markDirty();
  }

  // Markdown formatting helper methods
  wrapWithHeading(text, level) {
    const prefix = '#'.repeat(level) + ' ';
    if (text.trim()) {
      // Remove existing heading markers if present
      const cleanText = text.replace(/^#{1,6}\s*/, '');
      return prefix + cleanText.trim();
    }
    return prefix + 'Heading ' + level;
  }

  wrapWithMarkers(text, startMarker, endMarker) {
    if (text && text.length > 0) {
      return startMarker + text + endMarker;
    }
    return startMarker + 'text' + endMarker;
  }

  createLink(text) {
    if (text.trim()) {
      return `[${text}](url)`;
    }
    return '[link text](url)';
  }

  createImage(text) {
    if (text.trim()) {
      return `![${text}](image-url)`;
    }
    return '![alt text](image-url)';
  }

  createList(text, type) {
    const marker = type === 'ol' ? '1. ' : '- ';
    if (text.trim()) {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 1) {
        return lines.map((line, index) => {
          const itemMarker = type === 'ol' ? `${index + 1}. ` : '- ';
          return itemMarker + line.trim();
        }).join('\n');
      }
      return marker + text.trim();
    }
    return marker + 'List item';
  }

  createTaskList(text) {
    if (text.trim()) {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 1) {
        return lines.map(line => '- [ ] ' + line.trim()).join('\n');
      }
      return '- [ ] ' + text.trim();
    }
    return '- [ ] Task item';
  }

  createTable() {
    return '| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |';
  }

  createHorizontalRule() {
    return '\n---\n';
  }

  createBlockquote(text) {
    if (text.trim()) {
      const lines = text.split('\n');
      return lines.map(line => '> ' + line).join('\n');
    }
    return '> Blockquote text';
  }

  wrapWithHtml(text, tag) {
    if (text && text.length > 0) {
      return `<${tag}>${text}</${tag}>`;
    }
    return `<${tag}>text</${tag}>`;
  }

  createCodeBlock(text) {
    if (text && text.trim()) {
      return `\n\`\`\`\n${text.trim()}\n\`\`\`\n`;
    }
    return `\n\`\`\`\ncode here\n\`\`\`\n`;
  }

  createAlignment(text, alignment) {
    const alignText = text && text.trim() ? text.trim() : 'Text to align';
    if (alignment === 'left') {
      // Remove div wrapper if present
      const divMatch = alignText.match(/^<div[^>]*>(.*)<\/div>$/s);
      return divMatch ? divMatch[1] : alignText;
    }
    return `<div style="text-align: ${alignment};">${alignText}</div>`;
  }

  handleEnterKeyForLists(e) {
    if (!this.isMonacoLoaded || !this.monacoEditor) return;
    
    const position = this.monacoEditor.getPosition();
    const model = this.monacoEditor.getModel();
    const currentLine = model.getLineContent(position.lineNumber);
    
    // Only process if cursor is at end of line
    if (position.column !== currentLine.length + 1) return;
    
    let shouldContinue = false;
    let newLineText = '';
    
    // Check for bullet list with content
    const bulletMatch = currentLine.match(/^(\s*)([-*+])\s+(.+)$/);
    if (bulletMatch) {
      const [, indent, bullet] = bulletMatch;
      newLineText = `${indent}${bullet} `;
      shouldContinue = true;
    }
    
    // Check for empty bullet list
    const emptyBulletMatch = currentLine.match(/^(\s*)([-*+])\s*$/);
    if (emptyBulletMatch) {
      const [, indent] = emptyBulletMatch;
      e.preventDefault();
      const range = new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLine.length + 1);
      this.monacoEditor.executeEdits('auto-list', [{ range, text: indent }]);
      return;
    }
    
    // Check for numbered list with content
    const numberedMatch = currentLine.match(/^(\s*)(\d+)\. (.+)$/);
    if (numberedMatch) {
      const [, indent, num] = numberedMatch;
      const nextNum = parseInt(num) + 1;
      newLineText = `${indent}${nextNum}. `;
      shouldContinue = true;
    }
    
    // Check for empty numbered list
    const emptyNumberedMatch = currentLine.match(/^(\s*)(\d+)\. \s*$/);
    if (emptyNumberedMatch) {
      const [, indent] = emptyNumberedMatch;
      e.preventDefault();
      const range = new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLine.length + 1);
      this.monacoEditor.executeEdits('auto-list', [{ range, text: indent }]);
      return;
    }
    
    // Check for task list with content
    const taskMatch = currentLine.match(/^(\s*)- \[[ x]\] (.+)$/);
    if (taskMatch) {
      const [, indent] = taskMatch;
      newLineText = `${indent}- [ ] `;
      shouldContinue = true;
    }
    
    // Check for empty task list
    const emptyTaskMatch = currentLine.match(/^(\s*)- \[[ x]\] \s*$/);
    if (emptyTaskMatch) {
      const [, indent] = emptyTaskMatch;
      e.preventDefault();
      const range = new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLine.length + 1);
      this.monacoEditor.executeEdits('auto-list', [{ range, text: indent }]);
      return;
    }
    
    if (shouldContinue) {
      e.preventDefault();
      const insertPosition = new monaco.Position(position.lineNumber, position.column);
      this.monacoEditor.executeEdits('auto-list', [{
        range: new monaco.Range(insertPosition.lineNumber, insertPosition.column, insertPosition.lineNumber, insertPosition.column),
        text: `\n${newLineText}`
      }]);
    }
  }

  // Export Dropdown Methods
  toggleExportDropdown() {
    if (this.exportDropdownMenu.classList.contains('show')) {
      this.hideExportDropdown();
    } else {
      this.showExportDropdown();
    }
  }

  showExportDropdown() {
    this.exportDropdownMenu.classList.add('show');
    this.exportBtn.textContent = 'Export ▲';
  }

  hideExportDropdown() {
    this.exportDropdownMenu.classList.remove('show');
    this.exportBtn.textContent = 'Export ▼';
  }

  // Save Dropdown Methods
  toggleSaveDropdown() {
    if (this.saveDropdownMenu.classList.contains('show')) {
      this.hideSaveDropdown();
    } else {
      this.showSaveDropdown();
    }
  }

  showSaveDropdown() {
    this.saveDropdownMenu.classList.add('show');
    this.saveDropdownArrow.textContent = '▲';
  }

  hideSaveDropdown() {
    this.saveDropdownMenu.classList.remove('show');
    this.saveDropdownArrow.textContent = '▼';
  }
}

// Global error handlers to prevent crashes
window.addEventListener('error', (event) => {
  // Ignore benign ResizeObserver errors
  if (event.message && event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return;
  }
  
  console.error('[Global] Unhandled error:', event.error);
  console.error('[Global] Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // Only show modal for actual errors, not null/undefined
  if (event.error !== null && event.error !== undefined) {
    showGlobalErrorModal(event.error);
  }
  
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
  console.error('[Global] Promise rejection details:', {
    reason: event.reason,
    promise: event.promise
  });
  showGlobalErrorModal(event.reason);
  event.preventDefault();
});

// Fix for Tauri IPC communication issues
if (window.__TAURI__) {
  // Override the default IPC handler to handle undefined responses gracefully
  const originalInvoke = window.__TAURI__.core?.invoke;
  if (originalInvoke) {
    window.__TAURI__.core.invoke = function(cmd, args) {
      return originalInvoke.call(this, cmd, args).catch(error => {
        // Handle IPC communication errors gracefully
        if (error && (typeof error === 'string' && error.includes('callbackId')) || 
            (error.message && error.message.includes('callbackId'))) {
          console.warn('[IPC] Communication error, retrying...', error);
          // Return a resolved promise with null to prevent crashes
          return Promise.resolve(null);
        }
        throw error;
      });
    };
  }
  
  // Additional safety for event listeners
  const originalListen = window.__TAURI__.event?.listen;
  if (originalListen) {
    window.__TAURI__.event.listen = function(event, handler) {
      const safeHandler = function(eventData) {
        try {
          // Ensure eventData has the expected structure
          if (!eventData || typeof eventData !== 'object') {
            console.warn('[Event] Invalid event data received:', eventData);
            return;
          }
          return handler(eventData);
        } catch (handlerError) {
          console.error('[Event] Handler error:', handlerError);
        }
      };
      return originalListen.call(this, event, safeHandler);
    };
  }
}

function showGlobalErrorModal(error) {
  // Handle null errors specifically
  let errorMessage = 'Unknown error';
  let errorDetails = '';
  
  if (error === null) {
    errorMessage = 'Null reference error';
    errorDetails = 'This may be caused by accessing an uninitialized element or API response.';
  } else if (error === undefined) {
    errorMessage = 'Undefined reference error';
    errorDetails = 'This may be caused by accessing a property that does not exist.';
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && error.message) {
    errorMessage = error.message;
    if (error.stack) {
      errorDetails = `Stack trace available in console.`;
      console.error('[Error Stack]:', error.stack);
    }
  } else {
    errorMessage = String(error);
  }
  
  const message = `Application Error

An unexpected error occurred:
${errorMessage}

${errorDetails}

The application will continue running, but some features may not work correctly.

Please check your markdown syntax or restart the application if problems persist.`;
  
  if (window.__TAURI__?.dialog) {
    window.__TAURI__.dialog.message(message, { title: 'Error', type: 'error' }).catch(() => {
      console.error('[Dialog] Failed to show error:', message);
    });
  } else {
    console.error('[Dialog] Error:', message);
  }
}

// Phase 4 Complete Implementation with OS Integration
// Initialize the app when DOM is loaded with error handling
window.addEventListener('DOMContentLoaded', () => {
  try {
    new MarkdownViewer();
  } catch (initError) {
    console.error('[Init] Failed to initialize MarkdownViewer:', initError);
    showGlobalErrorModal(initError);
    
    // Try to show a basic interface even if initialization fails
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Markdown Editor - Initialization Error</h1>
        <p>The application failed to initialize properly.</p>
        <p>Error: ${initError.message || initError}</p>
        <p>Please refresh the page or restart the application.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">Refresh Page</button>
      </div>
    `;
  }
});