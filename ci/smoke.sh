#!/usr/bin/env bash
set -euo pipefail

# Smoke-test every fixture under tests/.  Each fixture is copied into an
# isolated temp dir, installed against the source-built package, then its
# verify.sh is run.  Failure of any fixture aborts the whole run.

cd /work

TOOLS_TARBALL=$(mktemp -d)/nacho-tools.tgz
npm pack --pack-destination "$(dirname "$TOOLS_TARBALL")" >/dev/null
mv "$(dirname "$TOOLS_TARBALL")"/nacho-iot-js-tools-*.tgz "$TOOLS_TARBALL"

for fixture in tests/*/; do
    name=$(basename "$fixture")
    echo
    echo "=== smoke: $name ==="

    work=$(mktemp -d)
    cp -R "$fixture"/. "$work"/

    (
        cd "$work"
        npm install --silent --no-audit --no-fund "$TOOLS_TARBALL"
        chmod +x verify.sh
        PATH="$work/node_modules/.bin:$PATH" ./verify.sh
    )

    rm -rf "$work"
    echo "=== smoke: $name OK ==="
done
