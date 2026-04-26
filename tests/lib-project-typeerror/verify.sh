#!/usr/bin/env bash
set -euo pipefail

# nacho-build must exit non-zero and surface the diagnostic when src/ has a type error.
log=$(mktemp)
if nacho-build --clean >"$log" 2>&1; then
    echo "ERROR: nacho-build exited 0 despite a type error in src/" >&2
    cat "$log" >&2
    exit 1
fi

grep -q "error TS2322" "$log" || {
    echo "ERROR: expected TS2322 diagnostic in nacho-build output" >&2
    cat "$log" >&2
    exit 1
}
