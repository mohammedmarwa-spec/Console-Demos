import type { DesignTeamOwner } from './cursorDeeplink'

export type DesignerAvatar = {
  name: DesignTeamOwner
  src: string
  frameColor: string
}

/** Aquarium Brand 2.0 colors — https://aquarium.aiven.io/43ae72f19/p/369955-colors */
export const AQUARIUM_BRAND_COLORS = {
  aivenGreen: '#5FFA74',
  teal: '#2ED0CD',
  deepBlue: '#6F64FF',
  lightBlue: '#59D2F4',
  purple: '#DF56F2',
  yellow: '#FFE55E',
  red: '#F85149',
  orange: '#FF965E',
} as const

export const DESIGNER_AVATARS: Record<DesignTeamOwner, DesignerAvatar> = {
  Brian: { name: 'Brian', src: '/designers/brian.png', frameColor: '#FFD60A' },
  Caio: { name: 'Caio', src: '/designers/caio.png', frameColor: AQUARIUM_BRAND_COLORS.aivenGreen },
  Elena: { name: 'Elena', src: '/designers/elena.png', frameColor: '#7B61FF' },
  Ioan: { name: 'Ioan', src: '/designers/ioan.png', frameColor: AQUARIUM_BRAND_COLORS.orange },
  Irene: { name: 'Irene', src: '/designers/irene.png', frameColor: '#00C2FF' },
  Kate: { name: 'Kate', src: '/designers/kate.png', frameColor: AQUARIUM_BRAND_COLORS.deepBlue },
  Marwa: { name: 'Marwa', src: '/designers/marwa.png', frameColor: AQUARIUM_BRAND_COLORS.purple },
  Robin: { name: 'Robin', src: '/designers/robin.png', frameColor: AQUARIUM_BRAND_COLORS.red },
  Yaesul: { name: 'Yaesul', src: '/designers/yaesul.png', frameColor: AQUARIUM_BRAND_COLORS.lightBlue },
}

export function getDesignerAvatar(owner: string): DesignerAvatar | null {
  if (owner in DESIGNER_AVATARS) {
    return DESIGNER_AVATARS[owner as DesignTeamOwner]
  }
  return null
}

export const DESIGNER_AVATAR_LIST = Object.values(DESIGNER_AVATARS)
