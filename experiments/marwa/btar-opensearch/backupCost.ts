import { PRIMARY_LOCATION } from './backupsData'

/** Illustrative monthly usage. Not measured from this service. */
export const STORAGE_GB = 122
export const TRANSFER_GB = 252
export const STORAGE_RATE = 0.1
export const TRANSFER_RATE_SAME = 0.03
export const TRANSFER_RATE_DIFFERENT = 0.15

const STORAGE_CENTS = 1220

/** Hourly is the plan default. Transfer volume scales with how often the copy runs. */
export const BACKUP_FREQUENCIES = [
  { value: '30m', label: 'Every 30 minutes', perDay: 48 },
  { value: 'hourly', label: 'Hourly (plan default)', perDay: 24 },
  { value: '6h', label: 'Every 6 hours', perDay: 4 },
  { value: '12h', label: 'Every 12 hours', perDay: 2 },
  { value: 'daily', label: 'Daily', perDay: 1 },
] as const

export type BackupFrequencyId = (typeof BACKUP_FREQUENCIES)[number]['value']

export function frequencyById(id: BackupFrequencyId) {
  return (
    BACKUP_FREQUENCIES.find((frequency) => frequency.value === id) ??
    BACKUP_FREQUENCIES.find((frequency) => frequency.value === 'hourly') ??
    BACKUP_FREQUENCIES[0]
  )
}

export function transferGbFor(perDay: number): number {
  return (TRANSFER_GB * perDay) / 24
}

export function formatGb(gb: number): string {
  return Number.isInteger(gb) ? String(gb) : gb.toFixed(1)
}

type Continent = 'europe' | 'north-america' | 'asia'

const CONTINENT: Record<string, Continent> = {
  'google-europe-west1': 'europe',
  'google-europe-north1': 'europe',
  'google-europe-west4': 'europe',
  'google-us-east1': 'north-america',
  'google-asia-east1': 'asia',
}

export type RegionChoice = {
  value: string
  route: string
  different: boolean
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function sameContinent(region: string, other: string): boolean {
  return CONTINENT[region] === CONTINENT[other]
}

export function routeFor(region: string, source: string, fromSecondary: boolean): RegionChoice {
  const different = !sameContinent(region, source)
  const route = fromSecondary
    ? different
      ? 'Different continent from secondary'
      : 'Same continent as secondary'
    : different
      ? 'Different continent'
      : 'Same continent'
  return { value: region, route, different }
}

export function regionCents(
  different: boolean,
  perDay: number,
): { storage: number; transfer: number; total: number; transferGb: number } {
  const transferGb = transferGbFor(perDay)
  const transfer = Math.round(transferGb * transferRate(different) * 100)
  return { storage: STORAGE_CENTS, transfer, total: STORAGE_CENTS + transfer, transferGb }
}

export function transferRate(different: boolean): number {
  return different ? TRANSFER_RATE_DIFFERENT : TRANSFER_RATE_SAME
}

export function choiceFromPrimary(region: string): RegionChoice {
  return routeFor(region, PRIMARY_LOCATION, false)
}
