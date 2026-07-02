import { ROUTES, SECURITY_SCHEMES } from '@/lib/openapi/registry'
import type { RouteEntry } from '@/lib/openapi/registry'

export const dynamic = 'force-static'

/**
 * GET /api/openapi.json
 *
 * Returns a full OpenAPI 3.0 specification for all BizLegal Hub API routes.
 * No authentication required — the spec is public.
 *
 * Statically generated at build time (force-static) so Vercel CDN caches it.
 * To refresh in development, restart the dev server.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface OpenApiResponse {
  description: string
  content?: Record<string, { schema: { type: string } }>
}

interface OpenApiOperation {
  operationId: string
  summary: string
  description?: string
  tags: string[]
  security: Array<Record<string, string[]>>
  responses: Record<string, OpenApiResponse>
}

type PathsObject = Record<string, Record<string, OpenApiOperation>>

// ── Standard response schemas ──────────────────────────────────────────────────

const RESPONSES: Record<string, OpenApiResponse> = {
  '200': {
    description: 'Success',
    content: { 'application/json': { schema: { type: 'object' } } },
  },
  '400': { description: 'Bad request — missing or invalid parameters' },
  '401': { description: 'Unauthorized — HMAC signature or token invalid' },
  '404': { description: 'Not found' },
  '429': { description: 'Rate limited' },
  '500': { description: 'Internal server error' },
}

// ── Spec builder ───────────────────────────────────────────────────────────────

function buildPaths(routes: RouteEntry[]): PathsObject {
  const paths: PathsObject = {}

  for (const route of routes) {
    if (!paths[route.path]) paths[route.path] = {}
    paths[route.path][route.method.toLowerCase()] = {
      operationId: route.operationId,
      summary: route.summary,
      ...(route.description ? { description: route.description } : {}),
      tags: route.tags,
      security: route.security,
      responses: RESPONSES,
    }
  }

  return paths
}

const SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'BizLegal AI Hub API',
    version: '1.0.0',
    description:
      'Internal + partner-facing API for BizLegal AI (bizlegal-ai.com). ' +
      'Covers ops telemetry, payment orchestration, compliance tools, lead intake, ' +
      'and product proxies. HMAC-gated routes require x-bizlegal-signature; ' +
      'ops routes require the OPS_DASHBOARD_TOKEN query param.',
    contact: {
      name: 'BizLegal AI Engineering',
      url: 'https://bizlegal-ai.com',
    },
    license: {
      name: 'Proprietary',
      url: 'https://bizlegal-ai.com/acceptable-use',
    },
  },
  servers: [
    { url: 'https://bizlegal-ai.com', description: 'Production' },
  ],
  paths: buildPaths(ROUTES),
  components: {
    securitySchemes: SECURITY_SCHEMES,
    schemas: {
      OpsEvent: {
        type: 'object',
        required: ['type', 'source'],
        properties: {
          type: { type: 'string', description: 'Event type (e.g. payment.confirmed)' },
          source: { type: 'string', description: 'Surface name (e.g. hub, docai, tracr)' },
          ref_id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          amount_cents: { type: 'integer' },
          status: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
      HeartbeatBody: {
        type: 'object',
        required: ['service'],
        properties: {
          service: { type: 'string', example: 'hetzner/headhunter' },
          version: { type: 'string' },
          pid: { type: 'integer' },
          hostname: { type: 'string' },
          status: { type: 'string', enum: ['alive', 'degraded', 'dead', 'starting', 'stopping'] },
          last_action: { type: 'string' },
          last_action_status: { type: 'string', enum: ['ok', 'error', 'warning'] },
          queue_depth: { type: 'integer' },
          metadata: { type: 'object' },
        },
      },
      PayStartBody: {
        type: 'object',
        required: ['product_id', 'user_email', 'gateway'],
        properties: {
          product_id: { type: 'string', description: 'Known ProductId from @bizlegal/payment' },
          user_email: { type: 'string', format: 'email' },
          user_name: { type: 'string' },
          gateway: { type: 'string', enum: ['crypto', 'card'] },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          ok: { type: 'boolean', example: false },
        },
      },
    },
  },
  tags: [
    { name: 'ops', description: 'Operations telemetry, heartbeats, and health checks' },
    { name: 'payments', description: 'Payment gateway orchestration' },
    { name: 'products', description: 'Product-level order and webhook handlers' },
    { name: 'leads', description: 'Lead intake, contact forms, and subscription endpoints' },
    { name: 'agents', description: 'AI agent invocation' },
    { name: 'risk', description: 'Compliance risk analysis and classification' },
    { name: 'data', description: 'Market data, jurisdictions, and digest feeds' },
    { name: 'tools', description: 'One-shot compliance tools' },
    { name: 'tracr', description: 'Tracr crypto wallet forensics product proxy' },
    { name: 'brai', description: 'BRAI regulatory risk preview product proxy' },
    { name: 'affiliates', description: 'Affiliate program signup and tracking' },
    { name: 'content', description: 'Content syndication and social approval' },
  ],
}

// ── Handler ────────────────────────────────────────────────────────────────────

export function GET(): Response {
  return new Response(JSON.stringify(SPEC, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
