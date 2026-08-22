import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/UIController.js');
});

let controller;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <div id="settings-modal" style="display: none">
      <div class="settings-overlay"></div>
      <button id="settings-close-btn"></button>
    </div>
    <div id="help-modal" style="display: none">
      <div class="help-overlay"></div>
      <button id="help-close-btn"></button>
    </div>
    <div id="about-modal" style="display: none">
      <div class="about-overlay"></div>
      <button id="about-close-btn"></button>
    </div>
  `;
  controller = new window.UIController();
  controller.setupModalEventHandlers();
});

afterEach(() => {
  controller?.onDestroy();
  controller = null;
  vi.restoreAllMocks();
});

describe('UIController modal lifecycle', () => {
  it('announces Settings from every entry point and closes each modal normally', async () => {
    const settingsShown = vi.fn();
    controller.on('settings-shown', settingsShown);

    await controller.showSettings();
    expect(document.getElementById('settings-modal').style.display).toBe('flex');
    expect(settingsShown).toHaveBeenCalledOnce();
    document.getElementById('settings-close-btn').click();
    expect(document.getElementById('settings-modal').style.display).toBe('none');

    controller.showHelp();
    document.querySelector('.help-overlay').click();
    expect(document.getElementById('help-modal').style.display).toBe('none');

    controller.showAbout();
    document.getElementById('about-close-btn').click();
    expect(document.getElementById('about-modal').style.display).toBe('none');
  });

  it('removes modal close listeners during destruction', () => {
    controller.showHelp();
    controller.onDestroy();

    document.getElementById('help-close-btn').click();

    expect(document.getElementById('help-modal').style.display).toBe('flex');
  });
});
