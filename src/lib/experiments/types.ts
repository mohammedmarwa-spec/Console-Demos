// ─── Experiment / template page metadata ──────────────────────────────────────
// Every colocated page.tsx (template or experiment) exports this shape.

export type PageMeta = {
  title: string
  description: string
}

/**
 * Computed by discover.server.ts from folder structure — not authored by hand.
 * Adds routing/classification info on top of the page's own PageMeta.
 */
export type DiscoveredPage = PageMeta & {
  /** template/{slug} | experiment/{ownerSlug}/{slug} */
  id: string
  slug: string
  kind: 'template' | 'experiment'
  route: string
  /** Present only for kind: 'experiment' */
  ownerSlug?: string
  /** Public path to a committed preview screenshot, when available */
  thumbnail?: string
  /** ISO-8601 from last git commit that touched the experiment folder */
  updatedAt?: string
}
