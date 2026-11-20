#!/usr/bin/env bash
# Runs every time the Codespace starts: point auth at the forwarded URL and start the app.
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
nohup npm start > /tmp/lisan.log 2>&1 &
echo "Lisan is starting on port 3000 (log: /tmp/lisan.log)"
