# Cloudflared tunnel — Laptop Ollama → Hetzner

**Goal:** expose the laptop's Ollama server (with NVIDIA RTX 4060) to the Hetzner box at `ollama.bizlegal-ai-internal.com`, so n8n on Hetzner can call the laptop GPU during work hours. When the laptop is offline, n8n queues + retries on next cron — non-blocking.

**Time:** ~10 minutes once Cloudflare account is ready.

**Why:** Hetzner CX32 has no GPU and is RAM-tight (8 GB). Laptop GPU does 7B-9B models well. We don't pay for cloud GPU until/unless laptop becomes a chronic bottleneck.

---

## Step 1 — Install cloudflared on the laptop (Windows)

```powershell
# PowerShell as admin
winget install --id Cloudflare.cloudflared
cloudflared --version
```

Or manual: download from https://github.com/cloudflare/cloudflared/releases/latest (`cloudflared-windows-amd64.exe`), put in `C:\Program Files\cloudflared\`, add to PATH.

---

## Step 2 — Authenticate with Cloudflare

```powershell
cloudflared tunnel login
```

Browser opens. Sign in with the Cloudflare account that owns `bizlegal-ai-internal.com` (or `bizlegal-ai.com` — whichever zone you're using for internal services). Authorize cloudflared. The cert lands at `%USERPROFILE%\.cloudflared\cert.pem`.

> If you don't yet own `bizlegal-ai-internal.com` — register it in Cloudflare (free). Or use a subdomain of `bizlegal-ai.com` like `ollama.bizlegal-ai.com` (the prefix doesn't affect price).

---

## Step 3 — Make sure Ollama is listening locally

```powershell
# Confirm Ollama is running
Invoke-WebRequest http://127.0.0.1:11434/api/tags | Select-Object -ExpandProperty Content
```

You should see your installed models. If not, start Ollama (`ollama serve` or just open the Ollama desktop app).

---

## Step 4 — Create the tunnel

```powershell
cloudflared tunnel create laptop-ollama
```

Outputs a tunnel UUID like `8a7b3c2d-...`. This creates `%USERPROFILE%\.cloudflared\<UUID>.json` — the tunnel credentials.

---

## Step 5 — Write the tunnel config

Create `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: laptop-ollama
credentials-file: C:\Users\Moshe Dor\.cloudflared\<paste UUID>.json

ingress:
  # Only Hetzner box reaches Ollama. Auth via Cloudflare Access service token.
  - hostname: ollama.bizlegal-ai.com
    service: http://127.0.0.1:11434
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
      keepAliveTimeout: 90s
  # Default 404 for anything else
  - service: http_status:404
```

> If you chose `ollama.bizlegal-ai-internal.com`, swap the hostname in both this file and step 7 below.

---

## Step 6 — Route DNS to the tunnel

```powershell
cloudflared tunnel route dns laptop-ollama ollama.bizlegal-ai.com
```

Cloudflare creates the CNAME automatically. Confirm in Cloudflare dashboard → DNS — you should see `ollama` → `<UUID>.cfargotunnel.com`.

---

## Step 7 — Lock down with Cloudflare Access (zero-trust)

This step prevents anyone on the internet from hitting the tunnel. Only Hetzner with a service token can reach it.

1. Cloudflare Zero Trust dashboard → **Access** → **Applications** → **Add application** → Self-hosted.
2. **App name:** `Ollama (laptop GPU)`
3. **Subdomain:** `ollama`
4. **Domain:** `bizlegal-ai.com`
5. **Identity providers:** none (we're using a service token, not user auth).
6. Skip user policies. Click **Next** → **Add policy**:
   - **Policy name:** `hetzner-service-only`
   - **Action:** Allow
   - **Include:** Service Auth → Service Token (we'll create one in step 8)
7. Save the application.

---

## Step 8 — Create the service token

1. Cloudflare Zero Trust → **Access** → **Service Auth** → **Create Service Token**.
2. **Name:** `hetzner-to-laptop-ollama`
3. **Duration:** 1 year.
4. Copy the **Client ID** and **Client Secret** — you only see the Secret once. Paste both into your password manager + canonical-env-clean.env:
   ```
   CF_ACCESS_CLIENT_ID=<paste>
   CF_ACCESS_CLIENT_SECRET=<paste>
   ```
5. Go back to the Access application from step 7, edit the policy, and reference this service token in the Include rule.

---

## Step 9 — Run cloudflared as a service on the laptop

```powershell
# As admin
cloudflared service install
sc start cloudflared
sc query cloudflared
```

The service auto-starts on boot. Verify:

```powershell
cloudflared tunnel info laptop-ollama
```

Should show `1 connector` healthy.

---

## Step 10 — Test from the Hetzner box

SSH in:

```bash
ssh hetzner-box   # whatever your alias is
```

Then on Hetzner:

```bash
curl https://ollama.bizlegal-ai.com/api/tags \
  -H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET"
```

Expect: JSON list of installed models.

If it 403s: service token policy isn't applied. Re-check step 7's policy includes the service token.
If it times out: laptop tunnel isn't running. Re-check `sc query cloudflared` on laptop.
If it 404s: ingress hostname mismatch. Re-check `config.yml`.

---

## Step 11 — Wire n8n on Hetzner to use it

n8n → HTTP Request node:
- **URL:** `https://ollama.bizlegal-ai.com/api/generate`
- **Method:** POST
- **Authentication:** Header Auth → Header Name `CF-Access-Client-Id` / value from env. Add a second Header `CF-Access-Client-Secret` similarly.
- **Body** (JSON): `{ "model": "qwen2.5:7b-instruct-q4_K_M", "prompt": "{{ $json.text }}", "stream": false }`

---

## Step 12 — Add to recovery memory

Append to `RECOVERY.md` action log:
```
2026-04-27 HH:MM | cloudflared tunnel laptop->Hetzner LIVE | ollama.bizlegal-ai.com | enables n8n GPU via laptop
```

---

## Failure modes + remediation

- **Laptop offline:** n8n retries every 30 min for 4 hours, then DLQs to Telegram. Workflow logic already in plan §2.1.
- **Cloudflare service token expired (1 year):** rotate via Zero Trust → Service Auth, re-paste into Hetzner env, restart n8n container.
- **Tunnel UUID lost (laptop reformatted):** `cloudflared tunnel delete laptop-ollama` (use Cloudflare dashboard if local creds are gone), then redo steps 4-9.
- **Ollama model too slow:** drop to a smaller quant or switch model. Hetzner CPU fallback model (`llama3.2:3b-instruct` running on Hetzner, no GPU) for emergencies.

---

## Operating cadence

- Laptop powered on during work hours = Ollama served, n8n cron jobs proceed.
- Laptop sleep/off = jobs queued, retry on wake.
- Workload is 2-3 scout cycles per week (Mon/Wed/Fri 06:00 UTC), each ~15 minutes. Laptop being awake at those times is the only hard requirement.
