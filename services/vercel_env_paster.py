#!/usr/bin/env python3
"""
vercel_env_paster.py — paste 4 keys into 7 Vercel projects in 1 call.

USAGE: python3 vercel_env_paster.py --token <VERCEL_TOKEN>

Reads:
  - VERCEL_TOKEN (from env or --token)
  - /opt/bizlegal/curator/.env (the 4 keys)
  - The list of 7 projects below

Action for each project:
  POST https://api.vercel.com/v10/projects/{id}/env
  body: { key, value, type: 'encrypted', target: ['production'] }
  For the 4 keys: STRIPE_SECRET_KEY, NOWPAYMENTS_API_KEY,
  RESEND_API_KEY, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET.
"""
from __future__ import annotations
import os, json, sys, urllib.request, urllib.error

PROJECTS = ["hub", "docai", "tracr", "lexaudit", "brai", "leadforge", "forge"]
TEAM_ID = "team_MIY0V66DInbXE2vxoZd6ay3D"
KEYS = [
    "STRIPE_SECRET_KEY",
    "NOWPAYMENTS_API_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM",
    "PAYPAL_CLIENT_ID",
    "PAYPAL_CLIENT_SECRET",
]


def _read_local_env() -> dict:
    vals = {}
    try:
        with open("/opt/bizlegal/curator/.env", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                vals[k.strip()] = v.strip()
    except Exception: pass
    return vals


def _post_env(token: str, project: str, key: str, value: str) -> dict:
    try:
        body = json.dumps({"key": key, "value": value, "type": "encrypted",
                          "target": ["production"]}).encode()
        req = urllib.request.Request(
            f"https://api.vercel.com/v10/projects/{project}/env?teamId={TEAM_ID}&upsert=true",
            data=body,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=15)
        return {"ok": True, "status": r.status, "body": r.read().decode()[:200]}
    except urllib.error.HTTPError as e:
        return {"ok": False, "status": e.code, "body": e.read().decode()[:200]}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def run(ctx=None) -> dict:
    token = os.environ.get("VERCEL_TOKEN") or (sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--token" else "")
    if not token:
        return {"ok": False, "error": "VERCEL_TOKEN missing. Set env var or pass --token <token>."}
    vals = _read_local_env()
    applied = []
    failed = []
    for project in PROJECTS:
        for key in KEYS:
            v = vals.get(key, "")
            if not v: continue
            r = _post_env(token, project, key, v)
            if r.get("ok"):
                applied.append({"project": project, "key": key, "status": r.get("status")})
            else:
                failed.append({"project": project, "key": key, "error": r.get("error") or r.get("body")})
    return {"ok": not failed, "agent": "vercel_env_paster",
            "applied": len(applied), "failed": len(failed),
            "details": {"applied": applied[:5], "failed": failed[:5]}}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
