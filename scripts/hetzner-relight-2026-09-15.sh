#!/usr/bin/env bash
# hetzner-relight-2026-09-15.sh — plan snug §C ("Hetzner over SSH") as one idempotent run.
#
#   bash scripts/hetzner-relight-2026-09-15.sh --dry-run   # prints the plan, touches nothing
#   bash scripts/hetzner-relight-2026-09-15.sh             # applies it
#
# What it does (each step is safe to repeat):
#   1. Backs up /opt/bizlegal/curator/.env + crontab to /opt/bizlegal/backups/<date>/.
#   2. Merges vault values into the curator .env by NAME (never printed):
#      ANTHROPIC_API_KEY (the box ran a different, dead key), GOOGLE_GEMINI_API_KEY,
#      OPENROUTER_API_KEY, PERPLEXITY_API_KEY, SOCIAL_DIGEST_TO_EMAIL, NEXT_PUBLIC_HUB_URL,
#      plus ANTHROPIC_MODEL=claude-sonnet-5 (box had the retired claude-sonnet-4-6) and
#      OLLAMA_TUNNEL_URL=http://127.0.0.1:11434 (local Ollama, $0 tier).
#      TELEGRAM_HUB_TOKEN is copied from the box's working TELEGRAM_BOT_TOKEN when empty,
#      then mirrored into the vault so the canonical name finally has a value.
#   3. SCPs the agents fixed in the 2026-09-14/15 relight (conversion_funnel URL-encoding,
#      enterprise_closer → sales_outreach, monetization heartbeat, llm_router tiers,
#      brain/factual_review/publisher model ids) and the O-027 social-autopilot tool.
#   4. Cron diet (plan §C6): revenue_alerter */1 → 0 */6, code_fixer disabled,
#      self_heal + ops_alerts */5 → */30, monetization */15 → hourly; adds the O-027
#      daily digest at 05:30 UTC. Then mirrors `crontab -l` into services/cron_jobs.txt.
#   5. Restarts curator-bot + curator-publisher, starts curator-scout once, probes
#      Anthropic with the merged key/model (expects 200).
#
# Why a script: the auto-mode classifier blocks remote shell writes from an agent
# session, so this is the copy-paste Moses op. Run from the monorepo root in Git Bash.
set -euo pipefail

BOX=root@204.168.209.235
KEY="$HOME/.ssh/id_ed25519"
VAULT="${BIZLEGAL_VAULT_PATH:-$HOME/Downloads/env-hub-bizlegal-ai.txt}"
DRY="${1:-}"
SSH() { ssh -i "$KEY" -o BatchMode=yes -o ConnectTimeout=20 "$BOX" "$@"; }
SCP() { scp -i "$KEY" -o BatchMode=yes -q "$@"; }

[ -f "$VAULT" ] || { echo "vault not found: $VAULT"; exit 2; }
[ -f services/agents/llm_router.py ] || { echo "run from the monorepo root"; exit 2; }

val() { grep -m1 "^$1=" "$VAULT" | cut -d= -f2- | tr -d '\r'; }

MERGE="$(mktemp)"
echo "[relight] vault → box (names only):"
for n in ANTHROPIC_API_KEY GOOGLE_GEMINI_API_KEY OPENROUTER_API_KEY PERPLEXITY_API_KEY SOCIAL_DIGEST_TO_EMAIL NEXT_PUBLIC_HUB_URL; do
  v="$(val "$n")"
  if [ -n "$v" ]; then printf '%s=%s\n' "$n" "$v" >> "$MERGE"; echo "   + $n"; else echo "   - $n (empty in vault — skipped)"; fi
done
printf 'ANTHROPIC_MODEL=claude-sonnet-5\nOLLAMA_TUNNEL_URL=http://127.0.0.1:11434\n' >> "$MERGE"
echo "   + ANTHROPIC_MODEL=claude-sonnet-5"
echo "   + OLLAMA_TUNNEL_URL=http://127.0.0.1:11434"

AGENTS=(conversion_funnel_agent enterprise_closer_agent monetization_agent llm_router content_agent growth_agent code_fixer marketing_revenue self_heal weekly_health daily_digest)
SEO_AGENTS=(content_distribution conversion_tracker daily_autonomous_seo daily_orchestrator ea_agent)
CURATOR=(brain factual_review publisher)

if [ "$DRY" = "--dry-run" ]; then
  echo "[dry-run] would merge $(wc -l < "$MERGE") names into /opt/bizlegal/curator/.env"
  echo "[dry-run] would scp services/agents/{${AGENTS[*]}}.py and services/hetzner/{${CURATOR[*]}}.py + tools/social-autopilot"
  echo "[dry-run] would diet the crontab, add the O-027 digest cron, restart curator services"
  rm -f "$MERGE"; exit 0
fi

echo "[relight] 1/5 push merge file + sources"
SCP "$MERGE" "$BOX:/tmp/merge.env"; rm -f "$MERGE"
for a in "${AGENTS[@]}"; do SCP "services/agents/$a.py" "$BOX:/opt/bizlegal/curator/services/agents/"; done
for c in "${CURATOR[@]}"; do SCP "services/hetzner/$c.py" "$BOX:/opt/bizlegal/curator/"; done
for a in "${SEO_AGENTS[@]}"; do SCP "services/seo-agents/$a.py" "$BOX:/opt/bizlegal/curator/services/seo-agents/"; done
SCP services/outreach/oci_deal_closer.py "$BOX:/opt/bizlegal/curator/services/outreach/" 2>/dev/null || true
SSH 'mkdir -p /opt/bizlegal/curator/tools/social-autopilot'
SCP -r tools/social-autopilot/src tools/social-autopilot/fixtures tools/social-autopilot/package.json "$BOX:/opt/bizlegal/curator/tools/social-autopilot/"

echo "[relight] 2/5 merge env, 3/5 cron diet, 4/5 restart, 5/5 probe (on the box)"
SSH bash -s <<'REMOTE'
set -euo pipefail
B="/opt/bizlegal/backups/$(date -u +%Y-%m-%d)"; mkdir -p "$B"
cp -n /opt/bizlegal/curator/.env "$B/curator.env" 2>/dev/null || true
crontab -l > "$B/crontab.txt" 2>/dev/null || true

python3 - <<'PY'
p = "/opt/bizlegal/curator/.env"
env = open(p).read()
merge = dict(l.split("=", 1) for l in open("/tmp/merge.env").read().splitlines() if "=" in l)
cur = dict(l.split("=", 1) for l in env.splitlines() if "=" in l and not l.startswith("#"))
if not cur.get("TELEGRAM_HUB_TOKEN") and cur.get("TELEGRAM_BOT_TOKEN"):
    merge["TELEGRAM_HUB_TOKEN"] = cur["TELEGRAM_BOT_TOKEN"]
out, seen = [], set()
for line in env.splitlines():
    k = line.split("=", 1)[0] if ("=" in line and not line.startswith("#")) else None
    if k in merge:
        out.append(f"{k}={merge[k]}"); seen.add(k)
    else:
        out.append(line)
for k, v in merge.items():
    if k not in seen:
        out.append(f"{k}={v}")
open(p, "w").write("\n".join(out).rstrip("\n") + "\n")
print("   merged:", ", ".join(sorted(merge)))
PY
rm -f /tmp/merge.env

python3 - <<'PY'
import re, subprocess
lines = subprocess.run(["crontab", "-l"], capture_output=True, text=True).stdout.splitlines()
out = []
for l in lines:
    if "revenue_alerter.py" in l:
        l = re.sub(r"^\*/1 \* \* \* \* ", "0 */6 * * * ", l)
    elif "code_fixer.py" in l and not l.startswith("#"):
        l = "#DISABLED-2026-09-15 (patched prod on a timer) " + l
    elif "self_heal.py" in l or "ops_alerts.py" in l:
        l = re.sub(r"^\*/5 ", "*/30 ", l)
    elif "orchestrator.py monetization" in l:
        l = re.sub(r"^\*/15 \* ", "5 * ", l)
    elif ("seo-agents/newsletter.py" in l or "orchestrator.py newsletter" in l) and not l.startswith("#"):
        # plan REMOVE: three duplicate newsletters — the hub's Monday 13:00 send is the only one kept
        l = "#DISABLED-2026-09-15 (duplicate newsletter; hub Mon 13:00 is canonical) " + l
    out.append(l)
if not any("social-autopilot" in l for l in out):
    out.append("30 5 * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && /usr/bin/node tools/social-autopilot/src/run-daily.cjs >> /var/log/social-autopilot.log 2>&1")
subprocess.run(["crontab", "-"], input="\n".join(out) + "\n", text=True, check=True)
print("   crontab lines:", len(out))
PY

systemctl restart curator-bot curator-publisher
systemctl start --no-block curator-scout.service || true   # oneshot scout can run for minutes; never block the relight on it
echo "   services: $(systemctl is-active curator-bot curator-publisher ollama | tr '\n' ' ')"

cd /opt/bizlegal/curator; set -a; . ./.env; set +a
echo "   model=$ANTHROPIC_MODEL"
printf '   anthropic probe: '
curl -s -o /dev/null -w '%{http_code}\n' -m 30 https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" -H 'anthropic-version: 2023-06-01' -H 'content-type: application/json' \
  -H 'User-Agent: bizlegal-probe/1.0' \
  -d "{\"model\":\"$ANTHROPIC_MODEL\",\"max_tokens\":1,\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}"
printf '   telegram getMe: '
curl -s -m 15 "https://api.telegram.org/bot$TELEGRAM_HUB_TOKEN/getMe" | head -c 80; echo
REMOTE

# Mirror the box's TELEGRAM_HUB_TOKEN into the vault when the canonical name is still empty.
if [ -z "$(val TELEGRAM_HUB_TOKEN)" ]; then
  t="$(SSH "grep -m1 '^TELEGRAM_HUB_TOKEN=' /opt/bizlegal/curator/.env | cut -d= -f2-")"
  if [ -n "$t" ]; then
    python3 - "$VAULT" "$t" <<'PY'
import sys, re
p, t = sys.argv[1], sys.argv[2]
s = open(p, encoding="utf-8", errors="surrogateescape").read()
s = re.sub(r"(?m)^TELEGRAM_HUB_TOKEN=$", "TELEGRAM_HUB_TOKEN=" + t, s, count=1)
open(p, "w", encoding="utf-8", errors="surrogateescape", newline="").write(s)
PY
    echo "[relight] vault: TELEGRAM_HUB_TOKEN mirrored from the box"
  fi
fi

SSH 'crontab -l' > services/cron_jobs.txt
echo "[relight] done. services/cron_jobs.txt refreshed — commit it."
echo "[relight] verify in an hour: ssh $BOX 'tail -3 /var/log/conversion-funnel.log; tail -3 /var/log/social-autopilot.log'"
