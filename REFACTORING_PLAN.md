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

**Commit Message:** `refactor: extract keyboard handling into KeyboardController`

**User Validation Required:**
- [ ] Test all keyboard shortcuts (Ctrl+N, Ctrl+O, Ctrl+S, etc.)
- [ ] Test mode switching shortcuts (Ctrl+1,2,3)
- [ ] Test tab navigation (Alt+1-9, Ctrl+Tab)
- [ ] Test markdown shortcuts in editor

**Proceed Criteria:** All keyboard shortcuts function correctly

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
- [ ] Test settings persistence across app restarts
- [ ] Test all settings changes in settings modal
- [ ] Test performance dashboard updates
- [ ] Verify settings export/import if available

**Proceed Criteria:** Settings work and persist correctly

---

## Phase 2: Dependency Injection

### Step 2.1: Add Constructor Injection
**Branch:** `refactor/add-dependency-injection`

**Changes:**
- Modify `MarkdownEditor` constructor to accept controller dependencies
- Create factory function for default controller creation
- Update initialization in `main.js`

**Files Modified:**
- `src/components/MarkdownEditor.js` (modified)
- `src/main.js` (modified)

**Commit Message:** `refactor: add dependency injection for controllers`

**User Validation Required:**
- [ ] Test complete application functionality
- [ ] Verify no performance regression
- [ ] Test with different controller combinations

**Proceed Criteria:** App works identically with new injection system

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

**Phase:** Phase 1 - Foundation Refactoring  
**Current Step:** Step 1.1 ✅ MERGED - Ready for Step 1.2  
**Last Updated:** 2024-12-19 14:30

## Notes

- Each step requires user validation before proceeding
- No step should be merged without passing all validation criteria
- Document any issues or deviations from the plan
- Update this file after each completed step