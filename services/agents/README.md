# THE MACHINE — BizLegal 24/7 Agent System

8 specialist agents dispatched by a single orchestrator. Architecture: WAT (Workflow → Agent → Tool).

## Agents

| Agent | Schedule (UTC) | Purpose |
|---|---|---|
| code | 00:15 daily | Monitor Vercel + endpoints, open PRs on regression |
| enrichment | 02:00, 14:00 | Domain/person → 360 profile via Firecrawl + Apify + Apollo |
| headhunter | 04:30 daily | Find buying signals → queue personalized outreach |
| content | 06:00 daily | 1 blog + 1 LinkedIn + 1 image + 1 video script |
| socials | 09:00, 13:00, 18:00 | Cross-post to 7 platforms via Blotato |
| newsletter | Tue 08:00 | Weekly HTML digest → Resend audience |
| monetization | every 15 min | Hot lead scoring → deal room → DocAI funnel |
| lead_capture | webhook | Form submission → 4-stage Haiku pipeline |

## Install on Hetzner

```bash
# SCP files
scp -r services/agents/ root@204.168.209.235:/opt/bizlegal/curator/services/

# Install cron
ssh root@204.168.209.235 "bash /opt/bizlegal/curator/services/agents/install_machine_cron.sh"

# Verify
ssh root@204.168.209.235 "crontab -l | grep orchestrator"
```

## Run manually

```bash
cd /opt/bizlegal/curator
python3 services/agents/orchestrator.py <agent_name>
# e.g.: python3 services/agents/orchestrator.py enrichment
```

## Env vars required

All from `/opt/bizlegal/curator/.env`. Minimum set:
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY` (newsletter, monetization)
- `FIRECRAWL_API_KEY` (enrichment, content)
- `APIFY_API_TOKEN` (headhunter)
- `BLOTATO_API_KEY` (socials)
