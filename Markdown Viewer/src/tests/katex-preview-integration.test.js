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

  it('renders a multi-line display block without letting Markdown claim it', async () => {
    const registry = new RendererRegistry();
    const preview = new window.PreviewComponent({ rendererRegistry: registry });
    await preview.init();
    preview.advancedRenderingEnabled = true;

    const plugin = new KaTeXPlugin({
      getSetting: (key, fallback) => fallback,
      setSetting: () => true,
      registerRenderer: (id, renderer, options) => registry.register(`katex-plugin.${id}`, renderer, options),
      unregisterRenderer: (id) => registry.unregister(`katex-plugin.${id}`),
      registerExtension: () => true,
      getPreview: () => preview
    });
    await plugin.init();

    // The lone '=' line used to become a setext heading, splitting the block
    // across </h1> and <p>; KaTeX then matched across that boundary and left
    // an unclosed <h1> that swallowed everything after it.
    await preview.updatePreview([
      '## Matrix',
      '',
      '$$',
      '\\begin{pmatrix}',
      'a & b \\\\',
      'c & d',
      '\\end{pmatrix}',
      '=',
      '\\begin{pmatrix}',
      'ax + by \\\\',
      'cx + dy',
      '\\end{pmatrix}',
      '$$',
      '',
      '> A quote after the math block.',
      '',
      'Then inline $\\alpha + \\beta$ follows.'
    ].join('\n'));

    const container = preview.preview;
    expect(container.querySelectorAll('.math-display')).toHaveLength(1);
    expect(container.querySelector('.math-display .katex')).not.toBeNull();
    // No stray heading, and nothing after the block is trapped inside one.
    expect(container.querySelector('h1')).toBeNull();
    expect(container.querySelector('blockquote')).not.toBeNull();
    expect(container.querySelector('blockquote').closest('h1')).toBeNull();
    expect(container.querySelector('.math-inline')).not.toBeNull();
    expect(container.querySelector('.math-inline').closest('h1')).toBeNull();
    // A display block is its own element, never nested inside a paragraph.
    expect(container.querySelector('p .math-display')).toBeNull();
    // No delimiters or placeholders survive in the rendered text. The LaTeX
    // source legitimately remains in KaTeX's MathML annotation, so the visible
    // layer is what matters here.
    expect(container.textContent).not.toContain('$$');
    expect(container.querySelector('.math-display .katex-html').textContent)
      .not.toContain('begin{pmatrix}');
    expect(container.innerHTML).not.toContain('\uE000');

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
