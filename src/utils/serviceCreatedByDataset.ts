import type { ServiceRow } from '../screens/ProjectServices'

/** Pool of plausible creator names → initials + tooltip in the services table. */
export const SERVICE_CREATOR_NAMES: readonly string[] = [
  'Rick Salevsky',
  'Jane Cooper',
  'Elena Ivanova',
  'Marcus Chen',
  'Priya Sharma',
  'Oliver Nyström',
  'Sofia García',
  'James Wright',
  'Yuki Tanaka',
  'Amélie Dubois',
  'Daniel Okonkwo',
  'Hannah Müller',
  'Luca Romano',
  'Zara Ahmed',
  'Victor Lindholm',
  'Nina Kowalski',
  'Tomás Silva',
  'Wei Zhang',
  'Freya Andersen',
  'Kwame Boateng',
]

const MCP_AI_FRACTION = 0.18

function hash32(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function fullNameToInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  const single = parts[0] ?? '?'
  return single.slice(0, Math.min(3, single.length)).toUpperCase()
}

/**
 * Assigns random-looking creator initials (stable per `row.id`) and mixes in
 * MCP / “AI spark” icon avatars for multi-service scenarios.
 */
export function enrichServicesWithRandomCreatedBy(services: ServiceRow[]): ServiceRow[] {
  return services.map((row, index) => {
    const rnd = mulberry32(hash32(row.id) ^ (index * 2654435761))
    const { createdByInitials: _a, createdByAvatarVariant: _b, createdByFullName: _c, ...rest } = row

    if (rnd() < MCP_AI_FRACTION) {
      return {
        ...rest,
        createdByInitials: undefined,
        createdByFullName: undefined,
        createdByAvatarVariant: 'mcp-ai' as const,
      }
    }

    const name = SERVICE_CREATOR_NAMES[Math.floor(rnd() * SERVICE_CREATOR_NAMES.length)] ?? 'Jane Cooper'
    return {
      ...rest,
      createdByInitials: fullNameToInitials(name),
      createdByFullName: name,
      createdByAvatarVariant: undefined,
    }
  })
}
