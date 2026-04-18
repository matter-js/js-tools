#!/usr/bin/env bash
set -euo pipefail

nacho-build --clean

for f in \
    dist/esm/index.js \
    dist/esm/index.d.ts \
    dist/cjs/index.js \
    dist/cjs/index.d.ts
do
    test -f "$f" || { echo "missing $f" >&2; exit 1; }
done

# Second build should detect a clean graph and not touch dist/ or build/.
sleep 1
ref=$(mktemp)
nacho-build
changed=$(find dist build -newer "$ref" -type f 2>/dev/null || true)
if [ -n "$changed" ]; then
    echo "ERROR: second build regenerated files:" >&2
    echo "$changed" >&2
    exit 1
fi
