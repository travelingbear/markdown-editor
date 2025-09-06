# Multi-Tab Component System - Project Plan

## Overview
Transform the current single-document markdown editor into a multi-tab application with component-based architecture, single-instance behavior, and persistent tab sessions.

## Project Requirements
- **Scope**: Evolution of current project (not separate project)
- **Tab Persistence**: Yes, across sessions
- **Max Tabs**: 50 tabs maximum
- **Auto-save**: No auto-save for unsaved tabs
- **Tab Features**: Accessed from the bottom right (where the name of the current opened file is located, Shows the most recent five opened files and a "More" button, Opens a modal showing a list of the files, if more than 5, Close buttons (X), drag-to-reorder, no file type icons
- **Fallback**: Maintain existing single-file functionality
- **Git Strategy**: New branch per phase, merge only after validation

## Development Phases

### **Phase 1: Component Architecture Foundation** 🏗️
**Priority**: CRITICAL
**Branch**: `feature/component-architecture`
**Estimated Time**: 2-3 days

#### Objectives
- Extract monolithic `MarkdownViewer` class into modular components
- Maintain 100% existing functionality
- Create foundation for multi-tab system

#### Tasks
1. **Create Base Component System**
   - `BaseComponent` abstract class
   - Component lifecycle management
   - Event system for inter-component communication

2. **Extract Core Components**
   - `DocumentComponent` (manages single document state)
   - `EditorComponent` (Monaco editor wrapper)
   - `PreviewComponent` (markdown rendering)
   - `ToolbarComponent` (existing toolbar)

3. **Refactor Main Application**
   - `MarkdownEditor` becomes component orchestrator
   - Maintain existing API surface
   - Preserve all current functionality

#### Success Criteria
- [x] All existing features work identically
- [x] No performance regression
- [x] Clean component boundaries
- [x] Proper error handling maintained

#### Testing Requirements
- [x] All keyboard shortcuts work
- [x] File operations (open, save, close) work
- [x] Theme switching works
- [x] Export functionality works
- [x] Distraction-free mode works
- [x] Settings persistence works

#### **PHASE 1 COMPLETED** ✅
**Status**: All objectives achieved and tested
**Key Achievements**:
- Component-based architecture successfully implemented
- BaseComponent with lifecycle management and event system
- DocumentComponent, EditorComponent, PreviewComponent, ToolbarComponent extracted
- MarkdownEditor orchestrator maintains all existing functionality
- Settings system with comprehensive controls and persistence
- Performance tracking and optimization features
- All UI/UX features preserved including themes, toolbars, and modals

---

### **Phase 2: Single Instance Architecture** 🔄
**Priority**: HIGH
**Branch**: `feature/single-instance`
**Estimated Time**: 1-2 days

#### Objectives
- Implement single-instance application behavior
- Handle file arguments from subsequent launches
- Maintain backward compatibility

#### Tasks
1. **Add Tauri Single Instance Plugin**
   - Configure `tauri-plugin-single-instance`
   - Handle secondary instance arguments

2. **Implement File Argument Forwarding**
   - Forward file paths to existing instance
   - Handle multiple file arguments
   - Graceful fallback if forwarding fails

3. **Update Startup Logic**
   - Detect if instance already running
   - Forward arguments and exit, or start normally

#### Success Criteria
- [x] Only one instance runs at a time
- [x] Double-clicking .md files opens in existing instance
- [x] Multiple file arguments handled correctly
- [x] Graceful degradation if single-instance fails

#### Testing Requirements
- [x] Launch app, then double-click .md file → opens in same instance
- [x] Launch app twice → second launch forwards to first
- [x] File associations work with single instance
- [x] Command line arguments work with single instance
- [x] User has validated all success criteria

#### **PHASE 2 COMPLETED** ✅
**Status**: All objectives achieved and tested
**Key Achievements**:
- Single instance application behavior implemented
- File argument forwarding to existing instance
- Window focusing when second instance launched
- Multi-instance bypass with --new-instance flag
- Comprehensive USER_GUIDE.md documentation updated
- All testing requirements validated by user

---

### **Phase 3: Tab Management System** 📑
**Priority**: HIGH
**Branch**: `feature/tab-management`
**Estimated Time**: 3-4 days

#### Objectives
- Implement core tab management functionality
- Support multiple documents in memory
- Maintain performance with many tabs

#### Tasks
1. **Create Tab Management Components**
   - `TabManager` (orchestrates multiple documents)
   - `TabState` (individual tab state management)
   - `TabCollection` (manages tab array and operations)

2. **Implement Tab Operations**
   - Create new tab
   - Close tab (with unsaved changes confirmation)
   - Switch between tabs
   - Tab state persistence

3. **Update Document Handling**
   - Multiple document support in `DocumentComponent`
   - Active/inactive tab state management
   - Memory optimization for inactive tabs

4. **Add Tab Persistence**
   - Save tab states to localStorage
   - Restore tabs on application startup
   - Handle missing files gracefully

#### Success Criteria
- [ ] Can open multiple documents in tabs
- [ ] Tab switching preserves document state
- [ ] Unsaved changes tracked per tab
- [ ] Tab persistence works across sessions
- [ ] Performance acceptable with 20+ tabs

#### Testing Requirements
- [ ] Open 5 different .md files → 5 tabs created
- [ ] Switch between tabs → content preserved
- [ ] Close tab with unsaved changes → confirmation dialog
- [ ] Restart app → tabs restored
- [ ] Open 50 tabs → no significant performance impact
- [ ] User has to validate the items in the success criteria

---

### **Phase 4: Vertical Tab Sidebar** 📋
**Priority**: MEDIUM
**Branch**: `feature/vertical-sidebar`
**Estimated Time**: 2-3 days

#### Objectives
- Add vertical tab bar on the left side
- Implement auto-hide functionality
- Support pinned/unpinned states

#### Tasks
1. **Create Sidebar Component**
   - `SidebarComponent` (vertical tab container)
   - `TabItem` (individual tab representation)
   - Auto-hide/show logic

2. **Update Layout System**
   - Modify CSS Grid to accommodate sidebar
   - Responsive layout adjustments
   - Distraction-free mode integration

3. **Implement Tab Display**
   - File name display (truncated if needed)
   - Close button (X) on hover
   - Active tab highlighting
   - Unsaved indicator (dot or asterisk)

4. **Add Auto-hide Behavior**
   - Hide sidebar when not in use
   - Show on hover or keyboard shortcut
   - Pin/unpin functionality
   - Respect distraction-free mode

#### Success Criteria
- [ ] Vertical sidebar displays all open tabs
- [ ] Auto-hide works smoothly
- [ ] Pin/unpin functionality works
- [ ] Integrates with distraction-free mode
- [ ] Responsive design maintained

#### Testing Requirements
- [ ] Sidebar shows all open tabs
- [ ] Hover shows/hides sidebar when unpinned
- [ ] Pin button keeps sidebar visible
- [ ] Distraction-free mode hides sidebar
- [ ] Tab close buttons work
- [ ] Active tab clearly highlighted
- [ ] User has to validate the items in the success criteria

---

### **Phase 5: Tab Interaction Features** 🎯
**Priority**: MEDIUM
**Branch**: `feature/tab-interactions`
**Estimated Time**: 2-3 days

#### Objectives
- Add drag-and-drop tab reordering
- Implement tab close functionality
- Add keyboard navigation

#### Tasks
1. **Implement Drag-and-Drop**
   - Draggable tab items
   - Drop zones and visual feedback
   - Reorder tabs in collection
   - Persist new tab order

2. **Add Tab Close Features**
   - Close button (X) on each tab
   - Close confirmation for unsaved tabs
   - Close all tabs functionality
   - Close other tabs functionality

3. **Keyboard Navigation**
   - Navigate between tabs with keyboard
   - Close tab with keyboard
   - New tab with keyboard
   - Show/hide sidebar with keyboard

#### Success Criteria
- [ ] Drag-and-drop reordering works smoothly
- [ ] Tab close buttons work correctly
- [ ] Keyboard navigation implemented
- [ ] Tab order persists across sessions

#### Testing Requirements
- [ ] Drag tab to new position → order changes
- [ ] Click X on tab → tab closes (with confirmation if unsaved)
- [ ] Keyboard shortcuts work for tab navigation
- [ ] Tab order preserved after restart
- [ ] User has to validate the items in the success criteria

---

### **Phase 6: Performance Optimization** ⚡
**Priority**: LOW
**Branch**: `feature/performance-optimization`
**Estimated Time**: 1-2 days

#### Objectives
- Optimize memory usage with many tabs
- Implement lazy loading for inactive tabs
- Maintain responsive UI with 100 tabs

#### Tasks
1. **Memory Optimization**
   - Lazy load inactive tab content
   - Dispose of unused Monaco editor instances
   - Implement tab content virtualization

2. **Performance Monitoring**
   - Add tab-specific performance metrics
   - Monitor memory usage per tab
   - Performance warnings for excessive tabs

3. **UI Responsiveness**
   - Optimize tab switching performance
   - Debounce expensive operations
   - Virtual scrolling for tab list if needed

#### Success Criteria
- [ ] 100 tabs can be opened without significant slowdown
- [ ] Memory usage remains reasonable
- [ ] Tab switching is responsive
- [ ] Performance metrics show acceptable values

#### Testing Requirements
- [ ] Open 100 tabs → app remains responsive
- [ ] Memory usage < 500MB with 50 tabs
- [ ] Tab switching < 100ms
- [ ] No memory leaks detected
- [ ] User has to validate the items in the success criteria

---

### **Phase 7: Integration & Polish** ✨
**Priority**: LOW
**Branch**: `feature/integration-polish`
**Estimated Time**: 1-2 days

#### Objectives
- Final integration testing
- UI/UX polish
- Documentation updates

#### Tasks
1. **Integration Testing**
   - Test all features together
   - Cross-platform testing
   - Edge case handling

2. **UI/UX Polish**
   - Animation improvements
   - Visual feedback enhancements
   - Accessibility improvements

3. **Documentation**
   - Update help modal
   - Update keyboard shortcuts
   - Update README

#### Success Criteria
- [ ] All features work together seamlessly
- [ ] UI is polished and consistent
- [ ] Documentation is up to date

#### Testing Requirements
- [ ] Complete feature test suite passes
- [ ] Cross-platform compatibility verified
- [ ] User experience is smooth and intuitive
- [ ] User has to validate the items in the success criteria

---

## Git Branch Strategy

### Branch Naming Convention
- `feature/component-architecture`
- `feature/single-instance`
- `feature/tab-management`
- `feature/vertical-sidebar`
- `feature/tab-interactions`
- `feature/performance-optimization`
- `feature/integration-polish`

### Merge Process
1. Create feature branch from `main`
2. Implement phase requirements
3. Self-test all success criteria
4. Request validation from Francisco
5. Only merge to `main` after explicit approval
6. Tag release after each major phase

### Version Strategy
- Phase 1-2: v2.2.0 (Component Architecture)
- Phase 3-4: v2.3.0 (Tab System)
- Phase 5-6: v2.4.0 (Tab Interactions)
- Phase 7: v2.5.0 (Multi-Tab Complete)

## Risk Mitigation

### High Risk Items
- **Performance with many tabs**: Implement lazy loading early
- **Monaco editor memory leaks**: Proper disposal of editor instances
- **State management complexity**: Keep component boundaries clear

### Fallback Plans
- If single-instance fails: Graceful degradation to multi-instance
- If performance issues: Implement tab limits and warnings
- If drag-drop issues: Provide alternative reordering method

## Success Metrics
- **Functionality**: 100% existing features preserved
- **Performance**: < 2s startup with 10 tabs, < 100ms tab switching
- **Memory**: < 50MB per tab average
- **Stability**: No crashes with 100 tabs
- **UX**: Smooth animations, responsive UI

## Next Steps
1. Review and approve this project plan
2. Create `feature/component-architecture` branch
3. Begin Phase 1 implementation
4. Request validation after each phase completion