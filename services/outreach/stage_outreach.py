#!/usr/bin/env python3
"""
stage_outreach.py — O-015 outbound 30->10->3->1 scaffolding (DRAFT-ONLY)
=========================================================================

Select qualified leads from `leadforge_leads`, filter to outreach-ready
(enrichment thresholds + suppression-list check + role-inbox/personal-domain
guard), and stage them into `lead_outreach` as `status='drafted', stage=0`
for Moses review. Fires an `outreach.staged` ops event per promoted row.

HARD GATES (2026-07-10 incident ef3d90e — do not weaken):
  1. Suppression list  — every candidate is checked against
     `email_suppression_list`; present = skipped. Never sends to a
     suppressed address, ever.
  2. Consent            — these are cold/curated leads with NO consent log
     entry. Every staged row is therefore flagged REQUIRES APPROVAL; the
     future send step must hard-require email_consent_log + suppression
     check + explicit Moses approval (see email_send_log migration).
  3. Draft-only         — this script has NO send path. `--send` is
     refused. Sending is un-gated only when O-015 acceptance passes
     (Apify actor IDs + sending domain configured).

Cadence: `weekly_budget` (default 30) caps how many rows this run stages;
verticals have per-run `cap`s. The 30->10->3->1 target ratios live in
outreach_config.json.

Usage:
  python3 stage_outreach.py                       # stage all verticals (draft-only)
  python3 stage_outreach.py --vertical casp        # one vertical
  python3 stage_outreach.py --status               # show staged/qualified counts
  python3 stage_outreach.py --budget 15            # override weekly budget
  python3 stage_outreach.py --vault /path/.env     # env file (default /opt/bizlegal/curator/.env)

Ops events use the shared @bizlegal/ops-log wire format (HMAC-SHA256 POST
to hub /api/ops/log). The `ops_log` module is imported from the vendored
copy beside this script, services/hetzner, or packages/ops-log/python; if
none is importable the pipeline still runs (telemetry never blocks staging).
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

_HERE = os.path.dirname(os.path.abspath(__file__))

# --- ops_log import: vendored copy -> hetzner vendored copy -> monorepo sibling ---
for _p in (
    _HERE,
    os.path.join(_HERE, "..", "hetzner"),
    os.path.join(_HERE, "..", "..", "packages", "ops-log", "python"),
):
    if os.path.isdir(_p):
        sys.path.insert(0, _p)
try:
    from ops_log import log_event  # noqa: E402
except Exception:  # noqa: BLE001 — telemetry must never break staging
    log_event = None

SUPABASE_URL = "https://ydghhcuuopqzgqcicubg.supabase.co"


def load_vault(path: str = "/opt/bizlegal/curator/.env") -> dict:
    env = {}
    p = pathlib.Path(path)
    if not p.exists():
        return env
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()
    return env


def supabase_request(path: str, method: str = "GET", body: dict | None = None,
                     env: dict | None = None) -> tuple[int, list | dict]:
    env = env or {}
    key = env.get("SUPABASE_SECRET", env.get("SUPABASE_SERVICE_KEY", ""))
    if not key:
        return 0, {"error": "no SUPABASE_SECRET / SUPABASE_SERVICE_KEY in vault"}
    full_url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
        req = urllib.request.Request(full_url, data=data, method=method, headers=headers)
    else:
        req = urllib.request.Request(full_url, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            text = r.read()
            if not text:
                return r.status, {}
            return r.status, json.loads(text)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except Exception:
            return e.code, {"error": str(e)}
    except Exception as e:
        return 0, {"error": str(e)[:200]}


def load_config() -> dict:
    cfg_path = os.path.join(_HERE, "outreach_config.json")
    with open(cfg_path, encoding="utf-8") as fh:
        return json.load(fh)


def fire_ops_event(env: dict, *, lead_email: str, vertical: str, score: int,
                   staged_row_id: str | None, reason: str) -> bool:
    """Fire `outreach.staged` (HMAC POST to hub /api/ops/log)."""
    if log_event is None:
        print("    [ops] ops_log not importable — skipping outreach.staged event")
        return False
    secret = env.get("BIZLEGAL_INBOUND_SECRET", "")
    if not secret:
        print("    [ops] BIZLEGAL_INBOUND_SECRET missing from vault — skipping outreach.staged event")
        return False
    os.environ["BIZLEGAL_INBOUND_SECRET"] = secret
    ok = log_event(
        "outreach.staged",
        ref_id=staged_row_id or lead_email,
        status="pending",  # drafted, awaiting Moses approval
        metadata={
            "vertical": vertical,
            "score": score,
            "suppression_checked": True,
            "consent_status": "requires_approval",
            "reason": reason,
        },
    )
    return ok


def get_suppression_set(env: dict) -> set[str]:
    status, rows = supabase_request("email_suppression_list?select=email", env=env)
    if status != 200 or not isinstance(rows, list):
        print(f"  [warn] suppression list unreadable (HTTP {status}) — treating as empty, NOT safe to send")
        return set()
    return {str(r["email"]).lower() for r in rows if r.get("email")}


def get_staged_emails(env: dict) -> set[str]:
    status, rows = supabase_request("lead_outreach?select=lead_email", env=env)
    if status != 200 or not isinstance(rows, list):
        return set()
    return {str(r["lead_email"]).lower() for r in rows if r.get("lead_email")}


def get_candidates(env: dict, vertical: dict, limit: int = 1000) -> list[dict]:
    include = vertical.get("industry_include") or []
    query = "leadforge_leads?select=email,company_name,industry,source,score,status,enriched_data"
    query += "&status=eq.qualified&order=score.desc&limit=%d" % limit
    status, rows = supabase_request(query, env=env)
    if status != 200 or not isinstance(rows, list):
        print(f"  [warn] candidate query failed (HTTP {status})")
        return []
    out = []
    for r in rows:
        industry = (r.get("industry") or "").lower()
        if include and industry not in include:
            continue
        if (vertical.get("industry_exclude") or []) and industry in vertical["industry_exclude"]:
            continue
        out.append(r)
    return out


def is_role_or_personal(email: str, cfg: dict) -> tuple[bool, str]:
    """Return (blocked, reason) for obvious role inboxes / personal domains."""
    local, _, domain = email.partition("@")
    if local in (cfg.get("role_inbox_local_parts") or []):
        return True, f"role inbox ({local}@)"
    if domain in (cfg.get("personal_domains") or []):
        return True, f"personal domain ({domain})"
    return False, ""


def has_enriched_name(row: dict, cfg: dict) -> bool:
    if not cfg.get("require_enriched_name", True):
        return True
    enriched = row.get("enriched_data") or {}
    if isinstance(enriched, str):
        try:
            enriched = json.loads(enriched)
        except Exception:
            return False
    return bool(enriched.get("name") or row.get("company_name"))


def stage_candidates(env: dict, cfg: dict, vertical: dict, budget_left: int) -> dict:
    key = vertical["key"]
    candidates = get_candidates(env, vertical)
    suppression = get_suppression_set(env)
    staged_emails = get_staged_emails(env)
    filters = cfg["filters"]

    counts = {"considered": 0, "staged": 0, "suppressed": 0, "already_staged": 0,
              "below_threshold": 0, "role_or_personal": 0, "no_name": 0, "budget": 0}
    cap = min(int(vertical.get("cap", 0)), budget_left)

    for row in candidates:
        if counts["staged"] >= cap:
            counts["budget"] += 1
            continue
        counts["considered"] += 1
        email = str(row.get("email", "")).strip().lower()
        if not email:
            continue

        if email in suppression:
            counts["suppressed"] += 1
            continue
        if email in staged_emails:
            counts["already_staged"] += 1
            continue

        score = int(row.get("score") or 0)
        if score < int(vertical.get("score_min", 80)):
            counts["below_threshold"] += 1
            continue

        blocked, reason = is_role_or_personal(email, filters)
        if blocked:
            counts["role_or_personal"] += 1
            print(f"    [skip] {email:40s} {reason}")
            continue
        if not has_enriched_name(row, filters):
            counts["no_name"] += 1
            continue

        enriched = row.get("enriched_data") or {}
        if isinstance(enriched, str):
            try:
                enriched = json.loads(enriched)
            except Exception:
                enriched = {}

        payload = {
            "lead_email": email,
            "lead_name": (enriched.get("name") or "")[:120],
            "company": (row.get("company_name") or "")[:120],
            "subject": f"[{key}] T1 draft awaiting approval (product: {vertical['product']})"[:200],
            "body_preview": "",
            "status": "drafted",
            "stage": 0,
        }
        st, inserted = supabase_request("lead_outreach", method="POST", body=payload, env=env)
        if not (200 <= st < 300):
            print(f"    [fail] {email:40s} insert HTTP {st}  {str(inserted)[:120]}")
            continue
        row_id = None
        if isinstance(inserted, list) and inserted and isinstance(inserted[0], dict):
            row_id = inserted[0].get("id")
        counts["staged"] += 1
        staged_emails.add(email)
        fire_ops_event(env, lead_email=email, vertical=key, score=score,
                       staged_row_id=row_id, reason=f"score {score} >= {vertical['score_min']}")
        print(f"    [staged] {email:40s} score={score:3d} -> lead_outreach (draft, stage=0)")
    return counts


def show_status(env: dict) -> None:
    print("=" * 70)
    print("OUTREACH STAGING STATUS (draft-only)")
    print("=" * 70)
    for table, label in (("leadforge_leads", "leadforge_leads (qualified)"),
                         ("lead_outreach", "lead_outreach (staged)")):
        st, rows = supabase_request(f"{table}?select=status&limit=1000", env=env)
        if st != 200 or not isinstance(rows, list):
            print(f"\n{table}: unreadable (HTTP {st})")
            continue
        by = {}
        for r in rows:
            s = r.get("status") or "?"
            by[s] = by.get(s, 0) + 1
        print(f"\n{label}: {len(rows)} rows")
        for s, c in sorted(by.items()):
            print(f"  {s:12s} {c}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--vertical", default=None, choices=["casp", "stablecoin", "law_firm"],
                    help="Stage only this vertical (default: all)")
    ap.add_argument("--budget", type=int, default=None,
                    help="Override weekly staging budget (default from config, 30)")
    ap.add_argument("--status", action="store_true",
                    help="Show staged/qualified counts and exit")
    ap.add_argument("--vault", default="/opt/bizlegal/curator/.env",
                    help="Path to env vault (default: /opt/bizlegal/curator/.env)")
    ap.add_argument("--send", action="store_true",
                    help=argparse.SUPPRESS)  # trap: no send path exists yet
    args = ap.parse_args()

    if args.send:
        print("REFUSED: stage_outreach.py has NO send path. O-015 is draft-only "
              "scaffolding — sending unlocks only after Moses gates it "
              "(Apify actor IDs + sending domain). See orders/O-015.")
        return 1

    env = load_vault(args.vault)
    if not env.get("SUPABASE_SECRET") and not env.get("SUPABASE_SERVICE_KEY"):
        print(f"FATAL: no SUPABASE secret in vault at {args.vault}")
        return 1

    cfg = load_config()
    if args.status:
        show_status(env)
        return 0

    budget = args.budget if args.budget is not None else int(cfg["pipeline"]["weekly_budget"])
    print("=" * 70)
    print(f"OUTREACH STAGING — DRAFT-ONLY (budget {budget}/week, cadence "
          f"30->10->3->1)")
    print(f"vault: {args.vault}")
    print("=" * 70)

    verticals = cfg["verticals"]
    if args.vertical:
        verticals = [v for v in verticals if v["key"] == args.vertical]

    grand = {"staged": 0, "suppressed": 0, "already_staged": 0, "below_threshold": 0,
             "role_or_personal": 0, "no_name": 0, "budget": 0, "considered": 0}
    for v in verticals:
        print(f"\n[{v['key']}] {v['label']}  (cap {v['cap']}, score_min {v['score_min']})")
        counts = stage_candidates(env, cfg, v, budget)
        for k in grand:
            grand[k] += counts.get(k, 0)
        print(f"    -> {counts['staged']} staged / {counts['considered']} considered")
        budget -= counts["staged"]

    print("\n" + "=" * 70)
    print("SUMMARY (draft-only — nothing sent)")
    print("=" * 70)
    print(f"  staged            : {grand['staged']}")
    print(f"  suppressed        : {grand['suppressed']}   (never staged — hard block)")
    print(f"  already staged    : {grand['already_staged']}")
    print(f"  below threshold   : {grand['below_threshold']}")
    print(f"  role/personal     : {grand['role_or_personal']}")
    print(f"  no enriched name  : {grand['no_name']}")
    print(f"  budget-deferred   : {grand['budget']}   (stays qualified for next week)")
    print("\nStaged rows are status='drafted', stage=0 in lead_outreach — review,")
    print("then the future send step enforces suppression + consent + Moses approval.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
