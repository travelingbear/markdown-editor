import {
  clampScrollRatio,
  getScrollRatio,
  getScrollTopFromRatio
} from '../scrollState.js';

/**
 * Owns canonical per-tab scroll state and synchronization between editor and preview.
 */
class ScrollCoordinator extends BaseComponent {
  constructor() {
    super('ScrollCoordinator');
    this.editorComponent = null;
    this.previewComponent = null;
    this.tabManager = null;
    this.modeController = null;
    this.restoreToken = 0;
    this.restoreTimer = null;
    this.isProgrammaticScroll = false;
    this.boundAdapters = new WeakSet();
    this.editorScrollDisposables = [];
    this.previewPane = null;
    this.previewScrollHandler = null;
    this.editorLoadedHandler = null;
    this.syncButton = null;
    this.syncButtonHandler = null;
  }

  setDependencies({ editorComponent, previewComponent, tabManager, modeController }) {
    this.editorComponent = editorComponent;
    this.previewComponent = previewComponent;
    this.tabManager = tabManager;
    this.modeController = modeController;
  }

  async onInit() {
    this.editorLoadedHandler = ({ adapter }) => this.bindEditor(adapter);
    this.editorComponent.on('editor-loaded', this.editorLoadedHandler);
    this.bindEditor(this.editorComponent.getEditorAdapter());

    this.previewPane = document.querySelector('.preview-pane');
    if (this.previewPane) {
      this.previewScrollHandler = () => this.handlePreviewScroll();
      this.previewPane.addEventListener('scroll', this.previewScrollHandler, { passive: true });
    }

    this.syncButton = document.getElementById('scroll-sync-btn');
    if (this.syncButton) {
      this.syncButtonHandler = () => this.alignBothPanes();
      this.syncButton.addEventListener('click', this.syncButtonHandler);
    }
  }

  bindEditor(adapter) {
    if (!adapter || this.boundAdapters.has(adapter)) return;
    this.boundAdapters.add(adapter);
    const disposable = adapter.onScroll(() => this.handleEditorScroll());
    if (disposable) this.editorScrollDisposables.push(disposable);
  }

  getPreviewPane() {
    this.previewPane ||= document.querySelector('.preview-pane');
    return this.previewPane;
  }

  getMode() {
    return this.modeController?.getCurrentMode() || 'welcome';
  }

  capture(tab, mode = this.getMode()) {
    if (!tab || !this.tabManager) return;

    const editor = this.editorComponent?.getEditorAdapter();
    const previewPane = this.getPreviewPane();
    const editorMetrics = editor?.getScrollMetrics();
    const previewMax = previewPane
      ? Math.max(0, previewPane.scrollHeight - previewPane.clientHeight)
      : 0;
    let ratio = clampScrollRatio(tab.scrollPosition?.ratio, null);
    let source = tab.scrollPosition?.source || null;

    if (editor) {
      this.tabManager.saveTabEditorState(tab.id, editor.saveViewState());
    }

    if (mode === 'code' && editorMetrics) {
      ratio = getScrollRatio(editorMetrics.top, editorMetrics.maxScroll);
      source = 'editor';
    } else if (mode === 'preview' && previewPane) {
      ratio = getScrollRatio(previewPane.scrollTop, previewMax);
      source = 'preview';
    } else if (mode === 'split' && ratio === null && editorMetrics) {
      ratio = getScrollRatio(editorMetrics.top, editorMetrics.maxScroll);
      source = 'editor';
    }

    this.tabManager.updateTabScroll(
      tab.id,
      editorMetrics?.top ?? null,
      previewPane?.scrollTop ?? null,
      ratio,
      source
    );
  }

  applyTabPosition(tab, mode = this.getMode()) {
    if (!tab) return;

    const editor = this.editorComponent?.getEditorAdapter();
    const previewPane = this.getPreviewPane();
    const ratio = clampScrollRatio(tab.scrollPosition?.ratio, null);

    if ((mode === 'code' || mode === 'split') && editor) {
      const editorTop = ratio !== null
        ? getScrollTopFromRatio(ratio, editor.getScrollMetrics().maxScroll)
        : (Number.isFinite(tab.scrollPosition?.editor) ? tab.scrollPosition.editor : 0);
      editor.setScrollTop(editorTop);
    }

    if ((mode === 'preview' || mode === 'split') && previewPane) {
      const previewMax = Math.max(0, previewPane.scrollHeight - previewPane.clientHeight);
      previewPane.scrollTop = ratio !== null
        ? getScrollTopFromRatio(ratio, previewMax)
        : (Number.isFinite(tab.scrollPosition?.preview) ? tab.scrollPosition.preview : 0);
    }
  }

  restoreTab(tab, isCurrent = () => true, mode = this.getMode()) {
    if (!tab || !isCurrent()) return;

    const restoreToken = ++this.restoreToken;
    this.isProgrammaticScroll = true;
    this.applyTabPosition(tab, mode);

    requestAnimationFrame(() => {
      if (restoreToken !== this.restoreToken) return;
      if (isCurrent()) this.applyTabPosition(tab, mode);
      this.isProgrammaticScroll = false;
    });
  }

  scheduleActiveRestore(delay = 100, expectedMode = this.getMode()) {
    if (this.restoreTimer !== null) clearTimeout(this.restoreTimer);
    const expectedTabId = this.tabManager?.getActiveTab()?.id;
    if (!expectedTabId) return;

    this.restoreTimer = setTimeout(() => {
      this.restoreTimer = null;
      const activeTab = this.tabManager?.getActiveTab();
      const isCurrent = () => this.tabManager?.getActiveTab()?.id === expectedTabId
        && this.getMode() === expectedMode;
      if (activeTab && isCurrent()) this.restoreTab(activeTab, isCurrent, expectedMode);
    }, delay);
  }

  runProgrammatic(callback) {
    const token = ++this.restoreToken;
    this.isProgrammaticScroll = true;
    callback();
    requestAnimationFrame(() => {
      if (token === this.restoreToken) this.isProgrammaticScroll = false;
    });
  }

  handleEditorScroll() {
    const mode = this.getMode();
    if (this.isProgrammaticScroll || (mode !== 'code' && mode !== 'split')) return;

    const editor = this.editorComponent?.getEditorAdapter();
    const previewPane = this.getPreviewPane();
    const activeTab = this.tabManager?.getActiveTab();
    if (!editor || !activeTab) return;

    const editorMetrics = editor.getScrollMetrics();
    const ratio = getScrollRatio(editorMetrics.top, editorMetrics.maxScroll);
    let previewTop = null;

    if (mode === 'split' && previewPane) {
      const previewMax = Math.max(0, previewPane.scrollHeight - previewPane.clientHeight);
      previewTop = getScrollTopFromRatio(ratio, previewMax);
      this.runProgrammatic(() => {
        previewPane.scrollTop = previewTop;
      });
    }

    this.tabManager.updateTabScroll(activeTab.id, editorMetrics.top, previewTop, ratio, 'editor');
  }

  handlePreviewScroll() {
    const mode = this.getMode();
    if (this.isProgrammaticScroll || (mode !== 'preview' && mode !== 'split')) return;

    const editor = this.editorComponent?.getEditorAdapter();
    const previewPane = this.getPreviewPane();
    const activeTab = this.tabManager?.getActiveTab();
    if (!previewPane || !activeTab) return;

    const previewMax = Math.max(0, previewPane.scrollHeight - previewPane.clientHeight);
    const ratio = getScrollRatio(previewPane.scrollTop, previewMax);
    let editorTop = null;

    if (mode === 'split' && editor) {
      editorTop = getScrollTopFromRatio(ratio, editor.getScrollMetrics().maxScroll);
      this.runProgrammatic(() => {
        editor.setScrollTop(editorTop);
      });
    }

    this.tabManager.updateTabScroll(activeTab.id, editorTop, previewPane.scrollTop, ratio, 'preview');
  }

  alignPreviewToActiveTab() {
    const mode = this.getMode();
    if (mode !== 'preview' && mode !== 'split') return;

    const activeTab = this.tabManager?.getActiveTab();
    const previewPane = this.getPreviewPane();
    const ratio = clampScrollRatio(activeTab?.scrollPosition?.ratio, null);
    if (!activeTab || !previewPane || ratio === null) return;

    const previewTop = getScrollTopFromRatio(
      ratio,
      Math.max(0, previewPane.scrollHeight - previewPane.clientHeight)
    );
    this.runProgrammatic(() => {
      previewPane.scrollTop = previewTop;
    });
    this.tabManager.updateTabScroll(activeTab.id, null, previewTop);
  }

  alignPreviewFromEditor() {
    const activeTab = this.tabManager?.getActiveTab();
    const editor = this.editorComponent?.getEditorAdapter();
    const previewPane = this.getPreviewPane();
    if (!activeTab || !editor || !previewPane) return;

    const editorMetrics = editor.getScrollMetrics();
    const ratio = getScrollRatio(editorMetrics.top, editorMetrics.maxScroll);
    const previewTop = getScrollTopFromRatio(
      ratio,
      Math.max(0, previewPane.scrollHeight - previewPane.clientHeight)
    );
    this.runProgrammatic(() => {
      previewPane.scrollTop = previewTop;
    });
    this.tabManager.updateTabScroll(
      activeTab.id,
      editorMetrics.top,
      previewTop,
      ratio,
      'editor'
    );
  }

  alignBothPanes() {
    const activeTab = this.tabManager?.getActiveTab();
    const editor = this.editorComponent?.getEditorAdapter();
    const previewPane = this.getPreviewPane();
    if (!activeTab || !editor || !previewPane) return;

    const editorMetrics = editor.getScrollMetrics();
    const ratio = clampScrollRatio(
      activeTab.scrollPosition?.ratio,
      getScrollRatio(editorMetrics.top, editorMetrics.maxScroll)
    );
    const editorTop = getScrollTopFromRatio(ratio, editorMetrics.maxScroll);
    const previewTop = getScrollTopFromRatio(
      ratio,
      Math.max(0, previewPane.scrollHeight - previewPane.clientHeight)
    );

    this.runProgrammatic(() => {
      editor.setScrollTop(editorTop);
      previewPane.scrollTop = previewTop;
    });
    this.tabManager.updateTabScroll(activeTab.id, editorTop, previewTop, ratio, 'manual');
  }

  updateButton() {
    const button = this.syncButton || document.getElementById('scroll-sync-btn');
    if (!button) return;

    const mode = this.getMode();
    const welcomePage = document.getElementById('welcome-page');
    const isWelcomeVisible = welcomePage && welcomePage.style.display !== 'none';
    const show = this.tabManager?.hasTabs()
      && !isWelcomeVisible
      && (mode === 'code' || mode === 'preview');
    button.style.display = show ? 'inline-flex' : 'none';
    if (show) button.setAttribute('title', 'Align Code and Preview');
  }

  onDestroy() {
    if (this.restoreTimer !== null) clearTimeout(this.restoreTimer);
    this.restoreTimer = null;
    this.editorComponent?.off('editor-loaded', this.editorLoadedHandler);
    for (const disposable of this.editorScrollDisposables) disposable.dispose?.();
    this.editorScrollDisposables = [];
    if (this.previewPane && this.previewScrollHandler) {
      this.previewPane.removeEventListener('scroll', this.previewScrollHandler);
    }
    if (this.syncButton && this.syncButtonHandler) {
      this.syncButton.removeEventListener('click', this.syncButtonHandler);
    }
  }
}

window.ScrollCoordinator = ScrollCoordinator;
export { ScrollCoordinator };
