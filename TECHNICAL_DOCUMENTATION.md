# Technical Documentation

This document describes the current development architecture. User-facing behavior belongs in `USER_MANUAL.md`; build and release commands belong in `BUILD_GUIDE.md`.

## Technology stack

- Tauri 2 and Rust provide the native window, filesystem integration, dialogs, file associations, and single-instance forwarding.
- Vite 8 builds the frontend from native ES modules.
- CodeMirror 6 provides the editor.
- Marked and DOMPurify provide the base Markdown and sanitization pipeline.
- KaTeX and Mermaid are local, lazy renderer plugins.
- Vitest and jsdom provide automated frontend coverage.

The application does not require a CDN or rendering service.

## Maintained entry path

```text
src/index.html
├── src/splash-component.js
└── src/bootstrap.js
    ├── foundation modules
    ├── component base
    ├── application modules
    └── src/main.js
        └── MarkdownEditor.init()
```

`bootstrap.js` loads modules in dependency-safe stages. Some older classes still expose browser globals while the migration to direct ES-module imports continues; this is a transitional compatibility bridge, not a second application entry point.

## Frontend responsibilities

### MarkdownEditor

`MarkdownEditor` is the application composition root. It creates components and controllers, connects cross-component events, starts plugins, and coordinates startup progress. Business logic and platform integration belong in focused controllers rather than expanding this class.

### Components

- `DocumentComponent` owns the current file content, path, dirty transition, and native open/save operations.
- `EditorComponent` presents the editor abstraction to the application.
- `PreviewComponent` owns base Markdown parsing, sanitization, preview updates, renderer-registry integration, and per-task label normalization so checked styling remains isolated across nested lists.
- `ToolbarComponent` owns toolbar DOM behavior and emits commands rather than performing file or editor work directly.
- `TabState`, `TabCollection`, and `TabManager` own persistent per-document state and collection operations.

### Controllers

- `FileController`: new/open/save/reload workflows.
- `FileDropController`: browser and Tauri file-drop normalization, open-versus-insert routing, overlay state, and listener cleanup.
- `DocumentLifecycleController`: file-open batches, full-path duplicate routing, new/close/dirty/save transitions, and external document-content updates.
- `EditorLifecycleController`: editor content propagation, cursor persistence, lazy-load status refresh, markdown-command routing, and application-listener teardown. `EditorComponent` separately releases its fallback DOM listeners and editor adapter.
- `PreviewLifecycleController`: task interaction, external-link routing, renderer status, errors, Preview context commands, export routing, post-render scroll restoration, and listener/timer teardown.
- `ToolbarLifecycleController`: the sole owner of toolbar command routing — file new/open/save/save-as/close/reload, mode changes, exports, distraction-free/theme/Settings/Help, quick rendering and pinned-tab controls, font size and Preview zoom, undo/redo, Markdown actions and insertions, find/replace — plus listener teardown. Toolbar intent reaches services through this controller only, so the composition root registers no toolbar listeners.
- `taskSyntax`: pure fenced-code-aware task extraction and exact source-line updates shared by Preview and Markdown actions; visible task text is no longer used as primary identity.
- `MarkdownActionController`: editor-neutral Markdown insertion and formatting, including independently composable bold and italic toggle layers.
- `KeyboardController`: the sole application-level keyboard/wheel listener, connected through explicit services and action callbacks rather than the composition root.
- `MarkdownActionController`: formatting commands.
- `ModeController`: Code, Preview, Split, and welcome states.
- `NativeWindowController`: application-close session persistence, single-instance file forwarding, focus restoration, and native listener cleanup.
- `ScrollCoordinator`: per-tab scroll capture and Code/Preview synchronization.
- `SplitPaneController`: bounded vertical pane resizing, editor relayout scheduling, and disposable mouse listeners; horizontal height resizing remains plugin-owned.
- `SettingsController`: preference loading, persistence, and settings UI state.
- `TabSessionController`: activation, wraparound navigation, dormant-tab loading, editor documents, and session restoration.
- `TabUIController`: pinned tabs, status-bar tab manager, context commands, menus, and tab reordering.
- `UIController`: themes, layout, modals, and Retro audio.
- `WelcomeController`: welcome-screen new/open/help/about/settings/history commands and their DOM listener lifecycle.
- `ExportController`: HTML and PDF/print preparation.

`ControllerRegistry` constructs controllers behind stable names so composition can be tested and gradually modularized.

## Editor boundary

The application talks to CodeMirror through `CodeMirrorEditorAdapter`. The adapter owns editor creation, documents, selection, cursor position, search, undo/redo, theme application, and scroll access. Application components must not reach into CodeMirror internals.

This boundary allows a future editor engine to be evaluated without rewriting tabs, file operations, rendering, or toolbar commands.

## Document and tab state

Each `TabState` serializes:

- stable tab id
- file name and normalized full path
- current content and dirty marker
- cursor position
- editor and preview scroll state
- editor view state
- creation and modification timestamps

Content changes update the active tab and persistent session immediately. Full normalized paths identify open files, so equal filenames in different directories remain distinct.

Closing an individual dirty document invokes the unsaved-changes dialog. Closing the native application does not ask: it synchronously persists the complete recoverable session, and the dirty document is restored on the next launch.

## Rendering pipeline

### Pure Markdown

Pure mode runs the base Marked and DOMPurify path only. Renderer plugins are not invoked, so dollar text and Mermaid fences remain ordinary Markdown/code.

### Extended Markdown

Extended mode runs enabled renderers from `RendererRegistry` in explicit order after base parsing. A renderer may detect relevant source without loading its heavy runtime. KaTeX and Mermaid dynamically import their local runtimes only when matching syntax is present.

HTML export uses the same registered rendering behavior and includes feature styles only when the feature is present.

## Plugin system

Bundled plugins are explicitly declared in `src/plugins/registry.js`. Each definition provides:

- a stable id and virtual plugin path
- lightweight metadata
- a dynamic module loader
- optional configuration reset behavior

The current bundled catalog contains Horizontal Split, KaTeX, and Mermaid.

`PluginLoader` discovers registry definitions, creates lazy proxy classes, and validates lightweight metadata. On activation, it imports and validates the implementation before constructing it. `PluginManager` owns registration, enable/disable state, activation, cleanup, reload, and failure isolation.

Plugins must release event listeners, styles, renderer registrations, and DOM additions during `destroy()`. Plugin-specific settings belong in the Plugin Manager rather than the main Settings modal.

Adding a bundled plugin requires a manifest/config module when appropriate, an implementation with lifecycle cleanup, a registry entry using dynamic import, user documentation, and focused lifecycle tests.

## Startup and lazy loading

Startup work is divided into:

1. A minimal splash module.
2. Foundation and component module loading.
3. Component construction and event wiring.
4. Lightweight plugin discovery and activation.
5. On-demand editor and renderer runtime loading.

The splash and welcome page are separate states. The welcome page is not treated as a Preview document, and mode shortcuts do nothing until a document is active.

## Native backend

`src-tauri/src/lib.rs` configures Tauri plugins and commands for:

- dialogs and filesystem access
- startup-file discovery
- single-instance file forwarding
- local image conversion
- file-manager reveal behavior
- command-line and file-association support

On the frontend, `NativeWindowController` is the sole owner of native window lifecycle listeners. `FileController` owns startup-file discovery, while files forwarded by the single-instance event are passed to `DocumentComponent` as one batch.

Capabilities are declared in `src-tauri/capabilities/default.json`. Changes to native commands or filesystem scope require a separate security review and Windows/Linux testing.

## Security model

- Markdown output is sanitized before insertion.
- Mermaid uses strict security, disables HTML labels, and passes generated SVG through another sanitization/parsing step.
- Plugin code is checked by `PluginValidator` before activation.
- Optional renderers are bundled locally and do not fetch runtime code.
- Native operations pass through Tauri commands/plugins and configured capabilities.

Renderer sanitization and native filesystem permissions are high-risk areas. Changes require adversarial tests, not only visual confirmation.

## Styling

`src/styles.css` contains the current base styles. Feature, theme, and print styles live below `src/styles/` and are loaded through `StyleManager` where appropriate.

The base stylesheet remains a major modularization target. New work should prefer a feature or theme stylesheet when ownership is clear and should avoid adding another competing style source.

## Testing

Tests live in `src/tests` and run with:

```powershell
npm test
```

Current coverage includes startup staging, component lifecycle, native-window listener disposal and file forwarding, browser/native file-drop routing and teardown, document/editor/Preview/toolbar lifecycle routing, welcome/modal routing and teardown, tab/session safety, path identity, CodeMirror loading and commands, scroll coordination, toolbar state, keyboard shortcuts, plugin lifecycle/configuration, renderer isolation, math detection, Mermaid sanitization, and system status.

Every behavioral batch also requires a production frontend build and user-approved native smoke test:

```powershell
npm run build:web
npm run tauri dev
```

## Current refactoring priorities

1. Continue extracting responsibilities from `MarkdownEditor`, `ToolbarComponent`, `TabUIController`, and `PreviewComponent`.
2. Split the base stylesheet by component ownership.
3. Reduce startup and editor bundle cost for low-end systems.
4. Harden filesystem and native behavior consistently on Windows and Linux.
5. Prepare repeatable release builds and platform smoke tests.

WYSIWYG editing, spreadsheets, and presentations remain future features. Their implementations should use independent modules/plugins rather than adding feature-specific branches to the core Markdown path.
