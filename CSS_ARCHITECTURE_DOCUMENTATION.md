# CSS Architecture Documentation

## Overview

The Markdown Editor uses a **Dynamic CSS Loading Architecture** that separates core styles from themes and features. This modular approach provides better performance, maintainability, and extensibility.

## Architecture Principles

### 🎯 Core Philosophy
- **Lean Core**: Main `styles.css` contains only essential layout and light theme
- **Dynamic Loading**: Themes and features load on-demand
- **Modular Design**: Each theme/feature in separate files
- **Performance First**: Only load what's needed when needed

### 📁 File Structure
```
src/
├── styles.css                    # Core styles (~500 lines)
├── core/
│   └── StyleManager.js           # Dynamic loading system
└── styles/
    ├── themes/                   # Theme files
    │   ├── dark.css             # Dark theme
    │   ├── retro.css            # Windows 3.1 retro theme
    │   └── contrast.css         # High contrast theme
    ├── features/                 # Feature-specific styles
    │   ├── markdown-toolbar.css # Markdown toolbar
    │   ├── settings-modal.css   # Settings modal
    │   └── tab-system.css       # Tab management UI
    └── utilities/                # Utility styles
        └── print.css            # Print-specific styles
```

## Core CSS System

### styles.css Structure
The main stylesheet contains only essential elements:

```css
/* 1. CSS Variables (Theme-agnostic) */
:root {
  --bg-primary: #f5f5f5;
  --text-primary: #333;
  --border-color: #ddd;
  /* ... */
}

/* 2. Base Styles */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* 3. Core Layout */
.app { display: flex; flex-direction: column; height: 100vh; }
.toolbar { /* essential toolbar layout */ }
.main-content { /* main content area */ }
.editor-pane { /* Monaco editor container */ }
.preview-pane { /* markdown preview area */ }
.status-bar { /* bottom status bar */ }

/* 4. Light Theme (Default - No Loading Required) */
/* Light theme uses default CSS variables */
```

### CSS Variables System
All themes use the same CSS variable names for consistency:

```css
:root {
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  
  /* Text Colors */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #adb5bd;
  
  /* Border Colors */
  --border-color: #dee2e6;
  --border-hover: #adb5bd;
  
  /* Interactive Colors */
  --accent-color: #007bff;
  --accent-hover: #0056b3;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  
  /* Component-Specific */
  --toolbar-bg: var(--bg-secondary);
  --editor-bg: var(--bg-primary);
  --preview-bg: var(--bg-primary);
  --modal-bg: var(--bg-primary);
  --tab-bg: var(--bg-tertiary);
}
```

## StyleManager API

### Core Methods

```javascript
// Theme Management
await styleManager.loadTheme('dark');        // Load dark theme
await styleManager.preloadTheme('retro');    // Preload for faster switching

// Feature Loading
await styleManager.loadMarkdownToolbar();    // Load toolbar styles
await styleManager.loadSettingsModal();      // Load modal styles
await styleManager.loadTabSystem();          // Load tab system styles
await styleManager.loadPrintStyles();        // Load print styles

// Utility Methods
styleManager.isFeatureLoaded('print');       // Check if feature loaded
styleManager.unloadFeature('modal');         // Unload feature
styleManager.getPerformanceMetrics();        // Get loading stats
```

### Automatic Loading
Some features load automatically:
- **Print styles**: Load on `beforeprint` event
- **Toolbar styles**: Load when ToolbarComponent initializes
- **Modal styles**: Load when settings modal opens
- **Tab styles**: Load when TabUIController initializes

## Theme Development

### Creating New Themes

1. **Create theme file**: `src/styles/themes/mytheme.css`
2. **Use CSS variables**: Override existing variables
3. **Add theme class**: Use `.mytheme-theme` selector
4. **Register theme**: Add to theme selector in UI

### Theme Template
```css
/* src/styles/themes/mytheme.css */

/* Theme-specific variable overrides */
.mytheme-theme {
  --bg-primary: #your-color;
  --bg-secondary: #your-color;
  --text-primary: #your-color;
  /* ... override all necessary variables ... */
}

/* Component-specific overrides if needed */
.mytheme-theme .toolbar {
  /* specific toolbar styling */
}

.mytheme-theme .preview-pane {
  /* specific preview styling */
}

/* Monaco editor theme integration */
.mytheme-theme .monaco-editor {
  /* editor-specific overrides */
}
```

### Theme Best Practices

1. **Use CSS Variables**: Always override variables, not direct properties
2. **Maintain Contrast**: Ensure good readability ratios
3. **Test All Components**: Verify toolbar, modal, tabs, editor, preview
4. **Support Both Modes**: Consider split-view appearance
5. **Monaco Integration**: Test with Monaco editor themes

### Existing Themes

#### Dark Theme (`dark.css`)
- Modern dark interface
- Uses `[data-theme="dark"]` and `.dark-theme` selectors
- Integrates with Monaco's dark theme
- Optimized for long coding sessions

#### Retro Theme (`retro.css`)
- Windows 3.1 inspired design
- Classic gray color scheme
- Pixelated borders and buttons
- Nostalgic computing experience

#### Contrast Theme (`contrast.css`)
- High contrast for accessibility
- Strong color differentiation
- Meets WCAG guidelines
- Optimized for visual impairments

## Feature Development

### Creating Feature Styles

1. **Create feature file**: `src/styles/features/myfeature.css`
2. **Scope styles**: Use specific class prefixes
3. **Support all themes**: Use CSS variables
4. **Load dynamically**: Add StyleManager method

### Feature Template
```css
/* src/styles/features/myfeature.css */

/* Feature-specific styles using CSS variables */
.my-feature {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.my-feature__header {
  background: var(--bg-tertiary);
  padding: 0.5rem;
}

.my-feature__content {
  padding: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .my-feature {
    /* mobile styles */
  }
}

/* Theme-specific overrides if absolutely necessary */
.dark-theme .my-feature {
  /* dark theme specific styles */
}
```

### Loading Feature Styles
```javascript
// Add method to StyleManager
async loadMyFeature() {
  await this.loadFeature('myfeature', 'features');
}

// Load in component
class MyFeatureComponent {
  async onInit() {
    await window.styleManager.loadMyFeature();
  }
}
```

## Extension Guidelines

### Plugin CSS Architecture

1. **Separate Plugin Styles**: Create `plugins/myplugin/styles.css`
2. **Use CSS Variables**: Integrate with theme system
3. **Namespace Classes**: Prefix with plugin name
4. **Dynamic Loading**: Load only when plugin active

### Plugin Style Template
```css
/* plugins/myplugin/styles.css */

/* Plugin namespace */
.myplugin-container {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.myplugin-button {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
}

.myplugin-button:hover {
  background: var(--accent-hover);
}

/* Plugin-specific variables if needed */
.myplugin-container {
  --plugin-accent: var(--accent-color);
  --plugin-spacing: 1rem;
}
```

### Plugin Integration
```javascript
class MyPlugin {
  async activate() {
    // Load plugin styles
    await this.loadPluginStyles();
  }
  
  async loadPluginStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './plugins/myplugin/styles.css';
    link.setAttribute('data-plugin', 'myplugin');
    document.head.appendChild(link);
  }
  
  deactivate() {
    // Remove plugin styles
    document.querySelector('[data-plugin="myplugin"]')?.remove();
  }
}
```

## Performance Optimization

### Loading Strategy
- **Core First**: Essential styles load immediately
- **Theme Preloading**: Popular themes preloaded
- **Feature On-Demand**: Features load when needed
- **Smooth Transitions**: CSS transitions for theme switching

### Bundle Analysis
```javascript
// Analyze CSS loading performance
const metrics = styleManager.getPerformanceMetrics();
console.log('Loaded themes:', metrics.loadedThemes);
console.log('Loaded features:', metrics.loadedFeatures);
console.log('Total stylesheets:', metrics.totalStylesheets);
```

### Memory Management
- **Unload Unused**: Remove feature styles when not needed
- **Cache Preloaded**: Keep popular themes in memory
- **Lazy Loading**: Load features only when components initialize

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
.component {
  /* Mobile styles (default) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}

@media (min-width: 1440px) {
  .component {
    /* Large desktop styles */
  }
}
```

### Responsive Variables
```css
:root {
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
}

@media (min-width: 768px) {
  :root {
    --spacing-sm: 0.75rem;
    --spacing-md: 1.25rem;
    --spacing-lg: 2rem;
  }
}
```

## Accessibility

### Color Contrast
- **WCAG AA**: Minimum 4.5:1 ratio for normal text
- **WCAG AAA**: Minimum 7:1 ratio for enhanced accessibility
- **Test Tools**: Use contrast checkers for all themes

### Focus Management
```css
/* Visible focus indicators */
.button:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Screen Reader Support
```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Debugging and Development

### CSS Debugging
```css
/* Debug mode styles */
.debug * {
  outline: 1px solid red;
}

.debug .component {
  background: rgba(255, 0, 0, 0.1);
}
```

### Development Tools
```javascript
// Check loaded styles
console.log(styleManager.getPerformanceMetrics());

// Force reload theme
await styleManager.loadTheme(styleManager.currentTheme);

// Test feature loading
await styleManager.loadFeature('test-feature', 'features');
```

### Common Issues

1. **Theme Not Loading**: Check file path and CSS syntax
2. **Variables Not Working**: Ensure proper CSS variable usage
3. **Styles Conflicting**: Use more specific selectors
4. **Performance Issues**: Check for unused loaded features

## Migration Guide

### From Static to Dynamic CSS

1. **Extract Theme Styles**: Move theme-specific CSS to separate files
2. **Use CSS Variables**: Replace hardcoded colors with variables
3. **Update Components**: Add dynamic loading calls
4. **Test All Themes**: Verify functionality across themes
5. **Performance Test**: Measure loading improvements

### Updating Existing Themes

1. **Add CSS Variables**: Replace direct properties
2. **Support Both Selectors**: Use both class and data-attribute selectors
3. **Test Components**: Verify all UI elements work
4. **Update Loading**: Ensure proper dynamic loading

## Best Practices Summary

### Theme Development
- Use CSS variables for all colors and spacing
- Test with all existing components
- Maintain accessibility standards
- Support both light and dark preferences

### Feature Development
- Scope styles with specific class prefixes
- Use CSS variables for theme compatibility
- Load styles dynamically when needed
- Unload when feature is disabled

### Performance
- Keep core CSS minimal
- Preload popular themes
- Load features on-demand
- Use CSS transitions for smooth UX

### Maintenance
- Document all CSS variables
- Use consistent naming conventions
- Test across all themes
- Monitor bundle size and performance