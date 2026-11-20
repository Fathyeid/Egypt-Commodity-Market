#!/usr/bin/env bash
# Points auth at the Codespaces forwarded URL and starts the app.
#   bash .devcontainer/start.sh               → background (survives the lifecycle hook)
#   bash .devcontainer/start.sh --foreground  → foreground (from a terminal)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  if grep -q '^BETTER_AUTH_URL=' .env; then
    sed -i "s#^BETTER_AUTH_URL=.*#BETTER_AUTH_URL=${URL}#" .env
  else
    echo "BETTER_AUTH_URL=${URL}" >> .env
  fi
fi

pkill -f "next start" 2>/dev/null || true
if [ "${1:-}" = "--foreground" ]; then
  echo "Starting Lisan on port 3000…"
  exec npm start
fi
# setsid detaches from the hook's process group so Codespaces doesn't kill it when the hook ends.
setsid nohup npm start > /tmp/lisan.log 2>&1 < /dev/null &
echo "Lisan is starting on port 3000 (log: /tmp/lisan.log)"
