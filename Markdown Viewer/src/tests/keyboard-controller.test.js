import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/KeyboardController.js');
});

let controller;

function createController(mode = 'preview') {
  const documentComponent = {};
  const tabManager = {
    getAllTabs: vi.fn(() => []),
    hasTabs: vi.fn(() => false)
  };
  const fileController = {
    newFile: vi.fn(),
    openFile: vi.fn(),
    saveFile: vi.fn(),
    saveAsFile: vi.fn(),
    closeFile: vi.fn()
  };
  const uiController = {
    isDistractionFree: false,
    toggleTheme: vi.fn(() => ({ theme: 'dark', isRetroTheme: false })),
    showSettings: vi.fn(),
    showHelp: vi.fn()
  };
  const modeController = {
    getCurrentMode: vi.fn(() => mode),
    setMode: vi.fn()
  };
  const toolbarComponent = {
    changeFontSize: vi.fn(),
    changeZoom: vi.fn(),
    resetFontSize: vi.fn(),
    resetZoom: vi.fn(),
    hideLinkModal: vi.fn(),
    hideImageModal: vi.fn()
  };
  const markdownActionController = { handleMarkdownAction: vi.fn() };
  const actions = {
    toggleMarkdownToolbar: vi.fn(),
    switchToNextTab: vi.fn(),
    switchToPreviousTab: vi.fn(),
    switchToTab: vi.fn(),
    performManualScrollSync: vi.fn(),
    toggleFindReplace: vi.fn(),
    reloadCurrentFile: vi.fn(),
    toggleFullscreen: vi.fn()
  };
  const tabUIController = { showTabModal: vi.fn() };
  const exportController = { exportToPdf: vi.fn(), exportToHtml: vi.fn() };
  const pluginModalController = { closeFromKeyboard: vi.fn() };

  controller = new window.KeyboardController();
  controller.setDependencies({
    documentComponent,
    fileController,
    uiController,
    tabManager,
    modeController,
    toolbarComponent,
    markdownActionController,
    pluginModalController,
    tabUIController,
    exportController,
    performanceOptimizer: null,
    actions
  });
  return {
    actions,
    documentComponent,
    exportController,
    fileController,
    markdownActionController,
    modeController,
    tabManager,
    tabUIController,
    toolbarComponent,
    uiController
  };
}

afterEach(() => {
  controller?.destroy();
  controller = null;
});

describe('KeyboardController shortcut ownership', () => {
  it('performs one new-document action with the complete dependency set', async () => {
    const context = createController();
    await controller.init();

    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true
    }));

    expect(context.fileController.newFile).toHaveBeenCalledOnce();
    expect(context.fileController.newFile).toHaveBeenCalledWith(
      context.documentComponent,
      context.tabManager
    );
  });

  it('keeps theme and markdown-toolbar shortcuts distinct', () => {
    const context = createController();

    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: 't',
      ctrlKey: true
    }));
    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: '?',
      ctrlKey: true,
      shiftKey: true
    }));

    expect(context.uiController.toggleTheme).toHaveBeenCalledOnce();
    expect(context.actions.toggleMarkdownToolbar).toHaveBeenCalledOnce();
  });

  it('routes keyboard zoom through the active mode exactly once', () => {
    const context = createController('preview');

    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: '=',
      ctrlKey: true
    }));

    expect(context.toolbarComponent.changeZoom).toHaveBeenCalledOnce();
    expect(context.toolbarComponent.changeZoom).toHaveBeenCalledWith(0.1);
    expect(context.toolbarComponent.changeFontSize).not.toHaveBeenCalled();
  });

  it('maps plain number shortcuts to headings and shifted numbers to modes', () => {
    const context = createController('code');

    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: '1',
      code: 'Digit1',
      ctrlKey: true
    }));
    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: '#',
      code: 'Digit3',
      ctrlKey: true,
      shiftKey: true
    }));

    expect(context.markdownActionController.handleMarkdownAction)
      .toHaveBeenCalledWith('h1');
    expect(context.modeController.setMode).toHaveBeenCalledWith('split');
  });

  it('toggles the same search shortcut open and closed', () => {
    const context = createController('code');

    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true
    }));
    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true
    }));

    expect(context.actions.toggleFindReplace).toHaveBeenCalledTimes(2);
    expect(context.actions.toggleFindReplace).toHaveBeenNthCalledWith(1, false);
    expect(context.actions.toggleFindReplace).toHaveBeenNthCalledWith(2, false);
  });

  it('routes export and tab-manager shortcuts to their owning controllers', () => {
    const context = createController('code');

    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true
    }));
    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: 'E',
      ctrlKey: true,
      shiftKey: true
    }));
    controller.handleKeyboardShortcuts(new KeyboardEvent('keydown', {
      key: 'M',
      ctrlKey: true,
      shiftKey: true
    }));

    expect(context.exportController.exportToPdf).toHaveBeenCalledOnce();
    expect(context.exportController.exportToHtml).toHaveBeenCalledOnce();
    expect(context.tabUIController.showTabModal).toHaveBeenCalledOnce();
  });
});
