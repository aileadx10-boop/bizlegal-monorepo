/**
 * Shared certificate-generation helper. Used by both webhooks:
 * - /api/certificates/webhook (NOWPayments crypto IPN)
 * - /api/certificates/paypal/capture (PayPal return-url capture)
 *
 * Generates the rationale via Sonnet with PII redaction applied,
 * inserts the certificate row, marks the matter as attested, and emits
 * the Resend confirmation email.
 *
 * REVENUE+LIABILITY framing: rationale is generated AFTER PII redaction
 * (lib/safe/redact.ts). Output frames as audit-ready intelligence, not
 * legal advice or a verdict on the work product.
 */

import { redactFields } from '@/lib/safe/redact'
import { sendEmail, certReadyHtml } from '@/lib/email'
import { logEventAsync } from '@/lib/ops/log'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface CertIntent {
  order_id: string
  cert_id: string
  matter_id: string
  form_data: {
    lawyer?: string
    prompt?: string
    edits?: string
    partner?: string
    ai_tool?: string
    _email?: string
    _gateway?: 'nowpayments' | 'paypal'
  }
  payment_status: string
}

export interface GenerateInput {
  supabase: SupabaseClient
  intent: CertIntent
  amountUsd: number
  gatewayPaymentId: string
  gateway: 'nowpayments' | 'paypal'
  /** Site URL used to build the cert link in the email. */
  siteUrl: string
}

export interface GenerateResult {
  ok: boolean
  cert_url?: string
  email_sent?: boolean
  email_error?: string
  redactions?: number
}

export async function generateCertificateFromIntent(input: GenerateInput): Promise<GenerateResult> {
  const { supabase, intent, amountUsd, gatewayPaymentId, gateway, siteUrl } = input
  const form = intent.form_data
  const { matter_id, cert_id } = intent

  // Fetch matter
  const { data: matter } = await supabase
    .from('matters')
    .select('title, ai_tool')
    .eq('id', matter_id)
    .single()

  // ── Safe — redact PII before any AI call
  const matterRedaction = redactFields(
    { title: typeof matter?.title === 'string' ? matter.title : '' },
    ['title'],
  )
  const formRedaction = redactFields(
    {
      prompt: typeof form.prompt === 'string' ? form.prompt : '',
      edits: typeof form.edits === 'string' ? form.edits : '',
    },
    ['prompt', 'edits'],
  )
  const totalRedacted = matterRedaction.total + formRedaction.total
  const safeTitle = matterRedaction.redacted.title
  const safePrompt = formRedaction.redacted.prompt
  const safeEdits = formRedaction.redacted.edits

  // Generate Sonnet rationale (post-redaction)
  let summary = ''
  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system:
          'You are a regulatory-intelligence assistant for LexAudit. Generate a concise process-attestation rationale (3-4 sentences) for a Compliance Health Score snapshot. Describe what the AI was used for, what human oversight was applied, and what risk mitigations were performed. Frame as audit-ready intelligence — not legal advice and not a verdict on the underlying work product. Formal English, prose only, no bullet points. The matter title and prompt may contain PII placeholders (e.g. [PII:EMAIL]) — treat them as faithful structure but do not reconstruct values.',
        messages: [
          {
            role: 'user',
            content: `Document: ${safeTitle || 'Matter'}\nAI Tool: ${form.ai_tool || matter?.ai_tool || ''}\nPrompt: ${safePrompt}\nHuman edits: ${safeEdits || 'None recorded'}\nResponsible lawyer: ${form.lawyer ?? ''}\nReviewing partner: ${form.partner ?? 'Not specified'}`,
          },
        ],
      }),
    })
    const aiData = (await aiRes.json()) as { content?: Array<{ text?: string }> }
    summary = aiData.content?.[0]?.text ?? ''
  } catch (e) {
    console.error('[cert/generate] anthropic error:', e)
  }
  if (!summary) {
    summary =
      'AI-assisted drafting was performed under direct lawyer supervision. The responsible lawyer reviewed AI outputs for accuracy and potential hallucinations prior to use. Human edits were applied. This is a process-attestation snapshot — regulatory intelligence, not legal advice and not a verdict on the underlying work product.'
  }

  // Insert certificate
  await supabase.from('certificates').insert({
    matter_id,
    cert_id,
    summary,
    lawyer: form.lawyer ?? null,
    partner: form.partner ?? null,
    payment_status: 'paid',
    payment_id: String(gatewayPaymentId),
    amount_paid: Math.round(amountUsd * 100),
    generated_at: new Date().toISOString(),
  })

  await supabase.from('matters').update({ status: 'attested' }).eq('id', matter_id)
  await supabase
    .from('cert_payment_intents')
    .update({ payment_status: 'paid', nowpayments_payment_id: String(gatewayPaymentId) })
    .eq('order_id', intent.order_id)

  const certUrl = `${siteUrl}/certificate/${cert_id}`

  // Resend cert-ready email (non-fatal)
  let emailSent = false
  let emailError: string | undefined
  const recipient = form._email
  if (recipient && /^\S+@\S+\.\S+$/.test(recipient)) {
    const r = await sendEmail({
      to: recipient,
      subject: `LexAudit Health Score · ${cert_id}`,
      html: certReadyHtml({
        certId: cert_id,
        certUrl,
        matterTitle: matter?.title ?? 'Matter',
        lawyerName: form.lawyer ?? 'Lawyer',
        partnerName: form.partner ?? null,
        amountUsd,
        gateway,
      }),
    })
    emailSent = r.ok
    if (!r.ok) emailError = r.error
  }

  console.log(
    `[cert/generate] cert=${cert_id} gateway=${gateway} amount=${amountUsd} redactions=${totalRedacted} email=${emailSent ? 'sent' : 'skipped/failed'}${emailError ? ' (' + emailError + ')' : ''}`,
  )

  // Surface to /ops dashboard
  logEventAsync({
    type: 'cert.released',
    source: 'lexaudit',
    ref_id: cert_id,
    email: recipient || undefined,
    amount_cents: Math.round(amountUsd * 100),
    status: 'ok',
    metadata: {
      gateway,
      matter_id,
      lawyer: form.lawyer,
      partner: form.partner,
      pii_redactions: totalRedacted,
      email_sent: emailSent,
    },
  })
  if (recipient && emailSent) {
    logEventAsync({
      type: 'email.sent',
      source: 'lexaudit',
      ref_id: cert_id,
      email: recipient,
      status: 'ok',
      metadata: { kind: 'cert-ready', subject: `LexAudit Health Score · ${cert_id}` },
    })
  }

  return {
    ok: true,
    cert_url: certUrl,
    email_sent: emailSent,
    email_error: emailError,
    redactions: totalRedacted,
  }
}
