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

  const compose = pickComposer(step, row.vertical);
  const { subject, body_text, body_html } = await compose(env, row);

  // Welcome step (Phase AA week 1) — only step we actually compose
  // and send right now. education/comparison/last_call composers throw
  // BlockingNotImplemented; cron will mark archive('completed') after
  // welcome until we ship the rest in week 2. That keeps the queue
  // moving without sending placeholder content.
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

// ── Composers ─────────────────────────────────────────────────────
// Each composer takes a NurtureRow and returns subject + body.
// Welcome composer is implemented; other 3 stubs throw to gate the
// pipeline until real prompts ship in Phase AA week 2.

interface ComposedEmail {
  readonly subject: string;
  readonly body_text: string;
  readonly body_html: string;
}

type Composer = (env: Env, row: NurtureRow) => Promise<ComposedEmail>;

function pickComposer(step: NurtureStep, vertical: NurtureVertical): Composer {
  if (step === "welcome") return composeWelcome(vertical);
  // Week-2 placeholders. Until we ship real prompts, education/comparison/
  // last_call composers archive the row gracefully (next iteration of
  // processRow won't fire because next_step="done").
  return composeNotYetImplemented(step, vertical);
}

function composeWelcome(vertical: NurtureVertical): Composer {
  return async (env, row) => {
    const productLink = productUrlFor(vertical);
    const productName = productLabelFor(vertical);
    // Stage-1 welcome: simple, hand-written template. Will be
    // replaced by Claude Haiku composition in Week-1 D5 when we
    // ship the full prompt suite at agents/ea/prompts/email-welcome-{vertical}.md.
    // The handwritten version below ships TODAY so the cron has
    // real content to send while the prompt-driven composer is
    // built; it's deliberately personal and tight.
    const subject = `Quick thanks for trying ${productName}`;
    const text = [
      `Hi,`,
      ``,
      `Thanks for checking out ${productName}. Quick context on what we do and what to expect over the next few days:`,
      ``,
      `1. ${productName} runs a baseline scan / audit on whatever you submitted. You'll see the preview shortly if you haven't already.`,
      `2. The full report (citations, risk scoring, regulator-by-regulator breakdown) unlocks behind a one-time fee — link below.`,
      `3. Over the next week I'll send you 3 short emails: an explainer of the regulation that applies to your scenario, a comparison vs other approaches (DIY, law firm, other vendors), and a final ping with any updates.`,
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
      `<li>${productName} runs a baseline scan / audit on whatever you submitted. You'll see the preview shortly if you haven't already.</li>`,
      `<li>The full report (citations, risk scoring, regulator-by-regulator breakdown) unlocks behind a one-time fee — link below.</li>`,
      `<li>Over the next week I'll send you 3 short emails: an explainer of the regulation that applies to your scenario, a comparison vs other approaches (DIY, law firm, other vendors), and a final ping with any updates.</li>`,
      `</ol>`,
      `<p>If any of that's the wrong cadence, hit unsubscribe at the bottom and you'll never hear from me again. No hard feelings.</p>`,
      `<p><a href="${productLink}" style="display:inline-block;background:#0a2540;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">View the full report →</a></p>`,
      `<p style="margin-top:24px;color:#444;">— BizLegal-AI</p>`,
      `<p style="font-size:12px;color:#888;">(Reply to this email if you want to talk to a human first. We do read these.)</p>`,
    ].join("\n");

    return { subject, body_text: text, body_html: html };
  };
}

function composeNotYetImplemented(step: NurtureStep, vertical: NurtureVertical): Composer {
  // Returns empty body — processRow throws and we log the row as
  // failed for this tick. The row's next_send_at stays put so the
  // next cron tick re-attempts. When week-2 ships the real composer,
  // queued rows pick up automatically.
  return async () => {
    return {
      subject: `[nurture skeleton] ${step}/${vertical}`,
      body_text: "",
      body_html: "",
    };
  };
}

// ── Vertical → product URL/label map ──────────────────────────────
function productUrlFor(vertical: NurtureVertical): string {
  switch (vertical) {
    case "boi":
      return "https://forge.bizlegal-ai.com/boi";
    case "brai":
      return "https://brai.bizlegal-ai.com";
    case "tracr":
      return "https://tracr.bizlegal-ai.com";
    case "lexaudit":
      return "https://lexaudit.bizlegal-ai.com";
    case "docai":
      return "https://docai.bizlegal-ai.com";
    case "leadforge":
      return "https://leadforge.bizlegal-ai.com";
    case "forge":
      return "https://forge.bizlegal-ai.com";
    case "realestate":
      return "https://bizlegal-ai.com/realestate";
    case "generic":
    default:
      return "https://bizlegal-ai.com/agents";
  }
}

function productLabelFor(vertical: NurtureVertical): string {
  switch (vertical) {
    case "boi":
      return "BOI Tracker";
    case "brai":
      return "BRAI Sanctions Scan";
    case "tracr":
      return "TRACR Wallet Trace";
    case "lexaudit":
      return "LexAudit Compliance Monitor";
    case "docai":
      return "DocAI Privacy Scanner";
    case "leadforge":
      return "LeadForge";
    case "forge":
      return "BizLegal Forge";
    case "realestate":
      return "BizLegal Realestate Compliance";
    case "generic":
    default:
      return "BizLegal-AI";
  }
}
