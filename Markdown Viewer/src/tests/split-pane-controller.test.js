import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let activeControllers = [];

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SplitPaneController.js');
});

beforeEach(() => {
  activeControllers = [];
  document.body.innerHTML = `
    <main class="main-content split-mode">
      <div id="splitter"></div>
    </main>
  `;
  document.body.style.cursor = '';
});

afterEach(() => {
  activeControllers.forEach((controller) => controller.destroy());
  vi.restoreAllMocks();
});

function createHarness() {
  const callbacks = new Map();
  let nextFrame = 1;
  const requestFrame = vi.fn((callback) => {
    const frame = nextFrame++;
    callbacks.set(frame, callback);
    return frame;
  });
  const cancelFrame = vi.fn((frame) => callbacks.delete(frame));
  const editor = { layout: vi.fn() };
  const editorComponent = { getEditorAdapter: vi.fn(() => editor) };
  const controller = new window.SplitPaneController({ requestFrame, cancelFrame });
  activeControllers.push(controller);
  controller.setDependencies({ editorComponent });
  controller.setup();

  const mainContent = document.querySelector('.main-content');
  vi.spyOn(mainContent, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    width: 1000
  });

  return {
    callbacks,
    cancelFrame,
    controller,
    editor,
    mainContent,
    requestFrame,
    splitter: document.getElementById('splitter')
  };
}

describe('SplitPaneController', () => {
  it('resizes vertical panes within the 20–80 percent bounds', () => {
    const { callbacks, controller, editor, mainContent, splitter } = createHarness();
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    splitter.dispatchEvent(down);

    controller.handleMouseMove({ clientX: 400 });

    expect(down.defaultPrevented).toBe(true);
    expect(document.body.style.cursor).toBe('col-resize');
    expect(mainContent.style.getPropertyValue('--editor-width')).toBe('30%');
    expect(mainContent.style.getPropertyValue('--preview-width')).toBe('70%');
    callbacks.get(1)();
    expect(editor.layout).toHaveBeenCalledOnce();

    controller.handleMouseUp();
    expect(document.body.style.cursor).toBe('default');
  });

  it('ignores movements outside the pane-width bounds', () => {
    const { controller, mainContent, requestFrame } = createHarness();
    controller.handleMouseDown({ preventDefault: vi.fn() });

    controller.handleMouseMove({ clientX: 250 });
    controller.handleMouseMove({ clientX: 950 });

    expect(mainContent.style.getPropertyValue('--editor-width')).toBe('');
    expect(mainContent.style.getPropertyValue('--preview-width')).toBe('');
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it('coalesces repeated editor layout requests into the latest frame', () => {
    const {
      callbacks,
      cancelFrame,
      controller,
      editor,
      mainContent,
      requestFrame
    } = createHarness();
    controller.handleMouseDown({ preventDefault: vi.fn() });

    controller.handleMouseMove({ clientX: 400 });
    controller.handleMouseMove({ clientX: 500 });

    expect(requestFrame).toHaveBeenCalledTimes(2);
    expect(cancelFrame).toHaveBeenCalledWith(1);
    expect(mainContent.style.getPropertyValue('--editor-width')).toBe('40%');
    callbacks.get(2)();
    expect(editor.layout).toHaveBeenCalledOnce();
  });

  it('defers to the Horizontal Split plugin without changing vertical widths', () => {
    const { controller, mainContent, requestFrame } = createHarness();
    mainContent.classList.add('split-horizontal');
    const preventDefault = vi.fn();

    controller.handleMouseDown({ preventDefault });
    controller.handleMouseMove({ clientX: 500 });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(controller.isResizing).toBe(false);
    expect(mainContent.style.getPropertyValue('--editor-width')).toBe('');
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it('sets up once and removes every listener during destruction', () => {
    const { controller, splitter } = createHarness();
    const splitterRemove = vi.spyOn(splitter, 'removeEventListener');
    const documentRemove = vi.spyOn(document, 'removeEventListener');

    expect(controller.setup()).toBe(true);
    controller.destroy();

    expect(splitterRemove).toHaveBeenCalledWith('mousedown', controller.boundMouseDown);
    expect(documentRemove).toHaveBeenCalledWith('mousemove', controller.boundMouseMove);
    expect(documentRemove).toHaveBeenCalledWith('mouseup', controller.boundMouseUp);
  });
});
