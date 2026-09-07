import { NextRequest, NextResponse } from "next/server";
import {
  knowledgeStoreFromManifest,
  retrieve,
  compose,
  type KnowledgeBaseItem,
} from "@/lib/sqa";
import { SEED_KB, MAX_QUESTION_LEN, buildGenerator } from "@/lib/sqa/seed-kb";
import { isFirmTierActive, listFirmKb } from "@/lib/sqa/firm-kb";
import { logEventAsync } from "@/lib/ops/log";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DraftBody {
  question: string;
  email?: string;
  framework?: "soc2" | "caiq" | "sig-lite" | "sig" | "nist";
  context?: string;
}

// Seed KB + generator live in lib/sqa/seed-kb.ts (shared with /free-kb).
// Firm tier expands the seed KB by uploading firm-specific items
// (Phase G2 v2).

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<DraftBody>;
    const question = (body.question ?? "").trim();
    const framework = body.framework ?? "soc2";
    const email = (body.email ?? "").trim();

    if (!question || question.length < 8 || question.length > MAX_QUESTION_LEN) {
      return NextResponse.json(
        { error: `question must be 8-${MAX_QUESTION_LEN} chars` },
        { status: 400 },
      );
    }
    if (!["soc2", "caiq", "sig-lite", "sig", "nist"].includes(framework)) {
      return NextResponse.json({ error: "framework not supported" }, { status: 400 });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    // 1. Retrieve from blended KB:
    //    - Seed KB always available (free + Starter + Team + Firm tier)
    //    - Firm-tier subscribers also get their uploaded items blended in
    let firmKbCount = 0
    let firmTierActive = false
    let kbItems: KnowledgeBaseItem[] = SEED_KB

    if (email) {
      const paywall = await isFirmTierActive(email)
      if (paywall.ok) {
        firmTierActive = true
        const firmItems = await listFirmKb(email)
        firmKbCount = firmItems.length
        // Firm items are returned to the retriever AS-IS. Their relevance
        // ranking is determined by the same lexical matching as seed items.
        kbItems = [...SEED_KB, ...firmItems]
      }
    }

    const kb = knowledgeStoreFromManifest(kbItems);
    // Use framework as a topic filter so retrieval prioritises matching
    // KB items. Fall back to no filter if framework not supplied.
    const retrieval = await retrieve(kb, {
      text: question,
      topics: [framework],
      limit: firmTierActive ? 8 : 6,
    });

    // 2. Compose the draft via Sonnet
    const generate = buildGenerator();
    const draft = await compose(retrieval, generate);

    logEventAsync({
      type: "sqa.draft",
      source: "docai",
      ref_id: draft.draft_id,
      email: email || undefined,
      status: draft.out_of_scope ? "pending" : "ok",
      metadata: {
        framework,
        confidence_tier: draft.confidence?.tier,
        confidence_score: draft.confidence?.score,
        out_of_scope: draft.out_of_scope,
        firm_active: firmTierActive,
        firm_kb_blended: firmKbCount,
      },
    });

    // 3. Return draft + tier-info (so the UI can render the
    //    "Firm KB applied" badge when relevant)
    return NextResponse.json({
      draft_id: draft.draft_id,
      question: draft.query,
      answer: draft.answer,
      citations: draft.citations,
      confidence: draft.confidence,
      out_of_scope: draft.out_of_scope,
      disclaimer_version: draft.disclaimer_version,
      issued_at: draft.issued_at,
      tier_info: {
        firm_active: firmTierActive,
        firm_kb_items_blended: firmKbCount,
        seed_kb_items: SEED_KB.length,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error("[sqa/draft]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
