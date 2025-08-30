# AI Assistant Development Prompt - Markdown Viewer

## 🎯 Project Context

**Native Markdown Viewer** desktop application built with Tauri + Rust + TypeScript/JavaScript.
Complete rewrite of previous Electron project with theme synchronization issues.

## 📋 Current Status

**Phase**: Phase 4 - OS Integration & Polish (95% COMPLETE)
**Branch**: `feature/phase-4-polish-integration`
**Technology Stack**: Tauri + Rust + TypeScript/JavaScript ✅

### ✅ COMPLETED PHASES:
- **Phase 1**: Core foundation with basic file operations ✅
- **Phase 2**: Monaco Editor integration with scroll sync ✅  
- **Phase 3**: Advanced features foundation ✅
- **Phase 3.5**: Math rendering (KaTeX), diagrams (Mermaid), interactive checkboxes ✅
- **Phase 4**: OS integration, performance optimization, error handling ✅

### ✅ ALL MAJOR FEATURES WORKING:
- Three-mode interface (Code, Preview, Split) with Monaco Editor
- Real-time markdown rendering with KaTeX math and Mermaid diagrams
- Interactive task lists with checkbox state persistence
- GitHub-style themes (light/dark) with perfect synchronization
- File operations (open/save/save as/new/close) with native dialogs
- HTML export and PDF printing with mode-specific behavior
- Comprehensive keyboard shortcuts and settings system
- Performance monitoring and error handling with recovery

## 🚨 CURRENT CHALLENGES

### 1. **Drag-and-Drop Not Working** ❌
- **Issue**: Files dragged onto application window don't open
- **Attempted**: Web drag-and-drop events + Tauri native listeners
- **Status**: No console errors, events not triggering
- **Files**: `main.js` (setupDragAndDrop, setupTauriDragDrop methods)

### 2. **File Association Error** ❌  
- **Issue**: Double-clicking .md files shows "Error opening file: undefined"
- **Status**: File associations configured, but startup file detection failing
- **Files**: `lib.rs` (startup file handling), `main.js` (checkStartupFile method)

## 📁 Key Project Files

### Core Application
- `Markdown Viewer/src/main.js` - Main application logic
- `Markdown Viewer/src/index.html` - UI structure  
- `Markdown Viewer/src/styles.css` - Styling and themes
- `Markdown Viewer/src-tauri/src/lib.rs` - Rust backend
- `Markdown Viewer/src-tauri/tauri.conf.json` - Tauri configuration

### Documentation
- `PROJECT_PLAN.md` - Complete project specification
- `DEVELOPMENT_LOG.md` - Detailed development progress
- `CHANGELOG.md` - Version history and features

## 🎯 IMMEDIATE NEXT STEPS

### Priority 1: Fix Drag-and-Drop
- **Debug**: Add more console logging to identify why events aren't firing
- **Alternative**: Try different Tauri drag-and-drop approaches
- **Test**: Verify both web and Tauri event listeners are working

### Priority 2: Fix File Association
- **Debug**: Improve startup file detection and error handling
- **Test**: Build application and test file associations after installation
- **Validate**: Ensure file paths are correctly passed from OS to application

### Priority 3: Context menu integration

### Priority 4: Complete Phase 4
- **Validate**: Test all remaining Phase 4 features
- **Document**: Update development log with final status
- **Prepare**: Ready for Phase 5 (Distribution & Release)

## 🔧 Technical Architecture

### Frontend (TypeScript/JavaScript)
- **Monaco Editor**: Professional code editing with markdown syntax highlighting
- **Marked.js**: Markdown parsing with custom renderers
- **KaTeX**: Mathematical expression rendering
- **Mermaid.js**: Diagram rendering (flowcharts, sequence diagrams)
- **Highlight.js**: Code syntax highlighting in preview

### Backend (Rust/Tauri)
- **File Operations**: Native file dialogs and I/O
- **Command Line**: Startup file detection for file associations
- **Performance**: Benchmarking and optimization
- **Error Handling**: Comprehensive error recovery

### Key Features Working
- ✅ Real-time preview with advanced rendering
- ✅ Perfect theme synchronization
- ✅ Interactive task lists with markdown sync
- ✅ Export functionality (HTML + PDF printing)
- ✅ Performance monitoring and optimization
- ✅ Comprehensive keyboard shortcuts
- ✅ Settings persistence and management

## 📊 Performance Targets (All Met)
- Application launch: < 2 seconds ✅
- File opening: < 500ms ✅
- Mode switching: < 100ms ✅
- Preview updates: < 300ms (debounced) ✅

## 🚀 Success Definition

**Phase 4 Complete When**:
- ❌ File associations work (double-click .md files opens app)
- ❌ Context menu integration ("Open with Markdown Viewer")
- ❌ Drag-and-drop functionality works
- ✅ All keyboard shortcuts functional
- ✅ Performance optimization complete
- ✅ Error handling comprehensive

**Ready for Phase 5**: Distribution & Release with cross-platform builds

## 💡 Development Rules

### Git Workflow
- ⚠️ **Never work directly on main branch**
- ⚠️ **Never commit without user approval** 
- ⚠️ **Always use feature branches**
- ⚠️ **User validation required before phase completion**

### Current Branch Status
- **Branch**: `feature/phase-4-polish-integration`
- **Last Commit**: 06ff6c2 (Fix Tauri config)
- **Status**: Ready for drag-and-drop and file association fixes

## 🎨 UI/UX (Complete)

Professional three-pane interface with:
- Toolbar with file operations and mode switching
- Monaco Editor with markdown syntax highlighting  
- Live preview with math, diagrams, and interactive elements
- Status bar with cursor position and file info
- Welcome page for new users
- Settings dialog with performance reporting

**Themes**: GitHub-style light/dark with perfect synchronization across all elements.

---

**FOCUS**: Fix drag-and-drop and file association issues to complete Phase 4, then proceed to Phase 5 (Distribution & Release).