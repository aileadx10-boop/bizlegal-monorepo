"""Notify: Telegram (HOT only) + Resend (terse + disclosure, CC Moses)."""
from __future__ import annotations

import logging
import os
from typing import Any

import httpx

from ops_log import log_event

logger = logging.getLogger(__name__)

DISCLOSURE_PARAGRAPH = (
    "Disclosure: BizLegal-AI Intelligence is a regulatory-intelligence "
    "platform operated by DOR INNOVATIONS. The introduction is provided "
    "on a finder-fee basis under written disclosure; we do not act as "
    "your legal counsel for the underlying matter unless engaged "
    "separately. You retain full authority over the engagement, fees, "
    "and scope with the introduced partner. Disclosure version v1.0.0-p1."
)


def _post(url: str, *, json: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> dict[str, Any]:
    with httpx.Client(timeout=15.0) as client:
        resp = client.post(url, json=json, headers=headers)
        resp.raise_for_status()
        try:
            return resp.json()
        except Exception:
            return {"ok": True}


def telegram_alert_if_hot(lead_record: dict[str, Any]) -> dict[str, Any] | None:
    if (lead_record.get("priority") or "").upper() != "HOT":
        return None

    # V0.1 — mirror the HOT alert to the shared ops_events stream so
    # /ops sees high-priority referrals alongside the Telegram ping.
    # Fires regardless of whether Telegram envs are set so visibility
    # holds even if the Telegram bot is misconfigured on this VM.
    log_event(
        "referral.alert",
        ref_id=str(lead_record.get("lead_id") or ""),
        email=lead_record.get("contact_email"),
        status="ok",
        metadata={
            "priority": "HOT",
            "classification": lead_record.get("classification"),
            "action": lead_record.get("action"),
            "recommended_partner": lead_record.get("recommended_partner"),
            "recommended_offer": lead_record.get("recommended_offer"),
            "confidence": lead_record.get("confidence"),
            "buyer_type": lead_record.get("buyer_type"),
            "intent": lead_record.get("intent"),
            "budget_signal": lead_record.get("budget_signal"),
        },
    )

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        logger.warning("Telegram env missing; skipping alert")
        return None
    text = (
        "*HOT lead routed*\n"
        f"Class: `{lead_record.get('classification')}`\n"
        f"Action: `{lead_record.get('action')}`\n"
        f"Partner: `{lead_record.get('recommended_partner')}`\n"
        f"Offer: {lead_record.get('recommended_offer') or '—'}\n"
        f"Confidence: {lead_record.get('confidence')}\n"
        f"Why: {lead_record.get('one_sentence_rationale')}\n"
        f"Lead: `{lead_record.get('lead_id')}`"
    )
    return _post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True,
        },
    )


def _terse_email_body(lead_record: dict[str, Any], partner_name: str) -> str:
    return (
        f"Hi {partner_name},\n\n"
        "BizLegal-AI Intelligence has matched a high-fit inbound lead "
        "to your practice. Summary below; a fuller brief can be shared "
        "on reply.\n\n"
        f"Classification: {lead_record.get('classification')}\n"
        f"Pain point: {lead_record.get('pain_point')}\n"
        f"Buyer type: {lead_record.get('buyer_type')}\n"
        f"Intent / Budget: {lead_record.get('intent')} / {lead_record.get('budget_signal')}\n"
        f"Recommended offer: {lead_record.get('recommended_offer') or '—'}\n"
        f"Why we routed it to you: {lead_record.get('one_sentence_rationale')}\n\n"
        "Reply to this thread to claim. team@bizlegal-ai.com is the "
        "live address; Moses is CC'd.\n\n"
        f"{DISCLOSURE_PARAGRAPH}\n"
    )


def resend_partner_email(
    lead_record: dict[str, Any],
    partner_name: str,
    partner_email: str,
) -> dict[str, Any] | None:
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.warning("RESEND_API_KEY missing; skipping email")
        return None
    sender = os.environ.get("RESEND_FROM", "BizLegal-AI <team@intelligence.bizlegal-ai.com>")
    reply_to = os.environ.get("RESEND_REPLY_TO", "team@bizlegal-ai.com")
    # D10 SECURITY-V3 M-1: founder PII was hardcoded as CC on every
    # partner intro. Now driven by env so the CC can be a shared inbox
    # (e.g. team@bizlegal-ai.com) and rotated independently. Empty
    # string disables the CC entirely.
    moses_cc = os.environ.get("OCI_PARTNER_CC", "")
    classification = lead_record.get("classification") or "lead"
    subject = f"BizLegal-AI Intelligence — {classification} match ({lead_record.get('lead_id')})"
    body = _terse_email_body(lead_record, partner_name)
    payload: dict[str, Any] = {
        "from": sender,
        "to": [partner_email],
        "reply_to": reply_to,
        "subject": subject,
        "text": body,
    }
    if moses_cc:
        payload["cc"] = [moses_cc]
    return _post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
    )
