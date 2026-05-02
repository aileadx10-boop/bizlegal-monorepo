import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  knowledgeStoreFromManifest,
  retrieve,
  compose,
  type GenerateCallable,
  type KnowledgeBaseItem,
} from "@/lib/sqa";
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

const MAX_QUESTION_LEN = 4000;

// Seed KB — minimal SOC 2 / CAIQ / SIG-Lite + privacy items so first
// draft can ground in real material rather than always going out-of-
// scope. Expand by uploading firm-specific items in the Firm tier
// (Phase G2 v2). KnowledgeBaseItem fields per lib/sqa/knowledge-base.ts:
// id, source_name, source_url, jurisdiction, topics, text, last_updated.
const NOW_ISO = new Date().toISOString();

const SEED_KB: KnowledgeBaseItem[] = [
  {
    id: "soc2-cc6.1-encryption-at-rest",
    source_name: "AICPA SOC 2 Trust Services Criteria — CC6.1",
    source_url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services",
    jurisdiction: "OTHER",
    topics: ["soc2", "encryption", "at-rest", "aes-256", "kms"],
    text: "All customer data is encrypted at rest using AES-256. Database-level encryption is enforced via the cloud provider's managed key service (e.g. AWS KMS, GCP KMS). Application-layer secrets are encrypted with envelope encryption.",
    last_updated: NOW_ISO,
  },
  {
    id: "soc2-cc6.7-tls",
    source_name: "AICPA SOC 2 — CC6.7",
    source_url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services",
    jurisdiction: "OTHER",
    topics: ["soc2", "tls", "in-transit", "https", "hsts"],
    text: "All data in transit uses TLS 1.2 or 1.3. HTTPS-only enforcement at the edge load balancer; HSTS preload enabled with max-age 1 year.",
    last_updated: NOW_ISO,
  },
  {
    id: "soc2-cc7.4-incident-response",
    source_name: "AICPA SOC 2 — CC7.4",
    source_url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services",
    jurisdiction: "OTHER",
    topics: ["soc2", "incident-response", "post-mortem", "escalation"],
    text: "Documented incident response plan with severity-tiered escalation. 24h initial response, 72h customer notification SLA. Quarterly tabletop exercises. Post-mortem with corrective action tracking.",
    last_updated: NOW_ISO,
  },
  {
    id: "caiq-ccm-iam-09-mfa",
    source_name: "CSA Cloud Controls Matrix — IAM-09",
    source_url: "https://cloudsecurityalliance.org/research/working-groups/cloud-controls-matrix/",
    jurisdiction: "OTHER",
    topics: ["caiq", "mfa", "iam", "fido2", "webauthn", "privileged-access"],
    text: "MFA is required for all privileged access to production systems. Enforced via SSO with hardware-key (FIDO2 / WebAuthn) for engineering staff. Time-based OTP fallback for non-engineering admin roles.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art-30-rop",
    source_name: "GDPR Article 30 — Records of Processing",
    source_url: "https://gdpr-info.eu/art-30-gdpr/",
    jurisdiction: "EU",
    topics: ["sig-lite", "gdpr", "article-30", "records-of-processing", "rop"],
    text: "Article 30 records are maintained covering processor name + contact, processing purpose, data categories, recipients, transfer destinations, retention periods, and security measures. Updated quarterly + on material change.",
    last_updated: NOW_ISO,
  },
  {
    id: "soc2-cc1-organisational-structure",
    source_name: "AICPA SOC 2 — CC1.0",
    source_url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services",
    jurisdiction: "OTHER",
    topics: ["soc2", "control-environment", "separation-of-duties", "access-review"],
    text: "Documented organisational structure with role responsibilities. Separation of duties enforced for code-deploy, infra-change, and customer-data access. Annual access review by people-ops + engineering leadership.",
    last_updated: NOW_ISO,
  },
  {
    id: "data-retention-and-deletion",
    source_name: "Internal Data Retention Policy v2.0",
    source_url: "https://docai.bizlegal-ai.com/security",
    jurisdiction: "OTHER",
    topics: ["sig-lite", "retention", "deletion", "gdpr-17", "right-to-be-forgotten"],
    text: "Customer-submitted document content is processed in-memory only and not persisted. Metadata (prompt summary, AI usage timestamps, reviewer identity) retained for 24 months. Customer can request hard-delete via support@; honored within 30 days per GDPR Article 17.",
    last_updated: NOW_ISO,
  },
  {
    id: "subprocessors-list",
    source_name: "Public Subprocessors List",
    source_url: "https://docai.bizlegal-ai.com/methodology",
    jurisdiction: "OTHER",
    topics: ["sig-lite", "subprocessors", "dpa", "ai-training", "zero-retention"],
    text: "Production subprocessors: Vercel (hosting), Supabase (database — RLS isolated per firm), Anthropic (Sonnet 4.6 inference, zero-retention mode), Resend (email). All under DPA. Customer data is never used for AI training.",
    last_updated: NOW_ISO,
  },
];

function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY env var is not configured on this deployment");
  }
  return new Anthropic();
}

function buildGenerator(): GenerateCallable {
  const client = getAnthropic();
  return async ({ query, context }) => {
    const contextText = context.length > 0 ? context.join("\n\n---\n\n") : "(no relevant context retrieved)";
    const prompt = `You are a security-questionnaire response drafter for a B2B SaaS company. The vendor has been asked the question below and you have the company's policy snippets retrieved from the knowledge base.

Draft a 2-3 paragraph answer that directly answers the question, grounded in the snippets. If the snippets don't fully cover the question, ADMIT the limit explicitly — do not invent facts. Cite the source names you used in parentheses inline.

QUESTION:
"""
${query.slice(0, 2000)}
"""

KNOWLEDGE BASE SNIPPETS:
"""
${contextText.slice(0, 6000)}
"""

CONSTRAINTS:
- Direct, professional tone suitable for SOC 2 / CAIQ / SIG-Lite responses
- 2-3 paragraphs, ~200 words
- Cite source names inline like (AICPA SOC 2 — CC6.1)
- If you have to admit limits, say so plainly using phrases like "we do not currently…", "out of scope", "uncertain"
- Output the answer text only — no preamble, no markdown headers, no bullet lists`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

    // Heuristic uncertainty: if Sonnet hedged with "uncertain" / "we do not", uncertainty up
    const lowered = text.toLowerCase();
    const hedge = /(uncertain|we do not|out of scope|insufficient|cannot confirm)/.test(lowered);
    const uncertainty = hedge ? 0.4 : 0.1;

    return { text, uncertainty };
  };
}

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
