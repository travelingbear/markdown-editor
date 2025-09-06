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
d
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

5. **Implement Tab UI in Status Bar**
   - Tab UI in bottom right (replacing filename when tabs are open)
   - Show most recent 5 tabs with close buttons (X)
   - "More" button when more than 5 tabs
   - Modal showing all tabs with close functionality
   - No file type icons (clean minimal design)

#### Success Criteria
- [x] Can open multiple documents in tabs
- [x] Tab switching preserves document state
- [x] Unsaved changes tracked per tab
- [x] Tab persistence works across sessions
- [x] Performance acceptable with 20+ tabs
- [x] Tab UI shows in bottom right status bar
- [x] More button appears when >5 tabs
- [x] Tab modal shows all open tabs

#### Testing Requirements
- [x] Open 5 different .md files → 5 tabs created in status bar
- [x] Switch between tabs → content preserved
- [x] Close tab with unsaved changes → confirmation dialog
- [x] Open 6th file → "More" button appears
- [x] Click "More" → modal shows all tabs
- [x] Close tabs from modal → works correctly
- [x] Restart app → tabs restored
- [x] Open 50 tabs → no significant performance impact
- [x] User has validated all success criteria

#### **PHASE 3 COMPLETED** ✅
**Status**: All objectives achieved and tested
**Key Achievements**:
- Complete tab management system with TabManager, TabState, and TabCollection components
- Multi-document support with proper state management and persistence
- Tab UI in status bar with dropdown for recent tabs and modal for all tabs
- Cursor position and scroll state preservation across tab switches
- Proper save functionality synchronized with active tab content
- Theme switching support for tab content rendering
- Welcome screen integration with tab functionality
- Performance optimizations for syntax highlighting and content loading

---

### **Phase 4: Enhanced Tab Features** 🎯
**Priority**: MEDIUM
**Branch**: `feature/enhanced-tabs`
**Estimated Time**: 2-3 days

#### Objectives
- Add drag-and-drop tab reordering in status bar
- Implement keyboard navigation for tabs
- Add tab context menu functionality
- Enhance tab modal with additional features

#### Tasks
1. **Implement Drag-and-Drop Reordering**
   - Draggable tab items in status bar
   - Visual feedback during drag operations
   - Reorder tabs in collection
   - Persist new tab order

2. **Add Keyboard Navigation**
   - Navigate between tabs with Ctrl+Tab/Ctrl+Shift+Tab
   - Close tab with Ctrl+W
   - New tab with Ctrl+T
   - Switch to specific tab with Ctrl+1-9

3. **Enhance Tab Modal**
   - Search/filter functionality
   - Sort options (name, date, path)
   - Bulk operations (close multiple tabs)
   - Keyboard navigation within modal

4. **Add Tab Context Menu**
   - Right-click context menu on tabs
   - Close tab, close others, close all
   - Duplicate tab functionality
   - Reveal in file explorer

#### Success Criteria
- [❌] Drag-and-drop reordering works in status bar (REMOVED - not needed)
- [✅] Keyboard shortcuts for tab navigation work
- [✅] Tab modal has enhanced functionality
- [✅] Context menu provides useful actions
- [✅] Tab order persists across sessions

#### Testing Requirements
- [❌] Drag tab to new position in status bar → order changes (REMOVED - not needed)
- [✅] Ctrl+Tab cycles through tabs
- [✅] Ctrl+W closes active tab
- [✅] Right-click tab → context menu appears
- [✅] Tab modal search filters tabs correctly
- [✅] Keyboard navigation works in modal
- [✅] Tab order preserved after restart
- [✅] User has validated all items in the success criteria

#### **PHASE 4 COMPLETED** ✅
**Status**: All objectives achieved and tested
**Key Achievements**:
- Numbered tabs (1-5) in dropdown with Alt+1-5 keyboard shortcuts
- Dynamic dropdown updates when selecting tabs from modal (not in current top 5)
- Context menu with proper positioning and overflow prevention
- Tab modal with search functionality and keyboard navigation
- Reveal in Explorer functionality for saved files
- Comprehensive keyboard shortcuts: Ctrl+Tab (next), Ctrl+Shift+Tab (modal), Alt+1-5 (numbered tabs)
- Clean removal of drag-and-drop functionality (not needed per user feedback)
- Tab persistence and order management working correctly

---

### **Phase 5: Tab Session Management** 💾
**Priority**: MEDIUM
**Branch**: `feature/tab-sessions`
**Estimated Time**: 2-3 days

#### Objectives
- Implement advanced tab session management
- Add tab grouping and organization features
- Enhance tab persistence with recovery options
- Add tab export/import functionality

#### Tasks
1. **Advanced Session Management**
   - Save/restore tab sessions by name
   - Auto-save sessions on app close
   - Session recovery after crashes
   - Recent sessions list

2. **Tab Organization Features**
   - Pin/unpin important tabs
   - Recently closed tabs recovery
   - Tab bookmarking system
   - Workspace-based tab groups

3. **Enhanced Persistence**
   - Backup tab sessions to file
   - Import/export tab configurations
   - Cross-device session sync preparation
   - Session cleanup and optimization

4. **Tab Analytics and Insights**
   - Most used files tracking
   - Tab usage statistics
   - Performance impact monitoring
   - Memory usage per tab reporting

#### Success Criteria
- [ ] Named tab sessions can be saved/restored
- [ ] Pinned tabs persist across sessions
- [ ] Recently closed tabs can be recovered
- [ ] Tab sessions can be exported/imported
- [ ] Performance remains good with complex sessions

#### Testing Requirements
- [ ] Save session with name → can restore later
- [ ] Pin tab → stays pinned after restart
- [ ] Close tab → appears in "recently closed"
- [ ] Export session → can import in fresh install
- [ ] Complex session with 30+ tabs → good performance
- [ ] Crash recovery → tabs restored correctly
- [ ] User has to validate the items in the success criteria

---

### **Phase 6: Performance Optimization** ⚡ ✅ COMPLETED
**Priority**: LOW
**Branch**: `feature/performance-optimization` → **MERGED**
**Estimated Time**: 1-2 days → **ACTUAL: 1 day**

#### Objectives ✅
- ✅ Optimize memory usage with many tabs
- ✅ Implement lazy loading for inactive tabs
- ✅ Maintain responsive UI with 100 tabs

#### Tasks ✅
1. **Memory Optimization** ✅
   - ✅ Lazy load inactive tab content
   - ✅ Dispose of unused Monaco editor instances
   - ✅ Implement tab content virtualization
   - ✅ Smart tab unloading for memory pressure

2. **Performance Monitoring** ✅
   - ✅ Add tab-specific performance metrics
   - ✅ Monitor memory usage per tab
   - ✅ Performance warnings for excessive tabs
   - ✅ Real-time performance dashboard

3. **UI Responsiveness** ✅
   - ✅ Optimize tab switching performance
   - ✅ Debounce expensive operations
   - ✅ Virtual scrolling for tab modal if needed
   - ✅ Async tab operations to prevent UI blocking

4. **Smart Resource Management** ✅
   - ✅ Intelligent tab prioritization
   - ✅ Background tab content freezing
   - ✅ Predictive tab loading
   - ✅ Memory cleanup automation

#### Success Criteria ✅
- [x] 100 tabs can be opened without significant slowdown
- [x] Memory usage stays reasonable with many tabs
- [x] Tab switching remains responsive under load
- [x] Memory leaks are prevented with tab cleanup
- [x] Performance metrics show acceptable thresholds

#### Testing Requirements ✅
- [x] Open 100 tabs → no significant UI lag
- [x] Switch between tabs rapidly → smooth transitions
- [x] Monitor memory usage → stays within limits
- [x] Close many tabs → memory is properly freed
- [x] Performance dashboard shows green metrics
- [x] User has validated all success criteria

#### Key Achievements
- **Tab Virtualization**: Automatically virtualizes tabs beyond 15 count
- **Performance Dashboard**: Real-time monitoring in Settings
- **Memory Optimization**: Smart cleanup and pressure detection
- **File Tracking**: All file opens (including Explorer) tracked
- **Modal Updates**: Tab modal refreshes immediately on changes

---

### **Phase 7: CSS Modularization** 🎨
**Priority**: LOW
**Branch**: `feature/css-modularization`
**Estimated Time**: 1-2 days

#### Objectives
- Split monolithic styles.css into modular theme-specific files
- Improve maintainability and organization of CSS code
- Enable easier theme development and customization
- Reduce CSS bundle size through selective loading

#### Tasks
1. **Create Theme-Specific CSS Files**
   - `themes/light.css` - Light theme specific styles
   - `themes/dark.css` - Dark theme specific styles  
   - `themes/retro.css` - Retro theme specific styles
   - `base.css` - Common base styles and layout

2. **Modularize Component Styles**
   - `components/toolbar.css` - Toolbar component styles
   - `components/editor.css` - Editor pane styles
   - `components/preview.css` - Preview pane styles
   - `components/modals.css` - Modal dialog styles
   - `components/tabs.css` - Tab management UI styles

3. **Create Utility CSS Files**
   - `utilities/animations.css` - Animation and transition styles
   - `utilities/responsive.css` - Responsive design breakpoints
   - `utilities/print.css` - Print-specific styles
   - `utilities/accessibility.css` - Accessibility enhancements

4. **Update CSS Loading System**
   - Dynamic theme CSS loading based on selected theme
   - CSS import optimization for faster loading
   - Fallback handling for missing theme files
   - CSS minification for production builds

#### Success Criteria
- [ ] styles.css is split into logical, maintainable modules
- [ ] Theme switching loads appropriate CSS files dynamically
- [ ] No visual regressions after CSS modularization
- [ ] CSS bundle size is optimized for each theme
- [ ] Development workflow is improved for styling
- [ ] All themes render correctly with modular CSS

#### Testing Requirements
- [ ] All themes (light/dark/retro) render identically to before
- [ ] Theme switching works without visual glitches
- [ ] CSS files load efficiently without blocking
- [ ] Print styles work correctly
- [ ] Responsive design functions on all screen sizes
- [ ] No CSS conflicts between modular files
- [ ] Development hot-reload works with new CSS structure
- [ ] User has to validate the items in the success criteria

---

### **Phase 8: Integration & Polish** ✨
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
- `feature/enhanced-tabs`
- `feature/tab-sessions`
- `feature/performance-optimization`
- `feature/css-modularization`
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
- Phase 5-6: v2.4.0 (Tab Features & Performance)
- Phase 7-8: v2.5.0 (CSS Modularization & Polish)

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
1. ✅ Phase 1: Component Architecture Foundation - COMPLETED
2. ✅ Phase 2: Single Instance Architecture - COMPLETED  
3. ✅ Phase 3: Tab Management System - COMPLETED
4. ✅ Phase 4: Enhanced Tab Features - COMPLETED
5. ✅ Phase 6: Performance Optimization - COMPLETED
6. Begin Phase 5: Tab Session Management
7. Continue with remaining phases as planned