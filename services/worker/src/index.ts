import { FormSubmissionSchema, type Env, type LeadProfile } from "./types";
import { runPipeline } from "./pipeline";
import { SnapshotRequestSchema } from "./reports";
import { runSnapshotPipeline } from "./pipeline-report";
import { verifyTurnstile } from "./turnstile";
import { aggregateDigest, readLatestDigest } from "./digest";
import { logEvent } from "./ops-log";
import { runNurtureCron } from "./nurture";

// Worker: lead-intake + snapshot pipeline + product-digest aggregator.
// POST /intake                  — landing-form lead submission (auth: shared secret)
// POST /report/snapshot          — internal snapshot trigger (auth: shared secret)
// POST /report/snapshot-public   — public snapshot from blog/hub forms (auth: Turnstile)
// POST /digest/aggregate         — manual rerun of the daily digest aggregator (auth: shared secret)
// GET  /digest/latest            — public read of the latest aggregated digest (used by hub homepage)
// GET  /health                   — service status
//
// Crons (wrangler.toml [triggers].crons):
//   "0 6 * * *" — aggregate the daily product digest (Phase 3.2)
//   "0 9 * * *" — daily snapshot smoke test

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Branch on the cron expression so a single scheduled() handler
    // can drive multiple jobs without crowding wrangler.toml with
    // separate triggers blocks.
    if (event.cron === "0 6 * * *") {
      ctx.waitUntil(runDailyDigest(env, event));
      return;
    }
    if (event.cron === "0 9 * * *") {
      ctx.waitUntil(runSmokeTest(env, event));
      return;
    }
    if (event.cron === "*/5 * * * *") {
      // Phase AA V3 — lead nurture (welcome → education → comparison → last_call).
      // Idempotent: rows are picked one-at-a-time, advanced atomically; a
      // missed tick replays naturally on the next invocation. Hard cap on
      // rows-per-tick keeps Worker CPU under budget.
      ctx.waitUntil(runNurtureCron(env, new Date(event.scheduledTime)));
      return;
    }
    // Unknown cron — log and no-op. Better than silently misfiring.
    console.warn(`[cron] unhandled trigger: ${event.cron}`);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json(200, {
        ok: true,
        service: "bizlegal-lead-intake",
        version: env.PIPELINE_VERSION,
        models: {
          extract: env.HAIKU_MODEL_ID,
          critique: env.HAIKU_MODEL_ID,
          score: env.HAIKU_MODEL_ID,
          summary: env.HAIKU_MODEL_ID,
          cloud_escalation: env.SONNET_ESCALATION_MODEL_ID
        },
        notify_score_threshold: env.NOTIFY_SCORE_THRESHOLD,
        ts: new Date().toISOString()
      });
    }

    if (request.method === "POST" && url.pathname === "/intake") {
      return handleIntake(request, env, ctx);
    }

    if (request.method === "POST" && url.pathname === "/report/snapshot") {
      return handleSnapshot(request, env, ctx);
    }

    if (request.method === "POST" && url.pathname === "/report/snapshot-public") {
      return handleSnapshotPublic(request, env, ctx);
    }

    // CORS preflight for the public endpoint (the form lives on blog.bizlegal-ai.com)
    if (request.method === "OPTIONS" && url.pathname === "/report/snapshot-public") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method === "POST" && url.pathname === "/digest/aggregate") {
      return handleDigestAggregate(request, env);
    }

    if (request.method === "GET" && url.pathname === "/digest/latest") {
      return handleDigestLatest(env);
    }

    if (request.method === "OPTIONS" && url.pathname === "/digest/latest") {
      return new Response(null, { status: 204, headers: digestCorsHeaders() });
    }

    return json(404, { error: "not_found" });
  }
} satisfies ExportedHandler<Env>;

async function runDailyDigest(env: Env, event: ScheduledController): Promise<void> {
  const tag = `digest-${new Date(event.scheduledTime).toISOString().slice(0, 10)}`;
  const start = Date.now();
  console.log(`[cron] running ${tag}`);
  try {
    const result = await aggregateDigest(env);
    console.log(
      `[cron] ${tag} ok — healthy ${result.healthy_count} / offline ${result.offline_count}`
    );
    // V0.4 — fire cron.completed so /ops sees daily digest aggregator runs.
    void logEvent(env, {
      type: "cron.completed",
      ref_id: tag,
      status: result.offline_count >= 3 ? "failed" : "ok",
      metadata: {
        cron: "daily_digest_aggregator",
        healthy_count: result.healthy_count,
        offline_count: result.offline_count,
        duration_ms: Date.now() - start,
      },
    });
    // If 3+ products are offline, alert. Two offline is normal in dev/preview.
    if (result.offline_count >= 3 && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const offlineList = Object.values(result.products)
        .filter((p) => p.status === "offline")
        .map((p) => `\\- ${p.product}`)
        .join("\n");
      const text = [
        `*⚠️ Digest aggregator: ${result.offline_count} products offline*`,
        "",
        `*Tag:* \`${tag}\``,
        offlineList,
        "",
        escapeMd("Hub homepage will render placeholder cards for these.")
      ].join("\n");
      try {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text,
            parse_mode: "MarkdownV2",
            disable_web_page_preview: true
          })
        });
      } catch (err) {
        console.error("[cron] telegram alert failed:", err);
      }
    }
  } catch (err) {
    console.error(`[cron] ${tag} failed`, err);
    void logEvent(env, {
      type: "cron.completed",
      ref_id: tag,
      status: "failed",
      metadata: {
        cron: "daily_digest_aggregator",
        error: err instanceof Error ? err.name : String(err),
        duration_ms: Date.now() - start,
      },
    });
  }
}

async function handleDigestAggregate(request: Request, env: Env): Promise<Response> {
  const sharedSecret = request.headers.get("x-bizlegal-secret");
  if (!env.WEBHOOK_SHARED_SECRET || sharedSecret !== env.WEBHOOK_SHARED_SECRET) {
    return json(401, { error: "unauthorized" });
  }
  try {
    const result = await aggregateDigest(env);
    return json(200, {
      ok: true,
      aggregated_at: result.aggregated_at,
      healthy_count: result.healthy_count,
      offline_count: result.offline_count,
      products: Object.fromEntries(
        Object.entries(result.products).map(([k, v]) => [k, v.status])
      )
    });
  } catch (err) {
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

async function handleDigestLatest(env: Env): Promise<Response> {
  const digest = await readLatestDigest(env);
  if (!digest) {
    return json(503, { error: "digest_not_ready" }, digestCorsHeaders());
  }
  return json(200, digest, digestCorsHeaders());
}

function digestCorsHeaders(): Record<string, string> {
  // Hub homepage reads /digest/latest from a Server Component or
  // Edge Function — same-origin from Vercel, but allow any origin
  // here so manual curl/dev probes also work.
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    Vary: "Origin"
  };
}

// Rotate smoke test inputs so the daily snapshot isn't always UAE vs SG stablecoin.
// Each entry is [code_a, code_b, activity] — varied by day-of-week (0=Sun, 6=Sat).
const SMOKE_ROTATION: readonly [string, string, string][] = [
  ["UAE", "SG", "stablecoin issuance under MiCA and MAS DPT frameworks"],
  ["EU", "UK", "GDPR vs UK GDPR cross-border data transfer compliance"],
  ["US", "CA", "SEC broker-dealer registration vs OSC exempt-market dealer requirements"],
  ["SG", "HK", "digital payment token service licensing (MAS DPT vs HKMA SVF)"],
  ["EU", "UAE", "AI Act Article 6 high-risk classification vs UAE AI governance framework"],
  ["US", "EU", "FinCEN BOI / CTA-2024 vs EU UBO register enforcement posture"],
  ["CH", "SG", "DeFi protocol licensing: FINMA vs MAS sandbox pathway comparison"],
];

async function runSmokeTest(env: Env, event: ScheduledController): Promise<void> {
  const tag = `smoketest-${new Date(event.scheduledTime).toISOString().slice(0, 10)}`;
  console.log(`[cron] running ${tag}`);
  try {
    const dow = new Date(event.scheduledTime).getUTCDay(); // 0-6
    // Non-null: modulo always produces a valid index.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [codeA, codeB, activity] = SMOKE_ROTATION[dow % SMOKE_ROTATION.length]!;
    const submission = {
      full_name: "Daily Smoke Test",
      email: "smoketest@bizlegal-ai.com",
      company: null,
      jurisdiction_codes: [codeA, codeB] as [string, string],
      activity,
      urgency_window: null
    };
    const result = await runSnapshotPipeline(env, submission, new Headers(), {
      snapshotId: crypto.randomUUID(),
      requestedAt: new Date(event.scheduledTime).toISOString(),
      deliverEmail: false,
      skipTelegramNotify: true   // smoke tests don't need daily Telegram spam
    });
    if (!result.ok) {
      await alertSmokeTestFailure(env, tag, result.error ?? "unknown");
    } else {
      console.log(`[cron] ${tag} ok in ${result.duration_ms}ms`);
    }
  } catch (err) {
    await alertSmokeTestFailure(env, tag, err instanceof Error ? err.message : String(err));
  }
}

async function alertSmokeTestFailure(env: Env, tag: string, error: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn(`[cron] smoke test failed (no Telegram): ${error}`);
    return;
  }
  const text = [
    `*⚠️ Daily Smoke Test FAILED*`,
    "",
    `*Tag:* \`${tag}\``,
    `*Error:* ${escapeMd(error.slice(0, 300))}`,
    "",
    escapeMd("Investigate via wrangler tail bizlegal-lead-intake")
  ].join("\n");
  try {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    console.error("[cron] telegram alert failed:", err);
  }
}

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "https://blog.bizlegal-ai.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

async function handleSnapshotPublic(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Feature gate — default disabled so unconfigured Workers don't accept anonymous POSTs
  if (env.PUBLIC_SNAPSHOT_ENABLED !== "1") {
    return json(403, { error: "public_snapshot_disabled" }, corsHeaders());
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" }, corsHeaders());
  }

  // Honeypot: the form includes a hidden `website` field that real users never fill.
  // Bots blindly submit all fields. Reject silently with a 200 so they don't retune.
  if (body && typeof body === "object" && "website" in body) {
    const hp = (body as { website: unknown }).website;
    if (typeof hp === "string" && hp.trim().length > 0) {
      return json(200, { accepted: true, status: "received" }, corsHeaders());
    }
  }

  // Turnstile (skipped if TURNSTILE_SECRET_KEY not configured)
  const turnstileToken =
    body && typeof body === "object" && "turnstile_token" in body
      ? (body as { turnstile_token?: unknown }).turnstile_token
      : null;
  const clientIp = request.headers.get("cf-connecting-ip");
  const tsResult = await verifyTurnstile(
    env,
    typeof turnstileToken === "string" ? turnstileToken : null,
    clientIp
  );
  if (!tsResult.ok) {
    return json(
      403,
      { error: "turnstile_failed", codes: tsResult.errorCodes ?? [] },
      corsHeaders()
    );
  }

  // Strip honeypot + turnstile_token before validation so Zod doesn't reject extras
  if (body && typeof body === "object") {
    delete (body as Record<string, unknown>).website;
    delete (body as Record<string, unknown>).turnstile_token;
  }

  const parsed = SnapshotRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: "validation_failed", issues: parsed.error.issues }, corsHeaders());
  }
  const submission = parsed.data;
  const snapshotId = crypto.randomUUID();
  const requestedAt = new Date().toISOString();

  ctx.waitUntil(
    runSnapshotPipeline(env, submission, request.headers, {
      snapshotId,
      requestedAt,
      deliverEmail: true
    }).catch((err) => console.error("[snapshot-public] unhandled pipeline error:", err))
  );

  return json(
    202,
    {
      accepted: true,
      snapshot_id: snapshotId,
      status: "received",
      requested_at: requestedAt,
      message: "Your snapshot is being generated. Expect an email from team@bizlegal-ai.com in 2–5 minutes.",
      version: env.PIPELINE_VERSION
    },
    corsHeaders()
  );
}

async function handleSnapshot(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const sharedSecret = request.headers.get("x-bizlegal-secret");
  if (!env.WEBHOOK_SHARED_SECRET || sharedSecret !== env.WEBHOOK_SHARED_SECRET) {
    return json(401, { error: "unauthorized" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  const parsed = SnapshotRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: "validation_failed", issues: parsed.error.issues });
  }

  const submission = parsed.data;
  const snapshotId = crypto.randomUUID();
  const requestedAt = new Date().toISOString();

  ctx.waitUntil(
    runSnapshotPipeline(env, submission, request.headers, {
      snapshotId,
      requestedAt,
      deliverEmail: false // authenticated internal endpoint doesn't email
    }).catch((err) => console.error("[snapshot] unhandled pipeline error:", err))
  );

  return json(202, {
    accepted: true,
    snapshot_id: snapshotId,
    status: "received",
    requested_at: requestedAt,
    estimated_completion_seconds: 45,
    version: env.PIPELINE_VERSION
  });
}

async function handleIntake(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // Shared-secret gate
  const sharedSecret = request.headers.get("x-bizlegal-secret");
  if (!env.WEBHOOK_SHARED_SECRET || sharedSecret !== env.WEBHOOK_SHARED_SECRET) {
    return json(401, { error: "unauthorized" });
  }

  // Parse + validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  const parsed = FormSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: "validation_failed", issues: parsed.error.issues });
  }
  const submission = parsed.data;

  // Seed profile
  const leadId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const seeded: LeadProfile = {
    lead_id: leadId,
    received_at: receivedAt,
    source: {
      form_url: request.headers.get("origin") ?? request.headers.get("referer") ?? "unknown",
      utm_source: submission.utm_source ?? null,
      utm_medium: submission.utm_medium ?? null,
      utm_campaign: submission.utm_campaign ?? null,
      referrer: submission.referrer ?? null,
      user_agent: request.headers.get("user-agent"),
      ip_country: request.headers.get("cf-ipcountry")
    },
    contact: {
      full_name: submission.full_name,
      email: submission.email,
      phone: submission.phone ?? null,
      role: null
    },
    pain: {
      raw_text: submission.challenge,
      extracted_challenge: null,
      jurisdictions_mentioned: [],
      regulations_mentioned: [],
      urgency_signals: [],
      budget_signals: []
    },
    pipeline_meta: {
      extraction_model: env.HAIKU_MODEL_ID,
      escalated_to_cloud: false,
      retries: 0,
      status: "received",
      error_class: null,
      error_detail: null,
      processed_at: null,
      duration_ms: null
    }
  };

  // Fire ops event for /ops dashboard visibility — non-blocking.
  ctx.waitUntil(
    logEvent(env, {
      type: "lead.inbound",
      ref_id: leadId,
      email: submission.email,
      status: "pending",
      metadata: {
        source_form_url: seeded.source.form_url,
        utm_source: submission.utm_source ?? null,
        utm_medium: submission.utm_medium ?? null,
        utm_campaign: submission.utm_campaign ?? null,
        ip_country: seeded.source.ip_country ?? null,
        challenge_chars: submission.challenge.length,
      },
    })
  );

  // Fire pipeline in the background so the form gets a fast 202.
  ctx.waitUntil(
    runPipeline(env, submission, seeded).catch((err) =>
      console.error("[intake] unhandled pipeline error:", err)
    )
  );

  return json(202, {
    accepted: true,
    lead_id: leadId,
    status: "received",
    received_at: receivedAt,
    version: env.PIPELINE_VERSION
  });
}

function json(
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}
