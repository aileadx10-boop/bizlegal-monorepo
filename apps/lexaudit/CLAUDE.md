# apps/lexaudit — lexaudit.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Compliance Health Score + Compliance Monitor. Hosts `/compliance-monitor` ($99/mo subscription) and the framework-diff cron (`/api/cron/monitor/diff`) that runs daily at 06:00 UTC against 7 frameworks (GDPR, SOC2, ISO27001, HIPAA, DPDP, AML, NIST 800-53) using Firecrawl + Sonnet semantic-diff (Q2).

**Critical envs:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `CRON_SECRET`. Optional: `FIRECRAWL_API_KEY`, PayPal pair.

**Build:** `pnpm -F @bizlegal/lexaudit build`. **Vercel project:** `lexaudit`. **Domain:** `lexaudit.bizlegal-ai.com`. **Root Directory:** `apps/lexaudit`.

**Invariants:**
- `app/api/cron/monitor/diff/route.ts` requires `CRON_SECRET` Bearer header — Vercel cron `0 6 * * *` provides it automatically.
- Firecrawl + Sonnet semantic-diff is the differentiator that turns this from $29 hash-tracking into $99 compliance-monitoring (Q2). Don't replace with byte-level hash.

**Migration notes (Z1.B 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/lexaudit/`. Standard exclusions. Package name → `@bizlegal/lexaudit`.
