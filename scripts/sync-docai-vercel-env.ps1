<#
Sync DocAI launch envs from the canonical vault to the linked Vercel project.

Run from repo root after Windows/Node TLS certificate validation is fixed.
Do NOT run with NODE_TLS_REJECT_UNAUTHORIZED=0 because this uploads secrets.

Dry run:
  pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment production -DryRun

Real sync:
  pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment production
  pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment preview
  pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment development
#>

param(
  [ValidateSet('production','preview','development')]
  [string]$Environment = 'production',
  [string]$VaultPath = 'C:\Users\Moshe Dor\Downloads\env-hub-bizlegal-ai.txt',
  [string]$DocAiDir = 'C:\Users\Moshe Dor\bizlegal-monorepo\apps\docai\web',
  [string]$SiteUrl = 'https://web-eight-blue-44.vercel.app',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$keys = @(
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'NOWPAYMENTS_API_KEY',
  'NOWPAYMENTS_IPN_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_ENV',
  'BIZLEGAL_INBOUND_SECRET',
  'OPS_DASHBOARD_TOKEN',
  'RESEND_API_KEY',
  'RESEND_FROM',
  'PAYPAL_WEBHOOK_ID',
  'PAYONEER_DOCAI_LINK',
  'OPS_LOG_URL',
  'OPENAI_MODEL',
  'OPENAI_EMBEDDING_KEY',
  'NEXT_PUBLIC_DISCLAIMER_VERSION',
  'NEXT_PUBLIC_PAYPAL_SCAN_ENABLED'
)

if ($env:NODE_TLS_REJECT_UNAUTHORIZED -eq '0' -and -not $DryRun) {
  throw 'Refusing to upload secrets while NODE_TLS_REJECT_UNAUTHORIZED=0.'
}

if (!(Test-Path -LiteralPath $VaultPath)) {
  throw "Vault not found: $VaultPath"
}

$vault = @{}
Get-Content -LiteralPath $VaultPath | ForEach-Object {
  if ($_ -match '^([^#=\s]+)=(.*)$') {
    $vault[$matches[1]] = $matches[2]
  }
}

if (![string]::IsNullOrWhiteSpace($SiteUrl)) {
  $vault['NEXT_PUBLIC_SITE_URL'] = $SiteUrl
}

if (!$vault.ContainsKey('NEXT_PUBLIC_PAYPAL_SCAN_ENABLED')) {
  $vault['NEXT_PUBLIC_PAYPAL_SCAN_ENABLED'] = 'false'
}

Push-Location $DocAiDir
try {
  foreach ($key in $keys) {
    if (!$vault.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($vault[$key])) {
      Write-Host "skip $key empty_or_missing"
      continue
    }

    $sensitive = -not ($key -like 'NEXT_PUBLIC_*')
    if ($DryRun) {
      Write-Host "would_sync $key $Environment sensitive=$sensitive"
      continue
    }

    $existing = (& vercel env list $Environment --no-color 2>$null | Select-String -SimpleMatch $key)
    $action = if ($existing) { 'update' } else { 'add' }

    $tmp = New-TemporaryFile
    try {
      Set-Content -LiteralPath $tmp -Value $vault[$key] -NoNewline
      $quotedTmp = '"' + $tmp + '"'

      if ($action -eq 'update') {
        Write-Host "update $key $Environment sensitive=$sensitive"
        if ($sensitive) {
          cmd /c "vercel env remove $key $Environment --yes"
          cmd /c "vercel env add $key $Environment --yes --sensitive < $quotedTmp"
        } else {
          cmd /c "vercel env update $key $Environment --yes < $quotedTmp"
        }
      } else {
        Write-Host "add $key $Environment sensitive=$sensitive"
        if ($sensitive) {
          cmd /c "vercel env add $key $Environment --yes --sensitive < $quotedTmp"
        } else {
          cmd /c "vercel env add $key $Environment --yes < $quotedTmp"
        }
      }
    } finally {
      Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    }
  }
} finally {
  Pop-Location
}

