import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  RadioButton,
  Select,
  Typography,
} from '@aivenio/aquarium'

type ServiceTier = 'free' | 'developer' | 'professional'

type TierCardModel = {
  id: ServiceTier
  title: string
  description: string
  features: { text: string; icon: 'check' | 'info' }[]
  priceLabel: string
}

const TIERS: TierCardModel[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Explore and learn the platform at no cost.',
    features: [
      { text: 'Free forever', icon: 'check' },
      { text: 'Automatically powered off when inactive', icon: 'check' },
      { text: 'Autopauses when inactive, no support', icon: 'info' },
    ],
    priceLabel: '$0',
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'A cost-effective option for test and personal projects.',
    features: [
      { text: "Inactive services aren't powered off", icon: 'check' },
      { text: 'Basic support tier', icon: 'check' },
      { text: 'No integrations or connection pooling', icon: 'info' },
    ],
    priceLabel: '$5',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'For highly available business-critical workloads.',
    features: [
      { text: 'Deploy across multiple clouds and regions', icon: 'check' },
      { text: '99.99% uptime SLA', icon: 'check' },
      { text: 'Automatic backups for disaster recovery', icon: 'check' },
    ],
    priceLabel: 'From $12',
  },
]

const CLOUDS = ['AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'UpCloud'] as const
type CloudProvider = (typeof CLOUDS)[number]

type ComputeType = 'economy' | 'balanced' | 'memory'

const COMPUTE_OPTIONS: { cpus: number; ramGb: number; price: string }[] = [
  { cpus: 1, ramGb: 2, price: '$19' },
  { cpus: 1, ramGb: 4, price: '$32' },
  { cpus: 1, ramGb: 8, price: '$64' },
]

export default function EditService() {
  const [tier, setTier] = useState<ServiceTier>('professional')
  const [cloud, setCloud] = useState<CloudProvider>('AWS')
  const [region, setRegion] = useState<string>('europe-north-1, Finland')
  const [computeType, setComputeType] = useState<ComputeType>('economy')
  const [computeOption, setComputeOption] = useState(0) // index into COMPUTE_OPTIONS

  // "Saved" state for showing diff in summary (strikethrough = saved, green = current)
  const savedState = useMemo(
    () => ({
      tier: 'developer' as ServiceTier,
      cloud: 'DigitalOcean' as CloudProvider,
      computeLabel: 'Balanced: 4 nodes 4 vCPU 4 GB RAM',
      storage: '60 GB',
    }),
    [],
  )

  const currentComputeLabel = useMemo(() => {
    const o = COMPUTE_OPTIONS[computeOption]
    return `Economy: 1 CPU, ${o.ramGb} GB RAM`
  }, [computeOption])

  const summary = useMemo(
    () => ({
      version: 'PostgreSQL 17',
      name: 'my-super-pg-156332a6e7623twgyue2ye',
      cloud,
      region: 'Finland, europe-north1',
      tier,
      computeLabel: currentComputeLabel,
      storage: '300 GB',
      monthlyCost: '$32',
      trialBadge: true,
      computeCost: '$19',
      storageCost: '$2',
      networkCost: 'Usage-based - $0.02/GB',
      backups: 'Every 24h - 24h retention',
    }),
    [cloud, tier, currentComputeLabel],
  )

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--aquarium-background-color-body)',
        padding: 24,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: 1376,
          backgroundColor: 'var(--aquarium-background-color-layer)',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow:
            '0 24px 60px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(15, 23, 42, 0.10)',
        }}
      >
        {/* Header */}
        <Box
          style={{
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Box
            aria-hidden="true"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--aquarium-background-color-primary-graphic) 0%, var(--aquarium-colors-primary-70) 100%)',
            }}
          />
          <Box style={{ flex: 1 }}>
            <Typography.Heading>Edit PostgreSQL service</Typography.Heading>
          </Box>
          <Button.Ghost type="button" aria-label="Close">
            ✕
          </Button.Ghost>
        </Box>

        <Box style={{ display: 'flex', minHeight: 760 }}>
          {/* Left column */}
          <Box
            style={{
              flex: 1,
              padding: 32,
              maxWidth: 1010,
              overflowY: 'auto',
            }}
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Service tier */}
              <SectionHeader
                title="Service tier"
                description={
                  <>
                    Service tiers are structured to help you scale as your project
                    grows. <InlineAction>Compare</InlineAction>
                  </>
                }
              />
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 16,
                }}
              >
                {TIERS.map((t) => (
                  <TierCard
                    key={t.id}
                    model={t}
                    selected={tier === t.id}
                    onSelect={() => setTier(t.id)}
                  />
                ))}
              </Box>

              <Divider />

              {/* Cloud */}
              <SectionHeader title="Cloud" />
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {CLOUDS.map((c) => {
                  const isActive = c === cloud
                  return (
                    <Button.Secondary
                      key={c}
                      type="button"
                      onClick={() => setCloud(c)}
                      style={{
                        borderRadius: 999,
                        paddingInline: 16,
                        backgroundColor: isActive ? 'var(--aquarium-background-color-primary-muted)' : undefined,
                        borderColor: isActive ? 'var(--aquarium-border-color-primary-default)' : undefined,
                        color: isActive ? '#292a31' : undefined,
                      }}
                    >
                      {c}
                    </Button.Secondary>
                  )
                })}
              </Box>

              <Box style={{ maxWidth: 530 }}>
                <Select
                  labelText="Select region"
                  options={[
                    'europe-north-1, Finland',
                    'europe-central-1, Germany',
                    'us-east-1, Virginia',
                  ]}
                  value={region}
                  onChange={(val) => setRegion(String(val ?? ''))}
                />
              </Box>

              <Divider />

              {/* Compute */}
              <SectionHeader
                title="Compute"
                description="Cost-effective option for less resource-intensive deployments"
              />
              <Box style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(
                  [
                    ['economy', 'Economy'],
                    ['balanced', 'Balanced'],
                    ['memory', 'Memory optimized'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setComputeType(value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid var(--aquarium-border-color-muted)',
                      background:
                        computeType === value ? 'var(--aquarium-background-color-primary-graphic)' : 'var(--aquarium-background-color-layer)',
                      color: computeType === value ? 'var(--aquarium-text-color-opposite-default)' : 'var(--aquarium-text-color-default)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {COMPUTE_OPTIONS.map((opt, i) => (
                  <Box
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setComputeOption(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        setComputeOption(i)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: `1px solid ${computeOption === i ? 'var(--aquarium-border-color-primary-default)' : 'var(--aquarium-border-color-muted)'}`,
                      borderRadius: 6,
                      backgroundColor:
                        computeOption === i ? 'var(--aquarium-background-color-primary-muted)' : 'var(--aquarium-background-color-layer)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <RadioButton
                        aria-label={`${opt.cpus} CPU, ${opt.ramGb} GB RAM`}
                        name="compute"
                        value={String(i)}
                        checked={computeOption === i}
                        onChange={() => setComputeOption(i)}
                      />
                      <Typography.DefaultStrong>
                        {opt.cpus} CPU, {opt.ramGb} GB RAM
                      </Typography.DefaultStrong>
                    </Box>
                    <Typography.SmallStrong>{opt.price}</Typography.SmallStrong>
                  </Box>
                ))}
                <InlineAction style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  See all options ↓
                </InlineAction>
              </Box>
            </Box>
          </Box>

          {/* Right column - Summary */}
          <Box
            style={{
              width: 340,
              borderLeft: '1px solid var(--aquarium-border-color-muted)',
              backgroundColor: 'var(--aquarium-background-color-layer)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              style={{
                padding: '24px 24px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                flex: 1,
              }}
            >
              <Typography.LargeHeading>{summary.version}</Typography.LargeHeading>

              <SummaryRow label="Name" value={summary.name} />

              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography.Caption style={{ color: '#4a4b57' }}>
                  Cloud
                </Typography.Caption>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Typography.Caption>Digital Ocean</Typography.Caption>
                  <Typography.Caption>🇫🇮 {summary.region}</Typography.Caption>
                </Box>
              </Box>

              <SummaryDiffRow
                label="Tier"
                savedValue={TIERS.find((t) => t.id === savedState.tier)?.title ?? savedState.tier}
                currentValue={TIERS.find((t) => t.id === tier)?.title ?? tier}
              />

              <SummaryDiffRow
                label="Compute"
                savedValue={savedState.computeLabel}
                currentValue={summary.computeLabel}
              />

              <SummaryDiffRow
                label="Total storage"
                savedValue={savedState.storage}
                currentValue={summary.storage}
              />

              <Divider />

              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography.SmallStrong>
                  Est. monthly*
                  {summary.trialBadge && (
                    <Box
                      component="span"
                      style={{
                        marginLeft: 8,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: 'var(--aquarium-background-color-success-muted)',
                        color: 'var(--aquarium-text-color-success-intense)',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Trial
                    </Box>
                  )}
                </Typography.SmallStrong>
                <Typography.LargeHeading>{summary.monthlyCost}</Typography.LargeHeading>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SummaryRow label="Compute" value={summary.computeCost} />
                  <SummaryRow label="Storage" value={summary.storageCost} />
                  <SummaryRow
                    label="Network"
                    value={summary.networkCost}
                    withInfo
                  />
                  <SummaryRow label="Backups" value={summary.backups} withInfo />
                </Box>
                <Typography.Caption style={{ color: '#787885' }}>
                  *You won't be charged for 30 days or until you use your credits,
                  whichever comes first
                </Typography.Caption>
              </Box>

              <Box
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-end',
                  paddingTop: 16,
                }}
              >
                <Button.Secondary type="button">Cancel</Button.Secondary>
                <Button.Primary type="button">Create service</Button.Primary>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description?: React.ReactNode
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Typography.LargeHeading>{title}</Typography.LargeHeading>
      {description ? (
        <Typography.Small style={{ color: '#4a4b57' }}>
          {description}
        </Typography.Small>
      ) : null}
    </Box>
  )
}

function InlineAction({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <Box
      component="span"
      style={{
        color: '#5865cd',
        fontWeight: 600,
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </Box>
  )
}

function TierCard({
  model,
  selected,
  onSelect,
}: {
  model: TierCardModel
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect()
      }}
      style={{
        border: `1px solid ${selected ? 'var(--aquarium-border-color-primary-default)' : 'var(--aquarium-border-color-muted)'}`,
        backgroundColor: selected ? 'var(--aquarium-background-color-primary-muted)' : 'var(--aquarium-background-color-layer)',
        borderRadius: 6,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Box style={{ flex: 1 }}>
          <Typography.DefaultStrong>{model.title}</Typography.DefaultStrong>
          <Box style={{ color: '#4a4b57' }}>
            <Typography.Caption>{model.description}</Typography.Caption>
          </Box>
        </Box>
        <RadioButton
          aria-label={`${model.title} tier`}
          name="serviceTier"
          value={model.id}
          checked={selected}
          onChange={onSelect}
        />
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {model.features.map((f) => (
          <Box
            key={f.text}
            style={{
              color: '#787885',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {f.icon === 'check' ? (
              <span style={{ color: '#22c55e' }}>✔</span>
            ) : (
              <span style={{ color: '#787885' }}>🛈</span>
            )}
            <Typography.Caption>{f.text}</Typography.Caption>
          </Box>
        ))}
      </Box>

      <Box style={{ color: '#000' }}>
        <Typography.SmallStrong>{model.priceLabel}</Typography.SmallStrong>
      </Box>
    </Box>
  )
}

function SummaryRow({
  label,
  value,
  withInfo,
}: {
  label: string
  value: string
  withInfo?: boolean
}) {
  return (
    <Box
      style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Box
        style={{
          color: '#4a4b57',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Typography.Caption>{label}</Typography.Caption>
        {withInfo && (
          <Box component="span" aria-label="Info" style={{ cursor: 'help' }}>
            🛈
          </Box>
        )}
      </Box>
      <Box style={{ color: '#292a31', textAlign: 'right' }}>
        <Typography.Caption>{value}</Typography.Caption>
      </Box>
    </Box>
  )
}

function SummaryDiffRow({
  label,
  savedValue,
  currentValue,
}: {
  label: string
  savedValue: string
  currentValue: string
}) {
  const isChanged = savedValue !== currentValue
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography.Caption style={{ color: '#4a4b57' }}>
        {label}
      </Typography.Caption>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isChanged && (
          <Typography.Caption
            style={{
              color: '#787885',
              textDecoration: 'line-through',
            }}
          >
            {savedValue}
          </Typography.Caption>
        )}
        <Typography.Caption
          style={{
            color: isChanged ? '#16a34a' : '#292a31',
            fontWeight: isChanged ? 600 : undefined,
          }}
        >
          {currentValue}
        </Typography.Caption>
      </Box>
    </Box>
  )
}
