import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/TabUIController.js');
});

beforeEach(() => {
  document.body.innerHTML = '<div id="tab-modal" style="display: none"></div>';
  vi.restoreAllMocks();
});

function createHarness() {
  const tabs = [
    { id: 'first', content: 'first content', filePath: 'C:\\notes\\first.md' },
    { id: 'second', content: 'second content', filePath: 'C:\\notes\\second.md' },
    { id: 'third', content: 'third content', filePath: null }
  ];
  const invoke = vi.fn(async () => {});
  const tabManager = {
    getTab: vi.fn((tabId) => tabs.find((tab) => tab.id === tabId)),
    getAllTabs: vi.fn(() => tabs),
    moveTabToPosition: vi.fn(() => true),
    closeTab: vi.fn(async () => true),
    closeAllTabs: vi.fn(async () => true),
    createNewTab: vi.fn(() => ({ id: 'duplicate' }))
  };
  const settingsController = {
    getPinnedTabsEnabled: vi.fn(() => false),
    setPinnedTabsEnabled: vi.fn()
  };
  const controller = new window.TabUIController({
    tauriProvider: () => ({ core: { invoke } })
  });
  controller.setDependencies(tabManager, settingsController, null);
  controller.showTabModal = vi.fn();

  return { controller, invoke, settingsController, tabManager, tabs };
}

describe('TabUIController context commands', () => {
  it('moves a tab and refreshes an open tab manager', async () => {
    const { controller, tabManager } = createHarness();
    document.getElementById('tab-modal').style.display = 'flex';

    await expect(controller.handleContextAction('move-to-3', 'first')).resolves.toBe(true);

    expect(tabManager.moveTabToPosition).toHaveBeenCalledWith('first', 2);
    expect(controller.showTabModal).toHaveBeenCalledOnce();
  });

  it('closes every tab except the context target', async () => {
    const { controller, tabManager } = createHarness();

    await expect(controller.handleContextAction('close-others', 'second')).resolves.toBe(true);

    expect(tabManager.closeTab).toHaveBeenCalledTimes(2);
    expect(tabManager.closeTab).toHaveBeenNthCalledWith(1, 'first');
    expect(tabManager.closeTab).toHaveBeenNthCalledWith(2, 'third');
  });

  it('routes duplicate and pinned commands through their owning APIs', async () => {
    const { controller, settingsController, tabManager } = createHarness();

    await expect(controller.handleContextAction('duplicate', 'first')).resolves.toBe(true);
    await expect(controller.handleContextAction('toggle-pinned', 'first')).resolves.toBe(true);

    expect(tabManager.createNewTab).toHaveBeenCalledWith('first content');
    expect(settingsController.setPinnedTabsEnabled).toHaveBeenCalledWith(true);
  });

  it('reveals only tabs that have a native file path', async () => {
    const { controller, invoke } = createHarness();

    await expect(controller.handleContextAction('reveal', 'first')).resolves.toBe(true);
    await expect(controller.handleContextAction('reveal', 'third')).resolves.toBe(false);

    expect(invoke).toHaveBeenCalledOnce();
    expect(invoke).toHaveBeenCalledWith('show_in_folder', {
      path: 'C:\\notes\\first.md'
    });
  });
});
