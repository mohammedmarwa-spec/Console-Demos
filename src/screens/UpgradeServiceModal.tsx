import { useEffect, useState } from 'react'
import { Box, Card, Icon, Modal, Switch, Typography, type IconProps } from '@aivenio/aquarium'
import deliveryLocationIcon from '@aivenio/aquarium/icons/deliveryLocation'
import awardIcon from '@aivenio/aquarium/icons/award'

export type UpgradeTier = 'free' | 'developer'

export type UpgradePlanServiceData = {
  planName: string
  planDetails: string
  nodeCount: number
  cpuCount: number
  ramCapacity: string
  storageCapacity: string
}

/** Maps modal plan IDs → service row fields so callers can update state after upgrade. */
export const UPGRADE_PLAN_SERVICE_DATA: Record<string, UpgradePlanServiceData> = {
  'developer-plan': {
    planName: 'Developer',
    planDetails: '1 CPU / 1 GB RAM / 8 GB storage',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '1 GB',
    storageCapacity: '8 GB',
  },
  hobbyist: {
    planName: 'Hobbyist',
    planDetails: '1 CPU / 2 GB RAM / 8 GB storage',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '2 GB',
    storageCapacity: '8 GB',
  },
  'hobbyist-aws': {
    planName: 'Hobbyist',
    planDetails: '1 CPU / 2 GB RAM / 8 GB storage · AWS eu-west-1',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '2 GB',
    storageCapacity: '8 GB',
  },
  'hobbyist-gcp': {
    planName: 'Hobbyist',
    planDetails: '1 CPU / 2 GB RAM / 8 GB storage · GCP europe-west-1',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '2 GB',
    storageCapacity: '8 GB',
  },
  startup: {
    planName: 'Startup',
    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',
    nodeCount: 1,
    cpuCount: 2,
    ramCapacity: '4 GB',
    storageCapacity: '80 GB',
  },
  'startup-4': {
    planName: 'Startup-4',
    planDetails: '1 CPU / 4 GB RAM / 80 GB storage',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '4 GB',
    storageCapacity: '80 GB',
  },
  business: {
    planName: 'Business',
    planDetails: '4 CPU / 16 GB RAM / 120 GB storage',
    nodeCount: 1,
    cpuCount: 4,
    ramCapacity: '16 GB',
    storageCapacity: '120 GB',
  },
}

type UpgradePlan = {
  id: string
  label: string
  badgeText?: string
  badgeIcon?: IconProps['icon']
  name: string
  description: string
  features: string[]
  price: string
}

const HOBBYIST: UpgradePlan = {
  id: 'hobbyist',
  label: 'Next step up',
  name: 'Hobbyist',
  description: 'For learning, side projects, and small workloads',
  features: [
    '1 CPU/1 GB RAM/8 GB Disk',
    'Smooth performance for small apps',
    'Enough resources for testing and development',
    'Easy upgrade as you grow',
  ],
  price: '$12/month',
}

const DEVELOPER_PLAN: UpgradePlan = {
  id: 'developer-plan',
  label: 'Next step up',
  name: 'Developer',
  description: 'A cost-effective option for test and personal projects',
  features: [
    '1 CPU/1 GB RAM/8 GB storage',
    "Inactive services aren't powered off",
    'Basic support tier',
  ],
  price: '$5/month',
}

const STARTUP: UpgradePlan = {
  id: 'startup',
  label: 'Ready to scale',
  badgeText: 'Most popular',
  badgeIcon: awardIcon,
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

const BUSINESS: UpgradePlan = {
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

const PLANS_BY_TIER: Record<UpgradeTier, UpgradePlan[]> = {
  free: [DEVELOPER_PLAN, STARTUP, BUSINESS],
  developer: [HOBBYIST, STARTUP, BUSINESS],
}

// Pre-generate hex pattern SVG as a data URL for Card's `image` prop
const HEX_IMAGE_URL = buildHexImageUrl(600, 120)

function buildHexImageUrl(w: number, h: number): string {
  const r = 18
  const hexW = r * Math.sqrt(3)
  const hexH = r * 2
  const cols = Math.ceil(w / hexW) + 2
  const rows = Math.ceil(h / (hexH * 0.75)) + 2

  let polygons = ''
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * hexW + (row % 2 === 0 ? 0 : hexW / 2)
      const cy = row * hexH * 0.75
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30)
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
      }).join(' ')
      polygons += `<polygon points="${pts}" fill="none" stroke="#b8c2ec" stroke-width="1"/>`
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#eef1fb"/>${polygons}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

type UpgradeServiceModalProps = {
  open: boolean
  onClose: () => void
  currentTier: UpgradeTier
  /** Called when user clicks "Upgrade to [plan]" */
  onUpgrade: (planId: string) => void
  /** Called when "Customize configuration" toggle is turned on */
  onCustomize: () => void
  /**
   * Increment this counter to reset the customize toggle back to off
   * (e.g. when the user cancels out of the full edit modal).
   */
  customizeResetKey?: number
}

export function UpgradeServiceModal({
  open,
  onClose,
  currentTier,
  onUpgrade,
  onCustomize,
  customizeResetKey = 0,
}: UpgradeServiceModalProps) {
  const plans = PLANS_BY_TIER[currentTier]
  const defaultPlanId = plans[0].id

  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId)
  const [customize, setCustomize] = useState(false)

  // Reset selection to first card and toggle to off every time the modal opens
  useEffect(() => {
    if (open) {
      setSelectedPlanId(PLANS_BY_TIER[currentTier][0].id)
      setCustomize(false)
    }
  }, [open, currentTier])

  // Reset the customize toggle when the caller signals (e.g. user cancels the edit modal)
  useEffect(() => {
    if (customizeResetKey > 0) setCustomize(false)
  }, [customizeResetKey])

  function handleToggleCustomize(checked: boolean) {
    setCustomize(checked)
    if (checked) onCustomize()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Quick upgrade"
      subtitle="Recommended options based on your current plan and region. You can scale up or down later anytime."
      primaryAction={{
        text: 'Upgrade',
        onClick: () => onUpgrade(selectedPlanId),
      }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      {/*
       * Hide the DS Card checkbox indicator — selection is communicated by border only.
       * CardInputWrapper renders chips (col 1fr) + checkbox (col auto) in a grid;
       * the last child of that first-child grid is always the Checkbox element.
       */}
      <style>{`
        .upgrade-plan-cards label > div:first-child > *:last-child { display: none !important; }
      `}</style>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Region notice */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Icon in a soft square container */}
          <Box
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: 'var(--aquarium-background-color-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon={deliveryLocationIcon} color="primary-default" />
          </Box>

          {/* Two-line text */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography.SmallStrong>🇫🇮 Finland, Europe</Typography.SmallStrong>
            <Typography.Caption color="muted">
              Closest available region for lower latency
            </Typography.Caption>
          </Box>
        </Box>

        {/* Plan cards */}
        <Box
          className="upgrade-plan-cards"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
        >
          {plans.map((plan) => (
            <Card
              key={plan.id}
              fullWidth
              checkable
              value={plan.id}
              checked={selectedPlanId === plan.id}
              onCheckedChange={({ value }) => setSelectedPlanId(value)}
              image={HEX_IMAGE_URL}
              imageAlt=""
              imageHeight={120}
              chips={[
                { text: plan.label, status: 'neutral' as const },
                ...(plan.badgeText
                  ? [{ text: plan.badgeText, status: 'success' as const, icon: plan.badgeIcon }]
                  : []),
              ]}
              title={
                <Card.Title>
                  <Typography.DefaultStrong color="intense">{plan.name}</Typography.DefaultStrong>
                </Card.Title>
              }
            >
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography.Caption color="default">
                  {plan.description}
                </Typography.Caption>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {plan.features.map((feat) => (
                    <Box key={feat} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span
                        style={{
                          color: '#4a4b57',
                          fontSize: 12,
                          lineHeight: '18px',
                          flexShrink: 0,
                        }}
                      >
                        •
                      </span>
                      <Typography.Caption color="default">{feat}</Typography.Caption>
                    </Box>
                  ))}
                </Box>

                <Box style={{ paddingTop: 8 }}>
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
          Customize region, storage, and plan details for advanced setup needs
        </Switch>
      </Box>
    </Modal>
  )
}

