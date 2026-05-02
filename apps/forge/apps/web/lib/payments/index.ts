// lib/payments/index.ts
// Payment layer: NOWPayments (crypto) + Payoneer (fiat, static links)

// ── Prices (USD) ─────────────────────────────────────────────────────────────

export const PRICES = {
  scan: { crypto: 97, fiat: 119 },
  passport: { crypto: 297, fiat: 347 },
}

// ── Payoneer Links (static, from env) ────────────────────────────────────────

export function getPayoneerLink(product: 'scan' | 'passport'): string {
  if (product === 'passport') {
    return process.env.PAYONEER_PASSPORT_LINK ?? ''
  }
  return process.env.PAYONEER_SCAN_LINK ?? ''
}

// ── NOWPayments: Create Invoice ───────────────────────────────────────────────

export async function createNOWPaymentsInvoice(opts: {
  amountUsd: number
  orderId: string
  description: string
  successUrl: string
  cancelUrl: string
  ipnUrl: string
}): Promise<{ invoiceId: string; invoiceUrl: string }> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) throw new Error('NOWPAYMENTS_API_KEY not configured')

  const res = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: opts.amountUsd,
      price_currency: 'usd',
      pay_currency: 'usdtbsc',
      order_id: opts.orderId,
      order_description: opts.description,
      ipn_callback_url: opts.ipnUrl,
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`NOWPayments error: ${err}`)
  }

  const data = await res.json()
  return { invoiceId: data.id, invoiceUrl: data.invoice_url }
}
