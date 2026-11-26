import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPinnedTabDropIndex } from '../components/tabReorder.js';
import { showUnsavedChangesDialog } from '../components/unsavedChangesDialog.js';
import { normalizeFilePath } from '../components/filePathIdentity.js';
import { persistSessionBeforeApplicationClose } from '../components/applicationCloseSession.js';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/DocumentComponent.js');
  await import('../components/TabState.js');
  await import('../components/TabCollection.js');
  await import('../components/TabManager.js');
  await import('../components/controllers/TabUIController.js');
});

beforeEach(() => {
  localStorage.clear();
});

describe('document safety state', () => {
  it('marks changed content dirty and emits the canonical state event', () => {
    const documentComponent = new window.DocumentComponent();
    const listener = vi.fn();
    documentComponent.content = 'before';
    documentComponent.on('document-dirty-changed', listener);

    documentComponent.handleContentChange('after');

    expect(documentComponent.content).toBe('after');
    expect(documentComponent.isDirty).toBe(true);
    expect(listener).toHaveBeenCalledWith({ isDirty: true });
  });

  it('persists dirty tab content on application close without requesting confirmation', () => {
    const tabManager = new window.TabManager();
    const tab = tabManager.createNewTab('before');
    const confirmClose = vi.spyOn(tabManager, 'confirmCloseAllUnsaved');

    tab.setContent('after');
    persistSessionBeforeApplicationClose(tabManager);

    const stored = JSON.parse(localStorage.getItem('markdownViewer_tabs'));
    expect(stored.tabs[0]).toMatchObject({ content: 'after', isDirty: true });
    expect(confirmClose).not.toHaveBeenCalled();

    const restoredManager = new window.TabManager();
    restoredManager.loadPersistedTabs();
    expect(restoredManager.getAllTabs()[0]).toMatchObject({ content: 'after', isDirty: true });
  });

  it('shows explicit close and return actions', async () => {
    const decision = showUnsavedChangesDialog(['notes.md']);

    expect(document.querySelector('.unsaved-discard-btn')?.textContent).toBe('Close without saving');
    expect(document.querySelector('.unsaved-return-btn')?.textContent).toBe('Return to document');

    document.querySelector('.unsaved-return-btn').click();
    await expect(decision).resolves.toBe(false);
  });

  it('detects divergence from the saved baseline even if a dirty flag is stale', () => {
    const tab = new window.TabState('tab-safety', { content: 'saved', isDirty: false });
    tab.content = 'changed';
    tab.isDirty = false;

    expect(tab.hasUnsavedChanges()).toBe(true);
  });
});

describe('pinned tab reordering', () => {
  it('calculates drops in both directions without an off-by-one jump', () => {
    expect(getPinnedTabDropIndex(0, 2, true, 4)).toBe(2);
    expect(getPinnedTabDropIndex(3, 1, false, 4)).toBe(1);
    expect(getPinnedTabDropIndex(2, 0, false, 4)).toBe(0);
  });

  it('reorders and persists tabs through TabManager', () => {
    const tabManager = new window.TabManager();
    const first = tabManager.createNewTab('first');
    tabManager.createNewTab('second');
    tabManager.createNewTab('third');

    expect(tabManager.moveTabToPosition(first.id, 0)).toBe(true);
    expect(tabManager.getAllTabs().map((tab) => tab.content)).toEqual(['first', 'third', 'second']);

    const stored = JSON.parse(localStorage.getItem('markdownViewer_tabs'));
    expect(stored.tabs.map((tab) => tab.content)).toEqual(['first', 'third', 'second']);
  });

  it('promotes another tab when the active tab closes', () => {
    const tabManager = new window.TabManager();
    tabManager.createNewTab('dormant one');
    tabManager.createNewTab('dormant two');
    const active = tabManager.createNewTab('active');

    tabManager.tabCollection.removeTab(active.id);

    expect(tabManager.getTabsCount()).toBe(2);
    expect(tabManager.getActiveTab()).not.toBeNull();
    expect(tabManager.getActiveTab().content).toBe('dormant two');
  });

  it('commits a pointer-based pinned-tab reorder without a browser drop event', () => {
    const controller = new window.TabUIController();
    const first = { id: 'first' };
    const second = { id: 'second' };
    const moveTabToPosition = vi.fn(() => true);
    controller.tabManager = {
      getAllTabs: () => [first, second],
      moveTabToPosition
    };

    const list = document.createElement('div');
    const source = document.createElement('div');
    source.className = 'pinned-tab';
    source.dataset.tabId = first.id;
    const target = document.createElement('div');
    target.className = 'pinned-tab';
    target.dataset.tabId = second.id;
    list.append(source, target);
    document.body.appendChild(list);

    controller.pinnedTabDrag = {
      tabId: first.id,
      pointerId: 7,
      source,
      isDragging: true,
      target
    };
    controller.finishPinnedTabPointerDrag({ pointerId: 7, clientX: 0, clientY: 0 }, list);

    expect(moveTabToPosition).toHaveBeenCalledWith(first.id, 1);
    list.remove();
  });

  it('reorders tabs from the status-bar tab list', () => {
    const controller = new window.TabUIController();
    const first = { id: 'first' };
    const second = { id: 'second' };
    const moveTabToPosition = vi.fn(() => true);
    controller.tabManager = {
      getAllTabs: () => [first, second],
      moveTabToPosition
    };

    const list = document.createElement('div');
    list.id = 'tab-dropdown-list';
    const source = document.createElement('div');
    source.className = 'tab-dropdown-item';
    source.dataset.tabId = first.id;
    const target = document.createElement('div');
    target.className = 'tab-dropdown-item';
    target.dataset.tabId = second.id;
    list.append(source, target);
    document.body.appendChild(list);

    controller.tabListDrag = {
      tabId: first.id,
      pointerId: 8,
      source,
      container: list,
      isDragging: true,
      target,
      insertAfter: true
    };
    controller.finishTabListPointerDrag({ pointerId: 8 });

    expect(moveTabToPosition).toHaveBeenCalledWith(first.id, 1);
    list.remove();
  });
});

describe('file path identity', () => {
  it('allows equal filenames from different directories', async () => {
    const tabManager = new window.TabManager();

    await tabManager.openFileInTab('C:\\one\\notes.md', 'one');
    await tabManager.openFileInTab('C:\\two\\notes.md', 'two');

    expect(tabManager.getTabsCount()).toBe(2);
    expect(tabManager.getAllTabs().map((tab) => tab.filePath)).toContain('C:\\one\\notes.md');
    expect(tabManager.getAllTabs().map((tab) => tab.filePath)).toContain('C:\\two\\notes.md');
  });

  it('recognizes an equivalent Windows path as the same file', async () => {
    const tabManager = new window.TabManager();
    const original = await tabManager.openFileInTab('C:\\Notes\\.\\daily.md', 'original');
    const duplicate = await tabManager.openFileInTab('c:/notes/daily.md', 'ignored');

    expect(duplicate.id).toBe(original.id);
    expect(tabManager.getTabsCount()).toBe(1);
    expect(normalizeFilePath('C:\\Notes\\..\\Notes\\daily.md')).toBe('c:/notes/daily.md');
  });

  it('preserves Linux path case sensitivity', () => {
    expect(normalizeFilePath('/home/user/Notes.md')).not.toBe(normalizeFilePath('/home/user/notes.md'));
  });
});

describe('multi-file opening', () => {
  it('can create intermediate tabs without activating them', async () => {
    const tabManager = new window.TabManager();
    const activated = vi.fn();
    tabManager.on('tab-activated', activated);

    await tabManager.openFileInTab('/notes/one.md', 'one', { activate: false });
    await tabManager.openFileInTab('/notes/two.md', 'two', { activate: false });
    await tabManager.openFileInTab('/notes/three.md', 'three', { activate: true });

    expect(tabManager.getTabsCount()).toBe(3);
    expect(tabManager.getActiveTab().filePath).toBe('/notes/three.md');
    expect(activated).toHaveBeenCalledOnce();
  });

  it('coalesces batch persistence and UI events into one update', async () => {
    const tabManager = new window.TabManager();
    const created = vi.fn();
    const batchCreated = vi.fn();
    const activated = vi.fn();
    tabManager.on('tab-created', created);
    tabManager.on('tabs-batch-created', batchCreated);
    tabManager.on('tab-activated', activated);

    tabManager.beginBatchUpdate();
    await tabManager.openFileInTab('/notes/one.md', 'one', { activate: false });
    await tabManager.openFileInTab('/notes/two.md', 'two', { activate: false });
    await tabManager.openFileInTab('/notes/three.md', 'three', { activate: true });
    tabManager.endBatchUpdate();

    expect(created).not.toHaveBeenCalled();
    expect(batchCreated).toHaveBeenCalledOnce();
    expect(batchCreated.mock.calls[0][0].tabs).toHaveLength(3);
    expect(activated).toHaveBeenCalledOnce();
  });

  it('emits batch position and a post-picker start time for every file', async () => {
    const documentComponent = new window.DocumentComponent();
    documentComponent.readFile = vi.fn(async (path) => `content:${path}`);
    documentComponent.addToFileHistory = vi.fn();
    const opened = [];
    documentComponent.on('document-opened', (data) => opened.push(data));

    await documentComponent.openFile(['/notes/one.md', '/notes/two.md']);

    expect(opened).toHaveLength(2);
    expect(opened[0]).toMatchObject({ batchIndex: 0, batchSize: 2, isLastInBatch: false });
    expect(opened[1]).toMatchObject({ batchIndex: 1, batchSize: 2, isLastInBatch: true });
    expect(opened.every((item) => Number.isFinite(item.openStartedAt))).toBe(true);
  });
});

describe('dormant pinned tab activation', () => {
  it('promotes restored tabs when the only newly opened tab closes', () => {
    const tabManager = new window.TabManager();
    const firstRestored = tabManager.createNewTab('first restored');
    const secondRestored = tabManager.createNewTab('second restored');

    // Persisted tabs deliberately start dormant on application launch.
    tabManager.tabCollection.activeTabId = null;
    firstRestored.setActive(false);
    secondRestored.setActive(false);

    const newlyOpened = tabManager.createNewTab('new document');
    tabManager.tabCollection.removeTab(newlyOpened.id);

    expect(tabManager.getActiveTab()).not.toBeNull();
    expect(tabManager.getActiveTab().id).toBe(secondRestored.id);

    expect(tabManager.switchToTab(firstRestored.id)).toBe(true);
    expect(tabManager.getActiveTab().id).toBe(firstRestored.id);
  });

  it('restores every persisted tab as dormant until explicitly selected', async () => {
    const original = new window.TabManager();
    original.createNewTab('first');
    original.createNewTab('second');
    original.persistTabs();

    const restored = new window.TabManager();
    await restored.init();

    expect(restored.getActiveTab()).toBeNull();
    expect(restored.getAllTabs().every((tab) => tab.isActive === false)).toBe(true);
  });
});

describe('tab scroll persistence', () => {
  it('preserves the canonical relative position across serialization', () => {
    const tab = new window.TabState('tab-scroll');
    tab.setScrollPosition(400, 800, 0.5, 'editor');

    const restored = window.TabState.fromJSON(tab.toJSON());

    expect(restored.scrollPosition).toEqual({
      editor: 400,
      preview: 800,
      ratio: 0.5,
      source: 'editor'
    });
  });
});

describe('tab activation ownership', () => {
  it('does not emit another activation when selecting the active tab', () => {
    const tabManager = new window.TabManager();
    const tab = tabManager.createNewTab('active');
    const activated = vi.fn();
    tabManager.on('tab-activated', activated);

    expect(tabManager.switchToTab(tab.id)).toBe(true);

    expect(activated).not.toHaveBeenCalled();
  });
});
