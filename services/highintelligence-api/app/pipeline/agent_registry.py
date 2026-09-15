"""Agent runner dispatch registry — exactly 5 agents, no more."""
from __future__ import annotations

AGENTS = {
    "market": "agents.brainx.market",
    "competitor": "agents.brainx.competitor",
    "customer_voice": "agents.brainx.customer_voice",
    "regulatory": "agents.brainx.regulatory",
    "monetization": "agents.brainx.monetization",
}

def list_agents() -> list[str]:
    return list(AGENTS.keys())
