#!/usr/bin/env python3
"""oci_close — record a closed referral deal from the command line.

Calls the OCI router's /feedback endpoint with outcome=won (or lost /
no_show, with appropriate semantics). Designed to be runnable as a
single quotable line from Telegram or a terminal once Moses confirms
a partner has closed a deal.

Examples:
    # Record a $1500 commission on a won deal:
    SUPABASE_URL=... ROUTER_BASE_URL=https://oci.bizlegal-ai.com \\
    ROUTER_ADMIN_SECRET=... \\
    python3 oci_close.py won bizlegal-7af3b2 1500 "client signed retainer"

    # Mark a referred deal as lost:
    python3 oci_close.py lost bizlegal-7af3b2 0 "client went with internal counsel"

    # No-show:
    python3 oci_close.py no_show bizlegal-7af3b2 0 "no response after 3 follow-ups"

ROUTER_BASE_URL defaults to http://localhost:8080 (the local docker
container). Set to the public URL when running off-host.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

VALID_OUTCOMES = {"won", "lost", "no_show", "pending"}


def usage(code: int = 2) -> None:
    print(__doc__)
    sys.exit(code)


def main() -> int:
    args = sys.argv[1:]
    if not args or args[0] in {"-h", "--help"}:
        usage(0)
    if len(args) < 2:
        sys.stderr.write("error: outcome and lead_id required\n")
        usage(2)

    outcome = args[0].lower()
    lead_id = args[1]
    commission_str = args[2] if len(args) >= 3 else "0"
    notes = " ".join(args[3:]) if len(args) >= 4 else None

    if outcome not in VALID_OUTCOMES:
        sys.stderr.write(f"error: outcome must be one of {sorted(VALID_OUTCOMES)}\n")
        return 2

    try:
        commission_usd = float(commission_str)
    except ValueError:
        sys.stderr.write(f"error: commission_usd must be numeric (got {commission_str!r})\n")
        return 2

    if outcome == "won" and commission_usd <= 0:
        sys.stderr.write(
            "warning: outcome=won but commission_usd<=0 — payout row "
            "will not be patched. Pass a positive number for revenue tracking.\n"
        )

    base = os.environ.get("ROUTER_BASE_URL", "http://localhost:8080").rstrip("/")
    secret = os.environ.get("ROUTER_ADMIN_SECRET")
    if not secret:
        sys.stderr.write("error: ROUTER_ADMIN_SECRET env var required\n")
        return 2

    payload: dict[str, object] = {
        "lead_id": lead_id,
        "outcome": outcome,
        "commission_usd": commission_usd,
    }
    if notes:
        payload["notes"] = notes

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/feedback",
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Admin-Secret": secret,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            response = resp.read().decode("utf-8")
            print(f"  ✓ {resp.status} {response}")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        sys.stderr.write(f"error: {exc.code} {detail}\n")
        return 1
    except urllib.error.URLError as exc:
        sys.stderr.write(f"error: network — {exc}\n")
        return 1

    print(
        f"  recorded: lead_id={lead_id} outcome={outcome} "
        f"commission_usd={commission_usd} notes={notes!r}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
