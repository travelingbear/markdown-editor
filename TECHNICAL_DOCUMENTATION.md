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

`MarkdownEditor` is the application composition root and nothing else. It constructs components and controllers, injects their dependencies, orders initialization, stages startup progress, provides the error boundary, and disposes everything. It registers no component event listeners of its own: every cross-component event has an owning controller that also removes it. Business logic and platform integration belong in focused controllers rather than expanding this class.

Its full method surface is `constructor`, `onInit`, `createComponents`, `applyInitialSettings`, `setupGlobalEventHandlers`, `updateSplashProgress`, `hideSplash`, `handleInitializationError`, `handleError`, and `onDestroy`. `src/tests/composition-root.test.js` pins that surface, proves every registered controller is constructed and staged in `bootstrap.js` before the root, and proves teardown order and single disposal.

### Components

- `DocumentComponent` owns the current file content, path, dirty transition, and native open/save operations.
- `EditorComponent` presents the editor abstraction to the application.
- `PreviewComponent` owns base Markdown parsing, sanitization, preview updates, renderer-registry integration, and per-task label normalization so checked styling remains isolated across nested lists. Its post-parse HTML transforms live in `rendering/previewHtml.js`.
- `ToolbarComponent` owns main-toolbar and Markdown-toolbar DOM behaviour, responsive presentation, and its own menus, and emits commands rather than performing file or editor work directly. The Link and Image insert flow is not part of it.
- `TabState`, `TabCollection`, and `TabManager` own persistent per-document state and collection operations.

### Controllers

- `FileController`: new/open/save/reload workflows.
- `FileDropController`: browser and Tauri file-drop normalization, open-versus-insert routing, overlay state, and listener cleanup.
- `DocumentLifecycleController`: file-open batches, full-path duplicate routing, new/close/dirty/save transitions, external document-content updates, and the `FileController` side of the same transitions including its failures.
- `EditorLifecycleController`: editor content propagation, cursor persistence, lazy-load status refresh, markdown-command routing, and application-listener teardown. `EditorComponent` separately releases its fallback DOM listeners and editor adapter.
- `PreviewLifecycleController`: task interaction, external-link routing, renderer status, errors, Preview context commands, export routing, post-render scroll restoration, and listener/timer teardown.
- `SettingsCoordinator`: the sole owner of Settings/UI/Plugin Manager communication — theme application, rendering mode, pinned tabs, pinned quick controls, Markdown toolbar visibility, distraction-free forwarding, Retro sound tests, and the one canonical Settings refresh (settings display, performance dashboard, system information, plugin summary) shared by every entry point. Preference values stay in `SettingsController` and presentation stays in `UIController`/`ToolbarComponent`; neither reaches into the other's fields.
- `ToolbarLifecycleController`: the sole owner of toolbar command routing — file new/open/save/save-as/close/reload, mode changes, exports, distraction-free/theme/Settings/Help, quick rendering and pinned-tab controls, font size and Preview zoom, undo/redo, Markdown actions and insertions, find/replace — plus listener teardown. Toolbar intent reaches services through this controller only, so the composition root registers no toolbar listeners.
- `taskSyntax`: pure fenced-code-aware task extraction and exact source-line updates shared by Preview and Markdown actions; visible task text is no longer used as primary identity.
- `horizontalSplitStyles`: the horizontal split stylesheet, held apart from the plugin because it is data rather than behaviour. The plugin mounts and removes it; the base stylesheet carries no horizontal-split rules.
- `tabChrome`: decisions behind the tab context menu and the tab search modal — keeping the menu on screen, which commands apply to a tab, search matching, and the arrow-key edges in a filtered list. Measured values are passed in, so none of it needs a laid-out document.
- `performance/tabPolicy`: which tabs to release under memory pressure — idle for five minutes and rarely visited, least-visited first, longest-idle breaking ties, a few per pass — plus the access average used by the performance report. Pure, so the limits are readable in one place; `PerformanceOptimizer` owns the maps and performs the effects.
- `performance/dashboardView`: pure formatting and thresholds for the Performance Monitor — per-row text and severity classes, plus the overall Good/Warning/Critical status and the tooltip naming what was measured. `PerformanceOptimizer` gathers the measurements and writes the resulting view model to the DOM; the thresholds that decide when the application calls itself slow are readable and tested in one place.
- `previewHtml`: the pure post-parse HTML pipeline — task-list fallback, footnotes, super/subscript, link normalization, image tagging, and href validation. No component state, so the whole pipeline is testable without a mounted Preview. Its task-list step only converts a checkbox written as its own paragraph: GFM task syntax applies inside list items, so `marked` converts `- [ ]` itself and a bare `[x] text` line arrives as an ordinary paragraph. The list-converting branches were removed after a differential check showed they were unreachable from Markdown and emitted malformed markup for nested raw HTML. `.task-list-container`, `.task-list-nested`, and `.task-list-item.nested` are consequently unused selectors, to be dropped with the CSS work.
- `MarkdownActionController`: editor-neutral Markdown insertion and formatting, including independently composable bold and italic toggle layers.
- `MarkdownDialogController`: the Link and Image insert flow — the split-button dropdowns that open it, both dialogs, the image URL/file tabs and drop zone, and the resulting insertion. It reaches `MarkdownActionController` directly rather than routing back through the toolbar, and every listener it registers is removed on teardown.
- `markdownInsertSyntax`: pure link and image Markdown construction shared by those dialogs, testable without DOM.
- `KeyboardController`: the sole application-level keyboard/wheel listener, connected through explicit services and action callbacks rather than the composition root.
- `MarkdownActionController`: formatting commands.
- `ModeController`: Code, Preview, Split, and welcome states.
- `NativeWindowController`: application-close session persistence, single-instance file forwarding, focus restoration, fullscreen, and native listener cleanup.
- `ScrollCoordinator`: per-tab scroll capture, Code/Preview synchronization, and the sync button, which it keeps current by following mode changes itself.
- `SplitPaneController`: bounded vertical pane resizing, editor relayout scheduling, and disposable mouse listeners; horizontal height resizing remains plugin-owned.
- `SearchController`: find/replace routing — the editor adapter in Code and Split, the browser's native find in Preview.
- `SettingsController`: preference loading, persistence, the single write path for each preference, and the canonical Settings modal paint.
- `StatusBarController`: the status bar readouts — cursor position and the untabbed document name, deferring to `TabUIController` whenever tabs exist.
- `TabSessionController`: activation, wraparound navigation, dormant-tab loading, editor documents, tab-switch requests from the tab chrome, and session restoration.
- `TabUIController`: pinned tabs, status-bar tab manager, context commands, menus, and tab reordering.
- `UIController`: themes, layout, modals, and Retro audio. `setTheme()` is the canonical theme write path for the Settings buttons, the toolbar button, and `Ctrl+T` alike; `SettingsController` adopts the result through `syncTheme()` rather than tracking the theme independently. It announces `settings-shown` rather than painting the Settings modal itself, so preference state has one renderer.
- `WelcomeController`: welcome-screen new/open/help/about/settings/history commands, the welcome application state entered when the last document closes, and their DOM listener lifecycle.
- `ExportController`: HTML and PDF/print preparation. Export is reachable from both the toolbar and Preview, so neither routing controller owns its failures; they go straight to the injected error boundary.

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

Renderers run in two phases, both ordered by priority and isolated from each other:

1. `transformMarkdown(markdown, context)` sees the source **before** Markdown is parsed.
2. `transformHtml(html, context)` sees the parsed HTML, and `afterRender(container, context)` sees the mounted DOM.

Any syntax Markdown would otherwise claim belongs in the first phase. A `$$` block spanning several lines is cut apart by paragraphs, `breaks`, and setext headings, so matching it in HTML can span element boundaries and produce unbalanced markup. KaTeX therefore renders each formula from the source and leaves a private-use placeholder that Markdown carries through untouched, then swaps the rendered output back in during the HTML phase. `replaceMathOutsideCode()` keeps fenced and inline code literal at the source level.

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

Two layout rules are load-bearing and covered by tests:

- **Toolbar geometry is tokenized.** `[data-main-toolbar-size]` scopes redefine `--main-toolbar-*` custom properties only; no size rule targets a control directly. Base rules and themes both read those tokens, so a more specific theme selector cannot silently drop the user's size choice. Toolbar controls use `min-height` rather than `height`, because a fixed height smaller than the text line box pushes labels and icons outside the button.
- **The Markdown toolbar is contained by the code pane.** `.toolbar-primary` holds the formatting groups in a shrinkable, inline-clipped region and the More and search controls sit after the spacer with `flex: 0 0 auto`, so nothing can be pushed past the pane edge. `.markdown-toolbar` clips only its inline axis, leaving the block axis visible for dropdowns. `.editor-pane` is the `editor-pane` query container, so responsive collapsing and the More menu width both measure the pane rather than the window — a viewport unit here reappears as overflow into Preview during a vertical split.
- **The collapse breakpoints must exceed what the toolbar actually needs.** Each `@container` tier removes one group and reveals that group's More section, which is what keeps the menu showing only what is not on the toolbar. The widths are derived from the CSS box model — button padding, borders, `min-width`, group gaps, separators, and the pinned controls — plus a margin for font rendering and the Retro theme's thicker borders. They were previously well below the real requirement (Medium needs about 1278px but only started collapsing below 1000px), so between tiers the row overflowed and the clip sliced a button in half. Recompute them if the button metrics change; `src/tests/toolbar-layout-styles.test.js` pins the pairing and the collapse order.
- **Row order is `groups → spacer → More → search`.** The spacer absorbs the leftover width, keeping More and Find & Replace pinned at the toolbar's right edge, and `.md-overflow-container` stays positioned so the menu opens under its button with `right: 0` inside the pane.

## Testing

Tests live in `src/tests` and run with:

```powershell
npm test
```

Current coverage includes startup staging, composition-root wiring and teardown, component lifecycle, native-window listener disposal and file forwarding, browser/native file-drop routing and teardown, document/editor/Preview/toolbar lifecycle routing, welcome/modal routing and teardown, tab/session safety, path identity, CodeMirror loading and commands, scroll coordination, toolbar state, keyboard shortcuts, plugin lifecycle/configuration, renderer isolation, math detection, Mermaid sanitization, and system status.

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
