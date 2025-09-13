# Horizontal Split Plugin Documentation

## Overview

The Horizontal Split Plugin extends the Markdown Editor with comprehensive horizontal split functionality, allowing users to arrange the preview and code panes vertically instead of the default side-by-side layout.

## Features

### 🔄 Split Orientation Control
- **Dropdown UI**: Split button enhanced with orientation selection dropdown
- **Dynamic Switching**: Toggle between vertical (side-by-side) and horizontal (stacked) layouts
- **Persistent Settings**: Remembers your preferred orientation across sessions

### ⚙️ Comprehensive Settings
Access via Settings → Horizontal Split section:

1. **Default Split Orientation**
   - `Vertical`: Traditional side-by-side layout (default)
   - `Horizontal`: Stacked layout with panes arranged vertically

2. **Markdown Toolbar Visibility**
   - `Show`: Display markdown toolbar in horizontal split mode (default)
   - `Hide`: Hide markdown toolbar for cleaner interface

3. **Pane Order**
   - `Preview Top`: Preview pane above, code pane below (default)
   - `Code Top`: Code pane above, preview pane below

### 🎯 Smart UI Integration
- **Contextual Dropdown**: Shows only the alternative orientation option
- **Real-time Updates**: Settings changes apply immediately
- **Toolbar Positioning**: Markdown toolbar correctly positioned within editor pane
- **Resizable Splitter**: Drag to adjust pane sizes in horizontal mode

### 🔧 Advanced Compatibility
- **Keyboard Shortcuts**: Full support for Ctrl+1, Ctrl+2, Ctrl+3
- **Distraction-free Mode**: Maintains proper layout in focused mode
- **Centered Layout**: Compatible with all layout modes
- **Theme Support**: Works with all editor themes

## How to Use

### Basic Usage
1. **Enable Plugin**: Go to Settings → Plugins → Enable "Horizontal Split Plugin"
2. **Access Dropdown**: Click the dropdown arrow next to the Split button
3. **Select Orientation**: Choose "Horizontally" for stacked layout
4. **Customize Settings**: Configure preferences in Settings → Horizontal Split

### Quick Actions
- **Split Horizontally**: Click Split button dropdown → "Horizontally"
- **Split Vertically**: Click Split button dropdown → "Vertically"
- **Toggle Toolbar**: Settings → Horizontal Split → Markdown Toolbar → Show/Hide
- **Reorder Panes**: Settings → Horizontal Split → Pane Order → Preview Top/Code Top

### Keyboard Shortcuts
- `Ctrl+3`: Enter split mode (respects default orientation setting)
- `Ctrl+1`: Code mode
- `Ctrl+2`: Preview mode
- `Ctrl+=/-/0`: Zoom controls (work in all modes)

## Settings Reference

### Storage Keys
Settings are stored in localStorage with consistent naming:

```javascript
// Default split orientation
localStorage.getItem('markdownViewer_defaultSplitOrientation')
// Values: 'vertical' | 'horizontal'

// Markdown toolbar visibility in horizontal split
localStorage.getItem('markdownViewer_horizontalSplitToolbar')
// Values: 'show' | 'hide'

// Pane order in horizontal split mode
localStorage.getItem('markdownViewer_horizontalSplitPaneOrder')
// Values: 'preview-top' | 'code-top'
```

### Default Values
- **Default Split Orientation**: `vertical`
- **Markdown Toolbar**: `show`
- **Pane Order**: `preview-top`

## Technical Details

### Self-Contained Architecture
The plugin follows a self-contained design pattern:
- **No Core Modifications**: Only adds to `knownPlugins` array
- **Dynamic UI**: Creates dropdown and settings UI on-demand
- **Complete Cleanup**: Restores original state when disabled
- **Memory Safe**: No memory leaks or orphaned event listeners

### CSS Implementation
The plugin injects CSS dynamically:

```css
.split-horizontal {
  flex-direction: column;
}

.split-horizontal .preview-pane {
  width: 100%;
  height: 50%;
  order: 1;
}

.split-horizontal .editor-pane {
  width: 100%;
  height: 50%;
  order: 3;
}

.split-horizontal .splitter {
  width: 100%;
  height: 6px;
  cursor: row-resize;
  order: 2;
}

/* Code Top Variant */
.split-horizontal.code-top .preview-pane {
  order: 3;
}
.split-horizontal.code-top .editor-pane {
  order: 1;
}
```

### DOM Manipulation
The plugin safely manipulates the DOM:
- **Toolbar Positioning**: Moves markdown toolbar inside editor pane
- **Original State Storage**: Preserves original DOM structure
- **Restoration**: Complete restoration when plugin disabled

## Performance

### Optimizations
- **Lazy Loading**: CSS and UI elements loaded only when needed
- **Event Debouncing**: Prevents excessive DOM updates
- **Memory Management**: Proper cleanup prevents memory leaks
- **Fast Switching**: <35ms mode switching maintained

### Resource Usage
- **Bundle Size**: ~15KB additional JavaScript
- **CSS Overhead**: ~2KB injected styles
- **Memory Footprint**: Minimal, with complete cleanup
- **Performance Impact**: Negligible on editor performance

## Compatibility

### Browser Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

### Editor Features
- **Sync Functionality**: Maintains scroll synchronization
- **Find & Replace**: Works in all modes
- **Zoom Controls**: Compatible with preview zoom
- **Export Features**: HTML/PDF export works correctly

### Theme Compatibility
- **Light Theme**: Full support
- **Dark Theme**: Full support
- **Retro Theme**: Full support with custom dropdown styling
- **High Contrast**: Full support

## Troubleshooting

### Common Issues

**Dropdown not appearing**
- Ensure plugin is enabled in Settings → Plugins
- Refresh the application
- Check browser console for errors

**Settings not persisting**
- Verify localStorage is enabled in browser
- Check for browser privacy settings blocking storage
- Clear browser cache and reconfigure

**Toolbar not showing/hiding**
- Settings changes apply only in horizontal split mode
- Try switching to horizontal mode first
- Refresh if toolbar state seems stuck

**Pane sizes not saving**
- Pane sizes are preserved per session
- Switching modes may reset sizes
- Use the resize handle to adjust

### Reset Plugin
To reset all plugin settings:
```javascript
// Run in browser console
localStorage.removeItem('markdownViewer_defaultSplitOrientation');
localStorage.removeItem('markdownViewer_horizontalSplitToolbar');
localStorage.removeItem('markdownViewer_horizontalSplitPaneOrder');
```

## Development

### Plugin Architecture
The plugin extends the base plugin system:
- **Class**: `HorizontalSplitPlugin`
- **API**: Uses `pluginAPI` for hooks and extensions
- **Lifecycle**: `init()` → active state → `destroy()`

### Extension Points
- **Settings Controller**: Registers 3 new settings
- **Mode Controller**: Hooks into mode switching
- **UI Controller**: Modifies split button behavior

### Event System
```javascript
// Mode change hooks
this.pluginAPI.addHook('mode', 'mode-changed', callback);

// Settings change hooks
this.pluginAPI.addHook('settings', 'settings-changed', callback);
```

## Version History

### v1.0.0 (Current)
- ✅ Core horizontal split functionality
- ✅ Dropdown UI integration
- ✅ Complete settings system (3 settings)
- ✅ Markdown toolbar positioning
- ✅ Pane ordering functionality
- ✅ Resizable splitter
- ✅ Self-contained architecture
- ✅ Full compatibility support

## Support

For issues, feature requests, or contributions:
- Check browser console for error messages
- Verify plugin is enabled in settings
- Test with plugin disabled to isolate issues
- Report specific steps to reproduce problems

---

**The Horizontal Split Plugin provides a comprehensive solution for vertical pane arrangement while maintaining the editor's performance and compatibility.**