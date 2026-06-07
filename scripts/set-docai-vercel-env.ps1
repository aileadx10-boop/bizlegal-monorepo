param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [Parameter(Mandatory = $true)]
  [string]$Value,
  [ValidateSet('production', 'preview', 'development')]
  [string]$Environment = 'production',
  [string]$DocAiDir = 'C:\Users\Moshe Dor\bizlegal-monorepo\apps\docai\web'
)

$ErrorActionPreference = 'Stop'
$env:NODE_OPTIONS = '--use-system-ca'

if ($env:NODE_TLS_REJECT_UNAUTHORIZED -eq '0') {
  throw 'Refusing to update Vercel env while NODE_TLS_REJECT_UNAUTHORIZED=0.'
}

$tmp = New-TemporaryFile
try {
  [IO.File]::WriteAllText($tmp, $Value)
  Push-Location $DocAiDir
  $existing = (& vercel env list $Environment --no-color 2>$null | Select-String -SimpleMatch $Name)
  if ($existing) {
    cmd /c "vercel env update $Name $Environment --yes < ""$tmp"""
  } else {
    cmd /c "vercel env add $Name $Environment --yes < ""$tmp"""
  }
} finally {
  Pop-Location
  Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
}
