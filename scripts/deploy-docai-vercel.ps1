<#
Deploy DocAI from the monorepo root to the DocAI-linked Vercel project.

This temporarily points the monorepo root .vercel/project.json at the DocAI
project so Vercel uploads the workspace packages needed by @bizlegal/docai.
The original root Vercel project link is restored before exit.
#>

param(
  [string]$RepoRoot = 'C:\Users\Moshe Dor\bizlegal-monorepo'
)

$ErrorActionPreference = 'Stop'
$env:NODE_OPTIONS = '--use-system-ca'

$rootProject = Join-Path $RepoRoot '.vercel\project.json'
$appProject = Join-Path $RepoRoot 'apps\docai\web\.vercel\project.json'
$backup = Join-Path $RepoRoot '.vercel\project.json.codex-backup'
$rootVercelConfig = Join-Path $RepoRoot 'vercel.json'
$docAiVercelConfig = Join-Path $RepoRoot 'vercel.docai.json'
$configBackup = Join-Path $RepoRoot 'vercel.json.codex-backup'

Copy-Item -LiteralPath $rootProject -Destination $backup -Force
$hadRootConfig = Test-Path -LiteralPath $rootVercelConfig
if ($hadRootConfig) {
  Copy-Item -LiteralPath $rootVercelConfig -Destination $configBackup -Force
}

try {
  Copy-Item -LiteralPath $appProject -Destination $rootProject -Force
  Copy-Item -LiteralPath $docAiVercelConfig -Destination $rootVercelConfig -Force
  Push-Location $RepoRoot
  vercel deploy --prod --yes --no-color
} finally {
  Pop-Location
  Copy-Item -LiteralPath $backup -Destination $rootProject -Force
  Remove-Item -LiteralPath $backup -Force -ErrorAction SilentlyContinue
  if ($hadRootConfig) {
    Copy-Item -LiteralPath $configBackup -Destination $rootVercelConfig -Force
    Remove-Item -LiteralPath $configBackup -Force -ErrorAction SilentlyContinue
  } else {
    Remove-Item -LiteralPath $rootVercelConfig -Force -ErrorAction SilentlyContinue
  }
}
