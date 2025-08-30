# AI Assistant Development Prompt

## 🎯 Project Context

You are helping develop a **Native Markdown Viewer** desktop application. This is a complete rewrite of a previous Electron project that had theme synchronization issues.

## 📋 Current Project Status

**Phase**: Phase 3.5 COMPLETE ✅ - Ready for Phase 4
**Next Action**: Begin Phase 4 - Polish & OS Integration
**Technology Stack**: Tauri + Rust + TypeScript/JavaScript (SELECTED)
**Git Status**: Phase 3.5 complete, ready for user validation and commit

**✅ PHASE 3.5 ACHIEVEMENTS**:
1. **Math Expression Rendering**: KaTeX renders actual equations correctly
2. **Mermaid Diagram Rendering**: Visual diagrams render correctly
3. **Interactive Task Lists**: ALL checkboxes (standalone AND dash-prefixed) work perfectly
4. **HTML Export**: Working correctly with proper formatting
5. **Application Name**: Fixed to show "Markdown Viewer"
6. **Code Syntax Highlighting**: Working with highlight.js
7. **Theme Synchronization**: All rendered content respects theme changes

**📋 MOVED TO PHASE 4**:
- **PDF Export**: Complex library loading issues - scheduled for Phase 4 resolution

## 🔍 Key Files to Reference

### Primary Planning Documents
- `PROJECT_PLAN.md` - Complete project specification, features, and phases
- `DEBUGGING_REPORT.md` - Lessons learned from previous Electron attempt
- `PROJECT_STATUS.md` - Historical context of what was previously built

### Development Files (CREATED ✅)
- `DEVELOPMENT_LOG.md` - Phase 1 & 2 progress documented
- `CHANGELOG.md` - Version history with Phase 2 completion
- `Markdown Viewer/README.md` - Project setup instructions
- `Markdown Viewer/` - Complete Tauri application structure

## 🎉 Phase 3.5 COMPLETE - What's Next

### Immediate Next Steps
1. **🎯 READY FOR PHASE 4**: Polish & OS Integration
   - File association registration
   - Context menu integration
   - Keyboard shortcuts implementation
   - PDF Export functionality (moved from Phase 3.5)
   - Performance optimization
   - Error handling and user feedback

2. **Current branch**: `feature/phase-3-advanced-features` (ready for validation)

3. **Phase 3.5 Status**: ✅ COMPLETE - All deliverables working correctly

### Development Process Rules

#### ⚠️ CRITICAL: User Validation & Git Requirements
- **DO NOT proceed to next phase without BOTH conditions met:**
  1. **User Testing & Approval**: User must test and explicitly approve all deliverables
  2. **Git Commit**: All changes must be staged and committed to repository
- Each phase has specific validation checkpoints
- Wait for "✅ TESTED, APPROVED & COMMITTED - PROCEED TO NEXT PHASE" confirmation

#### 📝 Documentation Requirements
- Update `DEVELOPMENT_LOG.md` with daily progress
- Maintain `README.md` with current setup instructions
- Update `CHANGELOG.md` with each significant change
- Document all technical decisions and rationale

#### 🌿 Git Branching Strategy
- **Main branch**: Stable, tested, approved code only
- **Feature branches**: All new features/enhancements must use separate branches
- **Branch naming**: `feature/phase-X-description` or `enhancement/feature-name`
- **Merge process**: Only merge to main after user testing and approval
- **Disruptive changes**: Always use new branch, never work directly on main

#### 🧪 Testing Requirements
- Write unit tests for each component
- Create integration tests for user workflows
- Perform cross-platform testing
- Validate performance requirements

## ✅ Phase 3 Foundation Deliverables (COMPLETED)

### Core Features Implemented
- ✅ **Math Expression Detection**: `$...$` and `$$...$$` syntax detected and processed
- ❌ **Math Rendering**: Shows LaTeX code instead of rendered equations
- ✅ **Mermaid Diagram Detection**: Code blocks detected and converted to placeholders
- ❌ **Diagram Rendering**: Shows placeholder boxes instead of visual diagrams
- ✅ **Interactive Task Lists**: Clickable checkboxes with state persistence
- ✅ **Export Functionality**: HTML and PDF export buttons available
- ✅ **Enhanced Styling**: Professional placeholder styling
- ✅ **No Library Conflicts**: Stable application without AMD errors
- ✅ **Phase 2 Preservation**: All previous functionality maintained

### ✅ Issues RESOLVED
- ✅ **AMD/RequireJS Conflicts**: RESOLVED using ES module dynamic imports
- ✅ **Math Rendering**: KaTeX now renders actual equations
- ✅ **Diagram Rendering**: Mermaid.js now renders visual diagrams
- ✅ **Standalone Checkboxes**: Working and clickable
- ✅ **Theme Synchronization**: All rendered content respects theme changes

### ✅ Issues RESOLVED (Phase 3.5)
- ✅ **Dash-prefixed Checkboxes**: FIXED - All checkboxes now clickable with proper markdown sync
- ✅ **Application Name**: FIXED - Shows "Markdown Viewer" correctly
- ✅ **Checkbox Styling**: FIXED - Completed tasks show subtle fade instead of strikethrough
- ✅ **Checkbox State Sync**: FIXED - Preview and markdown source stay synchronized

## ✅ Phase 2 Deliverables (COMPLETED)

### Core Features Implemented
- ✅ **Monaco Editor Integration**: Professional code editor with markdown syntax highlighting
- ✅ **Native File Operations**: Enhanced file dialogs (open/save/save as) with proper error handling
- ✅ **Bidirectional Scroll Synchronization**: Perfect scroll sync across all three modes
- ✅ **Visual Save Button Feedback**: Red button for unsaved changes, normal when saved
- ✅ **Enhanced Close Dialog**: Native Tauri confirm dialog for unsaved changes
- ✅ **Monaco Suggestions Toggle**: Ctrl+Shift+I to enable/disable autocomplete
- ✅ **Enhanced Markdown Rendering**: Proper lists, tables, blockquotes styling
- ✅ **Cross-Mode Scroll Persistence**: Maintains scroll positions when switching modes
- ✅ **Performance Optimizations**: All targets met, no regressions from Phase 1

## ✅ Phase 3.5 Deliverables (COMPLETE)

### ✅ ALL CRITICAL ISSUES RESOLVED
- **✅ RESOLVED: Math Rendering**: KaTeX renders actual equations correctly
- **✅ RESOLVED: Diagram Rendering**: Mermaid.js renders visual diagrams correctly
- **✅ RESOLVED: Dash-prefixed Checkboxes**: All checkboxes clickable with proper markdown sync
- **✅ RESOLVED: Application Name**: Shows "Markdown Viewer" correctly
- **✅ RESOLVED: Checkbox Styling**: Subtle fade effect for completed tasks
- **✅ RESOLVED: Library Loading**: ES module dynamic imports working perfectly
- **✅ RESOLVED: Theme Synchronization**: All rendered content respects theme changes

### Technical Solutions Implemented
- **✅ AMD Conflict Resolution**: ES module dynamic imports prevent conflicts
- **✅ HTML Structure Fix**: Converted `<li>` checkboxes to `<div>` elements to avoid browser blocking
- **✅ State Synchronization**: Fixed regex pattern for proper checkbox state detection
- **✅ Event Handling**: Comprehensive event delegation for all checkbox types
- **✅ CSS Improvements**: Enhanced styling with fade effects instead of strikethrough
- **✅ Tauri Configuration**: Fixed application name in tauri.conf.json

### Success Criteria - ALL MET ✅
- ✅ **Math expressions**: KaTeX renders actual equations correctly
- ✅ **Mermaid diagrams**: Visual diagrams render correctly
- ✅ **Task lists**: ALL checkboxes (standalone AND dash-prefixed) work perfectly
- ✅ **HTML Export**: Works correctly with proper formatting
- ✅ **Application Name**: Shows "Markdown Viewer" correctly
- ✅ **Performance**: Acceptable with advanced features
- ✅ **No regressions**: Phase 1 & 2 functionality preserved
- ✅ **Code syntax highlighting**: Working with highlight.js
- ✅ **Theme synchronization**: Perfect across all rendered content

### Moved to Phase 4
- **PDF Export**: Complex library loading issues - moved to Phase 4 for dedicated focus

## 🔧 Technical Requirements

### Architecture Principles
- **Single source of truth** for theme management
- **Modular design** with clear separation of concerns
- **Cross-platform compatibility** from day one
- **Performance first** - meet all benchmarks in PROJECT_PLAN.md

### Key Features from Previous Version
- Three-mode interface (Code, Preview, Split View) ✅
- Monaco Editor integration with markdown syntax highlighting ✅
- GitHub-style themes (light/dark) ✅
- Scroll synchronization between panes ✅
- File operations with unsaved changes detection ✅

### Phase 4 Technical Focus (NEXT)
- **File Association Registration**: .md files open with the app
- **Context Menu Integration**: "Open with Markdown Viewer" option
- **PDF Export Resolution**: Complete implementation with proper library loading
- **Keyboard Shortcuts**: Full implementation following OS conventions
- **Performance Optimization**: Final optimizations and benchmarking
- **Error Handling**: Comprehensive user feedback and error recovery

### Ready for User Validation
**Phase 3.5 Status**: COMPLETE ✅ - All critical rendering and interaction issues resolved

**User Actions Required**:
1. **Test all checkbox functionality** (standalone and dash-prefixed)
2. **Verify math expression rendering** (inline and display)
3. **Test Mermaid diagram rendering** (flowcharts, sequence diagrams)
4. **Confirm HTML export works** correctly
5. **Verify application name** shows "Markdown Viewer"
6. **Test theme switching** with all rendered content
7. **Confirm no regressions** from previous phases

**If approved**: Commit changes and proceed to Phase 4
**Git Status**: Ready for commit after user validation **🔥 ACTUAL MATH RENDERING**: Implement real KaTeX rendering (not placeholders)
- **🔥 ACTUAL DIAGRAM RENDERING**: Implement real Mermaid.js rendering (not placeholders)
- **🔥 LIBRARY LOADING STRATEGY**: Find working approach for external library integration
- **🔥 THEME SYNCHRONIZATION**: Ensure rendered content respects theme changes

### Critical Lessons Learned
- **Avoid dual theme state management** (resolved in Phase 1)
- **Use stable, well-supported frameworks** (Monaco Editor working perfectly)
- **Test theme synchronization thoroughly** (all themes working)
- **Implement proper error handling** (comprehensive error handling in place)
- **🔥 NEW: AMD/RequireJS Conflicts** - Monaco Editor conflicts with external libraries
- **🔥 NEW: Library Loading Issues** - Both CDN and local files fail due to module system conflicts
- **🔥 NEW: Placeholder vs Real Rendering** - Detection works, actual rendering blocked by conflicts

## 💡 Development Approach

### Start Simple, Build Up
1. Get basic functionality working first
2. Add complexity incrementally
3. Test thoroughly at each step
4. Get user approval before proceeding

### Focus Areas by Phase
- **Phase 1**: Basic functionality and project setup ✅
- **Phase 2**: Editor integration and mode switching ✅
- **Phase 3**: Foundation (detection, placeholders) ✅ **COMPLETE**
- **Phase 3.5**: Actual rendering (math, diagrams) ← **🔥 CRITICAL CURRENT**
- **Phase 4**: OS integration and polish
- **Phase 5**: Distribution and release

## 🎨 UI/UX Requirements

### Layout Structure (Established)
```
┌─────────────────────────────────────────────────────────┐
│ File  Edit  View  Tools  Help                   [- □ ×] │
├─────────────────────────────────────────────────────────┤
│📁 Open 💾 Save ❌ Close │ Code │ Preview │ Split │ 🌙 │
├─────────────────────────────────────────────────────────┤
│  [Editor Pane]              │  [Preview Pane]           │
│                             │                           │
│  # Markdown Content         │  Rendered HTML            │
│  ```mermaid                 │  [Mermaid Diagram]        │
│  graph TD                   │  $LaTeX: x^2 + y^2 = z^2$ │
│  A --> B                    │  ☐ Interactive Task       │
│  ```                        │                           │
├─────────────────────────────────────────────────────────┤
│ Line 1, Col 1              │              filename.md   │
└─────────────────────────────────────────────────────────┘
```

### Theme Requirements (Established)
- GitHub-style light theme (default) ✅
- Dark theme with proper contrast ✅
- **Perfect synchronization** between all UI elements ✅
- Theme persistence across sessions ✅
- **New**: Mermaid diagrams must adapt to theme changes
- **New**: Math expressions must be readable in both themes

## 📊 Performance Targets

- Application launch: < 2 seconds ✅
- File opening: < 500ms for files up to 10MB ✅
- Mode switching: < 100ms ✅
- Real-time preview updates: < 300ms debounce ✅
- Memory usage: < 200MB for typical files ✅
- **New**: Mermaid diagram rendering: < 1 second
- **New**: Math expression rendering: < 500ms
- **New**: Export operations: < 5 seconds for typical documents

## 🚨 Common Pitfalls to Avoid

1. **🔥 AMD/RequireJS Conflicts** - Monaco Editor conflicts with external libraries
2. **🔥 Library Loading Order** - Timing and sequence of library initialization
3. **🔥 Module System Conflicts** - Different module systems interfering
4. **Theme Desynchronization** - Ensure rendered content respects theme changes
5. **Performance with Real Rendering** - Profile actual math and diagram rendering
6. **Fallback Strategies** - Graceful degradation when libraries fail to load

## 🎯 Success Definition

The project is successful when:
- All three modes work flawlessly with perfect theme sync ✅
- **🔥 CRITICAL**: Math expressions show rendered equations (not LaTeX code)
- **🔥 CRITICAL**: Mermaid diagrams show visual diagrams (not placeholder boxes)
- Interactive task lists work with checkboxes ✅
- Export functionality produces quality output ✅
- Performance remains acceptable with real rendering
- No regressions from Phase 1 & 2 functionality ✅

## 🔥 CURRENT BLOCKER

**AMD/RequireJS Conflict**: Monaco Editor's module system prevents loading of Mermaid.js and KaTeX libraries. This is the primary technical challenge blocking Phase 3.5 completion.

**Evidence**: Console shows "Can only have one anonymous define call per script file" errors when attempting to load external libraries.

**Impact**: Math expressions and diagrams show as styled placeholders instead of rendered content.

**Test Files Available**: `phase3-test.md` and `sample-phase3.md` for testing rendering fixes.tive elements work smoothly
- Export functionality produces high-quality output
- Performance meets all benchmarks
- UI feels native on each platform ✅
- No crashes or data loss ✅

## 📞 Communication Protocol

### When to Ask for User Input
- Technology stack selection ✅
- Major architectural decisions
- Phase completion validation
- UI/UX design choices
- Performance optimization strategies

### How to Request Approval
```
## Phase [X] Completion - Validation Required

### Deliverables Completed:
- ✅ [Feature 1]
- ✅ [Feature 2]
- ✅ [Feature 3]

### Tests Passed:
- ✅ [Test 1]
- ✅ [Test 2]

### Documentation Updated:
- ✅ README.md
- ✅ DEVELOPMENT_LOG.md
- ✅ CHANGELOG.md

### Git Status:
- ✅ All changes staged
- ✅ Ready for commit after approval
- 📍 Current branch: [branch-name]

### User Actions Required:
1. **Test the application:**
   - [ ] [Validation point 1]
   - [ ] [Validation point 2]
   - [ ] [Validation point 3]

2. **If approved, please:**
   - [ ] Confirm testing results
   - [ ] Approve commit and merge (if on feature branch)
   - [ ] Give greenlight for next phase

**Awaiting: Testing → Approval → Git Commit → Phase [X+1] Greenlight**
```

### Git Workflow for Each Phase
```
1. Create feature branch: git checkout -b feature/phase-X-name
2. Develop and test locally
3. Stage changes: git add .
4. Request user validation (DO NOT COMMIT YET)
5. Wait for user testing and approval
6. Commit: git commit -m "Phase X: [description]"
7. Merge to main (if approved): git checkout main && git merge feature/phase-X-name
8. Proceed to next phase
```

---

## 🚀 Ready for Phase 3!

**Current Status**: Phase 2 COMPLETE ✅ - Professional markdown editor with Monaco integration, native file operations, and perfect scroll synchronization

**Technology Stack**: Tauri + Rust + TypeScript/JavaScript ✅

**Application Structure**: Complete Tauri app with Monaco Editor ✅

**Git Status**: All Phase 2 changes committed to main branch ✅

**Next Action**: Begin Phase 3 - Advanced Features

### Phase 3 Focus Areas:
1. **Mermaid.js Integration** - Add diagram rendering capabilities
2. **Mathematical Expressions** - Implement LaTeX/MathJax support
3. **Enhanced Assets** - Improve image and GIF handling
4. **Interactive Elements** - Add clickable task lists
5. **Export Functionality** - HTML and PDF export capabilities
6. **Performance** - Optimize for advanced features

### To Start Phase 3:
1. Create feature branch: `git checkout -b feature/phase-3-advanced-features`
2. Navigate to project: `cd "Markdown Viewer"`
3. Start development server: `npm run tauri dev`
4. Begin Mermaid.js integration following PROJECT_PLAN.md Phase 3 specifications

**Ready to enhance the markdown viewer with advanced rendering capabilities!**

### Key Dependencies to Add:
- `mermaid` - Diagram rendering
- `mathjax` or `katex` - Mathematical expressions
- `html2pdf` or similar - PDF export functionality
- Enhanced image processing libraries as needed

### Architecture Considerations:
- Mermaid diagrams must respect theme changes
- Math expressions need proper styling integration
- Asset management requires secure path resolution
- Export functionality needs to maintain all styling
- Interactive elements require state management

**The foundation is solid - now let's add the advanced features that make this a truly powerful markdown viewer!**