/**
 * Owns vertical split-pane resizing. Horizontal resizing remains plugin-owned,
 * preventing both resize systems from mutating the layout during one drag.
 */
class SplitPaneController extends BaseComponent {
  constructor(options = {}) {
    super('SplitPaneController', options);

    this.editorComponent = null;
    this.splitter = null;
    this.mainContent = null;
    this.isResizing = false;
    this.isSetup = false;
    this.layoutFrame = null;
    this.requestFrame = options.requestFrame || ((callback) => requestAnimationFrame(callback));
    this.cancelFrame = options.cancelFrame || ((frame) => cancelAnimationFrame(frame));

    this.boundMouseDown = (event) => this.handleMouseDown(event);
    this.boundMouseMove = (event) => this.handleMouseMove(event);
    this.boundMouseUp = () => this.handleMouseUp();
  }

  setDependencies({ editorComponent }) {
    this.editorComponent = editorComponent;
  }

  setup() {
    if (this.isSetup) return true;

    this.splitter = document.getElementById('splitter');
    this.mainContent = document.querySelector('.main-content');
    if (!this.splitter || !this.mainContent) return false;

    this.splitter.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    this.isSetup = true;
    return true;
  }

  handleMouseDown(event) {
    // HorizontalSplitPlugin owns height resizing when this class is present.
    if (this.mainContent?.classList.contains('split-horizontal')) return;

    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    event.preventDefault();
  }

  handleMouseMove(event) {
    if (!this.isResizing || !this.mainContent) return;

    const containerRect = this.mainContent.getBoundingClientRect();
    if (!containerRect.width) return;

    const percentage = ((event.clientX - containerRect.left) / containerRect.width) * 100;
    if (percentage <= 20 || percentage >= 80) return;

    this.mainContent.style.setProperty('--editor-width', `${percentage}%`);
    this.mainContent.style.setProperty('--preview-width', `${100 - percentage}%`);
    this.scheduleEditorLayout();
  }

  scheduleEditorLayout() {
    const editor = this.editorComponent?.getEditorAdapter();
    if (!editor) return;

    if (this.layoutFrame !== null) {
      this.cancelFrame(this.layoutFrame);
    }
    this.layoutFrame = this.requestFrame(() => {
      this.layoutFrame = null;
      editor.layout();
    });
  }

  handleMouseUp() {
    if (!this.isResizing) return;
    this.isResizing = false;
    document.body.style.cursor = 'default';
  }

  onDestroy() {
    if (this.isSetup) {
      this.splitter?.removeEventListener('mousedown', this.boundMouseDown);
      document.removeEventListener('mousemove', this.boundMouseMove);
      document.removeEventListener('mouseup', this.boundMouseUp);
    }
    if (this.layoutFrame !== null) {
      this.cancelFrame(this.layoutFrame);
    }

    this.isResizing = false;
    this.isSetup = false;
    this.layoutFrame = null;
    document.body.style.cursor = 'default';
    this.splitter = null;
    this.mainContent = null;
    this.editorComponent = null;
  }
}

window.SplitPaneController = SplitPaneController;
