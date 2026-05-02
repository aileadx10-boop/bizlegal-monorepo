# Hetzner Curator — BizLegal-AI Forge content pipeline

The Hetzner box runs the **legal-gap scout + brain + publisher** loop.
Three deploys per week; two manual gates (topic pick + page approve).

## Architecture

```
[laptop RTX 4060 8GB]  Ollama gpt classifier + ranker
        |
        v  (Cloudflare Tunnel: laptop → curator.bizlegal-ai-internal.com)
[Hetzner CX32]
  ├─ n8n :5679       cron 06:00 Mon/Wed/Fri — RSS → laptop Ollama → Supabase
  ├─ scout.py        ranks top 3 candidates, posts batch to Telegram (BIZLEGALFORGEBOT)
  ├─ Marimo :8081    brain notebook — Claude Sonnet 4.6 draft + Mermaid + gpt-image-1 hero
  ├─ bot.py          Telegram callback router (Approve / Reject / Regen / Pick #N)
  ├─ publisher.py    on Approve → commits MDX + hero PNG to bizlegal-ea
  └─ caddy           reverse proxy on 5679, 8081, 8082 (publisher webhook)

[bizlegal-ea/content/blog]     Cloudflare Pages auto-rebuilds blog.bizlegal-ai.com
[bizlegal-ai.com]              hub Today's Brief picks up new post via /feed.xml
```

## Two manual gates

1. **Topic pick.** Telegram bot sends Moses a message every Mon/Wed/Fri 06:30 UTC
   with the 3 top-ranked candidates + buttons `[Pick #1]` `[Pick #2]` `[Pick #3]` `[Skip]`.
   On tap, `bot.py` updates `daily_gaps.status='picked'` and pings Marimo.
2. **Page approve.** Marimo writes the draft to a preview URL and pings Telegram with
   `[Deploy] [Reject] [Regen]`. On tap, `publisher.py` commits to bizlegal-ea (Cloudflare
   Pages rebuilds the blog) AND optionally pushes a `/[slug]` page to the hub if the
   draft's `target` field says `hub` or `both`.

## Files in this directory

| File | Purpose |
|---|---|
| `scout.py` | Polls 5 RSS feeds, calls laptop Ollama via tunnel, ranks top 3, writes Supabase |
| `brain.py` | Marimo notebook — pulls picked candidate, calls Claude, generates Mermaid + hero, writes preview |
| `bot.py` | Telegram bot listener (BIZLEGALFORGEBOT). Handles all button callbacks. |
| `publisher.py` | On Approve callback: commits MDX + hero PNG to bizlegal-ea via GitHub PAT |
| `n8n/legal-gap-scout.json` | n8n workflow JSON; Moses imports via UI |
| `systemd/curator-bot.service` | systemd unit for bot.py |
| `systemd/curator-publisher.service` | systemd unit for publisher.py |
| `.env.example` | Env vars expected on the box |
| `requirements.txt` | Python deps for the Hetzner venv |

## Hetzner deploy

```bash
# On Moses's laptop (one-time):
ssh root@204.168.209.235

# On the box:
cd /opt/bizlegal
git clone --depth 1 https://github.com/aileadx10-boop/bizlegal-ea.git ea
cp -r ea/projects/hetzner-curator /opt/bizlegal/curator
cd /opt/bizlegal/curator

# Install Python deps into the existing venv
/opt/bizlegal/venv/bin/pip install -r requirements.txt

# Configure env
cp .env.example .env
# Fill in: BIZLEGALFORGEBOT, USER, SUPABASE_URL, SUPABASE_SECRET, GITHUB_TOKEN,
# ANTHROPIC_API_KEY_ENRICH, NEW_OPENAI_KEY, OLLAMA_TUNNEL_URL

# Install systemd units
cp systemd/*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now curator-bot.service curator-publisher.service

# Import n8n workflow via the web UI:
#   http://YOUR_IP:5679 → Workflows → Import from File → n8n/legal-gap-scout.json
#   Set the cron node to 0 6 * * 1,3,5
```

## Cloudflare Tunnel to laptop Ollama

The laptop runs Ollama at `:11434`. Hetzner reaches it via:

```bash
# On laptop (one-time):
cloudflared tunnel create laptop-ollama
cloudflared tunnel route dns laptop-ollama curator.bizlegal-ai-internal.com
cloudflared tunnel run --url http://localhost:11434 laptop-ollama

# (Service-token auth on the tunnel side; only Hetzner's IP can call it.)
```

In the Hetzner `.env`:
```
OLLAMA_TUNNEL_URL=https://curator.bizlegal-ai-internal.com
OLLAMA_TUNNEL_TOKEN=<service token from CF dashboard>
OLLAMA_FILTER_MODEL=llama3.2:3b
OLLAMA_RANK_MODEL=qwen2.5:7b-instruct-q4_K_M
```

If the laptop is offline at scout time, n8n retries every 30 minutes for 4 hours,
then DLQs to Telegram. Moses can also trigger the workflow manually from the n8n
UI when his laptop is on.

## Cost profile

- Hetzner CX32: existing line item ($5.83/mo).
- Cloudflare Tunnel: free.
- Ollama (laptop): zero marginal cost (runs on owned GPU).
- Claude Sonnet 4.6 per post: ~$0.10 (single 3K-token call per approved draft, ~3 drafts/week).
- gpt-image-1 hero `quality:medium` per post: ~$0.04.
- Total per post: ~$0.14. Weekly: ~$0.42. Monthly: ~$2.

(If we needed more: gpt-4o text fallback ~$0.06 per post if both Anthropic
and Gemini exhaust their quotas — same chain as the existing seo-cron.)

## Anti-hallucination contract

Every published post MUST include:

1. **Sources** footer block listing every URL given to Claude.
2. **disclaimer_version** stamp matching the hub's `lib/legal/disclaimer.ts`.
3. **Methodology** line: "Drafted from regulator-published sources between
   {start} and {end}, edited by Moses before publish."
4. **Numeric-claim verification.** Before commit, `publisher.py` greps the
   draft for numbers (dates, fines, deadlines) and asks Claude:
   "Does this number appear in the sources I gave you? yes/no per number."
   Drafts failing the check go back to Reject in the bot.
