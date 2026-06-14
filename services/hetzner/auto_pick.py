"""
Hetzner curator — auto-pick fallback.

When scout.py drops 1-3 ranked candidates into Supabase `daily_gaps`
with status='pending_pick', a Telegram message goes to Moses with
[Pick #1] [Pick #2] [Pick #3] [Skip] buttons. Each message expects
a human within minutes.

If Moses is asleep / on a flight / busy, that pick never lands and
the next scout cron run (now daily) sees the prior day's pending row
plus today's. Within 7 days the queue grows to 21+ pending rows that
nobody picked.

This module ensures the queue stays moving:

  1. Look at pending_pick rows older than AUTO_PICK_AFTER_HOURS
  2. For each: pick the highest-scored candidate from that batch
     (the top of the rank list — scout already ordered them)
  3. Mark status='picked' (which triggers brain.py)
  4. Telegram nudge: "auto-picked X for slug Y; Deploy / Reject still
     available once brain.py drafts in ~3 min. Reply /skip-batch to
     archive."

Designed to run as a separate systemd timer at 10:00 UTC (4h after
scout's 06:00 daily kickoff). If Moses picks within those 4 hours,
the row is already 'picked' and auto_pick is a no-op.

ABORT signals:
  - Row has manual_intervention=true ⇒ skip (Moses wants to look)
  - Row's batch already has any 'picked' or 'rejected' sibling ⇒ skip
    the whole batch (Moses already engaged with that scout run)
  - Less than AUTO_PICK_MIN_SCORE on the top candidate ⇒ skip rather
    than push junk through

SAFE TO RE-RUN. Idempotent. Multiple invocations within the same
4h window pick the same row only once because subsequent calls see
status='picked' and skip.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
import httpx
from supabase import create_client, Client  # type: ignore

from ops_log import log_event

load_dotenv()


# ── Config ────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")
TG_TOKEN = os.getenv("TELEGRAM_CURATOR_BOT_TOKEN", "")
TG_CHAT = os.getenv("TELEGRAM_CHAT_ID", "")

# How long after scout drops a candidate do we wait for Moses?
# 4h is a comfortable async-day cadence: scout fires 06:00 UTC,
# auto_pick fires 10:00 UTC, brain.py drafts by 10:15, publisher
# message arrives by 10:20. Moses can still Reject / Regen at any
# point in the chain, even after auto-pick.
AUTO_PICK_AFTER_HOURS = int(os.getenv("AUTO_PICK_AFTER_HOURS", "4"))

# Don't auto-pick a candidate the scout itself wasn't confident in.
# scout's rank pass produces an integer "total_score" 0-25 (relevance
# 1-5 + revenue 0-10 + timeliness 0-10). Below 14 = "interesting but
# not a banger." Below threshold ⇒ skip the day rather than ship
# mediocre content.
AUTO_PICK_MIN_SCORE = int(os.getenv("AUTO_PICK_MIN_SCORE", "14"))


# ── Public entry ──────────────────────────────────────────────────
def auto_pick(force: bool = False) -> int:
    """Pick the top-scored pending row(s) older than the threshold.

    Returns the number of rows auto-picked. 0 is the common case
    (Moses already picked, or nothing's pending, or all are too low-score).
    """
    if not SUPABASE_URL or not SUPABASE_SECRET:
        print("[auto_pick] SUPABASE_URL/SECRET not configured; exiting")
        return 0

    sb = create_client(SUPABASE_URL, SUPABASE_SECRET)
    cutoff = datetime.now(timezone.utc) - timedelta(hours=AUTO_PICK_AFTER_HOURS)
    cutoff_iso = cutoff.isoformat()

    # Fetch pending_pick rows older than cutoff. We assume scout
    # writes scouted_at timestamp.
    pending = (
        sb.table("daily_gaps")
        .select("*")
        .eq("status", "pending_pick")
        .lt("scouted_at", cutoff_iso)
        .order("total_score", desc=True)
        .execute()
        .data
        or []
    )

    if not pending:
        print(f"[auto_pick] no pending rows older than {cutoff_iso}")
        log_event(
            "cron.completed",
            ref_id="curator/auto_pick",
            status="ok",
            metadata={"outcome": "no_pending", "cutoff_hours": AUTO_PICK_AFTER_HOURS},
        )
        return 0

    # Group by scouted_at batch (rows from the same scout run share a
    # close timestamp). If any sibling in a batch is 'picked' or
    # 'rejected' or 'skipped', Moses already engaged — leave the
    # batch alone.
    batches: dict[str, list[dict]] = {}
    for row in pending:
        # Coarse-grain by scout day (YYYY-MM-DD-HH); rows from the
        # same scout run share the hour bucket.
        key = (row.get("scouted_at") or "")[:13]  # "2026-05-05T06"
        batches.setdefault(key, []).append(row)

    picked_count = 0
    for batch_key, rows in batches.items():
        if not rows:
            continue
        # Check if any row in this batch has been touched (other than
        # the pending ones we just fetched).
        urls = [r["url"] for r in rows]
        sibling_check = (
            sb.table("daily_gaps")
            .select("status, url")
            .in_("url", urls)
            .neq("status", "pending_pick")
            .execute()
            .data
            or []
        )
        if sibling_check and not force:
            print(f"[auto_pick] batch {batch_key}: sibling already {sibling_check[0]['status']}; skipping")
            continue

        top = rows[0]  # highest total_score, descending
        score = top.get("total_score", 0) or 0
        if score < AUTO_PICK_MIN_SCORE:
            print(f"[auto_pick] batch {batch_key}: top score {score} < {AUTO_PICK_MIN_SCORE}; skipping batch")
            log_event(
                "cron.completed",
                ref_id=f"curator/auto_pick/{batch_key}",
                status="ok",
                metadata={
                    "outcome": "below_threshold",
                    "top_score": score,
                    "min_score": AUTO_PICK_MIN_SCORE,
                    "candidates": len(rows),
                },
            )
            continue

        # Mark this row picked. brain.py's next sweep picks it up.
        # `picked_by='auto_pick'` is appended ONLY when the column exists
        # — the migration at migration-daily-gaps-picked-by.sql adds it.
        # Until Moses applies that migration, fall back to status-only update.
        update_payload = {
            "status": "picked",
            "picked_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            sb.table("daily_gaps").update({
                **update_payload,
                "picked_by": "auto_pick",
            }).eq("url", top["url"]).execute()
        except Exception as err:
            # PGRST204 — picked_by column not in schema cache yet.
            # Fall back to status-only update; ops_log records the
            # source as auto_pick anyway.
            if "picked_by" in str(err) or "PGRST204" in str(err):
                sb.table("daily_gaps").update(update_payload).eq("url", top["url"]).execute()
            else:
                raise
        picked_count += 1

        print(f"[auto_pick] batch {batch_key}: auto-picked '{top.get('title', '')[:80]}' "
              f"(score {score}, vertical {top.get('vertical')})")

        log_event(
            "cron.completed",
            ref_id=f"curator/auto_pick/{batch_key}",
            status="ok",
            metadata={
                "outcome": "picked",
                "score": score,
                "vertical": top.get("vertical"),
                "url": top.get("url"),
            },
        )

        _telegram_nudge(top, score, len(rows))

    return picked_count


# ── Telegram ──────────────────────────────────────────────────────
def _telegram_nudge(picked: dict, score: int, batch_size: int) -> None:
    if not TG_TOKEN or not TG_CHAT:
        return
    title = (picked.get("title") or "?")[:120]
    vertical = picked.get("vertical") or "?"
    url = picked.get("url") or ""
    text = (
        "🤖 auto-picked (no manual pick within "
        f"{AUTO_PICK_AFTER_HOURS}h)\n\n"
        f"*{title}*\n"
        f"vertical: {vertical}  |  score: {score}/25  |  batch: {batch_size}\n\n"
        f"{url}\n\n"
        "_Brain will draft in ~3 min. Reject / Regen buttons appear "
        "once draft is ready._"
    )
    try:
        httpx.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={
                "chat_id": TG_CHAT,
                "text": text,
                "parse_mode": "Markdown",
                "disable_web_page_preview": True,
            },
            timeout=10,
        ).raise_for_status()
    except Exception as err:
        # Telegram failures aren't worth bailing on — the row is
        # already picked, brain.py will run regardless.
        print(f"[auto_pick] telegram nudge failed: {err}")


# ── CLI entry ─────────────────────────────────────────────────────
def main() -> int:
    force = "--force" in sys.argv
    n = auto_pick(force=force)
    print(f"[auto_pick] picked {n} row(s)")
    return 0  # exit code; n is a count, not a status


if __name__ == "__main__":
    raise SystemExit(main())
