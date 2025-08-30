# Changelog

All notable changes to the Markdown Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Tauri + Rust architecture
- Basic application window with native menus and controls
- File operations with native system dialogs (Open, Save, Close)
- Simple text editor with textarea for markdown editing
- Real-time markdown preview using Marked.js
- Three viewing modes: Code, Preview, and Split View
- GitHub-style light and dark themes with perfect synchronization
- Theme persistence across application sessions
- Cursor position tracking in status bar
- Unsaved changes detection and user warnings
- Cross-platform support (Windows, macOS, Linux)
- Responsive UI layout with proper window resizing
- Secure file system access through Tauri's sandboxed model

### Technical Implementation
- Rust backend with async file operations and error handling
- Frontend built with vanilla HTML/CSS/JavaScript for optimal performance
- CSS custom properties for synchronized theme management
- Tauri invoke system for secure frontend-backend communication
- Marked.js integration for fast markdown parsing and rendering
- Local storage for theme preference persistence

### Documentation
- Comprehensive README.md with setup and usage instructions
- Development log tracking technical decisions and progress
- Project architecture documentation
- Installation and build instructions

## [0.1.0] - Phase 1 Complete

### Phase 1: Core Foundation
- ✅ Basic application window with native menus
- ✅ File open/save operations with native dialogs  
- ✅ Simple text editor (textarea fallback)
- ✅ Basic markdown preview rendering
- ✅ Project documentation setup

**Status**: Ready for user validation and testing