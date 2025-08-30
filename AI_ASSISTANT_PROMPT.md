# AI Assistant Development Prompt

## 🎯 Project Context

You are helping develop a **Native Markdown Viewer** desktop application. This is a complete rewrite of a previous Electron project that had theme synchronization issues.

## 📋 Current Project Status

**Phase**: Phase 2 COMPLETE ✅ - Ready for Phase 3
**Next Action**: Begin Phase 3 - Advanced Features
**Technology Stack**: Tauri + Rust + TypeScript/JavaScript (SELECTED)
**Git Status**: All Phase 2 changes committed to main branch

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

## 🚀 What You Need to Do

### Immediate Next Steps
1. **Begin Phase 3 development** following the plan in `PROJECT_PLAN.md`:
   - Mermaid.js diagram rendering (flowcharts, sequence diagrams, etc.)
   - LaTeX/MathJax mathematical expressions rendering
   - Enhanced image support with local asset management
   - GIF support and animated content
   - Interactive task lists with checkboxes
   - Advanced table editing and styling
   - Export functionality (HTML, PDF)

2. **Create Phase 3 feature branch**: `feature/phase-3-advanced-features`

3. **Follow strict validation process** before proceeding to Phase 4

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

## 🎯 Phase 3 Deliverables (Current Target)

### Core Features to Implement
- **Mermaid.js Integration**: Flowcharts, sequence diagrams, gantt charts, etc.
- **LaTeX/MathJax Support**: Mathematical expressions and formulas
- **Enhanced Asset Management**: Local images with relative path resolution
- **GIF and Video Support**: Animated content rendering
- **Interactive Task Lists**: Clickable checkboxes with state persistence
- **Advanced Table Features**: Better table editing and styling
- **Export Functionality**: HTML and PDF export with proper formatting
- **Emoji Support**: GitHub-style emoji rendering
- **Code Block Enhancements**: Better syntax highlighting for code blocks

### Success Criteria
- ✅ Mermaid diagrams render correctly in both light and dark themes
- ✅ Math expressions display properly with LaTeX syntax
- ✅ Local images load with correct relative paths
- ✅ Task lists are interactive and maintain state
- ✅ Export functions work correctly
- ✅ Performance remains acceptable with advanced features
- ✅ No regressions from Phase 1 & 2 functionality

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

### Phase 3 Technical Focus
- **Mermaid.js Integration**: Client-side diagram rendering
- **MathJax/KaTeX**: Mathematical expression rendering
- **Asset Pipeline**: Local file resolution and caching
- **Interactive Elements**: Clickable task lists and enhanced tables
- **Export Engine**: HTML and PDF generation with styling

### Critical Lessons Learned
- **Avoid dual theme state management** (resolved in Phase 1)
- **Use stable, well-supported frameworks** (Monaco Editor working perfectly)
- **Test theme synchronization thoroughly** (all themes working)
- **Implement proper error handling** (comprehensive error handling in place)

## 💡 Development Approach

### Start Simple, Build Up
1. Get basic functionality working first
2. Add complexity incrementally
3. Test thoroughly at each step
4. Get user approval before proceeding

### Focus Areas by Phase
- **Phase 1**: Basic functionality and project setup ✅
- **Phase 2**: Editor integration and mode switching ✅
- **Phase 3**: Advanced features (Mermaid, math, assets) ← **CURRENT**
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

1. **Theme Desynchronization** - Ensure Mermaid and MathJax respect theme changes
2. **Performance Degradation** - Profile diagram and math rendering
3. **Asset Path Issues** - Proper relative path resolution for images
4. **Export Quality** - Maintain formatting and styling in exports
5. **Interactive Element State** - Persist task list states properly

## 🎯 Success Definition

The project is successful when:
- All three modes work flawlessly with perfect theme sync ✅
- Advanced features (diagrams, math, assets) render correctly
- Interactive elements work smoothly
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