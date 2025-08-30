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
    this.updatePreview();
    this.updateCursorPosition();
    this.initializeAdvancedFeatures();
    console.log('[MarkdownViewer] Phase 3 Constructor completed');
  }

  initializeElements() {
    this.editor = document.getElementById('editor');
    this.monacoContainer = document.getElementById('monaco-editor');
    this.preview = document.getElementById('preview');
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
  }

  async initializeAdvancedFeatures() {
    try {
      console.log('[Advanced] Initializing advanced features...');
      
      // Wait a bit for libraries to load
      setTimeout(() => {
        // Initialize Mermaid
        const mermaidLib = window.mermaid || (typeof mermaid !== 'undefined' ? mermaid : undefined);
        if (mermaidLib) {
          mermaidLib.initialize({
            startOnLoad: false,
            theme: this.theme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit'
          });
          this.mermaidInitialized = true;
          console.log('[Mermaid] Initialized successfully');
        } else {
          console.warn('[Mermaid] Mermaid library not loaded');
          console.log('[Mermaid] Checking window object:', Object.keys(window).filter(k => k.toLowerCase().includes('mermaid')));
        }
        
        // KaTeX is ready to use when loaded
        const katexLib = window.katex || (typeof katex !== 'undefined' ? katex : undefined);
        if (katexLib) {
          this.katexInitialized = true;
          console.log('[KaTeX] Ready for math rendering');
        } else {
          console.warn('[KaTeX] KaTeX library not loaded');
          console.log('[KaTeX] Checking window object:', Object.keys(window).filter(k => k.toLowerCase().includes('katex')));
        }
        
        // Update preview after libraries are initialized
        this.updatePreview();
      }, 500);
      
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
    });

    // Cursor position change events
    this.monacoEditor.onDidChangeCursorPosition(() => {
      this.updateCursorPosition();
    });

    // Scroll synchronization
    this.monacoEditor.onDidScrollChange((e) => {
      if (this.currentMode === 'split') {
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
        const save = await window.__TAURI__.dialog.confirm(
          'You have unsaved changes. Do you want to save before closing?',
          { title: 'Unsaved Changes' }
        );
        console.log('[Close] User chose to save:', save);
        if (save) {
          await this.saveFile();
          this.doClose();
        } else {
          this.doClose();
        }
      } catch (error) {
        console.error('[Close] Error showing confirm dialog:', error);
        this.doClose();
      }
    } else {
      console.log('[Close] No unsaved changes, closing directly');
      this.doClose();
    }
  }

  doClose() {
    this.currentFile = null;
    const defaultContent = '# Welcome to Markdown Viewer\n\nStart typing your markdown here...';
    this.isLoadingFile = true;
    this.setEditorContent(defaultContent);
    this.isLoadingFile = false;
    this.updatePreview();
    this.updateFilename();
    this.isDirty = false;
    this.saveBtn.classList.remove('dirty');
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
      
      // Configure marked with basic settings first
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
      if (this.currentMode === 'split' && !this.isScrollSyncing) {
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
    console.log('[Math] Processing math expressions with simple styling...');
    
    // Simple math styling without external libraries
    // Process display math: $$...$$
    markdown = markdown.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
      return `<div class="math-display"><code>${math.trim()}</code></div>`;
    });
    
    // Process inline math: $...$
    markdown = markdown.replace(/\$([^$\n]+)\$/g, (match, math) => {
      return `<span class="math-inline"><code>${math.trim()}</code></span>`;
    });
    
    return markdown;
  }
  
  processMermaidInHtml(html) {
    console.log('[Mermaid] Processing Mermaid code blocks with simple placeholders...');
    
    // Replace mermaid code blocks with simple placeholders
    html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
      const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      return `<div class="mermaid-placeholder">
        <div class="placeholder-header">📊 Mermaid Diagram</div>
        <pre class="diagram-code">${decodedCode}</pre>
        <div class="placeholder-note">Diagram rendering will be implemented in a future update</div>
      </div>`;
    });
    
    return html;
  }
  
  processTaskListsInHtml(html) {
    console.log('[TaskList] Processing task lists...');
    
    // Convert task list items
    html = html.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/g, (match, checked, content) => {
      const isChecked = checked === 'x';
      const id = 'task-' + Math.random().toString(36).substr(2, 9);
      console.log('[TaskList] Found task:', { checked: isChecked, content: content.substring(0, 30) });
      return `<li class="task-list-item"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''} onchange="window.markdownViewer.toggleTaskItem('${id}', this.checked)"> <label for="${id}">${content}</label></li>`;
    });
    
    return html;
  }
  
  async renderMermaidDiagrams() {
    console.log('[Mermaid] Mermaid placeholders already rendered');
    // Placeholders are already in place, no additional rendering needed
  }
  
  setupTaskListInteractions() {
    // Make window.markdownViewer available for task list callbacks
    window.markdownViewer = this;
  }
  
  toggleTaskItem(taskId, checked) {
    console.log(`[TaskList] Task ${taskId} ${checked ? 'checked' : 'unchecked'}`);
    // Store task state for persistence
    this.taskListStates.set(taskId, checked);
    // Mark document as dirty since task state changed
    this.markDirty();
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
      console.log('[Export] Exporting to PDF...');
      
      if (typeof html2canvas === 'undefined' || typeof jsPDF === 'undefined') {
        throw new Error('PDF export libraries not loaded');
      }
      
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
      
      // Convert to canvas
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      // Remove temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
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
        }
      }
      
    } catch (error) {
      console.error('[Export] Error exporting to PDF:', error);
      alert('Error exporting to PDF: ' + error.message);
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
    if (this.mermaidInitialized) {
      mermaid.initialize({
        theme: this.theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
      // Re-render all Mermaid diagrams with new theme
      this.renderMermaidDiagrams();
    }
    
    console.log(`[Theme] Switched to ${this.theme} theme`);
  }
}

// Simple Phase 3 implementation without external library conflicts
console.log('[Phase3] Implementing Phase 3 features without external libraries');

// Initialize the app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('[App] DOM loaded, initializing Phase 3 Markdown Viewer...');
  new MarkdownViewer();
});