import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  Icon,
  InlineIcon,
  Input,
  Link,
  RadioButton,
  Select,
  Switch,
  TagLabel,
  Tabs,
  Typography,
} from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import containerIcon from '@aivenio/aquarium/icons/container'
import tieredIcon from '@aivenio/aquarium/icons/tiered'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import serverHddIcon from '@aivenio/aquarium/icons/serverHdd'
import tagIcon from '@aivenio/aquarium/icons/tag'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import addIcon from '@aivenio/aquarium/icons/add'
import type { ServiceTypeId } from './ServiceTypeSelectModal'
import createKafkaScreenshot from '../assets/create-kafka-service.png'
import cloudAwsVector from '../assets/cloud-aws-vector.svg'
import cloudAwsSmile from '../assets/cloud-aws-smile.svg'
import cloudGoogle from '../assets/cloud-google.svg'
import cloudAzure1 from '../assets/cloud-azure-1.svg'
import cloudAzure2 from '../assets/cloud-azure-2.svg'
import cloudAzure3 from '../assets/cloud-azure-3.svg'
import cloudAzure4 from '../assets/cloud-azure-4.svg'
import cloudDigitalOcean from '../assets/cloud-digitalocean.svg'
import cloudUpCloud from '../assets/cloud-upcloud.png'

// ─── Shared types & data ─────────────────────────────────────────────────────

type ServiceTier = 'free' | 'developer' | 'professional'

// ─── MySQL / legacy types & data ─────────────────────────────────────────────

type TierOption = {
  id: ServiceTier
  title: string
  description: string
  features: string[]
  price: string
}
const TIER_OPTIONS: TierOption[] = [
  { id: 'free', title: 'Free', description: 'Explore and learn the platform at no cost.', features: ['Free forever', 'Automatically powered off when inactive', 'No integrations or connection pooling'], price: '$0' },
  { id: 'developer', title: 'Developer', description: 'A cost-effective option for test and personal projects.', features: ["Inactive services aren't powered off", 'Basic support tier', 'No integrations or connection pooling'], price: '$5' },
  { id: 'professional', title: 'Professional', description: 'For highly available business-critical workloads.', features: ['Deploy across multiple clouds and regions', '99.99% uptime SLA', 'Automatic backups for disaster recovery'], price: 'From $12' },
]

const CLOUDS = ['AWS', 'Google', 'Azure', 'DigitalOcean', 'UpCloud'] as const
type Cloud = (typeof CLOUDS)[number]
const REGIONS_FREQUENT = [
  { id: 'sg-sin', label: 'Singapore', flag: '🇸🇬' },
  { id: 'us-east', label: 'US East', flag: '🇺🇸' },
] as const

type HaOption = 'no-ha' | 'primary-standby' | 'primary-2-standby'
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

const REGION_LOCATION_MAP: Record<string, string> = {
  'sg-sin': 'Asia, Singapore',
  'us-east': 'North America, US East',
}

type ComputeProfile = 'economy' | 'balanced' | 'memory-optimized' | 'storage-optimized'
const COMPUTE_PROFILES: { id: ComputeProfile; label: string; description: string }[] = [
  { id: 'economy', label: 'Economy', description: 'Cost-effective for light workloads' },
  { id: 'balanced', label: 'Balanced', description: 'Balance of compute and memory' },
  { id: 'memory-optimized', label: 'Memory optimized', description: 'Ideal for memory-intensive applications' },
  { id: 'storage-optimized', label: 'Storage optimized', description: 'Ideal for in-memory processing of large datasets' },
]

type ComputeOption = { id: string; label: string; price: string; cpuCount: number; ram: string }
const COMPUTE_OPTIONS: ComputeOption[] = [
  { id: '1cpu-4gb',  label: '1 CPU 4 GB RAM',  price: '$256', cpuCount: 1, ram: '4 GB' },
  { id: '1cpu-8gb',  label: '1 CPU 8 GB RAM',  price: '$360', cpuCount: 1, ram: '8 GB' },
  { id: '1cpu-16gb', label: '1 CPU 16 GB RAM', price: '$520', cpuCount: 1, ram: '16 GB' },
]

type StorageType = 'block' | 'ssd' | 'local'
const STORAGE_TYPES: { id: StorageType; label: string; description: string }[] = [
  { id: 'block', label: 'Block storage', description: 'Network-attached block storage with configurable IOPS' },
  { id: 'ssd', label: 'SSD', description: 'High-performance SSD storage' },
  { id: 'local', label: 'Local disk', description: 'Remote storage with scalable capacity and configurable performance' },
]

const PG_VERSIONS = ['PostgreSQL 17', 'PostgreSQL 16', 'PostgreSQL 15'] as const

type PlanRow = {
  id: string
  plan: string
  vms: number
  cpusPerVm: number
  ramPerVm: string
  storage: string
  monthlyPrice: string
}
const STARTUP_PLANS: PlanRow[] = [
  { id: 'startup-4', plan: 'Startup-4', vms: 1, cpusPerVm: 2, ramPerVm: '4 GB', storage: '80 GB', monthlyPrice: '~ $75' },
  { id: 'startup-8', plan: 'Startup-8', vms: 1, cpusPerVm: 4, ramPerVm: '8 GB', storage: '175 GB', monthlyPrice: '~ $150' },
  { id: 'startup-16', plan: 'Startup-16', vms: 1, cpusPerVm: 6, ramPerVm: '16 GB', storage: '350 GB', monthlyPrice: '~ $300' },
  { id: 'startup-32', plan: 'Startup-32', vms: 1, cpusPerVm: 8, ramPerVm: '32 GB', storage: '700 GB', monthlyPrice: '~ $600' },
  { id: 'startup-64', plan: 'Startup-64', vms: 1, cpusPerVm: 16, ramPerVm: '64 GB', storage: '1000 GB', monthlyPrice: '~ $1,200' },
  { id: 'startup-120', plan: 'Startup-120', vms: 1, cpusPerVm: 20, ramPerVm: '128 GB', storage: '1400 GB', monthlyPrice: '~ $1,800' },
]

// ─── PG-specific types & data ─────────────────────────────────────────────────

type PGFeature = { text: string; icon: 'tick' | 'info' }
type PGTierOption = {
  id: ServiceTier
  title: string
  description: string
  features: PGFeature[]
  price: string
}
const PG_TIER_OPTIONS: PGTierOption[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Explore and learn the platform at no cost.',
    features: [
      { text: 'Free forever', icon: 'tick' },
      { text: 'Automatically powered off when inactive', icon: 'info' },
      { text: 'Autopauses when inactive, no support', icon: 'info' },
    ],
    price: '$0',
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'A cost-effective option for test and personal projects.',
    features: [
      { text: "Inactive services aren't powered off", icon: 'tick' },
      { text: 'Basic support tier', icon: 'tick' },
      { text: 'No integrations or connection pooling', icon: 'info' },
    ],
    price: '$5',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'For highly available business-critical workloads.',
    features: [
      { text: 'Deploy across multiple clouds and regions', icon: 'tick' },
      { text: '99.99% uptime SLA', icon: 'tick' },
      { text: 'Automatic backups for disaster recovery', icon: 'tick' },
    ],
    price: 'From $12',
  },
]

type PGCloudProvider = 'aws' | 'google' | 'azure' | 'digitalocean' | 'upcloud'
const PG_CLOUDS: { id: PGCloudProvider; label: string }[] = [
  { id: 'aws', label: 'AWS' },
  { id: 'google', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
  { id: 'digitalocean', label: 'DigitalOcean' },
  { id: 'upcloud', label: 'UpCloud' },
]

type PGRegion = { id: string; label: string; flag: string; location: string }
const PG_REGIONS_BY_CLOUD: Record<PGCloudProvider, PGRegion[]> = {
  aws: [
    { id: 'eu-north-1', label: 'europe-north-1, Finland', flag: '🇫🇮', location: 'Europe, Finland' },
    { id: 'us-east-1', label: 'us-east-1, US East', flag: '🇺🇸', location: 'North America, US East' },
    { id: 'ap-southeast-1', label: 'ap-southeast-1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
    { id: 'eu-west-1', label: 'eu-west-1, Ireland', flag: '🇮🇪', location: 'Europe, Ireland' },
    { id: 'us-west-2', label: 'us-west-2, Oregon', flag: '🇺🇸', location: 'North America, Oregon' },
  ],
  google: [
    { id: 'europe-north1', label: 'europe-north1, Finland', flag: '🇫🇮', location: 'Europe, Finland' },
    { id: 'us-central1', label: 'us-central1, Iowa', flag: '🇺🇸', location: 'North America, Iowa' },
    { id: 'asia-southeast1', label: 'asia-southeast1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
    { id: 'europe-west1', label: 'europe-west1, Belgium', flag: '🇧🇪', location: 'Europe, Belgium' },
  ],
  azure: [
    { id: 'northeurope', label: 'northeurope, Ireland', flag: '🇮🇪', location: 'Europe, Ireland' },
    { id: 'eastus', label: 'eastus, Virginia', flag: '🇺🇸', location: 'North America, Virginia' },
    { id: 'westeurope', label: 'westeurope, Netherlands', flag: '🇳🇱', location: 'Europe, Netherlands' },
    { id: 'southeastasia', label: 'southeastasia, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
  ],
  digitalocean: [
    { id: 'ams3', label: 'ams3, Amsterdam', flag: '🇳🇱', location: 'Europe, Amsterdam' },
    { id: 'nyc1', label: 'nyc1, New York', flag: '🇺🇸', location: 'North America, New York' },
    { id: 'sgp1', label: 'sgp1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
    { id: 'lon1', label: 'lon1, London', flag: '🇬🇧', location: 'Europe, London' },
  ],
  upcloud: [
    { id: 'fi-hel1', label: 'fi-hel1, Helsinki', flag: '🇫🇮', location: 'Europe, Helsinki' },
    { id: 'de-fra1', label: 'de-fra1, Frankfurt', flag: '🇩🇪', location: 'Europe, Frankfurt' },
    { id: 'uk-lon1', label: 'uk-lon1, London', flag: '🇬🇧', location: 'Europe, London' },
    { id: 'sg-sin1', label: 'sg-sin1, Singapore', flag: '🇸🇬', location: 'Asia, Singapore' },
  ],
}

type PGComputeProfile = 'economy' | 'balanced' | 'memory-optimized' | 'storage-optimized'
const PG_COMPUTE_PROFILES: { id: PGComputeProfile; label: string; description: string }[] = [
  { id: 'economy', label: 'Economy', description: 'Cost-effective option for less resource-intensive deployments' },
  { id: 'balanced', label: 'Balanced', description: 'Best price-performance ratio for general workloads' },
  { id: 'memory-optimized', label: 'Memory optimized', description: 'Ideal for memory-intensive applications' },
  { id: 'storage-optimized', label: 'Storage optimized', description: 'Ideal for in-memory processing of large datasets' },
]

type PGComputeOption = { id: string; label: string; vCPU: number; ram: string; pricePerMonth: number }
const PG_COMPUTE_OPTIONS: Record<PGComputeProfile, PGComputeOption[]> = {
  economy: [
    { id: 'eco-1-2', label: '1 CPU', vCPU: 1, ram: '2 GB RAM', pricePerMonth: 19 },
    { id: 'eco-1-4', label: '1 CPU', vCPU: 1, ram: '4 GB RAM', pricePerMonth: 32 },
    { id: 'eco-1-8', label: '1 CPU', vCPU: 1, ram: '8 GB RAM', pricePerMonth: 64 },
    { id: 'eco-2-16', label: '2 CPU', vCPU: 2, ram: '16 GB RAM', pricePerMonth: 115 },
    { id: 'eco-4-32', label: '4 CPU', vCPU: 4, ram: '32 GB RAM', pricePerMonth: 220 },
    { id: 'eco-8-64', label: '8 CPU', vCPU: 8, ram: '64 GB RAM', pricePerMonth: 410 },
  ],
  balanced: [
    { id: 'bal-2-8', label: '2 CPU', vCPU: 2, ram: '8 GB RAM', pricePerMonth: 55 },
    { id: 'bal-4-16', label: '4 CPU', vCPU: 4, ram: '16 GB RAM', pricePerMonth: 110 },
    { id: 'bal-8-32', label: '8 CPU', vCPU: 8, ram: '32 GB RAM', pricePerMonth: 220 },
    { id: 'bal-16-64', label: '16 CPU', vCPU: 16, ram: '64 GB RAM', pricePerMonth: 440 },
    { id: 'bal-32-128', label: '32 CPU', vCPU: 32, ram: '128 GB RAM', pricePerMonth: 880 },
  ],
  'memory-optimized': [
    { id: 'mem-2-16', label: '2 CPU', vCPU: 2, ram: '16 GB RAM', pricePerMonth: 90 },
    { id: 'mem-4-32', label: '4 CPU', vCPU: 4, ram: '32 GB RAM', pricePerMonth: 180 },
    { id: 'mem-8-64', label: '8 CPU', vCPU: 8, ram: '64 GB RAM', pricePerMonth: 360 },
    { id: 'mem-16-128', label: '16 CPU', vCPU: 16, ram: '128 GB RAM', pricePerMonth: 720 },
  ],
  'storage-optimized': [
    { id: 'sto-2-8', label: '2 CPU', vCPU: 2, ram: '8 GB RAM', pricePerMonth: 75 },
    { id: 'sto-4-16', label: '4 CPU', vCPU: 4, ram: '16 GB RAM', pricePerMonth: 150 },
    { id: 'sto-8-32', label: '8 CPU', vCPU: 8, ram: '32 GB RAM', pricePerMonth: 300 },
    { id: 'sto-16-64', label: '16 CPU', vCPU: 16, ram: '64 GB RAM', pricePerMonth: 600 },
  ],
}

type PGStorageType = 'block' | 'ssd' | 'local'
type PGStorageSpec = {
  id: PGStorageType
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
const PG_STORAGE_SPECS: PGStorageSpec[] = [
  {
    id: 'block',
    label: 'Block storage',
    description: 'Remote storage with scalable capacity and configurable performance',
    throughputRead: '125 MiB/s',
    throughputWrite: '300 MiB/s',
    iopsRead: '3000',
    iopsWrite: '9000',
    note: 'Good for workloads with growing or unpredictable storage needs and large datasets',
    pricePerGbMonth: 0.4,
  },
  {
    id: 'ssd',
    label: 'SSD',
    optimal: true,
    description: 'High-performance NVMe SSD with predictable and consistent performance',
    throughputRead: '250 MiB/s',
    throughputWrite: '500 MiB/s',
    iopsRead: '10000',
    iopsWrite: '30000',
    note: 'Optimal for latency-sensitive workloads requiring consistent performance',
    pricePerGbMonth: 0.6,
  },
  {
    id: 'local',
    label: 'Local disk',
    disabled: true,
    description: 'Local NVMe storage directly attached to the VM for maximum performance',
    throughputRead: '1000 MiB/s',
    throughputWrite: '800 MiB/s',
    iopsRead: '200000',
    iopsWrite: '100000',
    note: 'Not available with Economy compute profile',
    pricePerGbMonth: 0.2,
  },
]

// ─── Cloud provider icon components ──────────────────────────────────────────

function CloudProviderIcon({ id }: { id: PGCloudProvider }) {
  switch (id) {
    case 'aws':
      return (
        <Box aria-hidden="true" style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
          <img alt="" style={{ position: 'absolute', top: '18.75%', left: '4.52%', right: '3.87%', bottom: '49.71%', width: '91.61%', height: '31.54%', objectFit: 'contain' }} src={cloudAwsVector} />
          <img alt="" style={{ position: 'absolute', top: '56.35%', left: 0, right: 0, bottom: '21.17%', width: '100%', height: '22.48%', objectFit: 'contain' }} src={cloudAwsSmile} />
        </Box>
      )
    case 'google':
      return (
        <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudGoogle} />
      )
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
      return (
        <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudDigitalOcean} />
      )
    case 'upcloud':
      return (
        <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudUpCloud} />
      )
    default:
      return null
  }
}

CloudProviderIcon.displayName = 'CloudProviderIcon'

// ─── Layout constants (8px grid) ─────────────────────────────────────────────

const CONTAINER_MAX = 1440
const LEFT_COL_MAX = 984
const SIDEBAR_WIDTH = 360
const PG_SIDEBAR_WIDTH = 360
const PADDING = 24

// ─── Section sub-component ───────────────────────────────────────────────────

const SECTION_ICON_WIDTH = 32
const SECTION_LINE_WIDTH = 1

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof Icon>['icon']
  title: string
  children: React.ReactNode
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: `${SECTION_ICON_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: 'auto auto',
        columnGap: 16,
        marginBottom: 48,
        minWidth: 0,
        alignItems: 'start',
      }}
    >
      <Box style={{ width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
        <Icon aria-hidden icon={icon} style={{ width: 20, height: 20, color: '#c4c4cf' }} />
      </Box>
      <Box style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <Box
          component="h3"
          className="typography-large text-intense"
          style={{ margin: 0 }}
        >
          {title}
        </Box>
      </Box>
      <Box
        style={{
          paddingTop: 16,
          width: SECTION_ICON_WIDTH,
          minWidth: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            width: SECTION_LINE_WIDTH,
            minWidth: SECTION_LINE_WIDTH,
            backgroundColor: '#ededf0',
            alignSelf: 'stretch',
            minHeight: 40,
          }}
        />
      </Box>
      <Box style={{ paddingTop: 16, minWidth: 0, paddingLeft: 0 }}>
        {children}
      </Box>
    </Box>
  )
}

Section.displayName = 'Section'

// ─── Legacy TierCard (MySQL / other) ─────────────────────────────────────────

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
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{
        border: `2px solid ${selected ? '#3545be' : '#e5e7eb'}`,
        borderRadius: 8,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: selected ? '#f3f6ff' : '#fff',
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <Box style={{ flex: 1 }}>
          <Box component="span" className="text-intense" style={{ fontWeight: 700 }}>
            <Typography.DefaultStrong>{option.title}</Typography.DefaultStrong>
          </Box>
          <Box style={{ color: '#4a4b57', marginTop: 4 }}>
            <Typography.Small>{option.description}</Typography.Small>
          </Box>
        </Box>
        <RadioButton
          aria-label={`${option.title} tier`}
          name="serviceTier"
          value={option.id}
          checked={selected}
          onChange={onSelect}
        />
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {option.features.map((f) => (
          <Box key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box component="span" style={{ color: '#22c55e' }}><Typography.Caption>✔</Typography.Caption></Box>
            <Box component="span" style={{ color: '#4a4b57' }}><Typography.Caption>{f}</Typography.Caption></Box>
          </Box>
        ))}
      </Box>
      <Box style={{ marginTop: 4 }}><Typography.SmallStrong>{option.price}</Typography.SmallStrong></Box>
    </Box>
  )
}

TierCard.displayName = 'TierCard'

// ─── PG TierCard ──────────────────────────────────────────────────────────────

function PGTierCard({
  option,
  selected,
  onSelect,
}: {
  option: PGTierOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
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
      {/* Header */}
      <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '0 16px' }}>
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box component="span" className="text-intense" style={{ fontWeight: 700 }}>
            <Typography.DefaultStrong>{option.title}</Typography.DefaultStrong>
          </Box>
          <Typography.Caption>{option.description}</Typography.Caption>
        </Box>
        <RadioButton
          aria-label={`${option.title} tier`}
          name="pgServiceTier"
          value={option.id}
          checked={selected}
          onChange={onSelect}
        />
      </Box>

      {/* Features */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {option.features.map((f) => (
          <Box
            key={f.text}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '0 16px' }}
          >
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

      {/* Price */}
      <Box style={{ padding: '8px 16px' }}>
        <Typography.SmallStrong>{option.price}</Typography.SmallStrong>
      </Box>
    </Box>
  )
}

PGTierCard.displayName = 'PGTierCard'

// ─── PG Summary detail row ────────────────────────────────────────────────────

function PGSummaryDetail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box style={{ color: '#787885' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      {typeof value === 'string' ? (
        <Box style={{ color: '#16171a' }}>
          <Typography.Small>{value}</Typography.Small>
        </Box>
      ) : (
        value
      )}
    </Box>
  )
}

PGSummaryDetail.displayName = 'PGSummaryDetail'

// ─── Props & payload types ────────────────────────────────────────────────────

/** Full payload emitted by CreateService on success. */
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
}

export type CreateServiceProps = {
  embedded?: boolean
  editMode?: boolean
  serviceTypeId?: ServiceTypeId | null
  serviceDisplayName?: string
  onClose?: () => void
  onCreateSuccess?: (data?: CreatedServicePayload) => void
  /** When provided, the component stores its submit handler here so the parent (e.g. modal footer) can trigger it. */
  submitRef?: React.MutableRefObject<(() => void) | undefined>
}

// ─── Main component ───────────────────────────────────────────────────────────

function CreateService({ embedded = false, editMode = false, serviceTypeId, serviceDisplayName, onClose, onCreateSuccess, submitRef }: CreateServiceProps) {
  const isMySQL = (serviceTypeId ?? '').toString().toLowerCase() === 'mysql'
  const isPG = (serviceTypeId ?? '').toString().toLowerCase() === 'postgresql'

  // ── Shared state ──
  const [tier, setTier] = useState<ServiceTier>('professional')
  const [serviceName, setServiceName] = useState('pg-2536119c')
  const [version, setVersion] = useState<string>('PostgreSQL 17')

  // ── MySQL / legacy state ──
  const [flexiblePricingEnabled, setFlexiblePricingEnabled] = useState(false)
  const [cloud, setCloud] = useState<Cloud>('UpCloud')
  const [regionTab, setRegionTab] = useState<string | number>('Frequently used')
  const [region, setRegion] = useState<string>('sg-sin')
  const [planTab, setPlanTab] = useState<string | number>('startup')
  const [selectedPlanId, setSelectedPlanId] = useState<string>('startup-4')
  const [haOption, setHaOption] = useState<HaOption>('primary-standby')
  const [computeProfile, setComputeProfile] = useState<ComputeProfile>('storage-optimized')
  const [computeOptionId, setComputeOptionId] = useState<string>('1cpu-4gb')
  const [storageType, setStorageType] = useState<StorageType>('local')
  const [diskSizeGb, setDiskSizeGb] = useState(240)

  // ── PG-specific state ──
  const [pgCloud, setPgCloud] = useState<PGCloudProvider>('aws')
  const [pgRegionId, setPgRegionId] = useState<string>('eu-north-1')
  const [pgComputeProfile, setPgComputeProfile] = useState<PGComputeProfile>('economy')
  const [pgComputeId, setPgComputeId] = useState<string>('eco-1-2')
  const [pgStorageType, setPgStorageType] = useState<PGStorageType>('block')
  const [pgDiskSizeGb, setPgDiskSizeGb] = useState<number>(10)
  const [pgShowAllOptions, setPgShowAllOptions] = useState<boolean>(false)
  const [pgFlexibleEnabled, setPgFlexibleEnabled] = useState<boolean>(true)
  const [pgHaOption, setPgHaOption] = useState<HaOption>('primary-standby')

  // ── MySQL / legacy computed ──
  const selectedPlan = useMemo(
    () => STARTUP_PLANS.find((p) => p.id === selectedPlanId) ?? STARTUP_PLANS[0],
    [selectedPlanId],
  )
  const selectedCompute = useMemo(
    () => COMPUTE_OPTIONS.find((o) => o.id === computeOptionId) ?? COMPUTE_OPTIONS[0],
    [computeOptionId],
  )
  const selectedStorageInfo = useMemo(
    () => STORAGE_TYPES.find((s) => s.id === storageType) ?? STORAGE_TYPES[0],
    [storageType],
  )
  const computeProfileInfo = useMemo(
    () => COMPUTE_PROFILES.find((p) => p.id === computeProfile) ?? COMPUTE_PROFILES[0],
    [computeProfile],
  )

  const summary = useMemo(
    () => {
      const base = {
        service: version,
        name: serviceName,
        tier: TIER_OPTIONS.find((t) => t.id === tier)?.title ?? tier,
        cloud,
        regionLabel: REGIONS_FREQUENT.find((r) => r.id === region)?.label ?? region,
      }
      if (isMySQL) {
        return {
          ...base,
          ha: HA_OPTIONS.find((o) => o.id === haOption)?.label ?? haOption,
          compute: selectedCompute.label,
          computePrice: selectedCompute.price,
          storage: selectedStorageInfo.label,
          diskSize: `${diskSizeGb} GB`,
          storageEstimate: '$80',
          estimatedPrice: '336',
        }
      }
      return {
        ...base,
        plan: selectedPlan.plan,
        estimatedPrice: selectedPlan.monthlyPrice.replace('~ ', ''),
      }
    },
    [version, serviceName, tier, cloud, region, isMySQL, haOption, selectedCompute, selectedStorageInfo, diskSizeGb, selectedPlan],
  )

  // ── PG computed ──
  const pgCurrentComputeOptions = useMemo(
    () => PG_COMPUTE_OPTIONS[pgComputeProfile],
    [pgComputeProfile],
  )
  const pgSelectedCompute = useMemo(
    () => pgCurrentComputeOptions.find((o) => o.id === pgComputeId) ?? pgCurrentComputeOptions[0],
    [pgCurrentComputeOptions, pgComputeId],
  )
  const pgSelectedRegion = useMemo(
    () => PG_REGIONS_BY_CLOUD[pgCloud]?.find((r) => r.id === pgRegionId) ?? PG_REGIONS_BY_CLOUD[pgCloud]?.[0],
    [pgCloud, pgRegionId],
  )
  const pgSelectedStorageSpec = useMemo(
    () => PG_STORAGE_SPECS.find((s) => s.id === pgStorageType) ?? PG_STORAGE_SPECS[0],
    [pgStorageType],
  )
  const pgComputeProfileInfo = useMemo(
    () => PG_COMPUTE_PROFILES.find((p) => p.id === pgComputeProfile) ?? PG_COMPUTE_PROFILES[0],
    [pgComputeProfile],
  )
  const pgStorageCost = useMemo(
    () => Math.ceil(pgDiskSizeGb * pgSelectedStorageSpec.pricePerGbMonth),
    [pgDiskSizeGb, pgSelectedStorageSpec],
  )
  const pgNodeCount = HA_NODE_COUNT[pgHaOption]
  const pgEstimatedMonthly = useMemo(
    () => pgNodeCount * (pgSelectedCompute.pricePerMonth + pgStorageCost),
    [pgNodeCount, pgSelectedCompute, pgStorageCost],
  )

  // ── Kafka path ──
  if (serviceTypeId === 'kafka') {
    return (
      <Box style={{ width: '100%', overflow: 'auto' }}>
        {embedded && onClose && !editMode && (
          <Box style={{ padding: '16px 24px' }}>
            <Button.Ghost type="button" onClick={onClose}>
              ← Back
            </Button.Ghost>
          </Box>
        )}
        <img
          src={createKafkaScreenshot}
          alt="Create Apache Kafka service"
          style={{ width: '100%', display: 'block' }}
        />
      </Box>
    )
  }

  // ── PostgreSQL path ──
  if (isPG) {
    const pgComputeVisible = pgShowAllOptions
      ? pgCurrentComputeOptions
      : pgCurrentComputeOptions.slice(0, 3)

    const handlePGCreate = () => {
      if (!serviceTypeId) { onCreateSuccess?.(); return }
      onCreateSuccess?.({
        serviceName,
        serviceTypeId,
        tier,
        cloud: pgCloud.toUpperCase(),
        region: pgRegionId,
        regionLabel: pgSelectedRegion?.label ?? pgRegionId,
        location: pgSelectedRegion?.location ?? pgRegionId,
        planName: `${pgSelectedCompute.label} ${pgSelectedCompute.ram}`,
        planDetails: `${pgSelectedCompute.vCPU} vCPU / ${pgSelectedCompute.ram} / ${pgDiskSizeGb} GB storage`,
        nodeCount: HA_NODE_COUNT[pgHaOption],
        cpuCount: pgSelectedCompute.vCPU,
        ramCapacity: pgSelectedCompute.ram,
        storageCapacity: `${pgDiskSizeGb} GB`,
        ha: HA_OPTIONS.find((o) => o.id === pgHaOption)?.label ?? pgHaOption,
      })
    }

    if (submitRef) submitRef.current = handlePGCreate

    return (
      <Box style={{ minHeight: embedded ? undefined : '100vh', backgroundColor: embedded ? '#fff' : '#f9f9fb', width: '100%' }}>
        {embedded && onClose && !editMode && (
          <Box style={{ padding: `0 ${PADDING}px`, height: 24, display: 'flex', alignItems: 'center' }}>
            <Button.Ghost dense type="button" onClick={onClose}>
              ← Back
            </Button.Ghost>
          </Box>
        )}
        <Box
          style={{
            maxWidth: embedded ? undefined : CONTAINER_MAX,
            margin: embedded ? 0 : '0 auto',
            padding: PADDING,
            display: 'flex',
            gap: 60,
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
                {PG_TIER_OPTIONS.map((opt) => (
                  <PGTierCard
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
              {/* Provider chips */}
              <Box style={{ marginBottom: 24 }}>
                <ChoiceChipGroup
                  name="pgCloud"
                  selectionMode="radio"
                  value={pgCloud}
                  onChange={(v) => {
                    const id = v as PGCloudProvider
                    setPgCloud(id)
                    setPgRegionId(PG_REGIONS_BY_CLOUD[id][0].id)
                  }}
                >
                  {PG_CLOUDS.map((c) => (
                    <ChoiceChip key={c.id} value={c.id}>
                      <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <CloudProviderIcon id={c.id} />
                        {c.label}
                      </Box>
                    </ChoiceChip>
                  ))}
                </ChoiceChipGroup>
              </Box>

              {/* Region dropdown */}
              <Box style={{ maxWidth: 700 }}>
                <Select
                  labelText="Select region"
                  options={PG_REGIONS_BY_CLOUD[pgCloud].map((r) => `${r.flag} ${r.label}`)}
                  value={pgSelectedRegion ? `${pgSelectedRegion.flag} ${pgSelectedRegion.label}` : ''}
                  onChange={(val) => {
                    const found = PG_REGIONS_BY_CLOUD[pgCloud].find(
                      (r) => `${r.flag} ${r.label}` === String(val ?? ''),
                    )
                    if (found) setPgRegionId(found.id)
                  }}
                />
              </Box>
            </Section>

            {/* High-availability */}
            <Section icon={nodesIcon} title="High-availability">
              <Box style={{ minWidth: 0 }}>
                <Box style={{ color: '#4a4b57', marginBottom: 16 }}>
                  <Typography.Small>
                    Multi-node setups with primary/standby nodes across availability zones, offering automatic failover.{' '}
                    <Link href="#">Learn more</Link>
                  </Typography.Small>
                </Box>
                <ChoiceChipGroup
                  name="pgHa"
                  selectionMode="radio"
                  value={pgHaOption}
                  onChange={(v) => setPgHaOption(v as HaOption)}
                >
                  {HA_OPTIONS.map((opt) => (
                    <ChoiceChip key={opt.id} value={opt.id}>
                      <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {opt.label}
                        {opt.recommended && (
                          <span
                            style={{
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
                            }}
                          >
                            Recommended
                          </span>
                        )}
                      </Box>
                    </ChoiceChip>
                  ))}
                </ChoiceChipGroup>
              </Box>
            </Section>

            {/* Compute */}
            <Section icon={cpuChipIcon} title="Compute">
              {/* Profile tabs */}
              <Box style={{ marginBottom: 12 }}>
                <ChoiceChipGroup
                  name="pgComputeProfile"
                  selectionMode="radio"
                  value={pgComputeProfile}
                  onChange={(v) => {
                    const newProfile = v as PGComputeProfile
                    setPgComputeProfile(newProfile)
                    setPgComputeId(PG_COMPUTE_OPTIONS[newProfile][0].id)
                    setPgShowAllOptions(false)
                  }}
                >
                  {PG_COMPUTE_PROFILES.map((p) => (
                    <ChoiceChip key={p.id} value={p.id}>
                      {p.label}
                    </ChoiceChip>
                  ))}
                </ChoiceChipGroup>
              </Box>

              <Box style={{ color: '#4a4b57', marginBottom: 16 }}>
                <Typography.Small>{pgComputeProfileInfo.description}</Typography.Small>
              </Box>

              {/* Compute options list */}
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #ededf0',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {pgComputeVisible.map((opt, idx) => {
                  const isSelected = pgComputeId === opt.id
                  const isFirst = idx === 0
                  return (
                    <Box
                      key={opt.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setPgComputeId(opt.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setPgComputeId(opt.id)
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        backgroundColor: isSelected ? '#f3f6ff' : '#fff',
                        borderTop: isFirst ? 'none' : '1px solid #ededf0',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <RadioButton
                        aria-label={`${opt.label} ${opt.ram}`}
                        name="pgCompute"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setPgComputeId(opt.id)}
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

              {pgCurrentComputeOptions.length > 3 && (
                <Box style={{ marginTop: 8 }}>
                  <Button.Ghost
                    dense
                    type="button"
                    onClick={() => setPgShowAllOptions((v) => !v)}
                  >
                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <InlineIcon icon={pgShowAllOptions ? chevronUpIcon : chevronDownIcon} />
                      {pgShowAllOptions ? 'See fewer options' : 'See all options'}
                    </Box>
                  </Button.Ghost>
                </Box>
              )}
            </Section>

            {/* Storage */}
            <Section icon={serverHddIcon} title="Storage">
              {/* Storage type + description grouped with 12px gap */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <ChoiceChipGroup
                  name="pgStorageType"
                  selectionMode="radio"
                  value={pgStorageType}
                  onChange={(v) => setPgStorageType(v as PGStorageType)}
                >
                  {PG_STORAGE_SPECS.map((s) => (
                    <ChoiceChip key={s.id} value={s.id} disabled={s.disabled}>
                      <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {s.label}
                        {s.optimal && (
                          <span
                            style={{
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
                            }}
                          >
                            Best performance
                          </span>
                        )}
                      </Box>
                    </ChoiceChip>
                  ))}
                </ChoiceChipGroup>

                <Box style={{ color: '#4a4b57' }}>
                  <Typography.Small>{pgSelectedStorageSpec.description}</Typography.Small>
                </Box>
              </Box>

              {/* Disk size card */}
              <Box style={{ borderRadius: 8, overflow: 'hidden' }}>
                {/* Blue-tinted header area */}
                <Box
                  style={{
                    backgroundColor: '#f3f6ff',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  {/* "Disk size" label + info icon */}
                  <Box style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Typography.SmallStrong>Disk size</Typography.SmallStrong>
                    <Box aria-hidden="true" style={{ color: '#787885', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>ⓘ</Box>
                  </Box>

                  {/* Slider row: slider | input + GB | price */}
                  <Box style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {/* Slider — fills available space */}
                    <Box style={{ flex: 1, position: 'relative', paddingBottom: 20 }}>
                      <input
                        type="range"
                        min={10}
                        max={12000}
                        value={pgDiskSizeGb}
                        onChange={(e) => setPgDiskSizeGb(Number(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: 'var(--aquarium-background-color-primary-default, #3545be)',
                        }}
                        aria-label="Disk size in GB"
                      />
                      <Box style={{ position: 'absolute', bottom: 0, left: 0, color: '#787885' }}>
                        <Typography.Small>10</Typography.Small>
                      </Box>
                      <Box style={{ position: 'absolute', bottom: 0, right: 0, color: '#787885' }}>
                        <Typography.Small>12000</Typography.Small>
                      </Box>
                    </Box>

                    {/* Numeric input + GB unit */}
                    <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <Input
                        labelText=""
                        value={String(pgDiskSizeGb)}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          if (!Number.isNaN(n)) setPgDiskSizeGb(Math.min(12000, Math.max(10, n)))
                        }}
                        style={{ width: 80 }}
                      />
                      <Box style={{ color: '#4a4b57' }}>
                        <Typography.Small>GB</Typography.Small>
                      </Box>
                    </Box>

                    {/* Storage cost — fixed width, right-aligned */}
                    <Box style={{ width: 120, flexShrink: 0, textAlign: 'right' }}>
                      <Typography.DefaultStrong>${pgStorageCost}</Typography.DefaultStrong>
                    </Box>
                  </Box>
                </Box>

                {/* Throughput / IOPS panel */}
                <Box
                  style={{
                    border: '1px solid #ededf0',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    padding: '12px 16px',
                    color: '#4a4b57',
                  }}
                >
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <Box style={{ width: 100, flexShrink: 0 }}>
                        <Typography.SmallStrong>Throughput</Typography.SmallStrong>
                      </Box>
                      <Box style={{ width: 140, flexShrink: 0 }}>
                        <Typography.Small>Read: {pgSelectedStorageSpec.throughputRead}</Typography.Small>
                      </Box>
                      <Box style={{ width: 140, flexShrink: 0 }}>
                        <Typography.Small>Write: {pgSelectedStorageSpec.throughputWrite}</Typography.Small>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <Box style={{ width: 100, flexShrink: 0 }}>
                        <Typography.SmallStrong>IOPS</Typography.SmallStrong>
                      </Box>
                      <Box style={{ width: 140, flexShrink: 0 }}>
                        <Typography.Small>Read: {pgSelectedStorageSpec.iopsRead}</Typography.Small>
                      </Box>
                      <Box style={{ width: 140, flexShrink: 0 }}>
                        <Typography.Small>Write: {pgSelectedStorageSpec.iopsWrite}</Typography.Small>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Section>

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
                  options={[...PG_VERSIONS]}
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

          {/* ── Right sidebar: PG summary ── */}
          <Box
            style={{
              width: PG_SIDEBAR_WIDTH,
              flexShrink: 0,
              border: '1px solid #ededf0',
              borderRadius: 8,
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              position: 'sticky',
              top: 0,
              // In embedded (modal) mode subtract the modal chrome (header + footer ≈ 160px).
              // In standalone mode the sidebar fills the full viewport.
              height: embedded ? 'calc(100vh - 360px)' : '100vh',
              overflow: 'hidden',
            }}
          >
            <Box style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
              {/* Flexible pricing toggle banner */}
              <Box
                style={{
                  backgroundColor: '#ebfbee',
                  borderRadius: 8,
                  padding: '0 16px',
                  display: 'flex',
                  gap: 0,
                  alignItems: 'center',
                  minHeight: 64,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Switch
                  checked={pgFlexibleEnabled}
                  onChange={() => setPgFlexibleEnabled((v) => !v)}
                />
                <Box style={{ minWidth: 0 }}>
                  <Typography.SmallStrong>Flexible configuration & pricing</Typography.SmallStrong>
                  <Box style={{ color: '#4a4b57', marginTop: 2 }}>
                    <Typography.Caption>
                      Fine-tune CPU, RAM and disk.{' '}
                      <Link href="#">Details</Link>
                    </Typography.Caption>
                  </Box>
                </Box>
              </Box>

              {/* Service heading */}
              <Typography.DefaultStrong>{version}</Typography.DefaultStrong>

              {/* Detail rows */}
              <PGSummaryDetail label="Name" value={serviceName} />

              <PGSummaryDetail
                label="Cloud"
                value={
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Box style={{ color: '#16171a' }}>
                      <Typography.Small>{pgCloud.toUpperCase()}</Typography.Small>
                    </Box>
                    <Box style={{ color: '#787885' }}>
                      <Typography.Small>·</Typography.Small>
                    </Box>
                    <Box style={{ color: '#16171a' }}>
                      <Typography.Small>
                        {pgSelectedRegion?.flag} {pgSelectedRegion?.location ?? pgSelectedRegion?.label}
                      </Typography.Small>
                    </Box>
                  </Box>
                }
              />

              <PGSummaryDetail
                label="High-availability"
                value={HA_OPTIONS.find((o) => o.id === pgHaOption)?.label ?? pgHaOption}
              />

              <PGSummaryDetail
                label="Service tier"
                value={PG_TIER_OPTIONS.find((t) => t.id === tier)?.title ?? tier}
              />

              <PGSummaryDetail
                label="Compute"
                value={`${pgComputeProfileInfo.label}: 1 node · ${pgSelectedCompute.vCPU} vCPU · ${pgSelectedCompute.ram}`}
              />

              <PGSummaryDetail label="Total storage" value={`${pgDiskSizeGb} GB`} />

              {/* Pricing breakdown — anchored to the bottom */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                <Box
                  aria-hidden="true"
                  style={{ borderTop: '1px solid #ededf0', marginBottom: 8 }}
                />
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Box style={{ color: '#16171a' }}>
                    <Typography.SmallStrong>Est. monthly*</Typography.SmallStrong>
                  </Box>
                  <Typography.Heading>
                    ${pgEstimatedMonthly.toFixed(2)} USD
                  </Typography.Heading>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box style={{ color: '#787885' }}>
                    <Typography.Caption>Compute · {pgNodeCount} {pgNodeCount === 1 ? 'node' : 'nodes'}</Typography.Caption>
                  </Box>
                  <Typography.Caption>${pgSelectedCompute.pricePerMonth * pgNodeCount}</Typography.Caption>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box style={{ color: '#787885' }}>
                    <Typography.Caption>Storage · {pgNodeCount} {pgNodeCount === 1 ? 'node' : 'nodes'}</Typography.Caption>
                  </Box>
                  <Typography.Caption>${pgStorageCost * pgNodeCount}</Typography.Caption>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box style={{ color: '#787885' }}>
                      <Typography.Caption>Network</Typography.Caption>
                    </Box>
                    <Box aria-hidden="true" style={{ color: '#787885', fontSize: 10 }}>ⓘ</Box>
                  </Box>
                  <Typography.Caption>Usage-based · $0.02/GB</Typography.Caption>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box style={{ color: '#787885' }}>
                      <Typography.Caption>Backups</Typography.Caption>
                    </Box>
                    <Box aria-hidden="true" style={{ color: '#787885', fontSize: 10 }}>ⓘ</Box>
                  </Box>
                  <Typography.Caption>Every 24h · 24h retention</Typography.Caption>
                </Box>
              </Box>

              <Box style={{ color: '#68696b' }}>
                <Typography.Caption>*Based on 730 hours of usage.</Typography.Caption>
              </Box>
            </Box>

            {/* Footer – buttons are shown here only when not using the modal footer (submitRef) */}
            {!submitRef && (
              <Box
                style={{
                  padding: '0 24px 24px',
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-end',
                }}
              >
                {embedded && onClose && (
                  <Button.Secondary type="button" onClick={onClose}>
                    Cancel
                  </Button.Secondary>
                )}
                <Button.Primary type="button" onClick={handlePGCreate}>
                  {editMode ? 'Apply changes' : serviceDisplayName ? `Create ${serviceDisplayName} service` : 'Create service'}
                </Button.Primary>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  // ── MySQL / legacy path ──
  const handleLegacyCreate = () => {
    if (!serviceTypeId) { onCreateSuccess?.(); return }
    const regionLabel = REGIONS_FREQUENT.find((r) => r.id === region)?.label ?? region
    const location = REGION_LOCATION_MAP[region] ?? regionLabel
    let planName: string
    let planDetails: string
    let nodeCount: number
    let cpuCount: number
    let ramCapacity: string
    let storageCapacity: string
    if (isMySQL) {
      planName = selectedCompute.label
      planDetails = `${selectedCompute.cpuCount} CPU / ${selectedCompute.ram} / ${diskSizeGb} GB storage`
      nodeCount = HA_NODE_COUNT[haOption]
      cpuCount = selectedCompute.cpuCount
      ramCapacity = selectedCompute.ram
      storageCapacity = `${diskSizeGb} GB`
    } else {
      planName = selectedPlan.plan
      planDetails = `${selectedPlan.cpusPerVm} CPU / ${selectedPlan.ramPerVm} / ${selectedPlan.storage}`
      nodeCount = selectedPlan.vms
      cpuCount = selectedPlan.cpusPerVm
      ramCapacity = selectedPlan.ramPerVm
      storageCapacity = selectedPlan.storage
    }
    onCreateSuccess?.({
      serviceName, serviceTypeId, tier, cloud, region, regionLabel, location,
      planName, planDetails, nodeCount, cpuCount, ramCapacity, storageCapacity,
    })
  }

  if (submitRef) submitRef.current = handleLegacyCreate

  return (
    <Box style={{ minHeight: embedded ? undefined : '100vh', backgroundColor: embedded ? '#fff' : '#f9f9fb' }}>
      <Box
        style={{
          maxWidth: embedded ? undefined : CONTAINER_MAX,
          margin: embedded ? 0 : '0 auto',
          padding: PADDING,
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left column (main content) ── */}
        <Box style={{ flex: 1, minWidth: 0, maxWidth: LEFT_COL_MAX }}>
          {embedded && onClose && !editMode && !submitRef && (
            <Box style={{ marginBottom: 24 }}>
              <Button.Ghost type="button" onClick={onClose}>
                ← Back
              </Button.Ghost>
            </Box>
          )}

          {flexiblePricingEnabled ? (
            <Box style={{ padding: 24 }} />
          ) : (
            <>
          {/* Service tier */}
          <Section icon={tieredIcon} title="Service tier">
            <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
              {TIER_OPTIONS.map((opt) => (
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
            <Box style={{ minWidth: 0 }}>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                {isMySQL ? (
                  <ChoiceChipGroup
                    name="cloud"
                    selectionMode="radio"
                    value={cloud}
                    onChange={(v) => setCloud(v as Cloud)}
                  >
                    {CLOUDS.map((c) => (
                      <ChoiceChip key={c} value={c}>
                        {c}
                      </ChoiceChip>
                    ))}
                  </ChoiceChipGroup>
                ) : (
                  CLOUDS.map((c) => {
                    const isActive = c === cloud
                    return (
                      <Button.Secondary
                        key={c}
                        type="button"
                        onClick={() => setCloud(c)}
                        style={{
                          borderRadius: 8,
                          backgroundColor: isActive ? '#f3f6ff' : undefined,
                          borderColor: isActive ? '#3545be' : undefined,
                          color: isActive ? '#292a31' : undefined,
                        }}
                      >
                        {c}
                      </Button.Secondary>
                    )
                  })
                )}
              </Box>
              <Tabs value={regionTab} onChange={(key) => setRegionTab(key)}>
                <Tabs.Tab title="Frequently used" value="Frequently used" />
                <Tabs.Tab title="Asia Pacific" value="Asia Pacific" />
                <Tabs.Tab title="Australia" value="Australia" />
                <Tabs.Tab title="Europe" value="Europe" />
                <Tabs.Tab title="North America" value="North America" />
              </Tabs>
              <Box style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {REGIONS_FREQUENT.map((r) => (
                  <Box
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      cursor: 'pointer',
                    }}
                    onClick={() => setRegion(r.id)}
                  >
                    <RadioButton
                      aria-label={`Region ${r.label}`}
                      name="region"
                      value={r.id}
                      checked={region === r.id}
                      onChange={() => setRegion(r.id)}
                    />
                    <Box component="span" style={{ color: '#787885' }}><Typography.Caption>{r.flag}</Typography.Caption></Box>
                    <Typography.Caption>{r.id} {r.label}</Typography.Caption>
                  </Box>
                ))}
              </Box>
            </Box>
          </Section>

          {isMySQL && (
            <>
          {/* High-availability (MySQL only) */}
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
                      {opt.recommended && <TagLabel variant="success" title="Recommended" />}
                    </Box>
                  </ChoiceChip>
                ))}
              </ChoiceChipGroup>
            </Box>
          </Section>

          {/* Compute */}
          <Section icon={cpuChipIcon} title="Compute">
            <Box style={{ minWidth: 0 }}>
              <Box style={{ marginBottom: 12 }}>
                <ChoiceChipGroup
                  name="computeProfile"
                  selectionMode="radio"
                  value={computeProfile}
                  onChange={(v) => setComputeProfile(v as ComputeProfile)}
                >
                  {COMPUTE_PROFILES.map((p) => (
                    <ChoiceChip key={p.id} value={p.id}>
                      {p.label}
                    </ChoiceChip>
                  ))}
                </ChoiceChipGroup>
              </Box>
              <Box style={{ color: '#4a4b57', marginBottom: 16 }}>
                <Typography.Small>{computeProfileInfo.description}</Typography.Small>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COMPUTE_OPTIONS.map((opt) => (
                  <Box
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      cursor: 'pointer',
                    }}
                    onClick={() => setComputeOptionId(opt.id)}
                  >
                    <RadioButton
                      aria-label={opt.label}
                      name="compute"
                      value={opt.id}
                      checked={computeOptionId === opt.id}
                      onChange={() => setComputeOptionId(opt.id)}
                    />
                    <Typography.Default>{opt.label}</Typography.Default>
                    <Box style={{ marginLeft: 'auto' }}><Typography.Default>{opt.price}</Typography.Default></Box>
                  </Box>
                ))}
              </Box>
              <Box style={{ marginTop: 8 }}>
                <Link href="#">See all options</Link>
              </Box>
            </Box>
          </Section>

          {/* Storage */}
          <Section icon={serverHddIcon} title="Storage">
            <Box style={{ minWidth: 0 }}>
              <Box style={{ marginBottom: 12 }}>
                <ChoiceChipGroup
                  name="storage"
                  selectionMode="radio"
                  value={storageType}
                  onChange={(v) => setStorageType(v as StorageType)}
                >
                  {STORAGE_TYPES.map((s) => (
                    <ChoiceChip key={s.id} value={s.id}>
                      {s.label}
                    </ChoiceChip>
                  ))}
                </ChoiceChipGroup>
              </Box>
              <Box style={{ color: '#4a4b57', marginBottom: 16 }}>
                <Typography.Small>{selectedStorageInfo.description}</Typography.Small>
              </Box>
              <Box style={{ marginBottom: 16 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Typography.Caption>Disk size</Typography.Caption>
                  <Box aria-hidden style={{ width: 14, height: 14, color: '#787885' }}>ⓘ</Box>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <input
                    type="range"
                    min={10}
                    max={240}
                    value={diskSizeGb}
                    onChange={(e) => setDiskSizeGb(Number(e.target.value))}
                    style={{ flex: '1 1 200px', minWidth: 120 }}
                  />
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input
                      labelText=""
                      value={String(diskSizeGb)}
                      onChange={(e) => {
                        const n = Number(e.target.value)
                        if (!Number.isNaN(n)) setDiskSizeGb(Math.min(240, Math.max(10, n)))
                      }}
                      style={{ width: 64 }}
                    />
                    <Typography.Caption>GB</Typography.Caption>
                    <Typography.DefaultStrong>$80</Typography.DefaultStrong>
                  </Box>
                </Box>
              </Box>
              <Box style={{ color: '#787885' }}>
                <Typography.Caption>Throughput IOPS</Typography.Caption>
                <Box style={{ marginTop: 4, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <Typography.Small>Read: 125 MiB/s</Typography.Small>
                  <Typography.Small>Read: 3000</Typography.Small>
                  <Typography.Small>Write: 300 MiB/s</Typography.Small>
                  <Typography.Small>Write: 9000</Typography.Small>
                </Box>
              </Box>
            </Box>
          </Section>

          {/* Service details (MySQL only) */}
          <Section icon={tagIcon} title="Service details">
            <Box style={{ minWidth: 0 }}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <Input
                  labelText="Service name*"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Cannot be changed afterwards"
                />
                <Box>
                  <Select
                    labelText="Version*"
                    options={[...PG_VERSIONS]}
                    value={version}
                    onChange={(val) => setVersion(String(val ?? ''))}
                  />
                  <Box style={{ color: '#787885', marginTop: 4 }}>
                    <Typography.Caption>Default version is preselected</Typography.Caption>
                  </Box>
                </Box>
              </Box>
              <Box style={{ marginTop: 16 }}>
                <Link href="#">Tag service</Link>
              </Box>
            </Box>
          </Section>
            </>
          )}

          {!isMySQL && (
            <>
          {/* Plan (legacy: non-MySQL) */}
          <Section icon={proPlansIcon} title="Plan">
            <Box style={{ minWidth: 0 }}>
              <Tabs value={planTab} onChange={(key) => setPlanTab(key)}>
                <Tabs.Tab title="Startup" value="startup" />
                <Tabs.Tab title="Business" value="business" />
                <Tabs.Tab title="Premium" value="premium" />
              </Tabs>
              <Box style={{ color: '#4a4b57', marginTop: 12 }}>
                <Typography.Small>For test environments with high performance needs</Typography.Small>
              </Box>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <Box component="span" style={{ color: '#22c55e' }}><Typography.Caption>✔</Typography.Caption></Box>
                <Box component="span" style={{ color: '#4a4b57' }}><Typography.Caption>1 dedicated VM (1 node)</Typography.Caption></Box>
                <Box component="span" style={{ color: '#22c55e' }}><Typography.Caption>✔</Typography.Caption></Box>
                <Box component="span" style={{ color: '#4a4b57' }}><Typography.Caption>Backup up to 2 days with point-in-time recovery</Typography.Caption></Box>
                <Box component="span" style={{ color: '#22c55e' }}><Typography.Caption>✔</Typography.Caption></Box>
                <Box component="span" style={{ color: '#4a4b57' }}><Typography.Caption>99.99% uptime SLA</Typography.Caption></Box>
                <Box style={{ marginLeft: 8 }}>
                  <Link href="#">Compare plans</Link>
                </Box>
              </Box>
              <Box style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }} className="plan-data-table-wrapper">
                <DataTable
                  ariaLabel="Startup plans"
                  columns={[
                    {
                      type: 'custom',
                      headerName: 'Plan',
                      UNSAFE_render: (row: PlanRow) => (
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setSelectedPlanId(row.id)}>
                          <RadioButton aria-label={`Plan ${row.plan}`} name="plan" value={row.id} checked={selectedPlanId === row.id} onChange={() => setSelectedPlanId(row.id)} />
                          <Typography.DefaultStrong>{row.plan}</Typography.DefaultStrong>
                        </Box>
                      ),
                    },
                    { type: 'custom', headerName: 'VMs', UNSAFE_render: (row: PlanRow) => <Box style={{ cursor: 'pointer' }} onClick={() => setSelectedPlanId(row.id)}><Typography.Default>{row.vms}</Typography.Default></Box> },
                    { type: 'custom', headerName: 'CPUs per VM', UNSAFE_render: (row: PlanRow) => <Box style={{ cursor: 'pointer' }} onClick={() => setSelectedPlanId(row.id)}><Typography.Default>{row.cpusPerVm}</Typography.Default></Box> },
                    { type: 'custom', headerName: 'RAM per VM', UNSAFE_render: (row: PlanRow) => <Box style={{ cursor: 'pointer' }} onClick={() => setSelectedPlanId(row.id)}><Typography.Default>{row.ramPerVm}</Typography.Default></Box> },
                    { type: 'custom', headerName: 'Storage', UNSAFE_render: (row: PlanRow) => <Box style={{ cursor: 'pointer' }} onClick={() => setSelectedPlanId(row.id)}><Typography.Default>{row.storage}</Typography.Default></Box> },
                    { type: 'custom', headerName: 'Monthly price', UNSAFE_render: (row: PlanRow) => <Box style={{ cursor: 'pointer' }} onClick={() => setSelectedPlanId(row.id)}><Typography.Default>{row.monthlyPrice}</Typography.Default></Box> },
                  ]}
                  rows={STARTUP_PLANS}
                  rowClassName={(row: PlanRow) => (selectedPlanId === row.id ? 'plan-row-selected' : undefined)}
                />
              </Box>
              <Box style={{ color: '#787885', marginTop: 8 }}>
                <Typography.Caption>Plan details and availability vary by cloud provider and region.</Typography.Caption>
              </Box>
              <Box style={{ marginTop: 16 }}>
                <Alert type="information">
                  You can't add additional storage in this cloud or plan.
                </Alert>
              </Box>
            </Box>
          </Section>

          {/* Service basics (legacy: non-MySQL) */}
          <Section icon={settingsIcon} title="Service basics">
            <Box style={{ minWidth: 0 }}>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 600 }}>
                <Input labelText="Name*" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="The service name cannot be changed afterwards" />
                <Box>
                  <Select labelText="Version*" options={[...PG_VERSIONS]} value={version} onChange={(val) => setVersion(String(val ?? ''))} />
                  <Box style={{ color: '#787885', marginTop: 4 }}><Typography.Caption>Default version is preselected</Typography.Caption></Box>
                </Box>
              </Box>
              <Box style={{ marginTop: 16 }}>
                <Link href="#">Add tag to this service</Link>
              </Box>
            </Box>
          </Section>
            </>
          )}
            </>
          )}
        </Box>

        {/* ── Right sidebar: Service summary ── */}
        <Box
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            backgroundColor: '#fff',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {editMode && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#e8f5e9',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box style={{ flexShrink: 0, marginTop: 2 }}>
                <Switch
                  checked={flexiblePricingEnabled}
                  onChange={() => setFlexiblePricingEnabled((v) => !v)}
                />
              </Box>
              <Box style={{ minWidth: 0 }}>
                <Typography.DefaultStrong>Flexible configuration & pricing</Typography.DefaultStrong>
                <Box style={{ marginTop: 4, color: '#4a4b57' }}>
                  <Typography.Small>
                    Fine-tune CPU, RAM and disk.{' '}
                    <Link href="#">Details</Link>
                  </Typography.Small>
                </Box>
              </Box>
            </Box>
          )}
          <Typography.SmallStrong>Service summary</Typography.SmallStrong>
          <SummaryRow label="Service" value={summary.service} highlight />
          <SummaryRow label="Name" value={summary.name} />
          <SummaryRow label="Service tier" value={summary.tier} highlight />
          <SummaryRow label="Cloud" value={summary.cloud} highlight />
          <SummaryRow label="Region" value={summary.regionLabel} />
          {'ha' in summary && (
            <>
              <SummaryRow label="High-availability" value={summary.ha} highlight />
              <SummaryRow label="Compute" value={summary.compute} highlight />
              <SummaryRow label="Compute price" value={summary.computePrice} />
              <SummaryRow label="Storage" value={summary.storage} highlight />
              <SummaryRow label="Disk size" value={summary.diskSize} />
              <SummaryRow label="Storage (est.)" value={summary.storageEstimate} />
            </>
          )}
          {!isMySQL && 'plan' in summary && <SummaryRow label="Plan" value={summary.plan} highlight />}
          <Box style={{ marginTop: 8 }}>
            <Box style={{ color: '#787885' }}>
              <Typography.Caption>Estimated monthly price*</Typography.Caption>
            </Box>
            <Box style={{ marginTop: 4 }}><Typography.Heading>{summary.estimatedPrice} USD</Typography.Heading></Box>
          </Box>
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>*Estimated monthly price is based on 730 hours of usage.</Typography.Caption>
          </Box>
          {!submitRef && (
            <Button.Primary
              type="button"
              style={{ width: '100%', marginTop: 8 }}
              onClick={handleLegacyCreate}
            >
              {editMode ? 'Change service' : serviceDisplayName ? `Create ${serviceDisplayName} service` : 'Create service'}
            </Button.Primary>
          )}
        </Box>
      </Box>
    </Box>
  )
}

CreateService.displayName = 'CreateService'

export default CreateService

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <Box style={{ color: '#4a4b57' }}><Typography.Caption>{label}</Typography.Caption></Box>
      <Box style={{ textAlign: 'right' }}>
        {typeof value === 'string' ? (
          <Box style={{ color: highlight ? '#3545be' : '#292a31', fontWeight: highlight ? 600 : 400 }}>
            <Typography.Caption>{value}</Typography.Caption>
          </Box>
        ) : (
          value
        )}
      </Box>
    </Box>
  )
}

SummaryRow.displayName = 'SummaryRow'
