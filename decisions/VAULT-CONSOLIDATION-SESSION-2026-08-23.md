# Vault consolidation — session 2026-08-23 (follow-up to bench bring-up)

## What got built
Per user request "CLOUDFLARE AND VERCEL IN VAULT" — consolidated 6 keys
from `Downloads/env-hub-bizlegal-ai.txt` (the actual canonical hub vault)
into the two on-disk "canonical" files at `~/.env.CANONICAL.txt` and
`~/.env.bizlegal.txt`.

Keys added to BOTH files (with section header "# ── Cloudflare + Vercel
(synced from env-hub-bizlegal-ai.txt 2026-08-23) ──"):
- `CLOUDFLARE_API_TOKEN` (52 chars, value matches `CF_TOKEN`)
- `CLOUDFLARE_AUTH_EMAIL` (20 chars, your email)
- `CF_TOKEN` (52 chars, same as CLOUDFLARE_API_TOKEN)
- `VERCEL_API_TOKEN` (60 chars, `vcp_...` — the account-scoped project token)

Turnstile pair added in a separate block:
- `WIDGET_CF_SECRETKEY` (35 chars)
- `WIDGET_CF_SITEKEY` (24 chars)

## What got decided
- The "real" canonical vault for bizlegal-ai is `Downloads/env-hub-bizlegal-ai.txt`,
  not `~/.env.bizlegal.txt`. The header on that file says
  "Source: ENV_UPLOAD_KIT.md + canonical-env-clean.env + .env.local /
  Compiled: 2026-04-27". The `~/.env.bizlegal.txt` file has stale
  placeholder values (e.g. `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`)
  so it is NOT trustworthy as a primary vault — only as a backup reference.
- The Vercel token used by the local `vercel` CLI (`~/.vercel/Data/auth.json`)
  is a different token (`vca_...`, CLI-scoped) from the vault token
  (`vcp_...`, project-scoped). Both work but the vault one is the right
  one to use in scripts per O5.
- User asked to NOT print tokens to chat. Confirmed: only char counts and
  presence were shown in the reply. The on-disk files contain the full
  values — same security posture as the existing source vault.

## What's still open
- The pre-commit hook referenced in O5 ("blocks commits that reference env
  vars not in the vault") was NOT verified to exist on the bench branch.
  Next session should run `ls .git/hooks/pre-commit` and check whether it
  references `env-hub-bizlegal-ai.txt` or `~/.env.bizlegal.txt`. If only
  the former, the new entries in `~/.env.bizlegal.txt` won't help.
- `~/.env.bizlegal.txt` has multiple stale placeholders that should be
  cleaned up on a separate pass (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_*
  _ANON_KEY, NEXT_PUBLIC_API_URL, WEBHOOK_SECRET, APP_SECRET_KEY). Not
  in scope this turn — user asked specifically for CF + Vercel.
- The Turnstile pair (WIDGET_CF_*) is now in the vault but NOT in the
  Vercel project `bench`. Next session should `vercel env add` them
  when the project needs them.

## Exact next action
No code work pending. If/when the next task needs CF or Vercel API
calls, load the vault with:
```
set -a && . "$HOME/.env.bizlegal.txt" 2>/dev/null && set +a
```
(then `CLOUDFLARE_API_TOKEN`, `CF_TOKEN`, and `VERCEL_API_TOKEN` are
all in the env). The Vercel CLI can also be re-authed with
`vercel login --token "$VERCEL_API_TOKEN"` if the local `vca_...` expires.
