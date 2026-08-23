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
      transformMarkdown: vi.fn(async (markdown) => markdown),
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
      transformMarkdown: vi.fn(async (markdown) => markdown),
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

  it('emits the exact source line for similar task labels', async () => {
    const preview = new window.PreviewComponent();
    await preview.init();
    const taskToggled = vi.fn();
    preview.on('task-toggled', taskToggled);

    await preview.updatePreview([
      '- [ ] unchecked item 1',
      '- [ ] unchecked item 2',
      '- [ ] unchecked item 3'
    ].join('\n'));
    const checkboxes = preview.preview.querySelectorAll('input[data-source-line]');
    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change'));

    expect(taskToggled).toHaveBeenCalledWith(expect.objectContaining({
      taskText: 'unchecked item 2',
      checked: true,
      sourceLine: 1
    }));
    preview.destroy();
  });

  it('gives checked tasks the same isolated label treatment at every nesting level', async () => {
    const preview = new window.PreviewComponent();
    await preview.init();

    await preview.updatePreview([
      '- [x] checked parent',
      '  - [x] checked child',
      '  - [ ] open child',
      '- [ ] open sibling'
    ].join('\n'));

    const checkboxes = [...preview.preview.querySelectorAll('.markdown-task-checkbox')];
    const labels = checkboxes.map((checkbox) => checkbox.nextElementSibling);

    expect(checkboxes).toHaveLength(4);
    expect(labels.every((label) => label.classList.contains('markdown-task-label'))).toBe(true);
    expect(labels.map((label) => label.textContent.trim())).toEqual([
      'checked parent',
      'checked child',
      'open child',
      'open sibling'
    ]);
    expect(preview.preview.querySelectorAll(
      '.markdown-task-checkbox:checked + .markdown-task-label'
    )).toHaveLength(2);

    preview.destroy();
  });
});
