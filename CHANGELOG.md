# Changelog

## Version 3.1.1 (2025-01-07)

### Bug Fixes
- **F11 Fullscreen**: Fixed F11 key not toggling fullscreen mode by adding missing Tauri permissions
- **Tab Clicking Issue**: Fixed virtualized tabs (beyond first 10) not being clickable with 50+ tabs open
- **Performance Optimization**: Removed debug logging and optimized tab switching for better performance
- **Browser Compatibility**: Added fallback for `requestIdleCallback` API in environments that don't support it
- **Performance Monitor**: Fixed Performance Monitor section to update when Clear Tabs or Clean Memory buttons are clicked

### Technical Changes
- Added `core:window:allow-set-fullscreen` and `core:window:allow-is-fullscreen` permissions
- Fixed performance optimizer to only virtualize real tabs instead of creating fake tab IDs
- Improved tab restoration logic for virtualized tabs
- Optimized tab switching performance by removing unnecessary operations

## Version 3.1.0 (2025-09-06)

### New Features
- **Scroll Sync Button**: Added manual scroll synchronization between Code and Preview modes
- **Pinned Tabs Bar**: Optional horizontal tabs bar above status bar with numbering (1-5)
- **Retro Theme**: Added Windows 3.1-style retro theme with authentic styling
- **Enhanced Tab Management**: Fixed pinned tabs population when enabled after startup

### Improvements
- **Default Mode Fix**: Documents now properly open in user's default mode setting
- **Zoom Controls Visibility**: Fixed zoom controls not appearing in Preview mode on first load
- **Tab Closing Animation**: Improved animation timing and unsaved changes confirmation order
- **Memory Management**: Enhanced virtual tabs cleanup to prevent memory leaks
- **Distraction-Free Mode**: Pinned tabs now properly hidden in distraction-free mode
- **Retro Theme Save Button**: Added visual indication for dirty files in retro theme

### Bug Fixes
- Fixed tab loading preventing welcome screen from staying active during initialization
- Fixed automatic tab reordering when switching beyond position 5
- Fixed virtual tabs memory leak when closing all tabs
- Fixed pinned tabs not showing existing tabs when enabled after startup

### Technical Changes
- Enhanced scrollbar styling for dark theme with better contrast
- Improved performance monitoring with virtual tabs cleanup
- Updated UI positioning and styling consistency across themes

## Version 3.0.0 (Previous Release)

### Major Features
- Multi-tab interface with smart tab management
- Three-mode interface (Code, Preview, Split)
- Monaco Editor integration
- Real-time preview with GitHub-flavored markdown
- Advanced rendering (KaTeX math, Mermaid diagrams)
- Performance optimization and monitoring
- Export options (HTML, PDF)
- Customizable interface and themes