// Phase 2: Enhanced Editor with Monaco Integration - FIXED
console.log('Phase 2: Enhanced Editor Loading...');

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
    
    console.log('[MarkdownViewer] Phase 2 Constructor started');
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
    console.log('[MarkdownViewer] Phase 2 Constructor completed');
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

  updatePreview() {
    const markdown = this.getEditorContent() || '# Welcome to Markdown Viewer\n\nStart typing your markdown here...';
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      this.preview.innerHTML = marked.parse(markdown);
    } else {
      console.error('[Preview] marked.js not loaded');
      this.preview.innerHTML = '<p>Markdown parser not loaded</p>';
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

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    
    // Update Monaco theme
    if (this.isMonacoLoaded && this.monacoEditor) {
      monaco.editor.setTheme(this.theme === 'dark' ? 'vs-dark' : 'vs');
    }
    
    console.log(`[Theme] Switched to ${this.theme} theme`);
  }
}

// Initialize the app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('[App] DOM loaded, initializing Phase 2 Markdown Viewer...');
  new MarkdownViewer();
});