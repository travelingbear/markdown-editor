# CSS Examples and Tutorials

## Quick Start Examples

### Creating Your First Theme

**Step 1: Create the theme file**
```bash
# Create new theme file
touch src/styles/themes/ocean.css
```

**Step 2: Define the theme**
```css
/* src/styles/themes/ocean.css */
.ocean-theme {
  /* Ocean color palette */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  --accent-color: #0ea5e9;
  --accent-hover: #0284c7;
  
  --border-color: #475569;
  --border-hover: #64748b;
}

/* Optional: Component-specific styling */
.ocean-theme .toolbar {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.ocean-theme .preview-pane {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}
```

**Step 3: Add to theme selector**
```javascript
// In UIController or theme management code
const themes = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'retro', label: 'Retro' },
  { name: 'ocean', label: 'Ocean' }  // Add your theme
];
```

### Creating a Custom Feature

**Step 1: Create feature CSS**
```css
/* src/styles/features/code-highlighter.css */

.code-highlighter {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.code-highlighter__header {
  background: var(--bg-tertiary);
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-highlighter__language {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.code-highlighter__copy-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.code-highlighter__copy-btn:hover {
  background: var(--accent-hover);
}

.code-highlighter__content {
  padding: 1rem;
  overflow-x: auto;
}

.code-highlighter__content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Responsive design */
@media (max-width: 768px) {
  .code-highlighter__header {
    padding: 0.375rem 0.75rem;
  }
  
  .code-highlighter__content {
    padding: 0.75rem;
  }
}
```

**Step 2: Add StyleManager method**
```javascript
// Add to StyleManager class
async loadCodeHighlighter() {
  await this.loadFeature('code-highlighter', 'features');
}
```

**Step 3: Use in component**
```javascript
class CodeHighlighterComponent {
  async onInit() {
    // Load styles when component initializes
    await window.styleManager.loadCodeHighlighter();
    this.setupHighlighter();
  }
  
  setupHighlighter() {
    // Component logic here
  }
}
```

## Advanced Theme Examples

### Gradient Theme
```css
/* src/styles/themes/gradient.css */
.gradient-theme {
  --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --bg-tertiary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  
  --text-primary: #ffffff;
  --text-secondary: #f0f0f0;
  --text-muted: #d0d0d0;
  
  --accent-color: #ff6b6b;
  --accent-hover: #ff5252;
}

.gradient-theme .app {
  background: var(--bg-primary);
}

.gradient-theme .toolbar {
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
}

.gradient-theme .preview-pane {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}
```

### Minimalist Theme
```css
/* src/styles/themes/minimal.css */
.minimal-theme {
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --bg-tertiary: #ffffff;
  
  --text-primary: #000000;
  --text-secondary: #666666;
  --text-muted: #999999;
  
  --accent-color: #000000;
  --accent-hover: #333333;
  
  --border-color: #e0e0e0;
  --border-hover: #cccccc;
}

.minimal-theme .toolbar {
  border-bottom: 1px solid var(--border-color);
  box-shadow: none;
}

.minimal-theme .button {
  border: 1px solid var(--border-color);
  background: transparent;
}

.minimal-theme .button:hover {
  background: var(--bg-tertiary);
}
```

## Feature Examples

### Notification System
```css
/* src/styles/features/notifications.css */

.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
}

.notification {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}

.notification.show {
  transform: translateX(0);
}

.notification--success {
  border-left: 4px solid var(--success-color);
}

.notification--warning {
  border-left: 4px solid var(--warning-color);
}

.notification--error {
  border-left: 4px solid var(--danger-color);
}

.notification__title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.notification__message {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.notification__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.25rem;
}
```

### Sidebar Component
```css
/* src/styles/features/sidebar.css */

.sidebar {
  width: 250px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  height: 100%;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.sidebar--collapsed {
  transform: translateX(-100%);
}

.sidebar__header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.sidebar__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.sidebar__content {
  padding: 1rem;
}

.sidebar__section {
  margin-bottom: 1.5rem;
}

.sidebar__section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.sidebar__item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar__item:hover {
  background: var(--bg-tertiary);
}

.sidebar__item--active {
  background: var(--accent-color);
  color: white;
}

.sidebar__toggle {
  position: absolute;
  top: 1rem;
  left: 260px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: left 0.3s ease;
}

.sidebar--collapsed + .sidebar__toggle {
  left: 10px;
}
```

## Plugin Integration Examples

### Plugin with Custom Theme Support
```css
/* plugins/myplugin/styles.css */

/* Plugin base styles */
.myplugin {
  --plugin-primary: var(--accent-color);
  --plugin-secondary: var(--bg-secondary);
  --plugin-text: var(--text-primary);
}

.myplugin-panel {
  background: var(--plugin-secondary);
  color: var(--plugin-text);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
}

.myplugin-button {
  background: var(--plugin-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.myplugin-button:hover {
  opacity: 0.9;
}

/* Theme-specific overrides */
.dark-theme .myplugin {
  --plugin-primary: #4ade80;
}

.retro-theme .myplugin {
  --plugin-primary: #c0c0c0;
  border-style: outset;
  border-width: 2px;
}

.retro-theme .myplugin-button {
  border-style: outset;
  border-width: 2px;
  border-color: #808080;
}
```

### Dynamic Plugin Loading
```javascript
class PluginManager {
  constructor() {
    this.loadedPlugins = new Map();
  }
  
  async loadPlugin(pluginName) {
    if (!this.loadedPlugins.has(pluginName)) {
      // Load plugin styles
      await this.loadPluginStyles(pluginName);
      
      // Load plugin script
      await this.loadPluginScript(pluginName);
      
      this.loadedPlugins.set(pluginName, true);
    }
  }
  
  async loadPluginStyles(pluginName) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./plugins/${pluginName}/styles.css`;
      link.setAttribute('data-plugin-style', pluginName);
      
      link.onload = resolve;
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }
  
  unloadPlugin(pluginName) {
    // Remove plugin styles
    document.querySelector(`[data-plugin-style="${pluginName}"]`)?.remove();
    
    // Remove plugin from loaded list
    this.loadedPlugins.delete(pluginName);
  }
}
```

## Responsive Design Examples

### Mobile-First Toolbar
```css
/* src/styles/features/responsive-toolbar.css */

.responsive-toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
}

.responsive-toolbar__menu-toggle {
  display: block;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.responsive-toolbar__actions {
  display: none;
  flex: 1;
  justify-content: space-between;
}

.responsive-toolbar__actions--open {
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
  flex-direction: column;
  padding: 0.5rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .responsive-toolbar__menu-toggle {
    display: none;
  }
  
  .responsive-toolbar__actions {
    display: flex;
    position: static;
    flex-direction: row;
    background: transparent;
    border: none;
    padding: 0;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .responsive-toolbar {
    padding: 0.75rem 1rem;
  }
}
```

### Adaptive Grid System
```css
/* src/styles/utilities/grid.css */

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.grid--2-cols {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.grid--3-cols {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.grid--4-cols {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  .grid {
    gap: 1.5rem;
  }
  
  .grid--tablet-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    gap: 2rem;
  }
  
  .grid--desktop-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .grid--desktop-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Performance Optimization Examples

### Lazy Loading CSS
```javascript
class LazyStyleLoader {
  constructor() {
    this.loadedStyles = new Set();
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }
  
  observeElement(element, styleName) {
    element.setAttribute('data-lazy-style', styleName);
    this.observer.observe(element);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const styleName = entry.target.getAttribute('data-lazy-style');
        this.loadStyle(styleName);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  async loadStyle(styleName) {
    if (!this.loadedStyles.has(styleName)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./styles/lazy/${styleName}.css`;
      document.head.appendChild(link);
      this.loadedStyles.add(styleName);
    }
  }
}
```

### CSS Critical Path
```css
/* Critical styles - inline in HTML */
.app { display: flex; flex-direction: column; height: 100vh; }
.toolbar { height: 60px; background: #f5f5f5; }
.main-content { flex: 1; display: flex; }
.editor-pane { flex: 1; }
.preview-pane { flex: 1; }

/* Non-critical styles - load async */
/* Everything else loads via StyleManager */
```

## Testing and Debugging

### CSS Testing Utilities
```css
/* src/styles/utilities/debug.css */

.debug-mode * {
  outline: 1px solid red !important;
}

.debug-mode .component {
  position: relative;
}

.debug-mode .component::before {
  content: attr(class);
  position: absolute;
  top: 0;
  left: 0;
  background: red;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  z-index: 9999;
}

/* Performance debugging */
.perf-debug {
  border: 2px solid orange;
  background: rgba(255, 165, 0, 0.1);
}

.perf-debug::after {
  content: 'PERF: ' attr(data-perf-info);
  position: absolute;
  background: orange;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
}
```

### Theme Testing Checklist
```javascript
// Theme testing utility
class ThemeValidator {
  validateTheme(themeName) {
    const requiredVariables = [
      '--bg-primary', '--bg-secondary', '--bg-tertiary',
      '--text-primary', '--text-secondary', '--text-muted',
      '--accent-color', '--accent-hover',
      '--border-color', '--border-hover'
    ];
    
    const computedStyle = getComputedStyle(document.documentElement);
    const missing = [];
    
    requiredVariables.forEach(variable => {
      const value = computedStyle.getPropertyValue(variable);
      if (!value || value.trim() === '') {
        missing.push(variable);
      }
    });
    
    if (missing.length > 0) {
      console.warn(`Theme ${themeName} missing variables:`, missing);
      return false;
    }
    
    return true;
  }
  
  testAllThemes() {
    const themes = ['light', 'dark', 'retro', 'contrast'];
    themes.forEach(theme => {
      styleManager.loadTheme(theme).then(() => {
        setTimeout(() => {
          this.validateTheme(theme);
        }, 100);
      });
    });
  }
}
```

This comprehensive documentation provides practical examples for extending the CSS architecture with new themes, features, and plugins while maintaining performance and consistency.