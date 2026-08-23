// Performance Optimizer for Multi-Tab Architecture - Phase 6 Enhanced
import { buildDashboardView } from './performance/dashboardView.js';
import { averageAccessCount, selectTabsToUnload } from './performance/tabPolicy.js';

class PerformanceOptimizer {
  constructor() {
    this.performanceTargets = {
      startupTime: 1500,        // Optimized for older computers
      tabSwitchTime: 50,        // Very fast tab switching
      memoryPerTab: 5,          // Max 5MB per tab
      maxTotalMemory: 200,      // Max 200MB total
      previewUpdateTime: 200,   // Reduced update time
      maxTabs: 50               // Maximum allowed tabs
    };
    
    this.memoryMonitor = null;
    this.performanceLog = [];
    this.tabMemoryUsage = new Map();
    this.inactiveTabsData = new Map(); // Lazy loading storage
    this.performanceMetrics = new Map();
    this.memoryPressureThreshold = 0.8; // 80% of available memory
    this.tabUnloadQueue = [];
    this.isLowPowerMode = false;
    this.autoVirtualizationPaused = false;
    
    this.startMemoryMonitoring();
    this.setupPerformanceTracking();
  }

  // Memory optimization for multi-tab architecture - Phase 6 Enhanced
  optimizeForMultiTabs() {

    
    // 1. Implement tab virtualization with lazy loading
    this.setupTabVirtualization();
    
    // 2. Preview content caching with intelligent eviction
    this.setupPreviewCaching();
    
    // 3. Memory cleanup strategies with pressure detection
    this.setupMemoryCleanup();
    
    // 4. Phase 6: Lazy loading for inactive tabs
    this.setupLazyTabLoading();
    
    // 5. Phase 6: Smart tab unloading for memory pressure
    this.setupSmartTabUnloading();
    
    // 6. Phase 6: Performance dashboard
    this.setupPerformanceDashboard();
  }

  setupTabVirtualization() {
    // Only keep active tab content in DOM
    // Serialize inactive tab content to lightweight objects
    this.virtualizedTabs = new Set(); // Track which tabs are virtualized
  }
  
  // Phase 6: Lazy loading for inactive tabs
  setupLazyTabLoading() {
    this.lazyLoadThreshold = 10; // Start lazy loading after 10 tabs
    

  }
  
  // Phase 6: Smart tab unloading for memory pressure
  setupSmartTabUnloading() {
    this.unloadCandidates = new Map(); // Track tabs eligible for unloading
    this.lastAccessTime = new Map(); // Track when tabs were last accessed
    
    // Monitor memory pressure and tab virtualization
    this.memoryPressureMonitor = setInterval(() => {
      this.checkMemoryPressure();
    }, 30000); // Check every 30 seconds
    

  }
  
  // Phase 6: Performance tracking setup
  setupPerformanceTracking() {
    this.performanceMetrics.set('tabSwitches', []);
    this.performanceMetrics.set('memoryUsage', []);
    this.performanceMetrics.set('tabLoads', []);
    this.performanceMetrics.set('editorOperations', []);
    
    // Track tab access patterns
    this.tabAccessPattern = new Map();
  }

  setupPreviewCaching() {
    // Cache rendered markdown to avoid re-processing
    this.previewCache = new Map();
    this.maxCacheSize = 50; // Cache 50 rendered previews
  }

  getCachedPreview(content) {
    const hash = this.hashContent(content);
    return this.previewCache.get(hash);
  }

  setCachedPreview(content, renderedHtml) {
    const hash = this.hashContent(content);
    
    // Efficient LRU cache - delete first, then set to maintain order
    if (this.previewCache.has(hash)) {
      this.previewCache.delete(hash);
    } else if (this.previewCache.size >= this.maxCacheSize) {
      const firstKey = this.previewCache.keys().next().value;
      this.previewCache.delete(firstKey);
    }
    
    this.previewCache.set(hash, {
      html: renderedHtml,
      timestamp: Date.now()
    });
  }

  hashContent(content) {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  setupMemoryCleanup() {
    // Automatic memory cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, 300000);
    
    // Cleanup on tab close
    this.setupTabCloseCleanup();
  }

  performMemoryCleanup({ aggressive = false } = {}) {
    const previewEntriesBefore = this.previewCache?.size || 0;
    let editorDocumentsDisposed = 0;

    // A manual cleanup is intentionally stronger than the periodic sweep.
    // Cached HTML and inactive CodeMirror documents can always be recreated
    // from the canonical tab content, so releasing them cannot lose work.
    if (aggressive) {
      this.autoVirtualizationPaused = false;
      this.previewCache?.clear();

      const editor = window.markdownEditor?.editorComponent?.getEditorAdapter?.();
      const tabManager = window.markdownEditor?.tabManager;
      const activeTabId = tabManager?.getActiveTab()?.id;
      for (const tab of tabManager?.getAllTabs?.() || []) {
        if (tab.id !== activeTabId && tab.editorDocument) {
          tab.disposeEditorDocument(editor);
          this.virtualizedTabs.add(tab.id);
          editorDocumentsDisposed++;
        }
      }
    } else {
      this.cleanupPreviewCache();
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Log memory usage
    this.logMemoryUsage();

    return {
      previewEntriesCleared: previewEntriesBefore - (this.previewCache?.size || 0),
      editorDocumentsDisposed
    };
  }

  cleanupPreviewCache() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    for (const [key, value] of this.previewCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.previewCache.delete(key);
      }
    }
  }

  setupTabCloseCleanup() {
    // Clean up resources when tabs are closed
    document.addEventListener('tab-closed', (event) => {
      const tabId = event.detail.tabId;
      this.cleanupTabResources(tabId);
    });
  }

  cleanupTabResources(tabId) {
    // Remove tab from memory tracking
    this.tabMemoryUsage.delete(tabId);
    
    // Clear any cached content for this tab
    // Implementation depends on tab management system
  }

  startMemoryMonitoring() {
    this.memoryMonitor = setInterval(() => {
      this.checkMemoryUsage();
    }, 120000); // Check every 2 minutes
  }
  
  stopMemoryMonitoring() {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  checkMemoryUsage() {
    if (!performance.memory) return null;
    
    const memoryInfo = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      pressure: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
    };
    
    // Store memory metrics for dashboard
    const memoryMetrics = this.performanceMetrics.get('memoryUsage');
    memoryMetrics.push({
      timestamp: Date.now(),
      ...memoryInfo
    });
    
    // Keep only last 100 measurements
    if (memoryMetrics.length > 100) {
      memoryMetrics.shift();
    }
    
    // Warn if memory usage is high
    if (memoryInfo.used > this.performanceTargets.maxTotalMemory) {

      this.performMemoryCleanup();
    }
    
    return memoryInfo;
  }
  
  // Phase 6: Memory pressure detection and response
  checkMemoryPressure() {
    const memoryInfo = this.checkMemoryUsage();
    
    // Get tab count with fallbacks
    let tabCount = 0;
    if (window.markdownEditor?.tabManager) {
      tabCount = window.markdownEditor.tabManager.getTabsCount();
    }
    
    // Fallback: count tabs in DOM
    if (tabCount === 0) {
      const tabElements = document.querySelectorAll('.tab-dropdown-item');
      tabCount = tabElements.length;
    }
    
    // Force virtualization for high tab counts
    if (tabCount > 15) {
      this.forceVirtualization(tabCount);
    }
    
    if (memoryInfo && memoryInfo.pressure > this.memoryPressureThreshold) {

      this.handleMemoryPressure(memoryInfo);
    }
  }
  
  // Phase 6: Force virtualization for testing
  forceVirtualization(tabCount) {
    if (this.autoVirtualizationPaused) return;

    // Don't create fake tabs - only virtualize real tabs
    if (window.markdownEditor?.tabManager) {
      const allTabs = window.markdownEditor.tabManager.getAllTabs();
      const maxActiveTabs = 10;
      
      // Virtualize real tabs beyond the limit
      for (let i = maxActiveTabs; i < allTabs.length; i++) {
        const tabId = allTabs[i].id;
        if (!this.virtualizedTabs.has(tabId)) {
          this.virtualizedTabs.add(tabId);
        }
      }
    }
  }
  
  // Phase 6: Handle high tab count by virtualizing some tabs
  handleMemoryPressure(memoryInfo) {
    const tabsToUnload = selectTabsToUnload({
      lastAccessTime: this.lastAccessTime,
      accessCounts: this.tabAccessPattern
    });
    
    if (tabsToUnload.length > 0) {

      tabsToUnload.forEach(tabId => this.unloadTab(tabId));
      
      // Force garbage collection if available
      if (window.gc) {
        setTimeout(() => window.gc(), 100);
      }
    }
  }
  
  // Phase 6: Select tabs for unloading based on access patterns
  logMemoryUsage() {
    const memoryInfo = this.checkMemoryUsage();
    if (memoryInfo) {
      console.log(`[Performance] Memory: ${memoryInfo.used}MB / ${memoryInfo.total}MB (limit: ${memoryInfo.limit}MB)`);
    }
  }

  // Performance benchmarking for multi-tab operations
  benchmarkTabOperation(operation, startTime, tabCount = 1, targetOverride = null) {
    const duration = performance.now() - startTime;
    const target = targetOverride ?? this.getTargetForOperation(operation);
    
    // Only log slow operations
    if (target && duration > target) {
      console.warn(`[Performance] ${operation} exceeded target: ${duration.toFixed(2)}ms > ${target}ms (${tabCount} tabs)`);
    }
    
    // Log to performance history
    this.performanceLog.push({
      operation,
      duration,
      tabCount,
      timestamp: Date.now(),
      exceeded: target && duration > target
    });
    
    // Keep only last 100 entries
    if (this.performanceLog.length > 100) {
      this.performanceLog.shift();
    }
    
    return duration;
  }

  getTargetForOperation(operation) {
    const targets = {
      'Tab Switch': this.performanceTargets.tabSwitchTime,
      'Tab Create': this.performanceTargets.tabSwitchTime * 2,
      'Tab Close': this.performanceTargets.tabSwitchTime,
      'Preview Update': this.performanceTargets.previewUpdateTime,
      'File Open': 500
    };
    
    return targets[operation];
  }

  // Phase 6: Enhanced performance report with dashboard data
  getPerformanceReport() {
    const recentOperations = this.performanceLog.slice(-20);
    const slowOperations = this.performanceLog.filter(op => op.exceeded);
    const memoryMetrics = this.performanceMetrics.get('memoryUsage').slice(-10);
    
    // Get actual tab count from tab manager if available
    let actualTabCount = this.lastAccessTime.size;
    if (window.markdownEditor?.tabManager) {
      actualTabCount = window.markdownEditor.tabManager.getTabsCount();
    }
    
    return {
      memoryUsage: this.checkMemoryUsage(),
      recentOperations,
      slowOperations: slowOperations.slice(-10),
      memoryTrend: memoryMetrics,
      cacheStats: {
        previewCacheSize: this.previewCache?.size || 0,
        virtualizedTabs: this.virtualizedTabs.size,
        inactiveTabsData: this.inactiveTabsData.size
      },
      tabStats: {
        totalTabs: actualTabCount,
        trackedTabs: this.lastAccessTime.size,
        unloadCandidates: this.unloadCandidates.size,
        averageAccessCount: averageAccessCount(this.tabAccessPattern)
      },
      targets: this.performanceTargets,
      isLowPowerMode: this.isLowPowerMode
    };
  }
  
  // Phase 6: Performance dashboard setup
  setupPerformanceDashboard() {
    // Create performance dashboard in settings modal
    this.createPerformanceDashboard();
    
    // Update dashboard every 30 seconds
    this.dashboardUpdateInterval = setInterval(() => {
      this.updatePerformanceDashboard();
    }, 30000);
    

  }
  
  // Phase 6: Create performance dashboard UI - use existing HTML section
  createPerformanceDashboard() {
    // Just add event listeners to existing HTML elements
    const cleanupBtn = document.getElementById('perf-cleanup-btn');
    
    if (cleanupBtn) {
      cleanupBtn.addEventListener('click', () => {
        const result = this.performMemoryCleanup({ aggressive: true });
        this.showPerformanceActionStatus(
          `Memory cleaned: ${result.previewEntriesCleared} cached preview(s) and ${result.editorDocumentsDisposed} inactive editor document(s) released.`
        );
        // Update dashboard immediately and again after cleanup
        this.updatePerformanceDashboard();
        setTimeout(() => this.updatePerformanceDashboard(), 100);
      });
    }
    
    // Add clear virtual tabs button
    const clearVirtualBtn = document.getElementById('perf-clear-virtual-btn');
    if (clearVirtualBtn) {
      clearVirtualBtn.addEventListener('click', () => {
        const result = this.clearAllVirtualTabs();
        this.showPerformanceActionStatus(
          result.virtualTabsCleared > 0
            ? `${result.virtualTabsCleared} virtual tab(s) restored. No documents were closed.`
            : 'No virtual tabs needed restoring.'
        );
        // Update dashboard immediately and again after cleanup
        this.updatePerformanceDashboard();
        setTimeout(() => this.updatePerformanceDashboard(), 100);
      });
    }
  }

  showPerformanceActionStatus(message) {
    const status = document.getElementById('perf-action-status');
    if (!status) return;
    status.textContent = message;
    status.classList.add('show');
  }
  
  // Phase 6: Check if we're in debug mode
  isDebugMode() {
    try {
      // Check if console is accessible and functional
      if (typeof console === 'undefined' || typeof console.log !== 'function') {
        return false;
      }
      
      // In development, we're usually running from file:// or localhost
      const isDev = window.location.protocol === 'file:' || 
                   window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port !== '';
      
      return isDev;
    } catch (e) {
      return false;
    }
  }
  
  // Phase 6: Update performance dashboard
  updatePerformanceDashboard() {
    const view = buildDashboardView({
      actualTabCount: this.countOpenTabs(),
      virtualCount: this.virtualizedTabs.size,
      // performance.memory is Chromium-only; checkMemoryUsage() already
      // returns null without it.
      memoryInfo: this.checkMemoryUsage(),
      startupTime: window.markdownEditor?.startupTime ?? null,
      tabSwitches: this.performanceMetrics.get('tabSwitches')
    });

    this.applyDashboardView(view);
  }

  /**
   * Prefer the tab manager's count, falling back to the rendered dropdown when
   * the dashboard is inspected before the editor is available.
   */
  countOpenTabs() {
    const count = window.markdownEditor?.tabManager
      ? window.markdownEditor.tabManager.getTabsCount()
      : document.querySelectorAll('.tab-dropdown-item').length;

    // Nothing can still be virtualized once every tab is gone.
    if (count === 0) this.virtualizedTabs.clear();
    return count;
  }

  applyDashboardView(view) {
    const setText = (id, text) => {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    };
    const setValue = (id, { text, className }) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.textContent = text;
      element.className = className;
    };

    setText('perf-tab-count', view.tabCount);
    setText('perf-memory', view.memory.text);
    setText('perf-startup', view.startup);
    setText('perf-tab-switch', view.tabSwitch.text);

    // Retained element ids from the earlier dashboard markup.
    setText('active-tabs-count', view.tabCount);
    setValue('memory-usage', view.memory);
    setValue('memory-pressure', view.pressure);
    setValue('tab-switch-avg', view.tabSwitch);

    const status = document.getElementById('perf-status');
    if (status) {
      status.textContent = view.status.status;
      status.className = view.status.className;
      status.title = view.status.tooltip;
    }
  }

  // Phase 6: Enhanced low power mode
  enableLowPowerMode() {

    this.isLowPowerMode = true;
    
    // Reduce performance targets
    this.performanceTargets.maxTabs = 25;
    this.performanceTargets.maxTotalMemory = 100;
    this.maxCacheSize = 20;
    this.maxPoolSize = 2;
    this.maxActiveEditors = 1; // Only one active editor
    
    // Reduce update frequency
    clearInterval(this.memoryMonitor);
    this.memoryMonitor = setInterval(() => {
      this.checkMemoryUsage();
    }, 300000); // Check every 5 minutes
    
    // More aggressive cleanup
    this.setupAggressiveCleanup();
    
    // Reduce memory pressure threshold
    this.memoryPressureThreshold = 0.6; // 60% instead of 80%
  }

  setupAggressiveCleanup() {
    // Clean up more frequently in low-power mode
    setInterval(() => {
      this.performMemoryCleanup();
    }, 300000); // Every 5 minutes
  }

  // Detect if running on older hardware
  detectOlderHardware() {
    const memoryInfo = this.checkMemoryUsage();
    const cores = navigator.hardwareConcurrency || 2;
    
    // Heuristics for older hardware
    const isOlderHardware = (
      (memoryInfo && memoryInfo.limit < 2048) || // Less than 2GB heap limit
      cores < 4 || // Less than 4 CPU cores
      !window.OffscreenCanvas || // Missing modern APIs
      !window.IntersectionObserver
    );
    
    if (isOlderHardware) {

      this.enableLowPowerMode();
    }
    
    return isOlderHardware;
  }
  
  // Phase 6: Initialize tab access tracking for existing tabs
  trackTabAccess(tabId) {
    this.lastAccessTime.set(tabId, Date.now());
    const currentCount = this.tabAccessPattern.get(tabId) || 0;
    this.tabAccessPattern.set(tabId, currentCount + 1);
    
    // Remove from virtualized set when accessed
    if (this.virtualizedTabs.has(tabId)) {
      this.virtualizedTabs.delete(tabId);
    }
  }
  
  // Phase 6: Tab switch performance tracking
  trackTabSwitch(duration, fromTabId, toTabId) {
    const switchMetrics = this.performanceMetrics.get('tabSwitches');
    switchMetrics.push({
      timestamp: Date.now(),
      duration,
      fromTabId,
      toTabId
    });
    
    // Keep only last 50 switches
    if (switchMetrics.length > 50) {
      switchMetrics.shift();
    }
    
    // Track access for both tabs
    if (fromTabId) this.trackTabAccess(fromTabId);
    if (toTabId) this.trackTabAccess(toTabId);
  }
  
  // Phase 6: Unload inactive tab content
  unloadTab(tabId) {
    // Store tab data for later restoration
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
      const tabData = {
        content: tabElement.textContent || '',
        scrollPosition: tabElement.scrollTop || 0,
        timestamp: Date.now()
      };
      
      this.inactiveTabsData.set(tabId, tabData);
      
      // Remove from DOM but keep reference
      tabElement.style.display = 'none';
      this.virtualizedTabs.add(tabId);
      

    }
  }
  
  // Phase 6: Restore unloaded tab
  restoreTab(tabId) {
    if (this.virtualizedTabs.has(tabId)) {
      this.virtualizedTabs.delete(tabId);
    }
    
    const tabData = this.inactiveTabsData.get(tabId);
    if (tabData) {
      const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabElement) {
        tabElement.style.display = '';
        tabElement.scrollTop = tabData.scrollPosition;
        this.inactiveTabsData.delete(tabId);
      }
    }
  }
  
  // Phase 6: Check if tab should be lazy loaded
  shouldLazyLoadTab(tabIndex, totalTabs) {
    return totalTabs > this.lazyLoadThreshold && tabIndex >= this.maxActiveEditors;
  }
  
  // Phase 6: Get average access count for tabs
  cleanupTabTracking(tabId) {
    this.lastAccessTime.delete(tabId);
    this.tabAccessPattern.delete(tabId);
    this.unloadCandidates.delete(tabId);
    this.inactiveTabsData.delete(tabId);
    this.virtualizedTabs.delete(tabId);
    this.tabMemoryUsage.delete(tabId);
  }
  
  // Manual cleanup for virtual tabs when all tabs are closed
  clearAllVirtualTabs() {
    const virtualTabsCleared = this.virtualizedTabs.size;
    for (const tabId of this.virtualizedTabs) this.restoreTab(tabId);

    // Respect the explicit manual action for the rest of this session. A
    // later Clean Memory action or application restart can enable automatic
    // virtualization again.
    this.autoVirtualizationPaused = true;
    this.virtualizedTabs.clear();
    this.lastAccessTime.clear();
    this.tabAccessPattern.clear();
    this.unloadCandidates.clear();
    this.inactiveTabsData.clear();
    this.tabMemoryUsage.clear();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    return { virtualTabsCleared };
  }
  
  // Phase 6: Enhanced cleanup with tab tracking
  destroy() {
    // Stop all intervals
    this.stopMemoryMonitoring();
    
    if (this.memoryPressureMonitor) {
      clearInterval(this.memoryPressureMonitor);
    }
    
    if (this.dashboardUpdateInterval) {
      clearInterval(this.dashboardUpdateInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Clear all maps and caches
    this.tabMemoryUsage.clear();
    this.inactiveTabsData.clear();
    this.performanceMetrics.clear();
    this.tabAccessPattern.clear();
    this.lastAccessTime.clear();
    this.unloadCandidates.clear();
    this.virtualizedTabs.clear();
    
    if (this.previewCache) {
      this.previewCache.clear();
    }
    

  }
}

// Export for use in main application
window.PerformanceOptimizer = PerformanceOptimizer;

// Phase 6: Global performance monitoring utilities
window.PerformanceUtils = {
  // Debounce function for expensive operations
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for frequent operations
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Measure operation performance
  measurePerformance(name, operation) {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  },
  
  // Async performance measurement
  async measureAsyncPerformance(name, operation) {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  }
};

// Phase 6: Performance monitoring integration
if (typeof window !== 'undefined' && window.markdownEditor) {
  // Auto-integrate with existing markdown editor if available
  const editor = window.markdownEditor;
  if (editor.performanceOptimizer) {
    console.log('[PerformanceOptimizer] Phase 6 enhancements loaded');
  }
}
