# packages/nurture-enqueue Operating Notes

Purpose: shared enqueue helper for nurture and follow-up events across BizLegal surfaces.
Package name: @bizlegal/nurture-enqueue.
Deploy target: consumed by Vercel apps and worker/service runtimes.
Env surface: NURTURE_CROSS_VERTICAL_POLICY plus destination-specific secrets in callers.
Do not create new event types here without updating agents/AGENTS.md and ops docs.
Keep this package transport-light; callers own authorization and user consent checks.
Retries should be idempotent and safe for duplicate lead/session payloads.
Never log raw document contents or private customer messages.
Prefer small typed payloads over app-specific blobs.
Run package TypeScript checks before shipping changes.
