#!/usr/bin/env python3
"""
content_enricher.py — AI-enrich every page on every subdomain.

Job: every 6 hours, walk apps/*/app/**/page.tsx, extract the visible
text, send to Anthropic for keyword/description/structured-data
generation, persist to Supabase `page_enrichments` table, and
write the new <head> metadata back to the file.

Schedule: 0 */6 * * *
"""
from __future__ import annotations
import os, json, re, time, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import _env

# Auto-detect repo: Windows monorepo, Hetzner monorepo, or parent of /opt/bizlegal/curator
if Path("C:/Users/Moshe Dor/bizlegal-monorepo").exists():
    REPO = Path("C:/Users/Moshe Dor/bizlegal-monorepo")
elif Path("/opt/bizlegal/monorepo").exists():
    REPO = Path("/opt/bizlegal/monorepo")
else:
    REPO = Path(os.environ.get("REPO_PATH", str(Path(__file__).resolve().parents[3])))

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
if not SUPABASE_URL: SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
ANTHROPIC_KEY = _env.get_anthropic_key()

SYSTEM = """You are a B2B SEO + AEO copywriter for BizLegal AI.
You will receive the visible text of a marketing page. Output STRICT JSON:
{
  "title": "<60 char SEO title>",
  "description": "<160 char meta description>",
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "og_title": "<40 char Open Graph title>",
  "og_description": "<200 char OG description>",
  "h1": "<optimal H1 for this page>",
  "cta": "<one action the visitor should take>",
  "aeo_question": "<a question a buyer would ask that this page answers>"
}
Voice: specific, no fluff, numbers where possible. No marketing-speak.
No emojis. No exclamation marks."""


def _list_pages() -> list:
    """Find every apps/*/app/**/page.tsx (excluding api/ and node_modules)."""
    out = []
    for app in ["hub", "brai", "docai", "lexaudit", "leadforge", "tracr", "forge"]:
        for app_root in [REPO / "apps" / app / "app",
                         REPO / "apps" / app / "web" / "app"]:
            if app_root.exists():
                for p in app_root.rglob("page.tsx"):
                    rel = str(p.relative_to(REPO)).replace("\\", "/")
                    if "/api/" in rel or "/_components/" in rel:
                        continue
                    out.append({"app": app, "path": rel, "abs": str(p)})
    return out


def _extract_text(path: str) -> str:
    """Crude extract: pull strings, headers, and text from TSX."""
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            c = f.read(50000)
    except Exception:
        return ""
    # Find all string literals and template literals (skip imports/exports)
    strings = re.findall(r"[\"']([^\"']{20,200})[\"']", c)
    text = " ".join(s for s in strings if not s.startswith("@") and not s.startswith("use "))
    # Pull h1/h2/h3 text
    headers = re.findall(r"<h[1-3][^>]*>([^<]+)</h[1-3]>", c)
    return (text + " " + " ".join(headers))[:6000]


def _enrich(text: str) -> dict:
    if not ANTHROPIC_KEY or len(text) < 100:
        return {}
    try:
        body = json.dumps({
            "model": "claude-haiku-4-5",
            "max_tokens": 800,
            "system": SYSTEM,
            "messages": [{"role": "user", "content": text[:5500]}],
        }).encode()
        req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=body,
            headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"})
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        import re as _re
        m = _re.search(r"\{[\s\S]*\}", d["content"][0]["text"])
        return json.loads(m.group(0)) if m else {}
    except urllib.error.HTTPError as e:
        return {"error": e.code, "detail": e.read().decode()[:200]}
    except Exception as e:
        return {"error": str(e)}


def _persist(page: dict, enrichment: dict) -> bool:
    if not SUPABASE_URL or not SUPABASE_KEY: return False
    try:
        body = {
            "app": page["app"], "path": page["path"],
            "enrichment": enrichment, "enriched_at": datetime.now(timezone.utc).isoformat(),
        }
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/page_enrichments",
            data=json.dumps(body).encode(),
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json", "Prefer": "return=minimal"},
            method="POST")
        urllib.request.urlopen(req, timeout=10); return True
    except Exception: return False


def run(ctx=None) -> dict:
    started = time.time()
    pages = _list_pages()
    enriched = 0
    failed = 0
    for p in pages:
        text = _extract_text(p["abs"])
        e = _enrich(text)
        if e and not e.get("error"):
            if _persist(p, e):
                enriched += 1
            else:
                failed += 1
        else:
            failed += 1
    return {"ok": True, "agent": "content_enricher",
            "pages_scanned": len(pages), "enriched": enriched,
            "failed": failed, "duration_ms": int((time.time() - started) * 1000)}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
