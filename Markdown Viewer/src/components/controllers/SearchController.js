/**
 * Owns find/replace routing.
 *
 * Preview has no editor document to search, so it falls back to the browser's
 * native find; Code and Split go through the editor adapter, keeping the
 * application independent of the editor engine.
 */
class SearchController extends BaseComponent {
  constructor(options = {}) {
    super('SearchController', options);
    this.editorComponent = null;
    this.modeController = null;
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  isPreviewOnly() {
    return this.modeController.getCurrentMode() === 'preview';
  }

  getAdapter() {
    return this.editorComponent.getEditorAdapter();
  }

  open(showReplace = true) {
    if (this.isPreviewOnly()) {
      this.openNativeFind();
      return;
    }
    this.getAdapter()?.openFindReplace(showReplace);
  }

  toggle(showReplace = true) {
    if (this.isPreviewOnly()) {
      this.openNativeFind();
      return;
    }

    const adapter = this.getAdapter();
    if (adapter?.toggleFindReplace) {
      adapter.toggleFindReplace(showReplace);
    } else {
      adapter?.openFindReplace(showReplace);
    }
  }

  /**
   * Seed the native find dialog with the current selection where the clipboard
   * allows it, then open it regardless.
   */
  openNativeFind() {
    const searchText = this.getAdapter()?.getSelectedText() || '';

    if (searchText && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(searchText)
        .then(() => document.execCommand('find'))
        .catch(() => document.execCommand('find'));
      return;
    }

    document.execCommand('find');
  }

  onDestroy() {
    this.editorComponent = null;
    this.modeController = null;
  }
}

window.SearchController = SearchController;
export { SearchController };
