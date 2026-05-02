import type { Env, LeadProfile } from "./types";

const TELEGRAM_BASE = "https://api.telegram.org";

export async function notifyLead(env: Env, profile: LeadProfile): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    // Creds not configured yet - skip silently. Pipeline still completes.
    console.log("[telegram] skipped (creds not configured)");
    return;
  }

  const notifyThreshold = Number(env.NOTIFY_SCORE_THRESHOLD ?? "7");
  const score = profile.qualification?.overall_score ?? 0;
  if (score < notifyThreshold) {
    console.log(`[telegram] below threshold (${score} < ${notifyThreshold}), skipping`);
    return;
  }

  const text = renderLeadTelegram(profile);
  await sendTelegram(env, text);
}

export async function notifyDlq(env: Env, error: unknown, payload: unknown): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const text = [
    "*⚠️ Lead Intake DLQ*",
    "",
    `*Error class:* ${escapeMd(errClass(error))}`,
    `*Error:* ${escapeMd(errMessage(error).slice(0, 300))}`,
    "",
    escapeMd("See GitHub bizlegal-ea/outputs/dlq/ for the dropped payload.")
  ].join("\n");
  await sendTelegram(env, text);
}

async function sendTelegram(env: Env, text: string): Promise<void> {
  const url = `${TELEGRAM_BASE}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: env.TELEGRAM_CHAT_ID,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "<unreadable>");
    console.warn(`[telegram] send failed ${res.status}: ${detail.slice(0, 300)}`);
  }
}

function renderLeadTelegram(profile: LeadProfile): string {
  const q = profile.qualification;
  const bullets = profile.summary_bullets ?? [];
  // Build plain strings first; escape EVERYTHING once when inserting into the template.
  // This avoids missed escapes (e.g. hyphens in dates/IDs).
  const scoreLabel = q
    ? `${q.overall_score}/10 (${q.recommended_action.replace(/_/g, " ")})`
    : "unscored";
  const datePart = profile.received_at.slice(0, 10);
  const shortId = profile.lead_id.slice(0, 8);
  const ghPath = `bizlegal-ea/lead_profiles/${datePart}-${shortId}.md`;
  const lines = [
    `*🔥 New Lead — ${escapeMd(scoreLabel)}*`,
    "",
    `*${escapeMd(profile.contact.full_name)}* · ${escapeMd(profile.contact.email ?? "no email")}`,
    `${escapeMd(profile.company?.name ?? "unknown company")} · ${escapeMd(q?.vertical ?? "-")}`,
    "",
    ...bullets.map((b) => `• ${escapeMd(b)}`),
    "",
    `_Lead ID: ${escapeMd(shortId)}_`,
    `_GitHub: ${escapeMd(ghPath)}_`
  ];
  return lines.join("\n");
}

// Telegram MarkdownV2 requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
// See https://core.telegram.org/bots/api#markdownv2-style
function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

function errClass(e: unknown): string {
  if (e instanceof Error) return e.name;
  return typeof e;
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e).slice(0, 500);
}
