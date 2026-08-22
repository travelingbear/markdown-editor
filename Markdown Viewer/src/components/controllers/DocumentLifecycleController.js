/**
 * Owns DocumentComponent lifecycle events and maps them into tab, editor,
 * preview, toolbar, and performance state.
 */
class DocumentLifecycleController extends BaseComponent {
  constructor(options = {}) {
    super('DocumentLifecycleController', options);
    this.documentComponent = null;
    this.tabManager = null;
    this.modeController = null;
    this.settingsController = null;
    this.tabUIController = null;
    this.toolbarComponent = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.performanceOptimizer = null;
    this.switchToTab = () => false;
    this.updateFilename = () => {};
    this.handleError = () => {};
    this.fileOpenBatchStartedAt = null;
    this.documentEventHandlers = [];
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    this.listen('document-open-batch-started', () => this.handleOpenBatchStarted());
    this.listen('document-open-batch-completed', (data) => this.handleOpenBatchCompleted(data));
    this.listen('document-opened', (data) => this.handleDocumentOpened(data));
    this.listen('document-new', (data) => this.handleDocumentNew(data));
    this.listen('document-closed', () => this.handleDocumentClosed());
    this.listen('document-dirty-changed', (data) => this.handleDirtyChanged(data));
    this.listen('document-saved', (data) => this.handleDocumentSaved(data));
    this.listen('document-error', (data) => this.handleDocumentError(data));
    this.listen('document-content-updated', (data) => this.handleContentUpdated(data));
  }

  listen(event, handler) {
    this.documentComponent.on(event, handler);
    this.documentEventHandlers.push({ event, handler });
  }

  handleOpenBatchStarted() {
    this.fileOpenBatchStartedAt = performance.now();
    this.tabManager.beginBatchUpdate();
  }

  handleOpenBatchCompleted({ fileCount }) {
    this.tabManager.endBatchUpdate();
    if (this.performanceOptimizer && this.fileOpenBatchStartedAt !== null) {
      this.performanceOptimizer.benchmarkTabOperation(
        'File Open Batch',
        this.fileOpenBatchStartedAt,
        this.tabManager.getTabsCount(),
        500 + fileCount * 100
      );
    }
    this.fileOpenBatchStartedAt = null;
  }

  handleDocumentOpened(data) {
    const startTime = data.openStartedAt ?? performance.now();
    const currentTabCount = this.tabManager.getTabsCount();
    const shouldActivate = !data.batchSize || data.batchSize === 1 || data.isLastInBatch;

    // Duplicate protection is based on normalized full paths. Equal filenames
    // in different directories must remain independent documents.
    const existingTab = this.tabManager.findTabByPath(data.filePath);
    if (existingTab) {
      if (shouldActivate) this.switchToTab(existingTab.id);
      return;
    }

    // Only the final item in a multi-file batch needs to render immediately.
    this.tabManager.openFileInTab(data.filePath, data.content, { activate: shouldActivate });
    this.settingsController.setLastFileOpenTime(performance.now());

    if (this.modeController.getCurrentMode() === 'preview' && currentTabCount === 0) {
      this.modeController.setMode(this.settingsController.getDefaultMode());
    }

    if (this.performanceOptimizer && this.tabManager.getTabsCount() > currentTabCount) {
      this.performanceOptimizer.benchmarkTabOperation(
        'File Open',
        startTime,
        this.tabManager.getTabsCount()
      );
    }
  }

  handleDocumentNew({ content }) {
    this.tabManager.createNewTab(content);
    this.modeController.setMode('code');
  }

  handleDocumentClosed() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) this.tabManager.closeTab(activeTab.id);
  }

  handleDirtyChanged({ isDirty }) {
    const activeTab = this.tabManager.getActiveTab();
    if (!activeTab) return;

    activeTab.isDirty = isDirty;
    this.tabUIController.updateTabUI();
    if (this.settingsController.getPinnedTabsEnabled()) {
      this.tabUIController.updatePinnedTabs();
    }
    this.updateFilename(null, isDirty);
    this.toolbarComponent.emit('document-state-changed', {
      hasDocument: true,
      isDirty
    });
  }

  handleDocumentSaved({ filePath }) {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) this.tabManager.markTabSaved(activeTab.id, filePath);
  }

  handleDocumentError({ error, type }) {
    this.handleError(new Error(error), type);
  }

  handleContentUpdated({ content }) {
    const activeTab = this.tabManager.getActiveTab();
    if (!activeTab) return;

    activeTab.setContent(content);
    activeTab.markSaved(activeTab.filePath);
    this.editorComponent.emit('set-content', { content });
    this.previewComponent.emit('update-preview', {
      content,
      filePath: activeTab.filePath
    });
  }

  onDestroy() {
    for (const { event, handler } of this.documentEventHandlers) {
      this.documentComponent?.off(event, handler);
    }
    this.documentEventHandlers = [];
    this.fileOpenBatchStartedAt = null;
  }
}

window.DocumentLifecycleController = DocumentLifecycleController;
export { DocumentLifecycleController };
