# AI Assistant Development Prompt - Markdown Viewer v2.0

## 🎯 Project Overview
**Native Markdown Viewer v2.0** - Tauri + Rust + TypeScript/JavaScript desktop application

**Current Status**: v1.0.0 COMPLETE + Phase 7 Priorities 1-5 COMPLETED  
**Current Branch**: `main`  
**Next Phase**: Phase 8 - Branding & Legal

## 📋 Current Status Summary

### ✅ **v1.0.0 COMPLETED**: All Core Features Working
- Three-mode interface (Code/Preview/Split) with Monaco Editor
- Real-time markdown rendering with KaTeX math and Mermaid diagrams  
- Interactive task lists with state persistence
- GitHub-style themes with perfect synchronization
- File operations, HTML/PDF export, keyboard shortcuts
- Performance monitoring and error handling
- Image & GIF support for all formats
- Window close handler with unsaved changes confirmation
- Native drag-drop with absolute file paths
- Cross-platform distribution system (MSI, NSIS, DMG, AppImage, DEB)

### ✅ **Phase 7 Priority 1 COMPLETED**: Distraction-Free Mode
- F11 toggle for distraction-free mode activation/deactivation
- ESC key exit functionality
- Complete UI hiding (toolbar and status bar)
- Mouse hover hint at top of screen for exit instructions
- Mode-specific layouts for all three modes (Preview/Code/Split)
- Responsive design with adaptive padding for different screen sizes
- Theme support (light and dark)
- Smooth transitions and animations
- **Commit**: `082babc` on `feature/phase-7-distraction-free-mode` → merged to `main`

### 🚀 **v2.0 ENHANCEMENT GOALS**
Based on **FUTURE_IMPROVEMENTS_PLAN.md**, implement the following improvements:

**Phase 7 - UI/UX Enhancements (4-6 weeks)**: 🔄 IN PROGRESS
1. **Distraction-Free Mode** ✅ COMPLETED
2. **Centered A4 Layout with Configurable Margins** ✅ COMPLETED
3. **Enhanced Settings Window** ✅ COMPLETED
4. **File History on Home Screen** ✅ COMPLETED
5. **Markdown Formatting Toolbar** ✅ COMPLETED
6. **Export Dropdown Button** 🎯 NEXT
7. **Save Dropdown Button** 🎯 PENDING
8. **Distraction-Free Mode Button** 🎯 PENDING

**Phase 8 - Keyboard Shortcuts (1-2 weeks)**:
1. **Application Shortcuts** (Priority: HIGH) - Ctrl+Shift+T for toolbar toggle
2. **Editor Shortcuts** (Priority: HIGH) - Ctrl+B/I for bold/italic, Ctrl+Shift+1-3 for headers
3. **Cross-Platform Support** (Priority: HIGH) - Cmd on macOS, Ctrl on Windows/Linux

**Phase 9 - Branding & Legal (2-3 weeks)**:
1. **Custom Icon & Favicon** (Priority: LOW)
2. **MIT License Implementation** (Priority: HIGH)
3. **User-Only MSI Installer** (Priority: MEDIUM)

## 🎯 **CURRENT PHASE: Phase 7 - UI/UX Enhancements (Priorities 6-8)**

### **Priority 1: Distraction-Free Mode** ✅ COMPLETED
- **Goal**: Clean, minimal interface hiding all UI elements except content
- **Features**: F11 toggle, hidden toolbar/status bar, ESC to exit, mouse hover hints
- **Status**: ✅ COMPLETED & MERGED TO MAIN (Commit: `082babc`)
- **Branch**: `feature/phase-7-distraction-free-mode` (merged)
- **Testing**: All requirements validated and approved by user
- **Implementation**: 
  - JavaScript: Added distraction-free state management and keyboard shortcuts
  - CSS: Added complete responsive styling for all modes
  - No regressions in existing functionality

### **Priority 2: Centered A4 Layout** ✅ COMPLETED
- **Goal**: Center content within A4 page width with configurable margins
- **Features**: A4/Letter/Legal page sizes, adjustable margins, print consistency
- **Status**: ✅ COMPLETED & MERGED TO MAIN (Commit: `05430bd`)
- **Branch**: `feature/phase-7-centered-layout` (merged)
- **Testing**: All requirements validated and approved by user
- **Implementation**: 
  - CSS: Added centered layout with configurable page sizes and margins
  - JavaScript: Added toggle functionality, settings persistence, and configuration options
  - Print consistency and responsive design included
  - No regressions in existing functionality

### **Priority 3: Home Screen showing a history the last three opened markdown files** ✅ COMPLETED
- **Goal**: Shows only on the Home Screen
- **Features**: Has a button to clear history and shows the last three last used markdown files
- **Status**: ✅ COMPLETED & MERGED TO MAIN (Commit: `308f5e8`)
- **Branch**: `feature/phase-7-files-history` (merged)
- **Testing**: All requirements validated and approved by user
- **Implementation**: 
  - HTML: Added file history section with responsive layout
  - CSS: Added compact styling with responsive design and overflow prevention
  - JavaScript: Added file history management, localStorage persistence, and click handlers
  - Added Ctrl+T theme toggle shortcut and updated keyboard shortcuts display
  - No regressions in existing functionality

### **Priority 4: Enhanced Settings Window** ✅ COMPLETED
- **Goal**: Replace text-based settings with modern clickable interface
- **Features**: Visual controls, live preview, organized sections, performance stats
- **Status**: ✅ COMPLETED & MERGED TO MAIN (Commit: `3e07cf3`)
- **Branch**: `feature/phase-7-enhanced-settings` (merged)
- **Testing**: All requirements validated and approved by user
- **Implementation**: 
  - HTML: Added modal interface with organized sections
  - CSS: Added modern styling with responsive design and animations
  - JavaScript: Added visual controls, live updates, and settings persistence
  - Performance stats and system info display
  - No regressions in existing functionality

### **Priority 5: Markdown Toolbar** ✅ COMPLETED
- **Goal**: Add markdown formatting toolbar for code mode
- **Features**: H1-H3, Bold, Italic, Underline, Strikethrough, Image, Link, Table, HR, Lists, Checkboxes
- **Visibility**: Only in code mode (not distraction-free), toggle via settings
- **Status**: ✅ COMPLETED & MERGED TO MAIN
- **Branch**: `feature/phase-7-markdown-toolbar` (merged)
- **Testing**: All requirements validated and approved by user
- **Implementation**: 
  - HTML: Added toolbar with all formatting buttons including underline
  - CSS: Added settings-based visibility toggle
  - JavaScript: Added formatting actions, selection handling, settings integration, auto-list continuation
  - All buttons work with text selection (drag, double-click, keyboard selection)
  - Settings panel integration for enable/disable
  - Robust event handling with conflict resolution
  - No regressions in existing functionality

### **Priority 6: Export Dropdown Button** 🎯 NEXT
- **Goal**: Consolidate HTML and PDF export into single dropdown button
- **Features**: Single "Export" button with dropdown arrow, HTML/PDF options
- **Behavior**: Click arrow to expand/collapse options, click main button for default action
- **Status**: 🎯 READY TO START
- **Branch**: `feature/phase-7-export-dropdown` (to be created)
- **Implementation Plan**: 
  - HTML: Replace separate buttons with dropdown structure
  - CSS: Add dropdown styling with arrow animation
  - JavaScript: Add dropdown toggle logic and option selection

### **Priority 7: Save Dropdown Button** 🎯 PENDING
- **Goal**: Consolidate Save and Save As into single dropdown button
- **Features**: Single "Save" button with dropdown arrow, "Save As" option
- **Behavior**: Click main button for Save, click arrow for Save As option
- **Status**: 🎯 PENDING (after Priority 6)
- **Branch**: `feature/phase-7-save-dropdown` (to be created)
- **Implementation Plan**: 
  - HTML: Replace separate buttons with dropdown structure
  - CSS: Reuse dropdown styling from Export button
  - JavaScript: Add dropdown logic for save operations

### **Priority 8: Distraction-Free Mode Button** 🎯 PENDING
- **Goal**: Add dedicated button for distraction-free mode toggle
- **Features**: Icon button next to theme button, same size/style, Unicode icon (☐/☯/👓)
- **Behavior**: Single click to toggle distraction-free mode (alternative to F11)
- **Status**: 🎯 PENDING (after Priority 7)
- **Branch**: `feature/phase-7-distraction-button` (to be created)
- **Implementation Plan**: 
  - HTML: Add button next to theme toggle
  - CSS: Match theme button styling and positioning
  - JavaScript: Connect to existing distraction-free toggle logic

## 🎯 **NEXT PHASE: Phase 8 - Keyboard Shortcuts**

### **Priority 1: Application Shortcuts** 🎯 READY AFTER PHASE 7
- **Goal**: Add application-level keyboard shortcuts
- **Features**: Ctrl+Shift+T to toggle markdown toolbar visibility
- **Cross-Platform**: Cmd+Shift+T on macOS, Ctrl+Shift+T on Windows/Linux
- **Status**: 🎯 READY (after Phase 7 completion)
- **Branch**: `feature/phase-8-app-shortcuts` (to be created)
- **Implementation Plan**: 
  - JavaScript: Add keyboard event listeners for application shortcuts
  - Cross-platform key detection using Tauri's platform detection
  - Integration with existing settings system

### **Priority 2: Editor Shortcuts** 🎯 READY AFTER PHASE 7
- **Goal**: Add Monaco Editor keyboard shortcuts for markdown formatting
- **Features**: 
  - Ctrl+B for bold, Ctrl+I for italic
  - Ctrl+Shift+1 for H1, Ctrl+Shift+2 for H2, Ctrl+Shift+3 for H3
  - Additional shortcuts for other formatting options
- **Cross-Platform**: Cmd+B/I and Cmd+Shift+1-3 on macOS
- **Status**: 🎯 READY (after Phase 7 completion)
- **Branch**: `feature/phase-8-editor-shortcuts` (to be created)
- **Implementation Plan**: 
  - Monaco Editor: Register custom keybindings
  - JavaScript: Connect shortcuts to existing formatting functions
  - Platform detection for Cmd vs Ctrl key mapping

### **Priority 3: Cross-Platform Support** 🎯 READY AFTER PHASE 7
- **Goal**: Ensure all shortcuts work correctly across operating systems
- **Features**: Automatic Cmd/Ctrl key mapping, consistent behavior
- **Platforms**: Windows (Ctrl), macOS (Cmd), Linux (Ctrl)
- **Status**: 🎯 READY (after Phase 7 completion)
- **Branch**: Integrated with Priorities 1 & 2
- **Implementation Plan**: 
  - Tauri: Use platform detection API
  - JavaScript: Dynamic key mapping based on OS
  - Testing on all supported platforms

## 📁 **Key Files**
- `main.js` - Application logic
- `lib.rs` - Rust backend  
- `tauri.conf.json` - Configuration
- `PROJECT_PLAN.md` - Original specification
- `FUTURE_IMPROVEMENTS_PLAN.md` - v2.0 enhancement roadmap
- `LESSONS_LEARNED.md` - Technical knowledge base

## ⚠️ **CRITICAL DEVELOPMENT RULES - STRICTLY ENFORCED**

### **GIT WORKFLOW - MANDATORY**
- ❌ **NEVER work directly on main branch**
- ❌ **NEVER commit without explicit user approval**
- ✅ **ALWAYS create feature branches for each improvement**
- ✅ **ALWAYS request user validation before any commits**
- ✅ **ONLY update documentation AFTER user approval**
- ✅ **ONLY stage and commit AFTER user approval**

### **PHASE WORKFLOW - MANDATORY**
1. **Create feature branch** for specific improvement (e.g., `feature/phase-7-distraction-free-mode`)
2. **Implement single improvement** completely on feature branch
3. **Request user testing** and validation of the specific improvement
4. **Wait for user approval** - DO NOT PROCEED WITHOUT IT
5. **Update documentation** only after approval
6. **Stage and commit** only after approval
7. **Merge to main** only after approval
8. **Start next improvement** on new feature branch

### **IMPROVEMENT-SPECIFIC WORKFLOW**
- **One improvement per branch** - No mixing of features
- **Complete implementation** before requesting validation
- **Comprehensive testing** of the specific improvement
- **User validation required** for each improvement individually
- **Documentation updates** for each completed improvement

## 🧪 **Testing Requirements for Each Improvement**

### **Distraction-Free Mode Testing** ✅ COMPLETED
- [x] F11 toggles distraction-free mode correctly
- [x] All UI elements hidden except content area
- [x] ESC key exits distraction-free mode
- [x] Mouse movement shows exit options
- [x] No regressions in existing functionality
- [x] Performance remains acceptable
- [x] All three modes work correctly in distraction-free mode
- [x] Responsive behavior across screen sizes

### **Centered A4 Layout for Preview and Code mode and Distraction-Free mode Testing** ✅ COMPLETED
- [x] Content centers correctly in all window sizes
- [x] A4 page width constraint works (210mm/8.27")
- [x] Configurable margins function properly
- [x] Multiple page sizes available (A4, Letter, Legal)
- [x] Print output matches screen layout
- [x] Settings persist across sessions
- [x] No impact on existing themes

### **Home Screen showing a history the last three opened markdown files** ✅ COMPLETED
- [x] Shows only on the Home Screen
- [x] Has a button to clear history
- [x] No regressions in existing functionality
- [x] Performance remains acceptable
- [x] Responsive design and overflow prevention

### **Enhanced Settings Window** ✅ COMPLETED
- [x] Modal interface with organized sections
- [x] Visual controls for all settings
- [x] Live preview and updates
- [x] Performance stats display
- [x] System info display
- [x] No regressions in existing functionality

### **Markdown Toolbar** ✅ COMPLETED
- [x] All formatting buttons working (H1-H3, Bold, Italic, Underline, Strikethrough, etc.)
- [x] Reliable text selection handling (drag, double-click, keyboard)
- [x] Settings integration for enable/disable
- [x] Only visible in code mode (not distraction-free)
- [x] Auto-list continuation functionality
- [x] No conflicts with existing shortcuts
- [x] No regressions in existing functionality

### **Export Dropdown Button Testing** 🎯 NEXT
- [ ] Single Export button with dropdown arrow
- [ ] Dropdown expands/collapses on arrow click
- [ ] HTML and PDF options clearly visible
- [ ] Main button performs default export action
- [ ] Dropdown closes when option selected
- [ ] No regressions in existing export functionality
- [ ] Consistent styling with application theme

### **Save Dropdown Button Testing** 🎯 PENDING
- [ ] Single Save button with dropdown arrow
- [ ] Main button performs Save operation
- [ ] Dropdown shows "Save As" option
- [ ] Save As functionality preserved
- [ ] Keyboard shortcuts still work (Ctrl+S, Ctrl+Shift+S)
- [ ] No regressions in existing save functionality
- [ ] Consistent styling with Export dropdown

### **Distraction-Free Mode Button Testing** 🎯 PENDING
- [ ] Button appears next to theme toggle
- [ ] Same size and styling as theme button
- [ ] Unicode icon clearly visible and appropriate
- [ ] Single click toggles distraction-free mode
- [ ] Button state reflects current mode
- [ ] F11 shortcut still works
- [ ] No regressions in existing functionality
- [ ] Button hidden in distraction-free mode itself

## 🧪 **Phase 8 Testing Requirements**

### **Application Shortcuts Testing** 🎯 READY AFTER PHASE 7
- [ ] Ctrl+Shift+T toggles markdown toolbar (Windows/Linux)
- [ ] Cmd+Shift+T toggles markdown toolbar (macOS)
- [ ] Shortcut works in all application modes
- [ ] No conflicts with existing shortcuts
- [ ] Settings integration works correctly
- [ ] Cross-platform behavior consistent

### **Editor Shortcuts Testing** 🎯 READY AFTER PHASE 7
- [ ] Ctrl+B applies bold formatting (Windows/Linux)
- [ ] Ctrl+I applies italic formatting (Windows/Linux)
- [ ] Cmd+B/I work correctly on macOS
- [ ] Ctrl+Shift+1-3 apply header formatting (Windows/Linux)
- [ ] Cmd+Shift+1-3 work correctly on macOS
- [ ] Shortcuts work with text selection
- [ ] Monaco Editor integration seamless
- [ ] No conflicts with Monaco's built-in shortcuts

### **Cross-Platform Support Testing** 🎯 READY AFTER PHASE 7
- [ ] All shortcuts work on Windows
- [ ] All shortcuts work on macOS with Cmd key
- [ ] All shortcuts work on Linux
- [ ] Platform detection accurate
- [ ] Key mapping consistent across platforms
- [ ] No platform-specific regressionssive design on different screen sizes

### **Enhanced Settings Testing** ✅ COMPLETED
- [x] All visual controls function correctly
- [x] A window with selectable settings
- [x] Live preview updates immediately
- [x] Current settings
- [x] Selectable Default modes (Preview, Code, Split) settings
- [x] Selectable Default Themes (Light, Dark) settings
- [x] Selectable Text suggestions settings
- [x] System Info
- [x] Performance status and benchmarks
- [x] All existing settings preserved
- [x] Responsive design on different screen sizes

### **Markdown Toolbar Testing**
- [x] Toolbar appears only in code mode (not preview/split)
- [x] Toolbar hidden in distraction-free mode
- [x] Settings toggle for toolbar enable/disable works
- [x] All formatting buttons work with drag-selected text
- [x] Auto-list continuation works (bullets, numbers, tasks)
- [x] Toolbar integrates with Monaco Editor
- [x] No regressions in existing functionality
- [x] Performance remains acceptable
- [x] Responsive design on different screen sizes
- [ ] **ISSUE**: Double-click word selection not detected by formatting buttons
- [ ] **FUTURE**: Keyboard shortcuts for markdown formatting

## 📊 **Success Criteria for Phase 7**

### **Functionality**
- 🔄 4/5 improvements implemented and working (Distraction-free mode ✅, Centered layout ✅, File history ✅, Enhanced settings ✅)
- ✅ No regressions in existing v1.0.0 functionality
- ✅ User interface remains intuitive and responsive
- ✅ Settings persistence works correctly

### **Performance**
- ✅ Startup time remains < 2 seconds
- ✅ Mode switching remains < 100ms
- ✅ Memory usage stays < 200MB
- ✅ No performance degradation with new features

### **User Experience**
- ✅ Distraction-free mode enhances focus (COMPLETED)
- ✅ Centered layout improves document presentation (COMPLETED)
- ✅ File history enhances workflow (COMPLETED)
- ✅ Enhanced settings are more accessible (COMPLETED)
- 🎯 Markdown toolbar improves editing efficiency (NEXT)
- 🔄 All improvements feel integrated and polished (IN PROGRESS)

## 🚦 **VALIDATION CHECKPOINTS**

### **After Each Improvement**
**User must validate:**
- ✅ Improvement works as specified
- ✅ No existing functionality broken
- ✅ Performance remains acceptable
- ✅ User interface changes are intuitive
- ✅ Ready to commit and merge

**AI Assistant must:**
- ✅ Request explicit user approval
- ✅ Wait for confirmation before committing
- ✅ Update documentation after approval
- ✅ Merge to main only after approval
- ✅ Create new branch for next improvement

### **After Phase 7 Completion**
**User must validate:**
- ✅ All Phase 7 improvements working together
- ✅ Complete application stability
- ✅ Ready to proceed to Phase 8
- ✅ Version increment to v1.1.0 or v2.0.0

## 📝 **IMPLEMENTATION NOTES**

### **Current v1.0.0 Status**
- ✅ All core functionality working perfectly
- ✅ Cross-platform distribution system ready
- ✅ Performance targets met
- ✅ No critical issues or regressions
- ✅ Ready for enhancement development

### **Development Approach**
- **Incremental Enhancement**: Add features without breaking existing functionality
- **User-Centric**: Each improvement must provide clear user value
- **Performance Conscious**: Monitor impact of new features
- **Backward Compatible**: Ensure all improvements are optional

### **Technical Considerations**
- **Settings Migration**: Handle existing user preferences
- **CSS Architecture**: Maintain existing theme system
- **JavaScript Modularity**: Keep code organized and maintainable
- **Tauri Integration**: Leverage native capabilities where beneficial

## 🎯 **IMMEDIATE NEXT STEPS**

1. **✅ COMPLETED**: Distraction-free mode implemented and merged
2. **✅ COMPLETED**: Centered A4 layout implemented and merged
3. **✅ COMPLETED**: File history implemented and merged
4. **✅ COMPLETED**: Enhanced settings window implemented and merged
5. **Create feature branch**: `feature/phase-7-markdown-toolbar`
6. **Implement markdown toolbar**: Collapsible formatting toolbar for code mode
7. **Test thoroughly**: All markdown toolbar requirements
8. **Request user validation**: Complete testing and approval
9. **Commit and merge**: Only after user approval
10. **Complete Phase 7**: All UI/UX enhancements finished

## 🚫 **KNOWN ISSUES & TROUBLESHOOTING**

### **Markdown Toolbar Double-Click Selection Issue**
- **Problem**: Formatting buttons don't work with double-click word selection in Monaco Editor
- **Workaround**: Use drag selection instead of double-click
- **Root Cause**: Monaco Editor's `getSelection()` and `getSelections()` don't reliably detect double-click selections
- **Attempted Fixes**: 
  - Tried `getSelections()` array method
  - Added `selection.isEmpty()` checks
  - Enhanced selection validation
- **Next Steps**: May need to listen to Monaco's selection change events or use different selection API
- **Impact**: Minor UX issue, drag selection works perfectly

## 📚 **Reference Documents**
- **FUTURE_IMPROVEMENTS_PLAN.md** - Complete v2.0 roadmap and specifications
- **LESSONS_LEARNED.md** - Technical knowledge and best practices
- **PROJECT_PLAN.md** - Original project architecture and patterns
- **DEVELOPMENT_LOG.md** - Complete development history and solutions

---

**🎯 PHASE 7 IN PROGRESS: UI/UX ENHANCEMENTS**

**✅ Priority 1 COMPLETED**: Distraction-free mode implemented and merged  
**🎯 Current Focus**: Priority 2 - Centered A4 Layout implementation  
**Branch Strategy**: One improvement per feature branch with user validation  
**Success Metric**: Enhanced user experience without compromising existing functionality

**Phase 7 Progress**: 4/5 improvements completed (80%)