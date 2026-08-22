/**
 * Coordinates browser and Tauri file-drop events. Keeping both sources behind
 * one controller preserves webview compatibility across Windows and Linux.
 */
class FileDropController extends BaseComponent {
  constructor(options = {}) {
    super('FileDropController', options);

    this.tauriProvider = options.tauriProvider || (() => window.__TAURI__);
    this.tabManager = null;
    this.settingsController = null;
    this.modeController = null;
    this.editorComponent = null;
    this.documentComponent = null;
    this.switchToTab = null;
    this.domListeners = [];
    this.nativeUnlistenCallbacks = [];
    this.setupPromise = null;
    this.isDisposed = false;
  }

  setDependencies({
    tabManager,
    settingsController,
    modeController,
    editorComponent,
    documentComponent,
    switchToTab
  }) {
    this.tabManager = tabManager;
    this.settingsController = settingsController;
    this.modeController = modeController;
    this.editorComponent = editorComponent;
    this.documentComponent = documentComponent;
    this.switchToTab = switchToTab;
  }

  setup() {
    if (!this.setupPromise) {
      this.isDisposed = false;
      this.setupBrowserFileDrop();
      this.setupPromise = this.setupTauriFileDrop();
    }

    return this.setupPromise;
  }

  isExternalFileDrag(event) {
    const types = Array.from(event.dataTransfer?.types || []);
    return types.includes('Files') || (event.dataTransfer?.files?.length || 0) > 0;
  }

  isWelcomeVisible() {
    const welcomePage = document.getElementById('welcome-page');
    return Boolean(welcomePage && welcomePage.style.display !== 'none');
  }

  shouldOpenDroppedFile(target) {
    const isToolbar = Boolean(target?.closest?.('.toolbar'));
    const isPreview = Boolean(target?.closest?.('.preview-pane'));
    return isToolbar || isPreview || this.isWelcomeVisible() || !this.tabManager?.hasTabs();
  }

  addDomListener(target, eventName, handler, options) {
    target.addEventListener(eventName, handler, options);
    this.domListeners.push({ target, eventName, handler, options });
  }

  setupBrowserFileDrop() {
    const dragEnterHandler = (event) => {
      if (!this.isExternalFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      document.body.classList.add('drag-over');
    };

    const dragOverHandler = (event) => {
      if (!this.isExternalFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };

    const dragLeaveHandler = (event) => {
      if (!this.isExternalFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      if (!event.relatedTarget || !document.contains(event.relatedTarget)) {
        document.body.classList.remove('drag-over');
      }
    };

    const dropHandler = (event) => {
      this.handleBrowserDrop(event).catch((error) => {
        console.error('[FileDropController] Error handling browser file drop:', error);
      });
    };

    // Capture at document level so editor widgets cannot consume external file
    // drops before the application decides whether to open or insert them.
    this.addDomListener(document, 'dragenter', dragEnterHandler, true);
    this.addDomListener(document, 'dragover', dragOverHandler, true);
    this.addDomListener(document, 'dragleave', dragLeaveHandler, true);
    this.addDomListener(document, 'drop', dropHandler, true);
  }

  async handleBrowserDrop(event) {
    if (!this.isExternalFileDrag(event)) return false;

    event.preventDefault();
    event.stopPropagation();
    document.body.classList.remove('drag-over');

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length === 0) return false;

    if (this.shouldOpenDroppedFile(event.target)) {
      const markdownFile = files.find((file) => /\.(md|markdown|txt)$/i.test(file.name));
      if (!markdownFile) return false;

      // Chromium-based webviews do not expose a full path consistently. Use
      // the strongest identity available without inventing a filesystem path.
      const droppedPath = markdownFile.path || markdownFile.webkitRelativePath || markdownFile.name;
      const existingTab = this.tabManager.findTabByPath(droppedPath);
      if (existingTab) {
        this.switchToTab?.(existingTab.id);
        return true;
      }

      const content = await markdownFile.text();
      await this.tabManager.openFileInTab(droppedPath, content);
      this.modeController.setMode(this.settingsController.getDefaultMode());
      return true;
    }

    if (this.canInsertIntoCode()) {
      const position = this.editorComponent
        .getEditorAdapter()
        ?.getPositionAtClientPoint(event.clientX, event.clientY);
      return this.insertPaths(files.map((file) => file.name), position, 'drag-drop');
    }

    return false;
  }

  canInsertIntoCode() {
    return this.modeController.getCurrentMode() === 'code'
      && this.editorComponent.isEditorReady();
  }

  insertPaths(paths, position, origin) {
    const editor = this.editorComponent.getEditorAdapter();
    if (!editor) return false;

    editor.insertText(paths.join('\n'), position, origin);
    this.documentComponent.handleContentChange(editor.getContent());
    return true;
  }

  async handleTauriFileDrop(files) {
    document.body.classList.remove('drag-over');
    if (!Array.isArray(files) || files.length === 0) return false;

    if (this.isWelcomeVisible() || !this.tabManager.hasTabs()) {
      const markdownFile = files.find((filePath) => /\.(md|markdown|txt)$/i.test(filePath));
      if (!markdownFile) return false;
      await this.documentComponent.openFile(markdownFile);
      return true;
    }

    if (this.canInsertIntoCode()) {
      return this.insertPaths(files, undefined, 'tauri-file-drop');
    }

    return false;
  }

  async trackNativeUnlisten(unlisten) {
    if (typeof unlisten !== 'function') return;
    if (this.isDisposed) {
      await unlisten();
      return;
    }
    this.nativeUnlistenCallbacks.push(unlisten);
  }

  async setupTauriFileDrop() {
    const listen = this.tauriProvider()?.event?.listen;
    if (!listen) return false;

    try {
      await this.trackNativeUnlisten(await listen('tauri://file-drop', (event) => {
        this.handleTauriFileDrop(event.payload).catch((error) => {
          console.error('[FileDropController] Error handling Tauri file drop:', error);
        });
      }));
      await this.trackNativeUnlisten(await listen('tauri://file-drop-hover', () => {
        document.body.classList.add('drag-over');
      }));
      await this.trackNativeUnlisten(await listen('tauri://file-drop-cancelled', () => {
        document.body.classList.remove('drag-over');
      }));
      return true;
    } catch (error) {
      console.error('[FileDropController] Error setting up Tauri listeners:', error);
      return false;
    }
  }

  onDestroy() {
    this.isDisposed = true;
    this.domListeners.forEach(({ target, eventName, handler, options }) => {
      target.removeEventListener(eventName, handler, options);
    });
    this.domListeners = [];

    this.nativeUnlistenCallbacks.forEach((unlisten) => {
      try {
        Promise.resolve(unlisten()).catch((error) => {
          console.error('[FileDropController] Error removing Tauri listener:', error);
        });
      } catch (error) {
        console.error('[FileDropController] Error removing Tauri listener:', error);
      }
    });
    this.nativeUnlistenCallbacks = [];
    this.setupPromise = null;
    document.body?.classList.remove('drag-over');

    this.tabManager = null;
    this.settingsController = null;
    this.modeController = null;
    this.editorComponent = null;
    this.documentComponent = null;
    this.switchToTab = null;
  }
}

window.FileDropController = FileDropController;
