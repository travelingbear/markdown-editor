# Markdown Viewer

A native desktop markdown viewer built with Tauri + Rust for cross-platform performance and security.

## Features

- **Three viewing modes**: Code, Preview, Split View
- **Native file operations**: Open, Save, Close with system dialogs
- **GitHub-style themes**: Light and dark themes with perfect synchronization
- **Real-time preview**: Live markdown rendering as you type
- **Cross-platform**: Windows, macOS, and Linux support

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (v16 or later)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travelling-bear-markdown-viewer-rust
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri:dev
```

### Building

To create a production build:
```bash
npm run tauri:build
```

## Usage

1. **Open File**: Click the 📁 Open button or use Ctrl+O
2. **Save File**: Click the 💾 Save button or use Ctrl+S
3. **Switch Modes**: Use Code, Preview, or Split buttons
4. **Toggle Theme**: Click the 🌙/☀️ button

## Architecture

- **Backend**: Rust with Tauri for native performance and security
- **Frontend**: HTML/CSS/JavaScript with Marked.js for markdown parsing
- **File Operations**: Native system dialogs with secure file access
- **Themes**: CSS custom properties for synchronized theming

## Development Status

**Current Phase**: Phase 1 - Core Foundation ✅
- Basic application window with native menus
- File open/save operations with native dialogs
- Simple text editor with textarea
- Basic markdown preview rendering
- Project documentation setup

**Next Phase**: Phase 2 - Enhanced Editor
- Monaco Editor integration
- Advanced syntax highlighting
- Improved three-mode interface

## License

MIT License - see LICENSE file for details.