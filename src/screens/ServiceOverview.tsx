import { useLayoutEffect, useRef } from 'react'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  DropdownMenu,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Tabs,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { ServiceSidebar } from '../components/ServiceSidebar'
import type { ServiceRow } from './ProjectServices'
import type { ServiceTypeId } from './ServiceTypeSelectModal'

function makeServiceIconUrl(letter: string, bgColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" rx="10" fill="${bgColor}"/><text x="28" y="28" font-size="22" font-weight="700" fill="rgba(0,0,0,0.55)" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const PROJECT_NAME = 'UI-TESTS'
const MYSQL_SERVICE_NAME = 'mysql-204e49c9'
const PG_SERVICE_NAME = 'pg-2536119c'

export type ServiceOverviewProps = {
  /** Current service id (e.g. from created service); used for display name when set. */
  serviceId?: string | null
  /** Service type for this overview (MySQL shows "New pricing" banner; PG does not). */
  serviceTypeId?: ServiceTypeId | null
  /** Called when user clicks "Back to project" */
  onBackToProject?: () => void
  /** Called when user chooses "Delete service" from the ⋯ menu */
  onDeleteService?: () => void
  /** Full service list used to resolve read replicas linked to this service. */
  services?: ServiceRow[]
  /** Called when user clicks "Create replica" in the Read replica section. */
  onCreateReplica?: () => void
  /** Called when user clicks a replica row to navigate to its overview. */
  onReplicaClick?: (replicaServiceId: string) => void
  /** Called when user clicks "Create fork" in the Backups overview section. */
  onCreateFork?: () => void
}

function ServiceOverview({
  serviceId: serviceIdProp,
  serviceTypeId = 'mysql',
  onBackToProject,
  onDeleteService,
  services = [],
  onCreateReplica,
  onReplicaClick,
  onCreateFork,
}: ServiceOverviewProps) {
  const isMySQL = serviceTypeId === 'mysql'
  const replicas = services.filter((s) => s.sourceServiceId === (serviceIdProp ?? undefined) && s.replicationRole === 'read_replica')
  const serviceName = serviceIdProp ?? (isMySQL ? MYSQL_SERVICE_NAME : PG_SERVICE_NAME)
  const serviceVersion = isMySQL ? 'MySQL 8.0.45' : 'PostgreSQL 17'
  const iconLetter = isMySQL ? 'M' : 'P'
  const iconBg = isMySQL ? '#b0d0e8' : '#b8d4e8'

  // Relationship metadata
  const currentService = services.find((s) => s.id === serviceIdProp)
  const isReplica = currentService?.replicationRole === 'read_replica'
  const isFork = currentService?.replicationRole === 'fork'
  const primaryService = (isReplica || isFork)
    ? services.find((s) => s.id === currentService?.sourceServiceId)
    : undefined

  // Derive plan capacity from the matching ServiceRow (populated during creation).
  // Fall back to representative defaults so pre-seeded services without resource fields still render.
  const ramCapacity = currentService?.ramCapacity ?? '8 GB'
  const storageCapacity = currentService?.storageCapacity ?? '80 GB'
  const nodeCount = currentService?.nodeCount ?? 1
  // Compute plausible usage values (37% RAM, 13% storage) from the actual capacity.
  const ramUsedGB = (parseFloat(ramCapacity) * 0.37).toFixed(1)
  const storageUsedGB = (parseFloat(storageCapacity) * 0.13).toFixed(1)

  // Scroll the content area to the top on every fresh mount (including service-to-service navigation).
  // useLayoutEffect fires synchronously before the browser paints, preventing any visible scroll flash.
  const contentRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
    // Reset window scroll as well in case the outer layout overflows the viewport.
    try { window.scrollTo(0, 0) } catch { /* jsdom no-op */ }
  }, [])

  return (
    <Box style={{ height: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader activeNav="projects" />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ServiceSidebar
          projectName={PROJECT_NAME}
          serviceName={serviceName}
          activeItem="overview"
          onBackToProject={onBackToProject}
        />

        {/* Main content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 24, overflow: 'auto', overflowAnchor: 'none', backgroundColor: '#fff' }}>
            {/* Page header */}
          <Box style={{ marginBottom: 32 }}>
            <PageHeader
              title={serviceName}
              image={makeServiceIconUrl(iconLetter, iconBg)}
              imageAlt={isMySQL ? 'MySQL' : 'PostgreSQL'}
              breadcrumbs={[
                <Breadcrumbs.Crumb key="project">{PROJECT_NAME}</Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="service">{serviceName}</Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="overview">Overview</Breadcrumbs.Crumb>,
              ]}
              subtitle={
                <Box component="span" style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
                  <Box component="span" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusChip text={serviceVersion} status="neutral" dense />
                    <StatusChip text="Running" status="success" dense />
                    {isReplica && <StatusChip text="Read Replica" status="neutral" dense />}
                    {isFork && <StatusChip text="Fork" status="neutral" dense />}
                    <StatusChip text="Nodes" status="success" badge={nodeCount} dense />
                  </Box>
                  {isReplica && primaryService && (
                    <Box component="span" style={{ color: '#787885' }}>
                      <Typography.Caption>
                        Replica of{' '}
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onReplicaClick?.(primaryService.id)
                          }}
                        >
                          {primaryService.serviceName}
                        </Link>
                      </Typography.Caption>
                    </Box>
                  )}
                  {isFork && primaryService && (
                    <Box component="span" style={{ color: '#787885' }}>
                      <Typography.Caption>
                        Forked from{' '}
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onReplicaClick?.(primaryService.id)
                          }}
                        >
                          {primaryService.serviceName}
                        </Link>
                      </Typography.Caption>
                    </Box>
                  )}
                </Box>
              }
              primaryAction={{ text: 'Quick connect', onClick: () => {} }}
              menu={
                <DropdownMenu.Items>
                  <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
                </DropdownMenu.Items>
              }
              onAction={(key) => { if (key === 'delete') onDeleteService?.() }}
            />
          </Box>

          {/* Sections */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Connection information + Service plan usage — side by side */}
            <Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Section title="Connection information">
                  {isMySQL ? (
                    <Tabs value="mysql" onChange={() => {}}>
                      <Tabs.Tab title="MySQL" value="mysql" />
                      <Tabs.Tab title="MySQLx" value="mysqlx" />
                    </Tabs>
                  ) : (
                    <Tabs value="psql" onChange={() => {}}>
                      <Tabs.Tab title="psql" value="psql" />
                      <Tabs.Tab title="Connection string" value="uri" />
                    </Tabs>
                  )}
                  <Box style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(isMySQL
                      ? [
                          { label: 'Service URI', value: 'mysql://***@mysql-204e49c9-ux-tests.jaivencloud.com:12691/defaultdb?ssl-mode=REQUIRED' },
                          { label: 'Database name', value: 'defaultdb' },
                          { label: 'Host', value: 'mysql-204e49c9-ux-tests.jaivencloud.com' },
                          { label: 'Port', value: '12691' },
                          { label: 'User', value: 'avnadmin' },
                          { label: 'Password', value: '**********' },
                          { label: 'SSL mode', value: 'REQUIRED' },
                          { label: 'CA certificate', value: 'Show' },
                        ]
                      : [
                          { label: 'Service URI', value: 'postgres://***@pg-2536119c-ux-tests.jaivencloud.com:12692/defaultdb?sslmode=require' },
                          { label: 'Database name', value: 'defaultdb' },
                          { label: 'Host', value: 'pg-2536119c-ux-tests.jaivencloud.com' },
                          { label: 'Port', value: '12692' },
                          { label: 'User', value: 'avnadmin' },
                          { label: 'Password', value: '**********' },
                          { label: 'SSL mode', value: 'require' },
                          { label: 'CA certificate', value: 'Show' },
                        ]
                    ).map((row) => (
                      <Box key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <Box>
                          <Box style={{ color: '#787885' }}><Typography.Caption>{row.label}</Typography.Caption></Box>
                          <Typography.Default>{row.value}</Typography.Default>
                        </Box>
                        <Button.Ghost type="button" aria-label={`Copy ${row.label}`}>Copy</Button.Ghost>
                      </Box>
                    ))}
                  </Box>
                </Section>
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Section
                  title="Service plan usage"
                  actions={{ text: 'Change', onClick: () => {} }}
                  menu={
                    <DropdownMenu.Items>
                      <DropdownMenu.Item id="change-plan">Change plan</DropdownMenu.Item>
                    </DropdownMenu.Items>
                  }
                  onAction={() => {}}
                >
                  {isMySQL && (
                    <Box style={{ marginBottom: 16 }}>
                      <Alert type="success">
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Typography.Default>
                            We introduce new flexible pricing, allowing to fine-tune amount of CPU/RAM and storage.{' '}
                            <Link href="#">Learn more</Link>
                          </Typography.Default>
                          <Box>
                            <Button.Ghost type="button">Migrate to new pricing</Button.Ghost>
                          </Box>
                        </Box>
                      </Alert>
                    </Box>
                  )}
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <PlanUsageBar label="Memory use" value={`${ramUsedGB} of ${ramCapacity} (37%)`} percent={37} />
                    <PlanUsageBar label="Storage used" value={`${storageUsedGB} of ${storageCapacity} (13%)`} percent={13} />
                    <Box>
                      <Box style={{ marginBottom: 8 }}>
                        <Typography.Caption>CPU across all nodes</Typography.Caption>
                      </Box>
                      <CpuLineChart />
                    </Box>
                  </Box>
                </Section>
              </Box>
            </Box>

            <Section
              title="Backups"
              collapsible
              defaultCollapsed={false}
              actions={{ text: 'Create fork', onClick: () => onCreateFork?.() }}
              menu={
                <DropdownMenu.Items>
                  <DropdownMenu.Item id="download">Download backup</DropdownMenu.Item>
                  <DropdownMenu.Item id="restore">Restore from backup</DropdownMenu.Item>
                </DropdownMenu.Items>
              }
              onAction={() => {}}
            >
              <Box style={{ display: 'flex', gap: 24, paddingTop: 8 }}>
                <BackupStat label="Backup location" value="google-asia-east1" />
                <BackupStat label="Backup interval" value="24 hour" />
                <BackupStat label="Backup retention" value="1 day" />
                <BackupStat label="Latest backup" value="< 1 minute ago" />
                <BackupStat label="Oldest backup" value="< 1 minute ago" />
                <BackupStat label="Total backups stored" value="866 MB" showInfo tooltip="Total size of all stored backup files" />
              </Box>
            </Section>

            <Section
              title="Read replica"
              collapsible
              defaultCollapsed={false}
              actions={{ text: 'Create replica', onClick: () => onCreateReplica?.() }}
              menu={
                <DropdownMenu.Items>
                  <DropdownMenu.Item id="replica-docs">View documentation</DropdownMenu.Item>
                </DropdownMenu.Items>
              }
              onAction={() => {}}
            >
              {replicas.length === 0 ? (
                <Typography.Default>
                  Create a read-only replica for better performance and additional disaster recovery
                </Typography.Default>
              ) : (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {replicas.map((replica) => (
                    <Box
                      key={replica.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        paddingBlock: 8,
                      }}
                    >
                      {/* Service type icon */}
                      <Box
                        aria-hidden
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#3545be',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {replica.iconLetter ?? replica.serviceName.charAt(0).toUpperCase()}
                      </Box>
                      {/* Replica name as a navigable link */}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onReplicaClick?.(replica.id)
                          }}
                        >
                          {replica.serviceName}
                        </Link>
                      </Box>
                      <StatusChip text="Active" status="success" dense />
                    </Box>
                  ))}
                </Box>
              )}
            </Section>

            <Section title="Maintenance" collapsible defaultCollapsed={false}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label="Version" value={serviceVersion} />
                <Row label="Maintenance window" value="Saturdays after 19:36:13 UTC" />
              </Box>
            </Section>

            <Section title="Cloud and network" collapsible defaultCollapsed={false}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label="Cloud provider" value="Google Cloud" />
                <Row label="Cloud region" value="asia-east1" />
                <Row label="Deployment model" value="Public internet" />
                <Row label="IP address allowlist" value="Open to all" />
              </Box>
            </Section>

            <Section title="Integrations" collapsible defaultCollapsed={false}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <Typography.Small>
                  Service integrations are only available on startup plans and higher. <Link href="#">Learn more</Link>
                </Typography.Small>
                <Button.Primary type="button">Upgrade plan</Button.Primary>
              </Box>
            </Section>
          </Box>
        </div>
      </Box>
    </Box>
  )
}

ServiceOverview.displayName = 'ServiceOverview'

export default ServiceOverview

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', gap: 16 }}>
      <Box style={{ color: '#787885', minWidth: 140 }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Typography.Default>{value}</Typography.Default>
    </Box>
  )
}

Row.displayName = 'Row'

function PlanUsageBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <Box>
      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Typography.Caption>{label}</Typography.Caption>
        <Typography.Caption>{value}</Typography.Caption>
      </Box>
      <Box style={{ height: 4, backgroundColor: '#ededf0', borderRadius: 12, overflow: 'hidden' }}>
        <Box style={{ width: `${percent}%`, height: '100%', backgroundColor: '#3545be', borderRadius: 12 }} />
      </Box>
    </Box>
  )
}

PlanUsageBar.displayName = 'PlanUsageBar'

function CpuLineChart() {
  const labelW = 32
  const plotW = 420
  const plotH = 62
  const bottomPad = 18
  const totalH = plotH + bottomPad

  const rawPoints = [0.42, 0.50, 0.68, 0.55, 0.72, 0.58, 0.48, 0.64, 0.52, 0.44]
  const step = plotW / (rawPoints.length - 1)
  const polyline = rawPoints
    .map((v, i) => `${labelW + i * step},${plotH - v * plotH}`)
    .join(' ')

  const xLabels = ['12:00', '12:15', '12:30', '12:45', '13:00']
  const xStep = plotW / (xLabels.length - 1)

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${labelW + plotW} ${totalH}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="CPU usage chart"
    >
      {/* Y-axis labels */}
      <text x={labelW - 4} y={4}            fontSize="10" fill="#787885" textAnchor="end" dominantBaseline="hanging">100%</text>
      <text x={labelW - 4} y={plotH / 2}    fontSize="10" fill="#787885" textAnchor="end" dominantBaseline="middle">50%</text>
      <text x={labelW - 4} y={plotH}        fontSize="10" fill="#787885" textAnchor="end" dominantBaseline="auto">0</text>

      {/* Grid lines */}
      <line x1={labelW} y1={1}           x2={labelW + plotW} y2={1}           stroke="#D2D2D6" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={labelW} y1={plotH / 2}   x2={labelW + plotW} y2={plotH / 2}   stroke="#D2D2D6" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={labelW} y1={plotH}       x2={labelW + plotW} y2={plotH}       stroke="#D2D2D6" strokeWidth="1" />

      {/* Data line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#4CC2F7"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* X-axis labels */}
      {xLabels.map((label, i) => (
        <text
          key={label}
          x={labelW + i * xStep}
          y={plotH + bottomPad - 2}
          fontSize="10"
          fill="#787885"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

CpuLineChart.displayName = 'CpuLineChart'

function BackupStat({ label, value, showInfo, tooltip }: { label: string; value: string; showInfo?: boolean; tooltip?: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Box style={{ color: '#787885', whiteSpace: 'nowrap' }}><Typography.Caption>{label}</Typography.Caption></Box>
        {showInfo && tooltip && (
          <Tooltip placement="top" content={tooltip}>
            <Icon icon={infoSignIcon} style={{ width: 16, height: 16, color: '#787885', flexShrink: 0 }} />
          </Tooltip>
        )}
      </Box>
      <Typography.DefaultStrong>{value}</Typography.DefaultStrong>
    </Box>
  )
}

BackupStat.displayName = 'BackupStat'
