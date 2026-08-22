import { ask } from '@tauri-apps/plugin-dialog';

/**
 * Owns the plugin-management workspace and the compact plugin summary shown in
 * the main Settings modal. Plugin implementations may optionally expose a
 * mountSettings(container) method for their dedicated tab.
 */
class PluginModalController extends BaseComponent {
  constructor() {
    super('PluginModalController');
    this.pluginManager = null;
    this.pluginLoader = null;
    this.uiController = null;
    this.activeTabId = 'general';
    this.returnToSettings = false;
    this.modal = null;
    this.mainSystemButtonHandlers = [];
    this.boundClose = () => this.hide();
    this.boundBack = () => this.backToSettings();
    this.boundOpen = () => this.show('general', { returnToSettings: true });
    this.boundTabKeydown = (event) => this.handleTabKeydown(event);
  }

  async onInit() {
    this.modal = document.getElementById('plugin-manager-modal');
    document.getElementById('plugin-manager-close-btn')
      ?.addEventListener('click', this.boundClose);
    document.querySelector('#plugin-manager-modal .plugin-manager-overlay')
      ?.addEventListener('click', this.boundClose);
    document.getElementById('plugin-manager-back-btn')
      ?.addEventListener('click', this.boundBack);
    document.getElementById('open-plugin-manager-btn')
      ?.addEventListener('click', this.boundOpen);
    document.getElementById('plugin-manager-tabs')
      ?.addEventListener('keydown', this.boundTabKeydown);
    document.querySelectorAll('.plugin-system-setting [data-plugin-system-value]').forEach((button) => {
      const handler = () => this.setPluginSystemEnabled(button.dataset.pluginSystemValue === 'true', button);
      button.addEventListener('click', handler);
      this.mainSystemButtonHandlers.push({ button, handler });
    });
  }

  setDependencies({ pluginManager, pluginLoader, uiController }) {
    this.pluginManager = pluginManager;
    this.pluginLoader = pluginLoader;
    this.uiController = uiController;
    this.refresh();
  }

  async show(pluginId = 'general', options = {}) {
    if (window.styleManager) await window.styleManager.loadSettingsModal();
    this.returnToSettings = options.returnToSettings === true;
    if (this.returnToSettings) this.uiController?.hideSettings();
    this.refresh();
    this.selectTab(pluginId);
    if (this.modal) this.modal.style.display = 'flex';
    document.getElementById('plugin-manager-back-btn')
      ?.classList.toggle('visible', this.returnToSettings);
    document.querySelector(`#plugin-manager-tabs [data-plugin-tab="${this.activeTabId}"]`)
      ?.focus();
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
    this.returnToSettings = false;
  }

  async backToSettings() {
    if (this.modal) this.modal.style.display = 'none';
    this.returnToSettings = false;
    await this.uiController?.showSettings();
    this.refreshSummary();
    document.getElementById('open-plugin-manager-btn')?.focus();
  }

  isOpen() {
    return this.modal?.style.display === 'flex';
  }

  async closeFromKeyboard() {
    this.hide();
  }

  refresh() {
    if (!this.pluginManager) return;
    this.refreshSummary();
    this.renderTabsAndPanels();
    this.updateSystemControls();
  }

  refreshSummary() {
    const summary = document.getElementById('plugin-summary-list');
    if (!summary || !this.pluginManager) return;
    summary.replaceChildren();

    const plugins = this.pluginManager.getAllPlugins();
    if (plugins.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-plugins';
      empty.textContent = 'No plugins available';
      summary.appendChild(empty);
      return;
    }

    for (const plugin of plugins) {
      const row = document.createElement('div');
      row.className = 'plugin-summary-item';

      const identity = document.createElement('div');
      identity.className = 'plugin-summary-identity';
      const name = document.createElement('strong');
      name.textContent = plugin.metadata.name;
      const state = document.createElement('span');
      state.className = `plugin-status ${this.getDisplayStatus(plugin.id)}`;
      state.textContent = this.formatPluginStatus(this.getDisplayStatus(plugin.id));
      identity.append(name, state);

      const controls = document.createElement('div');
      controls.className = 'plugin-summary-controls';
      const toggle = this.createPluginToggle(plugin);
      const settings = document.createElement('button');
      settings.className = 'setting-btn plugin-settings-open-btn';
      settings.textContent = 'Settings…';
      settings.addEventListener('click', () => this.show(plugin.id, { returnToSettings: true }));
      controls.append(toggle, settings);
      row.append(identity, controls);
      summary.appendChild(row);
    }
  }

  renderTabsAndPanels() {
    const tabList = document.getElementById('plugin-manager-tabs');
    const panels = document.getElementById('plugin-manager-panels');
    if (!tabList || !panels) return;

    tabList.replaceChildren();
    panels.replaceChildren();
    this.appendGeneralTab(tabList, panels);

    for (const plugin of this.pluginManager.getAllPlugins()) {
      const tab = this.createTab(plugin.id, plugin.metadata.name);
      const panel = this.createPluginPanel(plugin);
      tabList.appendChild(tab);
      panels.appendChild(panel);
    }

    const availableTabs = ['general', ...this.pluginManager.getAllPlugins().map((plugin) => plugin.id)];
    if (!availableTabs.includes(this.activeTabId)) this.activeTabId = 'general';
    this.selectTab(this.activeTabId);
  }

  appendGeneralTab(tabList, panels) {
    tabList.appendChild(this.createTab('general', 'General'));

    const panel = document.createElement('section');
    panel.id = 'plugin-panel-general';
    panel.className = 'plugin-manager-panel';
    panel.dataset.pluginPanel = 'general';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'plugin-tab-general');

    const heading = document.createElement('h3');
    heading.textContent = 'Plugin System';
    const description = document.createElement('p');
    description.className = 'plugin-manager-description';
    description.textContent = 'Pause all plugins without forgetting which plugins you enabled.';
    const systemControls = document.createElement('div');
    systemControls.className = 'plugin-system-controls';
    systemControls.append(
      this.createSystemButton(true, 'Enabled'),
      this.createSystemButton(false, 'Disabled')
    );

    const actionsHeading = document.createElement('h3');
    actionsHeading.textContent = 'Maintenance';
    const actions = document.createElement('div');
    actions.className = 'plugin-manager-actions';
    const reload = document.createElement('button');
    reload.className = 'settings-btn perf-action-btn';
    reload.textContent = 'Reload Plugins';
    reload.title = 'Deactivate, rediscover, and reload bundled plugins';
    reload.addEventListener('click', () => this.reloadPlugins(reload));
    const reset = document.createElement('button');
    reset.className = 'settings-btn plugin-danger-btn';
    reset.textContent = 'Reset All Plugin Config';
    reset.addEventListener('click', () => this.resetAllPlugins(reset));
    actions.append(reload, reset);

    const diagnosticsHeading = document.createElement('h3');
    diagnosticsHeading.textContent = 'Diagnostics';
    const diagnostics = document.createElement('div');
    diagnostics.className = 'plugin-diagnostics';
    const entries = this.pluginLoader?.getDiagnostics?.() || [];
    if (entries.length === 0) {
      const healthy = document.createElement('p');
      healthy.className = 'plugin-manager-description';
      healthy.textContent = 'No plugin loader problems reported.';
      diagnostics.appendChild(healthy);
    } else {
      for (const diagnostic of entries) {
        const item = document.createElement('div');
        item.className = `plugin-diagnostic ${diagnostic.severity}`;
        item.textContent = `${diagnostic.pluginId}: ${diagnostic.message}`;
        diagnostics.appendChild(item);
      }
    }

    panel.append(heading, description, systemControls, actionsHeading, actions, diagnosticsHeading, diagnostics);
    panels.appendChild(panel);
  }

  createTab(pluginId, label) {
    const tab = document.createElement('button');
    tab.className = 'plugin-manager-tab';
    tab.dataset.pluginTab = pluginId;
    tab.id = `plugin-tab-${pluginId}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `plugin-panel-${pluginId}`);
    tab.textContent = label;
    tab.addEventListener('click', () => this.selectTab(pluginId));
    return tab;
  }

  createPluginPanel(plugin) {
    const panel = document.createElement('section');
    panel.id = `plugin-panel-${plugin.id}`;
    panel.className = 'plugin-manager-panel';
    panel.dataset.pluginPanel = plugin.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `plugin-tab-${plugin.id}`);

    const header = document.createElement('div');
    header.className = 'plugin-panel-header';
    const identity = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = plugin.metadata.name;
    const version = document.createElement('div');
    version.className = 'plugin-version';
    version.textContent = `Version ${plugin.metadata.version}`;
    identity.append(heading, version);
    header.append(identity, this.createPluginToggle(plugin));

    const description = document.createElement('p');
    description.className = 'plugin-manager-description';
    description.textContent = plugin.metadata.description || 'No description provided.';

    const pluginState = this.pluginManager.getPluginStatus(plugin.id);
    const status = document.createElement('div');
    status.className = 'plugin-panel-status';
    status.append('Status: ');
    const statusBadge = document.createElement('span');
    const displayStatus = this.getDisplayStatus(plugin.id);
    statusBadge.className = `plugin-status ${displayStatus}`;
    statusBadge.textContent = this.formatPluginStatus(displayStatus);
    status.appendChild(statusBadge);

    if (pluginState?.lastError) {
      const error = document.createElement('div');
      error.className = 'plugin-error';
      error.textContent = pluginState.lastError;
      panel.append(header, description, status, error);
    } else {
      panel.append(header, description, status);
    }

    const settingsHeading = document.createElement('h3');
    settingsHeading.textContent = 'Settings';
    const host = document.createElement('div');
    host.className = 'plugin-settings-host';
    host.dataset.pluginSettingsHost = plugin.id;
    panel.append(settingsHeading, host);

    if (plugin.instance?.mountSettings) {
      plugin.instance.mountSettings(host);
    } else {
      const unavailable = document.createElement('p');
      unavailable.className = 'plugin-manager-description';
      unavailable.textContent = pluginState?.isActive
        ? 'This plugin does not provide configurable settings.'
        : pluginState?.isEnabled && !pluginState?.isSystemEnabled
          ? 'Resume the plugin system to configure this plugin.'
          : 'Enable this plugin to configure its settings.';
      host.appendChild(unavailable);
    }

    const reset = document.createElement('button');
    reset.className = 'plugin-reset-button';
    reset.textContent = 'Reset This Plugin';
    reset.addEventListener('click', () => this.resetPlugin(plugin.id, reset));
    panel.appendChild(reset);

    return panel;
  }

  createPluginToggle(plugin) {
    const state = this.pluginManager.getPluginStatus(plugin.id);
    const button = document.createElement('button');
    button.className = `setting-btn ${state?.isEnabled ? 'active' : ''}`;
    button.textContent = state?.isEnabled ? 'Disable' : (state?.status === 'error' ? 'Retry' : 'Enable');
    button.addEventListener('click', () => this.togglePlugin(plugin.id, button));
    return button;
  }

  createSystemButton(enabled, label) {
    const button = document.createElement('button');
    button.className = 'setting-btn';
    button.dataset.pluginSystemValue = String(enabled);
    button.textContent = label;
    button.addEventListener('click', () => this.setPluginSystemEnabled(enabled, button));
    return button;
  }

  async togglePlugin(pluginId, button) {
    button.disabled = true;
    const wasEnabled = this.pluginManager.isPluginEnabled(pluginId);
    button.textContent = wasEnabled ? 'Disabling…' : 'Enabling…';
    const succeeded = wasEnabled
      ? await this.pluginManager.disablePlugin(pluginId)
      : await this.pluginManager.enablePlugin(pluginId);
    const plugin = this.pluginManager.getPlugin(pluginId);
    const paused = !this.pluginManager.isPluginSystemEnabled() && this.pluginManager.isPluginEnabled(pluginId);
    this.setActionStatus(
      succeeded
        ? `${plugin.metadata.name} ${paused ? 'enabled; plugin system is paused.' : wasEnabled ? 'disabled.' : 'enabled.'}`
        : `${plugin.metadata.name} failed: ${this.pluginManager.getPluginStatus(pluginId)?.lastError || 'unknown plugin error'}`,
      !succeeded
    );
    this.activeTabId = pluginId;
    this.refresh();
  }

  async setPluginSystemEnabled(enabled, button) {
    if (this.pluginManager.isPluginSystemEnabled() === enabled) {
      this.updateSystemControls();
      return;
    }

    const controls = document.querySelectorAll('[data-plugin-system-value]');
    controls.forEach((control) => { control.disabled = true; });
    button.textContent = enabled ? 'Enabling…' : 'Disabling…';
    const succeeded = await this.pluginManager.setPluginSystemEnabled(enabled);
    this.setActionStatus(
      succeeded
        ? `Plugin system ${enabled ? 'enabled' : 'disabled'}.`
        : `Plugin system ${enabled ? 'enabled' : 'disabled'} with plugin errors.`,
      !succeeded
    );
    this.refresh();
  }

  updateSystemControls() {
    const isEnabled = this.pluginManager?.isPluginSystemEnabled() !== false;
    document.querySelectorAll('[data-plugin-system-value]').forEach((button) => {
      button.textContent = button.dataset.pluginSystemValue === 'true' ? 'Enabled' : 'Disabled';
      button.classList.toggle('active', button.dataset.pluginSystemValue === String(isEnabled));
      button.disabled = false;
    });
  }

  async reloadPlugins(button) {
    button.disabled = true;
    this.setActionStatus('Reloading plugins…');
    try {
      const plugins = await this.pluginLoader.reloadPlugins();
      const errors = [
        ...this.pluginLoader.getDiagnostics().filter((diagnostic) => diagnostic.severity === 'error'),
        ...this.pluginManager.getAllPlugins().filter((plugin) => plugin.status === 'error')
      ];
      this.setActionStatus(
        errors.length ? `Reloaded ${plugins.length} plugin(s); ${errors.length} failed.` : `Reloaded ${plugins.length} plugin(s) successfully.`,
        errors.length > 0
      );
    } catch (error) {
      this.setActionStatus(`Plugin reload failed: ${error.message}`, true);
    } finally {
      this.refresh();
    }
  }

  async resetAllPlugins(button) {
    button.disabled = true;
    this.clearActionStatus();
    try {
      const confirmed = await this.confirmReset();
      if (!confirmed) {
        this.setActionStatus('Plugin configuration reset cancelled.');
        return;
      }
      const succeeded = await this.pluginManager.resetAllPluginConfig();
      this.setActionStatus(
        succeeded ? 'Plugin configuration reset successfully.' : 'Plugin configuration reset completed with errors.',
        !succeeded
      );
    } catch (error) {
      this.setActionStatus(`Plugin configuration reset failed: ${error.message}`, true);
    } finally {
      this.refresh();
    }
  }

  async resetPlugin(pluginId, button) {
    const plugin = this.pluginManager.getPlugin(pluginId);
    if (!plugin) return;
    button.disabled = true;
    this.clearActionStatus();
    try {
      const confirmed = await this.confirmPluginReset(plugin.metadata.name);
      if (!confirmed) {
        this.setActionStatus(`${plugin.metadata.name} reset cancelled.`);
        return;
      }
      const succeeded = await this.pluginManager.resetPluginConfig(pluginId);
      this.setActionStatus(
        succeeded ? `${plugin.metadata.name} reset to defaults.` : `${plugin.metadata.name} reset failed.`,
        !succeeded
      );
    } catch (error) {
      this.setActionStatus(`${plugin.metadata.name} reset failed: ${error.message}`, true);
    } finally {
      this.activeTabId = pluginId;
      this.refresh();
    }
  }

  async confirmReset() {
    if (window.__TAURI__?.core?.invoke) {
      return await ask('Reset all plugin configurations and disable every plugin?', {
        title: 'Reset Plugin Configuration',
        kind: 'warning',
        okLabel: 'Reset',
        cancelLabel: 'Cancel'
      });
    }
    return window.confirm('Reset all plugin configurations and disable every plugin?');
  }

  async confirmPluginReset(pluginName) {
    const prompt = `Reset ${pluginName} to its default settings?`;
    if (window.__TAURI__?.core?.invoke) {
      return await ask(prompt, {
        title: 'Reset Plugin Settings',
        kind: 'warning',
        okLabel: 'Reset',
        cancelLabel: 'Cancel'
      });
    }
    return window.confirm(prompt);
  }

  selectTab(pluginId) {
    const requestedPanel = document.querySelector(`[data-plugin-panel="${pluginId}"]`);
    this.activeTabId = requestedPanel ? pluginId : 'general';
    document.querySelectorAll('#plugin-manager-tabs [data-plugin-tab]').forEach((tab) => {
      const selected = tab.dataset.pluginTab === this.activeTabId;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('#plugin-manager-panels [data-plugin-panel]').forEach((panel) => {
      const selected = panel.dataset.pluginPanel === this.activeTabId;
      panel.classList.toggle('active', selected);
      panel.setAttribute('aria-hidden', String(!selected));
    });
  }

  handleTabKeydown(event) {
    const tabs = [...document.querySelectorAll('#plugin-manager-tabs [data-plugin-tab]')];
    const currentIndex = tabs.indexOf(event.target);
    if (currentIndex < 0 || tabs.length === 0) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    this.selectTab(tabs[nextIndex].dataset.pluginTab);
    tabs[nextIndex].focus();
  }

  getDisplayStatus(pluginId) {
    const state = this.pluginManager.getPluginStatus(pluginId);
    if (!state?.isSystemEnabled && state?.isEnabled) return 'paused';
    return state?.status || 'inactive';
  }

  formatPluginStatus(status) {
    return ({
      active: 'Active',
      inactive: 'Inactive',
      paused: 'Paused',
      activating: 'Activating',
      deactivating: 'Deactivating',
      error: 'Error'
    })[status] || 'Inactive';
  }

  setActionStatus(message, isError = false) {
    const status = document.getElementById('plugin-manager-action-status');
    if (!status) return;
    status.textContent = message;
    status.classList.add('show');
    status.classList.toggle('error', isError);
  }

  clearActionStatus() {
    const status = document.getElementById('plugin-manager-action-status');
    if (!status) return;
    status.textContent = '';
    status.classList.remove('show', 'error');
  }

  onDestroy() {
    document.getElementById('plugin-manager-close-btn')
      ?.removeEventListener('click', this.boundClose);
    document.querySelector('#plugin-manager-modal .plugin-manager-overlay')
      ?.removeEventListener('click', this.boundClose);
    document.getElementById('plugin-manager-back-btn')
      ?.removeEventListener('click', this.boundBack);
    document.getElementById('open-plugin-manager-btn')
      ?.removeEventListener('click', this.boundOpen);
    document.getElementById('plugin-manager-tabs')
      ?.removeEventListener('keydown', this.boundTabKeydown);
    for (const { button, handler } of this.mainSystemButtonHandlers) {
      button.removeEventListener('click', handler);
    }
    this.mainSystemButtonHandlers = [];
  }
}

window.PluginModalController = PluginModalController;
export { PluginModalController };
