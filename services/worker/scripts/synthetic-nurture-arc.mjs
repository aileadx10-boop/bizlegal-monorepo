#!/usr/bin/env node
// Synthetic 7-day nurture arc — drives one row through welcome →
// education → comparison → last_call → done by fast-forwarding the
// row's next_send_at against Supabase, then nudging the worker's
// 5-min cron via the manual scheduled handler URL.
//
// Why mock time vs. waiting 7 days: the row's state transitions are
// gated by next_send_at <= now(), so PATCHing next_send_at to a few
// seconds in the past is functionally identical to time passing.
// The cron then picks the row up on its next /5-min tick (or we can
// trigger it directly via wrangler trigger).
//
// Run from Moses's box (has SUPABASE_URL + SUPABASE_SECRET):
//   node services/worker/scripts/synthetic-nurture-arc.mjs \
//        --email moses+test@bizlegal-ai.com \
//        --vertical brai
//
// What this proves end-to-end:
//   1. enqueue creates a lead_nurture_state row
//   2. cron picks it up, sends welcome, advances next_step + next_send_at
//   3. mock-time-fwd → cron picks it up, sends education, advances
//   4. mock-time-fwd → cron sends comparison, advances
//   5. mock-time-fwd → cron sends last_call, archives row (done)
//   6. final state: next_step='done', emails_sent=4, archived_at set
//
// Idempotent: re-running with the same lead_id returns the existing row.
// Cleanup: --cleanup removes the row after the arc completes.

import { argv, env, exit } from "node:process";

const STEPS = ["welcome", "education", "comparison", "last_call"];

function parseArgs(rawArgs) {
  const out = {
    email: null,
    vertical: "generic",
    leadId: null,
    cleanup: false,
    dryRun: false,
    timeoutMs: 8 * 60_000, // 8 min: gives 5-min cron tick + slack
    pollIntervalMs: 15_000,
  };
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--email") out.email = rawArgs[++i];
    else if (arg === "--vertical") out.vertical = rawArgs[++i];
    else if (arg === "--lead-id") out.leadId = rawArgs[++i];
    else if (arg === "--cleanup") out.cleanup = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--timeout-ms") out.timeoutMs = Number(rawArgs[++i]);
    else if (arg === "--poll-interval-ms") out.pollIntervalMs = Number(rawArgs[++i]);
    else if (arg === "--help" || arg === "-h") {
      printHelpAndExit(0);
    } else {
      console.error(`Unknown arg: ${arg}`);
      printHelpAndExit(2);
    }
  }
  if (!out.email) {
    console.error("--email is required");
    printHelpAndExit(2);
  }
  if (!out.leadId) {
    out.leadId = `synthetic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return out;
}

function printHelpAndExit(code) {
  console.log(`Usage: node synthetic-nurture-arc.mjs --email <to> [opts]
  --email <addr>          REQUIRED: synthetic recipient (use a real inbox you control)
  --vertical <name>       boi|brai|tracr|lexaudit|docai|forge|leadforge|realestate|generic (default: generic)
  --lead-id <id>          override the auto-generated lead_id
  --cleanup               delete the row after the arc finishes
  --dry-run               print plan but don't write to Supabase
  --timeout-ms <n>        per-step wait timeout (default: 480000 = 8 min)
  --poll-interval-ms <n>  poll cadence (default: 15000)
  --help                  this`);
  exit(code);
}

function requireEnv(name) {
  const value = env[name];
  if (!value) {
    console.error(`env ${name} required`);
    exit(2);
  }
  return value;
}

// Lazy creds — let --dry-run and --help work without Supabase access.
let supabaseUrl;
let supabaseKey;
let baseHeaders;
function ensureSbReady() {
  if (baseHeaders) return;
  supabaseUrl = requireEnv("SUPABASE_URL");
  supabaseKey = requireEnv("SUPABASE_SECRET");
  baseHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };
}

async function sbFetch(method, path, { params, body, prefer } = {}) {
  ensureSbReady();
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const headers = { ...baseHeaders };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getRow(leadId) {
  const rows = await sbFetch("GET", "lead_nurture_state", {
    params: { lead_id: `eq.${leadId}`, select: "*", limit: "1" },
  });
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function enqueueRow({ leadId, email, vertical }) {
  const existing = await getRow(leadId);
  if (existing) {
    console.log(`  [enqueue] row already exists id=${existing.id} step=${existing.next_step}`);
    return existing;
  }
  const inserted = await sbFetch("POST", "lead_nurture_state", {
    body: {
      lead_id: leadId,
      email,
      vertical,
      source: "synthetic:nurture-arc",
      lead_classification: { synthetic: true, started_at: new Date().toISOString() },
      next_step: "welcome",
      next_send_at: new Date().toISOString(),
    },
    prefer: "return=representation,resolution=ignore-duplicates",
  });
  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  console.log(`  [enqueue] inserted id=${row.id} step=${row.next_step}`);
  return row;
}

async function fastForward(rowId) {
  const past = new Date(Date.now() - 60_000).toISOString();
  await sbFetch("PATCH", "lead_nurture_state", {
    params: { id: `eq.${rowId}` },
    body: { next_send_at: past },
  });
}

async function deleteRow(rowId) {
  await sbFetch("DELETE", "lead_nurture_state", {
    params: { id: `eq.${rowId}` },
    prefer: "return=minimal",
  });
}

function fmtRow(row) {
  return `step=${row.next_step} sent=${row.emails_sent} last=${row.last_sent_at || "—"} archived=${row.archived_at || "—"}`;
}

async function waitForStep(leadId, expectFromStep, expectToStep, deadline, pollIntervalMs) {
  // Wait until the row advances OFF expectFromStep. Returns the new row.
  while (Date.now() < deadline) {
    const row = await getRow(leadId);
    if (!row) throw new Error(`row vanished while waiting for ${expectFromStep}→${expectToStep}`);
    if (row.next_step !== expectFromStep || row.archived_at) {
      console.log(`  [arc] advanced ${expectFromStep}→${row.next_step}: ${fmtRow(row)}`);
      return row;
    }
    await sleep(pollIntervalMs);
  }
  throw new Error(`timed out waiting for step ${expectFromStep}→${expectToStep}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs(argv.slice(2));
  console.log(`synthetic nurture arc: lead_id=${args.leadId} email=${args.email} vertical=${args.vertical}`);
  if (args.dryRun) {
    console.log("(dry-run) plan:");
    console.log("  1. enqueue lead_nurture_state row with next_step=welcome, next_send_at=now");
    for (let i = 0; i < STEPS.length; i++) {
      const cur = STEPS[i];
      const next = STEPS[i + 1] || "done";
      console.log(`  ${i + 2}. wait for cron to send ${cur}, advance to ${next}; then PATCH next_send_at backwards`);
    }
    if (args.cleanup) console.log("  N. DELETE row");
    exit(0);
  }

  const startedAt = Date.now();
  const row = await enqueueRow({
    leadId: args.leadId,
    email: args.email,
    vertical: args.vertical,
  });

  let current = row;
  for (let i = 0; i < STEPS.length; i++) {
    const cur = STEPS[i];
    const next = STEPS[i + 1] || "done";
    if (current.next_step !== cur) {
      console.log(`  [skip] row already past ${cur}; current=${current.next_step}`);
      continue;
    }
    if (i === 0) {
      console.log(`  [arc] step 1/4: waiting for ${cur} send (cron tick ≤ 5 min)`);
    } else {
      // For non-welcome steps, the row's next_send_at is +N days; we
      // patch it backwards so the cron picks it on its next tick.
      console.log(`  [arc] fast-forward next_send_at < now() so cron picks ${cur}`);
      await fastForward(current.id);
    }
    const deadline = Date.now() + args.timeoutMs;
    current = await waitForStep(args.leadId, cur, next, deadline, args.pollIntervalMs);
  }

  console.log(`\nfinal state: ${fmtRow(current)}`);
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  console.log(`arc complete in ${elapsed}s`);

  if (current.next_step !== "done" || !current.archived_at) {
    console.error("WARN: row did not reach done+archived; check worker logs");
    exit(1);
  }
  if (current.emails_sent !== 4) {
    console.error(`WARN: expected emails_sent=4, got ${current.emails_sent}`);
    exit(1);
  }

  if (args.cleanup) {
    console.log("[cleanup] deleting synthetic row");
    await deleteRow(current.id);
  } else {
    console.log("[cleanup] skipped (pass --cleanup to remove the row)");
  }

  exit(0);
}

main().catch((err) => {
  console.error("\nFAILED:", err.message);
  exit(1);
});
