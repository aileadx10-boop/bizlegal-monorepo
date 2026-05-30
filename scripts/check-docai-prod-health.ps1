param(
  [string[]]$BaseUrls = @(
    'https://web-po9x9bqos-aileadx10-5415s-projects.vercel.app',
    'https://web-eight-blue-44.vercel.app'
  ),
  [string]$EnvFile = 'C:\Users\Moshe Dor\bizlegal-monorepo\apps\docai\web\.env.local'
)

$ErrorActionPreference = 'Continue'

$vars = @{}
Get-Content -LiteralPath $EnvFile | ForEach-Object {
  if ($_ -match '^([^#=\s]+)=(.*)$') {
    $vars[$matches[1]] = $matches[2].Trim('"')
  }
}

$token = $vars['OPS_DASHBOARD_TOKEN']
if ([string]::IsNullOrWhiteSpace($token)) {
  throw 'OPS_DASHBOARD_TOKEN missing from local DocAI env file.'
}

if ($vars['NEXT_PUBLIC_SITE_URL']) {
  $BaseUrls += $vars['NEXT_PUBLIC_SITE_URL'].TrimEnd('/')
}

$results = $BaseUrls |
  Select-Object -Unique |
  ForEach-Object {
    $baseUrl = $_.TrimEnd('/')
    try {
      $url = "$baseUrl/api/ops/health?t=$([uri]::EscapeDataString($token))"
      $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30
      [pscustomobject]@{
        url = $baseUrl
        ok = $true
        healthy = $response.summary.healthy
        critical_missing = ($response.summary.critical_missing -join ',')
        envs_total = $response.summary.envs_total
      }
    } catch {
      [pscustomobject]@{
        url = $baseUrl
        ok = $false
        error = $_.Exception.Message
      }
    }
  }

$results | ConvertTo-Json -Depth 4
