# Changelog

## Unreleased (2026-08-22)

### Architecture and Performance
- Replaced Monaco with a lighter CodeMirror editor adapter and removed obsolete Monaco-only settings.
- Introduced staged component startup, controller separation, renderer registration, and failure-isolated plugin lifecycle cleanup.
- Removed the unreachable legacy monolith, duplicate component entry point, console-only extension experiment, and unregistered Sample Plugin; the maintained bootstrap and plugin registry are now the only runtime paths.
- Consolidated overlapping and obsolete guides into one user manual, a rewritten current technical overview, and an updated Tauri 2/Vite 8 build guide; also removed duplicate root runtime files and the empty root lockfile.
- Removed approximately 4.7 MB of unreferenced source artwork, template logos, duplicate native icons, PWA-only files, and unused Retro audio formats; the welcome screen now reuses the compact branded favicon instead of shipping a 1.05 MB traced SVG.
- Removed broken favicon, Apple touch icon, and web-manifest references from the native application shell and added automated static-reference validation.
- Added Pure Markdown and Extended rendering modes; optional renderers do not run in Pure mode.
- Split KaTeX and Mermaid into lazy renderer chunks. Neither runtime is part of the core Preview component, and HTML export only receives plugin styles when the rendered feature is present.
- Removed obsolete duplicate KaTeX and Mermaid distribution assets; the application now has one locally bundled source for each renderer.
- Improved multi-file opening, virtual-tab cleanup, memory cleanup, and large-session handling.
- Extracted native window close, focus, and single-instance integration from `MarkdownEditor` into a lifecycle-managed controller; forwarded files now use the existing batch-open path, native listeners are removed during teardown, and duplicate startup-file handling was eliminated.
- Extracted browser and Tauri file-drop behavior into `FileDropController`, removed redundant unmanaged DOM listeners, added complete listener teardown, retained full-path duplicate detection where the platform supplies a path, and fixed the native hover overlay remaining visible after a completed drop.
- Removed the unreachable duplicate shortcut implementation from `MarkdownEditor` and replaced `KeyboardController`'s composition-root dependency with explicit services and actions.
- Extracted vertical pane resizing into `SplitPaneController`, added complete mouse-listener and animation-frame cleanup, and coalesced repeated editor relayout work during rapid dragging.
- Moved next/previous navigation into `TabSessionController` and context-menu commands into `TabUIController`, removing the remaining tab-command pass-through methods from `MarkdownEditor`.
- Extracted welcome-screen commands into `WelcomeController`, routed recent-history clearing through `FileController`, and made welcome and UI modal listeners disposable.
- Extracted file-open batches, full-path duplicate handling, document dirty/save transitions, and document-to-tab updates into a lifecycle-managed controller with complete listener teardown.
- Extracted editor content, cursor, lazy-load status, and markdown-command routing into a lifecycle-managed controller so tab/document/preview state follows one synchronization path; fallback-textarea DOM listeners are now also removed during teardown.
- Fixed repeated Italic commands accumulating asterisks on combined bold-and-italic selections; single-line and multi-line toggles now remove only the italic layer and preserve bold.
- Extracted task interaction, safe external links, renderer status refresh, Preview context commands, exports, and post-render scroll restoration into `PreviewLifecycleController`; all Preview listeners and delayed tasks now have deterministic teardown, and delayed task/sync work cannot spill into a newly selected tab.
- Replaced fuzzy Preview-task identification with fenced-code-aware source-line mapping, preventing similar or repeated checkbox labels from triggering conflict warnings or updating the wrong Markdown line.
- Normalized Preview task labels so checked-state styling is consistent for standalone, top-level, and nested checkboxes without dimming child tasks with their parent.
- Extracted toolbar command routing into `ToolbarLifecycleController`; `MarkdownEditor` no longer registers toolbar listeners, and every toolbar command has one owner with deterministic teardown.
- Fixed the toolbar theme button applying the theme twice, which re-rendered Preview and re-applied the current view mode on every toggle; toolbar and `Ctrl+T` now follow the same single theme path.
- Extracted Settings, UI, and Plugin Manager communication into `SettingsCoordinator`; theme application, rendering mode, pinned tabs, quick-control pins, and the Settings refresh now have one owner with deterministic listener and timer teardown.
- Removed a duplicate Settings modal renderer that painted the same controls from a second copy of the preference state; opening Settings from any entry point now renders once from `SettingsController`.
- Fixed the Markdown toolbar On/Off buttons showing a stale value when the toolbar was toggled with `Ctrl+Shift+/` while Settings was open; the shortcut and the Settings buttons now share one write path.
- Fixed Settings highlighting the previously chosen theme after the theme was changed with the toolbar button or `Ctrl+T`. `SettingsController` kept an independent copy of the theme that only its own buttons updated; it now adopts whichever theme was actually applied, including the Retro-only settings that depend on it.
- Reduced `MarkdownEditor` to a composition root. It now only constructs, injects, initializes, and disposes; `setupComponentCommunication()` is gone because every cross-component event has an owning controller that also removes it.
- Added `StatusBarController` for the cursor and document-name readouts, and `SearchController` for find/replace routing between the editor adapter and the browser's native find.
- Moved fullscreen into `NativeWindowController`, the welcome application state into `WelcomeController`, tab-switch requests into `TabSessionController`, sync-button mode tracking into `ScrollCoordinator`, and the `FileController` new/error transitions into `DocumentLifecycleController`.
- Routed export failures straight to the application error boundary, since export is reachable from both the toolbar and Preview and neither routing controller owns its failures.
- Extracted the Link and Image insert flow out of `ToolbarComponent` into `MarkdownDialogController`, taking it from 1,120 to 787 lines, and split the link/image Markdown construction into a pure, directly testable `markdownInsertSyntax` module.
- Fixed the Markdown insert dialogs never releasing their listeners: the dropdowns, both dialogs, the image tabs, the drop zone, and the file input had no teardown at all, and a pending focus timer could fire after disposal.
- Fixed a link or image dropdown menu being moved to `<body>` on first use and never returned; the restore looked for a container id that does not exist in the shell.

### Markdown Rendering Fixes
- Extracted the Preview post-parse HTML pipeline into a pure `rendering/previewHtml.js` module — task-list fallback, footnotes, super/subscript, link normalization, image tagging, and href validation — taking `PreviewComponent` from 946 to 725 lines and making every transform directly testable.
- Removed the unreachable list-converting branches from the task-list fallback. `marked` already converts `- [ ]` into a checkbox, so those branches only ever ran on hand-written HTML lists, where a nested list produced malformed markup with an unclosed element inside a label. Standalone `[x] text` paragraphs, which `marked` does leave alone, still become checkboxes.
- Fixed multi-line display math being destroyed by Markdown parsing. A `$$` block containing a line break, or a lone `=` line as in a matrix product, was split across a setext heading and a paragraph before KaTeX ran; matching `$$...$$` in the resulting HTML then swallowed the closing `</h1>` and left an unclosed heading, so the block rendered with visible HTML tags and everything after it was drawn at heading size. Renderers now have a `transformMarkdown` phase that runs before parsing, and KaTeX renders each formula from the source.
- Fixed blockquotes and inline math appearing at heading size after such a math block, which was that same unclosed heading.
- Fixed inline math being larger than the text around it; it now matches the surrounding sentence, while display blocks stay slightly larger.
- Code fences and inline code are now protected from math detection at the source rather than by inspecting parsed HTML, so `$` inside code stays literal in every position.
- Fixed fenced code blocks never being recognised as closed in documents saved with Windows CRLF line endings. The closing-fence check required a bare newline, so the first fence absorbed the rest of the file and math after any code block went undetected.
- An invalid formula kept as source no longer has its surrounding paragraph removed.

### Toolbar Layout Fixes
- Fixed main toolbar labels and icons spilling outside their buttons at the Large size in Light, Dark, and High Contrast. Buttons were pinned to a fixed height that was smaller than the text line box; they now centre their content in a box that grows when needed.
- Fixed the Retro theme ignoring the main toolbar size setting. Toolbar geometry moved into shared size tokens that every theme reads, so Retro keeps its own look while still following Small, Medium, and Large. Retro button text remains one pixel smaller than the other themes at each size.
- Fixed the Markdown toolbar painting over the Preview pane in a vertical split, where the search button could appear inside Preview on narrow or portrait displays. Formatting groups now occupy a shrinkable region, the More and search controls are pinned inside the code pane, and the toolbar clips its inline axis while still letting dropdowns open downwards.
- Sized the Markdown toolbar More menu against the code pane instead of the window so it cannot extend past the pane in a split view.
- Applied the same fixed-height fix to the Markdown toolbar buttons and made split-button arrows match their button height at every size.
- Fixed the pinned Find & Replace and More controls appearing to sit on top of the formatting buttons in a narrow code pane. The responsive breakpoints collapsed the toolbar far later than it actually needed: at the Medium size the full row requires about 1278px but only began collapsing below 1000px, so across that whole band the row overflowed and the clip sliced a button in half. Every breakpoint is now derived from the CSS box model with a margin for font rendering and the Retro theme.
- Removed the fixed height on Markdown split-button arrows, which exceeded the button height at the Small size.

### Plugin System
- Added a dedicated Plugin Manager modal with a General tab and one settings tab per plugin.
- Fixed repeated Enable/Disable actions becoming stuck in transitional states.
- Added persistent, scoped plugin settings and reliable reset, reload, pause, activation, deactivation, and cleanup behavior.
- Migrated Horizontal Split settings into plugin-owned configuration while preserving existing user choices.
- Removed the Typewriter Sounds plugin and its audio assets because crackling playback could not be made consistently reliable across systems.
- Added an ordered renderer registry so future math, diagram, spreadsheet, and presentation renderers can remain modular.

### KaTeX Math Renderer
- Converted KaTeX into a separately configurable renderer plugin that is enabled once by default for compatibility and remembers later user choices.
- Added strict math detection that ignores prices, escaped dollars, shell variables, ordinary prose, inline code, and fenced code blocks.
- Added Permissive detection for documents that depend on legacy dollar-delimiter behavior.
- Added independent Inline `$…$` and Display `$$…$$` controls.
- Added Keep Source and Show Warning behavior for invalid formulas.
- Added lazy runtime/version reporting and accurate Disabled, Not Loaded, and Loaded System Info states.
- Added one-second explanatory hover popups for every KaTeX configuration.

### Mermaid Diagram Renderer
- Converted Mermaid into a separately configurable renderer plugin that is enabled once by default for compatibility and remembers later user choices.
- Removed Mermaid-specific runtime state, HTML transformation, SVG rendering, error handling, theming, and CSS from the Preview core.
- Added Application, Default, Dark, Neutral, and Forest diagram themes plus a maximum-width control.
- Added Keep Source and Show Warning behavior for invalid diagrams, preserving readable source when the renderer is disabled or fails.
- Kept Mermaid at strict security, disabled embedded HTML labels, and retained a second SVG sanitization pass while preserving visible native SVG text labels.
- Uses parsed DOM nodes rather than direct HTML assignment, allowing the renderer to pass the same security validation applied to every plugin at activation.
- Pinned the bundled Mermaid runtime version and removed a development-time `package.json` dynamic import that Tauri's local server could not serve.
- Renamed the read-only KaTeX and Mermaid runtime rows to Bundled Runtime so they are not mistaken for version selectors.
- Added lazy local runtime/version reporting and accurate Disabled, Not Loaded, and Loaded System Info states.
- Added one-second explanatory hover popups for every Mermaid configuration.

### Editing and Rendering Fixes
- Fixed Markdown rendering stopping when switching between Pure and Extended modes.
- Fixed Mermaid text labels disappearing after SVG sanitization.
- Restored readable 14px fenced-code typography in the Retro preview instead of inheriting the theme's approximately 10px scaled size.
- Fixed Code mode search on Linux and made Ctrl+F/Ctrl+H and the toolbar search button toggle their widgets closed when invoked again.
- Fixed undo/redo skipping multiple edits.
- Fixed dark-theme editor token contrast and theme synchronization.
- Added responsive Markdown toolbar overflow behavior and corrected toolbar visibility when changing split orientation.
- Prevented the core vertical splitter from changing pane widths while the Horizontal Split plugin is resizing pane heights.
- Restored mode shortcuts on Ctrl+Shift+1/2/3 and heading shortcuts on Ctrl+1/2/3 in Code mode.
- Fixed Ctrl+P PDF/print export, Ctrl+Shift+E HTML export, and Ctrl+Shift+M tab-manager shortcuts calling nonexistent orchestrator methods; corrected the in-app help and manual to distinguish the tab manager from Ctrl+Shift+Tab previous-tab navigation.

### Tabs, Files, and Session Safety
- Added unsaved-change highlighting and confirmation when closing individual documents.
- Restored silent application close: the complete tab session, including modified content and dirty markers, is preserved for the next launch without showing a save prompt.
- Fixed file loading and duplicate detection so identity uses the normalized full path rather than filename alone.
- Added drag reordering with clearer drop positions to Pinned Tabs and the status-bar tab manager.
- Fixed dormant pinned tabs failing to activate after temporary documents were closed.
- Fixed tab order, virtual-tab clearing, and memory-cleanup controls.
- Added per-document scroll state and synchronized Code, Preview, and Split positions without leaking one tab's position into another.
- Removed the duplicate Alt+1–9 global listener, added deterministic next/previous wraparound even when restored active state is missing, and retained move, close, duplicate, pin, and reveal context actions under their tab UI owner.

### Interface
- Fixed splash/welcome-screen flashes, alignment, and mode switching when no document is loaded.
- Prevented the Retro startup sound from pausing during cold starts by fully loading and decoding the local clip before playback.
- Added optional persistent toolbar pins for Markdown rendering and Pinned Tabs.
- Added compact wide-window controls and a separated, state-labelled Quick menu on narrower windows.
- Replaced toolbar pin buttons in Settings with simple Pinned checkboxes.
- Unified Settings opening from the welcome screen, toolbar, keyboard, and Plugin Manager return flow so performance, system, and plugin data refresh through one immediate event instead of delayed per-button timers.
- Improved responsive toolbar breakpoints, dropdown appearance, active states, and dark-theme visibility.

### Quality
- Added automated coverage for plugin lifecycle, renderer isolation, KaTeX false positives, sanitized math rendering, lazy and sanitized Mermaid rendering, readable diagram fallback, path identity, tab ordering, session state, scroll coordination, shortcuts, and responsive toolbar settings.

## Version 3.2.1 (2025-09-14)

### Bug Fixes
- **KaTeX rendering issues**: Fixed minor rendering issues with Math expressions

### New plugins!
- **Horizontal Split mode**: Allows split mode in horizontal orientation (that helps giving a typewriter feeling to the application)

## Version 3.2.0 (2025-01-07)

### Major Features
- **Dynamic CSS Loading Architecture**: Complete CSS refactoring with on-demand theme and feature loading
- **Modular CSS System**: Themes and features now load dynamically, reducing initial bundle size by 50%
- **Enhanced Performance**: Faster startup with lean core CSS and dynamic loading
- **Tab Limit Enforcement**: Proper 50 tab limit with warnings at 45 tabs and blocking at 50 tabs
- **Comprehensive Documentation**: Added detailed CSS architecture and development guides

### CSS Architecture Improvements
- **StyleManager**: New dynamic CSS loading system with smooth transitions
- **Theme Extraction**: Dark, Retro, and Contrast themes now load on-demand
- **Feature Extraction**: Markdown toolbar, settings modal, and tab system CSS extracted to separate files
- **Print Optimization**: Print styles now load only when printing
- **Bundle Analysis**: Added script to measure CSS optimization results

### Performance Enhancements
- **Theme Preloading**: Popular themes preloaded for faster switching
- **Smooth Transitions**: CSS transition effects for theme switching
- **Memory Optimization**: Reduced memory usage with modular loading
- **Performance Metrics**: Enhanced performance tracking and reporting

### Bug Fixes
- **Tab Limit Issues**: Fixed New File button not working at 49+ tabs
- **Theme Compatibility**: Fixed theme CSS files to support both class and data-attribute selectors
- **Performance Dashboard**: Updated status thresholds to match 50 tab limit

### Documentation
- **CSS Architecture Guide**: Complete guide to dynamic CSS system and development
- **Examples & Tutorials**: Practical examples for theme and feature development
- **Extension Guidelines**: Comprehensive plugin and extension development guide
- **Technical Architecture Documentation**: Complete refactoring documentation with plugin development guide
- **REFACTORING_PLAN.md**: Detailed 5-phase refactoring plan with validation checkpoints

### Architecture Refactoring
- **Plugin System Implementation**: Complete plugin architecture with PluginManager, PluginLoader, PluginValidator, and PluginConfig
- **Controller Extraction**: Refactored monolithic MarkdownEditor into 8 specialized controllers:
  - FileController (187 lines) - File operations and drag & drop
  - UIController - Theme management and modal dialogs
  - KeyboardController - All keyboard shortcuts and navigation
  - SettingsController - Settings persistence and performance monitoring
  - TabUIController - Tab UI management and context menus
  - ModeController (198 lines) - View mode switching and layout
  - MarkdownActionController (495 lines) - Markdown formatting actions
  - ExportController (154 lines) - HTML/PDF export functionality
- **Hook System**: Event-driven architecture with 20+ extension points across controllers
- **Extension API**: Comprehensive plugin API with controller access and lifecycle management
- **Dependency Injection**: Controller registry with runtime registration and replacement
- **Component Architecture**: BaseComponent class with standardized lifecycle and performance monitoring

### Technical Changes
- Extracted 1000+ lines of CSS to modular files
- Implemented StyleManager with async loading and error handling
- Added performance optimization with dark theme preloading
- Updated PerformanceOptimizer with proper 50 tab limit enforcement
- Enhanced FileController with proper tab limit warnings and blocking
- Reduced MarkdownEditor.js from ~3000 to ~1000 lines through controller extraction
- Added comprehensive plugin validation with security pattern detection
- Implemented plugin configuration system with localStorage persistence

## Version 3.1.3 (2025-01-07)

### Improvements
- **Find Widget Toggle**: Enhanced Find & Replace functionality with proper toggle behavior - clicking the Find button or pressing Ctrl+F/Cmd+F now opens and closes the find widget
- **Find Widget Overlay**: Find widget now appears as an overlay in the top-right corner without pushing editor content down
- **Monaco Editor Configuration**: Added find widget overlay configuration to prevent layout disruption

### Technical Changes
- Enhanced Monaco Editor find widget configuration with `addExtraSpaceOnTop: false`
- Improved find widget CSS positioning for overlay behavior
- Updated find widget toggle logic using Monaco's internal state management

## Version 3.1.2 (2025-01-07)

### Improvements
- **Extended Tab Shortcuts**: Extended tab switching shortcuts from Alt+1-5 to Alt+1-9 (Cmd+1-9 on macOS) to support cycling through more tabs
- **Auto-scroll Enhancement**: Added auto-scrolling functionality for pinned tabs and dropdown lists when cycling through tabs beyond visible window
- **Keyboard Shortcut Optimization**: Swapped mode switching shortcuts (now Ctrl+Shift+1-3) with heading shortcuts (now Ctrl+1-3) to make headings more accessible in code mode

### Technical Changes
- Enhanced tab management with auto-scroll support for better navigation
- Improved keyboard shortcut handling for more intuitive editing experience
- Updated help modal and documentation to reflect new shortcut mappings

## Version 3.1.1 (2025-01-07)

### Bug Fixes
- **F11 Fullscreen**: Fixed F11 key not toggling fullscreen mode by adding missing Tauri permissions
- **Tab Clicking Issue**: Fixed virtualized tabs (beyond first 10) not being clickable with 50+ tabs open
- **Performance Optimization**: Removed debug logging and optimized tab switching for better performance
- **Browser Compatibility**: Added fallback for `requestIdleCallback` API in environments that don't support it
- **Performance Monitor**: Fixed Performance Monitor section to update when Clear Tabs or Clean Memory buttons are clicked

### Technical Changes
- Added `core:window:allow-set-fullscreen` and `core:window:allow-is-fullscreen` permissions
- Fixed performance optimizer to only virtualize real tabs instead of creating fake tab IDs
- Improved tab restoration logic for virtualized tabs
- Optimized tab switching performance by removing unnecessary operations

## Version 3.1.0 (2025-09-06)

### New Features
- **Scroll Sync Button**: Added manual scroll synchronization between Code and Preview modes
- **Pinned Tabs Bar**: Optional horizontal tabs bar above status bar with numbering (1-5)
- **Retro Theme**: Added Windows 3.1-style retro theme with authentic styling
- **Enhanced Tab Management**: Fixed pinned tabs population when enabled after startup

### Improvements
- **Default Mode Fix**: Documents now properly open in user's default mode setting
- **Zoom Controls Visibility**: Fixed zoom controls not appearing in Preview mode on first load
- **Tab Closing Animation**: Improved animation timing and unsaved changes confirmation order
- **Memory Management**: Enhanced virtual tabs cleanup to prevent memory leaks
- **Distraction-Free Mode**: Pinned tabs now properly hidden in distraction-free mode
- **Retro Theme Save Button**: Added visual indication for dirty files in retro theme

### Bug Fixes
- Fixed tab loading preventing welcome screen from staying active during initialization
- Fixed automatic tab reordering when switching beyond position 5
- Fixed virtual tabs memory leak when closing all tabs
- Fixed pinned tabs not showing existing tabs when enabled after startup

### Technical Changes
- Enhanced scrollbar styling for dark theme with better contrast
- Improved performance monitoring with virtual tabs cleanup
- Updated UI positioning and styling consistency across themes

## Version 3.0.0 (Previous Release)

### Major Features
- Multi-tab interface with smart tab management
- Three-mode interface (Code, Preview, Split)
- Monaco Editor integration
- Real-time preview with GitHub-flavored markdown
- Advanced rendering (KaTeX math, Mermaid diagrams)
- Performance optimization and monitoring
- Export options (HTML, PDF)
- Customizable interface and themes
