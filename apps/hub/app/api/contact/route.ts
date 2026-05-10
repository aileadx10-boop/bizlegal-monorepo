/**
 * Hub /api/contact — apex contact form intake.
 *
 * W4.1 of the approved Week 3-4 plan. Replaces direct-to-Formspree
 * action so every inquiry runs through the OCI deal-router classifier
 * AND lands in Moses's existing Formspree inbox. Two-channel fan-out
 * is best-effort: a router 503 must NOT lose the lead from the inbox,
 * and a Formspree outage must NOT skip the partner-routing path.
 *
 * Wire:
 *   form action="/api/contact" method="POST"
 *     ↓ (form-data: name, email, subject, message)
 *   /api/contact server route
 *     ├──→ POST router.bizlegal-ai.com/lead   (HMAC-signed)
 *     ├──→ POST formspree.io/f/...            (raw form-data)
 *     └──→ logEventAsync('lead.inbound', source: 'hub', ...)
 *   redirect → /contact/thank-you
 *
 * HMAC contract — see services/oci/router/hmac_verify.py:
 *   header: x-bizlegal-signature
 *   value:  hex(HMAC-SHA256(rawBody, BIZLEGAL_INBOUND_SECRET))
 *   no 'sha256=' prefix, raw hex only.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'

import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_OCI_LEAD_URL = 'https://router.bizlegal-ai.com/lead'
const DEFAULT_FORMSPREE_URL = 'https://formspree.io/f/team@bizlegal-ai.com'
const FETCH_TIMEOUT_MS = 8_000

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function clampStr(v: string | null | undefined, max: number): string {
  return (v ?? '').toString().trim().slice(0, max)
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: ac.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function postToOciRouter(payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; err?: string }> {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  const url = process.env.OCI_ROUTER_LEAD_URL || DEFAULT_OCI_LEAD_URL
  if (!secret) {
    return { ok: false, status: 0, err: 'BIZLEGAL_INBOUND_SECRET unset' }
  }
  const body = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-bizlegal-signature': sig,
        },
        body,
      },
      FETCH_TIMEOUT_MS,
    )
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, status: 0, err: err instanceof Error ? err.message : String(err) }
  }
}

async function postToFormspree(form: URLSearchParams): Promise<{ ok: boolean; status: number; err?: string }> {
  const url = process.env.FORMSPREE_CONTACT_URL || DEFAULT_FORMSPREE_URL
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
        body: form.toString(),
      },
      FETCH_TIMEOUT_MS,
    )
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, status: 0, err: err instanceof Error ? err.message : String(err) }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 })
  }

  const name = clampStr(formData.get('name')?.toString(), 200)
  const emailRaw = clampStr(formData.get('email')?.toString(), 320).toLowerCase()
  const subject = clampStr(formData.get('subject')?.toString(), 200)
  const message = clampStr(formData.get('message')?.toString(), 8_000)

  if (!name || !emailRaw || !message) {
    return NextResponse.json(
      { error: 'missing_required_fields', required: ['name', 'email', 'message'] },
      { status: 400 },
    )
  }
  if (!isValidEmail(emailRaw)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const leadId = crypto.randomUUID()
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null
  const ua = req.headers.get('user-agent') || null
  const referrer = req.headers.get('referer') || null
  const url = new URL(req.url)
  const utm_source = url.searchParams.get('utm_source')
  const utm_medium = url.searchParams.get('utm_medium')
  const utm_campaign = url.searchParams.get('utm_campaign')

  // OCI router accepts the hub-form shape (services/oci/router/main.py:76-130).
  // `text` is required; we concatenate subject + message so the classifier
  // sees the full intent. Contact_* fields populate the partner email later.
  const ociPayload: Record<string, unknown> = {
    lead_id: leadId,
    text: subject ? `[${subject}] ${message}` : message,
    source: 'hub_contact_form',
    source_url: 'https://bizlegal-ai.com/contact',
    referrer,
    user_agent: ua,
    contact_name: name,
    contact_email: emailRaw,
    contact_role: subject || null,
    utm_source,
    utm_medium,
    utm_campaign,
    ip_country: req.headers.get('cf-ipcountry') || null,
  }

  // Mirror form-data to Formspree so Moses's existing inbox keeps working.
  const formspreeBody = new URLSearchParams()
  formspreeBody.set('name', name)
  formspreeBody.set('email', emailRaw)
  if (subject) formspreeBody.set('subject', subject)
  formspreeBody.set('message', message)
  formspreeBody.set('lead_id', leadId)

  // Fan out in parallel — single inquiry, two destinations, no
  // sequential dependency. Promise.allSettled means one outage never
  // blocks the other; both results land in ops_log for diagnosis.
  const [ociResult, formspreeResult] = await Promise.all([
    postToOciRouter(ociPayload),
    postToFormspree(formspreeBody),
  ])

  logEventAsync({
    type: 'lead.inbound',
    source: 'hub',
    ref_id: leadId,
    email: emailRaw,
    status: ociResult.ok || formspreeResult.ok ? 'ok' : 'failed',
    metadata: {
      page: 'contact',
      subject: subject || null,
      oci: { ok: ociResult.ok, status: ociResult.status, err: ociResult.err ?? null },
      formspree: { ok: formspreeResult.ok, status: formspreeResult.status, err: formspreeResult.err ?? null },
      ip_present: Boolean(ip),
      utm_source,
      utm_medium,
      utm_campaign,
    },
  })

  // Both channels failed — still acknowledge to user (form UX), but
  // surface the error so a synthetic monitor catches the outage.
  if (!ociResult.ok && !formspreeResult.ok) {
    return NextResponse.json(
      { error: 'contact_dispatch_failed', lead_id: leadId },
      { status: 502 },
    )
  }

  // Redirect to a thank-you. Use 303 so a POST → GET transition is
  // semantically correct (preserves browser back-button behaviour
  // without re-submitting the form).
  return NextResponse.redirect(new URL('/contact/thank-you', req.url), { status: 303 })
}
