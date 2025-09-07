/**
 * TabManager - Orchestrates multiple documents and tab operations
 */
class TabManager extends BaseComponent {
  constructor() {
    super('TabManager');
    this.tabCollection = new TabCollection();
    this.persistenceKey = 'markdownViewer_tabs';
    this.setupEventHandlers();
  }

  async onInit() {
    // Load persisted tabs
    this.loadPersistedTabs();
  }

  setupEventHandlers() {
    // Tab collection events
    this.tabCollection.on('tab-created', (data) => {
      this.emit('tab-created', data);
      this.persistTabs();
    });

    this.tabCollection.on('tab-removed', (data) => {
      this.emit('tab-removed', data);
      this.persistTabs();
    });

    this.tabCollection.on('tab-activated', (data) => {
      this.emit('tab-activated', data);
      this.persistTabs();
    });
    


    this.tabCollection.on('all-tabs-closed', (data) => {
      this.emit('all-tabs-closed', data);
      this.persistTabs();
    });
  }

  // Create new tab
  createNewTab(content = '# New Document\n\nStart writing your markdown here...') {
    try {
      const tab = this.tabCollection.createTab({
        content,
        fileName: 'untitled.md'
      });
      return tab;
    } catch (error) {
      this.emit('error', { error: error.message, context: 'create-tab' });
      return null;
    }
  }

  // Open file in new tab
  async openFileInTab(filePath, content) {
    try {
      // Check if file is already open
      const existingTab = this.tabCollection.findTabByPath(filePath);
      if (existingTab) {
        this.tabCollection.setActiveTab(existingTab.id);
        return existingTab;
      }

      // Create new tab
      const fileName = filePath.split(/[/\\]/).pop() || 'untitled.md';
      const tab = this.tabCollection.createTab({
        fileName,
        filePath,
        content,
        isDirty: false
      });

      return tab;
    } catch (error) {
      this.emit('error', { error: error.message, context: 'open-file' });
      return null;
    }
  }

  // Close tab with unsaved changes check
  async closeTab(tabId) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    // Check for unsaved changes
    if (tab.isDirty) {
      const shouldClose = await this.confirmCloseUnsaved(tab);
      if (!shouldClose) return false;
    }

    return this.tabCollection.removeTab(tabId);
  }

  // Switch to tab
  switchToTab(tabId) {
    return this.tabCollection.setActiveTab(tabId);
  }

  // Update tab content
  updateTabContent(tabId, content) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    tab.setContent(content);
    this.persistTabs();
    this.emit('tab-content-updated', { tab });
    return true;
  }

  // Mark tab as saved
  markTabSaved(tabId, filePath = null) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    tab.markSaved(filePath);
    this.persistTabs();
    this.emit('tab-saved', { tab });
    return true;
  }

  // Update tab cursor position
  updateTabCursor(tabId, line, col) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    tab.setCursorPosition(line, col);
    return true;
  }

  // Save Monaco Editor view state
  saveTabEditorState(tabId, viewState) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    tab.setEditorViewState(viewState);
    return true;
  }

  // Update tab scroll position
  updateTabScroll(tabId, editor = null, preview = null) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    if (editor !== null) {
      tab.scrollPosition.editor = editor;
    }
    if (preview !== null) {
      tab.scrollPosition.preview = preview;
    }
    return true;
  }

  // Get active tab
  getActiveTab() {
    return this.tabCollection.getActiveTab();
  }

  // Get all tabs
  getAllTabs() {
    return this.tabCollection.getAllTabs();
  }

  // Get tabs count
  getTabsCount() {
    return this.tabCollection.getTabsCount();
  }

  // Check if has tabs
  hasTabs() {
    return this.tabCollection.hasTabs();
  }

  // Get dirty tabs
  getDirtyTabs() {
    return this.tabCollection.getDirtyTabs();
  }


  
  // Move tab to front for dropdown priority
  moveTabToFront(tabId) {
    return this.tabCollection.moveNewTabToFront(tabId);
  }
  
  // Move tab to specific position
  moveTabToPosition(tabId, targetIndex) {
    return this.tabCollection.moveTabToPosition(tabId, targetIndex);
  }
  
  // Get tab by ID
  getTab(tabId) {
    return this.tabCollection.getTab(tabId);
  }

  // Close all tabs
  async closeAllTabs() {
    const dirtyTabs = this.getDirtyTabs();
    if (dirtyTabs.length > 0) {
      const shouldClose = await this.confirmCloseAllUnsaved(dirtyTabs);
      if (!shouldClose) return false;
    }

    this.tabCollection.closeAllTabs();
    return true;
  }

  // Persist tabs to localStorage
  persistTabs() {
    try {
      const data = this.tabCollection.toJSON();
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[TabManager] Failed to persist tabs:', error);
    }
  }

  // Load persisted tabs
  loadPersistedTabs() {
    try {
      const data = localStorage.getItem(this.persistenceKey);
      if (!data) return;

      const parsedData = JSON.parse(data);
      this.tabCollection.fromJSON(parsedData);

      // Emit event for each restored tab
      this.tabCollection.getAllTabs().forEach(tab => {
        this.emit('tab-restored', { tab });
      });

      if (this.tabCollection.hasTabs()) {
        const activeTab = this.tabCollection.getActiveTab();
        if (activeTab) {
          this.emit('tab-activated', { tab: activeTab });
        }
      }
    } catch (error) {
      console.warn('[TabManager] Failed to load persisted tabs:', error);
      localStorage.removeItem(this.persistenceKey);
    }
  }

  // Clear persisted tabs
  clearPersistedTabs() {
    localStorage.removeItem(this.persistenceKey);
  }

  // Confirm close unsaved tab
  async confirmCloseUnsaved(tab) {
    try {
      if (window.__TAURI__?.dialog) {
        return await window.__TAURI__.dialog.confirm(
          `Close "${tab.fileName}" without saving changes?`,
          { title: 'Unsaved Changes' }
        );
      }
      return confirm(`Close "${tab.fileName}" without saving changes?`);
    } catch (error) {
      return false;
    }
  }

  // Confirm close all unsaved tabs
  async confirmCloseAllUnsaved(dirtyTabs) {
    try {
      const fileNames = dirtyTabs.map(tab => tab.fileName).join(', ');
      const message = `Close ${dirtyTabs.length} unsaved file(s) (${fileNames}) without saving?`;
      
      if (window.__TAURI__?.dialog) {
        return await window.__TAURI__.dialog.confirm(message, { title: 'Unsaved Changes' });
      }
      return confirm(message);
    } catch (error) {
      return false;
    }
  }

  onDestroy() {
    this.persistTabs();
    if (this.tabCollection) {
      this.tabCollection.destroy();
    }
  }
}

window.TabManager = TabManager;