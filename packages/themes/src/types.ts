/**
 * Shared anonymous-shape types lifted to a single source of truth so
 * adding fields like `external?: boolean` (target=_blank) doesn't
 * require editing six call sites independently.
 *
 * Type-design F-7 closure.
 */

export interface NavLink {
  readonly label: string
  readonly href: string
  /** When true, render with target="_blank" rel="noopener noreferrer". */
  readonly external?: boolean
}
