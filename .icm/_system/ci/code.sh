#!/usr/bin/env bash
# code.sh — the code checks of the job code in the workflow ci. Only CI runs it.
#
# In order, each only when package.json names the script:
#   1. install the dependencies from the lockfile
#   2. check:migrations --base origin/<base>, on a pull request
#   3. with DATABASE_URL (a new, empty Postgres of the job): db:migrate and db:verify.
#      Each migration applies from zero, and the tests then read that database
#   4. lint, typecheck, test
#   5. build (rc35). Postgres with db:migrate: vercel-build must run db.sh build (rc35)
# A repo with no package.json has nothing to check: exit 0.
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
. .icm/_system/scripts/lib/node.sh
[ -f package.json ] || { echo "code.sh: no package.json: nothing to check"; exit 0; }
node_install
[ -z "${BASE_REF:-}" ] || ! node_has check:migrations || node_run check:migrations --base "origin/$BASE_REF"
if [ -n "${DATABASE_URL:-}" ] && node_has db:migrate; then
  echo "code.sh: the migrations from zero, on the database of the job"
  node_run db:migrate
  node_run db:verify
fi
for s in lint typecheck test build; do node_run "$s"; done
if [ -f .icm/_system/scripts/db.sh ] && node_has db:migrate; then
  jq -e '(.scripts["vercel-build"] // "") | contains(".icm/_system/scripts/db.sh build")' package.json >/dev/null \
    || { echo "::error::package.json: the script vercel-build must run 'bash .icm/_system/scripts/db.sh build' (features/database.md)"; exit 1; }
fi
echo "RESULT: OK"
