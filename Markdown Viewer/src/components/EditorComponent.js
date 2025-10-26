/**
 * Editor Component
 * Manages Monaco editor and fallback textarea
 */
class EditorComponent extends BaseComponent {
  constructor(options = {}) {
    super('EditorComponent', options);
    
    // Editor state
    this.monacoEditor = null;
    this.isMonacoLoaded = false;
    this.fallbackEditor = null;
    this.currentContent = '';
    
    // Settings
    this.fontSize = parseInt(localStorage.getItem('markdownViewer_fontSize') || '14');
    this.suggestionsEnabled = localStorage.getItem('markdownViewer_suggestionsEnabled') === 'true';
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
  }

  async onInit() {
    // Initialize DOM elements
    this.initializeElements();
    
    // Set up fallback editor first
    this.setupFallbackEditor();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply initial settings
    this.applySettings();
  }

  initializeElements() {
    this.monacoContainer = document.getElementById('monaco-editor');
    this.fallbackEditor = document.getElementById('editor');
    
    if (!this.monacoContainer || !this.fallbackEditor) {
      throw new Error('Editor elements not found');
    }
  }

  setupEventListeners() {
    // Listen for content changes from document component
    this.on('set-content', (data) => {
      this.setContent(data.content);
    });
    
    // Listen for settings changes
    this.on('theme-changed', (data) => {
      this.updateTheme(data.theme);
    });
    
    this.on('font-size-changed', (data) => {
      this.updateFontSize(data.fontSize);
    });
    
    this.on('suggestions-changed', (data) => {
      this.updateSuggestions(data.enabled);
    });
  }

  setupFallbackEditor() {
    // Set up fallback textarea editor
    this.fallbackEditor.addEventListener('input', () => {
      if (!this.isMonacoLoaded) {
        this.handleContentChange();
      }
    });
    
    this.fallbackEditor.addEventListener('keydown', (e) => {
      if (!this.isMonacoLoaded) {
        this.handleKeyDown(e);
      }
    });
    
    this.fallbackEditor.addEventListener('keyup', () => {
      if (!this.isMonacoLoaded) {
        this.updateCursorPosition();
      }
    });
    
    this.fallbackEditor.addEventListener('click', () => {
      if (!this.isMonacoLoaded) {
        this.updateCursorPosition();
      }
    });
  }

  /**
   * Load Monaco Editor lazily
   */
  async loadMonacoEditor() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.showMonaco();
      return;
    }
    
    if (window.monaco?.editor && !this.monacoEditor) {
      this.createMonacoInstance();
      return;
    }
    
    // Prevent duplicate loading
    if (window.MONACO_LOADING) {
      await window.MONACO_LOADING;
      if (window.monaco?.editor && !this.monacoEditor) {
        this.createMonacoInstance();
      }
      return;
    }
    
    if (!window.MONACO_SINGLETON) {
      window.MONACO_LOADING = this.loadMonacoSingleton();
      window.MONACO_SINGLETON = window.MONACO_LOADING;
    }
    
    try {
      await window.MONACO_SINGLETON;
      this.createMonacoInstance();
    } catch (error) {
      console.error('[Editor] Failed to load Monaco:', error);
      this.fallbackToTextarea();
      throw error;
    } finally {
      window.MONACO_LOADING = null;
    }
  }

  loadMonacoSingleton() {
    if (window.monaco?.editor) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
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
    if (!window.MONACO_CONFIGURED) {
      try {
        require.config({ 
          paths: { 
            'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
          },
          waitSeconds: 30,
          onError: (err) => reject(new Error('Monaco RequireJS error: ' + err.message))
        });
        window.MONACO_CONFIGURED = true;
      } catch (error) {
        reject(error);
        return;
      }
    }
    
    if (window.monaco?.editor) {
      resolve();
      return;
    }
    
    const timeout = setTimeout(() => {
      reject(new Error('Monaco loading timeout'));
    }, 15000);
    
    try {
      require(['vs/editor/editor.main'], () => {
        clearTimeout(timeout);
        if (window.monaco?.editor) {
          resolve();
        } else {
          reject(new Error('Monaco loaded but editor not available'));
        }
      }, (err) => {
        clearTimeout(timeout);
        reject(new Error('Monaco module loading failed: ' + err.message));
      });
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  }

  createMonacoInstance() {
    if (this.isMonacoLoaded || !window.monaco) return;
    
    try {
      // Get current theme from localStorage to ensure it's up to date
      const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
      this.theme = currentTheme;
      
      const editorOptions = {
        value: this.currentContent,
        language: 'markdown',
        theme: currentTheme === 'dark' ? 'vs-dark' : 'vs',
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
        quickSuggestions: this.suggestionsEnabled,
        find: {
          addExtraSpaceOnTop: false,
          autoFindInSelection: 'never',
          seedSearchStringFromSelection: 'always'
        },
        dragAndDrop: true
      };
      
      this.monacoEditor = monaco.editor.create(this.monacoContainer, editorOptions);
      this.isMonacoLoaded = true;

      this.setupMonacoEventListeners();
      this.showMonaco();
      
      this.emit('monaco-loaded');
      
    } catch (error) {
      console.error('[Editor] Failed to create Monaco instance:', error);
      this.fallbackToTextarea();
    }
  }

  setupMonacoEventListeners() {
    if (!this.monacoEditor) return;

    // Content change events
    this.monacoEditor.onDidChangeModelContent(() => {
      this.handleContentChange();
      this.updateCursorPosition();
    });

    // Cursor position change events
    this.monacoEditor.onDidChangeCursorPosition(() => {
      this.updateCursorPosition();
    });

    // Selection change events
    this.monacoEditor.onDidChangeCursorSelection((e) => {
      if (!e.selection.isEmpty()) {
        const selectedText = this.monacoEditor.getModel().getValueInRange(e.selection);
        this.emit('selection-changed', { 
          selection: e.selection, 
          text: selectedText 
        });
      }
    });

    // Focus events
    this.monacoEditor.onDidFocusEditorText(() => {
      this.emit('editor-focused');
    });

    // Add markdown shortcuts
    this.setupMarkdownShortcuts();
  }

  setupMarkdownShortcuts() {
    if (!this.monacoEditor) return;
    
    // Bold - Ctrl+B
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      this.emit('markdown-action', { action: 'bold' });
    });
    
    // Italic - Ctrl+I
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      this.emit('markdown-action', { action: 'italic' });
    });
    
    // Headers
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Digit1, () => {
      this.emit('markdown-action', { action: 'h1' });
    });
    
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Digit2, () => {
      this.emit('markdown-action', { action: 'h2' });
    });
    
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Digit3, () => {
      this.emit('markdown-action', { action: 'h3' });
    });
    
    // Enter key handling for list continuation
    this.monacoEditor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Enter) {
        if (this.handleEnterKey()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    

  }

  handleContentChange() {
    const newContent = this.getContent();
    if (this.currentContent !== newContent) {
      this.currentContent = newContent;
      this.emit('content-changed', { content: newContent });
    }
  }

  handleKeyDown(e) {
    // Handle special keys for fallback editor
    this.emit('key-down', { event: e });
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
      const textarea = this.fallbackEditor;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      const lines = text.substring(0, cursorPos).split('\n');
      line = lines.length;
      col = lines[lines.length - 1].length + 1;
    }
    
    this.emit('cursor-position-changed', { line, col });
  }

  /**
   * Get current content
   */
  getContent() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      return this.monacoEditor.getValue();
    }
    return this.fallbackEditor.value;
  }

  /**
   * Set content
   */
  setContent(content) {
    // Prevent unnecessary setValue calls that reset cursor position
    if (this.currentContent === content) {
      return;
    }
    
    this.currentContent = content;
    
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.setValue(content);
    } else {
      this.fallbackEditor.value = content;
    }
  }

  /**
   * Set Monaco model for tab (preserves undo/redo)
   */
  setMonacoModel(model, viewState = null) {
    if (this.isMonacoLoaded && this.monacoEditor && model) {
      this.monacoEditor.setModel(model);
      this.currentContent = model.getValue();
      
      // Restore view state if available
      if (viewState) {
        this.monacoEditor.restoreViewState(viewState);
      }
    }
  }

  /**
   * Show Monaco editor
   */
  showMonaco() {
    if (this.monacoContainer && this.fallbackEditor) {
      this.fallbackEditor.style.display = 'none';
      this.monacoContainer.style.display = 'block';
    }
  }

  /**
   * Fallback to textarea
   */
  fallbackToTextarea() {
    if (this.monacoContainer && this.fallbackEditor) {
      this.monacoContainer.style.display = 'none';
      this.fallbackEditor.style.display = 'block';
    }
    this.isMonacoLoaded = false;
  }

  /**
   * Update theme
   */
  updateTheme(theme) {
    this.theme = theme;
    
    if (this.isMonacoLoaded && this.monacoEditor) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }

  /**
   * Update font size
   */
  updateFontSize(fontSize) {
    this.fontSize = fontSize;
    
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.updateOptions({ fontSize: this.fontSize });
    }
    
    if (this.fallbackEditor) {
      this.fallbackEditor.style.fontSize = `${this.fontSize}px`;
    }
  }

  /**
   * Update suggestions
   */
  updateSuggestions(enabled) {
    this.suggestionsEnabled = enabled;
    
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
  }

  /**
   * Apply current settings
   */
  applySettings() {
    this.updateFontSize(this.fontSize);
    
    if (this.fallbackEditor) {
      this.fallbackEditor.style.fontSize = `${this.fontSize}px`;
    }
  }

  /**
   * Focus the editor
   */
  focus() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.focus();
    } else {
      this.fallbackEditor.focus();
    }
  }

  /**
   * Execute undo
   */
  undo() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.trigger('toolbar', 'undo', null);
    } else if (document.execCommand) {
      document.execCommand('undo');
    }
  }

  /**
   * Execute redo
   */
  redo() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.trigger('toolbar', 'redo', null);
    } else if (document.execCommand) {
      document.execCommand('redo');
    }
  }

  /**
   * Set cursor position
   */
  setCursorPosition(line, col) {
    if (this.isMonacoLoaded && this.monacoEditor) {
      this.monacoEditor.setPosition({ lineNumber: line, column: col });
      this.monacoEditor.revealPosition({ lineNumber: line, column: col });
    } else {
      // For fallback textarea, calculate position
      const textarea = this.fallbackEditor;
      const lines = textarea.value.split('\n');
      let position = 0;
      
      for (let i = 0; i < Math.min(line - 1, lines.length); i++) {
        position += lines[i].length + 1; // +1 for newline
      }
      
      position += Math.min(col - 1, lines[line - 1]?.length || 0);
      textarea.setSelectionRange(position, position);
    }
  }

  /**
   * Get cursor position
   */
  getCursorPosition() {
    if (this.isMonacoLoaded && this.monacoEditor) {
      const position = this.monacoEditor.getPosition();
      return position ? { line: position.lineNumber, col: position.column } : { line: 1, col: 1 };
    } else {
      const textarea = this.fallbackEditor;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      const lines = text.substring(0, cursorPos).split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      
      return { line, col };
    }
  }
  


  handleEnterKey() {
    if (!this.isMonacoLoaded || !this.monacoEditor) return false;
    
    const position = this.monacoEditor.getPosition();
    const model = this.monacoEditor.getModel();
    const currentLine = model.getLineContent(position.lineNumber);
    
    // Check for list patterns
    const ulMatch = currentLine.match(/^(\s*)- (.*)$/);
    const olMatch = currentLine.match(/^(\s*)(\d+)\. (.*)$/);
    const taskMatch = currentLine.match(/^(\s*)- \[([ x])\] (.*)$/);
    
    if (ulMatch) {
      const [, indent, content] = ulMatch;
      if (content.trim() === '') {
        // Empty list item, replace with empty line
        this.monacoEditor.executeEdits('list-exit', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLine.length + 1),
          text: ''
        }]);
        // Position cursor at start of line and let Monaco handle Enter
        this.monacoEditor.setPosition({ lineNumber: position.lineNumber, column: 1 });
        return false;
      } else {
        // Continue list
        this.monacoEditor.executeEdits('list-continue', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: `\n${indent}- `
        }]);
        return true;
      }
    }
    
    if (olMatch) {
      const [, indent, num, content] = olMatch;
      if (content.trim() === '') {
        // Empty list item, replace with empty line
        this.monacoEditor.executeEdits('list-exit', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLine.length + 1),
          text: ''
        }]);
        this.monacoEditor.setPosition({ lineNumber: position.lineNumber, column: 1 });
        return false;
      } else {
        // Continue numbered list
        const nextNum = parseInt(num) + 1;
        this.monacoEditor.executeEdits('list-continue', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: `\n${indent}${nextNum}. `
        }]);
        return true;
      }
    }
    
    if (taskMatch) {
      const [, indent, , content] = taskMatch;
      if (content.trim() === '') {
        // Empty task item, replace with empty line
        this.monacoEditor.executeEdits('list-exit', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLine.length + 1),
          text: ''
        }]);
        this.monacoEditor.setPosition({ lineNumber: position.lineNumber, column: 1 });
        return false;
      } else {
        // Continue task list
        this.monacoEditor.executeEdits('list-continue', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: `\n${indent}- [ ] `
        }]);
        return true;
      }
    }
    
    // Not a list, let Monaco handle normally
    return false;
  }

  onDestroy() {
    // Clean up Monaco editor
    if (this.monacoEditor && this.monacoEditor.dispose) {
      this.monacoEditor.dispose();
    }
    
    this.monacoEditor = null;
    this.isMonacoLoaded = false;
    this.currentContent = '';
  }
}

// Export for use in other components
window.EditorComponent = EditorComponent;