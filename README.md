# Markdown Viewer

A powerful native desktop markdown viewer and editor built with Tauri + Rust + TypeScript/JavaScript.

## ✨ Features

### 🎯 Core Functionality
- **Three-Mode Interface**: Code, Preview, and Split view modes
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Real-Time Preview**: GitHub-flavored markdown with live updates
- **Advanced Rendering**: KaTeX math expressions and Mermaid diagrams
- **Interactive Elements**: Clickable task lists with state persistence

### 🎨 User Experience
- **GitHub-Style Themes**: Light and dark themes with perfect synchronization
- **Drag & Drop**: Native file drag-drop with absolute path support
- **File Operations**: Open, Save, Save As, New file with native dialogs
- **Export Options**: HTML export and PDF printing
- **Keyboard Shortcuts**: Complete OS-compliant shortcut system

### 🖼️ Media Support
- **Image Formats**: PNG, JPG, GIF, WebP, SVG with local and remote support
- **Visual Feedback**: Color-coded borders for different image states
- **Asset Management**: Automatic path resolution and error handling

### ⚙️ System Integration
- **File Associations**: Double-click .md files to open
- **Window Management**: Proper close confirmation for unsaved changes
- **Settings Persistence**: Theme, mode, and editor preferences saved
- **Performance Monitoring**: Built-in performance tracking and optimization

## 🚀 Quick Start

### Download & Install

#### Windows
- **MSI Installer**: `Markdown Viewer_1.0.0_x64_en-US.msi` (Recommended)
- **NSIS Installer**: `Markdown Viewer_1.0.0_x64-setup.exe`
- **Portable**: `markdown-viewer.exe`

#### macOS
- **DMG Package**: `Markdown Viewer_1.0.0_x64.dmg`
- **App Bundle**: `Markdown Viewer.app`

#### Linux
- **AppImage**: `markdown-viewer_1.0.0_amd64.AppImage`
- **DEB Package**: `markdown-viewer_1.0.0_amd64.deb`

### System Requirements
- **Windows**: Windows 10 (1903) or later
- **macOS**: macOS 10.13 (High Sierra) or later
- **Linux**: Ubuntu 18.04, Debian 10, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB free space

## 🎮 Usage

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

## 🏗️ Development

### Build from Source

#### Prerequisites
- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Node.js**: Version 18+ from [nodejs.org](https://nodejs.org/)
- **Platform Dependencies**: See BUILD_GUIDE.md for details

#### Build Commands
```bash
cd "Markdown Viewer"
npm install
npm run dev          # Development mode
npm run build        # Production build
npm run build:debug  # Debug build
```

#### Cross-Platform Builds
```bash
npm run build:windows  # Windows MSI + NSIS
npm run build:macos    # macOS DMG + App
npm run build:linux    # Linux AppImage + DEB
```

### Project Structure
```
markdown-viewer/
├── Markdown Viewer/           # Main application
│   ├── src/                  # Frontend (HTML/CSS/JS)
│   ├── src-tauri/           # Backend (Rust/Tauri)
│   └── package.json         # Dependencies and scripts
├── BUILD_GUIDE.md           # Detailed build instructions
├── INSTALLATION_GUIDE.md    # User installation guide
├── RELEASE_CHECKLIST.md     # Release validation checklist
└── PROJECT_PLAN.md          # Complete project specification
```

## 📚 Documentation

- **[Installation Guide](INSTALLATION_GUIDE.md)** - Download and install instructions
- **[Build Guide](BUILD_GUIDE.md)** - Development setup and building from source
- **[Project Plan](PROJECT_PLAN.md)** - Complete feature specification and architecture
- **[Development Log](DEVELOPMENT_LOG.md)** - Detailed development history
- **[Release Checklist](RELEASE_CHECKLIST.md)** - Quality assurance and release process

## 🎯 Technical Specifications

### Performance Targets (All Met ✅)
- **Startup Time**: < 2 seconds
- **File Operations**: < 500ms for typical files
- **Mode Switching**: < 100ms
- **Preview Updates**: < 300ms debounced
- **Memory Usage**: < 200MB for typical documents

### Architecture
- **Frontend**: Monaco Editor + Marked.js + KaTeX + Mermaid + Highlight.js
- **Backend**: Rust/Tauri for native file operations and system integration
- **Bundle Size**: < 50MB across all platforms
- **Security**: Sandboxed file access with CSP protection

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Complete three-mode interface with Monaco Editor
- ✅ Real-time markdown rendering with advanced features
- ✅ Native drag-drop with absolute file paths
- ✅ Image and GIF support for all formats
- ✅ Interactive task lists with state persistence
- ✅ Export functionality (HTML and PDF)
- ✅ File associations and system integration
- ✅ Performance optimization and error handling
- ✅ Cross-platform distribution packages
- ✅ Distraction-free mode with F11 toggle
- ✅ Centered A4 layout with configurable page sizes
- ✅ Enhanced settings window with visual controls
- ✅ File history on welcome screen
- ✅ Markdown formatting toolbar
- ✅ Comprehensive keyboard shortcuts
- ✅ Help and About modals
- ✅ Splash screen with settings toggle
- ✅ Professional branding and MIT license

### Development Phases Completed
- **Phase 1**: Core Foundation ✅
- **Phase 2**: Enhanced Editor ✅
- **Phase 3**: Advanced Features ✅
- **Phase 3.5**: Critical Rendering Issues ✅
- **Phase 4**: Polish & OS Integration ✅
- **Phase 5**: Final Polish & Enhancement ✅
- **Phase 5.1**: Native Drag-Drop Absolute Paths ✅
- **Phase 6**: Distribution & Release ✅
- **Phase 7**: UI/UX Enhancements ✅
- **Phase 8**: Keyboard Shortcuts ✅
- **Phase 8.5**: Help, About & Splash Screen ✅
- **Phase 9**: Branding & Legal ✅

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install prerequisites (Rust, Node.js)
3. Follow BUILD_GUIDE.md for detailed setup
4. Read PROJECT_PLAN.md for architecture overview

### Code Quality
- Follow existing code style and patterns
- Test all changes thoroughly
- Update documentation for new features
- Ensure cross-platform compatibility

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Tauri](https://tauri.app/) - Native app framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Marked.js](https://marked.js.org/) - Markdown parser
- [KaTeX](https://katex.org/) - Math rendering
- [Mermaid](https://mermaid.js.org/) - Diagram rendering
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting

---

**A professional markdown editing experience with native performance and modern features.**