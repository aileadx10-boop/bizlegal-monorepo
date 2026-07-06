#!/usr/bin/env python3
"""
env_audit.py — Daily check for missing/expired API keys.

Compares the Hetzner .env against:
  (a) the canonical vault (default: $HOME/env-hub-bizlegal-ai.txt)
  (b) live API reachability for the most critical keys

Outputs JSON. Persists a row in agent_runs with status=ok|partial|failed.
"""
import os, json, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ENV_FILE = Path("/opt/bizlegal/curator/.env")
VAULT_PATH = Path(os.environ.get("VAULT_PATH", str(Path.home() / "env-hub-bizlegal-ai.txt")))
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

PROBES = [
    ("ANTHROPIC_API_KEY", "Anthropic", "https://api.anthropic.com/v1/messages",
     lambda v: {"x-api-key": v, "anthropic-version": "2023-06-01", "content-type": "application/json"},
     lambda v: json.dumps({"model": "claude-haiku-4-5", "max_tokens": 5, "messages": [{"role":"user","content":"ping"}]}).encode()),
    ("FIRECRAWL_API_KEY", "Firecrawl", "https://api.firecrawl.dev/v1/search",
     lambda v: {"Authorization": f"Bearer {v}", "content-type": "application/json"},
     lambda v: json.dumps({"query":"ping","limit":1}).encode()),
    ("APIFY_API_TOKEN", "Apify", "https://api.apify.com/v2/users/me",
     lambda v: {"Authorization": f"Bearer {v}"}, None),
    ("RESEND_API_KEY", "Resend", "https://api.resend.com/domains",
     lambda v: {"Authorization": f"Bearer {v}", "User-Agent": "bizlegal-agent/1.0"}, None),
    ("NOWPAYMENTS_API_KEY", "NOWPayments", "https://api.nowpayments.io/v1/currencies",
     lambda v: {"x-api-key": v}, None),
    ("STRIPE_SECRET_KEY", "Stripe", "https://api.stripe.com/v1/balance",
     lambda v: {"Authorization": f"Bearer {v}"}, None),
    ("PAYPAL_CLIENT_ID", "PayPal (creds)", "https://api-m.paypal.com/v1/oauth2/token",
     lambda v: {}, None),  # Just checks connectivity, not auth
    ("PERPLEXITY_API_KEY", "Perplexity", "https://api.perplexity.ai/chat/completions",
     lambda v: {"Authorization": f"Bearer {v}", "content-type": "application/json"},
     lambda v: json.dumps({"model":"sonar-pro","messages":[{"role":"user","content":"ping"}],"max_tokens":3}).encode()),
    ("TELEGRAM_BOT_TOKEN", "Telegram", None, None, None),  # special-cased below
]

def probe_telegram():
    tok = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not tok: return {"key":"TELEGRAM_BOT_TOKEN","service":"Telegram","status":"missing"}
    try:
        r = urllib.request.urlopen(urllib.request.Request(f"https://api.telegram.org/bot{tok}/getMe"), timeout=5)
        d = json.loads(r.read())
        if d.get("ok"):
            return {"key":"TELEGRAM_BOT_TOKEN","service":"Telegram","status":"ok","detail":d.get("result",{}).get("username","?")}
        return {"key":"TELEGRAM_BOT_TOKEN","service":"Telegram","status":"invalid","detail":str(d)[:200]}
    except Exception as e:
        return {"key":"TELEGRAM_BOT_TOKEN","service":"Telegram","status":"unreachable","detail":str(e)[:200]}

def probe(name, label, url, h_fn, b_fn):
    if name == "TELEGRAM_BOT_TOKEN": return probe_telegram()
    v = os.environ.get(name, "")
    if not v: return {"key": name, "service": label, "status": "missing"}
    try:
        headers = h_fn(v) if h_fn else {}
        body = b_fn(v) if b_fn else None
        req = urllib.request.Request(url, data=body, headers=headers, method="POST" if body else "GET")
        r = urllib.request.urlopen(req, timeout=6)
        return {"key": name, "service": label, "status": "ok", "http": r.status}
    except urllib.error.HTTPError as e:
        body_text = ""
        try: body_text = e.read().decode()[:200]
        except: pass
        if e.code in (401, 403):
            return {"key": name, "service": label, "status": "expired_or_invalid", "http": e.code, "detail": body_text}
        return {"key": name, "service": label, "status": "http_error", "http": e.code, "detail": body_text}
    except Exception as e:
        return {"key": name, "service": label, "status": "unreachable", "detail": str(e)[:200]}

results = [probe(*p) for p in PROBES]
ok = sum(1 for r in results if r["status"] == "ok")
bad = [r for r in results if r["status"] != "ok"]

hetzner_keys = set()
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            hetzner_keys.add(line.split("=", 1)[0])

vault_keys = set()
if VAULT_PATH.exists():
    for line in VAULT_PATH.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            vault_keys.add(line.split("=", 1)[0])

missing_from_vault = sorted(hetzner_keys - vault_keys)
unused_in_vault = sorted(vault_keys - hetzner_keys)
live_required_but_missing = [r for r in results if r["status"] == "missing"]

audit = {
    "ran_at": datetime.now(timezone.utc).isoformat(),
    "live_probes": results,
    "summary": { "ok": ok, "bad": len(bad), "total": len(results) },
    "bad_keys": bad,
    "missing_keys": live_required_but_missing,
    "missing_from_vault": missing_from_vault,
    "vault_unused_on_hetzner": unused_in_vault[:30],
    "vault_path": str(VAULT_PATH),
    "vault_exists": VAULT_PATH.exists(),
}

print(json.dumps(audit, indent=2))
# Persist to agent_runs
if SUPABASE_URL and SUPABASE_KEY:
    try:
        body = json.dumps({
            "agent_name": "env_audit", "workflow_id": f"env-audit-{datetime.now(timezone.utc).strftime('%Y%m%d')}",
            "action": "daily_check",
            "status": "ok" if not bad else ("partial" if ok > 0 else "failed"),
            "details": json.dumps({"summary": audit["summary"], "bad_keys": [b["key"] for b in bad], "missing": [m["key"] for m in live_required_but_missing]}),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).encode()
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/agent_runs", data=body,
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"},
            method="POST")
        urllib.request.urlopen(req, timeout=10)
    except Exception as e: print(f"persist err: {e}")
