import type { ExtractionResult } from './schema'
import { extractWithAnthropic } from './anthropic'
import { extractWithMinimax } from './minimax'

/**
 * Two-tier extraction: try Anthropic first, fall back to Minimax on failure.
 * If both fail, throws the original Anthropic error so the caller can
 * surface "AI extraction failed" + mark the job 'failed'.
 */
export async function extractWithFallback(documentText: string): Promise<{
  readonly result: ExtractionResult
  readonly provider: 'anthropic' | 'minimax'
}> {
  try {
    const result = await extractWithAnthropic(documentText)
    return { result, provider: 'anthropic' }
  } catch (primaryErr) {
    try {
      const result = await extractWithMinimax(documentText)
      return { result, provider: 'minimax' }
    } catch {
      throw primaryErr
    }
  }
}
