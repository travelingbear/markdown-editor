# Markdown Editor - Quick Reference Guide

*Complete keyboard shortcuts, button functions, and screen descriptions*

---

## 🎯 Quick Navigation

- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Button Functions](#button-functions)
- [Screen Descriptions](#screen-descriptions)
- [Context Menus](#context-menus)
- [Mouse Shortcuts](#mouse-shortcuts)

---

## ⌨️ Keyboard Shortcuts

### File Operations
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+N` | New File | Creates new untitled tab |
| `Ctrl+O` | Open File | Opens file picker, creates new tab |
| `Ctrl+S` | Save File | Saves current active tab |
| `Ctrl+Shift+S` | Save As | Save with new name/location |
| `Ctrl+W` | Close Tab | Closes current tab |
| `F5` | Reload File | Refreshes file from disk |

### View Modes
| Shortcut | Mode | Description |
|----------|------|-------------|
| `Ctrl+1` | Code Mode | Editor only, full Monaco editor |
| `Ctrl+2` | Preview Mode | Rendered markdown only |
| `Ctrl+3` | Split Mode | Side-by-side editor and preview |

### Tab Navigation
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Alt+1` to `Alt+9` | Switch to Tab 1-9 | Quick access to numbered tabs |
| `Ctrl+Tab` | Next Tab | Cycle forward through tabs |
| `Ctrl+Shift+Tab` | Tab Modal | Open searchable tab navigator |
| `Ctrl+PageUp` | Previous Tab | Cycle backward through tabs |
| `Ctrl+PageDown` | Next Tab | Cycle forward through tabs |

### Editor Controls (Code Mode)
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+F` | Find | Open find widget overlay |
| `Ctrl+H` | Find & Replace | Open find/replace widget |
| `Ctrl+Z` | Undo | Undo last action |
| `Ctrl+Y` | Redo | Redo last undone action |
| `Ctrl+A` | Select All | Select entire document |
| `Ctrl+L` | Select Line | Select current line |
| `Ctrl+D` | Select Word | Select word at cursor |

### Preview Controls
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+=` | Zoom In | Increase preview zoom (50%-300%) |
| `Ctrl+-` | Zoom Out | Decrease preview zoom |
| `Ctrl+0` | Reset Zoom | Return to 100% zoom |
| `F5` | Refresh Preview | Force preview update |

### Markdown Formatting (Code Mode)
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+B` | Bold | Wrap selection in **bold** |
| `Ctrl+I` | Italic | Wrap selection in *italic* |
| `Ctrl+Shift+1` | Heading 1 | Insert # heading |
| `Ctrl+Shift+2` | Heading 2 | Insert ## heading |
| `Ctrl+Shift+3` | Heading 3 | Insert ### heading |
| `Ctrl+K` | Link | Insert [link](url) |
| `Ctrl+Shift+K` | Code Block | Insert ```code``` block |

### Application Controls
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+T` | Toggle Theme | Cycle Light → Dark → Retro |
| `Ctrl+/` | Toggle Theme | Alternative theme toggle |
| `Ctrl+Shift+/` | Toggle Markdown Toolbar | Show/hide formatting toolbar |
| `Ctrl+,` | Settings | Open settings modal |
| `F1` | Help | Show help modal |
| `F11` | Fullscreen | Toggle fullscreen mode |
| `Shift+F11` | Distraction-Free | Hide all UI except content |
| `Esc` | Close/Exit | Close modals or exit modes |

### Export & Print
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+E` | Export HTML | Save as standalone HTML |
| `Ctrl+Shift+P` | Print/PDF | Open print dialog for PDF |
| `Ctrl+P` | Print | Quick print current view |

---

## 🖱️ Mouse Shortcuts

### Mouse Wheel Combinations
| Combination | Action | Description |
|-------------|--------|-------------|
| `Ctrl+Wheel Up/Down` | Font Size (Code) / Zoom (Preview) | Adjust size in current mode |
| `Ctrl+Shift+Wheel Up/Down` | Switch Modes | Code → Preview → Split → Code |
| `Alt+Wheel Up/Down` | Switch Tabs | Navigate through open tabs |
| `Shift+Wheel Up/Down` | Horizontal Scroll | Scroll horizontally in editor |

### Click Actions
| Click | Action | Description |
|-------|--------|-------------|
| **Single Click** | Select Tab | Switch to clicked tab |
| **Right Click Tab** | Context Menu | Show tab operations menu |
| **Right Click Preview** | Preview Menu | Show preview context menu |
| **Middle Click Tab** | Close Tab | Close clicked tab |
| **Drag Tab** | Reorder | Drag to reorder tabs (future) |

---

## 🔘 Button Functions

### Main Toolbar (Top)

#### File Operations Section
| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **New** | 📄 | Create new untitled file | `Ctrl+N` |
| **Open** | 📁 | Open file picker dialog | `Ctrl+O` |
| **Save** | 💾 | Save current file | `Ctrl+S` |
| **Save ▼** | 💾▼ | Save dropdown (Save As, encoding options) | `Ctrl+Shift+S` |

#### Mode Controls Section
| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **Code** | `</>` | Switch to code editing mode | `Ctrl+1` |
| **Preview** | 👁️ | Switch to preview mode | `Ctrl+2` |
| **Split** | ⫿ | Switch to split view mode | `Ctrl+3` |

#### View Controls Section
| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **Theme** | 🎨 | Toggle between Light/Dark/Retro themes | `Ctrl+T` |
| **Distraction-Free** | ⛶ | Toggle distraction-free mode | `Shift+F11` |
| **Settings** | ⚙️ | Open settings modal | `Ctrl+,` |
| **Help** | ❓ | Show help and shortcuts | `F1` |

#### Export Section
| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **Export HTML** | 🌐 | Export as standalone HTML file | `Ctrl+Shift+E` |
| **Print/PDF** | 🖨️ | Open print dialog for PDF export | `Ctrl+Shift+P` |

### Markdown Toolbar (Below Main Toolbar)

#### Text Formatting
| Button | Icon | Function | Markdown | Shortcut |
|--------|------|----------|----------|----------|
| **Bold** | **B** | Make text bold | `**text**` | `Ctrl+B` |
| **Italic** | *I* | Make text italic | `*text*` | `Ctrl+I` |
| **Strikethrough** | ~~S~~ | Strike through text | `~~text~~` | - |
| **Code** | `<>` | Inline code | `` `code` `` | - |

#### Headings
| Button | Icon | Function | Markdown | Shortcut |
|--------|------|----------|----------|----------|
| **H1** | H₁ | Heading level 1 | `# Heading` | `Ctrl+Shift+1` |
| **H2** | H₂ | Heading level 2 | `## Heading` | `Ctrl+Shift+2` |
| **H3** | H₃ | Heading level 3 | `### Heading` | `Ctrl+Shift+3` |

#### Lists and Structure
| Button | Icon | Function | Markdown | Shortcut |
|--------|------|----------|----------|----------|
| **Bullet List** | • | Unordered list | `- Item` | - |
| **Numbered List** | 1. | Ordered list | `1. Item` | - |
| **Task List** | ☐ | Checkbox list | `- [ ] Task` | - |
| **Quote** | ❝ | Blockquote | `> Quote` | - |

#### Links and Media
| Button | Icon | Function | Markdown | Shortcut |
|--------|------|----------|----------|----------|
| **Link** | 🔗 | Insert link | `[text](url)` | `Ctrl+K` |
| **Image** | 🖼️ | Insert image | `![alt](url)` | - |
| **Table** | ⊞ | Insert table | `\| Col \| Col \|` | - |
| **Code Block** | ⧈ | Code block | ` ```code``` ` | `Ctrl+Shift+K` |

#### Editor Controls
| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **Undo** | ↶ | Undo last action | `Ctrl+Z` |
| **Redo** | ↷ | Redo last action | `Ctrl+Y` |
| **Find** | 🔍 | Open find widget | `Ctrl+F` |

#### Font Size Controls
| Button | Icon | Function | Range |
|--------|------|----------|-------|
| **A-** | A⁻ | Decrease font size | 10px-24px |
| **A+** | A⁺ | Increase font size | 10px-24px |
| **Font Size Display** | 14px | Shows current font size | - |

### Status Bar (Bottom)

#### Left Section
| Element | Function | Description |
|---------|----------|-------------|
| **File Path** | Shows current file location | Click to copy path |
| **Line:Column** | Cursor position | Shows current position in Code mode |

#### Center Section
| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **Help** | ❓ | Quick help button | `F1` |
| **Sync** | ⟲ | Manual scroll sync (Code/Preview modes) | - |

#### Right Section
| Element | Function | Description |
|---------|----------|-------------|
| **Zoom Controls** | 🔍⁻ 100% 🔍⁺ | Preview zoom controls (50%-300%) |
| **Mode Indicator** | Shows current mode | Code/Preview/Split |
| **Tab Count** | Shows open tabs | Click for tab modal |

### Tab Interface

#### Tab Dropdown (Status Bar)
| Element | Function | Description |
|---------|----------|-------------|
| **Filename Button** | Shows current file | Click to open tab dropdown |
| **Tab Numbers 1-9** | Quick tab access | Shows 9 most recent tabs |
| **More Button** | Additional tabs | Shows when 10+ tabs open |

#### Tab Modal (Ctrl+Shift+Tab)
| Element | Function | Description |
|---------|----------|-------------|
| **Search Box** | Filter tabs | Type to search filenames |
| **Tab List** | All open tabs | Click to switch, shows full paths |
| **Close Buttons** | ✕ | Close individual tabs |
| **Numbers 1-5** | Quick access | Shows for first 5 tabs |

---

## 📱 Screen Descriptions

### Welcome Screen
**When**: First launch or no tabs open  
**Elements**:
- **App Logo & Title**: Markdown Editor branding
- **Quick Actions**: New File, Open File, Settings buttons
- **Recent Files**: List of recently opened files (if any)
- **Keyboard Shortcuts**: Essential shortcuts reference
- **Getting Started Tips**: Basic usage guidance

### Main Editor Interface

#### Code Mode Screen
**When**: Ctrl+1 or Code button pressed  
**Layout**:
- **Full-width Monaco Editor**: Professional code editing
- **Line Numbers**: Left gutter with line numbers
- **Syntax Highlighting**: Markdown syntax coloring
- **Find Widget**: Overlay search (Ctrl+F)
- **Scroll Bars**: Vertical and horizontal scrolling
- **Status Info**: Line/column position in status bar

#### Preview Mode Screen
**When**: Ctrl+2 or Preview button pressed  
**Layout**:
- **Rendered Content**: Full-width markdown preview
- **Interactive Elements**: Clickable links and task lists
- **Zoom Controls**: Status bar zoom controls active
- **Context Menu**: Right-click for preview options
- **Scroll Position**: Independent preview scrolling

#### Split Mode Screen
**When**: Ctrl+3 or Split button pressed  
**Layout**:
- **Left Pane**: Monaco editor (50% width default)
- **Splitter**: Draggable divider between panes
- **Right Pane**: Markdown preview (50% width default)
- **Independent Scrolling**: Each pane scrolls separately
- **Synchronized Updates**: Changes reflect immediately

### Settings Modal
**When**: Ctrl+, or Settings button pressed  
**Sections**:

#### General Settings
- **Theme Selection**: Light/Dark/Retro radio buttons
- **Startup Behavior**: File restoration options
- **Auto-save Settings**: Save frequency options

#### Appearance
- **Toolbar Size**: Small/Medium/Large options
- **Font Settings**: Size and family selection
- **Zoom Defaults**: Default zoom levels

#### Performance
- **Memory Usage**: Current RAM consumption display
- **Tab Limits**: Virtualization settings
- **Performance Metrics**: Real-time performance data
- **Optimization Tools**: Memory cleanup buttons

#### Plugins
- **Plugin List**: Available plugins with status
- **Enable/Disable**: Toggle switches for each plugin
- **Plugin Actions**: Refresh and manage buttons
- **Plugin Settings**: Individual plugin configuration

### Help Modal
**When**: F1 or Help button pressed  
**Content**:
- **Keyboard Shortcuts**: Complete shortcut reference
- **Feature Guide**: How to use major features
- **Tips & Tricks**: Advanced usage techniques
- **Troubleshooting**: Common issues and solutions

### Tab Modal
**When**: Ctrl+Shift+Tab pressed  
**Elements**:
- **Search Bar**: Filter tabs by filename
- **Tab List**: All open tabs with full paths
- **Tab Numbers**: 1-5 for quick access
- **Close Buttons**: Individual tab close options
- **Active Indicator**: Highlights current tab

---

## 🖱️ Context Menus

### Tab Context Menu
**Trigger**: Right-click on tab in dropdown  
**Options**:
- **Close Tab** - Close this tab
- **Close Others** - Close all other tabs
- **Close All** - Close all tabs
- **Duplicate Tab** - Create copy of tab
- **Reveal in Explorer** - Show file in system file manager
- **Move to Position ▶** - Submenu with positions 1-9

### Preview Context Menu
**Trigger**: Right-click in Preview mode  
**Options**:
- **Reload File** - Refresh file from disk
- **Sync from Code** - Update preview with editor content
- **Export ▶** - Submenu with HTML/PDF options
  - **Export to HTML** - Save as standalone HTML
  - **Export to PDF** - Print/save as PDF
- **Restart Application** - Clean restart with tab restoration

### Editor Context Menu
**Trigger**: Right-click in Code mode (Monaco Editor)  
**Options**:
- **Cut** - Cut selected text
- **Copy** - Copy selected text
- **Paste** - Paste from clipboard
- **Select All** - Select entire document
- **Find** - Open find widget
- **Replace** - Open find/replace widget

---

## 🎯 Mode-Specific Features

### Code Mode Features
- **Monaco Editor**: Full VS Code editing engine
- **Syntax Highlighting**: Markdown syntax coloring
- **Multi-cursor**: Alt+Click for multiple cursors
- **Block Selection**: Alt+Shift+Drag for block selection
- **Find/Replace**: Regex support, case sensitivity
- **Line Operations**: Ctrl+L (select line), Ctrl+Shift+K (delete line)
- **Indentation**: Smart indent, tab/space conversion
- **Folding**: Code folding for headers and lists

### Preview Mode Features
- **GitHub-Flavored Markdown**: Standard GFM rendering
- **Interactive Task Lists**: Click to toggle checkboxes
- **Live Links**: Clickable external and internal links
- **Math Rendering**: KaTeX mathematical expressions
- **Diagram Rendering**: Mermaid diagrams and flowcharts
- **Syntax Highlighting**: Code blocks with language highlighting
- **Zoom Controls**: 50%-300% zoom with smooth scaling
- **Context Menu**: Right-click for preview-specific actions

### Split Mode Features
- **Synchronized Editing**: Changes appear immediately in preview
- **Independent Scrolling**: Each pane scrolls separately
- **Adjustable Split**: Drag divider to resize panes
- **Dual Context**: Both editor and preview context menus available
- **Performance Optimized**: Efficient rendering for both panes

---

## 🔧 Quick Troubleshooting

### Performance Issues
- **High Memory**: Check Performance Dashboard (Settings > Performance)
- **Slow Response**: Close unused tabs, use memory cleanup
- **Lag in Large Files**: Enable tab virtualization

### Display Issues
- **Zoom Problems**: Press Ctrl+0 to reset zoom
- **Theme Issues**: Toggle theme with Ctrl+T
- **Font Problems**: Reset font size in markdown toolbar

### File Issues
- **Won't Open**: Check file permissions and encoding
- **Save Fails**: Verify write permissions and disk space
- **Association Problems**: Re-run installer as administrator

---

*This quick reference covers all interactive elements and shortcuts in Markdown Editor v2.0. Keep this handy for maximum productivity!*

**Last Updated**: December 2024  
**Version**: 2.0+