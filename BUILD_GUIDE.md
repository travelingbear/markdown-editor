# Build Guide - Markdown Viewer

## 🏗️ Building from Source

### Prerequisites

#### Windows
- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Node.js**: Version 18+ from [nodejs.org](https://nodejs.org/)
- **Visual Studio Build Tools**: Required for Windows builds
- **WebView2**: Usually pre-installed on Windows 10/11

#### macOS
- **Rust**: Install from [rustup.rs](https://rustup.rs/)
- **Node.js**: Version 18+ from [nodejs.org](https://nodejs.org/)
- **Xcode Command Line Tools**: `xcode-select --install`

#### Linux (Ubuntu/Debian)
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install system dependencies
sudo apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Build Commands

#### Development Build
```bash
cd "Markdown Viewer"
npm install
npm run dev
```

#### Production Build
```bash
cd "Markdown Viewer"
npm install
npm run tauri build
```

#### Platform-Specific Builds
```bash
# Windows (MSI + NSIS installer)
npm run tauri build

# macOS (DMG + App Bundle)
npm run tauri build

# Linux (AppImage + DEB)
npm run tauri build

# Cross-platform (use platform-specific scripts)
./release-build.bat  # Windows
./release-build.sh   # macOS/Linux
```

#### Clean Build
```bash
npm run clean
npm run tauri build
```

## 📦 Distribution Packages

### Windows
- **MSI Installer**: `src-tauri/target/release/bundle/msi/Markdown Viewer_1.0.0_x64_en-US.msi`
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/Markdown Viewer_1.0.0_x64-setup.exe`
- **Portable**: `src-tauri/target/release/markdown-viewer.exe`

### macOS
- **DMG Package**: `src-tauri/target/release/bundle/dmg/Markdown Viewer_1.0.0_x64.dmg`
- **App Bundle**: `src-tauri/target/release/bundle/macos/Markdown Viewer.app`

### Linux
- **AppImage**: `src-tauri/target/release/bundle/appimage/markdown-viewer_1.0.0_amd64.AppImage`
- **DEB Package**: `src-tauri/target/release/bundle/deb/markdown-viewer_1.0.0_amd64.deb`

## 🔧 Build Configuration

### Version Management
Update version in these files:
- `package.json` - Frontend version
- `src-tauri/Cargo.toml` - Rust package version
- `src-tauri/tauri.conf.json` - Application version

### Bundle Configuration
Edit `src-tauri/tauri.conf.json`:
- **Icons**: Update icon paths in `bundle.icon`
- **File Associations**: Modify `bundle.fileAssociations`
- **Windows**: Configure MSI/NSIS options in `bundle.windows`
- **macOS**: Set minimum version in `bundle.macOS`
- **Linux**: Configure DEB/AppImage in `bundle.linux`

## 🧪 Testing Builds

### Automated Testing
```bash
# Check build environment
npm run info

# Verify Tauri installation
npm run version

# Test development build
npm run dev

# Test production build
npm run build:debug
```

### Manual Testing Checklist
- [ ] Application launches successfully
- [ ] File associations work (double-click .md files)
- [ ] All three modes (Code/Preview/Split) function
- [ ] Drag-drop functionality works
- [ ] Export features (HTML/PDF) work
- [ ] Keyboard shortcuts respond
- [ ] Theme switching works
- [ ] Window close handler prompts for unsaved changes
- [ ] Settings persist across sessions

## 🚀 Release Process

### 1. Pre-Release Checklist
- [ ] Update version numbers in all files
- [ ] Update CHANGELOG.md with new features
- [ ] Run full test suite
- [ ] Build all platform packages
- [ ] Test installation packages on clean systems

### 2. Build Release Packages
```bash
# Clean build environment
npm run clean

# Build for all platforms
npm run build:all

# Verify package integrity
# Test installation on target platforms
```

### 3. Package Verification
- **Windows**: Test MSI and NSIS installers
- **macOS**: Test DMG mounting and app installation
- **Linux**: Test AppImage execution and DEB installation

### 4. Distribution
- Upload packages to release platform
- Update download links in documentation
- Announce release with changelog

## 🔍 Troubleshooting

### Common Build Issues

#### Windows
- **WebView2 Error**: Install WebView2 Runtime
- **MSVC Error**: Install Visual Studio Build Tools
- **Permission Error**: Run as administrator

#### macOS
- **Code Signing**: Requires Apple Developer account for distribution
- **Notarization**: Required for macOS 10.15+ distribution
- **Gatekeeper**: Users may need to allow app in Security preferences

#### Linux
- **Missing Dependencies**: Install webkit2gtk and other system libraries
- **AppImage Permissions**: Make AppImage executable (`chmod +x`)
- **DEB Installation**: Use `sudo dpkg -i` or package manager

### Build Optimization
- **Bundle Size**: Use `--release` flag for smaller binaries
- **Startup Time**: Optimize frontend dependencies
- **Memory Usage**: Profile with development tools

## 📊 Build Metrics

### Target Specifications
- **Bundle Size**: < 50MB for all platforms
- **Startup Time**: < 2 seconds on modern hardware
- **Memory Usage**: < 200MB for typical documents
- **Build Time**: < 5 minutes for release builds

### Performance Monitoring
- Monitor bundle sizes across versions
- Track startup performance on different platforms
- Measure memory usage with various document sizes
- Profile build times for optimization opportunities

---

**For development setup and contribution guidelines, see README.md**
**For detailed project architecture, see PROJECT_PLAN.md**