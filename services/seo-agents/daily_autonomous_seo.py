#!/usr/bin/env python3
"""
daily_autonomous_seo.py — the master orchestrator that runs every SEO + outreach
+ OCI job A-to-Z, no man in the loop.

Streams:
  S1  SEO-AUDIT       page_audit.py            -> SEO-AUDIT-<date>.md
  S2  ENRICH          enrich_page.py           -> ENRICHMENT-PLAN-<date>.md + blocks
  S3  PUBLISH         publish_blog.py          -> commits to bizlegal-ea via GitHub API
  S4  INDEXNOW        gsc_indexnow_pinger.py   -> api.indexnow.org
  S5  DISCOVER        discovery_scraper.py     -> CoinGecko + GitHub + SEC EDGAR -> Supabase prospects
  S6  HEADHUNT        headhunter.py --send     -> Resend send to qualified leads
  S7  OCI-ROUTE       oci_funnel.py            -> match leads to OCI partners, send invoice request
  S8  TELEGRAM        tg_heartbeat.py          -> bot message per completed stream

Runs at 07:00 UTC daily (after 02:00-06:30 content pipeline).
Heartbeat to @BIZLEGALFORGEBOT per stream.
Writes decisions/DAILY-AUTONOMOUS-<date>.md.

Exit codes:
  0  all streams OK
  1  at least one stream failed (others may have succeeded)
  2  catastrophic (Supabase unreachable)
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.request

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_CURATOR_BOT_TOKEN", "")
TELEGRAM_CHAT = os.getenv("TELEGRAM_CHAT_ID", "989097520")
CURATOR_DIR = os.getenv("CURATOR_DIR", "/opt/bizlegal/curator")
PYTHON = os.getenv("PYTHON", "python3")


def supabase_insert(table: str, row: dict) -> bool:
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(),
            method="POST",
            headers={
                "apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}",
                "Content-Type": "application/json", "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def telegram_send(text: str) -> bool:
    if not (TELEGRAM_TOKEN and TELEGRAM_CHAT):
        return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        r = json.loads(urllib.request.urlopen(req, timeout=10).read())
        return r.get("ok", False)
    except Exception as e:
        print(f"  [tg] send err: {e}", file=sys.stderr)
        return False


def run_stream(name: str, cmd: list, timeout: int = 600) -> dict:
    """Run one stream as a subprocess. Return {ok, returncode, stdout_tail, stderr_tail, seconds}."""
    t0 = time.time()
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                           cwd=CURATOR_DIR if pathlib.Path(CURATOR_DIR).exists() else None)
        return {
            "stream": name,
            "ok": r.returncode == 0,
            "returncode": r.returncode,
            "stdout_tail": r.stdout[-2000:] if r.stdout else "",
            "stderr_tail": r.stderr[-2000:] if r.stderr else "",
            "seconds": round(time.time() - t0, 1),
        }
    except subprocess.TimeoutExpired:
        return {"stream": name, "ok": False, "returncode": -1, "stdout_tail": "", "stderr_tail": "timeout", "seconds": timeout}
    except Exception as e:
        return {"stream": name, "ok": False, "returncode": -1, "stdout_tail": "", "stderr_tail": str(e)[:500], "seconds": 0}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--skip-discover", action="store_true", help="skip the scraper (use curated only)")
    ap.add_argument("--skip-send", action="store_true", help="draft but don't actually send email")
    ap.add_argument("--headhunter-limit", type=int, default=3, help="leads per ICP per run")
    args = ap.parse_args()

    today = args.date
    timestamp = _dt.datetime.now(_dt.timezone.utc).isoformat()
    print(f"[{timestamp}] daily_autonomous_seo: starting run for {today}", file=sys.stderr)
    telegram_send(f"🤖 <b>BizLegal autonomous run</b> — {today}\nstarting 8-stream pipeline...")

    results = {}

    # S1: SEO audit
    print(f"\n[S1] SEO audit", file=sys.stderr)
    results["S1_audit"] = run_stream("audit",
        [PYTHON, f"{CURATOR_DIR}/services/seo-agents/page_audit.py",
         "--output", f"{CURATOR_DIR}/decisions", "--date", today])
    telegram_send(f"📊 S1 audit: {'✅' if results['S1_audit']['ok'] else '❌'} {results['S1_audit']['seconds']}s")

    # S2: Enrich
    print(f"\n[S2] Enrich", file=sys.stderr)
    results["S2_enrich"] = run_stream("enrich",
        [PYTHON, f"{CURATOR_DIR}/services/seo-agents/enrich_page.py",
         "--output", f"{CURATOR_DIR}/decisions", "--date", today])
    telegram_send(f"✨ S2 enrich: {'✅' if results['S2_enrich']['ok'] else '❌'} {results['S2_enrich']['seconds']}s")

    # S3: Publish (commit to bizlegal-ea via GitHub API)
    print(f"\n[S3] Publish", file=sys.stderr)
    results["S3_publish"] = run_stream("publish",
        [PYTHON, f"{CURATOR_DIR}/services/seo-agents/publish_blog.py"])
    telegram_send(f"📤 S3 publish: {'✅' if results['S3_publish']['ok'] else '❌'} {results['S3_publish']['seconds']}s")

    # S4: IndexNow
    print(f"\n[S4] IndexNow", file=sys.stderr)
    results["S4_indexnow"] = run_stream("indexnow",
        [PYTHON, f"{CURATOR_DIR}/services/seo-agents/gsc_indexnow_pinger.py",
         "--input", f"{CURATOR_DIR}/services/seo-agents/blog_content",
         "--state", f"{CURATOR_DIR}/services/seo-agents/state/indexnow_state.json",
         "--prefix", "https://blog.bizlegal-ai.com/posts",
         "--host", "blog.bizlegal-ai.com"])
    telegram_send(f"🔎 S4 indexnow: {'✅' if results['S4_indexnow']['ok'] else '❌'} {results['S4_indexnow']['seconds']}s")

    # S5: Discover (free sources)
    if not args.skip_discover:
        print(f"\n[S5] Discover", file=sys.stderr)
        results["S5_discover"] = run_stream("discover",
            [PYTHON, f"{CURATOR_DIR}/services/seo-agents/discovery_scraper.py",
             "--output", f"{CURATOR_DIR}/decisions", "--date", today])
        telegram_send(f"🕵️ S5 discover: {'✅' if results['S5_discover']['ok'] else '❌'} {results['S5_discover']['seconds']}s")

    # S6: Headhunter (drafts + Resend send)
    print(f"\n[S6] Headhunter", file=sys.stderr)
    headhunter_cmd = [PYTHON, f"{CURATOR_DIR}/services/outreach/headhunter.py",
                      "--source", "all",
                      "--icp", "all",
                      "--limit", str(args.headhunter_limit)]
    if args.skip_send:
        headhunter_cmd.append("--dry-run")
    else:
        headhunter_cmd.append("--send")
    results["S6_headhunter"] = run_stream("headhunter", headhunter_cmd)
    telegram_send(f"🎯 S6 headhunter: {'✅' if results['S6_headhunter']['ok'] else '❌'} {results['S6_headhunter']['seconds']}s")

    # S7: OCI funnel
    print(f"\n[S7] OCI funnel", file=sys.stderr)
    results["S7_oci"] = run_stream("oci",
        [PYTHON, f"{CURATOR_DIR}/services/outreach/oci_funnel.py",
         "--output", f"{CURATOR_DIR}/decisions", "--date", today])
    telegram_send(f"🤝 S7 oci: {'✅' if results['S7_oci']['ok'] else '❌'} {results['S7_oci']['seconds']}s")

    # Summary
    ok = sum(1 for r in results.values() if r["ok"])
    total = len(results)
    summary = f"📋 <b>{today} autonomous run complete</b>\n{ok}/{total} streams OK\n"
    for k, v in results.items():
        icon = "✅" if v["ok"] else "❌"
        summary += f"  {icon} {k}: {v['seconds']}s\n"
    summary += f"\nFull report: /opt/bizlegal/decisions/DAILY-AUTONOMOUS-{today}.md"
    telegram_send(summary)

    # Write report
    md = [f"# DAILY AUTONOMOUS RUN — {today}\n\n",
          f"**Started:** {timestamp}\n",
          f"**Streams run:** {total} · **OK:** {ok} · **Failed:** {total - ok}\n\n",
          "| Stream | OK | Seconds | Return | Notes |\n|---|---|---|---|---|\n"]
    for k, v in results.items():
        notes = ""
        if not v["ok"]:
            notes = v["stderr_tail"][:120].replace("\n", " ")
        md.append(f"| {k} | {'✅' if v['ok'] else '❌'} | {v['seconds']} | {v['returncode']} | {notes} |\n")
    md.append(f"\n## Stderr tails\n\n")
    for k, v in results.items():
        if v["stderr_tail"]:
            md.append(f"### {k}\n```\n{v['stderr_tail'][-500:]}\n```\n")

    out = pathlib.Path("/opt/bizlegal/decisions") / f"DAILY-AUTONOMOUS-{today}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("".join(md), encoding="utf-8")

    supabase_insert("autonomous_runs", {
        "run_date": today, "started_at": timestamp,
        "streams_total": total, "streams_ok": ok,
        "results": json.dumps(results), "created_at": timestamp,
    })

    print(f"\n[{today}] DONE: {ok}/{total} streams OK", file=sys.stderr)
    sys.exit(0 if ok == total else 1)


if __name__ == "__main__":
    main()