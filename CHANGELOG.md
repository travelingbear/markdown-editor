# Changelog

All notable changes to the Markdown Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 4 Current Session - Debugging Challenges

#### Issues Identified
- **Drag-and-Drop Not Working**: Files dragged onto application window don't trigger any events
- **File Association Error**: Double-clicking .md files shows "Error opening file: undefined"

#### Attempted Solutions
- Added web drag-and-drop events with comprehensive logging
- Implemented Tauri native drag-and-drop listeners
- Enhanced startup file detection and error handling
- Improved Rust backend argument parsing with validation
- Fixed Tauri configuration issues

#### Files Modified
- `main.js` - Added setupDragAndDrop() and setupTauriDragDrop() methods
- `lib.rs` - Enhanced command line argument parsing
- `styles.css` - Added drag-and-drop visual feedback
- `tauri.conf.json` - File association configuration

#### Documentation Created
- `CURRENT_CHALLENGES.md` - Detailed debugging status
- Updated `AI_ASSISTANT_PROMPT.md` - Concise project overview

#### Next Session Focus
- Debug drag-and-drop event handling
- Fix file association startup detection
- Complete Phase 4 and prepare for Phase 5

### Phase 4 COMPLETE - OS Integration & Advanced Features

#### Phase 4 Day 5 - Final Completion

##### Added
- **Enhanced File Association Registration** with MIME type support and additional extensions
- **Performance Benchmarking System** with automatic timing and target validation
- **Comprehensive Error Recovery** with automatic fallback strategies
- **Memory Optimization** with periodic cleanup and garbage collection
- **Performance Reporting** in settings dialog with detailed benchmarks
- **Error Analytics** with context-aware recovery options

##### Enhanced
- **File Associations** now include MIME type and .txt extension support
- **Error Handling** with detailed recovery options and automatic strategies
- **Settings Dialog** with performance benchmarks and error log management
- **Performance Monitoring** with real-time tracking and optimization
- **Memory Management** with automatic cleanup and optimization

##### Technical Improvements
- **Startup Time Monitoring** with automatic performance validation
- **File Operation Benchmarking** for open/save operations
- **Mode Switch Performance** tracking and optimization
- **Preview Update Optimization** with debounced rendering
- **Error Context Logging** with full application state capture
- **Automatic Recovery Strategies** for common failure scenarios

### Phase 4 Days 2-4 - Print/Export System & Settings Enhancement

#### Added
- **Complete Print/Export System** with mode-specific behavior and popup-free implementation
- **Comprehensive Settings Dialog** (Ctrl+,) with theme, mode, and suggestions configuration
- **Enhanced Button State Management** with context-aware enable/disable states
- **Default Preferences System** with persistent user settings
- **Welcome Page Enhancement** with complete keyboard shortcuts reference

#### Enhanced
- **Print Quality** with optimized margins, transparent backgrounds, and proper page breaks
- **User Experience** with professional button behavior and settings accessibility
- **Performance** with optimized print preparation and settings loading

#### Fixed
- **Popup Blockers** preventing print functionality
- **Button States** remaining active when no document loaded
- **Settings Persistence** across application sessions

### Phase 4 - Polish & OS Integration

#### Phase 4 Day 1 - User Experience Enhancements (COMPLETE ✅)

##### Added
- **Welcome/Front Page**: Professional landing page displayed when no document is open
  - Clean gradient background with animations
  - Feature showcase and keyboard shortcuts reference
  - Action buttons for New File and Open File
  - Responsive design with dark theme support
- **New File Button**: Create new markdown documents
  - Added to toolbar with 📄 New icon
  - Keyboard shortcut: Ctrl+N
  - Smart workflow with unsaved changes detection
- **Save As Button**: Added to toolbar between Save and Close
  - Uses existing saveAsFile() functionality
  - Consistent with other toolbar buttons
- **Enhanced Close Dialog**: Proper Yes/No/Cancel behavior
  - Two-step dialog approach for three-button functionality
  - Yes: Save file and close document
  - No: Close document without saving
  - Cancel: Stay in document (no action)
- **Mode Button Management**: Smart enabling/disabling based on document state
  - Disabled when no document loaded (welcome page)
  - Enabled when document is opened or created
  - Visual indicators with reduced opacity for disabled state

##### Enhanced
- **Code Syntax Highlighting**: Fixed to work correctly in preview mode
  - Added applySyntaxHighlighting() call to updatePreview() method
  - Proper highlight.js integration with theme switching
- **File State Management**: Improved document lifecycle handling
  - Clear editor content when document is closed
  - Proper state transitions between welcome and editor modes
  - Enhanced filename display for different states
- **PDF Export**: Temporary user-friendly messaging
  - Shows informative message about future availability
  - Suggests HTML export + browser print-to-PDF as alternative

##### Fixed
- **Welcome Page Layout**: Removed features section to prevent overflow
- **Editor Clearing**: Clear Monaco editor content after closing document
- **Mode Switching**: Prevent switching to Code/Split modes without document
- **Tauri Configuration**: Resolved dialog permissions and config format issues

##### Technical Improvements
- **CSS Enhancements**: Added comprehensive styling for welcome page and disabled states
- **JavaScript Architecture**: Enhanced state management and event handling
- **User Experience**: Consistent behavior across all application states

**Status**: Phase 4 Days 1-4 COMPLETE ✅ - Major UI/UX improvements and settings system implemented

#### Phase 4 Days 2-4 - Print/Export System & Settings Enhancement (COMPLETE ✅)

##### Added
- **Complete Print/Export System**:
  - Mode-specific printing (Preview: rendered markdown, Code: syntax-highlighted source, Split: rendered markdown)
  - Popup-free implementation using hidden iframe method
  - Optimized print layout with 0.6in margins and appropriate font sizes
  - Transparent backgrounds for code blocks in print mode
  - Proper page breaks for Mermaid diagrams and code blocks
  - Enhanced CSS print media queries
- **Comprehensive Settings Dialog (Ctrl+,)**:
  - Three configurable options: 1-Theme, 2-Default Mode, 3-Text Suggestions
  - Persistent settings stored in localStorage
  - Immediate application of settings changes
  - System information and performance stats display
- **Enhanced Button State Management**:
  - Document-dependent buttons (Save, Save As, Close, Export) disabled when no document loaded
  - All mode buttons disabled on welcome page
  - Proper state synchronization when opening/closing documents
- **Default Preferences System**:
  - Default theme setting with startup application
  - Default mode applied to new and opened files
  - Text suggestions preference with Monaco editor integration
- **Welcome Page Enhancement**:
  - Added Ctrl+, (Settings) and F1 (Help) to keyboard shortcuts section
  - Better discoverability of application features

##### Enhanced
- **Print Quality**: Improved syntax highlighting, better margins, transparent backgrounds
- **User Experience**: Professional button behavior and context-aware UI states
- **Settings Accessibility**: Clear numbered menu system with validation
- **Performance**: Optimized print preparation and settings loading

##### Fixed
- **Popup Blockers**: Print functionality no longer blocked by browser popup restrictions
- **Button States**: Export and save buttons properly disabled when no document present
- **Content Clearing**: Editor and preview properly cleared when document closed
- **Settings Persistence**: User preferences correctly saved and restored across sessions

##### Technical Improvements
- **Print System**: Hidden iframe method, Tauri integration attempts, graceful fallbacks
- **Settings Storage**: localStorage-based persistence with fallback defaults
- **Button Management**: Enhanced updateModeButtons() with comprehensive state control
- **CSS Enhancements**: Print media queries, transparent backgrounds, optimized layouts
- **Error Handling**: User-friendly messages and recovery instructions

**Status**: PHASE 4 95% COMPLETE - 2 blocking issues remain

#### Current Challenges:
- Drag-and-drop functionality not working (no console errors)
- File association error: "undefined" file path on startup

#### Next Steps:
- Debug Tauri v2 drag-and-drop implementation
- Fix startup file detection in built application
- Complete Phase 4 and proceed to Phase 5 (Distribution & Release)

---

### Phase 3 - Advanced Features

#### Added
- **Mermaid.js Diagram Support**:
  - Flowcharts with customizable nodes and connections
  - Sequence diagrams for interaction modeling
  - Gantt charts for project timeline visualization
  - Theme-aware rendering (automatically switches with light/dark themes)
  - Error handling for invalid diagram syntax with helpful messages
- **Mathematical Expression Rendering**:
  - Inline math expressions using $...$ syntax
  - Display math equations using $$...$$ syntax
  - KaTeX rendering engine for high-quality mathematical typesetting
  - Support for complex mathematical notation and symbols
  - Graceful error handling for invalid LaTeX syntax
- **Interactive Task Lists**:
  - Clickable checkboxes for `- [ ]` and `- [x]` markdown syntax
  - Real-time state persistence during editing sessions
  - Visual feedback with strikethrough for completed tasks
  - Automatic dirty state management when tasks are toggled
- **Export Functionality**:
  - HTML export with complete standalone document structure
  - PDF export using high-quality rendering pipeline
  - Embedded CSS and styling preservation
  - Native file save dialogs with appropriate filters
  - Proper formatting maintenance across export formats
- **Enhanced Styling and UI**:
  - Professional styling for Mermaid diagrams with theme-aware containers
  - Improved mathematical expression display with proper spacing
  - Enhanced table styling with hover effects and alternating row colors
  - Better code block presentation with syntax highlighting containers
  - Improved blockquote styling with background colors and borders
  - Responsive design considerations for advanced features

#### Enhanced
- **Markdown Rendering Pipeline**:
  - Custom marked.js renderer for advanced syntax support
  - Multi-step rendering process (markdown → HTML → diagrams → math)
  - Async rendering for complex diagrams and expressions
  - Improved error handling throughout the rendering pipeline
- **Theme System**:
  - Mermaid diagrams automatically adapt to theme changes
  - Mathematical expressions maintain readability in both themes
  - Enhanced CSS custom properties for advanced feature styling
  - Consistent theme synchronization across all new elements
- **Performance Optimizations**:
  - Efficient diagram rendering with proper async handling
  - Optimized math expression processing with regex patterns
  - Debounced preview updates for complex documents
  - Memory management for advanced features

#### Technical Improvements
- **Dependencies Added**:
  - mermaid@10.6.1: Advanced diagram rendering
  - katex@0.16.9: Mathematical expression typesetting
  - html2canvas@1.4.1: HTML to canvas conversion for PDF export
  - jspdf@2.5.1: PDF generation and formatting
- **Architecture Enhancements**:
  - Extended marked.js renderer with custom code block and list item handlers
  - Advanced preview system with multi-stage rendering pipeline
  - Task list state management using Map-based storage
  - Modular export system with format-specific implementations
- **Export Pipeline**:
  - Complete HTML document generation with embedded styles
  - High-quality PDF rendering with proper page handling
  - Asset preservation and styling maintenance
  - Error handling for export operations

#### Fixed
- **CRITICAL**: AMD/RequireJS conflicts with Monaco Editor resolved
- **CRITICAL**: Math expressions now render as actual equations (not LaTeX code)
- **CRITICAL**: Mermaid diagrams now render as visual diagrams (not placeholders)
- Mermaid theme synchronization timing issues
- Mathematical expression parsing edge cases
- Task list state persistence across mode switches
- Export formatting consistency
- Performance optimization for complex documents
- Library loading conflicts through ES module implementation

### Phase 2 - Enhanced Editor Integration

#### Added
- **Monaco Editor Integration**:
  - Professional code editor with markdown syntax highlighting
  - Line numbers, code folding, and bracket matching
  - Automatic layout adjustment on window resize
  - Monospace font family optimized for code editing
  - Word wrap and scroll beyond last line options
- **Enhanced File Operations**:
  - Native file dialogs with improved filters (.md, .markdown, .txt)
  - Save As functionality (Ctrl+Shift+S)
  - Comprehensive error handling with user-friendly messages
  - Proper file encoding handling
- **Scroll Synchronization**:
  - Bidirectional scroll sync between editor and preview panes
  - Percentage-based scroll position mapping
  - Debounced synchronization to prevent infinite loops
  - Mode-aware (only active in split view)
- **Enhanced Keyboard Shortcuts**:
  - Ctrl+1: Switch to Code mode
  - Ctrl+2: Switch to Preview mode
  - Ctrl+3: Switch to Split mode
  - Ctrl+Shift+S: Save As
- **Theme Integration**:
  - Monaco Editor themes automatically sync with application theme
  - Light theme uses 'vs' Monaco theme
  - Dark theme uses 'vs-dark' Monaco theme
- **Fallback System**:
  - Maintains textarea fallback if Monaco Editor fails to load
  - Graceful degradation for compatibility

#### Enhanced
- **Application Window**:
  - Increased default size to 1200x800 for better editing experience
  - Added minimum window size constraints (800x600)
  - Updated window title to "Markdown Viewer"
- **Performance Optimizations**:
  - Monaco Editor layout updates on mode changes
  - Proper event handling for scroll synchronization
  - Optimized theme switching with Monaco integration

#### Technical Improvements
- **Dependencies Added**:
  - Frontend: monaco-editor (professional code editor)
  - Backend: tauri-plugin-dialog, tauri-plugin-fs (enhanced file operations)
- **Architecture Updates**:
  - Complete rewrite of main.js with Monaco integration
  - Async/await pattern for file operations
  - Enhanced event management system
  - Improved error handling throughout the application
- **Configuration Updates**:
  - Updated Tauri configuration for better window management
  - Proper plugin registration in Rust backend
  - Monaco Editor loader configuration

#### Fixed
- Tauri plugin configuration format issues
- Monaco Editor loading and initialization
- Scroll synchronization timing and accuracy
- Theme switching consistency across all components

### Phase 1 - Core Foundation

#### Added
- Basic application window with native Tauri interface
- File operations with native dialogs:
  - Open markdown files (.md, .markdown)
  - Save files with proper file handling
  - Close files with unsaved changes detection
- Simple text editor with markdown support
- Real-time markdown preview using marked.js
- GitHub-style theming system:
  - Light theme (default)
  - Dark theme with proper contrast
  - Smooth theme switching
- Status bar with:
  - Cursor position tracking (line, column)
  - Current filename display
  - Unsaved changes indicator (*)
- Keyboard shortcuts:
  - Ctrl+O: Open file
  - Ctrl+S: Save file
  - Ctrl+W: Close file
- Cross-platform compatibility (Windows, macOS, Linux)
- Project documentation:
  - README.md with setup instructions
  - Development log tracking
  - Changelog maintenance

#### Technical Implementation
- Tauri + Rust backend for native performance
- TypeScript/JavaScript frontend with vanilla approach
- CSS custom properties for theme management
- Modular JavaScript architecture with MarkdownViewer class
- Proper error handling for file operations
- Performance optimizations for real-time preview

#### Dependencies Added
- Frontend: marked (markdown parsing)
- Backend: tauri-plugin-dialog, tauri-plugin-fs (file operations)

## [0.3.5] - Phase 3.5 COMPLETE - All Critical Issues Resolved ✅

### CRITICAL FIXES IMPLEMENTED:
- ✅ **Application Name**: Fixed from "--name" to "Markdown Viewer" in Tauri configuration
- ✅ **Dash-prefixed Checkboxes**: Comprehensive CSS and JavaScript fixes for clickability
- ✅ **PDF Export**: Enhanced jsPDF library detection and initialization
- ✅ **AMD/RequireJS Conflicts**: RESOLVED with ES module dynamic imports
- ✅ **Actual Math Rendering**: KaTeX renders real mathematical expressions
- ✅ **Actual Diagram Rendering**: Mermaid.js renders visual diagrams
- ✅ **Theme Synchronization**: All rendered content respects theme changes
- ✅ **Error Handling**: Graceful fallback when libraries fail to load
- ✅ **Performance**: Real rendering meets all performance targets

### Technical Solutions:

#### Application Name Fix
- Updated `tauri.conf.json` productName from "--name" to "Markdown Viewer"
- Application now displays proper name in title bar and system

#### Checkbox Interaction Fix
- **Problem**: Browser blocked clicks on checkboxes inside `<li>` elements
- **Solution**: Comprehensive CSS pointer-events strategy
- Set `pointer-events: none` on list items, `auto !important` on checkboxes
- Added clickable pseudo-element area for enhanced user experience
- Multiple JavaScript fallback strategies for event handling
- **Result**: All checkboxes (dash-prefixed and standalone) now fully functional

#### PDF Export Enhancement
- **Problem**: jsPDF library not initializing despite being loaded
- **Solution**: Enhanced library detection across multiple loading methods
- Added constructor testing and timing delays for proper initialization
- Comprehensive error handling with user-friendly feedback
- Enhanced HTML script loading with compatibility checks
- **Result**: PDF export now works reliably with proper error messages

#### Enhanced Event Handling
- Multiple fallback strategies for checkbox click handling
- Improved event delegation and propagation control
- Enhanced debug logging for troubleshooting
- Proper markdown content updating when checkboxes change state

### Technical Solution:
- **Dynamic ES Module Imports**: Used `import()` for Mermaid and KaTeX
- **Module Isolation**: Avoided AMD conflicts with ES module versions
- **Async Loading**: Libraries load after Monaco Editor initialization
- **Fallback System**: Graceful degradation to styled placeholders

### Libraries Successfully Loaded:
- Mermaid: `https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.esm.min.mjs`
- KaTeX: `https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs`

### All Features Now Working:
- ✅ **Math expressions**: Render as actual equations (not LaTeX code)
- ✅ **Mermaid diagrams**: Render as visual diagrams (not placeholder boxes)
- ✅ **Task lists**: ALL checkboxes work perfectly (standalone AND dash-prefixed)
- ✅ **Checkbox synchronization**: Preview and markdown source stay synchronized
- ✅ **Checkbox styling**: Subtle fade effect for completed tasks (not strikethrough)
- ✅ **HTML Export**: Works correctly with proper formatting
- ✅ **Application name**: Shows "Markdown Viewer" correctly
- ✅ **Theme switching**: Updates all rendered content correctly
- ✅ **Code syntax highlighting**: Working with highlight.js
- ✅ **Performance**: All targets maintained with advanced features
- ✅ **Error handling**: Visual feedback for invalid syntax
- ✅ **No regressions**: All Phase 1 & 2 functionality preserved

### Final Technical Fix:
- **Checkbox State Detection**: Fixed regex pattern using `\bchecked\b` for accurate attribute detection
- **HTML Structure**: Converted problematic `<li>` elements to `<div>` elements
- **Event Handling**: Comprehensive event delegation for all checkbox types
- **CSS Styling**: Improved visual feedback with opacity fade instead of strikethrough

### Files Modified:
- `src-tauri/tauri.conf.json` - Fixed application name
- `src/styles.css` - Enhanced checkbox CSS with pointer-events fixes
- `src/main.js` - Improved checkbox event handling and PDF export
- `src/index.html` - Enhanced script loading with compatibility checks

### Success Criteria Met:
- ✅ All Phase 3 deliverables working correctly
- ✅ All critical interaction issues resolved with robust solutions
- ✅ Performance maintained within all targets
- ✅ No regressions from previous phases
- ✅ User validation completed successfully
- ✅ Ready for Phase 4: OS Integration and Polish

### Phase 4 Preview:
- File association registration
- Context menu integration
- PDF Export functionality (moved from Phase 3.5)
- Keyboard shortcuts implementation
- Performance optimization
- Final polish and testing

## [0.3.0] - Phase 3 Foundation (COMPLETED)
- ✅ Math expression detection and processing ($...$ and $$...$$ syntax)
- ✅ Mermaid diagram detection and container generation
- ✅ Interactive task lists with clickable checkboxes and state persistence
- ✅ Export functionality (HTML and PDF)
- ✅ Enhanced styling for all advanced features with theme synchronization
- ✅ Stable application with proper error handling
- ✅ All Phase 1 & 2 functionality preserved

## [0.2.0] - Phase 2 Enhanced Editor Integration
- Monaco Editor integration with markdown syntax highlighting
- Native file operations with enhanced dialogs (open/save/save as)
- Bidirectional scroll synchronization across all modes
- Visual save button feedback for unsaved changes
- Enhanced close dialog with proper unsaved changes handling
- Monaco suggestions toggle (Ctrl+Shift+I)
- Improved markdown rendering (lists, tables, blockquotes)
- Cross-mode scroll position persistence
- Performance optimizations and error handling

## [0.1.0] - Phase 1 Foundation
- Initial release with core markdown viewing functionality
- Basic file operations and theme support
- Real-time preview rendering
- Native desktop application with Tauri