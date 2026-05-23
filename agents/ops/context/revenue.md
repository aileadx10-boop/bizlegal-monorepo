# Revenue Reference

## Product tiers (17 across 7 apps)

| App | Products | Price range |
|-----|----------|-------------|
| Hub | Pro $149/mo, Scale $499/mo | $149-499/mo |
| Forge | BOI Kit $149, Passport $1,500, Scan $97 | $97-1,500 |
| BRAI | Standard $149, Priority $249, Extended $500, Retainer $599-1,999 | $149-1,999 |
| TRACR | Regulatory $29, Bronze $149, Silver $299 | $29-299 |
| LexAudit | Solo $49, Boutique $199, Mid-Market $599 | $49-599/mo |
| DocAI | Starter $29, Team $69, Firm $99 | $29-99/mo |
| LeadForge | Lead intelligence (pricing TBD) | TBD |

## Checkout URL template
`/checkout?product={product}&tier={tier}&interval={interval}&amount={cents}&name={name}`

## Sell-right-now products (wire + crypto)
| Product | Price | Checkout |
|---------|-------|----------|
| Forge BOI Kit | $149 | `/checkout?product=forge&tier=boi-kit&interval=one-time&amount=14900` |
| Hub Pro | $149/mo | `/checkout?product=hub&tier=pro&interval=monthly&amount=14900` |
| LexAudit Monitor | $99/mo | `/checkout?product=lexaudit&tier=monitor&interval=monthly&amount=9900` |
| BRAI Extended | $500 | `/checkout?product=brai&tier=extended&interval=one-time&amount=50000` |
