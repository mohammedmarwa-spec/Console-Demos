import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  Input,
  RadioButton,
  Select,
  Switch,
  Typography,
} from '@aivenio/aquarium'

type ServiceTier = 'free' | 'startup' | 'business' | 'professional'

type TierCardModel = {
  id: ServiceTier
  title: string
  description: string
  benefits: string[]
  priceLabel: string
}

const TIERS: TierCardModel[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Explore and learn the platform at no cost.',
    benefits: ['Single region', 'Community support', 'Basic monitoring'],
    priceLabel: '$0',
  },
  {
    id: 'startup',
    title: 'Startup',
    description: 'For projects that need reliable managed databases.',
    benefits: ['Production ready', 'Automated backups', 'Email support'],
    priceLabel: 'From $6',
  },
  {
    id: 'business',
    title: 'Business',
    description: 'For business-critical workloads with stronger guarantees.',
    benefits: ['High availability', 'Private networking', 'Priority support'],
    priceLabel: 'From $12',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'For highly available workloads and advanced controls.',
    benefits: ['Multi-region options', '99.99% uptime SLA', 'Advanced security'],
    priceLabel: 'From $24',
  },
]

const CLOUDS = ['AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'UpCloud'] as const
type CloudProvider = (typeof CLOUDS)[number]

export default function CreateService() {
  const [acuOn, setAcuOn] = useState(true)
  const [tier, setTier] = useState<ServiceTier>('professional')
  const [cloud, setCloud] = useState<CloudProvider>('AWS')
  const [region, setRegion] = useState<string>('🇫🇮 europe-north-1, Finland')
  const [serviceName, setServiceName] = useState('pg-1f8594fa')
  const [version, setVersion] = useState('PostgreSQL 17')

  const summary = useMemo(
    () => ({
      version,
      name: serviceName,
      cloud,
      region,
      compute: '1 CPU/2 RAM',
      storage: '16 GB',
      networkEgress: '$0,02/GB',
      monthlyCost: '$124 USD',
      egressCost: '+ egress $0.04/GB',
    }),
    [cloud, region, serviceName, version],
  )

  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #0b1220 0, #0b1220 40%, #05070d 100%)',
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
          backgroundColor: '#fff',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow:
            '0 24px 60px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(15, 23, 42, 0.10)',
        }}
      >
        <Box
          style={{
            borderBottom: '1px solid #ededf0',
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
              background: 'linear-gradient(135deg, #3545be 0%, #8b5cf6 100%)',
            }}
          />
          <Box style={{ flex: 1 }}>
            <Typography.Heading>Create PostgreSQL service</Typography.Heading>
          </Box>
          <Button.Ghost type="button">Close</Button.Ghost>
        </Box>

        <Box
          style={{
            display: 'flex',
            minHeight: 760,
          }}
        >
          <Box
            style={{
              flex: 1,
              padding: 32,
              maxWidth: 1010,
            }}
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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

              <Box style={{ maxWidth: 530 }}>
                <Select
                  labelText="Select region"
                  options={[
                    '🇫🇮 europe-north-1, Finland',
                    '🇩🇪 europe-central-1, Germany',
                    '🇺🇸 us-east-1, Virginia',
                  ]}
                  value={region}
                  onChange={(val) => setRegion(String(val ?? ''))}
                />
              </Box>

              <Divider />

              <SectionHeader title="Name & version" />
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  maxWidth: 940,
                }}
              >
                <Input
                  labelText="Name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
                <Select
                  labelText="Version"
                  options={['PostgreSQL 17', 'PostgreSQL 16', 'PostgreSQL 15']}
                  value={version}
                  onChange={(val) => setVersion(String(val ?? ''))}
                />
              </Box>
            </Box>
          </Box>

          <Box
            style={{
              width: 340,
              borderLeft: '1px solid #ededf0',
              backgroundColor: '#fff',
            }}
          >
            <Box
              style={{
                borderBottom: '1px solid #ededf0',
                padding: 14,
              }}
            >
              <Switch
                checked={acuOn}
                onChange={(e) => setAcuOn(e.target.checked)}
                caption={
                  <>
                    Flexible CPU, RAM and storage. <InlineAction>Compare</InlineAction>
                  </>
                }
              >
                New configuration & pricing
              </Switch>
            </Box>

            <Box style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box style={{ flex: 1 }}>
                  <Typography.SmallStrong>Service summary</Typography.SmallStrong>
                </Box>
                <Button.Ghost type="button">Copy as code</Button.Ghost>
              </Box>

              <SummaryRow label="Version" value={summary.version} />
              <SummaryRow label="Name" value={summary.name} />
              <SummaryRow label="Cloud" value={summary.cloud} />
              <SummaryRow label="Region" value={summary.region} />
              <Divider />
              <SummaryRow label="Compute" value={summary.compute} />
              <SummaryRow label="Storage" value={summary.storage} />
              <SummaryRow label="Network egress" value={summary.networkEgress} />

              <Divider />

              <Typography.SmallStrong>Estimated monthly cost*</Typography.SmallStrong>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography.LargeHeading>{summary.monthlyCost}</Typography.LargeHeading>
                <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Typography.Small>{summary.egressCost}</Typography.Small>
                </Box>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button.Primary type="button" style={{ width: '100%' }}>
                  Create service
                </Button.Primary>
                <Box style={{ textAlign: 'center' }}>
                  <Typography.Caption>
                    *Based on 730 hours of being powered on
                  </Typography.Caption>
                </Box>
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
      {description ? <Typography.Small>{description}</Typography.Small> : null}
    </Box>
  )
}

function InlineAction({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      style={{
        color: '#5865cd',
        fontWeight: 600,
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
        border: `1px solid ${selected ? '#3545be' : '#ededf0'}`,
        backgroundColor: selected ? '#f3f6ff' : '#fff',
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
        {model.benefits.map((benefit) => (
          <Box key={benefit} style={{ color: '#787885' }}>
            <Typography.Caption>{benefit}</Typography.Caption>
          </Box>
        ))}
      </Box>

      <Box style={{ color: '#000' }}>
        <Typography.SmallStrong>{model.priceLabel}</Typography.SmallStrong>
      </Box>
    </Box>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Box style={{ color: '#4a4b57', textAlign: 'right' }}>
        <Typography.Caption>{value}</Typography.Caption>
      </Box>
    </Box>
  )
}

