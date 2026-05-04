#!/usr/bin/env bash
set -euo pipefail

nacho-build --clean

for f in \
    packages/a/dist/esm/index.js \
    packages/a/dist/esm/index.d.ts \
    packages/a/dist/esm/extras.d.ts \
    packages/a/dist/cjs/index.js \
    packages/a/dist/cjs/extras.d.ts \
    packages/b/dist/esm/index.js \
    packages/b/dist/esm/index.d.ts \
    packages/b/dist/esm/extras.d.ts \
    packages/b/dist/cjs/index.js \
    packages/b/dist/cjs/extras.d.ts
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

# nacho-build version --apply must strip `dev-types` from exports so published packages don't expose TS source via
# customConditions resolution (which would type-check node_modules .ts under skipLibCheck blind spot).
grep -q '"dev-types"' packages/a/package.json || {
    echo "expected packages/a/package.json to contain dev-types pre-apply" >&2
    exit 1
}
echo "1.2.3" > version.txt
nacho-build version --apply
if grep -q '"dev-types"' packages/a/package.json; then
    echo "ERROR: nacho-build version --apply did not strip dev-types from packages/a/package.json" >&2
    cat packages/a/package.json >&2
    exit 1
fi
grep -q '"version": "1.2.3"' packages/a/package.json || {
    echo "ERROR: nacho-build version --apply did not update version in packages/a/package.json" >&2
    cat packages/a/package.json >&2
    exit 1
}
