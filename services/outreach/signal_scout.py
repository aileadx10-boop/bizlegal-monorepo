#!/usr/bin/env python3
"""
signal_scout.py
===============
24/7 REVENUE LOOP — buying-signal monitor (writes leads, NEVER emails).

Three free signal monitors, run sequentially, each isolated in try/except
so one failure never kills the run:

  1. HIRING  — Firecrawl search over public job boards (Greenhouse/Lever
               public boards + open-web search) for compliance-shaped roles
               at small companies. Angle: "hiring for {role} — our agent
               does ~70% of that workload".
  2. FUNDING — Firecrawl scrape of TechCrunch + Finsmes fintech/crypto
               funding pages. Angle: "new funding = new compliance surface"
               → pitch BRAI / LexAudit.
  3. PAIN    — Reddit public search JSON API (no key, proper User-Agent,
               rate-limited) over r/smallbusiness, r/fintech, r/compliance
               for compliance pain phrases. These are NEVER emailed or
               DM'd — persisted with status='pain_signal' for
               reddit_outreach.py consent-based drafting only (gates per
               decisions/LOW_RISK_DOCAI_FUNNEL.md unchanged).

Each lead is qualified with the same Anthropic scoring approach headhunter
uses (only score >= 70 persists), deduped against existing leadforge_leads
by email AND domain, and inserted with source='signal:hiring' |
'signal:funding' | 'signal:pain'.

Leads without a discovered contact email get a non-mailable placeholder
address (…@no-email.invalid) and status='signal_no_email' /
'pain_signal' — cold_email_sender.py only picks status in (new, qualified),
so nothing un-consented can ever be emailed.

This script sends NOTHING. --dry-run additionally skips Supabase writes.

Usage:
  python3 signal_scout.py                       # all monitors, cap 25 leads
  python3 signal_scout.py --monitor hiring
  python3 signal_scout.py --dry-run --max-leads 10
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# Reuse headhunter's helper patterns (same dir on the Hetzner box)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from headhunter import (  # noqa: E402
    extract_emails,
    firecrawl_scrape,
    insert_lead,
    load_vault,
    supabase_request,
)

# ops-heartbeat is optional — a missing import must never crash the run
try:
    from ops_heartbeat import ping_once as _hb_ping
except ImportError:
    try:
        sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2]
                               / "packages" / "ops-heartbeat" / "python"))
        from ops_heartbeat import ping_once as _hb_ping
    except Exception:
        _hb_ping = None

# Telegram — same pattern as cold_email_sender.py
TG_BOT = os.getenv("TELEGRAM_" + "CURATOR_BOT_TOKEN", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")

REDDIT_UA = "bizlegal-signal-scout/1.0 (compliance research; contact: team@bizlegal-ai.com)"

# ---------------------------------------------------------------------------
# Monitor configs
# ---------------------------------------------------------------------------

HIRING_QUERIES = [
    'site:boards.greenhouse.io "compliance officer"',
    'site:boards.greenhouse.io "compliance manager"',
    'site:jobs.lever.co "compliance officer"',
    'site:jobs.lever.co "AML analyst"',
    'startup hiring "compliance manager" OR "paralegal"',
]

HIRING_ROLES = [
    "compliance officer", "aml analyst", "compliance manager",
    "compliance analyst", "paralegal",
]

FUNDING_SOURCES = [
    "https://techcrunch.com/category/fintech/",
    "https://techcrunch.com/category/crypto/",
    "https://www.finsmes.com/category/fintech",
]

PAIN_QUERIES = [
    '"compliance nightmare"',
    '"SOC 2 questionnaire"',
    '"BOI filing"',
    '"MiCA license"',
]

PAIN_SUBREDDITS = "smallbusiness+fintech+compliance"

MAX_HOMEPAGE_SCRAPES = 5  # per monitor — email discovery is best-effort


# ---------------------------------------------------------------------------
# Shared helpers (Firecrawl search / Anthropic JSON / dedupe / telegram)
# ---------------------------------------------------------------------------

def firecrawl_search(query: str, api_key: str, limit: int = 6) -> list[dict]:
    """Search via Firecrawl /v1/search. Returns [{url, title, description}]."""
    body = json.dumps({"query": query, "limit": limit}).encode()
    req = urllib.request.Request(
        "https://api.firecrawl.dev/v1/search",
        data=body, method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = json.loads(r.read())
        return data.get("data") or data.get("results") or []
    except urllib.error.HTTPError as e:
        print(f"    [firecrawl-search] HTTP {e.code} for {query[:60]!r}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"    [firecrawl-search] {e!s:.80} for {query[:60]!r}", file=sys.stderr)
        return []


def anthropic_json(prompt: str, api_key: str, max_tokens: int = 600):
    """Single Anthropic call expecting a JSON-only response. None on failure."""
    try:
        body = json.dumps({
            "model": "claude-sonnet-4-5",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body, method="POST",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
        text = data["content"][0]["text"].strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.M)
        return json.loads(text)
    except Exception as e:
        print(f"    [anthropic] {e!s:.80}", file=sys.stderr)
        return None


def get_existing_lead_keys(env: dict) -> tuple[set[str], set[str]]:
    """Existing leadforge_leads emails + domains for dedupe."""
    emails: set[str] = set()
    domains: set[str] = set()
    status, rows = supabase_request("leadforge_leads?select=email&limit=2000", env=env)
    if status == 200 and isinstance(rows, list):
        for r in rows:
            e = (r.get("email") or "").lower()
            if not e:
                continue
            emails.add(e)
            domain = e.partition("@")[2]
            if domain and not domain.endswith(".invalid"):
                domains.add(domain)
    return emails, domains


def discover_email(domain: str, firecrawl_key: str) -> str:
    """Best-effort: scrape the company homepage, return first plausible email."""
    if not (domain and firecrawl_key):
        return ""
    data = firecrawl_scrape(f"https://{domain}", firecrawl_key)
    if not data:
        return ""
    found = extract_emails(data.get("markdown", ""))
    # Prefer emails on the same domain
    same = [e for e in found if e.endswith("@" + domain)]
    return (same or found or [""])[0]


def persist_signal_lead(lead: dict, env: dict, existing_emails: set[str],
                        existing_domains: set[str], dry_run: bool) -> bool:
    """Dedupe by email + domain, then insert into leadforge_leads."""
    email = lead["email"].lower()
    domain = email.partition("@")[2]
    real_domain = (lead.get("enriched_data", {}).get("domain") or "").lower()
    if email in existing_emails:
        print(f"    skip (email already in DB): {email[:40]}")
        return False
    for d in (domain, real_domain):
        if d and not d.endswith(".invalid") and d in existing_domains:
            print(f"    skip (domain already in DB): {d}")
            return False
    if dry_run:
        print(f"    [dry-run] would insert {lead['source']:15s} {email[:40]:40s} score={lead['score']}")
        return True
    if insert_lead(lead, env):
        existing_emails.add(email)
        for d in (domain, real_domain):
            if d and not d.endswith(".invalid"):
                existing_domains.add(d)
        print(f"    [insert] {lead['source']:15s} {email[:40]:40s} score={lead['score']}")
        return True
    return False


def telegram_send(text: str) -> bool:
    if not (TG_BOT and TELEGRAM_CHAT):
        return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TG_BOT}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text,
                              "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            method="POST", headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def log_agent_run(env: dict, action: str, status: str, details: dict) -> None:
    """Append a row to agent_runs for observability."""
    body = {
        "agent_name": "signal_scout",
        "action": action,
        "status": status,
        "details": details,
        "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
    }
    supabase_request("agent_runs", method="POST", body=body, env=env)


# ---------------------------------------------------------------------------
# Monitor 1 — HIRING (Greenhouse/Lever public boards via Firecrawl search)
# ---------------------------------------------------------------------------

def hiring_signal(env: dict, firecrawl_key: str, anthropic_key: str,
                  existing_emails: set[str], existing_domains: set[str],
                  budget: dict, score_min: int, dry_run: bool) -> int:
    print("\n[hiring] searching public job boards for compliance roles")
    inserted = 0
    scrapes = 0
    seen_slugs: set[str] = set()

    for q in HIRING_QUERIES:
        if budget["remaining"] <= 0:
            break
        print(f"  [search] {q[:70]}")
        for hit in firecrawl_search(q, firecrawl_key, limit=6):
            if budget["remaining"] <= 0:
                break
            url = hit.get("url", "")
            title = (hit.get("title") or "") + " " + (hit.get("description") or "")
            role = next((r for r in HIRING_ROLES if r in title.lower()), "")
            if not role:
                continue
            m = (re.search(r"boards\.greenhouse\.io/([a-z0-9_-]+)", url, re.I)
                 or re.search(r"jobs\.lever\.co/([a-z0-9_-]+)", url, re.I))
            slug = (m.group(1).lower() if m else
                    urllib.parse.urlparse(url).netloc.replace("www.", ""))
            if not slug or slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            qual = anthropic_json(f"""You are qualifying a HIRING SIGNAL for BizLegal AI, a B2B compliance SaaS.

SIGNAL:
  Job title match: {role}
  Listing title/snippet: {title[:300]}
  Listing URL: {url}
  Company slug: {slug}

A company hiring a {role} is a strong buyer signal: our compliance agent
does ~70% of that role's workload. Score high only for real, small-to-mid
companies (not staffing agencies, not job aggregators, not Fortune 500).

SCORING CRITERIA (be strict):
  100 = Perfect: real small company, clear compliance hire, fintech/crypto/saas/legal
   80 = Strong: real company, role matches
   60 = Possible: unclear company or industry
   20 = Junk: aggregator, staffing agency, or huge enterprise
    0 = Invalid

Respond ONLY in JSON, no prose, no markdown fence:
{{
  "score": <int 0-100>,
  "company": "<company name>",
  "domain": "<company website domain like acme.com, or empty if unknown>",
  "industry": "<one of: crypto, fintech, law, saas, consulting, other>",
  "company_size_estimate": "<1-10 | 11-50 | 51-200 | 201-1000 | 1000+ | unknown>",
  "reasons": ["<one-line reason>"]
}}
""", anthropic_key)
            if not qual:
                continue
            score = int(qual.get("score", 0))
            company = qual.get("company", slug)
            domain = (qual.get("domain") or "").lower().strip("/")
            print(f"    {company[:30]:30s} role={role:20s} score={score}")
            if score < score_min:
                continue

            email = ""
            if domain and scrapes < MAX_HOMEPAGE_SCRAPES and not dry_run:
                scrapes += 1
                email = discover_email(domain, firecrawl_key)

            lead = {
                "email": email or f"signal+{slug}@no-email.invalid",
                "company_name": company,
                "industry": qual.get("industry", "other"),
                "source": "signal:hiring",
                "score": score,
                "status": "qualified" if email else "signal_no_email",
                "enriched_data": {
                    "signal": "hiring",
                    "role": role,
                    "job_url": url,
                    "domain": domain,
                    "angle": f"hiring for {role} — our agent does ~70% of that workload",
                    "company_size_estimate": qual.get("company_size_estimate", "unknown"),
                    "reasons": qual.get("reasons", []),
                    "qualification": qual,
                },
            }
            if persist_signal_lead(lead, env, existing_emails, existing_domains, dry_run):
                inserted += 1
                budget["remaining"] -= 1
    print(f"[hiring] {inserted} leads persisted")
    return inserted


# ---------------------------------------------------------------------------
# Monitor 2 — FUNDING (TechCrunch + Finsmes fintech/crypto pages)
# ---------------------------------------------------------------------------

def funding_signal(env: dict, firecrawl_key: str, anthropic_key: str,
                   existing_emails: set[str], existing_domains: set[str],
                   budget: dict, score_min: int, dry_run: bool) -> int:
    print("\n[funding] scraping funding-news pages")
    inserted = 0
    scrapes = 0

    for src in FUNDING_SOURCES:
        if budget["remaining"] <= 0:
            break
        print(f"  [scrape] {src}")
        data = firecrawl_scrape(src, firecrawl_key)
        if not data or not data.get("markdown"):
            print("    FAILED / empty")
            continue
        md = data["markdown"][:12000]

        events = anthropic_json(f"""From this markdown of a funding-news page, extract recent FUNDING EVENTS
for fintech / crypto / regtech companies only. For each, score 0-100 as a
prospect for BizLegal AI (B2B compliance SaaS — BRAI regulatory risk +
LexAudit compliance monitoring). New funding = new compliance surface
(licensing, AML programs, SOC 2, investor diligence), so freshly funded
Seed/Series-A/B companies score high; public giants and non-fintech score low.

PAGE MARKDOWN:
{md}

Respond ONLY with a JSON array (max 8 items), no prose, no markdown fence:
[
  {{
    "company": "<name>",
    "domain": "<company website domain like acme.com, or empty if unknown>",
    "round": "<Seed | Series A | Series B | ... | unknown>",
    "amount": "<e.g. $12M, or unknown>",
    "industry": "<one of: crypto, fintech, saas, other>",
    "score": <int 0-100>,
    "reasons": ["<one-line reason>"]
  }}
]
""", anthropic_key, max_tokens=1200)
        if not isinstance(events, list):
            continue

        for ev in events:
            if budget["remaining"] <= 0:
                break
            if not isinstance(ev, dict):
                continue
            score = int(ev.get("score", 0))
            company = (ev.get("company") or "").strip()
            domain = (ev.get("domain") or "").lower().strip("/")
            round_ = ev.get("round", "unknown")
            if not company:
                continue
            print(f"    {company[:30]:30s} round={round_:10s} score={score}")
            if score < score_min:
                continue

            email = ""
            if domain and scrapes < MAX_HOMEPAGE_SCRAPES and not dry_run:
                scrapes += 1
                email = discover_email(domain, firecrawl_key)

            slug = re.sub(r"[^a-z0-9]+", "-", company.lower()).strip("-") or "unknown"
            lead = {
                "email": email or f"signal+{slug}@no-email.invalid",
                "company_name": company,
                "industry": ev.get("industry", "fintech"),
                "source": "signal:funding",
                "score": score,
                "status": "qualified" if email else "signal_no_email",
                "enriched_data": {
                    "signal": "funding",
                    "round": round_,
                    "amount": ev.get("amount", "unknown"),
                    "domain": domain,
                    "source_url": src,
                    "angle": f"new funding ({round_}) = new compliance surface — pitch BRAI / LexAudit",
                    "reasons": ev.get("reasons", []),
                },
            }
            if persist_signal_lead(lead, env, existing_emails, existing_domains, dry_run):
                inserted += 1
                budget["remaining"] -= 1
    print(f"[funding] {inserted} leads persisted")
    return inserted


# ---------------------------------------------------------------------------
# Monitor 3 — PAIN (Reddit public search JSON — draft-only, never emailed)
# ---------------------------------------------------------------------------

def reddit_search(query: str) -> list[dict]:
    """Public Reddit search JSON API. No key; proper UA; caller rate-limits."""
    url = (f"https://www.reddit.com/r/{PAIN_SUBREDDITS}/search.json?"
           f"q={urllib.parse.quote(query)}&restrict_sr=on&sort=new&t=month&limit=10")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": REDDIT_UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        children = data.get("data", {}).get("children", [])
        return [c.get("data", {}) for c in children if c.get("kind") == "t3"]
    except urllib.error.HTTPError as e:
        print(f"    [reddit] HTTP {e.code} for {query[:50]!r}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"    [reddit] {e!s:.80} for {query[:50]!r}", file=sys.stderr)
        return []


def pain_signal(env: dict, anthropic_key: str,
                existing_emails: set[str], existing_domains: set[str],
                budget: dict, score_min: int, dry_run: bool) -> int:
    """Reddit pain posts. NEVER emailed / DM'd — persisted with
    status='pain_signal' for reddit_outreach.py consent-based drafting
    only (LOW_RISK_DOCAI_FUNNEL gates unchanged)."""
    print("\n[pain] searching Reddit for compliance pain phrases")
    inserted = 0

    for q in PAIN_QUERIES:
        if budget["remaining"] <= 0:
            break
        print(f"  [search] {q} in r/{PAIN_SUBREDDITS}")
        posts = reddit_search(q)
        time.sleep(2)  # respect Reddit's unauthenticated rate limits
        for post in posts:
            if budget["remaining"] <= 0:
                break
            post_id = post.get("id", "")
            title = post.get("title", "")
            selftext = (post.get("selftext") or "")[:500]
            subreddit = post.get("subreddit", "")
            permalink = post.get("permalink", "")
            if not (post_id and title):
                continue

            qual = anthropic_json(f"""You are scoring a Reddit post as a COMPLIANCE PAIN SIGNAL for BizLegal AI
(B2B compliance SaaS). We do NOT contact the author directly — a human
drafts a public, consent-based, value-first reply. Score how genuine and
actionable the pain is for a potential buyer.

POST:
  Subreddit: r/{subreddit}
  Title: {title[:200]}
  Body (truncated): {selftext}
  Matched phrase: {q}

SCORING CRITERIA (be strict):
  100 = Founder/operator with a live, specific compliance problem we solve
   80 = Real business pain, plausible buyer
   60 = Relevant discussion, unclear buyer
   20 = Meme, rant, student question, or vendor spam
    0 = Off-topic

Respond ONLY in JSON, no prose, no markdown fence:
{{
  "score": <int 0-100>,
  "pain": "<one-line summary of the pain>",
  "industry": "<one of: crypto, fintech, law, saas, consulting, other>",
  "reasons": ["<one-line reason>"]
}}
""", anthropic_key)
            if not qual:
                continue
            score = int(qual.get("score", 0))
            print(f"    r/{subreddit[:16]:16s} {title[:40]:40s} score={score}")
            if score < score_min:
                continue

            lead = {
                "email": f"reddit+{post_id}@no-email.invalid",  # non-mailable by design
                "company_name": f"r/{subreddit} — u/{post.get('author', '?')}",
                "industry": qual.get("industry", "other"),
                "source": "signal:pain",
                "score": score,
                # Not 'new'/'qualified' → cold_email_sender never picks it up.
                "status": "pain_signal",
                "enriched_data": {
                    "signal": "pain",
                    "pain": qual.get("pain", ""),
                    "pain_phrase": q,
                    "subreddit": subreddit,
                    "post_title": title,
                    "permalink": f"https://www.reddit.com{permalink}",
                    "angle": "consent-based public reply only — draft via reddit_outreach.py; "
                             "no DMs, no emails (LOW_RISK_DOCAI_FUNNEL gates unchanged)",
                    "reasons": qual.get("reasons", []),
                },
            }
            if persist_signal_lead(lead, env, existing_emails, existing_domains, dry_run):
                inserted += 1
                budget["remaining"] -= 1
    print(f"[pain] {inserted} signals persisted (draft-only, never emailed)")
    return inserted


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--monitor", default="all",
                    choices=["hiring", "funding", "pain", "all"],
                    help="Which monitor to run (default: all)")
    ap.add_argument("--max-leads", type=int, default=25,
                    help="Cap on total new leads persisted per run (default: 25)")
    ap.add_argument("--score-min", type=int, default=70,
                    help="Minimum qualification score to persist (default: 70)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Score + print but skip Supabase writes "
                         "(this script never emails either way)")
    args = ap.parse_args()

    env = load_vault()
    firecrawl_key = env.get("FIRECRAWL_API_KEY", "")
    anthropic_key = env.get("ANTHROPIC_API_KEY", "")

    if not anthropic_key:
        print("FATAL: ANTHROPIC_API_KEY not in vault")
        return 1
    if not firecrawl_key:
        print("WARN: FIRECRAWL_API_KEY not in vault — hiring/funding monitors will be skipped")

    if _hb_ping:
        try:
            _hb_ping("hetzner/signal-scout", parent="cron:signal_scout",
                     status="alive", last_action="run started")
        except Exception:
            pass

    existing_emails, existing_domains = get_existing_lead_keys(env)
    print(f"[dedupe] {len(existing_emails)} emails / {len(existing_domains)} domains in leadforge_leads")

    budget = {"remaining": args.max_leads}
    counts = {"hiring": 0, "funding": 0, "pain": 0}
    errors: list[str] = []

    if args.monitor in ("hiring", "all") and firecrawl_key:
        try:
            counts["hiring"] = hiring_signal(env, firecrawl_key, anthropic_key,
                                             existing_emails, existing_domains,
                                             budget, args.score_min, args.dry_run)
        except Exception as e:
            errors.append(f"hiring: {e!s:.100}")
            print(f"[hiring] MONITOR FAILED: {e!s:.100}", file=sys.stderr)

    if args.monitor in ("funding", "all") and firecrawl_key:
        try:
            counts["funding"] = funding_signal(env, firecrawl_key, anthropic_key,
                                               existing_emails, existing_domains,
                                               budget, args.score_min, args.dry_run)
        except Exception as e:
            errors.append(f"funding: {e!s:.100}")
            print(f"[funding] MONITOR FAILED: {e!s:.100}", file=sys.stderr)

    if args.monitor in ("pain", "all"):
        try:
            counts["pain"] = pain_signal(env, anthropic_key,
                                         existing_emails, existing_domains,
                                         budget, args.score_min, args.dry_run)
        except Exception as e:
            errors.append(f"pain: {e!s:.100}")
            print(f"[pain] MONITOR FAILED: {e!s:.100}", file=sys.stderr)

    total = sum(counts.values())
    summary = (f"SIGNAL SCOUT COMPLETE — {total} leads "
               f"(hiring={counts['hiring']} funding={counts['funding']} pain={counts['pain']}) "
               f"cap={args.max_leads} dry_run={args.dry_run} errors={len(errors)}")
    print(f"\n{'='*70}\n{summary}\n{'='*70}")

    if not args.dry_run:
        log_agent_run(env, "signal_scan", "success" if not errors else "partial", {
            "monitors": args.monitor,
            "counts": counts,
            "total": total,
            "errors": errors,
        })
        telegram_send(
            f"📡 <b>Signal Scout</b>\n"
            f"Hiring: {counts['hiring']} · Funding: {counts['funding']} · Pain: {counts['pain']}\n"
            f"Total: {total}/{args.max_leads}"
            + (f"\n⚠️ Errors: {'; '.join(errors)}" if errors else "")
        )

    if _hb_ping:
        try:
            _hb_ping("hetzner/signal-scout", parent="cron:signal_scout",
                     status="alive", last_action=summary[:200],
                     last_action_status="ok" if not errors else "degraded")
        except Exception:
            pass

    return 0


if __name__ == "__main__":
    sys.exit(main())
