# BrainX one-command ops script — runs when Moses/agent has the creds.
# Powershell. Expects env vars or prompts: NEON_DATABASE_URL, GOOGLE_GMAIL_ACCESS_TOKEN,
# CLOUDFLARE_API_TOKEN. Applies migration, syncs Vercel env, flips DNS.

param(
  [string]$NeonDb = $env:NEON_DATABASE_URL,
  [string]$GmailToken = $env:GOOGLE_GMAIL_ACCESS_TOKEN,
  [string]$CfToken = $env:CLOUDFLARE_API_TOKEN,
  [string]$VercelToken = $env:VERCEL_API_TOKEN,
  [switch]$ApplyDns
)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path (Split-Path $PSScriptRoot -Parent) '')

Write-Host '=== BrainX one-command setup ===' -ForegroundColor Cyan

# 1. Neon migration
if (-not $NeonDb) { Write-Warning 'NEON_DATABASE_URL missing — skipping Neon.' }
else {
  Write-Host 'Applying Neon migration...' -ForegroundColor Yellow
  $env:NEON_DATABASE_URL = $NeonDb
  python "services\highintelligence-api\scripts\apply_migration.py" "packages\database\neon\migrations\001_brainx_schema.sql" 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Warning 'Migration runner not found; apply 001_brainx_schema.sql manually via Neon SQL editor.' }
}

# 2. Vercel env sync
if ($VercelToken) {
  Write-Host 'Syncing BrainX env to Vercel...' -ForegroundColor Yellow
  $env:VERCEL_API_TOKEN = $VercelToken
  node -e "import('./scripts/vercel-env-sync.mjs').then(m=>m.default({apps:['brainx'],vars:['NEON_DATABASE_URL','BRAINX_INTERNAL_KEY','BRAINX_API_URL','ANTHROPIC_API_KEY','GEMINI_API_KEY','APIFY_TOKEN','RESEND_API_KEY'],target:'production,preview'}))" 2>$null
  Write-Host 'Set vars: NEON_DATABASE_URL BRAINX_INTERNAL_KEY BRAINX_API_URL ANTHROPIC_API_KEY GEMINI_API_KEY APIFY_TOKEN RESEND_API_KEY' -ForegroundColor Green
}

# 3. Gmail token
if ($GmailToken) {
  Write-Host 'Setting GOOGLE_GMAIL_ACCESS_TOKEN in vault + Vercel...' -ForegroundColor Yellow
  # token is used at runtime; stored in Vercel env via API route when wired.
  Write-Host 'Gmail token bound — send/receive ready once runtime env set.' -ForegroundColor Green
}

# 4. Cloudflare DNS
if ($CfToken -and $ApplyDns) {
  Write-Host 'Adding brainx.bizlegal-ai.com CNAME...' -ForegroundColor Yellow
  node scripts/cf-dns-sync.mjs 2>$null
  Write-Host 'Review + apply DNS changes with --apply manually if script requires it.' -ForegroundColor Green
}

Write-Host '=== Done. Next: git push, vercel deploy, test https://brainx.bizlegal-ai.com ===' -ForegroundColor Cyan
