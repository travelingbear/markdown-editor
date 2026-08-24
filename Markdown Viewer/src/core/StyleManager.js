import darkThemeUrl from '../styles/themes/dark.css?url';
import retroThemeUrl from '../styles/themes/retro.css?url';
import contrastThemeUrl from '../styles/themes/contrast.css?url';
import printStylesUrl from '../styles/utilities/print.css?url';
import markdownToolbarStylesUrl from '../styles/features/markdown-toolbar.css?url';
import settingsModalStylesUrl from '../styles/features/settings-modal.css?url';
import tabSystemStylesUrl from '../styles/features/tab-system.css?url';

const THEME_URLS = {
  dark: darkThemeUrl,
  retro: retroThemeUrl,
  contrast: contrastThemeUrl
};

const FEATURE_URLS = {
  'utilities/print': printStylesUrl,
  'features/markdown-toolbar': markdownToolbarStylesUrl,
  'features/settings-modal': settingsModalStylesUrl,
  'features/tab-system': tabSystemStylesUrl
};

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
  }

  /**
   * Preload a theme for faster switching (only when needed)
   * @param {string} themeName - Theme name to preload
   */
  async preloadTheme(themeName) {
    if (themeName !== 'light' && !this.preloadedThemes.has(themeName)) {
      // Only preload when user is about to switch themes
      const link = document.createElement('link');
      link.rel = 'prefetch'; // Use prefetch instead of preload
      link.href = THEME_URLS[themeName];
      link.setAttribute('data-prefetch-theme', themeName);
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
      const themeUrl = THEME_URLS[themeName];
      if (!themeUrl) {
        this.isTransitioning = false;
        document.body.classList.remove('theme-transitioning');
        throw new Error(`Unknown theme: ${themeName}`);
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = themeUrl;
      link.setAttribute('data-theme', themeName);
      
      // Wait for CSS to load before applying theme class
      await new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve; // Continue even if load fails
        document.head.appendChild(link);
      });
    }
    
    this.currentTheme = themeName;
    this.loadedThemes.add(themeName);
    
    // Preserve existing classes while updating theme
    const existingClasses = Array.from(document.body.classList)
      .filter(cls => !cls.endsWith('-theme'));
    document.body.className = [...existingClasses, `${themeName}-theme`].join(' ');
    
    // Remove transition class after a brief delay
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
      this.isTransitioning = false;
    }, 200);
  }

  /**
   * Keep the theme stylesheet last in <head>.
   *
   * Themes and feature stylesheets are both injected at runtime, and features
   * load on first use -- settings-modal.css arrives the first time Settings is
   * opened, which is long after the theme loaded at startup. Whichever lands
   * later wins at equal specificity, so without this a feature rule silently
   * outranks the theme and the only defence is `!important`.
   *
   * Moving an already-loaded <link> does not refetch it; it only changes where
   * it sits in the cascade.
   */
  moveThemeLast() {
    // Scoped to <head>: `data-theme` also sits on <body> and the root element,
    // and neither belongs in the stylesheet order.
    document.head
      .querySelectorAll('link[data-theme], style[data-theme]')
      .forEach(sheet => document.head.appendChild(sheet));
  }

  /**
   * Load a feature CSS file
   * @param {string} featureName - Feature name (print, markdown-toolbar, settings-modal, etc.)
   * @param {string} type - Type of feature ('utilities' or 'features')
   */
  async loadFeature(featureName, type = 'utilities') {
    if (!this.loadedFeatures.has(featureName)) {
      const featureUrl = FEATURE_URLS[`${type}/${featureName}`];
      if (!featureUrl) {
        throw new Error(`Unknown feature stylesheet: ${type}/${featureName}`);
      }

      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = featureUrl;
        link.setAttribute('data-feature', featureName);
        
        link.onload = () => {
          this.loadedFeatures.add(featureName);
          this.moveThemeLast();
          resolve();
        };
        
        link.onerror = () => {
          reject(new Error(`Failed to load ${featureName}.css`));
        };
        
        document.head.appendChild(link);
        this.moveThemeLast();
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
