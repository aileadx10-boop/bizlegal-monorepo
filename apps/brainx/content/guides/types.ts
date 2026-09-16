export interface GuideCitation {
  readonly title: string
  readonly url: string
  readonly publisher: string
}

export interface GuideFaq {
  readonly q: string
  readonly a: string
}

export interface Guide {
  readonly slug: string
  readonly title: string
  readonly description: string
  /** Plain paragraphs — rendered as <p> tags, one per array entry. */
  readonly paragraphs: readonly string[]
  readonly citations: readonly GuideCitation[]
  readonly faqs: readonly GuideFaq[]
  /** Paths within this app. */
  readonly internalLinks: readonly { readonly label: string; readonly href: string }[]
  readonly publishedAt: string
}
