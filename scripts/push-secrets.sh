#!/usr/bin/env bash
# Push private config files to this repo's Actions secrets. Each run OVERWRITES the secret.
# Files live outside the repo, next to it: ../.config/atkd.github.io (override with $ATKD_CONFIG_DIR).
# Templates: config/examples/. Usage: npm run secrets:push
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
C="${ATKD_CONFIG_DIR:-$ROOT/../.config/atkd.github.io}"

set_from() {
  local name=$1 file=$C/$2
  if [ ! -f "$file" ]; then echo "skip  $name  ($file not found)"; return; fi
  if [[ "$file" == *.json ]]; then node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$file" || { echo "FAIL  $name  invalid JSON"; exit 1; }; fi
  gh secret set "$name" < "$file" && echo "set   $name  ($(grep -cv '^\s*\(#\|$\)' "$file") lines)"
}

set_from LEAK_DENYLIST        leak-denylist.txt
set_from SHOWCASE_REPOS       showcase-repos.json
set_from STARS_EXCLUDE_OWNERS stars-exclude-owners.txt
echo "SHOWCASE_TOKEN is not stored in a file: rotate it with 'gh secret set SHOWCASE_TOKEN'."
