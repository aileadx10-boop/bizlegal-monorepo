# llm — CLAUDE.md

**Status:** PLACEHOLDER SCAFFOLD — only `node_modules` + `tsconfig.tsbuildinfo` exist; no sources yet. Referenced in `decisions/DEAL44-WORKFLOW44-2026-09-07.md` §10 (Hebrew-contract AI extraction was gated behind a Hebrew-PDF spike partly because this package has no source on this branch).

**Intended purpose:** shared LLM client/abstraction for packages and apps (consistent model routing, retries, spend guards).

**Envs:** none yet; O5 from the first reference.

**Rule:** do not add call-site `fetch` hacks to other packages in the meantime — either build this properly or use the existing per-app patterns.
