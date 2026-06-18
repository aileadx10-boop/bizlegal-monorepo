<#
BizLegal AI — CF AI Crawl Control Disable Script
================================================

This is a one-shot script that disables Cloudflare's "managed robots.txt"
and "AI Crawl Control" features across all 8 BizLegal AI zones, so the
GEO/AEO robots.ts files we just deployed are actually served to AI crawlers.

REQUIREMENTS:
  1. You need a Cloudflare API token with these zone-level permissions:
     - Zone > Settings > Edit
     - Zone > Bot Management > Edit
     - Zone > Zone > Read
     (Generate at: dash.cloudflare.com/profile/api-tokens
      Use the "Edit zone settings" template.)
  2. The token must have access to all 8 zones below. If you only have
     the apex (bizlegal-ai.com), generate a new token with access to all.
  3. PowerShell 7+ (for the Invoke-RestMethod JSON ergonomics).

RUN TIME: ~30 seconds. Reversible (re-run with -Enable if you change mind).

#>

param(
    [string]$ApiToken = $env:CF_API_TOKEN,
    [string]$AuthEmail = $env:CF_AUTH_EMAIL,
    [switch]$DryRun = $false,
    [switch]$Enable = $false   # default is disable; pass -Enable to re-enable
)

if (-not $ApiToken) {
    Write-Host "ERROR: Set CF_API_TOKEN env var or pass -ApiToken" -ForegroundColor Red
    Write-Host "Generate at: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Yellow
    Write-Host "Required scope: Zone > Settings > Edit (and Bot Management > Edit if avail)" -ForegroundColor Yellow
    exit 1
}

$zones = @(
    @{ name = 'bizlegal-ai.com';  id = '1e1091fb5a02f1c7ea936f2495c97d5a' }
    # The 7 subdomains are separate zones. Look up their IDs at:
    #   GET https://api.cloudflare.com/client/v4/zones?name=brain.bizlegal-ai.com
    # Then add to this list:
    # @{ name = 'brai.bizlegal-ai.com';       id = 'ZONE_ID' }
    # @{ name = 'tracr.bizlegal-ai.com';      id = 'ZONE_ID' }
    # @{ name = 'lexaudit.bizlegal-ai.com';   id = 'ZONE_ID' }
    # @{ name = 'docai.bizlegal-ai.com';      id = 'ZONE_ID' }
    # @{ name = 'forge.bizlegal-ai.com';      id = 'ZONE_ID' }
    # @{ name = 'leadforge.bizlegal-ai.com';  id = 'ZONE_ID' }
    # @{ name = 'blog.bizlegal-ai.com';       id = 'ZONE_ID' }
)

$action = if ($Enable) { 'ENABLE' } else { 'DISABLE' }
$value  = if ($Enable) { 'on' }    else { 'off' }
Write-Host ""
Write-Host "==> $action Cloudflare AI Crawl Control on $($zones.Count) zone(s) (DryRun=$DryRun)" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    'Authorization' = "Bearer $ApiToken"
    'Content-Type'  = 'application/json'
}

$ok = 0; $fail = 0
foreach ($z in $zones) {
    $name = $z.name; $id = $z.id
    Write-Host "[$name] " -NoNewline

    if ($DryRun) {
        Write-Host "(DRYRUN — would PATCH /zones/$id/settings/ai_crawl_control = $value)" -ForegroundColor Yellow
        continue
    }

    # Disable managed robots
    try {
        $r1 = Invoke-RestMethod -Method PATCH `
            -Uri "https://api.cloudflare.com/client/v4/zones/$id/settings/managed_robots" `
            -Headers $headers `
            -Body (@{ value = $value } | ConvertTo-Json)
        $r1success = $r1.success
    } catch { $r1success = $false; $_.Exception.Message | Out-Null }

    # Disable AI Crawl Control
    try {
        $r2 = Invoke-RestMethod -Method PATCH `
            -Uri "https://api.cloudflare.com/client/v4/zones/$id/settings/ai_crawl_control" `
            -Headers $headers `
            -Body (@{ value = $value } | ConvertTo-Json)
        $r2success = $r2.success
    } catch { $r2success = $false; $_.Exception.Message | Out-Null }

    if ($r1success -and $r2success) {
        Write-Host "OK   (managed_robots=$value, ai_crawl_control=$value)" -ForegroundColor Green
        $ok++
    } else {
        Write-Host "FAIL (token may lack Zone:Settings:Edit scope)" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "==> Done. OK=$ok  FAIL=$fail" -ForegroundColor $(if ($fail -eq 0) { 'Green' } else { 'Yellow' })
Write-Host ""
Write-Host "VERIFY:" -ForegroundColor Cyan
Write-Host "  curl https://brai.bizlegal-ai.com/robots.txt | head -5"
Write-Host "  Should NOT contain 'BEGIN Cloudflare Managed content'"
Write-Host ""
