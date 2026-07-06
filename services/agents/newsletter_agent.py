"""
Newsletter Agent — Weekly HTML digest.

Job: Compile week's agent_runs + qualified leads + new blog posts ->
generate a 5-section HTML newsletter -> send to Resend audience.

Sections:
1. "This week we shipped" (from git log + agent_runs)
2. "5 leads you should look at" (top 5 by score)
3. "New content" (blog posts published)
4. "The signal" (1 chart from conversion_tracker)
5. "What we're building next" (from decisions/ files)

Stack: Resend for send, Anthropic for prose, cron-driven.

Schedule: Tuesday 08:00 UTC.

Usage:
  from services.agents.newsletter_agent import run
  result = run({"dry_run": True, "to": "test@example.com"})
"""
from __future__ import annotations
import json, os, time
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
import _env
try:
    from orchestrator import heartbeat as _heartbeat
except Exception:
    _heartbeat = None

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
ANTHROPIC = _env.get_anthropic_key()
RESEND = _env.get_resend_key()
RESEND_AUDIENCE = os.getenv("RESEND_AUDIENCE_ID", "")


def _headers():
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}


def _get_json(url, headers, timeout=15):
    import urllib.request
    req = urllib.request.Request(url, headers=headers)
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _fetch_weekly_runs():
    """Pull agent_runs from the last 7 days."""
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    url = f"{SUPABASE_URL}/rest/v1/agent_runs?select=agent_name,action,status,details,created_at&created_at=gte.{week_ago}&order=created_at.desc&limit=100"
    try:
        return _get_json(url, _headers(), 10)
    except Exception:
        return []


def _fetch_top_leads(limit=5):
    url = f"{SUPABASE_URL}/rest/v1/leadforge_leads?select=email,full_name,company_name,score,industry&order=score.desc&limit={limit}"
    try:
        return _get_json(url, _headers(), 10)
    except Exception:
        return []


def _fetch_recent_blog_posts():
    base = Path(__file__).resolve().parents[2] / "content" / "blog"
    if not base.exists():
        return []
    week_ago = datetime.now() - timedelta(days=7)
    out = []
    for f in sorted(base.rglob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)[:10]:
        if datetime.fromtimestamp(f.stat().st_mtime) > week_ago:
            out.append({"path": str(f), "title": f.stem.replace("-", " ").title()})
    return out


def _fetch_signal_chart():
    """Get the latest conversion_tracker data point."""
    url = f"{SUPABASE_URL}/rest/v1/conversion_snapshots?select=*&order=snapshot_at.desc&limit=1"
    try:
        rows = _get_json(url, _headers(), 10)
        return rows[0] if rows else None
    except Exception:
        return None


def _generate_intro(weekly_data, leads, blog_posts):
    """Ask Claude to write the intro + 5-section prose."""
    if not ANTHROPIC:
        return f"Weekly digest: {len(weekly_data)} agent runs, {len(leads)} hot leads, {len(blog_posts)} new posts."
    import urllib.request
    summary = {
        "agent_runs": len(weekly_data),
        "leads_with_email": sum(1 for l in leads if l.get("email")),
        "blog_posts": len(blog_posts),
        "top_lead_score": leads[0].get("score") if leads else 0,
    }
    prompt = (
        "Write a 150-word intro for a weekly newsletter for the BizLegal-AI founder. "
        "Tone: punchy, founder-to-founder, 1-2 emoji OK. Mention specific numbers from the summary.\n\n"
        f"Summary: {json.dumps(summary)}\n\n"
        "Output the intro as 1 paragraph, no headers, no markdown."
    )
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({"model": "claude-haiku-4-5", "max_tokens": 384,
                             "messages": [{"role": "user", "content": prompt}]}).encode(),
            headers={"x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        return d["content"][0]["text"]
    except Exception as e:
        return f"Week of {datetime.now().strftime('%b %d')}: {summary['agent_runs']} agent runs, {summary['leads_with_email']} hot leads."


def _render_html(intro, leads, posts, signal, weekly):
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>BizLegal Weekly</title></head>
<body style="font-family:-apple-system,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;background:#fff;">
<h1 style="color:#00FF94;background:#08080f;padding:20px;border-radius:8px;margin:0;">
  📊 BizLegal Weekly — {datetime.now().strftime('%b %d, %Y')}
</h1>

<div style="padding:20px 0;line-height:1.6;">
  <p>{intro}</p>
</div>

<h2 style="color:#08080f;border-bottom:2px solid #00FF94;padding-bottom:8px;">
  🎯 5 leads you should look at
</h2>
<ul style="list-style:none;padding:0;">
  {''.join(f'<li style="padding:10px;border-left:3px solid #00FF94;margin:8px 0;background:#f5f5f5;"><b>{l.get("full_name", "?")}</b> at {l.get("company_name", "?")} — score {l.get("score", 0)}<br><small style="color:#666;">{l.get("email", "")}</small></li>' for l in leads[:5])}
</ul>

<h2 style="color:#08080f;border-bottom:2px solid #00FF94;padding-bottom:8px;">
  📝 New content this week
</h2>
<ul>
  {''.join(f'<li><a href="https://bizlegal-ai.com/posts/{p["path"].split("/")[-1].replace(".md", "")}" style="color:#00FF94;">{p["title"]}</a></li>' for p in posts[:5]) or '<li>No new posts this week.</li>'}
</ul>

<h2 style="color:#08080f;border-bottom:2px solid #00FF94;padding-bottom:8px;">
  🤖 This week the agents shipped
</h2>
<p><b>{len(weekly)}</b> agent runs in the last 7 days.</p>
<p>Top activities: {', '.join(set(r.get("agent_name", "?") for r in weekly[:20]))}</p>

<h2 style="color:#08080f;border-bottom:2px solid #00FF94;padding-bottom:8px;">
  📈 The signal
</h2>
<p>{'Latest conversion snapshot: ' + json.dumps(signal)[:200] if signal else 'No snapshot this week.'}</p>

<div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee;color:#666;font-size:12px;">
  <p>You are receiving this because you opted in at bizlegal-ai.com.<br>
  <a href="{{unsubscribe_url}}" style="color:#999;">Unsubscribe</a></p>
</div>
</body></html>"""


def _send_resend(to, subject, html):
    """Send the email via Resend."""
    if not RESEND:
        return {"ok": False, "error": "no RESEND_API_KEY"}
    import urllib.request
    try:
        # Use audience if provided
        recipients = [to] if to else "broadcast"
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps({
                "from": os.getenv("RESEND_FROM", "reports@intelligence.bizlegal-ai.com"),
                "to": recipients if isinstance(recipients, list) else [],
                "audience_id": RESEND_AUDIENCE if not to else None,
                "subject": subject,
                "html": html,
            }).encode(),
            headers={"Authorization": f"Bearer {RESEND}", "Content-Type": "application/json", "User-Agent": "bizlegal-agent/1.0"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        return {"ok": True, "id": d.get("id")}
    except Exception as e:
        return {"ok": False, "error": str(e)[:200]}


def run(ctx=None):
    ctx = ctx or {}
    dry_run = bool(ctx.get("dry_run", False))
    to = ctx.get("to", "")
    started = time.time()
    weekly = _fetch_weekly_runs()
    leads = _fetch_top_leads(5)
    posts = _fetch_recent_blog_posts()
    signal = _fetch_signal_chart()
    intro = _generate_intro(weekly, leads, posts)
    html = _render_html(intro, leads, posts, signal, weekly)
    subject = f"📊 BizLegal Weekly — {datetime.now().strftime('%b %d')}"
    sent = None
    if not dry_run:
        sent = _send_resend(to, subject, html)
    return {
        "ok": True,
        "agent": "newsletter",
        "weekly_runs": len(weekly),
        "leads": len(leads),
        "blog_posts": len(posts),
        "html_chars": len(html),
        "subject": subject,
        "sent": sent,
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args = {}
    i = 1
    while i < len(sys.argv):
        a = sys.argv[i]
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            if v:
                args[k] = v
            elif i + 1 < len(sys.argv) and not sys.argv[i+1].startswith("--"):
                args[k] = sys.argv[i+1]
                i += 1
            else:
                args[k] = True
        i += 1
    print(json.dumps(run(args), indent=2))
