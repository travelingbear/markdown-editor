import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/TabState.js');
  await import('../components/TabCollection.js');
  await import('../components/TabManager.js');
  await import('../components/controllers/TabSessionController.js');
});

function createSession({ activeTab = null, tabs = [], mode = 'code' } = {}) {
  let currentTab = activeTab;
  const tabManager = {
    on: vi.fn(),
    off: vi.fn(),
    getActiveTab: vi.fn(() => currentTab),
    getTab: vi.fn((id) => tabs.find((tab) => tab.id === id)),
    getAllTabs: vi.fn(() => tabs),
    hasTabs: vi.fn(() => tabs.length > 0),
    switchToTab: vi.fn((id) => {
      currentTab = tabs.find((tab) => tab.id === id) || null;
      return Boolean(currentTab);
    })
  };
  const editorAdapter = {
    createDocument: vi.fn(),
    disposeDocument: vi.fn()
  };
  const editorComponent = {
    getEditorAdapter: vi.fn(() => editorAdapter),
    setEditorDocument: vi.fn(),
    emit: vi.fn()
  };
  const previewComponent = {
    setCurrentFilePath: vi.fn(),
    updatePreview: vi.fn(() => Promise.resolve()),
    showPreview: vi.fn()
  };
  const documentComponent = {};
  const toolbarComponent = { emit: vi.fn() };
  const modeController = {
    getCurrentMode: vi.fn(() => mode),
    isWelcomeMode: vi.fn(() => mode === 'welcome'),
    setMode: vi.fn()
  };
  const settingsController = {
    getDefaultMode: vi.fn(() => 'code'),
    getPinnedTabsEnabled: vi.fn(() => false)
  };
  const tabUIController = {
    updateTabUI: vi.fn(),
    updatePinnedTabs: vi.fn(),
    showTabModal: vi.fn(),
    hideTabModal: vi.fn()
  };
  const scrollCoordinator = {
    capture: vi.fn(),
    restoreTab: vi.fn()
  };
  const performanceOptimizer = {
    virtualizedTabs: new Set(),
    restoreTab: vi.fn(),
    trackTabAccess: vi.fn(),
    trackTabSwitch: vi.fn(),
    benchmarkTabOperation: vi.fn(),
    shouldLazyLoadTab: vi.fn(() => false),
    clearAllVirtualTabs: vi.fn()
  };
  const session = new window.TabSessionController();
  session.setDependencies({
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
    updateFilename: vi.fn(),
    showWelcomePage: vi.fn()
  });
  return {
    session,
    tabManager,
    editorComponent,
    previewComponent,
    documentComponent,
    toolbarComponent,
    modeController,
    tabUIController,
    scrollCoordinator,
    performanceOptimizer
  };
}

describe('TabSessionController', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="tab-modal" style="display: none"></div>';
  });

  it('captures the outgoing tab exactly once before switching', () => {
    const first = { id: 'first' };
    const second = { id: 'second' };
    const { session, tabManager, scrollCoordinator } = createSession({
      activeTab: first,
      tabs: [first, second]
    });

    expect(session.switchToTab('second')).toBe(true);

    expect(scrollCoordinator.capture).toHaveBeenCalledOnce();
    expect(scrollCoordinator.capture).toHaveBeenCalledWith(first);
    expect(tabManager.switchToTab).toHaveBeenCalledOnce();
    expect(tabManager.switchToTab).toHaveBeenCalledWith('second');
  });

  it('does not reactivate the already-active tab', () => {
    const tab = { id: 'active' };
    const { session, tabManager, scrollCoordinator } = createSession({
      activeTab: tab,
      tabs: [tab]
    });

    expect(session.switchToTab('active')).toBe(true);

    expect(scrollCoordinator.capture).not.toHaveBeenCalled();
    expect(tabManager.switchToTab).not.toHaveBeenCalled();
  });

  it('wraps next and previous navigation at both ends of the tab list', () => {
    const first = { id: 'first' };
    const second = { id: 'second' };
    const third = { id: 'third' };
    const { session, tabManager } = createSession({
      activeTab: third,
      tabs: [first, second, third]
    });

    expect(session.switchToNextTab()).toBe(true);
    expect(tabManager.switchToTab).toHaveBeenLastCalledWith('first');
    expect(session.switchToPreviousTab()).toBe(true);
    expect(tabManager.switchToTab).toHaveBeenLastCalledWith('third');
  });

  it('recovers relative navigation when no listed tab is active', () => {
    const first = { id: 'first' };
    const second = { id: 'second' };
    const missing = { id: 'missing' };
    const { session, tabManager } = createSession({
      activeTab: missing,
      tabs: [first, second]
    });

    expect(session.switchToNextTab()).toBe(true);
    expect(tabManager.switchToTab).toHaveBeenLastCalledWith('first');

    tabManager.getActiveTab.mockReturnValue(missing);
    expect(session.switchToPreviousTab()).toBe(true);
    expect(tabManager.switchToTab).toHaveBeenLastCalledWith('second');
  });

  it('does not activate a newly created tab a second time', () => {
    const tab = { id: 'new' };
    const { session, tabManager, performanceOptimizer } = createSession({
      activeTab: tab,
      tabs: [tab]
    });

    session.handleTabCreated({ tab });

    expect(performanceOptimizer.trackTabAccess).toHaveBeenCalledWith('new');
    expect(tabManager.switchToTab).not.toHaveBeenCalled();
  });

  it('loads a real newly-created tab only once across activation and creation events', async () => {
    const actualTabManager = new window.TabManager();
    const { session } = createSession();
    session.tabManager = actualTabManager;
    session.loadTabContent = vi.fn();
    await session.init();

    actualTabManager.createNewTab('one load');

    expect(session.loadTabContent).toHaveBeenCalledOnce();
  });

  it('loads an activated tab into the canonical document state', () => {
    const tab = {
      id: 'tab-1',
      filePath: 'C:\\notes.md',
      fileName: 'notes.md',
      content: '# Notes',
      isDirty: true,
      editorViewState: null,
      getEditorDocument: vi.fn(() => ({ id: 'document-1' }))
    };
    const { session, documentComponent, editorComponent, previewComponent } = createSession({
      activeTab: tab,
      tabs: [tab]
    });
    session.loadVersion = 1;

    session.loadTabContent(tab, 1);

    expect(documentComponent).toMatchObject({
      currentFile: 'C:\\notes.md',
      content: '# Notes',
      isDirty: true
    });
    expect(editorComponent.setEditorDocument).toHaveBeenCalledWith({ id: 'document-1' }, null);
    expect(previewComponent.updatePreview).toHaveBeenCalledWith('# Notes');
  });

  it('drops a deferred lazy load after another tab becomes active', () => {
    const first = { id: 'first', fileName: 'first.md', content: 'first', isDirty: false };
    const second = { id: 'second' };
    const { session, tabManager, editorComponent, performanceOptimizer } = createSession({
      activeTab: first,
      tabs: [first, second]
    });
    performanceOptimizer.shouldLazyLoadTab.mockReturnValue(true);
    let deferredCallback;
    window.requestIdleCallback = vi.fn((callback) => {
      deferredCallback = callback;
    });
    session.loadVersion = 1;

    session.loadTabContent(first, 1);
    session.loadVersion = 2;
    tabManager.getActiveTab.mockReturnValue(second);
    deferredCallback();

    expect(editorComponent.setEditorDocument).not.toHaveBeenCalled();
    delete window.requestIdleCallback;
  });

  it('does not reactivate a tab that TabCollection already promoted on close', async () => {
    const closed = { id: 'closed', disposeEditorDocument: vi.fn() };
    const promoted = { id: 'promoted' };
    const { session, tabManager } = createSession({ activeTab: promoted, tabs: [promoted] });

    session.handleTabRemoved({ tab: closed, index: 0 });
    await Promise.resolve();

    expect(tabManager.switchToTab).not.toHaveBeenCalled();
  });

  it('disposes every editor document when all tabs close together', () => {
    const first = { id: 'first', disposeEditorDocument: vi.fn() };
    const second = { id: 'second', disposeEditorDocument: vi.fn() };
    const { session, editorComponent } = createSession({ tabs: [] });

    session.handleAllTabsClosed({ closedTabs: [first, second] });

    const editor = editorComponent.getEditorAdapter();
    expect(first.disposeEditorDocument).toHaveBeenCalledWith(editor);
    expect(second.disposeEditorDocument).toHaveBeenCalledWith(editor);
  });
});
