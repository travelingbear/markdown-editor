# Markdown Native OS Viewer - Complete Project Plan

## 🎯 Project Idea & Vision

**Core Concept**: A native desktop markdown viewer that provides a seamless, GitHub-style markdown editing and preview experience with OS-level integration.

**Problem Solved**: Most markdown editors are either web-based (slow, limited OS integration) or lack modern features like syntax highlighting, diagram rendering, and dual-pane editing. This app bridges that gap.

**Target Users**: Developers, technical writers, documentation creators, and anyone who works with markdown files regularly.

## 📋 Project Scope

### Primary Scope
- **Platform**: Cross-platform desktop application (Windows, macOS, Linux)
- **Technology Stack**: Native desktop framework with web technologies for UI
- **File Support**: Markdown files (.md, .markdown) with local asset support
- **Integration**: OS file associations, context menus, and native file dialogs

### Out of Scope
- Cloud synchronization
- Collaborative editing
- Plugin system
- Mobile versions
- Git integration

## 🚀 Core Features

### 1. **Multi-Mode Interface**
- **Code Mode**: Full-screen markdown editor with syntax highlighting
- **Preview Mode**: Full-screen rendered markdown display
- **Split View Mode**: Side-by-side editor and preview with scroll synchronization

### 2. **Advanced Code Editor**
- Monaco Editor integration for professional editing experience
- Markdown syntax highlighting with proper tokenization
- Line numbers, code folding, and bracket matching
- Auto-completion for markdown syntax
- Find/Replace for code mode
- Markdown toolbar in code mode with the following options: H1, H2, H3, P, B, I, U, Tables insertion, Images insertion, Diagrams insertion
- Vim/Emacs key bindings support (optional)

### 3. **Rich Preview Rendering**
- GitHub-flavored markdown support
- Syntax highlighting for code blocks (JavaScript, Python, HTML, CSS, etc.)
- Mathematical expressions rendering (LaTeX/MathJax)
- Mermaid.js diagram support (flowcharts, sequence diagrams, etc.)
- Table rendering with proper styling
- Task list support with checkboxes
- Emoji support

### 4. **Theme System**
- Light and dark themes
- GitHub-style light theme (default)
- Dark theme with proper contrast
- Theme persistence across sessions
- Synchronized themes between editor and preview
- Custom CSS injection support

### 5. **File Operations**
- Native file dialogs for open/save operations
- Recent files list
- Auto-save functionality
- Unsaved changes detection and warnings
- File watching for external changes
- Drag-and-drop file support

### 6. **Asset Management**
- Local image support with relative path resolution
- GIF and video embedding
- Asset preview in editor (hover tooltips)
- Automatic asset path correction
- Base64 image encoding option

### 7. **OS Integration**
- File association registration (.md files open with the app)
- Context menu integration ("Open with Markdown Viewer")
- System tray integration (optional)
- Native window controls and menus
- Keyboard shortcuts following OS conventions

### 8. **Export & Print**
- Export to HTML with embedded CSS
- Export to PDF with proper formatting
- Print support with page breaks
- Copy rendered HTML to clipboard

## 🔧 Technical Architecture

### Recommended Technology Stack

#### Option 1: Tauri + Rust + Web Frontend
```
Backend: Rust (Tauri)
Frontend: HTML/CSS/JavaScript + Monaco Editor
Advantages: Small bundle size, native performance, secure
```

#### Option 2: Flutter Desktop
```
Language: Dart
UI: Flutter widgets
Advantages: Single codebase, native performance, rich UI
```

#### Option 3: .NET MAUI
```
Language: C#
UI: XAML + WebView for editor
Advantages: Native performance, excellent Windows integration
```

#### Option 4: Go + Wails
```
Backend: Go
Frontend: HTML/CSS/JavaScript
Advantages: Simple deployment, good performance
```

### Core Components

#### 1. **Main Application**
- Window management
- Menu system
- File operations
- Settings management
- Theme coordination

#### 2. **Editor Component**
- Monaco Editor integration
- Syntax highlighting
- Auto-completion
- Key binding management

#### 3. **Preview Engine**
- Markdown parsing (markdown-it or similar)
- Syntax highlighting (highlight.js)
- Mermaid diagram rendering
- Math expression rendering
- HTML generation with CSS injection

#### 4. **Theme Manager**
- CSS generation for light/dark themes
- Theme switching logic
- Persistence layer
- Editor theme synchronization

#### 5. **File Manager**
- File I/O operations
- Path resolution
- Asset management
- Recent files tracking

## 📁 Project Structure

```
markdown-viewer/
├── src/
│   ├── main/                 # Main application logic
│   │   ├── app.rs/cs/go     # Main application entry
│   │   ├── file_manager.rs  # File operations
│   │   ├── theme_manager.rs # Theme system
│   │   └── settings.rs      # Configuration
│   ├── ui/                  # User interface
│   │   ├── editor/          # Monaco Editor integration
│   │   ├── preview/         # Preview rendering
│   │   ├── toolbar/         # Application toolbar
│   │   └── dialogs/         # File dialogs, settings
│   ├── markdown/            # Markdown processing
│   │   ├── parser.rs        # Markdown parsing
│   │   ├── renderer.rs      # HTML generation
│   │   └── highlighter.rs   # Syntax highlighting
│   └── assets/              # Static assets
│       ├── themes/          # CSS themes
│       ├── icons/           # Application icons
│       └── fonts/           # Custom fonts
├── tests/                   # Unit and integration tests
├── docs/                    # Documentation
├── build/                   # Build configuration
└── dist/                    # Distribution files
```

## 🎨 User Interface Design

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ File  Edit  View  Tools  Help                   [- □ ×] │
├─────────────────────────────────────────────────────────┤
│📁 Open 💾 Save ❌ Close │ Code │ Preview │ Split │ 🌙 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Editor Pane]              │  [Preview Pane]           │
│                             │                           │
│  # Markdown Content         │  Rendered HTML            │
│  - List item                │  • List item              │
│  ```javascript              │  [Highlighted Code]       │
│  const x = 1;               │                           │
│  ```                        │                           │
│                             │                           │
├─────────────────────────────────────────────────────────┤
│ Line 1, Col 1              │              filename.md   │
└─────────────────────────────────────────────────────────┘
```

### Key UI Elements
- **Toolbar**: File operations, mode switching, theme toggle
- **Editor Pane**: Monaco Editor with markdown syntax highlighting
- **Preview Pane**: Rendered markdown with GitHub styling
- **Status Bar**: Cursor position, file info, word count
- **Splitter**: Resizable divider between panes

## ⚡ Performance Requirements

### Startup Performance
- Application launch: < 2 seconds
- File opening: < 500ms for files up to 10MB
- Mode switching: < 100ms

### Runtime Performance
- Real-time preview updates with < 300ms debounce
- Smooth scrolling synchronization
- Memory usage < 200MB for typical files
- Support files up to 50MB

### Responsiveness
- UI interactions: < 50ms response time
- Theme switching: < 200ms
- File operations: Progress indicators for > 1s operations

## 🔒 Security Considerations

### File Access
- Sandboxed file access through native APIs
- No arbitrary code execution
- Safe HTML rendering (XSS prevention)

### Asset Handling
- Validate image file types
- Prevent path traversal attacks
- Sanitize user input

## 🧪 Testing Strategy

### Unit Tests
- Markdown parsing accuracy
- Theme switching logic
- File operations
- Settings persistence

### Integration Tests
- Editor-preview synchronization
- File association handling
- Cross-platform compatibility

### User Acceptance Tests
- Complete user workflows
- Performance benchmarks
- Accessibility compliance

## 📦 Distribution Plan

### Package Formats
- **Windows**: MSI installer + portable executable
- **macOS**: DMG package + App Store submission
- **Linux**: AppImage + Flatpak + Snap

### Installation Features
- File association registration
- Context menu integration
- Desktop shortcut creation
- Automatic updates (optional)

## 🎯 Success Metrics

### Functionality
- ✅ All three modes work seamlessly
- ✅ Theme synchronization is perfect
- ✅ File operations are reliable
- ✅ Preview rendering is accurate

### Performance
- ✅ Startup time < 2 seconds
- ✅ File opening < 500ms
- ✅ Memory usage < 200MB
- ✅ Smooth real-time preview

### User Experience
- ✅ Intuitive interface
- ✅ Keyboard shortcuts work
- ✅ No crashes or data loss
- ✅ Cross-platform consistency

## 🚧 Development Phases

### Phase 1: Core Foundation (2-3 weeks)
**Deliverables:**
- Basic application window with native menus
- File open/save operations with native dialogs
- Simple text editor (textarea fallback)
- Basic markdown preview rendering
- Project documentation setup

**Tests Required:**
- Unit tests for file operations
- Basic UI interaction tests
- Cross-platform window creation tests

**Documentation:**
- README.md with setup instructions
- DEVELOPMENT_LOG.md started
- Basic API documentation

**User Validation Required:**
- ✅ Application launches successfully on target OS
- ✅ File dialogs work correctly
- ✅ Basic text editing functions
- ✅ Simple markdown renders in preview
- ✅ Window resizing and basic UI interactions work

**🚦 CHECKPOINT: User must test, approve, AND commit changes before proceeding to Phase 2**

**Git Requirements:**
- ✅ All Phase 1 changes staged and committed
- ✅ Working on `feature/phase-1-foundation` branch
- ✅ Ready to merge to main after approval

---

### Phase 2: Enhanced Editor (2-3 weeks)
**Deliverables:**
- Monaco Editor integration
- Markdown syntax highlighting in editor
- Three-mode interface (Code, Preview, Split)
- Basic theme system (light/dark)
- Mode switching functionality

**Tests Required:**
- Monaco Editor loading and initialization tests
- Mode switching integration tests
- Theme switching tests
- Editor-preview synchronization tests

**Documentation:**
- Updated README with new features
- DEVELOPMENT_LOG.md updated with progress
- Architecture documentation for editor integration

**User Validation Required:**
- ✅ Monaco Editor loads with markdown syntax highlighting
- ✅ All three modes (Code, Preview, Split) work correctly
- ✅ Theme switching works in all modes
- ✅ No performance issues with editor integration
- ✅ UI remains responsive during mode switches

**🚦 CHECKPOINT: User must test, approve, AND commit changes before proceeding to Phase 3**

**Git Requirements:**
- ✅ All Phase 2 changes staged and committed
- ✅ Working on `feature/phase-2-editor` branch
- ✅ Ready to merge to main after approval

---

### Phase 3: Advanced Features (3-4 weeks)
**Deliverables:**
- Mermaid.js diagram rendering
- Math expression support (LaTeX/MathJax)
- Enhanced asset management (images, GIFs)
- Scroll synchronization between editor and preview
- Advanced markdown features (tables, task lists, emoji)

**Tests Required:**
- Mermaid diagram rendering tests
- Math expression parsing tests
- Asset loading and path resolution tests
- Scroll synchronization accuracy tests
- Complex markdown rendering tests

**Documentation:**
- Feature documentation for advanced capabilities
- DEVELOPMENT_LOG.md with technical decisions
- User guide for advanced features

**User Validation Required:**
- ✅ Mermaid diagrams render correctly in both themes
- ✅ Math expressions display properly
- ✅ Local images load with correct paths
- ✅ Scroll synchronization works smoothly
- ✅ All markdown features render as expected
- ✅ Performance remains acceptable with complex documents

**🚦 CHECKPOINT: User must test, approve, AND commit changes before proceeding to Phase 4**

**Git Requirements:**
- ✅ All Phase 3 changes staged and committed
- ✅ Working on `feature/phase-3-advanced` branch
- ✅ Ready to merge to main after approval

---

### Phase 3.5: Critical Rendering Issues (COMPLETE ✅)
**Status**: COMPLETE - All markdown rendering functionality working perfectly

**COMPLETED Deliverables**:
- ✅ **AMD/RequireJS Conflict Resolution**: ES module dynamic imports working
- ✅ **Actual Math Rendering**: KaTeX renders real mathematical expressions
- ✅ **Actual Diagram Rendering**: Mermaid.js renders visual diagrams
- ✅ **Standalone Checkbox Functionality**: Working and clickable
- ✅ **Code Syntax Highlighting**: highlight.js integration working
- ✅ **Theme Synchronization**: All rendered content respects theme changes
- ✅ **Scroll Jump Fix**: Improved behavior during typing
- ✅ **Application Name**: Fixed to show "Markdown Viewer"
- ✅ **HTML Export**: Working correctly

**ALL ISSUES RESOLVED ✅**:
- ✅ **Dash-prefixed Checkbox Interactions**: ALL checkboxes now work perfectly with markdown sync
- ✅ **Checkbox State Synchronization**: Preview and markdown source stay synchronized
- ✅ **Checkbox Styling**: Improved visual feedback with fade effect
- ✅ **Event Handling**: Comprehensive event delegation for all checkbox types

**Technical Solutions Implemented**:
- **HTML Structure Fix**: Converted `<li>` elements to `<div>` to avoid browser event blocking
- **State Detection Fix**: Fixed regex pattern for accurate checkbox attribute detection
- **CSS Improvements**: Enhanced styling with opacity fade for completed tasks
- **Event System**: Robust event handling for all checkbox interactions

**MOVED TO PHASE 4**:
- **PDF Export Functionality**: Complex library loading issues - moved to Phase 4 for dedicated resolution

**User Validation COMPLETE ✅**:
- ✅ Math expressions render correctly
- ✅ Mermaid diagrams render correctly
- ✅ Standalone checkboxes work and update markdown
- ✅ Dash-prefixed checkboxes work and update markdown
- ✅ HTML export works
- ✅ Application shows correct name
- ✅ All functionality tested and approved

**Git Status**: Ready for commit on `feature/phase-3-advanced-features` branch

---

### Phase 4: Polish & OS Integration (COMPLETE ✅)
**Status**: COMPLETE - All OS integration and polish features implemented

**COMPLETED Deliverables:**
- ✅ **File Association Registration**: Working correctly - double-click opens and loads files
- ✅ **Enhanced Keyboard Shortcuts**: Complete OS-compliant system implemented
- ✅ **PDF Export Resolution**: Browser-based implementation with mode-specific behavior
- ✅ **Performance Optimization**: Complete benchmarking and monitoring system
- ✅ **Comprehensive Error Handling**: Enhanced recovery and user feedback
- ✅ **Settings System**: Complete preferences management with persistence
- ✅ **UI/UX Polish**: Professional button states and welcome page

#### User-Requested Features (COMPLETE ✅):
- ✅ **Code Syntax Highlighting Fix**: Working in preview mode
- ✅ **Welcome/Front Page**: Beautiful landing page when no file is open
- ✅ **New File Button**: Create new markdown file functionality (Ctrl+N)
- ✅ **Enhanced Save As**: Improved workflow and user experience

**All Tests PASSED:**
- ✅ File association tests
- ✅ Keyboard shortcut tests
- ✅ Performance benchmarking
- ✅ Error handling tests
- ✅ Export functionality tests

**Documentation COMPLETE:**
- ✅ Complete user manual
- ✅ Installation guide
- ✅ Troubleshooting guide
- ✅ CHANGELOG.md started

**User Validation COMPLETE ✅:**
- ✅ File associations work (double-click .md files)
- ✅ All keyboard shortcuts work as expected
- ✅ Application meets performance requirements
- ✅ Error messages are helpful and user-friendly
- ✅ Export features work correctly
- ✅ Welcome page and new file functionality approved

**Git Status**: All Phase 4 changes committed on `feature/phase-4-polish-integration` branch

---

### Phase 5: Final Polish & Enhancement (COMPLETE ✅)
**Status**: COMPLETE - All final polish and enhancement features implemented

**COMPLETED Deliverables:**
- ✅ **Image & GIF Support**: All formats working correctly (PNG, JPG, GIF, WebP, SVG)
- ✅ **Drag-Drop Functionality**: Working with documented limitations
- ✅ **Window Close Handler**: Proper confirmation dialogs for unsaved changes
- ✅ **Save Functionality**: Stable and crash-free operation
- ✅ **Visual Feedback**: Enhanced user experience with proper indicators
- ✅ **Error Handling**: Comprehensive error recovery and user feedback

**Technical Achievements:**
- ✅ **CSP Configuration**: Updated for external image support
- ✅ **Rust Backend**: Image conversion functions implemented
- ✅ **JavaScript Processing**: Complete image processing pipeline
- ✅ **Tauri Permissions**: Proper window management and file system permissions
- ✅ **Browser Security Handling**: Graceful handling of drag-drop limitations

**All Tests PASSED:**
- ✅ Image format compatibility tests
- ✅ Drag-drop functionality tests
- ✅ Window close handler tests
- ✅ Save functionality tests
- ✅ Error handling tests

**User Validation COMPLETE ✅:**
- ✅ All image formats display correctly
- ✅ Drag-drop works as expected
- ✅ Window close handler shows proper confirmation dialogs
- ✅ Save functionality works without crashes
- ✅ All core functionality preserved
- ✅ Ready for Phase 6 (Distribution)

**Future Enhancement Documented:**
- **Native Drag-Drop**: Implement Tauri native drag-drop for absolute file paths
- **Goal**: Allow drag-dropped files to save to original location
- **Current Limitation**: Browser security prevents absolute path access
- **Solution**: Enable `dragDropEnabled: true` and use Tauri file-drop events
- **Priority**: Low - current functionality is acceptable

**Git Status**: All Phase 5 changes committed on `feature/phase-5-final-polish` branch

---

### Phase 6: Distribution & Release (2-3 weeks)
**Deliverables:**
- Cross-platform build system
- Installation packages (MSI, DMG, AppImage)
- Code signing and notarization
- Release preparation
- Final testing and bug fixes

**Tests Required:**
- Cross-platform compatibility tests
- Installation/uninstallation tests
- Signed package verification
- End-to-end user workflow tests
- Security and performance audits

**Documentation:**
- Final README.md with installation instructions
- Complete CHANGELOG.md
- Release notes
- Distribution documentation

**User Validation Required:**
- ✅ Installation packages work on all target platforms
- ✅ Application installs and uninstalls cleanly
- ✅ All features work in distributed version
- ✅ Performance meets requirements in production build
- ✅ Documentation is complete and accurate
- ✅ Ready for public release

**🚦 FINAL CHECKPOINT: User approval for release**

**Git Requirements:**
- ✅ All Phase 6 changes staged and committed
- ✅ Working on `feature/phase-6-distribution` branch
- ✅ Ready to merge to main and tag release
- ✅ Main branch ready for production release

---

### Phase 7: UI/UX Enhancements (3-4 weeks)
**Deliverables:**
- **Recent Files List**: Last 3 opened documents on welcome page with clear history button
- **Markdown Toolbar**: Common elements toolbar (H1-H3, Bold, Italic, Lists, Links, Images, Tables)
- **Distraction-Free Modes**: Clean code and preview modes without toolbars
- **Enhanced Keyboard Shortcuts**: Complete shortcut system for all toolbar actions
- **Improved File Management**: Better file state tracking and recent files persistence

**Tests Required:**
- Recent files functionality tests
- Toolbar action tests
- Distraction-free mode tests
- Keyboard shortcut integration tests
- File history persistence tests

**Documentation:**
- Updated user manual with new features
- Keyboard shortcuts reference
- UI/UX design documentation

**User Validation Required:**
- ✅ Recent files list works correctly
- ✅ Markdown toolbar actions function properly
- ✅ Distraction-free modes provide clean experience
- ✅ All keyboard shortcuts work as expected
- ✅ File history persists across sessions

**🚦 CHECKPOINT: User must test, approve, AND commit changes before proceeding to Phase 7**

---

### Phase 8: WYSIWYG Mode (4-6 weeks)
**Deliverables:**
- **WYSIWYG Editor**: What-You-See-Is-What-You-Get markdown editing mode
- **Rich Text Editing**: Direct editing of formatted text with markdown generation
- **Inline Editing**: Edit headings, lists, and text directly in preview mode
- **Format Preservation**: Maintain markdown structure while providing visual editing
- **Mode Switching**: Seamless switching between WYSIWYG and code modes
- **Advanced Formatting**: Support for tables, links, images in WYSIWYG mode

**Tests Required:**
- WYSIWYG editing functionality tests
- Markdown generation accuracy tests
- Mode switching integration tests
- Format preservation tests
- Complex document editing tests

**Documentation:**
- WYSIWYG mode user guide
- Technical architecture documentation
- Feature comparison documentation

**User Validation Required:**
- ✅ WYSIWYG mode provides intuitive editing experience
- ✅ Generated markdown is clean and accurate
- ✅ Mode switching works seamlessly
- ✅ All formatting options work correctly
- ✅ Complex documents edit properly

**🚦 CHECKPOINT: User must test, approve, AND commit changes before proceeding to Phase 9**

**Note**: This is a major phase that may require breaking into sub-phases based on complexity.

---

## 📚 Documentation Requirements

### Core Documentation Files

#### README.md
- Project overview and features
- Installation instructions
- Quick start guide
- Screenshots and demos
- Development setup
- Contributing guidelines
- License information

#### CHANGELOG.md
- Version history
- Feature additions
- Bug fixes
- Breaking changes
- Migration guides

#### DEVELOPMENT_LOG.md
- Daily development progress
- Technical decisions and rationale
- Challenges faced and solutions
- Performance benchmarks
- Testing results
- User feedback integration

### Additional Documentation
- API documentation
- Architecture diagrams
- User manual
- Troubleshooting guide
- Build and deployment guide

## 💡 Future Enhancements

### Version 2.0 Features
- Plugin system for custom renderers
- Live collaboration support
- Git integration
- Custom theme creation
- Table editor
- Outline/TOC panel
- Find and replace
- Multi-tab support

### Advanced Features
- Presentation mode
- Document outline navigation
- Live word count and reading time
- Markdown linting
- Custom CSS injection
- Export to multiple formats

---

## 🎉 Project Success Definition

**The project is considered successful when:**

1. **Core Functionality**: All three modes (Code, Preview, Split) work flawlessly with perfect theme synchronization
2. **Performance**: Application starts quickly, handles large files smoothly, and provides real-time preview updates
3. **User Experience**: Interface is intuitive, keyboard shortcuts work, and the app feels native on each platform
4. **Reliability**: No crashes, no data loss, and consistent behavior across different file types and sizes
5. **Distribution**: Easy installation with proper OS integration (file associations, context menus)

**Target Timeline**: 12-15 weeks from start to first stable release (including validation checkpoints)

**Validation Process**: Each phase requires explicit user approval AND git commit before proceeding. AI assistant will:
1. Create feature branch for the phase
2. Complete all deliverables and tests
3. Update documentation
4. Stage all changes (but DO NOT commit)
5. Request user validation and testing
6. Wait for user approval
7. Commit changes after approval
8. Merge to main (if approved)
9. Start next phase on new feature branch

**Git Workflow Rules:**
- ⚠️ **Never work directly on main branch**
- ⚠️ **Never commit without user approval**
- ⚠️ **Always use feature branches for new phases**
- ⚠️ **Only merge to main after successful user testing**

**Recommended Starting Point**: Choose Tauri + Rust for optimal performance and small bundle size, or Flutter Desktop for rapid development and rich UI capabilities.

### Phase 5.1: Native Drag-Drop Absolute Paths (COMPLETE ✅)

**Status**: COMPLETE ✅ - Native drag-drop with absolute paths implemented
**Branch**: `feature/native-drag-drop-absolute-paths`

#### Deliverables COMPLETE:
- ✅ **Native Tauri Drag-Drop**: Implemented `tauri://drag-drop` event with absolute paths
- ✅ **Code Mode Enhancement**: Inserts full file paths like `C:\Users\...\file.md`
- ✅ **Welcome Screen**: Opens files with full save functionality
- ✅ **Image Rendering Fix**: Resolved marked.js renderer object issue
- ✅ **Save State Fix**: Eliminated false dirty marking on file open

#### Technical Achievements:
- **Configuration**: `dragDropEnabled: true` enables native events
- **Event Handling**: `tauri://drag-drop` provides `event.payload.paths` array
- **CSP Enhancement**: Added `file:` protocol for local image support
- **Renderer Fix**: Proper href extraction from marked.js token objects
- **State Management**: `isLoadingFile` flag prevents false dirty marking

#### User Validation COMPLETE ✅:
- ✅ Absolute paths inserted in code mode
- ✅ File opening via drag-drop works correctly
- ✅ Images render properly (local and remote)
- ✅ No false dirty state on file open
- ✅ All Phase 5 functionality preserved

**Git Status**: Ready for user approval and commit to main branch

---