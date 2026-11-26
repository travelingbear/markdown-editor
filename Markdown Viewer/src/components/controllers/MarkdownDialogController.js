import {
  altTextFromFileName,
  buildImageMarkdown,
  buildLinkMarkdown
} from '../markdownInsertSyntax.js';

/**
 * Owns the Link and Image insert flow: the split-button dropdowns that open it,
 * both dialogs, the image URL/file tabs and drop zone, and the resulting
 * Markdown insertion.
 *
 * The toolbar only hosts the trigger buttons; every listener here is tracked so
 * the dialogs can be disposed with the rest of the application.
 */
class MarkdownDialogController extends BaseComponent {
  constructor(options = {}) {
    super('MarkdownDialogController', options);
    this.markdownActionController = null;
    this.domListeners = [];
    this.pendingTimers = new Set();
    // Menus are reparented to <body> while open to escape the toolbar's
    // stacking context; their original parent is captured so they can go back.
    this.dropdownHomes = new Map();
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    this.setupDropdowns();
    this.setupLinkModal();
    this.setupImageModal();
  }

  listen(target, event, handler, options) {
    if (!target) return;
    target.addEventListener(event, handler, options);
    this.domListeners.push({ target, event, handler, options });
  }

  listenById(elementId, event, handler) {
    this.listen(document.getElementById(elementId), event, handler);
  }

  // Dropdowns

  setupDropdowns() {
    for (const type of ['link', 'image']) {
      const menu = document.getElementById(`${type}-dropdown-menu`);
      if (menu?.parentNode) this.dropdownHomes.set(type, menu.parentNode);

      this.listenById(`${type}-dropdown-arrow`, 'click', (event) => {
        event.stopPropagation();
        this.toggleDropdown(type);
      });
    }

    this.listenById('link-insert-btn', 'click', () => {
      this.hideDropdown('link');
      this.showLinkModal();
    });
    this.listenById('image-open-btn', 'click', () => {
      this.hideDropdown('image');
      this.showImageModal();
    });

    this.listen(document, 'click', (event) => {
      if (!event.target.closest('.md-dropdown-container')) this.hideAllDropdowns();
    });
  }

  toggleDropdown(type) {
    const menu = document.getElementById(`${type}-dropdown-menu`);
    if (!menu) return;

    if (menu.classList.contains('show')) {
      this.hideDropdown(type);
      return;
    }
    this.hideAllDropdowns();
    this.showDropdown(type);
  }

  showDropdown(type) {
    const menu = document.getElementById(`${type}-dropdown-menu`);
    const button = document.getElementById(`${type}-dropdown-arrow`);
    if (!menu || !button) return;

    document.body.appendChild(menu);

    const rect = button.getBoundingClientRect();
    const mainWidth = button.previousElementSibling?.getBoundingClientRect().width || 0;
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 2}px`;
    menu.style.width = `${rect.width + mainWidth}px`;
    menu.style.zIndex = '2147483647';
    menu.classList.add('show');
  }

  hideDropdown(type) {
    const menu = document.getElementById(`${type}-dropdown-menu`);
    if (!menu) return;

    menu.classList.remove('show');
    const home = this.dropdownHomes.get(type);
    if (home && menu.parentNode !== home) home.appendChild(menu);
  }

  hideAllDropdowns() {
    this.hideDropdown('link');
    this.hideDropdown('image');
  }

  // Link dialog

  setupLinkModal() {
    const overlay = document.getElementById('link-modal')?.querySelector('.link-modal-overlay');
    this.listenById('link-modal-close', 'click', () => this.hideLinkModal());
    this.listenById('link-cancel-btn', 'click', () => this.hideLinkModal());
    this.listen(overlay, 'click', () => this.hideLinkModal());
    this.listenById('link-insert-confirm-btn', 'click', () => this.insertLink());
  }

  isLinkModalOpen() {
    return document.getElementById('link-modal')?.style.display === 'flex';
  }

  showLinkModal() {
    const modal = document.getElementById('link-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    this.schedule(() => document.getElementById('link-text')?.focus(), 100);
  }

  hideLinkModal() {
    const modal = document.getElementById('link-modal');
    if (!modal) return;
    modal.style.display = 'none';
    this.clearValues(['link-text', 'link-url', 'link-title']);
  }

  insertLink() {
    const url = this.readValue('link-url');
    if (!url) {
      this.reportRequiredField('Please enter a URL');
      return;
    }

    this.insertMarkdown(buildLinkMarkdown({
      text: this.readValue('link-text'),
      url,
      title: this.readValue('link-title')
    }));
    this.hideLinkModal();
  }

  // Image dialog

  setupImageModal() {
    const overlay = document.getElementById('image-modal')?.querySelector('.image-modal-overlay');
    this.listenById('image-modal-close', 'click', () => this.hideImageModal());
    this.listenById('image-cancel-btn', 'click', () => this.hideImageModal());
    this.listen(overlay, 'click', () => this.hideImageModal());
    this.listenById('image-insert-btn', 'click', () => this.insertImage());

    for (const tab of document.querySelectorAll('.image-tab')) {
      this.listen(tab, 'click', () => this.switchImageTab(tab.getAttribute('data-tab')));
    }

    const dropZone = document.getElementById('image-drop-zone');
    const fileInput = document.getElementById('image-file-input');
    if (!dropZone || !fileInput) return;

    this.listen(dropZone, 'click', () => fileInput.click());
    this.listen(dropZone, 'dragover', (event) => {
      event.preventDefault();
      dropZone.classList.add('drag-over');
    });
    this.listen(dropZone, 'dragleave', () => dropZone.classList.remove('drag-over'));
    this.listen(dropZone, 'drop', (event) => {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
      const [file] = event.dataTransfer?.files || [];
      if (file) this.handleImageFile(file);
    });
    this.listen(fileInput, 'change', (event) => {
      const [file] = event.target.files || [];
      if (file) this.handleImageFile(file);
    });
  }

  isImageModalOpen() {
    return document.getElementById('image-modal')?.style.display === 'flex';
  }

  showImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    this.switchImageTab('url');
  }

  hideImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    modal.style.display = 'none';
    this.clearValues([
      'image-url',
      'image-alt',
      'image-title',
      'image-link',
      'file-image-alt',
      'file-image-link',
      'image-file-input'
    ]);
    this.setDisplay('file-alt-group', 'none');
    this.setDisplay('file-link-group', 'none');
  }

  switchImageTab(tabName) {
    for (const tab of document.querySelectorAll('.image-tab')) {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    }
    for (const pane of document.querySelectorAll('.tab-pane')) {
      pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    }
  }

  getActiveImageTab() {
    return document.querySelector('.image-tab.active')?.getAttribute('data-tab');
  }

  insertImage() {
    const markdown = this.getActiveImageTab() === 'file'
      ? this.buildFileImageMarkdown()
      : this.buildUrlImageMarkdown();

    if (!markdown) return;
    this.insertMarkdown(markdown);
    this.hideImageModal();
  }

  buildUrlImageMarkdown() {
    const url = this.readValue('image-url');
    if (!url) {
      this.reportRequiredField('Please enter an image URL');
      return null;
    }

    return buildImageMarkdown({
      url,
      alt: this.readValue('image-alt'),
      title: this.readValue('image-title'),
      link: this.readValue('image-link')
    });
  }

  buildFileImageMarkdown() {
    const [file] = document.getElementById('image-file-input')?.files || [];
    if (!file) {
      this.reportRequiredField('Please select an image file');
      return null;
    }

    return buildImageMarkdown({
      url: file.name,
      alt: this.readValue('file-image-alt') || altTextFromFileName(file.name),
      link: this.readValue('file-image-link')
    });
  }

  handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      this.reportRequiredField('Please select an image file');
      return;
    }

    this.setDisplay('file-alt-group', 'block');
    this.setDisplay('file-link-group', 'block');

    const altInput = document.getElementById('file-image-alt');
    if (altInput) altInput.value = altTextFromFileName(file.name);

    const dropZone = document.getElementById('image-drop-zone');
    const dropText = dropZone?.querySelector('.drop-text');
    const dropStatus = dropZone?.querySelector('.drop-status');
    if (dropText && dropStatus) {
      dropText.textContent = file.name;
      dropStatus.textContent = 'File selected';
    }
  }

  // Shared helpers

  readValue(elementId) {
    return document.getElementById(elementId)?.value.trim() || '';
  }

  clearValues(elementIds) {
    for (const id of elementIds) {
      const element = document.getElementById(id);
      if (element) element.value = '';
    }
  }

  setDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = value;
  }

  reportRequiredField(message) {
    window.alert(message);
  }

  insertMarkdown(text) {
    this.markdownActionController.insertMarkdownText(text);
  }

  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);
      callback();
    }, delay);
    this.pendingTimers.add(timer);
    return timer;
  }

  onDestroy() {
    for (const { target, event, handler, options } of this.domListeners) {
      target.removeEventListener(event, handler, options);
    }
    this.domListeners = [];
    for (const timer of this.pendingTimers) clearTimeout(timer);
    this.pendingTimers.clear();
    // Return any menu still parked on <body> to its toolbar container.
    this.hideAllDropdowns();
    this.dropdownHomes.clear();
    this.markdownActionController = null;
  }
}

window.MarkdownDialogController = MarkdownDialogController;
export { MarkdownDialogController };
