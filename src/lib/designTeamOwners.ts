import ownerNames from '../data/design-team-owners.json'

const OWNER_NAMES: Record<string, string> = ownerNames

export type OwnerAvatar = {
  slug: string
  name: string
  src: string
}

/** Ordered slugs (alphabetical) for select options and avatar cycling. */
export function listOwnerSlugs(): string[] {
  return Object.keys(OWNER_NAMES).sort()
}

export function isKnownOwnerSlug(slug: string): boolean {
  return slug in OWNER_NAMES
}

export function getOwnerDisplayName(slug: string): string {
  return OWNER_NAMES[slug] ?? slug
}

export function getOwnerAvatarSrc(slug: string): string {
  return `/designers/${slug}.png`
}

export function listOwnerAvatars(): OwnerAvatar[] {
  return listOwnerSlugs().map((slug) => ({
    slug,
    name: getOwnerDisplayName(slug),
    src: getOwnerAvatarSrc(slug),
  }))
}
