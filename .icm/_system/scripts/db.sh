#!/usr/bin/env bash
# db.sh — migrate one database, or reset the shared preview database.
# CI and the Vercel build run it. The contract is .icm/_system/features/database.md.
#
# Usage:
#   db.sh build     the script vercel-build (rc35): migrate DATABASE_URL_UNPOOLED (else
#                   DATABASE_URL) of the Vercel environment, then build. A fault fails the
#                   build. Not on Vercel, or production with UAT (the promotion migrates): build
#   db.sh migrate   db:migrate, then db:verify, on DATABASE_URL (the dependencies installed).
#                   No DATABASE_URL: a stop with REQUIRED=true, else a skip
#   db.sh reset     empty DATABASE_URL (the preview database): drop each schema of the
#                   owner. Then, when SOURCE_DATABASE_URL (UAT) is set, copy it into
#                   DATABASE_URL. Needs pg_dump and psql. A schema of another owner
#                   (neon_auth) is not dropped and not copied
#
# A migration needs a direct connection, not a pooled one. Migrations go forward only.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$here/lib/project.sh"

case "${1:-}" in
build)
  . "$here/lib/node.sh"
  target="${VERCEL_TARGET_ENV:-${VERCEL_ENV:-}}" url="${DATABASE_URL_UNPOOLED:-${DATABASE_URL:-}}"
  if [ "${VERCEL:-}" != 1 ] || ! node_has db:migrate; then
    echo "db.sh: not a Vercel build, or no db:migrate: no migration"
  elif [ "$target" = production ] && [ -f "$here/promote.sh" ]; then
    echo "db.sh: a production build with UAT: the promotion migrates production"
  elif [ -z "$url" ]; then
    stop "the Vercel environment $target has no DATABASE_URL_UNPOOLED or DATABASE_URL: the build stops, and no code serves on an old schema"
  else
    echo "db.sh: the migration of the $target database, before the build"
    { DATABASE_URL="$url" node_run db:migrate && DATABASE_URL="$url" node_run db:verify; } || stop "the migration failed: no build"
  fi
  node_has build || stop "package.json names no build"
  node_run build && echo "RESULT: OK built"
  ;;
migrate)
  . "$here/lib/node.sh"
  need jq
  if [ -z "${DATABASE_URL:-}" ]; then
    [ "${REQUIRED:-}" != true ] || stop "DATABASE_URL is not set: nothing can migrate"
    echo "::warning::db.sh: DATABASE_URL is not set for this run: the database did not change"
    exit 0
  fi
  node_has db:migrate || { echo "db.sh: package.json names no db:migrate: nothing to migrate"; exit 0; }
  node_run db:migrate
  node_run db:verify
  echo "RESULT: OK migrated"
  ;;
reset)
  need pg_dump psql
  [ -n "${DATABASE_URL:-}" ] || stop "DATABASE_URL (the preview database) is not set"
  [ "${DATABASE_URL}" != "${SOURCE_DATABASE_URL:-}" ] || stop "the preview database and the source are the same"
  psql -v ON_ERROR_STOP=1 -q "$DATABASE_URL" <<'SQL'
DO $$ DECLARE s text; BEGIN
  FOR s IN SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg\_%'
      AND nspname <> 'information_schema'
      AND pg_get_userbyid(nspowner) IN (current_user, 'pg_database_owner') LOOP
    EXECUTE format('DROP SCHEMA %I CASCADE', s);
  END LOOP;
  CREATE SCHEMA IF NOT EXISTS public;
END $$;
SQL
  echo "db.sh: the preview database is empty"
  if [ -n "${SOURCE_DATABASE_URL:-}" ]; then
    # public exists already. A schema of another owner (neon_auth: users, keys) is not copied.
    other="$(psql -X -A -t -v ON_ERROR_STOP=1 "$SOURCE_DATABASE_URL" <<'SQL'
SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg\_%' AND nspname <> 'information_schema'
  AND pg_get_userbyid(nspowner) NOT IN (current_user, 'pg_database_owner') ORDER BY 1;
SQL
)"
    excl=(); while IFS= read -r s; do [ -z "$s" ] || excl+=("--exclude-schema=$s"); done <<<"$other"
    [ "${#excl[@]}" -eq 0 ] || echo "db.sh: not copied: ${excl[*]#--exclude-schema=}"
    pg_dump --no-owner --no-privileges "${excl[@]}" "$SOURCE_DATABASE_URL" | sed '/^CREATE SCHEMA public;$/d' \
      | psql -v ON_ERROR_STOP=1 -q "$DATABASE_URL"
    echo "db.sh: the preview database is a copy of UAT"
  fi
  echo "RESULT: OK reset"
  ;;
*) stop "usage: db.sh build | migrate | reset" ;;
esac
