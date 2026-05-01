import Anthropic from '@anthropic-ai/sdk'
import { RiskResult } from './tracr-risk-engine'
import { Transaction } from './tracr-etherscan'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function shortenTxs(txs: Transaction[]) {
  return txs.slice(0, 15).map(tx => ({
    hash: tx.hash?.slice(0, 14) + '…',
    from: tx.from?.slice(0, 10) + '…',
    to: (tx.to || 'contract')?.slice(0, 10) + '…',
    valueETH: (parseFloat(tx.value || '0') / 1e18).toFixed(4),
    time: new Date(parseInt(tx.timeStamp) * 1000).toISOString().split('T')[0],
    failed: tx.isError === '1',
  }))
}

export interface ReportContent {
  executiveSummary: string
  keyFindings: { title: string; detail: string; implication: string }[]
  behavioralAnalysis: string
  riskInterpretation: string
  legalComplianceContext: string
  limitations: string
  conclusion: string
  // Enriched fields for investigators and legal professionals
  risk_narrative?: string
  chain_analysis?: {
    total_tx: number
    flagged_tx: number
    high_risk_counterparties: string[]
    mixing_detected: boolean
  }
  legal_exposure_summary?: string
  recommended_actions?: string[]
  evidence_quality?: 'high' | 'medium' | 'low'
  report_confidence?: number
}

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  return (res.content[0] as Anthropic.TextBlock).text
}

async function extractPatterns(txs: Transaction[], metrics: RiskResult['metrics']): Promise<string> {
  return callClaude(`You are a blockchain data analyst. Extract behavioral patterns from this wallet data.

METRICS:
- Total transactions: ${metrics.totalTransactions}
- Unique counterparties: ${metrics.uniqueCounterparties}
- Peak activity: ${metrics.maxTxPerDay} tx/day
- First seen: ${metrics.firstSeen}
- Last seen: ${metrics.lastSeen}
- Avg tx value: ${metrics.avgTxValue} ETH
- Failed transactions: ${metrics.failedTxCount}
- Token transfers: ${metrics.tokenTransferCount}

TRANSACTION SAMPLE:
${JSON.stringify(shortenTxs(txs), null, 2)}

OUTPUT (JSON only, no markdown):
{
  "transactionBehavior": "description of flow patterns",
  "frequencyPattern": "description of timing",
  "counterpartyPattern": "description of relationships",
  "anomalies": ["anomaly 1", "anomaly 2"],
  "dataQuality": "notes on data completeness"
}`, 600)
}

async function classifyRisk(patterns: string, risk: RiskResult): Promise<string> {
  return callClaude(`You are a blockchain risk analyst. Classify risk based on behavioral analysis.

PATTERN ANALYSIS: ${patterns}

COMPUTED RISK FLAGS:
${risk.flags.map(f => `[${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join('\n')}

RISK SCORE: ${risk.score}/100 — ${risk.level}

OUTPUT (JSON only, no markdown):
{
  "primaryRisks": ["top risk 1", "top risk 2", "top risk 3"],
  "mitigatingFactors": ["factor 1 if any"],
  "riskJustification": "2-3 sentence explanation of score",
  "complianceConcerns": "AML/KYC implications in plain language"
}`, 500)
}

async function frameLegally(riskAnalysis: string, score: number): Promise<string> {
  return callClaude(`You are a legal analyst specializing in financial compliance and forensic evidence.

RISK ANALYSIS: ${riskAnalysis}
RISK SCORE: ${score}/100

Translate this technical analysis into language suitable for lawyers, judges, and compliance officers.

OUTPUT (JSON only, no markdown):
{
  "legalSummary": "2-3 sentences suitable for court documentation",
  "regulatoryContext": "AML/FATF/sanctions relevance",
  "recommendedActions": ["action 1", "action 2"],
  "limitations": "data limitations and uncertainty boundaries",
  "expertOpinion": "cautious, defensible professional opinion"
}

IMPORTANT: Never assert criminality. Use cautious, evidence-based language only.`, 600)
}

async function synthesize(
  wallet: string,
  patterns: string,
  riskAnalysis: string,
  legalFraming: string,
  risk: RiskResult
): Promise<ReportContent> {
  const text = await callClaude(`You are a senior blockchain forensic analyst writing a professional report for legal professionals.

WALLET: ${wallet}
RISK SCORE: ${risk.score}/100 — ${risk.level}

BEHAVIORAL PATTERNS: ${patterns}
RISK ANALYSIS: ${riskAnalysis}
LEGAL FRAMING: ${legalFraming}

OUTPUT (JSON only, no markdown):
{
  "executiveSummary": "3-4 sentences — clear, non-technical overview for a lawyer",
  "keyFindings": [
    { "title": "Finding", "detail": "explanation", "implication": "legal/compliance significance" }
  ],
  "behavioralAnalysis": "2-3 paragraphs on transaction patterns",
  "riskInterpretation": "What this score means practically for legal use",
  "legalComplianceContext": "Regulatory and legal implications, cautious language",
  "limitations": "Clear statement of data boundaries and methodology limits",
  "conclusion": "2-3 sentences — cautious, defensible, evidence-based final statement"
}

REQUIREMENTS: Formal, neutral, professional tone. Never claim criminality. 400-700 words total.`, 1400)

  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function enrichReport(
  wallet: string,
  txs: Transaction[],
  risk: RiskResult,
  legalFraming: string
): Promise<Partial<ReportContent>> {
  const flaggedTxCount = txs.filter(tx =>
    tx.isError === '1' ||
    (parseFloat(tx.value || '0') / 1e18) === 0
  ).length

  const text = await callClaude(`You are a senior blockchain forensic analyst preparing structured intelligence for legal professionals.

WALLET: ${wallet}
RISK SCORE: ${risk.score}/100 — ${risk.level}
TOTAL TRANSACTIONS: ${risk.metrics.totalTransactions}
FLAGGED TRANSACTIONS (failed/zero-value): ${flaggedTxCount}
UNIQUE COUNTERPARTIES: ${risk.metrics.uniqueCounterparties}
RISK FLAGS: ${risk.flags.map(f => `[${f.severity}] ${f.title}`).join(', ')}
LEGAL FRAMING: ${legalFraming}

OUTPUT (JSON only, no markdown):
{
  "risk_narrative": "3-paragraph narrative of wallet risk assessment — paragraph 1: overview of on-chain behavior, paragraph 2: specific risk indicators and patterns, paragraph 3: implications for investigators and compliance teams",
  "chain_analysis": {
    "total_tx": ${risk.metrics.totalTransactions},
    "flagged_tx": number_of_transactions_with_risk_indicators,
    "high_risk_counterparties": ["list of up to 5 counterparty patterns noted, e.g. 'mixing service interaction', 'sanctioned address type'"],
    "mixing_detected": true_or_false_based_on_patterns
  },
  "legal_exposure_summary": "2-paragraph legal exposure analysis for investigators — paragraph 1: AML/KYC regulatory exposure, paragraph 2: evidentiary value and recommended legal next steps. Cautious, evidence-based language only.",
  "recommended_actions": ["up to 5 specific investigative or compliance actions"],
  "evidence_quality": "high if >50 transactions with clear patterns, medium if 10-50 or mixed signals, low if <10 or inconclusive",
  "report_confidence": number_0_to_100_reflecting_confidence_based_on_data_volume_and_pattern_clarity
}`, 900)

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {}
  }
}

export async function generateFullReport(
  wallet: string,
  txs: Transaction[],
  risk: RiskResult
): Promise<ReportContent> {
  const patterns = await extractPatterns(txs, risk.metrics)
  const riskAnalysis = await classifyRisk(patterns, risk)
  const legalFraming = await frameLegally(riskAnalysis, risk.score)
  const [base, enriched] = await Promise.all([
    synthesize(wallet, patterns, riskAnalysis, legalFraming, risk),
    enrichReport(wallet, txs, risk, legalFraming),
  ])
  return { ...base, ...enriched }
}

export async function generatePreview(wallet: string, risk: RiskResult): Promise<string> {
  return callClaude(`You are a blockchain risk analyst. Write a compelling 2-3 sentence preview summary.

Wallet: ${wallet}
Risk Score: ${risk.score}/100 — ${risk.level}
Top Flag: ${risk.flags[0]?.title || 'General risk indicators detected'}

Output 2-3 sentences that:
1. State the risk level clearly
2. Mention the most concerning finding
3. Create urgency to see the full report

Use professional language. Do not fabricate specific entities.`, 200)
}
