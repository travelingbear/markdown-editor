# Markdown Editor - Code Cleanup Action Plan

**Generated:** December 2024  
**Status:** Ready to Execute  
**Total Issues Found:** 50+ (Top 50 analyzed)

## Overview
This plan addresses debug code, security vulnerabilities, performance issues, and code quality problems found in the markdown editor codebase.

## Pre-Execution Checklist
- [ ] Create backup branch: `git checkout -b backup-before-cleanup`
- [ ] Create working branch: `git checkout -b code-cleanup`
- [ ] Commit current state: `git commit -am "Pre-cleanup state"`

---

## Phase 1: Remove Debug Code and Unused Elements
**Priority:** High | **Risk:** Low | **Estimated Time:** 30 minutes

### Phase 1.1: Remove Debug File
**Files:** `src/debug-ipc.js`, `src/index.html`
- [ ] Delete `src/debug-ipc.js` entirely
- [ ] Remove script reference from `index.html`
- [ ] Test: Ensure app still loads without errors
- [ ] Commit: `git commit -am "Phase 1.1: Remove debug-ipc.js"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 1.2: Clean Debug Console Statements
**Files:** `src/main.js`, `src/performance-optimizer.js`
- [ ] Remove `localStorage.getItem('debug') === 'true'` checks
- [ ] Remove associated debug console.log statements
- [ ] Keep essential error logging
- [ ] Test: Verify no debug logs appear in console
- [ ] Commit: `git commit -am "Phase 1.2: Remove debug console statements"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 1.3: Remove Unused Variables and Queries
**Files:** `src/main.js`
- [ ] Remove unused `checkboxes` variable (line 2306)
- [ ] Remove other unused DOM queries identified
- [ ] Test: Ensure no functionality is broken
- [ ] Commit: `git commit -am "Phase 1.3: Remove unused variables"`
- [ ] **VALIDATION REQUIRED** ✋

**Phase 1 Complete** - Request permission to proceed to Phase 2

---

## Phase 2: Fix Critical Security Issues
**Priority:** Critical | **Risk:** Medium | **Estimated Time:** 45 minutes

### Phase 2.1: Fix Log Injection (CWE-117)
**Files:** `src/main.js`, `src/ipc-wrapper.js`
**Critical Lines:** 1707-1708, 3277-3278, 3312-3313, 4174-4175, 65-66, 77-78

- [ ] Sanitize user inputs before logging using `encodeURIComponent()`
- [ ] Replace direct error logging with sanitized versions
- [ ] Ensure SecurityUtils.sanitizeForLog is used consistently
- [ ] Test: Verify logs don't contain unsanitized user input
- [ ] Commit: `git commit -am "Phase 2.1: Fix log injection vulnerabilities"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 2.2: Fix Code Injection (CWE-94)
**Files:** `src/ipc-wrapper.js`
**Critical Lines:** 43-44

- [ ] Add input validation for command parameters
- [ ] Sanitize command strings before processing
- [ ] Add type checking for IPC commands
- [ ] Test: Verify IPC still works with validation
- [ ] Commit: `git commit -am "Phase 2.2: Fix code injection vulnerability"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 2.3: Replace Insecure Dialogs
**Files:** `src/main.js`
**Lines:** 1406-1407

- [ ] Replace `alert()` calls with Tauri dialog API
- [ ] Ensure no sensitive data in dialog messages
- [ ] Add fallback for non-Tauri environments
- [ ] Test: Verify dialogs work correctly
- [ ] Commit: `git commit -am "Phase 2.3: Replace insecure dialogs"`
- [ ] **VALIDATION REQUIRED** ✋

**Phase 2 Complete** - Request permission to proceed to Phase 3

---

## Phase 3: Fix Performance Issues
**Priority:** High | **Risk:** Low | **Estimated Time:** 40 minutes

### Phase 3.1: Fix Memory Leaks
**Files:** `src/main.js`, `src/performance-optimizer.js`
**Lines:** 1744-1764, 4031-4048, 350-353

- [ ] Add cleanup for event listeners in setupWindowCloseHandler
- [ ] Store and clear interval in setupAggressiveCleanup
- [ ] Fix setupDistractionFreeHover event listener cleanup
- [ ] Test: Verify no memory leaks in dev tools
- [ ] Commit: `git commit -am "Phase 3.1: Fix memory leaks"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 3.2: Optimize DOM Operations
**Files:** `src/main.js`
**Lines:** 3072-3075, 4793-4816, 5110-5112

- [ ] Batch localStorage operations in theme toggle
- [ ] Optimize font size DOM updates with requestAnimationFrame
- [ ] Remove redundant DOM queries in closeAllToolbarDropdowns
- [ ] Test: Verify UI responsiveness
- [ ] Commit: `git commit -am "Phase 3.2: Optimize DOM operations"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 3.3: Fix Cache Inefficiencies
**Files:** `src/main.js`, `src/performance-optimizer.js`
**Lines:** 4351-4352, 138-139

- [ ] Improve FIFO cache eviction pattern
- [ ] Fix hash function in performance optimizer
- [ ] Optimize cache size management
- [ ] Test: Verify caching still works correctly
- [ ] Commit: `git commit -am "Phase 3.3: Fix cache inefficiencies"`
- [ ] **VALIDATION REQUIRED** ✋

**Phase 3 Complete** - Request permission to proceed to Phase 4

---

## Phase 4: Code Quality Improvements
**Priority:** Medium | **Risk:** Low | **Estimated Time:** 35 minutes

### Phase 4.1: Extract Constants
**Files:** `src/main.js`
**Lines:** 3114-3115, 3782-3787

- [ ] Extract duplicate SVG strings to constants
- [ ] Move hardcoded performance targets to class properties
- [ ] Create constants for magic numbers
- [ ] Test: Verify functionality unchanged
- [ ] Commit: `git commit -am "Phase 4.1: Extract constants"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 4.2: Improve Error Handling
**Files:** `src/main.js`, `src/performance-optimizer.js`
**Lines:** 462-471, 1203-1206, 1257-1270, 2437-2438

- [ ] Add null checks for DOM elements
- [ ] Add try-catch for promise chains
- [ ] Validate inputs before processing
- [ ] Add error handling for method calls
- [ ] Test: Verify error handling works
- [ ] Commit: `git commit -am "Phase 4.2: Improve error handling"`
- [ ] **VALIDATION REQUIRED** ✋

### Phase 4.3: Reduce Code Duplication
**Files:** `src/main.js`
**Lines:** 2045-2096, 2203-2241, 5476-5529

- [ ] Extract common regex patterns
- [ ] Create helper functions for repeated logic
- [ ] Consolidate similar task processing code
- [ ] Test: Verify all functionality works
- [ ] Commit: `git commit -am "Phase 4.3: Reduce code duplication"`
- [ ] **VALIDATION REQUIRED** ✋

**Phase 4 Complete** - Request permission to proceed to Phase 5 (Optional)

---

## Phase 5: Refactor Large Methods (Optional)
**Priority:** Low | **Risk:** Medium | **Estimated Time:** 60 minutes

### Phase 5.1: Break Down Large Methods
**Files:** `src/main.js`
**Methods:** `setMode()`, `setupMarkdownToolbarEvents()`, `cleanupEventListeners()`

- [ ] Extract `setMode()` into smaller functions
- [ ] Break down `setupMarkdownToolbarEvents()`
- [ ] Modularize `cleanupEventListeners()`
- [ ] Test: Comprehensive functionality testing
- [ ] Commit: `git commit -am "Phase 5.1: Refactor large methods"`
- [ ] **VALIDATION REQUIRED** ✋

**Phase 5 Complete** - Final validation

---

## Post-Cleanup Checklist
- [ ] Run full application test suite
- [ ] Test all major features (file operations, preview, export)
- [ ] Check console for any new errors
- [ ] Verify performance improvements
- [ ] Create final commit: `git commit -am "Code cleanup complete"`
- [ ] Merge to main: `git checkout main && git merge code-cleanup`
- [ ] Tag release: `git tag -a v1.0.1-cleanup -m "Code cleanup release"`

## Rollback Plan
If issues arise:
```bash
git checkout main
git reset --hard backup-before-cleanup
```

## Notes
- Each phase builds on the previous one
- Validation required after each sub-phase
- Permission required before each new phase
- All changes are reversible via git
- Focus on minimal, targeted changes