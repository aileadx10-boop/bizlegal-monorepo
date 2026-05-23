/**
 * Document text extraction. Supports PDF + DOCX + plain text.
 * Imported from services/funnel-mvp pattern (pdf-parse + mammoth).
 * Pure functions; no I/O — caller passes a Buffer.
 */

export interface ExtractionResult {
  readonly text: string
  readonly pageCount: number
  readonly mime: string
}

const MAX_INPUT_CHARS = 60_000 // ~15K tokens at Haiku/Sonnet; cuts very long contracts to budget

function clampText(s: string): string {
  if (s.length <= MAX_INPUT_CHARS) return s
  return `${s.slice(0, MAX_INPUT_CHARS)}\n\n[TRUNCATED — document was ${s.length} chars, cut to ${MAX_INPUT_CHARS}]`
}

export async function extractDocumentText(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<ExtractionResult> {
  const lower = (mime || '').toLowerCase()
  const lowerName = (filename || '').toLowerCase()

  if (lower.includes('pdf') || lowerName.endsWith('.pdf')) {
    const { default: pdfParse } = await import('pdf-parse')
    const result = await pdfParse(buffer)
    return {
      text: clampText(result.text ?? ''),
      pageCount: result.numpages ?? 0,
      mime: 'application/pdf',
    }
  }

  if (lower.includes('word') || lower.includes('officedocument') || lowerName.endsWith('.docx')) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return {
      text: clampText(result.value ?? ''),
      pageCount: 0,
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
  }

  // Plain text fallback
  return {
    text: clampText(buffer.toString('utf-8')),
    pageCount: 0,
    mime: lower || 'text/plain',
  }
}
