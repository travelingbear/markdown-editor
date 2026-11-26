import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/StatusBarController.js');
});

let controller;

beforeEach(() => {
  document.body.innerHTML = `
    <span id="cursor-pos"></span>
    <button id="filename" class="has-tabs"></button>
  `;
});

afterEach(() => {
  controller?.destroy();
  controller = null;
});

function createController({ documentState = {}, hasTabs = false } = {}) {
  const documentComponent = {
    getDocumentState: vi.fn(() => ({
      currentFile: null,
      fileName: null,
      hasDocument: false,
      isDirty: false,
      ...documentState
    }))
  };
  const tabManager = { hasTabs: vi.fn(() => hasTabs) };
  controller = new window.StatusBarController();
  controller.setDependencies({ documentComponent, tabManager });
  return { documentComponent, tabManager };
}

const filename = () => document.getElementById('filename');

describe('StatusBarController', () => {
  it('reports the cursor position', async () => {
    createController();
    await controller.init();

    controller.updateCursorPosition(12, 7);

    expect(document.getElementById('cursor-pos').textContent).toBe('Line 12, Col 7');
  });

  it('fails fast when the status bar is missing from the shell', async () => {
    document.body.innerHTML = '<span id="cursor-pos"></span>';
    createController();

    await expect(controller.init()).rejects.toThrow('Status bar elements not found');
  });

  it('names an explicit document and marks it dirty', async () => {
    createController();
    await controller.init();

    controller.updateFilename('notes.md', true);

    expect(filename().textContent).toBe('notes.md *');
    expect(filename().classList.contains('has-tabs')).toBe(false);
  });

  it.each([
    [{ currentFile: 'C:\\notes\\a.md', fileName: 'a.md', hasDocument: true }, 'a.md'],
    [{ hasDocument: true }, 'untitled.md'],
    [{}, 'Welcome']
  ])('derives the name from document state when none is given (%#)', async (state, expected) => {
    createController({ documentState: state });
    await controller.init();

    controller.updateFilename();

    expect(filename().textContent).toBe(expected);
  });

  it('derives the dirty marker from document state when none is given', async () => {
    createController({ documentState: { hasDocument: true, isDirty: true } });
    await controller.init();

    controller.updateFilename();

    expect(filename().textContent).toBe('untitled.md *');
  });

  it('defers to the tab UI while tabs are open', async () => {
    const context = createController({ hasTabs: true });
    await controller.init();
    filename().textContent = 'owned-by-tabs.md';

    controller.updateFilename('should-not-render.md', true);

    expect(filename().textContent).toBe('owned-by-tabs.md');
    expect(context.documentComponent.getDocumentState).not.toHaveBeenCalled();
  });

  it('releases its elements and dependencies on teardown', async () => {
    createController();
    await controller.init();

    controller.destroy();

    expect(controller.cursorPos).toBeNull();
    expect(controller.filenameButton).toBeNull();
    expect(controller.documentComponent).toBeNull();
    // Calling after teardown must not throw.
    expect(() => controller.updateFilename('late.md', false)).not.toThrow();
    expect(() => controller.updateCursorPosition(1, 1)).not.toThrow();
  });
});
