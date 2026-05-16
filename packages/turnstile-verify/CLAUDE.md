# packages/turnstile-verify Operating Notes

Purpose: shared Cloudflare Turnstile server-side verification helper.
Package name: @bizlegal/turnstile-verify.
Deploy target: Vercel/API routes and service handlers that accept public form submissions.
Env surface: TURNSTILE_SECRET_KEY supplied by callers.
Never bypass verification on production public endpoints.
Keep network failures explicit so callers can decide fail-open vs fail-closed.
Do not log tokens or raw challenge responses.
Return typed verification outcomes with reason codes.
Test with fixture responses where possible.
Run TypeScript checks before shipping changes.
