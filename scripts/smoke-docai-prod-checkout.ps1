param(
  [Parameter(Mandatory = $true)]
  [string]$ScanId,
  [string]$Email = 'codex-smoke+docai@bizlegal-ai.com',
  [string]$BaseUrl = 'https://web-eight-blue-44.vercel.app',
  [switch]$IncludePayPal
)

$ErrorActionPreference = 'Continue'

function Test-Checkout([string]$Path) {
  $body = @{
    scan_id = $ScanId
    email = $Email
  }

  function Format-Result($StatusCode, $Location, $ErrorMessage = '') {
    $locationText = if ($Location -is [array]) { $Location[0] } else { [string]$Location }
    [pscustomobject]@{
      path = $Path
      ok = ($StatusCode -in @(302, 303) -and -not [string]::IsNullOrWhiteSpace($locationText))
      status = if ($StatusCode) { [int]$StatusCode } else { 0 }
      redirect_host = if ($locationText) { ([uri]$locationText).Host } else { '' }
      error_code = if ($locationText -and $locationText -match '(invoice_error|paypal_error)=([^&]+)') { $matches[2] } else { '' }
      error = $ErrorMessage
    }
  }

  try {
    $response = Invoke-WebRequest `
      -Uri ($BaseUrl.TrimEnd('/') + $Path) `
      -Method Post `
      -Body $body `
      -MaximumRedirection 0 `
      -SkipHttpErrorCheck `
      -TimeoutSec 60

    Format-Result $response.StatusCode $response.Headers.Location
  } catch {
    $response = $_.Exception.Response
    if ($response) {
      Format-Result $response.StatusCode $response.Headers.Location $_.Exception.Message
    } else {
      Format-Result 0 '' $_.Exception.Message
    }
  }
}

@(
  Test-Checkout '/api/payment/checkout'
  if ($IncludePayPal) {
    Test-Checkout '/api/payment/paypal/checkout'
  }
) | ConvertTo-Json -Depth 4
