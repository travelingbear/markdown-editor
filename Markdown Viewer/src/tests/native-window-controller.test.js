import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/NativeWindowController.js');
  await import('../components/controllers/FileController.js');
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window.__TAURI__;
});

function createNativeHarness() {
  const handlers = {};
  const closeUnlisten = vi.fn();
  const singleInstanceUnlisten = vi.fn();
  const appWindow = {
    onCloseRequested: vi.fn(async (handler) => {
      handlers.close = handler;
      return closeUnlisten;
    }),
    setFocus: vi.fn(async () => {}),
    unminimize: vi.fn(async () => {})
  };
  const tauri = {
    core: { invoke: vi.fn() },
    event: {
      listen: vi.fn(async (_eventName, handler) => {
        handlers.singleInstance = handler;
        return singleInstanceUnlisten;
      })
    }
  };
  const controller = new window.NativeWindowController({
    tauriProvider: () => tauri,
    windowProvider: () => appWindow
  });

  return {
    appWindow,
    closeUnlisten,
    controller,
    handlers,
    singleInstanceUnlisten,
    tauri
  };
}

describe('NativeWindowController', () => {
  it('persists the recoverable session when the native window closes', async () => {
    const { controller, handlers } = createNativeHarness();
    const tabManager = { persistTabs: vi.fn() };
    controller.setDependencies({ tabManager, documentComponent: {} });

    await controller.setupWindowCloseHandler();
    handlers.close();

    expect(tabManager.persistTabs).toHaveBeenCalledOnce();
  });

  it('focuses the existing window and opens forwarded files as one batch', async () => {
    const { appWindow, controller, handlers } = createNativeHarness();
    const documentComponent = { openFile: vi.fn(async () => {}) };
    controller.setDependencies({ tabManager: {}, documentComponent });

    await controller.setupSingleInstanceHandler();
    const files = ['C:\\notes\\one.md', 'C:\\notes\\two.md'];
    await handlers.singleInstance({ payload: files });

    expect(appWindow.setFocus).toHaveBeenCalledOnce();
    expect(appWindow.unminimize).toHaveBeenCalledOnce();
    expect(documentComponent.openFile).toHaveBeenCalledOnce();
    expect(documentComponent.openFile).toHaveBeenCalledWith(files);
  });

  it('registers listeners once and removes both during destruction', async () => {
    const {
      closeUnlisten,
      controller,
      singleInstanceUnlisten,
      tauri
    } = createNativeHarness();
    controller.setDependencies({ tabManager: {}, documentComponent: {} });

    await controller.setup();
    await controller.setup();
    controller.destroy();

    expect(tauri.event.listen).toHaveBeenCalledOnce();
    expect(closeUnlisten).toHaveBeenCalledOnce();
    expect(singleInstanceUnlisten).toHaveBeenCalledOnce();
  });
});

describe('FileController startup-file ownership', () => {
  it('opens and clears a startup file through the file controller', async () => {
    const invoke = vi.fn(async (command) => {
      if (command === 'get_startup_file') return 'C:\\notes\\startup.md';
      return null;
    });
    window.__TAURI__ = { core: { invoke } };
    const documentComponent = { openFile: vi.fn(async () => {}) };
    const controller = new window.FileController();

    await expect(controller.checkStartupFile(documentComponent)).resolves.toBe(true);

    expect(documentComponent.openFile).toHaveBeenCalledWith('C:\\notes\\startup.md');
    expect(invoke).toHaveBeenNthCalledWith(1, 'get_startup_file');
    expect(invoke).toHaveBeenNthCalledWith(2, 'clear_startup_file');
  });
});

describe('NativeWindowController fullscreen', () => {
  it('toggles the native window when Tauri is available', async () => {
    const setFullscreen = vi.fn(async () => {});
    const appWindow = { isFullscreen: vi.fn(async () => false), setFullscreen };
    const controller = new window.NativeWindowController({
      tauriProvider: () => ({ window: { getCurrentWindow: () => appWindow } })
    });

    await controller.toggleFullscreen();

    expect(setFullscreen).toHaveBeenCalledWith(true);
  });

  it('leaves native fullscreen when it is already on', async () => {
    const setFullscreen = vi.fn(async () => {});
    const appWindow = { isFullscreen: vi.fn(async () => true), setFullscreen };
    const controller = new window.NativeWindowController({
      tauriProvider: () => ({ window: { getCurrentWindow: () => appWindow } })
    });

    await controller.toggleFullscreen();

    expect(setFullscreen).toHaveBeenCalledWith(false);
  });

  it('falls back to the browser Fullscreen API outside Tauri', async () => {
    const controller = new window.NativeWindowController({ tauriProvider: () => undefined });
    const requestFullscreen = vi.fn(async () => {});
    document.documentElement.requestFullscreen = requestFullscreen;

    await controller.toggleFullscreen();

    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it('never lets a fullscreen failure escape', async () => {
    const controller = new window.NativeWindowController({
      tauriProvider: () => ({
        window: {
          getCurrentWindow: () => ({
            isFullscreen: async () => { throw new Error('no window'); }
          })
        }
      })
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(controller.toggleFullscreen()).resolves.toBeUndefined();
  });
});
