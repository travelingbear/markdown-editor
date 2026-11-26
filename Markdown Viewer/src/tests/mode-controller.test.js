import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/ModeController.js');
});

function createModeController({ hasDocument = false, activeTab = null } = {}) {
  const controller = new window.ModeController();
  const previewComponent = {
    showWelcome: vi.fn(),
    showPreview: vi.fn()
  };
  const toolbarComponent = {
    hasDocument,
    emit: vi.fn()
  };
  const tabManager = {
    getActiveTab: vi.fn(() => activeTab),
    saveTabEditorState: vi.fn(),
    updateTabScroll: vi.fn()
  };
  const editorComponent = {
    isEditorReady: vi.fn(() => true),
    getEditorAdapter: vi.fn(() => null)
  };
  const settingsController = {
    updateSystemInfo: vi.fn(),
    setLastModeSwitchTime: vi.fn()
  };

  controller.setDependencies(
    editorComponent,
    previewComponent,
    toolbarComponent,
    settingsController,
    tabManager
  );

  return { controller, previewComponent, toolbarComponent, editorComponent };
}

describe('ModeController document availability', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="main-content">
        <div class="editor-pane"></div>
        <div id="splitter"></div>
        <div class="preview-pane"></div>
      </div>
    `;
    document.body.className = '';
  });

  it('keeps welcome separate from the three document modes', () => {
    const { controller, previewComponent, toolbarComponent } = createModeController();

    controller.enterWelcomeMode();

    expect(controller.getCurrentMode()).toBe('welcome');
    expect(previewComponent.showWelcome).toHaveBeenCalledOnce();
    expect(toolbarComponent.emit).toHaveBeenCalledWith('mode-changed', { mode: 'welcome' });
    expect(document.querySelector('.main-content').classList.contains('welcome-mode')).toBe(true);
  });

  it.each(['code', 'preview', 'split'])('rejects %s mode without an active loaded document', async (mode) => {
    const { controller, previewComponent } = createModeController();
    controller.enterWelcomeMode();

    await expect(controller.setMode(mode)).resolves.toBe(false);

    expect(controller.getCurrentMode()).toBe('welcome');
    expect(previewComponent.showPreview).not.toHaveBeenCalled();
  });

  it('allows document modes after a document becomes active', async () => {
    const { controller, previewComponent } = createModeController({
      hasDocument: true,
      activeTab: { id: 'tab-1', scrollPosition: {} }
    });
    controller.enterWelcomeMode();

    await expect(controller.setMode('preview')).resolves.toBe(true);

    expect(controller.getCurrentMode()).toBe('preview');
    expect(previewComponent.showPreview).toHaveBeenCalledOnce();
    expect(document.querySelector('.main-content').classList.contains('preview-mode')).toBe(true);
  });

});
