// Phase 4: Polish & OS Integration - Complete Implementation
console.log('Phase 4: Polish & OS Integration Loading...');

class MarkdownViewer {
  constructor() {
    this.currentFile = null;
    this.isDirty = false;
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.defaultMode = localStorage.getItem('markdownViewer_defaultMode') || 'preview';
    this.currentMode = 'preview';
    this.monacoEditor = null;
    this.isMonacoLoaded = false;
    this.isScrollSyncing = false;
    this.suggestionsEnabled = localStorage.getItem('markdownViewer_suggestionsEnabled') !== 'false';
    this.isLoadingFile = false;
    this.lastEditorScrollTop = 0;
    this.lastPreviewScrollTop = 0;
    this.lastPreviewMaxScroll = 0;
    this.lastEditorMaxScroll = 0;
    this.lastSelection = null;
    this.lastSelectedText = '';
    this.mermaidInitialized = false;
    this.katexInitialized = false;
    this.taskListStates = new Map();
    this.isTyping = false;
    this.typingTimeout = null;
    this.previewUpdateTimeout = null;
    this.performanceMetrics = {
      lastUpdateTime: 0,
      updateCount: 0,
      averageUpdateTime: 0
    };
    this.startupTime = 0;
    this.lastFileOpenTime = 0;
    this.lastModeSwitchTime = 0;
    this.closeHandlerUnlisten = null;
    this.isDistractionFree = false;
    this.preDistractionMode = null;
    this.centeredLayoutEnabled = localStorage.getItem('markdownViewer_centeredLayout') === 'true';
    this.currentPageSize = localStorage.getItem('markdownViewer_pageSize') || 'a4';
    this.pageMargins = {
      top: localStorage.getItem('markdownViewer_marginTop') || '1in',
      bottom: localStorage.getItem('markdownViewer_marginBottom') || '1in',
      left: localStorage.getItem('markdownViewer_marginLeft') || '1in',
      right: localStorage.getItem('markdownViewer_marginRight') || '1in'
    };
    this.fileHistory = JSON.parse(localStorage.getItem('markdownViewer_fileHistory') || '[]');
    
    const startupStartTime = performance.now();
    console.log('[MarkdownViewer] Phase 4 Constructor started');
    this.initializeElements();
    this.setupEventListeners();
    this.initializeMonacoEditor();
    this.setMode('preview');
    this.updateCursorPosition();
    this.updateModeButtons();
    this.applyDefaultTheme();
    this.applyCenteredLayout();
    this.updateFileHistoryDisplay();
    this.initializeMarkdownToolbar();
    this.initializeAdvancedFeatures();
    
    // Ensure toolbar visibility is set correctly after initialization
    setTimeout(() => {
      this.updateToolbarVisibility();
    }, 100);
    this.checkExportLibraries();
    
    this.startupTime = performance.now() - startupStartTime;
    console.log(`[MarkdownViewer] Phase 4 Constructor completed in ${this.startupTime.toFixed(2)}ms`);
    
    // Show splash screen if enabled
    if (this.isSplashEnabled) {
      this.showSplashScreen();
    }
    
    // Verify performance targets
    if (this.startupTime > 2000) {
      console.warn(`[Performance] Startup time exceeded target: ${this.startupTime.toFixed(2)}ms > 2000ms`);
    }
    
    // Start periodic memory optimization
    this.startMemoryOptimization();
    
    // Setup window close handler
    this.setupWindowCloseHandler();
    
    // Setup Tauri drag-drop events (inactive due to config but ready)
    this.setupTauriDragDrop();
    
    // Setup browser drag-drop (fallback only)
    // this.setupDragAndDrop(); // Disabled - using native Tauri events
    console.log('[DragDrop] Drag-drop setup completed - using native Tauri events');
    
    console.log('[Phase4] All Phase 4 features initialized successfully');
    console.log('[Phase4] File associations, keyboard shortcuts, performance monitoring, and error handling active');
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
  }

  async initializeAdvancedFeatures() {
    try {
      console.log('[Advanced] Initializing advanced features with dynamic imports...');
      
      // Load Mermaid using dynamic import to avoid AMD conflicts
      try {
        const mermaidModule = await import('https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.esm.min.mjs');
        this.mermaid = mermaidModule.default;
        this.mermaid.initialize({
          startOnLoad: false,
          theme: this.theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit'
        });
        this.mermaidInitialized = true;
        console.log('[Mermaid] Loaded and initialized successfully via ES module');
      } catch (error) {
        console.warn('[Mermaid] Failed to load via ES module:', error);
        this.mermaidInitialized = false;
      }
      
      // Load KaTeX using dynamic import
      try {
        const katexModule = await import('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs');
        this.katex = katexModule.default;
        this.katexInitialized = true;
        console.log('[KaTeX] Loaded successfully via ES module');
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

  async initializeMonacoEditor() {
    try {
      console.log('[Monaco] Initializing Monaco Editor...');
      
      // Configure Monaco loader for CDN
      require.config({ 
        paths: { 
          'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
        }
      });

      // Load Monaco Editor
      require(['vs/editor/editor.main'], () => {
        console.log('[Monaco] Monaco Editor loaded successfully');
        
        // Create Monaco Editor instance
        this.monacoEditor = monaco.editor.create(this.monacoContainer, {
          value: '',
          language: 'markdown',
          theme: this.theme === 'dark' ? 'vs-dark' : 'vs',
          automaticLayout: true,
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineHeight: 1.45,
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          renderWhitespace: 'selection',
          folding: true,
          lineNumbers: 'on',
          glyphMargin: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          },
          suggest: {
            showKeywords: this.suggestionsEnabled,
            showSnippets: this.suggestionsEnabled,
            showWords: this.suggestionsEnabled
          },
          quickSuggestions: this.suggestionsEnabled
        });

        this.isMonacoLoaded = true;
        console.log('[Monaco] Editor instance created');

        // Setup Monaco event listeners
        this.setupMonacoEventListeners();
        
        // Hide fallback textarea and show Monaco
        this.editor.style.display = 'none';
        this.monacoContainer.style.display = 'block';
        
        // Check for startup file before initial preview
        this.checkStartupFile().then(() => {
          // Only update preview if no startup file was loaded
          if (!this.currentFile) {
            this.updatePreview();
          }
          this.updateCursorPosition();
          
          // Tauri native drag-drop already set up in constructor
        });
      });

    } catch (error) {
      console.error('[Monaco] Failed to load Monaco Editor:', error);
      console.log('[Monaco] Falling back to textarea editor');
      this.monacoContainer.style.display = 'none';
      this.editor.style.display = 'block';
      this.isMonacoLoaded = false;
    }
  }

  setupMonacoEventListeners() {
    if (!this.monacoEditor) return;

    // Content change events with debounced preview updates
    this.monacoEditor.onDidChangeModelContent(() => {
      this.debouncedUpdatePreview();
      this.markDirty();
      this.updateCursorPosition();
      
      // Disable scroll sync temporarily during typing
      this.isTyping = true;
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
      }, 1000);
    });

    // Cursor position change events
    this.monacoEditor.onDidChangeCursorPosition(() => {
      this.updateCursorPosition();
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
      if (this.currentMode === 'split' && !this.isTyping) {
        this.syncScrollToPreview(e.scrollTop, e.scrollHeight);
      }
    });

    // Focus events for better UX
    this.monacoEditor.onDidFocusEditorText(() => {
      console.log('[Monaco] Editor focused');
    });

    // Auto-continuation for lists and tasks
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Dummy command to prevent conflicts
    });
    
    // Add markdown formatting shortcuts
    this.setupMonacoMarkdownShortcuts();
    
    this.monacoEditor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Enter && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.handleEnterKeyForLists(e);
      }
    });
  }

  setupEventListeners() {
    // File operations
    this.newBtn.addEventListener('click', () => {
      console.log('[Event] New button clicked');
      this.newFile();
    });
    this.openBtn.addEventListener('click', () => {
      console.log('[Event] Open button clicked');
      this.openFile();
    });
    // Save functionality with dropdown
    this.saveBtn.addEventListener('click', () => {
      console.log('[Event] Save button clicked');
      this.saveFile();
    });
    this.saveDropdownArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSaveDropdown();
    });
    this.saveAsBtn.addEventListener('click', () => {
      this.hideSaveDropdown();
      console.log('[Event] Save As button clicked');
      this.saveAsFile();
    });
    this.closeBtn.addEventListener('click', () => {
      console.log('[Event] Close button clicked');
      this.closeFile();
    });
    
    // Welcome page buttons
    if (this.welcomeNewBtn) {
      this.welcomeNewBtn.addEventListener('click', () => {
        console.log('[Event] Welcome new button clicked');
        this.newFile();
      });
    }
    if (this.welcomeOpenBtn) {
      this.welcomeOpenBtn.addEventListener('click', () => {
        console.log('[Event] Welcome open button clicked');
        this.openFile();
      });
    }
    
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener('click', () => {
        console.log('[Event] Clear history button clicked');
        this.clearFileHistory();
      });
    }
    
    // Phase 8.5 event listeners
    if (this.helpStatusBtn) {
      this.helpStatusBtn.addEventListener('click', () => {
        console.log('[Event] Help status button clicked');
        this.showHelp();
      });
    }
    
    if (this.welcomeHelpBtn) {
      this.welcomeHelpBtn.addEventListener('click', () => {
        console.log('[Event] Welcome help button clicked');
        this.showHelp();
      });
    }
    
    if (this.welcomeAboutBtn) {
      this.welcomeAboutBtn.addEventListener('click', () => {
        console.log('[Event] Welcome about button clicked');
        this.showAbout();
      });
    }
    
    if (this.welcomeSettingsBtn) {
      this.welcomeSettingsBtn.addEventListener('click', () => {
        console.log('[Event] Welcome settings button clicked');
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
      }
    });
    
    this.editor.addEventListener('keyup', () => {
      if (!this.isMonacoLoaded) {
        this.updateCursorPosition();
      }
    });
    
    this.editor.addEventListener('click', () => {
      if (!this.isMonacoLoaded) {
        this.updateCursorPosition();
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
              // Print (Ctrl+P)
              e.preventDefault();
              this.exportToPdf();
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
          this.toggleDistractionFree();
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
        
        // Trigger Monaco layout update
        if (this.isMonacoLoaded && this.monacoEditor) {
          setTimeout(() => {
            this.monacoEditor.layout();
          }, 10);
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
      console.log('[File] Opening file dialog...');
      
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available');
      }
      
      const selected = await window.__TAURI__.dialog.open({
        multiple: false,
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown', 'txt']
        }]
      });
      
      if (selected) {
        const content = await window.__TAURI__.fs.readTextFile(selected);
        
        this.isLoadingFile = true;
        this.setEditorContent(content);
        this.isLoadingFile = false;
        this.showEditor();
        this.updatePreview();
        this.currentFile = selected;
        this.isDirty = false;
        this.addToFileHistory(selected);
        this.updateFilename();
        this.updateModeButtons();
        this.setMode(this.defaultMode);
        
        this.benchmarkOperation('File Open', startTime);
        console.log('[File] File opened successfully');
      }
    } catch (error) {
      this.handleError(error, 'File Opening');
    }
  }

  async saveFile() {
    console.log('[File] Save button clicked');
    const content = this.getEditorContent();
    console.log('[File] Content to save length:', content.length);
    
    if (!window.__TAURI__) {
      console.error('[File] Tauri API not available');
      return;
    }
    
    if (this.currentFile) {
      console.log('[File] Saving to existing file:', this.currentFile);
      try {
        await window.__TAURI__.fs.writeTextFile(this.currentFile, content);
        this.isDirty = false;
        this.saveBtn.classList.remove('dirty');
        this.updateFilename();
        console.log('[File] File saved successfully');
      } catch (error) {
        console.error('[File] Save failed:', error);
        alert('Failed to save file: ' + (error.message || error));
      }
    } else {
      console.log('[File] Opening save dialog...');
      try {
        const filePath = await window.__TAURI__.dialog.save({
          filters: [{
            name: 'Markdown',
            extensions: ['md']
          }]
        });
        
        if (filePath) {
          console.log('[File] Saving to new file:', filePath);
          await window.__TAURI__.fs.writeTextFile(filePath, content);
          this.currentFile = filePath;
          this.isDirty = false;
          this.saveBtn.classList.remove('dirty');
          this.updateFilename();
          console.log('[File] File saved successfully');
        } else {
          console.log('[File] Save dialog cancelled');
        }
      } catch (error) {
        console.error('[File] Save failed:', error);
        alert('Failed to save file: ' + (error.message || error));
      }
    }
  }

  async saveAsFile() {
    try {
      const content = this.getEditorContent();
      console.log('[File] Opening save as dialog...');
      
      const { save } = window.__TAURI__.dialog;
      const { writeTextFile } = window.__TAURI__.fs;
      
      const filePath = await save({
        filters: [{
          name: 'Markdown',
          extensions: ['md']
        }]
      });
      
      if (filePath) {
        console.log('[File] Saving as new file:', filePath);
        await writeTextFile(filePath, content);
        this.currentFile = filePath;
        this.isDirty = false;
        this.updateFilename();
        console.log('[File] File saved as successfully');
      }
    } catch (error) {
      this.handleError(error, 'Save As');
    }
  }

  async closeFile() {
    console.log('[Close] isDirty:', this.isDirty);
    if (this.isDirty) {
      try {
        // Create custom 3-button dialog using browser confirm and additional logic
        const saveFirst = await window.__TAURI__.dialog.confirm(
          'You have unsaved changes. Do you want to save before closing?',
          { title: 'Unsaved Changes' }
        );
        
        if (saveFirst) {
          // User chose to save - try to save first
          try {
            await this.saveFile();
            this.doClose();
          } catch (error) {
            console.error('[Close] Error saving file:', error);
            // Don't close if save failed
          }
        } else {
          // User chose not to save - ask if they want to close without saving
          const closeWithoutSaving = await window.__TAURI__.dialog.confirm(
            'Close without saving changes?',
            { title: 'Confirm Close' }
          );
          
          if (closeWithoutSaving) {
            this.doClose();
          }
          // If they cancel the second dialog, do nothing (stay in document)
        }
      } catch (error) {
        console.error('[Close] Error showing dialog:', error);
        // Don't close on dialog error
      }
    } else {
      console.log('[Close] No unsaved changes, closing directly');
      this.doClose();
    }
  }

  newFile() {
    console.log('[File] Creating new file');
    if (this.isDirty) {
      // Ask to save current file first
      this.closeFile().then(() => {
        this.doNewFile();
      });
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
    this.setMode(this.defaultMode); // Use default mode for new files
    this.isDirty = false;
    this.saveBtn.classList.remove('dirty');
    console.log('[File] New file created');
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
    console.log('[File] File closed, editor and preview cleared, showing welcome page');
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
    const markdown = this.getEditorContent();
    
    console.log('[Preview] Starting preview update...');
    console.log('[Preview] Libraries loaded:', {
      marked: typeof marked !== 'undefined',
      mermaid: typeof mermaid !== 'undefined',
      katex: typeof katex !== 'undefined',
      window_mermaid: typeof window.mermaid !== 'undefined',
      window_katex: typeof window.katex !== 'undefined'
    });
    
    // Check what's actually available in window
    console.log('[Preview] Window object keys containing mermaid/katex:', 
      Object.keys(window).filter(key => key.toLowerCase().includes('mermaid') || key.toLowerCase().includes('katex')));
    
    if (typeof marked === 'undefined') {
      console.error('[Preview] marked.js not loaded');
      this.preview.innerHTML = '<p>Markdown parser not loaded</p>';
      return;
    }

    try {
      // First, process math expressions in the raw markdown
      let processedMarkdown = this.processMathInMarkdown(markdown);
      
      // Configure marked with basic settings and custom renderer
      console.log('[Preview] Marked version:', marked.version || 'unknown');
      
      // Check if we're using the new marked API (v5+)
      if (marked.use) {
        console.log('[Preview] Using new marked API');
        
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
        console.log('[Preview] Using legacy marked API');
        
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
      
      // Parse markdown to HTML
      let html = marked.parse(processedMarkdown);
      console.log('[Preview] Initial HTML generated, length:', html.length);
      
      // Process Mermaid code blocks
      html = this.processMermaidInHtml(html);
      
      // Process task lists
      html = this.processTaskListsInHtml(html);
      
      // Set the HTML content
      this.preview.innerHTML = html;
      console.log('[Preview] HTML set in preview');
      console.log('[Preview] Final HTML sample:', html.substring(0, 500) + '...');
      
      // Render Mermaid diagrams
      await this.renderMermaidDiagrams();
      
      // Setup task list interactions
      this.setupTaskListInteractions();
      
      // Setup anchor link navigation
      this.setupAnchorLinks();
      
      // Apply syntax highlighting to code blocks
      this.applySyntaxHighlighting();
      
      // Process images for local file conversion
      await this.processImages();
      
      console.log('[Preview] Preview update completed');
      
    } catch (error) {
      console.error('[Preview] Error updating preview:', error);
      console.error('[Preview] Error stack:', error.stack);
      this.preview.innerHTML = `<p>Error rendering markdown: ${error.message}</p><pre>${error.stack}</pre>`;
    }
  }

  updateCursorPosition() {
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
  }

  updateFilename() {
    if (this.currentFile) {
      const filename = this.currentFile.split(/[\\\/]/).pop();
      this.filename.textContent = filename + (this.isDirty ? ' *' : '');
    } else if (this.welcomePage && this.welcomePage.style.display !== 'none') {
      this.filename.textContent = 'Welcome';
    } else {
      this.filename.textContent = 'untitled.md' + (this.isDirty ? ' *' : '');
    }
  }
  
  updateModeButtons() {
    const hasDocument = this.currentFile || (this.welcomePage && this.welcomePage.style.display === 'none');
    
    if (hasDocument) {
      // Enable mode buttons
      this.codeBtn.disabled = false;
      this.previewBtn.disabled = false;
      this.splitBtn.disabled = false;
      this.codeBtn.classList.remove('disabled');
      this.previewBtn.classList.remove('disabled');
      this.splitBtn.classList.remove('disabled');
      
      // Enable export, save, and close buttons
      this.saveBtn.disabled = false;
      this.saveAsBtn.disabled = false;
      this.closeBtn.disabled = false;
      this.exportBtn.disabled = false;
      this.exportHtmlBtn.disabled = false;
      this.exportPdfBtn.disabled = false;
    } else {
      // Disable all mode buttons when no document
      this.codeBtn.disabled = true;
      this.previewBtn.disabled = true;
      this.splitBtn.disabled = true;
      this.codeBtn.classList.add('disabled');
      this.previewBtn.classList.add('disabled');
      this.splitBtn.classList.add('disabled');
      
      // Disable export, save, and close buttons
      this.saveBtn.disabled = true;
      this.saveAsBtn.disabled = true;
      this.closeBtn.disabled = true;
      this.exportBtn.disabled = true;
      this.exportHtmlBtn.disabled = true;
      this.exportPdfBtn.disabled = true;
      
      // Force preview mode
      this.setMode('preview');
    }
  }

  markDirty() {
    if (!this.isDirty && !this.isLoadingFile) {
      this.isDirty = true;
      this.updateFilename();
      this.saveBtn.classList.add('dirty');
      console.log('[Dirty] Document marked as dirty');
    }
  }

  setMode(mode) {
    const startTime = performance.now();
    console.log(`[Mode] Switching to ${mode} mode`);
    
    // Check if mode switching is allowed
    const hasDocument = this.currentFile || (this.welcomePage && this.welcomePage.style.display === 'none');
    if (!hasDocument && (mode === 'code' || mode === 'split')) {
      console.log('[Mode] Mode switching disabled - no document loaded');
      return;
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
    
    // Trigger Monaco layout update and restore scroll positions
    if (this.isMonacoLoaded && this.monacoEditor) {
      setTimeout(() => {
        this.monacoEditor.layout();
        setTimeout(() => {
          this.restoreScrollPositions();
          this.benchmarkOperation('Mode Switch', startTime);
        }, 50);
      }, 100);
    } else {
      setTimeout(() => {
        this.restoreScrollPositions();
        this.benchmarkOperation('Mode Switch', startTime);
      }, 150);
    }
  }

  setupScrollSync() {
    // Sync from preview to editor
    this.preview.addEventListener('scroll', () => {
      if (this.currentMode === 'split' && !this.isScrollSyncing && !this.isTyping) {
        this.isScrollSyncing = true;
        this.syncScrollToEditor();
        setTimeout(() => {
          this.isScrollSyncing = false;
        }, 100);
      }
    });
  }

  setupDragAndDrop() {
    console.log('[DragDrop] Setting up drag-and-drop functionality');
    console.log('[DragDrop] Tauri file drop disabled - using browser events');
    console.log('[DragDrop] Window object:', typeof window);
    console.log('[DragDrop] Document object:', typeof document);
    
    // Test if basic events work
    document.addEventListener('click', () => {
      console.log('[DragDrop] Click test - events are working');
    }, { once: true });
    
    // Enhanced drag-and-drop with visual feedback
    let dragCounter = 0;
    
    // Prevent default drag behaviors on document
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      console.log('[DragDrop] Drag enter, counter:', dragCounter);
      
      // Add visual feedback
      document.body.classList.add('drag-over');
    });
    
    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      console.log('[DragDrop] Drag leave, counter:', dragCounter);
      
      // Remove visual feedback when completely leaving
      if (dragCounter === 0) {
        document.body.classList.remove('drag-over');
      }
    });
    
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      console.log('[DragDrop] Drag over');
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
        console.log('[Close] Close requested, isDirty:', this.isDirty);
        
        if (this.isDirty) {
          event.preventDefault();
          
          const shouldSave = await window.__TAURI__.dialog.confirm(
            'You have unsaved changes. Do you want to save before closing?',
            { title: 'Unsaved Changes' }
          );
          
          if (shouldSave) {
            await this.saveFile();
            if (this.isDirty) {
              console.log('[Close] Save failed, not closing');
              return;
            }
          } else {
            const confirmClose = await window.__TAURI__.dialog.confirm(
              'Close without saving?',
              { title: 'Confirm Close' }
            );
            if (!confirmClose) {
              return;
            }
          }
          
          this.isDirty = false;
          await appWindow.close();
        }
      });
      
      this.closeHandlerUnlisten = unlisten;
      console.log('[Close] Window close handler registered');
      
    } catch (error) {
      console.error('[Close] Error setting up close handler:', error);
    }
  }
  


  syncScrollToPreview(editorScrollTop, editorScrollHeight) {
    if (this.isScrollSyncing) return;
    
    this.isScrollSyncing = true;
    
    // Calculate scroll percentage
    const editorElement = this.monacoEditor.getDomNode();
    const editorViewHeight = editorElement.clientHeight;
    const maxEditorScroll = Math.max(0, editorScrollHeight - editorViewHeight);
    const scrollPercentage = maxEditorScroll > 0 ? editorScrollTop / maxEditorScroll : 0;
    
    // Apply to preview
    const previewMaxScroll = Math.max(0, this.preview.scrollHeight - this.preview.clientHeight);
    const previewScrollTop = scrollPercentage * previewMaxScroll;
    
    this.preview.scrollTop = previewScrollTop;
    
    setTimeout(() => {
      this.isScrollSyncing = false;
    }, 100);
  }

  syncScrollToEditor() {
    if (!this.isMonacoLoaded || !this.monacoEditor) return;
    
    // Calculate scroll percentage from preview
    const previewMaxScroll = Math.max(0, this.preview.scrollHeight - this.preview.clientHeight);
    const scrollPercentage = previewMaxScroll > 0 ? this.preview.scrollTop / previewMaxScroll : 0;
    
    // Get Monaco editor scroll info
    const scrollHeight = this.monacoEditor.getScrollHeight();
    const viewHeight = this.monacoEditor.getLayoutInfo().height;
    const maxScroll = Math.max(0, scrollHeight - viewHeight);
    const targetScrollTop = scrollPercentage * maxScroll;
    
    this.monacoEditor.setScrollTop(targetScrollTop);
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
    
    console.log(`[Editor] Suggestions ${this.suggestionsEnabled ? 'enabled' : 'disabled'}`);
  }

  storeScrollPositions() {
    // Store editor scroll position and dimensions
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.lastEditorScrollTop = this.monacoEditor.getScrollTop();
      const scrollHeight = this.monacoEditor.getScrollHeight();
      const viewHeight = this.monacoEditor.getLayoutInfo().height;
      this.lastEditorMaxScroll = Math.max(0, scrollHeight - viewHeight);

    }
    
    // Store preview scroll position and dimensions
    this.lastPreviewScrollTop = this.preview.scrollTop;
    this.lastPreviewMaxScroll = Math.max(0, this.preview.scrollHeight - this.preview.clientHeight);

  }
  
  restoreScrollPositions() {

    
    if (this.currentMode === 'code') {
      // When switching to code mode, sync preview scroll to editor
      if (this.isMonacoLoaded && this.monacoEditor) {
        const scrollPercentage = this.lastPreviewMaxScroll > 0 ? this.lastPreviewScrollTop / this.lastPreviewMaxScroll : 0;
        
        console.log('[Scroll] Using stored preview max:', this.lastPreviewMaxScroll, 'Percentage:', scrollPercentage);
        
        const scrollHeight = this.monacoEditor.getScrollHeight();
        const viewHeight = this.monacoEditor.getLayoutInfo().height;
        const maxScroll = Math.max(0, scrollHeight - viewHeight);
        const targetScrollTop = scrollPercentage * maxScroll;
        
        console.log('[Scroll] Editor max scroll:', maxScroll, 'Target:', targetScrollTop);
        this.monacoEditor.setScrollTop(targetScrollTop);
      }
    } else if (this.currentMode === 'preview') {
      // When switching to preview mode, sync editor scroll to preview
      if (this.isMonacoLoaded && this.monacoEditor) {
        const scrollPercentage = this.lastEditorMaxScroll > 0 ? this.lastEditorScrollTop / this.lastEditorMaxScroll : 0;
        
        const previewMaxScroll = Math.max(0, this.preview.scrollHeight - this.preview.clientHeight);
        const previewScrollTop = scrollPercentage * previewMaxScroll;
        
        console.log('[Scroll] Using stored editor max:', this.lastEditorMaxScroll, 'Percentage:', scrollPercentage);
        console.log('[Scroll] Setting preview scroll to:', previewScrollTop);
        this.preview.scrollTop = previewScrollTop;
      }
    } else if (this.currentMode === 'split') {
      // In split mode, restore both positions
      if (this.isMonacoLoaded && this.monacoEditor) {
        console.log('[Scroll] Restoring editor scroll to:', this.lastEditorScrollTop);
        this.monacoEditor.setScrollTop(this.lastEditorScrollTop);
      }
      console.log('[Scroll] Restoring preview scroll to:', this.lastPreviewScrollTop);
      this.preview.scrollTop = this.lastPreviewScrollTop;
    }
  }

  processMathInMarkdown(markdown) {
    console.log('[Math] Processing math expressions...');
    
    if (this.katexInitialized && this.katex) {
      console.log('[Math] Using KaTeX for rendering');
      
      // Process display math: $$...$$
      markdown = markdown.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
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
      
      // Process inline math: $...$
      markdown = markdown.replace(/\$([^$\n]+)\$/g, (match, math) => {
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
      console.log('[Math] KaTeX not available, using fallback styling');
      
      // Fallback styling without external libraries
      markdown = markdown.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
        return `<div class="math-display math-fallback"><code>${math.trim()}</code></div>`;
      });
      
      markdown = markdown.replace(/\$([^$\n]+)\$/g, (match, math) => {
        return `<span class="math-inline math-fallback"><code>${math.trim()}</code></span>`;
      });
    }
    
    return markdown;
  }
  
  processMermaidInHtml(html) {
    console.log('[Mermaid] Processing Mermaid code blocks...');
    
    if (this.mermaidInitialized && this.mermaid) {
      console.log('[Mermaid] Using Mermaid.js for rendering');
      
      // Replace mermaid code blocks with containers for rendering
      html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
        const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        return `<div class="mermaid-diagram" id="${id}" data-mermaid-code="${encodeURIComponent(decodedCode.trim())}"></div>`;
      });
    } else {
      console.log('[Mermaid] Mermaid not available, using fallback placeholders');
      
      // Fallback placeholders
      html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
        const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        return `<div class="mermaid-placeholder mermaid-fallback">
          <div class="placeholder-header">📊 Mermaid Diagram</div>
          <pre class="diagram-code">${decodedCode}</pre>
          <div class="placeholder-note">Mermaid.js not loaded - showing code instead</div>
        </div>`;
      });
    }
    
    return html;
  }
  
  processTaskListsInHtml(html) {
    console.log('[TaskList] Processing task lists...');
    let taskCount = 0;
    
    // First, handle any existing disabled checkboxes in li elements
    html = html.replace(/<li><input[^>]*disabled[^>]*type="checkbox"[^>]*>\s*([^<]*)<\/li>/g, (match, content) => {
      // Check for checked attribute specifically as an attribute
      const isChecked = /\bchecked\b[="']?/.test(match);
      const id = 'task-' + Date.now() + '-' + taskCount;
      taskCount++;

      return `<div class="task-list-item dash-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${content.trim()}</label></div>`;
    });
    
    // Handle dash-prefixed task lists in li elements (markdown syntax)
    html = html.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/gs, (match, checked, content) => {
      const isChecked = checked === 'x';
      const id = 'task-' + Date.now() + '-' + taskCount;
      taskCount++;

      return `<div class="task-list-item dash-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${content}</label></div>`;
    });
    
    // Handle standalone checkbox patterns in paragraphs
    html = html.replace(/<p>\[([ x])\]\s*([^<]*?)<\/p>/g, (match, checked, content) => {
      const isChecked = checked === 'x';
      const cleanContent = content.trim();
      const id = 'task-' + Date.now() + '-' + taskCount;
      taskCount++;

      return `<div class="task-list-item standalone-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${cleanContent}</label></div>`;
    });
    
    console.log(`[TaskList] Processed ${taskCount} total tasks`);
    return html;
  }
  
  async renderMermaidDiagrams() {
    if (!this.mermaidInitialized || !this.mermaid) {
      console.log('[Mermaid] Mermaid not initialized, skipping diagram rendering');
      return;
    }
    
    console.log('[Mermaid] Rendering Mermaid diagrams...');
    
    const diagrams = document.querySelectorAll('.mermaid-diagram');
    console.log(`[Mermaid] Found ${diagrams.length} diagrams to render`);
    
    for (let i = 0; i < diagrams.length; i++) {
      const diagram = diagrams[i];
      const code = decodeURIComponent(diagram.getAttribute('data-mermaid-code'));
      
      try {
        console.log(`[Mermaid] Rendering diagram ${i + 1}/${diagrams.length}`);
        
        // Clear any existing content
        diagram.innerHTML = '';
        
        // Render the diagram
        const { svg } = await this.mermaid.render(diagram.id + '-svg', code);
        diagram.innerHTML = svg;
        
        console.log(`[Mermaid] Successfully rendered diagram ${i + 1}`);
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
    
    console.log('[Mermaid] Finished rendering all diagrams');
  }
  
  setupTaskListInteractions() {
    console.log('[TaskList] Setting up task list interactions...');
    
    if (this.taskChangeHandler) {
      this.preview.removeEventListener('change', this.taskChangeHandler);
    }
    
    this.taskChangeHandler = (e) => {
      if (e.target.type === 'checkbox' && e.target.closest('.task-list-item')) {
        const label = e.target.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
          const taskText = label.textContent.trim();
          this.updateTaskInMarkdown(taskText, e.target.checked);
          this.markDirty();
        }
      }
    };
    
    this.preview.addEventListener('change', this.taskChangeHandler);
    
    const checkboxes = this.preview.querySelectorAll('.task-list-item input[type="checkbox"]');
    console.log(`[TaskList] Set up event handling for ${checkboxes.length} checkboxes`);

  }

  setupAnchorLinks() {
    console.log('[Anchors] Setting up anchor link navigation...');
    
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
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = this.preview.querySelector(`#${targetId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    
    this.preview.addEventListener('click', this.anchorClickHandler);
    
    console.log(`[Anchors] Set up anchor navigation for ${headers.length} headers`);
  }
  
  updateTaskInMarkdown(taskText, checked) {
    const currentContent = this.getEditorContent();
    const lines = currentContent.split('\n');
    
    let updated = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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
      console.log('[Export] Exporting to HTML...');
      
      const content = this.getEditorContent();
      const previewHtml = this.preview.innerHTML;
      
      // Create complete HTML document
      const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
        body {
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
        .mermaid-diagram { text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    ${previewHtml}
</body>
</html>`;
      
      // Save HTML file
      if (window.__TAURI__) {
        const filePath = await window.__TAURI__.dialog.save({
          filters: [{
            name: 'HTML',
            extensions: ['html']
          }]
        });
        
        if (filePath) {
          await window.__TAURI__.fs.writeTextFile(filePath, htmlDocument);
          console.log('[Export] HTML exported successfully to:', filePath);
        }
      }
      
    } catch (error) {
      console.error('[Export] Error exporting to HTML:', error);
      alert('Error exporting to HTML: ' + error.message);
    }
  }
  
  async exportToPdf() {
    try {
      console.log('[Export] Starting PDF export...');
      
      // Use Tauri's native print functionality or browser print
      await this.printContent();
      
    } catch (error) {
      console.error('[Export] PDF export failed:', error);
      alert('PDF Export Error: ' + error.message + '\n\nTip: Use Ctrl+P to print directly, or try HTML Export and print from your browser.');
    }
  }
  
  async printContent() {
    try {
      console.log('[Export] Preparing content for printing...');
      
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
          console.log('[Export] Opened with system default application');
          return;
        } catch (error) {
          console.warn('[Export] Tauri print failed, falling back to browser print:', error);
        }
      }
      
      // Fallback to browser print without popup
      this.printViaBrowserDirect(printHtml);
      
    } catch (error) {
      console.error('[Export] Print content failed:', error);
      throw error;
    }
  }
  
  createPrintHtml(content, title) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    body {
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
    /* Ensure syntax highlighting colors are preserved */
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
    
    /* Better Mermaid diagram handling for print */
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
    
    /* Print-specific styles */
    @media print {
      body { margin: 0; padding: 15px; }
      .no-print { display: none !important; }
      .toolbar, .status-bar, .welcome-page { display: none !important; }
      
      /* Better page break handling */
      pre, .mermaid-diagram, blockquote, table { 
        page-break-inside: avoid;
        break-inside: avoid;
      }
      h1, h2, h3, h4, h5, h6 { 
        page-break-after: avoid;
        break-after: avoid;
      }
      
      /* Optimize images and diagrams */
      img, svg { 
        max-width: 100% !important; 
        height: auto !important;
        page-break-inside: avoid;
      }
      
      /* Force syntax highlighting colors in print */
      * {
        color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    
    @page {
      margin: 0.6in;
      size: letter;
    }
  </style>
</head>
<body>
  ${content}
  <script>
    // Ensure syntax highlighting is applied after content loads
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach(function(block) {
          if (!block.classList.contains('hljs')) {
            hljs.highlightElement(block);
          }
        });
      }
    });
  </script>
</body>
</html>`;
  }
  
  async createTempPrintFile(htmlContent) {
    const tempDir = await window.__TAURI__.path.tempDir();
    const tempFile = await window.__TAURI__.path.join(tempDir, 'markdown-print.html');
    await window.__TAURI__.fs.writeTextFile(tempFile, htmlContent);
    return tempFile;
  }
  
  printViaBrowserDirect(htmlContent) {
    // Create a hidden iframe for printing to avoid popup blockers
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Wait for content to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Clean up after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        } catch (error) {
          console.error('[Export] Iframe print failed:', error);
          document.body.removeChild(iframe);
          
          // Final fallback: direct browser print
          this.showPrintInstructions();
        }
      }, 500);
    };
    
    console.log('[Export] Print iframe created and content loaded');
  }
  
  showPrintInstructions() {
    const message = `Print Setup Instructions:

1. Press Ctrl+P (or Cmd+P on Mac) to open the print dialog
2. Select "Save as PDF" or your preferred printer
3. Adjust print settings as needed

Current mode: ${this.currentMode}
• Code mode: Prints the markdown source code
• Preview mode: Prints the rendered markdown
• Split mode: Prints the rendered markdown

Tip: You can also use HTML Export and then print from your browser.`;
    
    alert(message);
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
      console.log('[Syntax] Applying highlight.js highlighting');
      this.preview.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    } else {
      console.warn('[Syntax] highlight.js not loaded');
    }
  }

  async processImages() {
    console.log('[Images] Processing images for local file conversion...');
    
    const images = this.preview.querySelectorAll('img.markdown-image');
    console.log(`[Images] Found ${images.length} images to process`);
    
    for (const img of images) {
      const originalSrc = img.getAttribute('data-original-src');
      
      if (!originalSrc) {
        console.log(`[Images] Skipping image - no data-original-src attribute`);
        continue;
      }
      
      console.log(`[Images] Processing image: "${originalSrc}"`);
      
      // Check if the attribute contains the object string issue
      if (originalSrc === '[object Object]') {
        console.error(`[Images] Found [object Object] in data-original-src attribute!`);
        img.classList.add('image-error');
        img.title = 'Image path error: [object Object] detected';
        continue;
      }
      
      try {
        // Check if it's a local file path (not a URL)
        if (!originalSrc.startsWith('http://') && !originalSrc.startsWith('https://') && !originalSrc.startsWith('data:')) {
          console.log(`[Images] Converting local path: "${originalSrc}"`);
          
          if (window.__TAURI__) {
            try {
              const dataUrl = await window.__TAURI__.core.invoke('convert_local_image_path', { filePath: originalSrc });
              console.log(`[Images] Successfully converted to data URL`);
              img.src = dataUrl;
              img.classList.add('local-image');
            } catch (error) {
              console.warn(`[Images] Failed to convert local path "${originalSrc}":`, error);
              
              // Keep original src and add error class
              img.classList.add('image-error');
              const errorMessage = typeof error === 'string' ? error : (error.message || error.toString() || 'Unknown error');
              img.title = `Image error: ${errorMessage}`;
            }
          } else {
            console.warn('[Images] Tauri not available, cannot convert local paths');
            img.classList.add('image-error');
            img.title = `Local image requires Tauri: ${originalSrc}`;
          }
        } else {
          console.log(`[Images] Remote image, no conversion needed: ${originalSrc}`);
          img.classList.add('remote-image');
        }
      } catch (error) {
        console.error(`[Images] Error processing image ${originalSrc}:`, error);
        img.classList.add('image-error');
        img.title = `Error loading image: ${error.message}`;
      }
    }
    
    console.log('[Images] Image processing completed');
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    
    // Update Monaco theme
    if (this.isMonacoLoaded && this.monacoEditor) {
      monaco.editor.setTheme(this.theme === 'dark' ? 'vs-dark' : 'vs');
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
    
    console.log(`[Theme] Switched to ${this.theme} theme`);
  }
  
  checkExportLibraries() {
    console.log('[Libraries] Checking export libraries availability...');
    console.log('[Libraries] html2canvas:', typeof html2canvas !== 'undefined' ? 'loaded' : 'not loaded');
    console.log('[Libraries] window.html2canvas:', typeof window.html2canvas !== 'undefined' ? 'loaded' : 'not loaded');
    console.log('[Libraries] jsPDF:', typeof jsPDF !== 'undefined' ? 'loaded' : 'not loaded');
    console.log('[Libraries] window.jspdf:', typeof window.jspdf !== 'undefined' ? 'loaded' : 'not loaded');
    
    // Wait a bit for libraries to fully initialize
    setTimeout(() => {
      console.log('[Libraries] Delayed check:');
      console.log('[Libraries] html2canvas:', typeof html2canvas !== 'undefined' ? 'loaded' : 'not loaded');
      console.log('[Libraries] jsPDF:', typeof jsPDF !== 'undefined' ? 'loaded' : 'not loaded');
    }, 2000);
  }

  async checkStartupFile() {
    try {
      if (window.__TAURI__) {
        const startupFile = await window.__TAURI__.core.invoke('get_startup_file');
        console.log('[Startup] Startup file:', startupFile);
        
        if (startupFile) {
          const content = await window.__TAURI__.core.invoke('open_file_direct', { filePath: startupFile });
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
          await window.__TAURI__.core.invoke('clear_startup_file');
          return;
        }
      }
    } catch (error) {
      console.error('[Startup] Error:', error);
      this.handleError(error, 'File Association');
    }
    
    // Only show welcome page if no startup file
    this.showWelcomePage();
  }

  async openSpecificFile(filePath) {
    try {
      if (!filePath || !window.__TAURI__) return;
      
      console.log('[File] Opening:', filePath);
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
      
      console.log('[File] Opened successfully');
    } catch (error) {
      console.error('[File] Error:', error.message);
      this.handleError(new Error(`Failed to open file: ${error.message}`), 'File Association');
    }
  }

  async quitApplication() {
    console.log('[App] Quit application requested');
    if (this.isDirty) {
      const shouldSave = await window.__TAURI__.dialog.confirm(
        'You have unsaved changes. Do you want to save before quitting?',
        { title: 'Unsaved Changes' }
      );
      
      if (shouldSave) {
        try {
          await this.saveFile();
        } catch (error) {
          console.error('[App] Error saving before quit:', error);
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
    
    if (window.__TAURI__?.window) {
      const { getCurrentWindow } = window.__TAURI__.window;
      const appWindow = getCurrentWindow();
      await appWindow.close();
    }
  }

  showSettings() {
    this.showEnhancedSettings();
  }

  showEnhancedSettings() {
    console.log('[Settings] Enhanced settings modal requested');
    this.updateSettingsDisplay();
    this.settingsModal.style.display = 'flex';
  }

  hideEnhancedSettings() {
    this.settingsModal.style.display = 'none';
  }

  showAbout() {
    console.log('[About] About modal requested');
    this.aboutModal.style.display = 'flex';
  }

  hideAbout() {
    this.aboutModal.style.display = 'none';
  }

  showSplashScreen() {
    if (!this.splashScreen) return;
    
    console.log('[Splash] Showing splash screen');
    this.splashScreen.style.display = 'flex';
    
    // Hide splash screen after 2.5 seconds
    setTimeout(() => {
      this.hideSplashScreen();
    }, 2500);
  }

  hideSplashScreen() {
    if (!this.splashScreen) return;
    
    console.log('[Splash] Hiding splash screen');
    this.splashScreen.classList.add('fade-out');
    
    // Remove from DOM after fade animation
    setTimeout(() => {
      this.splashScreen.style.display = 'none';
      this.splashScreen.classList.remove('fade-out');
    }, 500);
  }





  updateSettingsDisplay() {
    // Update theme buttons
    document.getElementById('theme-light-btn').classList.toggle('active', this.theme === 'light');
    document.getElementById('theme-dark-btn').classList.toggle('active', this.theme === 'dark');
    
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
    document.getElementById('page-legal-btn').classList.toggle('active', this.currentPageSize === 'legal');
    
    // Update toolbar buttons
    document.getElementById('toolbar-on-btn').classList.toggle('active', this.isToolbarEnabled);
    document.getElementById('toolbar-off-btn').classList.toggle('active', !this.isToolbarEnabled);
    
    // Update splash screen buttons
    document.getElementById('splash-on-btn').classList.toggle('active', this.isSplashEnabled);
    document.getElementById('splash-off-btn').classList.toggle('active', !this.isSplashEnabled);
    
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
      this.updateSettingsDisplay();
    });
    document.getElementById('theme-dark-btn').addEventListener('click', () => {
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
      this.updateSettingsDisplay();
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
    document.getElementById('page-legal-btn').addEventListener('click', () => {
      this.setPageSize('legal');
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
  }

  showLegacySettings() {
    console.log('[Settings] Legacy settings dialog requested');
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
    const choice = prompt(`${settingsText}\n\nWhat would you like to change?\n\n1 - Theme\n2 - Default Mode\n3 - Text Suggestions\n4 - Centered Layout\n5 - Page Size\n6 - Page Margins\n7 - Clear Error Logs\n8 - Performance Report\n\nEnter 1-8:`);
    
    switch (choice) {
      case '1':
        this.changeDefaultTheme();
        break;
      case '2':
        this.changeDefaultMode();
        break;
      case '3':
        this.changeTextSuggestions();
        break;
      case '4':
        this.changeCenteredLayout();
        break;
      case '5':
        this.changePageSize();
        break;
      case '6':
        this.changePageMargins();
        break;
      case '7':
        this.clearErrorLogs();
        alert('Error logs cleared successfully.');
        break;
      case '8':
        this.showPerformanceReport();
        break;
      default:
        if (choice !== null) {
          alert('Invalid choice. Please enter 1-8.');
        }
        break;
    }
  }

  showPerformanceReport() {
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
    
    alert(report.join('\n'));
  }
  
  changeDefaultTheme() {
    const newTheme = prompt(`Current theme: ${this.theme}\n\nEnter new default theme (light/dark):`, this.theme);
    
    if (newTheme && ['light', 'dark'].includes(newTheme.toLowerCase())) {
      const themeValue = newTheme.toLowerCase();
      localStorage.setItem('markdownViewer_defaultTheme', themeValue);
      
      // Apply theme immediately
      if (this.theme !== themeValue) {
        this.toggleTheme();
      }
      
      console.log(`[Settings] Default theme changed to: ${themeValue}`);
      alert(`Default theme changed to: ${themeValue}`);
    } else if (newTheme !== null) {
      alert('Invalid theme. Please enter "light" or "dark".');
    }
  }
  
  changeDefaultMode() {
    const newMode = prompt(`Current default mode: ${this.defaultMode}\n\nEnter new default mode (code/preview/split):`, this.defaultMode);
    
    if (newMode && ['code', 'preview', 'split'].includes(newMode.toLowerCase())) {
      this.defaultMode = newMode.toLowerCase();
      localStorage.setItem('markdownViewer_defaultMode', this.defaultMode);
      console.log(`[Settings] Default mode changed to: ${this.defaultMode}`);
      alert(`Default mode changed to: ${this.defaultMode}`);
    } else if (newMode !== null) {
      alert('Invalid mode. Please enter "code", "preview", or "split".');
    }
  }
  
  changeTextSuggestions() {
    const newSuggestions = prompt(`Current text suggestions: ${this.suggestionsEnabled ? 'Enabled' : 'Disabled'}\n\nEnable text suggestions? (true/false):`, this.suggestionsEnabled.toString());
    
    if (newSuggestions !== null) {
      const enabled = newSuggestions.toLowerCase() === 'true';
      this.suggestionsEnabled = enabled;
      localStorage.setItem('markdownViewer_suggestionsEnabled', enabled.toString());
      
      // Apply setting immediately if Monaco is loaded
      if (this.isMonacoLoaded && this.monacoEditor) {
        this.monacoEditor.updateOptions({
          suggest: {
            showKeywords: enabled,
            showSnippets: enabled,
            showWords: enabled
          },
          quickSuggestions: enabled
        });
      }
      
      console.log(`[Settings] Text suggestions changed to: ${enabled}`);
      alert(`Text suggestions ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  changeCenteredLayout() {
    const newLayout = prompt(`Current centered layout: ${this.centeredLayoutEnabled ? 'Enabled' : 'Disabled'}\n\nEnable centered layout? (true/false):`, this.centeredLayoutEnabled.toString());
    
    if (newLayout !== null) {
      const enabled = newLayout.toLowerCase() === 'true';
      this.centeredLayoutEnabled = enabled;
      localStorage.setItem('markdownViewer_centeredLayout', enabled.toString());
      this.applyCenteredLayout();
      
      console.log(`[Settings] Centered layout changed to: ${enabled}`);
      alert(`Centered layout ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  changePageSize() {
    const newSize = prompt(`Current page size: ${this.currentPageSize.toUpperCase()}\n\nEnter new page size (a4/letter/legal):`, this.currentPageSize);
    
    if (newSize && ['a4', 'letter', 'legal'].includes(newSize.toLowerCase())) {
      this.setPageSize(newSize.toLowerCase());
      alert(`Page size changed to: ${newSize.toUpperCase()}`);
    } else if (newSize !== null) {
      alert('Invalid page size. Please enter "a4", "letter", or "legal".');
    }
  }

  changePageMargins() {
    const currentMargins = `Top: ${this.pageMargins.top}, Bottom: ${this.pageMargins.bottom}, Left: ${this.pageMargins.left}, Right: ${this.pageMargins.right}`;
    const marginChoice = prompt(`Current margins: ${currentMargins}\n\nWhich margin to change?\n\n1 - Top\n2 - Bottom\n3 - Left\n4 - Right\n5 - All margins\n\nEnter 1-5:`);
    
    switch (marginChoice) {
      case '1':
        this.changeSpecificMargin('top');
        break;
      case '2':
        this.changeSpecificMargin('bottom');
        break;
      case '3':
        this.changeSpecificMargin('left');
        break;
      case '4':
        this.changeSpecificMargin('right');
        break;
      case '5':
        this.changeAllMargins();
        break;
      default:
        if (marginChoice !== null) {
          alert('Invalid choice. Please enter 1-5.');
        }
        break;
    }
  }

  changeSpecificMargin(side) {
    const currentValue = this.pageMargins[side];
    const newValue = prompt(`Current ${side} margin: ${currentValue}\n\nEnter new ${side} margin (e.g., 1in, 2.5cm, 72pt):`, currentValue);
    
    if (newValue !== null && newValue.trim()) {
      const margins = {};
      margins[side] = newValue.trim();
      this.setPageMargins(margins);
      alert(`${side.charAt(0).toUpperCase() + side.slice(1)} margin changed to: ${newValue}`);
    }
  }

  changeAllMargins() {
    const newMargin = prompt(`Enter margin for all sides (e.g., 1in, 2.5cm, 72pt):`, this.pageMargins.top);
    
    if (newMargin !== null && newMargin.trim()) {
      const margins = {
        top: newMargin.trim(),
        bottom: newMargin.trim(),
        left: newMargin.trim(),
        right: newMargin.trim()
      };
      this.setPageMargins(margins);
      alert(`All margins changed to: ${newMargin}`);
    }
  }

  showHelp() {
    console.log('[Help] Help modal requested');
    this.helpModal.style.display = 'flex';
  }

  hideHelp() {
    this.helpModal.style.display = 'none';
  }

  refreshPreview() {
    console.log('[Preview] Manual refresh requested');
    this.updatePreview();
  }

  toggleFullscreen() {
    console.log('[UI] Toggle fullscreen requested');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('[UI] Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('[UI] Error exiting fullscreen:', err);
      });
    }
  }

  toggleDistractionFree() {
    console.log('[UI] Toggle distraction-free mode requested');
    if (this.isDistractionFree) {
      this.exitDistractionFree();
    } else {
      this.enterDistractionFree();
    }
  }

  enterDistractionFree() {
    console.log('[UI] Entering distraction-free mode');
    this.isDistractionFree = true;
    document.body.classList.add('distraction-free');
    
    // Ensure current mode class is on body for CSS selectors
    document.body.classList.add(`${this.currentMode}-mode`);
    
    // Update button state
    this.distractionBtn.textContent = '■';
    
    // Update toolbar visibility
    this.updateToolbarVisibility();
    
    // Setup hover detection for exit hint
    this.setupDistractionFreeHover();
    
    console.log('[UI] Distraction-free mode activated - Press ESC or F11 to exit');
  }

  exitDistractionFree() {
    console.log('[UI] Exiting distraction-free mode');
    this.isDistractionFree = false;
    document.body.classList.remove('distraction-free');
    
    // Update button state
    this.distractionBtn.textContent = '☐';
    
    // Update toolbar visibility
    this.updateToolbarVisibility();
    
    // Remove hover detection
    this.removeDistractionFreeHover();
    
    console.log('[UI] Distraction-free mode deactivated');
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
    
    // Set new timeout for debounced update
    this.previewUpdateTimeout = setTimeout(() => {
      this.updatePreviewWithMetrics();
    }, 300); // 300ms debounce
  }

  updatePreviewWithMetrics() {
    const startTime = performance.now();
    
    this.updatePreview().then(() => {
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Update performance metrics
      this.performanceMetrics.updateCount++;
      this.performanceMetrics.lastUpdateTime = updateTime;
      this.performanceMetrics.averageUpdateTime = 
        (this.performanceMetrics.averageUpdateTime * (this.performanceMetrics.updateCount - 1) + updateTime) / 
        this.performanceMetrics.updateCount;
      
      // Log performance if update takes too long
      if (updateTime > 1000) {
        console.warn(`[Performance] Slow preview update: ${updateTime.toFixed(2)}ms`);
      }
    }).catch(error => {
      console.error('[Performance] Preview update error:', error);
    });
  }

  getPerformanceStats() {
    return {
      ...this.performanceMetrics,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
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

  benchmarkOperation(operation, startTime) {
    const duration = performance.now() - startTime;
    console.log(`[Benchmark] ${operation}: ${duration.toFixed(2)}ms`);
    
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
    console.log('[Performance] Starting memory optimization...');
    
    // Clear any cached data that's no longer needed
    if (this.taskListStates.size > 100) {
      this.taskListStates.clear();
      console.log('[Performance] Cleared task list states cache');
    }
    
    // Clear old error logs
    const errors = this.getErrorLogs();
    if (errors.length > 10) {
      this.clearErrorLogs();
      console.log('[Performance] Cleared old error logs');
    }
    
    // Clear performance metrics if too many
    if (this.performanceMetrics.updateCount > 1000) {
      this.performanceMetrics.updateCount = 0;
      this.performanceMetrics.averageUpdateTime = 0;
      console.log('[Performance] Reset performance metrics');
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
      console.log('[Performance] Forced garbage collection');
    }
    
    console.log('[Performance] Memory optimization completed');
  }

  // Auto-optimize memory periodically
  startMemoryOptimization() {
    setInterval(() => {
      this.optimizeMemory();
    }, 300000); // Every 5 minutes
  }

  async setupTauriDragDrop() {
    if (!window.__TAURI__?.event) {
      console.log('[TauriDrop] Tauri not available');
      return;
    }
    
    try {
      // Listen for the correct native drag-drop event
      await window.__TAURI__.event.listen('tauri://drag-drop', async (event) => {
        console.log('[TauriDrop] Native drag-drop event:', event.payload);
        const filePaths = event.payload.paths; // Extract paths from payload
        console.log('[TauriDrop] Native drag-drop with absolute paths:', filePaths);
        
        // Welcome screen: open .md files
        if (this.welcomePage && this.welcomePage.style.display !== 'none') {
          const mdFile = filePaths.find(f => /\.(md|markdown|txt)$/i.test(f));
          if (mdFile) {
            await this.openSpecificFile(mdFile); // This will add to history
          }
          return;
        }
        
        // Code mode: insert absolute file paths (Tauri provides full paths)
        if (this.currentMode === 'code') {
          if (this.isMonacoLoaded && this.monacoEditor) {
            const insertText = filePaths.join('\n');
            const position = this.monacoEditor.getPosition();
            
            this.monacoEditor.executeEdits('drop', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: insertText
            }]);
            
            this.markDirty();
            console.log('[TauriDrop] Inserted absolute paths:', filePaths);
          } else {
            // Fallback to textarea
            const insertText = filePaths.join('\n');
            const cursorPos = this.editor.selectionStart;
            const textBefore = this.editor.value.substring(0, cursorPos);
            const textAfter = this.editor.value.substring(cursorPos);
            this.editor.value = textBefore + insertText + textAfter;
            this.editor.selectionStart = this.editor.selectionEnd = cursorPos + insertText.length;
            this.markDirty();
            console.log('[TauriDrop] Inserted absolute paths:', filePaths);
          }
        }
      });
      
      console.log('[TauriDrop] Native drag-drop listeners registered (active with dragDropEnabled: true)');
    } catch (error) {
      console.error('[TauriDrop] Error:', error);
    }
  }

  handleError(error, context = 'Unknown', showUser = true) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      appState: {
        currentFile: this.currentFile,
        isDirty: this.isDirty,
        currentMode: this.currentMode,
        theme: this.theme
      }
    };
    
    console.error(`[Error] ${context}:`, errorInfo);
    
    if (showUser) {
      const userMessage = this.getUserFriendlyErrorMessage(error, context);
      this.showErrorDialog(userMessage, error, context);
    }
    
    this.logError(errorInfo);
    this.attemptErrorRecovery(error, context);
  }

  showErrorDialog(message, error, context) {
    // Enhanced error dialog with recovery options
    const recoveryOptions = this.getRecoveryOptions(error, context);
    const fullMessage = `${message}\n\n${recoveryOptions}`;
    
    if (window.__TAURI__) {
      window.__TAURI__.dialog.message(fullMessage, { title: 'Error', type: 'error' })
        .catch(() => alert(fullMessage));
    } else {
      alert(fullMessage);
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
    console.log(`[Recovery] Attempting recovery for ${context}`);
    
    // Automatic recovery strategies
    switch (context) {
      case 'Preview Update':
        // Clear preview and try basic markdown rendering
        setTimeout(() => {
          try {
            this.preview.innerHTML = '<p>Preview temporarily unavailable. Try refreshing (F5).</p>';
          } catch (e) {
            console.error('[Recovery] Preview recovery failed:', e);
          }
        }, 1000);
        break;
        
      case 'Advanced Features':
        // Disable advanced features temporarily
        this.mermaidInitialized = false;
        this.katexInitialized = false;
        console.log('[Recovery] Advanced features disabled temporarily');
        break;
        
      case 'Monaco Editor':
        // Fall back to textarea editor
        if (this.editor) {
          this.editor.style.display = 'block';
          this.monacoContainer.style.display = 'none';
          this.isMonacoLoaded = false;
          console.log('[Recovery] Fell back to textarea editor');
        }
        break;
    }
  }

  getUserFriendlyErrorMessage(error, context) {
    const baseMessage = `An error occurred in ${context}.`;
    const errorMessage = error?.message || 'Unknown error';
    
    // Provide specific guidance based on error type
    if (errorMessage.includes('Tauri API not available')) {
      return `${baseMessage}\n\nThe application is not running in the proper environment. Please restart the application.`;
    }
    
    if (errorMessage.includes('Permission denied')) {
      return `${baseMessage}\n\nPermission denied. Please check file permissions and try again.`;
    }
    
    if (errorMessage.includes('Network')) {
      return `${baseMessage}\n\nNetwork error. Please check your internet connection and try again.`;
    }
    
    if (errorMessage.includes('library not loaded')) {
      return `${baseMessage}\n\nRequired libraries failed to load. Please refresh the page and try again.`;
    }
    
    // Generic error message with helpful suggestions
    return `${baseMessage}\n\nError: ${errorMessage}\n\nSuggestions:\n• Try refreshing the page\n• Check your internet connection\n• Restart the application\n• Contact support if the problem persists`;
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
      console.log('[Error] Error logs cleared');
    } catch (e) {
      console.warn('[Error] Could not clear error logs:', e);
    }
  }
  
  applyDefaultTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    console.log(`[Theme] Applied default theme: ${this.theme}`);
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
    
    console.log(`[Layout] Applied centered layout: ${this.centeredLayoutEnabled ? 'enabled' : 'disabled'}`);
  }

  updatePageLayout() {
    const root = document.documentElement;
    
    // Set page width based on current page size
    const pageWidths = {
      'a4': 'var(--page-width-a4)',
      'letter': 'var(--page-width-letter)',
      'legal': 'var(--page-width-legal)'
    };
    
    root.style.setProperty('--current-page-width', pageWidths[this.currentPageSize] || pageWidths['a4']);
    
    // Set margins
    root.style.setProperty('--page-margin-top', this.pageMargins.top);
    root.style.setProperty('--page-margin-bottom', this.pageMargins.bottom);
    root.style.setProperty('--page-margin-left', this.pageMargins.left);
    root.style.setProperty('--page-margin-right', this.pageMargins.right);
    
    console.log(`[Layout] Updated page layout: ${this.currentPageSize}, margins: ${JSON.stringify(this.pageMargins)}`);
  }

  toggleCenteredLayout() {
    this.centeredLayoutEnabled = !this.centeredLayoutEnabled;
    localStorage.setItem('markdownViewer_centeredLayout', this.centeredLayoutEnabled.toString());
    this.applyCenteredLayout();
    
    console.log(`[Layout] Toggled centered layout: ${this.centeredLayoutEnabled ? 'enabled' : 'disabled'}`);
  }

  setPageSize(size) {
    if (['a4', 'letter', 'legal'].includes(size)) {
      this.currentPageSize = size;
      localStorage.setItem('markdownViewer_pageSize', size);
      this.updatePageLayout();
      console.log(`[Layout] Changed page size to: ${size}`);
    }
  }

  setPageMargins(margins) {
    this.pageMargins = { ...this.pageMargins, ...margins };
    
    // Save to localStorage
    Object.keys(margins).forEach(key => {
      localStorage.setItem(`markdownViewer_margin${key.charAt(0).toUpperCase() + key.slice(1)}`, margins[key]);
    });
    
    this.updatePageLayout();
    console.log(`[Layout] Updated margins:`, margins);
  }

  addToFileHistory(filePath) {
    if (!filePath) return;
    
    // Remove if already exists
    this.fileHistory = this.fileHistory.filter(item => item.path !== filePath);
    
    // Add to beginning
    this.fileHistory.unshift({
      path: filePath,
      name: filePath.split(/[\\\/]/).pop(),
      date: new Date().toISOString()
    });
    
    // Keep only last 3
    this.fileHistory = this.fileHistory.slice(0, 3);
    
    // Save to localStorage
    localStorage.setItem('markdownViewer_fileHistory', JSON.stringify(this.fileHistory));
    
    // Update display
    this.updateFileHistoryDisplay();
    
    console.log('[History] Added file to history:', filePath);
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
    
    console.log('[History] Updated file history display');
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
    console.log('[History] File history cleared');
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
    console.log('[Toolbar] Initializing markdown toolbar...');
    
    if (!this.markdownToolbar) {
      console.warn('[Toolbar] Toolbar elements not found');
      return;
    }
    
    // Update toolbar visibility based on current mode and setting
    this.updateToolbarVisibility();
    
    console.log('[Toolbar] Markdown toolbar initialized');
  }

  setupMarkdownToolbarEvents() {
    if (!this.markdownToolbar) return;
    
    // Markdown formatting buttons
    const mdButtons = this.markdownToolbar.querySelectorAll('.md-btn');
    mdButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
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
        }
      });
    });
    
    console.log(`[Toolbar] Event listeners set up for ${mdButtons.length} buttons`);
  }



  updateToolbarVisibility() {
    if (!this.markdownToolbar) return;
    
    // Show only in code mode, not in distraction-free mode, and when enabled
    const shouldShow = this.currentMode === 'code' && !this.isDistractionFree && this.isToolbarEnabled;
    
    if (shouldShow) {
      this.markdownToolbar.classList.add('visible');
    } else {
      this.markdownToolbar.classList.remove('visible');
    }
    
    console.log(`[Toolbar] Visibility updated: ${shouldShow ? 'visible' : 'hidden'}`);
  }

  toggleMarkdownToolbar() {
    this.isToolbarEnabled = !this.isToolbarEnabled;
    localStorage.setItem('markdownViewer_toolbarEnabled', this.isToolbarEnabled.toString());
    this.updateToolbarVisibility();
    console.log(`[Toolbar] Toolbar ${this.isToolbarEnabled ? 'enabled' : 'disabled'}`);
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
      default:
        console.warn(`[Toolbar] Unknown action: ${action}`);
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
    
    // Simple selection preservation - select the new text
    setTimeout(() => {
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
    }, 10);
    
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

// Phase 4 Complete Implementation with OS Integration
console.log('[Phase4] Phase 4 complete with OS integration and performance optimization');

// Initialize the app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('[App] DOM loaded, initializing Phase 3 Markdown Viewer...');
  new MarkdownViewer();
});