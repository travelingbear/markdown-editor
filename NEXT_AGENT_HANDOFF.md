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

The latest approved batch completed pipeline item 1:

- Extracted all Preview event/command ownership into `src/components/controllers/PreviewLifecycleController.js` with deterministic listener and timer teardown.
- Routed reload, sync, restart, export, task toggle, external link, renderer status, errors, and post-render scroll alignment through that controller.
- Added `ScrollCoordinator.alignPreviewFromEditor()` and guarded delayed Preview work against active-tab changes.
- Reduced `MarkdownEditor.js` from 1,046 to 906 lines.
- Added `src/rendering/taskSyntax.js` for fenced-code-aware task discovery and exact source-line updates.
- Fixed similar/repeated task labels updating the wrong source or opening a conflict warning.
- Normalized standalone, top-level, and nested task labels so checked-state color is consistent and a checked parent does not dim its children.
- Updated all four required documentation files.

Validation at handoff:

- `43` Vitest files passed.
- `197` tests passed.
- `npm run build:web` passed.
- `cargo check` passed during the Preview-lifecycle batch.
- `git diff --check` passed; Git may still print informational LF-to-CRLF warnings on Windows.
- Expected development startup log: `[Bootstrap] 40 modules ready ...`.

## Remaining agreed pipeline

Do these in order and treat each numbered item as a separate approval boundary.

### 2. Extract toolbar command routing

Current hotspots:

- `src/components/ToolbarComponent.js` — about 1,112 lines.
- `src/components/MarkdownEditor.js` — toolbar event routing is concentrated around the current `429–510` area; line numbers will drift.

Goal:

- Keep `ToolbarComponent` responsible for toolbar DOM, responsive presentation, menus, and emitting intent.
- Move application command routing into a disposable controller, following `EditorLifecycleController` and `PreviewLifecycleController`.
- Cover file new/open/save/save-as/close, mode changes, exports, distraction-free/theme/settings/help, font/zoom, undo/redo, Markdown actions, find/replace, reload, and Markdown insert events.
- Centralize listener registration and teardown. Do not leave duplicate root listeners in `MarkdownEditor`.
- Preserve quick toolbar controls, responsive More menus, shortcut behavior, and dirty/save-button state.

Minimum manual tests:

- Main toolbar file commands and dirty-state highlight.
- Code/Preview/Split switching.
- Undo/redo and Bold/Italic formatting.
- Search toggle via button and keyboard.
- Export, settings, help, theme, distraction-free, and quick settings.
- Horizontal/vertical split toolbar responsiveness.

### 3. Extract Settings/UI coordination

Current hotspots:

- `SettingsController.js` — about 613 lines.
- `UIController.js` — about 590 lines.
- `PluginModalController.js` — about 539 lines.
- `MarkdownEditor.js` currently coordinates settings/UI/plugin events around the area following toolbar routing.

Goal:

- Give one disposable coordinator ownership of Settings/UI/Plugin Manager communication.
- Remove cross-controller state mutation where an event or explicit method can express the change.
- Consolidate opening/closing/return flows, toolbar visibility and size, pinned quick controls, rendering mode, pinned tabs, theme, performance/system information, and plugin settings refresh.
- Preserve lazy plugin runtime status: enabled-but-unused KaTeX/Mermaid must report **Not Loaded**, not **Disabled**.

Minimum manual tests:

- Open Settings from welcome page, toolbar, keyboard, and Plugin Manager return flow.
- Change every toolbar size and enable/disable option.
- Pin/unpin Markdown rendering and Pinned Tabs quick controls.
- Enable/disable/configure each plugin and reopen the manager to confirm persisted values.
- Verify System Info before and after rendering KaTeX/Mermaid.

### 4. Finish the composition root

Goal:

- Make `MarkdownEditor` primarily construct, inject, initialize, and destroy components/controllers.
- Move remaining behavior/event clusters to narrowly owned controllers rather than creating a generic catch-all.
- Ensure every registered listener, timer, adapter, and child component has one teardown owner.
- Keep startup staging in `src/bootstrap.js` explicit and deterministic; update its expected module count if a new bootstrap module is added.

Tests should prove initialization order, injected dependencies, listener teardown, and that reinitialization does not double-bind commands.

### 5. Decompose the largest remaining modules

Current approximate sizes at handoff:

- `styles.css`: 3,703 lines (handled primarily in item 6).
- `styles/themes/retro.css`: 1,225 lines.
- `ToolbarComponent.js`: 1,112 lines.
- `performance-optimizer.js`: 1,004 lines.
- `TabUIController.js`: 974 lines.
- `PreviewComponent.js`: 938 lines.
- `HorizontalSplitPlugin.js`: 911 lines.

Handle one module/subsystem per approval batch. Extract cohesive pure helpers or controllers with explicit dependencies. Avoid moving code solely to reduce line counts. Good boundaries include toolbar layout/menu presentation, tab drag/reorder UI, Preview post-processing, performance measurements versus virtualization, and horizontal-split layout/settings.

Preserve:

- Per-tab content and Code/Preview/Split scroll state.
- Full-path file identity for same-named files in different directories.
- Virtual/dormant pinned-tab activation and close behavior.
- Native and pinned tab reordering.
- Windows/Linux file, search, shortcut, and path behavior.
- Plugin lifecycle isolation and lazy rendering.

### 6. Modularize CSS

Current CSS already has `styles/features`, `styles/themes`, and `styles/utilities`; continue that structure.

Goal:

- Split component-owned blocks out of the 3,703-line `src/styles.css`.
- Keep only shared tokens, reset/base layout, and genuinely global rules in the base stylesheet.
- Preserve loading order and theme overrides.
- Avoid visual changes in a mechanical extraction batch.
- Then, if useful, simplify the 1,225-line Retro theme as a separate approval batch.

Manually compare Light, Dark, and Retro across welcome, toolbar, Settings, Plugin Manager, tabs, Code, Preview, vertical/horizontal Split, dialogs, task lists, code blocks, Mermaid, KaTeX, and responsive widths.

## Final audit after items 2–6

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
