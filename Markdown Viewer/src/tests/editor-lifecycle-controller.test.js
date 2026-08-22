import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/EditorLifecycleController.js');
});

function createController({ activeTab = null, pinnedTabs = false } = {}) {
  const editorComponent = { on: vi.fn(), off: vi.fn() };
  const documentComponent = { emit: vi.fn() };
  const previewComponent = { emit: vi.fn() };
  const tabManager = {
    getActiveTab: vi.fn(() => activeTab),
    persistTabs: vi.fn(),
    updateTabCursor: vi.fn()
  };
  const tabUIController = {
    updateTabUI: vi.fn(),
    updatePinnedTabs: vi.fn()
  };
  const settingsController = {
    getPinnedTabsEnabled: vi.fn(() => pinnedTabs),
    updateSystemInfo: vi.fn()
  };
  const modeController = { getCurrentMode: vi.fn(() => 'split') };
  const markdownActionController = { handleMarkdownAction: vi.fn() };
  const updateCursorPosition = vi.fn();
  const controller = new window.EditorLifecycleController();
  controller.setDependencies({
    editorComponent,
    documentComponent,
    previewComponent,
    tabManager,
    tabUIController,
    settingsController,
    modeController,
    markdownActionController,
    updateCursorPosition
  });

  return {
    controller,
    editorComponent,
    documentComponent,
    previewComponent,
    tabManager,
    tabUIController,
    settingsController,
    modeController,
    markdownActionController,
    updateCursorPosition
  };
}

describe('EditorLifecycleController', () => {
  it('synchronizes an edit with the tab, canonical document, preview, and tab chrome', () => {
    const activeTab = {
      id: 'active',
      filePath: 'C:\\notes\\active.md',
      setContent: vi.fn()
    };
    const {
      controller,
      documentComponent,
      previewComponent,
      tabManager,
      tabUIController
    } = createController({ activeTab, pinnedTabs: true });

    controller.handleContentChanged({ content: '# Updated' });

    expect(activeTab.setContent).toHaveBeenCalledWith('# Updated');
    expect(documentComponent.emit).toHaveBeenCalledWith('content-changed', {
      content: '# Updated'
    });
    expect(tabManager.persistTabs).toHaveBeenCalledOnce();
    expect(tabUIController.updateTabUI).toHaveBeenCalledOnce();
    expect(tabUIController.updatePinnedTabs).toHaveBeenCalledOnce();
    expect(previewComponent.emit).toHaveBeenCalledWith('update-preview', {
      content: '# Updated',
      filePath: 'C:\\notes\\active.md'
    });
  });

  it('keeps the canonical dirty event and preview update safe without an active tab', () => {
    const { controller, documentComponent, previewComponent, tabManager } = createController();

    controller.handleContentChanged({ content: 'Fallback edit' });

    expect(documentComponent.emit).toHaveBeenCalledWith('content-changed', {
      content: 'Fallback edit'
    });
    expect(tabManager.persistTabs).not.toHaveBeenCalled();
    expect(previewComponent.emit).toHaveBeenCalledWith('update-preview', {
      content: 'Fallback edit',
      filePath: undefined
    });
  });

  it('updates both the status cursor and active tab cursor', () => {
    const activeTab = { id: 'active' };
    const { controller, tabManager, updateCursorPosition } = createController({ activeTab });

    controller.handleCursorChanged({ line: 12, col: 7 });

    expect(updateCursorPosition).toHaveBeenCalledWith(12, 7);
    expect(tabManager.updateTabCursor).toHaveBeenCalledWith('active', 12, 7);
  });

  it('refreshes system information after the lazy editor loads', () => {
    const {
      controller,
      editorComponent,
      previewComponent,
      settingsController,
      modeController
    } = createController();

    controller.handleEditorLoaded();

    expect(settingsController.updateSystemInfo).toHaveBeenCalledWith(
      editorComponent,
      previewComponent,
      'split'
    );
    expect(modeController.getCurrentMode).toHaveBeenCalledOnce();
  });

  it('routes editor markdown commands and disposes all listeners', async () => {
    const { controller, editorComponent, markdownActionController } = createController();
    await controller.init();
    const registrations = editorComponent.on.mock.calls;

    controller.handleMarkdownAction({ action: 'bold' });
    controller.destroy();

    expect(markdownActionController.handleMarkdownAction).toHaveBeenCalledWith('bold');
    expect(registrations).toHaveLength(4);
    expect(editorComponent.off).toHaveBeenCalledTimes(4);
    for (const [event, handler] of registrations) {
      expect(editorComponent.off).toHaveBeenCalledWith(event, handler);
    }
  });
});
