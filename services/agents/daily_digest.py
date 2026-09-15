"""
daily_digest.py — the operator digest that tells the truth (plan v3, GP item 2).

Replaces the legacy digest, which asked three tables (`leadforge_leads`,
`lead_outreach`, `subscribers`), linked at a dead `brai…/ops` page and printed a
hardcoded "$68/day" target. This version reports one row per SURFACE, separates
real money from smoke money, and renders "n/a" — never a zero and never a crash —
for a table that does not exist yet.

What one run produces
  1. Per-surface table: leads 24h · outreach 24h · payments 24h (real vs
     simulated) · MRR.
  2. Fleet sections that have no per-surface attribution column in the schema and
     so would be a lie as table cells: SEO (`seo_pages` + `index_status` +
     `daily_gaps` published), agent health (`agent_runs`, with the failing agent
     names), LLM spend by tier (`ops_events`).
  3. Targets: G0 → $2–4K MRR month 3 → $4–8K month 6 → $10–20K month 12, each
     with today-vs-target.
  4. Monday only: the five-numbers table and kill-rule status.

Delivery: HTML through the hub relay `/api/internal/send-email` (HMAC-SHA256 of
the raw body with BIZLEGAL_INBOUND_SECRET) to DIGEST_TO_EMAIL, which must be one
of the relay's allow-listed operator addresses — nothing is hardcoded here, and
an empty name simply skips the email. Short plain text to Telegram. Never Resend
directly (one email path, and Cloudflare 1010-blocks Hetzner on api.resend.com).

Flags: `--dry-run` renders to stdout and sends nothing; `--send` sends; no flag
sends, because the deployed crontab line calls this file bare at 08:00 UTC
(`services/cron_jobs.txt`). Exit 0 ok · 1 nothing sent · 2 Supabase auth failure.

Schema note: every column name below was taken from the migration that creates
the table (or the route that writes it), not guessed. `sales_outreach` is dated
by `drafted_at`, `daily_gaps` by `published_at`; everything else by `created_at`.
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import html as htmllib
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

AGENT = "daily_digest"
# Cloudflare answers Python's default User-Agent with error 1010 on several of
# our own endpoints. Every outbound call in this file sets one.
USER_AGENT = "bizlegal-agent/1.0"
ROW_LIMIT = 2000
NA = "n/a"


def _env(*names: str) -> str:
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    return ""


def _int_env(name: str, default: int) -> int:
    try:
        return max(1, int(_env(name) or default))
    except ValueError:
        return default


# Lower it when the database is degraded so the run still finishes and every
# cell honestly reads n/a instead of the job hanging for a quarter of an hour.
HTTP_TIMEOUT = _int_env("DIGEST_HTTP_TIMEOUT", 20)


SUPABASE_URL = _env("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL").rstrip("/")
SUPABASE_KEY = _env("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET")
HUB_URL = _env("NEXT_PUBLIC_HUB_URL").rstrip("/") or "https://bizlegal-ai.com"
INBOUND_SECRET = _env("BIZLEGAL_INBOUND_SECRET")
DIGEST_TO = _env("DIGEST_TO_EMAIL")
TELEGRAM_TOKEN = _env("TELEGRAM_HUB_TOKEN", "TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT = _env("TELEGRAM_MOSES_CHAT_ID", "TELEGRAM_CHAT_ID")


def _ssl_context() -> ssl.SSLContext:
    """Honour REQUESTS_CA_BUNDLE / SSL_CERT_FILE so a TLS-intercepting AV on a
    dev box does not break the run. Unset on the Hetzner box — default CAs."""
    bundle = os.environ.get("REQUESTS_CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
    try:
        return ssl.create_default_context(cafile=bundle) if bundle else ssl.create_default_context()
    except Exception:
        return ssl.create_default_context()


SSL_CTX = _ssl_context()


class SupabaseAuthError(RuntimeError):
    """Raised on 401/403 or missing config — the caller exits non-zero."""


# --- Supabase PostgREST probe layer ----------------------------

@dataclass(frozen=True)
class Probe:
    """One table read. `value` is None when the table/column is absent."""
    value: Optional[object]
    note: str = ""

    @property
    def ok(self) -> bool:
        return self.value is not None


def _request(path: str, headers: dict) -> tuple:
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=SSL_CTX)
        return resp.status, resp.read(), dict(resp.headers)
    except urllib.error.HTTPError as err:
        return err.code, err.read()[:400], dict(err.headers or {})
    except Exception as err:  # timeout, DNS, TLS
        return -1, f"{type(err).__name__}: {err}".encode(), {}


def _classify(status: int, body: bytes) -> str:
    """Turn a PostgREST failure into a short human reason for the n/a cell."""
    text = body.decode(errors="replace") if isinstance(body, bytes) else str(body)
    if status == 404 or "PGRST205" in text or "Could not find the table" in text:
        return "table absent"
    if status == 400 and ("42703" in text or "does not exist" in text):
        return "column absent"
    if status == -1:
        return text.split(":")[0][:40] or "network"
    return f"http {status}"


def _supabase_headers(extra: Optional[dict] = None) -> dict:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    if extra:
        headers.update(extra)
    return headers


def count_rows(table: str, query: str = "") -> Probe:
    """Cheap exact count via `Prefer: count=exact` + limit=1 (reads one row)."""
    path = f"{table}?select=*&limit=1" + (f"&{query}" if query else "")
    status, body, headers = _request(path, _supabase_headers({"Prefer": "count=exact"}))
    if status in (401, 403):
        raise SupabaseAuthError(f"{table}: http {status}")
    if status != 200:
        return Probe(None, _classify(status, body))
    content_range = headers.get("Content-Range", "")
    total = content_range.split("/")[-1] if "/" in content_range else ""
    if not total.isdigit():
        return Probe(None, "no count header")
    return Probe(int(total))


def fetch_rows(table: str, select: str, query: str = "", limit: int = ROW_LIMIT) -> Probe:
    path = f"{table}?select={urllib.parse.quote(select, safe=',:')}&limit={limit}"
    if query:
        path += f"&{query}"
    status, body, _ = _request(path, _supabase_headers())
    if status in (401, 403):
        raise SupabaseAuthError(f"{table}: http {status}")
    if status != 200:
        return Probe(None, _classify(status, body))
    try:
        return Probe(json.loads(body or b"[]"))
    except Exception:
        return Probe(None, "bad json")


def since(hours: int = 24) -> str:
    """URL-safe RFC 3339 cutoff with a Z suffix."""
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).strftime("%Y-%m-%dT%H:%M:%SZ")


# --- Surface registry ------------------------------------------

@dataclass(frozen=True)
class Surface:
    key: str
    label: str
    # (table, timestamp column) pairs counted as "leads"
    leads: tuple = ()
    # (table, timestamp column) pairs counted as "outreach"
    outreach: tuple = ()
    # extra order tables beyond the shared payment_orders, as
    # (table, timestamp col, amount col, amount unit, status col, paid values)
    orders: tuple = ()


SURFACES = (
    Surface("hub", "hub", leads=(("leads", "created_at"), ("inbound_leads", "created_at")),
            outreach=(("sales_outreach", "drafted_at"),)),
    Surface("docai", "docai", leads=(("contract_scans", "created_at"), ("conductor_profiles", "created_at"))),
    Surface("forge", "forge", leads=(("forge_scans", "created_at"), ("scans", "created_at"))),
    Surface("lexaudit", "lexaudit", leads=(("compliance_snapshots", "created_at"), ("compliance_subs", "created_at"))),
    Surface("tracr", "tracr", leads=(("tracr_wallet_leads", "created_at"),),
            orders=(("tracr_orders", "created_at", "amount_cents", "cents", "status", ("active", "paid", "completed")),)),
    Surface("brai", "brai", leads=(("risk_snapshots", "created_at"), ("crypto_scans", "created_at"))),
    Surface("leadforge", "leadforge", leads=(("leadforge_leads", "created_at"),)),
    Surface("bench", "bench", leads=(("bench_intake", "created_at"),)),
    Surface("cited", "cited/FirmCited",
            leads=(("fc_leads", "created_at"), ("fc_intake_inquiries", "created_at")),
            outreach=(("fc_email_log", "created_at"),),
            orders=(("fc_orders", "created_at", "amount_usd", "usd", "status", ("paid", "recovered")),)),
    Surface("deal44", "deal44", leads=(("deals", "created_at"), ("deal_rooms", "created_at"))),
    Surface("sellerradar", "sellerradar",
            leads=(("sellerradar_leads", "created_at"), ("sellerradar_reports", "created_at")),
            orders=(("sellerradar_orders", "created_at", "amount", "usd", "status", ("paid", "active")),)),
    Surface("falseecho", "falseecho",
            leads=(("falseecho_leads", "created_at"), ("falseecho_scans", "created_at")),
            orders=(("falseecho_orders", "created_at", "amount", "usd", "status", ("paid", "active")),)),
    Surface("leaseparse", "leaseparse", leads=(("leaseparse_leases", "created_at"),)),
    Surface("casepage", "casepage", leads=(("casepage_waitlist", "created_at"),)),
    Surface("sincefiled", "sincefiled", leads=(("sf_firms", "created_at"),)),
    Surface("other", "other/unmapped"),
)

# Mirror of `product_family` in packages/payment/src/products.ts — update the two
# together. Anything not listed falls through to the hub, which is where the
# BOI / AI-Act / policy-refresh / PSP / CASP / practice SKUs are sold.
FAMILY_SURFACE = {
    "tracr": "tracr", "forge": "forge", "docai": "docai", "conductor": "docai",
    "cle": "docai", "lexaudit": "lexaudit", "bench": "bench", "deal44": "deal44",
    "leaseparse": "leaseparse", "casepage": "casepage", "sincefiled": "sincefiled",
    "brai": "brai", "propsignal": "other", "closeflow": "other", "coguard": "other",
}
PRODUCT_PREFIX_SURFACE = (
    ("tracr_", "tracr"), ("forge_", "forge"), ("docai_", "docai"), ("conductor_", "docai"),
    ("cle_", "docai"), ("lexaudit_", "lexaudit"), ("bench_", "bench"), ("deal44_", "deal44"),
    ("leaseparse_", "leaseparse"), ("cp_", "casepage"), ("sf_", "sincefiled"),
    ("propsignal_", "other"), ("closeflow_", "other"), ("coguard_", "other"),
)


def surface_for_order(row: dict) -> str:
    family = str(row.get("tier") or "").lower()
    if family in FAMILY_SURFACE:
        return FAMILY_SURFACE[family]
    product = str(row.get("product") or "").lower()
    for prefix, key in PRODUCT_PREFIX_SURFACE:
        if product.startswith(prefix):
            return key
    return "hub"


def is_simulated(row: dict) -> bool:
    """Smoke rows must never be counted as revenue: /api/test/payment-zero writes
    gateway='simulated', and hand-made test rows use a `smoke…` address."""
    if str(row.get("gateway") or "").lower() == "simulated":
        return True
    meta = row.get("metadata")
    if isinstance(meta, dict) and str(meta.get("simulated", "")).lower() in ("true", "1"):
        return True
    email = str(row.get("user_email") or row.get("email") or "").lower()
    return email.startswith("smoke")


# --- Collectors ------------------------------------------------

@dataclass
class Row:
    key: str
    label: str
    leads: Optional[int] = None
    outreach: Optional[int] = None
    real_usd: float = 0.0
    sim_usd: float = 0.0
    real_n: int = 0
    sim_n: int = 0
    mrr_usd: float = 0.0
    # False until at least one order/subscription read actually answered. A
    # wedged database must render "n/a", never "$0.00" — a zero is a claim.
    money_ok: bool = False
    mrr_ok: bool = False
    notes: list = None

    def __post_init__(self):
        if self.notes is None:
            self.notes = []


def _sum_pairs(pairs: tuple, cutoff: str, notes: list) -> Optional[int]:
    """Sum 24h counts across a surface's tables; None if every table is absent."""
    total, any_ok = 0, False
    for table, ts_col in pairs:
        probe = count_rows(table, f"{ts_col}=gte.{cutoff}")
        if probe.ok:
            total += int(probe.value)
            any_ok = True
        else:
            notes.append(f"{table}: {probe.note}")
    return total if any_ok else None


def collect_payment_orders(rows_by_key: dict, cutoff: str, notes: list) -> None:
    """One read of the shared payment_orders table feeds every surface's money
    columns. status='active' is the paid state (see /api/test/payment-zero and
    the nowpayments webhook); non-USD rows are reported separately, never mixed
    into the dollar totals."""
    probe = fetch_rows(
        "payment_orders",
        "product,tier,amount_cents,currency,gateway,status,user_email,metadata,billing_interval,created_at",
        f"status=eq.active&created_at=gte.{cutoff}",
    )
    if not probe.ok:
        notes.append(f"payment_orders 24h: {probe.note}")
        return
    for row in rows_by_key.values():
        row.money_ok = True
    foreign = {}
    for row in probe.value:
        key = surface_for_order(row)
        target = rows_by_key.get(key) or rows_by_key["other"]
        currency = str(row.get("currency") or "USD").upper()
        amount = float(row.get("amount_cents") or 0) / 100.0
        if is_simulated(row):
            target.sim_usd += amount if currency == "USD" else 0.0
            target.sim_n += 1
            continue
        target.real_n += 1
        if currency != "USD":
            foreign.setdefault(target.label, {}).setdefault(currency, 0.0)
            foreign[target.label][currency] += amount
            continue
        target.real_usd += amount
    for label, by_currency in sorted(foreign.items()):
        for currency, amount in sorted(by_currency.items()):
            notes.append(f"{label}: {amount:,.2f} {currency} paid in 24h - counted in the order "
                         f"count, not in the USD total (no FX rate in this job)")


def collect_mrr(rows_by_key: dict, notes: list) -> None:
    """MRR = every active subscription row at its own charged price (which is the
    products.ts price, plus any live pricing experiment). Yearly ÷ 12."""
    probe = fetch_rows(
        "payment_orders",
        "product,tier,amount_cents,currency,gateway,status,user_email,metadata,billing_interval",
        "status=eq.active&billing_interval=in.(monthly,yearly)",
    )
    if probe.ok:
        for row in rows_by_key.values():
            row.mrr_ok = True
        for row in probe.value:
            if is_simulated(row) or str(row.get("currency") or "USD").upper() != "USD":
                continue
            amount = float(row.get("amount_cents") or 0) / 100.0
            monthly = amount / 12.0 if row.get("billing_interval") == "yearly" else amount
            target = rows_by_key.get(surface_for_order(row)) or rows_by_key["other"]
            target.mrr_usd += monthly
    else:
        notes.append(f"payment_orders MRR: {probe.note}")

    fc = fetch_rows("fc_subscriptions", "amount_usd,status,email", "status=eq.active")
    if fc.ok:
        rows_by_key["cited"].mrr_ok = True
        for row in fc.value:
            rows_by_key["cited"].mrr_usd += float(row.get("amount_usd") or 0)
    else:
        notes.append(f"fc_subscriptions: {fc.note}")


def collect_surface_orders(row: Row, surface: Surface, cutoff: str) -> None:
    """Surfaces that keep their own order table (cited, tracr, sellerradar,
    falseecho) instead of, or alongside, payment_orders."""
    for table, ts_col, amount_col, unit, status_col, paid in surface.orders:
        values = ",".join(paid)
        probe = fetch_rows(
            table, f"{amount_col},{status_col},email",
            f"{ts_col}=gte.{cutoff}&{status_col}=in.({values})",
        )
        if not probe.ok:
            row.notes.append(f"{table}: {probe.note}")
            continue
        row.money_ok = True
        for order in probe.value:
            amount = float(order.get(amount_col) or 0)
            amount = amount / 100.0 if unit == "cents" else amount
            if is_simulated(order):
                row.sim_usd += amount
                row.sim_n += 1
            else:
                row.real_usd += amount
                row.real_n += 1


def collect_surfaces(cutoff: str) -> tuple:
    rows, notes = [], []
    for surface in SURFACES:
        row = Row(surface.key, surface.label)
        if surface.leads:
            row.leads = _sum_pairs(surface.leads, cutoff, row.notes)
        if surface.outreach:
            row.outreach = _sum_pairs(surface.outreach, cutoff, row.notes)
        collect_surface_orders(row, surface, cutoff)
        rows.append(row)
    by_key = {row.key: row for row in rows}
    collect_payment_orders(by_key, cutoff, notes)
    collect_mrr(by_key, notes)
    return rows, notes


def collect_seo(cutoff: str) -> dict:
    out = {"pages": count_rows("seo_pages"), "published_24h": count_rows("daily_gaps", f"published_at=gte.{cutoff}"),
           "published_total": count_rows("daily_gaps", "status=eq.published"), "index_status": None,
           "index_note": ""}
    probe = fetch_rows("seo_pages", "index_status", limit=5000)
    if not probe.ok:
        out["index_note"] = probe.note
        return out
    tally = {}
    for row in probe.value:
        key = row.get("index_status") or "unchecked"
        tally[key] = tally.get(key, 0) + 1
    out["index_status"] = tally
    return out


def collect_agents(cutoff: str) -> dict:
    probe = fetch_rows("agent_runs", "agent_name,status", f"created_at=gte.{cutoff}")
    if not probe.ok:
        return {"note": probe.note, "ok": 0, "failed": 0, "failing": []}
    ok_count, failed, failing = 0, 0, {}
    for row in probe.value:
        status = str(row.get("status") or "").lower()
        name = str(row.get("agent_name") or "?")
        if status in ("ok", "success", "succeeded"):
            ok_count += 1
        elif status in ("failed", "error", "failure"):
            failed += 1
            failing[name] = failing.get(name, 0) + 1
    ranked = sorted(failing.items(), key=lambda kv: -kv[1])
    return {"note": "", "ok": ok_count, "failed": failed, "failing": ranked}


def collect_llm_spend(cutoff: str) -> dict:
    """Tier spend once llm_router logs {agent, provider, tokens, usd} to
    ops_events. Until then the honest answer is n/a, not $0."""
    probe = fetch_rows("ops_events", "event_type,metadata,amount_cents",
                       f"created_at=gte.{cutoff}&metadata->>tier=not.is.null")
    if not probe.ok:
        return {"note": f"source unavailable ({probe.note})", "tiers": {}}
    if not probe.value:
        return {"note": "router not logging yet", "tiers": {}}
    tiers = {}
    for row in probe.value:
        meta = row.get("metadata") if isinstance(row.get("metadata"), dict) else {}
        tier = str(meta.get("tier", "?"))
        usd = float(meta.get("usd") or 0) or float(row.get("amount_cents") or 0) / 100.0
        tiers[tier] = tiers.get(tier, 0.0) + usd
    return {"note": "", "tiers": tiers}


def collect() -> dict:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise SupabaseAuthError("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY not set")
    cutoff = since(24)
    rows, notes = collect_surfaces(cutoff)
    now = datetime.now(timezone.utc)
    return {
        "as_of": now,
        "is_monday": now.weekday() == 0,
        "rows": rows,
        "notes": notes,
        "seo": collect_seo(cutoff),
        "agents": collect_agents(cutoff),
        "llm": collect_llm_spend(cutoff),
    }


# --- Targets, five numbers, kill rules -------------------------

# decisions/REVENUE-MACHINE-PLAN-V3-2026-09-14.md §6.
TARGETS = (
    ("G0 (Sep 20)", 490.0, "first paid audit, one-time"),
    ("Month 3", 2000.0, "$2-4K MRR"),
    ("Month 6", 4000.0, "$4-8K MRR"),
    ("Month 12", 10000.0, "$10-20K MRR"),
)
FIVE_NUMBERS = (
    ("Response rate", ">= 10%"),
    ("Demo -> pay", ">= 20%"),
    ("Activation", ">= 70%"),
    ("ROI shown", "yes"),
    ("Month-4 retention", ">= 70%"),
)


def totals(data: dict) -> dict:
    rows = data["rows"]
    return {
        "leads": sum(row.leads or 0 for row in rows),
        "outreach": sum(row.outreach or 0 for row in rows),
        "real_usd": sum(row.real_usd for row in rows),
        "sim_usd": sum(row.sim_usd for row in rows),
        "real_n": sum(row.real_n for row in rows),
        "sim_n": sum(row.sim_n for row in rows),
        "mrr": sum(row.mrr_usd for row in rows),
        "money_ok": any(row.money_ok for row in rows),
        "mrr_ok": any(row.mrr_ok for row in rows),
        "leads_ok": any(row.leads is not None for row in rows),
        "outreach_ok": any(row.outreach is not None for row in rows),
    }


def index_rate(seo: dict) -> Optional[float]:
    tally = seo.get("index_status")
    if not tally:
        return None
    total = sum(tally.values())
    if not total:
        return None
    return 100.0 * tally.get("indexed", 0) / total


def kill_rule_lines(seo: dict) -> list:
    rate = index_rate(seo)
    rate_text = f"{rate:.0f}% indexed" if rate is not None else f"{NA} (no index_status data)"
    return [
        f"  page index rate < 40% -> stop the factory and consolidate : {rate_text}",
        f"  < 10 conversations per 100 firms -> change the offer      : {NA} (no conversation log)",
        f"  < 2 pilots per 10 conversations -> change the offer       : {NA} (no pilot log)",
    ]


# --- Rendering -------------------------------------------------

COLS = (("surface", 16), ("leads", 7), ("outreach", 9), ("real $", 16), ("sim $", 14), ("MRR $", 10))


def _cell(value) -> str:
    return NA if value is None else str(value)


def _money(value: float) -> str:
    return f"{value:,.2f}"


def _row_cells(label, leads, outreach, real_usd, real_n, sim_usd, sim_n, mrr,
               money_ok: bool = True, mrr_ok: bool = True) -> list:
    return [label, _cell(leads), _cell(outreach),
            f"{_money(real_usd)} ({real_n})" if money_ok else NA,
            f"{_money(sim_usd)} ({sim_n})" if money_ok else NA,
            _money(mrr) if mrr_ok else NA]


def _pad(cells: list) -> str:
    return "".join(cell.ljust(width) for cell, (_, width) in zip(cells, COLS)).rstrip()


def render_table(rows: list) -> list:
    header = "".join(name.ljust(width) for name, width in COLS).rstrip()
    lines = [header, "-" * sum(width for _, width in COLS)]
    for row in rows:
        lines.append(_pad(_row_cells(row.label, row.leads, row.outreach, row.real_usd,
                                     row.real_n, row.sim_usd, row.sim_n, row.mrr_usd,
                                     row.money_ok, row.mrr_ok)))
    return lines


def total_cells(agg: dict) -> list:
    return _row_cells("TOTAL",
                      agg["leads"] if agg["leads_ok"] else None,
                      agg["outreach"] if agg["outreach_ok"] else None,
                      agg["real_usd"], agg["real_n"], agg["sim_usd"], agg["sim_n"], agg["mrr"],
                      agg["money_ok"], agg["mrr_ok"])


def render_total_line(agg: dict) -> str:
    return _pad(total_cells(agg))


def render_sections(data: dict) -> list:
    """Everything below the per-surface table. Shared by the text and HTML
    renderers so the two can never drift."""
    agg, seo, agents, llm = totals(data), data["seo"], data["agents"], data["llm"]
    out = [
        "SEO",
        f"  seo_pages total      : {_cell(seo['pages'].value)}"
        + ("" if seo["pages"].ok else f" ({seo['pages'].note})"),
        f"  index_status         : "
        + (", ".join(f"{k}={v}" for k, v in sorted(seo["index_status"].items()))
           if seo["index_status"] else f"{NA} ({seo['index_note'] or 'no rows'})"),
        f"  daily_gaps published : {_cell(seo['published_24h'].value)} in 24h / "
        f"{_cell(seo['published_total'].value)} total",
        "",
        "AGENT HEALTH (agent_runs, 24h)",
    ]
    if agents["note"]:
        out.append(f"  {NA} ({agents['note']})")
    else:
        out.append(f"  ok {agents['ok']} / failed {agents['failed']}")
        out.append("  failing: " + (", ".join(f"{n} x{c}" for n, c in agents["failing"]) or "none"))
    out += ["", "LLM SPEND BY TIER (ops_events, 24h)"]
    if llm["tiers"]:
        out += [f"  tier {tier}: ${usd:,.2f}" for tier, usd in sorted(llm["tiers"].items())]
    else:
        out.append(f"  {NA} - {llm['note']}")
    out += ["", "TARGETS (plan v3 section 6)"]
    for label, target, blurb in TARGETS:
        is_g0 = label.startswith("G0")
        actual = agg["real_usd"] if is_g0 else agg["mrr"]
        known = agg["money_ok"] if is_g0 else agg["mrr_ok"]
        unit = "today" if is_g0 else "MRR"
        gap = actual - target
        today = (f"{unit} ${actual:,.2f} ({'+' if gap >= 0 else ''}{gap:,.2f})"
                 if known else f"{unit} {NA} (source unavailable)")
        out.append(f"  {label:<14} target ${target:,.0f} ({blurb}) - {today}")
    if data["is_monday"]:
        out += ["", "WEEKLY - FIVE NUMBERS"]
        out += [f"  {name:<20} target {target:<8} actual {NA}" for name, target in FIVE_NUMBERS]
        out += ["", "WEEKLY - KILL RULES"] + kill_rule_lines(seo)
    na_notes = data["notes"] + [f"{row.label}: {note}" for row in data["rows"] for note in row.notes]
    if na_notes:
        out += ["", f"N/A REASONS ({len(na_notes)})"] + [f"  {note}" for note in na_notes]
    out += ["", f"ops: {HUB_URL}/ops/health?t=$OPS_DASHBOARD_TOKEN",
            f"sent by services/agents/{AGENT}.py"]
    return out


def render_text(data: dict) -> str:
    header = [f"BizLegal daily digest - {data['as_of'].strftime('%Y-%m-%d %H:%M UTC')} - last 24h",
              "", "PER SURFACE"]
    table = render_table(data["rows"])
    footer = ["-" * sum(w for _, w in COLS), render_total_line(totals(data)), ""]
    return "\n".join(header + table + footer + render_sections(data))


def render_html(data: dict) -> str:
    agg = totals(data)
    head = "".join(f"<th style='text-align:left;padding:6px 10px;border-bottom:2px solid #0f172a;"
                   f"font-size:11px;text-transform:uppercase;color:#475569'>{htmllib.escape(n)}</th>"
                   for n, _ in COLS)
    body = ""
    for row in data["rows"]:
        cells = _row_cells(row.label, row.leads, row.outreach, row.real_usd, row.real_n,
                           row.sim_usd, row.sim_n, row.mrr_usd, row.money_ok, row.mrr_ok)
        body += "<tr>" + "".join(
            f"<td style='padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;"
            f"color:{'#94a3b8' if cell == NA else '#0f172a'}'>{htmllib.escape(cell)}</td>"
            for cell in cells) + "</tr>"
    body += ("<tr>" + "".join(
        f"<td style='padding:6px 10px;border-top:2px solid #0f172a;font-size:13px;font-weight:700'>"
        f"{htmllib.escape(cell)}</td>" for cell in total_cells(agg)) + "</tr>")
    rest = htmllib.escape("\n".join(render_sections(data)))
    return (
        "<!doctype html><html><body style=\"font-family:ui-sans-serif,-apple-system,Segoe UI,sans-serif;"
        "max-width:820px;margin:0 auto;padding:20px;background:#f8fafc;color:#0f172a\">"
        "<div style='background:#fff;padding:28px;border-radius:12px'>"
        f"<h1 style='margin:0;font-size:20px'>BizLegal daily digest</h1>"
        f"<p style='margin:6px 0 20px;color:#64748b;font-size:13px'>"
        f"{data['as_of'].strftime('%Y-%m-%d %H:%M UTC')} &middot; last 24h &middot; "
        f"{('$' + _money(agg['real_usd']) + ' real / $' + _money(agg['sim_usd']) + ' simulated') if agg['money_ok'] else 'payments ' + NA}</p>"
        f"<table style='width:100%;border-collapse:collapse'><thead><tr>{head}</tr></thead>"
        f"<tbody>{body}</tbody></table>"
        f"<pre style='font-family:ui-monospace,Menlo,monospace;white-space:pre-wrap;font-size:12.5px;"
        f"margin-top:22px;color:#334155'>{rest}</pre>"
        "</div></body></html>"
    )


def render_telegram(data: dict) -> str:
    agg, seo, agents = totals(data), data["seo"], data["agents"]
    movers = [r for r in data["rows"] if (r.leads or 0) or r.real_n or r.mrr_usd]
    money = (f"real ${_money(agg['real_usd'])} ({agg['real_n']}) | sim ${_money(agg['sim_usd'])}"
             if agg["money_ok"] else f"payments {NA}")
    mrr = f"MRR ${_money(agg['mrr'])}" if agg["mrr_ok"] else f"MRR {NA}"
    lines = [
        f"BizLegal daily {data['as_of'].strftime('%Y-%m-%d')}",
        f"{money} | {mrr}",
        f"leads {_cell(agg['leads'] if agg['leads_ok'] else None)} | "
        f"outreach {_cell(agg['outreach'] if agg['outreach_ok'] else None)} | "
        f"pages {_cell(seo['pages'].value)}",
        f"agents ok {agents['ok']} / failed {agents['failed']}" if not agents["note"]
        else f"agents {NA} ({agents['note']})",
    ]
    if movers:
        lines.append("active: " + ", ".join(
            f"{r.label} {r.leads or 0}L/${_money(r.real_usd)}" for r in movers[:8]))
    na_count = len(data["notes"]) + sum(len(r.notes) for r in data["rows"])
    if na_count:
        lines.append(f"{na_count} n/a cells - see the email for why")
    lines.append(f"target month 3: $2,000 MRR")
    return "\n".join(lines)[:3800]


def subject_line(data: dict) -> str:
    agg = totals(data)
    pages = _cell(data["seo"]["pages"].value)
    real = f"${_money(agg['real_usd'])}" if agg["money_ok"] else NA
    leads = agg["leads"] if agg["leads_ok"] else NA
    return f"BizLegal daily · {real} real · {leads} leads · {pages} pages"


# --- Delivery --------------------------------------------------

def send_email(subject: str, html_body: str) -> tuple:
    """POST the hub relay. Recipient comes from DIGEST_TO_EMAIL and must be one
    of the relay's allow-listed operator addresses (ALLOWED_RECIPIENTS, or any
    @bizlegal-ai.com). Nothing is hardcoded — an empty name skips the email."""
    if not DIGEST_TO:
        return False, "DIGEST_TO_EMAIL not set"
    if not INBOUND_SECRET:
        return False, "BIZLEGAL_INBOUND_SECRET not set"
    payload = json.dumps({"to": DIGEST_TO, "subject": subject, "html": html_body}).encode()
    signature = hmac.new(INBOUND_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    req = urllib.request.Request(
        f"{HUB_URL}/api/internal/send-email", data=payload, method="POST",
        headers={"Content-Type": "application/json", "x-bizlegal-signature": signature,
                 "User-Agent": USER_AGENT})
    try:
        urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=SSL_CTX)
        return True, ""
    except urllib.error.HTTPError as err:
        return False, f"relay http {err.code}"
    except Exception as err:
        return False, f"{type(err).__name__}"


def send_telegram(text: str) -> tuple:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT:
        return False, "TELEGRAM_HUB_TOKEN / chat id not set"
    payload = json.dumps({"chat_id": TELEGRAM_CHAT, "text": text}).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage", data=payload, method="POST",
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT})
    try:
        urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=SSL_CTX)
        return True, ""
    except urllib.error.HTTPError as err:
        return False, f"telegram http {err.code}"
    except Exception as err:
        return False, f"{type(err).__name__}"


def run(ctx=None, send: bool = True) -> dict:
    """Orchestrator entry point. Never prints a secret."""
    started = datetime.now(timezone.utc)
    data = collect()
    agg = totals(data)
    result = {
        "ok": True, "agent": AGENT, "sent_email": False, "sent_telegram": False,
        "subject": subject_line(data), "totals": {k: round(v, 2) if isinstance(v, float) else v
                                                  for k, v in agg.items()},
        "na_count": len(data["notes"]) + sum(len(r.notes) for r in data["rows"]),
    }
    if send:
        ok_mail, mail_err = send_email(result["subject"], render_html(data))
        ok_tg, tg_err = send_telegram(render_telegram(data))
        result.update(sent_email=ok_mail, sent_telegram=ok_tg, ok=ok_mail or ok_tg)
        if mail_err:
            result["email_error"] = mail_err
        if tg_err:
            result["telegram_error"] = tg_err
    result["duration_ms"] = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
    result["_text"] = render_text(data)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="BizLegal daily digest v2")
    parser.add_argument("--dry-run", action="store_true", help="render to stdout, send nothing")
    parser.add_argument("--send", action="store_true", help="send (the default when no flag is given)")
    args = parser.parse_args()
    try:  # the subject line carries a middle dot; a cp1252 console would raise
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    try:
        result = run(send=not args.dry_run)
    except SupabaseAuthError as err:
        print(f"[{AGENT}] supabase auth/config failure: {err}", file=sys.stderr)
        return 2
    text = result.pop("_text")
    if args.dry_run:
        print(text)
        print("\n[dry-run] nothing sent.")
        return 0
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
