# agents/ea — Executive Assistant brain

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md). This file documents only what's specific to the EA brain.

The strategic-operating layer for Moses. Imported into the monorepo on 2026-05-01 from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/executive assistant/` (excluding runtime data: `digests/`, `outputs/`, `lead_profiles/`, `reports/`, `archives/`, `MySocialsAssistant/`).

## What the EA brain is

A self-contained agent operating environment with prompts, schemas, templates, and context that drive Claude Code (or any compatible agent) when it acts as Moses's executive assistant. Not deployable code — these files are READ by agents at the start of a session to bootstrap correct behavior.

## Layout

| Path | Purpose |
|---|---|
| `EA-CLAUDE.md` | original "EA Brain" entry point (Moses's role, top priority, communication rules, tool integrations) |
| `EA-AGENTS.md` | sub-agent specs |
| `INITIALIZE_PROMPT.txt` | session-bootstrap prompt |
| `prompts/` | ~50+ task prompts (lead extract / critique / score / summary, post enrich / generate, report snapshot critique / draft) |
| `templates/` | reusable output templates (session-summary, etc.) |
| `schemas/` | Zod / JSON schemas the prompts validate against |
| `context/` | Moses's role / work / team / current-priorities / goals (referenced by `EA-CLAUDE.md` via `@context/...`) |
| `references/` | reference materials the EA cites |
| `decisions/` | EA-specific decisions (separate from monorepo-root `decisions/` which is BizLegal-AI strategy) |

## How to use it

A Claude Code session acting as Moses's EA reads this dir as bootstrap:

1. Read `EA-CLAUDE.md` — overall mandate
2. Read `INITIALIZE_PROMPT.txt` — kickoff state
3. Pull task-specific prompt from `prompts/<task>.md`
4. Validate output against `schemas/<task>.zod.ts` if present
5. Render with `templates/<output-template>.md`

The Cloudflare Worker `services/worker/` (lead-intake) consumes `prompts/lead-{extract,critique,score,summary}.md` directly via the runPipeline function chain. Don't fork those prompts — edit in this dir, re-deploy the Worker.

## Phase Z context

- **No new prompts** during Phase Z stabilization. Edits to existing prompts that fix bugs are fine; new agent flows are V3-V7 territory and parked.
- **No new schemas** — same rule.
- **Edits propagate to the Worker** if a `prompts/lead-*.md` changes — the Worker's `src/extract.ts`, `src/critique.ts`, `src/score.ts`, `src/summary.ts` reference these by path. Test with `pnpm -F @bizlegal/worker dev` after any prompt edit.
- **Vault discipline applies:** if a new prompt references `process.env.X` (rare — prompts are mostly markdown), the audit-vault hook catches it.

## Outstanding tasks (post-Z7)

1. **Move `services/worker/src/{extract,critique,score,summary}.ts` to read prompts from `agents/ea/prompts/`** instead of inlining (currently the Worker has its own copies). Single source of truth: `agents/ea/prompts/`.
2. **Sync schemas:** `services/worker/src/types.ts` `LeadProfileSchema` should be regenerated from `agents/ea/schemas/lead-profile.json`.
3. **Add `agents/ea/AGENTS.md` index** that maps each prompt → consuming surface (Worker / hub / curator).
