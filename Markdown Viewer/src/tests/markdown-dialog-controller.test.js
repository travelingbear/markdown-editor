import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/MarkdownDialogController.js');
});

let controller;

beforeEach(() => {
  document.body.innerHTML = `
    <div class="toolbar-content">
      <div class="md-dropdown-container" id="link-container">
        <button class="md-btn md-dropdown-main" data-action="link"></button>
        <button class="md-btn md-dropdown-arrow" id="link-dropdown-arrow"></button>
        <div class="md-dropdown-menu" id="link-dropdown-menu">
          <button id="link-insert-btn"></button>
        </div>
      </div>
      <div class="md-dropdown-container" id="image-container">
        <button class="md-btn md-dropdown-main" data-action="image"></button>
        <button class="md-btn md-dropdown-arrow" id="image-dropdown-arrow"></button>
        <div class="md-dropdown-menu" id="image-dropdown-menu">
          <button id="image-open-btn"></button>
        </div>
      </div>
    </div>

    <div id="link-modal" style="display: none">
      <div class="link-modal-overlay"></div>
      <input id="link-text"><input id="link-url"><input id="link-title">
      <button id="link-modal-close"></button>
      <button id="link-cancel-btn"></button>
      <button id="link-insert-confirm-btn"></button>
    </div>

    <div id="image-modal" style="display: none">
      <div class="image-modal-overlay"></div>
      <button class="image-tab active" data-tab="url"></button>
      <button class="image-tab" data-tab="file"></button>
      <div class="tab-pane active" id="url-tab"></div>
      <div class="tab-pane" id="file-tab"></div>
      <input id="image-url"><input id="image-alt"><input id="image-title"><input id="image-link">
      <div id="file-alt-group" style="display: none"></div>
      <div id="file-link-group" style="display: none"></div>
      <input id="file-image-alt"><input id="file-image-link">
      <div class="file-drop-zone" id="image-drop-zone">
        <span class="drop-text">Drop here</span><span class="drop-status"></span>
      </div>
      <input type="file" id="image-file-input">
      <button id="image-modal-close"></button>
      <button id="image-cancel-btn"></button>
      <button id="image-insert-btn"></button>
    </div>
  `;
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  controller?.destroy();
  controller = null;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function createController() {
  const markdownActionController = { insertMarkdownText: vi.fn() };
  controller = new window.MarkdownDialogController();
  controller.setDependencies({ markdownActionController });
  await controller.init();
  return { markdownActionController };
}

const byId = (id) => document.getElementById(id);
const setValue = (id, value) => { byId(id).value = value; };
const stubFiles = (files) => Object.defineProperty(byId('image-file-input'), 'files', {
  configurable: true,
  value: files
});

describe('MarkdownDialogController dropdowns', () => {
  it('opens a dropdown against its arrow and closes it again', async () => {
    await createController();
    const menu = byId('link-dropdown-menu');

    byId('link-dropdown-arrow').click();
    expect(menu.classList.contains('show')).toBe(true);
    // Reparented to <body> so the toolbar's stacking context cannot clip it.
    expect(menu.parentElement).toBe(document.body);

    byId('link-dropdown-arrow').click();
    expect(menu.classList.contains('show')).toBe(false);
    // ...and returned to its container once hidden.
    expect(menu.parentElement).toBe(byId('link-container'));
  });

  it('keeps only one dropdown open at a time', async () => {
    await createController();

    byId('link-dropdown-arrow').click();
    byId('image-dropdown-arrow').click();

    expect(byId('link-dropdown-menu').classList.contains('show')).toBe(false);
    expect(byId('image-dropdown-menu').classList.contains('show')).toBe(true);
  });

  it('closes dropdowns on an outside click', async () => {
    await createController();
    byId('link-dropdown-arrow').click();

    document.body.click();

    expect(byId('link-dropdown-menu').classList.contains('show')).toBe(false);
  });

  it('opens each dialog from its dropdown item', async () => {
    await createController();

    byId('link-dropdown-arrow').click();
    byId('link-insert-btn').click();
    expect(byId('link-modal').style.display).toBe('flex');
    expect(byId('link-dropdown-menu').classList.contains('show')).toBe(false);

    byId('image-open-btn').click();
    expect(byId('image-modal').style.display).toBe('flex');
  });
});

describe('MarkdownDialogController link dialog', () => {
  it('inserts a link and clears the form', async () => {
    const { markdownActionController } = await createController();
    controller.showLinkModal();
    setValue('link-text', 'Docs');
    setValue('link-url', 'https://example.com');
    setValue('link-title', 'Reference');

    byId('link-insert-confirm-btn').click();

    expect(markdownActionController.insertMarkdownText)
      .toHaveBeenCalledWith('[Docs](https://example.com "Reference")');
    expect(byId('link-modal').style.display).toBe('none');
    expect(byId('link-url').value).toBe('');
  });

  it('refuses to insert without a URL', async () => {
    const { markdownActionController } = await createController();
    controller.showLinkModal();

    byId('link-insert-confirm-btn').click();

    expect(window.alert).toHaveBeenCalledWith('Please enter a URL');
    expect(markdownActionController.insertMarkdownText).not.toHaveBeenCalled();
    expect(byId('link-modal').style.display).toBe('flex');
  });

  it.each(['link-modal-close', 'link-cancel-btn'])('closes from %s', async (buttonId) => {
    await createController();
    controller.showLinkModal();

    byId(buttonId).click();

    expect(byId('link-modal').style.display).toBe('none');
  });

  it('closes from the overlay and reports its open state', async () => {
    await createController();
    controller.showLinkModal();
    expect(controller.isLinkModalOpen()).toBe(true);

    document.querySelector('.link-modal-overlay').click();

    expect(controller.isLinkModalOpen()).toBe(false);
  });
});

describe('MarkdownDialogController image dialog', () => {
  it('always reopens on the URL tab', async () => {
    await createController();
    controller.switchImageTab('file');

    controller.showImageModal();

    expect(document.querySelector('.image-tab.active').dataset.tab).toBe('url');
    expect(byId('url-tab').classList.contains('active')).toBe(true);
    expect(byId('file-tab').classList.contains('active')).toBe(false);
  });

  it('inserts a linked image from a URL', async () => {
    const { markdownActionController } = await createController();
    controller.showImageModal();
    setValue('image-url', 'diagram.png');
    setValue('image-alt', 'Diagram');
    setValue('image-link', 'https://example.com');

    byId('image-insert-btn').click();

    expect(markdownActionController.insertMarkdownText)
      .toHaveBeenCalledWith('[![Diagram](diagram.png)](https://example.com)');
    expect(byId('image-modal').style.display).toBe('none');
  });

  it('refuses to insert without a URL', async () => {
    const { markdownActionController } = await createController();
    controller.showImageModal();

    byId('image-insert-btn').click();

    expect(window.alert).toHaveBeenCalledWith('Please enter an image URL');
    expect(markdownActionController.insertMarkdownText).not.toHaveBeenCalled();
  });

  it('inserts a chosen file by name', async () => {
    const { markdownActionController } = await createController();
    controller.showImageModal();
    controller.switchImageTab('file');
    stubFiles([{ name: 'architecture.png', type: 'image/png' }]);

    byId('image-insert-btn').click();

    expect(markdownActionController.insertMarkdownText)
      .toHaveBeenCalledWith('![architecture](architecture.png)');
  });

  it('refuses to insert without a chosen file', async () => {
    const { markdownActionController } = await createController();
    controller.showImageModal();
    controller.switchImageTab('file');
    stubFiles([]);

    byId('image-insert-btn').click();

    expect(window.alert).toHaveBeenCalledWith('Please select an image file');
    expect(markdownActionController.insertMarkdownText).not.toHaveBeenCalled();
  });

  it('prepares the form when a file is chosen', async () => {
    await createController();

    controller.handleImageFile({ name: 'architecture.png', type: 'image/png' });

    expect(byId('file-alt-group').style.display).toBe('block');
    expect(byId('file-link-group').style.display).toBe('block');
    expect(byId('file-image-alt').value).toBe('architecture');
    expect(document.querySelector('.drop-text').textContent).toBe('architecture.png');
    expect(document.querySelector('.drop-status').textContent).toBe('File selected');
  });

  it('rejects a non-image file', async () => {
    await createController();

    controller.handleImageFile({ name: 'notes.txt', type: 'text/plain' });

    expect(window.alert).toHaveBeenCalledWith('Please select an image file');
    expect(byId('file-alt-group').style.display).toBe('none');
  });

  it('accepts a dropped image and clears the hover state', async () => {
    await createController();
    const dropZone = byId('image-drop-zone');
    dropZone.dispatchEvent(new Event('dragover', { bubbles: true }));
    expect(dropZone.classList.contains('drag-over')).toBe(true);

    const drop = new Event('drop', { bubbles: true });
    drop.dataTransfer = { files: [{ name: 'dropped.png', type: 'image/png' }] };
    dropZone.dispatchEvent(drop);

    expect(dropZone.classList.contains('drag-over')).toBe(false);
    expect(byId('file-image-alt').value).toBe('dropped');
  });

  it('clears every field when closed', async () => {
    await createController();
    controller.showImageModal();
    setValue('image-url', 'diagram.png');
    setValue('file-image-link', 'https://example.com');
    controller.handleImageFile({ name: 'architecture.png', type: 'image/png' });

    controller.hideImageModal();

    expect(byId('image-url').value).toBe('');
    expect(byId('file-image-alt').value).toBe('');
    expect(byId('file-image-link').value).toBe('');
    expect(byId('file-alt-group').style.display).toBe('none');
    expect(controller.isImageModalOpen()).toBe(false);
  });
});

describe('MarkdownDialogController teardown', () => {
  it('removes every listener so the dialogs stop responding', async () => {
    const { markdownActionController } = await createController();

    controller.destroy();
    byId('link-dropdown-arrow').click();
    byId('link-insert-confirm-btn').click();
    byId('image-open-btn').click();

    expect(byId('link-dropdown-menu').classList.contains('show')).toBe(false);
    expect(byId('link-modal').style.display).toBe('none');
    expect(byId('image-modal').style.display).toBe('none');
    expect(markdownActionController.insertMarkdownText).not.toHaveBeenCalled();
  });

  it('returns an open dropdown to the toolbar instead of leaving it on body', async () => {
    await createController();
    byId('link-dropdown-arrow').click();
    expect(byId('link-dropdown-menu').parentElement).toBe(document.body);

    controller.destroy();

    expect(byId('link-dropdown-menu').parentElement).toBe(byId('link-container'));
  });

  it('cancels the pending focus timer', async () => {
    vi.useFakeTimers();
    await createController();
    const focus = vi.spyOn(byId('link-text'), 'focus');
    controller.showLinkModal();

    controller.destroy();
    vi.runAllTimers();

    expect(focus).not.toHaveBeenCalled();
  });
});
