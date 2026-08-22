/**
 * Owns communication between SettingsController, UIController, and the Plugin
 * Manager, plus the single canonical Settings refresh.
 *
 * Preference state stays in SettingsController and presentation stays in
 * UIController/ToolbarComponent; this coordinator only connects them, so no
 * participant reaches into another participant's fields.
 */
class SettingsCoordinator extends BaseComponent {
  constructor(options = {}) {
    super('SettingsCoordinator', options);
    this.settingsController = null;
    this.uiController = null;
    this.pluginModalController = null;
    this.toolbarComponent = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.tabManager = null;
    this.tabUIController = null;
    this.modeController = null;
    this.performanceOptimizer = null;
    this.sourceEventHandlers = [];
    this.pendingTimers = new Set();
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    // UIController presents themes, modals, and layout state.
    this.listen(this.uiController, 'theme-changed', (data) => this.handleThemeChange(data));
    this.listen(this.uiController, 'settings-shown', () => this.refreshSettingsDisplay());
    this.listen(this.uiController, 'distraction-free-changed', (data) =>
      this.toolbarComponent.emit('distraction-free-changed', data));

    // SettingsController owns preference values and persistence.
    // Theme changes are routed through UIController so the matching stylesheet
    // loads before the editor is notified.
    this.listen(this.settingsController, 'theme-changed', (data) =>
      this.uiController.setTheme(data.theme, data.isRetroTheme));
    this.listen(this.settingsController, 'rendering-mode-changed', (data) => {
      this.previewComponent.emit('rendering-mode-changed', data);
      this.syncToolbarQuickSettings();
    });
    this.listen(this.settingsController, 'retro-sound-test-requested', () =>
      this.uiController.playRetroStartupSound());
    this.listen(this.settingsController, 'toolbar-enabled-changed', ({ enabled }) =>
      this.toolbarComponent.setToolbarEnabled(enabled));
    this.listen(this.settingsController, 'pinned-tabs-changed', ({ enabled }) => {
      if (enabled) this.tabUIController.updatePinnedTabs();
      this.syncToolbarQuickSettings();
    });
    this.listen(this.settingsController, 'toolbar-pins-changed', (data) =>
      this.toolbarComponent.updateQuickSettings(data));
    this.listen(this.settingsController, 'settings-changed', () => this.refreshSystemInfo());

    // The status-bar tab manager can invalidate performance information.
    this.listen(this.tabUIController, 'settings-update-requested', () =>
      this.refreshSettingsDisplay());
  }

  listen(source, event, handler) {
    source.on(event, handler);
    this.sourceEventHandlers.push({ source, event, handler });
  }

  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);
      callback();
    }, delay);
    this.pendingTimers.add(timer);
    return timer;
  }

  /**
   * The one Settings refresh used by every entry point: toolbar, keyboard,
   * welcome screen, status-bar tab manager, and the Plugin Manager return flow.
   */
  refreshSettingsDisplay() {
    this.settingsController.updateSettingsDisplay();
    this.settingsController.updatePerformanceDashboard(this.performanceOptimizer, this.tabManager);
    this.refreshSystemInfo();
    this.pluginModalController?.refresh();
  }

  refreshSystemInfo() {
    this.settingsController.updateSystemInfo(
      this.editorComponent,
      this.previewComponent,
      this.modeController.getCurrentMode()
    );
  }

  syncToolbarQuickSettings() {
    this.toolbarComponent.updateQuickSettings(this.settingsController.getToolbarQuickSettings());
  }

  /**
   * Markdown toolbar visibility has one owner. The shortcut and the Settings
   * On/Off buttons both go through SettingsController, so persisted value,
   * Settings display, and toolbar presentation cannot drift apart.
   */
  toggleMarkdownToolbar() {
    this.settingsController.setToolbarEnabled(!this.settingsController.getToolbarEnabled());
  }

  handleThemeChange(themeData) {
    // Keep the Settings values on the applied theme. Without this the modal
    // still highlights the last theme picked in Settings after the toolbar
    // button or Ctrl+T changed it.
    this.settingsController.syncTheme(themeData);

    // Update the active editor theme through its neutral adapter.
    this.editorComponent.updateTheme(themeData.theme);

    this.previewComponent.emit('theme-changed', { theme: themeData.theme });
    this.toolbarComponent.updateThemeButton(themeData.theme, themeData.isRetroTheme);

    // Reapply the current mode after the theme stylesheet settles so pane
    // sizing and editor layout are recalculated against the new styles.
    this.schedule(() => {
      this.modeController.setMode(this.modeController.getCurrentMode());
    }, 100);

    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      this.previewComponent.emit('update-preview', {
        content: activeTab.content,
        filePath: activeTab.filePath
      });
    }
  }

  onDestroy() {
    for (const { source, event, handler } of this.sourceEventHandlers) {
      source?.off(event, handler);
    }
    this.sourceEventHandlers = [];
    for (const timer of this.pendingTimers) clearTimeout(timer);
    this.pendingTimers.clear();
  }
}

window.SettingsCoordinator = SettingsCoordinator;
export { SettingsCoordinator };
