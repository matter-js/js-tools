#!/usr/bin/env bash
set -euo pipefail

cd /work

# The Dockerfile already executed `npm ci`, which triggered `prepare` (build-clean).
# Sanity-check that the dist tree looks right before handing off to smoke tests.
for f in \
    dist/esm/building/cli.js \
    dist/cjs/building/cli.js \
    dist/esm/running/cli.js
do
    test -f "$f" || { echo "missing expected artifact $f" >&2; exit 1; }
done

ci/smoke.sh

mkdir -p /work/out
npm pack --pack-destination /work/out
ls -l /work/out
