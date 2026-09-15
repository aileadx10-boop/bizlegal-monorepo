#!/usr/bin/env python3
"""
page_factory.py — the programmatic-SEO page factory (plan v3, section P).

Deterministic matrix -> `seo_pages` rows -> free-tier LLM text -> quality gate
-> status 'review'. Nothing this script does publishes anything: Moses flips
'review' -> 'published' and only then does the hub render the page and the
sitemap emit it.

Three phases, three flags, each independently re-runnable:

    python page_factory.py --plan
        Prints the row count each family would produce. Writes nothing,
        calls no LLM, needs no credentials.

    python page_factory.py --write --limit 500
        Inserts missing rows as status='draft'. Idempotent: slugs that
        already exist are skipped, never overwritten, so a half-finished
        run is just re-run.

    python page_factory.py --generate --limit 20 --tier 1
        Takes draft rows, asks the free tier (Gemini Flash-Lite -> Flash ->
        OpenRouter ':free') for the body/FAQ/citations, runs the gate, and
        promotes to 'review' (pass) or 'rejected_quality' (fail, with the
        findings stored so the next run can see why).

Families (matrix v1, all data-driven in page_factory_matrix.json):

    compliance   regulation x jurisdiction        12 x 50
    solutions    tool x "for <industry>"          15 x 20
    glossary     compliance glossary terms        seed list, growing to 500
    playbooks    guide x checklist/faq/template   guides.ts x 3

The guide family is parsed straight out of apps/hub/lib/guides.ts so it can
never drift from the hub's own list.

Env (vault names only, never printed):
    NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY   rows
    GOOGLE_GEMINI_API_KEY (or GEMINI_API_KEY)        tier 1
    OPENROUTER_API_KEY                               tier 2 overflow
    BIZLEGAL_INBOUND_SECRET, OPS_LOG_URL             ops_events spend log

Ops logging note: the fleet's event-type list is closed (CLAUDE.md hard rule
3). LLM spend is therefore logged under the existing 'agent.run.completed' /
'agent.run.error' types with metadata.agent = 'page_factory'; no new event
type was added.
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Iterable

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(REPO / "services" / "agents"))

AGENT_NAME = "page_factory"

SB_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SB_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OPS_LOG_URL = os.environ.get("OPS_LOG_URL", "https://bizlegal-ai.com/api/ops/log")
INBOUND_SECRET = os.environ.get("BIZLEGAL_INBOUND_SECRET", "")

# The router reads GEMINI_API_KEY; the vault's canonical name for the page
# factory's key is GOOGLE_GEMINI_API_KEY. Bridge before the import so the
# router picks it up without either name being duplicated downstream.
if not os.environ.get("GEMINI_API_KEY") and os.environ.get("GOOGLE_GEMINI_API_KEY"):
    os.environ["GEMINI_API_KEY"] = os.environ["GOOGLE_GEMINI_API_KEY"]

from page_factory_prompt import (
    SYSTEM_PROMPT,
    assemble_body,
    build_user_prompt,
    parse_json_block,
    strip_lead_connectives,
)
from page_factory_rows import (
    PageRow,
    build_rows,
    citations_for,
    known_hub_urls,
    link_menu,
    load_guides,
    load_matrix,
    regs_for_row,
    registry_urls,
    utcnow,
)

STATUS_DRAFT = "draft"
STATUS_REVIEW = "review"
STATUS_REJECTED = "rejected_quality"

# ── Supabase REST ─────────────────────────────────────────────────
class SupabaseError(RuntimeError):
    pass


class SupabaseUnavailable(SupabaseError):
    """PostgREST reachable-but-wedged (502/503/504) or the socket failed.

    Raised instead of retrying: a wedged pool does not recover inside a run,
    and a retry loop here just turns one clear failure into a slow one.
    """


_SB_TIMEOUT = 20


def _sb_request(method: str, path: str, body: Any = None, prefer: str = "") -> tuple[int, Any]:
    if not SB_URL or not SB_KEY:
        raise SupabaseError(
            "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY not in env. "
            "Load them from the vault first; --plan needs neither."
        )
    headers = {
        "apikey": SB_KEY,
        "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "bizlegal-page-factory/1.0",
    }
    if prefer:
        headers["Prefer"] = prefer
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{SB_URL}/rest/v1/{path}", data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=_SB_TIMEOUT) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode(errors="replace")
        if e.code in (502, 503, 504):
            raise SupabaseUnavailable(
                f"Supabase PostgREST returned {e.code} — the API is down or its pool is wedged. "
                f"Nothing was written. Retry after the project is healthy. ({raw[:120]})"
            ) from e
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"message": raw[:400]}
    except urllib.error.URLError as e:
        raise SupabaseUnavailable(
            f"Supabase unreachable ({e.reason}). Nothing was written."
        ) from e
    except TimeoutError as e:
        raise SupabaseUnavailable(
            f"Supabase timed out after {_SB_TIMEOUT}s. Nothing was written."
        ) from e


def preflight_db() -> None:
    """One cheap call before any batch, so an outage fails in a second with a
    sentence instead of part-way through a 500-row insert."""
    status, resp = _sb_request("GET", "seo_pages?select=slug&limit=1")
    if not (200 <= status < 300):
        raise SupabaseUnavailable(
            f"Supabase preflight failed ({status}): {json.dumps(resp)[:200]}. Nothing was written."
        )


_MISSING_COL_RE = re.compile(r"'([a-z_]+)' column", re.IGNORECASE)


def insert_rows(payloads: list[dict[str, Any]]) -> tuple[int, list[str]]:
    """Insert, dropping any column this database does not have yet (PGRST204)
    so the factory still lands rows before the migration is applied."""
    dropped: list[str] = []
    body = payloads
    for _ in range(12):
        status, resp = _sb_request(
            "POST", "seo_pages", body, prefer="return=minimal,resolution=ignore-duplicates"
        )
        if 200 <= status < 300:
            return status, dropped
        msg = json.dumps(resp) if resp is not None else ""
        if status == 400 and "PGRST204" in msg:
            m = _MISSING_COL_RE.search(msg)
            if m and any(m.group(1) in p for p in body):
                col = m.group(1)
                dropped.append(col)
                body = [{k: v for k, v in p.items() if k != col} for p in body]
                continue
        raise SupabaseError(f"insert failed ({status}): {msg[:400]}")
    raise SupabaseError("insert failed: too many missing columns")


def patch_row(slug: str, payload: dict[str, Any]) -> list[str]:
    dropped: list[str] = []
    body = dict(payload)
    q = f"seo_pages?slug=eq.{urllib.parse.quote(slug, safe='')}"
    for _ in range(12):
        status, resp = _sb_request("PATCH", q, body, prefer="return=minimal")
        if 200 <= status < 300:
            return dropped
        msg = json.dumps(resp) if resp is not None else ""
        if status == 400 and "PGRST204" in msg:
            m = _MISSING_COL_RE.search(msg)
            if m and m.group(1) in body:
                dropped.append(m.group(1))
                body.pop(m.group(1))
                continue
        raise SupabaseError(f"patch failed ({status}): {msg[:400]}")
    raise SupabaseError("patch failed: too many missing columns")


def existing_slugs(prefixes: Iterable[str]) -> set[str]:
    found: set[str] = set()
    for prefix in prefixes:
        offset = 0
        while True:
            q = (
                f"seo_pages?select=slug&slug=like.{urllib.parse.quote(prefix + '/*', safe='')}"
                f"&order=slug.asc&limit=1000&offset={offset}"
            )
            status, resp = _sb_request("GET", q)
            if not (200 <= status < 300) or not isinstance(resp, list):
                raise SupabaseError(f"slug query failed ({status}): {json.dumps(resp)[:300]}")
            found.update(r["slug"] for r in resp if r.get("slug"))
            if len(resp) < 1000:
                break
            offset += 1000
    return found


def fetch_drafts(limit: int, hub: str | None) -> list[dict[str, Any]]:
    q = (
        "seo_pages?select=id,slug,title,meta,hub,status,matrix_family,matrix_keys,"
        f"keywords,jurisdiction,regulation_tag&status=eq.{STATUS_DRAFT}"
        f"&order=slug.asc&limit={int(limit)}"
    )
    if hub:
        q += f"&hub=eq.{urllib.parse.quote(hub, safe='')}"
    status, resp = _sb_request("GET", q)
    if not (200 <= status < 300) or not isinstance(resp, list):
        raise SupabaseError(f"draft query failed ({status}): {json.dumps(resp)[:300]}")
    return resp


# ── ops_events (HMAC) ─────────────────────────────────────────────
def log_llm_spend(*, ok: bool, provider: str, model: str, in_tok: int, out_tok: int,
                  usd: float, ref: str) -> bool:
    """No new event types (CLAUDE.md hard rule 3) — spend rides the existing
    agent.run.* pair with metadata.agent='page_factory'."""
    if not INBOUND_SECRET:
        return False
    payload = {
        "type": "agent.run.completed" if ok else "agent.run.error",
        "source": "curator",
        "ref_id": ref[:180],
        "status": "ok" if ok else "failed",
        "metadata": {
            "agent": AGENT_NAME,
            "provider": provider,
            "model": model,
            "tokens": in_tok + out_tok,
            "in_tokens": in_tok,
            "out_tokens": out_tok,
            "usd": round(usd, 6),
        },
    }
    body = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    sig = hmac.new(INBOUND_SECRET.encode("utf-8"), body, hashlib.sha256).hexdigest()
    try:
        req = urllib.request.Request(
            OPS_LOG_URL, data=body, method="POST",
            headers={"x-bizlegal-signature": sig, "Content-Type": "application/json",
                     "User-Agent": "bizlegal-page-factory/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return 200 <= r.status < 300
    except Exception as err:  # noqa: BLE001 — telemetry never breaks the run
        print(f"  [ops_log] swallowed: {type(err).__name__}: {str(err)[:80]}")
        return False

# ── Commands ──────────────────────────────────────────────────────
def cmd_plan(matrix: dict[str, Any], guides: list[dict[str, str]]) -> int:
    rows = build_rows(matrix, guides)
    by_family: dict[str, int] = {}
    by_hub: dict[str, int] = {}
    for r in rows:
        by_family[r.family] = by_family.get(r.family, 0) + 1
        by_hub[r.hub] = by_hub.get(r.hub, 0) + 1
    dupes = len(rows) - len({r.slug for r in rows})

    print("=== page_factory --plan (matrix v%s) ===" % matrix.get("version"))
    print(f"{'family':<24}{'hub':<14}{'rows':>8}   dimensions")
    dims = {
        "regulation_jurisdiction": f"{len(matrix['regulations'])} regulations x {len(matrix['jurisdictions'])} jurisdictions",
        "tool_industry": f"{len(matrix['tools'])} tools x {len(matrix['industries'])} industries",
        "glossary": f"{len(matrix['glossary_terms'])} seeded terms (target 500)",
        "guide_variant": f"{len(guides)} guides x {len(matrix['guide_variants'])} variants",
    }
    for fam, n in by_family.items():
        hub = next(h for h, c in matrix["hubs"].items() if c["family"] == fam)
        print(f"{fam:<24}{hub:<14}{n:>8}   {dims.get(fam, '')}")
    print("-" * 72)
    print(f"{'TOTAL':<38}{len(rows):>8}   unique slugs: {len({r.slug for r in rows})}"
          + (f"  DUPLICATE SLUGS: {dupes}" if dupes else ""))
    print(f"\ncitation registry: {len(registry_urls(matrix))} vetted source URLs across "
          f"{len(matrix['citation_registry'])} regulations")
    print(f"internal-link set: {len(known_hub_urls(matrix, guides, rows))} hub URLs "
          f"(core + guides + regulations + tools + factory rows)")

    # The gate demands >=3 registry-resolved citations. A regulation with fewer
    # than 3 sources makes every page in its slice un-passable, which looks
    # like a model failure and is actually a data gap. Catch it here, offline.
    from page_quality_gate import MIN_CITATIONS
    thin = {k: len(v) for k, v in matrix["citation_registry"].items() if len(v) < MIN_CITATIONS}
    missing = [r["slug"] for r in matrix["regulations"] if r["slug"] not in matrix["citation_registry"]]
    if thin or missing:
        print("\nREGISTRY TOO THIN — the gate needs >=%d citations per regulation:" % MIN_CITATIONS)
        for k, n in sorted(thin.items()):
            print(f"  {k}: {n}")
        for k in missing:
            print(f"  {k}: 0 (no registry entry at all)")

    print("\nnothing written. run --write --limit N to insert drafts.")
    return 1 if (dupes or thin or missing) else 0


def cmd_write(matrix: dict[str, Any], guides: list[dict[str, str]], limit: int, hub: str | None) -> int:
    rows = build_rows(matrix, guides)
    if hub:
        rows = [r for r in rows if r.hub == hub]
    prefixes = sorted({r.hub for r in rows})
    preflight_db()
    print(f"[write] checking existing slugs under {prefixes} ...")
    have = existing_slugs(prefixes)
    todo = [r for r in rows if r.slug not in have][:limit]
    print(f"[write] {len(have)} already present, {len(todo)} to insert (limit {limit})")
    if not todo:
        return 0
    inserted = 0
    for i in range(0, len(todo), 100):
        chunk = todo[i : i + 100]
        _, dropped = insert_rows([r.insert_payload() for r in chunk])
        inserted += len(chunk)
        if dropped:
            print(f"  [write] columns not in this database, dropped: {sorted(set(dropped))}")
            print("  [write] apply supabase/migrations/20260915_seo_pages_page_factory.sql")
    print(f"[write] inserted {inserted} rows as status='{STATUS_DRAFT}' (nothing published)")
    for r in todo[:10]:
        print(f"  {r.slug}")
    if len(todo) > 10:
        print(f"  ... and {len(todo) - 10} more")
    return 0


def cmd_generate(matrix: dict[str, Any], guides: list[dict[str, str]], limit: int,
                 tier: int, hub: str | None, dry_run: bool) -> int:
    from page_quality_gate import audit_page  # local import: gate is optional for --plan

    if tier not in (1, 2):
        print(f"[generate] tier {tier} refused — the page factory is free-tier only "
              "(tier 1 Gemini, tier 2 OpenRouter ':free'). Anthropic is never used here.",
              file=sys.stderr)
        return 2

    from llm_router import ChatMessage, chat_free_tier

    preflight_db()
    rows = build_rows(matrix, guides)
    known = known_hub_urls(matrix, guides, rows)
    registry = registry_urls(matrix)
    disclaimer = matrix["disclaimer"]

    drafts = fetch_drafts(limit, hub)
    print(f"[generate] {len(drafts)} draft row(s), tier {tier}")
    passed = failed = errored = 0
    total_usd = 0.0

    for row in drafts:
        slug = row["slug"]
        regs = regs_for_row(row, matrix, guides)
        cites = citations_for(matrix, regs)
        links = link_menu(row, matrix, guides, known)
        prompt = build_user_prompt(row, matrix, cites, links, disclaimer)

        resp = chat_free_tier(
            SYSTEM_PROMPT,
            [ChatMessage("user", prompt)],
            max_tokens=4096,
            prefer_openrouter=(tier == 2),
        )
        usd = (resp.cost_cents or 0) / 100.0
        total_usd += usd
        log_llm_spend(ok=not resp.error, provider=resp.source, model=resp.model_used,
                      in_tok=resp.input_tokens, out_tok=resp.output_tokens, usd=usd, ref=slug)
        print(f"  {slug}: {resp.source}/{resp.model_used} "
              f"in={resp.input_tokens} out={resp.output_tokens} usd={usd:.6f} "
              f"{resp.latency_ms}ms{' ERROR ' + str(resp.error) if resp.error else ''}")
        if resp.error:
            errored += 1
            continue

        doc = parse_json_block(resp.text)
        if not doc:
            errored += 1
            print("    -> model did not return parseable JSON; row left as draft")
            continue

        body, stripped = strip_lead_connectives(assemble_body(doc, disclaimer))
        if stripped:
            print(f"    cleaned {stripped} sentence-initial filler connective(s)")
        page = {
            "slug": slug,
            "hub": row.get("hub"),
            "title": row.get("title"),
            "body_md": body,
            "faq": doc.get("faq", []),
            "key_dates": doc.get("key_dates", []),
            "citations": doc.get("citations", []),
            "internal_links": doc.get("internal_links", []),
        }
        findings = audit_page(page, known_urls=known, registry_urls=registry)
        blockers = [str(f) for f in findings if f.severity == "BLOCK"]
        warns = [str(f) for f in findings if f.severity == "WARN"]
        verdict = STATUS_REVIEW if not blockers else STATUS_REJECTED
        if blockers:
            failed += 1
            for b in blockers:
                print(f"    GATE {b}")
        else:
            passed += 1
            print(f"    GATE pass -> status='{STATUS_REVIEW}'"
                  + (f" ({len(warns)} warning(s))" if warns else ""))

        if dry_run:
            continue
        words = len(re.findall(r"\b[\w'’-]+\b", page["body_md"]))
        patch_row(slug, {
            "content": page["body_md"],
            "faq": page["faq"],
            "key_dates": page["key_dates"],
            "citations": page["citations"],
            "internal_links": page["internal_links"],
            "gate_findings": blockers + warns,
            "status": verdict,
            "word_count": words,
            "reading_time": max(1, round(words / 220)),
            "llm_provider": f"{resp.source}:{resp.model_used}",
            "updated_at": utcnow(),
        })

    print(f"[generate] pass={passed} gated={failed} error={errored} spend=${total_usd:.6f}")
    print("[generate] nothing published — Moses promotes 'review' -> 'published'.")
    return 0

# ── CLI ───────────────────────────────────────────────────────────
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="BizLegal programmatic-SEO page factory")
    ap.add_argument("--plan", action="store_true", help="print counts per family; write nothing")
    ap.add_argument("--write", action="store_true", help="insert missing rows as status='draft'")
    ap.add_argument("--generate", action="store_true", help="generate text for draft rows and gate it")
    ap.add_argument("--limit", type=int, default=50, help="max rows to write/generate")
    ap.add_argument("--tier", type=int, default=1, help="LLM tier: 1 Gemini free, 2 OpenRouter ':free'")
    ap.add_argument("--hub", default=None, help="restrict to one hub (compliance|solutions|glossary|playbooks)")
    ap.add_argument("--dry-run", action="store_true", help="--generate without writing the result back")
    args = ap.parse_args(argv)

    matrix = load_matrix()
    guides = load_guides()
    if not guides:
        print("[warn] guides.ts produced 0 guides — the playbook family will be empty", file=sys.stderr)

    # --plan is fully offline: matrix JSON + guides.ts, no network, no keys.
    if args.plan:
        return cmd_plan(matrix, guides)
    try:
        if args.write:
            return cmd_write(matrix, guides, args.limit, args.hub)
        if args.generate:
            return cmd_generate(matrix, guides, args.limit, args.tier, args.hub, args.dry_run)
    except SupabaseUnavailable as err:
        print(f"[abort] {err}", file=sys.stderr)
        return 3
    except SupabaseError as err:
        print(f"[error] {err}", file=sys.stderr)
        return 4
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
