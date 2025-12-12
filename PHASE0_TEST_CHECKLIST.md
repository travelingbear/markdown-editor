# Phase 0: Splash Screen Fix - Test Checklist

**Date:** December 12, 2024  
**Branch:** phase0-splash-screen-fix  
**Tester:** [Your Name]

---

## Changes Made

1. Splash screen now stays visible until document is loaded in correct mode
2. Added "Loading document..." message when opening files
3. Splash hides after mode is set (no visible mode switching)
4. Splash hides immediately if no document to load (welcome page)

---

## Test Scenarios

### Scenario 1: First Launch (No Previous Tabs)
- [ ] Launch app for first time
- [ ] Splash shows with progress bar
- [ ] Splash hides when welcome page is ready
- [ ] No mode switching visible
- [ ] Welcome page appears immediately after splash

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 2: Reopen Last Tabs - Code Mode Default
- [ ] Set default mode to Code in settings
- [ ] Open a document
- [ ] Close app
- [ ] Reopen app
- [ ] Splash shows "Loading document..."
- [ ] Document opens directly in Code mode
- [ ] No visible switch from Preview to Code
- [ ] Splash hides after document is ready

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 3: Reopen Last Tabs - Preview Mode Default
- [ ] Set default mode to Preview in settings
- [ ] Open a document
- [ ] Close app
- [ ] Reopen app
- [ ] Splash shows "Loading document..."
- [ ] Document opens directly in Preview mode
- [ ] No mode switching visible
- [ ] Splash hides after document is ready

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 4: Reopen Last Tabs - Split Mode Default
- [ ] Set default mode to Split in settings
- [ ] Open a document
- [ ] Close app
- [ ] Reopen app
- [ ] Splash shows "Loading document..."
- [ ] Document opens directly in Split mode
- [ ] Both editor and preview visible immediately
- [ ] No mode switching visible
- [ ] Splash hides after document is ready

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 5: File Association (Double-click .md file)
- [ ] Close app completely
- [ ] Double-click a .md file in file explorer
- [ ] Splash shows "Loading document..."
- [ ] Document opens in default mode
- [ ] No mode switching visible
- [ ] Splash hides after document is ready

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 6: Drag & Drop File
- [ ] Launch app (welcome page)
- [ ] Drag a .md file onto window
- [ ] Document opens in default mode
- [ ] No mode switching visible
- [ ] Splash already hidden (welcome page scenario)

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 7: Multiple Tabs Reopened
- [ ] Open 3 documents in different tabs
- [ ] Close app
- [ ] Reopen app
- [ ] Splash shows "Loading document..."
- [ ] All tabs restore
- [ ] Active tab shows in default mode
- [ ] No mode switching visible
- [ ] Splash hides after all tabs ready

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 8: Reopen Last Tabs Disabled
- [ ] Disable "Reopen Last Tabs" in settings
- [ ] Open a document
- [ ] Close app
- [ ] Reopen app
- [ ] Splash shows briefly
- [ ] Welcome page appears
- [ ] No document loaded
- [ ] Splash hides immediately

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

### Scenario 9: Splash Disabled in Settings
- [ ] Disable splash screen in settings
- [ ] Close app
- [ ] Reopen app
- [ ] No splash shows
- [ ] App loads directly to welcome or document
- [ ] Everything works normally

**Result:** ☐ Pass ☐ Fail  
**Notes:**

---

## Performance Validation

### Timing Measurements

**Before Changes:**
- Startup time: _____ ms
- Visible mode switch: Yes/No
- User experience: _____

**After Changes:**
- Startup time: _____ ms
- Visible mode switch: Yes/No
- User experience: _____

**Improvement:** ☐ Better ☐ Same ☐ Worse

---

## User Experience Validation

### Questions for User:

1. **Does the app feel smoother on startup?**
   - ☐ Yes ☐ No ☐ No difference
   - Comments:

2. **Do you see any mode switching when opening documents?**
   - ☐ Yes (FAIL) ☐ No (PASS)
   - Comments:

3. **Is the splash screen duration appropriate?**
   - ☐ Too short ☐ Just right ☐ Too long
   - Comments:

4. **Does the "Loading document..." message make sense?**
   - ☐ Yes ☐ No ☐ Needs improvement
   - Comments:

5. **Any visual glitches or issues?**
   - ☐ Yes (describe below) ☐ No
   - Comments:

---

## Issues Found

### Issue 1:
**Description:**  
**Severity:** ☐ Critical ☐ High ☐ Medium ☐ Low  
**Steps to Reproduce:**  
**Expected:**  
**Actual:**  

### Issue 2:
**Description:**  
**Severity:** ☐ Critical ☐ High ☐ Medium ☐ Low  
**Steps to Reproduce:**  
**Expected:**  
**Actual:**  

---

## Final Approval

- [ ] All test scenarios pass
- [ ] No critical or high severity issues
- [ ] User confirms improvement
- [ ] Performance is same or better
- [ ] Ready to merge to main

**Tester Signature:** _______________  
**Date:** _______________

**User Approval:** _______________  
**Date:** _______________

---

## Next Steps

If approved:
- [ ] Merge to main branch
- [ ] Update CHANGELOG.md
- [ ] Update version to 3.3.2
- [ ] Proceed to Phase 1

If issues found:
- [ ] Document issues above
- [ ] Fix issues
- [ ] Re-test
- [ ] Get approval again
