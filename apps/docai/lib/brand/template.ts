/**
 * BizLegal AI — lib/brand/template.ts
 *
 * Each repo copies this file and sets its TEMPLATE constant.
 * This is the single source of truth for which preset is active.
 *
 * v1-purple repos: bizlegal-ai, trcr, BRAI, leadforge-ai
 * v1-white  repos: lexaudit, docai-monorepo, lexaudit-safe
 *
 * RULE: A repo must import ONLY its assigned preset's tokens from
 * the tailwind.config.ts plugin. Cross-contamination = test failure.
 */

import type { BizlegalTemplate } from "./tokens";

// ────────────────────────────────────────────────────────────
// EDIT THIS LINE ONLY — change "purple" | "white" per repo
// ────────────────────────────────────────────────────────────
export const TEMPLATE: BizlegalTemplate = "white";
// ────────────────────────────────────────────────────────────
