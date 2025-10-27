/**
 * Document Component
 * Manages single document state and operations
 */
class DocumentComponent extends BaseComponent {
  constructor(options = {}) {
    super('DocumentComponent', options);
    
    // Document state
    this.currentFile = null;
    this.content = '';
    this.isDirty = false;
    this.isLoading = false;
    
    // File history
    this.fileHistory = JSON.parse(localStorage.getItem('markdownViewer_fileHistory') || '[]');
  }

  async onInit() {
    // Initialize document state
    this.content = '';
    this.isDirty = false;
    this.isLoading = false;
    
    // Set up event listeners for file operations
    this.setupEventListeners();
    
    // Initialize file history display
    this.updateFileHistoryDisplay();
    
    // Set up file watching
    this.setupFileWatcher();
  }

  setupEventListeners() {
    // Listen for content changes from editor
    this.on('content-changed', (data) => {
      this.handleContentChange(data.content);
    });
    
    // Listen for file operations
    this.on('file-open-requested', (data) => {
      this.openFile(data.filePath);
    });
    
    this.on('file-save-requested', () => {
      this.saveFile();
    });
    
    this.on('file-close-requested', () => {
      this.closeFile();
    });
  }

  /**
   * Handle content changes from editor
   */
  handleContentChange(newContent) {
    if (this.content !== newContent && !this.isLoading) {
      this.content = newContent;
      this.markDirty();
      this.emit('document-changed', { 
        content: this.content, 
        isDirty: this.isDirty 
      });
    }
  }

  /**
   * Mark document as dirty (unsaved changes)
   */
  markDirty() {
    if (!this.isDirty && !this.isLoading) {
      this.isDirty = true;
      this.emit('document-dirty-changed', { isDirty: true });
    }
  }

  /**
   * Mark document as clean (saved)
   */
  markClean() {
    if (this.isDirty) {
      this.isDirty = false;
      this.emit('document-dirty-changed', { isDirty: false });
    }
  }

  /**
   * Open a file
   */
  async openFile(filePath = null) {
    try {
      this.isLoading = true;
      this.emit('document-loading', { isLoading: true });

      let selectedFile = filePath;
      
      if (!selectedFile && window.__TAURI__) {
        selectedFile = await window.__TAURI__.dialog.open({
          multiple: true,
          filters: [{
            name: 'Markdown',
            extensions: ['md', 'markdown']
          }]
        });
      }

      if (selectedFile) {
        const files = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
        
        for (const file of files) {
          const content = await this.readFile(file);
          
          this.addToFileHistory(file);
          
          this.emit('document-opened', {
            filePath: file,
            content: content,
            fileName: this.getFilenameFromPath(file)
          });
        }
      }
    } catch (error) {
      this.emit('document-error', { 
        type: 'open', 
        error: error.message 
      });
      throw error;
    } finally {
      this.isLoading = false;
      this.emit('document-loading', { isLoading: false });
    }
  }

  /**
   * Save the current file
   */
  async saveFile() {
    try {
      if (this.currentFile) {
        await this.writeFile(this.currentFile, this.content);
        this.markClean();
        this.emit('document-saved', { 
          filePath: this.currentFile 
        });
      } else {
        await this.saveAsFile();
      }
    } catch (error) {
      this.emit('document-error', { 
        type: 'save', 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save as new file
   */
  async saveAsFile() {
    try {
      if (!window.__TAURI__) {
        throw new Error('Save functionality requires Tauri');
      }

      // Extract first title from content as suggested filename
      const suggestedName = this.extractFirstTitle(this.content);
      
      const filePath = await window.__TAURI__.dialog.save({
        defaultPath: suggestedName ? `${suggestedName}.md` : undefined,
        filters: [{
          name: 'Markdown',
          extensions: ['md']
        }]
      });

      if (filePath) {
        await this.writeFile(filePath, this.content);
        this.currentFile = filePath;
        this.markClean();
        this.addToFileHistory(filePath);
        
        this.emit('document-saved', { 
          filePath: this.currentFile 
        });
      }
    } catch (error) {
      this.emit('document-error', { 
        type: 'save-as', 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Close the current file
   */
  async closeFile() {
    try {
      if (this.isDirty) {
        const shouldClose = await this.handleUnsavedChanges();
        if (!shouldClose) {
          return false;
        }
      }

      this.currentFile = null;
      this.content = '';
      this.markClean();
      
      this.emit('document-closed');
      return true;
    } catch (error) {
      this.emit('document-error', { 
        type: 'close', 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Create new document
   */
  newDocument() {
    try {
      this.currentFile = null;
      this.content = '';
      this.markClean();
      
      this.emit('document-new', { 
        content: this.content 
      });
    } catch (error) {
      this.emit('document-error', { 
        type: 'new', 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Handle unsaved changes dialog
   */
  async handleUnsavedChanges() {
    try {
      if (window.__TAURI__) {
        return await window.__TAURI__.dialog.confirm(
          'Close without saving changes?',
          { title: 'Unsaved Changes' }
        );
      }
      return confirm('Close without saving changes?');
    } catch (error) {
      return false;
    }
  }

  /**
   * Read file content
   */
  async readFile(filePath) {
    if (window.__TAURI__) {
      return await window.__TAURI__.fs.readTextFile(filePath);
    }
    throw new Error('File reading requires Tauri');
  }

  /**
   * Write file content
   */
  async writeFile(filePath, content) {
    if (window.__TAURI__) {
      return await window.__TAURI__.fs.writeTextFile(filePath, content);
    }
    throw new Error('File writing requires Tauri');
  }

  /**
   * Add file to history
   */
  addToFileHistory(filePath) {
    if (!filePath) return;
    
    // Remove if already exists
    this.fileHistory = this.fileHistory.filter(item => item.path !== filePath);
    
    // Add to beginning
    this.fileHistory.unshift({
      path: filePath,
      name: this.getFilenameFromPath(filePath),
      date: new Date().toISOString()
    });
    
    // Keep only last 3
    this.fileHistory = this.fileHistory.slice(0, 3);
    
    // Save to localStorage
    localStorage.setItem('markdownViewer_fileHistory', JSON.stringify(this.fileHistory));
    
    // Update the file history display immediately
    this.updateFileHistoryDisplay();
    
    this.emit('file-history-updated', { 
      history: this.fileHistory 
    });
  }

  /**
   * Get filename from path
   */
  getFilenameFromPath(filePath) {
    return filePath.split(/[\\/]/).pop();
  }

  /**
   * Extract first title from markdown content
   */
  extractFirstTitle(content) {
    if (!content) return null;
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        // Extract title text and clean it for filename
        const title = trimmed.replace(/^#+\s*/, '').trim();
        if (title) {
          // Clean filename: remove invalid characters
          return title.replace(/[<>:"/\\|?*]/g, '').substring(0, 50);
        }
      }
    }
    return null;
  }

  /**
   * Get current document state
   */
  getDocumentState() {
    return {
      currentFile: this.currentFile,
      content: this.content,
      isDirty: this.isDirty,
      isLoading: this.isLoading,
      fileName: this.currentFile ? this.getFilenameFromPath(this.currentFile) : null,
      hasDocument: !!this.currentFile || !!this.content
    };
  }

  /**
   * Set content programmatically
   */
  setContent(content) {
    this.isLoading = true;
    this.content = content;
    this.isLoading = false;
    
    this.emit('document-content-set', { 
      content: this.content 
    });
  }

  /**
   * Update file history display in welcome page
   */
  updateFileHistoryDisplay() {
    const fileHistorySection = document.getElementById('file-history-section');
    const fileHistoryList = document.getElementById('file-history-list');
    
    if (!fileHistorySection || !fileHistoryList) return;
    
    if (this.fileHistory.length === 0) {
      fileHistorySection.style.display = 'none';
      return;
    }
    
    fileHistorySection.style.display = 'block';
    fileHistoryList.innerHTML = '';
    
    this.fileHistory.forEach(file => {
      const item = document.createElement('div');
      item.className = 'file-history-item';
      item.innerHTML = `
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-path">${file.path}</div>
        </div>
        <div class="file-date">${this.formatDate(file.date)}</div>
      `;
      
      item.addEventListener('click', () => {
        this.openFile(file.path);
      });
      
      fileHistoryList.appendChild(item);
    });
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  setupFileWatcher() {
    // File watcher disabled to prevent cursor jumping issues
    // this.fileWatchInterval = setInterval(() => {
    //   if (this.currentFile && !this.isDirty) {
    //     this.checkForExternalChanges();
    //   }
    // }, 2000);
  }
  
  async checkForExternalChanges() {
    if (!this.currentFile || this.isDirty) return;
    
    try {
      const newContent = await this.readFile(this.currentFile);
      if (newContent !== this.content) {
        this.isLoading = true;
        this.content = newContent;
        this.markClean();
        this.emit('document-content-updated', { content: this.content });
        this.isLoading = false;
      }
    } catch (error) {
      // File might be deleted or inaccessible
    }
  }

  onDestroy() {
    // Clean up file watcher
    if (this.fileWatchInterval) {
      clearInterval(this.fileWatchInterval);
    }
    
    // Clean up any resources
    this.currentFile = null;
    this.content = '';
    this.isDirty = false;
    this.isLoading = false;
  }
}

// Export for use in other components
window.DocumentComponent = DocumentComponent;