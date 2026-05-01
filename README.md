# bizlegal-monorepo

BizLegal AI consolidated workspace. Phase Z (Stabilization Sprint, 2026-05-01).

**Read [`CLAUDE.md`](./CLAUDE.md) first.** Every agent / Claude session / new contributor starts there.

## Quickstart

```bash
pnpm install
pnpm turbo run build      # build all workspaces
pnpm turbo run typecheck  # tsc across the workspace
pnpm audit:vault          # check every env var ref against canonical vault
pnpm audit:operating-book # check new dirs have CLAUDE.md
```

## Layout

See `CLAUDE.md` Section 1 for the full layout map. tl;dr:

- `apps/` — Next.js apps (Vercel)
- `services/` — Python (Hetzner, OCI) + Cloudflare Workers
- `packages/` — shared TS + Python siblings
- `agents/` — agent specs + WAT prompts
- `decisions/` — every planning + ops doc
- `infrastructure/` — Caddyfile, docker-compose, systemd, terraform
- `supabase/` — consolidated migrations
- `scripts/` — vault + operating-book audits

## Hard rules (Phase Z)

1. No new features until Z7 verifies green for 24h.
2. No new payment URL constants — use `apps/hub/app/api/pay/start` (`@bizlegal/payment`).
3. Every new env var → canonical vault FIRST (pre-commit hook enforces).
4. Every new dir under `apps/services/agents/packages/` → has `CLAUDE.md` + root reference (pre-commit hook enforces).

See `CLAUDE.md` Sections 4-5 for the discipline rules.
