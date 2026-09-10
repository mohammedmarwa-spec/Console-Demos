'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  DataTable,
  Link,
  PageHeader,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import { ProjectSidebar } from '@/components/ProjectSidebar'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { NodesCountChip } from '@/components/NodesCountChip'
import type { ServiceRow } from '@/screens/ProjectServices'
import { DEMO_SERVICES } from './demoServices'
import { OpenSearchServiceShell } from './OpenSearchServiceShell'
import type { OpenSearchNavId } from './OpenSearchServiceSidebar'
import { NodesChipTrigger } from './NodesPopover'
import { UpgradeServiceModalV2 } from '@/screens/UpgradeServiceModalV2'
import { UPGRADE_PLAN_SERVICE_DATA, type UpgradeTier } from '@/screens/UpgradeServiceModal'

// ─── Console shell constants (self-contained; no scenario runtime dependency) ──

export const ORG_NAME = 'My Organization'
export const ORG_SUBLABEL = 'Organization'
export const USER_INITIALS = 'MB'
const PROJECT_NAME = 'quick-upgrade-demo'

/** Quick-upgrade shortcuts for this scenario: Developer + Hobbyist on AWS and GCP. */
const UPGRADE_PLAN_VARIANT = 'dual-hobbyist-clouds' as const

// ─── Tier helpers ──────────────────────────────────────────────────────────────

function isUpgradeableTier(planName: string): boolean {
  const plan = planName.toLowerCase()
  return plan.startsWith('free') || plan.startsWith('developer')
}

/** Mirrors the production tier derivation used in PlaygroundStateContext. */
function tierFromPlanName(planName: string): UpgradeTier {
  return planName.toLowerCase().startsWith('free') ? 'free' : 'developer'
}

function planTone(planName: string): 'success' | 'info' | 'neutral' {
  const plan = planName.toLowerCase()
  if (plan.startsWith('free')) return 'neutral'
  if (plan.startsWith('developer')) return 'info'
  return 'success'
}

// ─── Main content ────────────────────────────────────────────────────────────

export function ProjectListContent() {
  const [services, setServices] = useState<ServiceRow[]>(() => [...DEMO_SERVICES])
  const [upgradeServiceId, setUpgradeServiceId] = useState<string | null>(null)
  const [lastUpgradedName, setLastUpgradedName] = useState<string | null>(null)
  const [nodeViewServiceId, setNodeViewServiceId] = useState<string | null>(null)
  const [nodeViewInitialNav, setNodeViewInitialNav] = useState<OpenSearchNavId>('overview')

  const upgradeService = upgradeServiceId
    ? services.find((service) => service.id === upgradeServiceId) ?? null
    : null

  const nodeViewService = nodeViewServiceId
    ? services.find((service) => service.id === nodeViewServiceId) ?? null
    : null

  const eligibleServices = useMemo(
    () => services.filter((service) => isUpgradeableTier(service.planName)),
    [services],
  )

  function openUpgrade(serviceId: string) {
    setLastUpgradedName(null)
    setUpgradeServiceId(serviceId)
  }

  /** Drill into a service's OpenSearch shell. `nav` lands on Overview or Cluster overview. */
  function openNodeView(serviceId: string, nav: OpenSearchNavId = 'overview') {
    setNodeViewInitialNav(nav)
    setNodeViewServiceId(serviceId)
  }

  /** Keep the existing price/plan calculation logic from UPGRADE_PLAN_SERVICE_DATA. */
  function handleUpgrade(planId: string) {
    const planData = UPGRADE_PLAN_SERVICE_DATA[planId]
    if (planData && upgradeServiceId) {
      setServices((prev) =>
        prev.map((service) =>
          service.id === upgradeServiceId
            ? {
                ...service,
                planName: planData.planName,
                planDetails: planData.planDetails,
                nodeCount: planData.nodeCount,
                nodes: `Nodes ${planData.nodeCount}`,
                cpuCount: planData.cpuCount,
                ramCapacity: planData.ramCapacity,
                storageCapacity: planData.storageCapacity,
              }
            : service,
        ),
      )
      setLastUpgradedName(planData.planName)
    }
    setUpgradeServiceId(null)
  }

  if (nodeViewService) {
    return (
      <OpenSearchServiceShell
        service={nodeViewService}
        onBack={() => setNodeViewServiceId(null)}
        initialNav={nodeViewInitialNav}
      />
    )
  }

  return (
    <Box style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <ProjectSidebar projectName={PROJECT_NAME} activeItem="services" />

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: 24,
          overflow: 'auto',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <Box style={{ marginBottom: 24 }}>
          <PageHeader
            title="Services"
            breadcrumbs={[
              <Breadcrumbs.Crumb key="org" href="#" onClick={(event) => event.preventDefault()}>
                {ORG_NAME}
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="projects" href="#" onClick={(event) => event.preventDefault()}>
                Projects
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="project">{PROJECT_NAME}</Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="page">Services</Breadcrumbs.Crumb>,
            ]}
            primaryAction={{ text: 'Create service', onClick: () => undefined }}
          />
        </Box>

        {lastUpgradedName ? (
          <Box style={{ marginBottom: 16 }}>
            <UpgradeSuccessBanner planName={lastUpgradedName} onDismiss={() => setLastUpgradedName(null)} />
          </Box>
        ) : null}

        <Box style={{ marginBottom: 24 }}>
          <UpgradeEligibilityBanner
            eligibleCount={eligibleServices.length}
            totalCount={services.length}
            onReview={() => {
              const first = eligibleServices[0]
              if (first) openUpgrade(first.id)
            }}
          />
        </Box>

        <ServicesTable services={services} onPlanAction={openUpgrade} onOpenService={openNodeView} />
      </Box>

      <UpgradeServiceModalV2
        open={upgradeService !== null}
        onClose={() => setUpgradeServiceId(null)}
        currentTier={upgradeService ? tierFromPlanName(upgradeService.planName) : 'developer'}
        planVariant={UPGRADE_PLAN_VARIANT}
        onUpgrade={handleUpgrade}
        onCustomize={() => setUpgradeServiceId(null)}
      />
    </Box>
  )
}

ProjectListContent.displayName = 'ProjectListContent'

// ─── Upgrade eligibility banner (prototype design surface for this experiment) ──

function UpgradeEligibilityBanner({
  eligibleCount,
  totalCount,
  onReview,
}: {
  eligibleCount: number
  totalCount: number
  onReview: () => void
}) {
  const allUpgraded = eligibleCount === 0

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        padding: '16px 20px',
        borderRadius: 'var(--aquarium-border-radius-default)',
        border: '1px solid var(--aquarium-border-color-primary-muted)',
        backgroundColor: 'var(--aquarium-background-color-primary-muted)',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.DefaultStrong color="intense">Quick upgrade</Typography.DefaultStrong>
          <StatusChip
            dense
            text={allUpgraded ? 'all upgraded' : `${eligibleCount} of ${totalCount} eligible`}
            status={allUpgraded ? 'success' : 'info'}
          />
        </Box>
        <Typography.Small color="muted">
          {allUpgraded
            ? 'Every service in this project is on a paid plan.'
            : 'Free and Developer services can move to a Hobbyist plan on AWS or GCP in a couple of clicks. Trial credits cover the upgrade.'}
        </Typography.Small>
      </Box>
      {!allUpgraded ? (
        <Box style={{ flexShrink: 0 }}>
          <Button type="button" onClick={onReview}>
            Review upgrades
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}

UpgradeEligibilityBanner.displayName = 'UpgradeEligibilityBanner'

// ─── Upgrade success banner ────────────────────────────────────────────────────

function UpgradeSuccessBanner({ planName, onDismiss }: { planName: string; onDismiss: () => void }) {
  return (
    <Box
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 16px',
        borderRadius: 'var(--aquarium-border-radius-default)',
        border: '1px solid var(--aquarium-border-color-success-default)',
        backgroundColor: 'var(--aquarium-background-color-success-muted)',
      }}
    >
      <Typography.Small color="intense">
        Service upgraded to the {planName} plan. Changes apply immediately.
      </Typography.Small>
      <Box style={{ flexShrink: 0 }}>
        <Button.Ghost dense type="button" onClick={onDismiss}>
          Dismiss
        </Button.Ghost>
      </Box>
    </Box>
  )
}

UpgradeSuccessBanner.displayName = 'UpgradeSuccessBanner'

// ─── Services table ────────────────────────────────────────────────────────────

function ServicesTable({
  services,
  onPlanAction,
  onOpenService,
}: {
  services: ServiceRow[]
  onPlanAction: (serviceId: string) => void
  onOpenService: (serviceId: string, nav?: OpenSearchNavId) => void
}) {
  return (
    <DataTable
      ariaLabel="Services"
      rows={services}
      sticky={false}
      columns={[
        {
          type: 'custom',
          headerName: 'Service',
          UNSAFE_render: (row) => {
            const hasNodeView = row.serviceTypeId === 'opensearch'
            return (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Box style={{ flexShrink: 0 }}>
                <ServiceIcon serviceTypeId={row.serviceTypeId} size={32} alt="" />
              </Box>
              <Box style={{ minWidth: 0 }}>
                <Typography.Default>
                  <Link
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      if (hasNodeView) onOpenService(row.id)
                    }}
                  >
                    {row.serviceName}
                  </Link>
                </Typography.Default>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Typography.Caption color="muted">{row.serviceType}</Typography.Caption>
                  <ServiceStatusChip status={row.status ?? 'Running'} />
                </Box>
              </Box>
            </Box>
            )
          },
        },
        {
          type: 'custom',
          headerName: 'Nodes',
          UNSAFE_render: (row) => {
            if (!row.nodeCount) return null
            if (row.serviceTypeId === 'opensearch') {
              return (
                <NodesChipTrigger
                  service={row}
                  onViewAll={() => onOpenService(row.id, 'cluster-overview')}
                />
              )
            }
            return <NodesCountChip count={row.nodeCount} serviceStatus={row.status ?? 'Running'} />
          },
        },
        {
          type: 'custom',
          headerName: 'Plan',
          UNSAFE_render: (row) => <PlanCell row={row} onPlanAction={onPlanAction} />,
        },
        {
          type: 'item',
          headerName: 'Cloud',
          item: (row) => ({
            title: (
              <Box component="span" style={{ color: 'var(--aquarium-text-color-muted)' }}>
                {row.cloudRegion}
              </Box>
            ),
            caption: (
              <Box component="span" style={{ color: 'var(--aquarium-text-color-muted)' }}>
                {row.location}
              </Box>
            ),
          }),
        },
        {
          field: 'created',
          headerName: 'Created',
          type: 'text',
        },
      ]}
    />
  )
}

ServicesTable.displayName = 'ServicesTable'

function PlanCell({
  row,
  onPlanAction,
}: {
  row: ServiceRow
  onPlanAction: (serviceId: string) => void
}) {
  const upgradeable = isUpgradeableTier(row.planName)

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Typography.DefaultStrong color="intense">{row.planName}</Typography.DefaultStrong>
        <StatusChip dense text={row.planName.toLowerCase()} status={planTone(row.planName)} />
      </Box>
      <Typography.Small color="muted">{row.planDetails}</Typography.Small>
      <Box>
        <Button.Ghost dense type="button" onClick={() => onPlanAction(row.id)}>
          {upgradeable ? 'Upgrade' : 'Change'}
        </Button.Ghost>
      </Box>
    </Box>
  )
}

PlanCell.displayName = 'PlanCell'
