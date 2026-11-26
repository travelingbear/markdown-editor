import { EditorSelection, EditorState, Transaction } from '@codemirror/state';
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  isolateHistory,
  redo,
  undo
} from '@codemirror/commands';
import {
  bracketMatching,
  foldGutter,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { markdown } from '@codemirror/lang-markdown';
import { closeSearchPanel, openSearchPanel, search, searchKeymap } from '@codemirror/search';

const markdownHighlightStyle = HighlightStyle.define([
  { tag: [tags.meta, tags.processingInstruction], class: 'cm-md-mark' },
  { tag: tags.heading, class: 'cm-md-heading' },
  { tag: tags.strong, class: 'cm-md-strong' },
  { tag: tags.emphasis, class: 'cm-md-emphasis' },
  { tag: [tags.link, tags.url], class: 'cm-md-link' },
  { tag: tags.monospace, class: 'cm-md-code' },
  { tag: [tags.quote, tags.contentSeparator], class: 'cm-md-block' },
  { tag: tags.comment, class: 'cm-md-comment' },
  { tag: tags.invalid, class: 'cm-md-invalid' }
]);

class CodeMirrorDocument {
  constructor(state) {
    this.state = state;
    this.disposed = false;
  }

  getValue() {
    return this.state.doc.toString();
  }
}

/**
 * Neutral editor contract backed by CodeMirror 6.
 *
 * The adapter owns all CodeMirror-specific positions, state, transactions,
 * search UI, and DOM details. Application components only exchange the
 * one-based line/column shapes defined by the editor contract.
 */
export class CodeMirrorEditorAdapter {
  constructor(parent, options = {}) {
    this.parent = parent;
    this.options = {
      content: '',
      fontSize: 14,
      theme: 'light',
      onMarkdownAction: null,
      onEnter: null,
      ...options
    };
    this.listeners = {
      content: new Set(),
      cursor: new Set(),
      selection: new Set(),
      focus: new Set()
    };
    this.pendingScrollRestore = null;

    this.activeDocument = this.createDocument(this.options.content, 'markdown');
    this.view = new EditorView({
      state: this.activeDocument.state,
      parent
    });

    this.handleFocus = () => this.emitListeners('focus');
    this.view.dom.addEventListener('focusin', this.handleFocus);
    this.applyAppearance();
  }

  createExtensions() {
    const markdownShortcuts = [
      this.markdownKeyBinding('Mod-b', 'bold'),
      this.markdownKeyBinding('Mod-i', 'italic'),
      {
        key: 'Enter',
        run: () => Boolean(this.options.onEnter?.())
      }
    ];

    return [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(markdownHighlightStyle),
      bracketMatching(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      search({ top: true }),
      markdown(),
      EditorView.lineWrapping,
      keymap.of([
        ...markdownShortcuts,
        ...searchKeymap,
        ...historyKeymap,
        indentWithTab,
        ...defaultKeymap
      ]),
      EditorView.updateListener.of((update) => this.handleUpdate(update)),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          lineHeight: '1.45'
        },
        '.cm-content': { minHeight: '100%', padding: '8px 0' },
        '.cm-gutters': {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          borderRight: '1px solid var(--border-primary)'
        },
        '.cm-search': {
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--border-primary)'
        },
        '.cm-search .cm-textfield, .cm-search .cm-button': {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)'
        }
      })
    ];
  }

  markdownKeyBinding(key, action) {
    return {
      key,
      preventDefault: true,
      run: () => {
        this.options.onMarkdownAction?.(action);
        return true;
      }
    };
  }

  createState(content) {
    return EditorState.create({
      doc: content,
      extensions: this.createExtensions()
    });
  }

  handleUpdate(update) {
    if (this.activeDocument) this.activeDocument.state = update.state;

    if (update.docChanged) this.emitListeners('content', this.getContent());

    if (update.selectionSet || update.docChanged) {
      this.emitListeners('cursor', this.getCursorPosition());
      const selection = this.getSelection();
      if (selection && !selection.isEmpty) {
        this.emitListeners('selection', {
          selection,
          text: this.getSelectedText()
        });
      }
    }
  }

  addListener(type, callback) {
    this.listeners[type].add(callback);
    return { dispose: () => this.listeners[type].delete(callback) };
  }

  emitListeners(type, value) {
    for (const callback of this.listeners[type]) callback(value);
  }

  onContentChange(callback) {
    return this.addListener('content', callback);
  }

  onCursorChange(callback) {
    return this.addListener('cursor', callback);
  }

  onSelectionChange(callback) {
    return this.addListener('selection', callback);
  }

  onFocus(callback) {
    return this.addListener('focus', callback);
  }

  getContent() {
    return this.view.state.doc.toString();
  }

  setContent(content) {
    if (content === this.getContent()) return;
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: content },
      annotations: Transaction.addToHistory.of(false)
    });
  }

  getCursorPosition() {
    return this.positionFromOffset(this.view.state.selection.main.head);
  }

  setCursorPosition(position, reveal = true) {
    const offset = this.offsetFromPosition(position);
    this.view.dispatch({
      selection: EditorSelection.cursor(offset),
      scrollIntoView: reveal
    });
  }

  getSelection() {
    const range = this.view.state.selection.main;
    const start = this.positionFromOffset(range.from);
    const end = this.positionFromOffset(range.to);
    return {
      startLine: start.line,
      startColumn: start.column,
      endLine: end.line,
      endColumn: end.column,
      isEmpty: range.empty
    };
  }

  getTextInRange(range) {
    return this.view.state.sliceDoc(
      this.offsetFromPosition({ line: range.startLine, column: range.startColumn }),
      this.offsetFromPosition({ line: range.endLine, column: range.endColumn })
    );
  }

  getSelectedText() {
    const range = this.view.state.selection.main;
    return range.empty ? '' : this.view.state.sliceDoc(range.from, range.to);
  }

  getLineContent(line) {
    const lineNumber = Math.max(1, Math.min(line, this.view.state.doc.lines));
    return this.view.state.doc.line(lineNumber).text;
  }

  applyEdits(source, edits) {
    const changes = edits.map((edit) => ({
      from: this.offsetFromPosition({
        line: edit.range.startLine,
        column: edit.range.startColumn
      }),
      to: this.offsetFromPosition({
        line: edit.range.endLine,
        column: edit.range.endColumn
      }),
      insert: edit.text
    }));

    this.view.dispatch({
      changes,
      annotations: [
        Transaction.userEvent.of(`input.${source}`),
        isolateHistory.of('full')
      ]
    });
  }

  insertText(text, position = this.getCursorPosition(), source = 'editor-adapter') {
    this.applyEdits(source, [{
      range: {
        startLine: position.line,
        startColumn: position.column,
        endLine: position.line,
        endColumn: position.column
      },
      text
    }]);
  }

  focus() {
    this.view.focus();
  }

  undo() {
    return undo(this.view);
  }

  redo() {
    return redo(this.view);
  }

  layout() {
    this.view.requestMeasure();
  }

  updateOptions(options) {
    this.options = { ...this.options, ...options };
    this.applyAppearance();
  }

  applyAppearance() {
    if (!this.view) return;
    this.view.dom.style.fontSize = `${this.options.fontSize}px`;
    this.view.dom.dataset.theme = this.options.theme;
  }

  openFindReplace(showReplace = false) {
    const opened = openSearchPanel(this.view);
    this.setReplaceControlsVisible(showReplace);
    return opened;
  }

  setReplaceControlsVisible(visible) {
    this.view.dom.classList.toggle('cm-find-only', !visible);
    const panel = this.view.dom.querySelector('.cm-search');
    if (!panel) return;

    panel.querySelectorAll('input[name="replace"], button[name="replace"], button[name="replaceAll"]')
      .forEach((control) => {
        control.hidden = !visible;
      });
  }

  isFindReplaceOpen() {
    return Boolean(this.view.dom.querySelector('.cm-search'));
  }

  closeFindReplace() {
    this.view.dom.classList.remove('cm-find-only');
    return closeSearchPanel(this.view);
  }

  toggleFindReplace(showReplace = false) {
    return this.isFindReplaceOpen()
      ? this.closeFindReplace()
      : this.openFindReplace(showReplace);
  }

  getScrollMetrics() {
    const viewportHeight = this.view.scrollDOM.clientHeight;
    const contentHeight = this.view.contentHeight;
    return {
      top: this.view.scrollDOM.scrollTop,
      contentHeight,
      viewportHeight,
      maxScroll: Math.max(0, contentHeight - viewportHeight)
    };
  }

  setScrollTop(scrollTop) {
    this.view.scrollDOM.scrollTop = scrollTop;
  }

  onScroll(callback) {
    const listener = () => callback({ scrollTop: this.view.scrollDOM.scrollTop });
    this.view.scrollDOM.addEventListener('scroll', listener, { passive: true });
    return {
      dispose: () => this.view.scrollDOM.removeEventListener('scroll', listener)
    };
  }

  getPositionAtClientPoint(x, y) {
    const offset = this.view.posAtCoords({ x, y });
    return offset === null ? this.getCursorPosition() : this.positionFromOffset(offset);
  }

  saveViewState() {
    return {
      selection: this.view.state.selection.toJSON(),
      scrollTop: this.view.scrollDOM.scrollTop
    };
  }

  restoreViewState(viewState) {
    if (this.pendingScrollRestore !== null) {
      cancelAnimationFrame(this.pendingScrollRestore);
      this.pendingScrollRestore = null;
    }

    if (viewState?.selection) {
      try {
        this.view.dispatch({ selection: EditorSelection.fromJSON(viewState.selection) });
      } catch (error) {
        console.warn('[CodeMirrorEditorAdapter] Ignored invalid saved selection:', error);
      }
    }

    const scrollTop = Number.isFinite(viewState?.scrollTop) ? viewState.scrollTop : 0;
    const documentToRestore = this.activeDocument;

    // Reset immediately so the newly selected document never displays or
    // captures the outgoing document's scroll position.
    this.setScrollTop(scrollTop);
    this.pendingScrollRestore = requestAnimationFrame(() => {
      this.pendingScrollRestore = null;
      if (this.activeDocument === documentToRestore) {
        this.setScrollTop(scrollTop);
      }
    });
  }

  createDocument(content) {
    return new CodeMirrorDocument(this.createState(content));
  }

  setDocument(document, viewState = null) {
    if (!document || document.disposed) return;
    this.activeDocument = document;
    this.view.setState(document.state);
    this.applyAppearance();
    this.restoreViewState(viewState);
  }

  updateDocument(document, content) {
    if (!document || document.disposed || document.getValue() === content) return;

    if (document === this.activeDocument) {
      this.setContent(content);
      return;
    }

    document.state = document.state.update({
      changes: { from: 0, to: document.state.doc.length, insert: content },
      annotations: Transaction.addToHistory.of(false)
    }).state;
  }

  disposeDocument(document) {
    if (document) document.disposed = true;
  }

  positionFromOffset(offset) {
    const safeOffset = Math.max(0, Math.min(offset, this.view.state.doc.length));
    const line = this.view.state.doc.lineAt(safeOffset);
    return { line: line.number, column: safeOffset - line.from + 1 };
  }

  offsetFromPosition(position) {
    const lineNumber = Math.max(1, Math.min(position.line, this.view.state.doc.lines));
    const line = this.view.state.doc.line(lineNumber);
    const column = Math.max(1, Math.min(position.column, line.length + 1));
    return line.from + column - 1;
  }

  dispose() {
    if (this.pendingScrollRestore !== null) {
      cancelAnimationFrame(this.pendingScrollRestore);
      this.pendingScrollRestore = null;
    }
    this.view.dom.removeEventListener('focusin', this.handleFocus);
    this.view.destroy();
    for (const listeners of Object.values(this.listeners)) listeners.clear();
  }
}

window.CodeMirrorEditorAdapter = CodeMirrorEditorAdapter;
