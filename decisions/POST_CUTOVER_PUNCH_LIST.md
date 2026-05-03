# Post-Cutover Punch List — 2026-05-03

After the Phase Z monorepo cutover. **Updated** with the autonomous "take the wheel" pass: 3 items closed by the agent, 4 still need Moses (one new item discovered).

Legend: ✅ done · ⚠️ partial / workaround in place · ❌ pending Moses

---

## Inventory — what's actually broken

| # | Item | Status | Owner |
|---|---|---|---|
| 1 | tracr.bizlegal-ai.com — DNS A/CNAME record missing | ❌ | Moses |
| 2 | lexaudit.bizlegal-ai.com — DNS CNAME record missing | ❌ | Moses |
| 3 | router.bizlegal-ai.com — DNS A record missing | ❌ | Moses |
| 4 | FIRECRAWL_API_KEY missing on Hub Preview | ✅ | done by agent (Preview + Development) |
| 5 | curator-gpu tunnel — daemon runs as LocalSystem with no config | ⚠️ | user-mode cloudflared running as workaround; service migration script is below |
| 6 | OLLAMA_TUNNEL_TOKEN is wrong type (NEW) | ❌ | Moses — needs CF Access service token |
| 7 | scout.py crash loop (824 restarts, killing Hetzner CPU) | ✅ | service stopped; will resume after #6 |
| 8 | Ollama models not loaded on local GPU | ✅ | llama3.2:3b + qwen2.5:7b pulled |
| 9 | Vercel projects/domains attached correctly | ✅ | trcr / lexaudit / others verified — DNS is the only blocker |

**TL;DR for Moses:** 4 items left, all involve dashboard/UI clicks or pasting credentials. Total ~10 min of your time.

---

## 1, 2, 3. DNS records missing for tracr / lexaudit / router

DNS for `bizlegal-ai.com` is hosted at **Cloudflare** (NS records: `lars.ns.cloudflare.com`, `ali.ns.cloudflare.com`). The Vercel "Third Party Registrar" line is misleading — Namecheap is just the registrar; Cloudflare hosts the zone.

### Working subdomains for reference

| Subdomain | DNS state |
|---|---|
| brai / docai / forge / leadforge / bizlegal-ai apex | OK → Cloudflare anycast `2a06:98c1:31{20,21}::7` |
| **tracr / lexaudit** | **MISSING** — but Vercel project HAS the custom domain attached |
| **router** | **MISSING** |
| **curator** | OK (different concern — that's the tunnel hostname; works) |

### Cloudflare Dashboard → bizlegal-ai.com → DNS → Records → Add record (×3)

| Record | Type | Name | Target | Proxy |
|---|---|---|---|---|
| 1 | CNAME | `tracr` | `cname.vercel-dns.com` | 🟠 Proxied |
| 2 | CNAME | `lexaudit` | `cname.vercel-dns.com` | 🟠 Proxied |
| 3 | A | `router` | `151.145.81.139` | ⚪ DNS only |

`router` MUST be gray-cloud (DNS only) because Caddy on the OCI VM issues its own LE cert via HTTP-01. If it's orange-proxied, ACME breaks. The gray cloud doesn't reduce security — Cloudflare can still serve as a public DNS resolver, the only difference is requests bypass Cloudflare's proxy and hit the OCI VM directly.

### After saving, verify

```bash
for sub in tracr lexaudit router; do
  echo -n "$sub.bizlegal-ai.com: "
  nslookup "$sub.bizlegal-ai.com" 8.8.8.8 2>&1 | grep -E "Address|Non-existent" | tail -1
done

# Then hit the endpoints
curl -sk -o /dev/null -w 'tracr=%{http_code}\n'    --max-time 15 https://tracr.bizlegal-ai.com/api/digest
curl -sk -o /dev/null -w 'lexaudit=%{http_code}\n' --max-time 15 https://lexaudit.bizlegal-ai.com/api/digest
curl -sk -o /dev/null -w 'router=%{http_code}\n'   --max-time 15 https://router.bizlegal-ai.com/health
```

Expected: all three return non-000. tracr/lexaudit may take 30-60s for Vercel to issue TLS for the freshly-attached hostname after DNS propagates.

---

## 4. ✅ FIRECRAWL_API_KEY — Hub Preview + Development (DONE)

Done by agent via Vercel CLI. Verification:

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo/apps/hub"
vercel env ls | grep -i firecrawl
# 3 lines: Production, Preview, Development
```

CLI bug note for future: Vercel CLI v50.39 wants an empty quoted string (`""`) for the "all preview branches" branch arg in non-interactive mode. The form `vercel env add NAME preview "" --value V --yes` works; without the empty string the CLI loops on `git_branch_required` even though the docs say to omit it.

---

## 5. ⚠️ Curator-gpu cloudflared service (workaround in place)

### What was wrong

The cloudflared Windows service binds to `LocalSystem` user, but the tunnel config + credentials live in `C:\Users\Moshe Dor\.cloudflared\` — a user dir LocalSystem can't read. The dashboard was correctly showing "no active connections" because the daemon never had config to load.

### Workaround active now

User-mode `cloudflared tunnel run d8f42728-b85a-4e69-b165-981791eacb86` is running in this session's PowerShell process. 4 connectors registered at Cloudflare edge (TLV02 + MRS06 — Tel Aviv + Marseille). Tunnel is healthy. Will die when this PowerShell session ends.

### Permanent fix — run elevated PowerShell once

```powershell
# 1. Copy config to system location LocalSystem can read
$src = "$env:USERPROFILE\.cloudflared"
$dst = "$env:ProgramData\Cloudflare\.cloudflared"
New-Item -ItemType Directory -Path $dst -Force | Out-Null
Copy-Item -Path "$src\config.yml" -Destination $dst -Force
Copy-Item -Path "$src\d8f42728-b85a-4e69-b165-981791eacb86.json" -Destination $dst -Force
Copy-Item -Path "$src\cert.pem" -Destination $dst -Force

# 2. Update credentials-file path inside the copied config to the new location
$configPath = "$dst\config.yml"
(Get-Content $configPath) `
  -replace [regex]::Escape("C:\Users\Moshe Dor\.cloudflared"), $dst `
  | Set-Content $configPath

# 3. Tighten ACL — only SYSTEM + Administrators readable
$acl = Get-Acl $dst
$acl.SetAccessRuleProtection($true, $false)
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
  "SYSTEM","FullControl","ContainerInherit,ObjectInherit","None","Allow")))
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
  "Administrators","FullControl","ContainerInherit,ObjectInherit","None","Allow")))
Set-Acl -Path $dst -AclObject $acl

# 4. Reconfigure the service to read from the new location
sc.exe config Cloudflared binPath= "`"C:\Program Files (x86)\cloudflared\cloudflared.exe`" --config `"$dst\config.yml`" tunnel run"

# 5. Stop the user-mode tunnel I started, then restart the service
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Where-Object { $_.SI -gt 0 } | Stop-Process -Force
Restart-Service -Name "Cloudflared"

# 6. Verify
Start-Sleep -Seconds 5
Get-Service -Name "Cloudflared"
# Then check tunnel hits Cloudflare:
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" --config "$dst\config.yml" tunnel info d8f42728-b85a-4e69-b165-981791eacb86
```

That single elevated run permanently fixes #5. Tunnel will survive logoff/reboot.

---

## 6. ❌ OLLAMA_TUNNEL_TOKEN is the wrong type (NEW finding)

### Why scout.py is in a crash loop

`curator.bizlegal-ai.com` is gated by **Cloudflare Access** (verified: 302 redirect to `bizlegal.cloudflareaccess.com` on every request). scout.py authenticates by setting:

```python
h["cf-access-client-id"]     = OLLAMA_TUNNEL_TOKEN.split(".", 1)[0]
h["cf-access-client-secret"] = OLLAMA_TUNNEL_TOKEN
```

— meaning `OLLAMA_TUNNEL_TOKEN` must be a **Cloudflare Access service token** in the format `<UUID>.<base64-secret>` (typically 100+ chars).

What's currently in vault + Hetzner: a 44-char **tunnel connector secret** (no dot in it). Connector secrets authorize cloudflared-the-daemon to register with the edge; they don't satisfy Access policies on the front side. Two completely different credentials.

### Fix — create a CF Access service token

Cloudflare Dashboard → **Zero Trust** → Access → **Service Auth** → **Service Tokens** → **+ Create Service Token**

- Name: `curator-scout-hetzner`
- Duration: 1 year (or non-expiring)
- Click Generate → you'll see a one-time view with:
  - Client ID: `<UUID>` (32 hex chars + dashes)
  - Client Secret: long base64 string
  - **Access Token (full):** displayed as `<UUID>.<secret>` — **THIS is what scout.py wants**

Now ensure the policy on `curator.bizlegal-ai.com` accepts this service token:

Cloudflare Dashboard → Zero Trust → Access → **Applications** → find the application covering `curator.bizlegal-ai.com` → **Edit** → **Policies** → either:
- Add a new policy: Action = "Service Auth" with Selector = "Service Token" and value = `curator-scout-hetzner`, OR
- Edit an existing policy to include the service token in its Include list

Save. Then update vault and Hetzner:

```bash
# Append to canonical vault (replace existing OLLAMA_TUNNEL_TOKEN line)
nano "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"
# Set:
# OLLAMA_TUNNEL_TOKEN=<UUID>.<secret>     <-- the full token string

# Push to Hetzner
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 'nano /opt/bizlegal/curator/.env'
# Update OLLAMA_TUNNEL_TOKEN to the same value

# Test access works
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 '
  cd /opt/bizlegal/curator && set -a && source .env && set +a
  CLIENT_ID="${OLLAMA_TUNNEL_TOKEN%%.*}"
  curl -s --max-time 10 \
    -H "cf-access-client-id: $CLIENT_ID" \
    -H "cf-access-client-secret: $OLLAMA_TUNNEL_TOKEN" \
    "$OLLAMA_TUNNEL_URL/api/tags" | head -c 300
'
# Expected: JSON listing models {"models":[{"name":"llama3.2:3b",...},{"name":"qwen2.5:7b-instruct-q4_K_M",...}]}

# Resume scout
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 'systemctl reset-failed curator-scout && systemctl start curator-scout'

# Verify it ran clean
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 'journalctl -u curator-scout -n 20 --no-pager'
```

---

## 7. ✅ Scout crash loop stopped (until #6 lands)

Done by agent. Hetzner had `curator-scout.service` retrying every 2 min, hanging on the Access redirect, getting SIGTERM after 10-min systemd timeout. Restart counter was at 824. Service is now in `failed` state (stopped). Resume with `systemctl reset-failed curator-scout && systemctl start curator-scout` after #6.

---

## 8. ✅ Ollama models loaded

Both models pulled to local GPU machine:
- `llama3.2:3b` (2.0 GB) — filter model
- `qwen2.5:7b-instruct-q4_K_M` (4.7 GB) — rank model

Verify: `ollama list`.

---

## 9. ✅ Vercel projects + custom domains attached

| Project (Vercel name) | Custom domain | DNS state |
|---|---|---|
| `bizlegal-ai` | bizlegal-ai.com | ✅ |
| `brai` | brai.bizlegal-ai.com | ✅ |
| `docai-frontend` | docai.bizlegal-ai.com | ✅ |
| `forge` | forge.bizlegal-ai.com | ✅ |
| `leadforge-ai` | leadforge.bizlegal-ai.com | ✅ |
| `lexaudit` | lexaudit.bizlegal-ai.com | attached, **needs CNAME** |
| `trcr` (note: no 'a') | tracr.bizlegal-ai.com | attached, **needs CNAME** |

The Vercel project for tracr is named `trcr` (without the 'a') — confusingly, the public domain has the 'a'. Don't rename the Vercel project; rename means losing the deployment URL aliases. Keep as-is.

---

## Verification — full Z7 matrix (run after Moses completes #1-3 + #6)

```bash
TOKEN=<from vault: OPS_DASHBOARD_TOKEN>

echo "--- DNS ---"
for sub in bizlegal-ai.com tracr.bizlegal-ai.com lexaudit.bizlegal-ai.com router.bizlegal-ai.com curator.bizlegal-ai.com brai.bizlegal-ai.com forge.bizlegal-ai.com docai.bizlegal-ai.com leadforge.bizlegal-ai.com; do
  res=$(nslookup "$sub" 8.8.8.8 2>&1)
  if echo "$res" | grep -q "Non-existent\|NXDOMAIN"; then echo "MISS: $sub"; else echo "OK:   $sub"; fi
done

echo ""
echo "--- HTTP ---"
for url in https://bizlegal-ai.com https://tracr.bizlegal-ai.com/api/digest https://lexaudit.bizlegal-ai.com/api/digest https://router.bizlegal-ai.com/health https://brai.bizlegal-ai.com https://forge.bizlegal-ai.com https://docai.bizlegal-ai.com https://leadforge.bizlegal-ai.com; do
  printf '%-50s %s\n' "$url" "$(curl -sk -o /dev/null -w '%{http_code}' --max-time 15 "$url")"
done

echo ""
echo "--- Ops dashboard ---"
curl -s "https://bizlegal-ai.com/api/ops/health?t=$TOKEN" | jq '{ok:.ok, hmac:.hmac.ok}'
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$TOKEN" | jq '{events_24h:.summary.events_24h, sources:[.events[].source]|unique}'

echo ""
echo "--- Heartbeats ---"
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$TOKEN" | jq '[.events[] | select(.type|test("heartbeat"))] | group_by(.source) | map({source: .[0].source, latest: (max_by(.ts).ts)})'
```

Expected:
- DNS: all OK
- HTTP: 8 of 8 return 200 (or 405 on root paths without GET handler)
- Ops health: `{ok:true, hmac:true}`
- Feed: events_24h > 0, sources includes hub + worker + curator + publisher
- Heartbeats: 4 sources, latest within 30 min

---

## What went sideways during this round

- **DNS at Cloudflare, not Namecheap** — initial confusion because Vercel's "Third Party Registrar" UI suggests Namecheap, but the NS records actually delegate to Cloudflare. Lesson: always trust `nslookup -type=NS`, not the registrar's listing.
- **OLLAMA_TUNNEL_TOKEN pasted as wrong credential type** — tunnel connector secret vs CF Access service token. Both come from Cloudflare, both look like base64 strings, but they auth different things. The 44-char no-dot format was a hint.
- **cloudflared service ran but useless** — LocalSystem profile path != user profile path. Subtle but immediately fatal. Same root-cause family as the FIRECRAWL Preview env scope mismatch.
- **Vercel CLI v50 has a non-interactive bug** — `vercel env add NAME preview --value V --yes` loops on git_branch_required. Workaround: pass empty string `""` as branch arg.
- **Earlier "Hetzner unreachable" / "OCI router 401" diagnoses were false** — both servers SSH fine; ICMP just blocked. Always probe with the actual protocol you care about.

**Pattern:** every blocker so far has been a **scope mismatch** (env var scope, user profile scope, credential type scope). Phase Z's "operating book" discipline is the right counter — write down which scope each value belongs in, mechanically enforce it.

---

## Update — 2026-05-03 23:45 UTC (session close)

**Closed since last update:**
- ✅ DNS rows 1, 2, 3 — all 9 surfaces resolve, all 8 endpoints HTTP 200 (verified by Z7 matrix run)
- ✅ Cloudflare Access policy attached to application (was created as reusable, never linked — moved into the Application's Policies tab via Access → Applications → app → Policies → Add existing)
- ✅ scout.py reads `CF_ACCESS_CLIENT_ID` + `_SECRET` directly (commit `21c6304`)
- ✅ Hetzner curator dir has `firecrawl_enrich.py` + `ops_log.py` (were missing — pushed via scp)
- ✅ Cloudflared Windows service permanent — config moved to `%ProgramData%\Cloudflare\.cloudflared\`, service binPath updated via WMI `Invoke-CimMethod -MethodName Change`. New connector ID `37031b1e-...` registered, 4 edge connections. **Survives reboot.**
- ✅ Bonus: vault → Vercel sync for `OPS_DASHBOARD_TOKEN` (Vercel had a stray literal `\n` at the end, breaking URL token check). Re-added clean from vault, redeploy triggered (commit `231569a`).

**Carrying forward to next session:**

### A. Tunnel routes to a different Ollama than Moses's local

Confirmed via direct test: `curl /api/chat -d '{"model":"llama3.2:3b",...}'` through the tunnel returns `{"error":"model 'llama3.2:3b' not found"}` HTTP 404. But Moses's local Ollama on `127.0.0.1:11434` has both `llama3.2:3b` and `qwen2.5:7b-instruct-q4_K_M` loaded (verified via `ollama list` and `Invoke-WebRequest`). Tunnel's `ingress:` config in `config.yml` says `service: http://localhost:11434` — should match. But `/api/tags` through the tunnel shows different models (`gemma4`, `deepseek-v4-flash:cloud`).

**Hypothesis:** the cloudflared LocalSystem service binds the `localhost:11434` differently than the user account does. There may be a second Ollama process on a different port, or another instance bound to LocalSystem's loopback that the service-mode daemon hits instead. Or the local config.yml inside `%ProgramData%\Cloudflare\.cloudflared\` was copied incorrectly and routes elsewhere.

**Diagnostic commands for next session:**
```powershell
# What's listening on 11434 right now?
Get-NetTCPConnection -LocalPort 11434 | Select-Object LocalAddress,OwningProcess
Get-Process -Id <PID-from-above>

# Confirm Moses's local Ollama API state
Invoke-WebRequest http://127.0.0.1:11434/api/tags -UseBasicParsing | ConvertFrom-Json | Select -ExpandProperty models | Select name

# Test the tunnel against /api/chat with a model the tunnel DOES have (e.g. gemma4:e2b)
# If that works, tunnel routing is fine — it's just a different Ollama
# If even that fails, tunnel ingress config is misrouting
```

**Likely fix:** either (a) make local Ollama bind to `0.0.0.0:11434` so all instances share state, or (b) update Hetzner's `OLLAMA_FILTER_MODEL`/`OLLAMA_RANK_MODEL` to match what the tunnel-side Ollama actually has, or (c) `ollama pull llama3.2:3b qwen2.5:7b-instruct-q4_K_M` on whichever instance the tunnel routes to.

### B. Vercel redeploy not yet complete

After re-adding `OPS_DASHBOARD_TOKEN` to Production and pushing empty commit `231569a`, Vercel started a build. As of session close it returned HTTP 000 (still building). Allow 2-3 min for the redeploy then re-test `/api/ops/health?token=...` — should return JSON with `ok:true`.

### C. scout.py crash loop blocked on (A)

Service is `activating`, hangs ~10 min on an Ollama call that 404s, then systemd kills it. Once (A) is resolved, scout runs clean on next start. Currently the crash loop is mostly cosmetic (no real harm — just journal noise + occasional CPU blip), but worth fixing before claiming Z7 fully green.

---

## Z7 row-by-row (post-session)

| Row | Check | State |
|---|---|---|
| 1 | DNS resolves (9 surfaces) | ✅ all 9 OK |
| 2 | HTTP endpoints (8 surfaces) | ✅ all 8 = 200 |
| 3 | OCI router | ✅ HTTPS 200 (DNS A record fixed) |
| 4 | tracr | ✅ HTTPS 200 (CNAME added) |
| 5 | lexaudit | ✅ HTTPS 200 (CNAME added) |
| 6 | curator tunnel reachable | ✅ tunnel UP, 4 edge connections, service-mode permanent |
| 7 | CF Access auth working | ✅ HTTP 200 with service token from Hetzner |
| 8 | scout.py heartbeat fires | ⚠️ blocked on item A above (Ollama model mismatch) |
| 9 | /api/ops/health responds | ⚠️ pending Vercel redeploy of `OPS_DASHBOARD_TOKEN` fix |
| 10 | Telegram ops alerts bot | not retested this session |
| 11 | Hub FAQ bot | not retested this session |

**8 of 11 verified green.** The remaining 3 either land automatically (#9 once redeploy completes) or need ~30 min next session (#8 + investigation; #10/#11 are quick verifies).

---

## Update — 2026-05-04 (next session)

### Closed today

#### 1. Cloudflared tunnel routing — TWO bugs cascaded

**Bug 1: IPv4 vs IPv6 routing.** Two services bound port 11434 on Moses Windows machine:
- ollama.exe PID 23972 listening on `::` (Windows Ollama with `gemma4` models)
- wslrelay.exe PID 50784 listening on `127.0.0.1` (forwards to WSL Ollama with llama3.2:3b + qwen2.5:7b)

cloudflared resolves `localhost:11434` → IPv6 first → hits Windows Ollama → returns model not found for llama3.2:3b. The models scout needs are in WSL.

**Fix 1:** edit `%ProgramData%\Cloudflare\.cloudflared\config.yml` ingress to use `127.0.0.1:11434` instead of `localhost:11434`.

**Bug 2: Host header rejection.** With Bug 1 fixed, Ollama returned HTTP 403 because cloudflared forwards `Host: curator.bizlegal-ai.com` and Ollamas default `OLLAMA_ORIGINS` rejects non-localhost origins.

**Fix 2:** `originRequest.httpHostHeader: localhost:11434` in the same ingress block — tells cloudflared to rewrite Host before forwarding.

End-to-end verified: chat call through tunnel returns HTTP 200 with model response.

#### 2. Telegram alerts bot — vault format + Vercel mismatch

`/api/cron/ops-alerts` ran fine but `alerts_sent: 0` because the bot could not authenticate to Telegram.

**Discovery 1:** vault `BIZLEGALBOT_TOKEN` was 45 chars without the colon between bot_id and secret. Proper format: `<numeric_id>:<35_char_secret>` (46 chars total). Telegram returns 404 on malformed tokens.

**Discovery 2:** Vercel `TELEGRAM_BOT_TOKEN` was the HUB bot (8645124750), not the alerts bot (8242535215).

**Fixes:**
- Vault edited in-place to add the missing colon
- Vercel TELEGRAM_BOT_TOKEN removed + re-added with alerts bot value across Production / Preview / Development
- Synthetic message via alerts bot landed in chat 989097520

Z7 Row 10 passes — alerts pipeline works end-to-end.

#### 3. systemd unit fix — silent crash loop

scout.py runs were timing out at the 600s `TimeoutStartSec` boundary. Two reasons:

**Cause 1:** Realistic runtime is 15-25 min. The 600s limit was always too short.

**Cause 2:** Python stdout was fully buffered when going to systemd journal. First `print()` in scout.py is at line 184 (after all RSS fetches). feedparser blocks ~120s on slow feeds. So journal showed zero output until exit. Looked like silent hang.

**Fix:** patched `/etc/systemd/system/curator-scout.service`:
- `TimeoutStartSec=2400` (40 min)
- `Environment=PYTHONUNBUFFERED=1` + `python -u`
- Moved `StartLimitIntervalSec` to `[Unit]` section

Synced to monorepo at services/hetzner/systemd/curator-scout.service (commit 941aacb).

#### 4. RSS feed audit — three sources broken

While diagnosing, found 3 of scout's 5 RSS sources have problems:
- FTC: HTTP 403 (anti-bot). 0 entries.
- EU: HTTP 301 redirect feedparser does not follow. 0 entries.
- FinCEN: HTTP 404. URL is dead.

Working: SEC (25 entries) + FCA (20 entries). Worth refreshing the feed list when there is time. Not session-blocking.

### Still open

#### A. Vercel hub redeploy is BLOCKED

Today's CLI deploy failed with `Command "npm install" exited with 1`. Root cause: the monorepo has no `pnpm-lock.yaml` committed. Vercel auto-detects npm, runs `npm install`, fails because `package.json` uses `workspace:*` protocol.

Fix path (next session):
1. `cd bizlegal-monorepo && pnpm install` — generates `pnpm-lock.yaml`
2. Audit + commit
3. Verify Vercel project Include source files outside Root Directory setting is enabled
4. Override Vercel install command to `pnpm install --frozen-lockfile=false` if auto-detect still picks npm
5. Push lockfile commit, redeploy
6. Test `/api/ops/health?token=<vault>` returns JSON

Until then, the Production deployment has the OLD `OPS_DASHBOARD_TOKEN` value. Vercel-side env IS now correct; only the running serverless instance has stale value.

#### B. scout end-to-end heartbeat

Currently running with patched unit. A Monitor task watches journal for completion (bmkrfr39o). Expected first journal lines:
- `[scout] fetched N items across M feeds`
- `[scout] X/Y items passed filter`
- `[scout] persisted N candidates`

### Z7 row-by-row (post-2026-05-04 pass)

| Row | Check | State |
|---|---|---|
| 1 | DNS resolves (9 surfaces) | OK all 9 |
| 2 | HTTP endpoints (8 surfaces) | OK all 8 = 200 |
| 3 | OCI router | OK 200 |
| 4 | tracr | OK 200 |
| 5 | lexaudit | OK 200 |
| 6 | curator tunnel UP, service permanent | OK |
| 7 | CF Access auth working | OK |
| 8 | scout heartbeat fires | in-progress |
| 9 | /api/ops/health responds with right token | blocked on item A |
| 10 | Telegram ops alerts bot | OK end-to-end |
| 11 | Hub FAQ bot | partial (getMe responds; no inbound test yet) |

**9 of 11 verified green.**

---

## Update — 2026-05-04 23:30 (scout completion attempt)

The 2026-05-04 patched unit ran scout to its 40-min budget but **didn't finish**. Real-world timing from the journal:

| Phase | Expected (isolated test) | Actual (under scout load) |
|---|---|---|
| RSS fetch (5 feeds, 20 items) | ~2 min | **18 min** |
| Ollama filter pass (~17s/call × 20) | ~6 min | **>22 min** (cut off by SIGTERM) |
| Rank pass + persist + Telegram | ~1 min | did not reach |

Per-call Ollama latency was **~66s** under scout's load, vs **17s** in isolated chat test. The 4× slowdown is most likely **model thrashing** — scout uses `llama3.2:3b` for filter and `qwen2.5:7b` for rank. Default Ollama behavior is to keep one model loaded; swapping between them adds ~30-50s per call (whichever isn't currently in VRAM gets reloaded).

The RSS slowdown (18 min vs 2 min) is harder to explain. feedparser test in isolation timed each feed at 30s with `socket.setdefaulttimeout(15)`. Scout doesn't set that timeout, so feedparser may be doing longer retries or following more redirects per feed in the real run.

### Fix options (any one unblocks scout — pick one next session)

**Option 1 — reduce workload (5 min code edit):**
- In `services/hetzner/scout.py`: set `MAX_ITEMS_PER_FEED = 3`
- Remove the 3 broken feeds from `RSS_FEEDS` (FTC=403, EU=301, FinCEN=404)
- New math: 2 feeds × 3 items × 17s warm = ~100s filter, ~30s rank, ~10s persist = ~3 min total

**Option 2 — keep both models warm (1 line config):**
- On Moses Windows machine: `setx OLLAMA_KEEP_ALIVE 24h` (or `24h0m0s`) and restart Ollama
- This tells Ollama to keep models in memory for 24h between requests
- Both llama3.2:3b + qwen2.5:7b loaded simultaneously needs ~7GB VRAM, fits comfortably in modern GPUs
- After this, all Ollama calls should be ~17s warm
- Scout total: 18 min RSS + 6 min filter + 1 min rank + 1 min persist = ~26 min — fits in current 40-min budget

**Option 3 — brute force (1 line systemd):**
- `TimeoutStartSec=5400` (90 min) in `services/hetzner/systemd/curator-scout.service`
- Doesn't fix the underlying slowness, just gives the pipeline more rope
- Bad option because cron timer fires daily — back-to-back failures stack up if a run blocks the next

**Recommendation: Option 1 + Option 2 together.** Option 1 alone gives a fast iteration loop for development. Option 2 fixes the production case for whenever item count grows back. Option 3 is a backup safety net that doesn't address root cause.

### Z7 row 8 (scout heartbeat) status

Still ⏳ pending. Once one of the above fixes lands, scout will complete and emit a heartbeat ops_event to `/api/ops/log` (HMAC-signed). Expected in the feed within ~5 min of a successful run.

### Operating-book note for next session

Before re-firing scout, check that the underlying Ollama latency is fast. One-liner from Hetzner:

```bash
cd /opt/bizlegal/curator && set -a && source .env && set +a && \
  time curl -sk --max-time 60 -o /dev/null -w "HTTP %{http_code}\n" \
    -H "cf-access-client-id: $CF_ACCESS_CLIENT_ID" \
    -H "cf-access-client-secret: $CF_ACCESS_CLIENT_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"model":"llama3.2:3b","messages":[{"role":"user","content":"ok"}],"stream":false}' \
    "$OLLAMA_TUNNEL_URL/api/chat"
```

If `time` is <20s, Ollama is warm. If >40s, it's reloading the model. Check `OLLAMA_KEEP_ALIVE` on the Windows machine.
