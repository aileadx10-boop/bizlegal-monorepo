import { extractLead, mergeExtractIntoProfile } from "./extract";
import { critiqueExtraction, mergeCritiqueIntoProfile } from "./critique";
import { scoreLead, mergeScoreIntoProfile } from "./score";
import { summarizeLead, mergeSummaryIntoProfile } from "./summary";
import { commitLeadProfile, commitDlq } from "./github";
import { notifyLead, notifyDlq } from "./telegram";
import { classifyVertical } from "./vertical-classifier";
import { routeLeadToProduct } from "./inbound-lead";
import { logEvent } from "./ops-log";
import type { Env, FormSubmission, LeadProfile } from "./types";

export interface PipelineResult {
  readonly ok: boolean;
  readonly lead_id: string;
  readonly overall_score?: number;
  readonly recommended_action?: string;
  readonly escalated_to_cloud: boolean;
  readonly duration_ms: number;
  readonly error?: string;
}

export async function runPipeline(
  env: Env,
  submission: FormSubmission,
  seededProfile: LeadProfile
): Promise<PipelineResult> {
  const start = Date.now();
  let profile = seededProfile;

  try {
    // Stage 1: extract
    const extracted = await extractLead(env, submission);
    profile = mergeExtractIntoProfile(profile, extracted);
    profile = {
      ...profile,
      pipeline_meta: { ...profile.pipeline_meta, status: "extracted" }
    };

    // Stage 2: critique
    const critique = await critiqueExtraction(env, submission, extracted);
    profile = mergeCritiqueIntoProfile(profile, critique);

    // Day-3 TODO: if critique.escalate_to_cloud, re-extract with Sonnet 4.6
    // For Day-2 we proceed with Haiku-only output and flag escalated_to_cloud=false.

    // Stage 3: score
    const score = await scoreLead(env, profile);
    profile = mergeScoreIntoProfile(profile, score);

    // Stage 4: summary
    const summary = await summarizeLead(env, profile);
    profile = mergeSummaryIntoProfile(profile, summary);

    // Finalize pipeline metadata
    profile = {
      ...profile,
      pipeline_meta: {
        ...profile.pipeline_meta,
        status: "stored",
        processed_at: new Date().toISOString(),
        duration_ms: Date.now() - start
      }
    };

    // Persist to GitHub
    await commitLeadProfile(env, profile);

    // Notify Telegram (non-blocking; telegram errors are logged but don't fail pipeline)
    profile = {
      ...profile,
      pipeline_meta: { ...profile.pipeline_meta, status: "notified" }
    };
    await notifyLead(env, profile);

    // Stage 5: classify vertical + route to matching product (non-blocking).
    // Failure here MUST NOT fail the lead pipeline — the lead is already
    // committed to GitHub and notified. Routing is best-effort delivery
    // to the product CRM; product 5xx logs but doesn't poison the pipeline.
    let routedProduct: string | null = null;
    let routedOk = false;
    let routeStatus: number | null = null;
    let routeConfidence = 0;
    try {
      const classification = classifyVertical(profile);
      if (classification.product !== "none") {
        const routing = await routeLeadToProduct(env, profile, classification);
        routedProduct = routing.product;
        routedOk = routing.routed;
        routeStatus = routing.status ?? null;
        routeConfidence = classification.confidence;
        console.log(
          `[pipeline] routed=${routing.routed} product=${routing.product} ` +
            `confidence=${classification.confidence.toFixed(2)} ` +
            `reason=${classification.reason} status=${routing.status ?? "n/a"}`
        );
      } else {
        console.log("[pipeline] vertical=none — skip product routing");
      }
    } catch (routeErr) {
      console.error("[pipeline] routing failed (non-blocking):", routeErr);
    }

    // Fire qualified event so /ops sees scored leads. Fire-and-forget;
    // a logEvent failure must not perturb the pipeline result.
    void logEvent(env, {
      type: "lead.qualified",
      ref_id: profile.lead_id,
      email: profile.contact.email,
      status: "ok",
      metadata: {
        overall_score: profile.qualification?.overall_score ?? null,
        recommended_action: profile.qualification?.recommended_action ?? null,
        escalated_to_cloud: profile.pipeline_meta.escalated_to_cloud,
        duration_ms: profile.pipeline_meta.duration_ms ?? null,
        routed_product: routedProduct,
        routed_ok: routedOk,
        route_status: routeStatus,
        route_confidence: Number(routeConfidence.toFixed(2)),
      },
    });

    return {
      ok: true,
      lead_id: profile.lead_id,
      overall_score: profile.qualification?.overall_score,
      recommended_action: profile.qualification?.recommended_action,
      escalated_to_cloud: profile.pipeline_meta.escalated_to_cloud,
      duration_ms: Date.now() - start
    };
  } catch (err) {
    // Mark failed + dead-letter
    profile = {
      ...profile,
      pipeline_meta: {
        ...profile.pipeline_meta,
        status: "failed",
        error_class: err instanceof Error ? err.name : typeof err,
        error_detail: err instanceof Error ? err.message : String(err).slice(0, 500),
        processed_at: new Date().toISOString(),
        duration_ms: Date.now() - start
      }
    };
    try {
      await commitDlq(env, { submission, partial_profile: profile }, err);
      await notifyDlq(env, err, submission);
    } catch (dlqErr) {
      console.error("[pipeline] dlq also failed:", dlqErr);
    }
    void logEvent(env, {
      type: "error",
      ref_id: profile.lead_id,
      email: profile.contact.email,
      status: "failed",
      metadata: {
        stage: "pipeline",
        error_class: profile.pipeline_meta.error_class,
        error_detail: profile.pipeline_meta.error_detail,
        duration_ms: profile.pipeline_meta.duration_ms ?? null,
      },
    });
    return {
      ok: false,
      lead_id: profile.lead_id,
      escalated_to_cloud: profile.pipeline_meta.escalated_to_cloud,
      duration_ms: Date.now() - start,
      error: profile.pipeline_meta.error_detail ?? "unknown"
    };
  }
}
