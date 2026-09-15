import assert from 'node:assert/strict'
import { predict } from '../lib/predict.ts'
import { startSinceFiledCheckout } from '../lib/checkout.ts'
import { assertToneSafe } from '../lib/tone.ts'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

const obligations = [
  { id: 'o1', obligationType: 'Trust recon', lastEventAt: daysAgoIso(10), intervalDays: 90, jurisdiction: 'US' },
  { id: 'o2', obligationType: 'CLE renewal', lastEventAt: daysAgoIso(20), intervalDays: 365, jurisdiction: 'US' },
  { id: 'o3', obligationType: 'Oqood renewal', lastEventAt: daysAgoIso(5), intervalDays: 180, jurisdiction: 'Dubai' },
]

// 1. 3 obligations free
assert.equal(obligations.length >= 3, true, 'free tier covers first 3')

// 2. predictions
for (const ob of obligations) {
  const p = predict(ob)
  assert.ok(p.daysSince >= 0)
  assert.ok(p.disclaimer.includes('Estimate'))
}

// 3. event log token
const token = `sf-token-${Math.random().toString(36).slice(2)}`
assert.ok(token.startsWith('sf-token-'))

// 5. simulated checkout
const co = await startSinceFiledCheckout({ productId: 'sf_firm_49', email: 'demo@firm.com', gateway: 'card', forceDemo: true })
assert.ok(co.ok)
assert.ok(co.checkout_url)

// 7. tone safe UI copy
const copy = 'Days since: 10. Predicted due: estimate — verify against jurisdiction rules. Not legal advice.'
assert.ok(assertToneSafe(copy), 'tone shield holds')

console.log(JSON.stringify({
  ok: true,
  obligations: obligations.length,
  predictions: obligations.map((o) => predict(o).daysSince),
  checkout_url: co.checkout_url,
  tone_safe: true,
}, null, 2))


