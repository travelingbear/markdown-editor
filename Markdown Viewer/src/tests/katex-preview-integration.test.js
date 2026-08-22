import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { marked } from 'marked';
import { RendererRegistry } from '../rendering/RendererRegistry.js';
import { KaTeXPlugin } from '../plugins/KaTeXPlugin.js';

beforeAll(async () => {
  window.marked = marked;
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/PreviewComponent.js');
});

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <div class="preview-pane">
      <div id="welcome-page"></div>
      <div id="preview"></div>
    </div>
  `;
});

describe('KaTeX preview integration', () => {
  it('renders true math through the registry while preserving ordinary dollars and code', async () => {
    const registry = new RendererRegistry();
    const preview = new window.PreviewComponent({ rendererRegistry: registry });
    await preview.init();
    preview.advancedRenderingEnabled = true;

    const settings = new Map();
    const plugin = new KaTeXPlugin({
      getSetting: (key, fallback) => settings.has(key) ? settings.get(key) : fallback,
      setSetting: (key, value) => settings.set(key, value),
      registerRenderer: (id, renderer, options) => registry.register(`katex-plugin.${id}`, renderer, options),
      unregisterRenderer: (id) => registry.unregister(`katex-plugin.${id}`),
      registerExtension: () => true,
      getPreview: () => preview
    });
    await plugin.init();

    await preview.updatePreview([
      'Formula: $\\pi r^2$.',
      '',
      'Prices: $5 and $10.',
      '',
      '`$x + y$`'
    ].join('\n'));

    expect(preview.preview.querySelector('.math-inline .katex')).not.toBeNull();
    expect(preview.preview.textContent).toContain('Prices: $5 and $10.');
    expect(preview.preview.querySelector('code').textContent).toBe('$x + y$');
    await plugin.destroy();
    preview.destroy();
  });

  it('keeps math literal in Pure Markdown mode', async () => {
    const registry = new RendererRegistry();
    const preview = new window.PreviewComponent({ rendererRegistry: registry });
    await preview.init();
    preview.advancedRenderingEnabled = false;

    const plugin = new KaTeXPlugin({
      getSetting: (key, fallback) => fallback,
      setSetting: () => true,
      registerRenderer: (id, renderer, options) => registry.register(`katex-plugin.${id}`, renderer, options),
      unregisterRenderer: (id) => registry.unregister(`katex-plugin.${id}`),
      registerExtension: () => true,
      getPreview: () => preview
    });
    await plugin.init();
    await preview.updatePreview('Formula: $x + y$.');

    expect(preview.preview.querySelector('.katex')).toBeNull();
    expect(preview.preview.textContent).toContain('$x + y$');

    await plugin.destroy();
    preview.destroy();
  });
});
