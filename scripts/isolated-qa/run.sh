#!/usr/bin/env bash
set -euo pipefail
umask 077
# Use only an empty, ephemeral hosted runner. No linked project and no remote CLI operations.
[[ "${GITHUB_ACTIONS:-}" == true && "${RUNNER_ENVIRONMENT:-}" == github-hosted ]]
repo=$PWD
work="$RUNNER_TEMP/wn-qa"
mkdir "$work"
mkdir "$work/supabase"
cp -R supabase/migrations "$work/supabase/"
cat > "$work/supabase/config.toml" <<'TOML'
project_id = "watchnest-isolated-qa"
[db]
major_version = 17
[db.seed]
enabled = false
[auth]
site_url = "http://localhost:3000"
jwt_expiry = 120
[auth.email]
enable_confirmations = true
[analytics]
enabled = false
TOML
cd "$work"
supabase start --help >/dev/null
supabase status --help >/dev/null
supabase stop --help >/dev/null
# CLI startup/status may include local secrets. Keep the output off public logs.
if ! supabase start -x studio,edge-runtime,imgproxy,realtime,logflare,vector >"$work/stack.log" 2>&1; then
  echo "Ephemeral Supabase startup or migration failed"
  # Preserve only PostgreSQL error classes, migration filenames and SQLSTATE.
  sed -nE 's/.*(SQLSTATE [A-Z0-9]{5}).*/\1/p; s/.*Applying migration ([0-9a-z_]+\.sql).*/\1/p' "$work/stack.log" | tail -6
  exit 1
fi
supabase status -o json >"$work/connections.json"
cd "$repo"
# Browser assertion errors can contain typed values or callback URLs. Publish
# only the run's named success markers and, on failure, its first source line.
result=0
node scripts/isolated-qa/run.mjs "$work/connections.json" >"$work/qa.log" 2>&1 || result=$?
sed -nE '/^PASS [A-Za-z0-9 ,.-]+$/p' "$work/qa.log"
if (( result != 0 )); then
  echo "Isolated authentication check failed"
  sed -nE 's|.*scripts/isolated-qa/run\.mjs:([0-9]+):[0-9]+.*|run.mjs line \1|p' "$work/qa.log" | head -1
fi
exit "$result"
