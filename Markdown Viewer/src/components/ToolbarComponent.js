import { shouldShowMarkdownToolbar } from './toolbarState.js';

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
    this.quickSettingsState = {
      extended: localStorage.getItem('markdownViewer_advancedRendering') === 'true',
      pinnedTabsEnabled: localStorage.getItem('markdownViewer_pinnedTabs') === 'true',
      renderingPinned: localStorage.getItem('markdownViewer_pinRenderingControl') === 'true',
      pinnedTabsPinned: localStorage.getItem('markdownViewer_pinPinnedTabsControl') === 'true'
    };
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
    this.quickSettingsToolbar = document.getElementById('quick-settings-toolbar');
    this.quickRenderingBtn = document.getElementById('quick-rendering-btn');
    this.quickPinnedTabsBtn = document.getElementById('quick-pinned-tabs-btn');
    this.quickSettingsMenuBtn = document.getElementById('quick-settings-menu-btn');
    this.quickSettingsMenu = document.getElementById('quick-settings-menu');
    this.quickRenderingMenuItem = document.getElementById('quick-rendering-menu-item');
    this.quickPinnedTabsMenuItem = document.getElementById('quick-pinned-tabs-menu-item');
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
    this.mountMarkdownToolbar();
    this.setupResponsiveOverflow();
    
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

  mountMarkdownToolbar() {
    const editorPane = document.querySelector('.editor-pane');
    if (this.markdownToolbar && editorPane && !editorPane.contains(this.markdownToolbar)) {
      editorPane.insertBefore(this.markdownToolbar, editorPane.firstChild);
    }
  }

  setupResponsiveOverflow() {
    if (!this.markdownToolbar || document.getElementById('md-overflow-btn')) return;

    const toolbarContent = this.markdownToolbar.querySelector('.toolbar-content');
    const searchGroup = this.markdownToolbar.querySelector('#find-replace-btn')?.closest('.toolbar-group');
    if (!toolbarContent || !searchGroup) return;

    const overflowGroup = document.createElement('div');
    overflowGroup.className = 'toolbar-group toolbar-overflow-group';
    overflowGroup.innerHTML = `
      <div class="md-overflow-container">
        <button id="md-overflow-btn" class="md-btn" type="button"
                aria-haspopup="menu" aria-expanded="false" title="More Markdown tools">
          <span class="md-overflow-label">More</span><span aria-hidden="true">⋯</span>
        </button>
        <div id="md-overflow-menu" class="md-overflow-menu" role="menu" aria-label="More Markdown tools">
          <section class="md-overflow-section overflow-section-history" aria-label="History">
            <div class="md-overflow-heading">History</div>
            <button type="button" class="md-overflow-item" data-command="undo" role="menuitem">
              <span class="md-overflow-icon">↶</span><span>Undo</span><kbd>Ctrl Z</kbd>
            </button>
            <button type="button" class="md-overflow-item" data-command="redo" role="menuitem">
              <span class="md-overflow-icon">↷</span><span>Redo</span><kbd>Ctrl Y</kbd>
            </button>
          </section>
          <section class="md-overflow-section overflow-section-headings" aria-label="Headings">
            <div class="md-overflow-heading">Headings</div>
            <button type="button" class="md-overflow-item" data-action="h1" role="menuitem"><span class="md-overflow-icon">H1</span><span>Heading 1</span></button>
            <button type="button" class="md-overflow-item" data-action="h2" role="menuitem"><span class="md-overflow-icon">H2</span><span>Heading 2</span></button>
            <button type="button" class="md-overflow-item" data-action="h3" role="menuitem"><span class="md-overflow-icon">H3</span><span>Heading 3</span></button>
          </section>
          <section class="md-overflow-section overflow-section-formatting" aria-label="Formatting">
            <div class="md-overflow-heading">Formatting</div>
            <button type="button" class="md-overflow-item" data-action="strikethrough" role="menuitem"><span class="md-overflow-icon"><s>S</s></span><span>Strikethrough</span></button>
            <button type="button" class="md-overflow-item" data-action="underline" role="menuitem"><span class="md-overflow-icon"><u>U</u></span><span>Underline</span></button>
          </section>
          <section class="md-overflow-section overflow-section-insert" aria-label="Insert">
            <div class="md-overflow-heading">Insert</div>
            <button type="button" class="md-overflow-item" data-action="link" role="menuitem"><span class="md-overflow-icon">↗</span><span>Link</span></button>
            <button type="button" class="md-overflow-item" data-action="image" role="menuitem"><span class="md-overflow-icon">▧</span><span>Image</span></button>
          </section>
          <section class="md-overflow-section overflow-section-structure" aria-label="Lists and table">
            <div class="md-overflow-heading">Lists &amp; table</div>
            <button type="button" class="md-overflow-item" data-action="ul" role="menuitem"><span class="md-overflow-icon">•</span><span>Bulleted list</span></button>
            <button type="button" class="md-overflow-item" data-action="ol" role="menuitem"><span class="md-overflow-icon">1.</span><span>Numbered list</span></button>
            <button type="button" class="md-overflow-item" data-action="task" role="menuitem"><span class="md-overflow-icon">☐</span><span>Task list</span></button>
            <button type="button" class="md-overflow-item" data-action="table" role="menuitem"><span class="md-overflow-icon">▦</span><span>Table</span></button>
          </section>
          <section class="md-overflow-section overflow-section-blocks" aria-label="Blocks">
            <div class="md-overflow-heading">Blocks</div>
            <button type="button" class="md-overflow-item" data-action="code" role="menuitem"><span class="md-overflow-icon">&lt;/&gt;</span><span>Inline code</span></button>
            <button type="button" class="md-overflow-item" data-action="codeblock" role="menuitem"><span class="md-overflow-icon">{ }</span><span>Code block</span></button>
            <button type="button" class="md-overflow-item" data-action="quote" role="menuitem"><span class="md-overflow-icon">❞</span><span>Blockquote</span></button>
          </section>
          <section class="md-overflow-section overflow-section-alignment" aria-label="Alignment">
            <div class="md-overflow-heading">Alignment</div>
            <button type="button" class="md-overflow-item" data-action="align-left" role="menuitem"><span class="md-overflow-icon">≡</span><span>Align left</span></button>
            <button type="button" class="md-overflow-item" data-action="align-center" role="menuitem"><span class="md-overflow-icon">≣</span><span>Align center</span></button>
            <button type="button" class="md-overflow-item" data-action="align-right" role="menuitem"><span class="md-overflow-icon">≡</span><span>Align right</span></button>
            <button type="button" class="md-overflow-item" data-action="align-justify" role="menuitem"><span class="md-overflow-icon">☰</span><span>Justify</span></button>
          </section>
        </div>
      </div>
    `;
    toolbarContent.insertBefore(overflowGroup, searchGroup);

    this.overflowButton = overflowGroup.querySelector('#md-overflow-btn');
    this.overflowMenu = overflowGroup.querySelector('#md-overflow-menu');
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

    this.quickRenderingBtn?.addEventListener('click', () => {
      this.emit('rendering-mode-toggle-requested');
    });
    this.quickPinnedTabsBtn?.addEventListener('click', () => {
      this.emit('pinned-tabs-toggle-requested');
    });
    this.quickRenderingMenuItem?.addEventListener('click', () => {
      this.hideQuickSettingsMenu();
      this.emit('rendering-mode-toggle-requested');
    });
    this.quickPinnedTabsMenuItem?.addEventListener('click', () => {
      this.hideQuickSettingsMenu();
      this.emit('pinned-tabs-toggle-requested');
    });
    this.quickSettingsMenuBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = this.quickSettingsMenu?.classList.toggle('show') === true;
      this.quickSettingsMenuBtn.setAttribute('aria-expanded', String(isOpen));
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
    this.setupResponsiveOverflowEvents();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.hideExportDropdown();
        this.hideSaveDropdown();
        this.hideQuickSettingsMenu();
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

  setupResponsiveOverflowEvents() {
    if (!this.overflowButton || !this.overflowMenu) return;

    this.overflowButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = this.overflowMenu.classList.toggle('show');
      this.overflowButton.setAttribute('aria-expanded', isOpen.toString());
    });

    this.overflowMenu.addEventListener('click', (event) => {
      const item = event.target.closest('.md-overflow-item');
      if (!item) return;

      const action = item.dataset.action;
      const command = item.dataset.command;
      if (action) this.emit('markdown-action', { action });
      if (command === 'undo') this.emit('editor-undo');
      if (command === 'redo') this.emit('editor-redo');
      this.hideResponsiveOverflow();
    });

    this.overflowMenu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hideResponsiveOverflow();
        this.overflowButton.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.md-overflow-container')) this.hideResponsiveOverflow();
    });
  }

  hideResponsiveOverflow() {
    this.overflowMenu?.classList.remove('show');
    this.overflowButton?.setAttribute('aria-expanded', 'false');
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
      const shouldShow = shouldShowMarkdownToolbar({
        mode: this.currentMode,
        isDistractionFree: this.isDistractionFree,
        isToolbarEnabled: this.isToolbarEnabled
      });
      
      if (shouldShow) {
        this.markdownToolbar.style.display = 'block';
        this.markdownToolbar.style.visibility = 'visible';
        this.markdownToolbar.classList.add('visible');
      } else {
        this.markdownToolbar.style.display = 'none';
        this.markdownToolbar.classList.remove('visible');
        this.hideResponsiveOverflow();
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
    this.updateQuickSettings(this.quickSettingsState);
    
    // Apply toolbar sizes
    document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
    document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
  }

  updateQuickSettings(state = {}) {
    this.quickSettingsState = { ...this.quickSettingsState, ...state };
    const {
      extended,
      pinnedTabsEnabled,
      renderingPinned,
      pinnedTabsPinned
    } = this.quickSettingsState;

    const renderingLabel = `MD: ${extended ? 'Extended' : 'Pure'}`;
    if (this.quickRenderingBtn) {
      this.quickRenderingBtn.textContent = renderingLabel;
      this.quickRenderingBtn.title = `Markdown rendering: ${extended ? 'Extended' : 'Pure'} (click to toggle)`;
      this.quickRenderingBtn.classList.toggle('is-pinned', renderingPinned);
      this.quickRenderingBtn.classList.toggle('active', extended);
      this.quickRenderingBtn.setAttribute('aria-pressed', String(extended));
    }
    if (this.quickRenderingMenuItem) {
      this.updateQuickMenuItem(
        this.quickRenderingMenuItem,
        'Markdown rendering',
        extended ? 'Extended' : 'Pure',
        extended
      );
      this.quickRenderingMenuItem.classList.toggle('is-pinned', renderingPinned);
    }

    if (this.quickPinnedTabsBtn) {
      this.quickPinnedTabsBtn.textContent = 'Tabs';
      this.quickPinnedTabsBtn.classList.toggle('is-pinned', pinnedTabsPinned);
      this.quickPinnedTabsBtn.classList.toggle('active', pinnedTabsEnabled);
      this.quickPinnedTabsBtn.title = `Pinned Tabs: ${pinnedTabsEnabled ? 'Enabled' : 'Disabled'} (click to toggle)`;
      this.quickPinnedTabsBtn.setAttribute('aria-pressed', String(pinnedTabsEnabled));
    }
    if (this.quickPinnedTabsMenuItem) {
      this.updateQuickMenuItem(
        this.quickPinnedTabsMenuItem,
        'Pinned tabs',
        pinnedTabsEnabled ? 'Enabled' : 'Disabled',
        pinnedTabsEnabled
      );
      this.quickPinnedTabsMenuItem.classList.toggle('is-pinned', pinnedTabsPinned);
    }

    const hasPinnedControls = renderingPinned || pinnedTabsPinned;
    this.quickSettingsToolbar?.classList.toggle('has-pinned', hasPinnedControls);
    if (!hasPinnedControls) this.hideQuickSettingsMenu();
  }

  updateQuickMenuItem(button, label, value, active) {
    const labelElement = document.createElement('span');
    labelElement.className = 'quick-setting-menu-label';
    labelElement.textContent = label;

    const stateElement = document.createElement('span');
    stateElement.className = 'quick-setting-menu-state';
    stateElement.textContent = value;

    button.replaceChildren(labelElement, stateElement);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }

  hideQuickSettingsMenu() {
    this.quickSettingsMenu?.classList.remove('show');
    this.quickSettingsMenuBtn?.setAttribute('aria-expanded', 'false');
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
