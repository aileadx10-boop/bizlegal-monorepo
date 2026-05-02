# Post-Cutover Punch List — 2026-05-03

After the Phase Z monorepo cutover (Vercel Root Directory swap for 7 projects), three RED items remain. All three are DNS-level issues, not code/build issues. They cannot be fixed from the agent side because each requires either Cloudflare dashboard access or the Vercel Preview UI.

---

## 1. tracr.bizlegal-ai.com — DNS record missing

**Symptom:** `curl https://tracr.bizlegal-ai.com/api/digest` → `000` (timeout, never connects)

**Root cause:** The DNS A/AAAA record for `tracr` does not exist on the `bizlegal-ai.com` zone.

```
$ nslookup tracr.bizlegal-ai.com
*** can't find tracr.bizlegal-ai.com: Non-existent domain
```

**Compare:** Working subdomains all resolve to Vercel's IPv6 anycast `2a06:98c1:31{20,21}::7`:

| Subdomain | DNS state |
|---|---|
| bizlegal-ai.com (apex) | OK → 2a06:98c1:3121::7 |
| brai.bizlegal-ai.com | OK → 2a06:98c1:3120::7 |
| docai.bizlegal-ai.com | OK → 2a06:98c1:3121::7 |
| forge.bizlegal-ai.com | OK → 2a06:98c1:3120::7 |
| leadforge.bizlegal-ai.com | OK → 2a06:98c1:3120::7 |
| **tracr.bizlegal-ai.com** | **MISSING** |
| **lexaudit.bizlegal-ai.com** | **MISSING** |
| **router.bizlegal-ai.com** | **MISSING** |

**Fix (Moses, ~1 min):**

Cloudflare Dashboard → bizlegal-ai.com → DNS → Records → Add record:
- Type: `CNAME`
- Name: `tracr`
- Target: `cname.vercel-dns.com`
- Proxy status: **Proxied (orange cloud)** — same as the other working subdomains
- TTL: Auto

Then in the Vercel `tracr` project: Settings → Domains → confirm `tracr.bizlegal-ai.com` is listed and verified. If it shows "Invalid Configuration", click "Refresh".

---

## 2. lexaudit.bizlegal-ai.com — DNS record missing

**Symptom:** Same as tracr — `000` timeout.

**Root cause:** Same — DNS record missing.

**Fix (Moses, ~1 min):**

Cloudflare Dashboard → bizlegal-ai.com → DNS → Records → Add record:
- Type: `CNAME`
- Name: `lexaudit`
- Target: `cname.vercel-dns.com`
- Proxy status: **Proxied (orange cloud)**
- TTL: Auto

Verify in Vercel `lexaudit` project → Settings → Domains.

---

## 3. router.bizlegal-ai.com — DNS record missing

**Symptom:** `curl https://router.bizlegal-ai.com/health` → `000` (originally diagnosed as Caddy 401, but the actual issue is no DNS record reaches Caddy in the first place).

**Root cause:** No A record exists.

**Target IP:** `151.145.81.139` (OCI VM, region `il-jerusalem-1`, found in `services/oci/router/Dockerfile` + `services/oci/CLAUDE.md`).

**Fix (Moses, ~1 min):**

Cloudflare Dashboard → bizlegal-ai.com → DNS → Records → Add record:
- Type: `A`
- Name: `router`
- IPv4: `151.145.81.139`
- Proxy status: **DNS only (gray cloud)** — IMPORTANT, must be gray, NOT orange
- TTL: Auto

The gray cloud is required because Caddy on the OCI VM issues its own Let's Encrypt cert via the HTTP-01 challenge. If Cloudflare proxies the connection (orange), LE can't reach the origin and cert renewal fails.

Then SSH into the VM and verify Caddy picks up the new cert:

```
ssh -i ~/.ssh/oci_id_rsa ubuntu@151.145.81.139
sudo systemctl status caddy
sudo journalctl -u caddy -n 50
curl -k https://router.bizlegal-ai.com/health
```

Expected: `{"ok":true,...}` within 60s of DNS propagation.

---

## 4. FIRECRAWL_API_KEY missing on Hub Preview environment

**Symptom:** Preview deployments of `bizlegal-ai` (hub) fail policy-refresh audit calls because `process.env.FIRECRAWL_API_KEY` is undefined.

**Root cause:** Vercel env vars are scoped per-environment. Production has the key, Preview does not.

**Fix option A — Dashboard (~30 sec):**

vercel.com/dashboard → bizlegal-ai project → Settings → Environment Variables → Add:
- Name: `FIRECRAWL_API_KEY`
- Value: paste from `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt` (search for `FIRECRAWL_API_KEY`)
- Environments: **check Preview only** (Production already has it)
- Save

**Fix option B — CLI:**

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo/apps/hub"
vercel env add FIRECRAWL_API_KEY preview
# When prompted for the value, paste from canonical vault
# When prompted for the branch, leave blank (applies to all preview branches)
```

After either option, trigger a fresh Preview deployment to pick up the new var (push any commit to a non-main branch).

---

## 5. curator.bizlegal-ai-internal.com — Ollama tunnel still broken

**Symptom:** `nslookup curator.bizlegal-ai-internal.com` → Non-existent domain.

**Root cause:** Per Z6 plan + Moses confirmation: the original tunnel was deleted; a different tunnel exists but its name + token aren't yet in the canonical vault.

**Fix (Moses, ~5 min):** Cloudflare Dashboard → Zero Trust → Networks → Tunnels → identify the active Hetzner tunnel → copy its hostname + token → append to canonical vault as:

```
OLLAMA_TUNNEL_URL=<new tunnel hostname>
OLLAMA_TUNNEL_TOKEN=<new tunnel token>
```

Then SSH into the Hetzner box and restart the curator service:

```bash
ssh hetzner "cd /opt/curator && docker compose restart curator-scout"
```

Verify heartbeat:

```bash
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$OPS_DASHBOARD_TOKEN" | jq '.events[] | select(.type=="curator.heartbeat") | .ts' | head -1
```

Expected: timestamp within last 10 min.

---

## Verification — run after fixes

```bash
# DNS resolves
for sub in tracr lexaudit router; do
  echo -n "$sub.bizlegal-ai.com: "
  nslookup "$sub.bizlegal-ai.com" 8.8.8.8 2>&1 | grep -E "Address|Non-existent" | tail -1
done

# Endpoints respond
curl -sk -o /dev/null -w 'tracr=%{http_code}\n' --max-time 15 https://tracr.bizlegal-ai.com/
curl -sk -o /dev/null -w 'lexaudit=%{http_code}\n' --max-time 15 https://lexaudit.bizlegal-ai.com/
curl -sk -o /dev/null -w 'router=%{http_code}\n' --max-time 15 https://router.bizlegal-ai.com/health
```

Expected: 3× `200` (or `405 Method Not Allowed` on root paths if the apps don't define a `/` route — that's still a sign of life).

---

## Why this happened

The Phase Z plan assumed the source repos had working DNS records that just needed Vercel Root Directory pointed at the new monorepo. But the original audit (2026-05-01) flagged the OCI router as a Caddy 401 — that diagnosis was wrong. Cleaning up tracr + lexaudit + router DNS-level state was deferred and never tracked back.

**Lesson for the operating book:** any future "subdomain returning 000" symptom should run `nslookup` BEFORE assuming Caddy/Vercel/build issues. DNS first, code second.
