# AI Assistant Development Prompt - Markdown Viewer

## 🎯 Project Overview
**Native Markdown Viewer** - Tauri + Rust + TypeScript/JavaScript desktop application

**Current Phase**: Phase 5 - Final Polish & Enhancement  
**Branch**: `feature/phase-5-final-polish`

## 📋 Status Summary

### ✅ **COMPLETED**: All Core Features Working
- Three-mode interface (Code/Preview/Split) with Monaco Editor
- Real-time markdown rendering with KaTeX math and Mermaid diagrams  
- Interactive task lists with state persistence
- GitHub-style themes with perfect synchronization
- File operations, HTML/PDF export, keyboard shortcuts
- Performance monitoring and error handling
- **Image & GIF Support**: ✅ COMPLETE - All formats working
- **Window Close Handler**: ✅ COMPLETE - Properly prompts for unsaved changes
- **Save Functionality**: ✅ COMPLETE - Working without crashes

### 🔄 **CURRENT ISSUES**: Final Polish Items
- ✅ Welcome screen drag-drop: Works correctly
- ✅ Code mode drag-drop: Inserts filenames (simplified)
- ✅ **Window close**: Working with proper confirmation dialogs

## 🚨 **URGENT TECHNICAL CHALLENGES**

### **Issue 1: Window Close Handler** ✅ **RESOLVED**
- **Problem**: X button closes app without asking about unsaved changes
- **Solution**: Implemented proper Tauri v2 onCloseRequested with confirmation dialogs
- **Status**: COMPLETE - Window close handler working correctly
- **Implementation**: Uses event.preventDefault() and manual close() after user confirmation

### **Issue 2: Drag-Drop File Path Resolution** 🔄 **FUTURE ENHANCEMENT**  
- **Problem**: Drag-dropped files don't retain original file paths for saving
- **Current**: Files opened via drag-drop require "Save As" (browser security limitation)
- **Status**: WORKING - Basic functionality complete, enhancement needed
- **Future Goal**: Implement native Tauri drag-drop to get absolute file paths
- **Implementation**: Currently uses browser events, needs Tauri native events

### **Issue 3: Drag-Drop Configuration** 📋 **DOCUMENTED**
- **Current**: `dragDropEnabled: false` (enables browser events but limits functionality)
- **Trade-off**: Browser events work but can't provide absolute paths for saving
- **Status**: ACCEPTABLE - Documented limitation, future enhancement opportunity
- **Alternative**: Users can use File > Open for full save functionality

## 📁 **Key Files**
- `main.js` - Application logic
- `lib.rs` - Rust backend  
- `tauri.conf.json` - Configuration
- `PROJECT_PLAN.md` - Full specification
- `DEVELOPMENT_LOG.md` - Detailed progress

**📖 For complete details, see PROJECT_PLAN.md and DEVELOPMENT_LOG.md**

## 🎯 **CURRENT STATUS**

### **Phase 5.1**: Native Drag-Drop Absolute Paths ✅ **COMPLETE**
- **Goal**: Implement native Tauri drag-drop with absolute file paths
- **Solution**: `tauri://drag-drop` event with `dragDropEnabled: true`
- **Status**: COMPLETE - Code mode inserts full paths like `C:\Users\...\file.md`
- **Branch**: `feature/native-drag-drop-absolute-paths`
- **Validation**: USER APPROVED - All functionality working correctly

### **Next Phase**: Phase 6 - Distribution & Release
- **Goal**: Cross-platform build system and installation packages
- **Status**: READY TO START - Phase 5.1 complete and validated
- **Requirements**: User approval and commit before starting Phase 6

## 🏗️ **Architecture**
**Frontend**: Monaco Editor + Marked.js + KaTeX + Mermaid + Highlight.js  
**Backend**: Rust/Tauri for native file operations

**📊 Performance**: All targets met (< 2s startup, < 500ms file ops)

## 🚀 **Phase 5 Success Criteria**
- ✅ Images/GIFs working
- ✅ Drag-drop functionality (COMPLETE - basic functionality)
- ✅ Final polish & testing

**🎯 PHASE 5 COMPLETE - Ready for Phase 6 (Distribution)**

## ⚠️ **CRITICAL DEVELOPMENT RULES - STRICTLY ENFORCED**

### **GIT WORKFLOW - MANDATORY**
- ❌ **NEVER work directly on main branch**
- ❌ **NEVER commit without explicit user approval**
- ✅ **ALWAYS create feature branches for each phase/enhancement**
- ✅ **ALWAYS request user validation before any commits**
- ✅ **ONLY update documentation AFTER user approval**
- ✅ **ONLY stage and commit AFTER user approval**

### **PHASE WORKFLOW - MANDATORY**
1. **Create feature branch** for new phase/enhancement
2. **Implement changes** on feature branch
3. **Request user testing** and validation
4. **Wait for user approval** - DO NOT PROCEED WITHOUT IT
5. **Update documentation** only after approval
6. **Stage and commit** only after approval
7. **Merge to main** only after approval

**Current Branch**: `feature/native-drag-drop-absolute-paths`
**Status**: AWAITING USER APPROVAL FOR COMMIT

---

**📖 For complete project details, architecture, and development history, refer to:**
- `PROJECT_PLAN.md` - Full specification and requirements
- `DEVELOPMENT_LOG.md` - Detailed progress and technical decisions
- `CHANGELOG.md` - Version history and feature timeline or mode-specific handling

## 📝 **IMPLEMENTATION NOTES FOR NEXT AGENT**

### **Working Features**
- ✅ Welcome screen drag-drop: Opens .md files correctly
- ✅ Code mode drag-drop: Inserts filenames (simplified)
- ✅ Drag-drop visual feedback: Blue overlay with context messages
- ✅ File opening via drag-drop: No longer marks as dirty (fixed)
- ✅ Browser drag-drop events: Properly registered and working
- ✅ Window close handler: Proper confirmation dialogs working
- ✅ Save functionality: Working without crashes (drag-drop files use Save As)

### **Future Enhancements**
- 🔄 **Native Drag-Drop**: Implement Tauri native drag-drop for absolute file paths
- **Goal**: Allow drag-dropped files to save to original location
- **Current Limitation**: Browser drag-drop can't access full file paths
- **Solution**: Enable `dragDropEnabled: true` and use Tauri file-drop events

### **Configuration Status**
- **Tauri Config**: `dragDropEnabled: false` in `tauri.conf.json`
- **Event Handlers**: Browser drag-drop events working
- **Window Close**: Multiple approaches attempted, none working in Tauri v2

### **Code Locations**
- **Main Logic**: `main.js` - `setupDragAndDrop()` (simplified) and `setupWindowCloseHandler()` (broken)
- **Tauri Config**: `src-tauri/tauri.conf.json` - `dragDropEnabled: false` setting
- **Rust Backend**: `src-tauri/src/lib.rs` - `get_dropped_file_absolute_path` command (unused)
- **Styling**: `styles.css` - Enhanced drag-drop visual feedback

### **Next Steps for New Agent**
1. ✅ **COMPLETE**: Window close handler working correctly
2. ✅ **COMPLETE**: Save functionality working without crashes
3. ✅ **VALIDATED**: User confirmed all fixes working
4. **READY**: Phase 5 complete, ready for Phase 6 (Distribution)
5. **FUTURE**: Consider implementing native Tauri drag-drop for full file paths

### **Phase 6 Preparation**
- All core functionality working
- Window close handler implemented
- Save functionality stable
- Drag-drop working (with documented limitations)
- Ready for distribution and packaging