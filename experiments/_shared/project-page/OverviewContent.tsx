'use client'

import {
  Box,
  Button,
  Card,
  DataTable,
  Icon,
  Link,
  Section,
  Typography,
} from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import heartIcon from '@aivenio/aquarium/icons/heart'
import warningSignIcon from '@aivenio/aquarium/icons/warningSign'
import lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import dataflow01Icon from '@aivenio/aquarium/icons/dataflow01'
import { useProjectPageData } from './ProjectPageDataContext'
import type { MetricTone } from './types'

const METRIC_ICON_TONE: Record<
  MetricTone,
  { icon: IconifyIcon; iconColor: string; iconBg: string }
> = {
  primary: {
    icon: applicationsIcon,
    iconColor: 'var(--aquarium-text-color-primary-graphic)',
    iconBg: 'var(--aquarium-background-color-primary-muted)',
  },
  success: {
    icon: heartIcon,
    iconColor: 'var(--aquarium-text-color-success-intense)',
    iconBg: 'var(--aquarium-background-color-success-muted)',
  },
  warning: {
    icon: warningSignIcon,
    iconColor: 'var(--aquarium-text-color-warning-intense)',
    iconBg: 'var(--aquarium-background-color-warning-muted)',
  },
}

type MetricCardProps = {
  label: string
  value: number
  detail: string
  tone: MetricTone
}

function MetricCard({ label, value, detail, tone }: MetricCardProps) {
  const { icon, iconColor, iconBg } = METRIC_ICON_TONE[tone]
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        padding: 24,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Box style={{ minWidth: 0 }}>
          <Box style={{ color: 'var(--aquarium-text-color-muted)', marginBottom: 8 }}>
            <Typography.Small>{label}</Typography.Small>
          </Box>
          <Typography.LargeHeading>{value}</Typography.LargeHeading>
          <Box style={{ color: 'var(--aquarium-text-color-muted)', marginTop: 4 }}>
            <Typography.Small>{detail}</Typography.Small>
          </Box>
        </Box>
        <Box
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon={icon} style={{ width: 20, height: 20, color: iconColor }} />
        </Box>
      </Box>
    </Box>
  )
}

MetricCard.displayName = 'MetricCard'

function ArchitectureMiniMap({ isEmpty }: { isEmpty: boolean }) {
  if (isEmpty) {
    return (
      <Box
        aria-hidden
        style={{
          position: 'relative',
          height: 120,
          borderRadius: 8,
          backgroundColor: 'var(--aquarium-background-color-muted)',
          border: '1px solid var(--aquarium-border-color-muted)',
          overflow: 'hidden',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <Box style={{ color: 'var(--aquarium-text-color-muted)', textAlign: 'center' }}>
          <Typography.Caption>No connected systems yet</Typography.Caption>
        </Box>
      </Box>
    )
  }

  const nodes = [
    { label: 'PG', top: 16, left: 24 },
    { label: 'Kafka', top: 16, left: 120 },
    { label: 'CH', top: 72, left: 72 },
    { label: 'App', top: 72, left: 160 },
  ]

  return (
    <Box
      aria-hidden
      style={{
        position: 'relative',
        height: 120,
        borderRadius: 8,
        backgroundColor: 'var(--aquarium-background-color-muted)',
        border: '1px solid var(--aquarium-border-color-muted)',
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: 40,
          left: 48,
          width: 100,
          height: 2,
          backgroundColor: 'var(--aquarium-border-color-primary-default)',
          opacity: 0.5,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: 48,
          left: 100,
          width: 2,
          height: 40,
          backgroundColor: 'var(--aquarium-border-color-primary-default)',
          opacity: 0.5,
        }}
      />
      {nodes.map((node) => (
        <Box
          key={node.label}
          style={{
            position: 'absolute',
            top: node.top,
            left: node.left,
            minWidth: 48,
            height: 28,
            paddingInline: 8,
            borderRadius: 6,
            backgroundColor: 'var(--aquarium-background-color-layer)',
            border: '1px solid var(--aquarium-border-color-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography.Caption>{node.label}</Typography.Caption>
        </Box>
      ))}
    </Box>
  )
}

ArchitectureMiniMap.displayName = 'ArchitectureMiniMap'

export function OverviewContent() {
  const noop = () => {}
  const {
    metrics,
    attentionIssues,
    architecture,
    solutions,
    recentActivity,
    ctaBanner,
  } = useProjectPageData()
  const architectureEmpty = architecture.connectedSystems === 0

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI row */}
      <Box style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={metric.tone}
          />
        ))}
      </Box>

      {/* Needs attention */}
      <Section
        title="Needs attention"
        actions={{ text: 'View all issues', onClick: noop }}
      >
        <Box style={{ color: 'var(--aquarium-text-color-muted)', marginBottom: 16 }}>
          <Typography.Small>Project-level issues, ordered by their impact.</Typography.Small>
        </Box>
        <DataTable
          ariaLabel="Needs attention"
          rows={attentionIssues}
          columns={[
            {
              type: 'custom',
              headerName: 'Issue',
              UNSAFE_render: (row) => (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Box
                    aria-label={row.severity}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundColor:
                        row.severity === 'critical'
                          ? 'var(--aquarium-background-color-danger-graphic)'
                          : row.severity === 'warning'
                            ? 'var(--aquarium-background-color-warning-graphic)'
                            : 'var(--aquarium-text-color-muted)',
                    }}
                  />
                  <Typography.DefaultStrong>{row.issue}</Typography.DefaultStrong>
                </Box>
              ),
            },
            {
              type: 'custom',
              headerName: 'Affected resources',
              UNSAFE_render: (row) => (
                <Typography.Default>{row.affectedResources}</Typography.Default>
              ),
            },
            {
              type: 'custom',
              headerName: 'Impact',
              UNSAFE_render: (row) => <Typography.Default>{row.impact}</Typography.Default>,
            },
            {
              type: 'custom',
              headerName: 'Started',
              UNSAFE_render: (row) => (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    color: 'var(--aquarium-text-color-muted)',
                  }}
                >
                  <Typography.Small>{row.started}</Typography.Small>
                  <Icon
                    icon={chevronRightIcon}
                    style={{ width: 16, height: 16, color: 'var(--aquarium-text-color-muted)' }}
                  />
                </Box>
              ),
            },
          ]}
        />
      </Section>

      {/* Architecture + Solutions */}
      <Box style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Card
            fullWidth
            title={
              <Card.Title>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon icon={dataflow01Icon} style={{ width: 20, height: 20 }} />
                  <Typography.DefaultStrong>Architecture</Typography.DefaultStrong>
                </Box>
              </Card.Title>
            }
            primaryAction={{ text: 'Explore architecture', onClick: noop }}
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Typography.Small color="muted">{architecture.description}</Typography.Small>
              <ArchitectureMiniMap isEmpty={architectureEmpty} />
              <Typography.DefaultStrong>
                {architecture.connectedSystems} connected systems
              </Typography.DefaultStrong>
              <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                <Typography.Small>
                  {architecture.connections} connections · {architecture.unconnected} unconnected
                </Typography.Small>
              </Box>
            </Box>
          </Card>
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Section
            title="Solutions"
            actions={{ text: 'View all solutions', onClick: noop }}
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {solutions.map((solution) => (
                <Card
                  key={solution.id}
                  fullWidth
                  chips={[{ text: solution.status, status: 'success' }]}
                  title={
                    <Card.Title>
                      <Typography.DefaultStrong>{solution.name}</Typography.DefaultStrong>
                    </Card.Title>
                  }
                >
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Typography.Small color="muted">{solution.description}</Typography.Small>
                    <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                      <Typography.Small>Storage · {solution.storage}</Typography.Small>
                    </Box>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    >
                      Open solution
                    </Link>
                  </Box>
                </Card>
              ))}
            </Box>
          </Section>
        </Box>
      </Box>

      {/* Recent activity */}
      <Section title="Recent project activity">
        <Box style={{ color: 'var(--aquarium-text-color-muted)', marginBottom: 16 }}>
          <Typography.Small>Changes across services, applications and agents.</Typography.Small>
        </Box>
        <DataTable
          ariaLabel="Recent project activity"
          rows={recentActivity}
          columns={[
            {
              type: 'custom',
              headerName: 'Change',
              UNSAFE_render: (row) => (
                <Typography.DefaultStrong>{row.change}</Typography.DefaultStrong>
              ),
            },
            {
              type: 'custom',
              headerName: 'Resource',
              UNSAFE_render: (row) => <Typography.Default>{row.resource}</Typography.Default>,
            },
            {
              type: 'custom',
              headerName: 'Actor',
              UNSAFE_render: (row) => <Typography.Default>{row.actor}</Typography.Default>,
            },
            {
              type: 'custom',
              headerName: 'When',
              UNSAFE_render: (row) => (
                <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                  <Typography.Small>{row.when}</Typography.Small>
                </Box>
              ),
            },
          ]}
        />
      </Section>

      {/* Bottom CTA — composed callout; Banner horizontal splits title/body awkwardly */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          padding: 24,
          borderRadius: 8,
          border: '1px solid var(--aquarium-border-color-info-muted)',
          backgroundColor: 'var(--aquarium-background-color-info-muted)',
        }}
      >
        <Box
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: 'var(--aquarium-background-color-layer)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            icon={lightbulbIcon}
            style={{
              width: 20,
              height: 20,
              color: 'var(--aquarium-text-color-info-intense)',
            }}
          />
        </Box>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, flex: 1 }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography.DefaultStrong>{ctaBanner.title}</Typography.DefaultStrong>
            <Typography.Default color="muted">{ctaBanner.description}</Typography.Default>
          </Box>
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ctaBanner.actions.map((action) => (
              <Button.Secondary key={action.id} type="button" onClick={noop}>
                {action.label}
              </Button.Secondary>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

OverviewContent.displayName = 'OverviewContent'
