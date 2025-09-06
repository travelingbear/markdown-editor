// Performance Optimizer for Multi-Tab Architecture - Phase 6 Enhanced
class PerformanceOptimizer {
  constructor() {
    this.performanceTargets = {
      startupTime: 1500,        // Optimized for older computers
      tabSwitchTime: 50,        // Very fast tab switching
      memoryPerTab: 5,          // Max 5MB per tab
      maxTotalMemory: 200,      // Max 200MB total
      previewUpdateTime: 200,   // Reduced update time
      maxTabs: 100              // Maximum allowed tabs
    };
    
    this.memoryMonitor = null;
    this.performanceLog = [];
    this.tabMemoryUsage = new Map();
    this.inactiveTabsData = new Map(); // Lazy loading storage
    this.performanceMetrics = new Map();
    this.memoryPressureThreshold = 0.8; // 80% of available memory
    this.tabUnloadQueue = [];
    this.isLowPowerMode = false;
    
    this.startMemoryMonitoring();
    this.setupPerformanceTracking();
  }

  // Memory optimization for multi-tab architecture - Phase 6 Enhanced
  optimizeForMultiTabs() {
    console.log('[PerformanceOptimizer] Initializing Phase 6 optimizations...');
    
    // 1. Implement tab virtualization with lazy loading
    this.setupTabVirtualization();
    
    // 2. Monaco editor pooling with smart disposal
    this.setupMonacoPooling();
    
    // 3. Preview content caching with intelligent eviction
    this.setupPreviewCaching();
    
    // 4. Memory cleanup strategies with pressure detection
    this.setupMemoryCleanup();
    
    // 5. Phase 6: Lazy loading for inactive tabs
    this.setupLazyTabLoading();
    
    // 6. Phase 6: Smart tab unloading for memory pressure
    this.setupSmartTabUnloading();
    
    // 7. Phase 6: Performance dashboard
    this.setupPerformanceDashboard();
  }

  setupTabVirtualization() {
    // Only keep active tab content in DOM
    // Serialize inactive tab content to lightweight objects
    this.tabContentCache = new Map();
    this.activeTabLimit = 3; // Only keep 3 tabs fully loaded
    this.virtualizedTabs = new Set(); // Track which tabs are virtualized
  }
  
  // Phase 6: Lazy loading for inactive tabs
  setupLazyTabLoading() {
    this.lazyLoadThreshold = 5; // Start lazy loading after 5 tabs
    this.maxActiveEditors = 3; // Maximum Monaco editors to keep active
    
    console.log('[PerformanceOptimizer] Lazy tab loading initialized');
  }
  
  // Phase 6: Smart tab unloading for memory pressure
  setupSmartTabUnloading() {
    this.unloadCandidates = new Map(); // Track tabs eligible for unloading
    this.lastAccessTime = new Map(); // Track when tabs were last accessed
    
    // Monitor memory pressure
    this.memoryPressureMonitor = setInterval(() => {
      this.checkMemoryPressure();
    }, 10000); // Check every 10 seconds
    
    console.log('[PerformanceOptimizer] Smart tab unloading initialized');
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

  setupMonacoPooling() {
    // Pool of Monaco editor instances to reuse
    this.monacoPool = [];
    this.maxPoolSize = 5;
    
    // Pre-create Monaco instances for faster tab switching
    this.preCreateMonacoInstances();
  }

  preCreateMonacoInstances() {
    // Create instances in background for instant tab switching
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createPooledMonacoInstance();
      }, i * 100);
    }
  }

  createPooledMonacoInstance() {
    if (typeof monaco === 'undefined') return;
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    const editor = monaco.editor.create(container, {
      value: '',
      language: 'markdown',
      theme: 'vs',
      automaticLayout: false
    });
    
    this.monacoPool.push({
      editor,
      container,
      inUse: false
    });
  }

  getPooledMonacoInstance() {
    const available = this.monacoPool.find(item => !item.inUse);
    if (available) {
      available.inUse = true;
      return available;
    }
    
    // Create new instance if pool is empty
    this.createPooledMonacoInstance();
    return this.monacoPool[this.monacoPool.length - 1];
  }

  releaseMonacoInstance(instance) {
    instance.inUse = false;
    instance.editor.setValue('');
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

  performMemoryCleanup() {

    
    // Clear old preview cache entries
    this.cleanupPreviewCache();
    
    // Release unused Monaco instances
    this.cleanupMonacoPool();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Log memory usage
    this.logMemoryUsage();
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

  cleanupMonacoPool() {
    // Remove excess unused instances efficiently
    const toKeep = [];
    const toRemove = [];
    let unusedCount = 0;
    
    for (const item of this.monacoPool) {
      if (item.inUse) {
        toKeep.push(item);
      } else if (unusedCount < this.maxPoolSize) {
        toKeep.push(item);
        unusedCount++;
      } else {
        toRemove.push(item);
      }
    }
    
    // Dispose removed instances
    toRemove.forEach(item => {
      item.editor.dispose();
      item.container.remove();
    });
    
    this.monacoPool = toKeep;
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
    }, 30000); // Check every 30 seconds
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
      console.warn(`[Performance] High memory usage: ${memoryInfo.used}MB`);
      this.performMemoryCleanup();
    }
    
    return memoryInfo;
  }
  
  // Phase 6: Memory pressure detection and response
  checkMemoryPressure() {
    const memoryInfo = this.checkMemoryUsage();
    if (!memoryInfo) return;
    
    if (memoryInfo.pressure > this.memoryPressureThreshold) {
      console.warn(`[Performance] Memory pressure detected: ${(memoryInfo.pressure * 100).toFixed(1)}%`);
      this.handleMemoryPressure(memoryInfo);
    }
  }
  
  // Phase 6: Handle memory pressure by unloading tabs
  handleMemoryPressure(memoryInfo) {
    const tabsToUnload = this.selectTabsForUnloading();
    
    if (tabsToUnload.length > 0) {
      console.log(`[Performance] Unloading ${tabsToUnload.length} tabs to free memory`);
      tabsToUnload.forEach(tabId => this.unloadTab(tabId));
      
      // Force garbage collection if available
      if (window.gc) {
        setTimeout(() => window.gc(), 100);
      }
    }
  }
  
  // Phase 6: Select tabs for unloading based on access patterns
  selectTabsForUnloading() {
    const now = Date.now();
    const candidates = [];
    
    for (const [tabId, lastAccess] of this.lastAccessTime.entries()) {
      const timeSinceAccess = now - lastAccess;
      const accessCount = this.tabAccessPattern.get(tabId) || 0;
      
      // Unload tabs not accessed in last 5 minutes with low access count
      if (timeSinceAccess > 300000 && accessCount < 5) {
        candidates.push({ tabId, timeSinceAccess, accessCount });
      }
    }
    
    // Sort by least recently used and least accessed
    candidates.sort((a, b) => {
      if (a.accessCount !== b.accessCount) {
        return a.accessCount - b.accessCount;
      }
      return b.timeSinceAccess - a.timeSinceAccess;
    });
    
    // Return up to 3 tabs for unloading
    return candidates.slice(0, 3).map(c => c.tabId);
  }

  logMemoryUsage() {
    const memoryInfo = this.checkMemoryUsage();
    if (memoryInfo) {
      console.log(`[Performance] Memory: ${memoryInfo.used}MB / ${memoryInfo.total}MB (limit: ${memoryInfo.limit}MB)`);
    }
  }

  // Performance benchmarking for multi-tab operations
  benchmarkTabOperation(operation, startTime, tabCount = 1) {
    const duration = performance.now() - startTime;
    const target = this.getTargetForOperation(operation);
    
    console.log(`[Benchmark] ${operation}: ${duration.toFixed(2)}ms (${tabCount} tabs)`);
    
    if (target && duration > target) {
      console.warn(`[Performance] ${operation} exceeded target: ${duration.toFixed(2)}ms > ${target}ms`);
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
        monacoPoolSize: this.monacoPool?.length || 0,
        monacoPoolInUse: this.monacoPool?.filter(item => item.inUse).length || 0,
        virtualizedTabs: this.virtualizedTabs.size,
        inactiveTabsData: this.inactiveTabsData.size
      },
      tabStats: {
        totalTabs: actualTabCount,
        trackedTabs: this.lastAccessTime.size,
        unloadCandidates: this.unloadCandidates.size,
        averageAccessCount: this.getAverageAccessCount()
      },
      targets: this.performanceTargets,
      isLowPowerMode: this.isLowPowerMode
    };
  }
  
  // Phase 6: Performance dashboard setup
  setupPerformanceDashboard() {
    // Create performance dashboard in settings modal
    this.createPerformanceDashboard();
    
    // Update dashboard every 5 seconds
    this.dashboardUpdateInterval = setInterval(() => {
      this.updatePerformanceDashboard();
    }, 5000);
    
    console.log('[PerformanceOptimizer] Performance dashboard initialized');
  }
  
  // Phase 6: Create performance dashboard UI
  createPerformanceDashboard() {
    const settingsModal = document.getElementById('settings-modal');
    if (!settingsModal) return;
    
    // Check if we're in debug mode (console accessible)
    const isDebugMode = this.isDebugMode();
    
    // Find or create performance section
    let perfSection = settingsModal.querySelector('.performance-section');
    if (!perfSection) {
      perfSection = document.createElement('div');
      perfSection.className = 'performance-section';
      perfSection.innerHTML = `
        <h3>Performance Monitor</h3>
        <div class="performance-grid">
          <div class="perf-metric">
            <label>Memory Usage</label>
            <div id="perf-memory" class="perf-value">--</div>
          </div>
          <div class="perf-metric">
            <label>Active Tabs</label>
            <div id="perf-tabs" class="perf-value">--</div>
          </div>
          <div class="perf-metric">
            <label>Tab Switch Avg</label>
            <div id="perf-switch" class="perf-value">--</div>
          </div>
          <div class="perf-metric">
            <label>Memory Pressure</label>
            <div id="perf-pressure" class="perf-value">--</div>
          </div>
        </div>
        <div class="performance-actions">
          <button id="perf-cleanup-btn" class="settings-btn">Force Cleanup</button>
          ${isDebugMode ? '<button id="perf-report-btn" class="settings-btn">View Report</button>' : ''}
        </div>
      `;
      
      // Insert as its own section in settings content
      const settingsContent = settingsModal.querySelector('.settings-content');
      if (settingsContent) {
        settingsContent.appendChild(perfSection);
      }
    }
    
    // Add event listeners
    const cleanupBtn = document.getElementById('perf-cleanup-btn');
    const reportBtn = document.getElementById('perf-report-btn');
    
    if (cleanupBtn) {
      cleanupBtn.addEventListener('click', () => {
        this.performMemoryCleanup();
        setTimeout(() => this.updatePerformanceDashboard(), 100);
      });
    }
    
    if (reportBtn && isDebugMode) {
      reportBtn.addEventListener('click', () => {
        console.log('[Performance Report]', this.getPerformanceReport());
        alert('Performance report logged to console (F12)');
      });
    }
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
    const memoryEl = document.getElementById('perf-memory');
    const tabsEl = document.getElementById('perf-tabs');
    const switchEl = document.getElementById('perf-switch');
    const pressureEl = document.getElementById('perf-pressure');
    
    if (!memoryEl) return; // Dashboard not created yet
    
    const memoryInfo = this.checkMemoryUsage();
    const report = this.getPerformanceReport();
    
    // Fix memory tracking
    if (memoryInfo && performance.memory) {
      memoryEl.textContent = `${memoryInfo.used}MB / ${memoryInfo.total}MB`;
      memoryEl.className = `perf-value ${memoryInfo.pressure > 0.8 ? 'warning' : memoryInfo.pressure > 0.6 ? 'caution' : 'good'}`;
      
      pressureEl.textContent = `${(memoryInfo.pressure * 100).toFixed(1)}%`;
      pressureEl.className = `perf-value ${memoryInfo.pressure > 0.8 ? 'warning' : memoryInfo.pressure > 0.6 ? 'caution' : 'good'}`;
    } else {
      memoryEl.textContent = 'Not Available';
      memoryEl.className = 'perf-value';
      pressureEl.textContent = 'N/A';
      pressureEl.className = 'perf-value';
    }
    
    if (tabsEl) {
      // Get actual tab count from tab manager
      let actualTabCount = report.tabStats.totalTabs;
      if (window.markdownEditor?.tabManager) {
        actualTabCount = window.markdownEditor.tabManager.getTabsCount();
      }
      tabsEl.textContent = `${actualTabCount} (${report.cacheStats.virtualizedTabs} virtual)`;
    }
    
    if (switchEl) {
      const recentSwitches = this.performanceMetrics.get('tabSwitches').slice(-10);
      if (recentSwitches.length > 0) {
        const avgTime = recentSwitches.reduce((sum, s) => sum + s.duration, 0) / recentSwitches.length;
        switchEl.textContent = `${avgTime.toFixed(1)}ms`;
        switchEl.className = `perf-value ${avgTime > 100 ? 'warning' : avgTime > 50 ? 'caution' : 'good'}`;
      } else {
        switchEl.textContent = 'No data';
        switchEl.className = 'perf-value';
      }
    }
  }

  // Phase 6: Enhanced low power mode
  enableLowPowerMode() {
    console.log('[PerformanceOptimizer] Enabling low power mode for older hardware');
    this.isLowPowerMode = true;
    
    // Reduce performance targets
    this.performanceTargets.maxTabs = 20;
    this.performanceTargets.maxTotalMemory = 100;
    this.maxCacheSize = 20;
    this.maxPoolSize = 2;
    this.activeTabLimit = 2; // Reduce active tabs
    this.maxActiveEditors = 1; // Only one active editor
    
    // Reduce update frequency
    clearInterval(this.memoryMonitor);
    this.memoryMonitor = setInterval(() => {
      this.checkMemoryUsage();
    }, 60000); // Check every minute instead of 30 seconds
    
    // More aggressive cleanup
    this.setupAggressiveCleanup();
    
    // Reduce memory pressure threshold
    this.memoryPressureThreshold = 0.6; // 60% instead of 80%
  }

  setupAggressiveCleanup() {
    // Clean up more frequently in low-power mode
    setInterval(() => {
      this.performMemoryCleanup();
    }, 120000); // Every 2 minutes
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
      console.log('[PerformanceOptimizer] Older hardware detected, enabling optimizations');
      this.enableLowPowerMode();
    }
    
    return isOlderHardware;
  }
  
  // Phase 6: Tab access tracking
  trackTabAccess(tabId) {
    this.lastAccessTime.set(tabId, Date.now());
    const currentCount = this.tabAccessPattern.get(tabId) || 0;
    this.tabAccessPattern.set(tabId, currentCount + 1);
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
      
      console.log(`[PerformanceOptimizer] Tab ${tabId} unloaded to save memory`);
    }
  }
  
  // Phase 6: Restore unloaded tab
  restoreTab(tabId) {
    const tabData = this.inactiveTabsData.get(tabId);
    if (tabData) {
      const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabElement) {
        tabElement.style.display = '';
        tabElement.scrollTop = tabData.scrollPosition;
        this.virtualizedTabs.delete(tabId);
        this.inactiveTabsData.delete(tabId);
        
        console.log(`[PerformanceOptimizer] Tab ${tabId} restored from virtual state`);
      }
    }
  }
  
  // Phase 6: Check if tab should be lazy loaded
  shouldLazyLoadTab(tabIndex, totalTabs) {
    return totalTabs > this.lazyLoadThreshold && tabIndex >= this.maxActiveEditors;
  }
  
  // Phase 6: Get average access count for tabs
  getAverageAccessCount() {
    if (this.tabAccessPattern.size === 0) return 0;
    
    const totalAccess = Array.from(this.tabAccessPattern.values()).reduce((sum, count) => sum + count, 0);
    return Math.round(totalAccess / this.tabAccessPattern.size);
  }
  
  // Phase 6: Clean up tab tracking data
  cleanupTabTracking(tabId) {
    this.lastAccessTime.delete(tabId);
    this.tabAccessPattern.delete(tabId);
    this.unloadCandidates.delete(tabId);
    this.inactiveTabsData.delete(tabId);
    this.virtualizedTabs.delete(tabId);
    this.tabMemoryUsage.delete(tabId);
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
    
    // Clean up Monaco pool
    if (this.monacoPool) {
      this.monacoPool.forEach(item => {
        if (item.editor) item.editor.dispose();
        if (item.container) item.container.remove();
      });
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
    
    console.log('[PerformanceOptimizer] Cleanup completed');
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