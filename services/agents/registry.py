"""
registry.py — Single source of truth for the 8-agent machine.

Loads orchestrator.py's AGENT_REGISTRY and exposes helper functions.
"""
from __future__ import annotations
import json
from orchestrator import AGENT_REGISTRY, dispatch, status, heartbeat

__all__ = ["AGENT_REGISTRY", "dispatch", "status", "heartbeat", "agent_list", "agent_info"]


def agent_list() -> list:
    return [{"name": k, **v} for k, v in AGENT_REGISTRY.items()]


def agent_info(name: str) -> dict:
    return {"name": name, **AGENT_REGISTRY.get(name, {})}


if __name__ == "__main__":
    print(json.dumps(agent_list(), indent=2))
