import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/WelcomeController.js');
});

let controller;

beforeEach(() => {
  document.body.innerHTML = `
    <button id="welcome-new-btn"></button>
    <button id="welcome-open-btn"></button>
    <button id="welcome-help-btn"></button>
    <button id="welcome-about-btn"></button>
    <button id="welcome-settings-btn"></button>
    <button id="clear-history-btn"></button>
  `;
});

afterEach(() => {
  controller?.destroy();
  controller = null;
  vi.restoreAllMocks();
});

function createHarness() {
  const documentComponent = {};
  const tabManager = {};
  const fileController = {
    newFile: vi.fn(),
    openFile: vi.fn(),
    clearFileHistory: vi.fn()
  };
  const uiController = {
    showHelp: vi.fn(),
    showAbout: vi.fn(),
    showSettings: vi.fn(async () => {})
  };
  controller = new window.WelcomeController();
  controller.setDependencies({
    fileController,
    documentComponent,
    tabManager,
    uiController
  });

  return { documentComponent, fileController, tabManager, uiController };
}

describe('WelcomeController', () => {
  it('routes every welcome command to its owning service exactly once', () => {
    const context = createHarness();
    expect(controller.setup()).toBe(true);
    expect(controller.setup()).toBe(true);

    document.getElementById('welcome-new-btn').click();
    document.getElementById('welcome-open-btn').click();
    document.getElementById('welcome-help-btn').click();
    document.getElementById('welcome-about-btn').click();
    document.getElementById('welcome-settings-btn').click();
    document.getElementById('clear-history-btn').click();

    expect(context.fileController.newFile).toHaveBeenCalledOnce();
    expect(context.fileController.newFile).toHaveBeenCalledWith(
      context.documentComponent,
      context.tabManager
    );
    expect(context.fileController.openFile).toHaveBeenCalledOnce();
    expect(context.uiController.showHelp).toHaveBeenCalledOnce();
    expect(context.uiController.showAbout).toHaveBeenCalledOnce();
    expect(context.uiController.showSettings).toHaveBeenCalledOnce();
    expect(context.fileController.clearFileHistory)
      .toHaveBeenCalledWith(context.documentComponent);
  });

  it('removes every welcome listener during destruction', () => {
    const context = createHarness();
    controller.setup();
    controller.destroy();

    document.getElementById('welcome-new-btn').click();
    document.getElementById('welcome-help-btn').click();
    document.getElementById('clear-history-btn').click();

    expect(context.fileController.newFile).not.toHaveBeenCalled();
    expect(context.uiController.showHelp).not.toHaveBeenCalled();
    expect(context.fileController.clearFileHistory).not.toHaveBeenCalled();
  });
});
