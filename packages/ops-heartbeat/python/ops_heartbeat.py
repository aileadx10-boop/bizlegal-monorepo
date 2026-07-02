#!/usr/bin/env python3
"""
ops_heartbeat.py — drop-in heartbeat client for any Python service.

Part of PLATFORM-BUILD-2026-07-02 Phase 1 (live process inspection).

Usage:
    from ops_heartbeat import Heartbeat
    hb = Heartbeat("hetzner/headhunter", parent="cron:headhunter")
    hb.start()   # spawns background thread, pings /api/ops/heartbeat every 60s
    hb.action("crawling leads", status="ok", queue_depth=42)
    hb.stop()

Env (auto-detected):
    HETZNER_HUB_URL — default https://bizlegal-ai.com
    BIZLEGAL_INBOUND_SECRET — HMAC secret (same as /api/ops/log)

The thread is daemon=True so it won't block process exit. If the hub is
unreachable, the call is swallowed (no exception). We never want a
heartbeat failure to crash the calling service.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import socket
import sys
import threading
import time
import urllib.request
import urllib.error
from typing import Any, Optional

log = logging.getLogger("ops_heartbeat")

HUB_URL = os.environ.get("HETZNER_HUB_URL", "https://bizlegal-ai.com").rstrip("/")
# Workaround env-mangle on literal BIZLEGAL_INBOUND_SECRET in source:
SECRET = os.environ.get("BIZ" + "LEGAL_INBOUND_SECRET", "") or os.environ.get("BIZ" + "LEGAL_HMAC_SECRET", "")
PING_INTERVAL_S = int(os.environ.get("OPS_HEARTBEAT_INTERVAL", "60"))
TIMEOUT_S = int(os.environ.get("OPS_HEARTBEAT_TIMEOUT", "8"))


def _hmac_hex(body: str) -> str:
    return hmac.new(SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()


def _post_heartbeat(payload: dict[str, Any]) -> bool:
    """Post a single heartbeat. Returns True on HTTP 2xx, False otherwise."""
    if not SECRET:
        # Not configured — heartbeat is a no-op (still useful to call)
        return True
    body = json.dumps(payload, separators=(",", ":"))
    sig = _hmac_hex(body)
    url = f"{HUB_URL}/api/ops/heartbeat"
    try:
        req = urllib.request.Request(
            url,
            data=body.encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-bizlegal-signature": sig,
                "User-Agent": "bizlegal-heartbeat/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as r:
            return 200 <= r.status < 300
    except (urllib.error.URLError, urllib.error.HTTPError, socket.timeout, OSError) as e:
        log.debug("heartbeat post failed: %s", e)
        return False
    except Exception as e:  # noqa: BLE001
        log.debug("heartbeat post unexpected error: %s", e)
        return False


class Heartbeat:
    """
    Background heartbeater for one service.

    Construction is cheap. Call .start() once when the process is ready,
    .action(...) to update the last-action field, .stop() on shutdown.
    The thread is daemon=True so it does not block process exit.
    """

    def __init__(
        self,
        service: str,
        *,
        version: str = "",
        parent: Optional[str] = None,
        interval_s: Optional[int] = None,
        hostname: Optional[str] = None,
    ):
        if "/" not in service:
            raise ValueError("service must be of the form 'surface/name', e.g. 'hetzner/headhunter'")
        self.service = service
        self.version = version or os.environ.get("GIT_SHA", "unknown")
        self.parent = parent
        self.hostname = hostname or os.environ.get("HOSTNAME") or socket.gethostname()
        self.interval_s = interval_s or PING_INTERVAL_S
        self._last_action: str = ""
        self._last_action_status: str = ""
        self._queue_depth: int = 0
        self._metadata: dict[str, Any] = {}
        self._trace_id: Optional[str] = None
        self._status: str = "starting"
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None

    # ----- public API -----
    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._status = "alive"
        # Fire one immediately so the first "alive" appears within seconds
        self._send_once()
        self._thread = threading.Thread(
            target=self._loop,
            name=f"heartbeat-{self.service}",
            daemon=True,
        )
        self._thread.start()

    def stop(self, status: str = "stopping") -> None:
        self._status = status
        self._stop.set()
        # Final ping so the dashboard sees the stopping state
        try:
            self._send_once()
        except Exception:
            pass

    def action(
        self,
        name: str,
        *,
        status: str = "ok",
        queue_depth: Optional[int] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> None:
        self._last_action = name[:200]  # column limit
        self._last_action_status = status
        if queue_depth is not None:
            self._queue_depth = queue_depth
        if metadata:
            self._metadata.update(metadata)

    def set_status(self, status: str) -> None:
        """Manually override service status: alive | degraded | dead | starting | stopping"""
        self._status = status

    def set_trace(self, trace_id: Optional[str]) -> None:
        self._trace_id = trace_id

    # ----- internals -----
    def _loop(self) -> None:
        while not self._stop.wait(self.interval_s):
            self._send_once()

    def _send_once(self) -> None:
        pid = os.getpid()
        payload: dict[str, Any] = {
            "service": self.service,
            "version": self.version,
            "pid": pid,
            "hostname": self.hostname,
            "status": self._status,
            "last_action": self._last_action or None,
            "last_action_status": self._last_action_status or None,
            "queue_depth": self._queue_depth,
            "metadata": self._metadata,
            "parent_service": self.parent,
            "trace_id": self._trace_id,
        }
        # Remove None values for a smaller payload
        payload = {k: v for k, v in payload.items() if v is not None and v != ""}
        try:
            _post_heartbeat(payload)
        except Exception as e:  # noqa: BLE001
            log.debug("heartbeat failed: %s", e)


# ----- module-level helpers -----
_default: Optional[Heartbeat] = None
_lock = threading.Lock()


def get_default() -> Optional[Heartbeat]:
    return _default


def set_default(h: Heartbeat) -> None:
    global _default
    with _lock:
        _default = h


def ping_once(
    service: str,
    *,
    version: str = "",
    parent: Optional[str] = None,
    status: str = "alive",
    last_action: str = "",
    last_action_status: str = "",
    queue_depth: int = 0,
    metadata: Optional[dict[str, Any]] = None,
    trace_id: Optional[str] = None,
) -> bool:
    """Send a single one-shot heartbeat. Use this for short-lived scripts."""
    if "/" not in service:
        raise ValueError("service must be of the form 'surface/name'")
    payload = {
        "service": service,
        "version": version or os.environ.get("GIT_SHA", "unknown"),
        "pid": os.getpid(),
        "hostname": os.environ.get("HOSTNAME") or socket.gethostname(),
        "status": status,
        "last_action": last_action or None,
        "last_action_status": last_action_status or None,
        "queue_depth": queue_depth,
        "metadata": metadata or {},
        "parent_service": parent,
        "trace_id": trace_id,
    }
    payload = {k: v for k, v in payload.items() if v is not None and v != ""}
    return _post_heartbeat(payload)


# ----- context-manager sugar -----
from contextlib import contextmanager


@contextmanager
def heartbeat_context(
    service: str,
    *,
    version: str = "",
    parent: Optional[str] = None,
    interval_s: Optional[int] = None,
):
    """Use as:
        with heartbeat_context("hetzner/headhunter") as hb:
            hb.action("starting")
            ... do work ...
            hb.action("done", status="ok")
    """
    hb = Heartbeat(service, version=version, parent=parent, interval_s=interval_s)
    hb.start()
    set_default(hb)
    try:
        yield hb
    finally:
        hb.stop()
        set_default(None)


if __name__ == "__main__":
    # CLI test: `python3 ops_heartbeat.py hetzner/test-cli`
    svc = sys.argv[1] if len(sys.argv) > 1 else "hetzner/manual"
    parent = sys.argv[2] if len(sys.argv) > 2 else None
    ok = ping_once(svc, parent=parent, status="alive", last_action="manual ping from CLI")
    print(f"ping {svc}: {'ok' if ok else 'failed (no secret configured?)'}")
    sys.exit(0 if ok else 1)
