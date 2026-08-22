/**
 * Owns welcome-screen commands and their DOM listener lifecycle.
 */
class WelcomeController extends BaseComponent {
  constructor(options = {}) {
    super('WelcomeController', options);
    this.fileController = null;
    this.documentComponent = null;
    this.tabManager = null;
    this.uiController = null;
    this.domListeners = [];
    this.isSetup = false;
  }

  setDependencies({ fileController, documentComponent, tabManager, uiController }) {
    this.fileController = fileController;
    this.documentComponent = documentComponent;
    this.tabManager = tabManager;
    this.uiController = uiController;
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
  }
}

window.WelcomeController = WelcomeController;
