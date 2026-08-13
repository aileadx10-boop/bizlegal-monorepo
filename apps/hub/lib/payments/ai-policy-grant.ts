import type { SupabaseClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

/**
 * AI Policy Generator write-through (W3-8, O-010).
 *
 * When a payment_orders row with product='ai_policy_generator' transitions to
 * active, the hub (the payment authority) flips the customer's latest draft in
 * ai_policy_drafts from 'draft' to 'paid' and emails the full policy — so a
 * paying customer gets the deliverable in real time, not only when they hit
 * the download link.
 *
 * Keyed by EMAIL (case-insensitive), NOT by id, on purpose: the wizard stores
 * the draft under the email the customer typed at generation time, which may
 * differ from the email on the payment order. We take the LATEST draft for
 * that email (created_at DESC) so a repeat buyer re-unlocks their most recent
 * policy. Belt and suspenders; never throws into the webhook flow.
 */
export async function grantAiPolicy(
  supabase: SupabaseClient,
  order: { product?: string | null; user_email?: string | null },
): Promise<void> {
  if (order.product !== 'ai_policy_generator') return
  const email = order.user_email
  if (!email) return

  try {
    const { data: draft, error } = await supabase
      .from('ai_policy_drafts')
      .select('id,policy_markdown,policy_title')
      .ilike('user_email', email)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('[ai-policy-grant] lookup failed:', error.message)
      return
    }
    if (!draft) {
      console.warn('[ai-policy-grant] no draft found for', email)
      return
    }

    const { error: updateError } = await supabase
      .from('ai_policy_drafts')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', draft.id)
    if (updateError) {
      console.warn('[ai-policy-grant] update failed:', updateError.message)
      return
    }

    // Email the policy. Non-fatal — the download link still works.
    try {
      await resend.emails.send({
        from: 'BizLegal AI <orders@intelligence.bizlegal-ai.com>',
        to: email,
        subject: `Your AI Usage Policy — ${draft.policy_title ?? 'Firm AI Usage Policy'}`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { background: #0e1322; color: #dee1f7; font-family: 'Manrope', sans-serif; margin: 0; padding: 0; }
.container { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
.logo { font-family: Georgia, serif; font-size: 22px; color: #dee1f7; margin-bottom: 32px; }
.logo span { color: #e9c349; }
h1 { font-family: Georgia, serif; font-size: 26px; color: #dee1f7; margin-bottom: 16px; line-height: 1.2; }
p { color: #c3c6d7; font-size: 14px; line-height: 1.65; margin-bottom: 16px; }
.btn { display: inline-block; background: #2563eb; color: #eeefff; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 8px 0; }
.divider { border: none; border-top: 0.5px solid #434655; margin: 24px 0; }
.footer { font-size: 11px; color: #8d90a0; }
.tag { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #e9c349; }
</style></head>
<body>
<div class="container">
  <div class="logo">BizLegal <span>•</span> AI</div>
  <span class="tag">AI Policy Generator · Delivered</span>
  <h1>Your firm-wide AI usage policy is ready.</h1>
  <p>Thank you for your purchase. Your policy draft is attached below and also available for download.</p>
  <p><strong style="color:#dee1f7;">Important:</strong> this is a <strong>template</strong>. An attorney must review and adopt it before your firm uses it. It is not legal advice and is not bar-approved.</p>
  <a href="https://bizlegal-ai.com/tools/ai-policy-generator" class="btn">Return to the Generator →</a>
  <hr class="divider"/>
  <p class="footer">BizLegal AI is software operated by DOR INNOVATIONS. Not a law firm; outputs are research, not legal advice.<br/>
  This email was sent to ${email}. <a href="https://bizlegal-ai.com/contact?subject=unsubscribe" style="color:#8d90a0;">Unsubscribe</a></p>
</div>
</body>
</html>`,
      })
    } catch (err) {
      console.warn('[ai-policy-grant] email failed:', err instanceof Error ? err.message : err)
    }
  } catch (err) {
    console.warn('[ai-policy-grant] threw:', err instanceof Error ? err.message : err)
  }
}
