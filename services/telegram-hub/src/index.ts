/**
 * @BizlegalHubBot — Telegram FAQ + intake bot.
 *
 * Routes inbound /<message> to the right /agents/<name> CTA, fires
 * lead.inbound ops_event per message. Pure top-of-funnel, no payments.
 *
 * Deploy:
 *   pnpm --filter @bizlegal/telegram-hub deploy
 *
 * Webhook setup (one-time, after deploy):
 *   curl "https://api.telegram.org/bot$BIZLEGALHUBBOT/setWebhook" \
 *     -d "url=https://bizlegal-telegram-hub.bizlegal-ai.workers.dev/webhook" \
 *     -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
 */

interface Env {
  readonly BIZLEGALHUBBOT: string
  readonly TELEGRAM_WEBHOOK_SECRET: string
  readonly WEBHOOK_SHARED_SECRET: string
  readonly HUB_BASE_URL?: string
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: { id: number; first_name?: string; username?: string }
    chat: { id: number }
    text?: string
  }
  callback_query?: {
    id: string
    from?: { id: number }
    data?: string
    message?: { chat: { id: number } }
  }
}

interface RouteHit {
  topic: string
  reply: string
  cta_label: string
  cta_url: string
}

const HUB_DEFAULT = 'https://bizlegal-ai.com'

// Route table — keyword → reply + CTA. Ordered: more specific first.
function routeMessage(text: string, hubBase: string): RouteHit | null {
  const t = text.toLowerCase()

  // BOI / FinCEN
  if (/(\bboi\b|fincen|cta-2024|beneficial owner|30-day refile)/.test(t)) {
    return {
      topic: 'boi',
      reply:
        'BOI is the Corporate Transparency Act filing every US LLC owes FinCEN. ' +
        'Penalty for missed amendments is $500/day capped at $10K. We monitor FinCEN ' +
        'guidance daily and send 30/7/3/1-day deadline alerts. First entity tracked free for 7 days.',
      cta_label: 'Track 1 entity free →',
      cta_url: `${hubBase}/agents/boi-tracker`,
    }
  }

  // EU AI Act
  if (/(ai[- ]?act|article 6|annex iii|gp[- ]?ai|2026-?08-?02|eu ai)/.test(t)) {
    return {
      topic: 'ai_act',
      reply:
        'EU AI Act general-purpose AI obligations apply 2 August 2026. Penalty: up to ' +
        '€35M or 7% of global turnover for misclassification. Our free classifier asks ' +
        '6 questions about your AI feature and returns minimal/limited/high/unacceptable ' +
        'with cited Article 6 + Annex III references.',
      cta_label: 'Free preview classification →',
      cta_url: `${hubBase}/agents/ai-act`,
    }
  }

  // Privacy / GDPR / CCPA / CPRA / Quebec / Texas / Colorado / Connecticut
  if (/(privacy|gdpr|ccpa|cpra|law ?25|quebec|colorado.+privac|connecticut.+privac|texas.+privac|dpsa|tdpsa)/.test(t)) {
    return {
      topic: 'policy_refresh',
      reply:
        'Most B2B SaaS privacy policies are 6-24 months stale. Enforcement actions ' +
        'cite "policy did not reflect current data flows" verbatim. Paste your policy ' +
        'URL and we redline it against 7 frameworks (GDPR / CCPA / CPRA / Quebec ' +
        'Law 25 / Colorado / Connecticut / Texas DPSA). First audit free, no card.',
      cta_label: 'Free 7-framework redline →',
      cta_url: `${hubBase}/agents/policy-refresh`,
    }
  }

  // PSP / Stripe / PayPal / Mercury frozen account
  if (/(psp|frozen|stripe.+(reject|froze|hold)|paypal.+hold|mercury.+(close|froze)|mor risk|account.+(reject|appeal))/.test(t)) {
    return {
      topic: 'psp',
      reply:
        'If your processor froze you mid-flight, the appeal window is 14-21 days and ' +
        'the AUP clauses they cite are usually 3 of the 7 we audit for. Pre-flight ' +
        '($299) audits before you apply; recovery mode pastes your freeze email and ' +
        'drafts the appeal letter + regulator escalation pathway.',
      cta_label: 'Run a free pre-flight scan →',
      cta_url: `${hubBase}/psp-risk`,
    }
  }

  // TRACR forensic / wallet
  if (/(tracr|wallet trace|forensic|rugged|rug ?pull|crypto recover)/.test(t)) {
    return {
      topic: 'tracr',
      reply:
        'TRACR runs forensic wallet traces — counterparty graph + 1-year history + ' +
        'court-ready prose for freezing-order applications. Bronze report $149, Silver ' +
        '(with court-ready prose) $299. Lead time ~2 hours.',
      cta_label: 'Order a forensic report →',
      cta_url: 'https://tracr.bizlegal-ai.com',
    }
  }

  // BRAI / blockchain regulatory
  if (/(brai|blockchain risk|regulatory risk|sanctions screen|ofac)/.test(t)) {
    return {
      topic: 'brai',
      reply:
        'BRAI assesses blockchain regulatory risk by jurisdiction — sanctions ' +
        'screening + SAR triggers + jurisdictional licence requirements. Full report $49.',
      cta_label: 'Generate BRAI risk preview →',
      cta_url: 'https://brai.bizlegal-ai.com',
    }
  }

  // Generic / help
  if (/(\bhelp\b|menu|start|hi|hello|info|what.+(do|offer))/.test(t)) {
    return null  // returns the menu; handled below
  }

  return null  // unknown
}

const MENU_TEXT =
  '🦉 *BizLegal AI Intelligence*\n\n' +
  'Reply with one of these topics and I\'ll point you at the right tool:\n\n' +
  '• `boi` — Corporate Transparency Act / FinCEN refile alerts\n' +
  '• `ai-act` — EU AI Act risk classification (deadline 2 Aug 2026)\n' +
  '• `privacy` — Privacy policy redline (GDPR + 6 US frameworks)\n' +
  '• `psp` — Stripe / PayPal / Mercury frozen-account recovery\n' +
  '• `tracr` — Wallet forensic reports\n' +
  '• `brai` — Blockchain regulatory risk\n\n' +
  '_Decision-support intelligence — not legal advice._'

async function sendMessage(env: Env, chatId: number, text: string, replyMarkup?: object): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  }
  if (replyMarkup) body.reply_markup = replyMarkup
  await fetch(`https://api.telegram.org/bot${env.BIZLEGALHUBBOT}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => console.warn('[telegram-hub] sendMessage failed', err))
}

async function logEventToHub(env: Env, payload: Record<string, unknown>): Promise<void> {
  if (!env.WEBHOOK_SHARED_SECRET) return
  const body = JSON.stringify(payload)
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.WEBHOOK_SHARED_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const url = `${env.HUB_BASE_URL ?? HUB_DEFAULT}/api/ops/log`
  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bizlegal-signature': sigHex },
    body,
  }).catch((err) => console.warn('[telegram-hub] logEvent failed', err))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({
        ok: true,
        service: 'bizlegal-telegram-hub',
        configured: {
          token: Boolean(env.BIZLEGALHUBBOT),
          webhook_secret: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
          hub_inbound: Boolean(env.WEBHOOK_SHARED_SECRET),
        },
        ts: new Date().toISOString(),
      })
    }

    if (request.method !== 'POST' || url.pathname !== '/webhook') {
      return Response.json({ error: 'not_found' }, { status: 404 })
    }

    // Telegram secret-token verification
    const headerSecret = request.headers.get('x-telegram-bot-api-secret-token')
    if (!env.TELEGRAM_WEBHOOK_SECRET || headerSecret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    let update: TelegramUpdate
    try {
      update = (await request.json()) as TelegramUpdate
    } catch {
      return Response.json({ error: 'invalid_json' }, { status: 400 })
    }

    const message = update.message
    const chatId = message?.chat.id
    const text = (message?.text ?? '').trim()
    if (!chatId || !text) {
      // Always return 200 to Telegram so it doesn't retry; we just don't act.
      return Response.json({ ok: true })
    }

    const hubBase = env.HUB_BASE_URL ?? HUB_DEFAULT
    const hit = routeMessage(text, hubBase)

    if (hit) {
      await sendMessage(env, chatId, `${hit.reply}\n\n[${hit.cta_label}](${hit.cta_url})`, {
        inline_keyboard: [[{ text: hit.cta_label, url: hit.cta_url }]],
      })
      // Fire lead.inbound — top-of-funnel signal for /ops Referrals card.
      await logEventToHub(env, {
        type: 'lead.inbound',
        source: 'worker',
        ref_id: `telegram-hub/${update.update_id}`,
        status: 'pending',
        metadata: {
          channel: 'telegram',
          bot: 'bizlegal_hub_bot',
          topic: hit.topic,
          tg_user_id: message.from?.id,
          tg_username: message.from?.username ?? null,
          message_chars: text.length,
        },
      })
    } else {
      await sendMessage(env, chatId, MENU_TEXT)
    }

    return Response.json({ ok: true })
  },
} satisfies ExportedHandler<Env>
