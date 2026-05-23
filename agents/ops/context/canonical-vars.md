# Canonical Vars

## Vault
- Single source: `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`
- Read first before adding new envs
- Append new KEY= before using anywhere

## Critical envs

| Env | Used by | Set? |
|-----|---------|------|
| `BIZLEGAL_INBOUND_SECRET` | All 11 surfaces | Yes |
| `OPS_DASHBOARD_TOKEN` | hub Vercel | Yes |
| `CRON_SECRET` | hub Vercel | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | hub Vercel | Yes |
| `SUPABASE_SERVICE_KEY` | hub Vercel | Yes |
| `ANTHROPIC_API_KEY` | hub Vercel | Yes |
| `RESEND_API_KEY` | hub Vercel | Yes |
| `NOWPAYMENTS_API_KEY` | hub Vercel | Yes |
| `PAYPAL_CLIENT_ID` | hub Vercel | Sandbox only |
| `PAYPAL_CLIENT_SECRET` | hub Vercel | Sandbox only |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | All Vercel projects | No — Moses needed |
| `LINKEDIN_ACCESS_TOKEN` | hub Vercel | No — Moses needed |
| `LINKEDIN_AUTHOR_URN` | hub Vercel | No — Moses needed |
| `X_BEARER_TOKEN` | hub Vercel | No — Moses needed |
| `REDDIT_ACCESS_TOKEN` | hub Vercel | No — Moses needed |
| `BUFFER_ACCESS_TOKEN` | hub Vercel | No — Moses needed |
| `BUFFER_DEFAULT_PROFILE_IDS` | hub Vercel | No — Moses needed |
| `GSC_SERVICE_ACCOUNT_JSON` | gsc-bot Worker | No — Moses needed |
| `GSC_BOT_ADMIN_TOKEN` | gsc-bot Worker | No — Moses needed |
| `HETZNER_PUBLISHER_HEALTH_URL` | hub Vercel | Optional |

## Infrastructure
- Vercel team: `aileadx10-5415s-projects`
- Supabase project: `ydghhcuuopqzgqcicubg` (ap-southeast-2)
- Deploy: push to `main` → auto-deploys to Vercel
