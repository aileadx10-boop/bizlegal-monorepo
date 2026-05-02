import type { Env } from "./types";
import type { JurisdictionSnapshot } from "./reports";

const RESEND_URL = "https://api.resend.com/emails";

export interface SendEmailResult {
  readonly ok: boolean;
  readonly id?: string;
  readonly error?: string;
}

export interface EmailAttachment {
  readonly filename: string;
  readonly content: string; // base64
  readonly contentType?: string;
}

export async function sendSnapshotEmail(
  env: Env,
  snap: JurisdictionSnapshot,
  attachments: readonly EmailAttachment[] = []
): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY) {
    console.log("[resend] RESEND_API_KEY not set; skipping email delivery");
    return { ok: false, error: "resend_not_configured" };
  }
  const from = env.RESEND_FROM ?? "BizLegal-AI <team@intelligence.bizlegal-ai.com>";
  const replyTo = env.RESEND_REPLY_TO ?? "team@bizlegal-ai.com";
  const to = snap.request.email;
  const subject = `Your Jurisdiction Risk Snapshot — ${snap.request.jurisdiction_codes.join(" vs ")}`;
  const html = renderSnapshotEmail(snap);

  const body: Record<string, unknown> = {
    from,
    to,
    subject,
    html,
    reply_to: replyTo
  };
  if (attachments.length > 0) {
    body.attachments = attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      content_type: a.contentType ?? "application/octet-stream"
    }));
  }

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => "<unreadable>")).slice(0, 300);
    console.warn(`[resend] send failed ${res.status}: ${detail}`);
    return { ok: false, error: `${res.status}: ${detail}` };
  }
  const respBody = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: respBody.id };
}

function esc(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSnapshotEmail(snap: JurisdictionSnapshot): string {
  const r = snap.request;
  const [a, b] = snap.jurisdictions;
  const trades = snap.side_by_side?.key_tradeoffs ?? [];
  const verdict = snap.side_by_side?.verdict ?? "See full report for verdict.";
  const cited = (snap.citations ?? []).filter(
    (c) => c.url && !/^null$/i.test(c.url) && /^https?:\/\//i.test(c.url)
  );

  const jurisdictionBlock = (j: typeof a | undefined): string => {
    if (!j) return "";
    const enforcement = j.recent_enforcement
      .slice(0, 3)
      .map(
        (e) =>
          `<li><strong>${esc(e.date)}</strong> — ${esc(e.actor)}: ${esc(e.summary)}${e.penalty ? ` (${esc(e.penalty)})` : ""}</li>`
      )
      .join("");
    const deadlines = j.upcoming_deadlines
      .slice(0, 3)
      .map((d) => `<li><strong>${esc(d.date)}</strong> — ${esc(d.requirement)}</li>`)
      .join("");

    return `
<div style="background:#fff;border:1px solid #e5e5ef;border-radius:12px;padding:20px;margin-bottom:16px;">
  <h3 style="margin:0 0 10px;font-size:18px;color:#0e0b1a;">${esc(j.display_name)} <span style="color:#6d28d9;font-size:13px;font-weight:600;">(${esc(j.code)})</span></h3>
  <p style="margin:0 0 12px;color:#4a4458;font-size:14px;"><strong>Posture:</strong> ${esc(j.posture.label)} — ${esc(j.posture.rationale)}</p>
  <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13px;color:#0e0b1a;">
    <tr><td style="padding:6px 0;width:40%;color:#6b6580;">Licensing</td><td style="padding:6px 0;">${esc(j.licensing.required_licenses.join(", "))} — ${esc(j.licensing.regulator)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b6580;">Timeline</td><td style="padding:6px 0;">${esc(j.licensing.typical_timeline)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b6580;">Cost</td><td style="padding:6px 0;">${esc(j.licensing.typical_cost_usd)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b6580;">Corp tax</td><td style="padding:6px 0;">${esc(j.tax_summary.corporate_rate)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b6580;">Banking</td><td style="padding:6px 0;">${esc(j.banking_accessibility.rating)} — ${esc(j.banking_accessibility.notes)}</td></tr>
  </table>
  ${enforcement ? `<p style="margin:14px 0 6px;font-size:13px;color:#6b6580;"><strong>Recent enforcement:</strong></p><ul style="margin:0;padding-left:18px;font-size:13px;color:#0e0b1a;">${enforcement}</ul>` : ""}
  ${deadlines ? `<p style="margin:14px 0 6px;font-size:13px;color:#6b6580;"><strong>Upcoming deadlines:</strong></p><ul style="margin:0;padding-left:18px;font-size:13px;color:#0e0b1a;">${deadlines}</ul>` : ""}
</div>`;
  };

  const tradeoffsHtml = trades
    .map((t) => `<li style="margin-bottom:6px;">${esc(t)}</li>`)
    .join("");
  const citationsHtml =
    cited.length > 0
      ? `<h3 style="font-size:15px;color:#6b6580;margin:24px 0 8px;">Sources</h3>
<ul style="margin:0;padding-left:18px;font-size:13px;color:#0e0b1a;">${cited
          .map(
            (c) =>
              `<li><a href="${esc(c.url)}" style="color:#5b21b6;">${esc(c.label)}</a></li>`
          )
          .join("")}</ul>`
      : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"/><title>${esc(subject(snap))}</title></head>
<body style="margin:0;background:#f8f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0b1a;">
<table role="presentation" style="width:100%;background:#f8f7ff;" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" style="max-width:640px;width:100%;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:20px;">
        <div style="display:inline-block;width:8px;height:8px;background:#5b21b6;border-radius:50%;vertical-align:middle;margin-right:8px;"></div>
        <span style="font-size:16px;font-weight:800;color:#0e0b1a;">BizLegal-AI</span>
      </td></tr>
      <tr><td>
        <h1 style="font-size:28px;font-weight:900;line-height:1.15;margin:0 0 12px;color:#0e0b1a;letter-spacing:-0.02em;">Your Jurisdiction Risk Snapshot</h1>
        <p style="margin:0 0 20px;color:#6b6580;font-size:15px;">${esc(a?.display_name ?? "?")} vs ${esc(b?.display_name ?? "?")} for: <em>${esc(r.activity)}</em></p>

        <div style="background:linear-gradient(135deg,#5b21b6 0%,#ec4899 100%);color:#fff;padding:24px;border-radius:16px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;opacity:0.85;">Verdict</p>
          <p style="margin:0;font-size:16px;font-weight:600;line-height:1.45;">${esc(verdict)}</p>
          ${snap.side_by_side?.winner_code ? `<p style="margin:12px 0 0;font-size:13px;opacity:0.85;">Winner for this activity: <strong>${esc(snap.side_by_side.winner_code)}</strong></p>` : ""}
        </div>

        ${tradeoffsHtml ? `<h3 style="font-size:15px;color:#6b6580;margin:24px 0 8px;">Key tradeoffs</h3><ul style="margin:0;padding-left:18px;font-size:14px;color:#0e0b1a;">${tradeoffsHtml}</ul>` : ""}

        <h3 style="font-size:15px;color:#6b6580;margin:24px 0 12px;">Side-by-side</h3>
        ${jurisdictionBlock(a)}
        ${jurisdictionBlock(b)}

        ${citationsHtml}

        <div style="background:#ede9fe;border-radius:12px;padding:20px;margin:28px 0 16px;">
          <p style="margin:0 0 12px;font-size:14px;color:#0e0b1a;">Want the full Intelligence Report? 40 pages, court-grade citations, licensed-regulator-by-regulator, white-glove.</p>
          <a href="https://app.bizlegal-ai.com/enterprise" style="display:inline-block;background:#5b21b6;color:#fff;padding:10px 22px;border-radius:50px;font-weight:700;text-decoration:none;font-size:14px;">Talk to our team →</a>
        </div>

        <p style="font-size:12px;color:#6b6580;margin:24px 0 8px;">Disclaimer: This snapshot is general guidance produced by BizLegal-AI's intelligence pipeline. It is not legal, financial, or tax advice. Consult qualified counsel for specific situations.</p>
        <p style="font-size:11px;color:#8b8599;margin:0;">Snapshot ID: ${esc(snap.snapshot_id)} · Generated ${esc(snap.requested_at.slice(0, 10))} · BizLegal-AI FZE, DMCC Crypto Centre, Dubai</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function subject(snap: JurisdictionSnapshot): string {
  return `Your Jurisdiction Risk Snapshot — ${snap.request.jurisdiction_codes.join(" vs ")}`;
}
