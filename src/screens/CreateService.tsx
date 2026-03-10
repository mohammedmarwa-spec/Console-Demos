import { useMemo, useState } from 'react'
import {
  Banner,
  Box,
  Button,
  Input,
  Link,
  RadioButton,
  Select,
  Table,
  Tabs,
  Typography,
} from '@aivenio/aquarium'

// ─── Types & data ───────────────────────────────────────────────────────────

type ServiceTier = 'free' | 'developer' | 'professional'

type TierOption = {
  id: ServiceTier
  title: string
  description: string
  features: string[]
  price: string
}

const TIER_OPTIONS: TierOption[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Explore and learn the platform at no cost.',
    features: [
      'Free forever',
      'Automatically powered off when inactive',
      'No integrations or connection pooling',
    ],
    price: '$0',
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'A cost-effective option for test and personal projects.',
    features: [
      "Inactive services aren't powered off",
      'Basic support tier',
      'No integrations or connection pooling',
    ],
    price: '$5',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'For highly available business-critical workloads.',
    features: [
      'Deploy across multiple clouds and regions',
      '99.99% uptime SLA',
      'Automatic backups for disaster recovery',
    ],
    price: 'From $12',
  },
]

const CLOUDS = ['AWS', 'Google', 'Azure', 'DigitalOcean', 'UpCloud'] as const
type Cloud = (typeof CLOUDS)[number]

const REGIONS_FREQUENT = [
  { id: 'sg-sin', label: 'Singapore', flag: '🇸🇬' },
  { id: 'us-east', label: 'US East', flag: '🇺🇸' },
] as const

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

const PG_VERSIONS = ['PostgreSQL 17', 'PostgreSQL 16', 'PostgreSQL 15'] as const

// ─── Layout constants (8px grid, ds_reference) ───────────────────────────────

const CONTAINER_MAX = 1440
const LEFT_COL_MAX = 984
const SIDEBAR_WIDTH = 456
const PADDING = 24

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Box aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>{icon}</Box>
      <Typography.LargeHeading>{title}</Typography.LargeHeading>
    </Box>
  )
}

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
          <Typography.DefaultStrong>{option.title}</Typography.DefaultStrong>
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

// ─── Main screen ────────────────────────────────────────────────────────────

export default function CreateService() {
  const [tier, setTier] = useState<ServiceTier>('professional')
  const [cloud, setCloud] = useState<Cloud>('UpCloud')
  const [regionTab, setRegionTab] = useState<string | number>('Frequently used')
  const [region, setRegion] = useState<string>('sg-sin')
  const [planTab, setPlanTab] = useState<string | number>('startup')
  const [selectedPlanId, setSelectedPlanId] = useState<string>('startup-4')
  const [serviceName, setServiceName] = useState('pg-2536119c')
  const [version, setVersion] = useState<string>('PostgreSQL 17')

  const selectedPlan = useMemo(
    () => STARTUP_PLANS.find((p) => p.id === selectedPlanId) ?? STARTUP_PLANS[0],
    [selectedPlanId],
  )

  const summary = useMemo(
    () => ({
      service: version,
      name: serviceName,
      tier,
      cloud,
      region: region === 'sg-sin' ? 'sg-sin' : region,
      regionLabel: region === 'sg-sin' ? 'Singapore' : 'US East',
      plan: selectedPlan.plan,
      estimatedPrice: selectedPlan.monthlyPrice.replace('~ ', ''),
    }),
    [version, serviceName, tier, cloud, region, selectedPlan],
  )

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f9f9fb' }}>
      <Box
        style={{
          maxWidth: CONTAINER_MAX,
          margin: '0 auto',
          padding: PADDING,
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left column (main content) ── */}
        <Box style={{ flex: 1, minWidth: 0, maxWidth: LEFT_COL_MAX }}>
          {/* Header */}
          <Box style={{ marginBottom: 32 }}>
            <Button.Ghost type="button" style={{ marginBottom: 8 }}>
              ← Back
            </Button.Ghost>
            <Box style={{ marginBottom: 8 }}><Typography.Heading>Create service</Typography.Heading></Box>
            <Box style={{ color: '#787885' }}>
              <Typography.Caption>Project: psychedelicshoe-8825 · Organization: My Organization</Typography.Caption>
            </Box>
          </Box>

          {/* Service tier */}
          <Box style={{ marginBottom: 32 }}>
            <SectionTitle icon="◻" title="Service tier" />
            <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {TIER_OPTIONS.map((opt) => (
                <TierCard
                  key={opt.id}
                  option={opt}
                  selected={tier === opt.id}
                  onSelect={() => setTier(opt.id)}
                />
              ))}
            </Box>
          </Box>

          {/* Cloud */}
          <Box style={{ marginBottom: 32 }}>
            <SectionTitle icon="☁" title="Cloud" />
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {CLOUDS.map((c) => {
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
              })}
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
                  <Typography.Default>{r.id} {r.label}</Typography.Default>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Plan */}
          <Box style={{ marginBottom: 32 }}>
            <SectionTitle icon="◻" title="Plan" />
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
            <Box style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <Table ariaLabel="Startup plans">
                <Table.Head>
                  <Table.Row>
                    <Table.Cell>Plan</Table.Cell>
                    <Table.Cell>VMs</Table.Cell>
                    <Table.Cell>CPUs per VM</Table.Cell>
                    <Table.Cell>RAM per VM</Table.Cell>
                    <Table.Cell>Storage</Table.Cell>
                    <Table.Cell>Monthly price</Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {STARTUP_PLANS.map((row) => (
                    <Table.Row
                      key={row.id}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedPlanId === row.id ? '#f3f6ff' : undefined,
                      }}
                      onClick={() => setSelectedPlanId(row.id)}
                    >
                      <Table.Cell>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <RadioButton
                            aria-label={`Plan ${row.plan}`}
                            name="plan"
                            value={row.id}
                            checked={selectedPlanId === row.id}
                            onChange={() => setSelectedPlanId(row.id)}
                          />
                          <Typography.DefaultStrong>{row.plan}</Typography.DefaultStrong>
                        </Box>
                      </Table.Cell>
                      <Table.Cell>{row.vms}</Table.Cell>
                      <Table.Cell>{row.cpusPerVm}</Table.Cell>
                      <Table.Cell>{row.ramPerVm}</Table.Cell>
                      <Table.Cell>{row.storage}</Table.Cell>
                      <Table.Cell>{row.monthlyPrice}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Box>
            <Box style={{ color: '#787885', marginTop: 8 }}>
              <Typography.Caption>Plan details and availability vary by cloud provider and region.</Typography.Caption>
            </Box>
            <Box style={{ marginTop: 16 }}>
              <Banner title="You can't add additional storage in this cloud or plan." variant="default" layout="horizontal" />
            </Box>
          </Box>

          {/* Service basics */}
          <Box>
            <SectionTitle icon="🔧" title="Service basics" />
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                maxWidth: 600,
              }}
            >
              <Input
                labelText="Name*"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="The service name cannot be changed afterwards"
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
              <Link href="#">Add tag to this service</Link>
            </Box>
          </Box>
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
          <Typography.SmallStrong>Service summary</Typography.SmallStrong>
          <SummaryRow label="Service" value={summary.service} highlight />
          <SummaryRow label="Name" value={summary.name} />
          <SummaryRow label="Service tier" value={capitalize(summary.tier)} highlight />
          <SummaryRow label="Cloud" value={summary.cloud} highlight />
          <SummaryRow
            label="Region"
            value={
              <Box component="span" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Box component="span" style={{ color: '#787885' }}>
                  <Typography.Caption>{region === 'sg-sin' ? '🇸🇬' : '🇺🇸'}</Typography.Caption>
                </Box>
                {summary.region}
              </Box>
            }
          />
          <SummaryRow label="Plan" value={summary.plan} highlight />
          <Box style={{ marginTop: 8 }}>
            <Box style={{ color: '#787885' }}>
              <Typography.Caption>Estimated monthly price*</Typography.Caption>
            </Box>
            <Box style={{ marginTop: 4 }}><Typography.Heading>{summary.estimatedPrice} USD</Typography.Heading></Box>
          </Box>
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>*Estimated monthly price is based on 730 hours of usage.</Typography.Caption>
          </Box>
          <Button.Primary type="button" style={{ width: '100%', marginTop: 8 }}>
            Create service
          </Button.Primary>
        </Box>
      </Box>
    </Box>
  )
}

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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
