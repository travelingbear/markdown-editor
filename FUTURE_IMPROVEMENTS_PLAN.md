# Future Improvements Plan - Markdown Viewer

## 🚀 Version 2.0 Enhancement Roadmap

This document outlines planned improvements and new features for future versions of the Markdown Viewer application.

---

## 🎨 User Experience Enhancements

### 1. **Distraction-Free Mode**

#### Description
A clean, minimal interface that hides all UI elements except the essential content area, allowing users to focus purely on reading or writing.

#### Features
- **Toggle Shortcut**: F11 or Ctrl+Shift+F for instant distraction-free mode
- **Hidden Elements**: Toolbar, status bar, window decorations (when possible)
- **Minimal Interface**: Only content area visible with subtle scroll indicators
- **Exit Options**: ESC key or mouse movement to restore full interface
- **Mode Memory**: Remember distraction-free preference per document

#### Implementation Priority
**High** - Significantly improves writing and reading experience

#### Technical Requirements
- CSS media queries for distraction-free styling
- JavaScript toggle functionality
- Tauri window decoration control
- Smooth transition animations

---

## 📄 Layout & Typography Improvements

### 2. **Centered Content with A4 Page Layout**

#### Description
Center the preview and code content within a page-width container with configurable margins, mimicking a physical document layout.

#### Features
- **A4 Page Width**: Default 210mm (8.27") content width
- **Configurable Margins**: User-adjustable left/right margins (default 1 inch)
- **Multiple Page Sizes**: A4, Letter, Legal, Custom width options
- **Responsive Centering**: Content centered regardless of window size
- **Print Consistency**: WYSIWYG - screen layout matches printed output

#### Settings Options
```
Page Layout:
├── Page Size: [A4] [Letter] [Legal] [Custom]
├── Content Width: [210mm] (for A4)
├── Left Margin: [25mm]
├── Right Margin: [25mm]
└── Background: [White] [Off-white] [Transparent]
```

#### Implementation Priority
**Medium** - Improves document presentation and print consistency

#### Technical Requirements
- CSS container queries and max-width constraints
- Settings persistence for layout preferences
- Dynamic CSS custom properties for margins
- Print media query alignment

---

## ⚙️ Settings & Configuration

### 3. **Enhanced Settings Window**

#### Description
Replace the current text-based settings dialog with a modern, clickable interface featuring tabs, toggles, and visual controls.

#### Features
- **Tabbed Interface**: General, Editor, Appearance, Advanced
- **Visual Controls**: Toggle switches, dropdown menus, color pickers
- **Live Preview**: Settings changes visible immediately
- **Import/Export**: Save and share settings configurations
- **Reset Options**: Reset to defaults per category or globally

#### Settings Categories
```
┌─ General ─────────────────────────┐
│ ☑ Auto-save every 5 minutes      │
│ ☑ Remember window position       │
│ ☐ Start with last opened file    │
│ Default file format: [.md ▼]     │
└───────────────────────────────────┘

┌─ Editor ──────────────────────────┐
│ Font family: [Consolas ▼]        │
│ Font size: [14px ▼]              │
│ ☑ Word wrap                      │
│ ☑ Line numbers                   │
│ Tab size: [4 ▼]                  │
└───────────────────────────────────┘

┌─ Appearance ──────────────────────┐
│ Theme: ○ Light ● Dark ○ Auto     │
│ Page layout: ☑ Centered A4       │
│ Margins: [25mm ▼]                │
│ Zoom level: [100% ▼]             │
└───────────────────────────────────┘
```

#### Implementation Priority
**Medium** - Improves user experience and accessibility

#### Technical Requirements
- Modern HTML/CSS interface design
- Settings validation and error handling
- Configuration file management
- Responsive design for different screen sizes

---

## 🎨 Branding & Identity

### 4. **Custom Icon and Favicon**

#### Description
Design and implement a unique, professional icon that represents the markdown editing functionality and establishes brand identity.

#### Requirements
- **Icon Design**: Modern, clean design representing markdown/text editing
- **Multiple Formats**: ICO, PNG, ICNS for all platforms
- **Size Variants**: 16x16, 32x32, 48x48, 128x128, 256x256, 512x512
- **Favicon**: Web-compatible favicon for HTML exports
- **Consistency**: Cohesive design across all platforms and contexts

#### Design Concepts
- Markdown symbol (M↓) with document icon
- Text editor with markdown syntax highlighting
- Split-screen representation (code/preview)
- Minimalist geometric design

#### Implementation Priority
**Low** - Aesthetic improvement, not functional

#### Technical Requirements
- Icon design software (Figma, Illustrator, or similar)
- Icon generation tools for multiple formats
- Tauri configuration updates
- Asset pipeline integration

---

## 📜 Legal & Licensing

### 5. **MIT License Implementation**

#### Description
Add proper MIT license to the project for open-source distribution and legal clarity.

#### Requirements
- **LICENSE File**: Standard MIT license text with copyright holder
- **Header Comments**: License headers in source files
- **Documentation**: License information in README and about dialog
- **Attribution**: Proper attribution for third-party libraries

#### Files to Create/Update
```
├── LICENSE (MIT license text)
├── README.md (license section)
├── src/main.js (license header)
├── src-tauri/src/lib.rs (license header)
└── About dialog (license information)
```

#### Implementation Priority
**High** - Required for proper open-source distribution

#### Technical Requirements
- Legal review of license terms
- Consistent license headers
- Third-party license compliance audit

---

## 📦 Distribution Improvements

### 6. **User-Only MSI Installation**

#### Description
Modify the MSI installer to install only for the current user instead of system-wide, eliminating the need for administrator privileges.

#### Benefits
- **No Admin Rights**: Users can install without administrator privileges
- **Faster Installation**: Reduced security prompts and UAC dialogs
- **User Isolation**: Each user has their own installation and settings
- **Corporate Friendly**: Easier deployment in restricted environments

#### Technical Changes
```xml
<!-- WiX configuration changes -->
<Package InstallScope="perUser" />
<Property Id="ALLUSERS" Value="2" />
<Property Id="MSIINSTALLPERUSER" Value="1" />
```

#### Implementation Priority
**Medium** - Improves installation experience

#### Technical Requirements
- WiX Toolset configuration updates
- Installation testing on different Windows versions
- User profile path handling
- Registry key location updates

---

## 🗓️ Implementation Timeline

### Phase 7: UI/UX Enhancements (4-6 weeks)
- **Week 1-2**: Distraction-free mode implementation
- **Week 3-4**: Centered A4 layout with configurable margins
- **Week 5-6**: Enhanced settings window with visual controls

### Phase 8: Branding & Legal (2-3 weeks)
- **Week 1**: Custom icon design and implementation
- **Week 2**: MIT license integration and legal compliance
- **Week 3**: User-only MSI installer configuration

### Phase 9: Advanced Features (6-8 weeks)
- **Future consideration**: Additional features based on user feedback

---

## 📊 Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Distraction-Free Mode | High | Medium | **High** |
| MIT License | Medium | Low | **High** |
| Enhanced Settings | High | High | **Medium** |
| A4 Centered Layout | Medium | Medium | **Medium** |
| User-Only MSI | Medium | Low | **Medium** |
| Custom Icon | Low | Medium | **Low** |

---

## 🎯 Success Metrics

### User Experience
- **Distraction-Free Usage**: >30% of users enable distraction-free mode
- **Settings Accessibility**: Reduced support requests about configuration
- **Installation Success**: >95% successful installations without admin rights

### Technical Quality
- **Performance**: No degradation in startup time or memory usage
- **Compatibility**: All features work across Windows 10/11
- **Stability**: Zero crashes related to new features

### Adoption
- **User Feedback**: Positive reception of new features
- **Usage Analytics**: Increased session duration with distraction-free mode
- **Distribution**: Easier installation drives higher adoption

---

## 📝 Implementation Notes

### Development Approach
- **Feature Branches**: Each improvement gets its own feature branch
- **User Testing**: Validate each feature with user feedback before merging
- **Backward Compatibility**: Ensure all improvements are optional and don't break existing functionality
- **Documentation**: Update all relevant documentation with new features

### Technical Considerations
- **Settings Migration**: Handle migration of existing user settings
- **Performance Impact**: Monitor and optimize performance with new features
- **Cross-Platform**: Ensure features work consistently across all supported platforms
- **Accessibility**: Follow accessibility guidelines for new UI elements

---

**This roadmap provides a clear path for enhancing the Markdown Viewer while maintaining its core simplicity and performance. Each improvement is designed to add value without compromising the application's fundamental strengths.**