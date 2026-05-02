import Anthropic from '@anthropic-ai/sdk'
import type { RiskResult } from './risk-engine'
import type { Transaction } from './covalent'

// Lazy init — avoids build-time crash when ANTHROPIC_API_KEY is not present
function getClient() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) }
const MODEL = 'claude-sonnet-4-6'

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function simplifyTxs(txs: Transaction[]) {
  return txs.slice(0, 20).map(tx => ({
    hash:     tx.tx_hash?.slice(0, 16) + '…',
    from:     tx.from_address?.slice(0, 10) + '…',
    to:       tx.to_address?.slice(0, 10) + '…',
    valueETH: (parseFloat(tx.value ?? '0') / 1e18).toFixed(4),
    time:     tx.block_signed_at?.split('T')[0],
    ok:       tx.successful,
  }))
}

function parseJSON<T>(raw: string): T {
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as T
}

/* ─── Stage 1: Pattern extraction ───────────────────────────────────────── */
async function extractPatterns(txs: Transaction[], m: RiskResult['metrics']): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL, max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a blockchain data analyst. Extract behavioral patterns. Return JSON only, no markdown.

METRICS: ${JSON.stringify(m)}
SAMPLE TXS: ${JSON.stringify(simplifyTxs(txs))}

{"transactionBehavior":"...","frequencyPattern":"...","counterpartyPattern":"...","anomalies":["..."],"dataQuality":"..."}`,
    }],
  })
  return (res.content[0] as { type: string; text: string }).text
}

/* ─── Stage 2: Risk classification ──────────────────────────────────────── */
async function classifyRisk(patterns: string, risk: RiskResult): Promise<string> {
  const flagsSummary = risk.flags
    .map(f => `[${f.severity.toUpperCase()}] ${f.title}: ${f.description}`)
    .join('\n')

  const res = await getClient().messages.create({
    model: MODEL, max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a blockchain risk analyst. Classify risk. Return JSON only, no markdown.

PATTERNS: ${patterns}
FLAGS: ${flagsSummary}
SCORE: ${risk.score}/100 — ${risk.level}

{"primaryRisks":["..."],"mitigatingFactors":["..."],"riskJustification":"...","complianceConcerns":"..."}`,
    }],
  })
  return (res.content[0] as { type: string; text: string }).text
}

/* ─── Stage 3: Legal framing ─────────────────────────────────────────────── */
async function frameLegally(riskAnalysis: string, score: number): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL, max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a legal analyst specializing in financial compliance. Translate to court-ready language. Return JSON only, no markdown. NEVER assert criminality — use "consistent with", "may indicate", "warrants investigation".

ANALYSIS: ${riskAnalysis}
SCORE: ${score}/100

{"legalSummary":"...","regulatoryContext":"...","recommendedActions":["..."],"limitations":"...","expertOpinion":"..."}`,
    }],
  })
  return (res.content[0] as { type: string; text: string }).text
}

/* ─── Stage 4: Full synthesis ────────────────────────────────────────────── */
export interface ReportContent {
  executiveSummary: string
  keyFindings: { title: string; detail: string; implication: string }[]
  behavioralAnalysis: string
  riskInterpretation: string
  legalComplianceContext: string
  limitations: string
  conclusion: string
}

async function synthesizeReport(
  wallet: string, patterns: string, riskAnalysis: string,
  legalFraming: string, risk: RiskResult,
): Promise<ReportContent> {
  const res = await getClient().messages.create({
    model: MODEL, max_tokens: 1400,
    messages: [{
      role: 'user',
      content: `You are a senior blockchain forensic analyst. Write a professional legal report. Return JSON only, no markdown. Formal, neutral tone. 400–700 words total. Never claim criminality.

WALLET: ${wallet}
SCORE: ${risk.score}/100 — ${risk.level}
PATTERNS: ${patterns}
RISK: ${riskAnalysis}
LEGAL: ${legalFraming}

{"executiveSummary":"...","keyFindings":[{"title":"...","detail":"...","implication":"..."}],"behavioralAnalysis":"...","riskInterpretation":"...","legalComplianceContext":"...","limitations":"...","conclusion":"..."}`,
    }],
  })
  return parseJSON<ReportContent>((res.content[0] as { type: string; text: string }).text)
}

/* ─── MASTER: 4-stage pipeline ───────────────────────────────────────────── */
export async function generateFullReport(
  wallet: string, txs: Transaction[], risk: RiskResult,
): Promise<ReportContent> {
  const patterns      = await extractPatterns(txs, risk.metrics)
  const riskAnalysis  = await classifyRisk(patterns, risk)
  const legalFraming  = await frameLegally(riskAnalysis, risk.score)
  return synthesizeReport(wallet, patterns, riskAnalysis, legalFraming, risk)
}

/* ─── FREE PREVIEW: 2-sentence teaser ───────────────────────────────────── */
export async function generatePreview(wallet: string, risk: RiskResult): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL, max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write 2-3 sentences for a blockchain risk snapshot. Professional. Mention risk level and top flag. Create urgency for full report. Do NOT fabricate entities.

Wallet: ${wallet}
Score: ${risk.score}/100 — ${risk.level}
Top flag: ${risk.flags[0]?.title ?? 'General risk indicators'}`,
    }],
  })
  return (res.content[0] as { type: string; text: string }).text
}
