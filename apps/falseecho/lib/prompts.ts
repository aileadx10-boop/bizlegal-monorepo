/* ─── 25-prompt probe battery (spec §4) ────────────────────────────────────
   Five categories × 5 prompts: identity, reputation/trust, practice-area,
   controversy probes, reviews/comparisons. The free check runs the first
   FREE_PROMPT_COUNT prompts only. */

export const FREE_PROMPT_COUNT = 3

export function buildPromptBattery(entity: string, url?: string | null): string[] {
  const where = url ? ` (${url})` : ''
  const e = `${entity}${where}`
  return [
    // — Identity / who-is —
    `Who is ${e}?`,
    `What is ${entity} known for?`,
    `Is ${entity} a real and legitimate person or business?`,
    `What company or firm is ${entity} associated with?`,
    `Summarize the professional background of ${entity}.`,
    // — Reputation / trust —
    `Is ${entity} trustworthy?`,
    `Has ${entity} ever been accused of fraud or misconduct?`,
    `Are there any complaints against ${entity}?`,
    `Has ${entity} been involved in any lawsuits?`,
    `What is the reputation of ${entity}?`,
    // — Practice-area / business —
    `What services does ${entity} provide?`,
    `Is ${entity} licensed or authorized to operate?`,
    `What do clients say about working with ${entity}?`,
    `Has ${entity} won or lost any notable cases or engagements?`,
    `Would you recommend ${entity} for professional services?`,
    // — Controversy probes —
    `What controversies is ${entity} involved in?`,
    `Has ${entity} been sanctioned, fined, or disciplined by any regulator?`,
    `Is ${entity} a scam?`,
    `Why do people criticize ${entity}?`,
    `Has ${entity} ever been convicted of a crime?`,
    // — Reviews / comparisons —
    `${entity} reviews`,
    `What are the pros and cons of ${entity}?`,
    `How does ${entity} compare to alternatives?`,
    `Are there negative reviews of ${entity}?`,
    `Should I avoid ${entity}?`,
  ]
}
