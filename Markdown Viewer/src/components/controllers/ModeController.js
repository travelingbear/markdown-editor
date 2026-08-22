/**
 * ModeController - Handles mode switching and layout management
 */
class ModeController extends BaseComponent {
  constructor() {
    super('ModeController');
    
    this.currentMode = 'welcome';
    this.lastModeSwitchTime = 0;
    
    // Dependencies (injected)
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.settingsController = null;
    this.tabManager = null;
    this.scrollCoordinator = null;
  }

  setDependencies(editorComponent, previewComponent, toolbarComponent, settingsController, tabManager) {
    this.editorComponent = editorComponent;
    this.previewComponent = previewComponent;
    this.toolbarComponent = toolbarComponent;
    this.settingsController = settingsController;
    this.tabManager = tabManager;
  }

  setScrollCoordinator(scrollCoordinator) {
    this.scrollCoordinator = scrollCoordinator;
  }

  getCurrentMode() {
    return this.currentMode;
  }

  isWelcomeMode() {
    return this.currentMode === 'welcome';
  }

  hasActiveDocument() {
    return Boolean(
      this.toolbarComponent?.hasDocument &&
      this.tabManager?.getActiveTab()
    );
  }

  enterWelcomeMode() {
    this.currentMode = 'welcome';

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add('welcome-mode');
    }

    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add('welcome-mode');

    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const splitter = document.getElementById('splitter');
    if (editorPane && previewPane && splitter) {
      editorPane.style.setProperty('display', 'none', 'important');
      previewPane.style.setProperty('display', 'block', 'important');
      previewPane.style.setProperty('visibility', 'visible', 'important');
      splitter.style.setProperty('display', 'none', 'important');
    }

    this.previewComponent?.showWelcome();
    this.toolbarComponent?.emit('mode-changed', { mode: 'welcome' });
    this.settingsController?.updateSystemInfo(
      this.editorComponent,
      this.previewComponent,
      'welcome'
    );
    this.emit('mode-changed', { mode: 'welcome' });
  }

  async setMode(mode) {
    if (!['code', 'preview', 'split'].includes(mode)) return false;
    if (!this.hasActiveDocument()) return false;
    if (this.currentMode === mode) return true;
    
    const startTime = performance.now();
    
    // Save current scroll position to active tab
    if (this.tabManager) {
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.scrollCoordinator?.capture(activeTab, this.currentMode);
      }
    }
    
    // Load the configured editor engine lazily when switching to code or split mode.
    if ((mode === 'code' || mode === 'split') && !this.editorComponent.isEditorReady()) {
      try {
        await this.editorComponent.loadEditor();
      } catch (error) {
        console.error('[ModeController] Failed to load editor:', error);
        this.editorComponent.fallbackToTextarea();
      }
    }
    
    this.currentMode = mode;
    
    // Update main content class
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('welcome-mode', 'code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add(`${mode}-mode`);
    }
    
    // Update body class for CSS selectors
    document.body.classList.remove('welcome-mode', 'code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add(`${mode}-mode`);

    if (mode === 'preview' || mode === 'split') {
      this.previewComponent.showPreview();
    }
    
    // Show/hide appropriate panes based on mode
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const splitter = document.getElementById('splitter');
    

    
    if (editorPane && previewPane && splitter) {
      // Immediately reset all displays to prevent dual pane issues
      editorPane.style.display = 'none';
      previewPane.style.display = 'none';
      splitter.style.display = 'none';
      
      // Force a reflow to ensure the reset takes effect
      editorPane.offsetHeight;
      previewPane.offsetHeight;
      
      // Apply mode-specific display settings with !important to override any CSS conflicts
      switch (mode) {
        case 'code':
          editorPane.style.setProperty('display', 'flex', 'important');
          editorPane.style.setProperty('visibility', 'visible', 'important');
          break;
        case 'preview':
          previewPane.style.setProperty('display', 'block', 'important');
          previewPane.style.setProperty('visibility', 'visible', 'important');
          break;
        case 'split':
          editorPane.style.setProperty('display', 'flex', 'important');
          editorPane.style.setProperty('visibility', 'visible', 'important');
          previewPane.style.setProperty('display', 'block', 'important');
          previewPane.style.setProperty('visibility', 'visible', 'important');
          splitter.style.setProperty('display', 'block', 'important');
          break;
      }
      

      
      // Recalculate the editor layout after display changes.
      const editor = this.editorComponent.getEditorAdapter();
      if (editor) {
        setTimeout(() => {
          editor.layout();
        }, 50);
      }
    }
    
    // Notify toolbar component
    if (this.toolbarComponent) {
      this.toolbarComponent.emit('mode-changed', { mode });
    }
    
    // Update system info with new mode
    if (this.settingsController) {
      this.settingsController.updateSystemInfo(this.editorComponent, this.previewComponent, this.currentMode);
    }
    
    this.scrollCoordinator?.scheduleActiveRestore(100, mode);
    
    this.lastModeSwitchTime = performance.now() - startTime;
    if (this.settingsController) {
      this.settingsController.setLastModeSwitchTime(this.lastModeSwitchTime);
    }
    
    // Emit mode change event
    this.emit('mode-changed', { mode });
    return true;
  }
  
  // Mode switching shortcuts
  switchToCodeMode() {
    this.setMode('code');
  }

  switchToPreviewMode() {
    this.setMode('preview');
  }

  switchToSplitMode() {
    this.setMode('split');
  }

  // Cycle through modes
  cycleMode(direction = 1) {
    const modes = ['code', 'preview', 'split'];
    const currentIndex = modes.indexOf(this.currentMode);
    
    let nextIndex;
    if (direction > 0) {
      nextIndex = (currentIndex + 1) % modes.length;
    } else {
      nextIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
    }
    
    this.setMode(modes[nextIndex]);
  }
}

window.ModeController = ModeController;
