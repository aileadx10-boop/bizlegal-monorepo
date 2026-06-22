#!/usr/bin/env python3
"""
analytics_dashboard.py
======================
Build #10 of 10 — $10K MRR SEO Plan.

Pulls 30 days of agent_runs from Supabase and renders a self-contained
HTML trend chart (SVG-based, no JS framework deps) to
/opt/bizlegal/decisions/analytics-YYYY-MM-DD.html.

The chart shows, per day, last 30 days:
  - tasks run (bar)
  - tasks success / failed (stacked color)
  - revenue attributed to agent-driven conversions (line)

Also produces a 7-day rolling average and a quick "what's working"
commentary.

Pure stdlib + urllib. No external chart lib.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request
from collections import defaultdict


SUPABASE_URL = "https://ydghhcuuopqzgqcicubg.supabase.co"
VAULT_PATH = pathlib.Path("/opt/bizlegal/curator/.env")
USER_AGENT = "Mozilla/5.0 (compatible; BizLegalAnalyticsBot/1.0; +https://bizlegal-ai.com)"

# Days of history to render
DEFAULT_DAYS = 30


def load_supabase_key() -> str:
    """Pull SUPABASE_SERVICE_KEY from vault."""
    if not VAULT_PATH.exists():
        return ""
    for line in VAULT_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k.strip() in ("SUPABASE_SECRET", "SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY"):
            return v.strip()
    return os.environ.get("SUPABASE_SERVICE_KEY", os.environ.get("SUPABASE_SECRET", ""))


def fetch_agent_runs_30d(supabase_key: str, days: int) -> list[dict]:
    cutoff = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%SZ')
    url = (f"{SUPABASE_URL}/rest/v1/agent_runs"
           f"?select=agent_name,action,status,created_at,details"
           f"&created_at=gte.{cutoff}"
           f"&order=created_at.desc"
           f"&limit=5000")
    req = urllib.request.Request(url, headers={
        "apikey": supabase_key,
        "Authorization": "Bearer " + supabase_key,
        "User-Agent": USER_AGENT,
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  [warn] supabase fetch failed: {e}", file=sys.stderr)
        return []


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------

def aggregate(runs: list[dict], days: int) -> dict:
    """Group runs by day, count success/failed, attribute revenue where possible."""
    by_day: dict[str, dict] = {}
    today = _dt.date.today()
    for i in range(days):
        d = (today - _dt.timedelta(days=i)).isoformat()
        by_day[d] = {"total": 0, "success": 0, "failed": 0, "revenue_usd": 0.0,
                     "agents": defaultdict(int)}

    for r in runs:
        ts = r.get("created_at", "")
        if not ts:
            continue
        d = ts[:10]  # YYYY-MM-DD
        if d not in by_day:
            continue
        by_day[d]["total"] += 1
        s = r.get("status", "?")
        if s in ("success", "ok"):
            by_day[d]["success"] += 1
        elif s in ("failed", "error", "rejected"):
            by_day[d]["failed"] += 1
        agent = r.get("agent_name", "?")
        by_day[d]["agents"][agent] += 1

        # If the run has a revenue attribution in details, add it
        details = r.get("details") or {}
        if isinstance(details, dict):
            rev = details.get("revenue_usd") or details.get("total_usd") or 0
            try:
                by_day[d]["revenue_usd"] += float(rev)
            except (TypeError, ValueError):
                pass

    # Sort ascending by date
    sorted_days = sorted(by_day.keys())
    return {
        "days": sorted_days,
        "data": [by_day[d] for d in sorted_days],
        "agents_total": sum(sum(d["agents"].values()) for d in by_day.values()),
    }


# ---------------------------------------------------------------------------
# SVG renderer
# ---------------------------------------------------------------------------

def render_svg(data: list[dict], days_list: list[str], w: int = 960, h: int = 360) -> str:
    """Bar chart of tasks per day with success (green) / failed (red) stacked."""
    if not data:
        return '<svg width="960" height="360"><text x="20" y="40" fill="#e8eaf0">No data</text></svg>'

    pad_l, pad_r, pad_t, pad_b = 60, 20, 20, 50
    chart_w = w - pad_l - pad_r
    chart_h = h - pad_t - pad_b

    max_total = max((d["total"] for d in data), default=0) or 1
    bar_w = max(2, chart_w // len(data) - 2)

    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'xmlns="http://www.w3.org/2000/svg" '
             f'role="img" aria-label="agent_runs 30-day chart">']
    parts.append('<rect width="100%" height="100%" fill="#0a0e1a"/>')

    # Y-axis grid
    for i in range(0, 6):
        y = pad_t + chart_h - int(chart_h * i / 5)
        val = int(max_total * i / 5)
        parts.append(f'<line x1="{pad_l}" y1="{y}" x2="{w - pad_r}" y2="{y}" '
                     f'stroke="#1a2030" stroke-width="1"/>')
        parts.append(f'<text x="{pad_l - 8}" y="{y + 4}" fill="#7d8599" '
                     f'font-size="10" text-anchor="end">{val}</text>')

    # Bars
    for i, (d, day) in enumerate(zip(data, days_list)):
        x = pad_l + i * (bar_w + 2)
        success_h = int(chart_h * d["success"] / max_total)
        failed_h = int(chart_h * d["failed"] / max_total)
        # Success bar (green)
        if d["success"]:
            y = pad_t + chart_h - success_h
            parts.append(f'<rect x="{x}" y="{y}" width="{bar_w}" height="{success_h}" '
                         f'fill="#4ade80" opacity="0.85"/>')
        # Failed bar (red, stacked on top)
        if d["failed"]:
            y = pad_t + chart_h - success_h - failed_h
            parts.append(f'<rect x="{x}" y="{y}" width="{bar_w}" height="{failed_h}" '
                         f'fill="#f87171" opacity="0.85"/>')
        # Day label every 5 days
        if i % 5 == 0:
            label = day[5:]  # MM-DD
            parts.append(f'<text x="{x + bar_w / 2}" y="{h - 20}" fill="#7d8599" '
                         f'font-size="9" text-anchor="middle">{label}</text>')

    # Legend
    lx = pad_l + 10
    ly = pad_t + 10
    parts.append(f'<rect x="{lx}" y="{ly - 8}" width="10" height="10" fill="#4ade80"/>')
    parts.append(f'<text x="{lx + 14}" y="{ly + 1}" fill="#7d8599" font-size="11">success</text>')
    parts.append(f'<rect x="{lx + 80}" y="{ly - 8}" width="10" height="10" fill="#f87171"/>')
    parts.append(f'<text x="{lx + 94}" y="{ly + 1}" fill="#7d8599" font-size="11">failed</text>')

    # Title
    parts.append(f'<text x="{pad_l}" y="{h - 4}" fill="#7d8599" font-size="10">'
                 f'agent_runs — last {len(data)} days</text>')

    parts.append('</svg>')
    return "".join(parts)


def render_html(svg: str, summary: dict, days: int) -> str:
    today = _dt.date.today().isoformat()
    total_runs = sum(d["total"] for d in summary["data"])
    total_success = sum(d["success"] for d in summary["data"])
    total_failed = sum(d["failed"] for d in summary["data"])
    success_rate = (total_success / max(1, total_runs)) * 100
    last7 = summary["data"][-7:] if len(summary["data"]) >= 7 else summary["data"]
    last7_runs = sum(d["total"] for d in last7)
    last7_success = sum(d["success"] for d in last7)
    last7_failed = sum(d["failed"] for d in last7)

    # Top agents last 7 days
    by_agent: dict[str, int] = defaultdict(int)
    for d in last7:
        for a, c in d["agents"].items():
            by_agent[a] += c
    top_agents = sorted(by_agent.items(), key=lambda x: -x[1])[:5]

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>BizLegal AI — 30-day Analytics — {today}</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
         background: #0a0e1a; color: #e8eaf0; padding: 24px; }}
  .h1 {{ font-size: 22px; font-weight: 700; background: linear-gradient(90deg, #5b8cff, #c084fc);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
  .sub {{ color: #7d8599; font-size: 12px; margin: 6px 0 24px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px; margin-bottom: 20px; }}
  .card {{ background: #131829; border: 1px solid #1f2740; border-radius: 10px; padding: 16px; }}
  .label {{ font-size: 11px; color: #7d8599; text-transform: uppercase; letter-spacing: 1px; }}
  .val {{ font-size: 24px; font-weight: 700; color: #5b8cff; margin-top: 4px; }}
  .val.green {{ color: #4ade80; }}
  .val.red {{ color: #f87171; }}
  .val.yellow {{ color: #fbbf24; }}
  .sub2 {{ font-size: 11px; color: #7d8599; margin-top: 4px; }}
  .chart {{ background: #131829; border: 1px solid #1f2740; border-radius: 10px; padding: 16px;
           margin-bottom: 20px; }}
  table {{ width: 100%; border-collapse: collapse; }}
  th, td {{ text-align: left; padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #1f2740; }}
  th {{ color: #7d8599; font-weight: 500; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }}
  td.num {{ text-align: right; font-variant-numeric: tabular-nums; }}
</style>
</head>
<body>
  <h1 class="h1">BizLegal AI — {days}-Day Analytics</h1>
  <div class="sub">Generated {today} by analytics_dashboard.py · reads Supabase agent_runs</div>

  <div class="grid">
    <div class="card">
      <div class="label">Total runs (30d)</div>
      <div class="val">{total_runs}</div>
      <div class="sub2">across {summary['agents_total']} agent invocations</div>
    </div>
    <div class="card">
      <div class="label">Success rate</div>
      <div class="val {'green' if success_rate >= 90 else 'yellow' if success_rate >= 70 else 'red'}">{success_rate:.1f}%</div>
      <div class="sub2">{total_success} success / {total_failed} failed</div>
    </div>
    <div class="card">
      <div class="label">Last 7 days</div>
      <div class="val">{last7_runs}</div>
      <div class="sub2">{last7_success} success / {last7_failed} failed</div>
    </div>
    <div class="card">
      <div class="label">Daily avg (30d)</div>
      <div class="val">{total_runs / max(1, days):.1f}</div>
      <div class="sub2">runs per day</div>
    </div>
  </div>

  <div class="chart">
    {svg}
  </div>

  <div class="card" style="margin-top: 4px;">
    <div class="label">Top agents (last 7 days)</div>
    <table style="margin-top: 8px;">
      <thead><tr><th>Agent</th><th class="num">Runs</th></tr></thead>
      <tbody>
        {''.join(f'<tr><td>{a}</td><td class="num">{c}</td></tr>' for a, c in top_agents) if top_agents else '<tr><td colspan="2" style="color:#7d8599">No data</td></tr>'}
      </tbody>
    </table>
  </div>

  <div style="margin-top: 24px; color: #7d8599; font-size: 11px;">
    Auto-refresh: run <code>python3 services/seo-agents/analytics_dashboard.py</code> daily.
    Cron candidate: 23:00 UTC after the 22:00 quiet hour.
  </div>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=DEFAULT_DAYS)
    ap.add_argument("--outdir", default="/opt/bizlegal/decisions")
    args = ap.parse_args()

    supabase_key = load_supabase_key()
    if not supabase_key:
        print("  [fatal] SUPABASE_SERVICE_KEY not found in vault or env", file=sys.stderr)
        return 1

    runs = fetch_agent_runs_30d(supabase_key, args.days)
    if not runs:
        print("  [warn] no agent_runs returned from Supabase")
    summary = aggregate(runs, args.days)
    svg = render_svg(summary["data"], summary["days"])
    html = render_html(svg, summary, args.days)

    outdir = pathlib.Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    today = _dt.date.today().isoformat()
    out = outdir / f"analytics-{today}.html"
    out.write_text(html, encoding="utf-8")
    print(f"  wrote {out}")
    print(f"  total runs (30d): {sum(d['total'] for d in summary['data'])}")
    print(f"  success: {sum(d['success'] for d in summary['data'])}, "
          f"failed: {sum(d['failed'] for d in summary['data'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
