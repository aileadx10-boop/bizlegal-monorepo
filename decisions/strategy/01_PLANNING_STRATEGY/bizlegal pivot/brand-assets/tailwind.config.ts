import type { Config } from "tailwindcss";
import { bizlegalPurpleTokens, bizlegalWhiteTokens } from "./lib/brand/tokens";

/**
 * BizLegal AI — Hub Tailwind Config (v1-purple)
 *
 * This is the CANONICAL config stored in the hub.
 * Each repo copies this file and activates only its assigned preset.
 *
 * Assignment:
 *   presets: [bizlegalPurple]   → bizlegal-ai, trcr, BRAI, leadforge-ai
 *   presets: [bizlegalWhite]    → lexaudit, docai-monorepo, lexaudit-safe
 *
 * CRITICAL: A v1-white repo must never import or reference bizlegalPurple.
 *           A v1-purple repo must never import or reference bizlegalWhite.
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

// ── Hub config (v1-purple) ────────────────────────────────────────────────────
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Hub uses purple preset
  presets: [bizlegalPurple as Config],
  plugins: [],
};

export default config;

/*
 * ── Per-repo tailwind.config.ts snippets ─────────────────────────────────────
 * Copy this file to each repo and change only the presets line:
 *
 * // bizlegal-ai/tailwind.config.ts:     presets: [bizlegalPurple]
 * // trcr/tailwind.config.ts:            presets: [bizlegalPurple]
 * // BRAI/tailwind.config.ts:            presets: [bizlegalPurple]
 * // lexaudit/tailwind.config.ts:        presets: [bizlegalWhite]
 * // docai-monorepo/tailwind.config.ts:  presets: [bizlegalWhite]
 * // leadforge-ai/tailwind.config.ts:    presets: [bizlegalWhite]   # changed from purple
 * // lexaudit-safe/tailwind.config.ts:   presets: [bizlegalWhite]   # P6
 */
