/**
 * Trace ID utilities for BizLegal Hub API.
 *
 * Every inbound request gets a trace ID — either forwarded from the caller
 * via x-bizlegal-trace-id, or freshly minted here. Downstream services
 * should echo this header so the ops dashboard can correlate events.
 */

/**
 * Generate a new trace ID.
 * Format: tr_<timestamp base36>_<random 6 chars>
 * Example: tr_lrwz4k7_ab12cd
 */
export function newTraceId(): string {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Return the trace ID from x-bizlegal-trace-id header, or mint a new one.
 * Use at the top of any API route handler.
 */
export function getOrCreateTraceId(req: Request): string {
  return req.headers.get('x-bizlegal-trace-id') ?? newTraceId()
}
