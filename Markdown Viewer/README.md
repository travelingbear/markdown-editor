# Markdown Viewer

A native desktop markdown viewer built with Tauri and Rust, providing a seamless GitHub-style markdown editing and preview experience.

## Features (Phase 1)

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
- **Save File**: Click the 💾 Save button or press `Ctrl+S`
- **Close File**: Click the ❌ Close button or press `Ctrl+W`

### Theme Toggle
- Click the 🌙 button to switch between light and dark themes

### Keyboard Shortcuts
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+W` - Close file

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
- **Markdown Processing**: marked.js library
- **File Operations**: Tauri plugins (dialog, fs)

## Development Status

**Current Phase**: Phase 1 - Core Foundation ✅
**Next Phase**: Phase 2 - Enhanced Editor (Monaco Editor integration)

## Contributing

This project follows a strict phase-based development approach with user validation at each checkpoint. See the project plan for detailed development phases and requirements.

## License

[Add your license here]