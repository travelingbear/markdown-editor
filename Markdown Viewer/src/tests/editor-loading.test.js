import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/EditorComponent.js');
});

describe('EditorComponent loading', () => {
  it('shares one in-flight editor load across concurrent mode requests', async () => {
    const editor = new window.EditorComponent();
    let finishLoading;
    const loadingGate = new Promise((resolve) => { finishLoading = resolve; });

    editor.loadCodeMirrorEditor = vi.fn(async () => {
      await loadingGate;
      editor.editorAdapter = {};
      editor.isEditorLoaded = true;
    });

    const firstLoad = editor.loadEditor();
    const secondLoad = editor.loadEditor();

    expect(editor.loadCodeMirrorEditor).toHaveBeenCalledOnce();

    finishLoading();
    await Promise.all([firstLoad, secondLoad]);

    expect(editor.isEditorReady()).toBe(true);
    expect(editor.editorLoadPromise).toBeNull();
  });
});
