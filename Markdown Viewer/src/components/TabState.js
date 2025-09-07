/**
 * TabState - Individual tab state management
 */
class TabState {
  constructor(id, options = {}) {
    this.id = id;
    this.fileName = options.fileName || 'untitled.md';
    this.filePath = options.filePath || null;
    this.content = options.content || '';
    this.isDirty = options.isDirty || false;
    this.isActive = options.isActive || false;
    this.cursorPosition = options.cursorPosition || { line: 1, col: 1 };
    this.scrollPosition = options.scrollPosition || { editor: 0, preview: 0 };
    this.editorViewState = options.editorViewState || null;
    this.monacoModel = null;
    this.createdAt = options.createdAt || Date.now();
    this.lastModified = options.lastModified || Date.now();
  }

  // Update tab content
  setContent(content) {
    if (this.content !== content) {
      this.content = content;
      this.isDirty = true;
      this.lastModified = Date.now();
    }
  }

  // Mark as saved
  markSaved(filePath = null) {
    this.isDirty = false;
    if (filePath) {
      this.filePath = filePath;
      this.fileName = this.extractFileName(filePath);
    }
    this.lastModified = Date.now();
  }

  // Set cursor position
  setCursorPosition(line, col) {
    this.cursorPosition = { line, col };
  }

  // Set scroll positions
  setScrollPosition(editor = null, preview = null) {
    if (editor !== null) this.scrollPosition.editor = editor;
    if (preview !== null) this.scrollPosition.preview = preview;
  }

  // Set Monaco Editor view state
  setEditorViewState(viewState) {
    this.editorViewState = viewState;
  }

  // Get or create Monaco model for this tab
  getMonacoModel() {
    if (!this.monacoModel && typeof monaco !== 'undefined') {
      this.monacoModel = monaco.editor.createModel(this.content, 'markdown');
    }
    return this.monacoModel;
  }

  // Update model content
  updateModelContent(content) {
    if (this.monacoModel) {
      this.monacoModel.setValue(content);
    }
    this.setContent(content);
  }

  // Set active state
  setActive(active) {
    this.isActive = active;
  }

  // Extract filename from path
  extractFileName(filePath) {
    if (!filePath) return 'untitled.md';
    return filePath.split(/[/\\]/).pop() || 'untitled.md';
  }

  // Get display name
  getDisplayName() {
    return this.fileName;
  }

  // Get title with dirty indicator
  getTitle() {
    return `${this.fileName}${this.isDirty ? ' *' : ''}`;
  }

  // Serialize for persistence
  toJSON() {
    return {
      id: this.id,
      fileName: this.fileName,
      filePath: this.filePath,
      content: this.content,
      isDirty: this.isDirty,
      cursorPosition: this.cursorPosition,
      scrollPosition: this.scrollPosition,
      editorViewState: this.editorViewState,
      createdAt: this.createdAt,
      lastModified: this.lastModified
    };
  }

  // Deserialize from persistence
  static fromJSON(data) {
    return new TabState(data.id, {
      fileName: data.fileName,
      filePath: data.filePath,
      content: data.content,
      isDirty: data.isDirty,
      cursorPosition: data.cursorPosition,
      scrollPosition: data.scrollPosition,
      editorViewState: data.editorViewState,
      createdAt: data.createdAt,
      lastModified: data.lastModified
    });
  }
}

window.TabState = TabState;