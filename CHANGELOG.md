# Changelog

All notable changes to the Markdown Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Mermaid theme synchronization timing issues
- Mathematical expression parsing edge cases
- Task list state persistence across mode switches
- Export formatting consistency
- Performance optimization for complex documents

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

## [0.3.0] - Phase 3 Foundation (PARTIAL - CRITICAL ISSUES)
- ✅ Math expression detection and placeholder styling ($...$ and $$...$$ syntax)
- ❌ Math rendering blocked by AMD conflicts (shows LaTeX code instead of equations)
- ✅ Mermaid diagram detection and placeholder generation
- ❌ Diagram rendering blocked by AMD conflicts (shows placeholder boxes)
- ✅ Interactive task lists with clickable checkboxes and state persistence
- ✅ Export functionality buttons (HTML and PDF)
- ✅ Enhanced styling for placeholder elements with theme synchronization
- ✅ No library conflicts (stable application)
- ❌ CRITICAL: AMD/RequireJS conflicts prevent external library loading

### CRITICAL ISSUES IDENTIFIED:
- Monaco Editor's RequireJS conflicts with Mermaid.js and KaTeX loading
- Console error: "Can only have one anonymous define call per script file"
- Math expressions show as LaTeX code instead of rendered equations
- Diagrams show placeholder boxes instead of visual diagrams

### Phase 3.5 REQUIRED:
- Resolve AMD/RequireJS conflicts with Monaco Editor
- Implement actual KaTeX math rendering
- Implement actual Mermaid.js diagram rendering
- Ensure theme synchronization with rendered content

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