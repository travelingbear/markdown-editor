# Markdown Viewer

A native desktop markdown viewer built with Tauri and Rust, providing a seamless GitHub-style markdown editing and preview experience.

## Features

### Phase 2 - Enhanced Editor Integration ✅
- ✅ **Monaco Editor**: Professional code editor with markdown syntax highlighting
- ✅ **Native File Operations**: Enhanced file dialogs with multiple format support
- ✅ **Scroll Synchronization**: Bidirectional scroll sync between editor and preview
- ✅ **Advanced Keyboard Shortcuts**: Mode switching and enhanced file operations
- ✅ **Theme Integration**: Monaco Editor themes sync with application theme
- ✅ **Fallback System**: Graceful degradation if Monaco Editor fails to load

### Phase 1 - Core Foundation ✅
- ✅ Basic application window with native interface
- ✅ File open/save operations with native dialogs
- ✅ Simple text editor with markdown support
- ✅ Real-time markdown preview rendering
- ✅ GitHub-style light/dark themes
- ✅ Keyboard shortcuts (Ctrl+O, Ctrl+S, Ctrl+W)
- ✅ Unsaved changes detection
- ✅ Status bar with cursor position and filename

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Markdown Viewer"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

### Building for Production

```bash
npm run tauri build
```

## Usage

### File Operations
- **Open File**: Click the 📁 Open button or press `Ctrl+O`
  - Supports .md, .markdown, and .txt files
  - Native OS file dialog with proper filtering
- **Save File**: Click the 💾 Save button or press `Ctrl+S`
  - Save to existing file or prompt for new location
- **Save As**: Press `Ctrl+Shift+S` to save with a new name/location
- **Close File**: Click the ❌ Close button or press `Ctrl+W`
  - Warns about unsaved changes

### Editor Modes
- **Code Mode**: Full-screen Monaco Editor with syntax highlighting
- **Preview Mode**: Full-screen markdown preview
- **Split Mode**: Side-by-side editor and preview with scroll synchronization

### Theme Toggle
- Click the 🌙 button to switch between light and dark themes
- Monaco Editor theme automatically syncs with application theme

### Keyboard Shortcuts
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save As
- `Ctrl+W` - Close file
- `Ctrl+1` - Switch to Code mode
- `Ctrl+2` - Switch to Preview mode
- `Ctrl+3` - Switch to Split mode

## Project Structure

```
Markdown Viewer/
├── src/                    # Frontend source code
│   ├── index.html         # Main HTML file
│   ├── main.js           # JavaScript application logic
│   └── styles.css        # CSS styling
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── main.rs       # Main entry point
│   │   └── lib.rs        # Application logic
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
└── package.json          # Node.js dependencies
```

## Technology Stack

- **Backend**: Rust with Tauri framework
- **Frontend**: HTML, CSS, JavaScript
- **Code Editor**: Monaco Editor with markdown syntax highlighting
- **Markdown Processing**: marked.js library
- **File Operations**: Tauri plugins (dialog, fs)
- **Scroll Synchronization**: Custom bidirectional scroll sync

## Development Status

**Current Phase**: Phase 2 - Enhanced Editor Integration ✅
**Next Phase**: Phase 3 - Advanced Features (Mermaid diagrams, math expressions, enhanced assets)

## Contributing

This project follows a strict phase-based development approach with user validation at each checkpoint. See the project plan for detailed development phases and requirements.

## License

[Add your license here]