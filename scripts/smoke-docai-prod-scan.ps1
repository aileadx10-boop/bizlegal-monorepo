param(
  [string]$BaseUrl = 'https://web-eight-blue-44.vercel.app'
)

$ErrorActionPreference = 'Continue'

$body = @{
  email = 'codex-smoke+docai@bizlegal-ai.com'
  filename = 'docai-smoke-nda.txt'
  contract_type = 'NDA'
  document_text = 'Mutual NDA draft. Party A may disclose confidential information. Recipient must keep information confidential for two years. No governing law is specified. No liability cap is specified. No return or destruction process is specified.'
} | ConvertTo-Json

try {
  $response = Invoke-RestMethod `
    -Uri ($BaseUrl.TrimEnd('/') + '/api/documents/scan') `
    -Method Post `
    -ContentType 'application/json' `
    -Body $body `
    -TimeoutSec 120

  [pscustomobject]@{
    ok = $true
    scan_id = $response.scan_id
    risk_level = $response.risk_level
    risk_score = $response.risk_score
    preview_count = ($response.preview_issues | Measure-Object).Count
    total_issues = $response.total_issues
  } | ConvertTo-Json -Depth 4
} catch {
  [pscustomobject]@{
    ok = $false
    error = $_.Exception.Message
  } | ConvertTo-Json -Depth 4
}
