import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KaTeXPlugin } from '../plugins/KaTeXPlugin.js';

function createPluginHarness() {
  const settings = new Map();
  let renderer = null;
  let exportExtension = null;
  const preview = {
    updatePreview: vi.fn(async () => {}),
    emit: vi.fn()
  };
  const api = {
    getSetting: (key, fallback) => settings.has(key) ? settings.get(key) : fallback,
    setSetting: (key, value) => {
      settings.set(key, value);
      return true;
    },
    registerRenderer: vi.fn((id, value) => {
      renderer = value;
      return true;
    }),
    unregisterRenderer: vi.fn(() => true),
    registerExtension: vi.fn((controller, value) => {
      if (controller === 'export') exportExtension = value;
      return true;
    }),
    getPreview: () => preview
  };
  return {
    api,
    settings,
    preview,
    getRenderer: () => renderer,
    getExportExtension: () => exportExtension
  };
}

describe('KaTeX renderer plugin', () => {
  beforeEach(() => {
    document.head.querySelectorAll('[data-plugin-style="katex-plugin"]').forEach((node) => node.remove());
    document.body.innerHTML = '';
  });

  it('registers without loading KaTeX until real math is rendered', async () => {
    const harness = createPluginHarness();
    const runtimeLoader = vi.fn(async () => ({
      katex: {
        version: 'test-version',
        renderToString: vi.fn((expression) => `<span class="katex">${expression}</span>`)
      },
      css: '.katex { display: inline; }'
    }));
    const plugin = new KaTeXPlugin(harness.api, { runtimeLoader });

    await plugin.init();
    const renderer = harness.getRenderer();

    expect(runtimeLoader).not.toHaveBeenCalled();
    expect(renderer.shouldRender({ markdown: 'It costs $5 today.' })).toBe(false);
    expect(renderer.shouldRender({ markdown: 'Area: $\\pi r^2$.' })).toBe(true);

    const result = await renderer.transformHtml('<p>Area: $\\pi r^2$.</p>', {
      markdown: 'Area: $\\pi r^2$.',
      isCurrent: () => true
    });

    expect(runtimeLoader).toHaveBeenCalledOnce();
    expect(result).toContain('class="math-inline"');
    expect(result).toContain('class="katex"');
    expect(document.head.querySelector('[data-plugin-style="katex-plugin"]')).not.toBeNull();
    expect(harness.preview.emit).toHaveBeenCalledWith('katex-loaded', { version: 'test-version' });

    await plugin.destroy();
    expect(harness.api.unregisterRenderer).toHaveBeenCalledWith('math');
    expect(document.head.querySelector('[data-plugin-style="katex-plugin"]')).toBeNull();
  });

  it('keeps code, currency, and invalid strict expressions untouched', async () => {
    const harness = createPluginHarness();
    const renderToString = vi.fn(() => '<span class="katex">rendered</span>');
    const plugin = new KaTeXPlugin(harness.api, {
      runtimeLoader: async () => ({ katex: { renderToString, version: 'test' }, css: '' })
    });
    await plugin.init();
    const renderer = harness.getRenderer();

    expect(await renderer.transformHtml('<p>Price $5 and $10.</p>', {
      markdown: 'Price $5 and $10.'
    })).toBe('<p>Price $5 and $10.</p>');
    expect(await renderer.transformHtml('<pre><code>$x + y$</code></pre>', {
      markdown: 'Outside $x + y$',
      isCurrent: () => true
    })).toBe('<pre><code>$x + y$</code></pre>');
    expect(renderToString).not.toHaveBeenCalled();
  });

  it('applies settings immediately and exposes only needed export CSS', async () => {
    const harness = createPluginHarness();
    const plugin = new KaTeXPlugin(harness.api, {
      runtimeLoader: async () => ({
        katex: {
          version: 'test',
          renderToString: () => '<span class="katex">rendered</span>'
        },
        css: '.katex { color: inherit; }'
      })
    });
    await plugin.init();
    const host = document.createElement('div');
    plugin.mountSettings(host);

    const documentedSettings = host.querySelectorAll('.plugin-setting-help[data-setting-help]');
    expect(host.textContent).toContain('Bundled Runtime');
    expect(documentedSettings).toHaveLength(5);
    expect(documentedSettings[0].dataset.settingHelp).toContain('Strict mode');

    host.querySelector('[data-katex-setting="inlineMath"][data-katex-value="false"]').click();
    expect(harness.settings.get('inlineMath')).toBe(false);
    expect(plugin.getDetectionOptions().inline).toBe(false);
    expect(harness.preview.updatePreview).toHaveBeenCalled();

    host.querySelector('[data-katex-setting="inlineMath"][data-katex-value="true"]').click();
    await harness.getRenderer().transformHtml('<p>$x$</p>', {
      markdown: '$x$',
      isCurrent: () => true
    });

    expect(await harness.getExportExtension().getStyles({ previewHtml: '<p>plain</p>' })).toBe('');
    expect(await harness.getExportExtension().getStyles({ previewHtml: '<span class="katex">x</span>' }))
      .toContain('.katex');
  });
});
