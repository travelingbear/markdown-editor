/**
 * TabUIController - Manages tab UI interactions and display
 * Handles tab dropdown, modal, context menu, and pinned tabs functionality
 */
class TabUIController extends BaseComponent {
  constructor() {
    super('TabUIController');
    
    // Dependencies (injected)
    this.tabManager = null;
    this.settingsController = null;
    this.performanceOptimizer = null;
    
    // State
    this.contextMenuTabId = null;
  }

  async onInit() {
    // Load tab system CSS
    if (window.styleManager) {
      await window.styleManager.loadTabSystem();
    }
    
    this.setupTabDropdown();
    this.setupTabKeyboardShortcuts();
    this.setupTabContextMenu();
  }

  // Dependency injection
  setDependencies(tabManager, settingsController, performanceOptimizer) {
    this.tabManager = tabManager;
    this.settingsController = settingsController;
    this.performanceOptimizer = performanceOptimizer;
  }

  updateTabUI() {
    const filenameBtn = document.getElementById('filename');
    const tabDropdownList = document.getElementById('tab-dropdown-list');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    
    if (!filenameBtn || !tabDropdownList || !tabMoreBtn) return;
    
    // Update pinned tabs if enabled
    if (this.settingsController?.getPinnedTabsEnabled()) {
      this.updatePinnedTabs();
    }
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    // Check if we're on welcome screen
    const welcomePage = document.getElementById('welcome-page');
    const isWelcomeVisible = welcomePage && welcomePage.style.display !== 'none';
    
    if (tabs.length === 0) {
      // No tabs - show default filename
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.remove('has-tabs');
      tabMoreBtn.style.display = 'none';
      return;
    }
    
    // If on welcome screen but have tabs, show Welcome but enable tab functionality
    if (isWelcomeVisible) {
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.add('has-tabs'); // Enable dropdown functionality
    } else if (activeTab) {
      // Show active tab name when not on welcome screen
      const displayName = `${activeTab.fileName}${activeTab.isDirty ? ' *' : ''}`;
      filenameBtn.textContent = displayName;
      filenameBtn.classList.add('has-tabs');
    }
    
    // Clear existing dropdown items
    tabDropdownList.innerHTML = '';
    
    // Show up to 9 most recent tabs in dropdown (newest first)
    const visibleTabs = tabs.slice(0, 9);
    const showMoreBtn = tabs.length > 9;
    
    visibleTabs.forEach((tab, index) => {
      const tabElement = this.createDropdownTabElement(tab, activeTab, index);
      tabDropdownList.appendChild(tabElement);
    });
    
    // Show/hide more button
    tabMoreBtn.style.display = showMoreBtn ? 'block' : 'none';
    
    // Auto-scroll dropdown to active tab if dropdown is open
    if (activeTab) {
      setTimeout(() => {
        const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
        if (tabDropdownMenu && tabDropdownMenu.classList.contains('show')) {
          const activeElement = tabDropdownList.querySelector('.tab-dropdown-item.active');
          if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 50);
    }
  }
  
  updateTabUIForWelcome() {
    const filenameBtn = document.getElementById('filename');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    
    if (filenameBtn) {
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.remove('has-tabs');
    }
    
    if (tabMoreBtn) {
      tabMoreBtn.style.display = 'none';
    }
  }
  
  createDropdownTabElement(tab, activeTab, index) {
    const tabElement = document.createElement('div');
    tabElement.className = `tab-dropdown-item ${tab.id === activeTab?.id ? 'active' : ''}`;
    tabElement.title = tab.filePath || tab.fileName;
    
    // Tab number
    const tabNumber = document.createElement('div');
    tabNumber.className = 'tab-dropdown-number';
    tabNumber.textContent = (index + 1).toString();
    tabElement.appendChild(tabNumber);
    
    // Tab info
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-dropdown-info';
    
    const tabName = document.createElement('div');
    tabName.className = `tab-dropdown-name ${tab.isDirty ? 'dirty' : ''}`;
    tabName.textContent = tab.fileName;
    tabInfo.appendChild(tabName);
    
    tabElement.appendChild(tabInfo);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-dropdown-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.tabManager.closeTab(tab.id);
      this.hideTabDropdown();
    };
    tabElement.appendChild(closeBtn);
    
    // Click to switch tab
    tabElement.onclick = () => {
      this.emit('tab-switch-requested', { tabId: tab.id });
      this.hideTabDropdown();
    };
    
    // Right-click for context menu
    tabElement.oncontextmenu = (e) => {
      this.showTabContextMenu(e, tab.id);
    };
    
    return tabElement;
  }
  
  setupTabDropdown() {
    const filenameBtn = document.getElementById('filename');
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    const tabModal = document.getElementById('tab-modal');
    const tabModalClose = document.getElementById('tab-modal-close');
    const tabModalOverlay = document.querySelector('.tab-modal-overlay');
    const tabSearchInput = document.getElementById('tab-search');
    
    // Filename button click to toggle dropdown
    if (filenameBtn) {
      filenameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.tabManager.hasTabs()) {
          this.toggleTabDropdown();
        }
      });
    }
    
    // More button click to show modal
    if (tabMoreBtn) {
      tabMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideTabDropdown();
        this.showTabModal();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (tabDropdownMenu && !tabDropdownMenu.contains(e.target) && e.target !== filenameBtn) {
        this.hideTabDropdown();
      }
    });
    
    // Tab modal handlers
    if (tabModalClose) {
      tabModalClose.addEventListener('click', () => {
        this.hideTabModal();
      });
    }
    
    if (tabModalOverlay) {
      tabModalOverlay.addEventListener('click', () => {
        this.hideTabModal();
      });
    }
    
    // Tab search functionality
    if (tabSearchInput) {
      tabSearchInput.addEventListener('input', (e) => {
        this.filterTabModal(e.target.value);
      });
      
      // Keyboard navigation in search
      tabSearchInput.addEventListener('keydown', (e) => {
        this.handleTabModalKeyboard(e);
      });
    }
  }
  
  toggleTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      const isVisible = tabDropdownMenu.classList.contains('show');
      if (isVisible) {
        this.hideTabDropdown();
      } else {
        this.showTabDropdown();
      }
    }
  }
  
  showTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      tabDropdownMenu.classList.add('show');
      
      // Auto-scroll to active tab when dropdown opens
      setTimeout(() => {
        const tabDropdownList = document.getElementById('tab-dropdown-list');
        const activeElement = tabDropdownList?.querySelector('.tab-dropdown-item.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }
  
  hideTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      tabDropdownMenu.classList.remove('show');
    }
  }
  
  showTabModal() {
    const tabModal = document.getElementById('tab-modal');
    const tabModalList = document.getElementById('tab-modal-list');
    const tabSearchInput = document.getElementById('tab-search');
    
    if (!tabModal || !tabModalList) return;
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    // Clear existing items
    tabModalList.innerHTML = '';
    
    // Show modal even with no tabs or few tabs
    if (tabs.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'tab-modal-empty';
      emptyMessage.textContent = 'No tabs open';
      tabModalList.appendChild(emptyMessage);
    } else {
      tabs.forEach(tab => {
        const item = this.createTabModalItem(tab, activeTab);
        tabModalList.appendChild(item);
      });
    }
    
    // Clear search and focus
    if (tabSearchInput) {
      tabSearchInput.value = '';
      setTimeout(() => tabSearchInput.focus(), 100);
    }
    
    tabModal.style.display = 'flex';
  }
  
  hideTabModal() {
    const tabModal = document.getElementById('tab-modal');
    if (tabModal) {
      tabModal.style.display = 'none';
      
      // Clear keyboard focus
      const items = tabModal.querySelectorAll('.tab-modal-item');
      items.forEach(item => item.classList.remove('keyboard-focus'));
    }
  }
  
  createTabModalItem(tab, activeTab) {
    const item = document.createElement('div');
    item.className = `tab-modal-item ${tab.id === activeTab?.id ? 'active' : ''}`;
    
    // Check if this tab is in the top 9 (dropdown)
    const allTabs = this.tabManager.getAllTabs();
    const tabIndex = allTabs.findIndex(t => t.id === tab.id);
    const isInDropdown = tabIndex < 9;
    
    // Add position number for top 9 tabs
    if (isInDropdown) {
      const number = document.createElement('div');
      number.className = 'tab-modal-number';
      number.textContent = (tabIndex + 1).toString();
      item.appendChild(number);
    }
    
    const info = document.createElement('div');
    info.className = 'tab-modal-info';
    
    const name = document.createElement('div');
    name.className = `tab-modal-name ${tab.isDirty ? 'dirty' : ''}`;
    name.textContent = tab.fileName;
    info.appendChild(name);
    
    if (tab.filePath) {
      const path = document.createElement('div');
      path.className = 'tab-modal-path';
      path.textContent = tab.filePath;
      info.appendChild(path);
    }
    
    item.appendChild(info);
    
    const actions = document.createElement('div');
    actions.className = 'tab-modal-actions';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-modal-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.tabManager.closeTab(tab.id);
      // Modal will be updated by the tab-removed event handler
    };
    actions.appendChild(closeBtn);
    
    item.appendChild(actions);
    
    // Click to switch tab
    item.onclick = () => {
      this.emit('tab-switch-requested', { tabId: tab.id });
      this.hideTabModal();
    };
    
    // Right-click for context menu
    item.oncontextmenu = (e) => {
      this.showTabContextMenu(e, tab.id);
    };
    
    return item;
  }

  setupTabKeyboardShortcuts() {
    // Alt+1-9 for switching to numbered tabs in dropdown (most recent first)
    // On macOS, also support Cmd+1-9 as an alternative
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const useAltKey = e.altKey || (isMac && e.metaKey);
      
      if (useAltKey && e.key >= '1' && e.key <= '9') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = this.tabManager.getAllTabs();
        const availableTabs = tabs.slice(0, 9); // First 9 tabs (most recent first)
        
        if (availableTabs[tabIndex]) {
          e.preventDefault();
          this.emit('tab-switch-requested', { tabId: availableTabs[tabIndex].id });
        }
      }
    });
  }
  
  setupTabContextMenu() {
    // Create context menu if it doesn't exist
    let contextMenu = document.getElementById('tab-context-menu');
    if (!contextMenu) {
      contextMenu = document.createElement('div');
      contextMenu.id = 'tab-context-menu';
      contextMenu.className = 'tab-context-menu';
      contextMenu.innerHTML = `
        <div class="tab-context-item submenu-parent" data-action="move-to">
          Move to...
          <span class="submenu-arrow">▶</span>
          <div class="tab-context-submenu">
            <button class="tab-context-item" data-action="move-to-1">Position 1</button>
            <button class="tab-context-item" data-action="move-to-2">Position 2</button>
            <button class="tab-context-item" data-action="move-to-3">Position 3</button>
            <button class="tab-context-item" data-action="move-to-4">Position 4</button>
            <button class="tab-context-item" data-action="move-to-5">Position 5</button>
            <button class="tab-context-item" data-action="move-to-6">Position 6</button>
            <button class="tab-context-item" data-action="move-to-7">Position 7</button>
            <button class="tab-context-item" data-action="move-to-8">Position 8</button>
            <button class="tab-context-item" data-action="move-to-9">Position 9</button>
          </div>
        </div>
        <div class="tab-context-separator"></div>
        <button class="tab-context-item" data-action="close">Close Tab</button>
        <button class="tab-context-item" data-action="close-others">Close Others</button>
        <button class="tab-context-item" data-action="close-all">Close All</button>
        <div class="tab-context-separator"></div>
        <button class="tab-context-item" data-action="toggle-pinned">Toggle Pinned Tabs</button>
        <button class="tab-context-item" data-action="duplicate">Duplicate Tab</button>
        <button class="tab-context-item" data-action="reveal">Reveal in Explorer</button>
      `;
      document.body.appendChild(contextMenu);
      
      // Add submenu hover functionality with dynamic positioning
      const submenuParent = contextMenu.querySelector('.submenu-parent');
      if (submenuParent) {
        submenuParent.addEventListener('mouseenter', () => {
          const submenu = submenuParent.querySelector('.tab-context-submenu');
          if (submenu) {
            // Reset positioning
            submenu.style.left = '100%';
            submenu.style.right = 'auto';
            
            submenuParent.classList.add('submenu-open');
            
            // Check if submenu overflows after it's visible
            setTimeout(() => {
              const submenuRect = submenu.getBoundingClientRect();
              if (submenuRect.right > window.innerWidth - 10) {
                submenu.style.left = 'auto';
                submenu.style.right = '100%';
              }
            }, 0);
          }
        });
        submenuParent.addEventListener('mouseleave', () => {
          submenuParent.classList.remove('submenu-open');
        });
      }
    }
    
    // Context menu event handlers
    contextMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action && this.contextMenuTabId) {
        this.emit('tab-context-action', { action, tabId: this.contextMenuTabId });
      }
      this.hideTabContextMenu();
    });
    
    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!contextMenu.contains(e.target)) {
        this.hideTabContextMenu();
      }
    });
  }
  
  showTabContextMenu(e, tabId) {
    e.preventDefault();
    e.stopPropagation();
    
    const contextMenu = document.getElementById('tab-context-menu');
    if (!contextMenu) return;
    
    this.contextMenuTabId = tabId;
    
    // Show menu first to get dimensions
    contextMenu.classList.add('show');
    
    // Calculate position to prevent overflow
    const menuRect = contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = e.clientX;
    let top = e.clientY;
    
    // Adjust horizontal position if menu would overflow
    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 10;
    }
    
    // Adjust vertical position if menu would overflow
    if (top + menuRect.height > viewportHeight) {
      top = viewportHeight - menuRect.height - 10;
    }
    
    // Ensure menu doesn't go off-screen
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
    

    
    // Update menu items based on context
    const tabs = this.tabManager.getAllTabs();
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const closeOthersBtn = contextMenu.querySelector('[data-action="close-others"]');
    const closeAllBtn = contextMenu.querySelector('[data-action="close-all"]');
    const revealBtn = contextMenu.querySelector('[data-action="reveal"]');
    
    // Update position buttons - disable current position
    for (let i = 1; i <= 9; i++) {
      const posBtn = contextMenu.querySelector(`[data-action="move-to-${i}"]`);
      if (posBtn) {
        posBtn.disabled = tabIndex === (i - 1);
      }
    }
    
    if (closeOthersBtn) {
      closeOthersBtn.disabled = tabs.length <= 1;
    }
    if (closeAllBtn) {
      closeAllBtn.disabled = tabs.length === 0;
    }
    if (revealBtn) {
      const tab = this.tabManager.getTab(tabId);
      revealBtn.disabled = !tab || !tab.filePath;
    }
  }
  
  hideTabContextMenu() {
    const contextMenu = document.getElementById('tab-context-menu');
    if (contextMenu) {
      contextMenu.classList.remove('show');
    }
    this.contextMenuTabId = null;
  }
  
  filterTabModal(searchTerm) {
    const tabModalList = document.getElementById('tab-modal-list');
    if (!tabModalList) return;
    
    const items = tabModalList.querySelectorAll('.tab-modal-item');
    const term = searchTerm.toLowerCase().trim();
    
    let visibleCount = 0;
    items.forEach(item => {
      const name = item.querySelector('.tab-modal-name')?.textContent?.toLowerCase() || '';
      const path = item.querySelector('.tab-modal-path')?.textContent?.toLowerCase() || '';
      
      const matches = !term || name.includes(term) || path.includes(term);
      
      if (matches) {
        item.classList.remove('filtered-out');
        visibleCount++;
      } else {
        item.classList.add('filtered-out');
      }
    });
    
    // Show empty state if no matches
    let emptyState = tabModalList.querySelector('.tab-modal-empty');
    if (visibleCount === 0 && term) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'tab-modal-empty';
        emptyState.textContent = 'No tabs match your search';
        tabModalList.appendChild(emptyState);
      }
      emptyState.style.display = 'block';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
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
        this.hideTabModal();
        break;
    }
  }
  
  setTabModalKeyboardFocus(index, items) {
    // Remove existing focus
    items.forEach(item => item.classList.remove('keyboard-focus'));
    
    // Set new focus
    if (index >= 0 && index < items.length) {
      items[index].classList.add('keyboard-focus');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  // Pinned Tabs Methods
  togglePinnedTabs() {
    const currentEnabled = this.settingsController.getPinnedTabsEnabled();
    this.settingsController.pinnedTabsEnabled = !currentEnabled;
    localStorage.setItem('markdownViewer_pinnedTabs', (!currentEnabled).toString());
    this.settingsController.applyPinnedTabsVisibility();
    if (!currentEnabled) {
      this.updatePinnedTabs();
    }
    this.emit('settings-update-requested');
  }
  
  updatePinnedTabs() {
    const pinnedTabsList = document.getElementById('pinned-tabs-list');
    if (!pinnedTabsList) return;
    
    pinnedTabsList.innerHTML = '';
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    tabs.forEach((tab, index) => {
      const pinnedTab = document.createElement('div');
      pinnedTab.className = `pinned-tab ${tab.id === activeTab?.id ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`;
      
      // Add number for first 9 tabs
      if (index < 9) {
        const tabNumber = document.createElement('div');
        tabNumber.className = 'pinned-tab-number';
        tabNumber.textContent = (index + 1).toString();
        pinnedTab.appendChild(tabNumber);
      }
      
      const tabName = document.createElement('div');
      tabName.className = 'pinned-tab-name';
      tabName.textContent = tab.fileName;
      tabName.title = tab.filePath || tab.fileName;
      pinnedTab.appendChild(tabName);
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'pinned-tab-close';
      closeBtn.innerHTML = '×';
      closeBtn.title = 'Close tab';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.tabManager.closeTab(tab.id);
      };
      pinnedTab.appendChild(closeBtn);
      
      pinnedTab.onclick = () => {
        this.emit('tab-switch-requested', { tabId: tab.id });
      };
      
      pinnedTab.oncontextmenu = (e) => {
        this.showTabContextMenu(e, tab.id);
      };
      
      pinnedTabsList.appendChild(pinnedTab);
    });
    
    // Auto-scroll to active tab
    if (activeTab) {
      setTimeout(() => {
        const activeElement = pinnedTabsList.querySelector('.pinned-tab.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  }

  onDestroy() {
    // Clean up context menu
    const contextMenu = document.getElementById('tab-context-menu');
    if (contextMenu) {
      contextMenu.remove();
    }
    
    // Reset state
    this.contextMenuTabId = null;
  }
}

// Export for use in other components
window.TabUIController = TabUIController;