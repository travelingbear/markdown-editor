import { showUnsavedChangesDialog } from './unsavedChangesDialog.js';

/**
 * TabManager - Orchestrates multiple documents and tab operations
 */
class TabManager extends BaseComponent {
  constructor() {
    super('TabManager');
    this.tabCollection = new TabCollection();
    this.persistenceKey = 'markdownViewer_tabs';
    this.batchUpdateDepth = 0;
    this.batchCreatedTabs = [];
    this.batchActivatedTab = null;
    this.setupEventHandlers();
  }

  async onInit() {
    // Load persisted tabs
    this.loadPersistedTabs();
  }

  setupEventHandlers() {
    // Tab collection events
    this.tabCollection.on('tab-created', (data) => {
      if (this.isBatchUpdating()) {
        this.batchCreatedTabs.push(data.tab);
        return;
      }
      this.emit('tab-created', data);
      this.persistTabs();
    });

    this.tabCollection.on('tab-removed', (data) => {
      this.emit('tab-removed', data);
      this.persistTabs();
    });

    this.tabCollection.on('tab-activated', (data) => {
      if (this.isBatchUpdating()) {
        this.batchActivatedTab = data.tab;
        return;
      }
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
  async openFileInTab(filePath, content, { activate = true } = {}) {
    try {
      // Check if file is already open
      const existingTab = this.tabCollection.findTabByPath(filePath);
      if (existingTab) {
        if (activate) this.tabCollection.setActiveTab(existingTab.id);
        return existingTab;
      }

      // Create new tab
      const fileName = filePath.split(/[/\\]/).pop() || 'untitled.md';
      const tab = this.tabCollection.createTab({
        fileName,
        filePath,
        content,
        isDirty: false,
        activate
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
    if (tab.hasUnsavedChanges()) {
      const shouldClose = await this.confirmCloseUnsaved(tab);
      if (!shouldClose) return false;
    }

    return this.tabCollection.removeTab(tabId);
  }

  // Switch to tab
  switchToTab(tabId) {
    return this.tabCollection.setActiveTab(tabId);
  }

  beginBatchUpdate() {
    this.batchUpdateDepth++;
  }

  endBatchUpdate() {
    if (this.batchUpdateDepth === 0) return;
    this.batchUpdateDepth--;
    if (this.batchUpdateDepth > 0) return;

    const createdTabs = this.batchCreatedTabs.splice(0);
    const activatedTab = this.batchActivatedTab;
    this.batchActivatedTab = null;
    this.persistTabs();

    if (activatedTab) this.emit('tab-activated', { tab: activatedTab });
    if (createdTabs.length > 0) this.emit('tabs-batch-created', { tabs: createdTabs });
  }

  isBatchUpdating() {
    return this.batchUpdateDepth > 0;
  }

  // Internal removal after a caller has completed any required confirmation.
  removeTab(tabId) {
    return this.tabCollection.removeTab(tabId);
  }

  findTabByPath(filePath) {
    return this.tabCollection.findTabByPath(filePath);
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

  // Save editor view state through the active adapter.
  saveTabEditorState(tabId, viewState) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    tab.setEditorViewState(viewState);
    return true;
  }

  // Update tab scroll position
  updateTabScroll(tabId, editor = null, preview = null, ratio = null, source = null) {
    const tab = this.tabCollection.getTab(tabId);
    if (!tab) return false;

    tab.setScrollPosition(editor, preview, ratio, source);
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
    const moved = this.tabCollection.moveTabToPosition(tabId, targetIndex);
    if (moved) {
      this.persistTabs();
      this.emit('tab-reordered', { tabId, targetIndex });
    }
    return moved;
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

      // Clear active tab to prevent auto-loading
      this.tabCollection.activeTabId = null;
      this.tabCollection.getAllTabs().forEach((tab) => tab.setActive(false));

      // Emit event for each restored tab
      this.tabCollection.getAllTabs().forEach(tab => {
        this.emit('tab-restored', { tab });
      });
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
      return await showUnsavedChangesDialog([tab.fileName]);
    } catch (error) {
      return false;
    }
  }

  // Confirm close all unsaved tabs
  async confirmCloseAllUnsaved(dirtyTabs) {
    try {
      return await showUnsavedChangesDialog(dirtyTabs.map(tab => tab.fileName));
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
