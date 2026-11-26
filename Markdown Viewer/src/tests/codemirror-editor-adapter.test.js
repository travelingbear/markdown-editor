import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeMirrorEditorAdapter } from '../editor/CodeMirrorEditorAdapter.js';

describe('CodeMirrorEditorAdapter', () => {
  let adapter;
  let parent;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    adapter = new CodeMirrorEditorAdapter(parent, {
      content: '# First\nSecond line'
    });
  });

  afterEach(() => {
    adapter?.dispose();
    parent?.remove();
  });

  it('uses neutral one-based positions and ranges', () => {
    adapter.setCursorPosition({ line: 2, column: 7 }, false);
    expect(adapter.getCursorPosition()).toEqual({ line: 2, column: 7 });
    expect(adapter.getLineContent(1)).toBe('# First');
    expect(adapter.getTextInRange({
      startLine: 1,
      startColumn: 3,
      endLine: 1,
      endColumn: 8
    })).toBe('First');
  });

  it('assigns semantic highlight classes to Markdown syntax', () => {
    adapter.setContent('# **Strong** and `code`');

    expect(adapter.view.dom.querySelector('.cm-md-mark')).not.toBeNull();
    expect(adapter.view.dom.querySelector('.cm-md-heading')).not.toBeNull();
    expect(adapter.view.dom.querySelector('.cm-md-strong')).not.toBeNull();
    expect(adapter.view.dom.querySelector('.cm-md-code')).not.toBeNull();
  });

  it('keeps application edits as individual undo units', () => {
    adapter.applyEdits('first-command', [{
      range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 },
      text: 'A'
    }]);
    adapter.applyEdits('second-command', [{
      range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 },
      text: 'B'
    }]);

    expect(adapter.getContent()).toBe('BA# First\nSecond line');
    adapter.undo();
    expect(adapter.getContent()).toBe('A# First\nSecond line');
    adapter.undo();
    expect(adapter.getContent()).toBe('# First\nSecond line');
    adapter.redo();
    expect(adapter.getContent()).toBe('A# First\nSecond line');
  });

  it('preserves independent document content and history across tabs', () => {
    const first = adapter.createDocument('first');
    const second = adapter.createDocument('second');

    adapter.setDocument(first);
    adapter.insertText(' updated', { line: 1, column: 6 }, 'tab-one');
    adapter.setDocument(second);
    adapter.insertText(' updated', { line: 1, column: 7 }, 'tab-two');
    adapter.setDocument(first);

    expect(adapter.getContent()).toBe('first updated');
    adapter.undo();
    expect(adapter.getContent()).toBe('first');
    adapter.setDocument(second);
    expect(adapter.getContent()).toBe('second updated');
  });

  it('resets and restores scroll independently when switching documents', async () => {
    const first = adapter.createDocument(Array.from({ length: 100 }, (_, index) => `first ${index}`).join('\n'));
    const second = adapter.createDocument(Array.from({ length: 100 }, (_, index) => `second ${index}`).join('\n'));

    adapter.setDocument(first);
    adapter.view.scrollDOM.scrollTop = 320;
    const firstViewState = adapter.saveViewState();

    adapter.setDocument(second);
    expect(adapter.view.scrollDOM.scrollTop).toBe(0);

    adapter.setDocument(first, firstViewState);
    expect(adapter.view.scrollDOM.scrollTop).toBe(320);

    adapter.setDocument(second, { scrollTop: 25 });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(adapter.view.scrollDOM.scrollTop).toBe(25);
  });

  it('opens find-only and find/replace variants', () => {
    expect(adapter.openFindReplace(false)).toBe(true);
    expect(adapter.view.dom.classList.contains('cm-find-only')).toBe(true);
    expect(adapter.view.dom.querySelector('.cm-search')).not.toBeNull();
    expect(adapter.view.dom.querySelector('input[name="replace"]').hidden).toBe(true);
    expect(adapter.view.dom.querySelector('button[name="replace"]').hidden).toBe(true);

    expect(adapter.openFindReplace(true)).toBe(true);
    expect(adapter.view.dom.classList.contains('cm-find-only')).toBe(false);
    expect(adapter.view.dom.querySelector('input[name="replace"]').hidden).toBe(false);
    expect(adapter.view.dom.querySelector('button[name="replace"]').hidden).toBe(false);
  });

  it('toggles the search panel closed and open', () => {
    adapter.openFindReplace(true);
    expect(adapter.isFindReplaceOpen()).toBe(true);

    expect(adapter.toggleFindReplace(true)).toBe(true);
    expect(adapter.isFindReplaceOpen()).toBe(false);

    expect(adapter.toggleFindReplace(true)).toBe(true);
    expect(adapter.isFindReplaceOpen()).toBe(true);
    expect(adapter.view.dom.classList.contains('cm-find-only')).toBe(false);
  });

  it('emits content changes through the neutral listener', () => {
    const listener = vi.fn();
    adapter.onContentChange(listener);
    adapter.insertText('!', { line: 1, column: 1 });
    expect(listener).toHaveBeenCalledWith('!# First\nSecond line');
  });
});
