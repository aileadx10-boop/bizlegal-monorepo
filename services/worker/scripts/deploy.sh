#!/usr/bin/env bash
#
# bizlegal-lead-intake — one-shot Day 2 deploy script
#
# Deploys the Cloudflare Worker and sets its 4-5 secrets in one pass.
#
# WHAT THIS DOES (review before running):
#   1. Reads values from ~/.env.CANONICAL.txt:
#        - ANTHROPIC_API_KEY_COMPLIANCE  -> Worker secret ANTHROPIC_API_KEY
#        - TELEGRAM_BOT_TOKEN (optional) -> Worker secret TELEGRAM_BOT_TOKEN
#        - TELEGRAM_CHAT_ID (optional)   -> Worker secret TELEGRAM_CHAT_ID (fallback 989097520)
#   2. Calls `gh auth token`             -> Worker secret GITHUB_TOKEN
#   3. Generates a fresh WEBHOOK_SHARED_SECRET (32 bytes hex)
#      and writes it ONLY to ~/.bizlegal/webhook-secret (chmod 600, never to stdout)
#   4. Writes a short-lived secrets JSON to $TMPDIR (0600, outside repo)
#   5. Runs: wrangler deploy   (creates the Worker)
#   6. Runs: wrangler secret bulk <temp file>   (uploads all secrets)
#   7. Deletes the temp JSON
#
# Secret values never enter stdout, your shell history, or any chat transcript.
#
# Usage:
#   bash scripts/deploy.sh
#
# After deploy, to curl the Worker:
#   source ~/.bizlegal/webhook-secret.env    # exports WEBHOOK_SHARED_SECRET
#   curl -H "x-bizlegal-secret: $WEBHOOK_SHARED_SECRET" ...
#
# Requires:
#   - wrangler logged in
#   - gh logged in
#   - node + openssl (or node crypto fallback) on PATH
#   - ~/.env.CANONICAL.txt populated

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

ENV_FILE="${HOME}/.env.CANONICAL.txt"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE="/c/Users/Moshe Dor/.env.CANONICAL.txt"
fi
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: canonical env file not found at \$HOME or /c/Users/Moshe Dor/" >&2
  exit 1
fi

echo "==> Checking wrangler auth"
wrangler whoami >/dev/null 2>&1 || { echo "Run 'wrangler login' first" >&2; exit 1; }

echo "==> Checking gh auth"
gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first" >&2; exit 1; }

extract() {
  local key="$1"
  local line
  line=$(grep "^${key}=" "$ENV_FILE" | head -n1 || true)
  if [[ -z "$line" ]]; then return 1; fi
  printf '%s' "${line#${key}=}" | sed 's/^"//; s/"$//'
}

echo "==> Reading canonical env"
ANTHROPIC_VAL="$(extract ANTHROPIC_API_KEY_COMPLIANCE)" || { echo "Missing ANTHROPIC_API_KEY_COMPLIANCE" >&2; exit 1; }
GITHUB_VAL="$(gh auth token)"
TELEGRAM_BOT_VAL="$(extract TELEGRAM_BOT_TOKEN || true)"
TELEGRAM_CHAT_VAL="$(extract TELEGRAM_CHAT_ID || echo 989097520)"
SHARED_SECRET="$(openssl rand -hex 32 2>/dev/null || node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"

[[ -n "$ANTHROPIC_VAL"   ]] || { echo "ANTHROPIC value empty"; exit 1; }
[[ -n "$GITHUB_VAL"      ]] || { echo "GITHUB token empty"; exit 1; }
[[ -n "$SHARED_SECRET"   ]] || { echo "Shared secret generation failed"; exit 1; }

# Stash shared secret in a private file so the user can source it later.
mkdir -p "${HOME}/.bizlegal"
chmod 700 "${HOME}/.bizlegal"
SECRET_ENV_FILE="${HOME}/.bizlegal/webhook-secret.env"
printf 'export WEBHOOK_SHARED_SECRET=%q\n' "$SHARED_SECRET" > "$SECRET_ENV_FILE"
chmod 600 "$SECRET_ENV_FILE"

# Build temp secrets.json (outside repo, 0600, deleted on exit)
TMP_JSON="${TMPDIR:-/tmp}/bizlegal-intake-secrets.$$.json"
node -e '
const fs = require("fs");
const out = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_VAL,
  GITHUB_TOKEN: process.env.GITHUB_VAL,
  WEBHOOK_SHARED_SECRET: process.env.SHARED_SECRET,
};
if (process.env.TELEGRAM_BOT_VAL) out.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_VAL;
if (process.env.TELEGRAM_CHAT_VAL) out.TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_VAL;
fs.writeFileSync(process.env.TMP_JSON, JSON.stringify(out), {mode: 0o600});
console.log("[deploy] prepared " + Object.keys(out).length + " secrets");
' ANTHROPIC_VAL="$ANTHROPIC_VAL" GITHUB_VAL="$GITHUB_VAL" TELEGRAM_BOT_VAL="${TELEGRAM_BOT_VAL:-}" TELEGRAM_CHAT_VAL="${TELEGRAM_CHAT_VAL:-}" SHARED_SECRET="$SHARED_SECRET" TMP_JSON="$TMP_JSON"

cleanup() { rm -f "$TMP_JSON"; }
trap cleanup EXIT

echo "==> Deploying Worker (first deploy creates it)"
wrangler deploy

echo "==> Bulk-setting secrets"
wrangler secret bulk "$TMP_JSON"

echo
echo "=================================================="
echo "DEPLOY COMPLETE"
echo "=================================================="
echo
echo "Worker URL printed above by wrangler (look for bizlegal-lead-intake.<sub>.workers.dev)."
echo
echo "Health check:"
echo "  curl https://bizlegal-lead-intake.<SUBDOMAIN>.workers.dev/health"
echo
echo "Smoke test (loads the shared secret from your home dir, NOT from scrollback):"
echo "  source ${SECRET_ENV_FILE}"
echo "  curl -X POST https://bizlegal-lead-intake.<SUBDOMAIN>.workers.dev/intake \\"
echo "    -H 'content-type: application/json' \\"
echo "    -H \"x-bizlegal-secret: \$WEBHOOK_SHARED_SECRET\" \\"
echo "    -d '{\"full_name\":\"Test Lead\",\"email\":\"test@example.com\",\"challenge\":\"MiCA CASP application needed for EUR stablecoin, Q3 France launch. Seed round closed, 30 employees, CCO-led.\"}'"
echo
echo "Expected: 202 Accepted with lead_id. Pipeline runs in background."
echo "Check after ~30s:"
echo "  1. bizlegal-ea/lead_profiles/ for new .md + .json files"
echo "  2. Telegram chat 989097520 for notification (if score >= 7)"
echo "  3. bizlegal-ea/decisions/log.md for the new lead line"
echo
echo "Shared secret was saved to: ${SECRET_ENV_FILE}"
echo "Permissions: 600 (only you can read)"
