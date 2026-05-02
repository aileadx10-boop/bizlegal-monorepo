<#
.SYNOPSIS
    One-shot Day 2 deploy for bizlegal-lead-intake Cloudflare Worker.

.DESCRIPTION
    Deploys the Worker and sets its 4-5 secrets in one pass.

    What this does (review before running):
      1. Reads values from $HOME\.env.CANONICAL.txt:
           - ANTHROPIC_API_KEY_COMPLIANCE  -> Worker secret ANTHROPIC_API_KEY
           - TELEGRAM_BOT_TOKEN (optional) -> Worker secret TELEGRAM_BOT_TOKEN
           - TELEGRAM_CHAT_ID (optional)   -> Worker secret TELEGRAM_CHAT_ID (fallback 989097520)
      2. Calls `gh auth token`             -> Worker secret GITHUB_TOKEN
      3. Generates a fresh WEBHOOK_SHARED_SECRET (32 bytes hex)
         and writes it ONLY to $HOME\.bizlegal\webhook-secret.env (never to stdout)
      4. Writes a short-lived secrets JSON to $env:TEMP (deleted on exit)
      5. Runs: wrangler deploy   (creates the Worker)
      6. Runs: wrangler secret bulk <temp file>   (uploads all secrets)
      7. Deletes the temp JSON

    Secret values never enter stdout, shell history, or any chat transcript.

.EXAMPLE
    PS> cd "C:\Users\Moshe Dor\Downloads\SKOOL-NATE\executive assistant\projects\bizlegal-lead-intake"
    PS> .\scripts\deploy.ps1

.NOTES
    After deploy, source the shared secret for curl tests:
      PS> . "$HOME\.bizlegal\webhook-secret.env.ps1"
      PS> $env:WEBHOOK_SHARED_SECRET
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

# Navigate to project root (parent of scripts/)
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
Set-Location $projectDir

# ----- Locate env files (canonical-env-clean first, then fallbacks) -----------
$envCandidates = @(
    (Join-Path $HOME ".claude\canonical-env-clean.env"),
    "C:\Users\Moshe Dor\.claude\canonical-env-clean.env",
    (Join-Path $HOME ".env.CANONICAL.txt"),
    "C:\Users\Moshe Dor\.env.CANONICAL.txt",
    "C:\Users\Moshe Dor\Downloads\SKOOL-NATE\LANDING PAGES\ENV.txt",
    "C:\Users\Moshe Dor\.env.bizlegal.txt",
    "C:\Users\Moshe Dor\.env.allprojects.txt",
    "C:\Users\Moshe Dor\.env.complianceprojects04-26.txt"
) | Where-Object { Test-Path $_ } | Select-Object -Unique

if (-not $envCandidates) {
    Write-Error "No env files found. Looked at canonical env, LANDING PAGES, bizlegal, allprojects, compliance04-26."
    exit 1
}

# ----- Preflight -------------------------------------------------------------
Write-Host "==> Checking wrangler auth"
$null = & wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Run 'wrangler login' first."
    exit 1
}

Write-Host "==> Checking gh auth"
$null = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Run 'gh auth login' first."
    exit 1
}

# ----- Extract values from canonical env -------------------------------------
function Get-EnvValue {
    param(
        [Parameter(Mandatory)][string]$Key,
        [Parameter(Mandatory)][string[]]$Files
    )
    foreach ($f in $Files) {
        $line = Select-String -Path $f -Pattern "^$([Regex]::Escape($Key))=" -SimpleMatch:$false |
                Select-Object -First 1
        if (-not $line) { continue }
        $value = ($line.Line -split '=', 2)[1]
        $value = $value.Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        if ($value) { return $value }
    }
    return $null
}

function Get-EnvValueAny {
    param(
        [Parameter(Mandatory)][string[]]$Keys,
        [Parameter(Mandatory)][string[]]$Files
    )
    foreach ($k in $Keys) {
        $v = Get-EnvValue -Key $k -Files $Files
        if ($v) { return $v }
    }
    return $null
}

Write-Host "==> Reading env from: $($envCandidates -join '; ')"

$anthropicVal = Get-EnvValueAny `
    -Keys @("ANTHROPIC_API_KEY_COMPLIANCE","ANTHROPIC_API_KEY","CLAUDE_API_KEY") `
    -Files $envCandidates
if (-not $anthropicVal) {
    Write-Error "Missing Anthropic key. Looked for ANTHROPIC_API_KEY_COMPLIANCE / ANTHROPIC_API_KEY / CLAUDE_API_KEY across all env files."
    exit 1
}

$githubVal = (& gh auth token).Trim()
if (-not $githubVal) {
    Write-Error "gh auth token returned empty"
    exit 1
}

$telegramBotVal  = Get-EnvValueAny `
    -Keys @("TELEGRAM_BOT_TOKEN","BIZLEGALBOT_TOKEN","BIZLEGAL_BOT_TOKEN","TG_BOT_TOKEN") `
    -Files $envCandidates
$telegramChatVal = Get-EnvValueAny `
    -Keys @("TELEGRAM_CHAT_ID","BIZLEGAL_TELEGRAM_CHAT_ID","TG_CHAT_ID") `
    -Files $envCandidates
if (-not $telegramChatVal) { $telegramChatVal = "989097520" }

# ----- Shared secret: reuse existing if present, else generate fresh ---------
$bizlegalDir = Join-Path $HOME ".bizlegal"
if (-not (Test-Path $bizlegalDir)) {
    New-Item -Path $bizlegalDir -ItemType Directory -Force | Out-Null
}
$secretEnvFile = Join-Path $bizlegalDir "webhook-secret.env"
$secretPs1File = Join-Path $bizlegalDir "webhook-secret.env.ps1"

$sharedSecret = $null
if (Test-Path $secretEnvFile) {
    # Reuse existing secret so redeploys don't break existing curl tests / form integrations
    $existingLine = (Get-Content $secretEnvFile -Raw).Trim()
    if ($existingLine -match '^WEBHOOK_SHARED_SECRET=([a-f0-9]{64})$') {
        $sharedSecret = $Matches[1]
        Write-Host "==> Reusing existing WEBHOOK_SHARED_SECRET from $secretEnvFile"
    }
}
if (-not $sharedSecret) {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = [byte[]]::new(32)
    $rng.GetBytes($bytes)
    $rng.Dispose()
    $sharedSecret = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
    Write-Host "==> Generated fresh WEBHOOK_SHARED_SECRET"
}

# Write both a .env style file (for bash/source) and a .ps1 style file (for PowerShell dot-source)
"WEBHOOK_SHARED_SECRET=$sharedSecret" | Set-Content -Path $secretEnvFile -NoNewline:$false -Encoding ascii
"`$env:WEBHOOK_SHARED_SECRET = '$sharedSecret'" | Set-Content -Path $secretPs1File -NoNewline:$false -Encoding ascii

# Best-effort NTFS ACL: restrict to current user
try {
    $me = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    foreach ($f in @($secretEnvFile, $secretPs1File)) {
        $acl = Get-Acl $f
        $acl.SetAccessRuleProtection($true, $false)  # disable inheritance
        $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $me, "FullControl", "Allow")
        $acl.AddAccessRule($rule)
        Set-Acl -Path $f -AclObject $acl
    }
} catch {
    Write-Warning "Could not tighten ACL on secret file: $_"
}

# ----- Build short-lived secrets JSON ----------------------------------------
$secretsObj = [ordered]@{
    ANTHROPIC_API_KEY       = $anthropicVal
    GITHUB_TOKEN            = $githubVal
    WEBHOOK_SHARED_SECRET   = $sharedSecret
}
if ($telegramBotVal)  { $secretsObj.TELEGRAM_BOT_TOKEN = $telegramBotVal }
if ($telegramChatVal) { $secretsObj.TELEGRAM_CHAT_ID   = $telegramChatVal }

$tmpJson = Join-Path $env:TEMP "bizlegal-intake-secrets.$PID.json"
$secretsObj | ConvertTo-Json -Compress | Set-Content -Path $tmpJson -NoNewline -Encoding utf8

Write-Host "[deploy] prepared $($secretsObj.Keys.Count) secrets"

try {
    # ----- Deploy Worker -----------------------------------------------------
    Write-Host "==> Deploying Worker (first deploy creates it)"
    & wrangler deploy
    if ($LASTEXITCODE -ne 0) { throw "wrangler deploy failed with exit code $LASTEXITCODE" }

    # ----- Bulk-set secrets ---------------------------------------------------
    Write-Host "==> Bulk-setting secrets"
    & wrangler secret bulk $tmpJson
    if ($LASTEXITCODE -ne 0) { throw "wrangler secret bulk failed with exit code $LASTEXITCODE" }

    Write-Host ""
    Write-Host "=================================================="
    Write-Host "DEPLOY COMPLETE"
    Write-Host "=================================================="
    Write-Host ""
    Write-Host "Worker URL printed above by wrangler (look for bizlegal-lead-intake.<sub>.workers.dev)."
    Write-Host ""
    Write-Host "Health check:"
    Write-Host "  curl https://bizlegal-lead-intake.<SUBDOMAIN>.workers.dev/health"
    Write-Host ""
    Write-Host "Smoke test (shared secret loaded from home dir, not scrollback):"
    Write-Host "  . '$secretPs1File'"
    Write-Host "  curl -Method POST https://bizlegal-lead-intake.<SUBDOMAIN>.workers.dev/intake ``"
    Write-Host "    -Headers @{ 'content-type'='application/json'; 'x-bizlegal-secret'=`$env:WEBHOOK_SHARED_SECRET } ``"
    Write-Host "    -Body '{`"full_name`":`"Test Lead`",`"email`":`"test@example.com`",`"challenge`":`"MiCA CASP application needed for EUR stablecoin, Q3 France launch.`"}'"
    Write-Host ""
    Write-Host "Expected: 202 Accepted with lead_id. Pipeline runs in background."
    Write-Host "Check after ~30s:"
    Write-Host "  1. bizlegal-ea/lead_profiles/ for new .md + .json files"
    Write-Host "  2. Telegram chat 989097520 for notification (if score >= 7)"
    Write-Host "  3. bizlegal-ea/decisions/log.md for the new lead line"
    Write-Host ""
    Write-Host "Shared secret saved to:"
    Write-Host "  $secretPs1File   (for PowerShell: dot-source it)"
    Write-Host "  $secretEnvFile   (for bash: source it)"
}
finally {
    # ----- Cleanup -----------------------------------------------------------
    if (Test-Path $tmpJson) {
        Remove-Item -Path $tmpJson -Force
    }
}
