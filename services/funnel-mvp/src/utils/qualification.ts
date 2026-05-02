import type { Qualification } from "../types/domain.js";

function capturePattern(replyText: string, pattern: RegExp) {
  return replyText.match(pattern)?.[1]?.trim();
}

export function extractQualification(replyText: string): Qualification {
  const dealType =
    capturePattern(replyText, /deal type\s*:\s*(.+)/i) ??
    capturePattern(replyText, /type of deal\s*:\s*(.+)/i) ??
    "unspecified";
  const dealSize = capturePattern(replyText, /deal size\s*:\s*(.+)/i);
  const jurisdiction = capturePattern(replyText, /jurisdiction\s*:\s*(.+)/i);

  return {
    dealType: dealType.toLowerCase(),
    dealSize,
    jurisdiction,
    freeText: replyText.trim()
  };
}
