/**
 * File Controller
 * Handles all file operations for the markdown editor
 */
class FileController extends BaseComponent {
  constructor(options = {}) {
    super('FileController', options);
    
    // File operation state
    this.performanceOptimizer = null;
  }

  async onInit() {
    // Initialize performance optimizer reference
    this.performanceOptimizer = window.PerformanceOptimizer ? new window.PerformanceOptimizer() : null;
    
    // Set up extension points
    this.setupExtensionPoints();
  }

  setupExtensionPoints() {
    // File operation extension points
    this.addHook('beforeNewFile', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.beforeNewFile) {
          await ext.instance.beforeNewFile(data);
        }
      }
    });

    this.addHook('afterNewFile', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.afterNewFile) {
          await ext.instance.afterNewFile(data);
        }
      }
    });

    this.addHook('beforeOpenFile', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.beforeOpenFile) {
          await ext.instance.beforeOpenFile(data);
        }
      }
    });

    this.addHook('afterOpenFile', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.afterOpenFile) {
          await ext.instance.afterOpenFile(data);
        }
      }
    });

    this.addHook('beforeSaveFile', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.beforeSaveFile) {
          await ext.instance.beforeSaveFile(data);
        }
      }
    });

    this.addHook('afterSaveFile', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.afterSaveFile) {
          await ext.instance.afterSaveFile(data);
        }
      }
    });
  }

  setPerformanceOptimizer(optimizer) {
    this.performanceOptimizer = optimizer;
  }

  // Extension API methods
  addFileExtension(name, extension) {
    this.registerExtension(name, extension);
    if (extension.activate) {
      this.extensionAPI.activate(name);
    }
  }

  removeFileExtension(name) {
    return this.unregisterExtension(name);
  }

  async newFile(documentComponent, tabManager) {
    const startTime = performance.now();
    
    await this.executeHook('beforeNewFile', { documentComponent, tabManager });
    
    // Check tab limits for performance - warn at 45, block at 50
    const currentTabCount = tabManager.getTabsCount();
    if (this.performanceOptimizer && currentTabCount >= 45) {
      if (currentTabCount >= 50) {
        alert(`Maximum tab limit reached (${currentTabCount}/50). Please close some tabs before creating new ones.`);
        return;
      } else if (currentTabCount >= 45) {
        console.warn(`[FileController] Approaching tab limit: ${currentTabCount}/50 tabs open`);
        alert(`Warning: You have ${currentTabCount} tabs open. Consider closing some tabs for better performance.`);
      }
    }
    
    // Create new document through DocumentComponent to trigger proper events
    documentComponent.newDocument();
    
    // Track tab creation performance
    if (this.performanceOptimizer) {
      this.performanceOptimizer.benchmarkTabOperation('Tab Create', startTime, currentTabCount + 1);
    }

    await this.executeHook('afterNewFile', { documentComponent, tabManager });
    this.emit('file-new-completed');
  }

  async openFile(documentComponent, tabManager, filePath = null) {
    await this.executeHook('beforeOpenFile', { documentComponent, tabManager });
    
    // Check tab limits before opening - warn at 45, block at 50
    const currentTabCount = tabManager.getTabsCount();
    if (this.performanceOptimizer && currentTabCount >= 45) {
      if (currentTabCount >= 50) {
        alert(`Maximum tab limit reached (${currentTabCount}/50). Please close some tabs before opening more files.`);
        return;
      } else if (currentTabCount >= 45) {
        console.warn(`[FileController] Approaching tab limit: ${currentTabCount}/50 tabs open`);
        alert(`Warning: You have ${currentTabCount} tabs open. Consider closing some tabs for better performance.`);
      }
    }
    
    const startTime = performance.now();
    await documentComponent.openFile(filePath);
    
    // Track file open performance only if file was actually opened
    if (this.performanceOptimizer && tabManager.getTabsCount() > currentTabCount) {
      this.performanceOptimizer.benchmarkTabOperation('File Open', startTime, currentTabCount + 1);
    }

    await this.executeHook('afterOpenFile', { documentComponent, tabManager });
    this.emit('file-open-completed');
  }

  async saveFile(documentComponent, tabManager) {
    const activeTab = tabManager.getActiveTab();
    if (activeTab) {
      await this.executeHook('beforeSaveFile', { documentComponent, tabManager, activeTab });
      
      // Update document component with active tab content
      documentComponent.currentFile = activeTab.filePath;
      documentComponent.content = activeTab.content;
      documentComponent.isDirty = activeTab.isDirty;
      
      try {
        await documentComponent.saveFile();
        tabManager.markTabSaved(activeTab.id, documentComponent.currentFile);
        await this.executeHook('afterSaveFile', { documentComponent, tabManager, activeTab });
        this.emit('file-save-completed', { filePath: documentComponent.currentFile });
      } catch (error) {
        this.emit('file-error', { error, type: 'Save' });
      }
    }
  }

  async saveAsFile(documentComponent, tabManager) {
    const activeTab = tabManager.getActiveTab();
    if (activeTab) {
      // Update document component with active tab content
      documentComponent.currentFile = activeTab.filePath;
      documentComponent.content = activeTab.content;
      documentComponent.isDirty = activeTab.isDirty;
      
      try {
        await documentComponent.saveAsFile();
        tabManager.markTabSaved(activeTab.id, documentComponent.currentFile);
        this.emit('file-save-as-completed', { filePath: documentComponent.currentFile });
      } catch (error) {
        this.emit('file-error', { error, type: 'Save As' });
      }
    }
  }

  async closeFile(documentComponent, tabManager, performanceOptimizer) {
    const activeTab = tabManager.getActiveTab();
    if (activeTab) {
      // Check for unsaved changes first, before animation
      if (activeTab.isDirty) {
        const shouldClose = await tabManager.confirmCloseUnsaved(activeTab);
        if (!shouldClose) return;
      }
      
      // Add close animation only after confirmation
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.animation = 'fadeOut 0.2s ease-out';
        await new Promise(resolve => setTimeout(resolve, 200));
        mainContent.style.animation = '';
      }
      
      // Clean up performance tracking for closed tab
      if (performanceOptimizer) {
        performanceOptimizer.cleanupTabTracking(activeTab.id);
      }
      
      // Remove tab without additional confirmation since we already confirmed
      tabManager.tabCollection.removeTab(activeTab.id);
      this.emit('file-close-completed');
    }
  }

  async reloadCurrentFile(documentComponent, tabManager, editorComponent, previewComponent) {
    const activeTab = tabManager.getActiveTab();
    if (activeTab && activeTab.filePath) {
      try {
        const newContent = await documentComponent.readFile(activeTab.filePath);
        if (newContent !== activeTab.content) {
          activeTab.setContent(newContent);
          editorComponent.emit('set-content', { content: newContent });
          previewComponent.emit('update-preview', { 
            content: newContent,
            filePath: activeTab.filePath 
          });
          documentComponent.content = newContent;
          documentComponent.markClean();
        }
        this.emit('file-reload-completed');
      } catch (error) {
        this.emit('file-error', { error, type: 'Reload' });
      }
    }
  }

  async checkStartupFile(documentComponent) {
    try {
      if (window.__TAURI__?.core?.invoke) {
        const startupFile = await window.__TAURI__.core.invoke('get_startup_file');
        
        if (startupFile && typeof startupFile === 'string' && startupFile.trim()) {
          await documentComponent.openFile(startupFile);
          
          try {
            await window.__TAURI__.core.invoke('clear_startup_file');
          } catch (clearError) {
            console.warn('[FileController] Failed to clear startup file:', clearError);
          }
          return true;
        }
      }
    } catch (error) {
      console.error('[FileController] Error checking startup file:', error);
    }
    
    return false;
  }

  clearFileHistory(documentComponent) {
    documentComponent.fileHistory = [];
    localStorage.removeItem('markdownViewer_fileHistory');
    documentComponent.updateFileHistoryDisplay();
    this.emit('file-history-cleared');
  }
}

// Export for use in other components
window.FileController = FileController;