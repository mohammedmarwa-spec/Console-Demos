import { useMemo, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import cloudUploadIcon from '@aivenio/aquarium/icons/cloudUpload'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import infoIcon from '@aivenio/aquarium/icons/infoSign'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { BillingSidebar } from '../components/BillingSidebar'
import { useScenario } from '../scenarios'

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single ACU charge line item shown in the breakdown of an ACU service row. */
type ChargeLineItem = {
  id: string
  label: string
  /** Optional sub-label shown below the label, e.g. "volume_type: block" */
  sublabel?: string
  iconType: 'acu' | 'storage' | 'network'
  cloud: string
  period: string
  quantity?: string
  unitPrice?: string
  total: string
}

type ServiceChargeRow = {
  id: string
  name: string
  serviceType: string
  /** ACU, Plan (legacy), or undefined for services with no pricing model chip */
  pricing?: 'ACU' | 'Plan'
  /**
   * For legacy / Classic services: the service tier name shown in the Plan column (e.g. "Startup-4").
   * For ACU services: the legacy-equivalent tier name kept for reference.
   */
  plan: string
  /**
   * ACU-only. The compute type label (e.g. "Standard", "Memory-optimized").
   */
  computeType?: string
  cloud: string
  period: string
  total: string
  /**
   * ACU-only. Collapsible breakdown line items (ACU usage, Storage, Network).
   * When present the service row renders with an expand/collapse chevron.
   */
  breakdown?: ChargeLineItem[]
}

type ProjectChargeGroup = {
  id: string
  projectName: string
  total: string
  services: ServiceChargeRow[]
}

type ServiceTypeSummary = {
  serviceType: string
  total: string
  color: string
}

// ─── Breakdown helper ─────────────────────────────────────────────────────────

function makeAcuBreakdown(
  id: string,
  total: string,
  cloud: string,
  period: string,
): ChargeLineItem[] {
  const t = parseFloat(total.replace(/[^0-9.]/g, '')) || 0
  const acuTotal = Math.round(t * 0.72 * 100) / 100
  const storageTotal = Math.round(t * 0.20 * 100) / 100
  const networkTotal = Math.round((t - acuTotal - storageTotal) * 100) / 100
  const acuQty = Math.round(acuTotal / 0.083)
  const storageQty = Math.round(storageTotal / 0.00098)
  return [
    {
      id: `${id}-acu`,
      label: 'ACU',
      iconType: 'acu',
      cloud,
      period,
      quantity: `${acuQty.toLocaleString()} ACU`,
      unitPrice: '$0.083',
      total: `$${acuTotal.toFixed(2)} USD`,
    },
    {
      id: `${id}-storage`,
      label: 'Storage usage',
      sublabel: 'volume_type: block',
      iconType: 'storage',
      cloud,
      period,
      quantity: `${storageQty.toLocaleString()} GB·h`,
      unitPrice: '$0.00098',
      total: `$${storageTotal.toFixed(2)} USD`,
    },
    {
      id: `${id}-network`,
      label: 'Network',
      iconType: 'network',
      cloud,
      period,
      total: `$${networkTotal.toFixed(2)} USD`,
    },
  ]
}

// ─── Static data ──────────────────────────────────────────────────────────────

const SERVICE_SUMMARIES: ServiceTypeSummary[] = [
  { serviceType: 'PostgreSQL', total: '$23.80 USD', color: '#4e4fce' },
]

const PROJECT_CHARGE_GROUPS: ProjectChargeGroup[] = [
  {
    id: 'project-psychedelicshoe-8825',
    projectName: 'psychedelicshoe-8825',
    total: '$23.80 USD',
    services: [
      {
        id: 'pg-34dc00e8-startup-4',
        name: 'pg-34dc00e8: PostgreSQL Startup-4 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Startup-4',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37 – 12 Feb 2026 21:30',
        total: '$20.91 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-startup-4', '$20.91 USD', 'do-syd', '4–12 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-developer-1a',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '12 Feb 2026 21:30 – 28 Feb 2026 23:59',
        total: '$2.71 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-developer-1a', '$2.71 USD', 'do-syd', '12–28 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-developer-1b',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:16 – 4 Feb 2026 10:37',
        total: '$0.16 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-developer-1b', '$0.16 USD', 'do-syd', '3–4 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-hobbyist',
        name: 'pg-34dc00e8: PostgreSQL Hobbyist do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Hobbyist',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37 – 4 Feb 2026 10:37',
        total: '$0.02 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-hobbyist', '$0.02 USD', 'do-syd', '4 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-free',
        name: 'pg-34dc00e8: PostgreSQL Free-1-1gb do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Free-1-1gb',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:10 – 3 Feb 2026 12:16',
        total: '$0.00 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-free', '$0.00 USD', 'do-syd', '3 Feb 2026'),
      },
      {
        id: 'pg-2d4b35ac-free',
        name: 'pg-2d4b35ac: PostgreSQL Free-1-1gb upcloud-sg-sin',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Free-1-1gb',
        cloud: 'upcloud-sg-sin',
        period: '13 Feb 2026 9:25 – 14 Feb 2026 9:39',
        total: '$0.00 USD',
        breakdown: makeAcuBreakdown('pg-2d4b35ac-free', '$0.00 USD', 'upcloud-sg-sin', '13–14 Feb 2026'),
      },
    ],
  },
]

// ─── Scenario: mixed-service invoice ─────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const MIXED_SERVICE_SUMMARIES: ServiceTypeSummary[] = [
  { serviceType: 'PostgreSQL',    total: '$23.80 USD', color: '#4e4fce' },
  { serviceType: 'MySQL',         total: '$12.40 USD', color: '#f59e0b' },
  { serviceType: 'Apache Kafka',  total: '$6.20 USD',  color: '#8b5cf6' },
  { serviceType: 'OpenSearch',    total: '$1.80 USD',  color: '#0ea5e9' },
]

// prettier-ignore
const MIXED_SERVICES_P1: ServiceChargeRow[] = [
  // ACU services — expandable with breakdown
  { id: 'pg-34dc00e8-startup-4',     name: 'pg-34dc00e8: PostgreSQL Startup-4 do-syd',                serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Startup-4',   computeType: 'Standard',         cloud: 'do-syd',             period: '4–12 Feb 2026',  total: '$20.91 USD', breakdown: makeAcuBreakdown('pg-34dc00e8-startup-4',    '$20.91 USD', 'do-syd',             '4–12 Feb 2026') },
  { id: 'pg-34dc00e8-developer-1',   name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',              serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Developer-1', computeType: 'Standard',         cloud: 'do-syd',             period: '12–28 Feb 2026', total: '$2.89 USD',  breakdown: makeAcuBreakdown('pg-34dc00e8-developer-1',  '$2.89 USD',  'do-syd',             '12–28 Feb 2026') },
  { id: 'mysql-a1b2c3d4-business-4', name: 'mysql-a1b2c3d4: MySQL Business-4 do-syd',                serviceType: 'MySQL',              pricing: 'ACU', plan: 'Business-4',  computeType: 'Memory-optimized', cloud: 'do-syd',             period: '1–28 Feb 2026',  total: '$12.40 USD', breakdown: makeAcuBreakdown('mysql-a1b2c3d4-business-4', '$12.40 USD', 'do-syd',             '1–28 Feb 2026') },
  { id: 'pg-2d4b35ac-free',          name: 'pg-2d4b35ac: PostgreSQL Free-1-1gb upcloud-sg-sin',       serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Free-1-1gb',  computeType: 'Standard',         cloud: 'upcloud-sg-sin',     period: '13–14 Feb 2026', total: '$0.00 USD',  breakdown: makeAcuBreakdown('pg-2d4b35ac-free',         '$0.00 USD',  'upcloud-sg-sin',     '13–14 Feb 2026') },
  { id: 'pg-9a8b7c6d-business-4',    name: 'pg-9a8b7c6d: PostgreSQL Business-4 aws-eu-west-1',       serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Business-4',  computeType: 'Memory-optimized', cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$8.44 USD',  breakdown: makeAcuBreakdown('pg-9a8b7c6d-business-4',   '$8.44 USD',  'aws-eu-west-1',      '1–28 Feb 2026') },
  { id: 'mysql-d4e5f6a7-startup-4',  name: 'mysql-d4e5f6a7: MySQL Startup-4 aws-eu-west-1',          serviceType: 'MySQL',              pricing: 'ACU', plan: 'Startup-4',   computeType: 'Standard',         cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$4.80 USD',  breakdown: makeAcuBreakdown('mysql-d4e5f6a7-startup-4', '$4.80 USD',  'aws-eu-west-1',      '1–28 Feb 2026') },
  { id: 'pg-b1c2d3e4-hobbyist',      name: 'pg-b1c2d3e4: PostgreSQL Hobbyist do-syd',                serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Hobbyist',    computeType: 'Standard',         cloud: 'do-syd',             period: '4 Feb 2026',     total: '$0.02 USD',  breakdown: makeAcuBreakdown('pg-b1c2d3e4-hobbyist',     '$0.02 USD',  'do-syd',             '4 Feb 2026') },
  { id: 'mysql-e5f6a7b8-free',       name: 'mysql-e5f6a7b8: MySQL Free-1-1gb do-syd',                serviceType: 'MySQL',              pricing: 'ACU', plan: 'Free-1-1gb',  computeType: 'Standard',         cloud: 'do-syd',             period: '3 Feb 2026',     total: '$0.00 USD',  breakdown: makeAcuBreakdown('mysql-e5f6a7b8-free',      '$0.00 USD',  'do-syd',             '3 Feb 2026') },
  { id: 'pg-c5d6e7f8-developer-1',   name: 'pg-c5d6e7f8: PostgreSQL Developer-1 google-us-central1', serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Developer-1', computeType: 'CPU-optimized',    cloud: 'google-us-central1', period: '1–28 Feb 2026',  total: '$1.20 USD',  breakdown: makeAcuBreakdown('pg-c5d6e7f8-developer-1',  '$1.20 USD',  'google-us-central1', '1–28 Feb 2026') },
  // Legacy / no-pricing services — flat rows, no breakdown
  { id: 'kafka-events-p1',           name: 'kafka-1a2b3c4d: Apache Kafka Startup-2 do-syd',          serviceType: 'Apache Kafka',       pricing: 'Plan', plan: 'Startup-2',   cloud: 'do-syd',             period: '1–28 Feb 2026',  total: '$3.20 USD' },
  { id: 'redis-c3d4e5f6-startup-4',  name: 'redis-c3d4e5f6: Caching & ValkeyDB Startup-4 do-syd',   serviceType: 'Caching & ValkeyDB', plan: 'Startup-4',   cloud: 'do-syd',             period: '1–28 Feb 2026',  total: '$2.10 USD' },
  { id: 'kafka-telemetry-p1',        name: 'kafka-2b3c4d5e: Apache Kafka Business-4 aws-eu-west-1', serviceType: 'Apache Kafka',       pricing: 'Plan', plan: 'Business-4',  cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$0.00 USD' },
  { id: 'os-a2b3c4d5-developer-1',   name: 'os-a2b3c4d5: OpenSearch Developer-1 aws-eu-west-1',     serviceType: 'OpenSearch',         plan: 'Developer-1', cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$1.50 USD' },
  { id: 'grafana-f1e2d3c4-startup-1',name: 'grafana-f1e2d3c4: Grafana Startup-1 aws-eu-west-1',     serviceType: 'Grafana',            plan: 'Startup-1',   cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$0.80 USD' },
]

// prettier-ignore
const MIXED_SERVICES_P2: ServiceChargeRow[] = [
  // ACU services
  { id: 'pg-d7e8f9a0-business-4',   name: 'pg-d7e8f9a0: PostgreSQL Business-4 azure-eastus',          serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Business-4',  computeType: 'Memory-optimized', cloud: 'azure-eastus',       period: '1–28 Feb 2026',  total: '$7.30 USD',  breakdown: makeAcuBreakdown('pg-d7e8f9a0-business-4',   '$7.30 USD',  'azure-eastus',       '1–28 Feb 2026') },
  { id: 'mysql-a0b1c2d3-business-4',name: 'mysql-a0b1c2d3: MySQL Business-4 google-us-central1',      serviceType: 'MySQL',              pricing: 'ACU', plan: 'Business-4',  computeType: 'Standard',         cloud: 'google-us-central1', period: '1–28 Feb 2026',  total: '$6.90 USD',  breakdown: makeAcuBreakdown('mysql-a0b1c2d3-business-4','$6.90 USD',  'google-us-central1', '1–28 Feb 2026') },
  { id: 'pg-c4d5e6f7-startup-4',    name: 'pg-c4d5e6f7: PostgreSQL Startup-4 azure-eastus',           serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Startup-4',   computeType: 'Standard',         cloud: 'azure-eastus',       period: '1–28 Feb 2026',  total: '$2.10 USD',  breakdown: makeAcuBreakdown('pg-c4d5e6f7-startup-4',    '$2.10 USD',  'azure-eastus',       '1–28 Feb 2026') },
  { id: 'mysql-f9e8d7c6-hobbyist',  name: 'mysql-f9e8d7c6: MySQL Hobbyist aws-eu-west-1',             serviceType: 'MySQL',              pricing: 'ACU', plan: 'Hobbyist',    computeType: 'Standard',         cloud: 'aws-eu-west-1',      period: '3 Feb 2026',     total: '$0.00 USD',  breakdown: makeAcuBreakdown('mysql-f9e8d7c6-hobbyist',  '$0.00 USD',  'aws-eu-west-1',      '3 Feb 2026') },
  { id: 'pg-f8a9b0c1-developer-1',  name: 'pg-f8a9b0c1: PostgreSQL Developer-1 google-us-central1',   serviceType: 'PostgreSQL',         pricing: 'ACU', plan: 'Developer-1', computeType: 'CPU-optimized',    cloud: 'google-us-central1', period: '1–28 Feb 2026',  total: '$0.90 USD',  breakdown: makeAcuBreakdown('pg-f8a9b0c1-developer-1',  '$0.90 USD',  'google-us-central1', '1–28 Feb 2026') },
  // Legacy services
  { id: 'kafka-5a4b3c2d-business-4',name: 'kafka-5a4b3c2d: Apache Kafka Business-4 google-us-central1', serviceType: 'Apache Kafka',    pricing: 'Plan', plan: 'Business-4',  cloud: 'google-us-central1', period: '1–28 Feb 2026',  total: '$6.20 USD' },
  { id: 'ch-analytics-p2',          name: 'ch-a1b2c3d4: ClickHouse Business-8 aws-eu-west-1',          serviceType: 'ClickHouse',         plan: 'Business-8',  cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$15.60 USD' },
  { id: 'kafka-payments-p2',        name: 'kafka-c5d6e7f8: Apache Kafka Premium-6 aws-eu-west-1',      serviceType: 'Apache Kafka',       pricing: 'Plan', plan: 'Premium-6',   cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$12.80 USD' },
  { id: 'redis-e8f9a0b1-business-4',name: 'redis-e8f9a0b1: Caching & ValkeyDB Business-4 aws-eu-west-1', serviceType: 'Caching & ValkeyDB', plan: 'Business-4', cloud: 'aws-eu-west-1',     period: '1–28 Feb 2026',  total: '$4.20 USD' },
  { id: 'os-b2c3d4e5-business-4',   name: 'os-b2c3d4e5: OpenSearch Business-4 aws-eu-west-1',          serviceType: 'OpenSearch',         plan: 'Business-4',  cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$3.40 USD' },
  { id: 'kafka-cdc-p2',             name: 'kafka-d6e7f8a9: Apache Kafka Startup-2 aws-eu-west-1',      serviceType: 'Apache Kafka',       pricing: 'Plan', plan: 'Startup-2',   cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$1.80 USD' },
  { id: 'os-7f6e5d4c-startup-4',    name: 'os-7f6e5d4c: OpenSearch Startup-4 aws-eu-west-1',           serviceType: 'OpenSearch',         plan: 'Startup-4',   cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$1.80 USD' },
  { id: 'flink-jobs-p2',            name: 'flink-e7f8a9b0: Apache Flink Business-4 aws-eu-west-1',     serviceType: 'Apache Flink',       plan: 'Business-4',  cloud: 'aws-eu-west-1',      period: '1–28 Feb 2026',  total: '$5.40 USD' },
  { id: 'kafka-inkless-premium',    name: 'kafka-b3c4d5e6: Apache Kafka Premium-6 aws-eu-west-1',      serviceType: 'Apache Kafka',       pricing: 'Plan', plan: 'Premium-6',   cloud: 'aws-eu-west-1',      period: '14–28 Feb 2026', total: '$0.00 USD' },
]

const MIXED_PROJECT_GROUPS: ProjectChargeGroup[] = [
  {
    id: 'project-psychedelicshoe-8825',
    projectName: 'psychedelicshoe-8825',
    total: '$58.26 USD',
    services: MIXED_SERVICES_P1,
  },
  {
    id: 'project-aiven-prod-eu',
    projectName: 'aiven-prod-eu',
    total: '$68.40 USD',
    services: MIXED_SERVICES_P2,
  },
]

// ─── Scenario: ACU + Plan mixed invoice ($1,612.45) ───────────────────────────

const PLAN_MIXED_SUMMARIES: ServiceTypeSummary[] = [
  { serviceType: 'PostgreSQL',   total: '$1,018.45 USD', color: '#4e4fce' },
  { serviceType: 'MySQL',        total: '$180.00 USD',   color: '#f59e0b' },
  { serviceType: 'Apache Kafka', total: '$260.00 USD',   color: '#8b5cf6' },
  { serviceType: 'Apache Flink', total: '$80.00 USD',    color: '#10b981' },
  { serviceType: 'OpenSearch',   total: '$74.00 USD',    color: '#0ea5e9' },
]

// prettier-ignore
const PLAN_MIXED_P1: ServiceChargeRow[] = [
  { id: 'pg-8f3a2b-prod',      name: 'pg-8f3a2b: PostgreSQL Business-8 aws-eu-west-1',   serviceType: 'PostgreSQL',   pricing: 'ACU',  plan: 'Business-8',  computeType: 'Memory-optimized', cloud: 'aws-eu-west-1', period: '1–28 Feb 2026', total: '$820.00 USD', breakdown: makeAcuBreakdown('pg-8f3a2b-prod',    '$820.00 USD', 'aws-eu-west-1', '1–28 Feb 2026') },
  { id: 'mysql-4c9d1e-prod',   name: 'mysql-4c9d1e: MySQL Business-4 aws-eu-west-1',     serviceType: 'MySQL',        pricing: 'ACU',  plan: 'Business-4',  computeType: 'Standard',         cloud: 'aws-eu-west-1', period: '1–28 Feb 2026', total: '$180.00 USD', breakdown: makeAcuBreakdown('mysql-4c9d1e-prod', '$180.00 USD', 'aws-eu-west-1', '1–28 Feb 2026') },
  { id: 'kafka-3b7f2a-prod',   name: 'kafka-3b7f2a: Apache Kafka Business-8 aws-eu-west-1', serviceType: 'Apache Kafka', pricing: 'Plan', plan: 'Business-8', cloud: 'aws-eu-west-1', period: '1–28 Feb 2026', total: '$120.00 USD' },
  { id: 'flink-9d4c1b-prod',   name: 'flink-9d4c1b: Apache Flink Startup-4 aws-eu-west-1',  serviceType: 'Apache Flink', plan: 'Startup-4',  cloud: 'aws-eu-west-1', period: '1–28 Feb 2026', total: '$80.00 USD' },
]

// prettier-ignore
const PLAN_MIXED_P2: ServiceChargeRow[] = [
  { id: 'pg-2e5a3f-staging',   name: 'pg-2e5a3f: PostgreSQL Startup-4 do-ams3',   serviceType: 'PostgreSQL',   pricing: 'ACU',  plan: 'Startup-4',  computeType: 'Standard', cloud: 'do-ams3', period: '1–28 Feb 2026', total: '$198.45 USD', breakdown: makeAcuBreakdown('pg-2e5a3f-staging', '$198.45 USD', 'do-ams3', '1–28 Feb 2026') },
  { id: 'kafka-6a1e7d-staging', name: 'kafka-6a1e7d: Apache Kafka Startup-8 do-ams3', serviceType: 'Apache Kafka', pricing: 'Plan', plan: 'Startup-8', cloud: 'do-ams3', period: '1–28 Feb 2026', total: '$140.00 USD' },
  { id: 'os-7c3b4f-staging',   name: 'os-7c3b4f: OpenSearch Business-4 do-ams3',  serviceType: 'OpenSearch',   plan: 'Business-4', cloud: 'do-ams3', period: '1–28 Feb 2026', total: '$74.00 USD' },
]

const PLAN_MIXED_PROJECT_GROUPS: ProjectChargeGroup[] = [
  { id: 'project-aiven-production', projectName: 'aiven-production', total: '$1,200.00 USD', services: PLAN_MIXED_P1 },
  { id: 'project-aiven-staging',    projectName: 'aiven-staging',    total: '$412.45 USD',   services: PLAN_MIXED_P2 },
]

// ─── Details of charges table ─────────────────────────────────────────────────

// Name/description | Cloud | Effective date | Quantity | Unit price | Total
const CHARGES_GRID = '1fr 160px 150px 90px 120px 130px'
const CHARGES_HEADERS = ['Name / description', 'Cloud', 'Effective date', 'Quantity', 'Unit price', 'Total'] as const

const BREAKDOWN_ICON: Record<ChargeLineItem['iconType'], typeof cpuChipIcon> = {
  acu: cpuChipIcon,
  storage: nodesIcon,
  network: cloudUploadIcon,
}

function ChargesTableHeader() {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      {CHARGES_HEADERS.map((col, i) => (
        <Box key={col} style={{ color: '#787885', textAlign: i === CHARGES_HEADERS.length - 1 ? 'right' : 'left' }}>
          <Typography.Caption>{col}</Typography.Caption>
        </Box>
      ))}
    </Box>
  )
}

function ProjectRow({
  group,
  expanded,
  onToggle,
}: {
  group: ProjectChargeGroup
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 12,
        borderBottom: expanded ? 'none' : '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: expanded ? 'var(--aquarium-background-color-muted)' : 'var(--aquarium-background-color-layer)',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon
          icon={expanded ? chevronDownIcon : chevronRightIcon}
          style={{ width: 16, height: 16, color: '#787885', flexShrink: 0 }}
        />
        <Icon
          icon={folderCloseIcon}
          style={{ width: 16, height: 16, color: '#787885', flexShrink: 0 }}
        />
        <Typography.Default>Project: {group.projectName}</Typography.Default>
      </Box>
      {/* empty cells: Cloud, Effective date, Quantity, Unit price */}
      <span /><span /><span /><span />
      <Box style={{ textAlign: 'right' }}>
        <Box component="span" style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>{group.total}</Box>
      </Box>
    </Box>
  )
}

function ServiceRow({
  row,
  isLast,
  expanded,
  onToggle,
}: {
  row: ServiceChargeRow
  isLast: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const isExpandable = Boolean(row.breakdown?.length)
  const serviceName = row.name.split(':')[0]

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom:
          isLast && !expanded
            ? '1px solid var(--aquarium-border-color-muted)'
            : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: expanded ? 'var(--aquarium-background-color-primary-muted)' : 'var(--aquarium-background-color-muted)',
        alignItems: 'center',
        cursor: isExpandable ? 'pointer' : 'default',
        outline: 'none',
      }}
      onClick={isExpandable ? onToggle : undefined}
      role={isExpandable ? 'button' : undefined}
      aria-expanded={isExpandable ? expanded : undefined}
      tabIndex={isExpandable ? 0 : undefined}
      onKeyDown={isExpandable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() } : undefined}
    >
      {/* Name / description */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 24 }}>
        {/* Chevron or spacer */}
        <Box style={{ width: 16, flexShrink: 0 }}>
          {isExpandable && (
            <Icon
              icon={expanded ? chevronDownIcon : chevronRightIcon}
              style={{ width: 16, height: 16, color: '#787885' }}
            />
          )}
        </Box>
        <Typography.Small>{serviceName}</Typography.Small>
        {row.pricing && (
          <StatusChip text={row.pricing} status="neutral" dense />
        )}
      </Box>

      {/* For non-ACU services, show cloud + period inline */}
      <Box style={{ color: '#4a4b57' }}>
        {!isExpandable && <Typography.Small>{row.cloud}</Typography.Small>}
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        {!isExpandable && <Typography.Small>{row.period}</Typography.Small>}
      </Box>

      {/* Quantity — empty for service row */}
      <span />

      {/* Unit price — empty for service row */}
      <span />

      {/* Total */}
      <Box style={{ textAlign: 'right' }}>
        <Box component="span" style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>{row.total}</Box>
      </Box>
    </Box>
  )
}

function BreakdownRow({ item, isLast }: { item: ChargeLineItem; isLast: boolean }) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom:
          isLast ? '1px solid var(--aquarium-border-color-muted)' : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        alignItems: 'center',
      }}
    >
      {/* Name / description — indented further with icon */}
      <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 56 }}>
        <Icon
          icon={BREAKDOWN_ICON[item.iconType]}
          style={{ width: 16, height: 16, color: '#787885', flexShrink: 0, marginTop: 1 }}
        />
        <Box>
          <Typography.Small>{item.label}</Typography.Small>
          {item.sublabel && (
            <Box style={{ color: '#787885', marginTop: 1 }}>
              <Typography.Caption>{item.sublabel}</Typography.Caption>
            </Box>
          )}
        </Box>
      </Box>

      {/* Cloud */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.cloud}</Typography.Small>
      </Box>

      {/* Effective date */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.period}</Typography.Small>
      </Box>

      {/* Quantity */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.quantity ?? ''}</Typography.Small>
      </Box>

      {/* Unit price */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.unitPrice ?? ''}</Typography.Small>
      </Box>

      {/* Total */}
      <Box style={{ textAlign: 'right' }}>
        <Box component="span" style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>{item.total}</Box>
      </Box>
    </Box>
  )
}

function ChargesTable({ groups }: { groups: ProjectChargeGroup[] }) {
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.id)),
  )
  const [expandedServiceIds, setExpandedServiceIds] = useState<Set<string>>(
    () => new Set<string>(),
  )

  function toggleProject(id: string) {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleService(id: string) {
    setExpandedServiceIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <ChargesTableHeader />
      {groups.map((group) => {
        const projectExpanded = expandedProjectIds.has(group.id)
        return (
          <Box key={group.id}>
            <ProjectRow
              group={group}
              expanded={projectExpanded}
              onToggle={() => toggleProject(group.id)}
            />
            {projectExpanded &&
              group.services.map((svc, svcIdx) => {
                const isLastService = svcIdx === group.services.length - 1
                const serviceExpanded = expandedServiceIds.has(svc.id)
                return (
                  <Box key={svc.id}>
                    <ServiceRow
                      row={svc}
                      isLast={isLastService}
                      expanded={serviceExpanded}
                      onToggle={() => toggleService(svc.id)}
                    />
                    {serviceExpanded && svc.breakdown?.map((item, itemIdx) => (
                      <BreakdownRow
                        key={item.id}
                        item={item}
                        isLast={isLastService && itemIdx === (svc.breakdown?.length ?? 0) - 1}
                      />
                    ))}
                  </Box>
                )
              })}
          </Box>
        )
      })}
    </Box>
  )
}

// ─── Pie chart ────────────────────────────────────────────────────────────────

function parseAmount(total: string): number {
  return parseFloat(total.replace(/[^0-9.]/g, '')) || 0
}

function PieChart({ summaries }: { summaries: ServiceTypeSummary[] }) {
  const size = 100
  const cx = size / 2
  const cy = size / 2
  const r = 40

  if (summaries.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill={summaries[0].color} />
      </svg>
    )
  }

  const amounts = summaries.map((s) => parseAmount(s.total))
  const totalAmount = amounts.reduce((a, b) => a + b, 0) || 1

  let startAngle = -Math.PI / 2
  const paths: React.ReactNode[] = []

  summaries.forEach((s, i) => {
    const slice = (2 * Math.PI) * (amounts[i] / totalAmount)
    const endAngle = startAngle + slice
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = slice > Math.PI ? 1 : 0
    paths.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={s.color}
      />,
    )
    startAngle = endAngle
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {paths}
    </svg>
  )
}

// ─── Summary section ──────────────────────────────────────────────────────────

function SummaryByServiceType({ summaries }: { summaries: ServiceTypeSummary[] }) {
  return (
    <Box
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'flex-start',
      }}
    >
      {/* Table */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {/* Table header */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            paddingBottom: 8,
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
            marginBottom: 4,
          }}
        >
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>Service type</Typography.Caption>
          </Box>
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>Total</Typography.Caption>
          </Box>
        </Box>

        {/* Table rows */}
        {summaries.map((s) => (
          <Box
            key={s.serviceType}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              paddingBlock: 12,
              borderBottom: '1px solid var(--aquarium-border-color-muted)',
            }}
          >
            <Typography.Default>{s.serviceType}</Typography.Default>
            <Typography.Default>{s.total}</Typography.Default>
          </Box>
        ))}
      </Box>

      {/* Legend + pie chart */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {summaries.map((s) => (
            <Box key={s.serviceType} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  flexShrink: 0,
                }}
              />
              <Typography.Small>{s.serviceType}</Typography.Small>
            </Box>
          ))}
        </Box>
        <PieChart summaries={summaries} />
      </Box>
    </Box>
  )
}

// ─── Invoice status row ───────────────────────────────────────────────────────

function InvoiceStatusRow({
  total = '$0.00 USD',
  paid = true,
  dueDate = '1 March 2026',
}: {
  total?: string
  paid?: boolean
  dueDate?: string
}) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <StatusChip text={paid ? 'Paid' : 'Due'} status={paid ? 'success' : 'warning'} />
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Typography.Small>Total: {total}</Typography.Small>
        <Icon icon={infoIcon} style={{ width: 14, height: 14, color: '#787885' }} />
      </Box>
      <Box style={{ color: '#787885' }}>
        <Typography.Small>·</Typography.Small>
      </Box>
      <Typography.Small>Due date: {dueDate}</Typography.Small>
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export type BillingInvoiceDetailProps = {
  onBack?: () => void
  onOrgHomeClick?: () => void
  onBillingClick?: () => void
}

function BillingInvoiceDetail({ onBack, onOrgHomeClick, onBillingClick }: BillingInvoiceDetailProps) {
  const { activeScenarioId } = useScenario()
  const isMixed = activeScenarioId === 'invoice-mixed-services'
  const isPlanMixed = activeScenarioId === 'invoice-plan-acumixed'

  // Shuffle service rows within each project group once on mount / scenario change.
  const chargeGroups = useMemo<ProjectChargeGroup[]>(() => {
    if (isPlanMixed) return PLAN_MIXED_PROJECT_GROUPS
    if (!isMixed) return PROJECT_CHARGE_GROUPS
    return MIXED_PROJECT_GROUPS.map((g) => ({ ...g, services: shuffle(g.services) }))
  }, [isMixed, isPlanMixed])

  const summaries = isPlanMixed
    ? PLAN_MIXED_SUMMARIES
    : isMixed
      ? MIXED_SERVICE_SUMMARIES
      : SERVICE_SUMMARIES

  const invoiceTotal = isPlanMixed ? '$1,612.45 USD' : '$0.00 USD'
  const invoicePaid = !isPlanMixed

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--aquarium-background-color-body)', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader
        activeNav="billing"
        onHomeClick={onOrgHomeClick}
        onBillingClick={onBillingClick}
        onProjectsClick={onOrgHomeClick}
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <BillingSidebar
          activeItem="invoices"
          onItemClick={(id) => {
            if (id === 'overview') onOrgHomeClick?.()
          }}
        />

        {/* Main content */}
        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto', backgroundColor: 'var(--aquarium-background-color-body)' }}>
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title="Invoice for 1 February - 1 March 2026"
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                    My Organization
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="billing">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBillingClick?.() }}>
                    Billing
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="invoices">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBack?.() }}>
                    Invoices
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="invoice">
                  Invoice for 1 February - 1 March 2026
                </Breadcrumbs.Crumb>,
              ]}
            />
            <InvoiceStatusRow total={invoiceTotal} paid={invoicePaid} dueDate={isPlanMixed ? '15 March 2026' : '1 March 2026'} />
          </Box>

          {/* Sections */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary by service type */}
            <Section title="Summary by service type">
              <SummaryByServiceType summaries={summaries} />
            </Section>

            {/* Details of charges */}
            <Section
              title="Details of charges"
              actions={[
                { text: 'Download PDF', onClick: () => {} },
                { text: 'Download CSV', onClick: () => {} },
              ]}
            >
              <ChargesTable groups={chargeGroups} />
            </Section>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

BillingInvoiceDetail.displayName = 'BillingInvoiceDetail'

export default BillingInvoiceDetail
