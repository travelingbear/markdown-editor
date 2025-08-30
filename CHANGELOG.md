# Changelog

All notable changes to the Markdown Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [0.1.0] - Phase 1 Foundation
- Initial release with core markdown viewing functionality
- Basic file operations and theme support
- Real-time preview rendering
- Native desktop application with Tauri