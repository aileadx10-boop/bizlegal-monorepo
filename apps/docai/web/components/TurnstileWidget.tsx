'use client'

/**
 * Backwards-compatible re-export. The implementation lives in
 * @bizlegal/turnstile-widget (Phase AA D11 — F-9-style lift after
 * 6 vendor copies). Existing call sites importing
 * `./TurnstileWidget` keep working.
 */
export { TurnstileWidget } from '@bizlegal/turnstile-widget'
export { TurnstileWidget as default } from '@bizlegal/turnstile-widget'
