import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Icon, Modal, Typography, type IconProps } from '@aivenio/aquarium'
import layersIcon from '@aivenio/aquarium/icons/layers'
import { getAivenIcon } from '../assets/icons/aivenIcon'
import digitalOceanIcon from '../assets/icons/digitalOceanIcon'
import { useTheme } from '../theme/ThemeProvider'
import { UPGRADE_PLAN_SERVICE_DATA, type UpgradeTier } from './UpgradeServiceModal'
import { getPlanIllustrationUrl } from './upgradePlanIllustrations'

// ─── Plan definitions ────────────────────────────────────────────────────────

type PlanChip = { text: string; status: 'neutral'; icon?: IconProps['icon'] }

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
  chips: [{ text: 'eu-central-1, Frankfurt', status: 'neutral', icon: digitalOceanIcon }],
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
  chips: [{ text: 'eu-central-1, Frankfurt', status: 'neutral', icon: digitalOceanIcon }],
  name: 'Business',
  description: 'For critical workloads and live applications',
  features: [
    '2 nodes × (4 vCPU · 16 GB RAM · 120 GB Disk)',
    'High availability and failover support',
    'Automated backups and replication',
  ],
  price: '$180/month',
}

// ─── Tier groups ─────────────────────────────────────────────────────────────

type TierGroup = {
  label: string
  plans: PlanV2[]
}

const TIER_GROUPS_BY_TIER: Record<UpgradeTier, TierGroup[]> = {
  free: [
    { label: 'Hobby tier',        plans: [DEVELOPER_V2] },
    { label: 'Professional tier', plans: [STARTUP_V2, BUSINESS_V2] },
  ],
  developer: [
    { label: 'Professional tier', plans: [STARTUP_V2, BUSINESS_V2] },
  ],
}

// ─── Props ───────────────────────────────────────────────────────────────────

type UpgradeServiceModalV2Props = {
  open: boolean
  onClose: () => void
  currentTier: UpgradeTier
  onUpgrade: (planId: string) => void
  onCustomize: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UpgradeServiceModalV2({
  open,
  onClose,
  currentTier,
  onUpgrade,
  onCustomize,
}: UpgradeServiceModalV2Props) {
  const { resolved: theme } = useTheme()
  const tierGroups = useMemo(
    () =>
      TIER_GROUPS_BY_TIER[currentTier].map((group) => ({
        ...group,
        plans: group.plans.map((plan) =>
          plan.id === 'developer-plan'
            ? {
                ...plan,
                chips: [{ text: 'Europe', status: 'neutral' as const, icon: getAivenIcon(theme) }],
              }
            : plan,
        ),
      })),
    [currentTier, theme],
  )
  const allPlans = tierGroups.flatMap((g) => g.plans)
  const defaultPlanId = allPlans[0].id

  const planImageUrls = useMemo(
    () => Object.fromEntries(allPlans.map((p) => [p.id, getPlanIllustrationUrl(p.id, theme)])),
    [currentTier, theme],
  )

  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId)

  useEffect(() => {
    if (open) {
      setSelectedPlanId(TIER_GROUPS_BY_TIER[currentTier].flatMap((g) => g.plans)[0].id)
    }
  }, [open, currentTier])

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
        .upgrade-v2-cards label > div:first-child > *:last-child { display: none !important; }
        /* Fit cards in modal: DS sets min-w-[280px] per card; allow grid columns to shrink */
        .upgrade-v2-cards {
          width: 100%;
          min-width: 0;
        }
        .upgrade-v2-cards label.Aquarium-Card.Label {
          box-sizing: border-box;
          min-width: 0 !important;
          max-width: 100%;
          width: 100%;
          overflow: hidden;
        }
        /* DS checkable cards use an outer ring when selected; use inset border so edges align with modal content */
        .upgrade-v2-cards .Aquarium-StatusChip .Aquarium-InlineIcon svg {
          width: 18px;
          height: 16px;
          flex-shrink: 0;
        }
        .upgrade-v2-cards label.Aquarium-Card.Label.ring-2 {
          --tw-ring-offset-shadow: 0 0 #0000 !important;
          --tw-ring-shadow: 0 0 #0000 !important;
          --tw-ring-width: 0 !important;
          --tw-ring-offset-width: 0 !important;
          box-shadow: inset 0 0 0 2px var(--aquarium-border-color-primary-default) !important;
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
      `}</style>

      <Box style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', minWidth: 0 }}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: planCardColumns,
              gap: 24,
              width: '100%',
              minWidth: 0,
            }}
          >
            {tierGroups.map((group) => (
              <TierHeader key={group.label} group={group} planCount={group.plans.length} />
            ))}
          </Box>

          <Box
            className="upgrade-v2-cards"
            style={{
              display: 'grid',
              gridTemplateColumns: planCardColumns,
              gap: 24,
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
              image={planImageUrls[plan.id] ?? getPlanIllustrationUrl('developer-plan', theme)}
              imageAlt=""
              imageHeight={100}
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

                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
        </Box>

        <Box style={{ marginTop: 32 }}>
          <FullConfigurationCard onClick={onCustomize} />
        </Box>
      </Box>
    </Modal>
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

// ─── Tier header ─────────────────────────────────────────────────────────────

function TierHeader({ group, planCount }: { group: TierGroup; planCount: number }) {
  return (
    <Box
      className="upgrade-v2-tier-bar--professional"
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
