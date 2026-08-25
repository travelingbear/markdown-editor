# Build Guide

This guide describes the maintained Tauri 2 and Vite 8 build workflow. Run all commands from the `Markdown Viewer` directory.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- A current stable Rust toolchain installed with rustup
- Platform tooling required by Tauri 2

Use the official [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) page for the current operating-system packages. In particular:

- Windows requires Microsoft C++ Build Tools and WebView2. MSI creation also requires the Windows VBSCRIPT optional feature used by WiX.
- macOS requires Xcode or Xcode Command Line Tools.
- Debian/Ubuntu Tauri 2 builds use WebKitGTK 4.1 development packages, not the older WebKitGTK 4.0 packages.

Vite's current Node requirements are documented in the [Vite getting-started guide](https://vite.dev/guide/).

## Install

```powershell
cd "Markdown Viewer"
npm ci
```

Use `npm install` when intentionally changing dependencies. Commit both `package.json` and `package-lock.json` for dependency changes.

## Development

Run the native application with the Vite development server:

```powershell
npm run tauri dev
```

Run only the web frontend when native file dialogs and Tauri IPC are not required:

```powershell
npm run dev:web
```

## Validation

Run the complete automated test suite:

```powershell
npm test
```

Build only the frontend bundle:

```powershell
npm run build:web
```

Inspect the installed Tauri environment:

```powershell
npm run info
```

The normal validation sequence for a code change is:

```powershell
npm test
npm run build:web
npm run tauri dev
```

## Native builds

Create a release application and the bundle types configured in `src-tauri/tauri.conf.json`:

```powershell
npm run build
```

Create an unoptimized native debug build:

```powershell
npm run build:debug
```

Native output is written below:

```text
src-tauri/target/debug/
src-tauri/target/release/
```

Installers and platform bundles are written below the corresponding `bundle` directory.

Build release packages on their target operating system whenever possible. Windows MSI/NSIS, macOS application/DMG, and Linux DEB/RPM packaging use host-specific tooling. The platform scripts in `package.json` select Rust targets; they do not install cross-compilers or replace target-platform testing.

## Building on Ubuntu

Tauri 2 Linux bundles (DEB/RPM) cannot be produced from a Windows or macOS host because packaging uses Linux tools. Run the build on an Ubuntu 22.04/24.04 machine (or VM/container):

```bash
bash "Markdown Viewer/build-linux-ubuntu.sh"
```

The script resolves the application directory from its own location, so it can also be run from inside `Markdown Viewer` as `sh build-linux-ubuntu.sh`. When invoked through Ubuntu's `sh`/`dash`, it safely restarts itself with Bash because the build uses strict `pipefail` handling.

The script installs the WebKitGTK 4.1 development packages, installs Rust when needed, checks Node.js 20.19+, installs dependencies, and runs `npm run build:linux`. The native executable is written to `src-tauri/target/x86_64-unknown-linux-gnu/release/` and installers to its `bundle/{deb,rpm}/` directories.

Test the unpackaged binary on Ubuntu with:

```bash
./src-tauri/target/x86_64-unknown-linux-gnu/release/markdown-editor
```

Install the DEB with:

```bash
sudo apt-get install -y ./src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/Markdown\ Editor_*_amd64.deb
```

## Version updates

Keep the application version synchronized in:

- `Markdown Viewer/package.json`
- `Markdown Viewer/src-tauri/Cargo.toml`
- `Markdown Viewer/src-tauri/tauri.conf.json`

Then update `CHANGELOG.md` and confirm that the lockfiles contain the intended dependency versions.

## Release checklist

1. Run `npm ci` from a clean dependency installation.
2. Run `npm test`.
3. Run `npm run build:web` and inspect bundle warnings.
4. Run `npm run tauri dev` and complete the manual smoke test.
5. Build on each supported target operating system.
6. Test every generated installer on a clean or representative machine.
7. Test file associations, single-instance file forwarding, local file opening, saving, and exports.
8. Confirm Code, Preview, and both Split orientations.
9. Confirm Pure and Extended rendering with KaTeX and Mermaid enabled and disabled.
10. Confirm application close silently restores dirty sessions, while document close still asks before discarding changes.
11. Confirm the application works without network access.

## Troubleshooting

### `light.exe` fails while creating an MSI

The native executable may already have compiled successfully. On current Windows versions, verify that the VBSCRIPT optional feature is enabled, then retry the bundle. Tauri documents this requirement in its [Windows installer guide](https://v2.tauri.app/distribute/windows-installer/).

### Linux WebKit package cannot be found

Use a distribution supported by the current Tauri 2 prerequisites and install the WebKitGTK 4.1 package for that distribution. Do not substitute the Tauri 1 WebKitGTK 4.0 package list.

### Why no AppImage is produced

The supported Linux build currently produces DEB and RPM packages only. AppImage is intentionally excluded because the current Tauri `linuxdeploy` packaging path remains unreliable in the supported WSL/Ubuntu environment. This does not affect the native executable, DEB, or RPM outputs; AppImage support can be revisited as a separate packaging task.

### Frontend works but native operations fail

Make sure the test was run with `npm run tauri dev`. The web-only server cannot provide native dialogs, filesystem permissions, single-instance handling, or Tauri commands.

### Build reports large JavaScript chunks

KaTeX, Mermaid, and CodeMirror have substantial optional/runtime chunks. Check that renderer chunks remain lazy and that no new import pulls them into the startup path. Treat a new or significantly larger startup chunk as a regression to investigate.
