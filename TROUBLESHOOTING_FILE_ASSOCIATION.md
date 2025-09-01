# File Association Troubleshooting Guide

## Overview
This document tracks the implementation and debugging of macOS global menu and file association features for the Markdown Editor Tauri application.

## Completed Tasks

### 1. macOS Global Menu Implementation ✅
**Challenge**: Add global menu for macOS with items: New, Load, Close, Toggle Theme, Settings, Debug Console, Help, About.

**Solution**: 
- Added menu imports to `src-tauri/src/lib.rs`:
  ```rust
  use tauri::{State, Manager, Emitter, menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder}};
  ```
- Implemented menu creation in `.setup()` with `#[cfg(target_os = "macos")]`
- Added `.on_menu_event()` handler to emit events to frontend
- Fixed frontend event listeners in `setupMenuEventListeners()` function

**Files Modified**:
- `src-tauri/src/lib.rs` - Menu creation and event handling
- `src/main.js` - Event listeners for menu actions

### 2. Content Security Policy (CSP) Fix ✅
**Challenge**: CSP blocking IPC communication with errors like:
```
Refused to connect to ipc://localhost/get_startup_file because it does not appear in the connect-src directive
```

**Solution**: Updated CSP in `src-tauri/tauri.conf.json`:
```json
"csp": "default-src 'self'; img-src 'self' data: https: http: file: asset: tauri:; media-src 'self' data: https: http: file: asset: tauri:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: http: ipc: tauri:; font-src 'self' https: data:; worker-src 'self' blob:;"
```

**Key Changes**:
- Added `ipc: tauri:` to `connect-src`
- Added `blob:` to `worker-src` for Monaco Editor

### 3. Debug Console Build Fix ✅
**Challenge**: `open_devtools()` method not available in production builds.

**Solution**: Added debug assertions guard:
```rust
"debug-console" => { 
    #[cfg(debug_assertions)]
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.open_devtools();
    }
}
```

## ✅ RESOLVED: macOS File Association Event Not Triggering

### Problem Description
- File association mechanism works perfectly (confirmed via manual test button)
- File content loading and display pipeline works correctly
- File associations are properly registered (✅ confirmed via Check Status button)
- **Root Issue**: macOS is not triggering the expected events when double-clicking .md files in Finder
- Command line file opening works, but Finder double-click does not trigger any events

### Debug Evidence

**Manual Test Results (✅ Working)**:
```
[DEBUG] Test button clicked
[DEBUG] Manual test file association triggered
[FileAssoc] File association event received: "/Users/juniorfr/Documents/PROJECTS/markdown-editor/INSTALLATION_GUIDE.md"
[File] Opening: "/Users/juniorfr/Documents/PROJECTS/markdown-editor/INSTALLATION_GUIDE.md"
[Preview] Starting preview update...
[Preview] Final HTML sample: "<h1>Installation Guide - Markdown Viewer</h1>..."
```

**Finder Double-Click Results (❌ Not Working)**:
- No events triggered in Rust backend
- No file association events received by frontend
- App launches but shows welcome page instead of file content
- No console logs indicating any file-related events

### Analysis
1. ✅ File association mechanism: Working (confirmed via test button)
2. ✅ File content loading: Working
3. ✅ Content display pipeline: Working
4. ✅ Preview rendering: Working
5. ❌ **macOS event triggering**: Not working for Finder double-click

### Root Cause
The issue is **NOT** with the file association implementation, but with **macOS event detection**. When files are double-clicked in Finder, macOS is not sending the expected events to our Tauri application.

### Attempted Solutions
1. **Enhanced Event Listeners**: Added comprehensive event listeners for:
   - `tauri://file-drop`
   - `tauri://file-open`
   - `tauri://open-url`
   - `tauri://deep-link`
   - `open-file`
   - `file-open`
   - `open-url`
   - `deep-link`
   - `application-open-file`
   - `application-open-url`
   - `NSApplicationOpenFile`
   - `NSApplicationOpenFiles`
2. **Single Instance Plugin**: Implemented for proper file association handling
3. **Command Line Parsing**: Enhanced argument parsing and file detection
4. **URL Decoding**: Added urlencoding support for file:// URLs
5. **Multiple Event Formats**: Support for string, array, and object event payloads
6. **Application Lifecycle Events**: Added window focus and application lifecycle handlers
7. **File Association Registration**: Added lsregister command to properly register associations
8. **Comprehensive macOS Handlers**: Implemented dedicated macOS file association handling functions

### Current Challenges
1. **macOS Event Mystery**: Unclear which specific event macOS sends for file associations
2. **Event Timing**: Possible timing issues with event registration vs. app launch
3. **Tauri v2 API**: Some macOS-specific APIs may have changed in Tauri v2
4. **File Association Registration**: May need to verify .md files are properly associated

### Latest Implementation (✅ Completed)

#### 1. Comprehensive Event Handling
- Added dedicated `setup_macos_file_handlers()` function
- Implemented 13 different event listeners for all possible macOS file association events
- Added application lifecycle and window focus event handlers
- Implemented periodic checking for pending file associations

#### 2. File Association Registration
- ✅ Confirmed app bundle exists: `/Applications/Markdown Editor.app`
- ✅ Confirmed bundle ID: `com.markdownviewer.desktop`
- ✅ Confirmed document types configured
- ✅ Successfully registered associations using `lsregister`

#### 3. Debug Tools Added
- **Test File Association**: Manual test button (working)
- **Check Status**: Verify app registration and bundle configuration
- **Register Associations**: Run lsregister to refresh file associations
- **Test Open Command**: Test `open -a "Markdown Editor" file.md` command

### Next Steps for Testing

#### 1. Test the Open Command
- Click "Test Open Command" button to verify if `open -a` triggers events
- This simulates what macOS does when double-clicking files
- Check console for any file association events

#### 2. Alternative Testing Methods
```bash
# Test from terminal
open -a "Markdown Editor" /path/to/file.md

# Test right-click → Open With
# Right-click any .md file → Open With → Markdown Editor

# Test drag onto Dock icon
# Drag .md file onto app icon in Dock
```

#### 3. Verify macOS System Integration
- Check if macOS recognizes our app for .md files:
  - Right-click any .md file → Get Info → Open with
  - Should show "Markdown Editor" as an option
- Test setting as default application

#### 4. Debug Console Monitoring
- Keep console open when testing
- Look for any Rust log messages starting with `[Rust]`
- Monitor for file association events

#### 5. If Still Not Working
- Check macOS Console app for system-level errors
- Verify app signature/notarization status
- Test with a simple .md file in Desktop folder
- Try logging out and back in to refresh Launch Services

## Build Commands

**Debug Build**:
```bash
npm run build:debug
# or
npm run tauri build -- --debug
```

**Install Debug Build**:
```bash
cp -r "src-tauri/target/debug/bundle/macos/Markdown Editor.app" /Applications/
```

**Test File Association**:
```bash
/Applications/Markdown\ Editor.app/Contents/MacOS/markdown-editor ~/Desktop/test.md
```

## Key Files

- `src-tauri/src/lib.rs` - Rust backend, menu, file handling
- `src-tauri/tauri.conf.json` - CSP configuration, file associations
- `src/main.js` - Frontend logic, file loading, preview updates
- Lines 2244-2293 in `main.js` - `checkStartupFile()` function

## File Association Configuration

Already configured in `tauri.conf.json`:
```json
"fileAssociations": [
  {
    "ext": ["md", "markdown", "txt"],
    "name": "Markdown Document",
    "description": "Markdown text document",
    "role": "Editor"
  }
]
```

## Status Summary
- ✅ macOS Global Menu: Working
- ✅ File Association Mechanism: Working (confirmed via test button)
- ✅ File Content Loading: Working
- ✅ File Content Display: Working
- ✅ **macOS Event Triggering**: **WORKING!** (Finder double-click)

**Key Finding**: The file association mechanism works perfectly. The issue is that macOS is not sending the expected events when .md files are double-clicked in Finder. This suggests either:
1. File associations are not properly registered with macOS
2. The wrong event listeners are being used for Tauri v2
3. macOS requires additional permissions or signing for file associations
4. A different event mechanism is needed for macOS file associations

**Confirmed Working**: 
- ✅ Manual test button successfully loads and displays files
- ✅ File association registration completed successfully
- ✅ App bundle properly configured with document types
- ✅ Comprehensive event handlers implemented for all macOS file association events
- ✅ Application lifecycle and window focus handlers added

**✅ RESOLVED**: The issue was that Tauri v2 uses `RunEvent::Opened` for file associations instead of custom event listeners. Implemented proper application lifecycle event handling using `RunEvent::Opened { urls }` which correctly captures file association events from macOS.

**Key Solution**: Used Tauri v2's proper application lifecycle events (`RunEvent::Opened`) instead of relying on custom event listeners. This is the correct way to handle file associations in Tauri v2.