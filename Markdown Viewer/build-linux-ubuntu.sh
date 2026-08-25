#!/usr/bin/env bash
#
# Build the Markdown Editor (Tauri 2) for Linux (Ubuntu 22.04 / 24.04).
#
# Run from any directory with either Bash or sh:
#   bash "Markdown Viewer/build-linux-ubuntu.sh"
#   sh "Markdown Viewer/build-linux-ubuntu.sh"
#
# Produces .deb and .rpm bundles under:
#   Markdown Viewer/src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/
#
# Ubuntu's /bin/sh is dash, which does not support pipefail. If the script was
# explicitly launched with `sh`, restart it with Bash before Bash-only syntax
# is evaluated. The shebang already selects Bash when the file is executable.
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

set -euo pipefail

# Resolve the application from the script itself rather than the caller's
# working directory. This supports launching from the repository root, from
# Markdown Viewer, or through an absolute path.
APP_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

echo "==> [1/5] Installing system prerequisites (requires sudo)..."

# Tauri 2 on Debian/Ubuntu uses WebKitGTK 4.1 (NOT the 4.0 packages).
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  libgtk-3-dev

echo "==> [2/5] Ensuring Rust is installed (via rustup)..."
if ! command -v rustc >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile default
  # shellcheck disable=SC1090
  source "$HOME/.cargo/env"
fi
rustc --version
cargo --version

echo "==> [3/5] Ensuring Node.js >= 20.19 is available..."
node_meets_minimum() {
  command -v node >/dev/null 2>&1 || return 1
  # Compare major and minor as separate integers. Encoding them as one decimal
  # gets version ordering wrong in both directions: 20.9 looks greater than
  # 20.19, and a string compare also puts 20.100 below it.
  local major minor
  major=$(node -p 'process.versions.node.split(".")[0]')
  minor=$(node -p 'process.versions.node.split(".")[1]')
  [ "$major" -gt 20 ] && return 0
  [ "$major" -eq 20 ] && [ "$minor" -ge 19 ]
}

if ! node_meets_minimum; then
  echo "!! Node.js 20.19+ is required. Install it via nvm, apt, or NodeSource, e.g.:"
  echo "   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"
  echo "   or use nvm:  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash"
  exit 1
fi
node --version
npm --version

echo "==> [4/5] Installing npm dependencies..."
cd "$APP_DIR"
npm ci

echo "==> [5/5] Building Linux release bundles..."
npm run build:linux

echo ""
echo "==> Done. Bundles are in:"
ls -lh src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/ 2>/dev/null || true
ls -lh src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/rpm/ 2>/dev/null || true
