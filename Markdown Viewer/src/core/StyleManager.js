/**
 * StyleManager - Dynamic CSS Loading System
 * Handles on-demand loading of themes and features
 */
class StyleManager {
  constructor() {
    this.loadedThemes = new Set();
    this.loadedFeatures = new Set();
    this.currentTheme = 'light';
    this.preloadedThemes = new Set();
    this.isTransitioning = false;
    
    // Preload popular dark theme for faster switching
    this.preloadTheme('dark');
  }

  /**
   * Preload a theme for faster switching
   * @param {string} themeName - Theme name to preload
   */
  async preloadTheme(themeName) {
    if (themeName !== 'light' && !this.preloadedThemes.has(themeName)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = `./styles/themes/${themeName}.css`;
      link.setAttribute('data-preload-theme', themeName);
      document.head.appendChild(link);
      this.preloadedThemes.add(themeName);
    }
  }

  /**
   * Load a theme dynamically with smooth transitions
   * @param {string} themeName - Theme name (dark, retro, contrast)
   */
  async loadTheme(themeName) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Add transition class for smooth switching
    document.body.classList.add('theme-transitioning');
    
    // Remove previous theme
    document.querySelectorAll('link[data-theme]').forEach(link => link.remove());
    
    if (themeName !== 'light') { // Light is default in main CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./styles/themes/${themeName}.css`;
      link.setAttribute('data-theme', themeName);
      
      // Wait for CSS to load before applying theme class
      await new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve; // Continue even if load fails
        document.head.appendChild(link);
      });
    }
    
    this.currentTheme = themeName;
    document.body.className = `${themeName}-theme`;
    
    // Remove transition class after a brief delay
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
      this.isTransitioning = false;
    }, 200);
  }

  /**
   * Load a feature CSS file
   * @param {string} featureName - Feature name (print, markdown-toolbar, settings-modal, etc.)
   * @param {string} type - Type of feature ('utilities' or 'features')
   */
  async loadFeature(featureName, type = 'utilities') {
    if (!this.loadedFeatures.has(featureName)) {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `./styles/${type}/${featureName}.css`;
        link.setAttribute('data-feature', featureName);
        
        link.onload = () => {
          this.loadedFeatures.add(featureName);
          resolve();
        };
        
        link.onerror = () => {
          reject(new Error(`Failed to load ${featureName}.css`));
        };
        
        document.head.appendChild(link);
      });
    }
  }

  /**
   * Unload a feature CSS file
   * @param {string} featureName - Feature name to unload
   */
  unloadFeature(featureName) {
    document.querySelector(`link[data-feature="${featureName}"]`)?.remove();
    this.loadedFeatures.delete(featureName);
  }

  /**
   * Load print styles when printing
   */
  async loadPrintStyles() {
    await this.loadFeature('print', 'utilities');
  }

  /**
   * Load markdown toolbar styles
   */
  async loadMarkdownToolbar() {
    await this.loadFeature('markdown-toolbar', 'features');
  }

  /**
   * Load settings modal styles
   */
  async loadSettingsModal() {
    await this.loadFeature('settings-modal', 'features');
  }

  /**
   * Load tab system styles
   */
  async loadTabSystem() {
    await this.loadFeature('tab-system', 'features');
  }

  /**
   * Check if a feature is loaded
   * @param {string} featureName - Feature name to check
   * @returns {boolean}
   */
  isFeatureLoaded(featureName) {
    return this.loadedFeatures.has(featureName);
  }

  /**
   * Get performance metrics
   * @returns {object} Performance data
   */
  getPerformanceMetrics() {
    return {
      loadedThemes: Array.from(this.loadedThemes),
      preloadedThemes: Array.from(this.preloadedThemes),
      loadedFeatures: Array.from(this.loadedFeatures),
      currentTheme: this.currentTheme,
      totalStylesheets: document.querySelectorAll('link[rel="stylesheet"], link[data-theme], link[data-feature]').length
    };
  }
}

// Create global instance
window.styleManager = new StyleManager();

// Ensure print styles are loaded when printing
window.addEventListener('beforeprint', async () => {
  if (window.styleManager) {
    await window.styleManager.loadPrintStyles();
  }
});