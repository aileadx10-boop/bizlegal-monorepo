param(
  [Parameter(Mandatory = $true)]
  [string]$ScanId,
  [string]$Email = 'codex-smoke+docai@bizlegal-ai.com',
  [string]$BaseUrl = 'https://web-eight-blue-44.vercel.app'
)

$url = "$($BaseUrl.TrimEnd('/'))/report?scan_id=$([uri]::EscapeDataString($ScanId))&email=$([uri]::EscapeDataString($Email))"
$html = (Invoke-WebRequest -Uri $url -TimeoutSec 60).Content

[pscustomobject]@{
  contains_crypto = $html.Contains('Pay $97 Crypto')
  contains_paypal = $html.Contains('Pay $97 Card / PayPal')
  contains_refund = $html.Contains('Refund promise')
} | ConvertTo-Json
