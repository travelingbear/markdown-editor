/**
 * Editor Component
 * Owns the active editor adapter and a plain textarea fallback.
 */
class EditorComponent extends BaseComponent {
  constructor(options = {}) {
    super('EditorComponent', options);

    this.editorAdapter = null;
    this.editorLoadPromise = null;
    this.editorEngine = null;
    this.isEditorLoaded = false;

    this.fallbackEditor = null;
    this.currentContent = '';
    this.fontSize = parseInt(localStorage.getItem('markdownViewer_fontSize') || '14');
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.fallbackDomListeners = [];
  }

  async onInit() {
    this.initializeElements();
    this.setupFallbackEditor();
    this.setupEventListeners();
    this.applySettings();
  }

  initializeElements() {
    this.editorContainer = document.getElementById('code-editor');
    this.fallbackEditor = document.getElementById('editor');

    if (!this.editorContainer || !this.fallbackEditor) {
      throw new Error('Editor elements not found');
    }
  }

  setupEventListeners() {
    this.on('set-content', (data) => this.setContent(data.content));
    this.on('theme-changed', (data) => this.updateTheme(data.theme));
    this.on('font-size-changed', (data) => this.updateFontSize(data.fontSize));
  }

  setupFallbackEditor() {
    const listeners = [
      ['input', () => {
        if (!this.isEditorReady()) this.handleContentChange();
      }],
      ['keydown', (event) => {
        if (!this.isEditorReady()) this.handleKeyDown(event);
      }],
      ['keyup', () => {
        if (!this.isEditorReady()) this.updateCursorPosition();
      }],
      ['click', () => {
        if (!this.isEditorReady()) this.updateCursorPosition();
      }]
    ];

    for (const [event, handler] of listeners) {
      this.fallbackEditor.addEventListener(event, handler);
      this.fallbackDomListeners.push({ event, handler });
    }
  }

  /** Load the primary editor lazily, retaining the textarea as a safe fallback. */
  async loadEditor() {
    if (this.isEditorReady()) {
      this.showEditor();
      return;
    }

    if (this.editorLoadPromise) {
      return this.editorLoadPromise;
    }

    this.editorLoadPromise = (async () => {
      try {
        await this.loadCodeMirrorEditor();
      } catch (error) {
        console.error('[Editor] Failed to load CodeMirror; using textarea fallback:', error);
        this.editorAdapter?.dispose?.();
        this.editorAdapter = null;
        this.editorContainer.replaceChildren();
        this.fallbackToTextarea();
        throw error;
      } finally {
        this.editorLoadPromise = null;
      }
    })();

    return this.editorLoadPromise;
  }

  async loadCodeMirrorEditor() {
    const { CodeMirrorEditorAdapter } = await import('../editor/CodeMirrorEditorAdapter.js');
    this.editorAdapter = new CodeMirrorEditorAdapter(this.editorContainer, {
      content: this.currentContent,
      fontSize: this.fontSize,
      theme: this.theme,
      onMarkdownAction: (action) => this.emit('markdown-action', { action }),
      onEnter: () => this.handleEnterKey()
    });
    this.editorEngine = 'codemirror';
    this.isEditorLoaded = true;
    this.setupAdapterEventListeners();
    this.showEditor();
    console.info('[Editor] CodeMirror initialized');
    this.emit('editor-loaded', { adapter: this.editorAdapter, engine: this.editorEngine });
  }

  setupAdapterEventListeners() {
    this.editorAdapter.onContentChange?.(() => {
      this.handleContentChange();
      this.updateCursorPosition();
    });
    this.editorAdapter.onCursorChange?.(() => this.updateCursorPosition());
    this.editorAdapter.onSelectionChange?.((data) => this.emit('selection-changed', data));
    this.editorAdapter.onFocus?.(() => this.emit('editor-focused'));
  }

  handleContentChange() {
    const newContent = this.getContent();
    if (this.currentContent !== newContent) {
      this.currentContent = newContent;
      this.emit('content-changed', { content: newContent });
    }
  }

  handleKeyDown(event) {
    this.emit('key-down', { event });
  }

  updateCursorPosition() {
    let line = 1;
    let col = 1;

    if (this.editorAdapter) {
      const position = this.editorAdapter.getCursorPosition();
      line = position.line;
      col = position.column;
    } else {
      const cursorPos = this.fallbackEditor.selectionStart;
      const lines = this.fallbackEditor.value.substring(0, cursorPos).split('\n');
      line = lines.length;
      col = lines[lines.length - 1].length + 1;
    }

    this.emit('cursor-position-changed', { line, col });
  }

  getContent() {
    return this.editorAdapter ? this.editorAdapter.getContent() : this.fallbackEditor.value;
  }

  setContent(content) {
    if (this.currentContent === content) return;
    this.currentContent = content;
    if (this.editorAdapter) this.editorAdapter.setContent(content);
    else this.fallbackEditor.value = content;
  }

  setEditorDocument(document, viewState = null) {
    if (!this.editorAdapter || !document) return;
    this.editorAdapter.setDocument(document, viewState);
    this.currentContent = document.getValue();
  }

  getEditorAdapter() {
    return this.editorAdapter;
  }

  isEditorReady() {
    return Boolean(this.isEditorLoaded && this.editorAdapter);
  }

  getEditorEngine() {
    return this.editorEngine;
  }

  showEditor() {
    this.fallbackEditor.style.display = 'none';
    this.editorContainer.style.display = 'block';
  }

  fallbackToTextarea() {
    this.editorContainer.style.display = 'none';
    this.fallbackEditor.style.display = 'block';
    this.isEditorLoaded = false;
  }

  updateTheme(theme) {
    this.theme = theme;
    this.editorAdapter?.updateOptions({ theme });
  }

  updateFontSize(fontSize) {
    this.fontSize = fontSize;
    this.editorAdapter?.updateOptions({ fontSize });
    this.fallbackEditor.style.fontSize = `${fontSize}px`;
  }

  applySettings() {
    this.updateFontSize(this.fontSize);
  }

  focus() {
    if (this.editorAdapter) this.editorAdapter.focus();
    else this.fallbackEditor.focus();
  }

  undo() {
    if (this.editorAdapter) this.editorAdapter.undo();
    else document.execCommand?.('undo');
  }

  redo() {
    if (this.editorAdapter) this.editorAdapter.redo();
    else document.execCommand?.('redo');
  }

  setCursorPosition(line, col) {
    if (this.editorAdapter) {
      this.editorAdapter.setCursorPosition({ line, column: col });
      return;
    }

    const lines = this.fallbackEditor.value.split('\n');
    let offset = 0;
    for (let index = 0; index < Math.min(line - 1, lines.length); index++) {
      offset += lines[index].length + 1;
    }
    offset += Math.min(col - 1, lines[line - 1]?.length || 0);
    this.fallbackEditor.setSelectionRange(offset, offset);
  }

  getCursorPosition() {
    if (this.editorAdapter) {
      const position = this.editorAdapter.getCursorPosition();
      return { line: position.line, col: position.column };
    }

    const lines = this.fallbackEditor.value
      .substring(0, this.fallbackEditor.selectionStart)
      .split('\n');
    return { line: lines.length, col: lines[lines.length - 1].length + 1 };
  }

  handleEnterKey() {
    const editor = this.editorAdapter;
    if (!editor) return false;

    const position = editor.getCursorPosition();
    const currentLine = editor.getLineContent(position.line);
    const taskMatch = currentLine.match(/^(\s*)- \[([ x])\] (.*)$/);
    const unorderedMatch = currentLine.match(/^(\s*)- (.*)$/);
    const orderedMatch = currentLine.match(/^(\s*)(\d+)\. (.*)$/);

    let indent;
    let content;
    let prefix;

    if (taskMatch) {
      [, indent, , content] = taskMatch;
      prefix = `${indent}- [ ] `;
    } else if (unorderedMatch) {
      [, indent, content] = unorderedMatch;
      prefix = `${indent}- `;
    } else if (orderedMatch) {
      const number = parseInt(orderedMatch[2], 10) + 1;
      [, indent, , content] = orderedMatch;
      prefix = `${indent}${number}. `;
    } else {
      return false;
    }

    if (content.trim() === '') {
      editor.applyEdits('list-exit', [{
        range: {
          startLine: position.line,
          startColumn: 1,
          endLine: position.line,
          endColumn: currentLine.length + 1
        },
        text: ''
      }]);
      editor.setCursorPosition({ line: position.line, column: 1 }, false);
      return true;
    }

    editor.insertText(`\n${prefix}`, position, 'list-continue');
    editor.setCursorPosition({
      line: position.line + 1,
      column: prefix.length + 1
    });
    return true;
  }

  onDestroy() {
    for (const { event, handler } of this.fallbackDomListeners) {
      this.fallbackEditor?.removeEventListener(event, handler);
    }
    this.fallbackDomListeners = [];
    this.editorAdapter?.dispose?.();
    this.editorAdapter = null;
    this.editorEngine = null;
    this.isEditorLoaded = false;
    this.currentContent = '';
  }
}

window.EditorComponent = EditorComponent;
