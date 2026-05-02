# n8n Daily Pipeline Setup

## Import steps
1. Open n8n at http://204.168.209.235:5678
2. Login: admin / bizlegal2026
3. Click "Import from file" → upload daily_pipeline.json

## The pipeline (6 nodes)

### Node 1: Cron Trigger
- Schedule: `0 3 * * *` (03:00 UTC = 06:00 IDT)
- Fires once per day

### Node 2: HTTP Request → Ollama
- Method: POST
- URL: `http://localhost:11434/api/generate`
- Body (JSON):
```json
{
  "model": "gemma2:9b",
  "system": "[contents of HEARTBEAT.md]",
  "prompt": "Today is {{ $now.format('YYYY-MM-DD') }}. Day: {{ $now.format('dddd') }}. Jurisdiction rotation: {{ {'Monday':'US','Tuesday':'EU','Wednesday':'UAE','Thursday':'US','Friday':'EU','Saturday':'Singapore','Sunday':'Global'}[$now.format('dddd')] }}. Find one high-value regulatory compliance gap.",
  "stream": false
}
```
- Timeout: 120s

### Node 3: Code Node — Parse JSON
```javascript
const raw = $input.first().json.response;
// Strip markdown fences if present
const clean = raw.replace(/```json|```/g, '').trim();
const gap = JSON.parse(clean);

// Validate required fields
if (!gap.title || !gap.slug || !gap.jurisdiction || !gap.regulation) {
  throw new Error('Missing required fields in SCOUT output');
}

// Clamp risk score
gap.risk_score = Math.max(0, Math.min(100, gap.risk_score || 50));

return [{ json: gap }];
```

### Node 4: Supabase Node → INSERT
- Operation: Insert
- Table: `gap_pages`
- Map fields from Node 3 output:
  - `slug` → `{{ $json.slug }}`
  - `title` → `{{ $json.title }}`
  - `jurisdiction` → `{{ $json.jurisdiction }}`
  - `regulation` → `{{ $json.regulation }}`
  - `risk_score` → `{{ $json.risk_score }}`
  - `summary` → `{{ $json.summary }}`
  - `value_props` → `{{ $json.value_props }}` (JSONB)
  - `lead_magnet_title` → `{{ $json.lead_magnet_title }}`
  - `cta_product` → `{{ $json.cta_product }}`
  - `meta_description` → `{{ $json.meta_description }}`

### Node 5: HTTP Request → Vercel Deploy Hook
- Method: POST
- URL: `https://api.vercel.com/v1/integrations/deploy/{{ $env.VERCEL_DEPLOY_HOOK_FORGE }}`
- Purpose: Triggers ISR rebuild of Forge so new gap page is live

### Node 6: Telegram Node → Daily Summary
- Chat ID: `{{ $env.TELEGRAM_CHAT_ID }}`
- Message:
```
SCOUT DAILY: {{ $json.title }}
Jurisdiction: {{ $json.jurisdiction }}
Regulation: {{ $json.regulation }}
Risk: {{ $json.risk_score }}/100
Live: forge.bizlegal-ai.com/gap/{{ $json.jurisdiction.toLowerCase() }}/{{ $json.slug }}
```

## Error handling
- Add **Error Trigger** node → Telegram alert with error details
- Add retry on Node 2 (max 3 attempts, 30s delay)
- Add retry on Node 4 (max 2 attempts, 10s delay — handles duplicate slug)

## Required env vars in n8n
```
SUPABASE_URL=https://rgbwlaifhfvlxgamwcnz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
TELEGRAM_BOT_TOKEN=<bot token>
TELEGRAM_CHAT_ID=<chat id>
VERCEL_DEPLOY_HOOK_FORGE=<deploy hook id>
OLLAMA_BASE_URL=http://localhost:11434
```

## Testing
1. Manually trigger the workflow in n8n
2. Check Supabase → `gap_pages` table for new row
3. Check `forge.bizlegal-ai.com/gap/{jurisdiction}/{slug}` loads
4. Check Telegram for summary message

## Monitoring
- n8n execution history shows all runs
- Failed runs appear in Telegram via Error Trigger
- Supabase dashboard shows gap_pages growth
- Vercel deployment logs show ISR rebuilds
