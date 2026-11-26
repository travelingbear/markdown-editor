import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { marked } from 'marked';
import { RendererRegistry } from '../rendering/RendererRegistry.js';
import { MermaidPlugin } from '../plugins/MermaidPlugin.js';

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

function createPlugin(registry, preview, runtimeLoader) {
  return new MermaidPlugin({
    getSetting: (_key, fallback) => fallback,
    setSetting: () => true,
    registerRenderer: (id, renderer, options) => registry.register(`mermaid-plugin.${id}`, renderer, options),
    unregisterRenderer: (id) => registry.unregister(`mermaid-plugin.${id}`),
    registerExtension: () => true,
    getPreview: () => preview
  }, { runtimeLoader });
}

describe('Mermaid preview integration', () => {
  it('renders Mermaid through the registry in Extended mode with visible SVG labels', async () => {
    const registry = new RendererRegistry();
    const preview = new window.PreviewComponent({ rendererRegistry: registry });
    await preview.init();
    preview.advancedRenderingEnabled = true;
    const runtimeLoader = vi.fn(async () => ({
      mermaid: {
        initialize: vi.fn(),
        render: vi.fn(async () => ({ svg: '<svg><text>Start to Finish</text></svg>' }))
      },
      version: 'test'
    }));
    const plugin = createPlugin(registry, preview, runtimeLoader);
    await plugin.init();

    await preview.updatePreview('```mermaid\ngraph TD\nStart --> Finish\n```');

    expect(preview.preview.querySelector('.mermaid-diagram svg text').textContent).toBe('Start to Finish');
    expect(runtimeLoader).toHaveBeenCalledOnce();
    await plugin.destroy();
    preview.destroy();
  });

  it('keeps Mermaid as readable code and does not load its runtime in Pure mode', async () => {
    const registry = new RendererRegistry();
    const preview = new window.PreviewComponent({ rendererRegistry: registry });
    await preview.init();
    preview.advancedRenderingEnabled = false;
    const runtimeLoader = vi.fn(async () => ({
      mermaid: { initialize: vi.fn(), render: vi.fn() },
      version: 'test'
    }));
    const plugin = createPlugin(registry, preview, runtimeLoader);
    await plugin.init();

    await preview.updatePreview('```mermaid\ngraph TD\nA --> B\n```');

    expect(preview.preview.querySelector('code.language-mermaid').textContent).toContain('graph TD');
    expect(preview.preview.querySelector('.mermaid-diagram')).toBeNull();
    expect(runtimeLoader).not.toHaveBeenCalled();
    await plugin.destroy();
    preview.destroy();
  });
});
