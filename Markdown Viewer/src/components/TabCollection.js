/**
 * TabCollection - Manages array of tabs and operations
 */
class TabCollection extends BaseComponent {
  constructor() {
    super('TabCollection');
    this.tabs = [];
    this.activeTabId = null;
    this.nextTabId = 1;
    this.maxTabs = 50;
  }

  // Create new tab
  createTab(options = {}) {
    if (this.tabs.length >= this.maxTabs) {
      throw new Error(`Maximum ${this.maxTabs} tabs allowed`);
    }

    const id = `tab-${this.nextTabId++}`;
    const tab = new TabState(id, options);
    
    this.tabs.push(tab);
    this.setActiveTab(id);
    
    this.emit('tab-created', { tab });
    return tab;
  }

  // Remove tab
  removeTab(tabId) {
    const index = this.tabs.findIndex(tab => tab.id === tabId);
    if (index === -1) return false;

    const tab = this.tabs[index];
    this.tabs.splice(index, 1);

    // If removing active tab, activate another
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        // Activate next tab or previous if last
        const newIndex = Math.min(index, this.tabs.length - 1);
        this.setActiveTab(this.tabs[newIndex].id);
      } else {
        this.activeTabId = null;
      }
    }

    this.emit('tab-removed', { tab, index });
    return true;
  }

  // Set active tab
  setActiveTab(tabId) {
    const tab = this.getTab(tabId);
    if (!tab) return false;

    // Deactivate current active tab
    if (this.activeTabId) {
      const currentTab = this.getTab(this.activeTabId);
      if (currentTab) currentTab.setActive(false);
    }

    // Move tab to end (most recent position)
    this.moveTabToEnd(tabId);

    // Activate new tab
    tab.setActive(true);
    this.activeTabId = tabId;

    this.emit('tab-activated', { tab });
    return true;
  }

  // Move tab to end of array (most recent position)
  moveTabToEnd(tabId) {
    const index = this.tabs.findIndex(tab => tab.id === tabId);
    if (index === -1 || index === this.tabs.length - 1) return false;

    const tab = this.tabs.splice(index, 1)[0];
    this.tabs.push(tab);
    return true;
  }

  // Get tab by ID
  getTab(tabId) {
    return this.tabs.find(tab => tab.id === tabId);
  }

  // Get active tab
  getActiveTab() {
    return this.activeTabId ? this.getTab(this.activeTabId) : null;
  }

  // Get all tabs
  getAllTabs() {
    return [...this.tabs];
  }

  // Get tabs count
  getTabsCount() {
    return this.tabs.length;
  }

  // Check if has tabs
  hasTabs() {
    return this.tabs.length > 0;
  }

  // Get dirty tabs
  getDirtyTabs() {
    return this.tabs.filter(tab => tab.isDirty);
  }



  // Find tab by file path
  findTabByPath(filePath) {
    return this.tabs.find(tab => tab.filePath === filePath);
  }

  // Close all tabs
  closeAllTabs() {
    const closedTabs = [...this.tabs];
    this.tabs = [];
    this.activeTabId = null;
    this.emit('all-tabs-closed', { closedTabs });
  }

  // Serialize for persistence
  toJSON() {
    return {
      tabs: this.tabs.map(tab => tab.toJSON()),
      activeTabId: this.activeTabId,
      nextTabId: this.nextTabId
    };
  }

  // Deserialize from persistence
  fromJSON(data) {
    this.tabs = data.tabs.map(tabData => TabState.fromJSON(tabData));
    this.activeTabId = data.activeTabId;
    this.nextTabId = data.nextTabId || this.tabs.length + 1;

    // Ensure active tab is properly set
    if (this.activeTabId) {
      const activeTab = this.getTab(this.activeTabId);
      if (activeTab) {
        activeTab.setActive(true);
      } else {
        this.activeTabId = null;
      }
    }
  }
}

window.TabCollection = TabCollection;