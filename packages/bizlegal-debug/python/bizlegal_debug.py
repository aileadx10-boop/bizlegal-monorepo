#!/usr/bin/env python3
"""
bizlegal_debug.py — Debug shim for BizLegal Python services.

stdlib-only (no pip installs required).

Usage:

    from bizlegal_debug import debug_context, set_breakpoint, is_mocked, replay_trace

    # Context manager: logs checkpoints locally and optionally POSTs heartbeats
    with debug_context("hetzner/headhunter", trace_id="tr_abc123") as ctx:
        ctx.checkpoint("starting lead crawl")
        # ... do work ...
        ctx.checkpoint("crawl complete", data={"leads": 42})

    # Check if a surface is mocked before calling it
    mock = is_mocked("docai")
    if mock:
        print("DocAI is mocked:", mock)
    else:
        # call real DocAI
        pass

    # Set a breakpoint on a service (ops dashboard side-channel)
    set_breakpoint("hetzner/headhunter", condition="leads == 0")

    # Print a trace timeline to stdout
    replay_trace("tr_abc123")
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
import urllib.error
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Generator, Optional

logger = logging.getLogger("bizlegal_debug")

# ---------------------------------------------------------------------------
# Configuration (read from env)
# ---------------------------------------------------------------------------

_HUB_BASE_URL = os.getenv("BIZLEGAL_HUB_URL", "https://bizlegal-ai.com")
_OPS_TOKEN = os.getenv("OPS_DASHBOARD_TOKEN", "")
_HMAC_SECRET = os.getenv("BIZLEGAL_INBOUND_SECRET", "")
_LOG_DIR = Path(os.getenv("BIZLEGAL_DEBUG_LOG_DIR", "/tmp/bizlegal_debug"))
_TIMEOUT = 5  # seconds for HTTP calls


# ---------------------------------------------------------------------------
# Low-level HTTP helpers (stdlib only)
# ---------------------------------------------------------------------------

def _http_get(path: str, token: str = "") -> Optional[dict[str, Any]]:
    """GET from hub and return parsed JSON, or None on error."""
    sep = "&" if "?" in path else "?"
    url = f"{_HUB_BASE_URL}{path}{sep}t={token or _OPS_TOKEN}"
    try:
        with urllib.request.urlopen(url, timeout=_TIMEOUT) as resp:  # noqa: S310
            return json.loads(resp.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError, OSError) as exc:
        logger.debug("bizlegal_debug GET %s failed: %s", path, exc)
        return None


def _http_post(path: str, payload: dict[str, Any], token: str = "") -> Optional[dict[str, Any]]:
    """POST JSON to hub and return parsed JSON, or None on error."""
    sep = "&" if "?" in path else "?"
    url = f"{_HUB_BASE_URL}{path}{sep}t={token or _OPS_TOKEN}"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT) as resp:  # noqa: S310
            return json.loads(resp.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError, OSError) as exc:
        logger.debug("bizlegal_debug POST %s failed: %s", path, exc)
        return None


def _post_heartbeat(payload: dict[str, Any]) -> None:
    """POST a heartbeat to /api/ops/heartbeat (HMAC-signed)."""
    import hashlib
    import hmac as hmac_mod

    body = json.dumps(payload).encode()
    if _HMAC_SECRET:
        sig = hmac_mod.new(_HMAC_SECRET.encode(), body, hashlib.sha256).hexdigest()
    else:
        sig = ""

    url = f"{_HUB_BASE_URL}/api/ops/heartbeat"
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-bizlegal-signature": sig,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT) as _:  # noqa: S310
            pass
    except (urllib.error.URLError, OSError) as exc:
        logger.debug("bizlegal_debug heartbeat POST failed: %s", exc)


def _write_local_log(service: str, trace_id: str, action: str, data: dict[str, Any]) -> None:
    """Append a checkpoint line to a local JSONL log file."""
    try:
        _LOG_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = service.replace("/", "_")
        log_file = _LOG_DIR / f"{safe_name}_{trace_id}.jsonl"
        entry = {
            "ts": datetime.now(tz=timezone.utc).isoformat(),
            "service": service,
            "trace_id": trace_id,
            "action": action,
            "data": data,
        }
        with log_file.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")
    except OSError as exc:
        logger.debug("bizlegal_debug local log write failed: %s", exc)


# ---------------------------------------------------------------------------
# DebugContext
# ---------------------------------------------------------------------------

class DebugContext:
    """
    Accumulated checkpoint context for a single agent run.

    Do not instantiate directly — use :func:`debug_context`.
    """

    def __init__(self, service: str, trace_id: str, post_heartbeats: bool) -> None:
        self.service = service
        self.trace_id = trace_id
        self._post = post_heartbeats
        self._checkpoints: list[dict[str, Any]] = []

    def checkpoint(self, action: str, data: Optional[dict[str, Any]] = None) -> None:
        """Log a named checkpoint with optional metadata."""
        data = data or {}
        entry = {
            "action": action,
            "data": data,
            "ts": datetime.now(tz=timezone.utc).isoformat(),
        }
        self._checkpoints.append(entry)
        _write_local_log(self.service, self.trace_id, action, data)

        if self._post and _HMAC_SECRET:
            _post_heartbeat(
                {
                    "service": self.service,
                    "status": "alive",
                    "last_action": action,
                    "last_action_status": "ok",
                    "trace_id": self.trace_id,
                    "metadata": {"checkpoint": action, **data},
                }
            )


@contextmanager
def debug_context(
    service: str,
    trace_id: Optional[str] = None,
    post_heartbeats: bool = True,
) -> Generator[DebugContext, None, None]:
    """
    Context manager that wraps an agent run with debug instrumentation.

    Parameters
    ----------
    service:
        Service name in ``surface/name`` format, e.g. ``"hetzner/headhunter"``.
    trace_id:
        Unique ID for this run. Auto-generated if omitted.
    post_heartbeats:
        When True and BIZLEGAL_INBOUND_SECRET is set, each checkpoint
        also POSTs a heartbeat to /api/ops/heartbeat.

    Yields
    ------
    DebugContext
        Call ``ctx.checkpoint(action, data={...})`` inside the block.
    """
    import uuid

    tid = trace_id or f"tr_{uuid.uuid4().hex[:12]}"
    ctx = DebugContext(service=service, trace_id=tid, post_heartbeats=post_heartbeats)

    started = time.monotonic()
    logger.debug("[%s] trace=%s starting", service, tid)
    try:
        yield ctx
        elapsed = time.monotonic() - started
        logger.debug("[%s] trace=%s done (%.1fs, %d checkpoints)", service, tid, elapsed, len(ctx._checkpoints))
    except Exception:
        ctx.checkpoint("error", {"exc": sys.exc_info()[1].__class__.__name__})
        if post_heartbeats and _HMAC_SECRET:
            _post_heartbeat(
                {
                    "service": service,
                    "status": "degraded",
                    "last_action": "exception",
                    "last_action_status": "error",
                    "trace_id": tid,
                }
            )
        raise


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def set_breakpoint(service: str, condition: Optional[str] = None, enabled: bool = True) -> bool:
    """
    Set or clear a breakpoint on a service via /api/ops/breakpoint.

    Returns True if the request succeeded.
    """
    payload: dict[str, Any] = {"service": service, "enabled": enabled}
    if condition is not None:
        payload["condition"] = condition
    result = _http_post("/api/ops/breakpoint", payload)
    return result is not None and result.get("ok") is True


def is_mocked(surface: str) -> Optional[dict[str, Any]]:
    """
    Check whether a surface has mock mode enabled.

    Returns the ``response`` dict from the mock store if mock is enabled,
    or None if the surface is live.
    """
    result = _http_get(f"/api/ops/mock/{surface}")
    if result is None:
        return None
    state = result.get("state", {})
    if state.get("enabled"):
        return state.get("response") or {}
    return None


def replay_trace(trace_id: str) -> None:
    """
    Fetch and print the timeline for a trace_id to stdout.

    Calls /api/ops/replay/{trace_id} and pretty-prints events.
    """
    result = _http_get(f"/api/ops/replay/{trace_id}")
    if result is None:
        print(f"[replay_trace] could not fetch trace {trace_id!r}", file=sys.stderr)
        return

    events: list[dict[str, Any]] = result.get("events", [])
    is_mock = result.get("_mock", False)

    print(f"\n{'=' * 60}")
    print(f"  Trace replay: {trace_id}")
    if is_mock:
        print("  (demo data — table pending migration)")
    print(f"  {len(events)} events")
    print(f"{'=' * 60}")

    for i, ev in enumerate(events, start=1):
        ts_raw = ev.get("pinged_at", "")
        try:
            ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00")).strftime("%H:%M:%S")
        except ValueError:
            ts = ts_raw

        service = ev.get("service", "?")
        status = ev.get("status", "?")
        action = ev.get("last_action") or "—"

        status_icon = {"alive": "✓", "degraded": "⚠", "dead": "✗", "error": "✗"}.get(status, "·")
        print(f"  {i:>3}.  {ts}  {status_icon} [{service}]  {action}")

    print(f"{'=' * 60}\n")
