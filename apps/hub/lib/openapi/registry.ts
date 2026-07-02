/**
 * BizLegal Hub API — static OpenAPI route registry.
 *
 * All hub routes are declared here. The openapi.json route reads this list
 * to build a valid OpenAPI 3.0 spec on demand. Adding a route here is the
 * only change needed to have it appear in the spec and docs.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface SecurityRequirement {
  [scheme: string]: string[]
}

export interface RouteEntry {
  method: HttpMethod
  /** OpenAPI path format — dynamic segments use {param} notation. */
  path: string
  operationId: string
  summary: string
  description?: string
  tags: string[]
  /** Empty array = no authentication required. */
  security: SecurityRequirement[]
}

// ── Security requirement shorthand ───────────────────────────────────────────

/** SHA-256 HMAC over request body; header: x-bizlegal-signature */
const HMAC: SecurityRequirement[] = [{ hmacAuth: [] }]
/** OPS_DASHBOARD_TOKEN query param: ?t=TOKEN */
const TOKEN: SecurityRequirement[] = [{ tokenAuth: [] }]
/** Bearer CRON_SECRET (Vercel cron handler) */
const CRON: SecurityRequirement[] = [{ cronAuth: [] }]
/** No authentication required. */
const OPEN: SecurityRequirement[] = []

// ── Security scheme definitions (exported for spec builder) ──────────────────

export interface SecuritySchemeApiKey {
  type: 'apiKey'
  in: 'header' | 'query' | 'cookie'
  name: string
  description?: string
}

export interface SecuritySchemeHttp {
  type: 'http'
  scheme: string
  description?: string
}

export type SecurityScheme = SecuritySchemeApiKey | SecuritySchemeHttp

export const SECURITY_SCHEMES: Record<string, SecurityScheme> = {
  hmacAuth: {
    type: 'apiKey',
    in: 'header',
    name: 'x-bizlegal-signature',
    description: 'SHA-256 HMAC over raw request body (hex). Same secret across all BizLegal surfaces.',
  },
  tokenAuth: {
    type: 'apiKey',
    in: 'query',
    name: 't',
    description: 'OPS_DASHBOARD_TOKEN — ops-internal dashboard access.',
  },
  cronAuth: {
    type: 'http',
    scheme: 'bearer',
    description: 'CRON_SECRET — set as Authorization: Bearer by Vercel cron scheduler.',
  },
  apiKey: {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
    description: 'Future API key header (reserved, not enforced yet).',
  },
}

// ── Route registry ────────────────────────────────────────────────────────────

export const ROUTES: RouteEntry[] = [
  // Ops — event pipeline
  { method: 'POST', path: '/api/ops/log', operationId: 'opsLog', summary: 'Ops event ingress', description: 'HMAC-signed event write from any surface into ops_events.', tags: ['ops'], security: HMAC },
  { method: 'POST', path: '/api/ops/heartbeat', operationId: 'opsHeartbeat', summary: 'Service heartbeat ping', description: 'Upserts a heartbeat row for the calling service (agent_heartbeats).', tags: ['ops'], security: HMAC },
  { method: 'GET', path: '/api/ops/live', operationId: 'opsLive', summary: 'Live service state', description: 'Returns most-recent heartbeat per service plus health summary.', tags: ['ops'], security: TOKEN },
  { method: 'GET', path: '/api/ops/live/stream', operationId: 'opsLiveStream', summary: 'SSE live heartbeat stream', description: 'Server-Sent Events stream — emits a JSON frame per heartbeat received.', tags: ['ops'], security: TOKEN },
  { method: 'GET', path: '/api/ops/process-tree', operationId: 'opsProcessTree', summary: 'Process tree snapshot', description: 'Returns the current process tree of the Hetzner box (via agent ping).', tags: ['ops'], security: TOKEN },
  { method: 'GET', path: '/api/ops/health', operationId: 'opsHealth', summary: 'Env and chain audit', description: 'Full audit of required env vars, HMAC self-test, and subdomain probes.', tags: ['ops'], security: TOKEN },
  { method: 'GET', path: '/api/ops/feed', operationId: 'opsFeed', summary: 'Events tape', description: 'Paginated ops_events log with summary aggregates and referral pipeline.', tags: ['ops'], security: TOKEN },

  // Lead intake
  { method: 'POST', path: '/api/inbound-lead', operationId: 'inboundLead', summary: 'Lead intake', description: 'HMAC-verified lead ingest from Worker and subdomain surfaces.', tags: ['leads'], security: HMAC },
  { method: 'POST', path: '/api/leads', operationId: 'leadsCapture', summary: 'Lead capture', tags: ['leads'], security: OPEN },
  { method: 'POST', path: '/api/contact', operationId: 'contactForm', summary: 'Contact form submission', tags: ['leads'], security: OPEN },
  { method: 'POST', path: '/api/newsletter', operationId: 'newsletterSubscribe', summary: 'Newsletter subscribe', tags: ['leads'], security: OPEN },
  { method: 'POST', path: '/api/subscribe', operationId: 'subscribe', summary: 'General subscribe', tags: ['leads'], security: OPEN },
  { method: 'POST', path: '/api/subscribers', operationId: 'subscribersSignup', summary: 'Subscriber signup', tags: ['leads'], security: OPEN },

  // Payments — universal checkout
  { method: 'POST', path: '/api/pay/start', operationId: 'payStart', summary: 'Universal checkout entry', description: 'Gateway-agnostic checkout URL generator. Replaces all NEXT_PUBLIC_*_URL constants.', tags: ['payments'], security: OPEN },

  // Payments — provider-specific
  { method: 'POST', path: '/api/payments/nowpayments/start', operationId: 'nowpaymentsStart', summary: 'NOWPayments checkout', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/nowpayments/webhook', operationId: 'nowpaymentsWebhook', summary: 'NOWPayments IPN webhook', tags: ['payments'], security: HMAC },
  { method: 'POST', path: '/api/payments/paypal/start', operationId: 'paypalStart', summary: 'PayPal checkout', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/paypal/webhook', operationId: 'paypalWebhook', summary: 'PayPal webhook', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/paddle/start', operationId: 'paddleStart', summary: 'Paddle checkout', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/paddle/webhook', operationId: 'paddleWebhook', summary: 'Paddle webhook', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/wire/start', operationId: 'wireStart', summary: 'Wire transfer start', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/wire/confirm', operationId: 'wireConfirm', summary: 'Wire transfer confirm', tags: ['payments'], security: HMAC },
  { method: 'POST', path: '/api/payments/conductor/start', operationId: 'conductorStart', summary: 'Conductor checkout', tags: ['payments'], security: OPEN },
  { method: 'POST', path: '/api/payments/lemonsqueezy', operationId: 'lemonsqueezyWebhook', summary: 'LemonSqueezy webhook', tags: ['payments'], security: OPEN },

  // Products
  { method: 'GET', path: '/api/products/{product}/create-order', operationId: 'productCreateOrder', summary: 'Create product order', tags: ['products'], security: OPEN },
  { method: 'POST', path: '/api/products/{product}/webhook', operationId: 'productWebhook', summary: 'Product webhook', tags: ['products'], security: OPEN },

  // Agents
  { method: 'POST', path: '/api/agents/run', operationId: 'agentsRun', summary: 'Run an agent', description: 'Invoke a named BizLegal AI agent with a given payload.', tags: ['agents'], security: OPEN },

  // Risk + compliance
  { method: 'POST', path: '/api/risk-assessment', operationId: 'riskAssessment', summary: 'Risk assessment', tags: ['risk'], security: OPEN },
  { method: 'POST', path: '/api/risk-engine/deep-analysis', operationId: 'riskEngineDeepAnalysis', summary: 'Deep risk analysis', tags: ['risk'], security: OPEN },
  { method: 'POST', path: '/api/ai-act/classify', operationId: 'aiActClassify', summary: 'AI Act classification', description: 'Classify a system against EU AI Act risk tiers.', tags: ['risk'], security: OPEN },
  { method: 'POST', path: '/api/psp-risk/audit', operationId: 'pspRiskAudit', summary: 'PSP risk audit', tags: ['risk'], security: OPEN },
  { method: 'POST', path: '/api/policy-refresh/audit', operationId: 'policyRefreshAudit', summary: 'Policy refresh audit', tags: ['risk'], security: OPEN },

  // Market data
  { method: 'GET', path: '/api/markets', operationId: 'markets', summary: 'Market data', tags: ['data'], security: OPEN },
  { method: 'GET', path: '/api/market-data', operationId: 'marketDataV2', summary: 'Market data v2', tags: ['data'], security: OPEN },
  { method: 'GET', path: '/api/jurisdictions/compare', operationId: 'jurisdictionsCompare', summary: 'Jurisdiction comparison', tags: ['data'], security: OPEN },
  { method: 'GET', path: '/api/digest', operationId: 'digest', summary: 'Daily regulatory digest', tags: ['data'], security: OPEN },
  { method: 'GET', path: '/api/today-brief', operationId: 'todayBrief', summary: "Today's brief", tags: ['data'], security: OPEN },

  // Tools
  { method: 'POST', path: '/api/tools/contract-fixer', operationId: 'toolsContractFixer', summary: 'Contract fixer tool', tags: ['tools'], security: OPEN },
  { method: 'POST', path: '/api/tools/debt-collection', operationId: 'toolsDebtCollection', summary: 'Debt collection tool', tags: ['tools'], security: OPEN },
  { method: 'POST', path: '/api/tools/saas-scanner', operationId: 'toolsSaasScanner', summary: 'SaaS compliance scanner', tags: ['tools'], security: OPEN },
  { method: 'POST', path: '/api/tools/website-compliance', operationId: 'toolsWebsiteCompliance', summary: 'Website compliance tool', tags: ['tools'], security: OPEN },

  // BOI
  { method: 'POST', path: '/api/boi/subscribe', operationId: 'boiSubscribe', summary: 'BOI subscribe', tags: ['products'], security: OPEN },

  // Real estate
  { method: 'POST', path: '/api/realestate-intake', operationId: 'realestateIntake', summary: 'Real estate intake', description: 'Proxied to OCI deal-router with HMAC signature.', tags: ['leads'], security: OPEN },

  // Tracr product proxy
  { method: 'GET', path: '/api/tracr/create-order', operationId: 'tracrCreateOrder', summary: 'Tracr create order', tags: ['tracr'], security: OPEN },
  { method: 'POST', path: '/api/tracr/generate-report', operationId: 'tracrGenerateReport', summary: 'Tracr generate report', tags: ['tracr'], security: OPEN },
  { method: 'POST', path: '/api/tracr/analyze', operationId: 'tracrAnalyze', summary: 'Tracr wallet analyze', tags: ['tracr'], security: OPEN },
  { method: 'POST', path: '/api/tracr/verify-eth', operationId: 'tracrVerifyEth', summary: 'Tracr ETH address verify', tags: ['tracr'], security: OPEN },
  { method: 'POST', path: '/api/tracr/webhook', operationId: 'tracrWebhook', summary: 'Tracr payment webhook', tags: ['tracr'], security: OPEN },

  // BRAI product proxy
  { method: 'POST', path: '/api/brai/invoice', operationId: 'braiBilling', summary: 'BRAI invoice', tags: ['brai'], security: OPEN },
  { method: 'POST', path: '/api/brai/leads', operationId: 'braiLeads', summary: 'BRAI lead capture', tags: ['brai'], security: OPEN },
  { method: 'POST', path: '/api/brai/webhook', operationId: 'braiWebhook', summary: 'BRAI webhook', tags: ['brai'], security: OPEN },

  // Affiliates
  { method: 'POST', path: '/api/affiliates/signup', operationId: 'affiliatesSignup', summary: 'Affiliate signup', tags: ['affiliates'], security: OPEN },
  { method: 'GET', path: '/api/affiliates/track/{code}', operationId: 'affiliatesTrack', summary: 'Affiliate tracking redirect', tags: ['affiliates'], security: OPEN },

  // Content + social
  { method: 'GET', path: '/api/content/syndicate', operationId: 'contentSyndicate', summary: 'Content syndication feed', tags: ['content'], security: OPEN },
  { method: 'GET', path: '/api/social/approve/{token}', operationId: 'socialApproveGet', summary: 'Social approval review (GET)', tags: ['content'], security: OPEN },
  { method: 'POST', path: '/api/social/approve/{token}', operationId: 'socialApprovePost', summary: 'Social approval action (POST)', tags: ['content'], security: OPEN },

  // Misc
  { method: 'POST', path: '/api/indexnow', operationId: 'indexnow', summary: 'IndexNow ping', description: 'Submit a URL to search engines via IndexNow protocol.', tags: ['content'], security: CRON },
  { method: 'POST', path: '/api/email/unsubscribe', operationId: 'emailUnsubscribe', summary: 'Email unsubscribe', tags: ['leads'], security: OPEN },
  { method: 'POST', path: '/api/oci/optout', operationId: 'ociOptout', summary: 'OCI opt-out', tags: ['risk'], security: OPEN },
]
