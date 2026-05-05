// Lead-nurture cron handler — runs every 5 min.
//
// State machine: welcome → education → comparison → last_call → done.
// This module ships the WELCOME step + scaffolding for the other 3
// (placeholder prompts that the worker won't actually send until we
// wire real content in week 2). The skeleton is here so the cron
// handler itself doesn't change shape when education/comparison/
// last_call land.
//
// Daily cost: 30 articles/month × ~10 leads/article × 4 emails ≈
// 1200 Haiku calls/month. At Haiku 4.5 pricing (~$0.10/article-equiv
// for the email-shaped prompt) that's ~$10/month. Within budget.
//
// Anti-spam discipline:
//   - One sequence per lead_id (unique index)
//   - 4 emails max over 7 days (state transitions are one-way)
//   - List-Unsubscribe header on every send
//   - opted_out=true halts the row immediately
//   - Bounce webhook archives with bounce_reason

import type { Env } from "./types";
import {
  due,
  advance,
  archive,
  type NurtureRow,
  type NurtureStep,
  type NurtureVertical,
} from "./nurture-state";
import { sendEmail } from "./resend";
import { logEvent } from "./ops-log";
import { callHaikuJson, AnthropicCallFailed } from "./anthropic";
import {
  NURTURE_SYSTEM_PROMPT,
  buildUserPrompt,
  contextFor,
} from "./nurture-prompts";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// Step cadence in days from previous send.
const STEP_DELAYS: Record<NurtureStep, number> = {
  welcome: 0, // initial — set when row is created
  education: 2,
  comparison: 4 - 2, // 2 days after education = 4 days from welcome
  last_call: 7 - 4, // 3 days after comparison = 7 days from welcome
  done: 0,
};

const NEXT_STEP: Record<Exclude<NurtureStep, "done">, NurtureStep> = {
  welcome: "education",
  education: "comparison",
  comparison: "last_call",
  last_call: "done",
};

// Hard-cap how many rows we process per cron tick. Worker has ~30s CPU.
// At ~3s/row (Haiku call + Resend) that's room for 8-10 rows per tick.
// Set MAX_PER_TICK conservatively; due rows that don't make this batch
// are picked up next tick (5 min later). No row is ever dropped.
const MAX_PER_TICK = 8;

export async function runNurtureCron(env: Env, now: Date): Promise<void> {
  const start = Date.now();
  let due_rows: NurtureRow[] = [];
  try {
    due_rows = await due({ env }, MAX_PER_TICK);
  } catch (err) {
    console.warn(`[nurture] due() failed: ${(err as Error).message}`);
    await logEvent(env, {
      type: "cron.completed",
      ref_id: "worker/nurture",
      status: "failed",
      metadata: { outcome: "due_query_failed", error: (err as Error).message.slice(0, 200) },
    }).catch(() => undefined);
    return;
  }

  if (due_rows.length === 0) {
    // Quiet success — log once a day-ish for liveness rather than
    // every 5 min. Skipping the log entirely is fine here; /api/ops/feed
    // can show heartbeat from the digest cron at 06:00.
    return;
  }

  console.log(`[nurture] processing ${due_rows.length} due row(s) (cap ${MAX_PER_TICK})`);

  let sent = 0;
  let failed = 0;
  for (const row of due_rows) {
    try {
      await processRow(env, row, now);
      sent += 1;
    } catch (err) {
      failed += 1;
      console.warn(`[nurture] row ${row.id} (${row.lead_id}) failed: ${(err as Error).message}`);
      await logEvent(env, {
        type: "cron.completed",
        ref_id: `worker/nurture/${row.id}`,
        status: "failed",
        metadata: {
          outcome: "row_failed",
          lead_id: row.lead_id,
          step: row.next_step,
          vertical: row.vertical,
          error: (err as Error).message.slice(0, 200),
        },
      }).catch(() => undefined);
    }
  }

  const duration_ms = Date.now() - start;
  await logEvent(env, {
    type: "cron.completed",
    ref_id: "worker/nurture",
    status: failed === 0 ? "ok" : "failed",
    metadata: {
      outcome: "batch_done",
      due: due_rows.length,
      sent,
      failed,
      duration_ms,
    },
  }).catch(() => undefined);
}

async function processRow(env: Env, row: NurtureRow, now: Date): Promise<void> {
  const step = row.next_step;
  if (step === "done") {
    return; // Defensive — shouldn't be in `due` query result.
  }

  const { subject, body_text, body_html } = await composeEmail(env, row, step);

  if (!body_text && !body_html) {
    throw new Error(`composer for step=${step} vertical=${row.vertical} returned empty`);
  }

  // Build List-Unsubscribe header for one-click opt-out (RFC 8058).
  const unsubUrl =
    `${env.OPS_LOG_URL?.replace(/\/api\/ops\/log$/, "") ?? "https://bizlegal-ai.com"}` +
    `/api/email/unsubscribe?lead_id=${encodeURIComponent(row.lead_id)}`;
  const result = await sendEmail(env, {
    to: row.email,
    subject,
    text: body_text,
    html: body_html,
    // D7 INTEGRATION-V3 W-6 fix: Resend Idempotency-Key collapses
    // a Resend retry (e.g. transient 5xx after the server already
    // accepted the message) to a single delivery rather than a
    // double-send.
    idempotencyKey: `nurture-${row.id}-${step}`,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>, <mailto:unsubscribe@intelligence.bizlegal-ai.com>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (!result.ok) {
    throw new Error(`resend send failed: ${result.error ?? "unknown"}`);
  }

  // Advance state. If this was last_call, archive instead.
  const isLast = step === "last_call";
  if (isLast) {
    await archive({ env }, row.id, "completed");
  } else {
    const next = NEXT_STEP[step];
    const next_send_at = new Date(now.getTime() + STEP_DELAYS[next] * 86400_000);
    await advance({ env }, row.id, {
      next_step: next,
      next_send_at: next_send_at.toISOString(),
      last_sent_at: now.toISOString(),
      emails_sent: row.emails_sent + 1,
    });
  }

  await logEvent(env, {
    type: "nurture.email.sent",
    ref_id: `worker/nurture/${row.id}`,
    status: "ok",
    metadata: {
      lead_id: row.lead_id,
      step,
      vertical: row.vertical,
      next_step: isLast ? "done" : NEXT_STEP[step],
      emails_sent: row.emails_sent + 1,
    },
  }).catch(() => undefined);
}

// ── Composer ──────────────────────────────────────────────────────
// Single Haiku-driven path for all 4 steps. The system prompt + step
// brief live in nurture-prompts.ts. If Haiku fails, we fall back to
// a hand-written welcome ONLY for step=welcome (so the very first
// touch always lands); other steps re-throw so the row retries on
// the next cron tick.

interface ComposedEmail {
  readonly subject: string;
  readonly body_text: string;
  readonly body_html: string;
}

interface HaikuEmailJson {
  readonly subject?: unknown;
  readonly body_text?: unknown;
  readonly body_html?: unknown;
}

async function composeEmail(
  env: Env,
  row: NurtureRow,
  step: Exclude<NurtureStep, "done">,
): Promise<ComposedEmail> {
  if (!env.ANTHROPIC_API_KEY) {
    if (step === "welcome") return fallbackWelcome(row.vertical);
    throw new Error(
      `ANTHROPIC_API_KEY missing — cannot compose ${step} for row ${row.id}`,
    );
  }

  const userPrompt = buildUserPrompt({
    step,
    vertical: row.vertical,
    classification: row.lead_classification,
    source: row.source,
  });

  try {
    const result = await callHaikuJson<HaikuEmailJson>(env, {
      model: HAIKU_MODEL,
      system: NURTURE_SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 1024,
      temperature: 0.4,
      maxRetries: 2,
    });
    const data = result.data;
    const subject = typeof data.subject === "string" ? data.subject.trim() : "";
    const body_text = typeof data.body_text === "string" ? data.body_text.trim() : "";
    const body_html = typeof data.body_html === "string" ? data.body_html.trim() : "";
    if (!subject || !body_text || !body_html) {
      throw new Error(
        `Haiku returned incomplete email for ${step}/${row.vertical}: subject=${Boolean(subject)} text=${Boolean(body_text)} html=${Boolean(body_html)}`,
      );
    }
    // EVAL-NURTURE 2026-05-08 remediation #1: enforce hard rules at
    // runtime so a model that drifts past the system-prompt contract
    // gets caught before Resend send. Failure throws → cron retries.
    const violation = validateComposed({ step, subject, body_text, body_html });
    if (violation) {
      throw new Error(
        `compose contract violation for ${step}/${row.vertical}: ${violation}`,
      );
    }
    return { subject, body_text, body_html };
  } catch (err) {
    const detail = err instanceof AnthropicCallFailed ? err.message : String(err);
    console.warn(
      `[nurture] Haiku compose failed step=${step} vertical=${row.vertical} row=${row.id}: ${detail}`,
    );
    if (step === "welcome") {
      // Welcome must always send — fall back to a hand-written copy
      // so first-touch trust is preserved even when the model hiccups.
      return fallbackWelcome(row.vertical);
    }
    throw err;
  }
}

// Hard-rule guards. Returns null when the email passes contract,
// otherwise a short violation string for log/error context.
function validateComposed(args: {
  step: Exclude<NurtureStep, "done">;
  subject: string;
  body_text: string;
  body_html: string;
}): string | null {
  if (args.subject.length > 60) {
    return `subject too long (${args.subject.length} > 60)`;
  }
  if (/[A-Z]{6,}/.test(args.subject)) {
    return `subject has all-caps run`;
  }
  // Word count: 90-180 for steps 1-3, 60-120 for last_call.
  const wordCount = args.body_text.split(/\s+/).filter(Boolean).length;
  const [minWords, maxWords] =
    args.step === "last_call" ? [60, 120] : [90, 180];
  if (wordCount < minWords || wordCount > maxWords) {
    return `body word count ${wordCount} outside ${minWords}-${maxWords}`;
  }
  // Single-anchor rule: exactly one <a href> in body_html.
  const anchorMatches = args.body_html.match(/<a\s[^>]*href=/gi) ?? [];
  if (anchorMatches.length !== 1) {
    return `body_html has ${anchorMatches.length} anchors, expected 1`;
  }
  // No-law-firm guard. Conservative — flags exact phrases the system
  // prompt explicitly forbids; the prompt is the primary defense.
  const forbidden = /\b(legal advice|your lawyer|attorney-client|we represent (?:you|your))\b/i;
  if (forbidden.test(args.body_text) || forbidden.test(args.body_html)) {
    return `body contains forbidden law-firm-claim phrase`;
  }
  return null;
}

function fallbackWelcome(vertical: NurtureVertical): ComposedEmail {
  const ctx = contextFor(vertical);
  const productLink = ctx.product_url;
  const productName = ctx.product_name;
  const subject = `Quick thanks for trying ${productName}`;
  const text = [
    `Hi,`,
    ``,
    `Thanks for checking out ${productName}. Quick context on what we do and what to expect over the next few days:`,
    ``,
    `1. ${productName} runs a baseline scan / audit on ${ctx.regulator_focus}. You'll see the preview shortly if you haven't already.`,
    `2. The full report (citations, risk scoring, regulator-by-regulator breakdown) unlocks behind a one-time fee — link below.`,
    `3. Over the next week I'll send you 3 short emails: an explainer of the regulation that applies to your scenario, an honest comparison vs other approaches, and a final ping with any updates.`,
    ``,
    `If any of that's the wrong cadence, hit unsubscribe at the bottom and you'll never hear from me again. No hard feelings.`,
    ``,
    `Full report: ${productLink}`,
    ``,
    `— BizLegal-AI`,
    ``,
    `(Reply to this email if you want to talk to a human first. We do read these.)`,
  ].join("\n");
  const html = [
    `<p>Hi,</p>`,
    `<p>Thanks for checking out <strong>${productName}</strong>. Quick context on what we do and what to expect over the next few days:</p>`,
    `<ol>`,
    `<li>${productName} runs a baseline scan / audit on ${ctx.regulator_focus}. You'll see the preview shortly if you haven't already.</li>`,
    `<li>The full report (citations, risk scoring, regulator-by-regulator breakdown) unlocks behind a one-time fee — link below.</li>`,
    `<li>Over the next week I'll send you 3 short emails: an explainer of the regulation that applies to your scenario, an honest comparison vs other approaches, and a final ping with any updates.</li>`,
    `</ol>`,
    `<p>If any of that's the wrong cadence, hit unsubscribe at the bottom and you'll never hear from me again. No hard feelings.</p>`,
    `<p><a href="${productLink}" style="display:inline-block;background:#0a2540;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">View the full report →</a></p>`,
    `<p style="margin-top:24px;color:#444;">— BizLegal-AI</p>`,
    `<p style="font-size:12px;color:#888;">(Reply to this email if you want to talk to a human first. We do read these.)</p>`,
  ].join("\n");
  return { subject, body_text: text, body_html: html };
}

// (vertical → product URL/label has moved to nurture-prompts.ts as
// VERTICAL_CONTEXTS / contextFor — keeps single source of truth.)
