/**
 * PDF text-layer extraction + scanned-document guard.
 *
 * SCOPE RULE (decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md):
 * LeaseParse is TEXT-LAYER PDFs ONLY. There is no OCR in the $59 product and
 * none is planned inside the $200/mo cost cap. A scanned/image-only lease must
 * be detected here and routed to the refund path by the caller — it must NEVER
 * be forwarded to an LLM, because an empty prompt produces a confident,
 * fabricated abstract, which is the worst possible failure for a legal document.
 *
 * Approach lifted from services/funnel-mvp/src/services/report-service.ts
 * (DocumentTextExtractor) — pdf-parse, CommonJS require to dodge the ESM
 * interop trap, and a character-count floor to spot an absent text layer.
 */

const MIN_TOTAL_CHARS = 400
const MIN_CHARS_PER_PAGE = 120
/** Guard against a lease so long it would blow the LLM context / cost cap. */
const MAX_CHARS = 220_000

export type PdfTextFailure = 'no_text_layer' | 'parse_failed' | 'empty_file'

export interface PdfTextOk {
  ok: true
  text: string
  pages: number
  chars: number
  /** True when the text layer is thin enough to be worth flagging in warnings. */
  truncated: boolean
}

export interface PdfTextError {
  ok: false
  reason: PdfTextFailure
  pages: number
  chars: number
  message: string
}

export type PdfTextResult = PdfTextOk | PdfTextError

interface PdfParseOutput {
  text: string
  numpages: number
}

type PdfParseFn = (buf: Buffer) => Promise<PdfParseOutput>

/**
 * pdf-parse is CommonJS and its index.js runs a debug harness that reads a
 * bundled test fixture when `module.parent` is falsy — inside a Next.js
 * serverless bundle that throws ENOENT at module load. The dynamic
 * `import(...).default` form defers the load to call time and is the shape
 * already proven in apps/docai/web/lib/document-upload.ts; a static top-level
 * import (as in services/funnel-mvp) is the form that breaks.
 */
async function loadPdfParse(): Promise<PdfParseFn> {
  const mod = (await import('pdf-parse')) as unknown as { default: PdfParseFn }
  return mod.default
}

/**
 * Collapse the whitespace soup pdf-parse produces from multi-column layouts.
 * Keeps paragraph breaks (they carry clause structure) but drops runs of
 * blank lines and trailing spaces that waste LLM context.
 */
function normalise(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function extractPdfText(buffer: Buffer): Promise<PdfTextResult> {
  if (!buffer || buffer.length === 0) {
    return { ok: false, reason: 'empty_file', pages: 0, chars: 0, message: 'uploaded file is zero bytes' }
  }

  let parsed: PdfParseOutput
  try {
    const pdfParse = await loadPdfParse()
    parsed = await pdfParse(buffer)
  } catch (err) {
    return {
      ok: false,
      reason: 'parse_failed',
      pages: 0,
      chars: 0,
      message: err instanceof Error ? err.message : 'pdf-parse threw a non-Error',
    }
  }

  const pages = Number.isFinite(parsed.numpages) && parsed.numpages > 0 ? parsed.numpages : 1
  const text = normalise(parsed.text ?? '')
  const chars = text.length

  // Scanned / image-only PDF: pdf-parse succeeds but the text layer is absent
  // or is nothing but page furniture. Both the absolute floor and the
  // per-page floor must clear, so a 60-page scan with one OCR'd cover page
  // still fails.
  if (chars < MIN_TOTAL_CHARS || chars / pages < MIN_CHARS_PER_PAGE) {
    return {
      ok: false,
      reason: 'no_text_layer',
      pages,
      chars,
      message: `extracted ${chars} chars across ${pages} page(s) — below the text-layer floor (likely a scanned PDF)`,
    }
  }

  const truncated = chars > MAX_CHARS
  return {
    ok: true,
    text: truncated ? text.slice(0, MAX_CHARS) : text,
    pages,
    chars,
    truncated,
  }
}
