"""OCI lead-facing referral-contract email.

After the router selects a partner, we send TWO emails:
- notify.resend_partner_email — terse partner-facing intro (existing)
- email_contract.send_referral_contract — transparent intro to the LEAD
  with finder-fee disclosure, 48-hour opt-out, and a reply-all path
  to engage the partner directly.

Composition uses Claude Haiku 4.5 with the prompt at
agents/ea/prompts/oci-referral-contract.md and the template at
agents/ea/templates/referral-contract-template.md as reference. If
the model call fails, we fall back to a hand-written copy that follows
the same disclosure rules — never silently skip the email.

This is intentionally separate from notify.py so the partner-facing
flow stays unchanged when we iterate on lead-facing copy.
"""
from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import httpx

from ops_log import log_event

logger = logging.getLogger(__name__)

HAIKU_MODEL = "claude-haiku-4-5"
DISCLOSURE_VERSION = os.environ.get("DISCLAIMER_VERSION", "v1.0.0-p1")
DEFAULT_OPT_OUT_BASE = os.environ.get(
    "OCI_OPT_OUT_BASE", "https://bizlegal-ai.com/api/oci/optout"
)

# Map router classification → human-friendly subject phrase.
CLASSIFICATION_HUMAN = {
    "UAE_REAL_ESTATE": "UAE real-estate",
    "SG_BUSINESS_SETUP": "Singapore business-setup",
    "EU_US_BUSINESS": "EU/US business",
    "LEGAL_RISK_REPORT": "legal-risk",
    "LOW_VALUE": "compliance",
}

# Map partner.type → human phrase.
PARTNER_TYPE_HUMAN = {
    "re_lawyer": "real-estate counsel",
    "business_lawyer": "business counsel",
    "structuring_advisor": "structuring advisor",
    "family_office_advisor": "family-office advisor",
    "realtor": "licensed realtor",
    "placeholder": "specialist partner",
}

PROMPT_PATH = Path(__file__).parent.parent.parent.parent / "agents/ea/prompts/oci-referral-contract.md"


def _load_system_prompt() -> str:
    """Strip the YAML front-matter from the prompt file; the rest is the system prompt."""
    raw = PROMPT_PATH.read_text(encoding="utf-8")
    # Drop the leading frontmatter block delimited by --- ... ---
    m = re.match(r"^---\n.*?\n---\n", raw, re.DOTALL)
    return raw[m.end():] if m else raw


def _humanize_classification(classification: str) -> str:
    return CLASSIFICATION_HUMAN.get(classification, classification.replace("_", " ").lower())


def _humanize_partner_type(ptype: str) -> str:
    return PARTNER_TYPE_HUMAN.get(ptype, ptype.replace("_", " "))


def _short_lead_id(lead_id: str) -> str:
    return (lead_id or "").replace("-", "")[-8:].upper()


def _first_name(contact_name: str | None) -> str:
    if not contact_name:
        return "there"
    return contact_name.strip().split()[0] or "there"


def _build_user_prompt(
    *,
    lead_record: dict[str, Any],
    partner: dict[str, Any],
    opt_out_url: str,
    reply_to: str,
) -> str:
    classification = lead_record.get("classification") or "LOW_VALUE"
    return (
        f"LEAD_FIRST_NAME: {_first_name(lead_record.get('contact_name'))}\n"
        f"CLASSIFICATION: {classification}\n"
        f"CLASSIFICATION_HUMAN: {_humanize_classification(classification)}\n"
        f"PAIN_POINT: {(lead_record.get('pain_point') or '').strip()[:300]}\n"
        f"PARTNER_NAME: {partner.get('name', 'a vetted partner')}\n"
        f"PARTNER_TYPE_HUMAN: {_humanize_partner_type(partner.get('type', ''))}\n"
        f"PARTNER_JURIS: {' / '.join(partner.get('jurisdictions') or []) or 'multiple jurisdictions'}\n"
        f"LEAD_ID_SHORT: {_short_lead_id(str(lead_record.get('lead_id', '')))}\n"
        f"OPT_OUT_URL: {opt_out_url}\n"
        f"REPLY_TO: {reply_to}\n"
        f"DISCLOSURE_VERSION: {DISCLOSURE_VERSION}\n"
        f"\n"
        f"Compose the email now. Output ONLY the JSON object."
    )


def _compose_via_haiku(
    *,
    lead_record: dict[str, Any],
    partner: dict[str, Any],
    opt_out_url: str,
    reply_to: str,
) -> dict[str, str] | None:
    api_key = (
        os.environ.get("ANTHROPIC_API_KEY")
        or os.environ.get("ANTHROPIC_API_KEY_ENRICH")
    )
    if not api_key:
        logger.warning("[email_contract] no Anthropic key; falling back to template")
        return None

    try:
        system_prompt = _load_system_prompt()
    except OSError as exc:
        logger.warning("[email_contract] could not load prompt file: %s", exc)
        return None

    user_prompt = _build_user_prompt(
        lead_record=lead_record,
        partner=partner,
        opt_out_url=opt_out_url,
        reply_to=reply_to,
    )

    payload = {
        "model": HAIKU_MODEL,
        "max_tokens": 800,
        "temperature": 0.2,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_prompt},
            {"role": "assistant", "content": "{"},
        ],
    }
    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("[email_contract] Haiku call failed: %s", exc)
        return None

    text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
    candidate = "{" + text  # we prefilled "{"
    # Defensive JSON extraction — model can wrap in prose despite the prefill.
    m = re.search(r"\{[\s\S]*\}", candidate)
    if not m:
        logger.warning("[email_contract] no JSON in Haiku response: %s", candidate[:300])
        return None
    try:
        parsed = json.loads(m.group(0))
    except json.JSONDecodeError as exc:
        logger.warning("[email_contract] JSON parse failed: %s; raw=%s", exc, m.group(0)[:300])
        return None

    subject = (parsed.get("subject") or "").strip()
    body = (parsed.get("body_text") or "").strip()
    if not subject or not body:
        logger.warning("[email_contract] Haiku returned empty subject/body")
        return None
    return {"subject": subject[:200], "body_text": body}


def _fallback_email(
    *,
    lead_record: dict[str, Any],
    partner: dict[str, Any],
    opt_out_url: str,
    reply_to: str,
) -> dict[str, str]:
    """Hand-written fallback that mirrors the template — used when Haiku fails.

    The disclosure block is identical to the template's hard requirement, so
    fallback output remains compliant even without the model in the loop.
    """
    classification = lead_record.get("classification") or "LOW_VALUE"
    classification_human = _humanize_classification(classification)
    partner_name = partner.get("name", "a vetted partner")
    partner_type_human = _humanize_partner_type(partner.get("type", ""))
    partner_juris = " / ".join(partner.get("jurisdictions") or []) or "multiple jurisdictions"
    pain_point = (lead_record.get("pain_point") or "").strip()
    lead_id_short = _short_lead_id(str(lead_record.get("lead_id", "")))
    first_name = _first_name(lead_record.get("contact_name"))

    subject = (
        f"BizLegal-AI Intelligence — introduction to {partner_name} re your "
        f"{classification_human} matter"
    )[:200]
    body = (
        f"Hi {first_name},\n\n"
        f"Thanks for the inbound to BizLegal-AI. Based on what you shared "
        f"({pain_point or 'your inquiry'}), I'm introducing you to "
        f"{partner_name}, {partner_type_human} covering {partner_juris}. "
        f"They're set up to scope the engagement directly with you.\n\n"
        f"How this works (transparent):\n"
        f"- BizLegal-AI Intelligence operates a regulatory-intelligence "
        f"platform. We do not represent you on this matter.\n"
        f"- {partner_name} sets their own scope, fees, and engagement terms "
        f"with you. We are not party to that engagement.\n"
        f"- BizLegal-AI may receive a finder fee from {partner_name} if an "
        f"engagement closes. The fee does not increase what you pay them and "
        f"is disclosed here under {DISCLOSURE_VERSION}.\n\n"
        f"Next step: reply-all to this thread to begin scoping with "
        f"{partner_name}. If you'd prefer we don't make this introduction, "
        f"reply with \"stop\" or click {opt_out_url} within 48 hours and "
        f"the introduction will not proceed.\n\n"
        f"Reference: {lead_id_short}\n\n"
        f"— BizLegal-AI Intelligence\n"
        f"{reply_to}"
    )
    return {"subject": subject, "body_text": body}


def send_referral_contract(
    lead_record: dict[str, Any],
    partner: dict[str, Any],
) -> dict[str, Any] | None:
    """Send the lead-facing referral-contract email. Idempotent guards live
    upstream (deduper in main.py); this function fires once per call.

    Returns the Resend response dict on success, None on any skip
    (missing key / no email / fatal compose+send failure).
    """
    lead_email = (lead_record.get("contact_email") or "").strip().lower()
    if not lead_email:
        logger.info("[email_contract] no lead email; skipping")
        return None

    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.warning("[email_contract] RESEND_API_KEY missing; skipping")
        return None

    sender = os.environ.get(
        "RESEND_REFERRAL_FROM",
        os.environ.get(
            "RESEND_FROM",
            "BizLegal-AI Intelligence <referrals@intelligence.bizlegal-ai.com>",
        ),
    )
    reply_to = os.environ.get("RESEND_REPLY_TO", "team@bizlegal-ai.com")
    moses_cc = os.environ.get("OCI_REFERRAL_CC", "mdmdmd63@gmail.com")

    lead_id = str(lead_record.get("lead_id") or "")
    opt_out_url = f"{DEFAULT_OPT_OUT_BASE}?lead_id={lead_id}"

    composed = _compose_via_haiku(
        lead_record=lead_record,
        partner=partner,
        opt_out_url=opt_out_url,
        reply_to=reply_to,
    )
    used_fallback = False
    if composed is None:
        composed = _fallback_email(
            lead_record=lead_record,
            partner=partner,
            opt_out_url=opt_out_url,
            reply_to=reply_to,
        )
        used_fallback = True

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender,
                    "to": [lead_email],
                    "cc": [moses_cc] if moses_cc else [],
                    "reply_to": reply_to,
                    "subject": composed["subject"],
                    "text": composed["body_text"],
                    "headers": {
                        "List-Unsubscribe": f"<{opt_out_url}>, <mailto:{reply_to}?subject=stop>",
                        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                    },
                },
            )
            resp.raise_for_status()
            result = resp.json()
    except Exception as exc:
        logger.exception("[email_contract] Resend send failed for %s: %s", lead_email, exc)
        log_event(
            "referral.contract_email",
            ref_id=lead_id,
            email=lead_email,
            status="failed",
            metadata={
                "partner_id": partner.get("id"),
                "partner_name": partner.get("name"),
                "fallback": used_fallback,
                "error": str(exc)[:200],
            },
        )
        return None

    log_event(
        "referral.contract_email",
        ref_id=lead_id,
        email=lead_email,
        status="ok",
        metadata={
            "partner_id": partner.get("id"),
            "partner_name": partner.get("name"),
            "classification": lead_record.get("classification"),
            "fallback": used_fallback,
            "disclosure_version": DISCLOSURE_VERSION,
        },
    )
    return result
