import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/FileDropController.js');
});

beforeEach(() => {
  document.body.innerHTML = '<div id="welcome-page" style="display: none"></div>';
});

afterEach(() => {
  document.body.classList.remove('drag-over');
  vi.restoreAllMocks();
});

function createHarness(options = {}) {
  const editor = {
    getPositionAtClientPoint: vi.fn(() => ({ line: 2, column: 4 })),
    insertText: vi.fn(),
    getContent: vi.fn(() => 'updated document')
  };
  const dependencies = {
    tabManager: {
      hasTabs: vi.fn(() => options.hasTabs ?? true),
      findTabByPath: vi.fn(() => null),
      openFileInTab: vi.fn(async () => {})
    },
    settingsController: { getDefaultMode: vi.fn(() => 'split') },
    modeController: {
      getCurrentMode: vi.fn(() => options.mode || 'preview'),
      setMode: vi.fn()
    },
    editorComponent: {
      isEditorReady: vi.fn(() => true),
      getEditorAdapter: vi.fn(() => editor)
    },
    documentComponent: {
      openFile: vi.fn(async () => {}),
      handleContentChange: vi.fn()
    },
    switchToTab: vi.fn()
  };
  const controller = new window.FileDropController({
    tauriProvider: options.tauriProvider || (() => undefined)
  });
  controller.setDependencies(dependencies);

  return { controller, dependencies, editor };
}

function createBrowserDrop(files, target = { closest: () => null }) {
  return {
    clientX: 100,
    clientY: 200,
    dataTransfer: { files, types: ['Files'], dropEffect: 'none' },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target
  };
}

describe('FileDropController', () => {
  it('opens a dropped Markdown file from the welcome screen using its strongest path', async () => {
    document.getElementById('welcome-page').style.display = 'flex';
    const { controller, dependencies } = createHarness({ hasTabs: false });
    const markdownFile = {
      name: 'notes.md',
      path: 'C:\\work\\notes.md',
      text: vi.fn(async () => '# Notes')
    };
    const event = createBrowserDrop([
      { name: 'cover.png', text: vi.fn() },
      markdownFile
    ]);

    await expect(controller.handleBrowserDrop(event)).resolves.toBe(true);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(markdownFile.text).toHaveBeenCalledOnce();
    expect(dependencies.tabManager.findTabByPath).toHaveBeenCalledWith('C:\\work\\notes.md');
    expect(dependencies.tabManager.openFileInTab).toHaveBeenCalledWith(
      'C:\\work\\notes.md',
      '# Notes'
    );
    expect(dependencies.modeController.setMode).toHaveBeenCalledWith('split');
  });

  it('activates an existing dropped file instead of opening a duplicate', async () => {
    document.getElementById('welcome-page').style.display = 'flex';
    const { controller, dependencies } = createHarness();
    dependencies.tabManager.findTabByPath.mockReturnValue({ id: 'existing-tab' });
    const markdownFile = { name: 'notes.md', text: vi.fn() };

    await controller.handleBrowserDrop(createBrowserDrop([markdownFile]));

    expect(dependencies.switchToTab).toHaveBeenCalledWith('existing-tab');
    expect(markdownFile.text).not.toHaveBeenCalled();
    expect(dependencies.tabManager.openFileInTab).not.toHaveBeenCalled();
  });

  it('inserts dropped names at the pointer position in Code mode', async () => {
    const { controller, dependencies, editor } = createHarness({ mode: 'code' });
    const event = createBrowserDrop([{ name: 'one.md' }, { name: 'two.txt' }]);

    await expect(controller.handleBrowserDrop(event)).resolves.toBe(true);

    expect(editor.getPositionAtClientPoint).toHaveBeenCalledWith(100, 200);
    expect(editor.insertText).toHaveBeenCalledWith(
      'one.md\ntwo.txt',
      { line: 2, column: 4 },
      'drag-drop'
    );
    expect(dependencies.documentComponent.handleContentChange)
      .toHaveBeenCalledWith('updated document');
  });

  it('handles native full paths and clears the hover overlay after a drop', async () => {
    document.getElementById('welcome-page').style.display = 'flex';
    document.body.classList.add('drag-over');
    const { controller, dependencies } = createHarness({ hasTabs: false });

    await expect(controller.handleTauriFileDrop([
      '/home/user/image.png',
      '/home/user/notes.md'
    ])).resolves.toBe(true);

    expect(dependencies.documentComponent.openFile).toHaveBeenCalledWith('/home/user/notes.md');
    expect(document.body.classList.contains('drag-over')).toBe(false);
  });

  it('sets up once and disposes browser and native listeners', async () => {
    const unlistenCallbacks = [vi.fn(), vi.fn(), vi.fn()];
    const listen = vi.fn(async () => unlistenCallbacks[listen.mock.calls.length - 1]);
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { controller } = createHarness({
      tauriProvider: () => ({ event: { listen } })
    });

    await controller.setup();
    await controller.setup();
    document.body.classList.add('drag-over');
    controller.destroy();

    expect(listen).toHaveBeenCalledTimes(3);
    expect(removeListener).toHaveBeenCalledTimes(4);
    unlistenCallbacks.forEach((unlisten) => expect(unlisten).toHaveBeenCalledOnce());
    expect(document.body.classList.contains('drag-over')).toBe(false);
  });
});
