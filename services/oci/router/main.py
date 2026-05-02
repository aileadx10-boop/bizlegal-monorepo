"""FastAPI app — POST /lead is the production entrypoint.

Routes:
  POST /lead       — HMAC-verified inbound from EA Worker or hub form
  GET  /health     — liveness + redis + supabase status
  GET  /partners   — admin list (X-Admin-Secret)
  POST /feedback   — admin update lead.outcome (X-Admin-Secret)
  GET  /payouts    — admin list payouts_open (X-Admin-Secret)
"""
from __future__ import annotations

import json
import logging
import os
import uuid
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse

from hmac_verify import verify_signature
from llm import classify
from notify import resend_partner_email, telegram_alert_if_hot
from ops_log import log_event
from partners import select_partner
from storage import (
    get_redis,
    redis_health,
    store_lead,
    store_payout_pending,
    supabase_get,
    supabase_health,
    supabase_patch,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))

app = FastAPI(title="bizlegal deal-router", version="v1.0.0-p1")

DISCLAIMER_VERSION = os.environ.get("DISCLAIMER_VERSION", "v1.0.0-p1")
DEDUPE_TTL_SECONDS = 60 * 60 * 24  # 24h


def _require_admin(secret: str | None) -> None:
    expected = os.environ.get("ROUTER_ADMIN_SECRET")
    if not expected or secret != expected:
        raise HTTPException(status_code=401, detail="unauthorized")


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "version": "v1.0.0-p1",
        "redis": "up" if redis_health() else "down",
        "supabase": "up" if supabase_health() else "down",
    }


@app.post("/lead")
async def ingest_lead(
    request: Request,
    x_bizlegal_signature: str | None = Header(default=None, alias="x-bizlegal-signature"),
) -> JSONResponse:
    body = await request.body()
    if not verify_signature(body, x_bizlegal_signature):
        raise HTTPException(status_code=401, detail="bad signature")
    try:
        payload = json.loads(body or b"{}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="invalid json")

    # Two shapes accepted:
    # 1. Hub form / direct: {text, lead_id?, source?, contact_*, ...}
    # 2. EA Worker: {schema_version, classification, lead: <LeadProfile>}
    worker_lead = payload.get("lead") or {}
    pain = (worker_lead.get("pain") or {}) if isinstance(worker_lead, dict) else {}
    contact = (worker_lead.get("contact") or {}) if isinstance(worker_lead, dict) else {}
    lead_text = (
        payload.get("text")
        or payload.get("raw_text")
        or pain.get("raw_text")
        or pain.get("extracted_challenge")
        or ""
    ).strip()
    if not lead_text:
        raise HTTPException(status_code=400, detail="empty lead text")

    lead_id = (
        payload.get("lead_id")
        or worker_lead.get("lead_id")
        or worker_lead.get("id")
        or str(uuid.uuid4())
    )
    rds = get_redis()
    if rds.set(f"dedupe:{lead_id}", "1", ex=DEDUPE_TTL_SECONDS, nx=True) is None:
        return JSONResponse(
            content={"ok": True, "lead_id": lead_id, "deduped": True},
            status_code=200,
        )

    parsed = classify(lead_text)
    output = parsed.get("output") or {}
    eval_scores = parsed.get("evaluation_scores") or {}

    classification = output.get("classification") or "LOW_VALUE"
    action = output.get("action") or "IGNORE"
    recommended_partner = output.get("recommended_partner") or "none"

    chosen_partner: dict[str, Any] | None = None
    if action == "ROUTE_PARTNER":
        chosen_partner = select_partner(classification, recommended_partner)

    record = {
        "lead_id": lead_id,
        "source": payload.get("source") or ("ea_worker" if worker_lead else "hub_form"),
        "source_url": payload.get("source_url") or worker_lead.get("source_url"),
        "utm_source": payload.get("utm_source") or worker_lead.get("utm_source"),
        "utm_medium": payload.get("utm_medium") or worker_lead.get("utm_medium"),
        "utm_campaign": payload.get("utm_campaign") or worker_lead.get("utm_campaign"),
        "referrer": payload.get("referrer") or worker_lead.get("referrer"),
        "user_agent": payload.get("user_agent") or worker_lead.get("user_agent"),
        "ip_country": payload.get("ip_country") or worker_lead.get("ip_country"),
        "contact_name": payload.get("contact_name") or contact.get("name"),
        "contact_email": payload.get("contact_email") or contact.get("email"),
        "contact_phone": payload.get("contact_phone") or contact.get("phone"),
        "contact_role": payload.get("contact_role") or contact.get("role"),
        "raw_text": lead_text,
        "classification": classification,
        "buyer_type": output.get("buyer_type"),
        "pain_point": output.get("pain_point"),
        "intent": output.get("intent"),
        "budget_signal": output.get("budget_signal"),
        "priority": output.get("priority"),
        "action": action,
        "recommended_partner": recommended_partner,
        "recommended_offer": output.get("recommended_offer"),
        "partner_id": chosen_partner["id"] if chosen_partner else None,
        "confidence": output.get("confidence"),
        "one_sentence_rationale": output.get("one_sentence_rationale"),
        "next_step": output.get("next_step"),
        "evaluation_scores": eval_scores,
        "optimized_final_version": parsed.get("optimized_final_version"),
        "disclaimer_version": output.get("disclaimer_version") or DISCLAIMER_VERSION,
        "router_model": parsed.get("_router_model"),
        "escalated_to_sonnet": parsed.get("_escalated_to_sonnet", False),
        "raw_llm_response": {"text": parsed.get("_raw_response", "")[:8000]},
        "outcome": "pending" if action == "ROUTE_PARTNER" else None,
    }
    store_lead(record)

    # Always emit referral.received so /ops sees the funnel intake.
    log_event(
        "referral.received",
        ref_id=lead_id,
        email=record.get("contact_email"),
        status="ok",
        metadata={
            "classification": classification,
            "buyer_type": record.get("buyer_type"),
            "priority": record.get("priority"),
            "intent": record.get("intent"),
            "budget_signal": record.get("budget_signal"),
            "ip_country": record.get("ip_country"),
            "source": record.get("source"),
            "action": action,
            "router_model": record.get("router_model"),
            "escalated_to_sonnet": record.get("escalated_to_sonnet", False),
            "confidence": record.get("confidence"),
        },
    )

    if action == "ROUTE_PARTNER" and chosen_partner is not None:
        try:
            resend_partner_email(record, chosen_partner["name"], chosen_partner["email"])
            supabase_patch(
                "deal_router_leads",
                params={"lead_id": f"eq.{lead_id}"},
                body={"partner_emailed_at": "now()"},
            )
        except Exception as exc:
            logger.exception("partner email failed: %s", exc)
        try:
            store_payout_pending(lead_id, chosen_partner["id"], commission_usd=0)
        except Exception as exc:
            logger.exception("payout row failed: %s", exc)
        # referral.routed fires once the dispatch is in motion (email +
        # payout row); status='pending' since closure is downstream.
        log_event(
            "referral.routed",
            ref_id=lead_id,
            email=chosen_partner.get("email"),
            status="pending",
            metadata={
                "partner_id": chosen_partner["id"],
                "partner_name": chosen_partner.get("name"),
                "partner_jurisdictions": chosen_partner.get("jurisdictions"),
                "partner_tier": chosen_partner.get("tier"),
                "classification": classification,
                "recommended_partner": recommended_partner,
                "priority": record.get("priority"),
            },
        )
    elif action == "ROUTE_PARTNER" and chosen_partner is None:
        # Lead would have been routed but no partner matched (capacity,
        # jurisdiction, or active=false). Surface this as a referral.received
        # with status=failed so /ops shows unmatched volume.
        log_event(
            "referral.received",
            ref_id=lead_id,
            email=record.get("contact_email"),
            status="failed",
            metadata={
                "classification": classification,
                "outcome": "unmatched",
                "recommended_partner": recommended_partner,
            },
        )

    try:
        telegram_alert_if_hot(record)
    except Exception as exc:
        logger.exception("telegram alert failed: %s", exc)

    return JSONResponse(
        content={
            "ok": True,
            "lead_id": lead_id,
            "classification": classification,
            "action": action,
            "priority": record.get("priority"),
            "partner_id": record.get("partner_id"),
        },
        status_code=200,
    )


@app.get("/partners")
def list_partners(
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
) -> list[dict[str, Any]]:
    _require_admin(x_admin_secret)
    return supabase_get(
        "partners",
        params={"select": "id,name,email,type,jurisdictions,active,tier,weekly_cap,current_week_count"},
    )


@app.post("/feedback")
async def feedback(
    request: Request,
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
) -> dict[str, Any]:
    _require_admin(x_admin_secret)
    payload = await request.json()
    lead_id = payload.get("lead_id")
    outcome = payload.get("outcome")
    notes = payload.get("notes")
    commission_usd = payload.get("commission_usd")  # optional; set on outcome=won
    if not lead_id or outcome not in {"won", "lost", "no_show", "pending"}:
        raise HTTPException(status_code=400, detail="lead_id and outcome required")
    rows = supabase_patch(
        "deal_router_leads",
        params={"lead_id": f"eq.{lead_id}"},
        body={"outcome": outcome, "outcome_notes": notes},
    )

    # Always emit referral.responded so /ops sees partner replies.
    log_event(
        "referral.responded",
        ref_id=lead_id,
        status="ok" if outcome in {"won", "lost", "no_show"} else "pending",
        metadata={"outcome": outcome, "notes_chars": len(notes) if isinstance(notes, str) else 0},
    )

    # On a confirmed close, also patch the open payouts row with the
    # committed commission (if provided) and emit referral.closed with
    # the dollar amount in amount_cents for revenue summing.
    if outcome == "won":
        amount_cents: int | None = None
        if isinstance(commission_usd, (int, float)) and commission_usd > 0:
            amount_cents = int(round(float(commission_usd) * 100))
            try:
                supabase_patch(
                    "payouts",
                    params={"lead_id": f"eq.{lead_id}", "status": "eq.pending"},
                    body={"commission_usd": float(commission_usd)},
                )
            except Exception as exc:
                logger.exception("payout commission patch failed: %s", exc)
        log_event(
            "referral.closed",
            ref_id=lead_id,
            amount_cents=amount_cents,
            status="ok",
            metadata={
                "outcome": outcome,
                "commission_usd": commission_usd,
                "notes_chars": len(notes) if isinstance(notes, str) else 0,
            },
        )

    return {"ok": True, "updated": len(rows)}


@app.get("/payouts")
def payouts_open(
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
) -> list[dict[str, Any]]:
    _require_admin(x_admin_secret)
    return supabase_get("payouts_open", params={"select": "*"})
