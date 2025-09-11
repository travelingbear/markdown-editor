# CSS Refactoring Plan - Breaking Down styles.css

## Current State Analysis

The `styles.css` file is **4,200+ lines** and contains multiple concerns mixed together. This makes it difficult to maintain, debug, and collaborate on. The file contains:

- CSS Variables and root styles
- Base/reset styles
- Component-specific styles (toolbar, editor, preview, etc.)
- Theme variations (light, dark, retro)
- Responsive design rules
- Print styles
- Modal and overlay styles
- Advanced features (mermaid, katex, task lists)

## Architecture Compatibility

**Excellent alignment with decoupled controller architecture:**
- 8 specialized controllers provide natural CSS module boundaries
- Plugin system enables dynamic CSS loading
- Hook system allows gradual CSS migration
- Existing theme switching in UIController works seamlessly with modular themes
- Lower risk due to isolated controller responsibilities

## Proposed File Structure

```
src/styles/
├── base/
│   ├── variables.css          # CSS custom properties
│   ├── reset.css             # Base resets and typography
│   └── themes.css            # Theme definitions
├── components/
│   ├── toolbar.css           # Main toolbar styles
│   ├── editor.css            # Monaco editor and fallback
│   ├── preview.css           # Preview pane and content
│   ├── status-bar.css        # Status bar
│   ├── tabs.css              # Tab system
│   ├── modals.css            # All modal dialogs
│   └── welcome.css           # Welcome screen
├── features/
│   ├── markdown-toolbar.css  # Markdown editing toolbar
│   ├── advanced-content.css  # Mermaid, KaTeX, task lists
│   ├── drag-drop.css         # Drag and drop functionality
│   └── distraction-free.css  # Distraction-free mode
├── themes/
│   ├── retro.css             # Windows 3.1 retro theme
│   └── theme-overrides.css   # Theme-specific overrides
└── utilities/
    ├── responsive.css        # Media queries
    ├── print.css            # Print styles
    └── animations.css       # Keyframes and transitions
```

## Phase 1: Foundation Setup ⚪ **STATUS: WAITING**
**Goal**: Extract CSS variables and base styles without breaking functionality.

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 1: Extract CSS variables and base styles"
# 🔴 WAIT FOR USER VALIDATION
# After approval: proceed to Phase 2
```

### Files to Create:
1. **`src/styles/base/variables.css`** - Extract all `:root` variables
2. **`src/styles/base/reset.css`** - Extract base resets, typography, and universal styles
3. **`src/styles/base.css`** - Core styles always loaded
4. **`src/core/StyleManager.js`** - JavaScript class for selective CSS loading (integrates with PluginManager)
5. **`src/styles/LOAD_ORDER.md`** - Document CSS dependencies and load order requirements

### What to Move:
- `:root` CSS custom properties (lines 1-20) → `variables.css`
- Universal selector styles (`*`, `body`, `.app`) → `reset.css`
- Core component styles (toolbar, editor, status-bar) → `base.css`
- Create `StyleManager.js` with plugin integration and CSS loading hooks:
  ```javascript
  // StyleManager integrates with existing PluginManager and Hook System
  class StyleManager {
    constructor(uiController) {
      this.uiController = uiController; // Access to existing hook system
    }
    
    async loadComponent(componentName) {
      await this.uiController.executeHook('beforeCSSLoad', { module: `${componentName}.css`, type: 'component' });
      // Load CSS module
      await this.uiController.executeHook('afterCSSLoad', { module: `${componentName}.css`, type: 'component' });
    }
    
    async loadTheme(themeName) {
      await this.uiController.executeHook('beforeCSSLoad', { module: `${themeName}.css`, type: 'theme' });
      // Load theme CSS
      await this.uiController.executeHook('afterCSSLoad', { module: `${themeName}.css`, type: 'theme' });
    }
    
    registerPluginCSS(pluginId, cssFiles) {
      // Load plugin-specific CSS modules with hooks
    }
  }
  ```
- Update `index.html` to load `base.css` and `StyleManager.js`
- **Document load order dependencies** in `LOAD_ORDER.md`:
  ```markdown
  # CSS Load Order Dependencies
  
  ## Critical Order (Must Load First):
  1. variables.css - CSS custom properties
  2. reset.css - Base styles and resets
  3. themes.css - Theme definitions
  
  ## Component Dependencies:
  - toolbar.css depends on: variables.css, themes.css
  - editor.css depends on: variables.css, reset.css
  - modals.css depends on: variables.css, themes.css, animations.css
  
  ## Theme Dependencies:
  - retro.css overrides: toolbar.css, editor.css, modals.css
  - Must load after all base components
  ```

### Testing Checklist:
- [ ] Base styles load correctly
- [ ] StyleManager class works
- [ ] CSS loading hooks fire correctly (beforeCSSLoad/afterCSSLoad)
- [ ] All themes switch correctly (light/dark/retro)
- [ ] No visual changes in any mode
- [ ] Variables accessible across components
- [ ] Application loads without errors
- [ ] Dynamic CSS loading works in development
- [ ] CSS concatenation fallback works in Tauri production
- [ ] Environment detection correctly switches CSS strategies
- [ ] Load order documentation is accurate and complete
- [ ] CSS dependencies are properly documented
- [ ] Plugin CSS coordination works through hooks

### Estimated Impact: **Very Low Risk**
- No visual changes expected
- Easy to rollback if issues occur

---

## Phase 1.5: Simplified Theme Toggle ⚪ **STATUS: WAITING**
**Goal**: Replace complex theme toggle with simple, extensible light/dark rotation

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
git add .
git commit -m "Simplify theme toggle with light/dark rotation"
# 🔴 WAIT FOR USER VALIDATION
```

### Problem Analysis:
- Current toggle logic is complex and breaks with settings changes
- Hard to extend when new themes are added
- Inconsistent behavior between different theme states

### Solution: Simple Light/Dark Toggle with Fallback
Replace complex logic with simple rule: always toggle between light and dark, with any other theme falling back to light.

### Files to Modify:
1. **`UIController.js`** - Fix setTheme() method and simplify toggleTheme()

### Root Cause Analysis:
The issue was **inconsistent DOM manipulation** between controllers:
- **UIController.setTheme()** used: `document.documentElement.setAttribute('data-theme', theme)`
- **SettingsController.applyTheme()** used: `document.body.classList.add('${theme}-theme')`

When settings modal changed themes, it used body classes. When toggle button ran, it used documentElement attributes. They applied themes to different DOM elements!

### Complete Implementation:

**Step 1: Fix UIController.setTheme() method (lines 97-110):**
```javascript
setTheme(theme, isRetro = false) {
  this.executeHook('beforeThemeChange', { oldTheme: this.theme, newTheme: theme, oldRetro: this.isRetroTheme, newRetro: isRetro });
  
  this.theme = theme;
  this.isRetroTheme = isRetro;
  
  // Apply theme using SAME DOM manipulation as SettingsController
  document.body.classList.remove('light-theme', 'dark-theme', 'contrast-theme', 'retro-theme');
  if (isRetro) {
    document.body.classList.add('retro-theme');
    this.playRetroStartupSound();
  } else {
    document.body.classList.add(`${theme}-theme`);
  }
  document.body.setAttribute('data-theme', theme);
  
  // Also update documentElement for backward compatibility
  document.documentElement.setAttribute('data-theme', theme);
  
  localStorage.setItem('markdownViewer_defaultTheme', this.theme);
  localStorage.setItem('markdownViewer_retroTheme', this.isRetroTheme.toString());
  
  this.executeHook('afterThemeChange', { theme: this.theme, isRetroTheme: this.isRetroTheme });
  this.emit('theme-changed', { theme: this.theme, isRetroTheme: this.isRetroTheme });
}
```

**Step 2: Simplify toggleTheme() method (lines 75-95):**
```javascript
toggleTheme() {
  // Get current theme from localStorage (always fresh)
  const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
  const isRetro = localStorage.getItem('markdownViewer_retroTheme') === 'true';
  
  this.executeHook('beforeThemeToggle', { currentTheme, isRetroTheme: isRetro });
  
  // Simple toggle logic: light <-> dark, everything else -> light
  const newTheme = (currentTheme === 'light' && !isRetro) ? 'dark' : 'light';
  
  // Use existing setTheme method (now fixed)
  this.setTheme(newTheme, false);
  
  this.executeHook('afterThemeToggle', { theme: this.theme, isRetroTheme: this.isRetroTheme });
  
  return { theme: this.theme, isRetroTheme: this.isRetroTheme };
}
```

**Optional Enhancement - Extensible Rotation:**
```javascript
// At the top of UIController class, add:
const THEME_ROTATION = ['light', 'dark']; // Easy to extend: ['light', 'dark', 'blue', 'sepia']

// Replace toggleTheme() with:
toggleTheme() {
  const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
  const isRetro = localStorage.getItem('markdownViewer_retroTheme') === 'true';
  
  this.executeHook('beforeThemeToggle', { currentTheme, isRetroTheme: isRetro });
  
  let newTheme;
  if (isRetro || !THEME_ROTATION.includes(currentTheme)) {
    // Any non-rotation theme -> first theme in rotation
    newTheme = THEME_ROTATION[0];
  } else {
    // Rotate to next theme in sequence
    const currentIndex = THEME_ROTATION.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEME_ROTATION.length;
    newTheme = THEME_ROTATION[nextIndex];
  }
  
  this.setTheme(newTheme, false);
  
  this.executeHook('afterThemeToggle', { theme: this.theme, isRetroTheme: this.isRetroTheme });
  
  return { theme: this.theme, isRetroTheme: this.isRetroTheme };
}
```

### Extensible Theme Rotation (Optional Enhancement):
```javascript
// For future extensibility - configurable theme rotation
const THEME_ROTATION = ['light', 'dark']; // Easy to extend: ['light', 'dark', 'blue', 'green']

toggleTheme() {
  const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
  const isRetro = localStorage.getItem('markdownViewer_retroTheme') === 'true';
  
  this.executeHook('beforeThemeToggle', { currentTheme, isRetroTheme: isRetro });
  
  let newTheme;
  if (isRetro || !THEME_ROTATION.includes(currentTheme)) {
    // Any non-rotation theme (retro, contrast, etc.) -> first theme in rotation
    newTheme = THEME_ROTATION[0];
  } else {
    // Rotate to next theme in sequence
    const currentIndex = THEME_ROTATION.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEME_ROTATION.length;
    newTheme = THEME_ROTATION[nextIndex];
  }
  
  this.setTheme(newTheme, false);
  
  this.executeHook('afterThemeToggle', { theme: this.theme, isRetroTheme: this.isRetroTheme });
  this.emit('theme-changed', { theme: this.theme, isRetroTheme: this.isRetroTheme });
  
  return { theme: this.theme, isRetroTheme: this.isRetroTheme };
}
```

### What We're Fixing:
- 🔧 **setTheme() method**: Update to use same DOM manipulation as SettingsController
- 🔧 **toggleTheme() method**: Simplify to use fixed setTheme() method
- ✅ **applyTheme() method**: Keep existing implementation (lines 112-118) 
- ✅ **ToolbarComponent.updateThemeButton()**: Works with any theme value
- ✅ **KeyboardController**: Ctrl+T will continue to work
- ✅ **SettingsController**: Independent theme management preserved
- ✅ **Plugin hooks**: beforeThemeToggle/afterThemeToggle still fire

### What We're Removing:
- ❌ **Inconsistent DOM manipulation**: Different methods between controllers
- ❌ **Complex toggle logic**: Lines 75-95 in UIController.js
- ❌ **Retro theme detection**: `document.body.classList.contains('retro-theme')`
- ❌ **Stale state issues**: Reading theme from constructor instead of localStorage

### Benefits:
- **Consistent DOM Manipulation**: Both controllers use same theme application method
- **Simple Logic**: Easy to understand and maintain
- **Always Works**: Reads fresh state from localStorage every time
- **Extensible**: Easy to add new themes to rotation
- **Predictable**: Any non-rotation theme always goes to light
- **Clean Architecture**: Uses existing setTheme() method instead of duplicating logic
- **Future-Proof**: Adding themes just requires updating THEME_ROTATION array
- **No Breaking Changes**: All existing functionality preserved

### Testing Checklist:
- [ ] Light -> Dark toggle works
- [ ] Dark -> Light toggle works  
- [ ] Retro -> Light works
- [ ] Contrast -> Light works
- [ ] Toggle works after settings modal changes
- [ ] Ctrl+T keyboard shortcut functions
- [ ] Theme button icon updates correctly (🌙/☀️/retro/contrast)
- [ ] Plugin hooks fire correctly (beforeThemeToggle/afterThemeToggle)
- [ ] Settings modal theme changes don't break toggle
- [ ] ToolbarComponent.updateThemeButton() works with all themes
- [ ] No JavaScript errors in console
- [ ] Theme persistence across app restarts
- [ ] Easy to extend with new themes (just update THEME_ROTATION)

### Estimated Impact: **Low Risk**
- Simpler logic reduces complexity
- Uses existing setTheme() method
- Maintains all plugin compatibility
- Easy to rollback if needede = 'Theme Toggle';
    this.version = '1.0.0';
    this.description = 'Simple light/dark theme toggle button';
    this.themeButton = null;
  }

  async activate(api) {
    // Add theme button to toolbar
    this.themeButton = this.createThemeButton();
    this.insertThemeButton();
    
    // Listen for theme changes to update button
    api.hooks.on('afterThemeChange', this.updateButton.bind(this));
  }

  createThemeButton() {
    const button = document.createElement('button');
    button.id = 'plugin-theme-btn';
    button.className = 'toolbar-btn';
    button.title = 'Toggle Theme (Ctrl+T)';
    button.addEventListener('click', this.toggleTheme.bind(this));
    this.updateButtonIcon(button);
    return button;
  }

  insertThemeButton() {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn && settingsBtn.parentNode) {
      settingsBtn.parentNode.insertBefore(this.themeButton, settingsBtn);
    }
  }

  toggleTheme() {
    const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Reset retro theme
    localStorage.setItem('markdownViewer_retroTheme', 'false');
    localStorage.setItem('markdownViewer_defaultTheme', newTheme);
    
    // Apply theme via UIController
    const uiController = window.markdownEditor?.uiController;
    if (uiController) {
      uiController.setTheme(newTheme, false);
    }
  }

  updateButtonIcon(button = this.themeButton) {
    if (!button) return;
    const currentTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    button.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  }

  updateButton() {
    this.updateButtonIcon();
  }

  deactivate() {
    if (this.themeButton && this.themeButton.parentNode) {
      this.themeButton.parentNode.removeChild(this.themeButton);
    }
    this.themeButton = null;
  }
}

// Register plugin
if (window.PluginManager) {
  window.PluginManager.registerPlugin(new ThemeTogglePlugin());
}
```

### Plugin Features:
- Simple light/dark toggle (no complex state management)
- Uses UIController.setTheme() directly (bypasses problematic toggleTheme)
- Automatically updates button icon on theme changes
- Integrates cleanly with existing plugin system
- Can be enabled/disabled like any other plugin

### Testing Checklist:
- [ ] Plugin loads and activates correctly
- [ ] Theme button appears in toolbar
- [ ] Button toggles between light and dark themes
- [ ] Button icon updates correctly
- [ ] Works after setting themes via settings modal
- [ ] Plugin can be disabled/enabled in settings
- [ ] No conflicts with other plugins

### Estimated Impact: **Low Risk**
- Plugin approach isolates functionality
- Uses stable UIController.setTheme() method
- Easy to disable if issues occur

---

## Phase 2: Component Extraction (Medium Risk) ⚪ **STATUS: WAITING**

**Goal**: Extract major UI components into separate files.

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 2: Extract toolbar, status-bar, and editor components"
# 🔴 WAIT FOR USER VALIDATION
# After approval: proceed to Phase 3
```

### Files to Create:
1. **`src/styles/components/toolbar.css`** - Main toolbar and mode buttons (→ UIController)
2. **`src/styles/components/status-bar.css`** - Status bar and controls (→ UIController)
3. **`src/styles/components/editor.css`** - Monaco editor and fallback styles (→ ModeController)

### What to Move:
- `.toolbar`, `.toolbar-btn`, `.mode-btn` styles → UIController responsibility
- `.status-bar` and related styles → UIController responsibility
- `.monaco-editor-container`, Monaco overrides → ModeController responsibility
- Fallback editor styles → ModeController responsibility
- **Hook Integration**: Use existing hook system for CSS loading:
  ```javascript
  // In UIController
  await this.executeHook('beforeThemeChange', { theme, cssModules });
  ```

### Testing Checklist:
- [ ] Toolbar buttons work in all themes
- [ ] Mode switching (code/preview/split) functions
- [ ] Status bar displays correctly
- [ ] Monaco editor loads and functions
- [ ] All toolbar interactions work

### Estimated Impact: **Medium Risk**
- Potential for missing styles if extraction is incomplete
- Theme-specific overrides need careful handling

---

## Phase 3: Content and Preview (Medium Risk) ⚪ **STATUS: WAITING**

**Goal**: Separate preview content and advanced features.

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 3: Extract preview and advanced content styles"
# 🔴 WAIT FOR USER VALIDATION
# After approval: proceed to Phase 4
```

### Files to Create:
1. **`src/styles/components/preview.css`** - Preview pane and basic markdown (→ ModeController)
2. **`src/styles/features/advanced-content.css`** - Mermaid, KaTeX, task lists, code blocks (→ MarkdownActionController)

### What to Move:
- `.preview-pane`, `.preview-content` styles
- Basic markdown rendering (headings, paragraphs, lists, tables)
- Advanced features: `.mermaid-diagram`, `.math-display`, `.task-list-item`
- Code block enhancements and syntax highlighting

### Testing Checklist:
- [ ] Markdown renders correctly in all themes
- [ ] Mermaid diagrams display properly
- [ ] KaTeX math expressions work
- [ ] Task lists are interactive
- [ ] Code blocks have syntax highlighting
- [ ] Preview mode functions normally

### Estimated Impact: **Medium Risk**
- Complex interdependencies between content styles
- Advanced features have many theme variations

---

## Phase 4: Modals and Overlays (Low-Medium Risk) ⚪ **STATUS: WAITING**

**Goal**: Extract all modal dialogs and overlay components.

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 4: Extract modals, welcome screen, and tab system"
# 🔴 WAIT FOR USER VALIDATION
# After approval: proceed to Phase 5
```

### Files to Create:
1. **`src/styles/components/modals.css`** - All modal dialogs (→ UIController)
2. **`src/styles/components/welcome.css`** - Welcome screen (→ UIController)
3. **`src/styles/components/tabs.css`** - Tab system and dropdowns (→ TabUIController)

### What to Move:
- Settings, help, about modals
- Task conflict modal
- Link and image modals
- Tab dropdown and modal styles
- Welcome page and file history
- Splash screen

### Testing Checklist:
- [ ] Settings modal opens and functions
- [ ] Help and about modals work
- [ ] Tab switching and dropdowns work
- [ ] Welcome screen displays correctly
- [ ] All modal animations work
- [ ] Context menus function properly

### Estimated Impact: **Low-Medium Risk**
- Modals are relatively self-contained
- Animation dependencies need attention

---

## Phase 5: Theme Separation (High Risk) ⚪ **STATUS: WAITING**

**Goal**: Extract theme-specific styles into dedicated files.

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 5: Extract retro and dark theme styles"
# 🔴 WAIT FOR USER VALIDATION
# After approval: proceed to Phase 6
```

### Files to Create:
1. **`src/styles/themes/retro.css`** - All retro theme styles (→ UIController integration)
2. **`src/styles/base/themes.css`** - Theme variable definitions (→ UIController integration)

### Controller Integration:
- **UIController** manages theme switching with modular CSS loading
- **Existing theme system** works seamlessly with new structure
- **Plugin themes** can register additional CSS modules

### What to Move:
- All `body.retro-theme` styles (500+ lines)
- `[data-theme="dark"]` and `[data-theme="contrast"]` styles
- Theme-specific component overrides

### Testing Checklist:
- [ ] Light theme works correctly
- [ ] Dark theme works correctly
- [ ] Retro theme works correctly
- [ ] Theme switching functions
- [ ] All components styled in each theme
- [ ] Retro scrollbars and buttons work

### Estimated Impact: **High Risk**
- Large amount of interdependent styles
- Theme overrides affect multiple components
- Retro theme has extensive customizations

---

## Phase 6: Utilities and Responsive (Low Risk) ⚪ **STATUS: WAITING**

**Goal**: Extract utility styles and responsive design.

### Git Workflow:
```bash
# Apply changes below
# Test thoroughly
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 6: Extract utilities, responsive, and animations"
# 🔴 WAIT FOR USER VALIDATION
# After approval: proceed to Phase 7
```

### Files to Create:
1. **`src/styles/utilities/responsive.css`** - All media queries
2. **`src/styles/utilities/print.css`** - Print-specific styles (→ ExportController integration)
3. **`src/styles/utilities/animations.css`** - Keyframes and transitions
4. **`src/styles/features/distraction-free.css`** - Distraction-free mode (→ UIController integration)

### Final Architecture Benefits:
- **Plugin-Ready**: CSS modules align with controller boundaries
- **Lower Risk**: Decoupled controllers isolate CSS issues
- **Hook Integration**: Existing hook system enables gradual migration
- **Theme Compatibility**: UIController seamlessly manages modular themes
- **Build System Ready**: No-build approach accommodates CSS concatenation

### What to Move:
- All `@media` queries
- `@keyframes` animations
- Print styles (`@media print`)
- Distraction-free mode styles
- Drag and drop animations

### Testing Checklist:
- [ ] Responsive design works at all breakpoints
- [ ] Print functionality works
- [ ] All animations and transitions work
- [ ] Distraction-free mode functions
- [ ] Mobile layout is correct

### Estimated Impact: **Low Risk**
- Utilities are generally self-contained
- Easy to verify functionality

---

## Phase 7: Documentation Update (Critical) ⚪ **STATUS: WAITING**

**Goal**: Update technical documentation with comprehensive CSS architecture for plugin developers.

### Git Workflow:
```bash
# Apply changes below
# 🔍 Code review & completeness check
git add .
git commit -m "Phase 7: Update technical documentation with CSS architecture"
# 🔴 WAIT FOR USER VALIDATION
# After approval: complete CSS refactoring project
```

### Files to Update:
1. **`TECHNICAL_DOCUMENTATION_FINAL.md`** - Add comprehensive CSS Architecture section

### What to Add:
**Complete CSS Architecture Documentation** for plugin developers:

#### CSS Module System
- Modular CSS structure and file organization
- CSS loading strategies (base vs. selective)
- StyleManager API and usage patterns
- CSS dependency management and load order

#### Plugin CSS Integration
- How plugins can register custom CSS modules
- CSS loading hooks (beforeCSSLoad/afterCSSLoad) usage
- Theme extension patterns for plugins
- CSS coordination between plugins and core modules

#### Theme System Architecture
- CSS variable system and theme definitions
- Theme switching mechanisms and plugin integration
- Custom theme development guidelines
- Theme override patterns and best practices

#### CSS Hook System
- Complete list of CSS-related hooks
- Hook execution order and priority system
- Plugin CSS lifecycle management
- Performance considerations for CSS hooks

#### Developer Guidelines
- CSS module naming conventions
- Plugin CSS best practices and security guidelines
- CSS performance optimization techniques
- Debugging CSS issues in modular architecture

#### API Reference
- StyleManager class methods and properties
- CSS-related hook data schemas
- Plugin CSS registration patterns
- CSS module loading examples

### Documentation Structure to Add:
```markdown
## CSS Architecture System

### CSS Module Organization
### StyleManager API
### CSS Loading Hooks
### Theme System Integration
### Plugin CSS Development
### CSS Performance Guidelines
### CSS API Reference
### CSS Troubleshooting Guide
```

### Testing Checklist:
- [ ] Documentation covers all CSS modules and their purposes
- [ ] StyleManager API is fully documented with examples
- [ ] CSS loading hooks are explained with use cases
- [ ] Plugin CSS integration patterns are clear
- [ ] Theme system is comprehensively documented
- [ ] CSS performance guidelines are included
- [ ] All CSS-related APIs have complete reference
- [ ] Examples are practical and copy-pasteable
- [ ] Documentation is developer-friendly and comprehensive

### Estimated Impact: **Critical for Plugin Ecosystem**
- Essential for plugin developers to understand CSS integration
- Enables advanced plugin CSS features and theme extensions
- Provides foundation for CSS-related plugin development

---

## Implementation Strategy

### Git Workflow for Each Phase:

1. **Apply the changes** (extract styles, create new files)
2. **Test thoroughly** (all themes, functionality, responsive)
3. **🔍 Code Review & Completeness Check** - Verify no missing styles or dependencies
4. **Commit changes** (`git add . && git commit -m "Phase X: [description]"`)
5. **🔴 USER VALIDATION REQUIRED** - User must test and approve
6. **Update plan status** (mark phase as complete)
7. **Proceed to next phase** when approved

### Safety Measures:
- Keep original `styles.css` as backup until all phases complete
- No phase proceeds without explicit user approval

### CSS Loading Strategy:

#### Primary Strategy: Dynamic CSS Loading
**For Development and Web Environments:**

```js
// StyleManager with dynamic CSS loading
class StyleManager {
  constructor(uiController) {
    this.uiController = uiController;
    this.loadedModules = new Set();
    this.isProduction = this.detectEnvironment();
  }
  
  detectEnvironment() {
    // Detect if running in Tauri production environment
    return window.__TAURI__ && !window.location.href.includes('localhost');
  }
  
  async loadComponent(componentName) {
    if (this.isProduction) {
      // Use concatenated CSS in production
      return this.loadConcatenatedCSS(componentName);
    }
    
    // Dynamic loading for development
    await this.uiController.executeHook('beforeCSSLoad', { module: `${componentName}.css`, type: 'component' });
    
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./styles/components/${componentName}.css`;
      document.head.appendChild(link);
      
      await new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
      });
      
      this.loadedModules.add(componentName);
    } catch (error) {
      console.warn(`Failed to load ${componentName} styles:`, error);
    }
    
    await this.uiController.executeHook('afterCSSLoad', { module: `${componentName}.css`, type: 'component' });
  }
  
  loadConcatenatedCSS(componentName) {
    // In production, CSS is pre-concatenated into base.css
    // Just trigger hooks for plugin coordination
    this.uiController.executeHook('beforeCSSLoad', { module: `${componentName}.css`, type: 'component', concatenated: true });
    this.uiController.executeHook('afterCSSLoad', { module: `${componentName}.css`, type: 'component', concatenated: true });
  }
}
```

#### Fallback Strategy: CSS Concatenation for Tauri
**For Production Builds:**

**Build Script (`build-css.js`):**
```js
// CSS concatenation script for Tauri builds
const fs = require('fs');
const path = require('path');

const cssModules = [
  // Base (always loaded)
  'base/variables.css',
  'base/reset.css', 
  'base/themes.css',
  
  // Core components
  'components/toolbar.css',
  'components/editor.css',
  'components/status-bar.css',
  'components/preview.css',
  'components/tabs.css',
  'components/modals.css',
  'components/welcome.css',
  
  // Features
  'features/markdown-toolbar.css',
  'features/advanced-content.css',
  'features/drag-drop.css',
  'features/distraction-free.css',
  
  // Utilities
  'utilities/responsive.css',
  'utilities/print.css',
  'utilities/animations.css',
  
  // Themes (conditional)
  'themes/retro.css'
];

function concatenateCSS() {
  let concatenated = '/* Auto-generated concatenated CSS for Tauri production */\n\n';
  
  cssModules.forEach(module => {
    const filePath = path.join('src/styles', module);
    if (fs.existsSync(filePath)) {
      concatenated += `/* === ${module} === */\n`;
      concatenated += fs.readFileSync(filePath, 'utf8');
      concatenated += '\n\n';
    }
  });
  
  fs.writeFileSync('src/styles-production.css', concatenated);
  console.log('CSS concatenation complete: styles-production.css');
}

concatenateCSS();
```

**Package.json Integration:**
```json
{
  "scripts": {
    "build-css": "node build-css.js",
    "tauri:build": "npm run build-css && tauri build",
    "tauri:dev": "tauri dev"
  }
}
```

**Conditional CSS Loading in index.html:**
```html
<!-- Development: Modular CSS -->
<link id="dev-styles" rel="stylesheet" href="./styles/base.css">

<!-- Production: Concatenated CSS -->
<link id="prod-styles" rel="stylesheet" href="./styles-production.css" disabled>

<script>
  // Switch CSS strategy based on environment
  if (window.__TAURI__ && !window.location.href.includes('localhost')) {
    // Production: Use concatenated CSS
    document.getElementById('dev-styles').disabled = true;
    document.getElementById('prod-styles').disabled = false;
  }
</script>
```

## Benefits of This Approach

1. **Maintainability**: Easier to find and modify specific styles
2. **Collaboration**: Multiple developers can work on different components
3. **Selective Loading**: Load only needed styles via JavaScript imports
4. **Organization**: Clear separation of concerns
5. **Debugging**: Easier to identify style conflicts
6. **Scalability**: New features can have dedicated style files
7. **Feature Control**: Enable/disable features with their associated styles
8. **Plugin Architecture**: Easy to add/remove feature modules
9. **CSS Coordination**: Plugins can react to CSS loading through hook system
10. **Performance Monitoring**: Track CSS loading performance and dependencies
11. **Dynamic Theming**: Plugins can enhance themes as they load
12. **Error Recovery**: Handle CSS loading failures gracefully
13. **Environment Flexibility**: Works in both development (modular) and production (concatenated)
14. **Tauri Compatibility**: Fallback strategy ensures compatibility with Tauri's file system restrictions

## Risk Mitigation

1. **Backup Strategy**: Keep original `styles.css` until refactoring is complete
2. **Incremental Testing**: Test after each phase
3. **Theme Validation**: Ensure all themes work after each change
4. **Browser Testing**: Test in multiple browsers
5. **Rollback Plan**: Easy to revert to original file if needed
6. **Environment Testing**: Test both development (modular) and production (concatenated) CSS loading
7. **Tauri Compatibility**: Validate CSS loading works in Tauri production builds

## Recommended Starting Point

**Begin with Phase 1** - it's the safest and provides immediate organizational benefits without risk of breaking functionality. The CSS variables extraction is straightforward and will make subsequent phases easier to manage.

## Progress Tracking

### Phase Status:
- ⚪ **Phase 1**: WAITING - Foundation Setup
- ✅ **Phase 1.5**: COMPLETE - Simplified Theme Toggle (cherry-picked from main)
- ⚪ **Phase 2**: WAITING - Component Extraction  
- ⚪ **Phase 3**: WAITING - Content and Preview
- ⚪ **Phase 4**: WAITING - Modals and Overlays
- ⚪ **Phase 5**: WAITING - Theme Separation
- ⚪ **Phase 6**: WAITING - Utilities and Responsive
- ⚪ **Phase 7**: WAITING - Documentation Update (Critical)

### Legend:
- ✅ **PENDING**: Ready to start
- 🟡 **IN PROGRESS**: Currently working
- 🔴 **NEEDS VALIDATION**: Waiting for user approval
- ✅ **COMPLETE**: Finished and merged
- ⚪ **WAITING**: Blocked until previous phase complete

## Success Metrics

- [ ] All existing functionality preserved
- [ ] All themes work correctly
- [ ] No visual regressions
- [ ] Improved developer experience
- [ ] Faster style debugging
- [ ] Cleaner git diffs for style changes

---

**🔴 IMPORTANT**: Each phase requires explicit user validation before proceeding. No phase will be merged without user approval.

*This plan prioritizes safety and maintainability while providing a clear path to a more organized CSS architecture.*