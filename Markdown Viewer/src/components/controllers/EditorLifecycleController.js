/**
 * Owns EditorComponent output events and synchronizes edits with the active
 * document, tab session, preview, status bar, and markdown commands.
 */
class EditorLifecycleController extends BaseComponent {
  constructor(options = {}) {
    super('EditorLifecycleController', options);
    this.editorComponent = null;
    this.documentComponent = null;
    this.previewComponent = null;
    this.tabManager = null;
    this.tabUIController = null;
    this.settingsController = null;
    this.modeController = null;
    this.markdownActionController = null;
    this.updateCursorPosition = () => {};
    this.editorEventHandlers = [];
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    this.listen('content-changed', (data) => this.handleContentChanged(data));
    this.listen('cursor-position-changed', (data) => this.handleCursorChanged(data));
    this.listen('editor-loaded', () => this.handleEditorLoaded());
    this.listen('markdown-action', (data) => this.handleMarkdownAction(data));
  }

  listen(event, handler) {
    this.editorComponent.on(event, handler);
    this.editorEventHandlers.push({ event, handler });
  }

  handleContentChanged(data) {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      // Update the tab without writing the value back into the active editor.
      activeTab.setContent(data.content);
    }

    // DocumentComponent owns the canonical dirty transition. Updating its
    // content before this event would incorrectly turn the edit into a no-op.
    this.documentComponent.emit('content-changed', data);

    if (activeTab) {
      this.tabManager.persistTabs();
      this.tabUIController.updateTabUI();
      if (this.settingsController.getPinnedTabsEnabled()) {
        this.tabUIController.updatePinnedTabs();
      }
    }

    this.previewComponent.emit('update-preview', {
      content: data.content,
      filePath: activeTab?.filePath
    });
  }

  handleCursorChanged({ line, col }) {
    this.updateCursorPosition(line, col);
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) this.tabManager.updateTabCursor(activeTab.id, line, col);
  }

  handleEditorLoaded() {
    this.settingsController.updateSystemInfo(
      this.editorComponent,
      this.previewComponent,
      this.modeController.getCurrentMode()
    );
  }

  handleMarkdownAction({ action }) {
    return this.markdownActionController.handleMarkdownAction(action);
  }

  onDestroy() {
    for (const { event, handler } of this.editorEventHandlers) {
      this.editorComponent?.off(event, handler);
    }
    this.editorEventHandlers = [];
  }
}

window.EditorLifecycleController = EditorLifecycleController;
export { EditorLifecycleController };
