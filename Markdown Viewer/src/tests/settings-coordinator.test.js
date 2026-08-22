import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SettingsCoordinator.js');
});

function createCoordinator() {
  // Real BaseComponent sources give the coordinator genuine on/off/emit
  // semantics, so routing and teardown are exercised instead of mocked away.
  const settingsController = new window.BaseComponent('SettingsController');
  const uiController = new window.BaseComponent('UIController');
  const tabUIController = new window.BaseComponent('TabUIController');
  for (const source of [settingsController, uiController, tabUIController]) {
    vi.spyOn(source, 'on');
    vi.spyOn(source, 'off');
  }

  Object.assign(settingsController, {
    isToolbarEnabled: true,
    theme: 'light',
    isRetroTheme: false,
    updateSettingsDisplay: vi.fn(),
    updatePerformanceDashboard: vi.fn(),
    updateSystemInfo: vi.fn(),
    getToolbarQuickSettings: vi.fn(() => ({ extended: true, pinnedTabsEnabled: false })),
    getToolbarEnabled: vi.fn(() => settingsController.isToolbarEnabled),
    syncTheme: vi.fn(({ theme, isRetroTheme }) => {
      settingsController.theme = theme;
      settingsController.isRetroTheme = isRetroTheme === true;
    }),
    setToolbarEnabled: vi.fn((enabled) => {
      settingsController.isToolbarEnabled = enabled;
      settingsController.emit('toolbar-enabled-changed', { enabled });
    })
  });
  Object.assign(uiController, {
    setTheme: vi.fn(async () => {}),
    playRetroStartupSound: vi.fn()
  });
  Object.assign(tabUIController, { updatePinnedTabs: vi.fn() });

  const pluginModalController = { refresh: vi.fn() };
  const toolbarComponent = {
    emit: vi.fn(),
    setToolbarEnabled: vi.fn(),
    updateQuickSettings: vi.fn(),
    updateThemeButton: vi.fn()
  };
  const editorComponent = { updateTheme: vi.fn() };
  const previewComponent = { emit: vi.fn() };
  const activeTab = { id: 'active', content: '# Active', filePath: 'C:\\notes\\active.md' };
  const tabManager = { getActiveTab: vi.fn(() => activeTab) };
  const modeController = { getCurrentMode: vi.fn(() => 'split'), setMode: vi.fn() };
  const performanceOptimizer = { id: 'perf' };

  const coordinator = new window.SettingsCoordinator();
  coordinator.setDependencies({
    settingsController,
    uiController,
    pluginModalController,
    toolbarComponent,
    editorComponent,
    previewComponent,
    tabManager,
    tabUIController,
    modeController,
    performanceOptimizer
  });

  return {
    coordinator,
    settingsController,
    uiController,
    pluginModalController,
    toolbarComponent,
    editorComponent,
    previewComponent,
    tabManager,
    tabUIController,
    modeController,
    performanceOptimizer
  };
}

describe('SettingsCoordinator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs one canonical refresh for every Settings entry point', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    // Toolbar, keyboard, welcome, and the Plugin Manager return flow all reach
    // this through UIController.showSettings().
    context.uiController.emit('settings-shown');
    // The status-bar tab manager requests the same refresh.
    context.tabUIController.emit('settings-update-requested');

    expect(context.settingsController.updateSettingsDisplay).toHaveBeenCalledTimes(2);
    expect(context.settingsController.updatePerformanceDashboard).toHaveBeenCalledWith(
      context.performanceOptimizer,
      context.tabManager
    );
    expect(context.settingsController.updateSystemInfo).toHaveBeenCalledWith(
      context.editorComponent,
      context.previewComponent,
      'split'
    );
    expect(context.pluginModalController.refresh).toHaveBeenCalledTimes(2);
  });

  it('routes Settings theme changes through UIController so the stylesheet loads first', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.settingsController.emit('theme-changed', { theme: 'dark', isRetroTheme: false });

    expect(context.uiController.setTheme).toHaveBeenCalledWith('dark', false);
    // The editor is notified only by UIController's resulting theme-changed event.
    expect(context.editorComponent.updateTheme).not.toHaveBeenCalled();
  });

  it('applies an announced theme to the editor, Preview, toolbar, and mode', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.uiController.emit('theme-changed', { theme: 'dark', isRetroTheme: false });

    expect(context.editorComponent.updateTheme).toHaveBeenCalledWith('dark');
    expect(context.previewComponent.emit).toHaveBeenCalledWith('theme-changed', { theme: 'dark' });
    expect(context.toolbarComponent.updateThemeButton).toHaveBeenCalledWith('dark', false);
    expect(context.previewComponent.emit).toHaveBeenCalledWith('update-preview', {
      content: '# Active',
      filePath: 'C:\\notes\\active.md'
    });

    expect(context.modeController.setMode).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(context.modeController.setMode).toHaveBeenCalledWith('split');
  });

  it('adopts a theme applied outside Settings so the modal cannot go stale', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    // Picked in Settings first.
    context.settingsController.emit('theme-changed', { theme: 'contrast', isRetroTheme: false });
    context.uiController.emit('theme-changed', { theme: 'contrast', isRetroTheme: false });
    expect(context.settingsController.theme).toBe('contrast');

    // Then changed by the toolbar button or Ctrl+T, which only UIController sees.
    context.uiController.emit('theme-changed', { theme: 'light', isRetroTheme: false });

    expect(context.settingsController.syncTheme).toHaveBeenLastCalledWith({
      theme: 'light',
      isRetroTheme: false
    });
    expect(context.settingsController.theme).toBe('light');
    expect(context.settingsController.isRetroTheme).toBe(false);
  });

  it('adopts a Retro toggle so the Retro-only settings follow the applied theme', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.uiController.emit('theme-changed', { theme: 'light', isRetroTheme: true });

    expect(context.settingsController.isRetroTheme).toBe(true);
  });

  it('does not send an adopted theme back to UIController', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.uiController.emit('theme-changed', { theme: 'dark', isRetroTheme: false });

    // Re-applying here would loop: setTheme() emits theme-changed itself.
    expect(context.uiController.setTheme).not.toHaveBeenCalled();
  });

  it('routes rendering mode, pinned tabs, quick-control pins, and the sound test', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.settingsController.emit('rendering-mode-changed', { extended: true });
    context.settingsController.emit('pinned-tabs-changed', { enabled: true });
    context.settingsController.emit('toolbar-pins-changed', { renderingPinned: true });
    context.settingsController.emit('retro-sound-test-requested');
    context.settingsController.emit('settings-changed');

    expect(context.previewComponent.emit).toHaveBeenCalledWith('rendering-mode-changed', {
      extended: true
    });
    expect(context.tabUIController.updatePinnedTabs).toHaveBeenCalledOnce();
    expect(context.toolbarComponent.updateQuickSettings).toHaveBeenCalledWith({
      extended: true,
      pinnedTabsEnabled: false
    });
    expect(context.toolbarComponent.updateQuickSettings).toHaveBeenCalledWith({
      renderingPinned: true
    });
    expect(context.uiController.playRetroStartupSound).toHaveBeenCalledOnce();
    expect(context.settingsController.updateSystemInfo).toHaveBeenCalledOnce();
  });

  it('leaves pinned tabs untouched when the feature is switched off', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.settingsController.emit('pinned-tabs-changed', { enabled: false });

    expect(context.tabUIController.updatePinnedTabs).not.toHaveBeenCalled();
    expect(context.toolbarComponent.updateQuickSettings).toHaveBeenCalledOnce();
  });

  it('toggles the Markdown toolbar through SettingsController instead of mutating it', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.coordinator.toggleMarkdownToolbar();

    // One write path keeps the persisted value, the Settings display, and the
    // toolbar presentation from drifting apart.
    expect(context.settingsController.setToolbarEnabled).toHaveBeenCalledWith(false);
    expect(context.toolbarComponent.setToolbarEnabled).toHaveBeenCalledWith(false);

    context.coordinator.toggleMarkdownToolbar();
    expect(context.settingsController.setToolbarEnabled).toHaveBeenLastCalledWith(true);
    expect(context.toolbarComponent.setToolbarEnabled).toHaveBeenLastCalledWith(true);
  });

  it('forwards distraction-free changes to the toolbar', async () => {
    const context = createCoordinator();
    await context.coordinator.init();

    context.uiController.emit('distraction-free-changed', { isDistractionFree: true });

    expect(context.toolbarComponent.emit).toHaveBeenCalledWith('distraction-free-changed', {
      isDistractionFree: true
    });
  });

  it('removes every source listener and cancels delayed work on teardown', async () => {
    const context = createCoordinator();
    await context.coordinator.init();
    context.uiController.emit('theme-changed', { theme: 'dark', isRetroTheme: false });

    const sources = [context.settingsController, context.uiController, context.tabUIController];
    const registered = sources.reduce((total, source) => total + source.on.mock.calls.length, 0);

    context.coordinator.destroy();
    vi.runAllTimers();
    context.uiController.emit('settings-shown');

    expect(registered).toBe(11);
    for (const source of sources) {
      expect(source.off).toHaveBeenCalledTimes(source.on.mock.calls.length);
      for (const [event, handler] of source.on.mock.calls) {
        expect(source.off).toHaveBeenCalledWith(event, handler);
      }
    }
    // The delayed mode reapplication must not fire after teardown.
    expect(context.modeController.setMode).not.toHaveBeenCalled();
    expect(context.settingsController.updateSettingsDisplay).not.toHaveBeenCalled();
  });

  it('does not double-bind when reinitialized after teardown', async () => {
    const context = createCoordinator();
    await context.coordinator.init();
    context.coordinator.destroy();
    await context.coordinator.init();

    context.uiController.emit('settings-shown');

    expect(context.settingsController.updateSettingsDisplay).toHaveBeenCalledOnce();
  });
});
