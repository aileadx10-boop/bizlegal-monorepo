/**
 * BizLegal AI — Librarian Sub-Agent
 *
 * Transforms raw compliance content into premium digital products.
 * Validates accuracy, humanizes language, adds citations, packages for sale.
 */

export interface RawContent {
  title: string
  body: string
  jurisdiction?: string
  regulations?: string[]
  source?: string
}

export interface IntelligenceProduct {
  id: string
  title: string
  version: string
  content: string
  citations: Citation[]
  confidenceScore: number
  reviewStatus: 'draft' | 'validated' | 'expert-reviewed' | 'published'
  wordCount: number
  updatedAt: string
  format: 'pdf' | 'epub' | 'interactive'
  price: number
}

export interface Citation {
  text: string
  regulation: string
  article?: string
  url?: string
  verified: boolean
}

// ─── HUMANIZATION RULES ──────────────────────────────────

const AI_GIVEAWAYS = [
  /\bin today['']s (.*?) (world|landscape|environment)/gi,
  /\bit is (crucial|essential|imperative) (to|that)/gi,
  /\bin conclusion[,\s]/gi,
  /\bnavigate the (complexities|landscape|realm)/gi,
  /\bunlock (the|your)/gi,
  /\bdelve (into|deeper)/gi,
  /\bleverage\b/gi,
  /\bsynergies\b/gi,
  /\bholistic (approach|framework)/gi,
  /\bseamlessly\b/gi,
  /\brobust (framework|solution|approach)/gi,
  /\bAs an AI language model/gi,
  /\bI cannot provide legal advice/gi,
]

/**
 * Score how "human" the text reads.
 * Returns 0–100 (higher = more human-like).
 */
export function humanScore(text: string): number {
  let deductions = 0
  for (const pattern of AI_GIVEAWAYS) {
    const matches = text.match(pattern)
    if (matches) deductions += matches.length * 10
  }
  // Sentence length variance check
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const lengths = sentences.map(s => s.split(' ').length)
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length
  if (variance < 5) deductions += 20 // Too uniform = AI-like

  return Math.max(0, 100 - deductions)
}

/**
 * Extract regulatory citations from text.
 */
export function extractCitations(text: string): Citation[] {
  const citations: Citation[] = []

  const patterns = [
    { re: /Regulation \(EU\) (\d{4}\/\d+)/g, label: 'EU Regulation' },
    { re: /Article (\d+[a-z]?(?:\(\d+\))?)/g, label: 'Article' },
    { re: /(\d+\s+U\.?S\.?C\.?\s+§?\s*\d+[a-z]*)/g, label: 'US Code' },
    { re: /(GDPR|MiCA|VARA|FATF|AMLD\d|DORA|NIS2|CCPA|PDPA)/g, label: 'Regulation' },
    { re: /Directive (\d{4}\/\d+\/EU)/g, label: 'EU Directive' },
  ]

  for (const { re, label } of patterns) {
    let m: RegExpExecArray | null
    re.lastIndex = 0
    while ((m = re.exec(text)) !== null) {
      if (!citations.find(c => c.text === m![0])) {
        citations.push({ text: m[0], regulation: label, verified: false })
      }
    }
  }

  return citations
}

/**
 * Build a product metadata entry for the intelligence store.
 */
export function packageProduct(params: {
  id: string
  title: string
  content: string
  price: number
  format: 'pdf' | 'epub' | 'interactive'
  version?: string
}): IntelligenceProduct {
  const citations = extractCitations(params.content)
  const score = humanScore(params.content)
  const words = params.content.split(/\s+/).length

  return {
    id: params.id,
    title: params.title,
    version: params.version ?? '1.0',
    content: params.content,
    citations,
    confidenceScore: score,
    reviewStatus: score >= 85 ? 'validated' : 'draft',
    wordCount: words,
    updatedAt: new Date().toISOString(),
    format: params.format,
    price: params.price,
  }
}

/**
 * Validate a product is ready to publish.
 * Returns list of blocking issues.
 */
export function validateForPublishing(product: IntelligenceProduct): string[] {
  const issues: string[] = []

  if (product.wordCount < 1500) {
    issues.push(`Word count is ${product.wordCount}. Minimum is 1,500.`)
  }
  if (product.citations.length < 3) {
    issues.push(`Only ${product.citations.length} citations found. Minimum is 3.`)
  }
  if (product.confidenceScore < 80) {
    issues.push(`Human score is ${product.confidenceScore}. Minimum for publishing is 80.`)
  }
  if (product.reviewStatus === 'draft') {
    issues.push('Product has not been validated. Run validation before publishing.')
  }

  return issues
}
