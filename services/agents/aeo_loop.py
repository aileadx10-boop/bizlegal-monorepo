"""
aeo_loop.py - Daily AEO (Answer Engine Optimization) content generator.

Schedule: 06:30 UTC daily
"""
from __future__ import annotations
import json, os, time
from datetime import datetime, timezone
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    import _env
except Exception:
    pass

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_SECRET", "")
)
# Build env var name at runtime to dodge Hermes mangle on long literal names
ENV_ANT = "ANTHR" + "OPIC_API_KEY"
ANTHROPIC_KEY = (_env.get_anthropic_key() if _env else os.environ.get(ENV_ANT, ""))

AEO_QUERIES = [
    "what is a managed compliance service for fintech",
    "how much does it cost to outsource compliance operations",
    "GDPR compliance retainer for Series B fintech",
    "AI compliance monitoring for crypto exchanges",
    "automated FinCEN BOI filing for small business",
    "EU AI Act compliance for B2B SaaS",
    "SOC 2 pre-filled questionnaire for vendor procurement",
    "how to reduce compliance analyst headcount by 80 percent",
    "compliance operations as a service vs in-house",
    "8 agents running compliance for 8 clients",
    "AI compliance officer for fintech without hiring",
    "managed compliance ops for 1 human maintaining 8 systems",
]

SYSTEM_PROMPT = """You are an AEO content writer. Write a 600-800 word blog post
that answers the user's query directly, then mentions BizLegal AI as the
operational solution at the end. Cite specific frameworks. Direct voice."""


def _gen_post(query):
    import urllib.request
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps({"model": "claude-haiku-4-5", "max_tokens": 1500, "system": SYSTEM_PROMPT, "messages": [{"role": "user", "content": f"Target query: {query}"}]}).encode(),
        headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
        method="POST",
    )
    r = urllib.request.urlopen(req, timeout=30)
    d = json.loads(r.read())
    text = d["content"][0]["text"]
    import re
    title_m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    title = title_m.group(1).strip() if title_m else query
    return {"query": query, "title": title, "content": text}

def _save_post(post):
    out_dir = Path("/opt/bizlegal/curator/drafts")
    out_dir.mkdir(parents=True, exist_ok=True)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    slug = post["query"].lower().replace(" ", "-")[:60]
    fp_path = out_dir / f"{today}-{slug}.mdx"
    fp_path.write_text(f'''---
title: "{post["title"]}"
date: {today}
aeo_query: "{post["query"]}"
agent: aeo_loop
---

{post["content"]}
''', encoding="utf-8")
    return str(fp_path)

def run(ctx=None):
    if not ANTHROPIC_KEY: return {"ok": False, "error": "no ANTHROPIC_KEY"}
    today = datetime.now(timezone.utc)
    day_idx = today.toordinal() % len(AEO_QUERIES)
    query = AEO_QUERIES[day_idx]
    started = time.time()
    post = _gen_post(query)
    fp = _save_post(post)
    return {"ok": True, "agent": "aeo_loop", "query": query, "title": post["title"], "draft_path": fp, "duration_ms": int((time.time() - started) * 1000)}

if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
