# Centered Layout Scroll Sync Issue

## Problem Description
When Centered Layout is activated in settings, the scroll synchronization between Code and Preview modes in Split view does not work properly. Specifically:

- **Normal Layout**: Scroll sync works perfectly between code editor and preview
- **Centered Layout**: Scrolling in preview does NOT sync with the code editor
- **Affected Modes**: Split mode (where both code and preview are visible)
- **User Impact**: Users lose scroll synchronization when using centered layout

## Technical Context

### Current Scroll Sync Implementation
The scroll sync system has two main functions:
1. `syncScrollToPreview()` - Syncs from editor to preview
2. `syncScrollToEditor()` - Syncs from preview to editor

### Centered Layout CSS Structure
When centered layout is enabled:
```css
body.centered-layout .preview-content {
  max-width: var(--current-page-width);
  margin: 0 auto;
  /* Creates a centered container within the preview pane */
}
```

### Current Event Listeners
- `this.preview.addEventListener('scroll', ...)` - Listens to preview content scroll
- `previewPane.addEventListener('scroll', ...)` - Added for centered layout (recent fix attempt)

## Suspected Root Cause
In centered layout, the scroll container hierarchy changes:
- **Normal Layout**: `.preview-content` is the scrolling element
- **Centered Layout**: `.preview-pane` becomes the scrolling element, `.preview-content` is centered within it

The issue likely stems from:
1. Event listeners targeting wrong scroll elements
2. Scroll calculation using wrong container dimensions
3. CSS transforms affecting scroll behavior in centered layout

## Files Involved
- `src/main.js` - Contains scroll sync logic
- `src/styles.css` - Contains centered layout CSS rules

## Methods to Investigate
- `setupScrollSync()` - Event listener setup
- `syncScrollToEditor()` - Preview to editor sync
- `syncScrollToPreview()` - Editor to preview sync
- `updateCachedScrollInfo()` - Scroll dimension caching

## Test Scenario
1. Enable Centered Layout in settings
2. Open a document with enough content to scroll
3. Switch to Split mode
4. Scroll in preview area
5. Observe that code editor does not scroll correspondingly

## Previous Fix Attempts
- ~~Added preview pane scroll listener for centered layout~~ (Caused duplicate listeners)
- ~~Modified sync functions to target different elements based on layout mode~~ (Used hardcoded logic)
- ~~Issue persists despite these changes~~ (Root cause was incorrect element detection)

## Final Fix Implementation
- **Dynamic Element Detection**: Added `getActiveScrollElement()` to detect actual scrolling element
- **Proper Event Management**: Eliminated duplicate listeners and added cleanup
- **Layout Change Handling**: Re-initialize scroll sync when switching layouts
- **Unified Logic**: Both sync directions use the same element detection method

## Root Cause Analysis (IN PROGRESS)

The issue was caused by **incorrect scroll element detection** in the scroll synchronization system:

### Problem Details:
1. **Normal Layout**: `.preview-content` element handles scrolling (`overflow-y: auto`)
2. **Centered Layout**: `.preview-pane` element handles scrolling, while `.preview-content` has `overflow-y: visible`
3. **Original Code Issue**: The sync functions assumed a fixed scroll element based on layout mode, but didn't verify which element actually had scrollable content

### Technical Issues Fixed:
1. **Duplicate Event Listeners**: Both `.preview` and `.preview-pane` had scroll listeners, causing conflicts
2. **Wrong Element Detection**: `syncScrollToEditor()` used hardcoded element selection instead of detecting the active scroll element
3. **Missing Layout Change Handling**: When switching between centered/normal layout, scroll sync wasn't re-initialized

## Solution Implemented

### 1. Dynamic Scroll Element Detection
Added `getActiveScrollElement()` method that:
- Detects which element actually has scrollable content
- Returns the correct scroll container based on current layout mode
- Handles edge cases where elements might not be scrollable

### 2. Improved Event Listener Management
- Stores scroll handler references for proper cleanup
- Prevents duplicate event listeners
- Re-initializes scroll sync when layout changes

### 3. Unified Scroll Sync Logic
- Both `syncScrollToEditor()` and `syncScrollToPreview()` now use the same element detection logic
- Eliminates hardcoded assumptions about scroll containers
- Works consistently across all layout modes

### Code Changes Made:
1. **setupScrollSync()**: Added proper event listener cleanup and dynamic element detection
2. **getActiveScrollElement()**: New method to detect the actual scrolling element
3. **syncScrollToEditor()**: Uses dynamic element detection instead of hardcoded logic
4. **syncScrollToPreview()**: Uses dynamic element detection instead of hardcoded logic
5. **applyCenteredLayout()**: Re-initializes scroll sync when layout changes
6. **cleanupEventListeners()**: Properly cleans up scroll event handlers
7. **Monaco scroll handler**: Added `!this.isScrollSyncing` check to prevent infinite loops

## Current Status
🔄 **Testing Latest Fix** - Implemented unified scroll handler approach

## Latest Fix Implementation
- **Unified Scroll Handler**: Created single handler function that works for both elements
- **Proper Element Detection**: Simplified `getActiveScrollElement()` to correctly identify scroll container
- **Event Target Validation**: Handler only processes events from the actual scrolling element
- **Removed Debug Logging**: Cleaned up console output for production use

## Test Results (Awaiting User Validation)
✅ **Normal Layout**: Scroll sync works in both directions  
🔄 **Centered Layout**: Testing new unified handler approach  
✅ **Layout Switching**: Re-initializes scroll sync when layout changes  
✅ **No Conflicts**: Eliminated duplicate event listeners and scroll conflicts  
✅ **Code Mode**: Fixed infinite scroll loop in Monaco editor event handler

## Technical Solution Summary
The issue was caused by having separate handlers for `.preview-content` and `.preview-pane` elements. The new approach:
1. Uses a single unified handler for both elements
2. Validates that the event target matches the active scroll element
3. Only processes scroll events from the correct scrolling container
4. Works consistently across both layout modes

**ISSUE STATUS: TESTING** - Please test scroll sync in both normal and centered layouts.