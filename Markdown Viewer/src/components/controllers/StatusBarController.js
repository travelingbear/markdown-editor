/**
 * Owns the status bar readouts: cursor position and the document name.
 *
 * The filename is shown by the tab UI whenever tabs exist, so this controller
 * only renders the untabbed case and otherwise defers to `TabUIController`.
 */
class StatusBarController extends BaseComponent {
  constructor(options = {}) {
    super('StatusBarController', options);
    this.documentComponent = null;
    this.tabManager = null;
    this.cursorPos = null;
    this.filenameButton = null;
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    this.cursorPos = document.getElementById('cursor-pos');
    this.filenameButton = document.getElementById('filename');

    if (!this.cursorPos || !this.filenameButton) {
      throw new Error('Status bar elements not found');
    }
  }

  updateCursorPosition(line, col) {
    if (this.cursorPos) {
      this.cursorPos.textContent = `Line ${line}, Col ${col}`;
    }
  }

  updateFilename(name = null, isDirty = null) {
    if (!this.filenameButton) return;

    // With tabs open the name belongs to the tab UI, which renders the active
    // tab and its dirty marker.
    if (this.tabManager?.hasTabs()) return;

    const documentState = this.documentComponent.getDocumentState();

    if (name === null) {
      if (documentState.currentFile) {
        name = documentState.fileName;
      } else if (documentState.hasDocument) {
        name = 'untitled.md';
      } else {
        name = 'Welcome';
      }
    }

    if (isDirty === null) {
      isDirty = documentState.isDirty;
    }

    this.filenameButton.textContent = `${name}${isDirty ? ' *' : ''}`;
    this.filenameButton.classList.remove('has-tabs');
  }

  onDestroy() {
    this.cursorPos = null;
    this.filenameButton = null;
    this.documentComponent = null;
    this.tabManager = null;
  }
}

window.StatusBarController = StatusBarController;
export { StatusBarController };
