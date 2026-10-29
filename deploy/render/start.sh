#!/usr/bin/env bash
# Runs the worker and the API side by side. If either exits, so does the container, and the host
# restarts it: a half-running MergeTip (API up, nothing paying) is worse than a restart.
set -euo pipefail

# The host chooses the port (Render sets PORT); the API reads API_ADDR.
export API_ADDR="0.0.0.0:${PORT:-8080}"
bin="$(cd "$(dirname "$0")" && pwd)"

"$bin/mergetip-worker" &
worker=$!
"$bin/mergetip-api" &
api=$!

# Pass a shutdown request on to both, so in-flight jobs finish cleanly.
trap 'kill -TERM "$worker" "$api" 2>/dev/null' TERM INT

status=0
wait -n "$worker" "$api" || status=$?
kill -TERM "$worker" "$api" 2>/dev/null || true
wait || true
exit "$status"
