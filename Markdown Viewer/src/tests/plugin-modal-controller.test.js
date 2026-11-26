import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../core/PluginConfig.js');
  await import('../core/PluginManager.js');
  await import('../components/PluginModalController.js');
});

function installModalMarkup() {
  document.body.innerHTML = `
    <div id="settings-modal" style="display: flex">
      <div class="plugin-system-setting">
        <button data-plugin-system-value="true">Enabled</button>
        <button data-plugin-system-value="false">Disabled</button>
      </div>
      <div id="plugin-summary-list"></div>
      <button id="open-plugin-manager-btn">Open</button>
    </div>
    <div id="plugin-manager-modal" style="display: none">
      <div class="plugin-manager-overlay"></div>
      <button id="plugin-manager-back-btn"></button>
      <button id="plugin-manager-close-btn"></button>
      <div id="plugin-manager-tabs"></div>
      <div id="plugin-manager-panels"></div>
      <div id="plugin-manager-action-status"></div>
    </div>
  `;
}

describe('PluginModalController', () => {
  let controller;
  let manager;
  let uiController;

  beforeEach(async () => {
    localStorage.clear();
    installModalMarkup();
    uiController = {
      hideSettings: vi.fn(() => {
        document.getElementById('settings-modal').style.display = 'none';
      }),
      showSettings: vi.fn(() => {
        document.getElementById('settings-modal').style.display = 'flex';
      })
    };
    manager = new window.PluginManager({});
    controller = new window.PluginModalController();
    await controller.init();
  });

  afterEach(() => {
    controller.destroy();
    document.body.innerHTML = '';
  });

  it('opens directly on a plugin tab without stacking the Settings modal', async () => {
    class ConfigurablePlugin {
      mountSettings(host) {
        const setting = document.createElement('p');
        setting.textContent = 'Plugin-specific setting';
        host.replaceChildren(setting);
      }
    }
    manager.registerPlugin('configurable-plugin', ConfigurablePlugin, {
      name: 'Configurable Plugin',
      version: '1.2.3',
      description: 'Test settings'
    });
    await manager.enablePlugin('configurable-plugin');
    controller.setDependencies({
      pluginManager: manager,
      pluginLoader: { getDiagnostics: () => [] },
      uiController
    });

    document.querySelector('.plugin-settings-open-btn').click();
    await vi.waitFor(() => {
      expect(document.getElementById('plugin-manager-modal').style.display).toBe('flex');
    });

    expect(uiController.hideSettings).toHaveBeenCalledOnce();
    expect(document.getElementById('settings-modal').style.display).toBe('none');
    expect(document.querySelector('[data-plugin-tab="configurable-plugin"]').classList.contains('active')).toBe(true);
    expect(document.querySelector('[data-plugin-settings-host="configurable-plugin"]').textContent)
      .toContain('Plugin-specific setting');

    document.getElementById('plugin-manager-back-btn').click();
    await vi.waitFor(() => expect(uiController.showSettings).toHaveBeenCalledOnce());
    expect(document.getElementById('plugin-manager-modal').style.display).toBe('none');
  });

  it('pauses and restores plugins from the master control without losing preferences', async () => {
    class Plugin {}
    manager.registerPlugin('remembered-plugin', Plugin, {
      name: 'Remembered Plugin',
      version: '1.0.0'
    });
    await manager.enablePlugin('remembered-plugin');
    controller.setDependencies({
      pluginManager: manager,
      pluginLoader: { getDiagnostics: () => [] },
      uiController
    });

    const setSystemEnabled = vi.spyOn(manager, 'setPluginSystemEnabled');
    const alreadySelected = document.querySelector('.plugin-system-setting [data-plugin-system-value="true"]');
    alreadySelected.click();
    expect(setSystemEnabled).not.toHaveBeenCalled();
    expect(alreadySelected.textContent).toBe('Enabled');

    document.querySelector('.plugin-system-setting [data-plugin-system-value="false"]').click();
    await vi.waitFor(() => {
      expect(manager.isPluginSystemEnabled()).toBe(false);
      expect(manager.isPluginActive('remembered-plugin')).toBe(false);
    });

    expect(manager.isPluginEnabled('remembered-plugin')).toBe(true);
    expect(document.querySelector('.plugin-summary-item .plugin-status').textContent).toBe('Paused');

    document.querySelector('.plugin-system-setting [data-plugin-system-value="true"]').click();
    await vi.waitFor(() => expect(manager.isPluginActive('remembered-plugin')).toBe(true));
    expect(manager.isPluginEnabled('remembered-plugin')).toBe(true);
  });
});
