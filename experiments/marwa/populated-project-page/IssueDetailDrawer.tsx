'use client'

import { Box, Divider, Drawer, StatusChip, Typography } from '@aivenio/aquarium'
import { ServiceIcon } from '@/components/ServiceIcon'
import type { AttentionRow } from './deriveLhf'
import type { ServiceStatus } from './fixtures/onlineStoreProd'

const SERVICE_STATUS: Record<ServiceStatus, { text: string; status: 'success' | 'warning' | 'neutral' }> = {
  running: { text: 'running', status: 'success' },
  rebuilding: { text: 'rebuilding', status: 'warning' },
  poweroff: { text: 'powered off', status: 'neutral' },
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Typography.SmallStrong color="intense">{title}</Typography.SmallStrong>
      {children}
    </Box>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
      <Typography.Small color="muted">{label}</Typography.Small>
      {typeof value === 'string' ? <Typography.SmallStrong>{value}</Typography.SmallStrong> : value}
    </Box>
  )
}

function IssueDetail({ issue }: { issue: AttentionRow }) {
  const service = issue.service

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <StatusChip dense status={issue.severity} text={issue.severityLabel} />
        <Typography.Small color="muted">started {issue.started}</Typography.Small>
      </Box>

      <Divider />

      <DrawerSection title="Affected service">
        {service ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ServiceIcon serviceTypeId={service.type} size={32} alt="" />
              <Box>
                <Typography.SmallStrong>{service.name}</Typography.SmallStrong>
                <Typography.Small color="muted">{service.typeLabel}</Typography.Small>
              </Box>
            </Box>
            <Fact
              label="status"
              value={<StatusChip dense {...SERVICE_STATUS[service.status]} />}
            />
            <Fact label="plan" value={service.plan} />
            <Fact label="system" value={issue.systemNames} />
            <Fact label="environment" value={service.environment} />
          </Box>
        ) : (
          <Typography.Small color="muted">
            {issue.serviceNames} — outside the current scope
          </Typography.Small>
        )}
      </DrawerSection>

      <Divider />

      <DrawerSection title="Impact">
        <Typography.Small color="muted">{issue.impact}</Typography.Small>
      </DrawerSection>

      <DrawerSection title="What to do next">
        <Typography.Small color="muted">{issue.nextStep}</Typography.Small>
      </DrawerSection>
    </Box>
  )
}

export function IssueDetailDrawer({ issue, onClose }: { issue: AttentionRow | null; onClose: () => void }) {
  return (
    <Drawer
      open={issue !== null}
      onClose={onClose}
      size="md"
      title={issue?.title ?? 'Issue details'}
      primaryAction={{ text: 'Open service', onClick: onClose }}
      secondaryActions={[{ text: 'View logs', onClick: () => undefined }]}
    >
      {issue ? <IssueDetail issue={issue} /> : null}
    </Drawer>
  )
}

IssueDetailDrawer.displayName = 'IssueDetailDrawer'
IssueDetail.displayName = 'IssueDetail'
DrawerSection.displayName = 'DrawerSection'
Fact.displayName = 'Fact'
