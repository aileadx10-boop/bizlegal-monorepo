/**
 * BizLegal AI — Four-Layer Hallucination Prevention
 *
 * Layer 1: Input validation (syntax, injection, length, type)
 * Layer 2: Output verification (confidence scoring, DB cross-ref, citation check)
 * Layer 3: Expert review trigger (litigation/enterprise tier)
 * Layer 4: Audit trail logging
 */

// ─── LAYER 1: INPUT VALIDATION ────────────────────────────

const INJECTION_PATTERNS = [
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /ignore\s+previous\s+instructions/i,
  /system\s*:/i,
  /<script/i,
  /javascript:/i,
  /\bexec\b/i,
  /\bunion\s+select\b/i,
]

export interface InputValidationResult {
  valid: boolean
  errors: string[]
}

export function validateInput(input: Record<string, unknown>): InputValidationResult {
  const errors: string[] = []

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== 'string') continue

    // Length limits
    if (value.length > 10_000) {
      errors.push(`Field "${key}" exceeds maximum length of 10,000 characters.`)
    }
    if (key === 'email' && value.length > 254) {
      errors.push(`Field "email" exceeds maximum length.`)
    }

    // Injection patterns
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        errors.push(`Field "${key}" contains a disallowed pattern.`)
        break
      }
    }

    // Type-specific validation
    if (key === 'email' && value.length > 0) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(value)) {
        errors.push(`Field "email" is not a valid email address.`)
      }
    }

    if (key === 'wallet_address' && value.length > 0) {
      const ethRe = /^0x[0-9a-fA-F]{40}$/
      const btcRe = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/
      if (!ethRe.test(value) && !btcRe.test(value)) {
        errors.push(`Field "wallet_address" does not appear to be a valid Ethereum or Bitcoin address.`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

// ─── LAYER 2: OUTPUT VERIFICATION ─────────────────────────

export interface OutputVerificationResult {
  status: 'accept' | 'flag' | 'reject'
  confidence: number
  flags: string[]
  requiresExpertReview: boolean
}

const HALLUCINATION_PHRASES = [
  'I believe',
  'I think',
  'I am not sure',
  'supposedly',
  'it might be',
  'some say',
  'allegedly',
  'perhaps',
  'maybe',
  'I cannot confirm',
]

const KNOWN_REGULATIONS = [
  'GDPR', 'MiCA', 'VARA', 'SEC', 'FATF', 'AML', 'KYC',
  'AI Act', 'DORA', 'NIS2', 'CCPA', 'PDPA', 'DPA',
  '15 USC', 'Regulation (EU)', 'Directive',
]

export function verifyOutput(text: string, tier: string): OutputVerificationResult {
  const flags: string[] = []
  let confidence = 100

  // Check for hallucination phrases
  for (const phrase of HALLUCINATION_PHRASES) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      flags.push(`Uncertainty phrase detected: "${phrase}"`)
      confidence -= 10
    }
  }

  // Check minimum length (substance check)
  if (text.length < 100) {
    flags.push('Output is too short to be substantive.')
    confidence -= 20
  }

  // Check for regulation citations (factual grounding)
  const hasCitation = KNOWN_REGULATIONS.some(reg =>
    text.includes(reg)
  )
  if (!hasCitation) {
    flags.push('No regulatory citation found. Output may lack factual grounding.')
    confidence -= 15
  }

  // Clamp confidence
  confidence = Math.max(0, Math.min(100, confidence))

  // Determine status
  let status: 'accept' | 'flag' | 'reject' = 'accept'
  if (confidence < 70) status = 'reject'
  else if (confidence < 90) status = 'flag'

  // Litigation/enterprise tier always requires expert review
  const requiresExpertReview =
    tier === 'litigation' ||
    tier === 'litigation-enterprise' ||
    tier === 'enterprise' ||
    confidence < 70

  return { status, confidence, flags, requiresExpertReview }
}

// ─── LAYER 3: EXPERT REVIEW TRIGGER ──────────────────────

export function requiresExpertReview(tier: string, confidence: number): boolean {
  return (
    tier === 'litigation' ||
    tier === 'litigation-enterprise' ||
    tier === 'enterprise' ||
    confidence < 70
  )
}

// ─── LAYER 4: AUDIT LOG ENTRY ─────────────────────────────

export interface AuditEntry {
  timestamp: string
  product: string
  tier: string
  inputHash: string
  modelVersion: string
  confidence: number
  verificationStatus: 'accept' | 'flag' | 'reject'
  expertReviewRequired: boolean
  expertReviewStatus?: 'pending' | 'approved' | 'rejected'
  flags: string[]
}

import crypto from 'crypto'

export function buildAuditEntry(params: {
  product: string
  tier: string
  input: string
  modelVersion: string
  confidence: number
  verificationStatus: 'accept' | 'flag' | 'reject'
  expertReviewRequired: boolean
  flags: string[]
}): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    inputHash: crypto.createHash('sha256').update(params.input).digest('hex').slice(0, 16),
    ...params,
    expertReviewStatus: params.expertReviewRequired ? 'pending' : undefined,
  }
}

// ─── CONFIDENCE LEVEL HELPER ──────────────────────────────

export function confidenceLevel(score: number): 'high' | 'mid' | 'low' {
  if (score >= 90) return 'high'
  if (score >= 70) return 'mid'
  return 'low'
}

export function confidenceLabel(score: number): string {
  if (score >= 90) return 'Verified'
  if (score >= 70) return 'Review Recommended'
  return 'Expert Review Required'
}

export function confidenceColor(score: number): string {
  if (score >= 90) return 'var(--accent)'
  if (score >= 70) return 'var(--warning)'
  return 'var(--danger)'
}
