#!/usr/bin/env bash
# Runs once when the Codespace is created: install, configure, migrate, seed, build.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  {
    echo "DATABASE_URL=postgres://lisan:lisan@db:5432/lisan"
    echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)"
    echo "BETTER_AUTH_URL=http://localhost:3000"
  } > .env
fi

npm ci

echo "Waiting for the database..."
for i in $(seq 1 60); do
  node -e "require('net').connect(5432,'db').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" && break
  sleep 1
done

npm run db:migrate
npm run db:seed
npm run build
