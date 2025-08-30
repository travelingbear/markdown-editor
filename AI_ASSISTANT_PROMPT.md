# AI Assistant Development Prompt

## 🎯 Project Context

You are helping develop a **Native Markdown Viewer** desktop application. This is a complete rewrite of a previous Electron project that had theme synchronization issues.

## 📋 Current Project Status

**Phase**: Phase 1 COMPLETE ✅ - Ready for Phase 2
**Next Action**: Begin Phase 2 - Enhanced Editor Integration
**Technology Stack**: Tauri + Rust + TypeScript/JavaScript (SELECTED)
**Git Status**: All Phase 1 changes committed to main branch

## 🔍 Key Files to Reference

### Primary Planning Documents
- `PROJECT_PLAN.md` - Complete project specification, features, and phases
- `DEBUGGING_REPORT.md` - Lessons learned from previous Electron attempt
- `PROJECT_STATUS.md` - Historical context of what was previously built

### Development Files (CREATED ✅)
- `DEVELOPMENT_LOG.md` - Phase 1 progress documented
- `CHANGELOG.md` - Version history started
- `Markdown Viewer/README.md` - Project setup instructions
- `Markdown Viewer/` - Complete Tauri application structure

## 🚀 What You Need to Do

### Immediate Next Steps
1. **Begin Phase 2 development** following the plan in `PROJECT_PLAN.md`:
   - Monaco Editor integration for advanced code editing
   - Enhanced syntax highlighting for markdown
   - File operations with native dialogs (open/save)
   - Scroll synchronization between editor and preview
   - Performance optimizations

2. **Create Phase 2 feature branch**: `feature/phase-2-enhanced-editor`

3. **Follow strict validation process** before proceeding to Phase 3

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

## ✅ Phase 1 Deliverables (COMPLETED)

### Core Features Implemented
- ✅ Basic application window with native Tauri interface
- ✅ Three-mode interface (Code, Preview, Split View)
- ✅ Simple text editor with real-time cursor tracking
- ✅ Real-time markdown preview with GitHub-flavored markdown
- ✅ Light/dark theme system with perfect synchronization
- ✅ Resizable splitter in split view mode
- ✅ Status bar with live cursor position and filename
- ✅ Keyboard shortcuts (Ctrl+O, Ctrl+S, Ctrl+W)
- ✅ Complete project documentation

## 🎯 Phase 2 Deliverables (Current Target)

### Core Features to Implement
- Monaco Editor integration for advanced code editing
- Enhanced markdown syntax highlighting in editor
- File operations with native dialogs (open/save)
- Scroll synchronization between editor and preview
- Advanced markdown features (tables, task lists, emoji)
- Performance optimizations and error handling

### Success Criteria
- ✅ Monaco Editor loads with markdown syntax highlighting
- ✅ File dialogs work correctly for opening/saving .md files
- ✅ Scroll synchronization works smoothly between panes
- ✅ All markdown features render correctly
- ✅ Performance remains acceptable with Monaco Editor
- ✅ No regressions from Phase 1 functionality

## 🔧 Technical Requirements

### Architecture Principles
- **Single source of truth** for theme management
- **Modular design** with clear separation of concerns
- **Cross-platform compatibility** from day one
- **Performance first** - meet all benchmarks in PROJECT_PLAN.md

### Key Features from Previous Version
- Three-mode interface (Code, Preview, Split View)
- Monaco Editor integration with markdown syntax highlighting
- Mermaid.js diagram rendering
- GitHub-style themes (light/dark)
- Scroll synchronization between panes
- File operations with unsaved changes detection

### Critical Lessons Learned
- **Avoid dual theme state management** (caused sync issues in Electron version)
- **Use stable, well-supported frameworks** (Electron had import issues)
- **Test theme synchronization thoroughly** at each phase
- **Implement proper error handling** from the beginning

## 💡 Development Approach

### Start Simple, Build Up
1. Get basic functionality working first
2. Add complexity incrementally
3. Test thoroughly at each step
4. Get user approval before proceeding

### Focus Areas by Phase
- **Phase 1**: Basic functionality and project setup
- **Phase 2**: Editor integration and mode switching
- **Phase 3**: Advanced features (Mermaid, math, assets)
- **Phase 4**: OS integration and polish
- **Phase 5**: Distribution and release

## 🎨 UI/UX Requirements

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ File  Edit  View  Tools  Help                   [- □ ×] │
├─────────────────────────────────────────────────────────┤
│📁 Open 💾 Save ❌ Close │ Code │ Preview │ Split │ 🌙 │
├─────────────────────────────────────────────────────────┤
│  [Editor Pane]              │  [Preview Pane]           │
│                             │                           │
│  # Markdown Content         │  Rendered HTML            │
│  ```javascript              │  [Highlighted Code]       │
│  const x = 1;               │                           │
│  ```                        │                           │
├─────────────────────────────────────────────────────────┤
│ Line 1, Col 1              │              filename.md   │
└─────────────────────────────────────────────────────────┘
```

### Theme Requirements
- GitHub-style light theme (default)
- Dark theme with proper contrast
- **Perfect synchronization** between all UI elements
- Theme persistence across sessions

## 📊 Performance Targets

- Application launch: < 2 seconds
- File opening: < 500ms for files up to 10MB
- Mode switching: < 100ms
- Real-time preview updates: < 300ms debounce
- Memory usage: < 200MB for typical files

## 🚨 Common Pitfalls to Avoid

1. **Theme Desynchronization** - Ensure single source of truth
2. **Framework Import Issues** - Use stable, well-documented APIs
3. **Performance Degradation** - Profile and optimize regularly
4. **Cross-platform Inconsistencies** - Test on all target platforms
5. **Complex State Management** - Keep it simple and predictable

## 🎯 Success Definition

The project is successful when:
- All three modes work flawlessly with perfect theme sync
- Performance meets all benchmarks
- UI feels native on each platform
- No crashes or data loss
- Easy installation with OS integration

## 📞 Communication Protocol

### When to Ask for User Input
- Technology stack selection
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

## 🚀 Ready for Phase 2!

**Current Status**: Phase 1 COMPLETE ✅ - Fully functional markdown viewer with three modes, themes, and real-time preview

**Technology Stack**: Tauri + Rust + TypeScript/JavaScript ✅

**Application Structure**: Complete Tauri app in `Markdown Viewer/` directory ✅

**Git Status**: All Phase 1 changes committed to main branch ✅

**Next Action**: Begin Phase 2 - Enhanced Editor Integration

### Phase 2 Focus Areas:
1. **Monaco Editor Integration** - Replace textarea with professional code editor
2. **File Operations** - Implement native file dialogs for open/save
3. **Scroll Synchronization** - Link editor and preview scrolling
4. **Enhanced Features** - Advanced markdown rendering and syntax highlighting
5. **Performance** - Optimize for larger files and smooth interactions

### To Start Phase 2:
1. Create feature branch: `git checkout -b feature/phase-2-enhanced-editor`
2. Navigate to project: `cd "Markdown Viewer"`
3. Start development server: `npm run tauri dev`
4. Begin Monaco Editor integration following PROJECT_PLAN.md Phase 2 specifications

**Ready to enhance the markdown viewer with professional editing capabilities!**