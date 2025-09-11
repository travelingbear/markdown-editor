/**
 * StyleManager - Dynamic CSS Loading System
 * Handles on-demand loading of themes and features
 */
class StyleManager {
  constructor() {
    this.loadedThemes = new Set();
    this.loadedFeatures = new Set();
    this.currentTheme = 'light';
  }

  /**
   * Load a theme dynamically
   * @param {string} themeName - Theme name (dark, retro, contrast)
   */
  async loadTheme(themeName) {
    // Remove previous theme
    document.querySelectorAll('link[data-theme]').forEach(link => link.remove());
    
    if (themeName !== 'light') { // Light is default in main CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./styles/themes/${themeName}.css`;
      link.setAttribute('data-theme', themeName);
      document.head.appendChild(link);
    }
    
    this.currentTheme = themeName;
    document.body.className = `${themeName}-theme`;
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
   * Check if a feature is loaded
   * @param {string} featureName - Feature name to check
   * @returns {boolean}
   */
  isFeatureLoaded(featureName) {
    return this.loadedFeatures.has(featureName);
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