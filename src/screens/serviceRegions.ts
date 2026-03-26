/**
 * Shared cloud / region data for Create Service and Upgrade modal V2.
 * Continent labels drive opt-group sections in the region Select.
 */

export type CloudProviderId = 'aws' | 'google' | 'azure' | 'digitalocean' | 'upcloud'

export type RegionArea = 'asia-pacific' | 'australia' | 'europe' | 'north-america'

export type Region = {
  id: string
  label: string
  flag: string
  location: string
  /** Display grouping inside the region dropdown */
  continent: string
}

export type CloudProvider = { id: CloudProviderId; label: string }

export const REGION_AREAS: { id: RegionArea; label: string }[] = [
  { id: 'asia-pacific', label: 'Asia Pacific' },
  { id: 'australia', label: 'Australia' },
  { id: 'europe', label: 'Europe' },
  { id: 'north-america', label: 'North America' },
]

export const CLOUD_PROVIDERS: CloudProvider[] = [
  { id: 'aws', label: 'AWS' },
  { id: 'google', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
  { id: 'digitalocean', label: 'DigitalOcean' },
  { id: 'upcloud', label: 'UpCloud' },
]

/** Order of continent sections in grouped region selects */
export const REGION_CONTINENT_ORDER = [
  'Europe',
  'North America',
  'Asia Pacific',
  'Australia',
  'Middle East',
  'South America',
  'Africa',
] as const

export const REGIONS_BY_CLOUD: Record<CloudProviderId, Region[]> = {
  aws: [
    { id: 'eu-north-1', label: 'europe-north-1, Finland', flag: '🇫🇮', location: 'Europe, Finland', continent: 'Europe' },
    { id: 'eu-west-1', label: 'eu-west-1, Ireland', flag: '🇮🇪', location: 'Europe, Ireland', continent: 'Europe' },
    { id: 'eu-central-1', label: 'eu-central-1, Germany', flag: '🇩🇪', location: 'Europe, Germany', continent: 'Europe' },
    { id: 'eu-west-2', label: 'eu-west-2, London', flag: '🇬🇧', location: 'Europe, London', continent: 'Europe' },
    { id: 'eu-south-1', label: 'eu-south-1, Milan', flag: '🇮🇹', location: 'Europe, Milan', continent: 'Europe' },
    { id: 'us-east-1', label: 'us-east-1, US East', flag: '🇺🇸', location: 'North America, US East', continent: 'North America' },
    { id: 'us-west-2', label: 'us-west-2, Oregon', flag: '🇺🇸', location: 'North America, Oregon', continent: 'North America' },
    { id: 'us-west-1', label: 'us-west-1, N. California', flag: '🇺🇸', location: 'North America, N. California', continent: 'North America' },
    { id: 'ca-central-1', label: 'ca-central-1, Canada', flag: '🇨🇦', location: 'North America, Canada', continent: 'North America' },
    { id: 'ap-southeast-1', label: 'ap-southeast-1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore', continent: 'Asia Pacific' },
    { id: 'ap-northeast-1', label: 'ap-northeast-1, Tokyo', flag: '🇯🇵', location: 'Asia, Tokyo', continent: 'Asia Pacific' },
    { id: 'ap-northeast-2', label: 'ap-northeast-2, Seoul', flag: '🇰🇷', location: 'Asia, Seoul', continent: 'Asia Pacific' },
    { id: 'ap-south-1', label: 'ap-south-1, Mumbai', flag: '🇮🇳', location: 'Asia, Mumbai', continent: 'Asia Pacific' },
    { id: 'ap-southeast-2', label: 'ap-southeast-2, Sydney', flag: '🇦🇺', location: 'Australia, Sydney', continent: 'Australia' },
    { id: 'sa-east-1', label: 'sa-east-1, São Paulo', flag: '🇧🇷', location: 'South America, São Paulo', continent: 'South America' },
    { id: 'me-south-1', label: 'me-south-1, Bahrain', flag: '🇧🇭', location: 'Middle East, Bahrain', continent: 'Middle East' },
    { id: 'af-south-1', label: 'af-south-1, Cape Town', flag: '🇿🇦', location: 'Africa, Cape Town', continent: 'Africa' },
  ],
  google: [
    { id: 'europe-north1', label: 'europe-north1, Finland', flag: '🇫🇮', location: 'Europe, Finland', continent: 'Europe' },
    { id: 'europe-west1', label: 'europe-west1, Belgium', flag: '🇧🇪', location: 'Europe, Belgium', continent: 'Europe' },
    { id: 'europe-west4', label: 'europe-west4, Netherlands', flag: '🇳🇱', location: 'Europe, Netherlands', continent: 'Europe' },
    { id: 'us-central1', label: 'us-central1, Iowa', flag: '🇺🇸', location: 'North America, Iowa', continent: 'North America' },
    { id: 'us-east1', label: 'us-east1, South Carolina', flag: '🇺🇸', location: 'North America, South Carolina', continent: 'North America' },
    { id: 'asia-southeast1', label: 'asia-southeast1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore', continent: 'Asia Pacific' },
    { id: 'asia-northeast1', label: 'asia-northeast1, Tokyo', flag: '🇯🇵', location: 'Asia, Tokyo', continent: 'Asia Pacific' },
    { id: 'australia-southeast1', label: 'australia-southeast1, Sydney', flag: '🇦🇺', location: 'Australia, Sydney', continent: 'Australia' },
  ],
  azure: [
    { id: 'northeurope', label: 'northeurope, Ireland', flag: '🇮🇪', location: 'Europe, Ireland', continent: 'Europe' },
    { id: 'westeurope', label: 'westeurope, Netherlands', flag: '🇳🇱', location: 'Europe, Netherlands', continent: 'Europe' },
    { id: 'germanywestcentral', label: 'germanywestcentral, Germany', flag: '🇩🇪', location: 'Europe, Germany', continent: 'Europe' },
    { id: 'eastus', label: 'eastus, Virginia', flag: '🇺🇸', location: 'North America, Virginia', continent: 'North America' },
    { id: 'westus2', label: 'westus2, Washington', flag: '🇺🇸', location: 'North America, Washington', continent: 'North America' },
    { id: 'canadacentral', label: 'canadacentral, Canada', flag: '🇨🇦', location: 'North America, Canada', continent: 'North America' },
    { id: 'southeastasia', label: 'southeastasia, Singapore', flag: '🇸🇬', location: 'Asia, Singapore', continent: 'Asia Pacific' },
    { id: 'japaneast', label: 'japaneast, Tokyo', flag: '🇯🇵', location: 'Asia, Tokyo', continent: 'Asia Pacific' },
    { id: 'australiaeast', label: 'australiaeast, Sydney', flag: '🇦🇺', location: 'Australia, Sydney', continent: 'Australia' },
  ],
  digitalocean: [
    { id: 'ams3', label: 'ams3, Amsterdam', flag: '🇳🇱', location: 'Europe, Amsterdam', continent: 'Europe' },
    { id: 'lon1', label: 'lon1, London', flag: '🇬🇧', location: 'Europe, London', continent: 'Europe' },
    { id: 'fra1', label: 'fra1, Frankfurt', flag: '🇩🇪', location: 'Europe, Frankfurt', continent: 'Europe' },
    { id: 'nyc1', label: 'nyc1, New York', flag: '🇺🇸', location: 'North America, New York', continent: 'North America' },
    { id: 'sfo3', label: 'sfo3, San Francisco', flag: '🇺🇸', location: 'North America, San Francisco', continent: 'North America' },
    { id: 'tor1', label: 'tor1, Toronto', flag: '🇨🇦', location: 'North America, Toronto', continent: 'North America' },
    { id: 'sgp1', label: 'sgp1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore', continent: 'Asia Pacific' },
    { id: 'blr1', label: 'blr1, Bangalore', flag: '🇮🇳', location: 'Asia, Bangalore', continent: 'Asia Pacific' },
  ],
  upcloud: [
    { id: 'fi-hel1', label: 'fi-hel1, Helsinki', flag: '🇫🇮', location: 'Europe, Helsinki', continent: 'Europe' },
    { id: 'de-fra1', label: 'de-fra1, Frankfurt', flag: '🇩🇪', location: 'Europe, Frankfurt', continent: 'Europe' },
    { id: 'uk-lon1', label: 'uk-lon1, London', flag: '🇬🇧', location: 'Europe, London', continent: 'Europe' },
    { id: 'nl-ams1', label: 'nl-ams1, Amsterdam', flag: '🇳🇱', location: 'Europe, Amsterdam', continent: 'Europe' },
    { id: 'us-chi1', label: 'us-chi1, Chicago', flag: '🇺🇸', location: 'North America, Chicago', continent: 'North America' },
    { id: 'us-sjo1', label: 'us-sjo1, San Jose', flag: '🇺🇸', location: 'North America, San Jose', continent: 'North America' },
    { id: 'sg-sin1', label: 'sg-sin1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore', continent: 'Asia Pacific' },
  ],
}

export function formatRegionSelectValue(r: Region): string {
  return `${r.flag} ${r.label}`
}

export function findRegionBySelectValue(regions: Region[], value: string): Region | undefined {
  return regions.find((r) => formatRegionSelectValue(r) === value)
}

const ORDER_SET = new Set<string>(REGION_CONTINENT_ORDER)

export function regionsToGroupedSelectOptions(
  regions: Region[],
): Array<{ label: string; options: string[] }> {
  const byContinent = new Map<string, Region[]>()
  for (const r of regions) {
    const list = byContinent.get(r.continent) ?? []
    list.push(r)
    byContinent.set(r.continent, list)
  }
  const ordered: Array<{ label: string; options: string[] }> = []
  for (const c of REGION_CONTINENT_ORDER) {
    const list = byContinent.get(c)
    if (list?.length) {
      ordered.push({ label: c, options: list.map(formatRegionSelectValue) })
    }
  }
  const remaining = [...byContinent.keys()].filter((k) => !ORDER_SET.has(k)).sort()
  for (const c of remaining) {
    const list = byContinent.get(c)
    if (list?.length) {
      ordered.push({ label: c, options: list.map(formatRegionSelectValue) })
    }
  }
  return ordered
}
