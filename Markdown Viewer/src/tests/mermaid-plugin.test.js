import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBundledMermaid, MermaidPlugin } from '../plugins/MermaidPlugin.js';
import { BUNDLED_MERMAID_VERSION } from '../plugins/mermaidManifest.js';
import { PluginValidator } from '../core/PluginValidator.js';

function createHarness(runtimeLoader) {
  const settings = new Map();
  let renderer;
  let exportExtension;
  const preview = { updatePreview: vi.fn() };
  const api = {
    getSetting: (key, fallback) => settings.has(key) ? settings.get(key) : fallback,
    setSetting: (key, value) => settings.set(key, value),
    registerRenderer: vi.fn((_id, value) => { renderer = value; }),
    unregisterRenderer: vi.fn(),
    registerExtension: vi.fn((_controller, value) => { exportExtension = value; }),
    getPreview: () => preview,
    getSettingsController: () => null,
    getEditor: () => null,
    getModeController: () => null
  };
  const plugin = new MermaidPlugin(api, { runtimeLoader });
  return { api, plugin, preview, settings, getRenderer: () => renderer, getExportExtension: () => exportExtension };
}

function createRuntime(render = vi.fn(async (_id, code) => ({
  svg: `<svg><text>${code}</text><script>alert(1)</script></svg>`
}))) {
  return {
    mermaid: { initialize: vi.fn(), render },
    version: 'test-version'
  };
}

describe('Mermaid renderer plugin', () => {
  beforeEach(() => {
    document.head.querySelectorAll('[data-plugin-style="mermaid-plugin"]').forEach((node) => node.remove());
  });

  it('passes the same security validator used during application activation', async () => {
    const validation = await new PluginValidator().validatePlugin(
      MermaidPlugin,
      MermaidPlugin.metadata,
      'mermaid-plugin'
    );

    expect(validation.errors).toEqual([]);
    expect(validation.isValid).toBe(true);
  });

  it('loads the pinned local runtime without fetching its package manifest', async () => {
    expect(loadBundledMermaid.toString()).not.toContain('package.json');

    const runtime = await loadBundledMermaid();
    expect(runtime.mermaid).toEqual(expect.objectContaining({
      initialize: expect.any(Function),
      render: expect.any(Function)
    }));
    expect(runtime.version).toBe(BUNDLED_MERMAID_VERSION);
    // Importing the real bundled runtime pulls in a large module graph, which
    // can exceed the default 5s timeout when the suite runs in parallel. This
    // is genuinely slow work, not a hang.
  }, 30000);

  it('registers without loading Mermaid until a diagram is transformed', async () => {
    const runtime = createRuntime();
    const runtimeLoader = vi.fn(async () => runtime);
    const harness = createHarness(runtimeLoader);
    await harness.plugin.init();

    expect(runtimeLoader).not.toHaveBeenCalled();
    expect(document.head.querySelector('[data-plugin-style="mermaid-plugin"]')).toBeNull();
    expect(harness.getRenderer().getStatus()).toEqual({ loaded: false, version: null, error: null });

    const html = '<pre><code class="language-mermaid">graph TD\nA --&gt; B</code></pre>';
    const transformed = await harness.getRenderer().transformHtml(html, { theme: 'light' });

    expect(runtimeLoader).toHaveBeenCalledOnce();
    expect(document.head.querySelector('[data-plugin-style="mermaid-plugin"]')).not.toBeNull();
    expect(transformed).toContain('class="mermaid-diagram"');
    expect(transformed).toContain('data-mermaid-code=');
    expect(runtime.mermaid.initialize).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'default',
      securityLevel: 'strict',
      htmlLabels: false
    }));
    expect(harness.getRenderer().getStatus()).toEqual({
      loaded: true,
      version: 'test-version',
      error: null
    });

    await harness.plugin.destroy();
    expect(document.head.querySelector('[data-plugin-style="mermaid-plugin"]')).toBeNull();
  });

  it('sanitizes rendered SVG and keeps source visible when requested after an error', async () => {
    const render = vi.fn()
      .mockResolvedValueOnce({ svg: '<svg><text>Visible label</text><script>alert(1)</script></svg>' })
      .mockRejectedValueOnce(new Error('Invalid graph'));
    const harness = createHarness(async () => createRuntime(render));
    await harness.plugin.init();
    const renderer = harness.getRenderer();

    const first = document.createElement('div');
    first.innerHTML = await renderer.transformHtml(
      '<pre><code class="language-mermaid">graph TD\nA --&gt; B</code></pre>',
      { theme: 'light' }
    );
    await renderer.afterRender(first, { theme: 'light' });
    expect(first.querySelector('svg text').textContent).toBe('Visible label');
    expect(first.querySelector('script')).toBeNull();

    harness.settings.set('errorMode', 'source');
    const second = document.createElement('div');
    second.innerHTML = await renderer.transformHtml(
      '<pre><code class="language-mermaid">not a diagram</code></pre>',
      { theme: 'light' }
    );
    await renderer.afterRender(second, { theme: 'light' });
    expect(second.querySelector('pre code.language-mermaid').textContent).toBe('not a diagram');
    expect(second.querySelector('.mermaid-error')).toBeNull();
  });

  it('mounts explained settings and exports styles only when a diagram exists', async () => {
    const harness = createHarness(async () => createRuntime());
    await harness.plugin.init();
    const host = document.createElement('div');
    harness.plugin.mountSettings(host);

    expect(host.querySelectorAll('.setting-item.plugin-setting-help')).toHaveLength(5);
    expect(host.textContent).toContain('Bundled Runtime');
    for (const item of host.querySelectorAll('.setting-item')) {
      expect(item.dataset.settingHelp).toBeTruthy();
    }
    host.querySelector('[data-mermaid-setting="theme"][data-mermaid-value="forest"]').click();
    expect(harness.settings.get('theme')).toBe('forest');

    expect(await harness.getExportExtension().getStyles({ previewHtml: '<p>Text</p>' })).toBe('');
    expect(await harness.getExportExtension().getStyles({ previewHtml: '<div class="mermaid-diagram"></div>' }))
      .toContain('.mermaid-diagram');
  });

  it('does not retain a runtime that finishes loading after the plugin is disabled', async () => {
    let finishLoading;
    const runtimeLoader = vi.fn(() => new Promise((resolve) => { finishLoading = resolve; }));
    const harness = createHarness(runtimeLoader);
    await harness.plugin.init();
    const rendering = harness.getRenderer().transformHtml(
      '<pre><code class="language-mermaid">graph TD\nA --&gt; B</code></pre>',
      { theme: 'light' }
    );

    await harness.plugin.destroy();
    finishLoading(createRuntime());

    await expect(rendering).resolves.toContain('language-mermaid');
    expect(harness.plugin.getStatus().loaded).toBe(false);
  });
});
