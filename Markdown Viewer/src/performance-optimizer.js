// Performance Optimizer for Multi-Tab Architecture
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
    
    this.startMemoryMonitoring();
  }

  // Memory optimization for multi-tab architecture
  optimizeForMultiTabs() {
    console.log('[Performance] Optimizing for multi-tab architecture...');
    
    // 1. Implement tab virtualization
    this.setupTabVirtualization();
    
    // 2. Monaco editor pooling
    this.setupMonacoPooling();
    
    // 3. Preview content caching
    this.setupPreviewCaching();
    
    // 4. Memory cleanup strategies
    this.setupMemoryCleanup();
  }

  setupTabVirtualization() {
    // Only keep active tab content in DOM
    // Serialize inactive tab content to lightweight objects
    this.tabContentCache = new Map();
    this.activeTabLimit = 3; // Only keep 3 tabs fully loaded
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
    console.log('[Performance] Performing memory cleanup...');
    
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
    if (!performance.memory) return;
    
    const memoryInfo = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
    
    // Warn if memory usage is high
    if (memoryInfo.used > this.performanceTargets.maxTotalMemory) {
      console.warn(`[Performance] High memory usage: ${memoryInfo.used}MB`);
      this.performMemoryCleanup();
    }
    
    return memoryInfo;
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

  // Get performance report for debugging
  getPerformanceReport() {
    const recentOperations = this.performanceLog.slice(-20);
    const slowOperations = this.performanceLog.filter(op => op.exceeded);
    
    return {
      memoryUsage: this.checkMemoryUsage(),
      recentOperations,
      slowOperations: slowOperations.slice(-10),
      cacheStats: {
        previewCacheSize: this.previewCache.size,
        monacoPoolSize: this.monacoPool.length,
        monacoPoolInUse: this.monacoPool.filter(item => item.inUse).length
      },
      targets: this.performanceTargets
    };
  }

  // Optimize for older computers
  enableLowPowerMode() {
    console.log('[Performance] Enabling low-power mode for older computers...');
    
    // Reduce performance targets
    this.performanceTargets.maxTabs = 20;
    this.performanceTargets.maxTotalMemory = 100;
    this.maxCacheSize = 20;
    this.maxPoolSize = 2;
    
    // Reduce update frequency
    clearInterval(this.memoryMonitor);
    this.memoryMonitor = setInterval(() => {
      this.checkMemoryUsage();
    }, 60000); // Check every minute instead of 30 seconds
    
    // More aggressive cleanup
    this.setupAggressiveCleanup();
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
      console.log('[Performance] Older hardware detected, enabling optimizations');
      this.enableLowPowerMode();
    }
    
    return isOlderHardware;
  }
}

// Export for use in main application
window.PerformanceOptimizer = PerformanceOptimizer;