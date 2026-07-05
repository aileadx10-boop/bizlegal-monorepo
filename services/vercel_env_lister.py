#!/usr/bin/env python3
"""
vercel_env_lister.py — read-only Vercel env lister.

USAGE: python3 vercel_env_lister.py --token <VERCEL_TOKEN>

Lists every env var on every BizLegal project. Use to spot-check
what's MISSING (e.g. paypal creds on hub) before doing a manual
rotation. No mutations.
"""
from __future__ import annotations
import os, json, sys, urllib.request, urllib.error

PROJECTS = ["hub", "docai", "tracr", "lexaudit", "brai", "leadforge", "forge"]
TEAM_ID = "team_MIY0V66DInbXE2vxoZd6ay3D"
TARGETS = ["production"]


def _list_envs(token, project, target="production"):
    try:
        req = urllib.request.Request(
            f"https://api.vercel.com/v9/projects/{project}/env?teamId={TEAM_ID}",
            headers={"Authorization": f"Bearer {token}"})
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read()).get("envs", [])
    except urllib.error.HTTPError as e:
        return {"error": e.code, "body": e.read().decode()[:300]}
    except Exception as e:
        return {"error": str(e)}


def run(ctx=None) -> dict:
    token = os.environ.get("VERCEL_TOKEN") or (sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--token" else "")
    if not token:
        return {"ok": False, "error": "VERCEL_TOKEN missing"}
    out = {}
    for project in PROJECTS:
        envs = _list_envs(token, project)
        if isinstance(envs, dict) and envs.get("error"):
            out[project] = envs
        else:
            # Just keys, no values (so output is small)
            keys = sorted([e.get("key", "?") for e in envs])
            out[project] = {"env_count": len(envs), "keys": keys}
    return {"ok": True, "envs": out}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
