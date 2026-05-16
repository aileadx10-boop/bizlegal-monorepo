# packages/turnstile-widget Operating Notes

Purpose: shared client widget wrapper for Cloudflare Turnstile.
Package name: @bizlegal/turnstile-widget.
Deploy target: Next.js client components across BizLegal apps.
Env surface: NEXT_PUBLIC_TURNSTILE_SITE_KEY supplied by each app.
Keep the widget accessible and keyboard-friendly.
Do not hard-code site keys or app domains.
Expose callbacks for token ready, expiry, and errors.
Avoid adding payment or lead-capture business logic here.
Pair changes with server-side turnstile-verify behavior when needed.
Run downstream app builds when changing public props.
