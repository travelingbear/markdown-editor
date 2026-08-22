import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/EditorComponent.js');
});

describe('EditorComponent lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="code-editor"></div>
      <textarea id="editor"></textarea>
    `;
  });

  it('removes fallback editor DOM listeners during teardown', async () => {
    const editor = new window.EditorComponent();
    await editor.init();
    const handleContentChange = vi.spyOn(editor, 'handleContentChange');

    editor.fallbackEditor.dispatchEvent(new Event('input'));
    expect(handleContentChange).toHaveBeenCalledOnce();

    editor.destroy();
    editor.fallbackEditor.dispatchEvent(new Event('input'));
    expect(handleContentChange).toHaveBeenCalledOnce();
    expect(editor.fallbackDomListeners).toEqual([]);
  });
});
