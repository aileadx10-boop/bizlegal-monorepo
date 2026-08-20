"""CoGuard FastAPI router — mounted at /coguard in main.py.

Routes:
  POST /coguard/classify  — tone classification for outgoing drafts (Haiku 4.5)
  POST /coguard/biff      — BIFF transformation for hostile drafts (Sonnet 4.6)
  POST /coguard/process   — incoming email pipeline (classify + SHA-256 + Supabase insert + notify)

HMAC-verification reuses the existing hmac_verify.verify_signature() helper.
Redis dedup on incoming messages prevents double-processing if CF retries.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from datetime import datetime, timezone
from typing import Any

import anthropic
import httpx
from fastapi import APIRouter, HTTPException, Request

from hmac_verify import verify_signature
from ops_log import log_event
from storage import get_redis, get_supabase

logger = logging.getLogger(__name__)

coguard_router = APIRouter()

HAIKU_MODEL = "claude-haiku-4-5-20251001"
SONNET_MODEL = "claude-sonnet-4-6"

CLASSIFY_SYSTEM = """You are a co-parenting communication analyst. Score this message on three dimensions (0.0–1.0):
- hostility_score: emotional aggression, accusations, threats, personal attacks
- urgency_score: time-sensitive logistics that need immediate response
- logistics_score: concrete logistical content (pickup times, dates, schedules, finances)

Also identify flags from: threat, profanity, custody_violation, financial_dispute, late_pickup, refusal, alienation

Return JSON only, no other text:
{"hostility_score": 0.0, "urgency_score": 0.0, "logistics_score": 0.0, "biff_needed": false, "flags": []}

biff_needed = true when hostility_score > 0.3"""

BIFF_SYSTEM = """You are a co-parenting communication coach. Rewrite the message using the BIFF method:
- Brief: Keep it short and on-point
- Informative: Include only relevant facts and logistics
- Friendly: Use neutral, respectful language
- Firm: Be clear about needs without being aggressive

Preserve ALL logistical facts (dates, times, amounts, names). Remove emotional language, accusations, and personal attacks.

Return JSON only:
{"biff_text": "...", "changes_summary": "Brief description of what was changed and why"}"""


def _get_anthropic() -> anthropic.Anthropic:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")
    return anthropic.Anthropic(api_key=key)


def _classify_text(text: str) -> dict[str, Any]:
    """Classify co-parenting message tone using Haiku 4.5."""
    client = _get_anthropic()
    msg = client.messages.create(
        model=HAIKU_MODEL,
        max_tokens=256,
        system=CLASSIFY_SYSTEM,
        messages=[{"role": "user", "content": text[:4000]}],
    )
    raw = msg.content[0].text if msg.content else "{}"
    # Extract JSON from response
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        return json.loads(match.group())
    return {"hostility_score": 0.0, "urgency_score": 0.0, "logistics_score": 0.0, "biff_needed": False, "flags": []}


def _biff_transform(text: str) -> dict[str, str]:
    """BIFF-transform a hostile message using Sonnet 4.6."""
    client = _get_anthropic()
    msg = client.messages.create(
        model=SONNET_MODEL,
        max_tokens=1024,
        system=BIFF_SYSTEM,
        messages=[{"role": "user", "content": text[:4000]}],
    )
    raw = msg.content[0].text if msg.content else "{}"
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        return json.loads(match.group())
    return {"biff_text": text, "changes_summary": "No changes made"}


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).digest().hex()


@coguard_router.post("/classify")
async def classify_draft(request: Request) -> dict[str, Any]:
    """Classify outgoing draft tone for CoGuard dashboard."""
    body_bytes = await request.body()

    if not verify_signature(request, body_bytes):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = json.loads(body_bytes)
    text: str = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="text required")

    try:
        result = _classify_text(text)
        log_event("coguard.draft.classified", status="ok", metadata={"hostility_score": result.get("hostility_score"), "biff_needed": result.get("biff_needed")})
        return result
    except Exception as e:
        logger.error("[coguard/classify] error: %s", e)
        log_event("error", status="failed", metadata={"route": "/coguard/classify", "error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))


@coguard_router.post("/biff")
async def biff_transform(request: Request) -> dict[str, Any]:
    """BIFF-transform an outgoing draft using Sonnet 4.6."""
    body_bytes = await request.body()

    if not verify_signature(request, body_bytes):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = json.loads(body_bytes)
    text: str = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="text required")

    try:
        result = _biff_transform(text)
        return result
    except Exception as e:
        logger.error("[coguard/biff] error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@coguard_router.post("/process")
async def process_incoming(request: Request) -> dict[str, Any]:
    """Incoming email pipeline: Redis dedup → classify → SHA-256 → Supabase insert → notify subscriber."""
    body_bytes = await request.body()

    if not verify_signature(request, body_bytes):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = json.loads(body_bytes)
    subscriber_id: str = payload.get("subscriber_id", "")
    message_id: str = payload.get("message_id", "")
    sender: str = payload.get("sender", "")
    subject: str = payload.get("subject", "")
    text: str = payload.get("text", "")
    received_at_raw: str = payload.get("received_at", "")

    if not subscriber_id or not text:
        raise HTTPException(status_code=400, detail="subscriber_id and text required")

    # Redis dedup: prevent double-processing if CF retries the Worker call
    redis = get_redis()
    dedup_key = f"dedupe:coguard:{message_id or hashlib.md5(text[:256].encode()).hexdigest()}"
    if message_id and redis:
        try:
            already = redis.set(dedup_key, "1", ex=172800, nx=True)  # 48h window
            if already is None:
                logger.info("[coguard/process] duplicate message_id=%s — skipped", message_id)
                return {"ok": True, "duplicate": True}
        except Exception as e:
            logger.warning("[coguard/process] redis dedup error (continuing): %s", e)

    # Parse received_at
    try:
        received_at = datetime.fromisoformat(received_at_raw.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        received_at = datetime.now(timezone.utc)

    # Classify tone
    classification: dict[str, Any] = {}
    try:
        classification = _classify_text(text)
    except Exception as e:
        logger.warning("[coguard/process] classify failed (continuing): %s", e)

    # SHA-256 fingerprint
    body_sha256 = _sha256(text)

    # Insert into Supabase (append-only — no UPDATE)
    supabase = get_supabase()
    row = {
        "subscriber_id": subscriber_id,
        "channel": "incoming",
        "sender_id": sender,
        "subject": subject,
        "raw_body": text,
        "body_sha256": body_sha256,
        "hostility_score": classification.get("hostility_score"),
        "logistics_score": classification.get("logistics_score"),
        "urgency_score": classification.get("urgency_score"),
        "flags": json.dumps(classification.get("flags", [])),
        "metadata": json.dumps({"message_id": message_id}),
        "received_at": received_at.isoformat(),
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        res = supabase.table("coguard_messages").insert(row).execute()
        if hasattr(res, "error") and res.error:
            logger.error("[coguard/process] supabase insert error: %s", res.error)
    except Exception as e:
        logger.error("[coguard/process] supabase insert exception: %s", e)

    # Notify subscriber via Resend (fire-and-forget)
    resend_key = os.environ.get("RESEND_API_KEY")
    resend_from = os.environ.get("RESEND_FROM", "noreply@coguard.bizlegal-ai.com")
    if resend_key:
        # Look up subscriber email
        try:
            sub_res = supabase.table("coguard_subscribers").select("email").eq("id", subscriber_id).maybe_single().execute()
            sub_email = sub_res.data.get("email") if sub_res.data else None
        except Exception:
            sub_email = None

        if sub_email:
            hostility = classification.get("hostility_score", 0)
            flags = classification.get("flags", [])
            flag_str = f" Flags: {', '.join(flags)}." if flags else ""
            alert_prefix = "⚠️ High conflict — " if hostility > 0.6 else ""
            notification_body = f"{alert_prefix}New message logged from {sender or 'your co-parent'}.{flag_str}\n\nView in your dashboard: https://coguard.bizlegal-ai.com/dashboard"
            try:
                httpx.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                    json={"from": resend_from, "to": [sub_email], "subject": f"{alert_prefix}New message logged", "text": notification_body},
                    timeout=10.0,
                )
            except Exception as e:
                logger.warning("[coguard/process] notify email failed: %s", e)

    log_event("coguard.message.received", ref_id=subscriber_id, status="ok", metadata={"body_sha256": body_sha256, "hostility_score": classification.get("hostility_score"), "flags": classification.get("flags", [])})

    return {"ok": True, "body_sha256": body_sha256, "classification": classification}
