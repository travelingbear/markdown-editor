# Changelog

All notable changes to the Markdown Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-02

### Fixed
- **Linux Application Category**: Changed from DeveloperTool to Productivity for proper OS recognition
- **Linux Icon Display**: Fixed icon configuration to use correct paths for Linux builds
- **Application Name**: Updated from markdown-viewer to markdown-editor throughout codebase
- **File Associations**: Simplified command line argument parsing for reliable file associations
- **Desktop Integration**: Created proper desktop entry for Linux system integration
- **Anchor Links**: Added internal anchor navigation for markdown headers
- **Tauri API Calls**: Fixed startup file handling for proper file association support

### Enhanced
- **Cross-Platform File Associations**: Improved reliability across Windows, macOS, and Linux
- **Desktop Entry**: Added proper MIME type associations and application categories
- **Icon System**: Multiple icon sizes for better Linux compatibility
- **Internal Navigation**: Smooth scrolling to anchor links within documents

### Technical
- **Package Name**: Consistent markdown-editor naming across all platforms
- **Desktop File**: Proper Linux desktop integration with correct categories
- **Command Line**: Simplified argument parsing for better file association handling
- **API Compatibility**: Updated Tauri v2 API calls for startup file functionality

## [2.0.0] - 2024-12-31

### Added
- **Distraction-Free Mode**: F11 toggle for immersive editing/reading experience
- **Centered A4 Layout**: Configurable page layouts (A4, Letter, Legal) with margins
- **Enhanced Settings Window**: Visual controls with organized sections and performance stats
- **File History**: Welcome screen shows last 3 opened files with clear history option
- **Markdown Formatting Toolbar**: Quick formatting buttons for code mode
- **Comprehensive Keyboard Shortcuts**: Application and editor shortcuts with cross-platform support
- **Help Modal**: F1 accessible help with shortcuts and feature explanations
- **About Modal**: Application information, version, credits, and acknowledgments
- **Splash Screen**: Optional startup screen with custom image and settings toggle
- **Professional Branding**: Updated to "Markdown Viewer" with consistent naming
- **MIT License**: Legal compliance with proper license file and metadata
- **Export Dropdown**: Consolidated HTML/PDF export in single dropdown button
- **Save Dropdown**: Combined Save/Save As functionality
- **Distraction-Free Button**: Dedicated toolbar button for mode toggle

### Enhanced
- **Monaco Editor Integration**: Improved keyboard shortcuts (Ctrl+B/I, Ctrl+Shift+1-3)
- **Cross-Platform Shortcuts**: Automatic Cmd/Ctrl key mapping for macOS/Windows/Linux
- **Settings Persistence**: All new settings saved and restored across sessions
- **Performance Monitoring**: Real-time performance stats in settings window
- **Theme Synchronization**: Perfect light/dark theme consistency across all new features
- **Responsive Design**: All new components adapt to different screen sizes

### Fixed
- **Text Selection**: Improved formatting toolbar compatibility with Monaco Editor
- **Auto-List Continuation**: Smart list formatting for bullets, numbers, and tasks
- **Modal Behavior**: Proper focus management and ESC key handling
- **Keyboard Conflicts**: Resolved shortcut conflicts between application and editor

### Technical
- **Version**: Updated to 2.0.0 across all configuration files
- **Build System**: Maintained cross-platform distribution (MSI, NSIS, DMG, AppImage, DEB)
- **Bundle Size**: Optimized to maintain ~12.5MB application size
- **Performance**: All enhancements maintain < 2s startup and < 100ms mode switching

## [1.0.0] - 2024-11-30

### Added
- **Three-Mode Interface**: Code, Preview, and Split view modes
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Real-Time Preview**: GitHub-flavored markdown with live updates
- **Advanced Rendering**: KaTeX math expressions and Mermaid diagrams
- **Interactive Task Lists**: Clickable checkboxes with state persistence
- **GitHub-Style Themes**: Light and dark themes with synchronization
- **Drag & Drop Support**: Native file drag-drop with absolute path support
- **File Operations**: Open, Save, Save As, New file with native dialogs
- **Export Options**: HTML export and PDF printing capabilities
- **Keyboard Shortcuts**: Essential shortcuts for file operations and mode switching
- **Image Support**: PNG, JPG, GIF, WebP, SVG with local and remote support
- **File Associations**: Double-click .md files to open in application
- **Window Management**: Proper close confirmation for unsaved changes
- **Settings Persistence**: Theme, mode, and editor preferences saved
- **Performance Monitoring**: Built-in performance tracking and optimization
- **Cross-Platform Distribution**: MSI, NSIS, DMG, AppImage, DEB packages

### Technical
- **Frontend**: Monaco Editor + Marked.js + KaTeX + Mermaid + Highlight.js
- **Backend**: Rust/Tauri for native file operations and system integration
- **Bundle Size**: < 50MB across all platforms
- **Security**: Sandboxed file access with CSP protection
- **Performance**: < 2s startup, < 500ms file operations, < 100ms mode switching

## Development Phases

### Phase 1: Core Foundation ✅
- Basic three-mode interface
- File operations and drag-drop
- Monaco Editor integration

### Phase 2: Enhanced Editor ✅
- Real-time preview rendering
- Theme system implementation
- Performance optimization

### Phase 3: Advanced Features ✅
- KaTeX math rendering
- Mermaid diagram support
- Interactive task lists

### Phase 3.5: Critical Rendering Issues ✅
- Image and GIF support
- Path resolution fixes
- Rendering stability

### Phase 4: Polish & OS Integration ✅
- File associations
- Window management
- Export functionality

### Phase 5: Final Polish & Enhancement ✅
- Performance monitoring
- Error handling
- User experience improvements

### Phase 5.1: Native Drag-Drop Absolute Paths ✅
- Enhanced drag-drop functionality
- Absolute path support
- Cross-platform compatibility

### Phase 6: Distribution & Release ✅
- Cross-platform build system
- Installer packages
- Release automation

### Phase 7: UI/UX Enhancements ✅
- Distraction-free mode
- Centered A4 layout
- Enhanced settings
- File history
- Markdown toolbar

### Phase 8: Keyboard Shortcuts ✅
- Application shortcuts
- Editor shortcuts
- Cross-platform support

### Phase 8.5: Help, About & Splash Screen ✅
- Help modal with shortcuts
- About modal with credits
- Optional splash screen

### Phase 9: Branding & Legal ✅
- Professional branding
- MIT license implementation
- Icon and favicon updates