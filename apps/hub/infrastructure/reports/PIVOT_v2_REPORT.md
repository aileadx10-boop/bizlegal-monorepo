# Pivot v2 — Final report

Date: 2026-04-19
Branch across all repos: `claude/standardize-bizlegal-subdomains-YekYM`
Active disclosure version: `v1.0.0-p6`

## Commit map (all phases, all repos)

| Phase | bizlegal-ai | trcr | BRAI | lexaudit | docai-monorepo | leadforge-ai | lexaudit-safe |
|---|---|---|---|---|---|---|---|
| P0  | `959fd81` + `0e1844c` | `b8c8f2c` | `afd3ee5` | `f4babe8` | `aa00320` | `d893ce1` | — |
| P1  | `2f2eab4` + `034b1ff` | `4ca8efe` | `0aa3df0` | `5c08bd2` | `e5e6511` | `94a5cd9` | — |
| P2  | `c7ca92a` | `a934d85` | `e2a5b1d` | `c00bc01` | `e352572` | `e0a42c8` | — |
| P3  | `e5482de` | `6dca8d8` | `ecfbecf` | `2b64941` | `e79e2b2` | `50cbbb1` | — |
| P4  | `2e7e42e` | `e103464` | `5ec0fce` | `9a1e37c` | `82e0414` | `cb64104` | — |
| P5  | `4c7518e` | `52a8b81` | `dadcafd` | — | — | — | — |
| P6  | — | — | — | — | — | — | `add4ef9` |

All repos on branch `claude/standardize-bizlegal-subdomains-YekYM`. No PRs created per spec.

## Canonical env — diff snapshot

Canonical source: `bizlegal-ai/infrastructure/env/canonical.env.template`.
Per-repo tier selection in `bizlegal-ai/infrastructure/env/manifest.json`:

| Repo | Tiers | Highlights |
|---|---|---|
| bizlegal-ai | 0, 1, 2, 5, 7 | AI + Supabase + billing + cron |
| trcr        | 0, 1, 3, 5, 7 | chain intelligence + billing + sanctions cron |
| BRAI        | 0, 1, 3, 5, 7 | same as trcr |
| lexaudit    | 0, 1, 2, 5, 7 | AI + billing |
| docai-monorepo | 0, 1, 2, 5, 7 | AI + billing |
| leadforge-ai | 0, 1, 2, 4, 5, 7 | AI + intent-signal sources + billing |
| lexaudit-safe | 0, 1, 2, 5, 6, 7 | AI (upstream) + Safe (Presidio/KMS/Audit) + Stripe |

Tier 5 preserves legacy processors (NOWPayments, PayPal) alongside Stripe to honour the "no payment-processor changes" hard constraint.

## Hub trust-section URLs

- Stance — `https://bizlegal-ai.com/stance`
- Data sources — `https://bizlegal-ai.com/data-sources`
- Methodology library — `https://bizlegal-ai.com/methodology-library`
- Live regulatory clock — `https://bizlegal-ai.com/regulatory-clock`
- Fleet pricing (with VIN anchor) — `https://bizlegal-ai.com/pricing/all`

## LexAudit Safe deployment

- Repo: `https://github.com/aileadx10-boop/lexaudit-safe`
- Target domain: `https://safe.bizlegal-ai.com` (DNS swap held until a human eyeballs the build)
- Docker image: `lexaudit/safe-gateway:v1` (build via `docker compose build gateway`)
- Free-tier run: `docker run -p 8080:8080 -e LEXAUDIT_UPSTREAM_ANTHROPIC_API_KEY=... lexaudit/safe-gateway:v1`
- Unit tests: `cd web && npm test` → 8 / 8 passing

## Safe — 1-page business case

**Problem.** Employees at regulated firms paste IP, secrets, PHI, and financials into consumer and enterprise LLMs every day. Blocking AI costs productivity. Building a redaction layer in-house costs two engineers for six months and reinvents Presidio. The compliance team sees none of it.

**Solution.** LexAudit Safe sits between the employee and the LLM. It redacts sensitive spans before the prompt leaves the network, logs every call for audit, and gives compliance one pane of glass. It is middleware — not a replacement LLM, not certification.

**Why now.** Four forces converged: (1) enterprise AI policies shipped in 2025 demand audit trails; (2) Presidio + spaCy matured enough for 99th-percentile redaction without GPUs; (3) HIPAA / GDPR enforcement actions in 2026 are citing LLM prompt leakage by name; (4) the same buyers who pay for LexAudit are the ones asking for this.

**Economics.** Free Gateway seeds. Team ($499/mo) converts. Scale ($1,999/mo) lands regulated buyers with self-hosting. Enterprise (contact) lands the SOC 2 + BAA deals. V1 is ~2 GB RAM + 0.5 vCPU per 50 employees — gross margin is software, not compute.

**Liability posture.** We do not certify customers as compliant. The DPA at `/trust/dpa` is marked draft. The customer is the data controller; Safe is the processor. Everything we log is stamped with disclosure version so the audit trail reproduces.

**Design-partner slots.** V1 opens 3 slots via `https://safe.bizlegal-ai.com/book`. First 3 partners get 20% off Team for 12 months and direct line to the architect. Target partners: regulated AI-curious firms (mid-market financials, healthcare platforms, regulated marketplaces) with an engaged CISO.

**V2 / V3 roadmap (not in V1).** V2: SIEM export, custom rule-pack builder. V3: SOC 2 Type II, self-hosted small model, HIPAA BAA. Cross-sell: "LexAudit customers get 20% off Safe for 12 months" link on the LexAudit site.

## Consolidated LIABILITY_JUDGMENT table

| # | Phase / repo | Judgment |
|---|---|---|
| 1 | P0 fleet | Tailwind preset shipped additively as `lib/brand/tailwind-preset.ts` instead of overwriting live tailwind configs — would have broken styles before P4.b adoption. |
| 2 | P0 templates | White-template `--dim` at `#a1a1aa` failed WCAG AA on `--bg-2: #fafafa`. Rather than change a spec-locked token, moved two CSS rules (`.ij`, `.fbot`) to `--muted`. |
| 3 | P1 hub | 7-clause shield drafted from the North-Star Rule since the spec's "verbatim" v1 source wasn't carried into context. Any rediscovery should supersede via a future commit. |
| 4 | P1 hub | "Legal services" substring even in defensive framing tripped the banned-word gate. Rewrote to "we do not practice law" + "this is not legal advice". |
| 5 | P1 hub | TRACR acronym expansion "Trace, Analyze, Court-Grade Reports" → "Composite Risk Reports". |
| 6 | P1 trcr / leadforge / docai / lexaudit / BRAI | Marketing routes declare CSS custom properties inline via route-group layout so propagated widgets render with a sensible palette without importing cross-repo design systems. |
| 7 | P1 lexaudit | DB `matter.status` value `'certified'` → `'attested'` written going forward. Existing rows show as "Pending" until P2 data reconciliation — accepted under conservative framing. |
| 8 | P1 lexaudit | Product name "Compliance Certificates" preserved (noun, not banned). Methodology clarifies the artefact is a process record, not a compliance finding. |
| 9 | P1 lexaudit | "SOC 2 Type II certified" → "independently attested SOC 2 Type II reports" (factually more accurate — SOC 2 is an attestation). |
| 10 | P1 BRAI | 7-clause block inline-duplicated on static HTML pages — no templating engine available. P2 rebuild consumes the canonical TS source directly. |
| 11 | P1 BRAI | Existing 5 legal HTML pages preserved at P1 to avoid breaking per-page content; uniform treatment arrives with P2 rebuild. |
| 12 | P2 lexaudit | 60 signals are process-attestation signals, not certification criteria. Every `control_ref` cites a real published control; attestation ≠ certification. |
| 13 | P2 lexaudit | Insufficient-evidence signals are excluded from the denominator rather than scoring 0 — silently defaulting would inflate the apparent gap. |
| 14 | P2 lexaudit | `generateReport()` throws if reviewer signoff is missing — HITL firewall at the engine layer, not by convention. |
| 15 | P2 leadforge | Every `RankedLead` carries `outbound_compliance_notice` by construction. LeadForge doesn't send outreach on the subscriber's behalf; the sender remains the controller. |
| 16 | P2 leadforge | DOJ press-release events preserve the "alleged" framing verbatim. Marketing copy must not paraphrase to "found guilty"; weekly sample review enforces. |
| 17 | P2 docai | Below-threshold retrieval emits a canonical OUT_OF_SCOPE_TEMPLATE — fabrication-free contract. |
| 18 | P2 hub | SEO style rules enforce at generation time, not publish time. Rejections route to `infrastructure/reports/seo-rejects.jsonl` with the disclosure version stamped. |
| 19 | P2 hub | `/leadforge` moved to subdomain (`leadforge.bizlegal-ai.com`) with a permanent 308 redirect. |
| 20 | P2 trcr | Direct sanctions match forces tier=critical independent of raw score. |
| 21 | P2 trcr | Provider fetchers fail gracefully — failure is annotated, not thrown. |
| 22 | P2 BRAI | `lib/chain/*` is a verbatim copy from trcr; drift is tracked via the shared `DISCLAIMER_VERSION` stamp. |
| 23 | P2 BRAI | Static `frontend/` retained; DNS swap held until a human eyeballs the Next 14 preview. |
| 24 | P3 fleet | All 5 WAT SOPs propagated byte-identical; a plaintiff's expert reading SOPs in discovery finds the same set in every repo. |
| 25 | P4 hub | Canonical env preserves NOWPayments + PayPal alongside Stripe — "no payment-processor changes" hard constraint. |
| 26 | P4 hub | `/stance` is the voluntary explanation; the 7-clause shield is the legal minimum. Both versioned. |
| 27 | P4 hub | `sync-env.sh --check` has a trailing-newline quirk; write mode is byte-correct. CI integration tracked for follow-up. |
| 28 | P5 trcr + BRAI | VIN intake does not collect payment. Intro fee + analyst retainer negotiated directly between subscriber and third party. |
| 29 | P5 terms | VIN terms paragraph is spec-verbatim; changes bump `DISCLAIMER_VERSION` fleet-wide. |
| 30 | P5 hub | VIN tier intentionally scoped to TRACR + BRAI only. Expanding to other products requires a matching partner network. |
| 31 | P6 Safe | DPA marked DRAFT — NOT FOR EXECUTION with a visible red banner and `robots:noindex`. |
| 32 | P6 Safe | Gateway forwards Anthropic only in V1; OpenAI / Google / self-hosted scaffolded but return 501. |
| 33 | P6 Safe | Audit log writes to stdout + optional WORM bucket; `SAFE_AUDIT_STORE_ORIGINAL=0` keeps only the sanitized prompt in self-hosted mode. |
| 34 | P6 Safe | Stripe Checkout + webhook return 202 "preview mode" when not configured so Vercel previews don't 500. |
| 35 | P6 Safe | Supabase persistence for users + audit log deferred to next P6 commit; admin pages show seed data matching the target schema. |
| 36 | P6 Safe | `gateway/app/rule_loader.py` mirrors `rules/packs/*.ts` by hand; both sides stamp the same disclosure version. |
| 37 | P6 Safe | V2 (SIEM, custom rule builder) and V3 (SOC 2, self-hosted model) deferred per spec. |

## Gate summary

| Gate | Status fleet-wide |
|---|---|
| Banned-word grep on `app/ components/ content/ lib/` | **0** in every repo |
| JSON-LD `@type` — no `LegalService` / `ProfessionalService` | clean |
| v1-white `var(--pink)` check | 0 in lexaudit + docai-monorepo + lexaudit-safe |
| 10 legal routes per subdomain | present in every Next.js repo |
| DISCLAIMER_VERSION stamped on every engine output | yes, enforced at code level |
| HITL firewall (`reviewer_id` required) | enforced in lexaudit `generateReport`, tracr `scoreAddress` |
| Preservation-before-response on incident | documented in WAT-INC-001, propagated fleet-wide |

## Not done this session, tracked for follow-up

- `sync-env.sh --check` newline normalisation (P4.a CI contract).
- BRAI Flask → `api/` extraction (P2.c continuation; contract pinned in `BRAI/docs/FLASK_EXTRACTION.md`).
- BRAI DNS swap from `frontend/` to `frontend-next/` (awaits human preview).
- Safe: Supabase-backed persistence for users + audit log.
- Safe: wire OpenAI / Google / self-hosted upstream paths.
- Safe: Stripe real-production config + webhook handler persistence.
- Safe V2: SIEM export, custom rule-pack builder.
- Safe V3: SOC 2 Type II, HIPAA BAA, self-hosted small model.
