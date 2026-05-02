/**
 * LexAudit Safe — PII redaction layer.
 *
 * Replaces direct identifiers in user-supplied text BEFORE that text is
 * sent to Anthropic. Operates on the prompt content (matter title, AI
 * prompt body, human edits notes) — NOT on metadata fields used by the
 * UI (like the responsible-lawyer's name, which is part of the audit
 * trail and stays attached to the cert snapshot).
 *
 * REVENUE+LIABILITY framing: this is a regex-based redaction layer. It
 * catches common patterns (emails, phones, government IDs, IBANs,
 * postcodes, cards) but is NOT a substitute for institutional review
 * before submitting genuinely sensitive matter content to a third-party
 * AI. The LexAudit /security page describes the limits.
 *
 * Strategy:
 *   - Apply patterns in priority order (most specific → most general)
 *   - Each match is replaced with a stable token like [PII:EMAIL] so the
 *     AI can still reason about structure without seeing the value
 *   - Return both the redacted text + a count map for audit logging
 */

export type PiiCategory =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'ein'
  | 'iban'
  | 'card'
  | 'aadhaar'
  | 'passport'
  | 'national-id-eu'
  | 'postcode-uk'
  | 'postcode-us'
  | 'ipv4'

export interface RedactionResult {
  text: string
  /** Per-category match counts. Useful for audit-log line. */
  counts: Partial<Record<PiiCategory, number>>
  /** Total token replacements. */
  total: number
}

interface Pattern {
  category: PiiCategory
  // Each pattern must be GLOBAL so all matches in a string are replaced.
  pattern: RegExp
  // The replacement token; we deliberately keep them short + structured.
  token: string
}

// Patterns — applied in array order. More specific first.
const PATTERNS: Pattern[] = [
  // Email
  {
    category: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    token: '[PII:EMAIL]',
  },
  // IBAN — country code + 2 digits + up to 30 alphanumerics
  {
    category: 'iban',
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{6,30}\b/g,
    token: '[PII:IBAN]',
  },
  // Card number (Visa/MC/Amex/Discover/JCB/Diners) — Luhn-spaced or contiguous
  {
    category: 'card',
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    token: '[PII:CARD]',
  },
  // SSN — US — XXX-XX-XXXX
  {
    category: 'ssn',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    token: '[PII:SSN]',
  },
  // EIN — US — XX-XXXXXXX
  {
    category: 'ein',
    pattern: /\b\d{2}-\d{7}\b/g,
    token: '[PII:EIN]',
  },
  // India Aadhaar — 12 digits, optionally space/hyphen separated 4-4-4
  {
    category: 'aadhaar',
    pattern: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    token: '[PII:AADHAAR]',
  },
  // Passport — generic 6-9 alphanumeric (loose, may overmatch — acceptable)
  {
    category: 'passport',
    pattern: /\b[A-PR-WYa-pr-wy][1-9]\d{6,8}\b/g,
    token: '[PII:PASSPORT]',
  },
  // EU national ID examples (DE Personalausweis, FR INSEE, ES DNI etc) — generic
  {
    category: 'national-id-eu',
    pattern: /\b[A-Z]{1,3}\d{6,12}[A-Z]?\b/g,
    token: '[PII:EU-NATIONAL-ID]',
  },
  // UK postcode
  {
    category: 'postcode-uk',
    pattern: /\b[A-Z]{1,2}\d[A-Z\d]?[ ]?\d[A-Z]{2}\b/gi,
    token: '[PII:UK-POSTCODE]',
  },
  // US ZIP+4 or 5
  {
    category: 'postcode-us',
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    token: '[PII:US-ZIP]',
  },
  // Phone — international + national. Loose match: at least 8 digits with optional + and separators.
  {
    category: 'phone',
    pattern: /\b(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{2,4}\)?[ .-]?){2,4}\d{2,4}\b/g,
    token: '[PII:PHONE]',
  },
  // IPv4
  {
    category: 'ipv4',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    token: '[PII:IPV4]',
  },
]

/**
 * Redact PII from a string. Returns the redacted text + per-category
 * match counts for audit logging.
 *
 * Patterns are applied in declared order. Each pattern uses the global
 * flag so all occurrences in a single string are replaced.
 */
export function redactPii(input: string): RedactionResult {
  if (!input) {
    return { text: input, counts: {}, total: 0 }
  }

  let text = input
  const counts: Partial<Record<PiiCategory, number>> = {}
  let total = 0

  for (const { category, pattern, token } of PATTERNS) {
    let matches = 0
    text = text.replace(pattern, () => {
      matches += 1
      return token
    })
    if (matches > 0) {
      counts[category] = (counts[category] ?? 0) + matches
      total += matches
    }
  }

  return { text, counts, total }
}

/**
 * Apply redaction to a record of named string fields. Useful when an API
 * receives `{ matter, form }` shaped input — we redact the AI-bound
 * fields but leave structural metadata (lawyer name, partner name) alone.
 */
export function redactFields<T extends Record<string, string | undefined>>(
  fields: T,
  fieldsToRedact: ReadonlyArray<keyof T>,
): { redacted: T; totals: Partial<Record<PiiCategory, number>>; total: number } {
  const redacted = { ...fields } as T
  const totals: Partial<Record<PiiCategory, number>> = {}
  let total = 0

  for (const key of fieldsToRedact) {
    const v = fields[key]
    if (typeof v === 'string' && v.length > 0) {
      const r = redactPii(v)
      redacted[key] = r.text as T[typeof key]
      total += r.total
      for (const [cat, n] of Object.entries(r.counts)) {
        const c = cat as PiiCategory
        totals[c] = (totals[c] ?? 0) + (n ?? 0)
      }
    }
  }

  return { redacted, totals, total }
}

/**
 * Audit-log line summarising a redaction, e.g.
 *   "[safe] redacted 5 PII tokens (email:2, phone:2, us-zip:1)"
 *
 * This is what we emit to console / structured logs so the audit trail
 * shows redaction happened without storing the original PII.
 */
export function summariseRedaction(result: { counts: Partial<Record<PiiCategory, number>>; total: number }): string {
  if (result.total === 0) return '[safe] no PII detected in input'
  const parts = Object.entries(result.counts)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([cat, n]) => `${cat}:${n}`)
    .join(', ')
  return `[safe] redacted ${result.total} PII token${result.total === 1 ? '' : 's'} (${parts})`
}
