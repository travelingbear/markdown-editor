import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HorizontalSplitPlugin } from '../plugins/HorizontalSplitPlugin.js';
import { HORIZONTAL_SPLIT_CSS } from '../plugins/horizontalSplitStyles.js';

function createPlugin() {
  const settings = new Map();
  const handlers = new Map();
  const plugin = new HorizontalSplitPlugin({
    unregisterExtension: vi.fn(),
    registerCleanup: vi.fn(),
    registerExtension: vi.fn(),
    on: vi.fn((namespace, event, handler) => {
      handlers.set(`${namespace}:${event}`, handler);
    }),
    getSetting: vi.fn((key, defaultValue) => settings.has(key) ? settings.get(key) : defaultValue),
    setSetting: vi.fn((key, value) => {
      settings.set(key, value);
      return true;
    })
  });
  plugin.testHandlers = handlers;
  return plugin;
}

describe('HorizontalSplitPlugin lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <button id="split-btn"></button>
      <div class="main-content"></div>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('removes its split-button handler when no previous property handler existed', async () => {
    const plugin = createPlugin();
    const splitButton = document.getElementById('split-btn');
    plugin.hookSplitButton();

    expect(splitButton.onclick).toBeTypeOf('function');
    await plugin.destroy();

    expect(splitButton.onclick).toBeNull();
  });

  it('restores an existing split-button property handler on destroy', async () => {
    const originalHandler = vi.fn();
    const splitButton = document.getElementById('split-btn');
    splitButton.onclick = originalHandler;
    const plugin = createPlugin();
    plugin.hookSplitButton();

    await plugin.destroy();
    splitButton.click();

    expect(originalHandler).toHaveBeenCalledOnce();
  });

  it('cancels delayed plugin work during destroy', async () => {
    const callback = vi.fn();
    const plugin = createPlugin();
    plugin.isActive = true;
    plugin.schedule(callback, 100);

    await plugin.destroy();
    await vi.advanceTimersByTimeAsync(100);

    expect(callback).not.toHaveBeenCalled();
    expect(plugin.pendingTimeouts.size).toBe(0);
  });

  it('mounts its settings only inside its dedicated plugin host', () => {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="settings-content"><div class="settings-section">Main settings</div></div>
      <div data-plugin-settings-host="horizontal-split-plugin"></div>
    `);
    const plugin = createPlugin();

    plugin.injectSettingsUI();

    expect(document.querySelector('.settings-content #hsplit-vertical-btn')).toBeNull();
    expect(document.querySelector('[data-plugin-settings-host="horizontal-split-plugin"] #hsplit-vertical-btn'))
      .not.toBeNull();
  });

  it('restores its persisted settings when the plugin panel is mounted again', () => {
    document.body.insertAdjacentHTML('beforeend', `
      <div data-plugin-settings-host="horizontal-split-plugin"></div>
    `);
    const plugin = createPlugin();
    plugin.setSetting('defaultSplitOrientation', 'horizontal');
    plugin.setSetting('horizontalSplitToolbar', 'hide');
    plugin.setSetting('horizontalSplitPaneOrder', 'code-top');

    const host = document.querySelector('[data-plugin-settings-host="horizontal-split-plugin"]');
    plugin.mountSettings(host);
    plugin.mountSettings(host);

    expect(host.querySelector('#hsplit-horizontal-btn').classList.contains('active')).toBe(true);
    expect(host.querySelector('#hsplit-toolbar-hide-btn').classList.contains('active')).toBe(true);
    expect(host.querySelector('#hsplit-code-top-btn').classList.contains('active')).toBe(true);
  });

  it('migrates existing horizontal split settings into plugin configuration', () => {
    localStorage.setItem('markdownViewer_defaultSplitOrientation', 'horizontal');
    localStorage.setItem('markdownViewer_horizontalSplitToolbar', 'hide');
    localStorage.setItem('markdownViewer_horizontalSplitPaneOrder', 'code-top');
    const plugin = createPlugin();

    plugin.migrateLegacySettings();

    expect(plugin.getSetting('defaultSplitOrientation', 'vertical')).toBe('horizontal');
    expect(plugin.getSetting('horizontalSplitToolbar', 'show')).toBe('hide');
    expect(plugin.getSetting('horizontalSplitPaneOrder', 'preview-top')).toBe('code-top');
    expect(localStorage.getItem('markdownViewer_defaultSplitOrientation')).toBeNull();
  });

  it.each(['code', 'preview'])('clears horizontal pane heights when entering %s mode', async (mode) => {
    document.querySelector('.main-content').outerHTML = `
      <div class="main-content ${mode}-mode split-horizontal">
        <div class="preview-pane" style="height: 40%;"></div>
        <div class="editor-pane" style="height: 60%;"></div>
      </div>
    `;
    const plugin = createPlugin();
    plugin.isActive = true;
    plugin.addModeListener();

    plugin.testHandlers.get('mode:mode-changed')({ mode });
    await vi.advanceTimersByTimeAsync(100);

    const mainContent = document.querySelector('.main-content');
    expect(mainContent.classList.contains('split-horizontal')).toBe(false);
    expect(document.querySelector('.preview-pane').style.height).toBe('');
    expect(document.querySelector('.editor-pane').style.height).toBe('');
    expect(plugin.savedPaneSizes).toEqual({
      previewHeight: '40%',
      editorHeight: '60%'
    });

    await plugin.destroy();
  });
});

describe('HorizontalSplitPlugin styles', () => {
  it('mounts exactly the shared stylesheet and removes it on destroy', async () => {
    const plugin = createPlugin();
    plugin.injectCSS();

    const style = plugin.styleElement;
    expect(style.textContent).toBe(HORIZONTAL_SPLIT_CSS);
    expect(document.head.contains(style)).toBe(true);

    await plugin.destroy();
    expect(document.head.contains(style)).toBe(false);
  });

  it('carries the layout rules the plugin depends on', () => {
    // The plugin owns horizontal split entirely; the base stylesheet has no
    // rules for it, so these selectors only exist here.
    for (const selector of [
      '.main-content.split-mode.split-horizontal .editor-pane',
      '.main-content.split-mode.split-horizontal.code-top .editor-pane',
      '.main-content.split-mode.split-horizontal .splitter',
      '#split-orientation-menu'
    ]) {
      expect(HORIZONTAL_SPLIT_CSS, `missing rules for ${selector}`).toContain(selector);
    }
  });
});
