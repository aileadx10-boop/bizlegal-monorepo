"""
Hetzner curator — Telegram bot listener.

Long-poll Telegram for callback queries from the BIZLEGALFORGEBOT.
Handles two manual gates:
  Gate 1 (topic pick): "pick:<url>" or "pick:skip"
                       → flips daily_gaps.status to 'picked' or 'skipped'
                       → triggers brain.py for the picked row
  Gate 2 (page approve): "deploy:<slug>" / "regen:<slug>" / "reject:<slug>"
                       → posts to publisher.py HTTP endpoint on :8082

This service is the long-running process; the brain + publisher run as
short-lived subprocesses or HTTP calls. systemd unit:
  curator-bot.service

Run as: python bot.py (reads .env)
"""
from __future__ import annotations

import asyncio
import os
import socket
import subprocess
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv
from supabase import create_client, Client  # type: ignore
from telegram import Update
from telegram.ext import Application, CallbackQueryHandler, ContextTypes

from ops_log import log_event

load_dotenv()

TG_TOKEN = os.getenv("TELEGRAM_CURATOR_BOT_TOKEN", "")
TG_CHAT = os.getenv("TELEGRAM_CHAT_ID", "")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")

PUBLISHER_PORT = os.getenv("PUBLISHER_HTTP_PORT", "8082")
PUBLISHER_URL = f"http://127.0.0.1:{PUBLISHER_PORT}"

CURATOR_DIR = "/opt/bizlegal/curator"
PYTHON_BIN = "/opt/bizlegal/venv/bin/python"


def sb_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SECRET)


# ── Auth gate (only Moses) ───────────────────────────────────────
def is_authorized(update: Update) -> bool:
    if not TG_CHAT:
        return False
    user_id = (update.effective_user.id if update.effective_user else None)
    return str(user_id) == TG_CHAT


# ── Gate 1: topic pick ─────────────────────────────────────────
async def handle_pick(query, payload: str) -> None:
    if payload == "skip":
        sb_client().table("daily_gaps").update({
            "status": "skipped",
            "actioned_at": datetime.now(timezone.utc).isoformat(),
        }).eq("status", "pending_pick").execute()
        await query.edit_message_text("⏭ Skipped this batch. Next scout: Mon/Wed/Fri 06:00 UTC.")
        log_event(
            "curation.action",
            ref_id="curator/bot/pick",
            status="ok",
            metadata={"action": "skip", "url": None},
        )
        return

    url = payload  # picked URL
    sb = sb_client()
    sb.table("daily_gaps").update({
        "status": "picked",
        "picked_at": datetime.now(timezone.utc).isoformat(),
    }).eq("url", url).execute()
    # Set the others in this batch to 'archived'
    sb.table("daily_gaps").update({
        "status": "archived",
        "actioned_at": datetime.now(timezone.utc).isoformat(),
    }).eq("status", "pending_pick").neq("url", url).execute()

    await query.edit_message_text("✅ Pick noted. Brain step starting now — preview will arrive when ready.")
    # Trigger brain.py asynchronously so the bot stays responsive.
    subprocess.Popen(
        [PYTHON_BIN, f"{CURATOR_DIR}/brain.py"],
        cwd=CURATOR_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    log_event(
        "curation.action",
        ref_id=f"curator/bot/pick",
        status="ok",
        metadata={"action": "pick", "url": url},
    )


# ── Gate 2: page approve ───────────────────────────────────────
async def handle_page_action(query, action: str, slug: str) -> None:
    try:
        async with httpx.AsyncClient(timeout=30) as cx:
            res = await cx.post(f"{PUBLISHER_URL}/{action}", json={"slug": slug})
            res.raise_for_status()
            data = res.json()
    except Exception as err:
        await query.edit_message_text(f"❌ {action} failed: {err}")
        log_event(
            "curation.action",
            ref_id=f"curator/bot/{slug}",
            status="failed",
            metadata={"action": action, "slug": slug, "error": str(err)[:200]},
        )
        return

    msg_map = {
        "deploy": f"✅ Deployed: {data.get('blog_url') or slug}",
        "regen":  f"🔁 Regenerating draft for {slug} (different temperature). New preview incoming.",
        "reject": f"🗑 Rejected {slug}. Status archived.",
    }
    await query.edit_message_text(msg_map.get(action, f"OK: {slug}"))
    log_event(
        "curation.action",
        ref_id=f"curator/bot/{slug}",
        status="ok",
        metadata={
            "action": action,
            "slug": slug,
            "blog_url": data.get("blog_url"),
            "hub_url": data.get("hub_url"),
            "forge_url": data.get("forge_url"),
            "forge_pushed": data.get("forge_pushed"),
        },
    )


# ── Router ──────────────────────────────────────────────────────
async def callback_handler(update: Update, _ctx: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not query or not query.data:
        return
    await query.answer()
    if not is_authorized(update):
        await query.edit_message_text("Unauthorized.")
        return
    parts = query.data.split(":", 1)
    if len(parts) != 2:
        await query.edit_message_text(f"Unrecognised callback: {query.data}")
        return
    kind, payload = parts
    if kind == "pick":
        await handle_pick(query, payload)
    elif kind in ("deploy", "regen", "reject"):
        await handle_page_action(query, kind, payload)
    else:
        await query.edit_message_text(f"Unknown action: {kind}")


async def _heartbeat_loop(service_name: str, interval_s: int = 300) -> None:
    """Fire heartbeat ops events every 5min so /ops can detect a stuck process."""
    host = socket.gethostname()
    # Initial heartbeat on startup (latency from systemd start to first event = up signal).
    log_event(
        "heartbeat",
        ref_id=f"curator/{service_name}",
        status="ok",
        metadata={"service": service_name, "host": host, "phase": "startup"},
    )
    while True:
        try:
            await asyncio.sleep(interval_s)
            log_event(
                "heartbeat",
                ref_id=f"curator/{service_name}",
                status="ok",
                metadata={"service": service_name, "host": host, "phase": "tick"},
            )
        except asyncio.CancelledError:
            return
        except Exception as exc:
            # Heartbeat failures must never kill the bot.
            print(f"[bot] heartbeat loop error: {exc}")


async def _post_init(application: Application) -> None:
    """Schedule the heartbeat loop alongside Telegram long-polling."""
    application.create_task(_heartbeat_loop("bot"))


def main() -> None:
    if not TG_TOKEN:
        raise RuntimeError("TELEGRAM_CURATOR_BOT_TOKEN not configured")
    app = Application.builder().token(TG_TOKEN).post_init(_post_init).build()
    app.add_handler(CallbackQueryHandler(callback_handler))
    print("[bot] BIZLEGALFORGEBOT listener up. Polling for callbacks…")
    app.run_polling()


if __name__ == "__main__":
    main()
