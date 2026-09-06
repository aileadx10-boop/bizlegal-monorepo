import { schedules } from "@trigger.dev/sdk";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * process-content-queue (M.1)
 *
 * Every 6 hours: drain pending rows from `content_queue` (migration
 * 20260906), mark them 'processing', and POST each to the n8n marketing
 * webhook. n8n publishes and reports back to the hub's
 * /api/marketing/callback, which sets the final status.
 *
 * Deliberately defensive:
 *  - Missing N8N_MARKETING_WEBHOOK_URL → logged, run exits cleanly (n8n
 *    side is goal M.2, external to this repo).
 *  - Missing Supabase env or content_queue table → logged, clean exit.
 *  - A failed POST returns the row to 'pending' so the next run retries;
 *    per-item failures never fail the whole run.
 */

interface QueueRow {
  id: string;
  product: string;
  event_type: string;
  payload: Record<string, unknown>;
  content_types: string[] | null;
  scheduled_for: string | null;
  created_at: string;
}

const BATCH_LIMIT = 50;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.warn("[process-content-queue] Supabase env not configured — skipping run");
    return null;
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  return err?.code === "42P01" || (err?.message ?? "").includes("content_queue");
}

export const processContentQueue = schedules.task({
  id: "process-content-queue",
  cron: { pattern: "0 */6 * * *", timezone: "UTC" }, // every 6 hours
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
    randomize: true,
  },
  run: async () => {
    const webhookUrl = process.env.N8N_MARKETING_WEBHOOK_URL;
    if (!webhookUrl) {
      // n8n adaptation is goal M.2 and lives outside this repo — until the
      // webhook URL is provisioned there is nothing to hand items to.
      console.log("[process-content-queue] N8N_MARKETING_WEBHOOK_URL not set — skipping run");
      return { skipped: true, reason: "n8n_webhook_not_configured" };
    }

    const supabase = getSupabase();
    if (!supabase) return { skipped: true, reason: "supabase_not_configured" };

    const now = new Date().toISOString();
    const { data: items, error } = await supabase
      .from("content_queue")
      .select("id, product, event_type, payload, content_types, scheduled_for, created_at")
      .eq("status", "pending")
      .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
      .order("created_at", { ascending: true })
      .limit(BATCH_LIMIT);

    if (error) {
      if (isMissingTable(error)) {
        console.warn("[process-content-queue] content_queue missing — apply 20260906_content_queue.sql");
        return { skipped: true, reason: "content_queue_table_missing" };
      }
      throw new Error(`content_queue fetch failed: ${error.message}`);
    }

    const rows = (items ?? []) as QueueRow[];
    if (rows.length === 0) {
      console.log("[process-content-queue] no pending items");
      return { processed: 0 };
    }

    let dispatched = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        // Claim the row first so a concurrent run can't double-dispatch.
        const { error: claimErr } = await supabase
          .from("content_queue")
          .update({ status: "processing" })
          .eq("id", row.id)
          .eq("status", "pending");
        if (claimErr) throw new Error(`claim failed: ${claimErr.message}`);

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queue_id: row.id,
            product: row.product,
            event_type: row.event_type,
            payload: row.payload,
            content_types: row.content_types,
            callback_url: process.env.MARKETING_CALLBACK_URL ?? "https://bizlegal-ai.com/api/marketing/callback",
          }),
        });

        if (!res.ok) {
          throw new Error(`n8n webhook ${res.status}`);
        }
        dispatched++;
      } catch (err) {
        failed++;
        console.warn(
          `[process-content-queue] item ${row.id} failed:`,
          err instanceof Error ? err.message : err,
        );
        // Back to pending so the next 6h run retries it.
        await supabase
          .from("content_queue")
          .update({ status: "pending" })
          .eq("id", row.id)
          .eq("status", "processing");
      }
    }

    console.log(`[process-content-queue] dispatched=${dispatched} failed=${failed}`);
    return { processed: rows.length, dispatched, failed };
  },
});
