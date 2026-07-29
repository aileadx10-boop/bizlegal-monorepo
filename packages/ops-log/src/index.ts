/**
 * Live ops events logger. Server-side only — uses Supabase service-role key.
 *
 * Every API route + cron handler should fire one of these on meaningful
 * events so the /ops dashboard sees them in real time.
 *
 * Failures are swallowed (logged, not thrown) — telemetry must never
 * break user flows.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type OpsEventType =
  // Payments
  | 'payment.intent'           // crypto invoice / paypal order created
  | 'payment.confirmed'        // webhook fired status=paid/active
  | 'payment.failed'
  | 'payment.refunded'
  // Subscriptions
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.cancelled'
  // Leads
  | 'lead.inbound'             // snapshot vertical classifier hit
  | 'lead.qualified'
  // Email
  | 'email.sent'
  | 'email.failed'
  // Crons
  | 'cron.fired'               // any cron handler fired
  | 'cron.completed'
  // Product surfaces
  | 'sqa.draft'                // DocAI SQA draft generated
  | 'dpa.negotiation'          // DocAI DPA negotiator generated
  | 'psp.audit'                // PSP & MoR Risk Manager audit generated
  | 'risk.analysis'            // Risk Engine deep analysis
  | 'risk.assessment'          // Risk Engine assessment (free)
  | 'jurisdiction.compare'     // Jurisdictions compare
  | 'snapshot.generated'       // Free snapshot lead magnet
  | 'cert.released'            // LexAudit certificate released
  | 'kb.uploaded'              // DocAI Firm-tier KB upload
  | 'framework.changed'        // LexAudit compliance monitor diff
  | 'boi.subscribed'           // CTA-2024 BOI Tracker subscription
  | 'boi.alert.sent'           // BOI deadline / rule-change alert sent
  // Referrals (OCI deal-router — asymmetric pillar)
  | 'referral.received'        // POST /lead — real-estate vertical lead arrived (jurisdiction + estimated_deal_value)
  | 'referral.routed'          // partner matched, dispatch sent (partner_id + match_score)
  | 'referral.responded'       // partner feedback received (engaged / declined)
  | 'referral.closed'          // deal closed; commission_usd computed
  | 'referral.paid'            // finder fee landed in BizLegal account
  | 'referral.alert'           // OCI Telegram-only paths mirrored to ops_log (V0.1)
  | 'referral.contract_email'  // OCI sent the lead a transparent referral-contract email (Phase AA D5)
  // Nurture machine (Phase AA V3)
  | 'nurture.email.sent'       // worker sent step N (welcome / education / comparison / last_call)
  | 'nurture.opt_out'          // user clicked one-click unsubscribe; row archived
  // Connection / monitoring (Phase V0)
  | 'routing.attempted'        // hub→OCI proxy attempt with status={ok|failed} + duration_ms
  | 'curation.action'          // Hetzner bot.py callback fired (pick / deploy / regen / reject)
  | 'heartbeat'                // long-running service heartbeat (curator bot/publisher every 5min)
  // V2 agents (Phase V1-V6)
  | 'aiact.classified'         // AI-Act risk-tier classification produced
  | 'policy.refreshed'         // privacy policy redline generated
  | 'legal.cite_audit'         // lawyer AI hallucination audit run
  | 'connect.threshold_crossed' // Stripe Connect 1099-K or state-MT trigger
  | 'mica.audit.generated'     // MiCA white paper audit produced
  | 'sdn.match_detected'       // OFAC SDN list match on a watched wallet
  | 'dao.recommendation'       // DAO wrapper-entity decision report
  | 'download.report'          // PDF/HTML download
  | 'report.generated'         // long-form report (TRACR forensic, BRAI, etc.)
  | 'agent.checkout'           // /agents AgentCheckoutButton clicked → start
  | 'webhook.received'         // any inbound webhook
  | 'error'                    // any unexpected error worth tracking
  // Phase RR — autonomous ops + revenue infrastructure (2026-05-21)
  | 'agent.run.completed'      // EA cron-triggered Claude task succeeded
  | 'agent.run.error'          // EA cron-triggered Claude task failed
  | 'gsc.submit.cron'          // services/gsc-bot weekly run summary
  | 'gsc.submit.manual'        // services/gsc-bot /run trigger summary
  | 'gsc.submit.error'         // services/gsc-bot runtime failure
  | 'content.published'        // Hetzner publisher.py committed an article
  | 'affiliate.signup'         // new affiliate code minted
  | 'affiliate.click'          // first-touch attribution cookie set
  | 'referral.attributed'      // payment.confirmed traced back to an affiliate
  | 'social.draft'             // social post draft staged for approval
  | 'social.posted'            // social post fanned out to a channel

export interface LogEventInput {
  type: OpsEventType
  source:
    | 'hub'
    | 'docai'
    | 'lexaudit'
    | 'tracr'
    | 'brai'
    | 'forge'
    | 'leadforge'
    | 'blog'
    | 'oci'
    | 'worker'
    | 'curator'
    | 'ea'
    | 'gsc-bot'
    | 'propsignal'
    | 'leaseparse'
    | 'closeflow'
    | 'dealdesk'
  ref_id?: string
  email?: string
  amount_cents?: number
  status?: 'ok' | 'pending' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

/**
 * Fire-and-forget event log. Returns a promise but never throws — caller
 * does not need to await unless they want to.
 */
export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    const client = getClient()
    if (!client) return
    const row = {
      event_type: input.type,
      source: input.source,
      ref_id: input.ref_id ?? null,
      ref_email: input.email ? input.email.toLowerCase() : null,
      amount_cents: typeof input.amount_cents === 'number' ? input.amount_cents : null,
      status: input.status ?? null,
      metadata: input.metadata ?? {},
    }
    const { error } = await client.from('ops_events').insert(row)
    if (error) {
      console.warn('[ops-log] insert failed', error.message)
    }
  } catch (err) {
    console.warn('[ops-log] threw', err instanceof Error ? err.message : err)
  }
}

/**
 * Synchronous fire-and-forget — schedules the insert without blocking
 * the caller. Use when you don't want to await.
 */
export function logEventAsync(input: LogEventInput): void {
  void logEvent(input).catch(() => {
    // already swallowed in logEvent; redundant safety net
  })
}
