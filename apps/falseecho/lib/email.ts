import { Resend } from 'resend'

// Lazy init — avoids "Missing API key" crash during Vercel build (env not available at bundle time)
function getResend() { return new Resend(process.env.RESEND_API_KEY) }
const FROM = process.env.RESEND_FROM ?? 'reports@bizlegal-ai.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falseecho.bizlegal-ai.com'

export async function sendReportReady(params: {
  to: string
  scanRef: string
  entity: string
  score: number
  flagsCount: number
}) {
  const { to, scanRef, entity, score, flagsCount } = params
  const reportUrl = `${SITE}/report/${scanRef}`

  await getResend().emails.send({
    from: `FalseEcho <${FROM}>`,
    to,
    subject: `Your FalseEcho evidence pack is ready — ${scanRef}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 22px; font-weight: 500; letter-spacing: 0.12em; margin-bottom: 32px;">
      False<span style="color: #d4a843;">Echo</span>
    </div>

    <div style="background: #0d1118; border: 1px solid #1a2035; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <div style="font-family: monospace; font-size: 11px; color: #5a6278; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px;">Evidence Pack Ready</div>
      <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #e8ecf4; margin: 0 0 16px;">
        Your AI-falsehood audit is complete.
      </h1>
      <p style="font-size: 14px; color: #5a6278; line-height: 1.7; margin: 0 0 24px;">
        We probed the major AI answer engines for claims about
        <strong style="color: #d4a843;">${entity}</strong>. Every captured
        response is hash-anchored (SHA-256 + UTC timestamp + sequence) in
        your evidence pack.
      </p>

      <div style="background: #111622; border: 1px solid #1a2035; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 20px;">
        <div>
          <div style="font-family: monospace; font-size: 10px; color: #5a6278; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px;">Exposure Score</div>
          <div style="font-family: monospace; font-size: 32px; font-weight: 500; color: ${score >= 60 ? '#c0392b' : score >= 30 ? '#e67e22' : score > 0 ? '#f39c12' : '#27ae60'};">${score}</div>
        </div>
        <div style="border-left: 1px solid #1a2035; padding-left: 20px;">
          <div style="font-family: monospace; font-size: 10px; color: #5a6278; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px;">Flagged Answers</div>
          <div style="font-size: 18px; font-weight: 600; color: ${flagsCount > 0 ? '#c0392b' : '#27ae60'};">${flagsCount}</div>
        </div>
      </div>

      <a href="${reportUrl}" style="display: block; text-align: center; padding: 14px; background: #d4a843; color: #07090e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
        View Evidence Pack →
      </a>
    </div>

    <p style="font-size: 11px; color: #2e3450; font-family: monospace; line-height: 1.7; text-align: center;">
      FalseEcho · ${SITE}<br>
      We publish signals, you decide. This pack states facts and sources — it is not legal advice and makes no defamation determination.<br>
      Reviewed pipeline: automated capture, human review available on request.<br>
      Scan ref: ${scanRef}
    </p>
  </div>
</body>
</html>`,
  })
}

/**
 * Monitor-tier daily alert — sent by /api/cron/monitor when a re-scan flags
 * a falsehood that the entity's previous scan did not flag. Carries the
 * hash-anchored evidence references and links the full report page.
 */
export async function sendMonitorAlert(params: {
  to: string
  entity: string
  scanRef: string
  score: number
  newFlags: Array<{
    engine: string
    prompt: string
    narrative: string | null
    flag_terms: string[] | null
    sha256: string
  }>
}) {
  const { to, entity, scanRef, score, newFlags } = params
  const reportUrl = `${SITE}/report/${scanRef}`

  const flagRows = newFlags
    .map(
      (f) => `
      <div style="border: 1px solid #1a2035; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; background: #111622;">
        <div style="font-family: monospace; font-size: 10px; color: #d4a843; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px;">${f.engine}</div>
        <div style="font-size: 12px; color: #5a6278; margin-bottom: 8px;">Probe: "${f.prompt.slice(0, 140)}"</div>
        <div style="font-size: 13px; color: #e8ecf4; line-height: 1.6; margin-bottom: 8px;">
          ${f.narrative ?? `Flagged terms: ${(f.flag_terms ?? []).join(', ')}`}
        </div>
        <div style="font-family: monospace; font-size: 10px; color: #2e3450; word-break: break-all;">evidence sha256: ${f.sha256}</div>
      </div>`,
    )
    .join('')

  await getResend().emails.send({
    from: `FalseEcho <${FROM}>`,
    to,
    subject: `New falsehood detected about ${entity}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 22px; font-weight: 500; letter-spacing: 0.12em; margin-bottom: 32px;">
      False<span style="color: #d4a843;">Echo</span>
    </div>

    <div style="background: #0d1118; border: 1px solid #1a2035; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <div style="font-family: monospace; font-size: 11px; color: #c0392b; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px;">Monitor Alert</div>
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 700; color: #e8ecf4; margin: 0 0 16px;">
        New falsehood detected about ${entity}
      </h1>
      <p style="font-size: 14px; color: #5a6278; line-height: 1.7; margin: 0 0 24px;">
        Today's scheduled re-scan flagged <strong style="color: #c0392b;">${newFlags.length}</strong>
        new suspected falsehood${newFlags.length === 1 ? '' : 's'} that your previous scan did not flag.
        Current exposure score: <strong style="color: #d4a843;">${score}</strong>/100.
        Each captured response is hash-anchored (SHA-256 + UTC timestamp) in your evidence trail.
      </p>

      ${flagRows}

      <a href="${reportUrl}" style="display: block; text-align: center; padding: 14px; background: #d4a843; color: #07090e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; margin-top: 8px;">
        View Full Report →
      </a>
    </div>

    <p style="font-size: 11px; color: #2e3450; font-family: monospace; line-height: 1.7; text-align: center;">
      FalseEcho · ${SITE}<br>
      We publish signals, you decide. These are heuristic signals, not verdicts — this alert states facts and sources, is not legal advice, and makes no defamation determination.<br>
      Scan ref: ${scanRef}
    </p>
  </div>
</body>
</html>`,
  })
}

/**
 * Sent when a hub apex checkout (bizlegal-ai.com/checkout?product=falseecho)
 * completes: we know the buyer's email + tier but not the entity yet, so
 * the email drives them to the intake form to claim the paid scan.
 */
export async function sendIntakeEmail(params: {
  to: string
  tier: string
  orderId: string
}) {
  const { to, tier, orderId } = params
  const intakeUrl = `${SITE}/scan?order=${encodeURIComponent(orderId)}`

  await getResend().emails.send({
    from: `FalseEcho <${FROM}>`,
    to,
    subject: `Your FalseEcho ${tier} purchase — tell us who to scan`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 20px; margin-bottom: 24px;">False<span style="color: #d4a843;">Echo</span></div>
    <h2 style="font-family: Georgia, serif; font-size: 22px; color: #e8ecf4; margin-bottom: 12px;">Payment confirmed — one step left.</h2>
    <p style="font-size: 14px; color: #5a6278; margin-bottom: 20px; line-height: 1.7;">
      Your FalseEcho <strong style="color: #d4a843;">${tier}</strong> purchase is confirmed
      (order <span style="font-family: monospace;">${orderId}</span>).
      Tell us the name, firm, or person to scan and we start the 4-engine probe battery.
    </p>
    <a href="${intakeUrl}" style="display: inline-block; padding: 12px 28px; background: #d4a843; color: #07090e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
      Start my scan →
    </a>
    <p style="font-size: 11px; color: #2e3450; font-family: monospace; margin-top: 24px;">FalseEcho · We publish signals, you decide. Not legal advice.</p>
  </div>
</body>
</html>`,
  })
}
