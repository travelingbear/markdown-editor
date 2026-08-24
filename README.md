# Markdown Editor

<p align="center">
  <img src="MarkdownEditorAboutImage.png" alt="Markdown Editor Splash Screen">
</p>

<p align="center">A powerful markdown viewer and editor built with Tauri + Rust + TypeScript/JavaScript.</p>

## ✨ Features

### Multi-Tab Interface
- **Smart Tab Management**: Open multiple files with intelligent tab organization
- **Performance Optimized**: Handles up to 50 tabs with dynamic CSS loading and virtualization
- **Tab Navigation**: Quick access dropdown for recent 9 tabs, modal for all tabs
- **Context Menus**: Right-click tabs for advanced operations (move, close, duplicate)
- **Keyboard Shortcuts**: Alt+1-9 for numbered tabs, Ctrl+Tab for navigation

### Core Functionality
- **Three-Mode Interface**: Code, Preview, and Split view modes
- **CodeMirror Editor**: Lightweight code editing with markdown syntax highlighting, search, undo/redo, and Linux support
- **Real-Time Preview**: GitHub-flavored markdown with live updates
- **Pure or Extended Rendering**: Keep rendering lightweight and predictable, or enable optional local renderers
- **Advanced Rendering**: Lazy plugin-owned KaTeX math expressions and Mermaid diagrams without external services
- **Multi-Line Math**: Display blocks such as matrices and aligned environments render as a single formula, because math is resolved from the source before Markdown parsing
- **Interactive Elements**: Clickable task lists update their exact source lines, even when labels are similar or repeated, with consistent checked styling at every nesting level
- **Scroll Position Memory**: Independent per-document positions synchronized across Code, Preview, and Split modes
- **Recoverable Sessions**: Closing the application silently preserves modified tabs for the next launch; closing a document still asks before discarding changes

### User Experience
- **Dynamic Themes**: Light, Dark, Retro, and High Contrast themes with on-demand loading
- **Readable Retro Code Blocks**: Fenced code retains a clear monospace size while surrounding Retro document text stays compact
- **Reliable Retro Startup Audio**: The optional bundled startup clip is decoded before playback to avoid cold-cache interruptions
- **Drag & Drop**: Cross-platform browser/native file-drop handling with duplicate protection and Code-mode insertion
- **Export Options**: HTML export and PDF printing
- **Font Size Controls**: Adjustable font size (10px-24px) in markdown toolbar
- **Preview Zoom**: Zoom controls (50%-300%) with keyboard shortcuts
- **Find & Replace**: Toggle find widget with Ctrl+F/Cmd+F, appears as overlay without disrupting layout
- **Undo/Redo Buttons**: Quick access undo/redo in markdown toolbar
- **Composable Formatting**: Bold and italic can be combined and toggled independently without accumulating Markdown markers
- **Toolbar Sizing**: Configurable toolbar sizes (Small/Medium/Large)
- **Responsive Markdown Toolbar**: Tools condense into organized menus as the available width decreases
- **Pinned Quick Settings**: Optionally place Markdown rendering and Pinned Tabs controls after Export; compact windows use a separated Quick menu

### System Integration
- **File Associations**: Double-click .md files to open
- **Single Instance**: Multiple file opens merge into existing window
- **Lightning Fast Performance**: <60ms startup time, <35ms tab switching
- **Memory Optimized**: Smart tab virtualization and memory pressure detection
- **Performance Monitoring**: Real-time performance dashboard in settings

(Works better with Windows. Some functionalities, such as file association, might not work well on MacOS. I have been testing on Windows, and Ubuntu Linux. Sometimes I test in a MacOS and most of the functionalities are there)

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
3. **Navigate tabs** - Click filename for recent tabs, Ctrl+Shift+M for all tabs
4. **Choose your mode** - Code for editing, Preview for reading, Split for both
5. **Customize settings** - Press Ctrl+, to configure theme, toolbar sizes, and preferences
6. **Use shortcuts** - Alt+1-9 for tabs, Ctrl+Shift+1/2/3 for modes, Ctrl+1/2/3 for headings in Code mode, and Ctrl+F/Ctrl+H for search

### Rendering and Plugins
- **Plugin Manager**: Configure each bundled plugin in its own tab, while the main Settings window provides concise enable/disable and Manager controls
- **KaTeX Math Renderer**: Enabled by default for compatibility, but its local runtime and styles load only when Extended mode encounters real math
- **Strict Math Detection**: Prices, escaped dollars, shell variables, prose, and code blocks are not mistaken for formulas; Permissive mode is available for older documents
- **KaTeX Controls**: Configure inline math, display math, invalid-formula behavior, and detection mode from the plugin tab
- **Mermaid Diagram Renderer**: Enabled by default but fully separate from Preview; its pinned local runtime and feature CSS load only when Extended mode encounters a Mermaid code fence
- **Mermaid Controls**: Follow the application theme or select a fixed diagram theme, control maximum-width layout, and choose readable-source or visible-warning behavior for invalid diagrams
- **Renderer Status**: System Info distinguishes Disabled, Not Loaded, and Loaded (version) for both KaTeX and Mermaid
- **Bundled Runtime Status**: Renderer plugin tabs identify their runtime row as informational; runtime versions are pinned rather than user-selected or downloaded
- **Secure Diagrams**: Mermaid uses strict security; generated SVG is sanitized and parsed into DOM nodes before display
- **Horizontal Split**: Configure vertical/horizontal orientation, toolbar visibility, and pane order from its plugin tab
- **Offline Operation**: Rendering dependencies are bundled with the application; no CDN or external rendering service is required

### Architecture
- **Frontend**: Component-based architecture with CodeMirror + Marked.js and independently lazy renderer plugins
- **Explicit Runtime Paths**: A staged bootstrap and registered plugin catalog replace abandoned entry points and automatically exclude unregistered experiments
- **Backend**: Rust/Tauri for native file operations and system integration
- **Native Lifecycle Boundary**: A dedicated controller owns window-close persistence, single-instance file forwarding, focus restoration, and listener cleanup
- **File-Drop Boundary**: Browser and native drop sources share one disposable controller instead of leaking global listeners into the application orchestrator
- **Shortcut Ownership**: `KeyboardController` has explicit dependencies and is the only application-level keyboard/wheel listener
- **Split-Pane Ownership**: Vertical resizing uses a disposable controller while the optional Horizontal Split plugin independently owns height resizing
- **Welcome and Modal Ownership**: Welcome commands and modal close behavior use disposable listeners, while every Settings entry point triggers one canonical refresh
- **Document Lifecycle Ownership**: File-open batches, full-path duplicate handling, dirty/save transitions, and document-to-tab synchronization use one disposable controller
- **Editor Lifecycle Ownership**: Content, cursor, lazy-load status, and editor markdown commands synchronize through one disposable controller
- **Preview Lifecycle Ownership**: Task interaction, safe external links, renderer status, exports, reload/restart commands, and scroll restoration use one disposable controller
- **Toolbar Command Ownership**: `ToolbarComponent` emits intent only; file, mode, export, UI, settings, editing, and Markdown commands are routed by one disposable controller
- **Settings and UI Ownership**: One disposable coordinator connects Settings, UI, and the Plugin Manager, so each preference has a single write path and the Settings modal is rendered once from one state
- **Dialog Ownership**: The Link and Image insert flow is a disposable controller with its own dialogs, dropdowns, and listener teardown, separate from toolbar chrome
- **Composition Root**: `MarkdownEditor` only constructs, injects, initializes, and disposes; it registers no component event listeners, and every listener, timer, and adapter has one teardown owner
- **Tokenized Toolbar Geometry**: Toolbar sizes are custom properties every theme reads, and the Markdown toolbar is measured against the code pane so it cannot overflow into Preview
- **Plugin System**: Lifecycle-managed plugins with scoped settings, automatic cleanup, a dedicated manager, and an ordered renderer registry
- **Tab System**: Session-owned activation and wraparound navigation, UI-owned context commands, virtualization, and performance optimization
- **Performance**: <60ms startup, <500ms file ops, <35ms tab switching, 50 tab limit with warnings
- **Bundle Size**: < 50MB across all platforms
- **Stylesheet Ownership**: The base stylesheet is an ordered manifest of component-owned parts rather than one long file, with tooling to prove a CSS move does not change the cascade
- **Asset Discipline**: The native shell retains only referenced artwork and one local Retro audio format, reuses compact branded icons where possible, and resolves runtime-created images through the production bundler
- **Security**: Sandboxed file access with CSP protection and plugin validation

## Documentation

- [User Manual](USER_MANUAL.md) — features, settings, shortcuts, and troubleshooting
- [Technical Documentation](TECHNICAL_DOCUMENTATION.md) — current architecture, ownership boundaries, plugin/rendering design, and refactoring priorities
- [Build Guide](BUILD_GUIDE.md) — prerequisites, validation, native builds, releases, and packaging troubleshooting
- [Changelog](CHANGELOG.md) — development history and the current unreleased work

## 📄 License

MIT License - See LICENSE file for details

## Acknowledgments

Built with:
- [Tauri](https://tauri.app/) - Native app framework
- [CodeMirror](https://codemirror.net/) - Code editor
- [Marked.js](https://marked.js.org/) - Markdown parser
- [KaTeX](https://katex.org/) - Math rendering
- [Mermaid](https://mermaid.js.org/) - Diagram rendering
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting

## 🙏 Buy me a coffee?

[buymeacoffee.com/travelingbear](https://buymeacoffee.com/travelingbear)

---

**A professional markdown editing experience with native performance and modern features.**
