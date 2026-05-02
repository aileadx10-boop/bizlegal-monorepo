# Launch a new vertical in 1 day

## What you're copying
This repo is a complete compliance intelligence business engine.
The only things that change between verticals are in 2 files:
1. `infra/site-config.ts` — all brand/product/pricing tokens
2. `infra/HEARTBEAT.md` — regulations, jurisdictions, gap criteria

Everything else — the gap page route, lead magnet flow, n8n pipeline,
payment integration, Supabase schema, Telegram alerts — is identical.

## Step 1: Fork and configure (30 min)
```bash
gh repo fork aileadx10-boop/forge --fork-name [new-vertical]-engine
cd [new-vertical]-engine

# Edit these 2 files only:
code infra/site-config.ts
code infra/HEARTBEAT.md
```

### What to change in site-config.ts
- `brand.name` — Your vertical brand name
- `brand.domain` — Your domain
- `brand.email_*` — Support and sender emails
- `products` — Your product URLs
- `regulations` — Target regulations for your vertical
- `jurisdictions` — Target jurisdictions
- `pricing` — Your pricing tiers

### What to change in HEARTBEAT.md
- Jurisdiction rotation schedule
- Qualification criteria (industry, fine thresholds)
- Regulation names and frameworks
- Slug naming convention

## Step 2: New Supabase project (15 min)
1. Create project at [supabase.com](https://supabase.com)
2. Run the migration:
```bash
psql $NEW_SUPABASE_URL -f infra/gap_pages_table.sql
```
3. Note the URL and service role key

## Step 3: Deploy to Vercel (15 min)
```bash
vercel link  # creates new Vercel project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add NEXT_PUBLIC_PAYPAL_CLIENT_ID
vercel env add NOWPAYMENTS_API_KEY
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel --prod
```

## Step 4: Activate n8n automation (20 min)
```bash
ssh root@204.168.209.235
cd /opt/bizlegal
# Option A: Duplicate workflow in n8n UI, update Ollama prompt
# Option B: Import infra/n8n/daily_pipeline.json, update env vars
```

Update the Supabase credentials and deploy hook URL in the new workflow.

## Done. Timeline:
- **Day 0**: Fork, configure, deploy
- **Day 1**: First gap page auto-generated at 06:00 IDT
- **Day 7**: 7 indexed URLs, SEO starting
- **Day 30**: 30 URLs, organic traffic beginning
- **Day 90**: 90 URLs, leads coming in organically

## Examples of other verticals using same stack:
| Vertical | Swap regulations in HEARTBEAT.md |
|---|---|
| Healthcare privacy | HIPAA, HITECH, 21st Century Cures Act |
| Real estate compliance | TILA, RESPA, BSA/AML, CFPB |
| AI governance | EU AI Act, NIST AI RMF, Colorado AI Act |
| Employment law | FLSA, FMLA, ADA, EEOC, state labor codes |
| ESG/sustainability | CSRD, SFDR, EU Taxonomy, SEC Climate |
| Fintech/banking | PSD2, Open Banking, BSA, GLBA, FCRA |

## Architecture
```
HEARTBEAT.md prompt
    ↓
n8n cron (daily 03:00 UTC)
    ↓
Ollama gemma2:9b (local, free)
    ↓
JSON → Supabase gap_pages INSERT
    ↓
Vercel deploy hook (ISR rebuild)
    ↓
forge.bizlegal-ai.com/gap/{jurisdiction}/{slug}
    ↓
Lead magnet form → Supabase leads + Resend email
    ↓
Telegram alert to founder
```

Cost per vertical: $0/month (Ollama local, Supabase free tier, Vercel free tier, n8n self-hosted).
