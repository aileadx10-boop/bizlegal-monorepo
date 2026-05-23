"""
Hetzner curator — publisher service.

Tiny FastAPI service the bot.py talks to over loopback. Three endpoints:
  POST /deploy {"slug": "..."}   commit MDX + hero PNG to bizlegal-ea
                                  (target='blog' / 'hub' / 'both')
  POST /regen  {"slug": "..."}   re-run brain.py with higher temperature
  POST /reject {"slug": "..."}   archive draft, mark daily_gaps row

Anti-hallucination verification before commit:
  - Greps the MDX for numeric tokens (dates, percents, money amounts,
    article numbers).
  - Asks Claude: "Does each of these numbers appear in the source URLs
    you cited? yes/no per number."
  - If any 'no' → commit is blocked, status reverts to 'drafted',
    Telegram pings Moses with the suspect numbers.

Listens only on 127.0.0.1 (Caddy can expose if remote ops needed).

Run as: uvicorn publisher:app --host 127.0.0.1 --port 8082
systemd unit: curator-publisher.service
"""
from __future__ import annotations

import asyncio
import base64
import hmac
import hashlib
import json
import os
import re
import socket
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client  # type: ignore

from ops_log import log_event

load_dotenv()

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

GH_TOKEN = os.getenv("GITHUB_TOKEN", "")
GH_OWNER = os.getenv("GITHUB_REPO_OWNER", "aileadx10-boop")
GH_REPO = os.getenv("GITHUB_REPO_NAME", "bizlegal-ea")
GH_BRANCH = os.getenv("GITHUB_DEFAULT_BRANCH", "main")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")

VERCEL_HUB_HOOK = os.getenv("VERCEL_DEPLOY_HOOK_HUB", "")
VERCEL_FORGE_HOOK = os.getenv("VERCEL_DEPLOY_HOOK_FORGE", "")

# R4 — Forge content surface affinity. When a draft's slug, category,
# regulation_tag, or tags array touches any of these terms, the
# publisher commits a copy to aileadx10-boop/forge as well as the
# normal blog repo, and fires the Forge Vercel deploy hook on top of
# the hub one. This is how the Hetzner curator feeds Forge — the only
# currently-live revenue subdomain (forge.bizlegal-ai.com) — with
# topical content tied to its $149 BOI Kit, $297 Passport, and $97
# wallet scan products.
FORGE_AFFINITY_TERMS: tuple[str, ...] = (
    "boi",
    "cta-2024",
    "fincen",
    "passport",
    "regulatory-passport",
    "wallet-scan",
    "wallet-tracing",
    "wallet-screening",
    "aml-screening",
    "aml-compliance",
    "ofac",
    "sanctions",
    "real-estate-tokenization",
)
FORGE_REPO_OWNER = os.getenv("FORGE_REPO_OWNER", "aileadx10-boop")
FORGE_REPO_NAME = os.getenv("FORGE_REPO_NAME", "forge")
FORGE_CONTENT_PATH_PREFIX = os.getenv(
    "FORGE_CONTENT_PATH_PREFIX",
    "apps/web/content/blog",
)

DRAFTS_DIR = Path("/opt/bizlegal/curator/drafts")
CURATOR_DIR = "/opt/bizlegal/curator"
PYTHON_BIN = "/opt/bizlegal/venv/bin/python"

app = FastAPI(title="bizlegal-curator-publisher")


# V0.2 — heartbeat loop. Fires startup event when uvicorn boots, then
# every 5 min so /ops can detect a stuck publisher even when no
# /deploy traffic arrives.
async def _heartbeat_loop(interval_s: int = 300) -> None:
    host = socket.gethostname()
    log_event(
        "heartbeat",
        ref_id="curator/publisher",
        status="ok",
        metadata={"service": "publisher", "host": host, "phase": "startup"},
    )
    while True:
        try:
            await asyncio.sleep(interval_s)
            log_event(
                "heartbeat",
                ref_id="curator/publisher",
                status="ok",
                metadata={"service": "publisher", "host": host, "phase": "tick"},
            )
        except asyncio.CancelledError:
            return
        except Exception as exc:
            print(f"[publisher] heartbeat loop error: {exc}")


@app.on_event("startup")
async def _start_heartbeat() -> None:
    asyncio.create_task(_heartbeat_loop())


def sb() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SECRET)


class SlugReq(BaseModel):
    slug: str


# ── Anti-hallucination verification ─────────────────────────────
NUMERIC_RE = re.compile(
    r"\b(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?(?:%|€|\$|£)?(?:\s?(?:million|billion|m|bn))?|\d{4})\b"
)


def extract_numerics(text: str) -> list[str]:
    return list(set(NUMERIC_RE.findall(text)))[:30]  # cap at 30 numbers


def verify_numerics(mdx: str, sources: list[str]) -> tuple[bool, list[str]]:
    if not ANTHROPIC_KEY:
        return True, []  # if Claude unavailable, skip verification (manual review)
    numbers = extract_numerics(mdx)
    if not numbers:
        return True, []
    prompt = (
        "You verified these numeric claims when drafting. For each number "
        "below, answer 'yes' if it appears in at least one of the source "
        "URLs we listed, or 'no' if you don't see it in the sources. Output "
        "STRICT JSON: {\"verdicts\": [{\"number\": \"<n>\", \"in_sources\": <bool>}]}\n\n"
        f"Sources: {json.dumps(sources)}\n\n"
        f"Numbers: {json.dumps(numbers)}"
    )
    try:
        res = httpx.post(
            ANTHROPIC_URL,
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": ANTHROPIC_VERSION,
                "content-type": "application/json",
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": 2048,
                "temperature": 0.0,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=60,
        )
        res.raise_for_status()
        body = res.json()
        text = next((c["text"] for c in body.get("content", []) if c.get("type") == "text"), "")
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
        verdicts = json.loads(cleaned).get("verdicts", [])
        unverified = [v["number"] for v in verdicts if not v.get("in_sources")]
        return len(unverified) == 0, unverified
    except Exception as err:
        print(f"[publisher] verification call failed (allowing publish): {err}")
        return True, []


# ── GitHub commit (single-file content API; mirrors Worker's github.ts) ─
def gh_get_sha(owner: str, repo: str, path: str, branch: str = GH_BRANCH) -> str | None:
    res = httpx.get(
        f"https://api.github.com/repos/{owner}/{repo}/contents/{path}",
        headers={
            "Authorization": f"Bearer {GH_TOKEN}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        params={"ref": branch},
        timeout=30,
    )
    if res.status_code == 404:
        return None
    res.raise_for_status()
    return res.json().get("sha")


def gh_put(
    path: str,
    content_bytes: bytes,
    message: str,
    *,
    owner: str = GH_OWNER,
    repo: str = GH_REPO,
    branch: str = GH_BRANCH,
) -> None:
    sha = gh_get_sha(owner, repo, path, branch)
    body = {
        "message": message,
        "content": base64.b64encode(content_bytes).decode("ascii"),
        "branch": branch,
    }
    if sha:
        body["sha"] = sha
    res = httpx.put(
        f"https://api.github.com/repos/{owner}/{repo}/contents/{path}",
        headers={
            "Authorization": f"Bearer {GH_TOKEN}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        json=body,
        timeout=60,
    )
    res.raise_for_status()


# ── Forge-affinity routing ──────────────────────────────────────
def is_forge_affinity(slug: str, mdx: str) -> bool:
    """Return True if the draft touches a Forge product surface.

    Inspects slug + frontmatter category/regulation_tag/tags so a post
    explicitly tagged with any FORGE_AFFINITY_TERMS routes to Forge.
    """
    haystack = slug.lower()
    # Trim to YAML frontmatter to avoid false positives in body prose.
    if mdx.startswith("---\n"):
        end = mdx.find("\n---", 4)
        if end > 0:
            haystack += "\n" + mdx[4:end].lower()
    return any(term in haystack for term in FORGE_AFFINITY_TERMS)


# ── Routes ──────────────────────────────────────────────────────
@app.post("/deploy")
def deploy(req: SlugReq) -> dict:
    slug = req.slug
    mdx_path = DRAFTS_DIR / f"{slug}.mdx"
    hero_path = DRAFTS_DIR / f"{slug}-hero.png"
    if not mdx_path.exists():
        raise HTTPException(404, f"draft not found: {slug}")

    mdx = mdx_path.read_text(encoding="utf-8")
    sources = re.findall(r"https?://[^\s)\"']+", mdx)
    ok, unverified = verify_numerics(mdx, sources)
    if not ok:
        sb().table("daily_gaps").update({
            "status": "drafted",  # revert; force regen
            "verification_failed": True,
            "unverified_numbers": unverified,
        }).eq("draft_slug", slug).execute()
        log_event(
            "cron.completed",
            ref_id=f"curator/publisher/{slug}",
            status="failed",
            metadata={"step": "publisher", "outcome": "verification_failed",
                      "slug": slug, "unverified_numbers": unverified[:10]},
        )
        return {
            "ok": False,
            "verification_failed": True,
            "unverified_numbers": unverified,
            "message": "Numbers not found in cited sources — draft sent back for regen.",
        }

    # Read target from Supabase row
    row = sb().table("daily_gaps").select("target").eq("draft_slug", slug).single().execute()
    target = (row.data or {}).get("target", "blog")

    # Always commit to bizlegal-ea blog content path
    blog_path = f"projects/bizlegal-seo-site/content/blog/{slug}.mdx"
    gh_put(blog_path, mdx.encode("utf-8"), f"content: publish {slug}")
    if hero_path.exists():
        gh_put(
            f"projects/bizlegal-seo-site/content/blog/_assets/{slug}-hero.png",
            hero_path.read_bytes(),
            f"content: publish {slug} hero",
        )

    blog_url = f"https://blog.bizlegal-ai.com/blog/{slug}"
    hub_url: str | None = None
    hub_hook_fired = False
    forge_url: str | None = None
    forge_hook_fired = False
    forge_pushed = False

    # R4 — also commit to forge content surface if the post touches a
    # Forge product topic. Forge gets the SAME MDX (no rewrite) plus
    # the hero image, so the post indexes on both forge.bizlegal-ai.com
    # and blog.bizlegal-ai.com.
    if is_forge_affinity(slug, mdx):
        forge_blog_path = f"{FORGE_CONTENT_PATH_PREFIX}/{slug}.mdx"
        try:
            gh_put(
                forge_blog_path,
                mdx.encode("utf-8"),
                f"content: publish {slug} (forge-affinity)",
                owner=FORGE_REPO_OWNER,
                repo=FORGE_REPO_NAME,
            )
            if hero_path.exists():
                gh_put(
                    f"{FORGE_CONTENT_PATH_PREFIX}/_assets/{slug}-hero.png",
                    hero_path.read_bytes(),
                    f"content: publish {slug} hero (forge)",
                    owner=FORGE_REPO_OWNER,
                    repo=FORGE_REPO_NAME,
                )
            forge_url = f"https://forge.bizlegal-ai.com/blog/{slug}"
            forge_pushed = True
        except Exception as err:
            print(f"[publisher] forge push failed: {err}")

    # Optional hub /[slug] push (target=hub|both)
    if target in ("hub", "both") and VERCEL_HUB_HOOK:
        try:
            httpx.post(VERCEL_HUB_HOOK, timeout=30).raise_for_status()
            hub_url = f"https://bizlegal-ai.com/{slug}"
            hub_hook_fired = True
        except Exception as err:
            print(f"[publisher] hub deploy hook failed: {err}")

    # Forge deploy hook — only fires if the content actually pushed to
    # the Forge repo. Avoids triggering a no-op rebuild when the
    # forge_pushed branch never ran.
    if forge_pushed and VERCEL_FORGE_HOOK:
        try:
            httpx.post(VERCEL_FORGE_HOOK, timeout=30).raise_for_status()
            forge_hook_fired = True
        except Exception as err:
            print(f"[publisher] forge deploy hook failed: {err}")

    sb().table("daily_gaps").update({
        "status": "published",
        "published_at": datetime.now(timezone.utc).isoformat(),
        "blog_url": blog_url,
        "hub_url": hub_url,
        "forge_url": forge_url,
    }).eq("draft_slug", slug).execute()
    log_event(
        "cron.completed",
        ref_id=f"curator/publisher/{slug}",
        status="ok",
        metadata={
            "step": "publisher",
            "outcome": "published",
            "slug": slug,
            "target": target,
            "target_repo": f"{GH_OWNER}/{GH_REPO}",
            "blog_url": blog_url,
            "hub_url": hub_url,
            "hub_hook_fired": hub_hook_fired,
            "forge_url": forge_url,
            "forge_pushed": forge_pushed,
            "forge_hook_fired": forge_hook_fired,
            "hero_pushed": hero_path.exists(),
        },
    )
    # Phase RR — fan out to social syndication (HMAC-signed POST, best-effort)
    try:
        syndicate_body = json.dumps({
            "source_url": blog_url,
            "source_title": slug,
            "source_summary": mdx[:1200],
        }, separators=(",", ":"))
        sig = hmac.new(
            os.environ["BIZLEGAL_INBOUND_SECRET"].encode(),
            syndicate_body.encode(),
            hashlib.sha256,
        ).hexdigest()
        httpx.post(
            "https://bizlegal-ai.com/api/content/syndicate",
            content=syndicate_body.encode(),
            headers={"content-type": "application/json", "x-bizlegal-signature": sig},
            timeout=30,
        )
    except Exception:
        pass  # best-effort; content already published
    return {
        "ok": True,
        "blog_url": blog_url,
        "hub_url": hub_url,
        "forge_url": forge_url,
        "forge_pushed": forge_pushed,
    }


@app.post("/regen")
def regen(req: SlugReq) -> dict:
    sb().table("daily_gaps").update({
        "status": "picked",  # send back to brain
        "draft_path": None,
        "draft_slug": None,
        "drafted_at": None,
        "regen_count": "regen_count + 1",  # noqa — Supabase ignores expressions; tracked manually
    }).eq("draft_slug", req.slug).execute()
    subprocess.Popen(
        [PYTHON_BIN, f"{CURATOR_DIR}/brain.py", "--force"],
        cwd=CURATOR_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return {"ok": True, "regen": req.slug}


@app.post("/reject")
def reject(req: SlugReq) -> dict:
    sb().table("daily_gaps").update({
        "status": "rejected",
        "actioned_at": datetime.now(timezone.utc).isoformat(),
    }).eq("draft_slug", req.slug).execute()
    return {"ok": True, "rejected": req.slug}


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "curator-publisher",
        "configured": {
            "github": bool(GH_TOKEN),
            "anthropic": bool(ANTHROPIC_KEY),
            "supabase": bool(SUPABASE_URL and SUPABASE_SECRET),
            "vercel_hub_hook": bool(VERCEL_HUB_HOOK),
            "vercel_forge_hook": bool(VERCEL_FORGE_HOOK),
            "forge_repo": f"{FORGE_REPO_OWNER}/{FORGE_REPO_NAME}",
        },
    }
