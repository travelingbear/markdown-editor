# Lessons Learned - Tauri + Rust Development

## 🎯 Project Context
**Technology Stack**: Tauri v2 + Rust + TypeScript/JavaScript  
**Project**: Native Markdown Viewer Desktop Application  
**Development Period**: 6 Phases over multiple months  
**Final Status**: Successfully deployed v1.0.0 with full distribution system

## 🚨 Critical Issues & Solutions

### 1. **AMD/RequireJS Module Conflicts with Monaco Editor**

#### Problem
Monaco Editor's RequireJS system conflicted with external libraries (Mermaid.js, KaTeX), preventing proper loading and causing "Can only have one anonymous define call per script file" errors.

#### Root Cause
- Monaco Editor uses AMD/RequireJS module system
- External libraries loaded via CDN also used AMD, creating conflicts
- Traditional script tag loading failed due to module system incompatibility

#### Solution
```javascript
// WRONG: Traditional CDN loading
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>

// CORRECT: ES Module dynamic imports
const mermaid = await import('https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.esm.min.mjs');
const katex = await import('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs');
```

#### Key Learnings
- **Always use ES module versions** when integrating with Monaco Editor
- **Load libraries after Monaco initialization** to avoid conflicts
- **Implement graceful fallbacks** for when libraries fail to load
- **Use dynamic imports** instead of static script tags for external libraries

---

### 2. **Tauri v2 Window Close Handler Issues**

#### Problem
Window close prevention (`event.preventDefault()`) didn't work in Tauri v2, causing users to lose unsaved work when clicking the X button.

#### Root Cause
- Tauri v2 changed window management APIs from v1
- `onCloseRequested` event handling required different approach
- Missing required permissions in capabilities configuration

#### Solution
```rust
// Cargo.toml - Add required permissions
[dependencies]
tauri = { version = "2", features = ["window-close"] }
```

```json
// capabilities/default.json - Add window permissions
{
  "permissions": [
    "core:window:allow-close",
    "core:window:allow-destroy"
  ]
}
```

```javascript
// JavaScript - Proper Tauri v2 event handling
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();
appWindow.onCloseRequested(async (event) => {
    if (isDirty) {
        event.preventDefault();
        const shouldClose = await confirm("Unsaved changes. Close anyway?");
        if (shouldClose) {
            await appWindow.close();
        }
    }
});
```

#### Key Learnings
- **Check Tauri version compatibility** when upgrading
- **Always configure proper permissions** in capabilities
- **Use Tauri v2 specific APIs** instead of v1 methods
- **Test window management thoroughly** across different scenarios

---

### 3. **Drag-Drop Absolute Path Access Limitations**

#### Problem
Browser security prevents accessing absolute file paths from drag-drop events, limiting save functionality for drag-dropped files.

#### Root Cause
- Browser `File` API only provides relative paths or filenames
- `file.path` and `file.webkitRelativePath` are undefined/empty for security
- Cannot save drag-dropped files to original location

#### Solution
```javascript
// WRONG: Trying to access absolute paths from browser events
document.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    console.log(file.path); // undefined - security limitation
});

// CORRECT: Use Tauri native drag-drop events
import { listen } from '@tauri-apps/api/event';

// Enable in tauri.conf.json
{
  "app": {
    "windows": [{
      "dragDropEnabled": true
    }]
  }
}

// Listen for native Tauri events
listen('tauri://drag-drop', (event) => {
    const paths = event.payload.paths; // Full absolute paths available
    console.log(paths[0]); // "C:\\Users\\...\\file.md"
});
```

#### Key Learnings
- **Use Tauri native events** for full file system access
- **Browser drag-drop has security limitations** - document them clearly
- **Provide fallback workflows** (Save As dialog for drag-dropped files)
- **Enable `dragDropEnabled: true`** in Tauri config for native events

---

### 4. **Interactive Checkbox Event Handling in Lists**

#### Problem
Checkboxes inside `<li>` elements weren't clickable due to browser event blocking and CSS pointer-events conflicts.

#### Root Cause
- Browser blocks certain events on checkbox inputs inside list items
- CSS `pointer-events` inheritance caused interaction issues
- Event delegation wasn't properly configured

#### Solution
```css
/* Fix pointer events for checkboxes in lists */
.preview-content li {
    pointer-events: none; /* Disable on list item */
}

.preview-content li input[type="checkbox"],
.preview-content li label {
    pointer-events: auto !important; /* Enable on checkbox and label */
}
```

```javascript
// Enhanced event delegation
document.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox' && e.target.closest('.task-list-item')) {
        // Handle checkbox state change
        updateMarkdownContent(e.target);
    }
});
```

#### Key Learnings
- **Use CSS `pointer-events`** to control interaction areas
- **Test interactive elements thoroughly** in different HTML contexts
- **Implement proper event delegation** for dynamic content
- **Consider HTML structure alternatives** (`<div>` vs `<li>`) for complex interactions

---

### 5. **Build System and Distribution Configuration**

#### Problem
MSI installer creation failed due to missing WiX Toolset, and bundle identifier conflicts with macOS `.app` extension.

#### Root Cause
- WiX Toolset required for MSI creation but not installed
- Bundle identifier ending in `.app` conflicts with macOS app bundle extension
- Incorrect npm script commands for Tauri builds

#### Solution
```json
// tauri.conf.json - Fix bundle identifier
{
  "identifier": "com.markdownviewer.desktop", // NOT .app
  "bundle": {
    "targets": "all"
  }
}

// package.json - Correct build scripts
{
  "scripts": {
    "build": "npm run tauri build", // NOT just "tauri build"
    "dev": "npm run tauri dev"
  }
}
```

#### Installation Requirements
```bash
# Windows - Install WiX Toolset for MSI creation
# Download from: https://github.com/wixtoolset/wix3/releases
# Install wix311.exe

# Verify installation
npm run tauri build # Should create both MSI and NSIS installers
```

#### Key Learnings
- **Install all required build tools** before attempting distribution builds
- **Use proper bundle identifiers** following platform conventions
- **Test build scripts early** in development process
- **Document build requirements** clearly for other developers

---

### 6. **Image Processing and CSP Configuration**

#### Problem
Local images couldn't load due to Content Security Policy restrictions, and image processing pipeline needed proper error handling.

#### Root Cause
- CSP didn't allow `file:` protocol for local images
- Image processing lacked proper error states and visual feedback
- No distinction between local, remote, and error states

#### Solution
```json
// tauri.conf.json - Enhanced CSP for images
{
  "app": {
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: https: http: file: asset: tauri:;"
    }
  }
}
```

```rust
// Rust backend - Image conversion function
#[tauri::command]
async fn convert_local_image_path(path: String) -> Result<String, String> {
    match std::fs::read(&path) {
        Ok(data) => {
            let base64 = base64::encode(&data);
            let mime_type = get_mime_type(&path);
            Ok(format!("data:{};base64,{}", mime_type, base64))
        }
        Err(e) => Err(format!("Failed to read image: {}", e))
    }
}
```

```css
/* Visual feedback for different image states */
.preview-content img {
    border: 2px solid transparent;
}
.preview-content img[data-state="local"] { border-color: blue; }
.preview-content img[data-state="remote"] { border-color: green; }
.preview-content img[data-state="error"] { border-color: red; }
```

#### Key Learnings
- **Configure CSP properly** for all required protocols
- **Implement visual feedback** for different content states
- **Handle errors gracefully** with user-friendly indicators
- **Use Rust backend** for file system operations requiring permissions

---

### 7. **Performance Optimization and Debouncing**

#### Problem
Real-time preview updates caused performance issues during fast typing, and memory usage grew over time.

#### Root Cause
- Preview updates triggered on every keystroke without debouncing
- No cleanup of cached data or event listeners
- Performance monitoring was missing

#### Solution
```javascript
// Debounced preview updates
let updateTimeout;
function schedulePreviewUpdate() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        updatePreview();
    }, 300); // 300ms debounce
}

// Performance monitoring
const performanceTracker = {
    startTime: null,
    
    start(operation) {
        this.startTime = performance.now();
        console.log(`[Performance] Starting ${operation}`);
    },
    
    end(operation, target = 1000) {
        const duration = performance.now() - this.startTime;
        console.log(`[Performance] ${operation}: ${duration.toFixed(2)}ms`);
        if (duration > target) {
            console.warn(`[Performance] ${operation} exceeded target (${target}ms)`);
        }
    }
};

// Memory cleanup
function cleanup() {
    // Clear cached data
    imageCache.clear();
    // Remove event listeners
    document.removeEventListener('click', handleClick);
}
```

#### Key Learnings
- **Always debounce frequent operations** (typing, scrolling, resizing)
- **Implement performance monitoring** from the start
- **Clean up resources properly** to prevent memory leaks
- **Set and monitor performance targets** (< 300ms for updates)

---

## 🏗️ Architecture Best Practices

### 1. **Frontend-Backend Communication**
```rust
// Rust - Keep commands simple and focused
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| e.to_string())
}
```

```javascript
// JavaScript - Handle errors gracefully
async function loadFile(path) {
    try {
        const content = await invoke('read_file', { path });
        return content;
    } catch (error) {
        console.error('Failed to load file:', error);
        showUserError('Could not load file. Please check the file path.');
        return null;
    }
}
```

### 2. **Configuration Management**
```json
// tauri.conf.json - Organize by concern
{
  "app": {
    "security": { "csp": "..." },
    "windows": [{ "dragDropEnabled": true }]
  },
  "bundle": {
    "identifier": "com.company.app",
    "targets": "all",
    "fileAssociations": [...]
  }
}
```

### 3. **Error Handling Strategy**
```javascript
// Centralized error handling
function handleError(error, context = 'Unknown') {
    console.error(`[${context}] Error:`, error);
    
    const userMessage = getUserFriendlyMessage(error);
    showNotification(userMessage, 'error');
    
    // Log for debugging
    logError(error, context);
}

function getUserFriendlyMessage(error) {
    if (error?.message?.includes('permission')) {
        return 'Permission denied. Please check file permissions.';
    }
    if (error?.message?.includes('not found')) {
        return 'File not found. Please check the file path.';
    }
    return 'An unexpected error occurred. Please try again.';
}
```

---

## 🔧 Development Workflow Recommendations

### 1. **Phase-Based Development**
- **Break large features into phases** with clear deliverables
- **Require user validation** before proceeding to next phase
- **Use feature branches** for each phase
- **Document issues and solutions** as you encounter them

### 2. **Testing Strategy**
- **Test on target platforms early** and frequently
- **Validate file operations** with different file types and sizes
- **Test edge cases** (empty files, special characters, long paths)
- **Performance test** with realistic data loads

### 3. **Documentation Approach**
- **Document limitations clearly** (browser security, platform differences)
- **Provide workarounds** for known limitations
- **Keep lessons learned** for future projects
- **Update documentation** as issues are resolved

---

## 📊 Final Recommendations

### For Future Tauri + Rust Projects:

1. **Start with Tauri v2** - Don't upgrade mid-project unless necessary
2. **Plan for browser security limitations** - Use native Tauri APIs when possible
3. **Implement proper error handling** from the beginning
4. **Test build system early** - Don't wait until the end
5. **Use ES modules** for external library integration
6. **Configure CSP properly** for your specific needs
7. **Monitor performance** throughout development
8. **Document architectural decisions** and their trade-offs

### Critical Success Factors:
- **User validation at each phase** prevents major rework
- **Proper permissions configuration** saves debugging time
- **Performance monitoring** catches issues early
- **Comprehensive error handling** improves user experience
- **Clear documentation** helps future maintenance

---

**This document represents real-world experience developing a production Tauri application. Use these lessons to avoid common pitfalls and accelerate your development process.**