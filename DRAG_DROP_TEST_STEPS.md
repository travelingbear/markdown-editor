# Drag-and-Drop Feature Testing Steps

## Overview
The drag-and-drop feature allows users to reorder tabs in the More modal by dragging files that are not in the top 5 positions to move them up in priority.

## Features Implemented
1. **Tab Modal Numbers**: Shows numbers 1-5 for the first 5 files in the dropdown
2. **Drag-and-Drop**: Drag any tab item in the More modal to reorder
3. **Context Menu**: Right-click any tab to get "Move to Top" option
4. **Visual Feedback**: Dragging items show visual feedback

## Testing Steps

### Step 1: Setup Test Environment
1. Open the Markdown Editor application
2. Create or open at least 6-8 markdown files to have tabs beyond the top 5
3. Verify that the filename button shows a dropdown arrow (▲) when you have tabs

### Step 2: Test Tab Dropdown Numbers
1. Click on the filename button to open the tab dropdown
2. **Expected**: You should see numbers 1-5 next to the first 5 tabs in the dropdown
3. **Expected**: The "More..." button should be visible if you have more than 5 tabs

### Step 3: Test More Modal Display
1. Click the "More..." button to open the tab modal
2. **Expected**: The modal opens showing all tabs
3. **Expected**: The first 5 tabs show numbers 1-5 in colored circles
4. **Expected**: Tabs beyond position 5 don't show numbers

### Step 4: Test Drag-and-Drop Functionality
1. In the More modal, try to drag a tab that's NOT in the top 5 (no number)
2. **Expected**: The cursor changes to a move cursor when hovering over draggable items
3. **Expected**: When dragging starts, the item becomes semi-transparent
4. Drag the item over one of the numbered tabs (1-5)
5. **Expected**: You can drop it to reorder
6. **Expected**: After dropping, the tab order updates and the modal refreshes

### Step 5: Test Context Menu "Move to Top"
1. In the More modal, right-click on any tab that's NOT in position #1
2. **Expected**: A context menu appears with "Move to Top" as the first option
3. Click "Move to Top"
4. **Expected**: The tab moves to position #1 in the list
5. **Expected**: The dropdown and modal update to reflect the new order

### Step 6: Test Context Menu Disabled State
1. Right-click on the tab that's already in position #1
2. **Expected**: The "Move to Top" option should be disabled/grayed out

### Step 7: Test Tab Dropdown Updates
1. After reordering tabs in the modal, close the modal
2. Click the filename button to open the dropdown
3. **Expected**: The dropdown shows the updated order with correct numbers 1-5
4. **Expected**: The reordered tab now appears in the top 5 if moved there

### Step 8: Test Persistence
1. Reorder some tabs using drag-and-drop or "Move to Top"
2. Close and restart the application
3. **Expected**: The tab order is preserved after restart
4. **Expected**: The dropdown still shows the correct order

## Visual Indicators to Look For

### Tab Modal Numbers
- Colored circles with white numbers (1-5) for top 5 tabs
- No numbers for tabs beyond position 5

### Drag-and-Drop Visual Feedback
- Move cursor when hovering over draggable items
- Semi-transparent appearance when dragging
- Slight hover effects on tab items

### Context Menu
- "Move to Top" appears at the top of the context menu
- Option is disabled for the tab already at position #1
- Other standard options (Close, Close Others, etc.) still work

## Expected Behavior

### What Should Work
- Dragging tabs from positions 6+ to positions 1-5
- Context menu "Move to Top" for any tab not at position #1
- Visual feedback during drag operations
- Immediate UI updates after reordering
- Persistence of tab order across app restarts

### What Should NOT Happen
- No errors in the browser console
- No visual glitches during drag operations
- No loss of tab content or state during reordering
- No performance issues with many tabs

## Troubleshooting

If drag-and-drop doesn't work:
1. Check browser console for JavaScript errors
2. Verify that the `draggable="true"` attribute is set on tab items
3. Ensure event handlers are properly attached

If context menu doesn't appear:
1. Make sure you're right-clicking on tab items in the modal
2. Check that the context menu element exists in the DOM

If reordering doesn't persist:
1. Verify that `persistTabs()` is called after reordering
2. Check localStorage for the tab data

## Success Criteria
- ✅ Numbers 1-5 appear on first 5 tabs in dropdown and modal
- ✅ Drag-and-drop works to reorder tabs
- ✅ "Move to Top" context menu option works
- ✅ Visual feedback is clear and responsive
- ✅ Tab order persists across app restarts
- ✅ No errors or performance issues