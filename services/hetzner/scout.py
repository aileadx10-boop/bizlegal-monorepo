"""
Hetzner curator — scout step.

Runs Mon/Wed/Fri 06:00 UTC via n8n (or as a standalone systemd timer
if n8n is down). Polls 5 RSS feeds, calls laptop Ollama via Cloudflare
Tunnel for relevance + revenue ranking, writes top-3 candidates to
Supabase `daily_gaps`, then pings Telegram for the topic-pick gate.

Entry point: `python scout.py` — reads .env, runs once, exits.

Anti-hallucination: Ollama is the FILTER, not the writer. Score 1-5
relevance + 0-10 revenue + 0-10 timeliness. The actual draft happens
in brain.py (Claude). Scout never writes prose to the user.
"""
from __future__ import annotations

import json
import os
import sys
import textwrap
from dataclasses import dataclass
from datetime import datetime, timezone

import feedparser  # type: ignore
import httpx
from dotenv import load_dotenv
from supabase import create_client, Client  # type: ignore

import firecrawl_enrich
from ops_log import log_event

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────
RSS_FEEDS = [
    ("SEC", "https://www.sec.gov/news/pressreleases.rss"),
    ("FTC", "https://www.ftc.gov/feeds/press-releases.xml"),
    ("FCA", "https://www.fca.org.uk/news/rss.xml"),
    ("EU",  "https://ec.europa.eu/info/news/rss_en"),
    ("FinCEN", "https://www.fincen.gov/news-room/news-releases.xml"),
]
MAX_ITEMS_PER_FEED = 10
MIN_RELEVANCE_SCORE = 4   # 1-5 from filter pass
TOP_N = 3                 # picks per scout run

OLLAMA_TUNNEL_URL = os.getenv("OLLAMA_TUNNEL_URL", "").rstrip("/")
OLLAMA_TUNNEL_TOKEN = os.getenv("OLLAMA_TUNNEL_TOKEN", "")
# CF Access service token (preferred, post-2026-05-03). When both
# CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are set we use them
# directly; otherwise we fall back to the legacy single-string
# OLLAMA_TUNNEL_TOKEN (split-on-dot) so old deployments keep working.
CF_ACCESS_CLIENT_ID = os.getenv("CF_ACCESS_CLIENT_ID", "")
CF_ACCESS_CLIENT_SECRET = os.getenv("CF_ACCESS_CLIENT_SECRET", "")
OLLAMA_FILTER_MODEL = os.getenv("OLLAMA_FILTER_MODEL", "llama3.2:3b")
OLLAMA_RANK_MODEL = os.getenv("OLLAMA_RANK_MODEL", "qwen2.5:7b-instruct-q4_K_M")
OLLAMA_TIMEOUT_S = 60

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")

TG_TOKEN = os.getenv("TELEGRAM_CURATOR_BOT_TOKEN", "")
TG_CHAT = os.getenv("TELEGRAM_CHAT_ID", "")

FILTER_PROMPT = textwrap.dedent("""
    Score the following regulatory news item for a digital-asset / fintech /
    cross-border-compliance audience. Output STRICT JSON with no prose:

    {"relevant": <bool>, "score": <int 1-5>, "vertical": "<one of: brai|tracr|lexaudit|docai|forge|leadforge|other>", "short_thesis": "<<= 25 words>"}

    Title: {title}
    Summary: {summary}
""").strip()

RANK_PROMPT = textwrap.dedent("""
    You're picking the best 3 of these regulatory news items to draft as
    blog posts for a paid compliance-intelligence audience. Score each on:

    - revenue: 0-10. Will an executive pay $149+ for a snapshot or scan
      on this gap? Higher = more buyer pain, real urgency, real money.
    - timeliness: 0-10. Deadline within 60 days = 8-10. Already-passed = 0-2.

    Output STRICT JSON (no prose):
    {"ranked": [{"id": <int>, "revenue": <int>, "timeliness": <int>, "rationale": "<<= 25 words>"}]}

    Items:
    {items_json}
""").strip()


# ── Data shapes ───────────────────────────────────────────────────
@dataclass
class FeedItem:
    feed_id: str
    title: str
    summary: str
    url: str
    pub_date: str

    def fingerprint(self) -> str:
        return self.url.strip()


@dataclass
class FilteredItem:
    item: FeedItem
    relevance: int
    vertical: str
    short_thesis: str


@dataclass
class RankedItem:
    item: FeedItem
    relevance: int
    vertical: str
    short_thesis: str
    revenue: int
    timeliness: int
    rationale: str
    firecrawl: dict | None = None

    @property
    def total_score(self) -> int:
        return self.relevance + self.revenue + self.timeliness


# ── Ollama (laptop GPU via tunnel) ────────────────────────────────
def _ollama_headers() -> dict[str, str]:
    h = {"content-type": "application/json"}
    if CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET:
        h["cf-access-client-id"] = CF_ACCESS_CLIENT_ID
        h["cf-access-client-secret"] = CF_ACCESS_CLIENT_SECRET
    elif OLLAMA_TUNNEL_TOKEN:
        h["cf-access-client-id"] = OLLAMA_TUNNEL_TOKEN.split(".", 1)[0]
        h["cf-access-client-secret"] = OLLAMA_TUNNEL_TOKEN
    return h


def ollama_chat(model: str, system: str, user: str, *, json_mode: bool = True) -> str:
    if not OLLAMA_TUNNEL_URL:
        raise RuntimeError("OLLAMA_TUNNEL_URL not configured")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {"temperature": 0.1},
    }
    if json_mode:
        payload["format"] = "json"
    res = httpx.post(
        f"{OLLAMA_TUNNEL_URL}/api/chat",
        json=payload,
        headers=_ollama_headers(),
        timeout=OLLAMA_TIMEOUT_S,
    )
    res.raise_for_status()
    body = res.json()
    msg = body.get("message", {}).get("content", "")
    if not msg:
        raise RuntimeError(f"Ollama empty response: {body}")
    return msg


# ── Pipeline ──────────────────────────────────────────────────────
def fetch_feeds() -> list[FeedItem]:
    items: list[FeedItem] = []
    for feed_id, url in RSS_FEEDS:
        try:
            parsed = feedparser.parse(url)
        except Exception as err:
            print(f"[scout] feed {feed_id} parse failed: {err}")
            continue
        for entry in parsed.entries[:MAX_ITEMS_PER_FEED]:
            title = (entry.get("title") or "").strip()
            summary = (entry.get("summary") or entry.get("description") or "").strip()
            link = (entry.get("link") or "").strip()
            pub = (entry.get("published") or entry.get("updated") or "").strip()
            if not title or not link:
                continue
            items.append(FeedItem(feed_id, title, summary[:600], link, pub))
    print(f"[scout] fetched {len(items)} items across {len(RSS_FEEDS)} feeds")
    return items


def filter_items(items: list[FeedItem]) -> list[FilteredItem]:
    out: list[FilteredItem] = []
    for item in items:
        try:
            raw = ollama_chat(
                OLLAMA_FILTER_MODEL,
                "You score regulatory news for a fintech / crypto compliance audience.",
                FILTER_PROMPT.replace("{title}", item.title).replace("{summary}", item.summary),
            )
            data = json.loads(raw)
            if not data.get("relevant"):
                continue
            score = int(data.get("score", 0))
            if score < MIN_RELEVANCE_SCORE:
                continue
            out.append(
                FilteredItem(
                    item=item,
                    relevance=score,
                    vertical=str(data.get("vertical", "other")),
                    short_thesis=str(data.get("short_thesis", ""))[:200],
                )
            )
        except Exception as err:
            print(f"[scout] filter pass dropped {item.title[:60]}: {err}")
    print(f"[scout] {len(out)}/{len(items)} items passed filter (relevance >= {MIN_RELEVANCE_SCORE})")
    return out


def rank_items(items: list[FilteredItem]) -> list[RankedItem]:
    if not items:
        return []
    items_json = json.dumps(
        [
            {
                "id": i,
                "title": fi.item.title,
                "summary": fi.item.summary,
                "feed": fi.item.feed_id,
                "filter_score": fi.relevance,
                "vertical": fi.vertical,
            }
            for i, fi in enumerate(items)
        ],
        ensure_ascii=False,
    )
    raw = ollama_chat(
        OLLAMA_RANK_MODEL,
        "You're a senior compliance editor ranking regulatory news for revenue potential and timeliness.",
        RANK_PROMPT.replace("{items_json}", items_json),
    )
    try:
        data = json.loads(raw)
    except Exception as err:
        print(f"[scout] rank parse failed: {err}; falling back to filter order")
        data = {"ranked": [{"id": i, "revenue": 0, "timeliness": 0, "rationale": "rank_parse_failed"}
                            for i in range(len(items))]}

    ranked: list[RankedItem] = []
    for entry in data.get("ranked", []):
        idx = int(entry.get("id", -1))
        if not 0 <= idx < len(items):
            continue
        fi = items[idx]
        ranked.append(
            RankedItem(
                item=fi.item,
                relevance=fi.relevance,
                vertical=fi.vertical,
                short_thesis=fi.short_thesis,
                revenue=int(entry.get("revenue", 0)),
                timeliness=int(entry.get("timeliness", 0)),
                rationale=str(entry.get("rationale", ""))[:200],
            )
        )
    ranked.sort(key=lambda r: r.total_score, reverse=True)
    return ranked[:TOP_N]


# ── Persistence ──────────────────────────────────────────────────
def supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SECRET:
        raise RuntimeError("Supabase not configured")
    return create_client(SUPABASE_URL, SUPABASE_SECRET)


def enrich_top_picks(ranked: list[RankedItem]) -> int:
    """Run Firecrawl structured extraction on each ranked URL.

    Mutates the RankedItem.firecrawl field in place. Returns the count
    of successfully enriched picks (0 = no key set or all failed).
    """
    if not firecrawl_enrich.is_configured():
        print("[scout] FIRECRAWL_API_KEY not set; skipping enrichment")
        return 0
    enriched = 0
    for r in ranked:
        data = firecrawl_enrich.enrich_url(r.item.url)
        if data is not None:
            r.firecrawl = data
            enriched += 1
    print(f"[firecrawl] enriched {enriched}/{len(ranked)} picks with structured-source data")
    return enriched


def persist(ranked: list[RankedItem]) -> list[dict]:
    """Upsert into daily_gaps. Dedupe on URL."""
    sb = supabase_client()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    rows: list[dict] = []
    for r in ranked:
        row = {
            "url": r.item.url,
            "feed_id": r.item.feed_id,
            "title": r.item.title,
            "summary": r.item.summary,
            "vertical": r.vertical,
            "relevance": r.relevance,
            "revenue": r.revenue,
            "timeliness": r.timeliness,
            "total_score": r.total_score,
            "short_thesis": r.short_thesis,
            "rationale": r.rationale,
            "scout_date": today,
            "status": "pending_pick",
            "scouted_at": datetime.now(timezone.utc).isoformat(),
            "firecrawl": r.firecrawl,
        }
        rows.append(row)
    if not rows:
        return []
    res = sb.table("daily_gaps").upsert(rows, on_conflict="url").execute()
    return res.data or rows


# ── Telegram ─────────────────────────────────────────────────────
def notify_picks(ranked: list[RankedItem]) -> None:
    if not TG_TOKEN or not TG_CHAT or not ranked:
        return
    lines = [
        "*🎯 Curator scout — 3 candidates ready*",
        "",
        f"_Run date: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}_",
        "",
    ]
    for i, r in enumerate(ranked, 1):
        lines.append(
            f"*#{i}* — _{r.item.feed_id}_ · score {r.total_score} "
            f"(rel {r.relevance}/5 · rev {r.revenue}/10 · time {r.timeliness}/10)"
        )
        lines.append(f"  {r.item.title}")
        lines.append(f"  → {r.short_thesis}")
        lines.append("")
    lines.append("_Tap below to pick. Brain step kicks in immediately._")
    text = "\n".join(lines)

    keyboard = {
        "inline_keyboard": [
            [{"text": f"Pick #{i}", "callback_data": f"pick:{r.item.url}"}]
            for i, r in enumerate(ranked, 1)
        ] + [[{"text": "⏭ Skip this batch", "callback_data": "pick:skip"}]],
    }

    try:
        httpx.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={
                "chat_id": TG_CHAT,
                "text": text,
                "parse_mode": "Markdown",
                "disable_web_page_preview": True,
                "reply_markup": keyboard,
            },
            timeout=15,
        ).raise_for_status()
    except Exception as err:
        print(f"[scout] telegram notify failed: {err}")


# ── Entry ────────────────────────────────────────────────────────
def main() -> int:
    # V0.2 — heartbeat at start of each cron run so /ops sees the
    # service liveness even when no items are fetched.
    log_event(
        "heartbeat",
        ref_id="curator/scout",
        status="ok",
        metadata={"service": "scout", "phase": "startup"},
    )
    items = fetch_feeds()
    if not items:
        print("[scout] no items fetched; exiting")
        log_event(
            "cron.completed",
            ref_id="curator/scout",
            status="ok",
            metadata={"step": "scout", "feeds_polled": len(RSS_FEEDS), "items_fetched": 0,
                      "filtered": 0, "picks": 0, "outcome": "no_items"},
        )
        return 0
    filtered = filter_items(items)
    if not filtered:
        print("[scout] no items passed filter; exiting")
        log_event(
            "cron.completed",
            ref_id="curator/scout",
            status="ok",
            metadata={"step": "scout", "feeds_polled": len(RSS_FEEDS), "items_fetched": len(items),
                      "filtered": 0, "picks": 0, "outcome": "filter_empty"},
        )
        return 0
    ranked = rank_items(filtered)
    if not ranked:
        print("[scout] ranking produced zero items; exiting")
        log_event(
            "cron.completed",
            ref_id="curator/scout",
            status="ok",
            metadata={"step": "scout", "feeds_polled": len(RSS_FEEDS), "items_fetched": len(items),
                      "filtered": len(filtered), "picks": 0, "outcome": "rank_empty"},
        )
        return 0
    enriched_count = enrich_top_picks(ranked)
    persisted = persist(ranked)
    print(f"[scout] persisted {len(persisted)} candidates")
    notify_picks(ranked)
    log_event(
        "cron.completed",
        ref_id="curator/scout",
        status="ok",
        metadata={
            "step": "scout",
            "feeds_polled": len(RSS_FEEDS),
            "items_fetched": len(items),
            "filtered": len(filtered),
            "picks": len(ranked),
            "firecrawl_enriched": enriched_count,
            "top_score": ranked[0].total_score if ranked else 0,
            "verticals": sorted({r.vertical for r in ranked}),
            "outcome": "picked",
        },
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
