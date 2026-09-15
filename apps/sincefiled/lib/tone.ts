/** Tone shield: this module guards all sincefiled UI copy. */
export const FORBIDDEN_COPY = ['late', 'missed', 'overdue', 'you are late', 'you missed', 'overdue']

export function assertToneSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return FORBIDDEN_COPY.every((w) => !lower.includes(w))
}

export function toneSafeOrDefault(text: string, fallback: string): string {
  return assertToneSafe(text) ? text : fallback
}
