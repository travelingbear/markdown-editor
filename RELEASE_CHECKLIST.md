# Release Checklist - Markdown Viewer

## 🚀 Pre-Release Preparation

### Version Management
- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Update CHANGELOG.md with new features and fixes
- [ ] Update README.md if needed

### Code Quality
- [ ] All Phase 6 features implemented
- [ ] No critical bugs or regressions
- [ ] Performance targets met (< 2s startup, < 500ms file ops)
- [ ] Memory usage within limits (< 200MB typical)
- [ ] All keyboard shortcuts working
- [ ] File associations configured correctly

### Documentation
- [ ] BUILD_GUIDE.md updated
- [ ] INSTALLATION_GUIDE.md updated
- [ ] README.md reflects current features
- [ ] CHANGELOG.md includes all changes
- [ ] User-facing documentation complete

## 🏗️ Build Process

### Environment Setup
- [ ] Rust toolchain installed and updated
- [ ] Node.js 18+ installed
- [ ] Tauri CLI installed (`npm install -g @tauri-apps/cli`)
- [ ] Platform-specific dependencies installed

### Windows Build
- [ ] Visual Studio Build Tools installed
- [ ] WebView2 runtime available
- [ ] Run `release-build.bat`
- [ ] Verify MSI installer: `Markdown Viewer_1.0.0_x64_en-US.msi`
- [ ] Verify NSIS installer: `Markdown Viewer_1.0.0_x64-setup.exe`
- [ ] Verify portable executable: `markdown-viewer.exe`

### macOS Build (if available)
- [ ] Xcode Command Line Tools installed
- [ ] Run `./release-build.sh`
- [ ] Verify DMG package: `Markdown Viewer_1.0.0_x64.dmg`
- [ ] Verify App bundle: `Markdown Viewer.app`

### Linux Build (if available)
- [ ] System dependencies installed (webkit2gtk, etc.)
- [ ] Run `./release-build.sh`
- [ ] Verify AppImage: `markdown-viewer_1.0.0_amd64.AppImage`
- [ ] Verify DEB package: `markdown-viewer_1.0.0_amd64.deb`

## 🧪 Testing Phase

### Installation Testing
- [ ] **Windows MSI**: Clean install on Windows 10/11
- [ ] **Windows NSIS**: Clean install with custom directory
- [ ] **Windows Portable**: Extract and run without installation
- [ ] **macOS DMG**: Mount and install to Applications (if available)
- [ ] **Linux AppImage**: Download and run directly (if available)
- [ ] **Linux DEB**: Install via package manager (if available)

### Functionality Testing
- [ ] Application launches successfully
- [ ] Welcome screen displays correctly
- [ ] File operations work (Open, Save, Save As, New, Close)
- [ ] All three modes function (Code, Preview, Split)
- [ ] Monaco Editor loads with syntax highlighting
- [ ] Markdown rendering works (text, lists, tables, code blocks)
- [ ] Advanced features work (KaTeX math, Mermaid diagrams)
- [ ] Interactive checkboxes function correctly
- [ ] Image support works (PNG, JPG, GIF, WebP, SVG)
- [ ] Drag-drop functionality works
- [ ] Export features work (HTML, PDF/Print)
- [ ] Theme switching works (Light/Dark)
- [ ] Settings persist across sessions
- [ ] Keyboard shortcuts respond correctly
- [ ] Window close handler prompts for unsaved changes
- [ ] File associations work (double-click .md files)

### Performance Testing
- [ ] Startup time < 2 seconds
- [ ] File opening < 500ms for typical files
- [ ] Mode switching < 100ms
- [ ] Preview updates < 300ms
- [ ] Memory usage < 200MB for typical documents
- [ ] No memory leaks during extended use
- [ ] Smooth scrolling and UI interactions

### Cross-Platform Testing
- [ ] **Windows 10**: All features work correctly
- [ ] **Windows 11**: All features work correctly
- [ ] **macOS**: All features work correctly (if available)
- [ ] **Linux Ubuntu**: All features work correctly (if available)
- [ ] **Linux Debian**: All features work correctly (if available)

## 📦 Package Verification

### File Integrity
- [ ] All installers are virus-free
- [ ] Digital signatures valid (if applicable)
- [ ] Package sizes reasonable (< 50MB)
- [ ] No missing dependencies
- [ ] Icons display correctly in installers

### Installation Experience
- [ ] Installer UI is professional and clear
- [ ] Installation completes without errors
- [ ] File associations register correctly
- [ ] Desktop shortcuts created (if selected)
- [ ] Start menu entries created (Windows)
- [ ] Applications folder integration (macOS)
- [ ] System integration works (Linux)

### Uninstallation
- [ ] Uninstaller removes all files
- [ ] Registry entries cleaned (Windows)
- [ ] File associations removed
- [ ] No leftover files or folders
- [ ] User settings preserved option works

## 📋 Release Documentation

### Release Notes
- [ ] Version number and release date
- [ ] New features summary
- [ ] Bug fixes and improvements
- [ ] Known issues (if any)
- [ ] Upgrade instructions
- [ ] System requirements

### Distribution Preparation
- [ ] Release packages uploaded to distribution platform
- [ ] Download links tested and working
- [ ] Installation guides updated
- [ ] Release announcement prepared
- [ ] Social media posts prepared (if applicable)

## 🎯 Final Validation

### User Acceptance
- [ ] All Phase 6 success criteria met
- [ ] No critical bugs remaining
- [ ] Performance targets achieved
- [ ] User experience is polished
- [ ] Documentation is complete and accurate

### Release Approval
- [ ] Technical review completed
- [ ] User testing completed
- [ ] Documentation review completed
- [ ] Release packages verified
- [ ] Distribution channels ready

## 🚀 Release Execution

### Distribution
- [ ] Upload packages to release platform
- [ ] Update download links on website
- [ ] Publish release notes
- [ ] Announce on relevant channels
- [ ] Monitor for immediate issues

### Post-Release
- [ ] Monitor user feedback
- [ ] Track download statistics
- [ ] Address critical issues quickly
- [ ] Plan next version features
- [ ] Update project roadmap

## 📊 Success Metrics

### Technical Metrics
- [ ] Bundle size < 50MB
- [ ] Startup time < 2 seconds
- [ ] Memory usage < 200MB
- [ ] Zero critical bugs
- [ ] All features working

### User Experience Metrics
- [ ] Installation success rate > 95%
- [ ] User satisfaction feedback positive
- [ ] No major usability issues reported
- [ ] Documentation clarity confirmed
- [ ] Support requests manageable

---

**This checklist ensures a high-quality release that meets all Phase 6 objectives and provides an excellent user experience across all supported platforms.**