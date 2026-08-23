/**
 * Owns ToolbarComponent output events and routes toolbar intent to the file,
 * mode, export, settings, UI, editor, preview, and Markdown services.
 *
 * ToolbarComponent stays responsible for toolbar DOM, responsive presentation,
 * and menus; it emits intent and never performs application work directly.
 */
class ToolbarLifecycleController extends BaseComponent {
  constructor(options = {}) {
    super('ToolbarLifecycleController', options);
    this.toolbarComponent = null;
    this.documentComponent = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.tabManager = null;
    this.fileController = null;
    this.modeController = null;
    this.exportController = null;
    this.uiController = null;
    this.settingsController = null;
    this.markdownActionController = null;
    this.previewLifecycleController = null;
    this.performanceOptimizer = null;
    this.actions = {};
    this.toolbarEventHandlers = [];
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    // File commands
    this.listen('file-new-requested', () =>
      this.fileController.newFile(this.documentComponent, this.tabManager));
    this.listen('file-open-requested', () =>
      this.fileController.openFile(this.documentComponent, this.tabManager));
    this.listen('file-save-requested', () =>
      this.fileController.saveFile(this.documentComponent, this.tabManager));
    this.listen('file-save-as-requested', () =>
      this.fileController.saveAsFile(this.documentComponent, this.tabManager));
    this.listen('file-close-requested', () =>
      this.fileController.closeFile(this.documentComponent, this.tabManager, this.performanceOptimizer));
    this.listen('file-reload-requested', () =>
      this.previewLifecycleController.reloadCurrentFile());

    // View mode
    this.listen('mode-change-requested', ({ mode }) => this.modeController.setMode(mode));

    // Exports
    this.listen('export-html-requested', () => this.exportController.exportToHtml());
    this.listen('export-pdf-requested', () => this.exportController.exportToPdf());

    // Application UI
    this.listen('distraction-free-toggle', () => this.uiController.toggleDistractionFree());
    // UIController.setTheme() emits 'theme-changed', which is the single
    // application-wide theme path. Toggling here must not also apply the theme,
    // otherwise every toolbar toggle re-renders Preview and re-applies the mode.
    this.listen('theme-toggle', () => this.uiController.toggleTheme());
    this.listen('settings-show', () => this.uiController.showSettings());
    this.listen('help-show', () => this.uiController.showHelp());

    // Quick toolbar controls
    this.listen('rendering-mode-toggle-requested', () =>
      this.settingsController.toggleAdvancedRendering());
    this.listen('pinned-tabs-toggle-requested', () =>
      this.settingsController.togglePinnedTabs());

    // Font size and preview zoom
    this.listen('font-size-changed', (data) =>
      this.editorComponent.emit('font-size-changed', data));
    this.listen('zoom-changed', (data) =>
      this.previewComponent.emit('zoom-changed', data));

    // Editor history
    this.listen('editor-undo', () => this.editorComponent.undo());
    this.listen('editor-redo', () => this.editorComponent.redo());

    // Markdown commands
    this.listen('markdown-action', ({ action }) =>
      this.markdownActionController.handleMarkdownAction(action));

    // Search
    this.listen('find-replace-requested', () => this.actions.toggleFindReplace(true));
  }

  listen(event, handler) {
    this.toolbarComponent.on(event, handler);
    this.toolbarEventHandlers.push({ event, handler });
  }

  onDestroy() {
    for (const { event, handler } of this.toolbarEventHandlers) {
      this.toolbarComponent?.off(event, handler);
    }
    this.toolbarEventHandlers = [];
  }
}

window.ToolbarLifecycleController = ToolbarLifecycleController;
export { ToolbarLifecycleController };
