import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/ToolbarLifecycleController.js');
});

function createController() {
  // A real BaseComponent gives the controller genuine on/off/emit semantics,
  // so routing and teardown are exercised instead of mocked away.
  const toolbarComponent = new window.BaseComponent('ToolbarComponent');
  vi.spyOn(toolbarComponent, 'on');
  vi.spyOn(toolbarComponent, 'off');

  const documentComponent = {};
  const tabManager = {};
  const performanceOptimizer = { id: 'perf' };
  const editorComponent = { emit: vi.fn(), undo: vi.fn(), redo: vi.fn(), updateTheme: vi.fn() };
  const previewComponent = { emit: vi.fn() };
  const fileController = {
    newFile: vi.fn(),
    openFile: vi.fn(),
    saveFile: vi.fn(),
    saveAsFile: vi.fn(),
    closeFile: vi.fn()
  };
  const modeController = { setMode: vi.fn() };
  const exportController = { exportToHtml: vi.fn(), exportToPdf: vi.fn() };
  const uiController = {
    toggleDistractionFree: vi.fn(),
    toggleTheme: vi.fn(() => ({ theme: 'dark', isRetroTheme: false })),
    showSettings: vi.fn(),
    showHelp: vi.fn()
  };
  const settingsController = {
    toggleAdvancedRendering: vi.fn(),
    togglePinnedTabs: vi.fn()
  };
  const markdownActionController = {
    handleMarkdownAction: vi.fn(),
    insertMarkdownText: vi.fn()
  };
  const previewLifecycleController = { reloadCurrentFile: vi.fn() };
  const actions = { toggleFindReplace: vi.fn() };

  const controller = new window.ToolbarLifecycleController();
  controller.setDependencies({
    toolbarComponent,
    documentComponent,
    editorComponent,
    previewComponent,
    tabManager,
    fileController,
    modeController,
    exportController,
    uiController,
    settingsController,
    markdownActionController,
    previewLifecycleController,
    performanceOptimizer,
    actions
  });

  return {
    controller,
    toolbarComponent,
    documentComponent,
    tabManager,
    performanceOptimizer,
    editorComponent,
    previewComponent,
    fileController,
    modeController,
    exportController,
    uiController,
    settingsController,
    markdownActionController,
    previewLifecycleController,
    actions
  };
}

describe('ToolbarLifecycleController', () => {
  it('routes file commands with the document, tab, and performance dependencies', async () => {
    const context = createController();
    await context.controller.init();

    context.toolbarComponent.emit('file-new-requested');
    context.toolbarComponent.emit('file-open-requested');
    context.toolbarComponent.emit('file-save-requested');
    context.toolbarComponent.emit('file-save-as-requested');
    context.toolbarComponent.emit('file-close-requested');
    context.toolbarComponent.emit('file-reload-requested');

    const documentAndTabs = [context.documentComponent, context.tabManager];
    expect(context.fileController.newFile).toHaveBeenCalledWith(...documentAndTabs);
    expect(context.fileController.openFile).toHaveBeenCalledWith(...documentAndTabs);
    expect(context.fileController.saveFile).toHaveBeenCalledWith(...documentAndTabs);
    expect(context.fileController.saveAsFile).toHaveBeenCalledWith(...documentAndTabs);
    expect(context.fileController.closeFile).toHaveBeenCalledWith(
      ...documentAndTabs,
      context.performanceOptimizer
    );
    expect(context.previewLifecycleController.reloadCurrentFile).toHaveBeenCalledOnce();
  });

  it('routes mode, export, and application UI commands', async () => {
    const context = createController();
    await context.controller.init();

    context.toolbarComponent.emit('mode-change-requested', { mode: 'split' });
    context.toolbarComponent.emit('export-html-requested');
    context.toolbarComponent.emit('export-pdf-requested');
    context.toolbarComponent.emit('distraction-free-toggle');
    context.toolbarComponent.emit('settings-show');
    context.toolbarComponent.emit('help-show');

    expect(context.modeController.setMode).toHaveBeenCalledWith('split');
    expect(context.exportController.exportToHtml).toHaveBeenCalledOnce();
    expect(context.exportController.exportToPdf).toHaveBeenCalledOnce();
    expect(context.uiController.toggleDistractionFree).toHaveBeenCalledOnce();
    expect(context.uiController.showSettings).toHaveBeenCalledOnce();
    expect(context.uiController.showHelp).toHaveBeenCalledOnce();
  });

  it('delegates the theme toggle to UIController without applying the theme itself', async () => {
    const context = createController();
    await context.controller.init();

    context.toolbarComponent.emit('theme-toggle');

    // UIController.setTheme() emits 'theme-changed', which the composition root
    // already applies. Applying it here as well would double the work.
    expect(context.uiController.toggleTheme).toHaveBeenCalledOnce();
    expect(context.editorComponent.updateTheme).not.toHaveBeenCalled();
    expect(context.previewComponent.emit).not.toHaveBeenCalled();
  });

  it('routes quick toolbar controls, font size, zoom, history, and search', async () => {
    const context = createController();
    await context.controller.init();

    context.toolbarComponent.emit('rendering-mode-toggle-requested');
    context.toolbarComponent.emit('pinned-tabs-toggle-requested');
    context.toolbarComponent.emit('font-size-changed', { fontSize: 18 });
    context.toolbarComponent.emit('zoom-changed', { zoom: 1.2 });
    context.toolbarComponent.emit('editor-undo');
    context.toolbarComponent.emit('editor-redo');
    context.toolbarComponent.emit('find-replace-requested');

    expect(context.settingsController.toggleAdvancedRendering).toHaveBeenCalledOnce();
    expect(context.settingsController.togglePinnedTabs).toHaveBeenCalledOnce();
    expect(context.editorComponent.emit).toHaveBeenCalledWith('font-size-changed', { fontSize: 18 });
    expect(context.previewComponent.emit).toHaveBeenCalledWith('zoom-changed', { zoom: 1.2 });
    expect(context.editorComponent.undo).toHaveBeenCalledOnce();
    expect(context.editorComponent.redo).toHaveBeenCalledOnce();
    expect(context.actions.toggleFindReplace).toHaveBeenCalledWith(true);
  });

  it('routes Markdown actions', async () => {
    const context = createController();
    await context.controller.init();

    context.toolbarComponent.emit('markdown-action', { action: 'bold' });

    expect(context.markdownActionController.handleMarkdownAction).toHaveBeenCalledWith('bold');
    // Link and image insertion belongs to MarkdownDialogController, which
    // reaches MarkdownActionController directly.
    expect(context.markdownActionController.insertMarkdownText).not.toHaveBeenCalled();
  });

  it('removes every toolbar listener on teardown', async () => {
    const context = createController();
    await context.controller.init();
    const registrations = context.toolbarComponent.on.mock.calls;

    context.controller.destroy();
    context.toolbarComponent.emit('file-new-requested');
    context.toolbarComponent.emit('markdown-action', { action: 'bold' });

    expect(registrations).toHaveLength(21);
    expect(context.toolbarComponent.off).toHaveBeenCalledTimes(21);
    for (const [event, handler] of registrations) {
      expect(context.toolbarComponent.off).toHaveBeenCalledWith(event, handler);
    }
    expect(context.fileController.newFile).not.toHaveBeenCalled();
    expect(context.markdownActionController.handleMarkdownAction).not.toHaveBeenCalled();
  });

  it('does not double-bind commands when reinitialized after teardown', async () => {
    const context = createController();
    await context.controller.init();
    context.controller.destroy();
    await context.controller.init();

    context.toolbarComponent.emit('file-save-requested');

    expect(context.fileController.saveFile).toHaveBeenCalledOnce();
  });
});
