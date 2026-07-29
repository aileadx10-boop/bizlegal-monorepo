/**
 * Nifty Haven — the "learn" layer of BizLegal AI.
 *
 * Two tracks, one shell. Real Estate is founder-authored (Moses is a practicing
 * real estate lawyer, which is where the authority comes from). Founders is
 * synthesised from the existing /guides library and cross-sells live products.
 *
 * Phase 0 is a demand test, not a course platform: text-only lessons, no video,
 * no auth, no accreditation. Build the rest only if a track actually sells.
 *
 * HARD CONSTRAINTS baked into this model:
 *   - No CLE/CPE "credit" claims anywhere. Completion is not accreditation.
 *   - `founderNote` is a PLACEHOLDER for Moses's own case material. It renders
 *     visibly as a placeholder; it is never filled in with invented cases.
 *   - `sourceGuide` must be a real href present in lib/guides.ts.
 */

export type TrackSlug = 'real-estate' | 'founders'

export interface LessonSection {
  readonly heading: string
  readonly paragraphs: readonly string[]
  readonly bullets?: readonly string[]
}

export interface LessonCta {
  readonly label: string
  readonly href: string
  /** Why this product is the next step for the problem the lesson just described. */
  readonly note: string
}

export interface Lesson {
  readonly slug: string
  readonly title: string
  readonly summary: string
  readonly minutes: number
  /** Free lessons are the demand test. Gated lessons sit behind pre-order. */
  readonly free: boolean
  readonly sections: readonly LessonSection[]
  /**
   * Prompt for the founder to add a real case from his own practice.
   * Rendered as an explicit editorial placeholder — see FOUNDER_NOTE_LABEL.
   */
  readonly founderNote?: string
  /** Real /guides href this lesson draws on. Must exist in lib/guides.ts. */
  readonly sourceGuide?: string
  readonly cta?: LessonCta
}

export interface Track {
  readonly slug: TrackSlug
  readonly name: string
  readonly audience: string
  readonly promise: string
  /** ProductId in @bizlegal/payment used for the pre-order checkout. */
  readonly productId: string
  readonly priceUsd: number
  readonly lessons: readonly Lesson[]
}

/** Shown above any `founderNote` so a placeholder can never read as a real case. */
export const FOUNDER_NOTE_LABEL = 'Case study to be added by the author'

/** Every lesson page carries this. Education, not legal advice. */
export const NOT_ADVICE =
  "This lesson is educational material about how legal and compliance processes work. It is not legal advice, it does not create an attorney-client relationship, and it is not a substitute for counsel licensed in your jurisdiction."

export function trackHref(track: TrackSlug): string {
  return `/learn/${track}`
}

export function lessonHref(track: TrackSlug, lesson: string): string {
  return `/learn/${track}/${lesson}`
}
