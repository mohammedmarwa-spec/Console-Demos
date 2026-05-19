import { useMemo, useState } from 'react'
import type { ServiceRow } from './ProjectServices'
import {
  Box,
  Button,
  Card,
  ChoiceChip,
  ChoiceChipGroup,
  Icon,
  InlineIcon,
  Input,
  Link,
  RadioButton,
  Select,
  Tabs,
  Typography,
} from '@aivenio/aquarium'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import tickIcon from '@aivenio/aquarium/icons/tick'
import {
  CreationFlowSection,
  DetailField,
  FixedPlanTable,
  LAYOUT_GAP,
  PADDING,
  PricingBanner,
  ServiceSummarySidebar,
} from './ServiceCreationShared'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import containerIcon from '@aivenio/aquarium/icons/container'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import serverHddIcon from '@aivenio/aquarium/icons/serverHdd'
import tagIcon from '@aivenio/aquarium/icons/tag'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import listIcon from '@aivenio/aquarium/icons/list'
import addIcon from '@aivenio/aquarium/icons/add'
import type { ServiceTypeId } from './ServiceTypeSelectModal'
import { ServiceRegionPicker } from './ServiceRegionPicker'
import type { CloudProvider, CloudProviderId, Region, RegionArea } from './serviceRegions'
import {
  CLOUD_PROVIDERS,
  REGION_AREAS,
  REGIONS_BY_CLOUD,
} from './serviceRegions'

// ─── Domain types ─────────────────────────────────────────────────────────────

type ServiceTier = 'free' | 'developer' | 'professional'
type HaOption = 'no-ha' | 'primary-standby' | 'primary-2-standby'

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

// ─── Service config types ─────────────────────────────────────────────────────

type TierFeature = { text: string; icon: 'tick' | 'info' }

type TierOption = {
  id: ServiceTier
  title: string
  description: string
  features: TierFeature[]
  price: string
}

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

type FixedTierPlan = {
  label: string
  nodes: number
  cpu: number
  ram: string
  storage: string
  price: string
}

type Plan = {
  id: string
  label: string
  nodes: number
  vCPU: number
  ram: string
  storage: string
  monthlyPrice: string
}

/** One tab in the legacy plan selector (Hobbyist / Startup / Business / Premium). */
type LegacyPlanGroup = {
  id: string
  label: string
  description: string
  features: string[]
  plans: Plan[]
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
   * and legacy modes. Groups are displayed as tabs when the user selects legacy pricing.
   */
  legacyPlans?: LegacyPlanGroup[]
  computeProfiles: ComputeProfile[]
  computeOptionsByProfile: Record<string, ComputeOption[]>
  storageSpecs: StorageSpec[]
  defaultComputeProfile: string
  diskSizeMin: number
  diskSizeMax: number
  defaultDiskSize: number
}

// ─── Shared infrastructure data ───────────────────────────────────────────────

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
  free: {
    label: 'Free-1-1gb',
    nodes: 1,
    cpu: 1,
    ram: '1 GB',
    storage: '1 GB',
    price: 'Free',
  },
  developer: {
    label: 'Developer-1-8gb',
    nodes: 1,
    cpu: 1,
    ram: '1 GB',
    storage: '8 GB',
    price: '$5',
  },
}

// ─── Shared tier option definitions ───────────────────────────────────────────

const TIER_FREE: TierOption = {
  id: 'free', title: 'Free', description: 'Explore and learn the platform at no cost.',
  features: [
    { text: 'Free forever', icon: 'tick' },
    { text: 'Automatically powered off when inactive', icon: 'info' },
    { text: 'No integrations or connection pooling', icon: 'info' },
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

// ─── Legacy plan groups (Hobbyist / Startup / Business / Premium tabs) ────────
// nodes = VMs, vCPU = CPUs per VM, ram = RAM per VM in the legacy plan table.

const LEGACY_PG_PLAN_GROUPS: LegacyPlanGroup[] = [
  {
    id: 'hobbyist', label: 'Hobbyist',
    description: 'For small test environments',
    features: ['1 dedicated VM (1 node)', 'Backups for disaster recovery'],
    plans: [
      { id: 'pg-hobbyist', label: 'Hobbyist', nodes: 1, vCPU: 1, ram: '2 GB', storage: '8 GB', monthlyPrice: '~$19' },
    ],
  },
  {
    id: 'startup', label: 'Startup',
    description: 'For test environments with high performance needs',
    features: ['1 dedicated VM (1 node)', 'Backup up to 2 days with point-in-time recovery', '99.99% uptime SLA'],
    plans: [
      { id: 'pg-startup-4',  label: 'Startup-4',  nodes: 1, vCPU: 1, ram: '4 GB',  storage: '80 GB',  monthlyPrice: '~$75'  },
      { id: 'pg-startup-8',  label: 'Startup-8',  nodes: 1, vCPU: 2, ram: '8 GB',  storage: '175 GB', monthlyPrice: '~$150' },
      { id: 'pg-startup-16', label: 'Startup-16', nodes: 1, vCPU: 4, ram: '16 GB', storage: '350 GB', monthlyPrice: '~$300' },
      { id: 'pg-startup-32', label: 'Startup-32', nodes: 1, vCPU: 8, ram: '32 GB', storage: '700 GB', monthlyPrice: '~$600' },
    ],
  },
  {
    id: 'business', label: 'Business',
    description: 'For business-critical production and larger test environments',
    features: [
      '2 dedicated VMs (2 nodes high availability pair)',
      'Backup up to 14 days with point-in-time recovery',
      'Automatic failover to a secondary node',
      'Everything in Startup, plus read-only access to DB standby nodes',
    ],
    plans: [
      { id: 'pg-business-4',  label: 'Business-4',  nodes: 2, vCPU: 1, ram: '4 GB',  storage: '80 GB',  monthlyPrice: '~$200'   },
      { id: 'pg-business-8',  label: 'Business-8',  nodes: 2, vCPU: 2, ram: '8 GB',  storage: '175 GB', monthlyPrice: '~$400'   },
      { id: 'pg-business-16', label: 'Business-16', nodes: 2, vCPU: 4, ram: '16 GB', storage: '350 GB', monthlyPrice: '~$800'   },
      { id: 'pg-business-32', label: 'Business-32', nodes: 2, vCPU: 8, ram: '32 GB', storage: '700 GB', monthlyPrice: '~$1,600' },
    ],
  },
  {
    id: 'premium', label: 'Premium',
    description: 'For enterprise-level production data loads',
    features: [
      '3 dedicated VMs (3 nodes high availability set)',
      'Backup up to 30 days with point-in-time recovery',
      'Automatic failover to a secondary node',
      'Plus everything in Business',
    ],
    plans: [
      { id: 'pg-premium-4',  label: 'Premium-4',  nodes: 3, vCPU: 1, ram: '4 GB',  storage: '80 GB',  monthlyPrice: '~$300'   },
      { id: 'pg-premium-8',  label: 'Premium-8',  nodes: 3, vCPU: 2, ram: '8 GB',  storage: '175 GB', monthlyPrice: '~$600'   },
      { id: 'pg-premium-16', label: 'Premium-16', nodes: 3, vCPU: 4, ram: '16 GB', storage: '350 GB', monthlyPrice: '~$1,200' },
      { id: 'pg-premium-32', label: 'Premium-32', nodes: 3, vCPU: 8, ram: '32 GB', storage: '700 GB', monthlyPrice: '~$2,400' },
    ],
  },
]

const LEGACY_MYSQL_PLAN_GROUPS: LegacyPlanGroup[] = [
  {
    id: 'hobbyist', label: 'Hobbyist',
    description: 'For small test environments',
    features: ['1 dedicated VM (1 node)', 'Backups for disaster recovery'],
    plans: [
      { id: 'mysql-hobbyist', label: 'Hobbyist', nodes: 1, vCPU: 1, ram: '2 GB', storage: '8 GB', monthlyPrice: '~$16' },
    ],
  },
  {
    id: 'startup', label: 'Startup',
    description: 'For test environments with high performance needs',
    features: ['1 dedicated VM (1 node)', 'Backup up to 2 days with point-in-time recovery', '99.99% uptime SLA'],
    plans: [
      { id: 'mysql-startup-4',  label: 'Startup-4',  nodes: 1, vCPU: 1, ram: '4 GB',  storage: '50 GB',  monthlyPrice: '~$60'  },
      { id: 'mysql-startup-8',  label: 'Startup-8',  nodes: 1, vCPU: 2, ram: '8 GB',  storage: '100 GB', monthlyPrice: '~$120' },
      { id: 'mysql-startup-16', label: 'Startup-16', nodes: 1, vCPU: 4, ram: '16 GB', storage: '200 GB', monthlyPrice: '~$240' },
      { id: 'mysql-startup-32', label: 'Startup-32', nodes: 1, vCPU: 8, ram: '32 GB', storage: '400 GB', monthlyPrice: '~$480' },
    ],
  },
  {
    id: 'business', label: 'Business',
    description: 'For business-critical production and larger test environments',
    features: [
      '2 dedicated VMs (2 nodes high availability pair)',
      'Backup up to 14 days with point-in-time recovery',
      'Automatic failover to a secondary node',
      'Everything in Startup, plus read-only access to DB standby nodes',
    ],
    plans: [
      { id: 'mysql-business-4',  label: 'Business-4',  nodes: 2, vCPU: 1, ram: '4 GB',  storage: '50 GB',  monthlyPrice: '~$160'   },
      { id: 'mysql-business-8',  label: 'Business-8',  nodes: 2, vCPU: 2, ram: '8 GB',  storage: '100 GB', monthlyPrice: '~$320'   },
      { id: 'mysql-business-16', label: 'Business-16', nodes: 2, vCPU: 4, ram: '16 GB', storage: '200 GB', monthlyPrice: '~$640'   },
      { id: 'mysql-business-32', label: 'Business-32', nodes: 2, vCPU: 8, ram: '32 GB', storage: '400 GB', monthlyPrice: '~$1,280' },
    ],
  },
  {
    id: 'premium', label: 'Premium',
    description: 'For enterprise-level production data loads',
    features: [
      '3 dedicated VMs (3 nodes high availability set)',
      'Backup up to 30 days with point-in-time recovery',
      'Automatic failover to a secondary node',
      'Plus everything in Business',
    ],
    plans: [
      { id: 'mysql-premium-4',  label: 'Premium-4',  nodes: 3, vCPU: 1, ram: '4 GB',  storage: '50 GB',  monthlyPrice: '~$240'   },
      { id: 'mysql-premium-8',  label: 'Premium-8',  nodes: 3, vCPU: 2, ram: '8 GB',  storage: '100 GB', monthlyPrice: '~$480'   },
      { id: 'mysql-premium-16', label: 'Premium-16', nodes: 3, vCPU: 4, ram: '16 GB', storage: '200 GB', monthlyPrice: '~$960'   },
      { id: 'mysql-premium-32', label: 'Premium-32', nodes: 3, vCPU: 8, ram: '32 GB', storage: '400 GB', monthlyPrice: '~$1,920' },
    ],
  },
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
    legacyPlans: LEGACY_PG_PLAN_GROUPS,
  },

  mysql: {
    ...BASE_CONFIG,
    versions: ['MySQL 8.4', 'MySQL 8.0', 'MySQL 5.7'],
    haEnabled: true,
    defaultComputeProfile: 'balanced',
    diskSizeMax: 4000,
    defaultDiskSize: 50,
    legacyPlans: LEGACY_MYSQL_PLAN_GROUPS,
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
      developer: {
        label: 'Developer-2-30gb',
        nodes: 1,
        cpu: 2,
        ram: '4 GB',
        storage: '30 GB',
        price: '$5',
      },
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

function TierCard({ option }: { option: TierOption }) {
  return (
    <Card
      fullWidth
      checkable
      value={option.id}
      title={
        <Card.Title>
          <Typography.DefaultStrong color="intense">{option.title}</Typography.DefaultStrong>
        </Card.Title>
      }
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
        <Typography.Caption color="muted">{option.description}</Typography.Caption>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {option.features.map((f) => (
            <Box key={f.text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Icon
                aria-hidden
                icon={f.icon === 'tick' ? tickIcon : infoSignIcon}
                color={f.icon === 'tick' ? 'success-intense' : 'muted'}
                style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}
              />
              <Typography.Caption color="muted">{f.text}</Typography.Caption>
            </Box>
          ))}
        </Box>
        <Typography.SmallStrong color="intense">{option.price}</Typography.SmallStrong>
      </Box>
    </Card>
  )
}

TierCard.displayName = 'TierCard'

// ─── Inline badge components ──────────────────────────────────────────────────

const CHIP_BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--aquarium-background-color-success-muted)',
  color: 'var(--aquarium-text-color-success-intense)',
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
  /** ACU tier label, e.g. "Professional". Only set when pricingModel === 'acu'. */
  serviceTier?: string
  /** ACU compute profile label, e.g. "Balanced". Only set when pricingModel === 'acu'. */
  computeType?: string
  /** Estimated monthly price string, e.g. "~$75", "$5", "Free". */
  monthlyPrice?: string
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
    // Blank create (no service row): start on the first catalog tier (Free), not
    // `parseTierFromPlanName(undefined)` which maps empty plan names to Professional.
    if (!initialValues) {
      return (config.tiers[0]?.id ?? 'developer') as ServiceTier
    }
    const fromInit = parseTierFromPlanName(initialValues.planName)
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
  const [selectedLegacyGroupId, setSelectedLegacyGroupId] = useState<string>(() => {
    const firstGroupId = config.legacyPlans?.[0]?.id ?? ''
    if (!config.legacyPlans || !initialValues?.planName) return firstGroupId
    const lower = (initialValues.planName ?? '').toLowerCase()
    const match = config.legacyPlans.find((g) => g.plans.some((p) => p.label.toLowerCase() === lower))
    return match?.id ?? firstGroupId
  })
  const [selectedLegacyPlanId, setSelectedLegacyPlanId] = useState<string>(() => {
    const firstPlanId = config.legacyPlans?.[0]?.plans[0]?.id ?? ''
    if (!config.legacyPlans || !initialValues?.planName) return firstPlanId
    const lower = (initialValues.planName ?? '').toLowerCase()
    for (const group of config.legacyPlans) {
      const match = group.plans.find((p) => p.label.toLowerCase() === lower)
      if (match) return match.id
    }
    return firstPlanId
  })
  const [showAllLegacyPlans, setShowAllLegacyPlans] = useState(false)
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
  const activeLegacyGroup = useMemo(
    () => config.legacyPlans?.find((g) => g.id === selectedLegacyGroupId) ?? config.legacyPlans?.[0],
    [config, selectedLegacyGroupId],
  )
  const selectedLegacyPlan = useMemo(
    () => activeLegacyGroup?.plans.find((p) => p.id === selectedLegacyPlanId) ?? activeLegacyGroup?.plans[0],
    [activeLegacyGroup, selectedLegacyPlanId],
  )
  const nodeCount = HA_NODE_COUNT[haOption]

  const activePlans = config.plans
  const activeSelectedPlanId = selectedPlanId
  const handleSelectPlan = setSelectedPlanId
  const storageCost = useMemo(
    () => Math.ceil(diskSizeGb * (selectedStorageSpec?.pricePerGbMonth ?? 0)),
    [diskSizeGb, selectedStorageSpec],
  )
  const diskSliderFillPct = useMemo(() => {
    const span = config.diskSizeMax - config.diskSizeMin
    if (span <= 0) return 0
    return ((diskSizeGb - config.diskSizeMin) / span) * 100
  }, [diskSizeGb, config.diskSizeMin, config.diskSizeMax])
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
        monthlyPrice: fp.price,
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
        monthlyPrice: plan.monthlyPrice,
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
        monthlyPrice: plan.monthlyPrice,
      })
      return
    }

    const ramLabel = (selectedCompute?.ram ?? '').replace(' RAM', '')
    onCreateSuccess?.({
      serviceName, serviceTypeId, tier,
      cloud: cloud.toUpperCase(),
      region: regionId,
      regionLabel: selectedRegion?.label ?? regionId,
      location: selectedRegion?.location ?? regionId,
      planName: 'Professional',
      planDetails: `${selectedCompute?.vCPU ?? 1} vCPU / ${ramLabel} / ${diskSizeGb} GB storage`,
      nodeCount,
      cpuCount: selectedCompute?.vCPU ?? 1,
      ramCapacity: ramLabel,
      storageCapacity: `${diskSizeGb} GB`,
      ha: HA_OPTIONS.find((o) => o.id === haOption)?.label ?? haOption,
      pricingModel: 'acu',
      serviceTier: config.tiers.find((t) => t.id === tier)?.title ?? 'Professional',
      computeType: selectedComputeProfileInfo?.label ?? computeProfile,
      monthlyPrice: `~$${estimatedMonthly}`,
    })
  }

  if (submitRef) submitRef.current = handleCreate

  // ── Render ──
  return (
    <Box
      style={{
        minHeight: embedded ? undefined : '100vh',
        backgroundColor: 'var(--aquarium-background-color-body)',
        width: '100%',
      }}
    >
      <style>{`
        .create-service-tier-cards {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 16px;
          width: 100%;
          min-width: 0;
          align-items: stretch;
        }
        .create-service-tier-cards label.Aquarium-Card.Label {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          box-sizing: border-box;
        }
        /* Selected checkable cards stack ring-2 on top of the card border — use one inset border */
        .create-service-tier-cards label.Aquarium-Card.Label.ring-2 {
          --tw-ring-offset-shadow: 0 0 #0000 !important;
          --tw-ring-shadow: 0 0 #0000 !important;
          --tw-ring-width: 0 !important;
          --tw-ring-offset-width: 0 !important;
          box-shadow: inset 0 0 0 2px var(--aquarium-border-color-primary-default) !important;
        }
        .create-service-tier-cards label.Aquarium-Card.Label > div {
          flex: 1;
        }
      `}</style>
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
          <CreationFlowSection icon={containerIcon} title="Service tier">
            <Box style={{ marginBottom: 16 }}>
              <Typography.Small color="muted">
                Service tiers are structured to help you scale as your project grows.{' '}
                <Link href="#">Compare</Link>
              </Typography.Small>
            </Box>
            <Card.Group
              name="serviceTier"
              checked={tier}
              onCheckedChange={({ value }) => setTier(value as ServiceTier)}
            >
              <Box className="create-service-tier-cards">
                {config.tiers.map((opt) => (
                  <TierCard key={opt.id} option={opt} />
                ))}
              </Box>
            </Card.Group>
          </CreationFlowSection>

          {/* Cloud */}
          <CreationFlowSection icon={cloudIcon} title="Cloud">
            {isSimpleTier ? (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Typography.Small color="muted">
                  You can select a specific cloud provider and region on Professional tier
                </Typography.Small>
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
              <ServiceRegionPicker
                cloud={cloud}
                onCloudChange={(id) => {
                  setCloud(id)
                  setRegionId(config.regionsByCloud[id]?.[0]?.id ?? '')
                }}
                regionId={regionId}
                onRegionChange={setRegionId}
                regionsByCloud={config.regionsByCloud}
              />
            )}
          </CreationFlowSection>

          {isSimpleTier ? (
            /* Fixed plan table for Free / Developer */
            <CreationFlowSection icon={listIcon} title="Plan">
              {(() => {
                const fp = config.fixedTierPlans[tier as 'free' | 'developer']
                if (!fp) return null
                return (
                  <FixedPlanTable
                    plan={{
                      label: fp.label,
                      nodes: fp.nodes,
                      cpu: fp.cpu,
                      ram: fp.ram,
                      storage: fp.storage,
                      monthlyPrice: fp.price,
                    }}
                  />
                )
              })()}
            </CreationFlowSection>
          ) : isLegacyMode ? (
            /* ── Legacy plan groups: tabbed tier selector + description + plan table ── */
            <CreationFlowSection icon={listIcon} title="Plan">
              <Tabs
                value={activeLegacyGroup?.id ?? config.legacyPlans![0].id}
                onChange={(id) => {
                  const group = config.legacyPlans!.find((g) => g.id === id)
                  if (!group) return
                  setSelectedLegacyGroupId(group.id)
                  setSelectedLegacyPlanId(group.plans[0]?.id ?? '')
                  setShowAllLegacyPlans(false)
                }}
              >
                {config.legacyPlans!.map((group) => {
                  const visPlans = showAllLegacyPlans ? group.plans : group.plans.slice(0, 3)
                  return (
                    <Tabs.Tab key={group.id} title={group.label} value={group.id}>
                      {/* Tier description panel */}
                      <Box
                        style={{
                          border: '1px solid var(--aquarium-border-color-muted)', borderRadius: 8, padding: '12px 16px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          gap: 16, marginBottom: 16,
                        }}
                      >
                        <Box>
                          <Box style={{ marginBottom: 8 }}>
                            <Typography.SmallStrong color="intense">{group.description}</Typography.SmallStrong>
                          </Box>
                          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {group.features.map((feature) => (
                              <Box key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <Icon aria-hidden icon={tickIcon} color="success-intense" style={{ width: 16, height: 16, flexShrink: 0 }} />
                                <Typography.Small color="muted">{feature}</Typography.Small>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        <Box style={{ flexShrink: 0 }}>
                          <Link href="#">↗ Compare plans</Link>
                        </Box>
                      </Box>

                      {/* Plans table */}
                      <Box style={{ border: '1px solid var(--aquarium-border-color-muted)', borderRadius: 8, overflow: 'hidden' }}>
                        <Box
                          style={{
                            display: 'flex', alignItems: 'center',
                            padding: '8px 16px', borderBottom: '1px solid var(--aquarium-border-color-muted)',
                            backgroundColor: 'var(--aquarium-background-color-muted)',
                          }}
                        >
                          <Box style={{ width: 32, flexShrink: 0 }} />
                          <Box style={{ flex: 2 }}><Typography.Caption color="muted">Plan</Typography.Caption></Box>
                          <Box style={{ flex: 1 }}><Typography.Caption color="muted">VMs</Typography.Caption></Box>
                          <Box style={{ flex: 1 }}><Typography.Caption color="muted">CPUs per VM</Typography.Caption></Box>
                          <Box style={{ flex: 1 }}><Typography.Caption color="muted">RAM per VM</Typography.Caption></Box>
                          <Box style={{ flex: 2 }}><Typography.Caption color="muted">Storage</Typography.Caption></Box>
                          <Box style={{ flex: 1, textAlign: 'right' }}><Typography.Caption color="muted">Monthly price</Typography.Caption></Box>
                        </Box>
                        {visPlans.map((plan, idx) => {
                          const isSelected = selectedLegacyPlanId === plan.id
                          return (
                            <Box
                              key={plan.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedLegacyPlanId(plan.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedLegacyPlanId(plan.id) }
                              }}
                              style={{
                                display: 'flex', alignItems: 'center',
                                padding: '10px 16px',
                                backgroundColor: isSelected ? 'var(--aquarium-background-color-primary-muted)' : 'var(--aquarium-background-color-layer)',
                                borderTop: idx === 0 ? 'none' : '1px solid var(--aquarium-border-color-muted)',
                                cursor: 'pointer', outline: 'none',
                              }}
                            >
                              <Box style={{ width: 32, flexShrink: 0 }}>
                                <RadioButton aria-label={`Plan ${plan.label}`} name="legacy-plan" value={plan.id} checked={isSelected} onChange={() => setSelectedLegacyPlanId(plan.id)} />
                              </Box>
                              <Box style={{ flex: 2 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{plan.label}</span></Box>
                              <Box style={{ flex: 1 }}><span style={{ fontSize: 14 }}>{plan.nodes}</span></Box>
                              <Box style={{ flex: 1 }}><span style={{ fontSize: 14 }}>{plan.vCPU}</span></Box>
                              <Box style={{ flex: 1 }}><span style={{ fontSize: 14 }}>{plan.ram}</span></Box>
                              <Box style={{ flex: 2 }}><span style={{ fontSize: 14 }}>{plan.storage}</span></Box>
                              <Box style={{ flex: 1, textAlign: 'right' }}><span style={{ fontSize: 14, fontWeight: 600 }}>{plan.monthlyPrice}</span></Box>
                            </Box>
                          )
                        })}
                      </Box>

                      {/* View all / View less */}
                      {group.plans.length > 3 && (
                        <Box style={{ marginTop: 8 }}>
                          <Button.Ghost dense type="button" onClick={() => setShowAllLegacyPlans((v) => !v)}>
                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <InlineIcon icon={showAllLegacyPlans ? chevronUpIcon : chevronDownIcon} />
                              {showAllLegacyPlans ? 'View less' : 'View all'}
                            </Box>
                          </Button.Ghost>
                        </Box>
                      )}
                    </Tabs.Tab>
                  )
                })}
              </Tabs>
            </CreationFlowSection>
          ) : activePlans ? (
            /* ── Flat plan table for non-legacy services (Kafka, Valkey, etc.) ── */
            <CreationFlowSection icon={proPlansIcon} title="Plan">
              <Box style={{ border: '1px solid var(--aquarium-border-color-muted)', borderRadius: 8, overflow: 'hidden' }}>
                <Box
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '8px 16px', borderBottom: '1px solid var(--aquarium-border-color-muted)',
                    backgroundColor: 'var(--aquarium-background-color-muted)',
                  }}
                >
                  <Box style={{ width: 32, flexShrink: 0 }} />
                  <Box style={{ flex: 2 }}><Typography.Caption color="muted">Plan</Typography.Caption></Box>
                  <Box style={{ flex: 1 }}><Typography.Caption color="muted">Nodes</Typography.Caption></Box>
                  <Box style={{ flex: 1 }}><Typography.Caption color="muted">vCPU</Typography.Caption></Box>
                  <Box style={{ flex: 1 }}><Typography.Caption color="muted">RAM</Typography.Caption></Box>
                  <Box style={{ flex: 2 }}><Typography.Caption color="muted">Storage</Typography.Caption></Box>
                  <Box style={{ flex: 1, textAlign: 'right' }}><Typography.Caption color="muted">Monthly price</Typography.Caption></Box>
                </Box>
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
                        backgroundColor: isSelected ? 'var(--aquarium-background-color-primary-muted)' : 'var(--aquarium-background-color-layer)',
                        borderTop: idx === 0 ? 'none' : '1px solid var(--aquarium-border-color-muted)',
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
            </CreationFlowSection>
          ) : (
            /* ── HA + Compute + Storage (postgresql / mysql) ── */
            <>
              {config.haEnabled && (
                <CreationFlowSection icon={nodesIcon} title="High-availability">
                  <Box style={{ minWidth: 0 }}>
                    <Box style={{ marginBottom: 16 }}>
                      <Typography.Small color="muted">
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
                </CreationFlowSection>
              )}

              {/* Compute */}
              <CreationFlowSection icon={cpuChipIcon} title="Compute">
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
                <Box style={{ marginBottom: 16 }}>
                  <Typography.Small color="muted">{selectedComputeProfileInfo?.description}</Typography.Small>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--aquarium-border-color-muted)', borderRadius: 8, overflow: 'hidden' }}>
                  {visibleComputeOptions.map((opt, idx) => {
                    const isSelected = computeId === opt.id
                    return (
                      <Box
                        key={opt.id}
                        role="button"
                        tabIndex={0}
                        className={
                          isSelected
                            ? 'create-service-compute-option create-service-compute-option--selected'
                            : 'create-service-compute-option'
                        }
                        onClick={() => setComputeId(opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setComputeId(opt.id) }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                          borderTop: idx === 0 ? 'none' : '1px solid var(--aquarium-border-color-muted)',
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
                          <Typography.Small color="intense">{opt.label}</Typography.Small>
                          <Typography.Small color="intense">{opt.ram}</Typography.Small>
                        </Box>
                        <Typography.SmallStrong color="intense">${opt.pricePerMonth}</Typography.SmallStrong>
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
              </CreationFlowSection>

              {/* Storage */}
              <CreationFlowSection icon={serverHddIcon} title="Storage">
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
                  <Typography.Small color="muted">{selectedStorageSpec?.description}</Typography.Small>
                </Box>

                {/* Disk size card */}
                <Box
                  style={{
                    border: '1px solid var(--aquarium-border-color-muted)',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                    }}
                  >
                    <Box style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <Typography.SmallStrong>Disk size</Typography.SmallStrong>
                      <Icon aria-hidden icon={infoSignIcon} color="muted" style={{ width: 16, height: 16, flexShrink: 0 }} />
                    </Box>
                    <Box style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <Box style={{ flex: 1, position: 'relative', paddingBottom: 20 }}>
                        <input
                          type="range"
                          className="create-service-disk-slider"
                          min={config.diskSizeMin}
                          max={config.diskSizeMax}
                          value={diskSizeGb}
                          onChange={(e) => setDiskSizeGb(Number(e.target.value))}
                          style={{ ['--slider-fill' as string]: `${diskSliderFillPct}%` }}
                          aria-label="Disk size in GB"
                        />
                        <Box style={{ position: 'absolute', bottom: 0, left: 0 }}>
                          <Typography.Small color="muted">{config.diskSizeMin}</Typography.Small>
                        </Box>
                        <Box style={{ position: 'absolute', bottom: 0, right: 0 }}>
                          <Typography.Small color="muted">{config.diskSizeMax}</Typography.Small>
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
                        <Typography.Small color="muted">GB</Typography.Small>
                      </Box>
                      <Box style={{ width: 120, flexShrink: 0, textAlign: 'right' }}>
                        <Typography.DefaultStrong>${storageCost}</Typography.DefaultStrong>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      borderTop: '1px solid var(--aquarium-border-color-muted)',
                      padding: '12px 16px',
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
              </CreationFlowSection>
            </>
          )}

          {/* Service details */}
          <CreationFlowSection icon={tagIcon} title="Service details">
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
          </CreationFlowSection>
        </Box>

        {/* ── Right sidebar ── */}
        <ServiceSummarySidebar
          top={0}
          style={{ height: embedded ? 'calc(100vh - 360px)' : '100vh' }}
          footer={
            !submitRef ? (
              <Box style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                {embedded && onClose && (
                  <Button.Secondary type="button" onClick={onClose}>
                    Cancel
                  </Button.Secondary>
                )}
                <Button.Primary type="button" onClick={handleCreate}>
                  {editMode
                    ? 'Apply changes'
                    : serviceDisplayName
                      ? `Create ${serviceDisplayName} service`
                      : 'Create service'}
                </Button.Primary>
              </Box>
            ) : undefined
          }
        >
            {isSimpleTier ? (
              /* ── Simplified summary for Free / Developer ── */
              <>
                <Typography.DefaultStrong>{version}</Typography.DefaultStrong>

                <DetailField label="Name" value={serviceName} />

                <DetailField
                  label="Region"
                  value={REGION_AREAS.find((a) => a.id === regionArea)?.label ?? regionArea}
                />

                <DetailField
                  label="Service tier"
                  value={config.tiers.find((t) => t.id === tier)?.title ?? tier}
                />

                {(() => {
                  const fp = config.fixedTierPlans[tier as 'free' | 'developer']
                  if (!fp) return null
                  return (
                    <DetailField label="Plan" value={fp.label} />
                  )
                })()}

                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                  <Box aria-hidden="true" style={{ borderTop: '1px solid var(--aquarium-border-color-muted)', marginBottom: 8 }} />
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Typography.SmallStrong color="intense">Est. monthly*</Typography.SmallStrong>
                    <Typography.Heading>
                      {tier === 'free' ? 'Free' : `${config.fixedTierPlans.developer?.price ?? '$5'} USD`}
                    </Typography.Heading>
                  </Box>
                </Box>

                <Typography.Caption color="muted">*Based on 730 hours of usage.</Typography.Caption>
              </>
            ) : (
              /* ── Full summary for Professional ── */
              <>
                {config.legacyPlans != null && (
                  <PricingBanner
                    checked={pricingModel === 'acu'}
                    onChange={(checked) => setPricingModel(checked ? 'acu' : 'legacy')}
                    acu={{
                      title: 'Flexible configuration & pricing',
                      description: (
                        <>
                          Fine-tune CPU, RAM and disk. <Link href="#">Details</Link>
                        </>
                      ),
                    }}
                    legacy={{
                      title: 'Legacy pricing plans',
                      description: 'Node count included in plan',
                    }}
                  />
                )}

                <Typography.DefaultStrong>{version}</Typography.DefaultStrong>

                <DetailField label="Name" value={serviceName} />

                <DetailField
                  label="Cloud"
                  value={
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Typography.Small color="intense">{cloud.toUpperCase()}</Typography.Small>
                      <Typography.Small color="muted">·</Typography.Small>
                      <Typography.Small color="intense">
                        {selectedRegion?.flag} {selectedRegion?.location ?? selectedRegion?.label}
                      </Typography.Small>
                    </Box>
                  }
                />

                {config.haEnabled && !isLegacyMode && (
                  <DetailField
                    label="High-availability"
                    value={HA_OPTIONS.find((o) => o.id === haOption)?.label ?? haOption}
                  />
                )}

                <DetailField
                  label="Service tier"
                  value={config.tiers.find((t) => t.id === tier)?.title ?? tier}
                />

                {(config.plans != null || isLegacyMode) ? (
                  <DetailField
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
                    <DetailField
                      label="Compute"
                      value={`${selectedComputeProfileInfo?.label}: 1 node · ${selectedCompute?.vCPU ?? ''} vCPU · ${selectedCompute?.ram ?? ''}`}
                    />
                    <DetailField label="Total storage" value={`${diskSizeGb} GB`} />
                  </>
                )}

                {/* Pricing breakdown */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                  <Box aria-hidden="true" style={{ borderTop: '1px solid var(--aquarium-border-color-muted)', marginBottom: 8 }} />
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Typography.SmallStrong color="intense">Est. monthly*</Typography.SmallStrong>
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
                        <Typography.Caption color="muted">
                          Compute · {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
                        </Typography.Caption>
                        <Typography.Caption color="muted">${(selectedCompute?.pricePerMonth ?? 0) * nodeCount}</Typography.Caption>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography.Caption color="muted">
                          Storage · {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
                        </Typography.Caption>
                        <Typography.Caption color="muted">${storageCost * nodeCount}</Typography.Caption>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Typography.Caption color="muted">Network</Typography.Caption>
                          <Icon aria-hidden icon={infoSignIcon} color="muted" style={{ width: 12, height: 12 }} />
                        </Box>
                        <Typography.Caption color="muted">Usage-based · $0.02/GB</Typography.Caption>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Typography.Caption color="muted">Backups</Typography.Caption>
                          <Icon aria-hidden icon={infoSignIcon} color="muted" style={{ width: 12, height: 12 }} />
                        </Box>
                        <Typography.Caption color="muted">Every 24h · 24h retention</Typography.Caption>
                      </Box>
                    </>
                  )}
                </Box>

                <Typography.Caption color="muted">*Based on 730 hours of usage.</Typography.Caption>
              </>
            )}
        </ServiceSummarySidebar>
      </Box>
    </Box>
  )
}

CreateService.displayName = 'CreateService'

export default CreateService
