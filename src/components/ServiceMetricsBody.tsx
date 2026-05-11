import { useId, useMemo, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  ChoiceChip,
  ChoiceChipGroup,
  DropdownMenu,
  Link,
  PageHeader,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import { CompactServiceHeader } from './CompactServiceHeader'
import { getServiceIconUrl } from './ServiceIcon'
import type { ServiceTypeId } from '../screens/ServiceTypeSelectModal'

const PROJECT_NAME = 'UI-TESTS'

type ServiceMetricsBodyProps = {
  serviceName: string
  serviceTypeId?: ServiceTypeId | null
  serviceVersion: string
  nodeCount: number
  onBackToProject?: () => void
  onDeleteService?: () => void
  onOpenAiAssistant?: () => void
  /** Opens the Logs sub-page for this service (same shell). */
  onSeeAllLogs?: () => void
}

type MetricValueTone = 'default' | 'success' | 'warning' | 'danger'

function metricValueColor(tone: MetricValueTone): string {
  if (tone === 'success') return 'var(--aquarium-text-color-success-default)'
  if (tone === 'warning') return 'var(--aquarium-text-color-warning-default)'
  if (tone === 'danger') return 'var(--aquarium-text-color-danger-default)'
  return 'var(--aquarium-text-color-default)'
}

/** Normalized series 0–1 (top of chart = 1). */
function AreaSparkline({
  series,
  strokeVar,
  fillVar,
  thresholdY,
  gradId,
}: {
  series: number[]
  strokeVar: string
  fillVar: string
  thresholdY: number | null
  gradId: string
}) {
  const w = 330
  const h = 56
  const n = Math.max(2, series.length)
  const pts = series.map((v, i) => {
    const x = (i / (n - 1)) * w
    const y = h - 6 - v * (h - 14)
    return { x, y }
  })
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = `M0,${h} ${pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${w},${h} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillVar} stopOpacity="0.45" />
          <stop offset="100%" stopColor={fillVar} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={strokeVar} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {thresholdY != null && (
        <line
          x1={0}
          x2={w}
          y1={thresholdY}
          y2={thresholdY}
          stroke="var(--aquarium-text-color-danger-default)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )}
    </svg>
  )
}

AreaSparkline.displayName = 'AreaSparkline'

function MetricTile({
  title,
  thresholdText,
  value,
  valueTone,
  series,
  strokeVar,
  fillVar,
  thresholdY,
  gradId,
  wide,
}: {
  title: string
  thresholdText?: string
  value: string
  valueTone: MetricValueTone
  series: number[]
  strokeVar: string
  fillVar: string
  thresholdY: number | null
  gradId: string
  wide?: boolean
}) {
  return (
    <Box
      style={{
        gridColumn: wide ? '1 / -1' : undefined,
        padding: 16,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, minHeight: thresholdText ? 44 : 32 }}>
        <Box style={{ minWidth: 0 }}>
          <Typography.DefaultStrong>{title}</Typography.DefaultStrong>
          {thresholdText ? (
            <Box style={{ marginTop: 4 }}>
              <Typography.Caption color="muted">{thresholdText}</Typography.Caption>
            </Box>
          ) : null}
        </Box>
        <Box style={{ color: metricValueColor(valueTone), flexShrink: 0 }}>
          <Typography.LargeStrong>{value}</Typography.LargeStrong>
        </Box>
      </Box>
      <Box style={{ marginTop: 12, flex: 1, minHeight: 56 }}>
        <AreaSparkline
          series={series}
          strokeVar={strokeVar}
          fillVar={fillVar}
          thresholdY={thresholdY}
          gradId={gradId}
        />
      </Box>
    </Box>
  )
}

MetricTile.displayName = 'MetricTile'

const LOG_TIMELINE = [
  {
    time: '2026-03-04T11:21:52Z',
    body: 'FATAL: remaining connection slots are reserved for roles with the SUPERUSER attribute',
  },
  {
    time: '2026-03-04T11:18:10Z',
    body: 'ERROR: connection pool exhausted — rejecting new client (pool_size=100, active=100)',
  },
  {
    time: '2026-03-04T11:05:00Z',
    body: 'WARNING: sustained CPU above 90% for 600s on primary node',
  },
] as const

export function ServiceMetricsBody({
  serviceName,
  serviceTypeId = null,
  serviceVersion,
  nodeCount,
  onBackToProject,
  onDeleteService,
  onOpenAiAssistant,
  onSeeAllLogs,
}: ServiceMetricsBodyProps) {
  const baseId = useId().replace(/:/g, '')
  const nodeGroupName = `${baseId}-node`
  const timeGroupName = `${baseId}-time`
  const [selectedNode, setSelectedNode] = useState('1')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h')

  const nodeOptions = useMemo(
    () => Array.from({ length: Math.max(1, Math.min(nodeCount, 4)) }, (_, i) => String(i + 1)),
    [nodeCount],
  )

  const cpuSeries = useMemo(() => {
    const shift = timeRange === '1h' ? 0.05 : timeRange === '24h' ? -0.04 : 0
    return [0.55, 0.62, 0.58, 0.7, 0.68, 0.72, 0.66, 0.74, 0.7, 0.72].map((v) => Math.min(0.95, v + shift))
  }, [timeRange])

  const seriesPack = useMemo(() => {
    const mem = cpuSeries.map((v) => Math.min(0.92, v * 0.78 + 0.08))
    const disk = cpuSeries.map((v) => Math.min(1, 0.72 + v * 0.38))
    const connErr = cpuSeries.map((v) => 0.15 + v * 0.25)
    const totalConn = cpuSeries.map((v) => 0.62 + v * 0.22)
    const avgMs = cpuSeries.map((v) => 0.22 + v * 0.35)
    const qps = cpuSeries.map((v) => 0.4 + v * 0.45)
    const replag = cpuSeries.map((v) => 0.12 + v * 0.2)
    const slow = cpuSeries.map((v, i) => (i === 6 || i === 8 ? 0.75 : 0.28 + v * 0.15))
    return { mem, disk, connErr, totalConn, avgMs, qps, replag, slow }
  }, [cpuSeries])

  const infoStroke = 'var(--aquarium-text-color-info-graphic)'
  const infoFill = 'var(--aquarium-text-color-info-graphic)'
  const warnStroke = 'var(--aquarium-background-color-warning-graphic)'
  const warnFill = 'var(--aquarium-background-color-warning-graphic)'
  const successStroke = 'var(--aquarium-background-color-success-graphic)'
  const successFill = 'var(--aquarium-background-color-success-graphic)'
  const mutedStroke = 'var(--aquarium-text-color-muted)'
  const mutedFill = 'var(--aquarium-text-color-muted)'

  return (
    <>
      <Box style={{ marginBottom: 24 }}>
        <CompactServiceHeader
          serviceName={serviceName}
          iconUrl={getServiceIconUrl(serviceTypeId ?? null)}
          version={serviceVersion}
          statusText="Running"
          nodeCount={nodeCount}
        />
        <PageHeader
          title=""
          breadcrumbs={[
            <Breadcrumbs.Crumb key="org">
              <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                My Organization
              </Link>
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="projects">
              <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                Projects
              </Link>
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="project">
              <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                {PROJECT_NAME}
              </Link>
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="service">{serviceName}</Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="obs">Observability</Breadcrumbs.Crumb>,
          ]}
          secondaryActions={onOpenAiAssistant ? { text: 'AI assistant', onClick: onOpenAiAssistant } : undefined}
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={(key) => { if (key === 'delete') onDeleteService?.() }}
        />
        <Box style={{ marginTop: 8 }}>
          <Typography.Heading>Observability</Typography.Heading>
        </Box>
      </Box>

      {/* Health hero — Figma node 7:1201 */}
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: 16,
          marginBottom: 24,
          borderRadius: 8,
          border: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
          boxShadow: '0 1px 2px color-mix(in srgb, var(--aquarium-colors-black) 8%, transparent), 0 2px 4px color-mix(in srgb, var(--aquarium-colors-black) 6%, transparent)',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--aquarium-text-color-danger-default) 55%, transparent), var(--aquarium-text-color-danger-default))',
              boxShadow: '0 0 0 8px color-mix(in srgb, var(--aquarium-text-color-danger-default) 18%, transparent)',
            }}
          >
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'color-mix(in srgb, var(--aquarium-text-color-danger-default) 85%, var(--aquarium-colors-white))',
              }}
            />
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Typography.LargeStrong>{serviceName}</Typography.LargeStrong>
            <Box style={{ marginTop: 4 }}>
              <Typography.Small color="muted">
                Service is in critical state | Last checked: 2 min ago
              </Typography.Small>
            </Box>
          </Box>
        </Box>
        <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <ChoiceChipGroup
            name={nodeGroupName}
            selectionMode="radio"
            value={selectedNode}
            onChange={(v) => setSelectedNode(String(v))}
          >
            {nodeOptions.map((id) => (
              <ChoiceChip key={id} value={id}>
                Node {id}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
          <ChoiceChipGroup
            name={timeGroupName}
            selectionMode="radio"
            value={timeRange}
            onChange={(v) => setTimeRange(v as '1h' | '6h' | '24h')}
          >
            <ChoiceChip value="1h">1h</ChoiceChip>
            <ChoiceChip value="6h">6h</ChoiceChip>
            <ChoiceChip value="24h">24h</ChoiceChip>
          </ChoiceChipGroup>
        </Box>
      </Box>

      {/* Split: alerts + logs | metrics — Figma 7:1215 */}
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          gap: 0,
        }}
      >
        <Box
          style={{
            width: '100%',
            maxWidth: 380,
            flex: '1 1 320px',
            paddingRight: 24,
            borderRight: '1px solid var(--aquarium-border-color-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: 40,
            minWidth: 0,
          }}
        >
          <Box>
            <Box style={{ marginBottom: 16 }}>
              <Typography.Heading>Active alerts</Typography.Heading>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Box
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid var(--aquarium-border-color-muted)',
                  backgroundColor: 'var(--aquarium-background-color-layer)',
                }}
              >
                <Typography.DefaultStrong>Connection pool exhausted</Typography.DefaultStrong>
                <Box style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <StatusChip text="Critical" status="danger" dense />
                  <Typography.Caption color="muted">3 min ago · Errors spiked to 47/min</Typography.Caption>
                </Box>
                <Box style={{ marginTop: 12 }}>
                  <Button.Secondary type="button" dense onClick={() => {}}>
                    Upgrade
                  </Button.Secondary>
                </Box>
              </Box>
              <Box
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid var(--aquarium-border-color-muted)',
                  backgroundColor: 'var(--aquarium-background-color-layer)',
                }}
              >
                <Typography.DefaultStrong>CPU usage above 90%</Typography.DefaultStrong>
                <Box style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <StatusChip text="Critical" status="danger" dense />
                  <Typography.Caption color="muted">15 min ago · Sustained at 92% for 10 min</Typography.Caption>
                </Box>
                <Box style={{ marginTop: 12 }}>
                  <Button.Secondary type="button" dense onClick={() => {}}>
                    Upgrade
                  </Button.Secondary>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <Typography.Heading>Recent events (logs)</Typography.Heading>
              <StatusChip text="Live data" status="success" dense />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {LOG_TIMELINE.map((entry, index) => (
                <Box
                  key={entry.time}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '12px 1fr',
                    gap: 12,
                    paddingBottom: index < LOG_TIMELINE.length - 1 ? 16 : 0,
                  }}
                >
                  <Box style={{ position: 'relative', width: 12 }}>
                    <Box
                      style={{
                        position: 'absolute',
                        left: 4,
                        top: 6,
                        bottom: index < LOG_TIMELINE.length - 1 ? -16 : 0,
                        width: 2,
                        backgroundColor: 'var(--aquarium-border-color-muted)',
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        marginTop: 4,
                        backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
                        border: '2px solid var(--aquarium-background-color-layer)',
                        zIndex: 1,
                        position: 'relative',
                      }}
                    />
                  </Box>
                  <Box>
                    <Box style={{ fontFamily: 'ui-monospace, monospace' }}>
                      <Typography.Caption color="muted">{entry.time}</Typography.Caption>
                    </Box>
                    <Box style={{ marginTop: 4 }}>
                      <Typography.Small>{entry.body}</Typography.Small>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box style={{ marginTop: 12 }}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onSeeAllLogs?.()
                }}
              >
                See all
              </Link>
            </Box>
          </Box>
        </Box>

        <Box style={{ flex: '1 1 400px', minWidth: 0, paddingLeft: 24 }}>
          <Box style={{ marginBottom: 16 }}>
            <Typography.Heading>Service metrics</Typography.Heading>
          </Box>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            <MetricTile
              title="CPU usage"
              thresholdText="threshold 90%"
              value="72%"
              valueTone="warning"
              series={cpuSeries}
              strokeVar={infoStroke}
              fillVar={infoFill}
              thresholdY={56 - 6 - 0.9 * (56 - 14)}
              gradId={`${baseId}-cpu`}
            />
            <MetricTile
              title="Memory usage"
              thresholdText="threshold 85%"
              value="58%"
              valueTone="success"
              series={seriesPack.mem}
              strokeVar={warnStroke}
              fillVar={warnFill}
              thresholdY={56 - 6 - 0.85 * (56 - 14)}
              gradId={`${baseId}-mem`}
            />
            <MetricTile
              title="Disk usage"
              thresholdText="threshold 80%"
              value="99.99%"
              valueTone="danger"
              series={seriesPack.disk}
              strokeVar={mutedStroke}
              fillVar={mutedFill}
              thresholdY={56 - 6 - 0.8 * (56 - 14)}
              gradId={`${baseId}-disk`}
            />
            <MetricTile
              title="Connection errors"
              thresholdText="threshold 50/day"
              value="12"
              valueTone="success"
              series={seriesPack.connErr}
              strokeVar="var(--aquarium-text-color-danger-default)"
              fillVar="var(--aquarium-text-color-danger-default)"
              thresholdY={56 - 6 - (12 / 50) * (56 - 14)}
              gradId={`${baseId}-cerr`}
            />
            <MetricTile
              title="Total connections"
              thresholdText="max 100"
              value="84 / 100"
              valueTone="danger"
              series={seriesPack.totalConn}
              strokeVar={infoStroke}
              fillVar={infoFill}
              thresholdY={56 - 6 - 1 * (56 - 14)}
              gradId={`${baseId}-tot`}
            />
            <MetricTile
              title="Avg connection time"
              thresholdText="threshold 10ms"
              value="4.2 ms"
              valueTone="success"
              series={seriesPack.avgMs}
              strokeVar={successStroke}
              fillVar={successFill}
              thresholdY={null}
              gradId={`${baseId}-avg`}
            />
            <MetricTile
              title="Queries / sec"
              value="1,240"
              valueTone="default"
              series={seriesPack.qps}
              strokeVar={infoStroke}
              fillVar={infoFill}
              thresholdY={null}
              gradId={`${baseId}-qps`}
            />
            <MetricTile
              title="Replication lag"
              thresholdText="threshold 5s"
              value="0.3s"
              valueTone="success"
              series={seriesPack.replag}
              strokeVar={warnStroke}
              fillVar={warnFill}
              thresholdY={56 - 6 - (0.3 / 5) * (56 - 14)}
              gradId={`${baseId}-rep`}
            />
            <MetricTile
              title="Slow queries"
              thresholdText="threshold 10/day"
              value="7"
              valueTone="default"
              series={seriesPack.slow}
              strokeVar="var(--aquarium-text-color-danger-default)"
              fillVar="var(--aquarium-text-color-danger-default)"
              thresholdY={56 - 6 - (10 / 12) * (56 - 14)}
              gradId={`${baseId}-slow`}
              wide
            />
          </Box>
        </Box>
      </Box>
    </>
  )
}

ServiceMetricsBody.displayName = 'ServiceMetricsBody'
