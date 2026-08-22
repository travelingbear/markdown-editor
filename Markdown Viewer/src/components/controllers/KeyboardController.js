/**
 * Keyboard Controller - Manages all keyboard shortcuts and event handling
 * Extracted from MarkdownEditor for better separation of concerns
 */
class KeyboardController extends BaseComponent {
  constructor(options = {}) {
    super('KeyboardController', options);

    // Explicit dependencies keep this controller independent of the
    // MarkdownEditor composition root.
    this.documentComponent = null;
    this.fileController = null;
    this.uiController = null;
    this.tabManager = null;
    this.modeController = null;
    this.toolbarComponent = null;
    this.markdownActionController = null;
    this.pluginModalController = null;
    this.tabUIController = null;
    this.exportController = null;
    this.performanceOptimizer = null;
    this.actions = {};

    this.boundKeydownHandler = (event) => this.handleKeyboardShortcuts(event);
    this.boundWheelHandler = (event) => this.handleMouseWheelShortcuts(event);
  }

  async onInit() {
    this.setupKeyboardEventHandlers();
  }

  // Inject dependencies
  setDependencies({
    documentComponent,
    fileController,
    uiController,
    tabManager,
    modeController,
    toolbarComponent,
    markdownActionController,
    pluginModalController,
    tabUIController,
    exportController,
    performanceOptimizer,
    actions = {}
  }) {
    this.documentComponent = documentComponent;
    this.fileController = fileController;
    this.uiController = uiController;
    this.tabManager = tabManager;
    this.modeController = modeController;
    this.toolbarComponent = toolbarComponent;
    this.markdownActionController = markdownActionController;
    this.pluginModalController = pluginModalController;
    this.tabUIController = tabUIController;
    this.exportController = exportController;
    this.performanceOptimizer = performanceOptimizer;
    this.actions = actions;
  }

  setupKeyboardEventHandlers() {
    // Use capture phase so application shortcuts take precedence over the editor.
    document.addEventListener('keydown', this.boundKeydownHandler, true);
    document.addEventListener('wheel', this.boundWheelHandler, { passive: false });
  }

  handleKeyboardShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const useCtrlForModes = e.ctrlKey || (!isMac && e.metaKey);
    const useCtrlForOther = e.ctrlKey || e.metaKey;
    const currentMode = this.modeController.getCurrentMode();
    
    // Handle F1 globally for application help.
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
          this.fileController.newFile(this.documentComponent, this.tabManager);
          break;
        case 'o':
          e.preventDefault();
          this.fileController.openFile(this.documentComponent, this.tabManager);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          if (e.shiftKey) {
            this.fileController.saveAsFile(this.documentComponent, this.tabManager);
          } else {
            this.fileController.saveFile(this.documentComponent, this.tabManager);
          }
          break;
        case 'w':
          e.preventDefault();
          this.fileController.closeFile(
            this.documentComponent,
            this.tabManager,
            this.performanceOptimizer
          );
          break;
        case 't':
        case 'T':
          e.preventDefault();
          this.uiController.toggleTheme();
          break;
        case ',':
          e.preventDefault();
          this.uiController.showSettings();
          break;
        case 'm':
        case 'M':
          if (e.shiftKey) {
            e.preventDefault();
            this.tabUIController.showTabModal();
          }
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          this.exportController.exportToPdf();
          break;
        case 'e':
        case 'E':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportController.exportToHtml();
          }
          break;
        case 'f':
        case 'F':
          if (currentMode === 'code' || currentMode === 'split') {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.actions.toggleFindReplace(false);
          }
          break;
        case 'h':
        case 'H':
          if (currentMode === 'code' || currentMode === 'split') {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.actions.toggleFindReplace(true);
          }
          break;
        case 'r':
          e.preventDefault();
          this.actions.performManualScrollSync();
          break;
        case '?':
        case '/':
          if (e.shiftKey) {
            e.preventDefault();
            this.actions.toggleMarkdownToolbar();
          }
          break;
        case '=':
        case '+':
          e.preventDefault();
          if (currentMode === 'code') {
            this.toolbarComponent.changeFontSize(2);
          } else if (currentMode === 'preview' || currentMode === 'split') {
            this.toolbarComponent.changeZoom(0.1);
          }
          break;
        case '-':
        case '_':
          e.preventDefault();
          if (currentMode === 'code') {
            this.toolbarComponent.changeFontSize(-2);
          } else if (currentMode === 'preview' || currentMode === 'split') {
            this.toolbarComponent.changeZoom(-0.1);
          }
          break;
        case '0':
          e.preventDefault();
          if (currentMode === 'code') {
            this.toolbarComponent.resetFontSize();
          } else if (currentMode === 'preview' || currentMode === 'split') {
            this.toolbarComponent.resetZoom();
          }
          break;
      }
    }
    
    // Use the physical digit code because Shift changes event.key to !, @, #,
    // or locale-specific symbols on different keyboard layouts.
    const shortcutDigit = ({ Digit1: '1', Digit2: '2', Digit3: '3' })[e.code]
      || (['1', '2', '3'].includes(e.key) ? e.key : null);
    if (useCtrlForModes && shortcutDigit) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.shiftKey) {
        const modes = { '1': 'code', '2': 'preview', '3': 'split' };
        this.modeController.setMode(modes[shortcutDigit]);
      } else if (currentMode === 'code' || currentMode === 'split') {
        this.markdownActionController.handleMarkdownAction(`h${shortcutDigit}`);
      }
    }

    // Handle Ctrl+Tab separately
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        this.actions.switchToPreviousTab();
      } else {
        this.actions.switchToNextTab();
      }
      return;
    }

    const useAltKey = e.altKey || (isMac && e.metaKey && !e.ctrlKey);
    if (useAltKey && e.key >= '1' && e.key <= '9') {
      const tabIndex = Number.parseInt(e.key, 10) - 1;
      const tab = this.tabManager.getAllTabs().slice(0, 9)[tabIndex];
      if (tab) {
        e.preventDefault();
        this.actions.switchToTab(tab.id);
      }
    }
    
    // Function keys
    switch (e.key) {
      // F1 is handled at the top of the function
      case 'F5':
        e.preventDefault();
        this.actions.reloadCurrentFile();
        break;
      case 'F11':
        e.preventDefault();
        if (e.shiftKey) {
          this.uiController.toggleDistractionFree();
        } else {
          this.actions.toggleFullscreen();
        }
        break;
      case 'Escape':
        this.handleEscapeKey();
        break;
    }
  }

  handleEscapeKey() {
    const pluginManagerModal = document.getElementById('plugin-manager-modal');
    const settingsModal = document.getElementById('settings-modal');
    const helpModal = document.getElementById('help-modal');
    const aboutModal = document.getElementById('about-modal');
    const linkModal = document.getElementById('link-modal');
    const imageModal = document.getElementById('image-modal');
    
    if (pluginManagerModal && pluginManagerModal.style.display === 'flex') {
      this.pluginModalController?.closeFromKeyboard();
    } else if (settingsModal && settingsModal.style.display === 'flex') {
      this.uiController.hideSettings();
    } else if (helpModal && helpModal.style.display === 'flex') {
      this.uiController.hideHelp();
    } else if (aboutModal && aboutModal.style.display === 'flex') {
      this.uiController.hideAbout();
    } else if (linkModal && linkModal.style.display === 'flex') {
      this.toolbarComponent.hideLinkModal();
    } else if (imageModal && imageModal.style.display === 'flex') {
      this.toolbarComponent.hideImageModal();
    } else if (this.uiController.isDistractionFree) {
      this.uiController.exitDistractionFree();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  handleMouseWheelShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const currentMode = this.modeController.getCurrentMode();
    
    // Font size and zoom controls
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        if (currentMode === 'code') {
          this.toolbarComponent.changeFontSize(2);
        } else if (currentMode === 'preview' || currentMode === 'split') {
          this.toolbarComponent.changeZoom(0.1);
        }
      } else if (e.deltaY > 0) {
        if (currentMode === 'code') {
          this.toolbarComponent.changeFontSize(-2);
        } else if (currentMode === 'preview' || currentMode === 'split') {
          this.toolbarComponent.changeZoom(-0.1);
        }
      }
      return;
    }
    
    // Mode switching (original behavior)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      const modes = ['code', 'preview', 'split'];
      const currentIndex = modes.indexOf(currentMode);
      
      if (e.deltaY < 0) {
        const nextIndex = (currentIndex + 1) % modes.length;
        this.modeController.setMode(modes[nextIndex]);
      } else if (e.deltaY > 0) {
        const prevIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
        this.modeController.setMode(modes[prevIndex]);
      }
      return;
    }
    
    const useAltKey = e.altKey || (isMac && e.metaKey && !e.ctrlKey);
    if (useAltKey && this.tabManager.hasTabs()) {
      e.preventDefault();
      
      if (e.deltaY < 0) {
        this.actions.switchToPreviousTab();
      } else if (e.deltaY > 0) {
        this.actions.switchToNextTab();
      }
      return;
    }
  }

  onDestroy() {
    document.removeEventListener('keydown', this.boundKeydownHandler, true);
    document.removeEventListener('wheel', this.boundWheelHandler);

    this.documentComponent = null;
    this.fileController = null;
    this.uiController = null;
    this.tabManager = null;
    this.modeController = null;
    this.toolbarComponent = null;
    this.markdownActionController = null;
    this.pluginModalController = null;
    this.tabUIController = null;
    this.exportController = null;
    this.performanceOptimizer = null;
    this.actions = {};
  }


}

window.KeyboardController = KeyboardController;
