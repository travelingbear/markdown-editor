import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CodeMirrorEditorAdapter } from '../editor/CodeMirrorEditorAdapter.js';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/MarkdownActionController.js');
});

function createFormattingContext(content) {
  const parent = document.createElement('div');
  document.body.appendChild(parent);
  const adapter = new CodeMirrorEditorAdapter(parent, { content });
  const documentComponent = { handleContentChange: vi.fn() };
  const controller = new window.MarkdownActionController();
  controller.setDependencies({ getEditorAdapter: () => adapter }, documentComponent);
  return { adapter, controller, documentComponent, parent };
}

function selectOffsets(adapter, anchor, head) {
  adapter.view.dispatch({ selection: { anchor, head } });
}

describe('MarkdownActionController formatting toggles', () => {
  const contexts = [];

  afterEach(() => {
    for (const { adapter, parent } of contexts.splice(0)) {
      adapter.dispose();
      parent.remove();
    }
  });

  it('removes only italic when toggling combined bold and italic text', async () => {
    const context = createFormattingContext('word');
    contexts.push(context);

    selectOffsets(context.adapter, 0, 4);
    await context.controller.handleMarkdownAction('bold');
    expect(context.adapter.getContent()).toBe('**word**');

    selectOffsets(context.adapter, 0, 8);
    await context.controller.handleMarkdownAction('italic');
    expect(context.adapter.getContent()).toBe('***word***');

    selectOffsets(context.adapter, 0, 10);
    await context.controller.handleMarkdownAction('italic');
    expect(context.adapter.getContent()).toBe('**word**');
  });

  it('removes italic while retaining bold across multiple selected lines', async () => {
    const context = createFormattingContext('***one***\n***two***');
    contexts.push(context);

    selectOffsets(context.adapter, 0, context.adapter.getContent().length);
    await context.controller.handleMarkdownAction('italic');

    expect(context.adapter.getContent()).toBe('**one**\n**two**');
    expect(context.documentComponent.handleContentChange).toHaveBeenCalledWith(
      '**one**\n**two**'
    );
  });
});
