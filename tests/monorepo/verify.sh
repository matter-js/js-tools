#!/usr/bin/env bash
set -euo pipefail

nacho-build --clean

for f in \
    packages/a/dist/esm/index.js \
    packages/a/dist/esm/index.d.ts \
    packages/a/dist/cjs/index.js \
    packages/b/dist/esm/index.js \
    packages/b/dist/esm/index.d.ts \
    packages/b/dist/cjs/index.js
do
    test -f "$f" || { echo "missing $f" >&2; exit 1; }
done

# nacho-build syncs tsconfig project references to follow package deps.  After
# the build, b/src/tsconfig.json should reference a/src.
grep -q '"path": "../../a/src"' packages/b/src/tsconfig.json || {
    echo "expected b's tsconfig to reference packages/a/src after sync" >&2
    cat packages/b/src/tsconfig.json >&2
    exit 1
}

sleep 1
ref=$(mktemp)
nacho-build
changed=$(find packages/*/dist packages/*/build -newer "$ref" -type f 2>/dev/null || true)
if [ -n "$changed" ]; then
    echo "ERROR: second build regenerated files:" >&2
    echo "$changed" >&2
    exit 1
fi
