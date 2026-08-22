import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/PluginConfig.js');
  await import('../core/PluginManager.js');
});

describe('PluginManager lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function createManager() {
    return new window.PluginManager({
      rendererRegistry: {
        register: vi.fn(),
        unregister: vi.fn()
      }
    });
  }

  it('waits for initialization before reporting an enabled plugin as active', async () => {
    let finishInitialization;
    const initialization = new Promise((resolve) => {
      finishInitialization = resolve;
    });

    class SlowPlugin {
      async init() {
        await initialization;
      }
    }

    const manager = createManager();
    manager.registerPlugin('slow-plugin', SlowPlugin);

    const enabling = manager.enablePlugin('slow-plugin');
    expect(manager.isPluginActive('slow-plugin')).toBe(false);

    finishInitialization();
    expect(await enabling).toBe(true);
    expect(manager.isPluginEnabled('slow-plugin')).toBe(true);
    expect(manager.isPluginActive('slow-plugin')).toBe(true);
  });

  it('refreshes System Info after plugin lifecycle changes', async () => {
    const updateSystemInfo = vi.fn();
    const markdownEditor = {
      rendererRegistry: {
        register: vi.fn(),
        unregister: vi.fn()
      },
      settingsController: { updateSystemInfo },
      editorComponent: {},
      previewComponent: {},
      modeController: { getCurrentMode: () => 'preview' }
    };
    const manager = new window.PluginManager(markdownEditor);
    class Plugin {}
    manager.registerPlugin('status-plugin', Plugin);

    await manager.enablePlugin('status-plugin');
    await manager.disablePlugin('status-plugin');

    expect(updateSystemInfo).toHaveBeenCalled();
    expect(updateSystemInfo).toHaveBeenLastCalledWith(
      markdownEditor.editorComponent,
      markdownEditor.previewComponent,
      'preview'
    );
  });

  it('rolls back the enabled preference when activation fails', async () => {
    class BrokenPlugin {
      async init() {
        throw new Error('Cannot initialize');
      }
    }

    const manager = createManager();
    manager.registerPlugin('broken-plugin', BrokenPlugin);

    expect(await manager.enablePlugin('broken-plugin')).toBe(false);
    expect(manager.isPluginEnabled('broken-plugin')).toBe(false);
    expect(manager.isPluginActive('broken-plugin')).toBe(false);
    expect(manager.getPluginStatus('broken-plugin')).toMatchObject({
      status: 'error',
      lastError: 'Cannot initialize'
    });
  });

  it('removes a stale startup preference when auto-activation fails', async () => {
    class BrokenPlugin {
      init() {
        throw new Error('Startup failure');
      }
    }

    const manager = createManager();
    manager.registerPlugin('broken-plugin', BrokenPlugin);
    manager.getPluginConfig().enablePlugin('broken-plugin');

    await manager.autoActivatePlugins();

    expect(manager.isPluginEnabled('broken-plugin')).toBe(false);
    expect(manager.getPluginStatus('broken-plugin').status).toBe('error');
  });

  it('shares a failed transition across simultaneous enable requests', async () => {
    let rejectInitialization;
    const initialization = new Promise((_, reject) => {
      rejectInitialization = reject;
    });
    const init = vi.fn(() => initialization);

    class BrokenPlugin {
      init() {
        return init();
      }
    }

    const manager = createManager();
    manager.registerPlugin('broken-plugin', BrokenPlugin);
    const first = manager.enablePlugin('broken-plugin');
    const second = manager.enablePlugin('broken-plugin');
    rejectInitialization(new Error('Shared failure'));

    await expect(Promise.all([first, second])).resolves.toEqual([false, false]);
    expect(init).toHaveBeenCalledOnce();
  });

  it('rejects invalid registrations before they enter the plugin catalog', () => {
    const manager = createManager();
    class Plugin {}

    expect(manager.registerPlugin('Invalid Plugin Id', Plugin)).toBe(false);
    expect(manager.registerPlugin('invalid-class', {})).toBe(false);
    expect(manager.registerPlugin('invalid-manifest', Plugin, {}, {
      isValid: false,
      errors: ['bad manifest'],
      warnings: []
    })).toBe(false);
    expect(manager.getAllPlugins()).toHaveLength(0);
  });

  it('normalizes incomplete persisted plugin configuration', () => {
    localStorage.setItem('markdownViewer_pluginConfig', JSON.stringify({
      enabledPlugins: ['one', 'one', 42],
      pluginSettings: []
    }));

    const config = new window.PluginConfig();

    expect(config.getEnabledPlugins()).toEqual(['one']);
    expect(config.isSystemEnabled()).toBe(true);
    expect(config.getPluginSettings('one')).toEqual({});
  });

  it('enables a default plugin only once and remembers a later disable choice', async () => {
    class DefaultPlugin {}
    const manager = createManager();
    manager.registerPlugin('default-plugin', DefaultPlugin, { defaultEnabled: true });

    expect(manager.isPluginEnabled('default-plugin')).toBe(true);
    await manager.disablePlugin('default-plugin');
    expect(manager.isPluginEnabled('default-plugin')).toBe(false);

    const restored = createManager();
    restored.registerPlugin('default-plugin', DefaultPlugin, { defaultEnabled: true });
    expect(restored.isPluginEnabled('default-plugin')).toBe(false);
  });

  it('pauses active plugins without forgetting which plugins should be enabled', async () => {
    const destroy = vi.fn();
    const init = vi.fn();
    class Plugin {
      init() { init(); }
      destroy() { destroy(); }
    }

    const manager = createManager();
    manager.registerPlugin('remembered-plugin', Plugin);
    await manager.enablePlugin('remembered-plugin');

    expect(await manager.setPluginSystemEnabled(false)).toBe(true);
    expect(manager.isPluginSystemEnabled()).toBe(false);
    expect(manager.isPluginEnabled('remembered-plugin')).toBe(true);
    expect(manager.isPluginActive('remembered-plugin')).toBe(false);
    expect(destroy).toHaveBeenCalledOnce();

    expect(await manager.setPluginSystemEnabled(true)).toBe(true);
    expect(manager.isPluginSystemEnabled()).toBe(true);
    expect(manager.isPluginActive('remembered-plugin')).toBe(true);
    expect(init).toHaveBeenCalledTimes(2);
  });

  it('records plugin choices without activating them while the system is paused', async () => {
    const init = vi.fn();
    class Plugin {
      init() { init(); }
    }

    const manager = createManager();
    manager.registerPlugin('paused-plugin', Plugin);
    await manager.setPluginSystemEnabled(false);

    expect(await manager.enablePlugin('paused-plugin')).toBe(true);
    expect(manager.isPluginEnabled('paused-plugin')).toBe(true);
    expect(manager.isPluginActive('paused-plugin')).toBe(false);
    expect(init).not.toHaveBeenCalled();

    await manager.setPluginSystemEnabled(true);
    expect(manager.isPluginActive('paused-plugin')).toBe(true);
    expect(init).toHaveBeenCalledOnce();
  });

  it('provides persistent settings scoped to the active plugin', async () => {
    class ConfigurablePlugin {
      constructor(api) {
        this.api = api;
      }

      init() {
        this.previousChoice = this.api.getSetting('choice', 'default');
        this.api.setSetting('choice', 'custom');
      }
    }

    const manager = createManager();
    manager.registerPlugin('configurable-plugin', ConfigurablePlugin);
    await manager.enablePlugin('configurable-plugin');

    expect(manager.getPlugin('configurable-plugin').instance.previousChoice).toBe('default');
    expect(manager.getPluginConfig().getPluginSetting('configurable-plugin', 'choice')).toBe('custom');
    expect(manager.getPluginConfig().getPluginSetting('another-plugin', 'choice')).toBeNull();

    await manager.deactivatePlugin('configurable-plugin');
    await manager.activatePlugin('configurable-plugin');
    expect(manager.getPlugin('configurable-plugin').instance.previousChoice).toBe('custom');
  });

  it('waits for cleanup before disabling a plugin', async () => {
    let finishCleanup;
    const cleanup = new Promise((resolve) => {
      finishCleanup = resolve;
    });

    class SlowCleanupPlugin {
      async destroy() {
        await cleanup;
      }
    }

    const manager = createManager();
    manager.registerPlugin('cleanup-plugin', SlowCleanupPlugin);
    await manager.enablePlugin('cleanup-plugin');

    const disabling = manager.disablePlugin('cleanup-plugin');
    expect(manager.isPluginEnabled('cleanup-plugin')).toBe(true);
    expect(manager.isPluginActive('cleanup-plugin')).toBe(true);

    finishCleanup();
    expect(await disabling).toBe(true);
    expect(manager.isPluginEnabled('cleanup-plugin')).toBe(false);
    expect(manager.isPluginActive('cleanup-plugin')).toBe(false);
  });

  it('does not unregister a plugin until its cleanup finishes', async () => {
    const destroy = vi.fn();
    class Plugin {
      destroy() {
        destroy();
      }
    }

    const manager = createManager();
    manager.registerPlugin('plugin', Plugin);
    await manager.enablePlugin('plugin');

    expect(await manager.unregisterPlugin('plugin')).toBe(true);
    expect(destroy).toHaveBeenCalledOnce();
    expect(manager.getPlugin('plugin')).toBeUndefined();
  });

  it('removes scoped hooks, events, extensions, and custom resources on disable', async () => {
    const controller = {
      addHook: vi.fn(),
      removeHook: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      registerExtension: vi.fn(),
      unregisterExtension: vi.fn()
    };
    const customCleanup = vi.fn();
    const hook = vi.fn();
    const listener = vi.fn();

    class ResourcePlugin {
      constructor(api) {
        this.api = api;
      }

      init() {
        this.api.addHook('mode', 'before-mode-change', hook);
        this.api.on('mode', 'mode-changed', listener);
        this.api.registerExtension('mode', {
          metadata: { name: 'resource-extension' }
        });
        this.api.registerCleanup(customCleanup);
      }
    }

    const manager = new window.PluginManager({ modeController: controller });
    manager.registerPlugin('resource-plugin', ResourcePlugin);
    await manager.enablePlugin('resource-plugin');
    await manager.disablePlugin('resource-plugin');

    expect(controller.removeHook).toHaveBeenCalledWith('before-mode-change', hook);
    expect(controller.off).toHaveBeenCalledWith('mode-changed', listener);
    expect(controller.unregisterExtension).toHaveBeenCalledWith('resource-extension');
    expect(customCleanup).toHaveBeenCalledOnce();
  });

  it('removes plugin-owned renderers when the plugin is disabled', async () => {
    const rendererRegistry = {
      register: vi.fn(),
      unregister: vi.fn(() => true)
    };
    class RendererPlugin {
      constructor(api) {
        this.api = api;
      }

      init() {
        this.api.registerRenderer('math', { transformHtml: (html) => html });
      }
    }
    const manager = new window.PluginManager({ rendererRegistry });
    manager.registerPlugin('renderer-plugin', RendererPlugin);

    await manager.enablePlugin('renderer-plugin');
    expect(rendererRegistry.register).toHaveBeenCalledWith(
      'renderer-plugin.math',
      expect.any(Object),
      {}
    );

    await manager.disablePlugin('renderer-plugin');
    expect(rendererRegistry.unregister).toHaveBeenCalledWith('renderer-plugin.math');
  });

  it('cleans scoped resources after a partially failed activation', async () => {
    const controller = {
      addHook: vi.fn(),
      removeHook: vi.fn()
    };
    const hook = vi.fn();

    class BrokenResourcePlugin {
      constructor(api) {
        this.api = api;
      }

      init() {
        this.api.addHook('mode', 'before-mode-change', hook);
        throw new Error('Failed after registration');
      }
    }

    const manager = new window.PluginManager({ modeController: controller });
    manager.registerPlugin('broken-resource-plugin', BrokenResourcePlugin);

    expect(await manager.enablePlugin('broken-resource-plugin')).toBe(false);
    expect(controller.removeHook).toHaveBeenCalledWith('before-mode-change', hook);
  });

  it('deactivates plugins and clears their settings during a full reset', async () => {
    const resetConfig = vi.fn();
    const destroy = vi.fn();

    class ConfigurablePlugin {
      destroy() {
        destroy();
      }

      resetConfig() {
        resetConfig();
      }
    }

    const manager = createManager();
    manager.registerPlugin('configurable-plugin', ConfigurablePlugin);
    await manager.enablePlugin('configurable-plugin');
    manager.getPluginConfig().setPluginSetting('configurable-plugin', 'choice', 'custom');

    expect(await manager.resetAllPluginConfig()).toBe(true);
    expect(resetConfig).toHaveBeenCalledOnce();
    expect(destroy).toHaveBeenCalledOnce();
    expect(manager.isPluginEnabled('configurable-plugin')).toBe(false);
    expect(manager.isPluginActive('configurable-plugin')).toBe(false);
    expect(manager.getPluginConfig().getPluginSetting('configurable-plugin', 'choice')).toBeNull();
  });

  it('resets one active plugin and keeps it enabled', async () => {
    const resetConfig = vi.fn();
    const init = vi.fn();
    const destroy = vi.fn();
    class ConfigurablePlugin {
      static resetConfig() { resetConfig(); }
      init() { init(); }
      destroy() { destroy(); }
    }

    const manager = createManager();
    manager.registerPlugin('configurable-plugin', ConfigurablePlugin);
    await manager.enablePlugin('configurable-plugin');
    manager.getPluginConfig().setPluginSetting('configurable-plugin', 'choice', 'custom');

    expect(await manager.resetPluginConfig('configurable-plugin')).toBe(true);
    expect(resetConfig).toHaveBeenCalledOnce();
    expect(destroy).toHaveBeenCalledOnce();
    expect(init).toHaveBeenCalledTimes(2);
    expect(manager.isPluginEnabled('configurable-plugin')).toBe(true);
    expect(manager.isPluginActive('configurable-plugin')).toBe(true);
    expect(manager.getPluginConfig().getPluginSetting('configurable-plugin', 'choice')).toBeNull();
  });
});
