import { clampScrollRatio } from './scrollState.js';

/**
 * TabState - Individual tab state management
 */
class TabState {
  constructor(id, options = {}) {
    this.id = id;
    this.fileName = options.fileName || 'untitled.md';
    this.filePath = options.filePath || null;
    this.content = options.content || '';
    this.savedContent = options.savedContent ?? (options.isDirty ? null : this.content);
    this.isDirty = options.isDirty || false;
    this.isActive = options.isActive || false;
    this.cursorPosition = options.cursorPosition || { line: 1, col: 1 };
    const savedScroll = options.scrollPosition || {};
    this.scrollPosition = {
      editor: Number.isFinite(savedScroll.editor) ? savedScroll.editor : 0,
      preview: Number.isFinite(savedScroll.preview) ? savedScroll.preview : 0,
      // Older persisted tabs have no ratio. Their absolute position is used
      // once and converted when the tab next becomes active.
      ratio: Object.prototype.hasOwnProperty.call(savedScroll, 'ratio')
        ? clampScrollRatio(savedScroll.ratio, 0)
        : (options.scrollPosition ? null : 0),
      source: savedScroll.source || null
    };
    this.editorViewState = options.editorViewState || null;
    this.editorDocument = null;
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
    this.savedContent = this.content;
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
  setScrollPosition(editor = null, preview = null, ratio = null, source = null) {
    if (editor !== null) this.scrollPosition.editor = editor;
    if (preview !== null) this.scrollPosition.preview = preview;
    if (ratio !== null) this.scrollPosition.ratio = clampScrollRatio(ratio, 0);
    if (source !== null) this.scrollPosition.source = source;
  }

  // Set editor view state
  setEditorViewState(viewState) {
    this.editorViewState = viewState;
  }

  // Get or create the engine-owned document for this tab.
  getEditorDocument(editorAdapter) {
    if (!this.editorDocument && editorAdapter) {
      this.editorDocument = editorAdapter.createDocument(this.content, 'markdown');
    }
    return this.editorDocument;
  }

  // Update cached content. The active editor document is synchronized by the adapter.
  updateEditorDocument(content, editorAdapter = null) {
    if (this.editorDocument && editorAdapter) {
      editorAdapter.updateDocument(this.editorDocument, content);
    }
    this.setContent(content);
  }

  disposeEditorDocument(editorAdapter) {
    if (this.editorDocument && editorAdapter) {
      editorAdapter.disposeDocument(this.editorDocument);
    }
    this.editorDocument = null;
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

  hasUnsavedChanges() {
    return this.isDirty || this.savedContent === null || this.content !== this.savedContent;
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
