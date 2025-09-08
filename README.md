# Markdown Editor

<p align="center">
  <img src="MarkdownEditorAboutImage.png" alt="Markdown Editor Splash Screen">
</p>

<p align="center">A powerful markdown viewer and editor built with Tauri + Rust + TypeScript/JavaScript.</p>

## ✨ Features

### Multi-Tab Interface
- **Smart Tab Management**: Open multiple files with intelligent tab organization
- **Performance Optimized**: Handles 100+ tabs with virtualization and lazy loading
- **Tab Navigation**: Quick access dropdown for recent 9 tabs, modal for all tabs
- **Context Menus**: Right-click tabs for advanced operations (move, close, duplicate)
- **Keyboard Shortcuts**: Alt+1-9 for numbered tabs, Ctrl+Tab for navigation

### Core Functionality
- **Three-Mode Interface**: Code, Preview, and Split view modes
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Real-Time Preview**: GitHub-flavored markdown with live updates
- **Advanced Rendering**: KaTeX math expressions and Mermaid diagrams
- **Interactive Elements**: Clickable task lists with state persistence
- **Scroll Position Memory**: Reliable scroll position preservation in Code mode; limited reliability in Preview mode when switching between modes

### User Experience
- **GitHub-Style Themes**: Light, Dark, and Retro themes with perfect synchronization
- **Drag & Drop**: Native file drag-drop with absolute path support
- **Export Options**: HTML export and PDF printing
- **Font Size Controls**: Adjustable font size (10px-24px) in markdown toolbar
- **Preview Zoom**: Zoom controls (50%-300%) with keyboard shortcuts
- **Find & Replace**: Toggle find widget with Ctrl+F/Cmd+F, appears as overlay without disrupting layout
- **Undo/Redo Buttons**: Quick access undo/redo in markdown toolbar
- **Toolbar Sizing**: Configurable toolbar sizes (Small/Medium/Large)

### System Integration
- **File Associations**: Double-click .md files to open
- **Single Instance**: Multiple file opens merge into existing window
- **Lightning Fast Performance**: <60ms startup time, <35ms tab switching
- **Memory Optimized**: Smart tab virtualization and memory pressure detection
- **Performance Monitoring**: Real-time performance dashboard in settings

## 🚀 Quick Start

### Download & Install

#### Windows
- **EXE Installer**: `Markdown Viewer_***_x64-setup.exe`
- **MSI Installer**: `Markdown Viewer_***_x64_en-US.msi`
- **Portable**: `portable-win-markdown-viewer.exe`

#### macOS (I still need to build this one)
- **DMG Package**: `Markdown Viewer_***_x64.dmg`
- **App Bundle**: `Markdown Viewer.app`

#### Linux
- **RPM**: `markdown-viewer_***_amd64.rpm`
- **DEB**: `markdown-viewer_***_amd64.deb`

### System Requirements
- **Windows**: Windows 10 (1903) or later
- **macOS**: macOS 10.13 (High Sierra) or later
- **Linux**: Ubuntu 18.04, Debian 10, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB free space

### Getting Started
1. **Launch the app** - See the welcome screen with quick start guide
2. **Open files** - Use Ctrl+O or drag-drop .md files (opens in new tabs)
3. **Navigate tabs** - Click filename for recent tabs, Ctrl+Shift+Tab for all tabs
4. **Choose your mode** - Code for editing, Preview for reading, Split for both
5. **Customize settings** - Press Ctrl+, to configure theme, toolbar sizes, and preferences
6. **Use shortcuts** - Alt+1-9 for tab switching, Ctrl+=/-/0 for zoom, right-click for context menus

### Architecture
- **Frontend**: Component-based architecture with Monaco Editor + Marked.js + KaTeX + Mermaid + Highlight.js
- **Backend**: Rust/Tauri for native file operations and system integration
- **Tab System**: Smart tab management with virtualization and performance optimization
- **Performance**: <60ms startup, <500ms file ops, <35ms tab switching, handles 100+ tabs
- **Bundle Size**: < 50MB across all platforms
- **Security**: Sandboxed file access with CSP protection

## 📄 License

MIT License - See LICENSE file for details

## Acknowledgments

Built with:
- [Tauri](https://tauri.app/) - Native app framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Marked.js](https://marked.js.org/) - Markdown parser
- [KaTeX](https://katex.org/) - Math rendering
- [Mermaid](https://mermaid.js.org/) - Diagram rendering
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting

## 🙏 Buy me a coffee?

[buymeacoffee.com/travelingbear](https://buymeacoffee.com/travelingbear)

---

**A professional markdown editing experience with native performance and modern features.**
