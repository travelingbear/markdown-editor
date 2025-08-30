// Phase 3: Advanced Features - Mermaid, Math, Interactive Elements, Export
console.log('Phase 3: Advanced Features Loading...');

class MarkdownViewer {
  constructor() {
    this.currentFile = null;
    this.isDirty = false;
    this.theme = 'light';
    this.currentMode = 'preview';
    this.monacoEditor = null;
    this.isMonacoLoaded = false;
    this.isScrollSyncing = false;
    this.suggestionsEnabled = true;
    this.isLoadingFile = false;
    this.lastEditorScrollTop = 0;
    this.lastPreviewScrollTop = 0;
    this.lastPreviewMaxScroll = 0;
    this.lastEditorMaxScroll = 0;
    this.mermaidInitialized = false;
    this.katexInitialized = false;
    this.taskListStates = new Map();
    this.isTyping = false;
    this.typingTimeout = null;
    
    console.log('[MarkdownViewer] Phase 3 Constructor started');
    this.initializeElements();
    console.log('[MarkdownViewer] Elements initialized:', {
      openBtn: !!this.openBtn,
      saveBtn: !!this.saveBtn,
      closeBtn: !!this.closeBtn
    });
    this.setupEventListeners();
    this.initializeMonacoEditor();
    this.setMode('preview');
    this.showWelcomePage(); // Show welcome page initially
    this.updateCursorPosition();
    this.initializeAdvancedFeatures();
    this.checkExportLibraries();
    console.log('[MarkdownViewer] Phase 3 Constructor completed');
  }

  initializeElements() {
    this.editor = document.getElementById('editor');
    this.monacoContainer = document.getElementById('monaco-editor');
    this.preview = document.getElementById('preview');
    this.welcomePage = document.getElementById('welcome-page');
    this.newBtn = document.getElementById('new-btn');
    this.openBtn = document.getElementById('open-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.closeBtn = document.getElementById('close-btn');
    this.themeBtn = document.getElementById('theme-btn');
    this.codeBtn = document.getElementById('code-btn');
    this.previewBtn = document.getElementById('preview-btn');
    this.splitBtn = document.getElementById('split-btn');
    this.cursorPos = document.getElementById('cursor-pos');
    this.filename = document.getElementById('filename');
    this.mainContent = document.querySelector('.main-content');
    this.splitter = document.getElementById('splitter');
    this.exportHtmlBtn = document.getElementById('export-html-btn');
    this.exportPdfBtn = document.getElementById('export-pdf-btn');
    this.welcomeNewBtn = document.getElementById('welcome-new-btn');
    this.welcomeOpenBtn = document.getElementById('welcome-open-btn');
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
          value: '# Welcome to Markdown Viewer\n\nStart typing your markdown here...',
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
        
        // Initial preview update
        this.updatePreview();
        this.updateCursorPosition();
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

    // Content change events
    this.monacoEditor.onDidChangeModelContent(() => {
      this.updatePreview();
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
    this.saveBtn.addEventListener('click', () => {
      console.log('[Event] Save button clicked');
      this.saveFile();
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
    
    // Theme toggle
    this.themeBtn.addEventListener('click', () => this.toggleTheme());
    
    // Mode switching
    this.codeBtn.addEventListener('click', () => this.setMode('code'));
    this.previewBtn.addEventListener('click', () => this.setMode('preview'));
    this.splitBtn.addEventListener('click', () => this.setMode('split'));
    
    // Export functionality
    this.exportHtmlBtn.addEventListener('click', () => this.exportToHtml());
    this.exportPdfBtn.addEventListener('click', () => this.exportToPdf());
    
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
            if (e.ctrlKey && e.shiftKey) {
              e.preventDefault();
              this.toggleSuggestions();
            }
            break;
        }
      }
    });
    
    // Splitter functionality
    this.setupSplitter();
    
    // Scroll synchronization for preview
    this.setupScrollSync();
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
    try {
      console.log('[File] Opening file dialog...');
      console.log('[File] window.__TAURI__:', window.__TAURI__);
      
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available');
      }
      
      console.log('[File] dialog API:', window.__TAURI__.dialog);
      console.log('[File] fs API:', window.__TAURI__.fs);
      
      const selected = await window.__TAURI__.dialog.open({
        multiple: false,
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown', 'txt']
        }]
      });
      
      console.log('[File] Dialog result:', selected);
      
      if (selected) {
        console.log('[File] Reading file:', selected);
        const content = await window.__TAURI__.fs.readTextFile(selected);
        console.log('[File] File content length:', content.length);
        
        this.isLoadingFile = true;
        this.setEditorContent(content);
        this.isLoadingFile = false;
        this.showEditor();
        console.log('[File] Content set, updating preview with content length:', content.length);
        this.updatePreview();
        this.currentFile = selected;
        this.isDirty = false;
        this.updateFilename();
        
        console.log('[File] File opened successfully');
      } else {
        console.log('[File] No file selected');
      }
    } catch (error) {
      console.error('[File] Error opening file:', error);
      console.error('[File] Error stack:', error.stack);
      alert('Error opening file: ' + error.message);
    }
  }

  async saveFile() {
    try {
      console.log('[File] Save button clicked');
      const content = this.getEditorContent();
      console.log('[File] Content to save length:', content.length);
      
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available');
      }
      
      if (this.currentFile) {
        console.log('[File] Saving to existing file:', this.currentFile);
        await window.__TAURI__.fs.writeTextFile(this.currentFile, content);
        this.isDirty = false;
        this.saveBtn.classList.remove('dirty');
        this.updateFilename();
        console.log('[File] File saved successfully');
      } else {
        console.log('[File] Opening save dialog...');
        const filePath = await window.__TAURI__.dialog.save({
          filters: [{
            name: 'Markdown',
            extensions: ['md']
          }]
        });
        
        console.log('[File] Save dialog result:', filePath);
        
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
      }
    } catch (error) {
      console.error('[File] Error saving file:', error);
      console.error('[File] Error stack:', error.stack);
      alert('Error saving file: ' + error.message);
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
      console.error('[File] Error saving file as:', error);
      alert('Error saving file: ' + error.message);
    }
  }

  async closeFile() {
    console.log('[Close] isDirty:', this.isDirty);
    if (this.isDirty) {
      try {
        // Try ask dialog first, fallback to confirm if not available
        let result;
        try {
          result = await window.__TAURI__.dialog.ask(
            'You have unsaved changes. Do you want to save before closing?',
            { title: 'Unsaved Changes', type: 'warning' }
          );
        } catch (askError) {
          console.log('[Close] ask dialog not available, using confirm:', askError.message);
          result = await window.__TAURI__.dialog.confirm(
            'You have unsaved changes. Click OK to save and close, Cancel to close without saving.',
            { title: 'Unsaved Changes' }
          );
        }
        
        console.log('[Close] User choice:', result);
        if (result === true) {
          // Yes/OK - save and close
          try {
            await this.saveFile();
            this.doClose();
          } catch (error) {
            console.error('[Close] Error saving file:', error);
            // Don't close if save failed
          }
        } else if (result === false) {
          // No/Cancel - close without saving (for ask) or don't close (for confirm)
          this.doClose();
        }
        // Cancel (result === null) - do nothing
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
    this.isDirty = false;
    this.saveBtn.classList.remove('dirty');
    console.log('[File] New file created');
  }
  
  doClose() {
    this.currentFile = null;
    this.showWelcomePage();
    this.isDirty = false;
    this.saveBtn.classList.remove('dirty');
    console.log('[File] File closed, showing welcome page');
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
    const markdown = this.getEditorContent() || '# Welcome to Markdown Viewer\n\nStart typing your markdown here...';
    
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
      
      // Configure marked with basic settings
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
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
      
      // Apply syntax highlighting to code blocks
      this.applySyntaxHighlighting();
      
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

  markDirty() {
    if (!this.isDirty && !this.isLoadingFile) {
      this.isDirty = true;
      this.updateFilename();
      this.saveBtn.classList.add('dirty');
      console.log('[Dirty] Document marked as dirty');
    }
  }

  setMode(mode) {
    console.log(`[Mode] Switching to ${mode} mode`);
    
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
    this.currentMode = mode;
    
    // Trigger Monaco layout update and restore scroll positions
    if (this.isMonacoLoaded && this.monacoEditor) {
      setTimeout(() => {
        this.monacoEditor.layout();
        // Wait a bit more for layout to complete
        setTimeout(() => {
          this.restoreScrollPositions();
        }, 50);
      }, 100);
    } else {
      setTimeout(() => {
        this.restoreScrollPositions();
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
      const id = 'task-' + Math.random().toString(36).substr(2, 9);
      taskCount++;

      return `<div class="task-list-item dash-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${content.trim()}</label></div>`;
    });
    
    // Handle dash-prefixed task lists in li elements (markdown syntax)
    html = html.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/gs, (match, checked, content) => {
      const isChecked = checked === 'x';
      const id = 'task-' + Math.random().toString(36).substr(2, 9);
      taskCount++;

      return `<div class="task-list-item dash-task"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <label for="${id}">${content}</label></div>`;
    });
    
    // Handle standalone checkbox patterns in paragraphs
    html = html.replace(/<p>\[([ x])\]\s*([^<]*?)<\/p>/g, (match, checked, content) => {
      const isChecked = checked === 'x';
      const cleanContent = content.trim();
      const id = 'task-' + Math.random().toString(36).substr(2, 9);
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
    // PDF Export moved to dedicated phase due to library loading complexity
    alert('PDF Export is currently under development and will be available in a future update.\n\nFor now, you can use HTML Export and then print to PDF from your browser.');
    return;
    
    try {
      console.log('[Export] Exporting to PDF...');
      
      // Check for html2canvas with all possible locations
      let html2canvasLib;
      if (typeof window.html2canvas !== 'undefined') {
        html2canvasLib = window.html2canvas;
      } else if (typeof html2canvas !== 'undefined') {
        html2canvasLib = html2canvas;
      } else {
        throw new Error('html2canvas library not loaded. Please refresh the page and try again.');
      }
      
      // Check for jsPDF with all possible locations
      let jsPDFClass;
      if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFClass = window.jspdf.jsPDF;
      } else if (typeof jsPDF !== 'undefined') {
        jsPDFClass = jsPDF;
      } else if (window.jsPDF) {
        jsPDFClass = window.jsPDF;
      } else {
        throw new Error('jsPDF library not loaded properly. Please refresh the page and try again.');
      }
      
      console.log('[Export] Libraries found successfully');
      
      // Create a temporary container with the preview content
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 20px;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #24292f;
      `;
      tempContainer.innerHTML = this.preview.innerHTML;
      document.body.appendChild(tempContainer);
      
      console.log('[Export] Converting to canvas...');
      
      // Convert to canvas with error handling
      const canvas = await html2canvasLib(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      // Remove temporary container
      document.body.removeChild(tempContainer);
      
      console.log('[Export] Canvas created, generating PDF...');
      
      // Create PDF
      const pdf = new jsPDFClass('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      console.log('[Export] PDF generated, saving file...');
      
      // Save PDF file
      if (window.__TAURI__) {
        const filePath = await window.__TAURI__.dialog.save({
          filters: [{
            name: 'PDF',
            extensions: ['pdf']
          }]
        });
        
        if (filePath) {
          const pdfBlob = pdf.output('blob');
          const arrayBuffer = await pdfBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          await window.__TAURI__.fs.writeBinaryFile(filePath, uint8Array);
          console.log('[Export] PDF exported successfully to:', filePath);
          alert('PDF exported successfully!');
        }
      } else {
        // Fallback for non-Tauri environments
        pdf.save('markdown-export.pdf');
        console.log('[Export] PDF downloaded via browser');
      }
      
    } catch (error) {
      console.error('[Export] Error exporting to PDF:', error);
      console.error('[Export] Error stack:', error.stack);
      alert('Error exporting to PDF: ' + error.message + '\n\nPlease refresh the page and try again.');
    }
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
}

// Simple Phase 3 implementation without external library conflicts
console.log('[Phase3] Implementing Phase 3 features without external libraries');

// Initialize the app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('[App] DOM loaded, initializing Phase 3 Markdown Viewer...');
  new MarkdownViewer();
});