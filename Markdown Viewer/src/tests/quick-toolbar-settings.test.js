import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SettingsController.js');
  await import('../components/ToolbarComponent.js');
});

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <div id="pinned-tabs-bar"></div>
    <input id="rendering-pin-checkbox" type="checkbox">
    <input id="pinned-tabs-pin-checkbox" type="checkbox">
    <div id="quick-settings-toolbar">
      <button id="quick-rendering-btn"></button>
      <button id="quick-pinned-tabs-btn"></button>
      <button id="quick-settings-menu-btn" aria-expanded="false"></button>
      <div id="quick-settings-menu"></div>
      <button id="quick-rendering-menu-item"></button>
      <button id="quick-pinned-tabs-menu-item"></button>
    </div>
  `;
});

function connectQuickToolbarElements(toolbar) {
  toolbar.quickSettingsToolbar = document.getElementById('quick-settings-toolbar');
  toolbar.quickRenderingBtn = document.getElementById('quick-rendering-btn');
  toolbar.quickPinnedTabsBtn = document.getElementById('quick-pinned-tabs-btn');
  toolbar.quickSettingsMenuBtn = document.getElementById('quick-settings-menu-btn');
  toolbar.quickSettingsMenu = document.getElementById('quick-settings-menu');
  toolbar.quickRenderingMenuItem = document.getElementById('quick-rendering-menu-item');
  toolbar.quickPinnedTabsMenuItem = document.getElementById('quick-pinned-tabs-menu-item');
}

describe('pinned toolbar settings', () => {
  it('persists pin choices independently from the feature values', () => {
    const settings = new window.SettingsController();
    settings.loadSettings();
    const changed = vi.fn();
    settings.on('toolbar-pins-changed', changed);

    expect(settings.setToolbarPin('rendering', true)).toBe(true);
    expect(settings.setToolbarPin('pinnedTabs', true)).toBe(true);

    expect(localStorage.getItem('markdownViewer_pinRenderingControl')).toBe('true');
    expect(localStorage.getItem('markdownViewer_pinPinnedTabsControl')).toBe('true');
    expect(localStorage.getItem('markdownViewer_advancedRendering')).toBeNull();
    expect(localStorage.getItem('markdownViewer_pinnedTabs')).toBeNull();
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({
      renderingPinned: true,
      pinnedTabsPinned: true
    }));

    const restored = new window.SettingsController();
    restored.loadSettings();
    expect(restored.getToolbarQuickSettings()).toMatchObject({
      renderingPinned: true,
      pinnedTabsPinned: true,
      extended: false,
      pinnedTabsEnabled: false
    });
  });

  it('updates both direct and overflow controls from one synchronized state', () => {
    const toolbar = new window.ToolbarComponent();
    connectQuickToolbarElements(toolbar);

    toolbar.updateQuickSettings({
      extended: true,
      pinnedTabsEnabled: true,
      renderingPinned: true,
      pinnedTabsPinned: true
    });

    expect(toolbar.quickSettingsToolbar.classList.contains('has-pinned')).toBe(true);
    expect(toolbar.quickRenderingBtn.textContent).toBe('MD: Extended');
    expect(toolbar.quickRenderingMenuItem.textContent).toContain('Markdown rendering');
    expect(toolbar.quickRenderingMenuItem.textContent).toContain('Extended');
    expect(toolbar.quickRenderingBtn.classList.contains('active')).toBe(true);
    expect(toolbar.quickPinnedTabsBtn.classList.contains('active')).toBe(true);
    expect(toolbar.quickPinnedTabsMenuItem.textContent).toContain('Enabled');
    expect(toolbar.quickPinnedTabsBtn.textContent).toBe('Tabs');
    expect(toolbar.quickPinnedTabsMenuItem.getAttribute('aria-pressed')).toBe('true');

    toolbar.updateQuickSettings({
      extended: false,
      pinnedTabsEnabled: false,
      renderingPinned: false,
      pinnedTabsPinned: false
    });

    expect(toolbar.quickSettingsToolbar.classList.contains('has-pinned')).toBe(false);
    expect(toolbar.quickRenderingBtn.textContent).toBe('MD: Pure');
    expect(toolbar.quickPinnedTabsMenuItem.textContent).toContain('Disabled');
  });

  it('synchronizes the settings pin checkboxes with persisted choices', () => {
    const settings = new window.SettingsController();
    settings.loadSettings();
    settings.setupSettingsControls();

    const renderingCheckbox = document.getElementById('rendering-pin-checkbox');
    const pinnedTabsCheckbox = document.getElementById('pinned-tabs-pin-checkbox');

    renderingCheckbox.checked = true;
    renderingCheckbox.dispatchEvent(new Event('change'));
    pinnedTabsCheckbox.checked = true;
    pinnedTabsCheckbox.dispatchEvent(new Event('change'));

    expect(settings.getToolbarQuickSettings()).toMatchObject({
      renderingPinned: true,
      pinnedTabsPinned: true
    });

    settings.updateSettingsDisplay();
    expect(renderingCheckbox.checked).toBe(true);
    expect(pinnedTabsCheckbox.checked).toBe(true);
  });

  it('uses the settings controller setters for synchronized toggles', () => {
    const settings = new window.SettingsController();
    settings.loadSettings();
    const renderingChanged = vi.fn();
    const pinnedTabsChanged = vi.fn();
    settings.on('rendering-mode-changed', renderingChanged);
    settings.on('pinned-tabs-changed', pinnedTabsChanged);

    settings.toggleAdvancedRendering();
    settings.togglePinnedTabs();

    expect(settings.getAdvancedRenderingEnabled()).toBe(true);
    expect(settings.getPinnedTabsEnabled()).toBe(true);
    expect(document.getElementById('pinned-tabs-bar').style.display).toBe('flex');
    expect(renderingChanged).toHaveBeenCalledWith({ extended: true });
    expect(pinnedTabsChanged).toHaveBeenCalledWith({ enabled: true });
  });
});
