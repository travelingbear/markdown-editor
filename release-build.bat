@echo off
echo ========================================
echo Markdown Viewer - Release Build Script
echo ========================================
echo.

cd "Markdown Viewer"

echo [1/6] Checking environment...
call npm run version
if %errorlevel% neq 0 (
    echo ERROR: Tauri not found. Please install Tauri CLI.
    pause
    exit /b 1
)

echo.
echo [2/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [3/6] Cleaning previous builds...
call npm run clean
if %errorlevel% neq 0 (
    echo WARNING: Clean command failed, continuing...
)

echo.
echo [4/6] Building release version...
call npm run tauri build
if %errorlevel% neq 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)

echo.
echo [5/6] Verifying build outputs...
if exist "src-tauri\target\release\bundle\msi\*.msi" (
    echo ✓ MSI installer created
) else (
    echo ✗ MSI installer not found
)

if exist "src-tauri\target\release\bundle\nsis\*.exe" (
    echo ✓ NSIS installer created
) else (
    echo ✗ NSIS installer not found
)

if exist "src-tauri\target\release\markdown-viewer.exe" (
    echo ✓ Portable executable created
) else (
    echo ✗ Portable executable not found
)

echo.
echo [6/6] Build Summary
echo ==================
echo Build completed successfully!
echo.
echo Output files:
dir "src-tauri\target\release\bundle\msi\*.msi" /b 2>nul
dir "src-tauri\target\release\bundle\nsis\*.exe" /b 2>nul
echo.
echo Portable executable:
dir "src-tauri\target\release\markdown-viewer.exe" /b 2>nul
echo.
echo Build artifacts are ready for distribution!
echo.
pause