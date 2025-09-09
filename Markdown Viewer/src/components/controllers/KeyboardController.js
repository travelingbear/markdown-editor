/**
 * Keyboard Controller - Manages all keyboard shortcuts and event handling
 * Extracted from MarkdownEditor for better separation of concerns
 */
class KeyboardController extends BaseComponent {
  constructor(options = {}) {
    super('KeyboardController', options);
    
    // References to other components (injected)
    this.markdownEditor = null;
    this.fileController = null;
    this.uiController = null;
    this.tabManager = null;
  }

  async onInit() {
    this.setupKeyboardEventHandlers();
  }

  // Inject dependencies
  setDependencies(markdownEditor, fileController, uiController, tabManager) {
    this.markdownEditor = markdownEditor;
    this.fileController = fileController;
    this.uiController = uiController;
    this.tabManager = tabManager;
  }

  setupKeyboardEventHandlers() {
    // Use capture phase to intercept events before Monaco editor
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    }, true);
    
    document.addEventListener('wheel', (e) => {
      this.handleMouseWheelShortcuts(e);
    }, { passive: false, capture: true });
    
    this.setupTabKeyboardShortcuts();
  }

  handleKeyboardShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const useCtrlForModes = e.ctrlKey || (!isMac && e.metaKey);
    const useCtrlForOther = e.ctrlKey || e.metaKey;
    
    // Handle F1 globally to override Monaco's command palette
    if (e.key === 'F1') {
      e.preventDefault();
      e.stopPropagation();
      this.uiController.showHelp();
      return;
    }
    
    if (useCtrlForOther) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.fileController.newFile(this.tabManager);
          break;
        case 'o':
          e.preventDefault();
          this.fileController.openFile(this.markdownEditor.documentComponent, this.tabManager);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          if (e.shiftKey) {
            this.fileController.saveAsFile(this.markdownEditor.documentComponent, this.tabManager);
          } else {
            this.fileController.saveFile(this.markdownEditor.documentComponent, this.tabManager);
          }
          break;
        case 'w':
          e.preventDefault();
          this.fileController.closeFile(this.tabManager, this.markdownEditor.performanceOptimizer);
          break;
        case 't':
        case '/':
          e.preventDefault();
          const themeData = this.uiController.toggleTheme();
          this.markdownEditor.handleThemeChange(themeData);
          break;
        case ',':
          e.preventDefault();
          this.uiController.showSettings();
          break;
        case 'm':
        case 'M':
          if (e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.showTabModal();
          }
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.exportToPdf();
          }
          break;
        case 'e':
          if (e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.exportToHtml();
          }
          break;
        case 'f':
          if (this.markdownEditor.currentMode !== 'preview') {
            e.preventDefault();
            this.markdownEditor.openFindReplace();
          }
          break;
        case 'r':
          e.preventDefault();
          this.markdownEditor.performManualScrollSync();
          break;
        case '?':
          if (e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.toggleMarkdownToolbar();
          }
          break;
      }
    }
    
    // Mode switching
    if (useCtrlForModes) {
      switch (e.key) {
        case '1':
          if (!e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.setMode('code');
          }
          break;
        case '2':
          if (!e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.setMode('preview');
          }
          break;
        case '3':
          if (!e.shiftKey) {
            e.preventDefault();
            this.markdownEditor.setMode('split');
          }
          break;
      }
    }
    
    // Handle Ctrl+Tab separately
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        this.markdownEditor.switchToPreviousTab();
      } else {
        this.markdownEditor.switchToNextTab();
      }
      return;
    }
    
    // Function keys
    switch (e.key) {
      // F1 is handled at the top of the function
      case 'F5':
        e.preventDefault();
        this.markdownEditor.reloadCurrentFile();
        break;
      case 'F11':
        e.preventDefault();
        if (e.shiftKey) {
          this.uiController.toggleDistractionFree();
        } else {
          this.markdownEditor.toggleFullscreen();
        }
        break;
      case 'Escape':
        this.handleEscapeKey();
        break;
    }
  }

  handleEscapeKey() {
    const settingsModal = document.getElementById('settings-modal');
    const helpModal = document.getElementById('help-modal');
    const aboutModal = document.getElementById('about-modal');
    const linkModal = document.getElementById('link-modal');
    const imageModal = document.getElementById('image-modal');
    
    if (settingsModal && settingsModal.style.display === 'flex') {
      this.uiController.hideSettings();
    } else if (helpModal && helpModal.style.display === 'flex') {
      this.uiController.hideHelp();
    } else if (aboutModal && aboutModal.style.display === 'flex') {
      this.uiController.hideAbout();
    } else if (linkModal && linkModal.style.display === 'flex') {
      this.markdownEditor.toolbarComponent.hideLinkModal();
    } else if (imageModal && imageModal.style.display === 'flex') {
      this.markdownEditor.toolbarComponent.hideImageModal();
    } else if (this.uiController.isDistractionFree) {
      this.uiController.exitDistractionFree();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  handleMouseWheelShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    // Font size and zoom controls (works inside Monaco too)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) {
        if (this.markdownEditor.currentMode === 'code') {
          this.markdownEditor.toolbarComponent.changeFontSize(2);
        } else if (this.markdownEditor.currentMode === 'preview' || this.markdownEditor.currentMode === 'split') {
          this.markdownEditor.toolbarComponent.changeZoom(0.1);
        }
      } else if (e.deltaY > 0) {
        if (this.markdownEditor.currentMode === 'code') {
          this.markdownEditor.toolbarComponent.changeFontSize(-2);
        } else if (this.markdownEditor.currentMode === 'preview' || this.markdownEditor.currentMode === 'split') {
          this.markdownEditor.toolbarComponent.changeZoom(-0.1);
        }
      }
      return;
    }
    
    // Mode switching (reversed direction)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const modes = ['code', 'preview', 'split'];
      const currentIndex = modes.indexOf(this.markdownEditor.currentMode);
      
      if (e.deltaY < 0) {
        const prevIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
        this.markdownEditor.setMode(modes[prevIndex]);
      } else if (e.deltaY > 0) {
        const nextIndex = (currentIndex + 1) % modes.length;
        this.markdownEditor.setMode(modes[nextIndex]);
      }
      return;
    }
    
    const useAltKey = e.altKey || (isMac && e.metaKey && !e.ctrlKey);
    if (useAltKey && this.tabManager.hasTabs()) {
      e.preventDefault();
      
      if (e.deltaY < 0) {
        this.markdownEditor.switchToPreviousTab();
      } else if (e.deltaY > 0) {
        this.markdownEditor.switchToNextTab();
      }
      return;
    }
  }

  setupTabKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const useAltKey = e.altKey || (isMac && e.metaKey);
      
      if (useAltKey && e.key >= '1' && e.key <= '9') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = this.tabManager.getAllTabs();
        const availableTabs = tabs.slice(0, 9);
        
        if (availableTabs[tabIndex]) {
          e.preventDefault();
          this.markdownEditor.switchToTab(availableTabs[tabIndex].id);
        }
      }
    });
  }

  handleTabModalKeyboard(e) {
    const tabModalList = document.getElementById('tab-modal-list');
    if (!tabModalList) return;
    
    const visibleItems = Array.from(tabModalList.querySelectorAll('.tab-modal-item:not(.filtered-out)'));
    if (visibleItems.length === 0) return;
    
    let currentIndex = visibleItems.findIndex(item => item.classList.contains('keyboard-focus'));
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < visibleItems.length - 1) {
          this.setTabModalKeyboardFocus(currentIndex + 1, visibleItems);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          this.setTabModalKeyboardFocus(currentIndex - 1, visibleItems);
        } else if (currentIndex === -1 && visibleItems.length > 0) {
          this.setTabModalKeyboardFocus(visibleItems.length - 1, visibleItems);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && visibleItems[currentIndex]) {
          visibleItems[currentIndex].click();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.markdownEditor.hideTabModal();
        break;
    }
  }
  
  setTabModalKeyboardFocus(index, items) {
    items.forEach(item => item.classList.remove('keyboard-focus'));
    
    if (index >= 0 && index < items.length) {
      items[index].classList.add('keyboard-focus');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }
}

window.KeyboardController = KeyboardController;