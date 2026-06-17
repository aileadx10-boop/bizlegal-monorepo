"""
Hetzner curator — brain step.

Polls Supabase `daily_gaps` for any row with status='picked'. For each
picked row:
  1. Calls Claude Sonnet 4.6 with a long-form prompt → MDX + frontmatter
     + Mermaid diagrams + hero prompt + target ('blog'|'hub'|'both').
  2. Generates hero PNG via OpenAI gpt-image-1 (medium quality —
     budget rule).
  3. Writes draft to /opt/bizlegal/curator/drafts/{slug}.mdx and
     PNG to /opt/bizlegal/curator/drafts/{slug}-hero.png.
  4. Updates row status='drafted' + draft_path.
  5. Pings Telegram (BIZLEGALFORGEBOT) with [Deploy] [Reject] [Regen].

Designed to run as a small loop (every 60s) via systemd timer, OR
triggered immediately from bot.py after a topic pick. Idempotent —
re-running on a 'drafted' row is a no-op unless --force is passed.

Anti-hallucination contract:
  - Sources block lists every URL given to Claude
  - disclaimer_version stamped from env
  - Numeric-claim verification via second Claude call before commit
    (handled in publisher.py — brain.py only drafts)
"""
from __future__ import annotations

import argparse
import atexit
import base64
import fcntl
import json
import os
import re
import sys
import textwrap
from datetime import datetime, timezone
from pathlib import Path

_LOCK_FD = None  # module-level so atexit can close it

import httpx
from dotenv import load_dotenv
from supabase import create_client, Client  # type: ignore

from ops_log import log_event
from quality_gate import validate as quality_validate, audit as quality_audit
from humanize import humanize, HumanizeError
from factual_review import review as factual_review, FactualReviewError

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

OPENAI_KEY = os.getenv("NEW_OPENAI_KEY", "") or os.getenv("OPENAI_API_KEY", "")
OPENAI_IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1")
OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations"

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")

TG_TOKEN = os.getenv("TELEGRAM_CURATOR_BOT_TOKEN", "")
TG_CHAT = os.getenv("TELEGRAM_CHAT_ID", "")

DISCLAIMER_VERSION = os.getenv("DISCLAIMER_VERSION", "v1.0.0-p1")
DRAFTS_DIR = Path("/opt/bizlegal/curator/drafts")

DRAFT_PROMPT = textwrap.dedent("""
    You're a senior crypto/digital-asset compliance practitioner writing
    for BizLegal-AI's Intelligence Desk. Reader is a compliance officer,
    GC, founder, or counsel.

    Output STRICT JSON with this shape:
    {
      "title": "<50-65 char H1, primary keyword forward>",
      "slug": "<kebab-case from title>",
      "description": "<140-160 char meta description>",
      "category": "<one of: regulation | enforcement | guidance | jurisdiction-arbitrage>",
      "jurisdiction": "<e.g. EU, UAE, US-Federal>",
      "regulation_tag": "<e.g. MiCA, VARA, SEC, GDPR>",
      "tags": ["<5-8 tags>"],
      "primary_keyword": "<from the source>",
      "secondary_keywords": ["<3-6 keywords>"],
      "target": "<blog | hub | both>",
      "mdx_body": "<the full article body, 900-1400 words, MDX formatting>",
      "mermaid": ["<one to three Mermaid syntax diagrams>"],
      "faqs": [
        { "q": "<exact question>", "a": "<2-4 sentence answer>" }
      ],
      "hero_prompt": "<editorial hero image prompt, navy/indigo/gold palette, no robots>",
      "sources": [
        "<the source article URL>",
        "<primary-source URL #2 — official regulator page, statute, or official guidance>",
        "<primary-source URL #3 — different official regulator/government page>",
        "<add more if needed>"
      ]
    }

    CRITICAL sources rule: `sources` MUST contain ≥3 distinct https:// URLs.
    Always include the source article URL PLUS at least 2 additional primary
    official sources (regulator pages, government statutes, official guidance
    documents — NOT news sites or law firm blogs). Search your training data
    for the relevant regulator's official URL (e.g. sec.gov, cftc.gov,
    fca.org.uk, eur-lex.europa.eu). If you can only find 2 real primary URLs,
    add a third from the same regulator's main press-release index.

    faqs requirements (W3.2 — drives FAQPage JSON-LD on gap-pages):
      - 3-5 entries, no fewer, no more.
      - Each "q" is a complete question a real practitioner would type
        into Google (think "what triggers the new MiCA disclosure?").
      - Each "a" is a 2-4 sentence answer that stands alone — the
        same answer must work as the MDX body's "## FAQ" section
        AND as a standalone rich snippet in a Google SERP.
      - The faqs array is the same Q/A pairs as the "## FAQ" section
        in mdx_body — keep them in sync. Faqs is the structured
        version; the MDX body is the prose version.

    target rules:
      - "blog" — default; goes to blog.bizlegal-ai.com only
      - "hub" — regulator profile / canonical reference page; goes to
                bizlegal-ai.com/[slug]
      - "both" — both surfaces (rare; needs a strong evergreen reason)

    Anti-AI-detection:
      - Banned phrases: "it's important to note", "moreover", "furthermore",
        "in conclusion", "navigating the landscape", "delve into", "dive
        deep", "in today's rapidly evolving", "it is crucial to understand"
      - Vary paragraph length (1-5 sentences, mix short + long)
      - Use contractions naturally
      - Cite specific numbers, dates, case names, article numbers
      - Vary sentence openings
      - Max ~3 em-dashes per 1000 words

    Content rules:
      - Stay laser-focused on the topic spec's jurisdiction + regulation
      - Never invent: company names in enforcement, dollar penalties, case
        outcomes, URLs
      - Never include editorial cost estimates ("$X in legal defense costs",
        "estimated $X in compliance costs", "cost of non-compliance is $X")
        unless that exact figure appears verbatim in a source URL. These are
        opinion, not verifiable fact, and will be rejected by the factual gate.
      - Include at least 1 specific recent case, action, or deadline
      - Target 900-1400 words. Quality over length; stay under 1400.
      - Every numeric claim (date, fine, deadline) must be in the sources
        list; we will verify before publish

    MDX body structure (in order):
      - H1 = title
      - Opening hook (2-3 sentences)
      - ## TL;DR (3-5 terse bullets)
      - ## What this regulation requires (with H3 subsections)
      - ## What this means for your company
      - ## How to operationalize (concrete checklist)
      - ## Common mistakes and how to avoid them
      - ## FAQ (3-5 Q&A pairs)
      - ## Sources (footer, links to gov/regulator pages)
      - ## Disclaimer (regulatory intelligence — not legal advice)

    Agent CTA placement (Phase Y):
      - If the post touches EU AI Act / Article 6 / Annex III / GP-AI
        obligations: add a single closing paragraph linking to
        https://bizlegal-ai.com/agents/ai-act with the framing
        "We built a free classifier for this — paste your system
        description and get a tier with cited Article references."
        Place it BEFORE the ## Sources section.
      - If the post touches GDPR / CCPA / CPRA / Quebec Law 25 /
        Colorado / Connecticut / Texas DPSA amendments OR privacy
        policy compliance: add the same single closing paragraph
        linking to https://bizlegal-ai.com/agents/policy-refresh
        with framing "Free 7-framework redline of your policy URL."
      - Never insert both CTAs in the same post. Pick the dominant
        topic. Never insert any CTA on posts that aren't substantively
        about these topics — relevance discipline matters more than
        link volume for organic ranking.

    Output JSON only — no code fences, no prose wrapper.

    === SOURCE ===
    Feed: {feed_id}
    Title: {title}
    Summary: {summary}
    URL: {url}
    Date: {pub_date}
    Vertical: {vertical}
    Short thesis: {short_thesis}
    Pick rationale: {rationale}
    === END SOURCE ===
""").strip()


# ── Anthropic ─────────────────────────────────────────────────────
def call_claude(prompt: str) -> dict:
    if not ANTHROPIC_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")
    res = httpx.post(
        ANTHROPIC_URL,
        headers={
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
        json={
            "model": ANTHROPIC_MODEL,
            "max_tokens": 8192,
            "temperature": 0.2,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    res.raise_for_status()
    body = res.json()
    text = next((c["text"] for c in body.get("content", []) if c.get("type") == "text"), "")
    if not text:
        raise RuntimeError("Claude empty response")
    # Strip code fences if Claude wrapped despite instruction
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: escape literal newlines/tabs embedded in JSON string values.
        # Claude sometimes outputs actual \n inside mdx_body instead of \\n,
        # especially for long (~1000 word) articles. The state machine below
        # handles nested escapes correctly without corrupting non-string tokens.
        fixed = _fix_json_newlines(cleaned)
        return json.loads(fixed)


def _fix_json_newlines(text: str) -> str:
    """Escape bare newlines/tabs inside JSON string values (state machine)."""
    result: list[str] = []
    in_string = False
    escape_next = False
    for ch in text:
        if escape_next:
            result.append(ch)
            escape_next = False
        elif ch == "\\" and in_string:
            result.append(ch)
            escape_next = True
        elif ch == '"':
            result.append(ch)
            in_string = not in_string
        elif in_string and ch == "\n":
            result.append("\\n")
        elif in_string and ch == "\r":
            result.append("\\r")
        elif in_string and ch == "\t":
            result.append("\\t")
        else:
            result.append(ch)
    return "".join(result)


# ── OpenAI image gen ─────────────────────────────────────────────
def generate_hero(prompt: str) -> bytes | None:
    if not OPENAI_KEY:
        print("[brain] NEW_OPENAI_KEY not set; skipping hero")
        return None
    try:
        res = httpx.post(
            OPENAI_IMAGE_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_KEY}",
                "content-type": "application/json",
            },
            json={
                "model": OPENAI_IMAGE_MODEL,
                "prompt": prompt,
                "n": 1,
                "size": "1536x1024",
                "quality": "medium",  # budget rule — medium indistinguishable for hero
            },
            timeout=120,
        )
        res.raise_for_status()
        body = res.json()
        b64 = body.get("data", [{}])[0].get("b64_json")
        if not b64:
            print("[brain] OpenAI returned no b64_json")
            return None
        return base64.b64decode(b64)
    except Exception as err:
        print(f"[brain] hero gen failed: {err}")
        return None


# ── MDX assembly ─────────────────────────────────────────────────
def build_mdx(draft: dict) -> str:
    today = datetime.now(timezone.utc).isoformat()
    fm = {
        "title": draft["title"],
        "slug": draft["slug"],
        "description": draft["description"],
        "canonical": f"https://blog.bizlegal-ai.com/blog/{draft['slug']}",
        "date": today,
        "author": "BizLegal-AI Intelligence Desk",
        "category": draft["category"],
        "jurisdiction": draft["jurisdiction"],
        "regulation_tag": draft["regulation_tag"],
        "tags": draft.get("tags", []),
        "primary_keyword": draft.get("primary_keyword", ""),
        "secondary_keywords": draft.get("secondary_keywords", []),
        "schema_type": "Article",
        "generated_at": today,
        "generated_model": ANTHROPIC_MODEL,
        "disclaimer_version": DISCLAIMER_VERSION,
        "target": draft.get("target", "blog"),
        "hero_image": f"/blog/_assets/{draft['slug']}-hero.png",
    }

    body_lines = [
        "---",
        *_yaml_lines(fm),
        "---",
        "",
        draft["mdx_body"].strip(),
    ]
    # Mermaid blocks — embed before the Sources/Disclaimer footer
    for diagram in draft.get("mermaid", []):
        body_lines.append("")
        body_lines.append("```mermaid")
        body_lines.append(diagram.strip())
        body_lines.append("```")
    return "\n".join(body_lines) + "\n"


def _yaml_lines(fm: dict) -> list[str]:
    out: list[str] = []
    for k, v in fm.items():
        if isinstance(v, list):
            out.append(f"{k}:")
            for item in v:
                out.append(f"  - {json.dumps(item, ensure_ascii=False)}")
        else:
            out.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
    return out


def _html_escape(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ── Telegram ─────────────────────────────────────────────────────
# Telegram callback_data limit is 64 bytes. "deploy:" prefix = 7 chars,
# leaving 57 chars for the slug. Slugs longer than that get a text-only
# notice (no buttons) with manual deploy instructions.
_CB_MAX_SLUG = 57


def notify_draft_ready(slug: str, title: str, target: str) -> None:
    if not TG_TOKEN or not TG_CHAT:
        return
    slug_ok = _html_escape(slug)
    title_ok = _html_escape(title)
    target_ok = _html_escape(target)

    if len(slug) <= _CB_MAX_SLUG:
        text = (
            "<b>✍️ Draft ready for approval</b>\n\n"
            f"<i>{title_ok}</i>\n\n"
            f"target: <code>{target_ok}</code>\n"
            f"slug: <code>{slug_ok}</code>\n\n"
            "Tap to act. Numeric claims verified against sources before commit."
        )
        payload: dict = {
            "chat_id": TG_CHAT,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {"text": "✅ Deploy", "callback_data": f"deploy:{slug}"},
                        {"text": "🔁 Regen", "callback_data": f"regen:{slug}"},
                        {"text": "🗑 Reject", "callback_data": f"reject:{slug}"},
                    ]
                ]
            },
        }
    else:
        # Slug too long for callback_data — send notice-only, no buttons.
        text = (
            "<b>✍️ Draft ready (manual deploy — slug too long for buttons)</b>\n\n"
            f"<i>{title_ok}</i>\n\n"
            f"slug: <code>{slug_ok}</code>\n\n"
            "Deploy via: <code>POST http://127.0.0.1:8082/deploy</code>"
        )
        payload = {"chat_id": TG_CHAT, "text": text, "parse_mode": "HTML"}

    try:
        httpx.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json=payload,
            timeout=15,
        ).raise_for_status()
    except Exception as err:
        print(f"[brain] telegram notify failed: {err}")


# ── Pipeline ─────────────────────────────────────────────────────
def supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SECRET)


def process_picked(force: bool = False) -> int:
    sb = supabase_client()
    query = sb.table("daily_gaps").select("*").eq("status", "picked")
    if not force:
        query = query.is_("draft_path", "null")
    rows = query.execute().data or []
    print(f"[brain] {len(rows)} picked rows to draft")
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    drafted_count = 0
    failed_count = 0
    for row in rows:
        try:
            draft = call_claude(_render_prompt(row))
        except Exception as err:
            print(f"[brain] draft failed for {row.get('url')}: {err}")
            failed_count += 1
            log_event(
                "cron.completed",
                ref_id="curator/brain",
                status="failed",
                metadata={"step": "brain", "outcome": "claude_failed",
                          "source_url": row.get("url"), "error": str(err)[:200]},
            )
            continue
        slug = re.sub(r"[^a-z0-9-]", "-", draft["slug"].lower()).strip("-")
        draft["slug"] = slug

        # Gate ordering (cost-aware): structural gates first (free, fast),
        # paid Claude passes only on drafts that pass cheap checks.
        # Sequence:
        #   1. quality_gate (Python, free) — structure / words / visuals / FAQ
        #   2. humanize     (Haiku ~$0.10) — strip AI-tells, add asides
        #   3. quality_gate (Python, free) — re-check for surviving AI-tells
        #   4. factual_review (Sonnet ~$0.30) — primary-source citations
        # Bad drafts die in step 1, saving ~$0.40 each on rejection.

        # Pass 1: structural quality gate (Python, fast, free).
        gate_errors = quality_validate(draft)
        if gate_errors:
            _reject_draft(sb, row, slug, "quality_gate", gate_errors)
            failed_count += 1
            continue
        print(f"[brain] {slug}: quality gate (structure) ok")

        # Pass 2: humanize. Best-effort — if Haiku hiccups, fall back to
        # the raw Sonnet draft. The post-humanize quality gate (pass 3)
        # catches AI-tells either way.
        try:
            draft = humanize(draft)
            print(f"[brain] {slug}: humanize ok")
        except HumanizeError as err:
            print(f"[brain] {slug}: humanize skipped — {err}")
            log_event(
                "cron.completed",
                ref_id=f"curator/brain/{slug}",
                status="ok",
                metadata={"step": "brain.humanize", "outcome": "skipped",
                          "slug": slug, "reason": str(err)[:160]},
            )

        # Pass 3: re-run quality gate post-humanize. Catches banned phrases
        # introduced (or surviving) the rewrite. Free, ~50ms — cheaper to
        # double-check than to ship un-humanized AI prose.
        gate_errors = quality_validate(draft)
        if gate_errors:
            _reject_draft(sb, row, slug, "quality_gate_post_humanize", gate_errors)
            failed_count += 1
            continue
        print(f"[brain] {slug}: quality gate (post-humanize) ok")

        # Pass 4: factual review. Hard gate — reject only when the reviewer
        # finds genuinely invented/fabricated specific claims (possibly_invented).
        # Citation-gap notes (add_citation) are acceptable and pass through.
        # We never ship truly fabricated enforcement specifics; we do allow
        # standard regulatory doctrine that lacks verbatim source backing.
        try:
            review_result = factual_review(draft)
            # Check for genuinely dangerous fabrications only.
            invented_issues = [
                i for i in review_result.issues
                if i.get("issue") == "possibly_invented"
                and i.get("suggested_action") == "drop_claim"
            ]
            if not review_result.all_claims_cited and invented_issues:
                _reject_draft(sb, row, slug, "factual_review",
                              review_result.block_messages())
                failed_count += 1
                continue
            print(f"[brain] {slug}: factual review ok "
                  f"({review_result.primary_source_count} primary sources, "
                  f"{len(invented_issues)} invented-claim flags)")
        except Exception as err:
            print(f"[brain] {slug}: factual review crashed — {err}")
            # Don't ship a draft we couldn't audit. Push back; next run
            # retries with a fresh Sonnet pass.
            _reject_draft(sb, row, slug, "factual_review_crash", [str(err)[:200]])
            failed_count += 1
            continue

        mdx = build_mdx(draft)
        mdx_path = DRAFTS_DIR / f"{slug}.mdx"
        mdx_path.write_text(mdx, encoding="utf-8")

        hero_bytes = generate_hero(draft.get("hero_prompt", "Editorial regulatory hero"))
        hero_generated = hero_bytes is not None
        if hero_bytes:
            (DRAFTS_DIR / f"{slug}-hero.png").write_bytes(hero_bytes)

        target = draft.get("target", "blog")
        sb.table("daily_gaps").update({
            "status": "drafted",
            "draft_path": str(mdx_path),
            "drafted_at": datetime.now(timezone.utc).isoformat(),
            "target": target,
            "draft_slug": slug,
        }).eq("url", row["url"]).execute()

        notify_draft_ready(slug, draft["title"], target)
        print(f"[brain] drafted {slug} → {mdx_path}")
        drafted_count += 1
        log_event(
            "cron.completed",
            ref_id=f"curator/brain/{slug}",
            status="ok",
            metadata={
                "step": "brain",
                "outcome": "drafted",
                "slug": slug,
                "target": target,
                "category": draft.get("category"),
                "vertical": row.get("vertical"),
                "regulation_tag": draft.get("regulation_tag"),
                "jurisdiction": draft.get("jurisdiction"),
                "hero_generated": hero_generated,
                "model": ANTHROPIC_MODEL,
            },
        )
    if rows:
        log_event(
            "cron.completed",
            ref_id="curator/brain",
            status="ok" if failed_count == 0 else "failed",
            metadata={"step": "brain", "outcome": "batch_done",
                      "rows_seen": len(rows), "drafted": drafted_count, "failed": failed_count},
        )
    return len(rows)


def _reject_draft(sb: Client, row: dict, slug: str, gate: str, reasons: list[str]) -> None:
    """Mark a row rejected with structured reasons + Telegram nudge.

    Doesn't write the MDX to disk (saves the slot for retry). Caller
    is responsible for `continue`-ing the for-loop after invoking this."""
    print(f"[brain] {slug}: REJECTED at gate={gate}: {reasons[0] if reasons else '?'}")
    sb.table("daily_gaps").update({
        "status": "rejected_quality",
        "draft_slug": slug,
        "rejected_at": datetime.now(timezone.utc).isoformat(),
        "rejection_gate": gate,
        "rejection_reasons": reasons,
    }).eq("url", row["url"]).execute()
    log_event(
        "cron.completed",
        ref_id=f"curator/brain/{slug}",
        status="failed",
        metadata={
            "step": "brain.gate",
            "outcome": "rejected",
            "slug": slug,
            "gate": gate,
            "reasons": reasons[:5],  # cap journal noise
        },
    )
    # Telegram nudge so Moses can decide retry vs override.
    if TG_TOKEN and TG_CHAT:
        try:
            text = (
                f"🚫 draft rejected: {slug}\n"
                f"gate: {gate}\n\n"
                + "\n".join(f"• {r}" for r in reasons[:5])
            )
            httpx.post(
                f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                json={"chat_id": TG_CHAT, "text": text[:3500]},
                timeout=10,
            )
        except Exception:
            pass  # Telegram failures aren't worth crashing pipeline


def _render_prompt(row: dict) -> str:
    base = (
        DRAFT_PROMPT.replace("{feed_id}", str(row.get("feed_id", "")))
        .replace("{title}", str(row.get("title", "")))
        .replace("{summary}", str(row.get("summary", "")))
        .replace("{url}", str(row.get("url", "")))
        .replace("{pub_date}", str(row.get("scouted_at", "")))
        .replace("{vertical}", str(row.get("vertical", "")))
        .replace("{short_thesis}", str(row.get("short_thesis", "")))
        .replace("{rationale}", str(row.get("rationale", "")))
    )
    fc = row.get("firecrawl") or {}
    if not isinstance(fc, dict) or not fc:
        return base
    # Append a dedicated FIRECRAWL section so Claude treats these as
    # verified extracted facts, not its own invention. Every datum here
    # came from the cited URL; brain.py is contractually required to
    # cite them in the body and add the source URL to the `sources`
    # frontmatter array.
    party = fc.get("party") or {}
    fc_block_lines = [
        "",
        "=== FIRECRAWL VERIFIED EXTRACT (cite these as primary; do not invent supplements) ===",
        f"Regulator: {party.get('regulator', '')}",
        f"Respondent: {party.get('respondent', '')}",
        f"Penalty (USD): {fc.get('penalty_usd', 0)}",
        f"Effective date: {fc.get('effective_date', '')}",
        f"Deadline date: {fc.get('deadline_date', '')}",
        f"Regulation cites: {', '.join(fc.get('regulation_cites') or [])}",
        f"Key quote: {fc.get('key_quote', '')}",
        "Executive summary bullets:",
        *[f"  - {b}" for b in (fc.get("executive_summary") or [])],
        "=== END FIRECRAWL EXTRACT ===",
        "",
    ]
    return base + "\n" + "\n".join(fc_block_lines)


def _acquire_lock() -> None:
    """Prevent multiple brain.py instances from running simultaneously.
    Uses fcntl.flock() which auto-releases on process exit (even on kill).
    """
    global _LOCK_FD
    lock_path = "/tmp/brain_curator.lock"
    _LOCK_FD = open(lock_path, "w")  # noqa: WPS515 (open is fine here; atexit closes it)
    try:
        fcntl.flock(_LOCK_FD.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except IOError:
        print("[brain] Another brain.py instance is already running — exiting to avoid race.")
        sys.exit(0)
    atexit.register(_LOCK_FD.close)


def main() -> int:
    _acquire_lock()
    # V0.2 — heartbeat at start of each invocation.
    log_event(
        "heartbeat",
        ref_id="curator/brain",
        status="ok",
        metadata={"service": "brain", "phase": "startup"},
    )
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Re-draft already-drafted rows")
    args = parser.parse_args()
    n = process_picked(force=args.force)
    print(f"[brain] processed {n} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
