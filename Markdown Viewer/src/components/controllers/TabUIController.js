import { getPinnedTabDropIndex } from '../tabReorder.js';
import {
  clampMenuPosition,
  matchesTabSearch,
  resolveContextMenuState,
  resolveTabModalKey
} from '../tabChrome.js';

/**
 * TabUIController - Manages tab UI interactions and display
 * Handles tab dropdown, modal, context menu, and pinned tabs functionality
 */
class TabUIController extends BaseComponent {
  constructor(options = {}) {
    super('TabUIController', options);
    
    // Dependencies (injected)
    this.tabManager = null;
    this.settingsController = null;
    this.performanceOptimizer = null;
    this.tauriProvider = options.tauriProvider || (() => window.__TAURI__);
    
    // State
    this.contextMenuTabId = null;
    this.pinnedTabDrag = null;
    this.suppressPinnedTabClick = false;
    this.tabListDrag = null;
    this.suppressTabListClick = false;
  }

  async onInit() {
    // Load tab system CSS
    if (window.styleManager) {
      await window.styleManager.loadTabSystem();
    }
    
    this.setupTabDropdown();
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
    // The tab manager offers search, reordering, and per-tab commands, so it is
    // worth reaching as soon as there is more than one document to move between.
    const showMoreBtn = tabs.length > 1;
    
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
    tabElement.dataset.tabId = tab.id;

    const reorderHandle = document.createElement('div');
    reorderHandle.className = 'tab-reorder-handle';
    reorderHandle.textContent = '⋮⋮';
    reorderHandle.title = 'Drag to reorder tab';
    reorderHandle.setAttribute('aria-label', `Reorder ${tab.fileName}`);
    tabElement.appendChild(reorderHandle);
    
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
      if (this.suppressTabListClick) return;
      this.emit('tab-switch-requested', { tabId: tab.id });
      this.hideTabDropdown();
    };
    
    // Right-click for context menu
    tabElement.oncontextmenu = (e) => {
      this.showTabContextMenu(e, tab.id);
    };

    this.setupTabListPointerReorder(tabElement, 'tab-dropdown-list');
    
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
    item.dataset.tabId = tab.id;

    const reorderHandle = document.createElement('div');
    reorderHandle.className = 'tab-reorder-handle';
    reorderHandle.textContent = '⋮⋮';
    reorderHandle.title = 'Drag to reorder tab';
    reorderHandle.setAttribute('aria-label', `Reorder ${tab.fileName}`);
    item.appendChild(reorderHandle);
    
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
      if (this.suppressTabListClick) return;
      this.emit('tab-switch-requested', { tabId: tab.id });
      this.hideTabModal();
    };
    
    // Right-click for context menu
    item.oncontextmenu = (e) => {
      this.showTabContextMenu(e, tab.id);
    };

    this.setupTabListPointerReorder(item, 'tab-modal-list');
    
    return item;
  }

  setupTabListPointerReorder(item, containerId) {
    item.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('[class*="close"]')) return;
      const container = document.getElementById(containerId);
      if (!container) return;
      this.tabListDrag = {
        tabId: item.dataset.tabId,
        pointerId: event.pointerId,
        source: item,
        container,
        startX: event.clientX,
        startY: event.clientY,
        isDragging: false,
        target: null,
        insertAfter: false
      };
      item.setPointerCapture?.(event.pointerId);
    });

    item.addEventListener('pointermove', (event) => this.updateTabListPointerDrag(event));
    item.addEventListener('pointerup', (event) => this.finishTabListPointerDrag(event));
    item.addEventListener('pointercancel', () => this.clearTabListPointerDrag());
  }

  updateTabListPointerDrag(event) {
    const drag = this.tabListDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.isDragging) {
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance < 5) return;
      drag.isDragging = true;
      this.suppressTabListClick = true;
      drag.source.classList.add('dragging');
      document.body.classList.add('reordering-tabs');
    }

    event.preventDefault();
    const target = this.findTabListItemAtPoint(event.clientX, event.clientY, drag.container);
    this.clearTabDropMarkers(drag.container);
    if (!target || target.dataset.tabId === drag.tabId) {
      drag.target = null;
      return;
    }

    const rect = target.getBoundingClientRect();
    drag.insertAfter = event.clientY >= rect.top + rect.height / 2;
    target.classList.add(drag.insertAfter ? 'drag-over-after' : 'drag-over-before');
    drag.target = target;
  }

  finishTabListPointerDrag(event) {
    const drag = this.tabListDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.isDragging && drag.target && drag.target.dataset.tabId !== drag.tabId) {
      const tabs = this.tabManager.getAllTabs();
      const sourceIndex = tabs.findIndex((tab) => tab.id === drag.tabId);
      const targetIndex = tabs.findIndex((tab) => tab.id === drag.target.dataset.tabId);
      if (sourceIndex >= 0 && targetIndex >= 0) {
        const dropIndex = getPinnedTabDropIndex(sourceIndex, targetIndex, drag.insertAfter, tabs.length);
        this.tabManager.moveTabToPosition(drag.tabId, dropIndex);
      }
    }

    const wasModal = drag.container.id === 'tab-modal-list';
    this.clearTabListPointerDrag();
    if (wasModal) this.showTabModal();
    setTimeout(() => { this.suppressTabListClick = false; }, 0);
  }

  findTabListItemAtPoint(clientX, clientY, container) {
    const pointed = document.elementFromPoint?.(clientX, clientY)?.closest?.('.tab-dropdown-item, .tab-modal-item');
    if (pointed && container.contains(pointed)) return pointed;

    const items = [...container.querySelectorAll('.tab-dropdown-item, .tab-modal-item:not(.filtered-out)')];
    return items.reduce((nearest, element) => {
      const rect = element.getBoundingClientRect();
      const distance = Math.abs(clientY - (rect.top + rect.height / 2));
      return !nearest || distance < nearest.distance ? { element, distance } : nearest;
    }, null)?.element || null;
  }

  clearTabDropMarkers(container) {
    container?.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
      element.classList.remove('drag-over-before', 'drag-over-after');
    });
  }

  clearTabListPointerDrag() {
    this.tabListDrag?.source?.classList.remove('dragging');
    this.clearTabDropMarkers(this.tabListDrag?.container);
    document.body.classList.remove('reordering-tabs');
    this.tabListDrag = null;
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
        this.handleContextAction(action, this.contextMenuTabId).catch((error) => {
          console.error('[TabUIController] Context action failed:', error);
        });
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
    
    // Measured after showing, so the menu has dimensions to keep on screen.
    const menuRect = contextMenu.getBoundingClientRect();
    const { left, top } = clampMenuPosition({
      pointer: { x: e.clientX, y: e.clientY },
      menu: { width: menuRect.width, height: menuRect.height },
      viewport: { width: window.innerWidth, height: window.innerHeight }
    });
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;

    this.applyContextMenuState(contextMenu, tabId);
  }

  applyContextMenuState(contextMenu, tabId) {
    const state = resolveContextMenuState({
      tabs: this.tabManager.getAllTabs(),
      tabId,
      tab: this.tabManager.getTab(tabId)
    });

    const setDisabled = (action, disabled) => {
      const button = contextMenu.querySelector(`[data-action="${action}"]`);
      if (button) button.disabled = disabled;
    };

    for (const { position, disabled } of state.positions) {
      setDisabled(`move-to-${position}`, disabled);
    }
    setDisabled('close-others', state.closeOthersDisabled);
    setDisabled('close-all', state.closeAllDisabled);
    setDisabled('reveal', state.revealDisabled);
  }
  
  hideTabContextMenu() {
    const contextMenu = document.getElementById('tab-context-menu');
    if (contextMenu) {
      contextMenu.classList.remove('show');
    }
    this.contextMenuTabId = null;
  }

  async handleContextAction(action, tabId) {
    const tab = this.tabManager.getTab(tabId);
    if (!tab) return false;

    if (/^move-to-[1-9]$/.test(action)) {
      const targetIndex = Number.parseInt(action.slice('move-to-'.length), 10) - 1;
      const moved = this.tabManager.moveTabToPosition(tabId, targetIndex);
      const tabModal = document.getElementById('tab-modal');
      if (moved && tabModal?.style.display === 'flex') this.showTabModal();
      return moved;
    }

    switch (action) {
      case 'close':
        return this.tabManager.closeTab(tabId);
      case 'close-others': {
        let closedAny = false;
        for (const otherTab of [...this.tabManager.getAllTabs()]) {
          if (otherTab.id === tabId) continue;
          closedAny = (await this.tabManager.closeTab(otherTab.id)) || closedAny;
        }
        return closedAny;
      }
      case 'close-all':
        return this.tabManager.closeAllTabs();
      case 'duplicate':
        return Boolean(this.tabManager.createNewTab(tab.content));
      case 'toggle-pinned':
        this.togglePinnedTabs();
        return true;
      case 'reveal': {
        const invoke = this.tauriProvider()?.core?.invoke;
        if (!tab.filePath || !invoke) return false;
        try {
          await invoke('show_in_folder', { path: tab.filePath });
          return true;
        } catch (error) {
          console.warn('[TabUIController] Failed to reveal file:', error);
          return false;
        }
      }
      default:
        return false;
    }
  }
  
  filterTabModal(searchTerm) {
    const tabModalList = document.getElementById('tab-modal-list');
    if (!tabModalList) return;
    
    const items = tabModalList.querySelectorAll('.tab-modal-item');
    const term = searchTerm.toLowerCase().trim();
    
    let visibleCount = 0;
    items.forEach(item => {
      const matches = matchesTabSearch({
        name: item.querySelector('.tab-modal-name')?.textContent || '',
        path: item.querySelector('.tab-modal-path')?.textContent || ''
      }, term);

      item.classList.toggle('filtered-out', !matches);
      if (matches) visibleCount++;
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
    
    const currentIndex = visibleItems.findIndex(item => item.classList.contains('keyboard-focus'));
    const { handled, action, index } = resolveTabModalKey(e.key, {
      currentIndex,
      itemCount: visibleItems.length
    });

    if (!handled) return;
    e.preventDefault();

    if (action === 'focus') this.setTabModalKeyboardFocus(index, visibleItems);
    else if (action === 'select') visibleItems[index]?.click();
    else if (action === 'close') this.hideTabModal();
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
    this.settingsController.setPinnedTabsEnabled(!currentEnabled);
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
      pinnedTab.dataset.tabId = tab.id;
      
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
        if (this.suppressPinnedTabClick) return;
        this.emit('tab-switch-requested', { tabId: tab.id });
      };
      
      pinnedTab.oncontextmenu = (e) => {
        this.showTabContextMenu(e, tab.id);
      };

      pinnedTab.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.target.closest('.pinned-tab-close')) return;
        this.pinnedTabDrag = {
          tabId: tab.id,
          pointerId: event.pointerId,
          source: pinnedTab,
          startX: event.clientX,
          startY: event.clientY,
          isDragging: false,
          target: null
        };
        pinnedTab.setPointerCapture?.(event.pointerId);
      });

      pinnedTab.addEventListener('pointermove', (event) => {
        this.updatePinnedTabPointerDrag(event, pinnedTabsList);
      });

      pinnedTab.addEventListener('pointerup', (event) => {
        this.finishPinnedTabPointerDrag(event, pinnedTabsList);
      });

      pinnedTab.addEventListener('pointercancel', () => {
        this.clearPinnedTabPointerDrag(pinnedTabsList);
      });
      
      pinnedTabsList.appendChild(pinnedTab);
    });
    
    // Auto-scroll to active tab
    if (activeTab) {
      setTimeout(() => {
        if (this.pinnedTabDrag) return;
        const activeElement = pinnedTabsList.querySelector('.pinned-tab.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  }

  updatePinnedTabPointerDrag(event, pinnedTabsList) {
    const drag = this.pinnedTabDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.isDragging) {
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance < 5) return;
      drag.isDragging = true;
      this.suppressPinnedTabClick = true;
      drag.source.classList.add('dragging');
      document.body.classList.add('reordering-pinned-tabs');
    }

    event.preventDefault();
    const target = this.findPinnedTabAtPoint(event.clientX, event.clientY, pinnedTabsList);
    pinnedTabsList.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
      element.classList.remove('drag-over-before', 'drag-over-after');
    });

    if (!target || target.dataset.tabId === drag.tabId) {
      drag.target = null;
      return;
    }

    const tabs = this.tabManager.getAllTabs();
    const sourceIndex = tabs.findIndex((item) => item.id === drag.tabId);
    const targetIndex = tabs.findIndex((item) => item.id === target.dataset.tabId);
    const targetRect = target.getBoundingClientRect();
    drag.insertAfter = targetRect.width > 0
      ? event.clientX >= targetRect.left + targetRect.width / 2
      : sourceIndex < targetIndex;
    target.classList.add(drag.insertAfter ? 'drag-over-after' : 'drag-over-before');
    drag.target = target;
  }

  finishPinnedTabPointerDrag(event, pinnedTabsList) {
    const drag = this.pinnedTabDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const target = drag.target || this.findPinnedTabAtPoint(event.clientX, event.clientY, pinnedTabsList);
    if (drag.isDragging && target && target.dataset.tabId !== drag.tabId) {
      const tabs = this.tabManager.getAllTabs();
      const sourceIndex = tabs.findIndex((item) => item.id === drag.tabId);
      const targetIndex = tabs.findIndex((item) => item.id === target.dataset.tabId);
      if (sourceIndex >= 0 && targetIndex >= 0) {
        const dropIndex = getPinnedTabDropIndex(
          sourceIndex,
          targetIndex,
          drag.insertAfter ?? sourceIndex < targetIndex,
          tabs.length
        );
        this.tabManager.moveTabToPosition(drag.tabId, dropIndex);
      }
    }

    this.clearPinnedTabPointerDrag(pinnedTabsList);
    setTimeout(() => { this.suppressPinnedTabClick = false; }, 0);
  }

  findPinnedTabAtPoint(clientX, clientY, pinnedTabsList) {
    const pointedElement = document.elementFromPoint?.(clientX, clientY)?.closest?.('.pinned-tab');
    if (pointedElement && pinnedTabsList.contains(pointedElement)) return pointedElement;

    const tabs = [...pinnedTabsList.querySelectorAll('.pinned-tab')];
    return tabs.reduce((nearest, element) => {
      const rect = element.getBoundingClientRect();
      const distance = Math.abs(clientX - (rect.left + rect.width / 2));
      return !nearest || distance < nearest.distance ? { element, distance } : nearest;
    }, null)?.element || null;
  }

  clearPinnedTabPointerDrag(pinnedTabsList) {
    this.pinnedTabDrag?.source?.classList.remove('dragging');
    pinnedTabsList.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
      element.classList.remove('drag-over-before', 'drag-over-after');
    });
    document.body.classList.remove('reordering-pinned-tabs');
    this.pinnedTabDrag = null;
  }

  onDestroy() {
    // Clean up context menu
    const contextMenu = document.getElementById('tab-context-menu');
    if (contextMenu) {
      contextMenu.remove();
    }
    
    // Reset state
    this.contextMenuTabId = null;
    this.pinnedTabDrag = null;
    this.tabListDrag = null;
  }
}

// Export for use in other components
window.TabUIController = TabUIController;
