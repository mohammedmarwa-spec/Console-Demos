import { useEffect, useMemo, useState } from 'react'
import { Alert as AlertBase } from '@aivenio/aquarium/atoms'
import { Box, Button, Card, Icon, Modal, StatusChip, Typography, type IconProps } from '@aivenio/aquarium'
import currencyDollarIcon from '@aivenio/aquarium/icons/currencyDollar'
import layersIcon from '@aivenio/aquarium/icons/layers'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import { getAivenIcon } from '../assets/icons/aivenIcon'
import { getAwsIcon } from '../assets/icons/awsIcon'
import digitalOceanIcon from '../assets/icons/digitalOceanIcon'
import gcpIcon from '../assets/icons/gcpIcon'
import { useTheme } from '../theme/ThemeProvider'
import { CLOUD_PROVIDERS, REGIONS_BY_CLOUD, type CloudProviderId } from './serviceRegions'
import { UPGRADE_PLAN_SERVICE_DATA, type UpgradeTier } from './UpgradeServiceModal'
import { ONBOARDING_CHECKABLE_CARD_RING_CSS } from './playground/playgroundShared'
import { PlanIllustrationBanner } from './PlanIllustrationBanner'

/** Aquarium Card label class is literally "Aquarium-Card.Label" (one token) — escape the dot in CSS. */
const UPGRADE_V2_CHECKABLE_CARD_CSS = `
  ${ONBOARDING_CHECKABLE_CARD_RING_CSS.replace(/\.onboarding-checkable-cards/g, '.upgrade-v2-cards')}
  /* Hide DS checkbox in chip row (last grid cell); illustration is a separate sibling, not affected */
  .upgrade-v2-cards label.Aquarium-Card\\.Label > div:first-child > *:last-child {
    display: none !important;
  }
  .upgrade-v2-cards label.Aquarium-Card\\.Label > div:first-child {
    grid-template-columns: 1fr !important;
  }
  .upgrade-v2-cards label.Aquarium-Card\\.Label {
    max-width: 100%;
    overflow: hidden;
  }
`

// ─── Plan definitions ────────────────────────────────────────────────────────

type PlanChip = { text: string; status: 'neutral'; icon?: IconProps['icon'] }

function regionCityChip(cloud: CloudProviderId, regionId: string): PlanChip {
  const region = REGIONS_BY_CLOUD[cloud].find((r) => r.id === regionId)
  if (!region) return { text: regionId, status: 'neutral' }
  const city = region.label.includes(', ')
    ? region.label.split(', ').slice(1).join(', ')
    : region.label
  return { text: `${region.flag} ${city}`, status: 'neutral' }
}

function providerChip(cloud: CloudProviderId, icon: IconProps['icon']): PlanChip {
  const label = CLOUD_PROVIDERS.find((p) => p.id === cloud)?.label ?? cloud
  return { text: label, status: 'neutral', icon }
}

function cloudPlanChips(
  cloud: CloudProviderId,
  regionId: string,
  icon: IconProps['icon'],
): PlanChip[] {
  return [providerChip(cloud, icon), regionCityChip(cloud, regionId)]
}

type PlanV2 = {
  id: string
  chips: PlanChip[]
  name: string
  description: string
  features: string[]
  price: string
}

const DEVELOPER_V2: PlanV2 = {
  id: 'developer-plan',
  chips: [{ text: 'Europe', status: 'neutral' }],
  name: 'Developer',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 vCPU · 1 GB RAM · 8 GB Disk',
    "Inactive services aren't powered off",
    'Basic support tier',
  ],
  price: '$5/month',
}

const STARTUP_V2: PlanV2 = {
  id: 'startup',
  chips: cloudPlanChips('digitalocean', 'fra1', digitalOceanIcon),
  name: 'Startup',
  description: 'For growing apps and staging environments',
  features: [
    '2 vCPU · 4 GB RAM · 80 GB Disk',
    'Handles increasing traffic and data',
    'Integrations and scaling support',
    'Ideal for staging or early production',
  ],
  price: '$60/month',
}

const BUSINESS_V2: PlanV2 = {
  id: 'business',
  chips: cloudPlanChips('digitalocean', 'fra1', digitalOceanIcon),
  name: 'Business',
  description: 'For critical workloads and live applications',
  features: [
    '2 nodes × (4 vCPU · 16 GB RAM · 120 GB Disk)',
    'High availability and failover support',
    'Automated backups and replication',
  ],
  price: '$180/month',
}

const HOBBYIST_V2: PlanV2 = {
  id: 'hobbyist',
  chips: cloudPlanChips('digitalocean', 'fra1', digitalOceanIcon),
  name: 'Hobbyist',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 vCPU · 2 GB RAM · 8 GB Disk',
    'Region selection',
    'Backups for disaster recovery',
  ],
  price: '$12/month',
}

const HOBBYIST_AWS_V4: PlanV2 = {
  id: 'hobbyist-aws',
  chips: cloudPlanChips('aws', 'eu-west-1', getAwsIcon('dark')),
  name: 'Hobbyist',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 vCPU · 2 GB RAM · 8 GB Disk',
    'Region selection',
    'Backups for disaster recovery',
  ],
  price: '$12/month',
}

const HOBBYIST_GCP_V4: PlanV2 = {
  id: 'hobbyist-gcp',
  chips: cloudPlanChips('google', 'europe-west1', gcpIcon),
  name: 'Hobbyist',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 vCPU · 2 GB RAM · 8 GB Disk',
    'Region selection',
    'Backups for disaster recovery',
  ],
  price: '$12/month',
}

const STARTUP_4_V2: PlanV2 = {
  id: 'startup-4',
  chips: cloudPlanChips('digitalocean', 'fra1', digitalOceanIcon),
  name: 'Startup-4',
  description: 'For growing apps and staging environments',
  features: [
    '1 vCPU · 4 GB RAM · 80 GB Disk',
    'Handles increasing traffic and data',
    'Backup up to 2 days with point-in-time recovery',
    '99.99% uptime SLA',
  ],
  price: '$75/month',
}

// ─── Tier groups ─────────────────────────────────────────────────────────────

type TierGroup = {
  label: string
  plans: PlanV2[]
}

export type UpgradeModalPlanVariant = 'startup-business' | 'hobbyist-startup-4' | 'dual-hobbyist-clouds'

const TIER_GROUPS_BY_TIER: Record<UpgradeModalPlanVariant, Record<UpgradeTier, TierGroup[]>> = {
  'startup-business': {
    free: [
      { label: 'Hobby tier',        plans: [DEVELOPER_V2] },
      { label: 'Professional tier', plans: [STARTUP_V2, BUSINESS_V2] },
    ],
    developer: [
      { label: 'Hobby tier',        plans: [HOBBYIST_V2] },
      { label: 'Professional tier', plans: [BUSINESS_V2, STARTUP_V2] },
    ],
  },
  'hobbyist-startup-4': {
    free: [
      { label: 'Hobby tier',        plans: [DEVELOPER_V2, HOBBYIST_V2] },
      { label: 'Professional tier', plans: [STARTUP_4_V2] },
    ],
    developer: [
      { label: 'Hobby tier',        plans: [HOBBYIST_V2] },
      { label: 'Professional tier', plans: [BUSINESS_V2, STARTUP_4_V2] },
    ],
  },
  'dual-hobbyist-clouds': {
    free: [
      { label: 'Hobby tier', plans: [DEVELOPER_V2, HOBBYIST_AWS_V4, HOBBYIST_GCP_V4] },
    ],
    developer: [
      {
        label: 'Hobby tier',
        plans: [HOBBYIST_AWS_V4, HOBBYIST_GCP_V4, STARTUP_4_V2],
      },
    ],
  },
}

// ─── Props ───────────────────────────────────────────────────────────────────

type UpgradeServiceModalV2Props = {
  open: boolean
  onClose: () => void
  currentTier: UpgradeTier
  /** Which recommended plans appear in the Professional tier. */
  planVariant?: UpgradeModalPlanVariant
  onUpgrade: (planId: string) => void
  onCustomize: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UpgradeServiceModalV2({
  open,
  onClose,
  currentTier,
  planVariant = 'startup-business',
  onUpgrade,
  onCustomize,
}: UpgradeServiceModalV2Props) {
  const { resolved: theme } = useTheme()
  const tierGroups = useMemo(
    () =>
      TIER_GROUPS_BY_TIER[planVariant][currentTier].map((group) => ({
        ...group,
        plans: group.plans.map((plan) => {
          if (plan.id === 'developer-plan') {
            return {
              ...plan,
              chips: [{ text: 'Europe', status: 'neutral' as const, icon: getAivenIcon(theme) }],
            }
          }
          if (plan.id === 'hobbyist-aws') {
            return {
              ...plan,
              chips: cloudPlanChips('aws', 'eu-west-1', getAwsIcon(theme)),
            }
          }
          return plan
        }),
      })),
    [currentTier, planVariant, theme],
  )
  const allPlans = tierGroups.flatMap((g) => g.plans)
  const defaultPlanId = allPlans[0].id

  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId)

  useEffect(() => {
    if (open) {
      setSelectedPlanId(TIER_GROUPS_BY_TIER[planVariant][currentTier].flatMap((g) => g.plans)[0].id)
    }
  }, [open, currentTier, planVariant])

  // Export the plan data via the shared UPGRADE_PLAN_SERVICE_DATA map (same IDs)
  function handleUpgrade() {
    onUpgrade(selectedPlanId)
  }

  const planCardColumns = `repeat(${allPlans.length}, minmax(0, 1fr))`

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Quick upgrade"
      subtitle="Recommended shortcuts based on your current plan and region. You can scale up or down later anytime."
      primaryAction={{ text: 'Upgrade', onClick: handleUpgrade }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      {/* Hide DS Card checkbox indicators */}
      <style>{`
        ${UPGRADE_V2_CHECKABLE_CARD_CSS}
        .upgrade-v2-cards {
          width: 100%;
          min-width: 0;
        }
        .upgrade-v2-cards .upgrade-plan-features {
          line-height: 1.42;
        }
        .upgrade-trial-alert {
          padding: 12px !important;
          column-gap: 8px !important;
        }
        .upgrade-trial-alert__icon {
          height: 16px;
          grid-column-start: 1;
          grid-row-start: 1;
          align-self: start;
        }
        .upgrade-v2-tier-bar--hobby {
          background-color: color-mix(
            in srgb,
            var(--aquarium-background-color-success-graphic) 20%,
            var(--aquarium-background-color-muted)
          );
        }
        .upgrade-v2-tier-bar--hobby .upgrade-v2-tier-bar-label {
          color: color-mix(
            in srgb,
            var(--aquarium-background-color-success-graphic) 55%,
            var(--aquarium-text-color-default)
          ) !important;
        }
        .upgrade-v2-tier-bar--professional {
          background-color: color-mix(
            in srgb,
            var(--aquarium-chart-colors-primary-categorical-4) 22%,
            var(--aquarium-background-color-muted)
          );
        }
        .upgrade-v2-tier-bar--professional .upgrade-v2-tier-bar-label {
          color: var(--aquarium-chart-colors-primary-categorical-4) !important;
        }
        .upgrade-v3-customize-compact-wrap .Aquarium-Card.Compact {
          background-color: var(--aquarium-background-color-primary-muted);
          border-left: 4px solid var(--aquarium-background-color-primary-graphic);
        }
      `}</style>

      <Box style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', minWidth: 0 }}>
          <TrialCreditsAlert />
          {planVariant !== 'dual-hobbyist-clouds' && (
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: planCardColumns,
                gap: 16,
                width: '100%',
                minWidth: 0,
              }}
            >
              {tierGroups.map((group) => (
                <TierHeader key={group.label} group={group} planCount={group.plans.length} />
              ))}
            </Box>
          )}

          <Box
            className="upgrade-v2-cards"
            style={{
              display: 'grid',
              gridTemplateColumns: planCardColumns,
              gap: 16,
              width: '100%',
              minWidth: 0,
            }}
          >
          {allPlans.map((plan) => (
            <Card
              key={plan.id}
              fullWidth
              checkable
              value={plan.id}
              checked={selectedPlanId === plan.id}
              onCheckedChange={({ value }) => setSelectedPlanId(value)}
              image={<PlanIllustrationBanner planId={plan.id} />}
              imageAlt=""
              imageHeight={120}
              chips={plan.chips}
              title={
                <Card.Title>
                  <Typography.DefaultStrong color="intense">{plan.name}</Typography.DefaultStrong>
                </Card.Title>
              }
            >
              {/* height: 100% fills the Card's flex-auto children wrapper */}
              <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Top: description + features — grows to fill available space */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  <Typography.Small color="muted">{plan.description}</Typography.Small>

                  <Box className="upgrade-plan-features" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {plan.features.map((feat) => (
                      <Box key={feat} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <Box component="span" style={{ flexShrink: 0 }}>
                          <Typography.Small htmlTag="span" color="muted">
                            •
                          </Typography.Small>
                        </Box>
                        <Typography.Small color="muted">{feat}</Typography.Small>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box style={{ paddingTop: 12 }}>
                  <Typography.DefaultStrong color="intense">
                    {plan.price}
                  </Typography.DefaultStrong>
                </Box>
              </Box>
            </Card>
          ))}
          </Box>

          {planVariant === 'dual-hobbyist-clouds' && (
            <>
              <OrDivider />
              <SeeAllPlansCard onCustomize={onCustomize} />
            </>
          )}
        </Box>

        {planVariant !== 'dual-hobbyist-clouds' && (
          <Box style={{ marginTop: 32 }}>
            {planVariant === 'hobbyist-startup-4' ? (
              <CustomizeCompactCard onCustomize={onCustomize} />
            ) : (
              <FullConfigurationCard onClick={onCustomize} />
            )}
          </Box>
        )}
      </Box>
    </Modal>
  )
}

// ─── Or divider (Figma 2565:23428) ───────────────────────────────────────────

function OrDivider() {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        minWidth: 0,
      }}
    >
      <Box
        aria-hidden
        style={{
          flex: 1,
          height: 1,
          backgroundColor: 'var(--aquarium-border-color-muted)',
        }}
      />
      <StatusChip text="or" status="neutral" dense />
      <Box
        aria-hidden
        style={{
          flex: 1,
          height: 1,
          backgroundColor: 'var(--aquarium-border-color-muted)',
        }}
      />
    </Box>
  )
}

// ─── See all plans CTA (V4: Figma 2565:23432) ───────────────────────────────

function SeeAllPlansCard({ onCustomize }: { onCustomize: () => void }) {
  return (
    <Box className="upgrade-v3-customize-compact-wrap">
      <Card.Compact
        fullWidth
        onClick={onCustomize}
        title={
          <Card.Title>
            <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
              <Box
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: 'var(--aquarium-background-color-primary-muted)',
                }}
              >
                <Icon icon={settingsIcon} color="primary-default" style={{ width: 16, height: 16 }} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <Typography.DefaultStrong color="intense">See all plans</Typography.DefaultStrong>
                <Typography.Small color="muted">
                  View all clouds, regions, plans, CPU, RAM, disk, and scaling options.
                </Typography.Small>
              </Box>
            </Box>
          </Card.Title>
        }
      />
    </Box>
  )
}

// ─── Customize CTA (V3: Card.Compact) ────────────────────────────────────────

function CustomizeCompactCard({ onCustomize }: { onCustomize: () => void }) {
  return (
    <Box className="upgrade-v3-customize-compact-wrap">
      <Card.Compact
        fullWidth
        title={
          <Card.Title>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                width: '100%',
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <Box
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor:
                      'color-mix(in srgb, var(--aquarium-background-color-primary-graphic) 18%, var(--aquarium-background-color-layer))',
                    border: '1px solid var(--aquarium-border-color-primary-muted)',
                  }}
                >
                  <Icon icon={settingsIcon} color="primary-default" style={{ width: 20, height: 20 }} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <Typography.DefaultStrong color="intense">Customize instead</Typography.DefaultStrong>
                  <Typography.Small color="muted">
                    View all clouds, regions, plans, CPU, RAM, disk, and scaling options.
                  </Typography.Small>
                </Box>
              </Box>
              <Box style={{ flexShrink: 0 }}>
                <Button.Ghost dense type="button" onClick={onCustomize}>
                  Configure manually
                </Button.Ghost>
              </Box>
            </Box>
          </Card.Title>
        }
      />
    </Box>
  )
}

// ─── Full configuration card (Figma: Pricing UX) ─────────────────────────────

function FullConfigurationCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      fullWidth
      onClick={onClick}
      title={
        <Card.Title>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              width: '100%',
            }}
          >
            <Box style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <Typography.Default color="primary-default">View all clouds and plans</Typography.Default>
              <Typography.Small color="muted">Select cloud, region, CPU, RAM, disk and scaling options</Typography.Small>
            </Box>
            <Box
              aria-hidden
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                borderRadius: 4,
                backgroundColor: 'var(--aquarium-background-color-default)',
              }}
            >
              <Icon icon={layersIcon} color="muted" style={{ width: 22, height: 22 }} />
            </Box>
          </Box>
        </Card.Title>
      }
    />
  )
}

// ─── Trial credits alert (Figma: Pricing UX 2573:42693) ─────────────────────

function TrialCreditsAlert() {
  return (
    <AlertBase
      type="success"
      className="Aquarium-Alert upgrade-trial-alert"
      dense={false}
      hasAction={false}
      role="status"
    >
      <div className="upgrade-trial-alert__icon">
        <Icon icon={currencyDollarIcon} color="success-graphic" fontSize={16} />
      </div>
      <AlertBase.Description>
        Trial active · Upgrade covered by trial credits · No credit card required
      </AlertBase.Description>
    </AlertBase>
  )
}

// ─── Tier header ─────────────────────────────────────────────────────────────

function TierHeader({ group, planCount }: { group: TierGroup; planCount: number }) {
  const tierBarClass =
    group.label === 'Hobby tier' ? 'upgrade-v2-tier-bar--hobby' : 'upgrade-v2-tier-bar--professional'

  return (
    <Box
      className={tierBarClass}
      style={{
        gridColumn: `span ${planCount}`,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '4px 16px',
        borderRadius: 6,
      }}
    >
      <Typography.CodeSmall htmlTag="span" color="muted" className="upgrade-v2-tier-bar-label">
        {group.label}
      </Typography.CodeSmall>
    </Box>
  )
}

// Re-export the shared plan service data so App.tsx can use the same mapping
export { UPGRADE_PLAN_SERVICE_DATA }
