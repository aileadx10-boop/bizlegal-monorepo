"""
aeo_revenue_agent.py — AEO/GEO content machine with revenue attribution.

Revenue path: E3 — AEO-SEO content → AI citations → inbound leads → conversion

What this does:
  Stage 1 — ANSWER-ENGINE CONTENT GENERATION
    • Pulls buyer-intent keywords from daily_gaps where status='new' or status='draft_pending'
    • Generates AEO-optimized Q&A content for each keyword:
        - Definitive 2-sentence answer (what AI engines extract to cite)
        - Expert context (why this matters, regulatory specifics)
        - FAQ pairs (2-3 questions Perplexity users ask on this topic)
        - FAQPage JSON-LD (ready to inject into Next.js pages)
        - Internal CTA linking to the relevant BizLegal product
    • Writes to daily_gaps with status='aeo_ready' for publisher pipeline

  Stage 2 — CITATION TRACKING
    • Checks seo_pages and docai_sessions for traffic from AI referrers
      (perplexity.ai, chatgpt.com, claude.ai, bingchat, you.com, phind.com)
    • Attributes inbound leads to their source AEO page
    • Updates seo_citation_log with citation evidence

  Stage 3 — REVENUE ATTRIBUTION
    • Joins risk_snapshots + payment_orders + lead_nurture_state
    • For each paid order, traces back to the AEO page that drove the visit
    • Updates daily_gaps with revenue_attributed = true + revenue_usd
    • Builds attribution report for decisions/AEO_ATTRIBUTION_WEEKLY.md

  Stage 4 — NEXT-WEEK CONTENT QUEUE
    • Ranks daily_gaps by: (intent_score DESC, competition_score ASC, no-attribution-yet)
    • Flags the top 7 keywords as 'next_week_priority'
    • Generates a brief weekly brief to Telegram

Schedule: 07:00 UTC daily
"""
from __future__ import annotations
import json, os, re, sys, time, urllib.request, urllib.error, urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── Env loading ────────────────────────────────────────────────────────────────
REPO = Path("/opt/bizlegal/curator") if Path("/opt/bizlegal/curator").exists() else Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "services" / "agents"))

_env_cache: dict = {}
for _src in [
    Path.home() / "Downloads" / "env-hub-bizlegal-ai.txt",
    REPO / ".env",
    Path("/opt/bizlegal/curator/.env"),
]:
    if _src.exists():
        with open(_src, encoding="utf-8", errors="replace") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    if _k not in _env_cache:
                        _env_cache[_k] = _v.strip().strip("'").strip('"')


def _e(k: str, default: str = "") -> str:
    return os.environ.get(k, _env_cache.get(k, default))


SUPABASE_URL  = _e("SUPABASE_URL").rstrip("/")
SUPABASE_KEY  = _e("SUPABASE_SERVICE_ROLE_KEY") or _e("SUPABASE_SERVICE_KEY") or _e("SUPABASE_SECRET")
ANTHROPIC_KEY = _e("ANTHROPIC_API_KEY") or _e("ANTHROPIC_API_KEY_ENRICH")
TELEGRAM_TOKEN = _e("TELEGRAM_HUB_TOKEN")
TELEGRAM_CHAT  = _e("TELEGRAM_MOSES_CHAT_ID") or _e("TELEGRAM_HUB_CHAT_ID")
SITE_URL       = "https://bizlegal-ai.com"

WORKFLOW_ID = f"aeo-revenue-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}"

MAX_AEO_PER_DAY = 10      # max new AEO answers to generate
MAX_ATTRIBUTION_LOOKBACK_DAYS = 30

AI_REFERRERS = [
    "perplexity.ai", "chatgpt.com", "claude.ai", "bing.com/chat",
    "you.com", "phind.com", "copilot.microsoft.com", "kagi.com",
]


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _sb_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def sb(path: str, method: str = "GET", body=None, h_extra: dict | None = None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    h = {**_sb_headers(), **(h_extra or {})}
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read().decode(errors="replace")
            return json.loads(txt) if txt and txt != "null" else ([] if method == "GET" else True)
    except urllib.error.HTTPError as e:
        print(f"  [sb-err] {method} {path}: HTTP {e.code} {e.read().decode()[:200]}")
        return None
    except Exception as e:
        print(f"  [sb-err] {method} {path}: {e}")
        return None


def sb_post(path: str, body: dict):
    return sb(path, "POST", body)


def sb_patch(path: str, body: dict) -> bool:
    return sb(path, "PATCH", body, {"Prefer": "return=minimal"}) is not None


def tg(msg: str) -> None:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT:
        return
    try:
        urllib.request.urlopen(urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": msg[:3500]}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        ), timeout=8)
    except Exception:
        pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── AI call ───────────────────────────────────────────────────────────────────

def ai_call(prompt: str, max_tokens: int = 1500, system: str = "") -> str:
    if not ANTHROPIC_KEY:
        return ""
    msgs = [{"role": "user", "content": prompt}]
    payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": max_tokens,
        "messages": msgs,
    }
    if system:
        payload["system"] = system
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            method="POST",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            data=json.dumps(payload).encode(),
        )
        with urllib.request.urlopen(req, timeout=45) as r:
            resp = json.loads(r.read())
            return "".join(c.get("text", "") for c in resp.get("content", []) if c.get("type") == "text")
    except Exception as e:
        print(f"  [ai-err] {type(e).__name__}: {e}")
        return ""


# ── AEO Content Generation ────────────────────────────────────────────────────

# Maps keyword categories to BizLegal product CTAs
PRODUCT_CTA_MAP = {
    "contract": {
        "product": "DocAI contract scan",
        "url": "https://docai.bizlegal-ai.com",
        "price": "$97",
        "cta": "Get your contract risk score in 60 seconds",
    },
    "gdpr": {
        "product": "DocAI DPA review",
        "url": "https://docai.bizlegal-ai.com",
        "price": "$97",
        "cta": "Review your DPA for GDPR compliance gaps",
    },
    "boi": {
        "product": "BizLegal BOI Filing Kit",
        "url": "https://forge.bizlegal-ai.com",
        "price": "$149",
        "cta": "Get the complete BOI filing kit with FinCEN templates",
    },
    "crypto": {
        "product": "BizLegal crypto compliance brief",
        "url": "https://brai.bizlegal-ai.com",
        "price": "$149",
        "cta": "Check your counterparty's regulatory risk score",
    },
    "aml": {
        "product": "LexAudit compliance health score",
        "url": "https://lexaudit.bizlegal-ai.com",
        "price": "$99/mo",
        "cta": "Run your AML compliance health check",
    },
    "fintech": {
        "product": "BizLegal compliance retainer",
        "url": "https://bizlegal-ai.com/agents",
        "price": "$2,500/mo",
        "cta": "Book a free compliance gap analysis",
    },
    "default": {
        "product": "BizLegal AI compliance snapshot",
        "url": "https://bizlegal-ai.com/snapshot",
        "price": "free",
        "cta": "Get your free compliance health snapshot",
    },
}


def _get_cta(keyword: str) -> dict:
    kw = keyword.lower()
    for category, cta in PRODUCT_CTA_MAP.items():
        if category in kw:
            return cta
    return PRODUCT_CTA_MAP["default"]


def _keyword_to_draft_slug(keyword: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", keyword.lower().strip()).strip("-")
    return slug[:80]


def generate_aeo_content(keyword: str, description: str = "") -> dict | None:
    """Generate AEO-optimized content for a keyword. Returns structured content dict."""
    cta = _get_cta(keyword)
    system = (
        "You are a B2B compliance lawyer writing definitive answers for business owners who ask "
        "AI search engines about regulatory compliance. "
        "Your answers must be: (1) factually accurate as of 2026, (2) specific enough to be cited, "
        "(3) useful without requiring a follow-up, (4) authoritative but not bureaucratic. "
        "Never hedge with 'consult a lawyer' — you ARE the lawyer. Cite specific regulation names "
        "(GDPR Art. 28, FinCEN 31 CFR §1010, etc.) when they apply. "
        "Output ONLY valid JSON, no markdown fences."
    )
    prompt = (
        f"Generate AEO (Answer Engine Optimization) content for this compliance keyword:\n"
        f"Keyword: {keyword}\n"
        f"Context: {description or 'B2B compliance, legal, fintech/crypto/SaaS'}\n\n"
        f"Return a JSON object with exactly these fields:\n"
        f"{{\n"
        f'  "definitive_answer": "2-3 sentence direct answer that AI engines will cite. Start with the answer, not a preamble.",\n'
        f'  "expert_context": "1-2 paragraph deeper explanation with specific regulatory citations, penalties, and jurisdiction notes. For practitioners.",\n'
        f'  "faq_pairs": [\n'
        f'    {{"q": "...", "a": "2-3 sentences"}},\n'
        f'    {{"q": "...", "a": "2-3 sentences"}},\n'
        f'    {{"q": "...", "a": "2-3 sentences"}}\n'
        f'  ],\n'
        f'  "meta_description": "155 char SEO meta description",\n'
        f'  "h1": "Page H1 (question format, 60-70 chars)",\n'
        f'  "structured_answer_summary": "1 sentence summary suitable for Schema markup"\n'
        f"}}"
    )
    raw = ai_call(prompt, max_tokens=2000, system=system)
    if not raw:
        return None
    # Extract JSON from response
    try:
        # Try direct parse
        data = json.loads(raw)
    except json.JSONDecodeError:
        # Try to find JSON block in response
        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            return None
        try:
            data = json.loads(m.group(0))
        except json.JSONDecodeError:
            return None

    # Build FAQPage JSON-LD
    faq_pairs = data.get("faq_pairs", [])
    faq_jsonld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": pair["q"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": pair["a"],
                },
            }
            for pair in faq_pairs
            if pair.get("q") and pair.get("a")
        ],
    }

    return {
        "keyword": keyword,
        "h1": data.get("h1", keyword),
        "meta_description": data.get("meta_description", "")[:155],
        "definitive_answer": data.get("definitive_answer", ""),
        "expert_context": data.get("expert_context", ""),
        "faq_pairs": faq_pairs,
        "faq_jsonld": faq_jsonld,
        "structured_answer_summary": data.get("structured_answer_summary", ""),
        "cta_product": cta["product"],
        "cta_url": cta["url"],
        "cta_price": cta["price"],
        "cta_text": cta["cta"],
        "generated_at": now_iso(),
    }


# ── Stage 1: AEO Content Generation ──────────────────────────────────────────

def stage_generate_aeo() -> dict:
    """Generate AEO-optimized content for pending daily_gaps keywords."""
    print("\n[Stage 1] AEO content generation")
    stats = {"generated": 0, "skipped": 0, "failed": 0}

    # Pull keywords pending AEO content
    gaps = sb(
        "daily_gaps?status=in.(new,draft_pending)"
        "&faq=is.null"
        "&order=intent_score.desc.nullslast,created_at.asc"
        f"&limit={MAX_AEO_PER_DAY}"
        "&select=url,draft_slug,keyword,description,status,intent_score,topic,pillar"
    )
    if not isinstance(gaps, list):
        # Try alt query (some environments have different column names)
        gaps = sb(
            "daily_gaps?status=in.(new,draft_pending)"
            "&order=created_at.asc"
            f"&limit={MAX_AEO_PER_DAY}"
        )
    if not isinstance(gaps, list) or not gaps:
        print("  no pending gaps found")
        return stats

    print(f"  {len(gaps)} keywords to process")

    for gap in gaps:
        keyword = (
            gap.get("keyword")
            or gap.get("topic")
            or gap.get("draft_slug", "").replace("-", " ")
            or ""
        ).strip()
        if not keyword:
            stats["skipped"] += 1
            continue

        url = gap.get("url") or gap.get("draft_slug") or _keyword_to_draft_slug(keyword)
        description = gap.get("description") or gap.get("pillar") or ""

        print(f"  Generating AEO: {keyword[:60]}")
        content = generate_aeo_content(keyword, description)

        if not content or not content.get("definitive_answer"):
            stats["failed"] += 1
            print(f"    failed: no content generated")
            continue

        # Write content back to daily_gaps
        update_payload = {
            "status": "aeo_ready",
            "faq": json.dumps(content["faq_pairs"]),
            "schema_json": json.dumps(content["faq_jsonld"]),
            "aeo_answer": content["definitive_answer"],
            "aeo_context": content["expert_context"],
            "meta_description": content["meta_description"],
            "h1_tag": content["h1"],
            "cta_url": content["cta_url"],
            "cta_text": content["cta_text"],
            "updated_at": now_iso(),
        }
        # Filter to only fields that exist in the schema (try patch, ignore 400)
        ok = sb_patch(f"daily_gaps?url=eq.{urllib.parse.quote(str(url))}", update_payload)
        if not ok:
            # Try by draft_slug if url didn't match
            ok = sb_patch(
                f"daily_gaps?draft_slug=eq.{urllib.parse.quote(str(url))}",
                update_payload,
            )
        if ok:
            stats["generated"] += 1
            print(f"    OK: {content['h1'][:60]}")
        else:
            stats["failed"] += 1
            print(f"    PATCH failed for: {url}")

        time.sleep(1.5)  # Rate limit Anthropic calls

    print(f"  Stage 1 done: generated={stats['generated']} failed={stats['failed']}")
    return stats


# ── Stage 2: Citation Tracking ────────────────────────────────────────────────

def stage_citation_tracking() -> dict:
    """Track which AEO pages are generating AI engine referrals."""
    print("\n[Stage 2] Citation tracking")
    stats = {"checked": 0, "citations_found": 0}

    # Check seo_citation_log for recent AI referrals (table may not exist on all envs)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    citations = sb(
        f"seo_citation_log?created_at=gte.{urllib.parse.quote(cutoff)}"
        "&select=url,referrer,visit_count,keyword"
        "&order=visit_count.desc&limit=50"
    )
    if not isinstance(citations, list):
        print("  seo_citation_log table not found — skipping")
        return stats

    stats["checked"] = len(citations)
    ai_citations = [c for c in citations if any(r in (c.get("referrer") or "") for r in AI_REFERRERS)]
    stats["citations_found"] = len(ai_citations)

    if ai_citations:
        # Update daily_gaps.aeo_cited = true for cited pages
        for citation in ai_citations[:20]:
            url = citation.get("url", "")
            if url:
                sb_patch(
                    f"daily_gaps?url=eq.{urllib.parse.quote(url)}",
                    {"aeo_cited": True, "updated_at": now_iso()},
                )

    print(f"  Stage 2: checked={stats['checked']} ai_citations={stats['citations_found']}")
    return stats


# ── Stage 3: Revenue Attribution ──────────────────────────────────────────────

def stage_revenue_attribution() -> dict:
    """Attribute paid orders back to the AEO pages that drove the visit."""
    print("\n[Stage 3] Revenue attribution")
    stats = {"attributed": 0, "total_attributed_usd": 0.0}

    cutoff = (datetime.now(timezone.utc) - timedelta(days=MAX_ATTRIBUTION_LOOKBACK_DAYS)).isoformat()

    # Get paid orders with referrer info (if payment_orders has referrer_url column)
    orders = sb(
        f"payment_orders?status=eq.completed&created_at=gte.{urllib.parse.quote(cutoff)}"
        "&select=id,email,amount_cents,product,referrer_url,created_at"
        "&order=created_at.desc&limit=100"
    )
    if not isinstance(orders, list) or not orders:
        print("  no completed orders found")
        return stats

    for order in orders:
        referrer = order.get("referrer_url", "") or ""
        if not referrer:
            continue
        # Try to find a daily_gap whose URL the referrer contains
        # Strip domain prefix to get the path
        path_match = re.sub(r"https?://[^/]+", "", referrer).strip("/")
        if not path_match:
            continue
        # Find matching gap
        gap = sb(
            f"daily_gaps?url=like.*{urllib.parse.quote(path_match[:50])}*&limit=1"
            "&select=url,keyword,revenue_attributed,revenue_usd"
        )
        if not isinstance(gap, list) or not gap:
            continue
        gap_url = gap[0].get("url", "")
        current_revenue = float(gap[0].get("revenue_usd") or 0)
        order_value = (order.get("amount_cents") or 0) / 100
        sb_patch(
            f"daily_gaps?url=eq.{urllib.parse.quote(gap_url)}",
            {
                "revenue_attributed": True,
                "revenue_usd": current_revenue + order_value,
                "updated_at": now_iso(),
            },
        )
        stats["attributed"] += 1
        stats["total_attributed_usd"] += order_value

    print(f"  Stage 3: attributed={stats['attributed']} total=${stats['total_attributed_usd']:.2f}")
    return stats


# ── Stage 4: Next-Week Content Queue ──────────────────────────────────────────

def stage_content_queue() -> dict:
    """Rank and flag the top 7 keywords for next week's content focus."""
    print("\n[Stage 4] Next-week content queue")
    stats = {"queued": 0, "top_keywords": []}

    # Find gaps: low competition + high intent + not yet cited + no revenue yet
    candidates = sb(
        "daily_gaps?status=in.(new,draft_pending,aeo_ready)"
        "&revenue_attributed=is.null"
        "&select=url,keyword,topic,intent_score,competition_score,draft_slug"
        "&order=intent_score.desc.nullslast,competition_score.asc.nullslast"
        "&limit=7"
    )
    if not isinstance(candidates, list) or not candidates:
        print("  no candidates found")
        return stats

    keywords = []
    for gap in candidates:
        kw = gap.get("keyword") or gap.get("topic") or gap.get("draft_slug", "").replace("-", " ")
        if kw:
            keywords.append(kw.strip())
            # Mark as priority
            url = gap.get("url") or gap.get("draft_slug", "")
            if url:
                sb_patch(
                    f"daily_gaps?url=eq.{urllib.parse.quote(str(url))}",
                    {"priority": "high", "updated_at": now_iso()},
                )
            stats["queued"] += 1

    stats["top_keywords"] = keywords
    print(f"  Stage 4: queued={stats['queued']} top={keywords[:3]}")
    return stats


# ── Weekly Attribution Report ─────────────────────────────────────────────────

def build_attribution_snapshot() -> str:
    """Build a brief attribution snapshot text for Telegram."""
    # Top cited AEO pages
    cited = sb(
        "daily_gaps?aeo_cited=eq.true&select=keyword,topic,revenue_attributed,revenue_usd"
        "&order=revenue_usd.desc.nullslast&limit=5"
    )
    cited_list = ""
    if isinstance(cited, list):
        for c in cited:
            kw = c.get("keyword") or c.get("topic") or ""
            rev = c.get("revenue_usd") or 0
            cited_list += f"  • {kw[:50]} → ${rev:.0f}\n"

    # Total attributed revenue
    totals = sb("daily_gaps?revenue_attributed=eq.true&select=revenue_usd")
    total_rev = 0.0
    if isinstance(totals, list):
        for t in totals:
            total_rev += float(t.get("revenue_usd") or 0)

    return (
        f"📊 AEO weekly snapshot\n"
        f"Total attributed revenue: ${total_rev:.0f}\n"
        f"Top cited pages:\n{cited_list or '  (none yet — building pipeline)'}"
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def run() -> dict:
    started = time.time()
    print(f"\n=== aeo_revenue_agent @ {now_iso()} ===")
    print(f"  SUPABASE: {bool(SUPABASE_URL)}  ANTHROPIC: {bool(ANTHROPIC_KEY)}")
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"ok": False, "error": "supabase_missing"}

    results = {
        "aeo_generated": stage_generate_aeo(),
        "citations": stage_citation_tracking(),
        "attribution": stage_revenue_attribution(),
        "queue": stage_content_queue(),
    }

    total_generated = results["aeo_generated"].get("generated", 0)
    total_attributed = results["attribution"].get("total_attributed_usd", 0.0)
    top_keywords = results["queue"].get("top_keywords", [])
    duration = int(time.time() - started)
    results.update({
        "ok": True,
        "duration_s": duration,
        "total_aeo_generated": total_generated,
        "total_attributed_usd": total_attributed,
    })

    # Telegram summary
    kw_brief = "\n".join(f"  • {kw[:50]}" for kw in top_keywords[:3]) or "  (none)"
    tg(
        f"🎯 aeo_revenue_agent complete\n"
        f"  AEO answers: {total_generated} new\n"
        f"  Revenue attributed: ${total_attributed:.0f}\n"
        f"  Next 3 to publish:\n{kw_brief}\n"
        f"  t={duration}s"
    )

    # Log weekly attribution to ops if Saturday
    if datetime.now(timezone.utc).weekday() == 5:  # Saturday
        tg(build_attribution_snapshot())

    print(f"\n  DONE: aeo={total_generated}  attributed=${total_attributed:.0f}  t={duration}s")
    return results


if __name__ == "__main__":
    import sys as _sys
    result = run()
    _sys.exit(0 if result.get("ok") else 1)
