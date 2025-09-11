/**
 * Toolbar Component
 * Manages main toolbar and markdown toolbar functionality
 */
class ToolbarComponent extends BaseComponent {
  constructor(options = {}) {
    super('ToolbarComponent', options);
    
    // Toolbar state
    this.currentMode = 'preview';
    this.hasDocument = false;
    this.isDirty = false;
    this.isToolbarEnabled = localStorage.getItem('markdownViewer_toolbarEnabled') !== 'false';
    this.isDistractionFree = false;
    
    // Settings
    this.mainToolbarSize = localStorage.getItem('markdownViewer_mainToolbarSize') || 'medium';
    this.mdToolbarSize = localStorage.getItem('markdownViewer_mdToolbarSize') || 'medium';
    this.fontSize = parseInt(localStorage.getItem('markdownViewer_fontSize') || '14');
    this.previewZoom = 1.0;
  }

  async onInit() {
    // Load markdown toolbar CSS
    if (window.styleManager) {
      await window.styleManager.loadMarkdownToolbar();
    }
    
    // Initialize DOM elements
    this.initializeElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply initial settings
    this.applySettings();
  }

  initializeElements() {
    // Main toolbar elements
    this.newBtn = document.getElementById('new-btn');
    this.openBtn = document.getElementById('open-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.saveDropdownArrow = document.getElementById('save-dropdown-arrow');
    this.saveDropdownMenu = document.getElementById('save-dropdown-menu');
    this.saveAsBtn = document.getElementById('save-as-btn');
    this.closeBtn = document.getElementById('close-btn');
    this.exportBtn = document.getElementById('export-btn');
    this.exportDropdownMenu = document.getElementById('export-dropdown-menu');
    this.exportHtmlBtn = document.getElementById('export-html-btn');
    this.exportPdfBtn = document.getElementById('export-pdf-btn');
    this.distractionBtn = document.getElementById('distraction-btn');
    this.themeBtn = document.getElementById('theme-btn');
    this.settingsBtn = document.getElementById('settings-btn');
    this.helpStatusBtn = document.getElementById('help-status-btn');
    this.reloadBtn = document.getElementById('reload-btn');
    
    // Mode buttons
    this.codeBtn = document.getElementById('code-btn');
    this.previewBtn = document.getElementById('preview-btn');
    this.splitBtn = document.getElementById('split-btn');
    
    // Markdown toolbar
    this.markdownToolbar = document.getElementById('markdown-toolbar');
    
    // Font size controls
    this.fontSizeDisplay = document.getElementById('font-size-display');
    this.fontSizeIncrease = document.getElementById('font-size-increase');
    this.fontSizeDecrease = document.getElementById('font-size-decrease');
    this.fontSizeReset = document.getElementById('font-size-reset');
    
    // Zoom controls
    this.zoomControls = document.getElementById('zoom-controls');
    this.zoomDisplay = document.getElementById('zoom-display');
    this.zoomIn = document.getElementById('zoom-in');
    this.zoomOut = document.getElementById('zoom-out');
    this.zoomReset = document.getElementById('zoom-reset');
    
    // Undo/Redo controls
    this.undoBtn = document.getElementById('undo-btn');
    this.redoBtn = document.getElementById('redo-btn');
    
    // Find/Replace control
    this.findReplaceBtn = document.getElementById('find-replace-btn');
    
    if (!this.newBtn || !this.codeBtn) {
      throw new Error('Toolbar elements not found');
    }
  }

  setupEventListeners() {
    // File operations
    this.newBtn.addEventListener('click', () => {
      this.emit('file-new-requested');
    });
    
    this.openBtn.addEventListener('click', () => {
      this.emit('file-open-requested');
    });
    
    this.saveBtn.addEventListener('click', () => {
      this.emit('file-save-requested');
    });
    
    this.saveDropdownArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSaveDropdown();
    });
    
    this.saveAsBtn.addEventListener('click', () => {
      this.hideSaveDropdown();
      this.emit('file-save-as-requested');
    });
    
    this.closeBtn.addEventListener('click', () => {
      this.emit('file-close-requested');
    });
    
    // Mode switching
    this.codeBtn.addEventListener('click', () => {
      this.setMode('code');
    });
    
    this.previewBtn.addEventListener('click', () => {
      this.setMode('preview');
    });
    
    this.splitBtn.addEventListener('click', () => {
      this.setMode('split');
    });
    
    // Export functionality
    this.exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExportDropdown();
    });
    
    this.exportHtmlBtn.addEventListener('click', () => {
      this.hideExportDropdown();
      this.emit('export-html-requested');
    });
    
    this.exportPdfBtn.addEventListener('click', () => {
      this.hideExportDropdown();
      this.emit('export-pdf-requested');
    });
    
    // UI controls
    this.distractionBtn.addEventListener('click', () => {
      this.emit('distraction-free-toggle');
    });
    
    this.themeBtn.addEventListener('click', () => {
      this.emit('theme-toggle');
    });
    
    this.settingsBtn.addEventListener('click', () => {
      this.emit('settings-show');
    });
    
    this.helpStatusBtn.addEventListener('click', () => {
      this.emit('help-show');
    });
    
    this.reloadBtn.addEventListener('click', () => {
      this.emit('file-reload-requested');
    });
    
    // Font size controls
    if (this.fontSizeIncrease) {
      this.fontSizeIncrease.addEventListener('click', () => {
        this.changeFontSize(2);
      });
    }
    
    if (this.fontSizeDecrease) {
      this.fontSizeDecrease.addEventListener('click', () => {
        this.changeFontSize(-2);
      });
    }
    
    if (this.fontSizeReset) {
      this.fontSizeReset.addEventListener('click', () => {
        this.resetFontSize();
      });
    }
    
    // Zoom controls
    if (this.zoomIn) {
      this.zoomIn.addEventListener('click', () => {
        this.changeZoom(0.1);
      });
    }
    
    if (this.zoomOut) {
      this.zoomOut.addEventListener('click', () => {
        this.changeZoom(-0.1);
      });
    }
    
    if (this.zoomReset) {
      this.zoomReset.addEventListener('click', () => {
        this.resetZoom();
      });
    }
    
    // Undo/Redo controls
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => {
        this.emit('editor-undo');
      });
    }
    
    if (this.redoBtn) {
      this.redoBtn.addEventListener('click', () => {
        this.emit('editor-redo');
      });
    }
    
    // Find/Replace control
    if (this.findReplaceBtn) {
      this.findReplaceBtn.addEventListener('click', () => {
        this.emit('find-replace-requested');
      });
    }
    
    // Markdown toolbar events
    this.setupMarkdownToolbarEvents();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.hideExportDropdown();
        this.hideSaveDropdown();
      }
    });
    
    // Listen for component events
    this.on('mode-changed', (data) => {
      this.currentMode = data.mode;
      this.updateModeButtons();
      this.updateToolbarVisibility();
      this.updateZoomControlsVisibility();
    });
    
    this.on('document-state-changed', (data) => {
      this.updateDocumentState(data);
    });
    
    this.on('distraction-free-changed', (data) => {
      this.updateDistractionFree(data.isDistractionFree);
    });
  }

  setupMarkdownToolbarEvents() {
    if (!this.markdownToolbar) return;
    
    // Markdown formatting buttons (excluding dropdown buttons)
    const mdButtons = this.markdownToolbar.querySelectorAll('.md-btn:not(.md-dropdown-arrow)');
    mdButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        let action = e.target.getAttribute('data-action');
        if (!action && e.target.parentElement) {
          action = e.target.parentElement.getAttribute('data-action');
        }
        if (!action) {
          action = btn.getAttribute('data-action');
        }
        
        if (action) {
          this.emit('markdown-action', { action });
        }
      });
    });
    
    // Setup dropdown functionality
    this.setupMarkdownDropdowns();
    
    // Setup modal functionality
    this.setupMarkdownModals();
  }
  
  setupMarkdownDropdowns() {
    // Link dropdown
    const linkDropdownArrow = document.getElementById('link-dropdown-arrow');
    const linkDropdownMenu = document.getElementById('link-dropdown-menu');
    const linkInsertBtn = document.getElementById('link-insert-btn');
    
    if (linkDropdownArrow && linkDropdownMenu) {
      linkDropdownArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMarkdownDropdown('link');
      });
    }
    
    if (linkInsertBtn) {
      linkInsertBtn.addEventListener('click', () => {
        this.hideMarkdownDropdown('link');
        this.showLinkModal();
      });
    }
    
    // Image dropdown
    const imageDropdownArrow = document.getElementById('image-dropdown-arrow');
    const imageDropdownMenu = document.getElementById('image-dropdown-menu');
    const imageOpenBtn = document.getElementById('image-open-btn');
    
    if (imageDropdownArrow && imageDropdownMenu) {
      imageDropdownArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMarkdownDropdown('image');
      });
    }
    
    if (imageOpenBtn) {
      imageOpenBtn.addEventListener('click', () => {
        this.hideMarkdownDropdown('image');
        this.showImageModal();
      });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.md-dropdown-container')) {
        this.hideAllMarkdownDropdowns();
      }
    });
  }
  
  setupMarkdownModals() {
    // Link modal
    const linkModal = document.getElementById('link-modal');
    const linkModalClose = document.getElementById('link-modal-close');
    const linkCancelBtn = document.getElementById('link-cancel-btn');
    const linkInsertConfirmBtn = document.getElementById('link-insert-confirm-btn');
    const linkModalOverlay = linkModal?.querySelector('.link-modal-overlay');
    
    if (linkModalClose) {
      linkModalClose.addEventListener('click', () => this.hideLinkModal());
    }
    if (linkCancelBtn) {
      linkCancelBtn.addEventListener('click', () => this.hideLinkModal());
    }
    if (linkModalOverlay) {
      linkModalOverlay.addEventListener('click', () => this.hideLinkModal());
    }
    if (linkInsertConfirmBtn) {
      linkInsertConfirmBtn.addEventListener('click', () => this.insertLink());
    }
    
    // Image modal
    const imageModal = document.getElementById('image-modal');
    const imageModalClose = document.getElementById('image-modal-close');
    const imageCancelBtn = document.getElementById('image-cancel-btn');
    const imageInsertBtn = document.getElementById('image-insert-btn');
    const imageModalOverlay = imageModal?.querySelector('.image-modal-overlay');
    
    if (imageModalClose) {
      imageModalClose.addEventListener('click', () => this.hideImageModal());
    }
    if (imageCancelBtn) {
      imageCancelBtn.addEventListener('click', () => this.hideImageModal());
    }
    if (imageModalOverlay) {
      imageModalOverlay.addEventListener('click', () => this.hideImageModal());
    }
    if (imageInsertBtn) {
      imageInsertBtn.addEventListener('click', () => this.insertImage());
    }
    
    // Image modal tabs
    const imageTabs = document.querySelectorAll('.image-tab');
    imageTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        this.switchImageTab(tabName);
      });
    });
    
    // File drop zone
    const dropZone = document.getElementById('image-drop-zone');
    const fileInput = document.getElementById('image-file-input');
    
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.handleImageFile(files[0]);
        }
      });
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }
  }

  /**
   * Set current mode
   */
  setMode(mode) {
    if (this.currentMode === mode) return;
    
    // Check if mode switching is allowed
    if (!this.hasDocument && (mode === 'code' || mode === 'split')) {
      return;
    }
    
    this.currentMode = mode;
    this.updateModeButtons();
    this.updateToolbarVisibility();
    this.updateZoomControlsVisibility();
    
    this.emit('mode-change-requested', { mode });
  }

  /**
   * Update mode buttons
   */
  updateModeButtons() {
    // Remove active class from all mode buttons
    this.codeBtn.classList.remove('active');
    this.previewBtn.classList.remove('active');
    this.splitBtn.classList.remove('active');
    
    // Add active class to current mode button
    switch (this.currentMode) {
      case 'code':
        this.codeBtn.classList.add('active');
        break;
      case 'preview':
        this.previewBtn.classList.add('active');
        break;
      case 'split':
        this.splitBtn.classList.add('active');
        break;
    }
    
    // Update button states
    const buttons = [
      this.codeBtn, this.previewBtn, this.splitBtn,
      this.saveBtn, this.saveAsBtn, this.closeBtn,
      this.exportBtn, this.exportHtmlBtn, this.exportPdfBtn
    ];
    
    // Update reload button separately (in status bar)
    if (this.reloadBtn) {
      this.reloadBtn.style.display = this.hasDocument ? 'inline-block' : 'none';
    }
    
    // Update cursor position visibility
    const cursorPos = document.getElementById('cursor-pos');
    if (cursorPos) {
      const shouldShow = this.hasDocument && (this.currentMode === 'code' || this.currentMode === 'split');
      cursorPos.style.display = shouldShow ? 'block' : 'none';
    }
    
    buttons.forEach(btn => {
      if (btn) {
        btn.disabled = !this.hasDocument;
        btn.classList.toggle('disabled', !this.hasDocument);
      }
    });
  }

  /**
   * Update document state
   */
  updateDocumentState(state) {
    this.hasDocument = state.hasDocument;
    this.isDirty = state.isDirty;
    
    this.updateModeButtons();
    this.updateZoomControlsVisibility();
    
    // Update save button state
    if (this.saveBtn) {
      this.saveBtn.classList.toggle('dirty', this.isDirty);
    }
  }

  /**
   * Update distraction-free mode
   */
  updateDistractionFree(isDistractionFree) {
    this.isDistractionFree = isDistractionFree;
    this.updateToolbarVisibility();
    this.updateZoomControlsVisibility();
  }

  /**
   * Update toolbar visibility
   */
  updateToolbarVisibility() {
    if (this.markdownToolbar) {
      const shouldShow = this.currentMode === 'code' && !this.isDistractionFree && this.isToolbarEnabled;
      
      if (shouldShow) {
        this.markdownToolbar.style.setProperty('display', 'block', 'important');
        this.markdownToolbar.style.setProperty('visibility', 'visible', 'important');
        this.markdownToolbar.classList.add('visible');
      } else {
        this.markdownToolbar.style.display = 'none';
        this.markdownToolbar.classList.remove('visible');
      }
    }
  }

  /**
   * Update zoom controls visibility
   */
  updateZoomControlsVisibility() {
    if (this.zoomControls) {
      const shouldShow = this.currentMode === 'preview' && !this.isDistractionFree && this.hasDocument;
      this.zoomControls.style.display = shouldShow ? 'flex' : 'none';
    }
    
    // Show font size controls only in code mode
    const fontSizeControls = document.getElementById('font-size-controls');
    if (fontSizeControls) {
      const shouldShow = this.currentMode === 'code' && !this.isDistractionFree;
      fontSizeControls.style.display = shouldShow ? 'flex' : 'none';
    }
  }

  /**
   * Change font size
   */
  changeFontSize(delta) {
    const newSize = Math.max(10, Math.min(24, this.fontSize + delta));
    if (newSize !== this.fontSize) {
      this.fontSize = newSize;
      localStorage.setItem('markdownViewer_fontSize', this.fontSize.toString());
      this.updateFontSizeDisplay();
      this.emit('font-size-changed', { fontSize: this.fontSize });
    }
  }

  /**
   * Reset font size
   */
  resetFontSize() {
    this.fontSize = 14;
    localStorage.setItem('markdownViewer_fontSize', this.fontSize.toString());
    this.updateFontSizeDisplay();
    this.emit('font-size-changed', { fontSize: this.fontSize });
  }

  /**
   * Update font size display
   */
  updateFontSizeDisplay() {
    if (this.fontSizeDisplay) {
      this.fontSizeDisplay.textContent = `${this.fontSize}px`;
    }
  }

  /**
   * Change zoom
   */
  changeZoom(delta) {
    const newZoom = Math.max(0.5, Math.min(3.0, this.previewZoom + delta));
    if (newZoom !== this.previewZoom) {
      this.previewZoom = newZoom;
      this.updateZoomDisplay();
      this.emit('zoom-changed', { zoom: this.previewZoom });
    }
  }

  /**
   * Reset zoom
   */
  resetZoom() {
    this.previewZoom = 1.0;
    this.updateZoomDisplay();
    this.emit('zoom-changed', { zoom: this.previewZoom });
  }

  /**
   * Update zoom display
   */
  updateZoomDisplay() {
    if (this.zoomDisplay) {
      this.zoomDisplay.textContent = `${Math.round(this.previewZoom * 100)}%`;
    }
  }

  /**
   * Toggle save dropdown
   */
  toggleSaveDropdown() {
    if (this.saveDropdownMenu.classList.contains('show')) {
      this.hideSaveDropdown();
    } else {
      this.showSaveDropdown();
    }
  }

  showSaveDropdown() {
    this.saveDropdownMenu.classList.add('show');
  }

  hideSaveDropdown() {
    this.saveDropdownMenu.classList.remove('show');
  }

  /**
   * Toggle export dropdown
   */
  toggleExportDropdown() {
    if (this.exportDropdownMenu.classList.contains('show')) {
      this.hideExportDropdown();
    } else {
      this.showExportDropdown();
    }
  }

  showExportDropdown() {
    this.exportDropdownMenu.classList.add('show');
    this.exportBtn.textContent = 'Export ▲';
  }

  hideExportDropdown() {
    this.exportDropdownMenu.classList.remove('show');
    this.exportBtn.textContent = 'Export ▼';
  }

  /**
   * Apply current settings
   */
  applySettings() {
    this.updateFontSizeDisplay();
    this.updateZoomDisplay();
    this.updateModeButtons();
    this.updateToolbarVisibility();
    this.updateZoomControlsVisibility();
    
    // Apply toolbar sizes
    document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
    document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
  }

  /**
   * Update theme button
   */
  updateThemeButton(theme, isRetro = false) {
    if (isRetro) {
      this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" style="vertical-align: middle;"><g fill="currentColor"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></g></svg>';
    } else if (theme === 'contrast') {
      this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle;"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="M8 0a8 8 0 0 0 0 16V0z" fill="white"/></svg>';
    } else {
      this.themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    }
  }

  // Dropdown methods
  toggleMarkdownDropdown(type) {
    const menu = document.getElementById(`${type}-dropdown-menu`);
    if (menu) {
      if (menu.classList.contains('show')) {
        this.hideMarkdownDropdown(type);
      } else {
        this.hideAllMarkdownDropdowns();
        this.showMarkdownDropdown(type);
      }
    }
  }
  
  showMarkdownDropdown(type) {
    const menu = document.getElementById(`${type}-dropdown-menu`);
    const button = document.getElementById(`${type}-dropdown-arrow`);
    if (menu && button) {
      // Move to body to escape stacking context
      document.body.appendChild(menu);
      
      const rect = button.getBoundingClientRect();
      menu.style.left = rect.left + 'px';
      menu.style.top = (rect.bottom + 2) + 'px';
      menu.style.width = (rect.width + button.previousElementSibling.getBoundingClientRect().width) + 'px';
      menu.style.zIndex = '2147483647'; // Maximum z-index
      menu.classList.add('show');
    }
  }
  
  hideMarkdownDropdown(type) {
    const menu = document.getElementById(`${type}-dropdown-menu`);
    if (menu) {
      menu.classList.remove('show');
      // Move back to original container
      const container = document.getElementById(`${type}-dropdown-container`);
      if (container && menu.parentNode !== container) {
        container.appendChild(menu);
      }
    }
  }
  
  hideAllMarkdownDropdowns() {
    this.hideMarkdownDropdown('link');
    this.hideMarkdownDropdown('image');
  }
  
  // Modal methods
  showLinkModal() {
    const modal = document.getElementById('link-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Focus on first input
      const linkText = document.getElementById('link-text');
      if (linkText) {
        setTimeout(() => linkText.focus(), 100);
      }
    }
  }
  
  hideLinkModal() {
    const modal = document.getElementById('link-modal');
    if (modal) {
      modal.style.display = 'none';
      // Clear form
      document.getElementById('link-text').value = '';
      document.getElementById('link-url').value = '';
      document.getElementById('link-title').value = '';
    }
  }
  
  showImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Reset to URL tab
      this.switchImageTab('url');
    }
  }
  
  hideImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
      modal.style.display = 'none';
      // Clear form
      document.getElementById('image-url').value = '';
      document.getElementById('image-alt').value = '';
      document.getElementById('image-title').value = '';
      document.getElementById('image-link').value = '';
      document.getElementById('file-image-alt').value = '';
      document.getElementById('file-image-link').value = '';
      document.getElementById('image-file-input').value = '';
      document.getElementById('file-alt-group').style.display = 'none';
      document.getElementById('file-link-group').style.display = 'none';
    }
  }
  
  switchImageTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.image-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }
  
  insertLink() {
    const linkText = document.getElementById('link-text').value.trim();
    const linkUrl = document.getElementById('link-url').value.trim();
    const linkTitle = document.getElementById('link-title').value.trim();
    
    if (!linkUrl) {
      alert('Please enter a URL');
      return;
    }
    
    const text = linkText || linkUrl;
    const title = linkTitle ? ` "${linkTitle}"` : '';
    const markdown = `[${text}](${linkUrl}${title})`;
    
    this.emit('markdown-insert', { text: markdown });
    this.hideLinkModal();
  }
  
  insertImage() {
    const activeTab = document.querySelector('.image-tab.active').getAttribute('data-tab');
    
    if (activeTab === 'url') {
      const imageUrl = document.getElementById('image-url').value.trim();
      const imageAlt = document.getElementById('image-alt').value.trim();
      const imageTitle = document.getElementById('image-title').value.trim();
      const imageLink = document.getElementById('image-link').value.trim();
      
      if (!imageUrl) {
        alert('Please enter an image URL');
        return;
      }
      
      const alt = imageAlt || 'Image';
      const title = imageTitle ? ` "${imageTitle}"` : '';
      let markdown = `![${alt}](${imageUrl}${title})`;
      
      if (imageLink) {
        markdown = `[${markdown}](${imageLink})`;
      }
      
      this.emit('markdown-insert', { text: markdown });
      this.hideImageModal();
    } else if (activeTab === 'file') {
      const fileInput = document.getElementById('image-file-input');
      const fileAlt = document.getElementById('file-image-alt').value.trim();
      const fileLink = document.getElementById('file-image-link').value.trim();
      
      if (!fileInput.files.length) {
        alert('Please select an image file');
        return;
      }
      
      const file = fileInput.files[0];
      const alt = fileAlt || file.name.split('.')[0];
      
      let markdown = `![${alt}](${file.name})`;
      
      if (fileLink) {
        markdown = `[${markdown}](${fileLink})`;
      }
      
      this.emit('markdown-insert', { text: markdown });
      this.hideImageModal();
    }
  }
  
  handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Show the alt text and link inputs
    document.getElementById('file-alt-group').style.display = 'block';
    document.getElementById('file-link-group').style.display = 'block';
    
    // Set default alt text to filename without extension
    const altInput = document.getElementById('file-image-alt');
    altInput.value = file.name.split('.')[0];
    
    // Update drop zone to show selected file
    const dropZone = document.getElementById('image-drop-zone');
    const dropText = dropZone.querySelector('.drop-text');
    const dropStatus = dropZone.querySelector('.drop-status');
    
    if (dropText && dropStatus) {
      dropText.textContent = file.name;
      dropStatus.textContent = 'File selected';
    }
  }
  
  onDestroy() {
    // Clean up any resources
    this.currentMode = 'preview';
    this.hasDocument = false;
    this.isDirty = false;
  }
}

// Export for use in other components
window.ToolbarComponent = ToolbarComponent;