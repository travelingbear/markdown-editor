# Markdown Editor

<p align="center">
  <img src="SplashScreen.gif" alt="Markdown Editor Splash Screen">
</p>

<p align="center">A powerful native desktop markdown viewer and editor built with Tauri + Rust + TypeScript/JavaScript.</p>

## ✨ Features

### Core Functionality
- **Three-Mode Interface**: Code, Preview, and Split view modes
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Real-Time Preview**: GitHub-flavored markdown with live updates
- **Advanced Rendering**: KaTeX math expressions and Mermaid diagrams
- **Interactive Elements**: Clickable task lists with state persistence

### User Experience
- **GitHub-Style Themes**: Light and dark themes with perfect synchronization
- **Drag & Drop**: Native file drag-drop with absolute path support
- **Export Options**: HTML export and PDF printing
- **Font Size Controls**: Adjustable font size (10px-24px) in markdown toolbar
- **Preview Zoom**: Zoom controls (50%-300%) with keyboard shortcuts
- **Undo/Redo Buttons**: Quick access undo/redo in markdown toolbar
- **Toolbar Sizing**: Configurable toolbar sizes (Small/Medium/Large)

### System Integration
- **File Associations**: Double-click .md files to open
- **Lightning Fast Performance**: 57.80ms startup time (98.5% improvement)
- **Memory Optimized**: Stable memory usage with leak prevention
- **Performance Monitoring**: Built-in performance tracking and optimization

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
2. **Open a file** - Use Ctrl+O or drag-drop a .md file
3. **Choose your mode** - Code for editing, Preview for reading, Split for both
4. **Customize settings** - Press Ctrl+, to configure theme, toolbar sizes, and preferences
5. **Use shortcuts** - Ctrl+=/-/0 for zoom, font controls in toolbar, undo/redo buttons

### Architecture
- **Frontend**: Monaco Editor + Marked.js + KaTeX + Mermaid + Highlight.js
- **Backend**: Rust/Tauri for native file operations and system integration
- **Performance**: 57.80ms startup, <500ms file ops, <35ms mode switching
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
