import {
  draftSnapshot,
  critiqueSnapshot,
  renderSnapshotMarkdown,
  type JurisdictionSnapshot,
  type SnapshotRequest
} from "./reports";
import { generateImage, snapshotHeroPrompt } from "./gemini";
import { sendSnapshotEmail } from "./resend";
import { renderSnapshotPdf } from "./pdf";
import { logEvent } from "./ops-log";
import type { Env } from "./types";

const GITHUB_API = "https://api.github.com";
const API_VERSION = "2022-11-28";

export interface SnapshotPipelineResult {
  readonly ok: boolean;
  readonly snapshot_id: string;
  readonly winner_code?: string | null;
  readonly factual_confidence?: number;
  readonly escalated_to_sonnet: boolean;
  readonly duration_ms: number;
  readonly error?: string;
}

export async function runSnapshotPipeline(
  env: Env,
  request: SnapshotRequest,
  requestHeaders: Headers,
  seed: { snapshotId: string; requestedAt: string; deliverEmail?: boolean }
): Promise<SnapshotPipelineResult> {
  const start = Date.now();
  const snapshotId = seed.snapshotId;
  const requestedAt = seed.requestedAt;

  let snap: JurisdictionSnapshot = {
    snapshot_id: snapshotId,
    requested_at: requestedAt,
    request,
    jurisdictions: [],
    pipeline_meta: {
      draft_model: env.HAIKU_MODEL_ID,
      critique_model: null,
      retries: 0,
      status: "received",
      error_class: null,
      error_detail: null,
      processed_at: null,
      duration_ms: null
    }
  };

  try {
    // Stage 1: Sonnet draft — the only strictly-required call
    const draft = await draftSnapshot(env, request);
    snap = {
      ...snap,
      jurisdictions: draft.jurisdictions,
      side_by_side: draft.side_by_side,
      citations: draft.citations,
      pipeline_meta: {
        ...snap.pipeline_meta,
        status: "drafted",
        processed_at: new Date().toISOString(),
        duration_ms: Date.now() - start
      }
    };

    // Commit snapshot AS-IS right after draft. Even if later stages timeout
    // against the CF free-tier 30s budget, the text snapshot is durably stored.
    await commitSnapshot(env, snap);

    // Stage 2: Haiku critique (best-effort; re-commits if successful)
    try {
      const critique = await critiqueSnapshot(env, request, draft);
      snap = {
        ...snap,
        critique,
        pipeline_meta: {
          ...snap.pipeline_meta,
          critique_model: env.HAIKU_MODEL_ID,
          status: "critiqued",
          duration_ms: Date.now() - start
        }
      };
      await commitSnapshot(env, snap);
    } catch (err) {
      console.warn("[snapshot] critique stage failed (non-fatal):", err);
    }

    // Stage 3: Nano Banana hero image (best-effort; adds another re-commit)
    try {
      const heroImage = await generateImage(env, snapshotHeroPrompt(snap));
      if (heroImage) {
        const heroPath = `reports/snapshots/${snap.requested_at.slice(0, 10)}-${snap.snapshot_id.slice(0, 8)}.${extensionForMime(heroImage.mimeType)}`;
        await putBinaryFile(env, heroPath, heroImage.base64, `snapshot-hero: ${snap.snapshot_id.slice(0, 8)}`);
        snap = {
          ...snap,
          hero_image: {
            path: heroPath,
            mime_type: heroImage.mimeType,
            generator: "gemini-2.5-flash-image"
          },
          pipeline_meta: {
            ...snap.pipeline_meta,
            status: "stored",
            duration_ms: Date.now() - start
          }
        };
        await commitSnapshot(env, snap);
      }
    } catch (err) {
      console.warn("[snapshot] image stage failed (non-fatal):", err);
    }

    // Stage 4: Telegram notify (internal — Moses sees every snapshot in his bot)
    await notifySnapshot(env, snap);

    // Stage 5: Email delivery to requester (only if caller opted in — public endpoint).
    // Includes a branded 1-2 page PDF attachment generated from the snapshot.
    if (seed.deliverEmail) {
      try {
        let attachments: Array<{ filename: string; content: string; contentType?: string }> = [];
        try {
          const pdfBytes = await renderSnapshotPdf(snap);
          const pdfBase64 = uint8ToBase64(pdfBytes);
          const pdfName = `bizlegal-ai-snapshot-${snap.request.jurisdiction_codes.join("-vs-")}.pdf`;
          attachments = [{ filename: pdfName, content: pdfBase64, contentType: "application/pdf" }];
        } catch (pdfErr) {
          console.warn("[snapshot] PDF render failed; sending HTML-only email:", pdfErr);
        }

        const emailResult = await sendSnapshotEmail(env, snap, attachments);
        if (emailResult.ok) {
          snap = {
            ...snap,
            pipeline_meta: { ...snap.pipeline_meta, status: "delivered" }
          };
          console.log(`[snapshot] email sent to ${request.email} (id=${emailResult.id})`);
        }
      } catch (err) {
        console.warn("[snapshot] email delivery failed (non-fatal):", err);
      }
    }

    // V0.4 — public snapshot pipeline now fires snapshot.generated so
    // /ops sees the volume of free lead-magnet snapshots being produced.
    void logEvent(env, {
      type: "snapshot.generated",
      ref_id: snapshotId,
      email: request.email,
      status: "ok",
      metadata: {
        winner_code: snap.side_by_side?.winner_code ?? null,
        factual_confidence: snap.critique?.factual_confidence ?? null,
        escalated_to_sonnet: snap.critique?.escalate_to_sonnet ?? false,
        jurisdictions: request.jurisdiction_codes,
        duration_ms: Date.now() - start,
        delivered_email: seed.deliverEmail ?? false,
      },
    });

    return {
      ok: true,
      snapshot_id: snapshotId,
      winner_code: snap.side_by_side?.winner_code ?? null,
      factual_confidence: snap.critique?.factual_confidence,
      escalated_to_sonnet: snap.critique?.escalate_to_sonnet ?? false,
      duration_ms: Date.now() - start
    };
  } catch (err) {
    snap = {
      ...snap,
      pipeline_meta: {
        ...snap.pipeline_meta,
        status: "failed",
        error_class: err instanceof Error ? err.name : typeof err,
        error_detail: err instanceof Error ? err.message : String(err).slice(0, 500),
        processed_at: new Date().toISOString(),
        duration_ms: Date.now() - start
      }
    };
    try {
      await commitSnapshotDlq(env, snap, err);
    } catch (dlqErr) {
      console.error("[snapshot] dlq also failed:", dlqErr);
    }
    void logEvent(env, {
      type: "error",
      ref_id: snapshotId,
      email: request.email,
      status: "failed",
      metadata: {
        stage: "snapshot_pipeline",
        error_class: snap.pipeline_meta.error_class,
        error_detail: snap.pipeline_meta.error_detail,
        duration_ms: Date.now() - start,
      },
    });
    return {
      ok: false,
      snapshot_id: snapshotId,
      escalated_to_sonnet: snap.critique?.escalate_to_sonnet ?? false,
      duration_ms: Date.now() - start,
      error: snap.pipeline_meta.error_detail ?? "unknown"
    };
  }
}

// ------------------------------------------------------------------
// GitHub commit helpers (inline for Day 1; extract later if shared)
// ------------------------------------------------------------------

async function commitSnapshot(env: Env, snap: JurisdictionSnapshot): Promise<void> {
  const baseName = `${snap.requested_at.slice(0, 10)}-${snap.snapshot_id.slice(0, 8)}`;
  const jsonPath = `reports/snapshots/${baseName}.json`;
  const mdPath = `reports/snapshots/${baseName}.md`;
  const action = snap.critique?.escalate_to_sonnet ? "escalate" : "ok";

  // Sequential: a prior parallel version had one half fail silently when the
  // GitHub API was under light load, leaving the JSON updated and the MD stale.
  // Sequential is only ~1-2s slower and guarantees both files stay in sync.
  await putFile(env, {
    path: jsonPath,
    content: JSON.stringify(snap, null, 2),
    message: `snapshot: ${baseName} (${snap.request.jurisdiction_codes.join(" vs ")}) (${action})`
  });
  await putFile(env, {
    path: mdPath,
    content: renderSnapshotMarkdown(snap),
    message: `snapshot-md: ${baseName} (${action})`
  });
}

async function commitSnapshotDlq(env: Env, snap: JurisdictionSnapshot, err: unknown): Promise<void> {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `outputs/dlq/snapshot-${ts}.json`;
  const content = JSON.stringify(
    {
      dlq_ts: new Date().toISOString(),
      error_class: err instanceof Error ? err.name : typeof err,
      error_message: err instanceof Error ? err.message : String(err).slice(0, 500),
      partial_snapshot: snap
    },
    null,
    2
  );
  await putFile(env, {
    path,
    content,
    message: `dlq: snapshot ${ts} (${err instanceof Error ? err.name : "unknown"})`
  });
}

async function putFile(
  env: Env,
  input: { path: string; content: string; message: string }
): Promise<void> {
  // UTF-8 safe base64 for text content
  const b64 = btoa(unescape(encodeURIComponent(input.content)));
  await putFileBase64(env, input.path, b64, input.message);
}

async function putBinaryFile(env: Env, path: string, base64: string, message: string): Promise<void> {
  await putFileBase64(env, path, base64, message);
}

async function putFileBase64(
  env: Env,
  path: string,
  base64Content: string,
  message: string
): Promise<void> {
  const url = `${GITHUB_API}/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/contents/${encodeURIComponent(path)}`;
  let sha: string | undefined;

  try {
    const res = await fetch(`${url}?ref=${env.GITHUB_DEFAULT_BRANCH}`, {
      headers: headers(env)
    });
    if (res.ok) {
      const body = (await res.json()) as { sha: string };
      sha = body.sha;
    }
  } catch {
    // File may not exist — proceed without sha for creation
  }

  const body = {
    message,
    content: base64Content,
    branch: env.GITHUB_DEFAULT_BRANCH,
    ...(sha ? { sha } : {})
  };
  const putRes = await fetch(url, {
    method: "PUT",
    headers: headers(env),
    body: JSON.stringify(body)
  });
  if (!putRes.ok) {
    const detail = await putRes.text().catch(() => "<unreadable>");
    throw new Error(`GitHub PUT ${path} -> ${putRes.status}: ${detail.slice(0, 300)}`);
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  // Workers: btoa needs a binary string. Chunk to avoid call-stack blowup on large payloads.
  let binary = "";
  const chunk = 32_768;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

function headers(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "bizlegal-lead-intake-worker"
  };
}

// ------------------------------------------------------------------
// Telegram notify for snapshot completion
// ------------------------------------------------------------------

async function notifySnapshot(env: Env, snap: JurisdictionSnapshot): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const [a, b] = snap.jurisdictions;
  const datePart = snap.requested_at.slice(0, 10);
  const shortId = snap.snapshot_id.slice(0, 8);
  const ghPath = `bizlegal-ea/reports/snapshots/${datePart}-${shortId}.md`;
  const verdict = snap.side_by_side?.verdict ?? "no verdict";
  const conf = snap.critique?.factual_confidence ?? 0;
  const escalate = snap.critique?.escalate_to_sonnet ?? false;

  const lines = [
    `*📊 New Jurisdiction Snapshot*`,
    "",
    `*${escapeMd(snap.request.full_name)}* · ${escapeMd(snap.request.email)}`,
    `${escapeMd(a?.display_name ?? "?")} vs ${escapeMd(b?.display_name ?? "?")}`,
    `Activity: ${escapeMd(snap.request.activity.slice(0, 120))}`,
    "",
    `*Verdict:* ${escapeMd(verdict)}`,
    `*Confidence:* ${escapeMd(conf.toFixed(2))}${escalate ? " \\(flagged for escalation\\)" : ""}`,
    "",
    `_GitHub: ${escapeMd(ghPath)}_`
  ];
  await sendTelegram(env, lines.join("\n"));
}

async function sendTelegram(env: Env, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: env.TELEGRAM_CHAT_ID,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "<unreadable>");
    console.warn(`[telegram/snapshot] send failed ${res.status}: ${detail.slice(0, 300)}`);
  }
}

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}
