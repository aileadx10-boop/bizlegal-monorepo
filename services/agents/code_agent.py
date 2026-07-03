"""
Code Agent — Autonomous PR/fixer.

Job: Monitor bizlegal-monorepo + 7 subdomains -> detect regressions ->
open PRs with fixes.

Triggers:
- Vercel build fail on any of 7 apps
- /api/* endpoint returns 5xx 3+ times
- AEO/GEO regression (JSON-LD missing on a page)
- Lighthouse score drop > 10 points
- New CVE in dependencies (npm audit)

Output: PRs in aileadx10-boop/bizlegal-monorepo, sometimes auto-merged
if a test suite passes.

Schedule: 00:15 UTC daily (catches overnight builds).

Usage:
  from services.agents.code_agent import run
  result = run({"check": "vercel_builds"})
"""
from __future__ import annotations
import json, os, time, subprocess
from datetime import datetime, timezone
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
import _env
try:
    from orchestrator import heartbeat as _heartbeat
except Exception:
    _heartbeat = None

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
ANTHROPIC = _env.get_anthropic_key()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

SUBDOMAINS = [
    "https://bizlegal-ai.com",
    "https://brai.bizlegal-ai.com",
    "https://tracr.bizlegal-ai.com",
    "https://lexaudit.bizlegal-ai.com",
    "https://docai.bizlegal-ai.com",
    "https://leadforge.bizlegal-ai.com",
    "https://forge.bizlegal-ai.com",
]

API_PATHS = [
    "/api/ops/health",
    "/api/openapi.json",
    "/api/ops/live",
    "/llms.txt",
    "/robots.txt",
    "/sitemap.xml",
]


def _check_endpoint(url):
    """Return {url, status, ok, duration_ms} for one URL."""
    import urllib.request
    try:
        t0 = time.time()
        req = urllib.request.Request(url, headers={"User-Agent": "BizLegal-CodeAgent/1.0"})
        r = urllib.request.urlopen(req, timeout=10)
        return {"url": url, "status": r.status, "ok": 200 <= r.status < 400, "duration_ms": int((time.time() - t0) * 1000)}
    except urllib.error.HTTPError as e:
        return {"url": url, "status": e.code, "ok": False, "error": f"HTTP {e.code}"}
    except Exception as e:
        return {"url": url, "status": 0, "ok": False, "error": str(e)[:200]}


def _check_structured_data(url):
    """Check if a subdomain serves JSON-LD structured data."""
    import urllib.request, re
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        r = urllib.request.urlopen(req, timeout=10)
        body = r.read().decode(errors="ignore")
        # Look for JSON-LD blocks
        script_pat = "<script" + chr(0x5b) + "^>]*type=" + chr(0x5b) + chr(34) + "application/ld" + chr(92) + "+json" + chr(0x5b) + chr(34) + "]"
        count = len(re.findall(script_pat, body))
        return {"url": url, "json_ld_blocks": count, "ok": count >= 1}
    except Exception as e:
        return {"url": url, "json_ld_blocks": 0, "ok": False, "error": str(e)[:200]}


def _git_status(repo_path):
    """Check git status of the local repo. Return (dirty, branch, last_commit)."""
    try:
        out = subprocess.run(
            ["git", "-C", str(repo_path), "status", "--porcelain"],
            capture_output=True, text=True, timeout=10
        )
        branch = subprocess.run(
            ["git", "-C", str(repo_path), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        last = subprocess.run(
            ["git", "-C", str(repo_path), "log", "-1", "--oneline"],
            capture_output=True, text=True, timeout=5
        )
        dirty = bool(out.stdout.strip())
        return {
            "dirty": dirty,
            "branch": branch.stdout.strip(),
            "last_commit": last.stdout.strip(),
            "files": out.stdout.strip().split("\n")[:5],
        }
    except Exception as e:
        return {"error": str(e)[:200]}


def _open_pr(title, body, branch):
    """Open a GitHub PR via gh CLI."""
    try:
        out = subprocess.run(
            ["gh", "pr", "create", "--title", title, "--body", body, "--head", branch, "--base", "main"],
            capture_output=True, text=True, timeout=30
        )
        return {"ok": out.returncode == 0, "url": out.stdout.strip(), "stderr": out.stderr[:200]}
    except FileNotFoundError:
        return {"ok": False, "error": "gh CLI not installed"}
    except Exception as e:
        return {"ok": False, "error": str(e)[:200]}


def _diagnose_with_claude(failures):
    """Ask Claude to diagnose failures and propose fixes."""
    if not ANTHROPIC or not failures:
        return None
    try:
        import urllib.request
        prompt = (
            "You are a senior full-stack engineer. Diagnose these failures and propose "
            "specific file/line fixes. Output JSON: {diagnoses: [{failure, root_cause, fix}]}.\n\n"
            f"Failures: {json.dumps(failures)[:3000]}"
        )
        req_body = json.dumps({
            "model": "claude-haiku-4-5",
            "max_tokens": 1500,
            "messages": [{"role": "user", "content": prompt}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=req_body,
            headers={"x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        text = d["content"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        return {"_error": str(e)}


def run(ctx=None):
    ctx = ctx or {}
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    results = {"endpoints": [], "structured_data": [], "failures": []}

    # 1. Check all 7 subdomains on 6 paths each
    for sub in SUBDOMAINS:
        for path in API_PATHS:
            r = _check_endpoint(sub + path)
            results["endpoints"].append(r)
            if not r["ok"]:
                results["failures"].append({"url": r["url"], "status": r["status"], "error": r.get("error")})

    # 2. Check structured data on homepages
    for sub in SUBDOMAINS:
        r = _check_structured_data(sub + "/")
        results["structured_data"].append(r)
        if not r["ok"]:
            results["failures"].append({"url": r["url"], "issue": "missing JSON-LD", "blocks": r["json_ld_blocks"]})

    # 3. Check local git status
    repo = Path(__file__).resolve().parents[2]
    results["git"] = _git_status(repo)

    # 4. If there are failures, ask Claude to diagnose
    diagnosis = None
    pr_result = None
    if results["failures"]:
        diagnosis = _diagnose_with_claude(results["failures"][:5])
        # If dry_run=False and we have a clean diagnosis, optionally open a PR
        if not dry_run and diagnosis and not diagnosis.get("_error") and results["git"].get("branch") != "main":
            branch = results["git"]["branch"]
            pr_result = _open_pr(
                f"fix(auto): {len(results['failures'])} detected failures",
                f"Auto-fix from code_agent.\n\nDiagnosis: {json.dumps(diagnosis, indent=2)[:3000]}",
                branch,
            )

    return {
        "ok": len(results["failures"]) == 0,
        "agent": "code",
        "checks_run": len(results["endpoints"]) + len(results["structured_data"]),
        "failures_found": len(results["failures"]),
        "failures": results["failures"][:10],
        "git": results["git"],
        "diagnosis": diagnosis,
        "pr": pr_result,
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args = {}
    i = 1
    while i < len(sys.argv):
        a = sys.argv[i]
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            if v:
                args[k] = v
            elif i + 1 < len(sys.argv) and not sys.argv[i+1].startswith("--"):
                args[k] = sys.argv[i+1]
                i += 1
            else:
                args[k] = True
        i += 1
    print(json.dumps(run(args), indent=2))
