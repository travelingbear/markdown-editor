import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/DocumentLifecycleController.js');
});

function createController({ pinnedTabs = false, currentMode = 'code' } = {}) {
  const documentComponent = { on: vi.fn(), off: vi.fn() };
  const tabsByPath = new Map();
  const tabs = [];
  let activeTab = null;
  const tabManager = {
    beginBatchUpdate: vi.fn(),
    endBatchUpdate: vi.fn(),
    getTabsCount: vi.fn(() => tabs.length),
    findTabByPath: vi.fn((path) => tabsByPath.get(path) || null),
    openFileInTab: vi.fn((filePath, content) => {
      const tab = { id: `tab-${tabs.length + 1}`, filePath, content };
      tabs.push(tab);
      tabsByPath.set(filePath, tab);
      activeTab = tab;
      return tab;
    }),
    createNewTab: vi.fn(),
    getActiveTab: vi.fn(() => activeTab),
    closeTab: vi.fn(),
    markTabSaved: vi.fn()
  };
  const modeController = {
    getCurrentMode: vi.fn(() => currentMode),
    setMode: vi.fn()
  };
  const settingsController = {
    setLastFileOpenTime: vi.fn(),
    getDefaultMode: vi.fn(() => 'split'),
    getPinnedTabsEnabled: vi.fn(() => pinnedTabs)
  };
  const tabUIController = {
    updateTabUI: vi.fn(),
    updatePinnedTabs: vi.fn()
  };
  const toolbarComponent = { emit: vi.fn() };
  const editorComponent = { emit: vi.fn() };
  const previewComponent = { emit: vi.fn() };
  const performanceOptimizer = { benchmarkTabOperation: vi.fn() };
  const switchToTab = vi.fn();
  const updateFilename = vi.fn();
  const handleError = vi.fn();
  const fileEvents = new Map();
  const fileController = {
    on: vi.fn((event, handler) => fileEvents.set(event, handler)),
    off: vi.fn()
  };
  const controller = new window.DocumentLifecycleController();
  controller.setDependencies({
    documentComponent,
    tabManager,
    modeController,
    settingsController,
    tabUIController,
    toolbarComponent,
    editorComponent,
    previewComponent,
    performanceOptimizer,
    switchToTab,
    updateFilename,
    handleError,
    fileController
  });

  return {
    controller,
    fileController,
    fileEvents,
    documentComponent,
    tabManager,
    modeController,
    settingsController,
    tabUIController,
    toolbarComponent,
    performanceOptimizer,
    switchToTab,
    updateFilename,
    handleError,
    setActiveTab: (tab) => { activeTab = tab; }
  };
}

describe('DocumentLifecycleController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('opens equal filenames from different paths while reusing an exact-path tab', () => {
    const { controller, tabManager, switchToTab } = createController();

    controller.handleDocumentOpened({ filePath: 'C:\\one\\notes.md', content: 'one' });
    controller.handleDocumentOpened({ filePath: 'C:\\two\\notes.md', content: 'two' });
    controller.handleDocumentOpened({ filePath: 'C:\\one\\notes.md', content: 'duplicate' });

    expect(tabManager.openFileInTab).toHaveBeenCalledTimes(2);
    expect(tabManager.openFileInTab).toHaveBeenNthCalledWith(
      2,
      'C:\\two\\notes.md',
      'two',
      { activate: true }
    );
    expect(switchToTab).toHaveBeenCalledWith('tab-1');
  });

  it('keeps intermediate batch files dormant and activates the final file', () => {
    const { controller, tabManager } = createController();

    controller.handleDocumentOpened({
      filePath: 'C:\\notes\\first.md',
      content: 'first',
      batchSize: 2,
      isLastInBatch: false
    });
    controller.handleDocumentOpened({
      filePath: 'C:\\notes\\second.md',
      content: 'second',
      batchSize: 2,
      isLastInBatch: true
    });

    expect(tabManager.openFileInTab).toHaveBeenNthCalledWith(
      1,
      'C:\\notes\\first.md',
      'first',
      { activate: false }
    );
    expect(tabManager.openFileInTab).toHaveBeenNthCalledWith(
      2,
      'C:\\notes\\second.md',
      'second',
      { activate: true }
    );
  });

  it('tracks one file-open batch and closes its batch update', () => {
    const { controller, tabManager, performanceOptimizer } = createController();
    vi.spyOn(performance, 'now').mockReturnValue(0);

    controller.handleOpenBatchStarted();
    controller.handleOpenBatchCompleted({ fileCount: 3 });

    expect(tabManager.beginBatchUpdate).toHaveBeenCalledOnce();
    expect(tabManager.endBatchUpdate).toHaveBeenCalledOnce();
    expect(performanceOptimizer.benchmarkTabOperation).toHaveBeenCalledWith(
      'File Open Batch',
      0,
      0,
      800
    );
  });

  it('updates tab chrome and pinned tabs when dirty state changes', () => {
    const activeTab = { id: 'active', isDirty: false };
    const {
      controller,
      tabUIController,
      toolbarComponent,
      updateFilename,
      setActiveTab
    } = createController({ pinnedTabs: true });
    setActiveTab(activeTab);

    controller.handleDirtyChanged({ isDirty: true });

    expect(activeTab.isDirty).toBe(true);
    expect(tabUIController.updateTabUI).toHaveBeenCalledOnce();
    expect(tabUIController.updatePinnedTabs).toHaveBeenCalledOnce();
    expect(updateFilename).toHaveBeenCalledWith(null, true);
    expect(toolbarComponent.emit).toHaveBeenCalledWith('document-state-changed', {
      hasDocument: true,
      isDirty: true
    });
  });

  it('switches to Code once a new file is created', async () => {
    const { controller, fileEvents, modeController } = createController();
    await controller.init();

    fileEvents.get('file-new-completed')();

    expect(modeController.setMode).toHaveBeenCalledWith('code');
  });

  it('reports file operation failures through the error boundary', async () => {
    const { controller, fileEvents, handleError } = createController();
    await controller.init();
    const error = new Error('disk full');

    fileEvents.get('file-error')({ error, type: 'Save' });

    expect(handleError).toHaveBeenCalledWith(error, 'Save');
  });

  it('removes the file listeners during teardown', async () => {
    const { controller, fileController } = createController();
    await controller.init();
    const registrations = fileController.on.mock.calls;

    controller.destroy();

    expect(registrations).toHaveLength(2);
    expect(fileController.off).toHaveBeenCalledTimes(2);
    for (const [event, handler] of registrations) {
      expect(fileController.off).toHaveBeenCalledWith(event, handler);
    }
  });

  it('removes every document listener during teardown', async () => {
    const { controller, documentComponent } = createController();
    await controller.init();
    const registrations = documentComponent.on.mock.calls;

    controller.destroy();

    expect(registrations).toHaveLength(9);
    expect(documentComponent.off).toHaveBeenCalledTimes(9);
    for (const [event, handler] of registrations) {
      expect(documentComponent.off).toHaveBeenCalledWith(event, handler);
    }
  });
});
