#!/usr/bin/env bash
# burst-check.sh — the one local check of a burst, before its pull request.
#
# Usage: bash .icm/local/burst-check.sh
#
# Only the coordinator of a burst runs it, on the branch burst-<N>, after the merge of the
# ticket branches. A ticket session does not run it. The rule is .icm/local/BURSTS.md.
# It changes no file and no database. It is not a replacement for CI: the pull request of
# the burst gets the CI run.
#
# Steps, in order. The script stops at the first step that fails:
#   1. the branch is burst-<N>, and the working tree is clean
#   2. the migration order (src/db/migrations-journal.test.ts)
#   3. typecheck
#   4. lint
#   5. the unit tests
#
# Last line: "RESULT: OK <seconds>s" or "RESULT: STOP <reason>".
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

stop() {
  echo "RESULT: STOP $*"
  exit 1
}

branch="$(git branch --show-current)"
case "$branch" in
  burst-[0-9]*) ;;
  *) stop "the branch is '$branch'. Run this script only on a branch burst-<N>" ;;
esac
[ -z "$(git status --porcelain)" ] || stop "the working tree is not clean. Commit first"
[ -d node_modules ] || stop "node_modules is absent. Run: npm ci"

start=$SECONDS
step() {
  local name="$1" t=$SECONDS
  shift
  echo "== $name"
  "$@" || stop "$name failed"
  echo "== $name: OK ($((SECONDS - t))s)"
}

step "migration order" npx vitest run src/db/migrations-journal.test.ts
step "typecheck" npm run typecheck
step "lint" npm run lint
step "unit tests" npm run test

echo "RESULT: OK $((SECONDS - start))s"
