# Changelog

All notable changes to the Markdown Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.3] - 2025-01-02

### Fixed
- **Save Cancellation**: Fixed issue where canceling save dialog would lose document changes
- **File Operations**: Improved handling of save cancellation to preserve user content
- **Window Close**: Enhanced quit application logic to respect save cancellation

## [2.2.2] - 2025-01-02

### Fixed
- **Print Functionality**: Added webview print permissions to enable Ctrl+P printing
- **Recent Files**: Fixed "Unknown error" when opening files from recent files list
- **File System Access**: Resolved permission issues for file operations across all platforms
- **Startup File Handling**: Fixed file association errors on application launch

### Enhanced
- **Print Margins**: Optimized print margins (top: 0.1in, sides: 0.15in) for better page utilization
- **Cross-Platform Icons**: Added proper ICNS icon support for macOS app bundling
- **File Permissions**: Comprehensive file system permissions for seamless file access

### Technical
- **Tauri v2 Permissions**: Added complete permission set for webview, dialogs, file operations, and window controls
- **Icon Generation**: Automated ICNS creation from PNG source with all required resolutions
- **Permission Scopes**: Configured unrestricted file access for recent files and file associations

## [2.2.1] - 2025-01-02

### Fixed
- **Retro Startup Sound**: Fixed audio playback on Linux using Web Audio API instead of HTML5 Audio element
- **Audio Timing**: Startup sound now only plays when application starts in retro mode, not when switching themes
- **Memory Usage Display**: Fixed "N/A" memory display on macOS/Linux with fallback to device memory info
- **Debug Cleanup**: Removed audio debugging console logs for cleaner production experience

### Enhanced
- **Settings Icons**: Updated Help and Settings buttons with clean SVG icons
- **Cross-Platform Audio**: Improved audio compatibility across Windows, macOS, and Linux
- **Error Handling**: Silent audio failures to prevent disrupting user experience

### Technical
- **Web Audio API**: Implemented AudioContext-based audio playback for better Linux compatibility
- **Memory Detection**: Added navigator.deviceMemory fallback for non-Chromium browsers
- **Audio Formats**: Added MP3 and OGG versions for broader format support

## [2.2.0] - 2025-01-02

### Added
- **Windows 3.1 Retro Theme**: Complete authentic retro theme with Windows 3.1 styling
  - Classic gray color scheme (#c0c0c0 backgrounds, #808080 borders)
  - MS Sans Serif font family for authentic look
  - 3D beveled buttons with proper inset/outset effects
  - Authentic scrollbar styling with classic arrow buttons
  - Windows logo icon and startup sound integration
  - Retro splash screen with Windows 3.1 aesthetic
- **Startup Sound System**: Audio feedback when entering retro mode
  - High-quality Windows 95 startup sound (windows95_startup_hifi.flac)
  - Configurable via settings with checkbox control
  - Automatic enablement on first retro mode activation
- **Theme Persistence**: Retro theme selection persists across application restarts
- **Enhanced Modal System**: Improved z-index management for layered interfaces

### Enhanced
- **Strikethrough Button**: Redesigned with clearer "abc xyz" text with line-through styling
- **Default Settings**: Changed application defaults for better user experience
  - Text suggestions now disabled by default
  - Markdown toolbar now enabled by default for new installations
- **Image Styling**: Refined image presentation in preview mode
  - Removed zoom scaling effect on hover for cleaner appearance
  - Changed image borders from 2px colored to 1px gray (#ddd)
- **Link Colors**: Improved retro theme link visibility
  - Default links: dark blue (#000080) for better contrast
  - Hover state: bright blue (#0000ff)
  - Visited links: purple (#800080) for authentic Windows 3.1 colors
- **Interface Consistency**: Unified styling across all retro theme elements
  - Consistent button sizing and spacing
  - Removed rounded corners for authentic square buttons
  - Proper font inheritance throughout interface

### Fixed
- **Monaco Editor Colors**: Resolved color conflicts in retro theme mode
- **Modal Font Issues**: Fixed font family inheritance in modal dialogs
- **Button Sizing**: Standardized button dimensions in retro theme
- **Splash Screen**: Adjusted background colors for retro theme compatibility
- **Z-index Conflicts**: Resolved layering issues between modals and interface elements

### Technical
- **Audio Integration**: Implemented HTML5 audio with proper error handling
- **CSS Architecture**: Organized retro theme styles with proper cascading
- **Settings Management**: Enhanced localStorage handling for theme persistence
- **Performance**: Optimized theme switching with minimal DOM manipulation
- **Cross-Platform**: Ensured retro theme works consistently across all platforms

## [2.1.4] - 2025-01-02

### Added
- **Collapsible Dropdown Toolbar**: Organized markdown toolbar with grouped dropdown menus
  - Headings dropdown (H1, H2, H3)
  - Links & Media dropdown (Link, Image, Table)
  - Lists dropdown (Bullet, Numbered, Task lists)
  - Code & Blocks dropdown (Inline Code, Code Block, Blockquote)
  - Text Alignment dropdown (Left, Center, Right, Justify)
- **Settings Button**: Added settings button to main toolbar for quick access
- **Enhanced Status Bar**: Moved font size controls to status bar (Code mode only)

### Enhanced
- **Toolbar Organization**: Reduced clutter by grouping related formatting tools
- **Icon Improvements**: Updated icons for better visual recognition (H, 🔗, ☑, <>, ≡)
- **Consistent Styling**: Unified button sizes and hover colors (#5e60e7) across toolbars
- **Native Tooltips**: Replaced custom CSS tooltips with native title attributes for better performance
- **Status Bar Alignment**: Fixed horizontal alignment consistency between font size and zoom controls

### Fixed
- **Dropdown Z-index**: Resolved dropdown menus appearing behind Monaco editor
- **Button Consistency**: Ensured all toolbar buttons have consistent vertical sizing
- **Text Alignment**: Align-left now properly removes div wrappers from selected text
- **Toolbar Spacing**: Optimized separator placement for logical grouping

### Technical
- **Dropdown Management**: Added JavaScript methods for dropdown state management
- **CSS Optimization**: Improved dropdown positioning and responsive design
- **Performance**: Reduced code complexity by using native browser features

## [2.1.3] - 2025-01-02

### Fixed
- **Zoom Controls Visibility**: Zoom controls now only appear in Preview mode when a document is loaded (not on welcome screen)
- **Zoom Centering**: Fixed zoom behavior to anchor to left when centered layout is disabled
- **Scrollbar Issues**: Resolved double vertical scrollbar issue when zooming in preview mode

### Enhanced
- **Horizontal Scrolling**: Added horizontal scrollbar support when zoomed content extends beyond viewport
- **Zoom Transform Origin**: Improved zoom centering behavior based on layout settings

## [2.1.2] - 2025-01-02

### Added
- **Font Size Controls**: Interactive font size adjustment (10px-24px) in markdown toolbar
- **Preview Zoom**: Zoom controls for Preview mode (50%-300%) with keyboard shortcuts (Ctrl+=, Ctrl+-, Ctrl+0)
- **Undo/Redo Buttons**: Quick access undo/redo buttons in markdown toolbar
- **Toolbar Size Controls**: Configurable toolbar sizing (Small/Medium/Large) for main and markdown toolbars

### Enhanced
- **Keyboard Shortcuts**: Added zoom shortcuts (Ctrl+=, Ctrl+-, Ctrl+0) for Preview mode
- **Help Documentation**: Updated help modal with new keyboard shortcuts
- **Performance**: Optimized zoom functionality using CSS custom properties
- **UI Accessibility**: Better control positioning and intuitive button placement

### Technical
- **Settings Persistence**: All new UI controls save preferences to localStorage
- **Responsive Design**: Toolbar size variations adapt to different screen sizes
- **Cross-Platform**: All new shortcuts work consistently across Windows/macOS/Linux

## [2.1.1] - 2025-01-02

### 🚀 Performance Optimization - Major Update
- **Startup Performance**: Improved from 3-4 seconds to **57.80ms** (98.5% improvement)
- **Mode Switching**: Optimized to **2.3-34.9ms** (3-43x better than 100ms target)
- **Preview Updates**: Enhanced to **14.30ms** (21x better than 300ms target)
- **Memory Management**: Implemented caching system with leak prevention
- **File Operations**: Recent files now load in <500ms with filename caching

### Enhanced
- **String Operations**: Added filename caching to reduce object creation
- **Event Cleanup**: Enhanced listener disposal to prevent memory leaks
- **Code Quality**: Extracted HTML templates and reduced code duplication
- **Error Handling**: Standardized error messages and file operations
- **Async Operations**: Promise-based approach for non-blocking UI
- **Scroll Performance**: requestAnimationFrame for smooth synchronization

### Fixed
- **PDF Export**: Fixed PDF export functionality by implementing direct browser print method
- **Print Styles**: Enhanced print CSS with proper page breaks, typography, and color preservation
- **CSP Compatibility**: Removed iframe-based print method that was blocked by Content Security Policy
- **Export Shortcuts**: Updated Ctrl+P keyboard shortcut to trigger PDF export directly
- **Monaco Loading**: Resolved AMD module conflicts for better editor stability

### Technical
- **7-Phase Optimization**: Complete performance overhaul with comprehensive testing
- **Debug Cleanup**: Removed 80+ console.log statements for production
- **Native Dialogs**: Replaced browser dialogs with Tauri native dialogs
- **Template System**: Extracted reusable HTML templates for maintainability
- **Performance Monitoring**: Enhanced tracking with detailed metrics
- **Documentation**: Added comprehensive performance validation report

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

### Phase 10: Performance Optimization ✅
- 7-phase comprehensive optimization project
- 98.5% startup time improvement (3-4s → 57.80ms)
- Memory management and leak prevention
- Code quality and maintainability improvements
- All performance targets exceeded by 3-43x