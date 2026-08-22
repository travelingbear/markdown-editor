/**
 * Coordinates active-tab transitions and loads tab state into the document,
 * editor, preview, and toolbar components.
 */
class TabSessionController extends BaseComponent {
  constructor() {
    super('TabSessionController');
    this.tabManager = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.documentComponent = null;
    this.toolbarComponent = null;
    this.modeController = null;
    this.settingsController = null;
    this.tabUIController = null;
    this.scrollCoordinator = null;
    this.performanceOptimizer = null;
    this.updateFilename = () => {};
    this.showWelcomePage = () => {};
    this.loadVersion = 0;
    this.tabEventHandlers = [];
  }

  setDependencies({
    tabManager,
    editorComponent,
    previewComponent,
    documentComponent,
    toolbarComponent,
    modeController,
    settingsController,
    tabUIController,
    scrollCoordinator,
    performanceOptimizer,
    updateFilename,
    showWelcomePage
  }) {
    Object.assign(this, {
      tabManager,
      editorComponent,
      previewComponent,
      documentComponent,
      toolbarComponent,
      modeController,
      settingsController,
      tabUIController,
      scrollCoordinator,
      performanceOptimizer,
      updateFilename,
      showWelcomePage
    });
  }

  async onInit() {
    this.listenToTabs('tab-created', (data) => this.handleTabCreated(data));
    this.listenToTabs('tabs-batch-created', (data) => this.handleTabsBatchCreated(data));
    this.listenToTabs('tab-removed', (data) => this.handleTabRemoved(data));
    this.listenToTabs('tab-activated', (data) => this.handleTabActivated(data));
    this.listenToTabs('tab-reordered', () => this.updateTabChrome());
    this.listenToTabs('tab-content-updated', () => this.tabUIController.updateTabUI());
    this.listenToTabs('tab-saved', () => this.tabUIController.updateTabUI());
    this.listenToTabs('all-tabs-closed', (data) => this.handleAllTabsClosed(data));
  }

  listenToTabs(event, handler) {
    this.tabManager.on(event, handler);
    this.tabEventHandlers.push({ event, handler });
  }

  updateTabChrome() {
    this.tabUIController.updateTabUI();
    if (this.settingsController.getPinnedTabsEnabled()) {
      this.tabUIController.updatePinnedTabs();
    }
  }

  handleTabCreated({ tab }) {
    this.performanceOptimizer?.trackTabAccess(tab.id);
    this.updateTabChrome();
    // TabCollection activates a new tab before emitting tab-created. Do not
    // activate it again here; doing so used to load every new tab twice.
  }

  handleTabsBatchCreated({ tabs }) {
    for (const tab of tabs) this.performanceOptimizer?.trackTabAccess(tab.id);
    this.updateTabChrome();
  }

  handleTabRemoved({ tab, index }) {
    tab.disposeEditorDocument(this.editorComponent.getEditorAdapter());
    this.updateTabChrome();

    const tabModal = document.getElementById('tab-modal');
    if (tabModal?.style.display === 'flex') {
      if (this.tabManager.hasTabs()) this.tabUIController.showTabModal();
      else this.tabUIController.hideTabModal();
    }

    if (!this.tabManager.hasTabs()) {
      this.showWelcomePage();
      return;
    }

    // Normally TabCollection promotes the neighboring tab synchronously.
    // Retain a guarded recovery path for restored/dormant collections.
    queueMicrotask(() => {
      if (this.tabManager.getActiveTab()) return;
      const tabs = this.tabManager.getAllTabs();
      const replacement = tabs[Math.min(index, tabs.length - 1)];
      if (replacement) this.switchToTab(replacement.id);
    });
  }

  handleTabActivated({ tab }) {
    const loadVersion = ++this.loadVersion;
    const wasWelcome = this.modeController.isWelcomeMode();

    if (this.performanceOptimizer?.virtualizedTabs.has(tab.id)) {
      this.performanceOptimizer.restoreTab(tab.id);
    }

    this.loadTabContent(tab, loadVersion);
    if (wasWelcome) {
      this.modeController.setMode(this.settingsController.getDefaultMode());
    }
    this.tabUIController.updateTabUI();
  }

  handleAllTabsClosed({ closedTabs = [] } = {}) {
    const editor = this.editorComponent.getEditorAdapter();
    for (const tab of closedTabs) tab.disposeEditorDocument(editor);
    const tabModal = document.getElementById('tab-modal');
    if (tabModal?.style.display === 'flex') this.tabUIController.hideTabModal();
    this.performanceOptimizer?.clearAllVirtualTabs();
    if (this.settingsController.getPinnedTabsEnabled()) {
      this.tabUIController.updatePinnedTabs();
    }
    this.showWelcomePage();
    this.tabUIController.updateTabUI();
  }

  switchToTab(tabId) {
    const startTime = performance.now();
    const currentTab = this.tabManager.getActiveTab();
    const currentTabId = currentTab?.id;
    if (!this.tabManager.getTab(tabId)) return false;

    if (currentTabId === tabId) return true;

    if (this.performanceOptimizer?.virtualizedTabs.has(tabId)) {
      this.performanceOptimizer.restoreTab(tabId);
    }
    if (currentTab) this.scrollCoordinator.capture(currentTab);
    this.performanceOptimizer?.trackTabAccess(tabId);

    const success = this.tabManager.switchToTab(tabId);
    if (!success) return false;

    if (this.performanceOptimizer) {
      const duration = performance.now() - startTime;
      const allTabs = this.tabManager.getAllTabs();
      this.performanceOptimizer.trackTabSwitch(duration, currentTabId, tabId);
      this.performanceOptimizer.benchmarkTabOperation('Tab Switch', startTime, allTabs.length);
    }
    return true;
  }

  switchRelative(direction) {
    const tabs = this.tabManager.getAllTabs();
    if (tabs.length <= 1) return false;

    const activeTab = this.tabManager.getActiveTab();
    const currentIndex = activeTab
      ? tabs.findIndex((tab) => tab.id === activeTab.id)
      : -1;

    let targetIndex;
    if (currentIndex === -1) {
      targetIndex = direction < 0 ? tabs.length - 1 : 0;
    } else {
      targetIndex = (currentIndex + direction + tabs.length) % tabs.length;
    }

    return this.switchToTab(tabs[targetIndex].id);
  }

  switchToNextTab() {
    return this.switchRelative(1);
  }

  switchToPreviousTab() {
    return this.switchRelative(-1);
  }

  loadTabContent(tab, loadVersion = this.loadVersion) {
    const startTime = performance.now();
    if (!this.isCurrentLoad(tab, loadVersion)) return;

    this.restoreTabScroll(tab, loadVersion);
    this.documentComponent.currentFile = tab.filePath;
    this.documentComponent.content = tab.content;
    this.documentComponent.isDirty = tab.isDirty;

    const tabs = this.tabManager.getAllTabs();
    const tabIndex = tabs.findIndex((candidate) => candidate.id === tab.id);
    if (this.performanceOptimizer?.shouldLazyLoadTab(tabIndex, tabs.length)) {
      this.loadTabContentLazy(tab, loadVersion);
    } else {
      this.loadTabContentFull(tab, loadVersion);
    }

    this.performanceOptimizer?.benchmarkTabOperation('Tab Load', startTime, tabs.length);
  }

  loadEditorDocument(tab, loadVersion) {
    if (!this.isCurrentLoad(tab, loadVersion)) return false;
    const editor = this.editorComponent.getEditorAdapter();
    if (editor) {
      const editorDocument = tab.getEditorDocument(editor);
      this.editorComponent.setEditorDocument(editorDocument, tab.editorViewState);
    } else {
      this.editorComponent.emit('set-content', { content: tab.content });
    }
    this.restoreTabScroll(tab, loadVersion);
    return true;
  }

  loadTabContentFull(tab, loadVersion) {
    if (!this.loadEditorDocument(tab, loadVersion)) return;
    this.renderTabPreview(tab, loadVersion);
    this.showPreviewForCurrentMode();
    this.updateDocumentChrome(tab);
  }

  loadTabContentLazy(tab, loadVersion) {
    this.updateDocumentChrome(tab);
    const defer = window.requestIdleCallback || ((callback) => setTimeout(callback, 0));
    defer(() => {
      if (!this.loadEditorDocument(tab, loadVersion)) return;
      this.renderTabPreview(tab, loadVersion);
      this.showPreviewForCurrentMode();
    }, { timeout: 1000 });
  }

  updateDocumentChrome(tab) {
    this.updateFilename(tab.fileName, tab.isDirty);
    this.toolbarComponent.emit('document-state-changed', {
      hasDocument: true,
      isDirty: tab.isDirty
    });
  }

  showPreviewForCurrentMode() {
    const mode = this.modeController.getCurrentMode();
    if (mode === 'preview' || mode === 'split') this.previewComponent.showPreview();
  }

  isCurrentLoad(tab, loadVersion) {
    return this.loadVersion === loadVersion
      && this.tabManager.getActiveTab()?.id === tab.id;
  }

  renderTabPreview(tab, loadVersion) {
    this.previewComponent.setCurrentFilePath(tab.filePath);
    const rendering = this.previewComponent.updatePreview(tab.content);
    Promise.resolve(rendering).finally(() => {
      if (this.isCurrentLoad(tab, loadVersion)) this.restoreTabScroll(tab, loadVersion);
    });
  }

  restoreTabScroll(tab, loadVersion) {
    const isCurrent = () => this.isCurrentLoad(tab, loadVersion);
    this.scrollCoordinator.restoreTab(tab, isCurrent);
  }

  onDestroy() {
    for (const { event, handler } of this.tabEventHandlers) {
      this.tabManager?.off(event, handler);
    }
    this.tabEventHandlers = [];
    this.loadVersion++;
  }
}

window.TabSessionController = TabSessionController;
export { TabSessionController };
