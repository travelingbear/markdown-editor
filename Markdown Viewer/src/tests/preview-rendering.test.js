import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { marked } from 'marked';

beforeAll(async () => {
  window.marked = marked;
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/PreviewComponent.js');
});

beforeEach(() => {
  document.body.innerHTML = `
    <div class="preview-pane">
      <div id="welcome-page"></div>
      <div id="preview"></div>
    </div>
  `;
});

describe('PreviewComponent rendering isolation', () => {
  it('does not let an older asynchronous tab render replace newer content', async () => {
    let finishFirstRender;
    const firstRenderGate = new Promise((resolve) => {
      finishFirstRender = resolve;
    });
    const rendererRegistry = {
      transformHtml: vi.fn(async (html) => {
        if (html.includes('First tab')) await firstRenderGate;
        return html;
      }),
      afterRender: vi.fn()
    };
    const preview = new window.PreviewComponent({ rendererRegistry });
    await preview.init();
    preview.advancedRenderingEnabled = true;

    preview.applySyntaxHighlighting = vi.fn();

    const firstRender = preview.updatePreview('# First tab');
    await preview.updatePreview('# Second tab');
    finishFirstRender();
    await firstRender;

    expect(preview.preview.textContent).toContain('Second tab');
    expect(preview.preview.textContent).not.toContain('First tab');
    preview.destroy();
  });

  it('passes document context through the renderer pipeline', async () => {
    const rendererRegistry = {
      transformHtml: vi.fn(async (html, context) => `${html}<p>${context.mode}</p>`),
      afterRender: vi.fn()
    };
    const preview = new window.PreviewComponent({ rendererRegistry });
    await preview.init();
    preview.setCurrentFilePath('C:\\docs\\example.md');

    await preview.updatePreview('# Document');

    expect(rendererRegistry.transformHtml).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        markdown: '# Document',
        mode: 'pure',
        filePath: 'C:\\docs\\example.md'
      })
    );
    expect(rendererRegistry.afterRender).toHaveBeenCalledWith(
      preview.preview,
      expect.objectContaining({ mode: 'pure' })
    );
    preview.destroy();
  });
});
