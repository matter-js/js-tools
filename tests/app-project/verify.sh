#!/usr/bin/env bash
set -euo pipefail

nacho-build --clean

test -f dist/esm/main.js || { echo "missing dist/esm/main.js" >&2; exit 1; }

sleep 1
ref=$(mktemp)
nacho-build
changed=$(find dist build -newer "$ref" -type f 2>/dev/null || true)
if [ -n "$changed" ]; then
    echo "ERROR: second build regenerated files:" >&2
    echo "$changed" >&2
    exit 1
fi
