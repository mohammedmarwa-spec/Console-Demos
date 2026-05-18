import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Icon, Modal, Typography } from '@aivenio/aquarium'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import { useTheme } from '../theme/ThemeProvider'
import { UPGRADE_PLAN_SERVICE_DATA, type UpgradeTier } from './UpgradeServiceModal'
import { getPlanIllustrationUrl } from './upgradePlanIllustrations'

// ─── Plan definitions ────────────────────────────────────────────────────────

type PlanV2 = {
  id: string
  label: string
  name: string
  description: string
  features: string[]
  price: string
}

const DEVELOPER_V2: PlanV2 = {
  id: 'developer-plan',
  label: 'Next step up',
  name: 'Developer',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 CPU/1 GB RAM/8 GB Disk',
    'Smooth performance for small apps',
    'Easy upgrade as you grow',
  ],
  price: '$5/month',
}

const STARTUP_V2: PlanV2 = {
  id: 'startup',
  label: 'Ready to scale',
  name: 'Startup',
  description: 'For growing apps and staging environments',
  features: [
    '2 CPU/4 GB RAM/80 GB disk',
    'Handles increasing traffic and data',
    'Integrations and scaling support',
    'Ideal for staging or early production',
  ],
  price: '$60/month',
}

const BUSINESS_V2: PlanV2 = {
  id: 'business',
  label: 'Production-ready',
  name: 'Business',
  description: 'For critical workloads and live applications',
  features: [
    '2 nodes x (4 CPU/16 GB RAM/120 GB Disk)',
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
  const tierGroups = TIER_GROUPS_BY_TIER[currentTier]
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

  const tierHeaderColumns = tierGroups.length === 2 ? '1fr 2fr' : '1fr'
  const planCardColumns = `repeat(${allPlans.length}, 1fr)`

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Quick upgrade"
      subtitle="Recommended options based on your current plan and region. You can scale up or down later anytime."
      primaryAction={{ text: 'Upgrade', onClick: handleUpgrade }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      {/* Hide DS Card checkbox indicators */}
      <style>{`
        .upgrade-v2-cards label > div:first-child > *:last-child { display: none !important; }
      `}</style>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Box style={{ display: 'grid', gridTemplateColumns: tierHeaderColumns, gap: 24 }}>
          {tierGroups.map((group) => (
            <TierHeader key={group.label} group={group} />
          ))}
        </Box>

        <Box
          className="upgrade-v2-cards"
          style={{ display: 'grid', gridTemplateColumns: planCardColumns, gap: 24 }}
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
              chips={plan.label ? [{ text: plan.label, status: 'neutral' as const }] : []}
              title={
                <Card.Title>
                  <Typography.DefaultStrong color="intense">{plan.name}</Typography.DefaultStrong>
                </Card.Title>
              }
            >
              {/* height: 100% fills the Card's flex-auto children wrapper */}
              <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Top: description + features — grows to fill available space */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
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

        <FullConfigurationCard onClick={onCustomize} />
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
              justifyContent: 'flex-start',
              gap: 12,
              width: '100%',
            }}
          >
            <Box
              aria-hidden
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                borderRadius: 8,
                backgroundColor: 'var(--aquarium-background-color-muted)',
              }}
            >
              <Icon icon={settingsIcon} color="muted" style={{ width: 32, height: 32 }} />
            </Box>
            <Box style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <Typography.Default color="primary-default">Full configuration</Typography.Default>
              <Typography.Small color="muted">Region, cloud and plan selection</Typography.Small>
            </Box>
          </Box>
        </Card.Title>
      }
    />
  )
}

// ─── Tier header ─────────────────────────────────────────────────────────────

function TierHeader({ group }: { group: TierGroup }) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 16px',
        borderRadius: 999,
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      <Typography.CodeSmall htmlTag="span" color="default">
        {group.label}
      </Typography.CodeSmall>
    </Box>
  )
}

// Re-export the shared plan service data so App.tsx can use the same mapping
export { UPGRADE_PLAN_SERVICE_DATA }
