import { NextRequest, NextResponse } from "next/server";
import {
  knowledgeStoreFromManifest,
  retrieve,
  compose,
} from "@/lib/sqa";
import { SEED_KB, MAX_QUESTION_LEN, buildGenerator } from "@/lib/sqa/seed-kb";
import { supabaseAdmin } from "@/lib/supabase";
import { enqueueNurture } from "@/lib/nurture-enqueue";
import { logEventAsync } from "@/lib/ops/log";
import { verifyTurnstile, clientIpFromHeaders } from "@bizlegal/turnstile-verify";
import { rateLimit } from "@bizlegal/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/free-kb/ask — the /free-kb demo endpoint (marathon goal 3.2).
 *
 * Free slice of the SQA engine: same retrieval + compose machinery as
 * /api/sqa/draft, grounded in the PUBLIC seed KB only — no Firm-tier KB
 * blending, no PDF export, no saved drafts.
 *
 * Guardrails (fleet pattern from falseecho /api/scan + docai
 * /api/decision-tree/lead):
 *   - In-memory IP rate limit: 3 questions per day per IP (backstop;
 *     per-instance on serverless — see packages/rate-limit).
 *   - Cloudflare Turnstile bot challenge (skip-if-unconfigured).
 *
 * Lead capture on submit follows the fleet nurture pattern
 * (apps/sellerradar/app/api/lead/route.ts): row in `leads` + nurture
 * enqueue with vertical 'docai'. Fire-and-forget — never blocks the
 * answer.
 */

const FREE_QUESTIONS_PER_DAY = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const FRAMEWORKS = ["soc2", "caiq", "sig-lite", "sig", "nist"] as const;
type Framework = (typeof FRAMEWORKS)[number];

interface AskBody {
  question?: string;
  framework?: Framework;
  email?: string;
  turnstile_token?: string;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AskBody;
    const question = (body.question ?? "").trim();
    const framework = body.framework ?? "soc2";
    const email = (body.email ?? "").trim().toLowerCase();

    if (!question || question.length < 8 || question.length > MAX_QUESTION_LEN) {
      return NextResponse.json(
        { error: `question must be 8-${MAX_QUESTION_LEN} chars` },
        { status: 400 },
      );
    }
    if (!FRAMEWORKS.includes(framework)) {
      return NextResponse.json({ error: "framework not supported" }, { status: 400 });
    }
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    // 1. Rate-limit before Turnstile (fleet D10 order).
    const ip = clientIpFromHeaders(req.headers) ?? "unknown";
    const rl = rateLimit("docai-free-kb", ip, {
      windowMs: DAY_MS,
      limit: FREE_QUESTIONS_PER_DAY,
    });
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: "free_limit_reached",
          message: `You've used your ${FREE_QUESTIONS_PER_DAY} free questions for today. The Team tier lifts the cap.`,
          retry_after_ms: rl.retryAfterMs,
        },
        { status: 429, headers: { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

    // 2. Turnstile bot challenge (skip-if-unconfigured).
    const turnstile = await verifyTurnstile({
      token: body.turnstile_token,
      clientIp: ip,
    });
    if (!turnstile.ok) {
      return NextResponse.json(
        { error: "turnstile_failed", codes: turnstile.errorCodes },
        { status: 403 },
      );
    }

    // 3. Public seed KB only — the paid SQA route blends the firm KB;
    //    this demo never does.
    const kb = knowledgeStoreFromManifest(SEED_KB);
    const retrieval = await retrieve(kb, {
      text: question,
      topics: [framework],
      limit: 5,
    });

    const generate = buildGenerator();
    const draft = await compose(retrieval, generate);

    logEventAsync({
      type: "sqa.draft",
      source: "docai",
      ref_id: draft.draft_id,
      email: email || undefined,
      status: draft.out_of_scope ? "pending" : "ok",
      metadata: {
        surface: "free-kb",
        framework,
        confidence_tier: draft.confidence?.tier,
        confidence_score: draft.confidence?.score,
        out_of_scope: draft.out_of_scope,
        free_questions_remaining: rl.remaining,
      },
    });

    // 4. Lead capture on submit (fleet nurture pattern). Pinned to
    //    (email, magnet) so repeat questions don't restart the cadence.
    if (email) {
      const leadId = `docai-free-kb-${email}`;
      supabaseAdmin
        .from("leads")
        .insert({ email, source: "free-kb", page: "/free-kb", product: "docai" })
        .then(({ error }) => {
          if (error) console.warn("[free-kb/ask] leads insert failed:", error.message);
        });
      void enqueueNurture({
        lead_id: leadId,
        email,
        vertical: "docai",
        source: "docai:free-kb",
        lead_classification: { surface: "free-kb", framework },
      }).catch((err) => console.warn("[free-kb/ask] nurture enqueue failed:", err));
      logEventAsync({
        type: "lead.qualified",
        source: "docai",
        ref_id: leadId,
        email,
        status: "ok",
        metadata: { magnet: "free-kb", framework },
      });
    }

    return NextResponse.json({
      draft_id: draft.draft_id,
      question: draft.query,
      answer: draft.answer,
      citations: draft.citations,
      confidence: draft.confidence,
      out_of_scope: draft.out_of_scope,
      disclaimer_version: draft.disclaimer_version,
      issued_at: draft.issued_at,
      free_questions_remaining: rl.remaining,
      free_questions_per_day: FREE_QUESTIONS_PER_DAY,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error("[free-kb/ask]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
