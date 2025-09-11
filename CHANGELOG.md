# Changelog

## Version 3.2.0 (2025-01-07)

### Major Features
- **Dynamic CSS Loading Architecture**: Complete CSS refactoring with on-demand theme and feature loading
- **Modular CSS System**: Themes and features now load dynamically, reducing initial bundle size by 50%
- **Enhanced Performance**: Faster startup with lean core CSS (~500 lines) and dynamic loading
- **Tab Limit Enforcement**: Proper 50 tab limit with warnings at 45 tabs and blocking at 50 tabs
- **Comprehensive Documentation**: Added detailed CSS architecture and development guides

### CSS Architecture Improvements
- **StyleManager**: New dynamic CSS loading system with smooth transitions
- **Theme Extraction**: Dark, Retro, and Contrast themes now load on-demand
- **Feature Extraction**: Markdown toolbar, settings modal, and tab system CSS extracted to separate files
- **Print Optimization**: Print styles now load only when printing
- **Bundle Analysis**: Added script to measure CSS optimization results

### Performance Enhancements
- **Theme Preloading**: Popular themes preloaded for faster switching
- **Smooth Transitions**: CSS transition effects for theme switching
- **Memory Optimization**: Reduced memory usage with modular loading
- **Performance Metrics**: Enhanced performance tracking and reporting

### Bug Fixes
- **Tab Limit Issues**: Fixed New File button not working at 49+ tabs
- **Theme Compatibility**: Fixed theme CSS files to support both class and data-attribute selectors
- **Performance Dashboard**: Updated status thresholds to match 50 tab limit

### Documentation
- **CSS Architecture Guide**: Complete guide to dynamic CSS system and development
- **Examples & Tutorials**: Practical examples for theme and feature development
- **Extension Guidelines**: Comprehensive plugin and extension development guide

### Technical Changes
- Extracted 1000+ lines of CSS to modular files
- Implemented StyleManager with async loading and error handling
- Added performance optimization with dark theme preloading
- Updated PerformanceOptimizer with proper 50 tab limit enforcement
- Enhanced FileController with proper tab limit warnings and blocking

## Version 3.1.3 (2025-01-07)

### Improvements
- **Find Widget Toggle**: Enhanced Find & Replace functionality with proper toggle behavior - clicking the Find button or pressing Ctrl+F/Cmd+F now opens and closes the find widget
- **Find Widget Overlay**: Find widget now appears as an overlay in the top-right corner without pushing editor content down
- **Monaco Editor Configuration**: Added find widget overlay configuration to prevent layout disruption

### Technical Changes
- Enhanced Monaco Editor find widget configuration with `addExtraSpaceOnTop: false`
- Improved find widget CSS positioning for overlay behavior
- Updated find widget toggle logic using Monaco's internal state management

## Version 3.1.2 (2025-01-07)

### Improvements
- **Extended Tab Shortcuts**: Extended tab switching shortcuts from Alt+1-5 to Alt+1-9 (Cmd+1-9 on macOS) to support cycling through more tabs
- **Auto-scroll Enhancement**: Added auto-scrolling functionality for pinned tabs and dropdown lists when cycling through tabs beyond visible window
- **Keyboard Shortcut Optimization**: Swapped mode switching shortcuts (now Ctrl+Shift+1-3) with heading shortcuts (now Ctrl+1-3) to make headings more accessible in code mode

### Technical Changes
- Enhanced tab management with auto-scroll support for better navigation
- Improved keyboard shortcut handling for more intuitive editing experience
- Updated help modal and documentation to reflect new shortcut mappings

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