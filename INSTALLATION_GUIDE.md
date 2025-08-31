# Installation Guide - Markdown Viewer

## 📥 Download & Installation

### Windows

#### Option 1: MSI Installer (Recommended)
1. Download `Markdown Viewer_1.0.0_x64_en-US.msi`
2. Double-click the MSI file
3. Follow the installation wizard
4. The app will be installed to `Program Files`
5. File associations (.md, .markdown, .txt) will be registered automatically

#### Option 2: NSIS Installer
1. Download `Markdown Viewer_1.0.0_x64-setup.exe`
2. Run the installer as administrator
3. Choose installation directory
4. Complete the installation process

#### Option 3: Portable Version
1. Download the portable executable
2. Place `markdown-viewer.exe` in desired folder
3. Run directly without installation
4. File associations must be configured manually

### macOS

#### Option 1: DMG Package (Recommended)
1. Download `Markdown Viewer_1.0.0_x64.dmg`
2. Double-click to mount the DMG
3. Drag `Markdown Viewer.app` to Applications folder
4. Eject the DMG
5. Launch from Applications or Launchpad

#### Option 2: Direct App Bundle
1. Download `Markdown Viewer.app`
2. Move to Applications folder
3. Right-click and select "Open" (first launch only)
4. Confirm opening the app in security dialog

### Linux

#### Option 1: AppImage (Universal)
1. Download `markdown-viewer_1.0.0_amd64.AppImage`
2. Make executable: `chmod +x markdown-viewer_1.0.0_amd64.AppImage`
3. Run directly: `./markdown-viewer_1.0.0_amd64.AppImage`
4. Optional: Integrate with system using AppImageLauncher

#### Option 2: DEB Package (Debian/Ubuntu)
```bash
# Download the DEB package
wget https://releases.markdown-viewer.app/markdown-viewer_1.0.0_amd64.deb

# Install using dpkg
sudo dpkg -i markdown-viewer_1.0.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

#### Option 3: Build from Source
```bash
# Clone repository
git clone https://github.com/markdown-viewer/markdown-viewer.git
cd markdown-viewer

# Install dependencies
sudo apt-get install -y libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Install Rust and Node.js
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build and install
cd "Markdown Viewer"
npm install
npm run build
```

## 🔧 System Requirements

### Minimum Requirements
- **Windows**: Windows 10 (1903) or later
- **macOS**: macOS 10.13 (High Sierra) or later
- **Linux**: Ubuntu 18.04, Debian 10, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB free space
- **Display**: 1024x768 minimum resolution

### Recommended Requirements
- **RAM**: 8GB or more for large documents
- **Storage**: 500MB for optimal performance
- **Display**: 1920x1080 or higher
- **CPU**: Multi-core processor for better performance

## ⚙️ Post-Installation Setup

### File Associations

#### Windows
File associations are configured automatically during installation:
- `.md` files → Markdown Viewer
- `.markdown` files → Markdown Viewer
- `.txt` files → Markdown Viewer (optional)

To manually configure:
1. Right-click a .md file
2. Select "Open with" → "Choose another app"
3. Browse to Markdown Viewer installation
4. Check "Always use this app"

#### macOS
1. Right-click a .md file in Finder
2. Select "Get Info"
3. In "Open with" section, choose Markdown Viewer
4. Click "Change All..." to apply to all .md files

#### Linux
File associations are configured during DEB installation. For AppImage:
```bash
# Create desktop entry
cat > ~/.local/share/applications/markdown-viewer.desktop << EOF
[Desktop Entry]
Name=Markdown Viewer
Exec=/path/to/markdown-viewer_1.0.0_amd64.AppImage %f
Icon=markdown-viewer
Type=Application
Categories=Office;TextEditor;
MimeType=text/markdown;text/x-markdown;
EOF

# Update desktop database
update-desktop-database ~/.local/share/applications/
```

### First Launch Configuration

#### Welcome Screen
On first launch, you'll see the welcome screen with:
- Quick start guide
- Keyboard shortcuts reference
- Sample document links
- Settings access

#### Settings Configuration (Ctrl+,)
Configure your preferences:
1. **Default Theme**: Light or Dark
2. **Default Mode**: Code, Preview, or Split view
3. **Text Suggestions**: Enable/disable Monaco editor autocomplete

#### Keyboard Shortcuts
Essential shortcuts to remember:
- `Ctrl+O` - Open file
- `Ctrl+N` - New file
- `Ctrl+S` - Save file
- `Ctrl+1/2/3` - Switch between Code/Preview/Split modes
- `Ctrl+/` - Toggle theme
- `Ctrl+,` - Open settings

## 🔄 Updates

### Automatic Updates
Currently, updates must be installed manually. Future versions will include automatic update checking.

### Manual Updates
1. Download the latest version
2. Uninstall the previous version (Windows/Linux)
3. Install the new version
4. Settings and preferences are preserved

### Version Checking
- Check current version: Help → About
- Latest releases: Visit the official website or GitHub releases page

## 🗑️ Uninstallation

### Windows
#### MSI Installation
1. Open "Add or Remove Programs"
2. Find "Markdown Viewer"
3. Click "Uninstall"
4. Follow the uninstall wizard

#### NSIS Installation
1. Use the uninstaller in the installation directory
2. Or use "Add or Remove Programs"

#### Portable Version
Simply delete the executable file.

### macOS
1. Open Applications folder
2. Drag "Markdown Viewer.app" to Trash
3. Empty Trash

### Linux
#### DEB Package
```bash
sudo apt-get remove markdown-viewer
# or
sudo dpkg -r markdown-viewer
```

#### AppImage
Simply delete the AppImage file and any created desktop entries.

## 🛠️ Troubleshooting

### Common Issues

#### Windows
**Issue**: "Windows protected your PC" message
**Solution**: Click "More info" → "Run anyway" or disable Windows Defender SmartScreen temporarily

**Issue**: File associations not working
**Solution**: Run installer as administrator or manually configure file associations

#### macOS
**Issue**: "App can't be opened because it's from an unidentified developer"
**Solution**: Right-click the app → "Open" → "Open" in the security dialog

**Issue**: App doesn't appear in Applications
**Solution**: Manually drag the app from DMG to Applications folder

#### Linux
**Issue**: AppImage won't run
**Solution**: Make executable with `chmod +x` and ensure FUSE is installed

**Issue**: Missing dependencies
**Solution**: Install webkit2gtk-4.0 and related packages

### Performance Issues

#### Slow Startup
- Check available RAM (minimum 4GB)
- Close other applications
- Try portable version if installed version is slow

#### Large File Performance
- Files over 10MB may load slowly
- Consider splitting large documents
- Increase system RAM if possible

### Getting Help

#### Documentation
- **User Guide**: Built-in help (F1)
- **Keyboard Shortcuts**: Welcome screen or F1
- **Technical Issues**: Check BUILD_GUIDE.md

#### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: User discussions and tips
- **Email Support**: For critical issues

#### Diagnostic Information
When reporting issues, include:
- Operating system and version
- Markdown Viewer version
- Steps to reproduce the issue
- Error messages or screenshots
- System specifications (RAM, CPU)

---

**For advanced configuration and development setup, see BUILD_GUIDE.md**
**For complete feature documentation, see PROJECT_PLAN.md**