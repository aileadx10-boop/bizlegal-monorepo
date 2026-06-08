# Ollama Plan — Corrected (2026-06-07)

**Supersedes the "Ollama tunnel decision" section of `OPENCLAW_ROLE.md` (2026-05-01).**
That section assumed Ollama ran on Moses's **laptop**, exposed to Hetzner via a Cloudflare Tunnel (`OLLAMA_TUNNEL_URL`). That architecture is **obsolete**.

## Reality (verified 2026-06-07 via SSH + code read)

- **Ollama runs ON the Hetzner curator box**, not the laptop. Installed models: `mistral-nemo` (~7.1 GB), `llama3.2:3b` (~2.0 GB). Disk OK (~43 GB free).
- The actual scorer `apps/hub/infrastructure/tools/scout_ollama.py` already calls **`http://localhost:11434`** — i.e. local Ollama on Hetzner. It does **not** read `OLLAMA_TUNNEL_URL`. The tunnel/laptop story in the old doc was never what the code did once Ollama moved onto the box.

## 🔴 Bug found (prime suspect for the throttled gap pipeline)

`scout_ollama.py` line 23 hardcodes **`MODEL = "gemma2:9b"`** — which is **NOT installed** on the box (only `mistral-nemo` + `llama3.2:3b` are). If true, every `classify_item()` call fails (model-not-found → `None`), `process_batch` passes 0 items, and the scout exits code 2. That explains why only 3 of 25 detected gaps became pages.

**VERIFY on the box:** `ollama list` (confirm whether `gemma2:9b` exists).

**FIX (pick one):**
- **A (no pull):** change the model to one already installed — set `MODEL = os.environ.get("SCOUT_OLLAMA_MODEL", "mistral-nemo")`. mistral-nemo (12B-class) is a capable JSON classifier. Zero download.
- **B (keep gemma):** on Hetzner `ollama pull gemma2:9b` (≈5.4 GB; disk is fine), leave the code as-is.

Recommendation: **A** — make the model an env var defaulting to `mistral-nemo`, so the box's actual inventory drives it and a missing model never silently kills the pipeline again. Also add an Anthropic-Haiku fallback in `classify_item` so a local-Ollama miss degrades instead of zeroing the run.

## Vault / tunnel cleanup

- `OLLAMA_TUNNEL_URL` — **dead** (no code reads it; scout uses localhost). Remove from vault, or repoint to `http://127.0.0.1:11434` and document it as "local on Hetzner."
- OpenClaw items from the old doc still stand: archive `.openclaw-minimax` + `.openclaw-ollama`; **rotate** the hardcoded `OPENCLAW_GATEWAY_TOKEN`; the `OPENCLAW_*_URL` vault keys are unused.

## Re-plan — how Ollama SHOULD be used (the value)

Local Ollama on Hetzner = **free inference** for high-volume, low-stakes work. Use it as the cheap "intern" tier; keep Claude as the "senior, customer-facing, verified" tier. This directly powers the marketing team at ~zero marginal cost:

| Task | Model | Why |
|---|---|---|
| Regulatory scout classify/score (current) | Ollama `mistral-nemo` (local) | high volume, structured JSON, fix the model name |
| **Gap-page FIRST drafts** (un-throttle 3/25) | Ollama draft → **Claude verify + quality gate** | cost was likely the throttle; draft cheap, verify accurate |
| **Lead scoring** (DocAI + OCI inbound) | Ollama local | score/rank hundreds free |
| **First-draft outreach** (cold email/DM) | Ollama draft → Claude polish the ones that matter | volume cheap, quality where it counts |
| Final published content, payment/legal text, customer replies | **Claude only** | accuracy + UPL + brand; never local |

**Guardrails:** Ollama never writes the final published/customer-facing text. The quality gate + Claude verification stay mandatory before anything goes live. If the laptop/box Ollama is down, every path falls back to Claude-Haiku (cheap) rather than failing.

## Action items

1. **Verify** `ollama list` on Hetzner.
2. **Fix** `scout_ollama.py` MODEL → env var default `mistral-nemo` (+ Haiku fallback). (Code change — needs deploy to Hetzner.)
3. **Remove/repoint** `OLLAMA_TUNNEL_URL` in vault.
4. **Wire** Ollama as the cheap tier for lead scoring + outreach first-drafts in the marketing team.
5. (From old doc) archive OpenClaw sandboxes + rotate `OPENCLAW_GATEWAY_TOKEN`.
