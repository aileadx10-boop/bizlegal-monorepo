/**
 * reserve-report.ts — W2-5 Stablecoin Reserve Report Generator.
 *
 * Deterministic, template-based reserve report engine. Takes issuer-supplied
 * reserve composition and assesses it against the US GENIUS Act (payment
 * stablecoin permitted-asset rules) and EU MiCA (EMT/ART reserve rules).
 *
 * Liability shrinker: the output is explicitly a TEMPLATE generated from
 * issuer-supplied data — NOT an audit. Every report carries a named-human-
 * reviewer requirement before external use, per-category coverage numbers,
 * and citations to the governing reserve provisions. No outcome guarantees.
 */

export type ReserveCategory =
  | 'cash'                 // USD/EUR cash + bank deposits
  | 't_bills'              // US Treasury bills (<1yr)
  | 'money_market'         // qualifying money-market funds
  | 'eligible_securities'  // other high-quality liquid instruments (repo, agency)
  | 'commodity'            // commodity-referenced assets (e.g. gold)
  | 'other'                // crypto, equity, non-eligible

export interface ReserveAsset {
  name: string
  amount: number           // USD notional
  category: ReserveCategory
  custodian?: string
  attestationDays?: number // 0 = none / unknown
  rehypothecated?: boolean
}

export interface ReserveInput {
  issuerName: string
  issuerJurisdiction: 'US' | 'EU' | 'Other'
  tokenType: 'single_currency' | 'multi_asset' | 'algorithmic'
  peggedCurrency?: string  // USD / EUR / other
  assets: ReserveAsset[]
}

export interface ReserveIssue {
  code: string
  severity: 'critical' | 'warning' | 'info'
  text: string
  citation: string
}

export interface ReserveReport {
  ok: boolean
  regime: string
  totalUsd: number
  eligibleUsd: number
  coveragePct: number      // 0-100, capped at 999
  byCategory: Record<ReserveCategory, number>
  issues: ReserveIssue[]
  citations: string[]
  liability: string
  generatedAt: string
}

const GENIUS_LIQUID = 'GENIUS Act — payment stablecoin reserve & redemption (1:1 eligible reserves, monthly attestation, no rehypothecation)'
const MICA_EMT_RESERVES = 'MiCA Art. 43 (EMT: 1:1 reserves, custody with credit institution, no rehypothecation)'
const MICA_ART_RESERVES = 'MiCA Art. 36(4) (ART: reserve of assets, custody, investment rules)'
const MICA_DEF_EMT = 'MiCA Art. 3(1)(5)'
const MICA_DEF_ART = 'MiCA Art. 3(1)(6)'

const CATEGORY_ELIGIBLE: ReadonlySet<ReserveCategory> = new Set<ReserveCategory>([
  'cash',
  't_bills',
  'money_market',
  'eligible_securities',
])

export function validateReserveInput(raw: unknown): { ok: true; input: ReserveInput } | { ok: false; errors: string[] } {
  const errors: string[] = []
  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['Request body must be a JSON object.'] }
  }
  const o = raw as Record<string, unknown>
  if (typeof o.issuerName !== 'string' || !o.issuerName.trim()) errors.push('issuerName is required.')
  if (typeof o.issuerJurisdiction !== 'string' || !['US', 'EU', 'Other'].includes(o.issuerJurisdiction)) {
    errors.push("issuerJurisdiction must be 'US', 'EU', or 'Other'.")
  }
  if (typeof o.tokenType !== 'string' || !['single_currency', 'multi_asset', 'algorithmic'].includes(o.tokenType)) {
    errors.push("tokenType must be 'single_currency', 'multi_asset', or 'algorithmic'.")
  }
  if (!Array.isArray(o.assets) || o.assets.length === 0) {
    errors.push('assets must be a non-empty array.')
  } else {
    o.assets.forEach((a, i) => {
      const asset = a as Record<string, unknown>
      if (typeof asset.name !== 'string' || !asset.name.trim()) errors.push(`assets[${i}].name is required.`)
      if (typeof asset.amount !== 'number' || !isFinite(asset.amount) || asset.amount <= 0) {
        errors.push(`assets[${i}].amount must be a positive number (USD).`)
      }
      if (
        typeof asset.category !== 'string' ||
        (!CATEGORY_ELIGIBLE.has(asset.category as ReserveCategory) &&
          asset.category !== 'commodity' &&
          asset.category !== 'other')
      ) {
        errors.push(`assets[${i}].category must be one of: cash, t_bills, money_market, eligible_securities, commodity, other.`)
      }
    })
  }
  if (errors.length) return { ok: false, errors }
  return {
    ok: true,
    input: {
      issuerName: String(o.issuerName).trim(),
      issuerJurisdiction: o.issuerJurisdiction as ReserveInput['issuerJurisdiction'],
      tokenType: o.tokenType as ReserveInput['tokenType'],
      peggedCurrency: typeof o.peggedCurrency === 'string' && o.peggedCurrency ? o.peggedCurrency : undefined,
      assets: (o.assets as unknown[]).map((a) => {
        const asset = a as Record<string, unknown>
        return {
          name: String(asset.name).trim(),
          amount: Number(asset.amount),
          category: asset.category as ReserveCategory,
          custodian: typeof asset.custodian === 'string' && asset.custodian ? asset.custodian : undefined,
          attestationDays: typeof asset.attestationDays === 'number' ? asset.attestationDays : undefined,
          rehypothecated: asset.rehypothecated === true,
        }
      }),
    },
  }
}

export function analyzeReserve(input: ReserveInput, now: Date = new Date()): ReserveReport {
  const totalUsd = input.assets.reduce((sum, a) => sum + a.amount, 0)
  const byCategory = input.assets.reduce<Record<ReserveCategory, number>>(
    (acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + a.amount
      return acc
    },
    { cash: 0, t_bills: 0, money_market: 0, eligible_securities: 0, commodity: 0, other: 0 },
  )
  const eligibleUsd = input.assets
    .filter((a) => CATEGORY_ELIGIBLE.has(a.category))
    .reduce((s, a) => s + a.amount, 0)
  const coveragePct = totalUsd > 0 ? Math.round((eligibleUsd / totalUsd) * 10000) / 100 : 0

  const issues: ReserveIssue[] = []
  const citations: string[] = []

  // Algorithmic tokens are not stablecoins under either regime.
  if (input.tokenType === 'algorithmic') {
    issues.push({
      code: 'algorithmic_unbacked',
      severity: 'critical',
      text: 'Algorithmic / unbacked token with no reserve assets. Fails the payment-stablecoin definition under the GENIUS Act and the EMT/ART definitions under MiCA (an EMT or ART must maintain a stable value via reserves).',
      citation: `${MICA_DEF_EMT} · ${MICA_DEF_ART} · GENIUS Act (payment stablecoin definition)`,
    })
    citations.push(MICA_DEF_EMT, MICA_DEF_ART)
  }

  // Coverage test — 1:1 eligible backing.
  if (totalUsd > 0 && coveragePct < 100) {
    issues.push({
      code: 'undercollateralized',
      severity: 'critical',
      text: `Only ${coveragePct.toFixed(2)}% of total reserves are in eligible liquid assets (cash / qualifying T-bills / money-market / eligible securities). Permitted stablecoin regimes require 1:1 eligible reserve backing.`,
      citation: GENIUS_LIQUID,
    })
    citations.push(GENIUS_LIQUID)
  } else if (totalUsd > 0) {
    issues.push({
      code: 'coverage_ok',
      severity: 'info',
      text: `${coveragePct.toFixed(2)}% of reserves are in eligible liquid assets — meets the 1:1 eligible-reserve benchmark on the data supplied.`,
      citation: GENIUS_LIQUID,
    })
    citations.push(GENIUS_LIQUID)
  }

  // Non-eligible asset exposure.
  const nonEligible = input.assets.filter((a) => !CATEGORY_ELIGIBLE.has(a.category))
  if (nonEligible.length > 0) {
    const pct = Math.round((nonEligible.reduce((s, a) => s + a.amount, 0) / (totalUsd || 1)) * 100)
    issues.push({
      code: 'non_eligible_assets',
      severity: 'warning',
      text: `${nonEligible.length} asset line(s) (${pct}% of total) fall outside eligible reserve categories (${nonEligible.map((a) => a.name).join(', ')}). Commodity- or crypto-referenced holdings do not count toward GENIUS Act / MiCA 1:1 eligible reserves.`,
      citation: `${GENIUS_LIQUID} · ${MICA_ART_RESERVES}`,
    })
    citations.push(GENIUS_LIQUID, MICA_ART_RESERVES)
  }

  // Rehypothecation.
  const rehypo = input.assets.filter((a) => a.rehypothecated)
  if (rehypo.length > 0) {
    issues.push({
      code: 'rehypothecation',
      severity: 'critical',
      text: `Rehypothecation flagged on ${rehypo.map((a) => a.name).join(', ')}. GENIUS Act payment stablecoins may not rehypothecate reserve assets; MiCA EMT reserve assets must be held in custody without reuse.`,
      citation: `${GENIUS_LIQUID} · ${MICA_EMT_RESERVES}`,
    })
    citations.push(GENIUS_LIQUID, MICA_EMT_RESERVES)
  }

  // Attestation cadence.
  const unAttested = input.assets.filter((a) => a.attestationDays == null)
  const staleAttest = input.assets.filter((a) => a.attestationDays != null && a.attestationDays > 30)
  if (unAttested.length > 0) {
    issues.push({
      code: 'missing_attestation',
      severity: 'warning',
      text: `${unAttested.length} asset line(s) have no attestation date on file. Monthly reserve attestation is a GENIUS Act requirement; MiCA requires ongoing reserve verification.`,
      citation: GENIUS_LIQUID,
    })
    citations.push(GENIUS_LIQUID)
  }
  if (staleAttest.length > 0) {
    issues.push({
      code: 'stale_attestation',
      severity: 'warning',
      text: `Attestation is more than 30 days old for ${staleAttest.map((a) => a.name).join(', ')}. Refresh monthly to stay within the GENIUS Act attestation cadence.`,
      citation: GENIUS_LIQUID,
    })
    citations.push(GENIUS_LIQUID)
  }

  // Custody note (MiCA).
  const uncustodied = input.assets.filter((a) => !a.custodian)
  if (uncustodied.length > 0 && input.tokenType !== 'algorithmic') {
    issues.push({
      code: 'custody_gap',
      severity: 'info',
      text: `${uncustodied.length} asset line(s) have no custodian recorded. MiCA EMT/ART reserve assets must be held with a credit institution or authorised custodian.`,
      citation: `${MICA_EMT_RESERVES} · ${MICA_ART_RESERVES}`,
    })
    citations.push(MICA_EMT_RESERVES, MICA_ART_RESERVES)
  }

  // Regime label.
  const isUS = input.issuerJurisdiction === 'US'
  const isEU = input.issuerJurisdiction === 'EU'
  let regime = 'GENIUS Act (US)'
  if (isEU) regime = 'MiCA (EU)'
  else if (input.issuerJurisdiction === 'Other') regime = 'GENIUS Act (US) + MiCA (EU) review'

  if (input.tokenType === 'single_currency') {
    citations.push(isEU ? MICA_DEF_EMT : MICA_DEF_EMT)
  } else if (input.tokenType === 'multi_asset') {
    citations.push(MICA_DEF_ART)
  }

  const liability =
    'Template generated from issuer-supplied data — NOT an audit. This report does not certify, verify, or opine on the accuracy of the reserve data. Before external use, a named qualified professional must review the underlying data and the conclusions. This is not legal advice.'

  return {
    ok: true,
    regime,
    totalUsd: Math.round(totalUsd * 100) / 100,
    eligibleUsd: Math.round(eligibleUsd * 100) / 100,
    coveragePct,
    byCategory,
    issues,
    citations: Array.from(new Set(citations)),
    liability,
    generatedAt: now.toISOString(),
  }
}

/**
 * Mirrors packages/payment makeOrderId's email key so the webhook can map a
 * NOWPayments order_id back to the reserve_reports row created before checkout
 * (the universal /api/pay/start path does not return its internal order id).
 *
 * Order id shape: bz_<productId>_<safeEmail>_<minute>_<nonce>. ProductId and
 * safeEmail both contain underscores, so the product prefix is stripped first;
 * the remainder is <safeEmail>_<minute>_<nonce> where minute is digits and
 * nonce is exactly 16 hex chars (randomHex(16) in packages/payment).
 */
export function parseOrderEmailKey(orderId: string, productId = 'stablecoin_reserve_monthly'): string | null {
  const prefix = `bz_${productId}_`
  if (!orderId.startsWith(prefix)) return null
  const rest = orderId.slice(prefix.length)
  const m = rest.match(/^([a-z0-9_]{1,40})_\d+_[a-f0-9]{16}$/)
  return m ? m[1] : null
}

export function orderEmailKey(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)
}

export function renderReportHtml(report: ReserveReport, meta: { issuerName: string; orderId: string; reportUrl: string }): string {
  const severityColor: Record<ReserveIssue['severity'], string> = {
    critical: '#c0392b',
    warning: '#e67e22',
    info: '#7f8c8d',
  }
  const issuesHtml =
    report.issues.length === 0
      ? '<tr><td style="padding:12px 16px;color:#27ae60">No findings.</td></tr>'
      : report.issues
          .map(
            (i) => `<tr style="border-top:1px solid #eee">
  <td style="padding:12px 16px;vertical-align:top;color:${severityColor[i.severity]};font-weight:700;text-transform:uppercase;font-size:11px">${i.severity}</td>
  <td style="padding:12px 16px;vertical-align:top;line-height:1.6">${i.text}<br><span style="color:#888;font-size:11px">${i.citation}</span></td>
</tr>`,
          )
          .join('')
  const catRows = (Object.keys(report.byCategory) as ReserveCategory[])
    .filter((k) => report.byCategory[k] > 0)
    .map(
      (k) =>
        `<tr style="border-top:1px solid #eee"><td style="padding:8px 16px;color:#555">${k.replace('_', ' ')}</td><td style="padding:8px 16px;text-align:right">$${report.byCategory[k].toLocaleString()}</td></tr>`,
    )
    .join('')

  return `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#fff;color:#222">
  <div style="background:#050608;color:#d4a843;padding:28px 32px;font-family:monospace;letter-spacing:0.1em;font-weight:700">RESERVE REPORT — GENIUS ACT / MiCA</div>
  <div style="padding:32px">
    <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em">${meta.issuerName} · ${report.regime}</p>
    <h1 style="font-size:24px;margin:8px 0 24px">Reserve composition assessment</h1>
    <div style="display:flex;gap:16px;margin-bottom:24px">
      <div style="flex:1;background:#f7f7f5;border-radius:8px;padding:16px"><div style="font-size:11px;color:#888;text-transform:uppercase">Total reserves</div><div style="font-size:22px;font-weight:700">$${report.totalUsd.toLocaleString()}</div></div>
      <div style="flex:1;background:#f7f7f5;border-radius:8px;padding:16px"><div style="font-size:11px;color:#888;text-transform:uppercase">Eligible assets</div><div style="font-size:22px;font-weight:700">$${report.eligibleUsd.toLocaleString()}</div></div>
      <div style="flex:1;background:${report.coveragePct >= 100 ? '#e8f5e9' : '#fdecea'};border-radius:8px;padding:16px"><div style="font-size:11px;color:#888;text-transform:uppercase">Eligible coverage</div><div style="font-size:22px;font-weight:700;color:${report.coveragePct >= 100 ? '#27ae60' : '#c0392b'}">${report.coveragePct}%</div></div>
    </div>
    <h2 style="font-size:16px;margin:0 0 8px">Composition by category</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">${catRows}</table>
    <h2 style="font-size:16px;margin:0 0 8px">Findings</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">${issuesHtml}</table>
    <h2 style="font-size:16px;margin:24px 0 8px">Governing provisions</h2>
    <ul style="font-size:12px;color:#555;line-height:1.8">${report.citations.map((c) => `<li>${c}</li>`).join('')}</ul>
    <a href="${meta.reportUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#050608;color:#d4a843;font-weight:700;text-decoration:none;font-size:13px">VIEW FULL REPORT</a>
    <p style="margin-top:24px;font-size:11px;color:#999;line-height:1.6">${report.liability}</p>
    <p style="font-size:11px;color:#bbb">Reference ${meta.orderId} · generated ${report.generatedAt.slice(0, 10)}</p>
  </div>
</div>`
}
