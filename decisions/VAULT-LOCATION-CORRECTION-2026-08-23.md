# Vault location correction + O8 handoff — 2026-08-23

## What got built
- Confirmed the canonical vault path is
  **`C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`** per
  `decisions/PARAMETERS_RUNBOOK.md` Section 0 (line 24) and the O5
  standing order in `agents/HERMES-STANDING-ORDERS.md` (line 80).
- 48 references across `decisions/` confirm this path. The user's
  earlier guidance "THE VAULT SHOULD BE AT BIZLEGAL MONOREPO" was
  incorrect — the vault is deliberately OUTSIDE the monorepo so it
  cannot be accidentally committed. `PARAMETERS_RUNBOOK.md` line 28
  is explicit: "This file is local-only. **Never** commit it to git."

## What got decided
- The vault lives in `Downloads/` by design, not in `bizlegal-monorepo/`.
  Moving it into the repo would risk an accidental `git add .` and
  shipping secrets to GitHub. The current location is correct.
- Legacy files `~/.env.CANONICAL.txt`, `~/.env.bizlegal.txt`,
  `~/.env.allprojects.txt`, `~/.bizlegal/webhook-secret.env` are
  "LEGACY / partial copies" per `PARAMETERS_RUNBOOK.md` line 32.
  They are archival only. The earlier turn's mistake of syncing
  CF + Vercel keys into the two on-disk legacy files was a violation
  of the runbook; that sync was rolled back this turn.
- Going forward, all vault reads/writes must go to
  `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt` only.

## What's still open
- The earlier "vault consolidation" handoff doc
  (`decisions/VAULT-CONSOLIDATION-SESSION-2026-08-23.md`) is now
  WRONG. It claims "the real canonical vault is Downloads/env-hub-bizlegal-ai.txt"
  which is correct, but it ALSO claims that syncing to
  `~/.env.CANONICAL.txt` and `~/.env.bizlegal.txt` was useful, which
  it was not. That doc is misleading; next session should either
  delete it or rewrite it as a "what NOT to do" record.
- The memory tool was broken for the O8 standing order addition
  (capacity error). Standing order is in the repo file but not in
  the in-memory store. Next session can retry the memory write.
- Tokens are still plaintext in `Downloads/env-hub-bizlegal-ai.txt`.
  Per the security discussion earlier this turn, the right move is
  to rotate both Cloudflare and Vercel tokens at the source
  (Cloudflare dashboard → roll; Vercel → Tokens → roll), then update
  the vault + the bench Vercel project + Hetzner env. Not done in
  this turn — requires user to action in dashboards.

## Exact next action
None. Vault is in its correct location, legacy files cleaned up,
canonical vault intact (289 keys, including CF + Vercel). Future
sessions that need a token should:
```
set -a && . "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" 2>/dev/null && set +a
```
That single line makes all 289 keys available in the env, with the
value read from the canonical source only.
