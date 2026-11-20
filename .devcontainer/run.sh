#!/usr/bin/env bash
# One command to (re)start everything from a terminal: sets up if needed, then runs the app.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ] || [ ! -d node_modules ] || [ ! -f .next/BUILD_ID ]; then
  bash .devcontainer/setup.sh
fi
bash .devcontainer/start.sh --foreground
