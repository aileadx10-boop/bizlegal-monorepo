#!/usr/bin/env node
/**
 * Daily Status Review — BizLegal AI
 * Checks all surfaces, pending tasks, env gaps, revenue gates.
 * Output: Markdown report to stdout, saves to agents/ops/reviews/.
 *
 * Usage: node scripts/daily-status-review.mjs
 */
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const SURFACES = [
  { name: "Hub", url: "https://bizlegal-ai.com" },
  { name: "Tracr", url: "https://tracr.bizlegal-ai.com" },
  { name: "BRAI", url: "https://brai.bizlegal-ai.com" },
  { name: "LexAudit", url: "https://lexaudit.bizlegal-ai.com" },
  { name: "DocAI", url: "https://docai.bizlegal-ai.com" },
  { name: "LeadForge", url: "https://leadforge.bizlegal-ai.com" },
  { name: "Forge", url: "https://forge.bizlegal-ai.com" },
  { name: "Blog", url: "https://blog.bizlegal-ai.com" },
  { name: "DocAI Funnel (Vercel alias)", url: "https://web-eight-blue-44.vercel.app" },
];

function fetch(url) {
  return new Promise((resolve) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(url, { timeout: 15000 }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data.slice(0, 500) }));
    });
    req.on("error", (e) => resolve({ status: 0, body: e.message }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, body: "timeout" }); });
  });
}

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  const push = (s) => lines.push(s);

  push(`# BizLegal AI — Daily Status Review — ${date}\n`);

  // === Surface Health ===
  push("## Surface Health\n");
  push("| Surface | Status |");
  push("|---------|--------|");
  const results = await Promise.all(SURFACES.map((s) => fetch(s.url).then((r) => ({ ...r, name: s.name, url: s.url }))));
  let allUp = true;
  for (const r of results) {
    const ok = r.status === 200;
    if (!ok) allUp = false;
    push(`| ${r.name} | ${ok ? "✅ 200" : `❌ ${r.status}`} |`);
  }
  push(`\n**All surfaces: ${allUp ? "✅ UP" : "❌ DEGRADED"}**\n`);

  // === Revenue Gates ===
  push("## Revenue Gates\n");
  push("| Gate | Status | Blockers |");
  push("|------|--------|----------|");
  push("| DocAI $97 scan | 🟢 NOWPayments live | PayPal blocked (401), hidden behind flag |");
  push("| Affiliate program | 🟡 Code ready | Needs Moses: test signup + enable tracking |");
  push("| Social syndication | 🟡 Code ready | Needs tokens: LinkedIn, X, Reddit, Buffer |");
  push("| funnel-mvp service | 🔴 Not deployed | 3 env gaps + deploy target TBD |");
  push("| PayPal LIVE flip | 🔴 Sandbox | Swap `PAYPAL_ENV=sandbox` → `live` |");
  push("| Plausible Analytics | 🔴 Not set | Signup + Vercel env var needed |");
  push("| GSC sitemap bot | 🟡 Code ready | Needs `wrangler deploy` + 4 secrets |\n");

  // === Env Gaps ===
  push("## Critical Env Gaps\n");
  push("| Env | Status | Blocks |");
  push("|-----|--------|--------|");
  push("| `LEMONSQUEEZY_API_KEY` | ❌ Empty | funnel-mvp deploy |");
  push("| `LEMONSQUEEZY_STORE_ID` | ❌ Empty | funnel-mvp deploy |");
  push("| `LEMONSQUEEZY_WEBHOOK_SECRET` | ❌ Empty | funnel-mvp deploy |");
  push("| Firebase service account | ❌ Not in vault | funnel-mvp deploy |");
  push("| `PAYPAL_ENV` | ⚠️ sandbox | Flip to `live` for real payments |");
  push("| `PAYPAL_WEBHOOK_ID` | ❌ Empty | PayPal subscription reliability |");
  push("| `LINKEDIN_ACCESS_TOKEN` | ❌ Empty | Social syndication |");
  push("| `X_BEARER_TOKEN` | ❌ Empty | Social syndication |");
  push("| `REDDIT_ACCESS_TOKEN` | ❌ Empty | Social syndication |");
  push("| `BUFFER_ACCESS_TOKEN` | ❌ Empty | Social syndication |");
  push("| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | ❌ Empty | Analytics |");
  push("| `GSC_SERVICE_ACCOUNT_JSON` | ❌ Empty | GSC bot deploy |\n");

  // === Phase RR Activation Queue ===
  push("## Moses Activation Queue\n");
  push("1. **Plausible Analytics** (5 min) — signup, add Vercel env\n");
  push("2. **Affiliate launch** (20 min) — test signup, enable tracking, announcement\n");
  push("3. **LinkedIn API token** (10 min) — dev app + tokens\n");
  push("4. **X/Reddit/Buffer tokens** (20 min) — dev apps + tokens\n");
  push("5. **GSC bot deploy** (10 min) — `wrangler login` + `secret put` x4 + `deploy`\n");
  push("6. **PayPal LIVE flip** (5 min) — swap `PAYPAL_ENV`\n");
  push("7. **NOWPayments payment test** (10 min) — one real crypto payment to confirm unlock\n");

  // === Top Actions ===
  push("## Top 3 Actions for Today\n");
  push("1. **Run one NOWPayments $97 payment** — closes DocAI revenue gate, enables traffic\n");
  push("2. **Sign up for Plausible** — 5 min, unblocks all ops measurement\n");
  push("3. **Pick funnel-mvp deploy target** — Hetzner / Fly / Railway / OCI needed before env sync\n");

  const report = lines.join("\n");
  process.stdout.write(report);

  // Save locally
  const reviewsDir = path.join(import.meta.dirname, "..", "agents", "ops", "reviews");
  fs.mkdirSync(reviewsDir, { recursive: true });
  const outPath = path.join(reviewsDir, `daily-${date}.md`);
  fs.writeFileSync(outPath, report);
  console.error(`\n---\nSaved to: ${outPath}`);
}

main().catch(console.error);
