#!/bin/sh
set -u

export HOME=/tmp
git config --global --add safe.directory /repo

REPO=/repo
OUT=/output

echo "[]" > "$OUT/gitleaks.json"
echo "{}" > "$OUT/semgrep.json"
echo "{}" > "$OUT/trivy.json"
echo "{}" > "$OUT/npm-audit.json"
echo "{}" > "$OUT/pip-audit.json"

log() { echo "[scan] $*" >&2; }

if [ -d "$REPO/.git" ]; then
  log "running gitleaks"
  gitleaks detect --source="$REPO" --no-banner \
    --report-format=json --report-path="$OUT/gitleaks.json" || true
else
  log "no .git directory found, skipping gitleaks"
fi


log "running trivy"
trivy fs --skip-db-update --scanners vuln,secret,misconfig \
  --format json --output "$OUT/trivy.json" "$REPO" || true

if [ -f "$REPO/package-lock.json" ] || [ -f "$REPO/package.json" ]; then
  if [ "${ALLOW_DEP_AUDIT_NETWORK:-0}" = "1" ]; then
    log "running npm audit (network allowed)"
    (cd "$REPO" && npm audit --json > "$OUT/npm-audit.json") || true
  else
    log "skipping npm audit: no network in sandbox, relying on trivy fs scan"
  fi
fi

if [ -f "$REPO/requirements.txt" ] || [ -f "$REPO/pyproject.toml" ]; then
  if [ "${ALLOW_DEP_AUDIT_NETWORK:-0}" = "1" ]; then
    log "running pip-audit (network allowed)"
    if [ -f "$REPO/requirements.txt" ]; then
      pip-audit -r "$REPO/requirements.txt" -f json -o "$OUT/pip-audit.json" || true
    else
      pip-audit -f json -o "$OUT/pip-audit.json" "$REPO" || true
    fi
  else
    log "skipping pip-audit: no network in sandbox, relying on trivy fs scan"
  fi
fi

log "done"