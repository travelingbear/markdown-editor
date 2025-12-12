# Component Loading Order

**Date:** December 12, 2024  
**Version:** 3.3.1

---

## Script Loading Order (index.html)

### 1. Head Section - External Libraries
```html
<script src="vendor/marked.min.js"></script>           <!-- Markdown parser -->
<script src="assets/mermaid.min.js"></script>          <!-- Diagram rendering -->
<script src="vendor/monaco-loader.js"></script>        <!-- Monaco editor loader -->
<script src="vendor/highlight.min.js"></script>        <!-- Syntax highlighting -->
<script src="vendor/html2canvas.min.js"></script>      <!-- HTML to canvas -->
```

### 2. Body Section - Splash Screen
```html
<script src="/splash-component.js"></script>           <!-- Loads first, shows immediately -->
```

### 3. Core Infrastructure
```html
<script src="/core/StyleManager.js"></script>          <!-- Dynamic CSS loading -->
<script src="/utils/sanitizer.js"></script>            <!-- Security utilities -->
<script src="/utils/common.js"></script>               <!-- Common utilities -->
<script src="/ipc-wrapper.js"></script>                <!-- Tauri IPC wrapper -->
<script src="/performance-optimizer.js"></script>      <!-- Performance monitoring -->
```

### 4. Plugin System
```html
<script src="/core/ExtensionAPI.js"></script>          <!-- Extension API -->
<script src="/core/ControllerRegistry.js"></script>    <!-- Controller registry -->
<script src="/core/PluginConfig.js"></script>          <!-- Plugin configuration -->
<script src="/core/PluginValidator.js"></script>       <!-- Plugin validation -->
<script src="/core/PluginManager.js"></script>         <!-- Plugin manager -->
<script src="/core/PluginLoader.js"></script>          <!-- Plugin loader -->
```

### 5. Component Architecture
```html
<script src="/components/BaseComponent.js"></script>   <!-- Base component class -->
```

### 6. Controllers (Order matters - dependencies)
```html
<script src="/components/controllers/FileController.js"></script>
<script src="/components/controllers/UIController.js"></script>
<script src="/components/controllers/KeyboardController.js"></script>
<script src="/components/controllers/SettingsController.js"></script>
<script src="/components/controllers/TabUIController.js"></script>
<script src="/components/controllers/ModeController.js"></script>
<script src="/components/controllers/MarkdownActionController.js"></script>
<script src="/components/controllers/ExportController.js"></script>
```

### 7. Core Components
```html
<script src="/components/DocumentComponent.js"></script>
<script src="/components/EditorComponent.js"></script>
<script src="/components/PreviewComponent.js"></script>
<script src="/components/ToolbarComponent.js"></script>
```

### 8. Tab System
```html
<script src="/components/TabState.js"></script>
<script src="/components/TabCollection.js"></script>
<script src="/components/TabManager.js"></script>
```

### 9. Main Application
```html
<script src="/components/MarkdownEditor.js"></script>  <!-- Main orchestrator -->
<script src="/test-extension.js"></script>             <!-- Test extension -->
<script src="/main.js"></script>                       <!-- Entry point -->
```

---

## Component Initialization Order (MarkdownEditor.js)

### Phase 1: Critical Controllers (Sequential)
**Purpose:** Settings must load first as other components depend on it

1. **SettingsController** - Loads user settings from localStorage
   - Must complete before other components
   - Provides configuration to all other components

### Phase 2: Independent Components (Parallel)
**Purpose:** These components don't depend on each other, load simultaneously

1. **UIController** - Theme management, modals, layout
2. **FileController** - File operations, drag & drop
3. **TabManager** - Tab state management
4. **DocumentComponent** - Document state and operations
5. **ToolbarComponent** - Toolbar UI and interactions

### Phase 3: View Components (Parallel)
**Purpose:** Heavy components that render content

1. **EditorComponent** - Monaco editor (lazy loaded)
2. **PreviewComponent** - Markdown preview rendering

### Phase 4: Dependent Controllers (Parallel)
**Purpose:** Controllers that need view components to be ready

1. **ModeController** - Requires EditorComponent, PreviewComponent, ToolbarComponent
2. **TabUIController** - Requires TabManager, SettingsController
3. **MarkdownActionController** - Requires EditorComponent, DocumentComponent
4. **ExportController** - Requires EditorComponent

---

## Initialization Flow

```
main.js (DOMContentLoaded)
  ↓
MarkdownEditor.onInit()
  ↓
createComponents()
  ├─ Phase 1: SettingsController.init() ⏱️ ~5ms
  │   └─ Load settings from localStorage
  │
  ├─ Phase 2: Parallel Init ⏱️ ~15ms
  │   ├─ UIController.init()
  │   ├─ FileController.init()
  │   ├─ TabManager.init()
  │   │   └─ loadPersistedTabs()
  │   ├─ DocumentComponent.init()
  │   └─ ToolbarComponent.init()
  │
  ├─ Phase 3: View Components ⏱️ ~20ms
  │   ├─ EditorComponent.init()
  │   │   └─ Monaco NOT loaded yet (lazy)
  │   └─ PreviewComponent.init()
  │       └─ Setup preview rendering
  │
  └─ Phase 4: Dependent Controllers ⏱️ ~10ms
      ├─ ModeController.init()
      │   └─ setDependencies()
      ├─ TabUIController.init()
      │   └─ setDependencies()
      ├─ MarkdownActionController.init()
      │   └─ setDependencies()
      └─ ExportController.init()
          └─ setDependencies()
  ↓
setupComponentCommunication() ⏱️ ~5ms
  └─ Wire up event handlers
  ↓
applyInitialSettings() ⏱️ ~5ms
  ├─ Apply theme
  ├─ Apply layout settings
  └─ Show welcome page
  ↓
checkStartupFile() ⏱️ Variable
  ├─ Check for startup file
  └─ Reopen last tabs (if enabled)
  ↓
Total: ~60ms (without file loading)
```

---

## Lazy Loading Components

### Monaco Editor
- **When:** First time entering Code or Split mode
- **Trigger:** `ModeController.setMode('code')` or `setMode('split')`
- **Load Time:** ~100-150ms
- **Why:** Heavy component, not needed for Preview mode or Welcome page

### Plugins
- **When:** After UI is ready (idle time)
- **Trigger:** `requestIdleCallback()` or `setTimeout(1000)`
- **Load Time:** Variable
- **Why:** Optional features, don't block startup

### Theme CSS
- **When:** On theme switch or startup (if not light)
- **Trigger:** `StyleManager.loadTheme()`
- **Load Time:** ~10-20ms
- **Why:** Only load needed theme

---

## Current Issues for Modularization

### 1. Welcome Page Coupling
```javascript
// applyInitialSettings() always sets preview mode
this.modeController.currentMode = 'preview';
```
**Problem:** Mode system initializes even when showing welcome page

### 2. View Components Always Load
```javascript
// Phase 3 always runs
const viewComponents = await Promise.all([
  EditorComponent.init(),
  PreviewComponent.init()
]);
```
**Problem:** Preview component loads even if not needed immediately

### 3. Theme Flash
```html
<!-- styles.css includes light theme -->
<link rel="stylesheet" href="styles.css" />
```
**Problem:** Light theme loads, then JavaScript switches to dark

---

## Proposed Changes for Modularization

### 1. Conditional View Component Loading
```javascript
// Only load when needed
if (hasDocument || reopenLastTabs) {
  await this.ensureViewComponentsInitialized();
}
```

### 2. Welcome Mode State
```javascript
// Don't initialize mode system for welcome
this.modeController.currentMode = null; // or 'welcome'
```

### 3. Inline Theme Loader
```html
<script>
  // Load correct theme before body renders
  const theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
  // Preload theme CSS
</script>
```

---

## Dependencies Graph

```
SettingsController (no dependencies)
  ↓
  ├─→ UIController
  ├─→ FileController
  ├─→ TabManager
  ├─→ DocumentComponent
  └─→ ToolbarComponent
      ↓
      ├─→ EditorComponent
      └─→ PreviewComponent
          ↓
          ├─→ ModeController (needs Editor + Preview + Toolbar)
          ├─→ TabUIController (needs TabManager + Settings)
          ├─→ MarkdownActionController (needs Editor + Document)
          └─→ ExportController (needs Editor)
```

---

## Performance Breakdown

| Phase | Time | Can Defer? | Impact |
|-------|------|------------|--------|
| Phase 1: Settings | ~5ms | No | Critical |
| Phase 2: Independent | ~15ms | Partial | Medium |
| Phase 3: View Components | ~20ms | **Yes** | **High** |
| Phase 4: Dependent | ~10ms | **Yes** | **High** |
| Communication Setup | ~5ms | No | Low |
| Initial Settings | ~5ms | No | Low |
| **Total** | **~60ms** | | |

**Potential Savings:** ~30ms by deferring Phase 3 & 4 until first document opens

---

## Notes

- All components use async/await for initialization
- Parallel loading where possible (Promise.all)
- Dependencies are explicitly managed
- Event-driven communication between components
- Lazy loading for heavy components (Monaco, Plugins)
