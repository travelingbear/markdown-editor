/**
 * ModeController - Handles mode switching and layout management
 */
class ModeController extends BaseComponent {
  constructor() {
    super('ModeController');
    
    this.currentMode = null;
    this.lastModeSwitchTime = 0;
    
    // Dependencies (injected)
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.settingsController = null;
    this.tabManager = null;
  }

  setDependencies(editorComponent, previewComponent, toolbarComponent, settingsController, tabManager) {
    this.editorComponent = editorComponent;
    this.previewComponent = previewComponent;
    this.toolbarComponent = toolbarComponent;
    this.settingsController = settingsController;
    this.tabManager = tabManager;
  }

  getCurrentMode() {
    return this.currentMode;
  }

  async setMode(mode) {
    if (this.currentMode === mode) return;
    
    const startTime = performance.now();
    
    // Check if we have tabs or document content for code/split modes
    const hasContent = this.tabManager && this.tabManager.hasTabs();
    if (!hasContent && (mode === 'code' || mode === 'split')) {
      return;
    }
    
    // Save current scroll position to active tab
    if (this.tabManager) {
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.saveScrollPositionToTab(activeTab);
      }
    }
    
    // Load Monaco Editor lazily when switching to code or split mode
    if ((mode === 'code' || mode === 'split') && !this.editorComponent.isMonacoLoaded) {
      try {
        await this.editorComponent.loadMonacoEditor();
      } catch (error) {
        console.error('[ModeController] Failed to load Monaco Editor:', error);
        this.editorComponent.fallbackToTextarea();
      }
    }
    
    this.currentMode = mode;
    
    // Update main content class
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add(`${mode}-mode`);
    }
    
    // Update body class for CSS selectors
    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add(`${mode}-mode`);
    
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
      

      
      // Trigger Monaco layout after display changes
      if (this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
        setTimeout(() => {
          this.editorComponent.monacoEditor.layout();
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
    
    // Restore scroll position after layout
    setTimeout(() => {
      if (this.tabManager) {
        const activeTab = this.tabManager.getActiveTab();
        if (activeTab) {
          this.restoreScrollPositionFromTab(activeTab);
        }
      }
    }, 100);
    
    this.lastModeSwitchTime = performance.now() - startTime;
    if (this.settingsController) {
      this.settingsController.setLastModeSwitchTime(this.lastModeSwitchTime);
    }
    
    // Emit mode change event
    this.emit('mode-changed', { mode });
  }
  
  saveScrollPositionToTab(tab) {
    if (!this.tabManager) return;
    
    const editor = this.editorComponent && this.editorComponent.monacoEditor;
    const previewPane = document.querySelector('.preview-pane');
    
    if (editor) {
      const viewState = editor.saveViewState();
      this.tabManager.saveTabEditorState(tab.id, viewState);
    }
    
    if (previewPane) {
      this.tabManager.updateTabScroll(tab.id, null, previewPane.scrollTop);
    }
  }
  
  restoreScrollPositionFromTab(tab) {
    const editor = this.editorComponent && this.editorComponent.monacoEditor;
    const previewPane = document.querySelector('.preview-pane');
    
    if ((this.currentMode === 'code' || this.currentMode === 'split') && editor && tab.editorViewState) {
      editor.restoreViewState(tab.editorViewState);
    }
    
    if ((this.currentMode === 'preview' || this.currentMode === 'split') && previewPane && tab.scrollPosition?.preview) {
      previewPane.scrollTop = tab.scrollPosition.preview;
    }
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