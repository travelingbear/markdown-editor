# Markdown Editor — Next Agent Handoff

## Repository and application

- Repository root: `C:\Users\Francisco\Documents\PROJECTS\markdown-editor`
- Application root: `C:\Users\Francisco\Documents\PROJECTS\markdown-editor\Markdown Viewer`
- Stack: Tauri 2, vanilla JavaScript components/controllers, CodeMirror 6, Vite, Vitest, and Rust.
- The application must remain fully self-contained and usable offline. KaTeX and Mermaid are bundled, plugin-owned, and lazy-loaded only when Extended rendering needs them.

## Required working agreement

The user manually tests and approves every behavioral fix or refactoring batch before work moves to the next batch.

For each batch:

1. Make one bounded change.
2. Update `README.md`, `USER_MANUAL.md`, `CHANGELOG.md`, and `TECHNICAL_DOCUMENTATION.md` when behavior or architecture changes.
3. Run focused tests, the full test suite, `npm run build:web`, and checks proportional to the native risk.
4. Give the user exact test steps, expected results, and deliverables.
5. Stop and wait for explicit approval.
6. Commit only approved work.

Preserve unrelated user changes. Use `apply_patch` for source/document edits. Do not reintroduce remote CDNs, Monaco, or the removed typewriter-sound plugin.

## Completed and approved

The broad modernization checkpoint precedes this handoff. Use `git log --oneline` for its exact history.

The latest approved batch started pipeline item 2 (decomposition) and fixed
reported Markdown rendering bugs:

- Extracted the Link and Image insert flow out of `ToolbarComponent` into `MarkdownDialogController` plus a pure `markdownInsertSyntax` module, taking the component from 1,120 to 788 lines. Fixed the dialogs never releasing any listener, and a dropdown menu being reparented to `<body>` and never returned.
- Fixed multi-line display math being destroyed by Markdown parsing. Renderers now have a `transformMarkdown` phase that runs before `marked`, and KaTeX renders each formula from the source, so a `$$` block containing a lone `=` line no longer becomes a setext heading that swallows the closing tag and leaves an unclosed `<h1>` dragging the rest of the document to heading size.
- Fixed fenced code never being recognised as closed in CRLF documents, which had hidden most math in Windows-authored files.
- Retuned the Markdown toolbar collapse breakpoints from the CSS box model; they had been ~25% below what the row actually needs.
- Gave the Mermaid runtime-loading test an explicit 30s timeout; it imports the real bundled runtime and intermittently exceeded the 5s default under parallel load.

The preceding approved batch completed pipeline item 2 (composition root):

- Reduced `MarkdownEditor` to construction, injection, initialization, startup staging, the error boundary, and disposal. `setupComponentCommunication()` is gone; every cross-component event has an owning controller that also removes it. 762 to 608 lines.
- Added `StatusBarController` (cursor position and the untabbed document name) and `SearchController` (editor adapter in Code/Split, native find in Preview).
- Moved fullscreen into `NativeWindowController`, the welcome application state into `WelcomeController`, tab-switch requests into `TabSessionController`, sync-button mode tracking into `ScrollCoordinator`, and the `FileController` new/error transitions into `DocumentLifecycleController`.
- Routed export failures straight to the injected error boundary, since export is reachable from both the toolbar and Preview.
- Added `src/tests/composition-root.test.js`, which pins the root's method surface, proves every registered controller is constructed and staged in `bootstrap.js` before the root, and proves teardown order and single disposal.
- Removed a dead `debounce()` helper.

The preceding approved batch completed the Settings/UI coordination item and two reported layout bugs:

- Extracted Settings/UI/Plugin Manager communication into `src/components/controllers/SettingsCoordinator.js`, owner of the 11 events connecting `SettingsController`, `UIController`, `TabUIController`, and the Plugin Manager, with listener and timer teardown.
- Made `refreshSettingsDisplay()` the one canonical Settings refresh for every entry point: toolbar, `Ctrl+,`, welcome screen, status-bar tab manager, and the Plugin Manager return flow.
- Removed the duplicate Settings renderer in `UIController`, which painted the same controls from a second copy of the preference state; `UIController` dropped from 590 to 471 lines.
- Replaced cross-controller field mutation with explicit methods: `SettingsController.setToolbarEnabled()`, `ToolbarComponent.setToolbarEnabled()`, and `SettingsController.syncTheme()`.
- Fixed the Markdown toolbar On/Off buttons going stale when `Ctrl+Shift+/` was used while Settings was open.
- Fixed Settings highlighting the previously chosen theme after the toolbar button or `Ctrl+T` changed it. `UIController.setTheme()` is the canonical theme write path and `SettingsController` now adopts its result.
- Fixed main toolbar labels/icons spilling outside buttons at Large, and the Retro theme ignoring the toolbar size entirely. Toolbar geometry now lives in `--main-toolbar-*` tokens that every theme reads, and controls use `min-height` instead of `height`.
- Fixed the Markdown toolbar painting over the Preview pane in a vertical split. Formatting groups moved into a shrinkable `.toolbar-primary` region, More/search are pinned with `flex: 0 0 auto`, the toolbar clips only its inline axis, and the More menu is sized in `cqi` against the code pane.
- Reduced `MarkdownEditor.js` from 845 to 762 lines; `setupComponentCommunication()` is down to five listeners.
- Updated all four required documentation files.

The batch before that completed toolbar command routing:

- Extracted all toolbar command routing into `src/components/controllers/ToolbarLifecycleController.js`, the sole owner of the 22 `ToolbarComponent` output events.
- Covered file new/open/save/save-as/close/reload, mode changes, exports, distraction-free/theme/Settings/Help, quick rendering and pinned-tab toggles, font size, Preview zoom, undo/redo, Markdown actions/inserts, and find/replace.
- Removed every toolbar listener from `MarkdownEditor`; `ToolbarComponent` still owns only toolbar DOM, responsive presentation, and menus.
- Fixed the toolbar theme button applying the theme twice. `UIController.setTheme()` emits `theme-changed`, which the composition root already handles, so the toolbar now only calls `toggleTheme()` and matches `Ctrl+T`.
- Reduced `MarkdownEditor.js` from 906 to 845 lines.
- Added `src/tests/toolbar-lifecycle-controller.test.js` covering routing, the single theme path, complete teardown, and no double-binding on reinitialization.
- Updated all four required documentation files.

Earlier still, the Preview lifecycle extraction:

- Extracted all Preview event/command ownership into `src/components/controllers/PreviewLifecycleController.js` with deterministic listener and timer teardown.
- Routed reload, sync, restart, export, task toggle, external link, renderer status, errors, and post-render scroll alignment through that controller.
- Added `ScrollCoordinator.alignPreviewFromEditor()` and guarded delayed Preview work against active-tab changes.
- Reduced `MarkdownEditor.js` from 1,046 to 906 lines.
- Added `src/rendering/taskSyntax.js` for fenced-code-aware task discovery and exact source-line updates.
- Fixed similar/repeated task labels updating the wrong source or opening a conflict warning.
- Normalized standalone, top-level, and nested task labels so checked-state color is consistent and a checked parent does not dim its children.
- Updated all four required documentation files.

Validation at handoff:

- `53` Vitest files passed.
- `316` tests passed.
- `npm run build:web` passed.
- `cargo check` passed during the Preview-lifecycle batch. The batches since then changed no Rust, native commands, or capabilities, so it was not rerun.
- `git diff --check` passed; Git may still print informational LF-to-CRLF warnings on Windows.
- Expected development startup log: `[Bootstrap] 45 modules ready ...`.

## Known open issue (deferred by the user)

**Markdown toolbar leaves unused width before the More button.** In a narrow code
pane a formatting group collapses into More while there is still visibly room for
it, so an empty gap sits between the last formatting button and the pinned
More/Find controls. The user has accepted the current behaviour for now.

Cause: the collapse breakpoints in `styles/features/markdown-toolbar.css` are
derived from the CSS box model rather than measured, and are deliberately
conservative so the row can never overflow into Preview. See the technical
documentation's Styling section for how they are computed.

Constraints learned the hard way while attempting this:

- This project has **no browser-based test runner** — only jsdom, which has no
  layout engine. Flexbox, wrapping, and `offsetTop`/`offsetParent` cannot be
  verified here. Two attempted fixes passed their tests and still failed in the
  application. Do not ship a layout change validated only in jsdom.
- A `flex-wrap`/`max-height` single-row variant and a `ResizeObserver`-based
  measurement controller were both tried and reverted; neither could be verified.
- Find & Replace must stay pinned at the right edge of the toolbar, with More
  beside it. Moving either control was explicitly rejected.
- What jsdom *can* verify: DOM order, and static analysis of the container
  queries. `src/tests/toolbar-layout-styles.test.js` and
  `src/tests/toolbar-overflow-placement.test.js` use both.

The safe fix is either an accurate measurement pass validated in a real browser,
or lowering individual tiers against observed pane widths reported by the user.

## Remaining agreed pipeline

Do these in order and treat each numbered item as a separate approval boundary.

### 2. Decompose the largest remaining modules

Current approximate sizes at handoff:

- `styles.css`: 3,724 lines (handled primarily in item 3).
- `styles/themes/retro.css`: 1,228 lines.
- `ToolbarComponent.js`: 788 lines (Link/Image dialogs already extracted).
- `performance-optimizer.js`: 1,004 lines.
- `TabUIController.js`: 974 lines.
- `PreviewComponent.js`: 946 lines.
- `HorizontalSplitPlugin.js`: 911 lines.

Handle one module/subsystem per approval batch. Extract cohesive pure helpers or controllers with explicit dependencies. Avoid moving code solely to reduce line counts. Good boundaries include toolbar layout/menu presentation, tab drag/reorder UI, Preview post-processing, performance measurements versus virtualization, and horizontal-split layout/settings.

Preserve:

- Per-tab content and Code/Preview/Split scroll state.
- Full-path file identity for same-named files in different directories.
- Virtual/dormant pinned-tab activation and close behavior.
- Native and pinned tab reordering.
- Windows/Linux file, search, shortcut, and path behavior.
- Plugin lifecycle isolation and lazy rendering.

### 3. Modularize CSS

Current CSS already has `styles/features`, `styles/themes`, and `styles/utilities`; continue that structure.

Goal:

- Split component-owned blocks out of the 3,724-line `src/styles.css`.
- Keep only shared tokens, reset/base layout, and genuinely global rules in the base stylesheet.
- Preserve loading order and theme overrides.
- Avoid visual changes in a mechanical extraction batch.
- Then, if useful, simplify the 1,228-line Retro theme as a separate approval batch.

Manually compare Light, Dark, and Retro across welcome, toolbar, Settings, Plugin Manager, tabs, Code, Preview, vertical/horizontal Split, dialogs, task lists, code blocks, Mermaid, KaTeX, and responsive widths.

## Final audit after items 2–3

- Run the full automated suite and `npm run build:web`.
- Run `cargo check` and native development smoke tests.
- Test on Windows and Linux, especially native file dialogs, full path identity, open-many-files behavior, Ctrl+F/Ctrl+H, Ctrl+1/2/3 and Ctrl+Shift+1/2/3, drag/drop, external links, application-close session preservation, and document-close unsaved prompts.
- Review startup, 50-file opening, tab switching, memory cleanup, and lazy CodeMirror/KaTeX/Mermaid loading on low-end hardware.
- Audit offline behavior with the network unavailable.
- Confirm README/manual/changelog/technical documentation agree.
- Prepare repeatable Windows and Linux release builds.

The Vite production build currently reports an informational warning for chunks over 500 kB, notably CodeMirror and a Mermaid dependency chunk. Treat bundle reduction as a measured performance task; do not replace CodeMirror or break lazy plugin loading merely to silence the warning.

## Commands

Run from `Markdown Viewer`:

```powershell
npm test -- --run
npm run build:web
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri dev
```

For focused work, run only the relevant Vitest files first, then the full suite before handoff. Do not run `npm run tauri build` for every small batch unless packaging behavior changed; native smoke testing remains the user's approval step.

## Deferred product work

Do not start these during the current pipeline:

- WYSIWYG editing.
- Spreadsheet functionality.
- Presentation functionality.

They should later be implemented as independent modules/plugins rather than branches in the core Markdown rendering path.
