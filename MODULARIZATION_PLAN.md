# Modularization Plan - Phase 2

**Date:** December 12, 2024  
**Version:** 3.3.1  
**Goal:** Further modularize the application for faster startup and better code organization

**Quality Requirements:**
- ✅ Comprehensive tests for each change
- 📝 Documentation updates for all features
- 👤 User validation before finalizing

---

## Overview

This plan addresses three main areas:
1. **Welcome Page Independence** - Decouple welcome page from mode system
2. **Theme Flash Fix** - Eliminate light→dark theme flash on startup
3. **Feature Modularization** - Lazy load optional features (pinned tabs, export, markdown toolbar)

---

## 1. Welcome Page Independence

### Current State
- Welcome page is inside `.preview-pane` div
- App initializes with `currentMode = 'preview'` even with no document
- Mode controller and view components initialize on startup
- Welcome page is tied to preview mode semantically

### Problems
- Unnecessary component initialization when showing welcome
- Mode system loads even when not needed
- Confusing coupling between "no document" and "preview mode"

### Proposed Solution

#### 1.1 HTML Structure Change
```html
<!-- Current -->
<div class="preview-pane">
  <div id="welcome-page">...</div>
  <div id="preview">...</div>
</div>

<!-- Proposed -->
<div class="main-content">
  <div id="welcome-container" class="welcome-container">
    <div id="welcome-page">...</div>
  </div>
  <div class="editor-preview-container" style="display: none;">
    <div class="editor-pane">...</div>
    <div id="splitter">...</div>
    <div class="preview-pane">...</div>
  </div>
</div>
```

#### 1.2 Mode State Changes
- Add `null` or `'welcome'` as initial mode state
- Only initialize mode controller when first document opens
- Update mode switching to hide/show containers appropriately

#### 1.3 Component Initialization
```javascript
// Current: Always initialize
await this.createComponents(); // Loads everything

// Proposed: Lazy initialize
if (hasDocument) {
  await this.ensureViewComponentsInitialized();
  this.modeController.setMode(defaultMode);
}
```

### Expected Benefits
- 15-25ms faster startup (no mode initialization)
- Clearer separation of concerns
- Better code readability

### Risks
- Need to ensure all welcome page interactions still work
- Mode switching logic needs careful testing
- CSS may need adjustments for new structure

---

## 2. Theme Flash Fix

### Current State
- `styles.css` includes light theme as default
- JavaScript loads and switches theme after page renders
- Visible flash from light→dark on startup with dark theme

### Problems
- Poor user experience (flash effect)
- Makes app feel sluggish
- Loads unnecessary CSS (light theme when using dark)

### Proposed Solution

#### 2.1 Extract Light Theme
```
styles/
├── styles.css (base + theme-neutral)
├── themes/
│   ├── light.css (extracted)
│   ├── dark.css (existing)
│   ├── retro.css (existing)
│   └── contrast.css (existing)
```

#### 2.2 Inline Theme Loader
Add to `<head>` before any CSS:
```html
<script>
(function() {
  const theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
  const isRetro = localStorage.getItem('markdownViewer_retroTheme') === 'true';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.add(isRetro ? 'retro-theme' : theme + '-theme');
  
  // Preload theme CSS
  if (theme !== 'light' || isRetro) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = isRetro ? 'styles/themes/retro.css' : `styles/themes/${theme}.css`;
    document.head.appendChild(link);
  }
})();
</script>
```

#### 2.3 Update StyleManager
- Remove light theme from base `styles.css`
- Add light theme to dynamic loading system
- Ensure theme switching still works smoothly

### Expected Benefits
- Zero theme flash on startup
- Feels instant and professional
- Only loads needed theme CSS

### Risks
- Inline script must be tiny and fast
- Must not break existing theme switching
- Need to test all theme combinations

---

## 3. Feature Modularization

### 3.1 Markdown Toolbar

**Current State:**
- Already extracted to `styles/markdown-toolbar.css`
- Loaded dynamically by StyleManager
- Always loaded even if toolbar is disabled

**Proposed:**
- Lazy load only when:
  - Toolbar is enabled in settings, AND
  - User enters Code or Split mode
- Add loading trigger in ModeController

**Expected Savings:** ~30KB CSS, 5-10ms startup

---

### 3.2 Pinned Tabs

**Current State:**
- CSS in main `styles.css` (~50 lines)
- Always loaded even if disabled
- Feature is optional (can be toggled in settings)

**Proposed:**
- Extract to `styles/features/pinned-tabs.css`
- Load only when `pinnedTabsEnabled === true`
- Add loading trigger in UIController.setPinnedTabsEnabled()

**Expected Savings:** ~5KB CSS, 2-3ms startup

---

### 3.3 Export Options

**Current State:**
- ExportController.js already modularized
- Export dropdown CSS in main styles
- Rarely used feature (occasional use)

**Proposed:**
- Extract dropdown CSS to `styles/features/export-dropdown.css`
- Load on first dropdown open
- Add loading trigger in ToolbarComponent

**Expected Savings:** ~3KB CSS, 1-2ms startup

---

## Implementation Phases

### Phase 0: Splash Screen Until Ready (Highest Priority)
**Estimated Time:** 1-2 hours  
**Complexity:** Low  
**Risk:** Low  
**Impact:** Eliminates visible mode switching flash

#### Implementation Steps:
1. Keep splash visible during document loading
2. Set mode before hiding splash
3. Add progress indicator for document loading
4. Test with all mode combinations

#### Testing Requirements:
- [ ] Test with "Reopen Last Tabs" enabled
- [ ] Test with "Reopen Last Tabs" disabled
- [ ] Test with Code mode as default
- [ ] Test with Preview mode as default
- [ ] Test with Split mode as default
- [ ] Test opening file via file association
- [ ] Test opening file via drag & drop
- [ ] Verify no mode switching visible to user
- [ ] Verify splash shows appropriate loading message

#### Documentation Updates:
- [ ] Update USER_GUIDE.md with startup behavior
- [ ] Update TECHNICAL_DOCUMENTATION.md with splash timing
- [ ] Add comments in code explaining splash lifecycle

#### User Validation:
- [ ] User confirms no visible mode switching
- [ ] User confirms loading feels smooth
- [ ] User confirms splash duration is appropriate

**Success Criteria:**
- No visible mode switching on startup
- Splash hides only when document is ready in correct mode
- Loading feels professional and smooth
- All startup scenarios work correctly

---

### Phase 1: Monaco Editor Optimization (High Priority)
**Estimated Time:** 3-4 hours  
**Complexity:** Medium  
**Risk:** Medium  
**Impact:** 60% size reduction (~2.5MB savings)

#### Implementation Steps:
1. Analyze current Monaco usage
2. Create custom Monaco build configuration
3. Remove unused languages (keep only markdown)
4. Disable unused features (minimap, color picker, etc.)
5. Test all editor functionality
6. Measure size reduction

#### Features to Remove:
- [ ] All languages except Markdown
- [ ] Minimap
- [ ] Color picker
- [ ] Snippet suggestions
- [ ] Parameter hints
- [ ] Code lens
- [ ] Folding (optional)
- [ ] Unused themes

#### Features to Keep:
- [ ] Markdown syntax highlighting
- [ ] Line numbers
- [ ] Find/Replace
- [ ] Basic editing
- [ ] Undo/Redo
- [ ] Bracket matching
- [ ] Word wrap

#### Testing Requirements:
- [ ] Test markdown syntax highlighting
- [ ] Test find/replace functionality
- [ ] Test undo/redo
- [ ] Test line numbers display
- [ ] Test word wrap
- [ ] Test bracket matching
- [ ] Test copy/paste
- [ ] Test selection
- [ ] Test scrolling
- [ ] Test font size changes
- [ ] Measure bundle size before/after
- [ ] Measure load time before/after

#### Documentation Updates:
- [ ] Update BUILD_GUIDE.md with Monaco build process
- [ ] Document Monaco configuration in TECHNICAL_DOCUMENTATION.md
- [ ] Add comments explaining custom build
- [ ] Update package.json with build scripts

#### User Validation:
- [ ] User confirms all needed features work
- [ ] User confirms editor feels responsive
- [ ] User confirms no missing functionality

**Success Criteria:**
- Monaco bundle reduced by ~60% (~2.5MB)
- All required features work correctly
- No performance degradation
- Editor loads faster

---

### Phase 2: Welcome Page Independence (High Priority)
**Estimated Time:** 2-3 hours  
**Complexity:** Medium  
**Risk:** Medium  
**Impact:** 50% faster startup for welcome page

#### Implementation Steps:
1. Create new HTML structure
2. Update CSS for new containers
3. Add welcome mode state
4. Update mode controller logic
5. Defer Phase 3 & 4 component loading
6. Test all welcome page interactions
7. Test mode switching with/without documents

#### Testing Requirements:
- [ ] Welcome page shows without mode system
- [ ] New file button works
- [ ] Open file button works
- [ ] Recent files work
- [ ] Settings button works
- [ ] Help button works
- [ ] About button works
- [ ] First document triggers component loading
- [ ] Mode switches correctly after loading
- [ ] All tabs close returns to welcome
- [ ] Measure startup time improvement

#### Documentation Updates:
- [ ] Update TECHNICAL_DOCUMENTATION.md with new architecture
- [ ] Document welcome mode state
- [ ] Update COMPONENT_LOADING_ORDER.md
- [ ] Add architecture diagram

#### User Validation:
- [ ] User confirms welcome page loads faster
- [ ] User confirms all welcome interactions work
- [ ] User confirms smooth transition to document

**Success Criteria:**
- Welcome page shows without initializing mode system
- First document open triggers mode initialization
- All mode switches work correctly
- No visual regressions
- 30ms faster startup (50% improvement)

---

### Phase 3: Mode Modularization (Medium Priority)
**Estimated Time:** 3-4 hours  
**Complexity:** Medium  
**Risk:** Medium  
**Impact:** Better code organization, lazy loading

#### Implementation Steps:
1. Create BaseModeHandler class
2. Create CodeModeHandler
3. Create PreviewModeHandler
4. Create SplitModeHandler
5. Refactor ModeController to use handlers
6. Implement lazy loading for handlers
7. Test all mode switches

#### Testing Requirements:
- [ ] Code mode activates correctly
- [ ] Preview mode activates correctly
- [ ] Split mode activates correctly
- [ ] Mode switching works in all directions
- [ ] Monaco loads only when needed
- [ ] Preview loads only when needed
- [ ] Scroll positions preserved
- [ ] Editor state preserved
- [ ] All keyboard shortcuts work
- [ ] All toolbar buttons work
- [ ] Measure mode switch performance

#### Documentation Updates:
- [ ] Document mode handler architecture
- [ ] Update TECHNICAL_DOCUMENTATION.md
- [ ] Add JSDoc comments to all handlers
- [ ] Create mode handler diagram

#### User Validation:
- [ ] User confirms all modes work correctly
- [ ] User confirms mode switching is smooth
- [ ] User confirms no functionality lost

**Success Criteria:**
- Each mode is self-contained
- Modes load lazily
- All mode functionality preserved
- Code is cleaner and more maintainable

---

### Phase 4: Theme Flash Fix (Medium Priority)
**Estimated Time:** 1-2 hours  
**Complexity:** Low  
**Risk:** Low  
**Impact:** Eliminates theme flash on startup

#### Implementation Steps:
1. Extract light theme CSS
2. Add inline theme loader script
3. Update StyleManager
4. Test all theme combinations
5. Verify no flash on startup

#### Testing Requirements:
- [ ] Light theme loads without flash
- [ ] Dark theme loads without flash
- [ ] Retro theme loads without flash
- [ ] High contrast theme loads without flash
- [ ] Theme toggle works correctly
- [ ] Theme persists across restarts
- [ ] All theme-specific features work
- [ ] Measure startup time with each theme

#### Documentation Updates:
- [ ] Document inline theme loader
- [ ] Update TECHNICAL_DOCUMENTATION.md
- [ ] Add comments explaining theme loading
- [ ] Update USER_GUIDE.md with theme info

#### User Validation:
- [ ] User confirms no theme flash
- [ ] User confirms themes look correct
- [ ] User confirms theme switching works

**Success Criteria:**
- No theme flash on any theme
- Theme switching still works
- All themes render correctly
- Performance improvement measurable

---

### Phase 5: Feature Modularization (Low Priority)
**Estimated Time:** 2-3 hours  
**Complexity:** Low  
**Risk:** Low  
**Impact:** Minor performance improvement

#### Implementation Steps:
1. Extract pinned tabs CSS
2. Extract export dropdown CSS
3. Extract markdown toolbar CSS (if not done)
4. Update StyleManager with lazy loading
5. Add loading triggers
6. Test feature toggles
7. Verify no visual regressions

#### Testing Requirements:
- [ ] Pinned tabs load when enabled
- [ ] Pinned tabs don't load when disabled
- [ ] Export dropdown loads on first use
- [ ] Markdown toolbar loads when needed
- [ ] All features work after loading
- [ ] No visual delay when loading
- [ ] Feature toggles work correctly
- [ ] Measure CSS load reduction

#### Documentation Updates:
- [ ] Document lazy loading strategy
- [ ] Update TECHNICAL_DOCUMENTATION.md
- [ ] Add comments for loading triggers

#### User Validation:
- [ ] User confirms all features work
- [ ] User confirms no visual issues
- [ ] User confirms feature toggles work

**Success Criteria:**
- Features load only when needed
- No visual delay when loading
- All features work correctly
- Measurable performance improvement

---

## Testing Checklist

### Welcome Page
- [ ] Welcome page shows on first launch
- [ ] New file opens in correct mode
- [ ] Open file opens in correct mode
- [ ] Recent files work correctly
- [ ] Welcome page hides when document opens
- [ ] Welcome page shows when all tabs closed

### Theme System
- [ ] Light theme loads without flash
- [ ] Dark theme loads without flash
- [ ] Retro theme loads without flash
- [ ] High contrast theme loads without flash
- [ ] Theme toggle works in all directions
- [ ] Theme persists across restarts

### Features
- [ ] Markdown toolbar loads when enabled
- [ ] Markdown toolbar doesn't load when disabled
- [ ] Pinned tabs load when enabled
- [ ] Pinned tabs don't load when disabled
- [ ] Export dropdown loads on first use
- [ ] All features work correctly after loading

### Performance
- [ ] Startup time improved (measure before/after)
- [ ] Memory usage reduced (measure before/after)
- [ ] No visual regressions
- [ ] No functionality regressions

---

## Performance Targets

### Before Optimization
- Startup time (welcome): ~60ms
- Startup time (with doc): ~60ms + visible mode switch
- Monaco bundle: ~3-4MB
- Initial CSS load: ~150KB
- Memory usage: ~50MB

### After Optimization (Expected)
- Startup time (welcome): ~30ms (50% improvement)
- Startup time (with doc): ~80ms (no visible switch)
- Monaco bundle: ~1-1.5MB (60% reduction)
- Initial CSS load: ~110KB (27% reduction)
- Memory usage: ~40MB (20% reduction)

### Measurement Requirements
- [ ] Measure startup time before each phase
- [ ] Measure startup time after each phase
- [ ] Measure bundle sizes before/after
- [ ] Measure memory usage before/after
- [ ] Document all measurements
- [ ] Create performance comparison chart

---

## Rollback Plan

If any phase causes issues:

1. **Phase 0 Issues:** Revert splash timing, restore immediate hide
2. **Phase 1 Issues:** Restore full Monaco build, revert to standard loader
3. **Phase 2 Issues:** Revert HTML structure, restore mode initialization
4. **Phase 3 Issues:** Restore monolithic ModeController, remove handlers
5. **Phase 4 Issues:** Remove inline script, restore light theme to base CSS
6. **Phase 5 Issues:** Move CSS back to main styles, remove lazy loading

Each phase is independent and can be rolled back without affecting others.

### Rollback Testing:
- [ ] Test rollback procedure for each phase
- [ ] Verify app works after rollback
- [ ] Document rollback steps
- [ ] Keep backup of working code before each phase

---

## Open Questions

1. Should we add a loading indicator for lazy-loaded features?
2. Should markdown toolbar load immediately in Code mode or wait for first edit?
3. Should we preload dark theme if it's the most commonly used?
4. Should we add telemetry to measure actual performance improvements?
5. Should welcome page have its own minimal CSS file?
6. Should we create a performance benchmark suite?
7. Should we add automated performance regression tests?
8. Should we create a user feedback form for each phase?

---

## Quality Assurance Process

### For Each Phase:

#### 1. Pre-Implementation
- [ ] Review implementation plan
- [ ] Identify potential risks
- [ ] Create test plan
- [ ] Set up performance benchmarks
- [ ] Create backup/branch

#### 2. During Implementation
- [ ] Write code with comments
- [ ] Write unit tests (if applicable)
- [ ] Write integration tests
- [ ] Update documentation as you go
- [ ] Commit frequently with clear messages

#### 3. Post-Implementation
- [ ] Run all tests
- [ ] Measure performance improvements
- [ ] Update all relevant documentation
- [ ] Create user validation checklist
- [ ] Get user feedback
- [ ] Address any issues found
- [ ] Update CHANGELOG.md

#### 4. User Validation
- [ ] User tests all affected features
- [ ] User confirms improvements
- [ ] User reports any issues
- [ ] Address user feedback
- [ ] Get final user approval

#### 5. Finalization
- [ ] Merge to main branch
- [ ] Tag release (if applicable)
- [ ] Update version number
- [ ] Create release notes
- [ ] Archive phase documentation

---

## Component Loading Order

### Current Initialization Phases

**Phase 1: Critical Controllers (Sequential)** - ~5ms
- SettingsController - Must load first, provides config to all components

**Phase 2: Independent Components (Parallel)** - ~15ms
- UIController - Theme management, modals, layout
- FileController - File operations, drag & drop
- TabManager - Tab state management
- DocumentComponent - Document state and operations
- ToolbarComponent - Toolbar UI and interactions

**Phase 3: View Components (Parallel)** - ~20ms ⚠️ **Can be deferred**
- EditorComponent - Monaco editor (lazy loaded)
- PreviewComponent - Markdown preview rendering

**Phase 4: Dependent Controllers (Parallel)** - ~10ms ⚠️ **Can be deferred**
- ModeController - Requires EditorComponent, PreviewComponent, ToolbarComponent
- TabUIController - Requires TabManager, SettingsController
- MarkdownActionController - Requires EditorComponent, DocumentComponent
- ExportController - Requires EditorComponent

**Total Current Startup:** ~60ms

### Optimization Opportunity

**Phase 3 & 4 can be deferred** until:
- User opens a file, OR
- User creates new file, OR
- "Reopen last tabs" is enabled and has tabs to restore

**Potential Savings:** ~30ms (50% faster startup for welcome page)

### Dependencies Graph
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

## Documentation Requirements

### Files to Update Per Phase:

#### Phase 0: Splash Screen
- [ ] USER_GUIDE.md - Startup behavior
- [ ] TECHNICAL_DOCUMENTATION.md - Splash lifecycle
- [ ] Code comments - Splash timing logic
- [ ] CHANGELOG.md - User-facing changes

#### Phase 1: Monaco Optimization
- [ ] BUILD_GUIDE.md - Monaco build process
- [ ] TECHNICAL_DOCUMENTATION.md - Monaco configuration
- [ ] package.json - Build scripts
- [ ] Code comments - Custom build explanation
- [ ] CHANGELOG.md - Performance improvements

#### Phase 2: Welcome Page Independence
- [ ] TECHNICAL_DOCUMENTATION.md - Architecture changes
- [ ] COMPONENT_LOADING_ORDER.md - Updated flow
- [ ] Architecture diagram - New structure
- [ ] Code comments - Welcome mode state
- [ ] CHANGELOG.md - Startup improvements

#### Phase 3: Mode Modularization
- [ ] TECHNICAL_DOCUMENTATION.md - Mode handler architecture
- [ ] Architecture diagram - Mode handlers
- [ ] JSDoc comments - All handlers
- [ ] Code comments - Lazy loading
- [ ] CHANGELOG.md - Code improvements

#### Phase 4: Theme Flash Fix
- [ ] TECHNICAL_DOCUMENTATION.md - Theme loading
- [ ] USER_GUIDE.md - Theme information
- [ ] Code comments - Inline loader
- [ ] CHANGELOG.md - UX improvements

#### Phase 5: Feature Modularization
- [ ] TECHNICAL_DOCUMENTATION.md - Lazy loading strategy
- [ ] Code comments - Loading triggers
- [ ] CHANGELOG.md - Performance improvements

---

## Notes

- All changes should maintain backward compatibility
- No breaking changes to user settings
- All features must work exactly as before
- Focus on performance without sacrificing functionality
- Keep code clean and maintainable
- See `COMPONENT_LOADING_ORDER.md` for detailed loading sequence
- **Every phase requires user validation before proceeding**
- **All tests must pass before user validation**
- **Documentation must be updated before marking phase complete**
