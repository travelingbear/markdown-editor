import { getCurrentWindow } from '@tauri-apps/api/window';
import { persistSessionBeforeApplicationClose } from '../applicationCloseSession.js';

/**
 * Owns native-window lifecycle integration so the application orchestrator
 * does not need to know about Tauri listeners or their cleanup contracts.
 */
class NativeWindowController extends BaseComponent {
  constructor(options = {}) {
    super('NativeWindowController', options);

    this.tabManager = null;
    this.documentComponent = null;
    this.tauriProvider = options.tauriProvider || (() => window.__TAURI__);
    this.windowProvider = options.windowProvider || getCurrentWindow;
    this.unlistenCallbacks = [];
    this.setupPromise = null;
  }

  setDependencies({ tabManager, documentComponent }) {
    this.tabManager = tabManager;
    this.documentComponent = documentComponent;
  }

  setup() {
    if (!this.setupPromise) {
      this.setupPromise = Promise.all([
        this.setupWindowCloseHandler(),
        this.setupSingleInstanceHandler()
      ]);
    }

    return this.setupPromise;
  }

  trackUnlisten(unlisten) {
    if (typeof unlisten === 'function') {
      this.unlistenCallbacks.push(unlisten);
    }
  }

  /**
   * Fullscreen is a native window property; the browser Fullscreen API is only
   * the fallback for running the frontend outside Tauri.
   */
  async toggleFullscreen() {
    try {
      const nativeWindow = this.tauriProvider()?.window;
      if (nativeWindow) {
        const appWindow = nativeWindow.getCurrentWindow();
        const isFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!isFullscreen);
        return;
      }

      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('[NativeWindowController] Error toggling fullscreen:', error);
    }
  }

  async setupWindowCloseHandler() {
    if (!this.tauriProvider()?.core?.invoke) return false;

    try {
      const appWindow = this.windowProvider();
      const unlisten = await appWindow.onCloseRequested(() => {
        persistSessionBeforeApplicationClose(this.tabManager);
      });
      this.trackUnlisten(unlisten);
      return true;
    } catch (error) {
      console.error('[NativeWindowController] Error setting up close handler:', error);
      return false;
    }
  }

  async setupSingleInstanceHandler() {
    const listen = this.tauriProvider()?.event?.listen;
    if (!listen) return false;

    try {
      const unlisten = await listen('single-instance-args', async (event) => {
        try {
          await this.focusWindow();

          const files = event.payload;
          if (Array.isArray(files) && files.length > 0) {
            // DocumentComponent batches arrays, avoiding an unnecessary render
            // for every intermediate file forwarded by the second instance.
            await this.documentComponent?.openFile(files);
          }
        } catch (error) {
          console.error('[NativeWindowController] Error handling single-instance files:', error);
        }
      });
      this.trackUnlisten(unlisten);
      return true;
    } catch (error) {
      console.error('[NativeWindowController] Error setting up single-instance handler:', error);
      return false;
    }
  }

  async focusWindow() {
    try {
      const appWindow = this.windowProvider();
      await appWindow.setFocus();
      await appWindow.unminimize();
      return true;
    } catch (error) {
      console.error('[NativeWindowController] Error focusing window:', error);
      return false;
    }
  }

  onDestroy() {
    this.unlistenCallbacks.forEach((unlisten) => {
      try {
        Promise.resolve(unlisten()).catch((error) => {
          console.error('[NativeWindowController] Error removing native listener:', error);
        });
      } catch (error) {
        console.error('[NativeWindowController] Error removing native listener:', error);
      }
    });

    this.unlistenCallbacks = [];
    this.setupPromise = null;
    this.tabManager = null;
    this.documentComponent = null;
  }
}

window.NativeWindowController = NativeWindowController;
