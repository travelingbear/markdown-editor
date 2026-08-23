import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/ScrollCoordinator.js');
});

function createCoordinator({ mode = 'split', tab = null, editorMetrics = { top: 0, maxScroll: 400 } } = {}) {
  const adapter = {
    getScrollMetrics: vi.fn(() => editorMetrics),
    setScrollTop: vi.fn(),
    saveViewState: vi.fn(() => ({ scrollTop: editorMetrics.top })),
    onScroll: vi.fn(() => ({ dispose: vi.fn() }))
  };
  const editorComponent = {
    getEditorAdapter: vi.fn(() => adapter),
    on: vi.fn(),
    off: vi.fn()
  };
  const tabManager = {
    getActiveTab: vi.fn(() => tab),
    updateTabScroll: vi.fn(),
    saveTabEditorState: vi.fn(),
    hasTabs: vi.fn(() => Boolean(tab))
  };
  const modeEvents = new Map();
  const modeController = {
    getCurrentMode: vi.fn(() => mode),
    on: vi.fn((event, handler) => modeEvents.set(event, handler)),
    off: vi.fn()
  };
  const coordinator = new window.ScrollCoordinator();
  coordinator.setDependencies({
    editorComponent,
    previewComponent: {},
    tabManager,
    modeController
  });
  return { coordinator, adapter, editorComponent, tabManager, modeController, modeEvents };
}

describe('ScrollCoordinator', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="preview-pane"></div>
      <button id="scroll-sync-btn"></button>
      <div id="welcome-page" style="display: none"></div>
    `;
    const previewPane = document.querySelector('.preview-pane');
    Object.defineProperty(previewPane, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(previewPane, 'clientHeight', { configurable: true, value: 200 });
  });

  it('restores an explicit legacy top-of-document preview position', () => {
    const tab = { id: 'tab-1', scrollPosition: { preview: 0 } };
    const { coordinator } = createCoordinator({ mode: 'preview', tab });
    const previewPane = document.querySelector('.preview-pane');
    previewPane.scrollTop = 500;

    coordinator.applyTabPosition(tab, 'preview');

    expect(previewPane.scrollTop).toBe(0);
  });

  it('restores one relative position into split panes with different heights', () => {
    const tab = { id: 'tab-1', scrollPosition: { ratio: 0.5 } };
    const { coordinator, adapter } = createCoordinator({ mode: 'split', tab });

    coordinator.applyTabPosition(tab, 'split');

    expect(adapter.setScrollTop).toHaveBeenCalledWith(200);
    expect(document.querySelector('.preview-pane').scrollTop).toBe(400);
  });

  it('captures editor state and the canonical ratio in code mode', () => {
    const tab = { id: 'tab-1', scrollPosition: { ratio: 0.1, source: 'preview' } };
    const { coordinator, tabManager } = createCoordinator({
      mode: 'code',
      tab,
      editorMetrics: { top: 300, maxScroll: 600 }
    });

    coordinator.capture(tab, 'code');

    expect(tabManager.saveTabEditorState).toHaveBeenCalledWith('tab-1', { scrollTop: 300 });
    expect(tabManager.updateTabScroll).toHaveBeenCalledWith('tab-1', 300, 0, 0.5, 'editor');
  });

  it('synchronizes an editor scroll to preview and updates only the active tab', () => {
    const tab = { id: 'tab-1', scrollPosition: { ratio: 0 } };
    const { coordinator, tabManager } = createCoordinator({
      mode: 'split',
      tab,
      editorMetrics: { top: 100, maxScroll: 400 }
    });

    coordinator.handleEditorScroll();

    expect(document.querySelector('.preview-pane').scrollTop).toBe(200);
    expect(tabManager.updateTabScroll).toHaveBeenCalledWith(
      'tab-1',
      100,
      200,
      0.25,
      'editor'
    );
  });

  it('explicitly aligns Preview from the current editor position', () => {
    const tab = { id: 'tab-1', scrollPosition: { ratio: 0 } };
    const { coordinator, tabManager } = createCoordinator({
      mode: 'preview',
      tab,
      editorMetrics: { top: 300, maxScroll: 600 }
    });

    coordinator.alignPreviewFromEditor();

    expect(document.querySelector('.preview-pane').scrollTop).toBe(400);
    expect(tabManager.updateTabScroll).toHaveBeenCalledWith(
      'tab-1',
      300,
      400,
      0.5,
      'editor'
    );
  });

  it('ignores user-scroll handlers while restoring programmatically', () => {
    const tab = { id: 'tab-1', scrollPosition: { ratio: 0.5 } };
    const { coordinator, tabManager } = createCoordinator({ mode: 'split', tab });
    coordinator.isProgrammaticScroll = true;

    coordinator.handleEditorScroll();
    coordinator.handlePreviewScroll();

    expect(tabManager.updateTabScroll).not.toHaveBeenCalled();
  });

  it('follows the mode itself to keep the sync button correct', async () => {
    const context = createCoordinator({ mode: 'code', tab: { id: 'a' } });
    await context.coordinator.init();
    const button = document.getElementById('scroll-sync-btn');

    context.modeController.getCurrentMode.mockReturnValue('split');
    context.modeEvents.get('mode-changed')({ mode: 'split' });
    expect(button.style.display).toBe('none');

    context.modeController.getCurrentMode.mockReturnValue('preview');
    context.modeEvents.get('mode-changed')({ mode: 'preview' });
    expect(button.style.display).toBe('inline-flex');
  });

  it('releases the mode subscription on teardown', async () => {
    const context = createCoordinator();
    await context.coordinator.init();
    const [event, handler] = context.modeController.on.mock.calls[0];

    context.coordinator.destroy();

    expect(context.modeController.off).toHaveBeenCalledWith(event, handler);
  });
});
