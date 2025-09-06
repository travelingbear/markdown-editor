/**
 * Base Component Class
 * Provides common functionality for all components in the markdown editor
 */
class BaseComponent {
  constructor(name, options = {}) {
    this.name = name;
    this.options = options;
    this.isInitialized = false;
    this.eventListeners = new Map();
    this.childComponents = new Map();
    this.parentComponent = null;
    
    // Performance tracking
    this.performanceMetrics = {
      initTime: 0,
      lastUpdateTime: 0,
      updateCount: 0
    };
  }

  /**
   * Initialize the component
   * Override this method in child components
   */
  async init() {
    const startTime = performance.now();
    
    try {
      await this.onInit();
      this.isInitialized = true;
      this.performanceMetrics.initTime = performance.now() - startTime;
      this.emit('initialized', { component: this.name });
    } catch (error) {
      console.error(`[${this.name}] Initialization failed:`, error);
      throw error;
    }
  }

  /**
   * Override this method in child components for initialization logic
   */
  async onInit() {
    // Default implementation - override in child components
  }

  /**
   * Update the component
   * Override this method in child components
   */
  async update(data = {}) {
    if (!this.isInitialized) {
      console.warn(`[${this.name}] Cannot update - component not initialized`);
      return;
    }

    const startTime = performance.now();
    
    try {
      await this.onUpdate(data);
      this.performanceMetrics.lastUpdateTime = performance.now() - startTime;
      this.performanceMetrics.updateCount++;
      this.emit('updated', { component: this.name, data });
    } catch (error) {
      console.error(`[${this.name}] Update failed:`, error);
      throw error;
    }
  }

  /**
   * Override this method in child components for update logic
   */
  async onUpdate(data) {
    // Default implementation - override in child components
  }

  /**
   * Destroy the component and cleanup resources
   */
  destroy() {
    try {
      this.onDestroy();
      this.cleanup();
      this.emit('destroyed', { component: this.name });
    } catch (error) {
      console.error(`[${this.name}] Destroy failed:`, error);
    }
  }

  /**
   * Override this method in child components for cleanup logic
   */
  onDestroy() {
    // Default implementation - override in child components
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data = {}) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[${this.name}] Event callback error:`, error);
        }
      });
    }

    // Bubble up to parent component
    if (this.parentComponent) {
      this.parentComponent.emit(`${this.name}:${event}`, data);
    }
  }

  /**
   * Add child component
   */
  addChild(component) {
    if (component instanceof BaseComponent) {
      this.childComponents.set(component.name, component);
      component.parentComponent = this;
    }
  }

  /**
   * Remove child component
   */
  removeChild(componentName) {
    if (this.childComponents.has(componentName)) {
      const component = this.childComponents.get(componentName);
      component.parentComponent = null;
      this.childComponents.delete(componentName);
    }
  }

  /**
   * Get child component
   */
  getChild(componentName) {
    return this.childComponents.get(componentName);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      averageUpdateTime: this.performanceMetrics.updateCount > 0 
        ? this.performanceMetrics.lastUpdateTime / this.performanceMetrics.updateCount 
        : 0
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Clear event listeners
    this.eventListeners.clear();
    
    // Destroy child components
    this.childComponents.forEach(component => {
      component.destroy();
    });
    this.childComponents.clear();
    
    // Clear parent reference
    this.parentComponent = null;
    
    this.isInitialized = false;
  }

  /**
   * Get component state for debugging
   */
  getState() {
    return {
      name: this.name,
      isInitialized: this.isInitialized,
      childCount: this.childComponents.size,
      eventListenerCount: Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      performanceMetrics: this.getPerformanceMetrics()
    };
  }
}

// Export for use in other components
window.BaseComponent = BaseComponent;