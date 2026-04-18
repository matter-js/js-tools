#!/usr/bin/env bash
set -euo pipefail

out=$(nacho-run src/script.ts)
echo "$out"
echo "$out" | grep -q "hello nacho" || {
    echo "expected 'hello nacho' in nacho-run output" >&2
    exit 1
}
