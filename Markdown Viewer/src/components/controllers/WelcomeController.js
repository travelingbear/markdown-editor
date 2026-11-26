/**
 * Owns the welcome screen: its commands, their DOM listener lifecycle, and the
 * application state shown when no document is open.
 */
class WelcomeController extends BaseComponent {
  constructor(options = {}) {
    super('WelcomeController', options);
    this.fileController = null;
    this.documentComponent = null;
    this.tabManager = null;
    this.uiController = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.modeController = null;
    this.tabUIController = null;
    this.scrollCoordinator = null;
    this.statusBarController = null;
    this.domListeners = [];
    this.isSetup = false;
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  /**
   * Return the application to the welcome state after the last document is
   * closed. Welcome is an application state, not an empty preview document.
   */
  showWelcomePage() {
    this.editorComponent.emit('set-content', { content: '' });
    this.previewComponent.emit('update-preview', { content: '', filePath: null });
    this.statusBarController.updateFilename('Welcome', false);
    this.toolbarComponent.emit('document-state-changed', {
      hasDocument: false,
      isDirty: false
    });
    this.modeController.enterWelcomeMode();
    this.tabUIController.updateTabUIForWelcome();
    this.scrollCoordinator.updateButton();
  }

  addClickListener(elementId, handler) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.addEventListener('click', handler);
    this.domListeners.push({ element, handler });
  }

  setup() {
    if (this.isSetup) return true;

    this.addClickListener('welcome-new-btn', () => {
      this.fileController.newFile(this.documentComponent, this.tabManager);
    });
    this.addClickListener('welcome-open-btn', () => {
      this.fileController.openFile(this.documentComponent, this.tabManager);
    });
    this.addClickListener('welcome-help-btn', () => this.uiController.showHelp());
    this.addClickListener('welcome-about-btn', () => this.uiController.showAbout());
    this.addClickListener('welcome-settings-btn', () => {
      Promise.resolve(this.uiController.showSettings()).catch((error) => {
        console.error('[WelcomeController] Failed to open settings:', error);
      });
    });
    this.addClickListener('clear-history-btn', () => {
      this.fileController.clearFileHistory(this.documentComponent);
    });

    this.isSetup = true;
    return true;
  }

  onDestroy() {
    this.domListeners.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.domListeners = [];
    this.isSetup = false;
    this.fileController = null;
    this.documentComponent = null;
    this.tabManager = null;
    this.uiController = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.modeController = null;
    this.tabUIController = null;
    this.scrollCoordinator = null;
    this.statusBarController = null;
  }
}

window.WelcomeController = WelcomeController;
export { WelcomeController };
