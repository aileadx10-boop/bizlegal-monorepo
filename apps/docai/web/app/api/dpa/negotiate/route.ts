import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  knowledgeStoreFromManifest,
  retrieve,
  compose,
  type GenerateCallable,
} from "@/lib/sqa"
import { DPA_CLAUSES } from "@/lib/dpa/dpa-clauses"
import { logEventAsync } from "@/lib/ops/log"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface NegotiateBody {
  your_dpa_text?: string
  customer_redline_text: string
  framework?: "gdpr" | "ccpa" | "hipaa"
  email?: string
}

const MAX_REDLINE_LEN = 16_000
const MAX_DPA_LEN = 16_000

function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY env var is not configured on this deployment")
  }
  return new Anthropic()
}

function buildGenerator(yourDpa: string): GenerateCallable {
  const client = getAnthropic()
  return async ({ query, context }) => {
    const contextText = context.length > 0 ? context.join("\n\n---\n\n") : "(no relevant clauses retrieved)"
    const prompt = `You are a contract-negotiation assistant for a B2B SaaS vendor. The customer has redlined the vendor's standard DPA. You have retrieved the relevant regulatory anchor clauses from public legal sources.

Produce a 3-column comparison classifying each material delta in the customer's redline:

CLASSIFICATION CATEGORIES:
- procedural — workflow / cadence / notification mechanics
- liability — caps, indemnities, breach of obligation
- sub-processor — list, objection windows, back-to-back terms
- residency — data transfer, third-country, data location

For each material delta, output:
1. Classification
2. Customer's stance (1 sentence)
3. Vendor's standard stance (1 sentence, citing the standard DPA)
4. Suggested compromise (1-2 sentences) WITH inline citation of the regulatory anchor (e.g. "(GDPR Art 28(3)(c))")

CONSTRAINTS:
- Output is decision-support, NOT legal advice. End with: "Reviewed by counsel before signing — this draft surfaces patterns from public regulatory text and industry baselines."
- Do not invent regulatory citations. Only cite from KNOWLEDGE BASE SNIPPETS below.
- If a customer ask falls outside the framework, say so plainly: "This delta is a commercial term outside ${query} — defer to your counsel."
- Use markdown table format for the 3-column comparison; keep each cell to ≤ 200 chars.
- ~400 words total.

VENDOR'S STANDARD DPA (excerpt):
"""
${yourDpa.slice(0, MAX_DPA_LEN) || "(vendor did not provide their standard DPA — work from regulatory anchors only)"}
"""

CUSTOMER'S REDLINE:
"""
${query.slice(0, 4000)}
"""

KNOWLEDGE BASE SNIPPETS (cite these inline):
"""
${contextText.slice(0, 8000)}
"""

Output the table + closing review-by-counsel line. No preamble, no headers above the table.`

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2400,
      messages: [{ role: "user", content: prompt }],
    })
    const textBlock = message.content.find((b) => b.type === "text")
    const text = textBlock && textBlock.type === "text" ? textBlock.text : ""

    const lowered = text.toLowerCase()
    const hedge = /(uncertain|cannot determine|insufficient|outside the framework|defer to your counsel)/.test(lowered)
    const uncertainty = hedge ? 0.3 : 0.15

    return { text, uncertainty }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<NegotiateBody>
    const redline = (body.customer_redline_text ?? "").trim()
    const yourDpa = (body.your_dpa_text ?? "").trim()
    const framework = body.framework ?? "gdpr"
    const email = (body.email ?? "").trim()

    if (!redline || redline.length < 40 || redline.length > MAX_REDLINE_LEN) {
      return NextResponse.json(
        { error: `customer_redline_text must be 40-${MAX_REDLINE_LEN} chars` },
        { status: 400 },
      )
    }
    if (yourDpa.length > MAX_DPA_LEN) {
      return NextResponse.json({ error: `your_dpa_text exceeds ${MAX_DPA_LEN} chars` }, { status: 400 })
    }
    if (!["gdpr", "ccpa", "hipaa"].includes(framework)) {
      return NextResponse.json({ error: "framework not supported" }, { status: 400 })
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 })
    }

    // 1. Retrieve relevant clauses (boost the requested framework)
    const kb = knowledgeStoreFromManifest(DPA_CLAUSES)
    const retrieval = await retrieve(kb, {
      text: redline,
      topics: [framework, "negotiation"],
      limit: 8,
    })

    // 2. Compose via Sonnet
    const generate = buildGenerator(yourDpa)
    const draft = await compose(retrieval, generate)

    logEventAsync({
      type: "dpa.negotiation",
      source: "docai",
      ref_id: draft.draft_id,
      email: email || undefined,
      status: draft.out_of_scope ? "pending" : "ok",
      metadata: {
        framework,
        confidence_tier: draft.confidence?.tier,
        confidence_score: draft.confidence?.score,
        out_of_scope: draft.out_of_scope,
      },
    })

    // 3. Return — note: revenue+liability framing in answer + disclosure
    return NextResponse.json({
      draft_id: draft.draft_id,
      framework,
      analysis: draft.answer,
      citations: draft.citations,
      confidence: draft.confidence,
      out_of_scope: draft.out_of_scope,
      disclaimer_version: draft.disclaimer_version,
      issued_at: draft.issued_at,
      legal_notice:
        "Decision-support only. Not legal advice. Review with licensed counsel before signing or sending. Sources cited above are public regulatory text + industry baselines, not bespoke advice for your transaction.",
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error"
    console.error("[dpa/negotiate]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
