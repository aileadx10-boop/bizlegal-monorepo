# packages/rate-limit Operating Notes

Purpose: shared rate-limit wrappers for public routes and webhook protection.
Package name: @bizlegal/rate-limit.
Deploy target: Vercel apps and edge-compatible server handlers.
Env surface: Upstash/Redis values when a caller enables distributed limits.
Default posture is fail-safe for abuse and fail-open only for explicitly configured health paths.
Keep route keys stable so dashboards and incident notes remain comparable.
Do not store secrets, request bodies, or PII in limiter keys.
Use coarse identifiers: IP, user id, session id, or route family.
Document new limiter policies in the owning app CLAUDE.md.
Run TypeScript checks before shipping changes.
