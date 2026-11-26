import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PluginLoader } from '../core/PluginLoader.js';

class TestPlugin {
  static metadata = {
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin'
  };

  init() {}
  destroy() {}
}

describe('PluginLoader registry discovery', () => {
  let pluginManager;

  beforeEach(() => {
    pluginManager = {
      registerPlugin: vi.fn(() => true),
      getAllPlugins: vi.fn(() => []),
      isPluginEnabled: vi.fn(() => false),
      isPluginActive: vi.fn(() => false),
      unregisterPlugin: vi.fn(),
      enablePlugin: vi.fn(),
      disablePlugin: vi.fn()
    };
  });

  it('discovers a plugin from a module export without a window class lookup', async () => {
    const load = vi.fn(async () => ({ default: TestPlugin }));
    const loader = new PluginLoader(pluginManager, {
      pluginDefinitions: [{
        id: 'test-plugin',
        path: '/plugins/TestPlugin.js',
        metadata: TestPlugin.metadata,
        load
      }]
    });

    const plugins = await loader.discoverPlugins();

    expect(load).not.toHaveBeenCalled();
    expect(plugins).toHaveLength(1);
    expect(plugins[0]).toMatchObject({
      id: 'test-plugin',
      path: '/plugins/TestPlugin.js'
    });
    expect(plugins[0].class).not.toBe(TestPlugin);

    const instance = new plugins[0].class({});
    await instance.init();
    expect(load).toHaveBeenCalledOnce();
    expect(window.TestPlugin).toBeUndefined();
  });

  it('registers discovered modules with the plugin manager', async () => {
    const loader = new PluginLoader(pluginManager, {
      pluginDefinitions: [{
        id: 'test-plugin',
        path: '/plugins/TestPlugin.js',
        metadata: TestPlugin.metadata,
        load: async () => ({ default: TestPlugin })
      }]
    });

    const plugins = await loader.loadAndRegisterPlugins();

    expect(plugins).toHaveLength(1);
    expect(pluginManager.registerPlugin).toHaveBeenCalledWith(
      'test-plugin',
      expect.any(Function),
      TestPlugin.metadata,
      expect.objectContaining({ isValid: true })
    );
  });

  it('forwards settings mounting through the lazy plugin boundary', async () => {
    const mountSettings = vi.fn((host) => {
      host.textContent = 'Mounted lazily';
    });
    class ConfigurablePlugin extends TestPlugin {
      mountSettings(host) {
        mountSettings(host);
      }
    }
    const loader = new PluginLoader(pluginManager, {
      pluginDefinitions: [{
        id: 'configurable-plugin',
        path: '/plugins/ConfigurablePlugin.js',
        metadata: TestPlugin.metadata,
        load: async () => ({ default: ConfigurablePlugin })
      }]
    });
    const [plugin] = await loader.discoverPlugins();
    const instance = new plugin.class({});
    const host = document.createElement('div');

    await instance.init();
    instance.mountSettings(host);

    expect(mountSettings).toHaveBeenCalledWith(host);
    expect(host.textContent).toBe('Mounted lazily');
  });

  it('isolates a failed lazy module while other plugins can activate', async () => {
    const loader = new PluginLoader(pluginManager, {
      pluginDefinitions: [
        {
          id: 'broken-plugin',
          path: '/plugins/BrokenPlugin.js',
          metadata: {
            name: 'Broken Plugin',
            version: '1.0.0',
            description: 'Fails during lazy loading'
          },
          load: async () => { throw new Error('Cannot load'); }
        },
        {
          id: 'test-plugin',
          path: '/plugins/TestPlugin.js',
          metadata: TestPlugin.metadata,
          load: async () => ({ default: TestPlugin })
        }
      ]
    });

    const plugins = await loader.discoverPlugins();

    expect(plugins.map((plugin) => plugin.id)).toEqual(['broken-plugin', 'test-plugin']);

    const brokenPlugin = new plugins[0].class({});
    const workingPlugin = new plugins[1].class({});
    await expect(brokenPlugin.init()).rejects.toThrow('Cannot load');
    await expect(workingPlugin.init()).resolves.toBeUndefined();
  });

  it('rejects a plugin with missing dependencies and exposes a diagnostic', async () => {
    const loader = new PluginLoader(pluginManager, {
      pluginDefinitions: [{
        id: 'dependent-plugin',
        path: '/plugins/DependentPlugin.js',
        metadata: {
          ...TestPlugin.metadata,
          name: 'Dependent Plugin',
          dependencies: { 'missing-plugin': '1.0.0' }
        },
        load: async () => ({ default: TestPlugin })
      }]
    });

    const plugins = await loader.loadAndRegisterPlugins();

    expect(plugins).toEqual([]);
    expect(pluginManager.registerPlugin).not.toHaveBeenCalled();
    expect(loader.getDiagnostics()).toContainEqual(expect.objectContaining({
      pluginId: 'dependent-plugin',
      severity: 'error',
      message: expect.stringContaining('missing dependency missing-plugin')
    }));
  });
});
