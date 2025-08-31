# Markdown Editor

![Markdown Editor Box](MarkdownEditorBox2.jpg)

A powerful native desktop markdown viewer and editor built with Tauri + Rust + TypeScript/JavaScript.

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
- **File Operations**: Open, Save, Save As, New file with native dialogs
- **Export Options**: HTML export and PDF printing
- **Keyboard Shortcuts**: Complete OS-compliant shortcut system

### Media Support
- **Image Formats**: PNG, JPG, GIF, WebP, SVG with local and remote support
- **Visual Feedback**: Color-coded borders for different image states
- **Asset Management**: Automatic path resolution and error handling

### System Integration
- **File Associations**: Double-click .md files to open
- **Window Management**: Proper close confirmation for unsaved changes
- **Settings Persistence**: Theme, mode, and editor preferences saved
- **Performance Monitoring**: Built-in performance tracking and optimization

## 🚀 Quick Start

### Download & Install

#### Windows
- **MSI Installer**: `Markdown Viewer_2.0.0_x64_en-US.msi` (Recommended)
- **NSIS Installer**: `Markdown Viewer_2.0.0_x64-setup.exe`
- **Portable**: `markdown-viewer.exe`

#### macOS
- **DMG Package**: `Markdown Viewer_2.0.0_x64.dmg`
- **App Bundle**: `Markdown Viewer.app`

#### Linux
- **AppImage**: `markdown-viewer_2.0.0_amd64.AppImage`
- **DEB Package**: `markdown-viewer_2.0.0_amd64.deb`

### System Requirements
- **Windows**: Windows 10 (1903) or later
- **macOS**: macOS 10.13 (High Sierra) or later
- **Linux**: Ubuntu 18.04, Debian 10, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB free space

### Essential Keyboard Shortcuts
- `Ctrl+O` - Open file
- `Ctrl+N` - New file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save As
- `Ctrl+1/2/3` - Switch between Code/Preview/Split modes
- `Ctrl+/` - Toggle theme (Light/Dark)
- `Ctrl+,` - Open settings
- `Ctrl+P` - Print/Export to PDF
- `Ctrl+Shift+E` - Export to HTML

### Getting Started
1. **Launch the app** - See the welcome screen with quick start guide
2. **Open a file** - Use Ctrl+O or drag-drop a .md file
3. **Choose your mode** - Code for editing, Preview for reading, Split for both
4. **Customize settings** - Press Ctrl+, to configure theme and preferences

### Build from Source

#### Prerequisites
- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Node.js**: Version 18+ from [nodejs.org](https://nodejs.org/)
- **Platform Dependencies**: See BUILD_GUIDE.md for details

### Architecture
- **Frontend**: Monaco Editor + Marked.js + KaTeX + Mermaid + Highlight.js
- **Backend**: Rust/Tauri for native file operations and system integration
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

## 🙏 Buy me a coffee page

[buymeacoffee.com/travelingbear](https://buymeacoffee.com/travelingbear)

---

**A professional markdown editing experience with native performance and modern features.**