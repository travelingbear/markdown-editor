import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SearchController.js');
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createController({ mode = 'code', adapter = {}, selectedText = '' } = {}) {
  const editorAdapter = {
    openFindReplace: vi.fn(),
    toggleFindReplace: vi.fn(),
    getSelectedText: vi.fn(() => selectedText),
    ...adapter
  };
  const editorComponent = { getEditorAdapter: vi.fn(() => editorAdapter) };
  const modeController = { getCurrentMode: vi.fn(() => mode) };
  const controller = new window.SearchController();
  controller.setDependencies({ editorComponent, modeController });
  return { controller, editorAdapter, editorComponent, modeController };
}

describe('SearchController', () => {
  it.each(['code', 'split'])('opens the editor search panel in %s mode', (mode) => {
    const context = createController({ mode });

    context.controller.open(true);

    expect(context.editorAdapter.openFindReplace).toHaveBeenCalledWith(true);
  });

  it('toggles the editor panel when the adapter supports it', () => {
    const context = createController({ mode: 'split' });

    context.controller.toggle(false);

    expect(context.editorAdapter.toggleFindReplace).toHaveBeenCalledWith(false);
    expect(context.editorAdapter.openFindReplace).not.toHaveBeenCalled();
  });

  it('falls back to opening when the adapter cannot toggle', () => {
    const context = createController({ mode: 'code', adapter: { toggleFindReplace: undefined } });

    context.controller.toggle(true);

    expect(context.editorAdapter.openFindReplace).toHaveBeenCalledWith(true);
  });

  it('survives an editor that has not loaded yet', () => {
    const context = createController();
    context.editorComponent.getEditorAdapter.mockReturnValue(null);

    expect(() => context.controller.toggle(true)).not.toThrow();
    expect(() => context.controller.open(true)).not.toThrow();
  });

  it('uses native find in Preview, seeded with the current selection', async () => {
    const context = createController({ mode: 'preview', selectedText: 'needle' });
    const execCommand = vi.fn();
    document.execCommand = execCommand;
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    context.controller.toggle(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(context.editorAdapter.toggleFindReplace).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith('needle');
    expect(execCommand).toHaveBeenCalledWith('find');
  });

  it('still opens native find when the clipboard is unavailable or rejects', async () => {
    const context = createController({ mode: 'preview', selectedText: 'needle' });
    const execCommand = vi.fn();
    document.execCommand = execCommand;
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => { throw new Error('denied'); }) }
    });

    context.controller.open(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(execCommand).toHaveBeenCalledWith('find');
  });

  it('opens native find directly when there is no selection', () => {
    const context = createController({ mode: 'preview', selectedText: '' });
    const execCommand = vi.fn();
    document.execCommand = execCommand;

    context.controller.toggle(true);

    expect(execCommand).toHaveBeenCalledWith('find');
  });

  it('releases its dependencies on teardown', () => {
    const context = createController();

    context.controller.destroy();

    expect(context.controller.editorComponent).toBeNull();
    expect(context.controller.modeController).toBeNull();
  });
});
