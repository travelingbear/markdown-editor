# Markdown Editor Plugin Architecture Refactoring Plan

## Overview
This plan refactors the monolithic `MarkdownEditor` class into a plugin-ready architecture through incremental, validated steps.

IMPORTANT! These are the steps for each phase/step: New Branch → 2. Changes → 3. Commit → 4. User Validation → 5. Confirm Proceed → 6. Merge → 7. Update Plan → 8. Next Step

---

## Phase 1: Foundation Refactoring

### Step 1.1: Extract FileController
**Branch:** `refactor/extract-file-controller`

**Changes:**
- Create `src/components/controllers/FileController.js`
- Move all file operations from `MarkdownEditor.js` to `FileController`
- Update `MarkdownEditor` to use `FileController` instance

**Files Modified:**
- `src/components/controllers/FileController.js` (new)
- `src/components/MarkdownEditor.js` (modified)

**Commit Message:** `refactor: extract file operations into FileController`

**User Validation Required:**
- [x] Test file operations: New, Open, Save, Save As, Close
- [x] Test drag & drop functionality
- [x] Test file associations and startup files
- [x] Verify no regression in file handling

**Proceed Criteria:** All file operations work identically to before

---

### Step 1.2: Extract UIController
**Branch:** `refactor/extract-ui-controller`

**Changes:**
- Create `src/components/controllers/UIController.js`
- Move UI state management from `MarkdownEditor.js` to `UIController`
- Move modal handling, theme management, layout controls

**Files Modified:**
- `src/components/controllers/UIController.js` (new)
- `src/components/MarkdownEditor.js` (modified)
- `src/index.html` (modified)

**Commit Message:** `refactor: extract UI state management into UIController`

**User Validation Required:**
- [ ] Test theme switching (light/dark/retro)
- [ ] Test modal operations (settings, help, about)
- [ ] Test distraction-free mode
- [ ] Test layout changes and toolbar sizing

**Proceed Criteria:** All UI interactions work without issues

**Status:** ✅ COMPLETED & MERGED

---

### Step 1.3: Extract KeyboardController
**Branch:** `refactor/extract-keyboard-controller`

**Changes:**
- Create `src/components/controllers/KeyboardController.js`
- Move all keyboard shortcuts and event handling
- Move tab navigation shortcuts

**Files Modified:**
- `src/components/controllers/KeyboardController.js` (new)
- `src/components/MarkdownEditor.js` (modified)
- `src/index.html` (modified)

**Commit Message:** `refactor: extract keyboard handling into KeyboardController`

**User Validation Required:**
- [x] Test all keyboard shortcuts (Ctrl+N, Ctrl+O, Ctrl+S, etc.)
- [x] Test mode switching shortcuts (Ctrl+1,2,3)
- [x] Test tab navigation (Alt+1-9, Ctrl+Tab)
- [x] Test markdown shortcuts in editor

**Proceed Criteria:** All keyboard shortcuts function correctly

**Status:** ✅ COMPLETED & MERGED

**Known Issues for Later Phases:**
- Monaco Editor F1 override (capture phase not working inside Monaco)
- Monaco Editor mouse wheel font size (Monaco intercepts Ctrl+Scroll)
- Mode switching direction preference (Ctrl+Shift+Scroll)
- Markdown toolbar buttons lose cursor focus after formatting actions

---

---

### Step 1.4: Extract SettingsController
**Branch:** `refactor/extract-settings-controller`

**Changes:**
- Create `src/components/controllers/SettingsController.js`
- Move settings management and persistence
- Move performance monitoring

**Files Modified:**
- `src/components/controllers/SettingsController.js` (new)
- `src/components/MarkdownEditor.js` (modified)

**Commit Message:** `refactor: extract settings management into SettingsController`

**User Validation Required:**
- [x] Test settings persistence across app restarts
- [x] Test all settings changes in settings modal
- [x] Test performance dashboard updates
- [x] Verify settings export/import if available

**Proceed Criteria:** Settings work and persist correctly

**Status:** ✅ COMPLETED & MERGED

---

### Step 1.5: Extract TabUIController
**Branch:** `refactor/extract-tab-ui-controller`

**Changes:**
- Create `src/components/controllers/TabUIController.js`
- Move tab UI management from `MarkdownEditor.js` to `TabUIController`
- Move tab dropdown/modal, context menu, pinned tabs functionality

**Files Modified:**
- `src/components/controllers/TabUIController.js` (new)
- `src/components/MarkdownEditor.js` (modified)
- `src/index.html` (modified)

**Commit Message:** `refactor: extract tab UI management into TabUIController`

**User Validation Required:**
- [ ] Test tab dropdown and modal functionality
- [ ] Test tab context menu operations (move, close, duplicate)
- [ ] Test pinned tabs toggle and display
- [ ] Test tab navigation and keyboard shortcuts
- [ ] Verify tab search and filtering works

**Proceed Criteria:** All tab UI interactions work without issues

**Status:** ✅ COMPLETED & MERGED

**Known Issues:**
- Minor submenu overflow in context menu when right-clicking near application edge (acceptable)

**Estimated Lines Reduced:** ~500 lines

---

### Step 1.6: Extract ModeController ✅
**Branch:** `refactor/extract-mode-controller` (merged)

**Changes:**
- Create `src/components/controllers/ModeController.js`
- Move mode switching logic from `MarkdownEditor.js` to `ModeController`
- Move scroll position management and layout updates

**Files Modified:**
- `src/components/controllers/ModeController.js` (new - 198 lines)
- `src/components/MarkdownEditor.js` (modified - reduced ~57 lines)
- `src/index.html` (modified)

**Commit Message:** `refactor: extract mode management into ModeController`

**User Validation Required:**
- [x] Test mode switching (code/preview/split)
- [x] Test scroll position preservation between modes
- [x] Test layout updates and pane visibility
- [x] Test Monaco editor loading in code/split modes

**Proceed Criteria:** Mode switching works identically to before

**Status:** ✅ COMPLETED & MERGED

**Known Issues:**
- Manual scroll sync accuracy needs improvement (deferred)

**Actual Lines Reduced:** ~57 lines

---

### Step 1.7: Extract MarkdownActionController ✅
**Branch:** `refactor/extract-markdown-action-controller` (merged)

**Changes:**
- Create `src/components/controllers/MarkdownActionController.js`
- Move markdown formatting actions from `MarkdownEditor.js` to `MarkdownActionController`
- Move text insertion, task list updates, multi-line formatting

**Files Modified:**
- `src/components/controllers/MarkdownActionController.js` (new - 495 lines)
- `src/components/MarkdownEditor.js` (modified - reduced ~474 lines)
- `src/index.html` (modified)

**Commit Message:** `refactor: extract markdown actions into MarkdownActionController`

**User Validation Required:**
- [x] Test all markdown formatting buttons (bold, italic, headers, etc.)
- [x] Test multi-line formatting operations
- [x] Test task list checkbox interactions
- [x] Test text insertion and cursor positioning

**Proceed Criteria:** All markdown formatting works correctly

**Status:** ✅ COMPLETED & MERGED

**Known Issues:**
- Theme toggle button fixed (duplicate handler removed)

**Actual Lines Reduced:** ~474 lines

---

### Step 1.8: Extract ExportController ✅
**Branch:** `refactor/extract-export-controller` (merged)

**Changes:**
- Create `src/components/controllers/ExportController.js`
- Move export functionality from `MarkdownEditor.js` to `ExportController`
- Move HTML/PDF export logic
- Fix PDF printing issues (full content, no UI elements)

**Files Modified:**
- `src/components/controllers/ExportController.js` (new - 154 lines)
- `src/components/MarkdownEditor.js` (modified - reduced ~71 lines)
- `src/index.html` (modified)
- `src/styles.css` (modified - print improvements)

**Commit Message:** `refactor: extract export functionality into ExportController`

**User Validation Required:**
- [x] Test HTML export functionality
- [x] Test PDF export (print) functionality
- [x] Verify export file dialogs work

**Proceed Criteria:** Export functions work identically

**Status:** ✅ COMPLETED & MERGED

**Known Issues:**
- Code mode PDF syntax highlighting colors (deferred to later phase)

**Actual Lines Reduced:** ~71 lines

---

## Phase 2: Dependency Injection

### Step 2.1: Add Constructor Injection ✅
**Branch:** `refactor/add-dependency-injection` (merged)

**Changes:**
- Modify `MarkdownEditor` constructor to accept controller dependencies
- Create factory function for default controller creation
- Update initialization in `main.js`
- Fix text alignment regex bug (capture groups)
- Fix Ctrl+F in preview mode to use selected text from code mode

**Files Modified:**
- `src/components/MarkdownEditor.js` (modified)
- `src/main.js` (modified)
- `src/components/controllers/MarkdownActionController.js` (bug fixes)

**Commit Message:** `refactor: add dependency injection for controllers`

**User Validation Required:**
- [x] Test complete application functionality
- [x] Verify no performance regression
- [x] Test with different controller combinations

**Proceed Criteria:** App works identically with new injection system

**Status:** ✅ COMPLETED & MERGED

**Bug Fixes Included:**
- Text alignment buttons now work correctly for multiple alignment changes
- Ctrl+F in preview mode copies selected text from code mode to clipboard

---

### Step 2.2: Create Controller Registry
**Branch:** `refactor/add-controller-registry`

**Changes:**
- Create `src/core/ControllerRegistry.js`
- Allow runtime controller registration/replacement
- Add controller lifecycle management

**Files Modified:**
- `src/core/ControllerRegistry.js` (new)
- `src/components/MarkdownEditor.js` (modified)

**Commit Message:** `refactor: add controller registry for dynamic management`

**User Validation Required:**
- [ ] Test controller registration/deregistration
- [ ] Verify controller lifecycle events
- [ ] Test error handling for missing controllers

**Proceed Criteria:** Registry works without breaking existing functionality

---

## Phase 2.5: CSS Architecture Refactoring

### Step 2.5.1: Extract Theme-Specific CSS Files
**Branch:** `refactor/extract-theme-css`

**Changes:**
- Create `src/styles/themes/` directory structure
- Extract light, dark, retro, and contrast theme styles into separate files
- Create theme-specific CSS files with proper imports

**Files Modified:**
- `src/styles/themes/light.css` (new)
- `src/styles/themes/dark.css` (new)
- `src/styles/themes/retro.css` (new)
- `src/styles/themes/contrast.css` (new)
- `src/styles.css` (modified - remove theme-specific styles)
- `src/index.html` (modified - update CSS imports)

**Commit Message:** `refactor: extract theme-specific CSS into separate files`

**User Validation Required:**
- [ ] Test all themes render identically (light/dark/retro/contrast)
- [ ] Verify theme switching works without visual changes
- [ ] Test application startup with new CSS structure
- [ ] Confirm no missing styles or broken layouts

**Proceed Criteria:** All themes work identically to before

**Estimated Reduction:** ~2000 lines from main styles.css

---

### Step 2.5.2: Organize Component-Based Stylesheets
**Branch:** `refactor/organize-component-css`

**Changes:**
- Create `src/styles/components/` directory
- Extract component-specific styles (toolbar, editor, preview, modals, tabs)
- Create `src/styles/base/` for core styles (variables, reset, layout)
- Create `src/styles/print/` for print-specific styles

**Files Modified:**
- `src/styles/base/variables.css` (new)
- `src/styles/base/reset.css` (new)
- `src/styles/base/layout.css` (new)
- `src/styles/components/toolbar.css` (new)
- `src/styles/components/editor.css` (new)
- `src/styles/components/preview.css` (new)
- `src/styles/components/modals.css` (new)
- `src/styles/components/tabs.css` (new)
- `src/styles/print/print.css` (new)
- `src/styles.css` (modified - becomes main import file)

**Commit Message:** `refactor: organize CSS into component-based structure`

**User Validation Required:**
- [ ] Test all UI components render correctly
- [ ] Verify modal dialogs, toolbars, and tabs work
- [ ] Test editor and preview pane functionality
- [ ] Confirm print styles work for PDF export
- [ ] Test responsive design on different screen sizes

**Proceed Criteria:** All components and layouts work identically

**Estimated Reduction:** ~3000 lines reorganized into logical files

---

### Step 2.5.3: Create Modular CSS Import System
**Branch:** `refactor/modular-css-imports`

**Changes:**
- Create centralized CSS import system in main styles.css
- Add CSS loading order optimization
- Create plugin-ready CSS architecture
- Add CSS build system preparation

**Files Modified:**
- `src/styles/main.css` (new - centralized imports)
- `src/styles.css` (becomes lightweight import orchestrator)
- `src/index.html` (modified - single CSS import)
- Documentation for CSS architecture

**Commit Message:** `refactor: implement modular CSS import system`

**User Validation Required:**
- [ ] Test complete application functionality
- [ ] Verify CSS load order and performance
- [ ] Test all themes and components work
- [ ] Confirm no CSS conflicts or missing styles
- [ ] Validate CSS architecture supports future plugins

**Proceed Criteria:** Application works identically with new CSS architecture

**Benefits for Plugin System:**
- Plugins can easily add theme-specific styles
- Component-based CSS supports plugin stylesheets
- Modular structure enables CSS hot-reloading
- Clean separation supports theme plugins

**Final CSS Structure:**
```
src/styles/
├── main.css (imports all)
├── base/
│   ├── variables.css
│   ├── reset.css
│   └── layout.css
├── components/
│   ├── toolbar.css
│   ├── editor.css
│   ├── preview.css
│   ├── modals.css
│   └── tabs.css
├── themes/
│   ├── light.css
│   ├── dark.css
│   ├── retro.css
│   └── contrast.css
└── print/
    └── print.css
```

---

## Phase 3: Extension Points

### Step 3.1: Add Hook System to BaseComponent
**Branch:** `feature/add-hook-system`

**Changes:**
- Enhance `BaseComponent` with hook registration/execution
- Add common hooks: `beforeInit`, `afterInit`, `beforeDestroy`
- Update all components to use hook system

**Files Modified:**
- `src/components/BaseComponent.js` (modified)
- All component files (modified to add hooks)

**Commit Message:** `feature: add hook system for component extensibility`

**User Validation Required:**
- [ ] Test component initialization with hooks
- [ ] Verify hook execution order
- [ ] Test hook error handling

**Proceed Criteria:** Hooks work without affecting normal operation

---

### Step 3.2: Add Extension Points to Controllers
**Branch:** `feature/add-controller-extensions`

**Changes:**
- Add extension registration methods to each controller
- Create extension APIs for common operations
- Add extension lifecycle management

**Files Modified:**
- All controller files (modified)
- `src/core/ExtensionAPI.js` (new)

**Commit Message:** `feature: add extension points to controllers`

**User Validation Required:**
- [ ] Test extension registration/deregistration
- [ ] Verify extension API functionality
- [ ] Test multiple extensions on same controller

**Proceed Criteria:** Extensions can be registered without breaking core functionality

---

## Phase 4: Plugin Foundation

### Step 4.1: Create Plugin Manager
**Branch:** `feature/add-plugin-manager`

**Changes:**
- Create `src/core/PluginManager.js`
- Add plugin registration, lifecycle management
- Create basic plugin API interface

**Files Modified:**
- `src/core/PluginManager.js` (new)
- `src/components/MarkdownEditor.js` (modified)

**Commit Message:** `feature: add plugin manager foundation`

**User Validation Required:**
- [ ] Test plugin manager initialization
- [ ] Verify plugin lifecycle events
- [ ] Test plugin API access

**Proceed Criteria:** Plugin manager initializes without errors

---

### Step 4.2: Create Sample Plugin
**Branch:** `feature/add-sample-plugin`

**Changes:**
- Create `src/plugins/SamplePlugin.js`
- Implement basic plugin that adds a toolbar button
- Test plugin loading and activation

**Files Modified:**
- `src/plugins/SamplePlugin.js` (new)
- Plugin loading configuration

**Commit Message:** `feature: add sample plugin for testing`

**User Validation Required:**
- [ ] Test sample plugin loads correctly
- [ ] Verify plugin adds toolbar button
- [ ] Test plugin activation/deactivation
- [ ] Confirm no impact when plugin disabled

**Proceed Criteria:** Sample plugin works and can be toggled on/off

---

## Phase 5: Plugin Infrastructure

### Step 5.1: Add Plugin Configuration
**Branch:** `feature/add-plugin-config`

**Changes:**
- Create plugin configuration system
- Add plugin settings UI
- Implement plugin enable/disable functionality

**Files Modified:**
- `src/core/PluginConfig.js` (new)
- Settings UI components (modified)

**Commit Message:** `feature: add plugin configuration system`

**User Validation Required:**
- [ ] Test plugin configuration persistence
- [ ] Verify plugin enable/disable works
- [ ] Test plugin settings UI

**Proceed Criteria:** Plugin configuration works reliably

---

### Step 5.2: Add Plugin Discovery
**Branch:** `feature/add-plugin-discovery`

**Changes:**
- Create plugin discovery mechanism
- Add plugin loading from filesystem
- Implement plugin validation

**Files Modified:**
- `src/core/PluginLoader.js` (new)
- Backend Rust commands for plugin discovery

**Commit Message:** `feature: add plugin discovery and loading`

**User Validation Required:**
- [ ] Test plugin discovery from folders
- [ ] Verify plugin validation works
- [ ] Test loading multiple plugins

**Proceed Criteria:** Plugins can be discovered and loaded automatically

---

## Validation Checklist Template

For each step, verify:
- [ ] **Functionality**: All existing features work identically
- [ ] **Performance**: No significant performance regression
- [ ] **Stability**: No new crashes or errors
- [ ] **User Experience**: UI/UX remains unchanged
- [ ] **Data Integrity**: Settings and files are preserved

## Rollback Plan

If any step fails validation:
1. Document the specific issue
2. Revert to previous working branch
3. Analyze the problem
4. Create fix in new branch
5. Re-test before proceeding

## Success Criteria

After completing all phases:
- [ ] Application works identically to original
- [ ] Plugin system is functional
- [ ] Sample plugin demonstrates extensibility
- [ ] Architecture supports future plugin development
- [ ] No performance or stability regressions

## Current Status

**Phase:** Phase 1 - Foundation Refactoring (Extended)  
**Current Step:** Step 2.1 ✅ MERGED - Dependency Injection Started  
**Total Reduction Achieved:** ~1000+ lines from MarkdownEditor.js  
**Last Updated:** 2024-12-19 20:15

## Notes

- Each step requires user validation before proceeding
- No step should be merged without passing all validation criteria
- Document any issues or deviations from the plan
- Update this file after each completed step

### Phase 1 Extension Notes

- **Steps 1.5-1.8 added** based on code analysis showing MarkdownEditor.js still >2000 lines
- **No impact on Phase 2+** since dependency injection hasn't started yet
- **Priority order:** TabUIController (highest impact), ModeController, MarkdownActionController, ExportController (optional)
- **Total estimated reduction:** ~1000+ lines, leaving MarkdownEditor as pure orchestrator
- **Step 1.8 is optional** and can be deferred if Phase 1 goals are met with steps 1.5-1.7