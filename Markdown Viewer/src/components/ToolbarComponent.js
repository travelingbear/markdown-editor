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
    
    // Markdown formatting buttons
    const mdButtons = this.markdownToolbar.querySelectorAll('.md-btn');
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
        this.markdownToolbar.style.display = 'block';
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
      const shouldShow = this.currentMode === 'code' && !this.isDistractionFree && this.hasDocument;
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

  onDestroy() {
    // Clean up any resources
    this.currentMode = 'preview';
    this.hasDocument = false;
    this.isDirty = false;
  }
}

// Export for use in other components
window.ToolbarComponent = ToolbarComponent;