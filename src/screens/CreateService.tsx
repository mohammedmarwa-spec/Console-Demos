import { useMemo, useState } from 'react'
import type { ServiceRow } from './ProjectServices'
import {
  Box,
  Button,
  ChoiceChip,
  ChoiceChipGroup,
  InlineIcon,
  Input,
  Link,
  RadioButton,
  Select,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import { LAYOUT_GAP, PADDING, SIDEBAR_WIDTH, Section, SummaryDetail } from './ServiceCreationShared'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import containerIcon from '@aivenio/aquarium/icons/container'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import serverHddIcon from '@aivenio/aquarium/icons/serverHdd'
import tagIcon from '@aivenio/aquarium/icons/tag'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import addIcon from '@aivenio/aquarium/icons/add'
import type { ServiceTypeId } from './ServiceTypeSelectModal'
import cloudAwsVector from '../assets/cloud-aws-vector.svg'
import cloudAwsSmile from '../assets/cloud-aws-smile.svg'
import cloudGoogle from '../assets/cloud-google.svg'
import cloudAzure1 from '../assets/cloud-azure-1.svg'
import cloudAzure2 from '../assets/cloud-azure-2.svg'
import cloudAzure3 from '../assets/cloud-azure-3.svg'
import cloudAzure4 from '../assets/cloud-azure-4.svg'
import cloudDigitalOcean from '../assets/cloud-digitalocean.svg'
import cloudUpCloud from '../assets/cloud-upcloud.png'

// ─── Domain types ─────────────────────────────────────────────────────────────

type ServiceTier = 'free' | 'developer' | 'professional'
type HaOption = 'no-ha' | 'primary-standby' | 'primary-2-standby'
type CloudProviderId = 'aws' | 'google' | 'azure' | 'digitalocean' | 'upcloud'
type RegionArea = 'asia-pacific' | 'australia' | 'europe' | 'north-america'

// ─── Shared constants ─────────────────────────────────────────────────────────

const HA_OPTIONS: { id: HaOption; label: string; recommended?: boolean }[] = [
  { id: 'no-ha', label: 'No HA: 1 primary node' },
  { id: 'primary-standby', label: 'Primary + standby', recommended: true },
  { id: 'primary-2-standby', label: 'Primary + 2 standby' },
]

const HA_NODE_COUNT: Record<HaOption, number> = {
  'no-ha': 1,
  'primary-standby': 2,
  'primary-2-standby': 3,
}

const REGION_AREAS: { id: RegionArea; label: string }[] = [
  { id: 'asia-pacific', label: 'Asia Pacific' },
  { id: 'australia', label: 'Australia' },
  { id: 'europe', label: 'Europe' },
  { id: 'north-america', label: 'North America' },
]

// ─── Service config types ─────────────────────────────────────────────────────

type TierFeature = { text: string; icon: 'tick' | 'info' }

type TierOption = {
  id: ServiceTier
  title: string
  description: string
  features: TierFeature[]
  price: string
}

type CloudProvider = { id: CloudProviderId; label: string }

type Region = { id: string; label: string; flag: string; location: string }

type ComputeProfile = { id: string; label: string; description: string }

type ComputeOption = {
  id: string
  label: string
  vCPU: number
  ram: string
  pricePerMonth: number
}

type StorageSpec = {
  id: string
  label: string
  optimal?: boolean
  disabled?: boolean
  description: string
  throughputRead: string
  throughputWrite: string
  iopsRead: string
  iopsWrite: string
  note: string
  pricePerGbMonth: number
}

type FixedTierPlan = { cpu: number; ram: string; storage: string; price: string }

type Plan = {
  id: string
  label: string
  nodes: number
  vCPU: number
  ram: string
  storage: string
  monthlyPrice: string
}

type ServiceConfig = {
  versions: string[]
  tiers: TierOption[]
  /** Fixed-spec plans rendered for free / developer tiers. */
  fixedTierPlans: Partial<Record<ServiceTier, FixedTierPlan>>
  cloudProviders: CloudProvider[]
  regionsByCloud: Record<CloudProviderId, Region[]>
  /** True only for postgresql and mysql — shows HA + Compute + Storage sections. */
  haEnabled: boolean
  /** When defined, renders a "Plan" table instead of Compute + Storage sections. */
  plans?: Plan[]
  /**
   * When defined alongside haEnabled, enables a pricing model toggle between ACU (flexible)
   * and legacy modes. These plans are shown when the user selects legacy pricing.
   * Add to any service type to make the toggle available for that service.
   */
  legacyPlans?: Plan[]
  computeProfiles: ComputeProfile[]
  computeOptionsByProfile: Record<string, ComputeOption[]>
  storageSpecs: StorageSpec[]
  defaultComputeProfile: string
  diskSizeMin: number
  diskSizeMax: number
  defaultDiskSize: number
}

// ─── Shared infrastructure data ───────────────────────────────────────────────

const CLOUD_PROVIDERS: CloudProvider[] = [
  { id: 'aws', label: 'AWS' },
  { id: 'google', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
  { id: 'digitalocean', label: 'DigitalOcean' },
  { id: 'upcloud', label: 'UpCloud' },
]

const REGIONS_BY_CLOUD: Record<CloudProviderId, Region[]> = {
  aws: [
    { id: 'eu-north-1',     label: 'europe-north-1, Finland',     flag: '🇫🇮', location: 'Europe, Finland' },
    { id: 'us-east-1',      label: 'us-east-1, US East',           flag: '🇺🇸', location: 'North America, US East' },
    { id: 'ap-southeast-1', label: 'ap-southeast-1, Singapore',    flag: '🇸🇬', location: 'Asia, Singapore' },
    { id: 'eu-west-1',      label: 'eu-west-1, Ireland',           flag: '🇮🇪', location: 'Europe, Ireland' },
    { id: 'us-west-2',      label: 'us-west-2, Oregon',            flag: '🇺🇸', location: 'North America, Oregon' },
  ],
  google: [
    { id: 'europe-north1',   label: 'europe-north1, Finland',     flag: '🇫🇮', location: 'Europe, Finland' },
    { id: 'us-central1',     label: 'us-central1, Iowa',          flag: '🇺🇸', location: 'North America, Iowa' },
    { id: 'asia-southeast1', label: 'asia-southeast1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
    { id: 'europe-west1',    label: 'europe-west1, Belgium',      flag: '🇧🇪', location: 'Europe, Belgium' },
  ],
  azure: [
    { id: 'northeurope',   label: 'northeurope, Ireland',     flag: '🇮🇪', location: 'Europe, Ireland' },
    { id: 'eastus',        label: 'eastus, Virginia',         flag: '🇺🇸', location: 'North America, Virginia' },
    { id: 'westeurope',    label: 'westeurope, Netherlands',  flag: '🇳🇱', location: 'Europe, Netherlands' },
    { id: 'southeastasia', label: 'southeastasia, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
  ],
  digitalocean: [
    { id: 'ams3', label: 'ams3, Amsterdam', flag: '🇳🇱', location: 'Europe, Amsterdam' },
    { id: 'nyc1', label: 'nyc1, New York',  flag: '🇺🇸', location: 'North America, New York' },
    { id: 'sgp1', label: 'sgp1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
    { id: 'lon1', label: 'lon1, London',    flag: '🇬🇧', location: 'Europe, London' },
  ],
  upcloud: [
    { id: 'fi-hel1', label: 'fi-hel1, Helsinki',  flag: '🇫🇮', location: 'Europe, Helsinki' },
    { id: 'de-fra1', label: 'de-fra1, Frankfurt', flag: '🇩🇪', location: 'Europe, Frankfurt' },
    { id: 'uk-lon1', label: 'uk-lon1, London',    flag: '🇬🇧', location: 'Europe, London' },
    { id: 'sg-sin1', label: 'sg-sin1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
  ],
}

const STANDARD_COMPUTE_PROFILES: ComputeProfile[] = [
  { id: 'economy',          label: 'Economy',          description: 'Cost-effective option for less resource-intensive deployments' },
  { id: 'balanced',         label: 'Balanced',         description: 'Best price-performance ratio for general workloads' },
  { id: 'memory-optimized', label: 'Memory optimized', description: 'Ideal for memory-intensive applications' },
  { id: 'storage-optimized',label: 'Storage optimized',description: 'Ideal for in-memory processing of large datasets' },
]

const STANDARD_COMPUTE_OPTIONS: Record<string, ComputeOption[]> = {
  economy: [
    { id: 'eco-1-2',  label: '1 CPU',  vCPU: 1,  ram: '2 GB RAM',   pricePerMonth: 19 },
    { id: 'eco-1-4',  label: '1 CPU',  vCPU: 1,  ram: '4 GB RAM',   pricePerMonth: 32 },
    { id: 'eco-1-8',  label: '1 CPU',  vCPU: 1,  ram: '8 GB RAM',   pricePerMonth: 64 },
    { id: 'eco-2-16', label: '2 CPU',  vCPU: 2,  ram: '16 GB RAM',  pricePerMonth: 115 },
    { id: 'eco-4-32', label: '4 CPU',  vCPU: 4,  ram: '32 GB RAM',  pricePerMonth: 220 },
    { id: 'eco-8-64', label: '8 CPU',  vCPU: 8,  ram: '64 GB RAM',  pricePerMonth: 410 },
  ],
  balanced: [
    { id: 'bal-2-8',    label: '2 CPU',  vCPU: 2,  ram: '8 GB RAM',   pricePerMonth: 55 },
    { id: 'bal-4-16',   label: '4 CPU',  vCPU: 4,  ram: '16 GB RAM',  pricePerMonth: 110 },
    { id: 'bal-8-32',   label: '8 CPU',  vCPU: 8,  ram: '32 GB RAM',  pricePerMonth: 220 },
    { id: 'bal-16-64',  label: '16 CPU', vCPU: 16, ram: '64 GB RAM',  pricePerMonth: 440 },
    { id: 'bal-32-128', label: '32 CPU', vCPU: 32, ram: '128 GB RAM', pricePerMonth: 880 },
  ],
  'memory-optimized': [
    { id: 'mem-2-16',   label: '2 CPU',  vCPU: 2,  ram: '16 GB RAM',  pricePerMonth: 90 },
    { id: 'mem-4-32',   label: '4 CPU',  vCPU: 4,  ram: '32 GB RAM',  pricePerMonth: 180 },
    { id: 'mem-8-64',   label: '8 CPU',  vCPU: 8,  ram: '64 GB RAM',  pricePerMonth: 360 },
    { id: 'mem-16-128', label: '16 CPU', vCPU: 16, ram: '128 GB RAM', pricePerMonth: 720 },
  ],
  'storage-optimized': [
    { id: 'sto-2-8',   label: '2 CPU',  vCPU: 2,  ram: '8 GB RAM',  pricePerMonth: 75 },
    { id: 'sto-4-16',  label: '4 CPU',  vCPU: 4,  ram: '16 GB RAM', pricePerMonth: 150 },
    { id: 'sto-8-32',  label: '8 CPU',  vCPU: 8,  ram: '32 GB RAM', pricePerMonth: 300 },
    { id: 'sto-16-64', label: '16 CPU', vCPU: 16, ram: '64 GB RAM', pricePerMonth: 600 },
  ],
}

const STANDARD_STORAGE_SPECS: StorageSpec[] = [
  {
    id: 'block', label: 'Block storage',
    description: 'Remote storage with scalable capacity and configurable performance',
    throughputRead: '125 MiB/s', throughputWrite: '300 MiB/s',
    iopsRead: '3000', iopsWrite: '9000',
    note: 'Good for workloads with growing or unpredictable storage needs',
    pricePerGbMonth: 0.4,
  },
  {
    id: 'ssd', label: 'SSD', optimal: true,
    description: 'High-performance NVMe SSD with predictable and consistent performance',
    throughputRead: '250 MiB/s', throughputWrite: '500 MiB/s',
    iopsRead: '10000', iopsWrite: '30000',
    note: 'Optimal for latency-sensitive workloads requiring consistent performance',
    pricePerGbMonth: 0.6,
  },
  {
    id: 'local', label: 'Local disk', disabled: true,
    description: 'Local NVMe storage directly attached to the VM for maximum performance',
    throughputRead: '1000 MiB/s', throughputWrite: '800 MiB/s',
    iopsRead: '200000', iopsWrite: '100000',
    note: 'Not available with Economy compute profile',
    pricePerGbMonth: 0.2,
  },
]

const STANDARD_FIXED_TIER_PLANS: Partial<Record<ServiceTier, FixedTierPlan>> = {
  free:      { cpu: 1, ram: '1 GB', storage: '1 GB', price: 'Free' },
  developer: { cpu: 1, ram: '1 GB', storage: '8 GB', price: '$5' },
}

// ─── Shared tier option definitions ───────────────────────────────────────────

const TIER_FREE: TierOption = {
  id: 'free', title: 'Free', description: 'Explore and learn the platform at no cost.',
  features: [
    { text: 'Free forever', icon: 'tick' },
    { text: 'Automatically powered off when inactive', icon: 'info' },
    { text: 'Autopauses when inactive, no support', icon: 'info' },
  ],
  price: '$0',
}

const TIER_DEVELOPER: TierOption = {
  id: 'developer', title: 'Developer', description: 'A cost-effective option for test and personal projects.',
  features: [
    { text: "Inactive services aren't powered off", icon: 'tick' },
    { text: 'Basic support tier', icon: 'tick' },
    { text: 'No integrations or connection pooling', icon: 'info' },
  ],
  price: '$5',
}

const TIER_PROFESSIONAL: TierOption = {
  id: 'professional', title: 'Professional', description: 'For highly available business-critical workloads.',
  features: [
    { text: 'Deploy across multiple clouds and regions', icon: 'tick' },
    { text: '99.99% uptime SLA', icon: 'tick' },
    { text: 'Automatic backups for disaster recovery', icon: 'tick' },
  ],
  price: 'From $12',
}

// ─── Per-service plan sets ────────────────────────────────────────────────────

const KAFKA_PLANS: Plan[] = [
  { id: 'startup-2',   label: 'Startup-2',   nodes: 3, vCPU: 2,  ram: '8 GB',   storage: '90 GB',    monthlyPrice: '~$200' },
  { id: 'business-6',  label: 'Business-6',  nodes: 3, vCPU: 6,  ram: '16 GB',  storage: '250 GB',   monthlyPrice: '~$650' },
  { id: 'premium-6',   label: 'Premium-6',   nodes: 3, vCPU: 6,  ram: '32 GB',  storage: '600 GB',   monthlyPrice: '~$1,400' },
  { id: 'business-30', label: 'Business-30', nodes: 6, vCPU: 12, ram: '64 GB',  storage: '1,200 GB', monthlyPrice: '~$2,800' },
]

const MEMORY_STORE_PLANS: Plan[] = [
  { id: 'hobbyist-2',  label: 'Hobbyist-2',  nodes: 1, vCPU: 1,  ram: '2 GB',  storage: '1 GB',  monthlyPrice: '~$25' },
  { id: 'startup-4',   label: 'Startup-4',   nodes: 1, vCPU: 2,  ram: '4 GB',  storage: '8 GB',  monthlyPrice: '~$60' },
  { id: 'business-8',  label: 'Business-8',  nodes: 3, vCPU: 4,  ram: '8 GB',  storage: '16 GB', monthlyPrice: '~$200' },
  { id: 'business-16', label: 'Business-16', nodes: 3, vCPU: 8,  ram: '16 GB', storage: '32 GB', monthlyPrice: '~$400' },
  { id: 'premium-32',  label: 'Premium-32',  nodes: 6, vCPU: 16, ram: '32 GB', storage: '64 GB', monthlyPrice: '~$800' },
]

const ANALYTICS_PLANS: Plan[] = [
  { id: 'startup-4',   label: 'Startup-4',   nodes: 1, vCPU: 2,  ram: '4 GB',  storage: '80 GB',    monthlyPrice: '~$75' },
  { id: 'startup-8',   label: 'Startup-8',   nodes: 1, vCPU: 4,  ram: '8 GB',  storage: '175 GB',   monthlyPrice: '~$150' },
  { id: 'business-16', label: 'Business-16', nodes: 3, vCPU: 8,  ram: '16 GB', storage: '350 GB',   monthlyPrice: '~$500' },
  { id: 'business-32', label: 'Business-32', nodes: 3, vCPU: 16, ram: '32 GB', storage: '700 GB',   monthlyPrice: '~$1,000' },
  { id: 'premium-64',  label: 'Premium-64',  nodes: 6, vCPU: 16, ram: '64 GB', storage: '1,400 GB', monthlyPrice: '~$2,400' },
]

const METRICS_PLANS: Plan[] = [
  { id: 'startup-4',   label: 'Startup-4',   nodes: 1, vCPU: 2,  ram: '4 GB',  storage: '100 GB',   monthlyPrice: '~$90' },
  { id: 'business-8',  label: 'Business-8',  nodes: 3, vCPU: 4,  ram: '8 GB',  storage: '250 GB',   monthlyPrice: '~$300' },
  { id: 'business-16', label: 'Business-16', nodes: 3, vCPU: 8,  ram: '16 GB', storage: '500 GB',   monthlyPrice: '~$600' },
  { id: 'premium-32',  label: 'Premium-32',  nodes: 6, vCPU: 16, ram: '32 GB', storage: '1,000 GB', monthlyPrice: '~$1,500' },
]

const GRAFANA_PLANS: Plan[] = [
  { id: 'startup-1', label: 'Startup-1', nodes: 1, vCPU: 2, ram: '2 GB',  storage: '10 GB',  monthlyPrice: '~$30' },
  { id: 'startup-2', label: 'Startup-2', nodes: 1, vCPU: 4, ram: '4 GB',  storage: '25 GB',  monthlyPrice: '~$55' },
  { id: 'business-4',label: 'Business-4',nodes: 3, vCPU: 4, ram: '8 GB',  storage: '50 GB',  monthlyPrice: '~$180' },
  { id: 'premium-8', label: 'Premium-8', nodes: 6, vCPU: 8, ram: '16 GB', storage: '100 GB', monthlyPrice: '~$450' },
]

// ─── Legacy plan sets (for services that support the ACU ↔ legacy toggle) ────

const LEGACY_PG_PLANS: Plan[] = [
  { id: 'hobbyist', label: 'Hobbyist', nodes: 1, vCPU: 1, ram: '1 GB',  storage: '8 GB',   monthlyPrice: '~$25'  },
  { id: 'startup',  label: 'Startup',  nodes: 1, vCPU: 2, ram: '4 GB',  storage: '80 GB',  monthlyPrice: '~$75'  },
  { id: 'business', label: 'Business', nodes: 3, vCPU: 4, ram: '16 GB', storage: '480 GB', monthlyPrice: '~$350' },
  { id: 'premium',  label: 'Premium',  nodes: 3, vCPU: 8, ram: '32 GB', storage: '700 GB', monthlyPrice: '~$700' },
]

const LEGACY_MYSQL_PLANS: Plan[] = [
  { id: 'hobbyist', label: 'Hobbyist', nodes: 1, vCPU: 1, ram: '1 GB',  storage: '8 GB',   monthlyPrice: '~$20'  },
  { id: 'startup',  label: 'Startup',  nodes: 1, vCPU: 2, ram: '4 GB',  storage: '50 GB',  monthlyPrice: '~$60'  },
  { id: 'business', label: 'Business', nodes: 2, vCPU: 4, ram: '16 GB', storage: '300 GB', monthlyPrice: '~$280' },
  { id: 'premium',  label: 'Premium',  nodes: 3, vCPU: 8, ram: '32 GB', storage: '600 GB', monthlyPrice: '~$600' },
]

// ─── Per-service configurations ───────────────────────────────────────────────

const BASE_CONFIG = {
  tiers: [TIER_FREE, TIER_DEVELOPER, TIER_PROFESSIONAL],
  fixedTierPlans: STANDARD_FIXED_TIER_PLANS,
  cloudProviders: CLOUD_PROVIDERS,
  regionsByCloud: REGIONS_BY_CLOUD,
  haEnabled: false,
  computeProfiles: STANDARD_COMPUTE_PROFILES,
  computeOptionsByProfile: STANDARD_COMPUTE_OPTIONS,
  storageSpecs: STANDARD_STORAGE_SPECS,
  defaultComputeProfile: 'economy',
  diskSizeMin: 10,
  diskSizeMax: 12000,
  defaultDiskSize: 10,
}

const SERVICE_CONFIGS: Record<ServiceTypeId, ServiceConfig> = {
  postgresql: {
    ...BASE_CONFIG,
    versions: ['PostgreSQL 17', 'PostgreSQL 16', 'PostgreSQL 15'],
    haEnabled: true,
    legacyPlans: LEGACY_PG_PLANS,
  },

  mysql: {
    ...BASE_CONFIG,
    versions: ['MySQL 8.4', 'MySQL 8.0', 'MySQL 5.7'],
    haEnabled: true,
    defaultComputeProfile: 'balanced',
    diskSizeMax: 4000,
    defaultDiskSize: 50,
    legacyPlans: LEGACY_MYSQL_PLANS,
  },

  kafka: {
    ...BASE_CONFIG,
    versions: ['Apache Kafka 3.8', 'Apache Kafka 3.7', 'Apache Kafka 3.6'],
    tiers: [
      {
        id: 'developer', title: 'Developer', description: 'For testing and development environments.',
        features: [
          { text: 'Single broker setup', icon: 'tick' },
          { text: 'Basic support tier', icon: 'tick' },
          { text: 'Limited retention and throughput', icon: 'info' },
        ],
        price: '$5',
      },
      {
        id: 'professional', title: 'Professional', description: 'High-throughput messaging for production workloads.',
        features: [
          { text: 'Multi-broker with replication', icon: 'tick' },
          { text: '99.99% uptime SLA', icon: 'tick' },
          { text: 'Tiered storage and Kafka Connect', icon: 'tick' },
        ],
        price: 'From $20',
      },
    ],
    fixedTierPlans: {
      developer: { cpu: 2, ram: '4 GB', storage: '30 GB', price: '$5' },
    },
    haEnabled: false,
    plans: KAFKA_PLANS,
  },

  valkey: {
    ...BASE_CONFIG,
    versions: ['Valkey 7.2', 'Valkey 7.0'],
    plans: MEMORY_STORE_PLANS,
  },

  opensearch: {
    ...BASE_CONFIG,
    versions: ['OpenSearch 2.18', 'OpenSearch 2.17', 'OpenSearch 2.13'],
    plans: ANALYTICS_PLANS,
  },

  clickhouse: {
    ...BASE_CONFIG,
    versions: ['ClickHouse 24.8', 'ClickHouse 24.3', 'ClickHouse 23.8'],
    plans: ANALYTICS_PLANS,
  },

  dragonfly: {
    ...BASE_CONFIG,
    versions: ['Dragonfly 1.22', 'Dragonfly 1.21'],
    plans: MEMORY_STORE_PLANS,
  },

  metrics: {
    ...BASE_CONFIG,
    versions: ['Thanos 0.36', 'Thanos 0.35'],
    plans: METRICS_PLANS,
  },

  grafana: {
    ...BASE_CONFIG,
    versions: ['Grafana 11.4', 'Grafana 10.4', 'Grafana 10.3'],
    plans: GRAFANA_PLANS,
  },

  // Scenario-only service types — not selectable via the UI, configs are
  // reasonable defaults so the app doesn't error if one is ever opened.
  redis: {
    ...BASE_CONFIG,
    versions: ['Redis 7.2', 'Redis 7.0'],
    plans: MEMORY_STORE_PLANS,
  },
  flink: {
    ...BASE_CONFIG,
    versions: ['Apache Flink 1.19', 'Apache Flink 1.18'],
    plans: KAFKA_PLANS,
  },
  m3db: {
    ...BASE_CONFIG,
    versions: ['M3DB 1.5', 'M3DB 1.4'],
    plans: METRICS_PLANS,
  },
}

function getServiceConfig(serviceTypeId: ServiceTypeId | null | undefined): ServiceConfig {
  const key = (serviceTypeId ?? '') as ServiceTypeId
  return SERVICE_CONFIGS[key] ?? SERVICE_CONFIGS.postgresql
}

// ─── Layout constants (8px grid) ─────────────────────────────────────────────

const CONTAINER_MAX = 1440
const LEFT_COL_MAX = 984

// ─── TierCard ─────────────────────────────────────────────────────────────────

function TierCard({
  option,
  selected,
  onSelect,
}: {
  option: TierOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
      }}
      style={{
        border: `1px solid ${selected ? '#3545be' : '#ededf0'}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: selected ? '#f3f6ff' : '#fff',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        paddingTop: 16,
        paddingBottom: 0,
      }}
    >
      <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '0 16px' }}>
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography.DefaultStrong>{option.title}</Typography.DefaultStrong>
          <Typography.Caption>{option.description}</Typography.Caption>
        </Box>
        <RadioButton
          aria-label={`${option.title} tier`}
          name="serviceTier"
          value={option.id}
          checked={selected}
          onChange={onSelect}
        />
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {option.features.map((f) => (
          <Box key={f.text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '0 16px' }}>
            <Box
              component="span"
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: f.icon === 'tick' ? '#22c55e' : '#787885',
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {f.icon === 'tick' ? '✓' : 'ⓘ'}
            </Box>
            <Box style={{ color: '#787885' }}><Typography.Caption>{f.text}</Typography.Caption></Box>
          </Box>
        ))}
      </Box>
      <Box style={{ padding: '8px 16px' }}>
        <Typography.SmallStrong>{option.price}</Typography.SmallStrong>
      </Box>
    </Box>
  )
}

TierCard.displayName = 'TierCard'

// ─── CloudProviderIcon ────────────────────────────────────────────────────────

function CloudProviderIcon({ id }: { id: CloudProviderId }) {
  switch (id) {
    case 'aws':
      return (
        <Box aria-hidden="true" style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
          <img alt="" style={{ position: 'absolute', top: '18.75%', left: '4.52%', right: '3.87%', bottom: '49.71%', width: '91.61%', height: '31.54%', objectFit: 'contain' }} src={cloudAwsVector} />
          <img alt="" style={{ position: 'absolute', top: '56.35%', left: 0, right: 0, bottom: '21.17%', width: '100%', height: '22.48%', objectFit: 'contain' }} src={cloudAwsSmile} />
        </Box>
      )
    case 'google':
      return <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudGoogle} />
    case 'azure':
      return (
        <Box aria-hidden="true" style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
          <img alt="" style={{ position: 'absolute', top: 0, left: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure1} />
          <img alt="" style={{ position: 'absolute', top: 0, right: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure2} />
          <img alt="" style={{ position: 'absolute', bottom: 0, left: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure3} />
          <img alt="" style={{ position: 'absolute', bottom: 0, right: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure4} />
        </Box>
      )
    case 'digitalocean':
      return <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudDigitalOcean} />
    case 'upcloud':
      return <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudUpCloud} />
    default:
      return null
  }
}

CloudProviderIcon.displayName = 'CloudProviderIcon'

// ─── Inline badge components ──────────────────────────────────────────────────

const CHIP_BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#e8faea',
  color: '#006f00',
  fontFamily: '"Roboto Mono", monospace',
  fontWeight: 400,
  fontSize: 10,
  lineHeight: '16px',
  height: 16,
  padding: '0 4px',
  borderRadius: 16,
  whiteSpace: 'nowrap',
}

function RecommendedBadge() {
  return <span style={CHIP_BADGE_STYLE}>Recommended</span>
}

function OptimalBadge() {
  return <span style={CHIP_BADGE_STYLE}>Best performance</span>
}

RecommendedBadge.displayName = 'RecommendedBadge'
OptimalBadge.displayName = 'OptimalBadge'

// ─── Edit-mode init helpers ───────────────────────────────────────────────────

function parseTierFromPlanName(planName: string | undefined): ServiceTier {
  const pn = (planName ?? '').toLowerCase()
  if (pn === 'free') return 'free'
  if (pn === 'developer') return 'developer'
  return 'professional'
}

function parseCloudRegion(cloudRegion: string | undefined): { cloudName: string; regionId: string } {
  const str = cloudRegion ?? ''
  const idx = str.indexOf(': ')
  if (idx < 0) return { cloudName: '', regionId: '' }
  return { cloudName: str.slice(0, idx), regionId: str.slice(idx + 2) }
}

// ─── Props & payload types ────────────────────────────────────────────────────

type PricingModel = 'acu' | 'legacy'

export type CreatedServicePayload = {
  serviceName: string
  serviceTypeId: ServiceTypeId
  tier: ServiceTier
  cloud: string
  region: string
  regionLabel: string
  location: string
  planName: string
  planDetails: string
  nodeCount: number
  cpuCount: number
  ramCapacity: string
  storageCapacity: string
  ha?: string
  /** Only present for services that support the ACU ↔ legacy pricing toggle. */
  pricingModel?: PricingModel
}

export type CreateServiceProps = {
  embedded?: boolean
  editMode?: boolean
  initialValues?: ServiceRow
  serviceTypeId?: ServiceTypeId | null
  serviceDisplayName?: string
  onClose?: () => void
  onCreateSuccess?: (data?: CreatedServicePayload) => void
  submitRef?: React.MutableRefObject<(() => void) | undefined>
}

// ─── Main component ───────────────────────────────────────────────────────────

function CreateService({
  embedded = false,
  editMode = false,
  initialValues,
  serviceTypeId,
  serviceDisplayName,
  onClose,
  onCreateSuccess,
  submitRef,
}: CreateServiceProps) {
  const config = useMemo(() => getServiceConfig(serviceTypeId), [serviceTypeId])

  // ── Edit-mode init ──
  const _initCR = parseCloudRegion(initialValues?.cloudRegion)
  const _initCloud = (
    config.cloudProviders.find(
      (c) => c.id.toLowerCase() === _initCR.cloudName.toLowerCase(),
    )?.id ?? config.cloudProviders[0]?.id ?? 'aws'
  ) as CloudProviderId

  const _initComputeProfile = (() => {
    if (!initialValues?.cpuCount && !initialValues?.ramCapacity) return config.defaultComputeProfile
    const ramGb = parseInt(initialValues?.ramCapacity ?? '2') || 2
    const cpu = initialValues?.cpuCount ?? 1
    for (const [profileId, options] of Object.entries(config.computeOptionsByProfile)) {
      if (options.some((o) => o.vCPU === cpu && parseInt(o.ram) === ramGb)) return profileId
    }
    return config.defaultComputeProfile
  })()

  const _initComputeId = (() => {
    const fallback = config.computeOptionsByProfile[_initComputeProfile]?.[0]?.id ?? ''
    if (!initialValues?.cpuCount && !initialValues?.ramCapacity) return fallback
    const ramGb = parseInt(initialValues?.ramCapacity ?? '2') || 2
    const cpu = initialValues?.cpuCount ?? 1
    return (
      config.computeOptionsByProfile[_initComputeProfile]?.find(
        (o) => o.vCPU === cpu && parseInt(o.ram) === ramGb,
      )?.id ?? fallback
    )
  })()

  // ── State ──
  const [tier, setTier] = useState<ServiceTier>(() => {
    const fromInit = parseTierFromPlanName(initialValues?.planName)
    return (config.tiers.find((t) => t.id === fromInit)?.id ?? config.tiers[0]?.id ?? 'developer') as ServiceTier
  })
  const [serviceName, setServiceName] = useState(
    initialValues?.serviceName ?? `${(serviceTypeId ?? 'service').toLowerCase()}-2536119c`,
  )
  const [version, setVersion] = useState(config.versions[0] ?? '')
  const [cloud, setCloud] = useState<CloudProviderId>(_initCloud)
  const [regionId, setRegionId] = useState<string>(
    _initCR.regionId || config.regionsByCloud[_initCloud]?.[0]?.id || '',
  )
  const [haOption, setHaOption] = useState<HaOption>('primary-standby')
  const [computeProfile, setComputeProfile] = useState<string>(_initComputeProfile)
  const [computeId, setComputeId] = useState<string>(_initComputeId)
  const [showAllComputeOptions, setShowAllComputeOptions] = useState(false)
  const [storageType, setStorageType] = useState<string>(
    () => config.storageSpecs.find((s) => !s.disabled && s.optimal)?.id
      ?? config.storageSpecs.find((s) => !s.disabled)?.id
      ?? 'block',
  )
  const [diskSizeGb, setDiskSizeGb] = useState<number>(config.defaultDiskSize)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => config.plans?.[0]?.id ?? '')
  const [pricingModel, setPricingModel] = useState<PricingModel>(() => {
    // Only PG / MySQL have the toggle (legacyPlans defined).
    if (!config.legacyPlans) return 'acu'
    // In edit mode, mirror the service's current pricing state:
    //   pricingType 'ACU'  → ACU mode (toggle ON)
    //   anything else      → legacy mode (toggle OFF), including pre-existing services
    //                        that have never had an explicit pricingType set.
    if (initialValues) return initialValues.pricingType === 'ACU' ? 'acu' : 'legacy'
    // Creation mode: default to ACU (the new / recommended model).
    return 'acu'
  })
  const [selectedLegacyPlanId, setSelectedLegacyPlanId] = useState<string>(() => {
    const firstId = config.legacyPlans?.[0]?.id ?? ''
    if (!config.legacyPlans || !initialValues?.planName) return firstId
    // In edit mode, pre-select the plan whose label matches the service's current planName.
    const match = config.legacyPlans.find(
      (p) => p.label.toLowerCase() === (initialValues.planName ?? '').toLowerCase(),
    )
    return match?.id ?? firstId
  })
  const [regionArea, setRegionArea] = useState<RegionArea>('europe')

  const isSimpleTier = tier === 'free' || tier === 'developer'
  const isLegacyMode = config.legacyPlans != null && pricingModel === 'legacy'

  // ── Computed ──
  const currentComputeOptions = useMemo(
    () => config.computeOptionsByProfile[computeProfile] ?? [],
    [config, computeProfile],
  )
  const selectedCompute = useMemo(
    () => currentComputeOptions.find((o) => o.id === computeId) ?? currentComputeOptions[0],
    [currentComputeOptions, computeId],
  )
  const selectedRegion = useMemo(
    () => config.regionsByCloud[cloud]?.find((r) => r.id === regionId) ?? config.regionsByCloud[cloud]?.[0],
    [config, cloud, regionId],
  )
  const selectedStorageSpec = useMemo(
    () => config.storageSpecs.find((s) => s.id === storageType) ?? config.storageSpecs[0],
    [config, storageType],
  )
  const selectedComputeProfileInfo = useMemo(
    () => config.computeProfiles.find((p) => p.id === computeProfile) ?? config.computeProfiles[0],
    [config, computeProfile],
  )
  const selectedPlan = useMemo(
    () => config.plans?.find((p) => p.id === selectedPlanId) ?? config.plans?.[0],
    [config, selectedPlanId],
  )
  const selectedLegacyPlan = useMemo(
    () => config.legacyPlans?.find((p) => p.id === selectedLegacyPlanId) ?? config.legacyPlans?.[0],
    [config, selectedLegacyPlanId],
  )
  const nodeCount = HA_NODE_COUNT[haOption]

  // When isLegacyMode, redirect plan selection to the legacy plan set.
  // Both setters have compatible signatures so the conditional assignment is safe.
  const activePlans = isLegacyMode ? config.legacyPlans : config.plans
  const activeSelectedPlanId = isLegacyMode ? selectedLegacyPlanId : selectedPlanId
  const handleSelectPlan = isLegacyMode ? setSelectedLegacyPlanId : setSelectedPlanId
  const storageCost = useMemo(
    () => Math.ceil(diskSizeGb * (selectedStorageSpec?.pricePerGbMonth ?? 0)),
    [diskSizeGb, selectedStorageSpec],
  )
  const estimatedMonthly = useMemo(
    () => nodeCount * ((selectedCompute?.pricePerMonth ?? 0) + storageCost),
    [nodeCount, selectedCompute, storageCost],
  )
  const visibleComputeOptions = showAllComputeOptions
    ? currentComputeOptions
    : currentComputeOptions.slice(0, 3)

  // ── Submit handler ──
  const handleCreate = () => {
    if (!serviceTypeId) { onCreateSuccess?.(); return }

    if (isSimpleTier) {
      const fp = config.fixedTierPlans[tier as 'free' | 'developer']
      if (!fp) { onCreateSuccess?.(); return }
      const regionLabel = REGION_AREAS.find((a) => a.id === regionArea)?.label ?? regionArea
      const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
      onCreateSuccess?.({
        serviceName, serviceTypeId, tier,
        cloud: 'aiven', region: regionArea,
        regionLabel, location: regionLabel,
        planName: tierLabel,
        planDetails: `${fp.cpu} vCPU / ${fp.ram} / ${fp.storage}`,
        nodeCount: 1, cpuCount: fp.cpu,
        ramCapacity: fp.ram, storageCapacity: fp.storage,
      })
      return
    }

    if (isLegacyMode) {
      const plan = selectedLegacyPlan
      if (!plan) { onCreateSuccess?.(); return }
      onCreateSuccess?.({
        serviceName, serviceTypeId, tier,
        cloud: cloud.toUpperCase(),
        region: regionId,
        regionLabel: selectedRegion?.label ?? regionId,
        location: selectedRegion?.location ?? regionId,
        planName: plan.label,
        planDetails: `${plan.vCPU} vCPU / ${plan.ram} / ${plan.storage}`,
        nodeCount: plan.nodes,
        cpuCount: plan.vCPU,
        ramCapacity: plan.ram,
        storageCapacity: plan.storage,
        pricingModel: 'legacy',
      })
      return
    }

    if (config.plans) {
      const plan = selectedPlan
      if (!plan) { onCreateSuccess?.(); return }
      onCreateSuccess?.({
        serviceName, serviceTypeId, tier,
        cloud: cloud.toUpperCase(),
        region: regionId,
        regionLabel: selectedRegion?.label ?? regionId,
        location: selectedRegion?.location ?? regionId,
        planName: plan.label,
        planDetails: `${plan.vCPU} vCPU / ${plan.ram} / ${plan.storage}`,
        nodeCount: plan.nodes,
        cpuCount: plan.vCPU,
        ramCapacity: plan.ram,
        storageCapacity: plan.storage,
      })
      return
    }

    onCreateSuccess?.({
      serviceName, serviceTypeId, tier,
      cloud: cloud.toUpperCase(),
      region: regionId,
      regionLabel: selectedRegion?.label ?? regionId,
      location: selectedRegion?.location ?? regionId,
      planName: 'Professional',
      planDetails: `${selectedCompute?.vCPU ?? 1} vCPU / ${selectedCompute?.ram ?? ''} / ${diskSizeGb} GB storage`,
      nodeCount,
      cpuCount: selectedCompute?.vCPU ?? 1,
      ramCapacity: selectedCompute?.ram ?? '',
      storageCapacity: `${diskSizeGb} GB`,
      ha: HA_OPTIONS.find((o) => o.id === haOption)?.label ?? haOption,
      pricingModel: 'acu',
    })
  }

  if (submitRef) submitRef.current = handleCreate

  // ── Render ──
  return (
    <Box style={{ minHeight: embedded ? undefined : '100vh', backgroundColor: embedded ? '#fff' : '#f9f9fb', width: '100%' }}>
      {embedded && onClose && !editMode && (
        <Box style={{ padding: `0 ${PADDING}px`, height: 24, display: 'flex', alignItems: 'center' }}>
          <Button.Ghost dense type="button" onClick={onClose}>← Back</Button.Ghost>
        </Box>
      )}
      <Box
        style={{
          maxWidth: embedded ? undefined : CONTAINER_MAX,
          margin: embedded ? 0 : '0 auto',
          padding: PADDING,
          display: 'flex',
          gap: LAYOUT_GAP,
          alignItems: 'flex-start',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Left column ── */}
        <Box style={{ flex: 1, minWidth: 0, maxWidth: embedded ? undefined : LEFT_COL_MAX }}>

          {/* Service tier */}
          <Section icon={containerIcon} title="Service tier">
            <Box style={{ color: '#787885', marginBottom: 16 }}>
              <Typography.Small>
                Service tiers are structured to help you scale as your project grows.{' '}
                <Link href="#">Compare</Link>
              </Typography.Small>
            </Box>
            <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
              {config.tiers.map((opt) => (
                <TierCard
                  key={opt.id}
                  option={opt}
                  selected={tier === opt.id}
                  onSelect={() => setTier(opt.id)}
                />
              ))}
            </Box>
          </Section>

          {/* Cloud */}
          <Section icon={cloudIcon} title="Cloud">
            {isSimpleTier ? (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Box style={{ color: '#787885' }}>
                  <Typography.Small>
                    You can select a specific cloud provider and region on Professional tier
                  </Typography.Small>
                </Box>
                <ChoiceChipGroup
                  name="regionArea"
                  selectionMode="radio"
                  value={regionArea}
                  onChange={(v) => setRegionArea(v as RegionArea)}
                >
                  {REGION_AREAS.map((a) => (
                    <ChoiceChip key={a.id} value={a.id}>{a.label}</ChoiceChip>
                  ))}
                </ChoiceChipGroup>
              </Box>
            ) : (
              <>
                <Box style={{ marginBottom: 24 }}>
                  <ChoiceChipGroup
                    name="cloud"
                    selectionMode="radio"
                    value={cloud}
                    onChange={(v) => {
                      const id = v as CloudProviderId
                      setCloud(id)
                      setRegionId(config.regionsByCloud[id]?.[0]?.id ?? '')
                    }}
                  >
                    {config.cloudProviders.map((c) => (
                      <ChoiceChip key={c.id} value={c.id}>
                        <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <CloudProviderIcon id={c.id} />
                          {c.label}
                        </Box>
                      </ChoiceChip>
                    ))}
                  </ChoiceChipGroup>
                </Box>
                <Box style={{ maxWidth: 700 }}>
                  <Select
                    labelText="Select region"
                    options={config.regionsByCloud[cloud]?.map((r) => `${r.flag} ${r.label}`) ?? []}
                    value={selectedRegion ? `${selectedRegion.flag} ${selectedRegion.label}` : ''}
                    onChange={(val) => {
                      const found = config.regionsByCloud[cloud]?.find(
                        (r) => `${r.flag} ${r.label}` === String(val ?? ''),
                      )
                      if (found) setRegionId(found.id)
                    }}
                  />
                </Box>
              </>
            )}
          </Section>

          {isSimpleTier ? (
            /* Fixed compute plan for Free / Developer */
            <Section icon={cpuChipIcon} title="Compute and storage">
              {(() => {
                const fp = config.fixedTierPlans[tier as 'free' | 'developer']
                if (!fp) return null
                return (
                  <Box style={{ border: '1px solid #ededf0', borderRadius: 8, overflow: 'hidden' }}>
                    <Box
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '8px 16px', borderBottom: '1px solid #ededf0',
                        backgroundColor: '#f9f9fb',
                      }}
                    >
                      <Box style={{ width: 32, flexShrink: 0 }} />
                      <Box style={{ flex: 1 }}><Box style={{ color: '#787885' }}><Typography.Caption>CPU</Typography.Caption></Box></Box>
                      <Box style={{ flex: 1 }}><Box style={{ color: '#787885' }}><Typography.Caption>RAM</Typography.Caption></Box></Box>
                      <Box style={{ flex: 1 }}><Box style={{ color: '#787885' }}><Typography.Caption>Storage</Typography.Caption></Box></Box>
                      <Box style={{ flex: 1, textAlign: 'right' }}><Box style={{ color: '#787885' }}><Typography.Caption>Est. monthly price</Typography.Caption></Box></Box>
                    </Box>
                    <Box
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '10px 16px', backgroundColor: '#f3f6ff',
                      }}
                    >
                      <Box style={{ width: 32, flexShrink: 0 }}>
                        <RadioButton aria-label="Fixed plan" name="fixedPlan" value="fixed" checked onChange={() => {}} />
                      </Box>
                      <Box style={{ flex: 1 }}><Typography.Default>{fp.cpu}</Typography.Default></Box>
                      <Box style={{ flex: 1 }}><Typography.Default>{fp.ram}</Typography.Default></Box>
                      <Box style={{ flex: 1 }}><Typography.Default>{fp.storage}</Typography.Default></Box>
                      <Box style={{ flex: 1, textAlign: 'right' }}><Typography.DefaultStrong>{fp.price}</Typography.DefaultStrong></Box>
                    </Box>
                  </Box>
                )
              })()}
            </Section>
          ) : activePlans ? (
            /* ── Plan section (legacy plans for PG/MySQL, or fixed plans for other service types) ── */
            <Section icon={proPlansIcon} title="Plan">
              <Box style={{ border: '1px solid #ededf0', borderRadius: 8, overflow: 'hidden' }}>
                {/* Header */}
                <Box
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '8px 16px', borderBottom: '1px solid #ededf0',
                    backgroundColor: '#f9f9fb',
                  }}
                >
                  <Box style={{ width: 32, flexShrink: 0 }} />
                  <Box style={{ flex: 2 }}><Box style={{ color: '#787885' }}><Typography.Caption>Plan</Typography.Caption></Box></Box>
                  <Box style={{ flex: 1 }}><Box style={{ color: '#787885' }}><Typography.Caption>Nodes</Typography.Caption></Box></Box>
                  <Box style={{ flex: 1 }}><Box style={{ color: '#787885' }}><Typography.Caption>vCPU</Typography.Caption></Box></Box>
                  <Box style={{ flex: 1 }}><Box style={{ color: '#787885' }}><Typography.Caption>RAM</Typography.Caption></Box></Box>
                  <Box style={{ flex: 2 }}><Box style={{ color: '#787885' }}><Typography.Caption>Storage</Typography.Caption></Box></Box>
                  <Box style={{ flex: 1, textAlign: 'right' }}><Box style={{ color: '#787885' }}><Typography.Caption>Monthly price</Typography.Caption></Box></Box>
                </Box>
                {/* Plan rows */}
                {activePlans.map((plan, idx) => {
                  const isSelected = activeSelectedPlanId === plan.id
                  return (
                    <Box
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectPlan(plan.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectPlan(plan.id) }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '10px 16px',
                        backgroundColor: isSelected ? '#f3f6ff' : '#fff',
                        borderTop: idx === 0 ? 'none' : '1px solid #ededf0',
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      <Box style={{ width: 32, flexShrink: 0 }}>
                        <RadioButton aria-label={`Plan ${plan.label}`} name="plan" value={plan.id} checked={isSelected} onChange={() => handleSelectPlan(plan.id)} />
                      </Box>
                      <Box style={{ flex: 2 }}><Typography.DefaultStrong>{plan.label}</Typography.DefaultStrong></Box>
                      <Box style={{ flex: 1 }}><Typography.Default>{plan.nodes}</Typography.Default></Box>
                      <Box style={{ flex: 1 }}><Typography.Default>{plan.vCPU}</Typography.Default></Box>
                      <Box style={{ flex: 1 }}><Typography.Default>{plan.ram}</Typography.Default></Box>
                      <Box style={{ flex: 2 }}><Typography.Default>{plan.storage}</Typography.Default></Box>
                      <Box style={{ flex: 1, textAlign: 'right' }}><Typography.DefaultStrong>{plan.monthlyPrice}</Typography.DefaultStrong></Box>
                    </Box>
                  )
                })}
              </Box>
            </Section>
          ) : (
            /* ── HA + Compute + Storage (postgresql / mysql) ── */
            <>
              {config.haEnabled && (
                <Section icon={nodesIcon} title="High-availability">
                  <Box style={{ minWidth: 0 }}>
                    <Box style={{ color: '#4a4b57', marginBottom: 16 }}>
                      <Typography.Small>
                        Multi-node setups with primary/standby nodes across availability zones, offering automatic failover.{' '}
                        <Link href="#">Learn more</Link>
                      </Typography.Small>
                    </Box>
                    <ChoiceChipGroup
                      name="ha"
                      selectionMode="radio"
                      value={haOption}
                      onChange={(v) => setHaOption(v as HaOption)}
                    >
                      {HA_OPTIONS.map((opt) => (
                        <ChoiceChip key={opt.id} value={opt.id}>
                          <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {opt.label}
                            {opt.recommended && <RecommendedBadge />}
                          </Box>
                        </ChoiceChip>
                      ))}
                    </ChoiceChipGroup>
                  </Box>
                </Section>
              )}

              {/* Compute */}
              <Section icon={cpuChipIcon} title="Compute">
                <Box style={{ marginBottom: 12 }}>
                  <ChoiceChipGroup
                    name="computeProfile"
                    selectionMode="radio"
                    value={computeProfile}
                    onChange={(v) => {
                      setComputeProfile(v)
                      setComputeId(config.computeOptionsByProfile[v]?.[0]?.id ?? '')
                      setShowAllComputeOptions(false)
                    }}
                  >
                    {config.computeProfiles.map((p) => (
                      <ChoiceChip key={p.id} value={p.id}>{p.label}</ChoiceChip>
                    ))}
                  </ChoiceChipGroup>
                </Box>
                <Box style={{ color: '#4a4b57', marginBottom: 16 }}>
                  <Typography.Small>{selectedComputeProfileInfo?.description}</Typography.Small>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', border: '1px solid #ededf0', borderRadius: 8, overflow: 'hidden' }}>
                  {visibleComputeOptions.map((opt, idx) => {
                    const isSelected = computeId === opt.id
                    return (
                      <Box
                        key={opt.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setComputeId(opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setComputeId(opt.id) }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                          backgroundColor: isSelected ? '#f3f6ff' : '#fff',
                          borderTop: idx === 0 ? 'none' : '1px solid #ededf0',
                          cursor: 'pointer', outline: 'none',
                        }}
                      >
                        <RadioButton
                          aria-label={`${opt.label} ${opt.ram}`}
                          name="compute"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => setComputeId(opt.id)}
                        />
                        <Box style={{ flex: 1, display: 'flex', gap: 32 }}>
                          <Typography.Default>{opt.label}</Typography.Default>
                          <Typography.Default>{opt.ram}</Typography.Default>
                        </Box>
                        <Typography.DefaultStrong>${opt.pricePerMonth}</Typography.DefaultStrong>
                      </Box>
                    )
                  })}
                </Box>
                {currentComputeOptions.length > 3 && (
                  <Box style={{ marginTop: 8 }}>
                    <Button.Ghost dense type="button" onClick={() => setShowAllComputeOptions((v) => !v)}>
                      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <InlineIcon icon={showAllComputeOptions ? chevronUpIcon : chevronDownIcon} />
                        {showAllComputeOptions ? 'See fewer options' : 'See all options'}
                      </Box>
                    </Button.Ghost>
                  </Box>
                )}
              </Section>

              {/* Storage */}
              <Section icon={serverHddIcon} title="Storage">
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  <ChoiceChipGroup
                    name="storageType"
                    selectionMode="radio"
                    value={storageType}
                    onChange={(v) => setStorageType(v)}
                  >
                    {config.storageSpecs.map((s) => (
                      <ChoiceChip key={s.id} value={s.id} disabled={s.disabled}>
                        <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {s.label}
                          {s.optimal && <OptimalBadge />}
                        </Box>
                      </ChoiceChip>
                    ))}
                  </ChoiceChipGroup>
                  <Box style={{ color: '#4a4b57' }}>
                    <Typography.Small>{selectedStorageSpec?.description}</Typography.Small>
                  </Box>
                </Box>

                {/* Disk size card */}
                <Box style={{ borderRadius: 8, overflow: 'hidden' }}>
                  <Box style={{ backgroundColor: '#f3f6ff', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <Box style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <Typography.SmallStrong>Disk size</Typography.SmallStrong>
                      <Box aria-hidden="true" style={{ color: '#787885', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>ⓘ</Box>
                    </Box>
                    <Box style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <Box style={{ flex: 1, position: 'relative', paddingBottom: 20 }}>
                        <input
                          type="range"
                          min={config.diskSizeMin}
                          max={config.diskSizeMax}
                          value={diskSizeGb}
                          onChange={(e) => setDiskSizeGb(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--aquarium-background-color-primary-default, #3545be)' }}
                          aria-label="Disk size in GB"
                        />
                        <Box style={{ position: 'absolute', bottom: 0, left: 0, color: '#787885' }}>
                          <Typography.Small>{config.diskSizeMin}</Typography.Small>
                        </Box>
                        <Box style={{ position: 'absolute', bottom: 0, right: 0, color: '#787885' }}>
                          <Typography.Small>{config.diskSizeMax}</Typography.Small>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <Input
                          labelText=""
                          value={String(diskSizeGb)}
                          onChange={(e) => {
                            const n = Number(e.target.value)
                            if (!Number.isNaN(n)) setDiskSizeGb(Math.min(config.diskSizeMax, Math.max(config.diskSizeMin, n)))
                          }}
                          style={{ width: 80 }}
                        />
                        <Box style={{ color: '#4a4b57' }}><Typography.Small>GB</Typography.Small></Box>
                      </Box>
                      <Box style={{ width: 120, flexShrink: 0, textAlign: 'right' }}>
                        <Typography.DefaultStrong>${storageCost}</Typography.DefaultStrong>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      border: '1px solid #ededf0', borderTop: 'none',
                      borderRadius: '0 0 8px 8px', padding: '12px 16px', color: '#4a4b57',
                    }}
                  >
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <Box style={{ width: 100, flexShrink: 0 }}><Typography.SmallStrong>Throughput</Typography.SmallStrong></Box>
                        <Box style={{ width: 140, flexShrink: 0 }}><Typography.Small>Read: {selectedStorageSpec?.throughputRead}</Typography.Small></Box>
                        <Box style={{ width: 140, flexShrink: 0 }}><Typography.Small>Write: {selectedStorageSpec?.throughputWrite}</Typography.Small></Box>
                      </Box>
                      <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <Box style={{ width: 100, flexShrink: 0 }}><Typography.SmallStrong>IOPS</Typography.SmallStrong></Box>
                        <Box style={{ width: 140, flexShrink: 0 }}><Typography.Small>Read: {selectedStorageSpec?.iopsRead}</Typography.Small></Box>
                        <Box style={{ width: 140, flexShrink: 0 }}><Typography.Small>Write: {selectedStorageSpec?.iopsWrite}</Typography.Small></Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Section>
            </>
          )}

          {/* Service details */}
          <Section icon={tagIcon} title="Service details">
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Input
                labelText="Service name*"
                description="Cannot be changed afterwards"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
              <Select
                labelText="Version*"
                description="Default version is preselected"
                options={config.versions}
                value={version}
                onChange={(val) => setVersion(String(val ?? ''))}
              />
            </Box>
            <Box>
              <Button.Ghost dense type="button">
                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <InlineIcon icon={addIcon} />
                  Tag service
                </Box>
              </Button.Ghost>
            </Box>
          </Section>
        </Box>

        {/* ── Right sidebar ── */}
        <Box
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            border: '1px solid #ededf0',
            borderRadius: 8,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: embedded ? 'calc(100vh - 360px)' : '100vh',
            overflow: 'hidden',
          }}
        >
          <Box style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
            {isSimpleTier ? (
              /* ── Simplified summary for Free / Developer ── */
              <>
                <Typography.DefaultStrong>{version}</Typography.DefaultStrong>

                <SummaryDetail label="Name" value={serviceName} />

                <SummaryDetail
                  label="Region"
                  value={REGION_AREAS.find((a) => a.id === regionArea)?.label ?? regionArea}
                />

                <SummaryDetail
                  label="Service tier"
                  value={config.tiers.find((t) => t.id === tier)?.title ?? tier}
                />

                {(() => {
                  const fp = config.fixedTierPlans[tier as 'free' | 'developer']
                  if (!fp) return null
                  return (
                    <SummaryDetail
                      label="Compute and storage"
                      value={`${fp.cpu} CPU · ${fp.ram} · ${fp.storage}`}
                    />
                  )
                })()}

                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                  <Box aria-hidden="true" style={{ borderTop: '1px solid #ededf0', marginBottom: 8 }} />
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Box style={{ color: '#16171a' }}>
                      <Typography.SmallStrong>Est. monthly*</Typography.SmallStrong>
                    </Box>
                    <Typography.Heading>
                      {tier === 'free' ? 'Free' : `${config.fixedTierPlans.developer?.price ?? '$5'} USD`}
                    </Typography.Heading>
                  </Box>
                </Box>

                <Box style={{ color: '#68696b' }}>
                  <Typography.Caption>*Based on 730 hours of usage.</Typography.Caption>
                </Box>
              </>
            ) : (
              /* ── Full summary for Professional ── */
              <>
                {config.legacyPlans != null && (
                  <Box
                    style={{
                      backgroundColor: '#ebfbee', borderRadius: 8, padding: '0 16px',
                      display: 'flex', gap: 0, alignItems: 'center', minHeight: 64,
                      overflow: 'hidden', position: 'relative',
                    }}
                  >
                    <Switch
                      checked={pricingModel === 'acu'}
                      onChange={() => setPricingModel((m) => m === 'acu' ? 'legacy' : 'acu')}
                    />
                    <Box style={{ minWidth: 0 }}>
                      {pricingModel === 'acu' ? (
                        <>
                          <Typography.SmallStrong>Flexible configuration & pricing</Typography.SmallStrong>
                          <Box style={{ color: '#4a4b57', marginTop: 2 }}>
                            <Typography.Caption>Fine-tune CPU, RAM and disk. <Link href="#">Details</Link></Typography.Caption>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Typography.SmallStrong>Legacy pricing plans</Typography.SmallStrong>
                          <Box style={{ color: '#4a4b57', marginTop: 2 }}>
                            <Typography.Caption>Node count included in plan</Typography.Caption>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                )}

                <Typography.DefaultStrong>{version}</Typography.DefaultStrong>

                <SummaryDetail label="Name" value={serviceName} />

                <SummaryDetail
                  label="Cloud"
                  value={
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Box style={{ color: '#16171a' }}><Typography.Small>{cloud.toUpperCase()}</Typography.Small></Box>
                      <Box style={{ color: '#787885' }}><Typography.Small>·</Typography.Small></Box>
                      <Box style={{ color: '#16171a' }}>
                        <Typography.Small>
                          {selectedRegion?.flag} {selectedRegion?.location ?? selectedRegion?.label}
                        </Typography.Small>
                      </Box>
                    </Box>
                  }
                />

                {config.haEnabled && !isLegacyMode && (
                  <SummaryDetail
                    label="High-availability"
                    value={HA_OPTIONS.find((o) => o.id === haOption)?.label ?? haOption}
                  />
                )}

                <SummaryDetail
                  label="Service tier"
                  value={config.tiers.find((t) => t.id === tier)?.title ?? tier}
                />

                {(config.plans != null || isLegacyMode) ? (
                  <SummaryDetail
                    label="Plan"
                    value={(() => {
                      const plan = isLegacyMode ? selectedLegacyPlan : selectedPlan
                      return plan
                        ? `${plan.label} · ${plan.nodes} ${plan.nodes === 1 ? 'node' : 'nodes'} · ${plan.vCPU} vCPU · ${plan.ram}`
                        : '—'
                    })()}
                  />
                ) : (
                  <>
                    <SummaryDetail
                      label="Compute"
                      value={`${selectedComputeProfileInfo?.label}: 1 node · ${selectedCompute?.vCPU ?? ''} vCPU · ${selectedCompute?.ram ?? ''}`}
                    />
                    <SummaryDetail label="Total storage" value={`${diskSizeGb} GB`} />
                  </>
                )}

                {/* Pricing breakdown */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                  <Box aria-hidden="true" style={{ borderTop: '1px solid #ededf0', marginBottom: 8 }} />
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Box style={{ color: '#16171a' }}>
                      <Typography.SmallStrong>Est. monthly*</Typography.SmallStrong>
                    </Box>
                  {(config.plans != null || isLegacyMode) ? (
                    <Typography.Heading>
                      {(isLegacyMode ? selectedLegacyPlan : selectedPlan)?.monthlyPrice ?? '—'} USD
                    </Typography.Heading>
                  ) : (
                    <Typography.Heading>${estimatedMonthly.toFixed(2)} USD</Typography.Heading>
                  )}
                  </Box>
                  {!config.plans && !isLegacyMode && (
                    <>
                      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box style={{ color: '#787885' }}>
                          <Typography.Caption>Compute · {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</Typography.Caption>
                        </Box>
                        <Typography.Caption>${(selectedCompute?.pricePerMonth ?? 0) * nodeCount}</Typography.Caption>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box style={{ color: '#787885' }}>
                          <Typography.Caption>Storage · {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</Typography.Caption>
                        </Box>
                        <Typography.Caption>${storageCost * nodeCount}</Typography.Caption>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Box style={{ color: '#787885' }}><Typography.Caption>Network</Typography.Caption></Box>
                          <Box aria-hidden="true" style={{ color: '#787885', fontSize: 10 }}>ⓘ</Box>
                        </Box>
                        <Typography.Caption>Usage-based · $0.02/GB</Typography.Caption>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Box style={{ color: '#787885' }}><Typography.Caption>Backups</Typography.Caption></Box>
                          <Box aria-hidden="true" style={{ color: '#787885', fontSize: 10 }}>ⓘ</Box>
                        </Box>
                        <Typography.Caption>Every 24h · 24h retention</Typography.Caption>
                      </Box>
                    </>
                  )}
                </Box>

                <Box style={{ color: '#68696b' }}>
                  <Typography.Caption>*Based on 730 hours of usage.</Typography.Caption>
                </Box>
              </>
            )}
          </Box>

          {/* Footer buttons — only when parent is not supplying its own footer (submitRef) */}
          {!submitRef && (
            <Box style={{ padding: '0 24px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {embedded && onClose && (
                <Button.Secondary type="button" onClick={onClose}>Cancel</Button.Secondary>
              )}
              <Button.Primary type="button" onClick={handleCreate}>
                {editMode ? 'Apply changes' : serviceDisplayName ? `Create ${serviceDisplayName} service` : 'Create service'}
              </Button.Primary>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

CreateService.displayName = 'CreateService'

export default CreateService
