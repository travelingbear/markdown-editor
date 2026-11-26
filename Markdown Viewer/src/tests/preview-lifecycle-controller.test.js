import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/PreviewLifecycleController.js');
});

function createController() {
  const listeners = new Map();
  const previewComponent = {
    on: vi.fn((event, handler) => listeners.set(event, handler)),
    off: vi.fn(),
    emit: vi.fn()
  };
  const editorComponent = {
    getContent: vi.fn(() => '# Current'),
    getEditorAdapter: vi.fn()
  };
  const documentComponent = {};
  const activeTab = { id: 'active', filePath: 'C:\\notes\\active.md' };
  const tabManager = { getActiveTab: vi.fn(() => activeTab) };
  const modeController = { getCurrentMode: vi.fn(() => 'split') };
  const settingsController = { updateSystemInfo: vi.fn() };
  const markdownActionController = { updateTaskInMarkdown: vi.fn() };
  const fileController = { reloadCurrentFile: vi.fn() };
  const exportController = { exportToHtml: vi.fn(), exportToPdf: vi.fn() };
  const scrollCoordinator = {
    alignPreviewToActiveTab: vi.fn(),
    alignPreviewFromEditor: vi.fn()
  };
  const handleError = vi.fn();
  const controller = new window.PreviewLifecycleController();
  controller.setDependencies({
    previewComponent,
    editorComponent,
    documentComponent,
    tabManager,
    modeController,
    settingsController,
    markdownActionController,
    fileController,
    exportController,
    scrollCoordinator,
    handleError
  });

  return {
    controller,
    listeners,
    previewComponent,
    editorComponent,
    documentComponent,
    tabManager,
    modeController,
    settingsController,
    markdownActionController,
    fileController,
    exportController,
    scrollCoordinator,
    handleError
  };
}

describe('PreviewLifecycleController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete window.__TAURI__;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.__TAURI__;
  });

  it('routes preview status, error, scroll, export, and reload events', async () => {
    const context = createController();
    await context.controller.init();

    context.listeners.get('preview-error')({ error: 'render failed' });
    context.listeners.get('preview-updated')();
    context.listeners.get('mermaid-loaded')();
    context.listeners.get('katex-loaded')();
    context.listeners.get('reload-file-requested')();
    context.listeners.get('export-html-requested')();
    context.listeners.get('export-pdf-requested')();

    expect(context.handleError).toHaveBeenCalledWith(expect.any(Error), 'Preview');
    expect(context.scrollCoordinator.alignPreviewToActiveTab).toHaveBeenCalledOnce();
    expect(context.settingsController.updateSystemInfo).toHaveBeenCalledTimes(2);
    expect(context.fileController.reloadCurrentFile).toHaveBeenCalledWith(
      context.documentComponent,
      context.tabManager,
      context.editorComponent,
      context.previewComponent
    );
    expect(context.exportController.exportToHtml).toHaveBeenCalledOnce();
    expect(context.exportController.exportToPdf).toHaveBeenCalledOnce();
  });

  it('delays an interactive task update until preview processing settles', () => {
    const context = createController();

    context.controller.handleTaskToggled({ taskText: 'Ship it', checked: true });
    vi.advanceTimersByTime(9);
    expect(context.markdownActionController.updateTaskInMarkdown).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(context.markdownActionController.updateTaskInMarkdown).toHaveBeenCalledWith(
      'Ship it',
      true,
      null
    );
  });

  it('drops delayed Preview work after the active tab changes', () => {
    const context = createController();
    context.controller.handleTaskToggled({ taskText: 'Wrong document', checked: true });
    context.controller.syncFromCode();
    context.tabManager.getActiveTab.mockReturnValue({ id: 'other', filePath: 'other.md' });

    vi.runAllTimers();

    expect(context.markdownActionController.updateTaskInMarkdown).not.toHaveBeenCalled();
    expect(context.scrollCoordinator.alignPreviewFromEditor).not.toHaveBeenCalled();
  });

  it('renders current code and then aligns Preview from the editor position', () => {
    const context = createController();

    context.controller.syncFromCode();

    expect(context.previewComponent.emit).toHaveBeenCalledWith('update-preview', {
      content: '# Current',
      filePath: 'C:\\notes\\active.md'
    });
    expect(context.scrollCoordinator.alignPreviewFromEditor).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(context.scrollCoordinator.alignPreviewFromEditor).toHaveBeenCalledOnce();
  });

  it('uses the native opener and native relaunch when Tauri is available', async () => {
    const context = createController();
    const invoke = vi.fn();
    const relaunch = vi.fn();
    window.__TAURI__ = { core: { invoke }, process: { relaunch } };

    await context.controller.openExternalLink('https://example.com');
    await context.controller.restartApplication();

    expect(invoke).toHaveBeenCalledWith('plugin:opener|open_url', {
      url: 'https://example.com'
    });
    expect(relaunch).toHaveBeenCalledOnce();
  });

  it('removes all preview listeners and cancels delayed work on teardown', async () => {
    const context = createController();
    await context.controller.init();
    context.controller.handleTaskToggled({ taskText: 'Do not run', checked: false });
    const registrations = context.previewComponent.on.mock.calls;

    context.controller.destroy();
    vi.runAllTimers();

    expect(registrations).toHaveLength(11);
    expect(context.previewComponent.off).toHaveBeenCalledTimes(11);
    for (const [event, handler] of registrations) {
      expect(context.previewComponent.off).toHaveBeenCalledWith(event, handler);
    }
    expect(context.markdownActionController.updateTaskInMarkdown).not.toHaveBeenCalled();
  });
});
