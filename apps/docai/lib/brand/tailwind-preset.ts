import type { Config } from "tailwindcss";
import { bizlegalPurpleTokens, bizlegalWhiteTokens } from "./tokens";

/**
 * BizLegal AI — Canonical Tailwind Presets
 *
 * This file exports both presets. A repo's tailwind.config.ts imports ONLY
 * its assigned preset via the `presets` field. Cross-contamination is a
 * P4 verification failure (rg "var\(--pink\)" in v1-white repos must be 0).
 *
 * Assignment:
 *   presets: [bizlegalPurple] → bizlegal-ai, trcr, BRAI, leadforge-ai
 *   presets: [bizlegalWhite]  → lexaudit, docai-monorepo, lexaudit-safe
 */

// ── Purple preset plugin ──────────────────────────────────────────────────────
export const bizlegalPurple: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: bizlegalPurpleTokens.colors.bg,
        "bg-2": bizlegalPurpleTokens.colors.bg2,
        "bg-3": bizlegalPurpleTokens.colors.bg3,
        card: bizlegalPurpleTokens.colors.card,
        border: bizlegalPurpleTokens.colors.border,
        "border-2": bizlegalPurpleTokens.colors.border2,
        text: bizlegalPurpleTokens.colors.text,
        muted: bizlegalPurpleTokens.colors.muted,
        dim: bizlegalPurpleTokens.colors.dim,
        accent: bizlegalPurpleTokens.colors.accent,
        "accent-mid": bizlegalPurpleTokens.colors.accentMid,
        "accent-lt": bizlegalPurpleTokens.colors.accentLt,
        pink: bizlegalPurpleTokens.colors.pink,
        indigo: bizlegalPurpleTokens.colors.indigo,
        red: bizlegalPurpleTokens.colors.red,
        amber: bizlegalPurpleTokens.colors.amber,
        grn: bizlegalPurpleTokens.colors.grn,
      },
      fontFamily: {
        sans: bizlegalPurpleTokens.fontFamily.sans,
      },
    },
  },
};

// ── White preset plugin ───────────────────────────────────────────────────────
export const bizlegalWhite: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: bizlegalWhiteTokens.colors.bg,
        "bg-2": bizlegalWhiteTokens.colors.bg2,
        "bg-3": bizlegalWhiteTokens.colors.bg3,
        card: bizlegalWhiteTokens.colors.card,
        border: bizlegalWhiteTokens.colors.border,
        "border-2": bizlegalWhiteTokens.colors.border2,
        text: bizlegalWhiteTokens.colors.text,
        muted: bizlegalWhiteTokens.colors.muted,
        dim: bizlegalWhiteTokens.colors.dim,
        accent: bizlegalWhiteTokens.colors.accent,
        "accent-mid": bizlegalWhiteTokens.colors.accentMid,
        "accent-lt": bizlegalWhiteTokens.colors.accentLt,
        // NOTE: No "pink" key in bizlegalWhite — pink references in v1-white repos = FAIL
        indigo: bizlegalWhiteTokens.colors.indigo,
        red: bizlegalWhiteTokens.colors.red,
        amber: bizlegalWhiteTokens.colors.amber,
        grn: bizlegalWhiteTokens.colors.grn,
      },
      fontFamily: {
        sans: bizlegalWhiteTokens.fontFamily.sans,
      },
    },
  },
};
