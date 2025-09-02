#!/bin/bash

echo "========================================"
echo "Markdown Viewer - Release Build Script"
echo "========================================"
echo

cd "Markdown Viewer"

echo "[1/6] Checking environment..."
npm run version
if [ $? -ne 0 ]; then
    echo "ERROR: Tauri not found. Please install Tauri CLI."
    exit 1
fi

echo
echo "[2/6] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies."
    exit 1
fi

echo
echo "[3/6] Cleaning previous builds..."
# Remove literal carriage returns from package.json if present
if [ -f package.json ]; then
    tr -d '\r' < package.json > package.json.tmp && mv package.json.tmp package.json
fi
npm run clean
if [ $? -ne 0 ]; then
    echo "WARNING: Clean command failed, continuing..."
fi

echo
echo "[4/6] Building release version..."
npm run tauri build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed."
    exit 1
fi

echo
echo "[5/6] Verifying build outputs..."

# Check for different platform outputs
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    if [ -f src-tauri/target/release/bundle/dmg/*.dmg ]; then
        echo "✓ DMG package created"
    else
        echo "✗ DMG package not found"
    fi
    
    if [ -d "src-tauri/target/release/bundle/macos/Markdown Viewer.app" ]; then
        echo "✓ App bundle created"
    else
        echo "✗ App bundle not found"
    fi
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    if [ -f src-tauri/target/release/bundle/appimage/*.AppImage ]; then
        echo "✓ AppImage created"
    else
        echo "✗ AppImage not found"
    fi
    
    if [ -f src-tauri/target/release/bundle/deb/*.deb ]; then
        echo "✓ DEB package created"
    else
        echo "✗ DEB package not found"
    fi
fi

# Check for executable
if [ -f "src-tauri/target/release/markdown-viewer" ]; then
    echo "✓ Executable created"
else
    echo "✗ Executable not found"
fi

echo
echo "[6/6] Build Summary"
echo "=================="
echo "Build completed successfully!"
echo
echo "Output files:"
find src-tauri/target/release/bundle -name "*.dmg" -o -name "*.deb" -o -name "*.AppImage" 2>/dev/null
echo
echo "Executable:"
ls -la src-tauri/target/release/markdown-viewer 2>/dev/null
echo
echo "Build artifacts are ready for distribution!"
echo