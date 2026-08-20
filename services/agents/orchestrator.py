"""
THE MACHINE — BizLegal 24/7 Agent Orchestrator
Built: 2026-07-03
Source: decisions/THE-MACHINE-2026-07-03.md

WAT framework: Workflows (markdown) -> Agents (this file) -> Tools (specialist agents)

The orchestrator is the spine. It doesn't do work itself. It dispatches goals
to the right specialist agents in the right order, logs heartbeats, and returns
a structured result.
"""
from __future__ import annotations
import json, os, time, uuid, traceback
from datetime import datetime, timezone
from typing import Any
from pathlib import Path

# Load env (Hetzner pattern: set -a && . ./.env && set +a; python3 /path/orchestrator.py)
try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parent))
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))  # repo root → enables services.agents.* imports
    import _env
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_SECRET", "")
)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# 2026-08-16 — "enrichment" and "headhunter" removed with the rest of the cold
# path. enrichment built 360 profiles of people via Firecrawl+Apify+Apollo;
# headhunter turned scraped buying signals into queued outreach. Both fed a cold
# pool. Outbound is inbound-only: we contact people who contacted us.
AGENT_REGISTRY = {
    "lead_capture": {
        "module": "services.agents.lead_capture_agent",
        "function": "run",
        "schedule": "webhook",
        "purpose": "Form submission -> 4-stage Haiku pipeline -> qualified lead",
    },
    "content": {
        "module": "services.agents.content_agent",
        "function": "run",
        "schedule": "06:00 UTC daily",
        "purpose": "Produce 1 blog + 1 LinkedIn + 1 image + 1 video script/day",
    },
    "socials": {
        "module": "services.agents.socials_agent",
        "function": "run",
        "schedule": "09:00,13:00,18:00 UTC",
        "purpose": "Cross-post content to 7 platforms (Blotato API)",
    },
    "code": {
        "module": "services.agents.code_agent",
        "function": "run",
        "schedule": "00:15 UTC daily",
        "purpose": "Monitor Vercel + endpoints -> open PRs on regression",
    },
    "newsletter": {
        "module": "services.agents.newsletter_agent",
        "function": "run",
        "schedule": "Tue 08:00 UTC",
        "purpose": "Weekly HTML digest -> Resend audience",
    },
    "monetization": {
        "module": "services.agents.monetization_agent",
        "function": "run",
        "schedule": "every 15 min",
        "purpose": "Hot lead -> build deal room -> Stripe checkout link in 5 min",
    },
    "aeo_revenue": {
        "module": "services.agents.aeo_revenue_agent",
        "function": "main",
        "schedule": "07:00 UTC daily",
        "purpose": "AEO Q&A content → daily_gaps; seo_citation_log citation tracking; payment attribution",
    },
    "conversion_funnel": {
        "module": "services.agents.conversion_funnel_agent",
        "function": "main",
        "schedule": "08:00 UTC daily",
        "purpose": "4-track drip (risk_snapshot/newsletter/free-scan/cart-recovery) → sales_outreach DRAFT",
    },
    "enterprise_closer": {
        "module": "services.agents.enterprise_closer_agent",
        "function": "main",
        "schedule": "09:00 UTC daily",
        "purpose": "ICP≥75 → proposal DRAFT; ICP≥90 → enterprise brief + deal_rooms entry; partner pipeline",
    },
}


def _supabase_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def heartbeat(agent_name: str, goal: str, status: str, details: dict, duration_ms: int) -> None:
    """Write a heartbeat row to agent_runs (existing). Migrates to agent_heartbeats
    once the 4-table migration lands in Supabase."""
    try:
        import urllib.request
        body = json.dumps({
            "agent_name": agent_name,
            "workflow_id": f"machine-{agent_name}-{datetime.now(timezone.utc).strftime('%Y%m%d')}",
            "action": "dispatch",
            "status": status,
            "details": json.dumps(details)[:8000],
            "target_email": details.get("target_email"),
        }).encode()
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/agent_runs",
            data=body,
            headers={**_supabase_headers(), "Prefer": "return=minimal"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        # Never let a heartbeat failure crash the agent
        print(f"[orchestrator] heartbeat write failed: {e}")


def _import_agent(name: str):
    """Lazy import so each agent can be invoked independently."""
    import importlib
    spec = AGENT_REGISTRY.get(name)
    if not spec:
        raise ValueError(f"Unknown agent: {name}")
    mod = importlib.import_module(spec["module"])
    fn = getattr(mod, spec["function"])
    return fn


def dispatch(goal: str, context: dict | None = None, dry_run: bool = False) -> dict:
    """Route a goal to one or more agents.

    Args:
        goal: Human-readable goal like "find 10 EU crypto compliance buyers".
        context: Optional dict with prior state, IDs, etc.
        dry_run: If True, agents must not write to external systems.

    Returns:
        {ok, plan, results, duration_ms, summary}
    """
    started = time.time()
    run_id = str(uuid.uuid4())
    ctx = dict(context or {})
    ctx["dry_run"] = dry_run
    ctx["orchestrator_run_id"] = run_id

    # Lightweight goal -> agent plan (keyword-based for now; LLM fallback below)
    plan = _plan_from_goal(goal)

    if not plan:
        # Fallback: ask Claude to pick
        plan = _llm_plan(goal)

    results = []
    for step in plan:
        step_name = step.get("agent") if isinstance(step, dict) else str(step)
        t0 = time.time()
        try:
            fn = _import_agent(step_name)
            result = fn(ctx) if not isinstance(step, dict) else fn(step.get("input", ctx))
            dur = int((time.time() - t0) * 1000)
            ok = bool(result.get("ok", False)) if isinstance(result, dict) else True
            heartbeat(step_name, goal, "success" if ok else "failed", {"result": result, "dry_run": dry_run}, dur)
            results.append({"agent": step_name, "ok": ok, "duration_ms": dur, "result": result})
            if not ok:
                # Stop the chain on first failure (WAT: escalate, don't auto-retry)
                return {
                    "ok": False,
                    "run_id": run_id,
                    "plan": plan,
                    "results": results,
                    "error": f"{step_name} failed",
                    "duration_ms": int((time.time() - started) * 1000),
                }
        except Exception as e:
            dur = int((time.time() - t0) * 1000)
            err = f"{type(e).__name__}: {e}"
            heartbeat(step_name, goal, "failed", {"error": err, "trace": traceback.format_exc()[:2000]}, dur)
            results.append({"agent": step_name, "ok": False, "duration_ms": dur, "error": err})
            return {
                "ok": False,
                "run_id": run_id,
                "plan": plan,
                "results": results,
                "error": err,
                "duration_ms": int((time.time() - started) * 1000),
            }

    return {
        "ok": True,
        "run_id": run_id,
        "plan": plan,
        "results": results,
        "summary": _summarize(results),
        "duration_ms": int((time.time() - started) * 1000),
    }


def _plan_from_goal(goal: str) -> list:
    """Keyword routing. Cheap and deterministic. LLM fallback for unknown goals."""
    g = goal.lower()
    # Prospect-hunting goals are intentionally unroutable — the enrichment and
    # headhunter agents were removed with the cold path (2026-08-16).
    if any(k in g for k in ["capture lead", "form submit", "inbound"]):
        return ["lead_capture"]
    if any(k in g for k in ["blog", "post", "write", "content", "newsletter"]):
        return ["content"]
    if any(k in g for k in ["social", "linkedin post", "tweet", "blotato", "tiktok", "instagram"]):
        return ["socials"]
    if any(k in g for k in ["fix bug", "regression", "vercel build", "code fix"]):
        return ["code"]
    if any(k in g for k in ["close deal", "checkout", "stripe", "monetize"]):
        return ["monetization"]
    return []


def _llm_plan(goal: str) -> list:
    """Ask Claude which agents to run. Used when keyword routing fails."""
    if not ANTHROPIC_API_KEY:
        return ["lead_capture"]  # safe default: inbound only
    try:
        import urllib.request
        prompt = (
            "You are a routing agent. Given a goal, output a JSON list of agent names "
            "from this set: lead_capture, content, socials, "
            "code, newsletter, monetization. Order matters. Output ONLY the JSON list, "
            "nothing else.\n\n"
            f"Goal: {goal}\n"
        )
        body = json.dumps({
            "model": "claude-haiku-4-5",
            "max_tokens": 128,
            "messages": [{"role": "user", "content": prompt}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body,
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=20)
        d = json.loads(r.read())
        text = d["content"][0]["text"].strip()
        # Strip code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        plan = json.loads(text)
        # Validate against registry
        plan = [a for a in plan if a in AGENT_REGISTRY]
        return plan or ["headhunter"]
    except Exception as e:
        print(f"[orchestrator] LLM plan fallback: {e}")
        return ["lead_capture"]


def _summarize(results: list) -> str:
    ok = sum(1 for r in results if r.get("ok"))
    total = len(results)
    total_ms = sum(r.get("duration_ms", 0) for r in results)
    return f"{ok}/{total} agents ok, {total_ms}ms total"


def status() -> dict:
    """Read last heartbeat for each agent and return a dashboard."""
    import urllib.request
    out = {"agents": {}, "checked_at": datetime.now(timezone.utc).isoformat()}
    for name in AGENT_REGISTRY:
        try:
            url = f"{SUPABASE_URL}/rest/v1/agent_runs?select=created_at,status,action,details&agent_name=eq.{name}&order=created_at.desc&limit=1"
            req = urllib.request.Request(url, headers=_supabase_headers())
            r = urllib.request.urlopen(req, timeout=5)
            rows = json.loads(r.read())
            out["agents"][name] = rows[0] if rows else None  # has created_at, status, action
        except Exception as e:
            out["agents"][name] = {"error": str(e)}
    return out


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        print(json.dumps(status(), indent=2, default=str))
    else:
        goal = " ".join(sys.argv[1:]) or "find 10 EU crypto compliance buyers"
        result = dispatch(goal)
        print(json.dumps(result, indent=2, default=str))
