import { useEffect, useState } from 'react'
import { Box, Card, Icon, Modal, Switch, Typography, type IconProps } from '@aivenio/aquarium'
import codeIcon from '@aivenio/aquarium/icons/code'
import tieredIcon from '@aivenio/aquarium/icons/tiered'
import { ServiceRegionPicker } from './ServiceRegionPicker'
import { REGIONS_BY_CLOUD } from './serviceRegions'

/** Single implicit cloud for region list in Quick upgrade V2 (no provider picker). */
const REGION_CLOUD = 'aws' as const
import { UPGRADE_PLAN_SERVICE_DATA, type UpgradeTier } from './UpgradeServiceModal'

// ─── Plan definitions ────────────────────────────────────────────────────────

type PlanV2 = {
  id: string
  label: string
  name: string
  description: string
  features: string[]
  price: string
  hasRegionSelector: boolean
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
    'No region selection',
  ],
  price: '$5/month',
  hasRegionSelector: false,
}

const HOBBYIST_V2: PlanV2 = {
  id: 'hobbyist',
  label: 'Next step up',
  name: 'Hobbyist',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 CPU/1 GB RAM/8 GB Disk',
    'Smooth performance for small apps',
    'Easy upgrade as you grow',
    'No region selection',
  ],
  price: '$12/month',
  hasRegionSelector: false,
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
  hasRegionSelector: true,
}

const BUSINESS_V2: PlanV2 = {
  id: 'business',
  label: 'Production-ready',
  name: 'Business',
  description: 'For critical workloads and live applications',
  features: [
    '4 CPU/16 GB RAM/120 GB Disk',
    'High availability and failover support',
    'Automated backups and replication',
    'Standby node for reliability and failover',
  ],
  price: '$180/month',
  hasRegionSelector: true,
}

// ─── Tier groups ─────────────────────────────────────────────────────────────

type TierGroup = {
  label: string
  icon: IconProps['icon']
  plans: PlanV2[]
}

const TIER_GROUPS_BY_TIER: Record<UpgradeTier, TierGroup[]> = {
  free: [
    { label: 'Hobby tier',        icon: codeIcon,   plans: [DEVELOPER_V2] },
    { label: 'Professional tier', icon: tieredIcon, plans: [STARTUP_V2, BUSINESS_V2] },
  ],
  developer: [
    { label: 'Hobby tier',        icon: codeIcon,   plans: [HOBBYIST_V2] },
    { label: 'Professional tier', icon: tieredIcon, plans: [STARTUP_V2, BUSINESS_V2] },
  ],
}

// ─── Per-plan illustrations ───────────────────────────────────────────────────
// Composite SVGs: #f3f6ff background + Figma icon, scaled+clipped to 285×100

const PLAN_IMAGE_URLS: Record<string, string> = {
  'developer-plan': '/illus-developer.svg',
  hobbyist:         '/illus-developer.svg',
  startup:          '/illus-startup.svg',
  business:         '/illus-business.svg',
}

// ─── Props ───────────────────────────────────────────────────────────────────

type UpgradeServiceModalV2Props = {
  open: boolean
  onClose: () => void
  currentTier: UpgradeTier
  onUpgrade: (planId: string) => void
  onCustomize: () => void
  customizeResetKey?: number
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UpgradeServiceModalV2({
  open,
  onClose,
  currentTier,
  onUpgrade,
  onCustomize,
  customizeResetKey = 0,
}: UpgradeServiceModalV2Props) {
  const tierGroups = TIER_GROUPS_BY_TIER[currentTier]
  const allPlans = tierGroups.flatMap((g) => g.plans)
  const defaultPlanId = allPlans[0].id

  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId)
  const [customize, setCustomize] = useState(false)
  const [regionIdByPlan, setRegionIdByPlan] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setSelectedPlanId(TIER_GROUPS_BY_TIER[currentTier].flatMap((g) => g.plans)[0].id)
      setCustomize(false)
      setRegionIdByPlan({})
    }
  }, [open, currentTier])

  useEffect(() => {
    if (customizeResetKey > 0) setCustomize(false)
  }, [customizeResetKey])

  function handleToggleCustomize(checked: boolean) {
    setCustomize(checked)
    if (checked) onCustomize()
  }

  // Export the plan data via the shared UPGRADE_PLAN_SERVICE_DATA map (same IDs)
  function handleUpgrade() {
    onUpgrade(selectedPlanId)
  }

  function getRegionIdForPlan(planId: string): string {
    const regions = REGIONS_BY_CLOUD[REGION_CLOUD]
    const stored = regionIdByPlan[planId]
    if (stored && regions.some((r) => r.id === stored)) return stored
    return regions[0]?.id ?? ''
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Quick upgrade"
      subtitle="Recommended plans based on your current usage. You can scale up or down later anytime."
      primaryAction={{ text: 'Upgrade', onClick: handleUpgrade }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      {/* Hide DS Card checkbox indicators */}
      <style>{`
        .upgrade-v2-cards label > div:first-child > *:last-child { display: none !important; }
      `}</style>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Tier group headers */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {tierGroups.map((group) => (
            <TierHeader key={group.label} group={group} />
          ))}
        </Box>

        {/* Plan cards — 3-column grid */}
        <Box
          className="upgrade-v2-cards"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
        >
          {allPlans.map((plan) => (
            <Card
              key={plan.id}
              fullWidth
              checkable
              value={plan.id}
              checked={selectedPlanId === plan.id}
              onCheckedChange={({ value }) => setSelectedPlanId(value)}
              image={PLAN_IMAGE_URLS[plan.id] ?? '/illus-developer.svg'}
              imageAlt=""
              imageHeight={100}
              chips={plan.label ? [{ text: plan.label, status: 'neutral' as const }] : []}
              title={<Card.Title color="intense">{plan.name}</Card.Title>}
            >
              {/* height: 100% fills the Card's flex-auto children wrapper */}
              <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Top: description + features — grows to fill available space */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <Typography.Caption color="default">
                    {plan.description}
                  </Typography.Caption>

                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {plan.features.map((feat) => (
                      <Box key={feat} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ color: '#4a4b57', fontSize: 12, lineHeight: '18px', flexShrink: 0 }}>•</span>
                        <Typography.Caption color="default">{feat}</Typography.Caption>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Bottom: region selector + price — anchored to bottom */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
                  {plan.hasRegionSelector && (
                    <ServiceRegionPicker
                      showCloudPicker={false}
                      cloud={REGION_CLOUD}
                      regionId={getRegionIdForPlan(plan.id)}
                      onRegionChange={(rid) =>
                        setRegionIdByPlan((prev) => ({ ...prev, [plan.id]: rid }))
                      }
                      regionsByCloud={REGIONS_BY_CLOUD}
                      maxWidth="100%"
                    />
                  )}
                  <Typography.DefaultStrong color="intense">
                    {plan.price}
                  </Typography.DefaultStrong>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Customize toggle */}
        <Switch
          checked={customize}
          onChange={(e) => handleToggleCustomize(e.target.checked)}
        >
          Full configuration
        </Switch>
      </Box>
    </Modal>
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
        gap: 8,
        padding: '6px 16px',
        borderRadius: 999,
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      <Icon icon={group.icon} color="muted" style={{ flexShrink: 0 }} />
      <Typography.SmallStrong color="default">{group.label}</Typography.SmallStrong>
    </Box>
  )
}

// Re-export the shared plan service data so App.tsx can use the same mapping
export { UPGRADE_PLAN_SERVICE_DATA }
