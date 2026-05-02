/**
 * BizLegal AI — Canonical Brand Tokens
 * P0 deliverable: bizlegal-ai/lib/brand/tokens.ts
 *
 * Both token sets exported as plain objects for Tailwind consumption.
 * Each repo imports ONLY its assigned preset — never the other.
 *
 * Assignment:
 *   purple → bizlegal-ai, trcr, BRAI
 *   white  → lexaudit, docai-monorepo, leadforge-ai, lexaudit-safe
 */

export const bizlegalPurpleTokens = {
  colors: {
    bg: "#f8f7ff",
    bg2: "#f1f0fe",
    bg3: "#e9e7fd",
    card: "#ffffff",
    border: "#e2e0f8",
    border2: "#c8c4f4",
    text: "#0e0b1a",
    muted: "#5d5a7a",
    dim: "#a9a7c4",
    accent: "#5b21b6",
    accentMid: "#6d28d9",
    accentLt: "#ede9fe",
    glow: "rgba(91,33,182,0.18)",
    indigo: "#3730a3",
    // NOTE: --pink exists in purple only for the gradient CTA box + h1 em gradient
    // It must NEVER appear in white repos
    pink: "#a21caf",
    red: "#dc2626",
    amber: "#d97706",
    grn: "#059669",
  },
  fontFamily: {
    sans: ["Inter", "sans-serif"],
  },
} as const;

export const bizlegalWhiteTokens = {
  colors: {
    bg: "#ffffff",
    bg2: "#fafafa",
    bg3: "#f4f4f5",
    card: "#ffffff",
    border: "#e4e4e7",
    border2: "#d4d4d8",
    text: "#0a0a0a",
    muted: "#52525b",
    dim: "#a1a1aa",
    accent: "#5b21b6",    // unchanged from purple
    accentMid: "#6d28d9", // unchanged from purple
    accentLt: "#f5f3ff",  // unchanged from purple
    glow: "rgba(91,33,182,0.18)",
    indigo: "#3730a3",
    // NO --pink token in white — any pink reference in a v1-white repo is a P4 verification FAILURE
    red: "#dc2626",
    amber: "#d97706",
    grn: "#059669",
  },
  fontFamily: {
    sans: ["Inter", "sans-serif"],
  },
} as const;

export type BizlegalTokens =
  | typeof bizlegalPurpleTokens
  | typeof bizlegalWhiteTokens;

export type BizlegalTemplate = "purple" | "white";
