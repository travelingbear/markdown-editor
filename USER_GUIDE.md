# Markdown Editor

<p align="center">
  <img src="MarkdownEditorAboutImage.png" alt="Markdown Editor Splash Screen">
</p>

<p align="center">A powerful native desktop markdown viewer and editor built with Tauri + Rust + TypeScript/JavaScript.</p>

## ✨ Features

### Core Functionality
- **Multi-Tab Support**: Open up to 50 markdown files simultaneously with persistent sessions
- **Three-Mode Interface**: Code, Preview, and Split view modes
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Real-Time Preview**: GitHub-flavored markdown with live updates
- **Advanced Rendering**: KaTeX math expressions and Mermaid diagrams
- **Interactive Elements**: Clickable task lists with state persistence

### User Experience
- **Smart Tab Management**: Numbered tabs (1-5) in dropdown with quick access shortcuts
- **Tab Modal**: Search and navigate through all open tabs with keyboard support
- **Context Menus**: Right-click tabs for close, duplicate, and reveal options
- **GitHub-Style Themes**: Light and dark themes with perfect synchronization
- **Drag & Drop**: Native file drag-drop with absolute path support
- **Export Options**: HTML export and PDF printing
- **Font Size Controls**: Adjustable font size (10px-24px) in markdown toolbar
- **Preview Zoom**: Zoom controls (50%-300%) with keyboard shortcuts
- **Undo/Redo Buttons**: Quick access undo/redo in markdown toolbar
- **Toolbar Sizing**: Configurable toolbar sizes (Small/Medium/Large)

### System Integration
- **Single Instance**: Only one app instance runs, new files open in existing window
- **File Associations**: Double-click .md files to open in active instance
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
5. **Use shortcuts** - See keyboard shortcuts section below for full list

## ⌨️ Keyboard Shortcuts

### File Operations
- **Ctrl+N** - New file (creates new tab)
- **Ctrl+O** - Open file (opens in new tab)
- **Ctrl+S** - Save current file
- **Ctrl+Shift+S** - Save as
- **Ctrl+W** - Close current tab

### View Modes
- **Ctrl+1** - Code mode
- **Ctrl+2** - Preview mode
- **Ctrl+3** - Split mode

### Tab Navigation
- **Ctrl+Tab** - Switch to next tab
- **Ctrl+Shift+Tab** - Open tab modal (search all tabs)
- **Alt+1-5** - Switch to numbered tab (1st-5th in dropdown)

### Editor Controls
- **Ctrl+=** - Zoom in preview
- **Ctrl+-** - Zoom out preview
- **Ctrl+0** - Reset preview zoom
- **F5** - Refresh preview

### Application
- **Ctrl+T** or **Ctrl+/** - Toggle theme
- **Ctrl+,** - Open settings
- **F1** - Show help
- **F11** - Toggle fullscreen
- **Shift+F11** - Toggle distraction-free mode
- **Esc** - Close modals or exit distraction-free mode

### Export
- **Ctrl+Shift+E** - Export to HTML
- **Ctrl+Shift+P** - Print/Export to PDF

## 📁 Tab Management

### Tab Interface
- **Status Bar Dropdown**: Shows first 5 most recent tabs with numbers 1-5
- **More Button**: Appears when you have more than 5 tabs open
- **Tab Modal**: Search and navigate through all open tabs

### Tab Operations
- **Opening Files**: New files automatically create tabs and move to position #1
- **Tab Switching**: Click tabs in dropdown or use keyboard shortcuts
- **Tab Closing**: Click X button or use Ctrl+W
- **Tab Persistence**: All tabs restore when you restart the app

### Smart Tab Behavior
- **Numbered Access**: Alt+1-5 switches to numbered tabs in dropdown
- **Dynamic Updates**: Selecting tabs from modal (not in dropdown) moves them to #1
- **Context Menu**: Right-click tabs for close, duplicate, reveal in explorer
- **Search**: Use tab modal to search through all open files

### Tab Limits
- **Maximum**: 50 tabs can be open simultaneously
- **Performance**: Optimized for smooth operation with many tabs
- **Memory**: Inactive tabs use minimal memory resources

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
