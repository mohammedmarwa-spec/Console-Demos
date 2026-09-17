'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Card, Divider, Grid, InlineIcon, Modal, Typography } from '@aivenio/aquarium'
import office from '@aivenio/aquarium/icons/office'
import projectIcon from '@aivenio/aquarium/icons/projects'
import { getServiceIconUrl, ServiceIcon } from '@/components/ServiceIcon'
import { getServiceTypeDisplayName, type ServiceTypeId } from '@/screens/ServiceTypeSelectModal'
import { useResolvedTheme } from '@/theme/ThemeProvider'

export type ServiceTopologyId = 'service-type' | 'environment' | 'application'
type FlowStep = 'topology' | 'service' | 'review'

/** One line of the structure preview: a service icon plus its name. */
type TreeService = {
  name: string
  typeId: ServiceTypeId | null
}

type TreeProject = {
  name: string
  services: TreeService[]
}

type TopologyTemplate = {
  id: ServiceTopologyId
  title: string
  description: string
  recommended?: boolean
  projects: TreeProject[]
}

type FirstService = {
  id: string
  name: string
  typeLabel: string
  typeId: ServiceTypeId | null
}

type TopologyPlacement = {
  project: string
  matchesCurrent: boolean
  hint: string
  services: FirstService[]
  /** Naming convention suffix for services created here, e.g. postgres-prod. */
  nameSuffix: string
}

/**
 * Everything else that can be created in this project. Same catalogue and tile design as
 * the Console "Select service type" screen (src/screens/ServiceTypeSelectModal).
 */
const EXPLORE_MORE: { id: ServiceTypeId; slug: string; description: string }[] = [
  { id: 'postgresql', slug: 'postgres', description: 'High-performance relational database with advanced extensions' },
  { id: 'kafka', slug: 'kafka', description: 'Distributed event streaming platform for high-throughput data pipelines' },
  { id: 'valkey', slug: 'valkey', description: 'High-performance key/value datastore' },
  { id: 'mysql', slug: 'mysql', description: 'Popular general-purpose easy-to-use relational database' },
  { id: 'opensearch', slug: 'opensearch', description: 'Distributed real-time search and analytics' },
  { id: 'clickhouse', slug: 'clickhouse', description: 'Fast resource-effective data warehouse for analytical workloads' },
  { id: 'dragonfly', slug: 'dragonfly', description: 'Scalable in-memory data store for high-performance workloads' },
  { id: 'metrics', slug: 'metrics', description: 'Thanos Metrics — scalable Prometheus query solution' },
  { id: 'grafana', slug: 'grafana', description: 'Data visualization and analytics platform' },
]

/** Selection keys for explore-more tiles are namespaced so they can't collide with proposed ids. */
const EXPLORE_PREFIX = 'type:'

const TOPOLOGIES: TopologyTemplate[] = [
  {
    id: 'service-type',
    title: 'By service type',
    description: 'One project per service type. Environments live in the service name.',
    projects: [
      {
        name: 'Kafka',
        services: [
          { name: 'kafka-prod', typeId: 'kafka' },
          { name: 'kafka-staging', typeId: 'kafka' },
          { name: 'kafka-dev', typeId: 'kafka' },
        ],
      },
      {
        name: 'PostgreSQL',
        services: [
          { name: 'postgres-prod', typeId: 'postgresql' },
          { name: 'postgres-staging', typeId: 'postgresql' },
        ],
      },
      {
        name: 'Runtime',
        services: [
          { name: 'runtime-prod', typeId: null },
          { name: 'runtime-dev', typeId: null },
        ],
      },
    ],
  },
  {
    id: 'environment',
    title: 'By environment',
    description: 'Isolate Production, Staging, and Development as separate projects.',
    recommended: true,
    projects: [
      {
        name: 'Production',
        services: [
          { name: 'runtime-prod', typeId: null },
          { name: 'kafka-prod', typeId: 'kafka' },
          { name: 'postgres-prod', typeId: 'postgresql' },
        ],
      },
      {
        name: 'Staging',
        services: [
          { name: 'runtime-staging', typeId: null },
          { name: 'kafka-staging', typeId: 'kafka' },
          { name: 'postgres-staging', typeId: 'postgresql' },
        ],
      },
      {
        name: 'Development',
        services: [
          { name: 'kafka-dev', typeId: 'kafka' },
          { name: 'postgres-dev', typeId: 'postgresql' },
        ],
      },
    ],
  },
  {
    id: 'application',
    title: 'By application',
    description: 'One project per application, with that app’s API and backing services together.',
    projects: [
      {
        name: 'Checkout',
        services: [
          { name: 'checkout-api', typeId: null },
          { name: 'checkout-postgres', typeId: 'postgresql' },
          { name: 'checkout-kafka', typeId: 'kafka' },
        ],
      },
      {
        name: 'Payments',
        services: [
          { name: 'payments-api', typeId: null },
          { name: 'payments-postgres', typeId: 'postgresql' },
          { name: 'payments-kafka', typeId: 'kafka' },
        ],
      },
    ],
  },
]

function placementsFor(projectName: string): Record<ServiceTopologyId, TopologyPlacement> {
  return {
    'service-type': {
      project: 'Kafka',
      matchesCurrent: false,
      nameSuffix: 'prod',
      hint: `${projectName} is an environment project. By service type, the first service would be created in Kafka, PostgreSQL, or Runtime instead.`,
      services: [
        { id: 'kafka-prod', name: 'kafka-prod', typeLabel: 'Apache Kafka', typeId: 'kafka' },
        { id: 'kafka-staging', name: 'kafka-staging', typeLabel: 'Apache Kafka', typeId: 'kafka' },
        { id: 'kafka-dev', name: 'kafka-dev', typeLabel: 'Apache Kafka', typeId: 'kafka' },
      ],
    },
    environment: {
      project: projectName,
      matchesCurrent: true,
      nameSuffix: 'prod',
      hint: `This project is ${projectName}. Pick the first service this topology places here. Staging and Development stay empty until you create matching services in those projects.`,
      services: [
        { id: 'postgres-prod', name: 'postgres-prod', typeLabel: 'PostgreSQL', typeId: 'postgresql' },
        { id: 'kafka-prod', name: 'kafka-prod', typeLabel: 'Apache Kafka', typeId: 'kafka' },
        { id: 'runtime-prod', name: 'runtime-prod', typeLabel: 'Runtime', typeId: null },
      ],
    },
    application: {
      project: 'Checkout',
      matchesCurrent: false,
      nameSuffix: 'checkout',
      hint: `${projectName} is an environment project. By application, the first service would be created in Checkout or Payments instead.`,
      services: [
        { id: 'checkout-api', name: 'checkout-api', typeLabel: 'Runtime', typeId: null },
        { id: 'checkout-postgres', name: 'checkout-postgres', typeLabel: 'PostgreSQL', typeId: 'postgresql' },
        { id: 'checkout-kafka', name: 'checkout-kafka', typeLabel: 'Apache Kafka', typeId: 'kafka' },
      ],
    },
  }
}

const TREE_GUIDE = '1px dotted var(--aquarium-border-color-muted)'

/**
 * One indent step of the tree. `through` continues a parent's line past this row,
 * `elbow` branches into it, and `elbow-last` stops at the row it points to.
 */
function TreeGuide({ variant }: { variant: 'through' | 'elbow' | 'elbow-last' | 'empty' }) {
  const branches = variant === 'elbow' || variant === 'elbow-last'
  return (
    <Box aria-hidden style={{ position: 'relative', width: 14, flexShrink: 0, alignSelf: 'stretch' }}>
      {variant !== 'empty' ? (
        <Box
          style={{
            position: 'absolute',
            left: 6,
            top: 0,
            height: variant === 'elbow-last' ? '50%' : '100%',
            borderLeft: TREE_GUIDE,
          }}
        />
      ) : null}
      {branches ? (
        <Box style={{ position: 'absolute', left: 6, top: '50%', width: 7, borderTop: TREE_GUIDE }} />
      ) : null}
    </Box>
  )
}

function TreeRow({
  guides,
  children,
}: {
  guides: ('through' | 'elbow' | 'elbow-last' | 'empty')[]
  children: React.ReactNode
}) {
  return (
    <Box style={{ display: 'flex', alignItems: 'stretch' }}>
      {guides.map((variant, index) => (
        <TreeGuide key={index} variant={variant} />
      ))}
      <Box.Flex alignItems="center" gap="2" paddingY="1">
        {children}
      </Box.Flex>
    </Box>
  )
}

function TopologyTree({ projects }: { projects: TreeProject[] }) {
  return (
    <Box
      style={{
        marginTop: 12,
        padding: '10px 12px',
        borderRadius: 'var(--aquarium-border-radius-default, 8px)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        /* Dashed, like an empty state — the layout is a sketch, not live resources. */
        border: '1px dashed var(--aquarium-border-color-default)',
        /* Equalises the preview box across templates with different depths. */
        minHeight: 240,
      }}
    >
      <Box marginBottom="2">
        <Typography.Caption color="inactive">Example layout</Typography.Caption>
      </Box>
      <Box.Flex alignItems="center" gap="2" paddingY="1">
        <InlineIcon icon={office} width="14px" height="14px" color="inactive" />
        <Typography.Caption color="inactive">Organization</Typography.Caption>
      </Box.Flex>
      {projects.map((project, projectIndex) => {
        const lastProject = projectIndex === projects.length - 1
        return (
          <Box key={project.name}>
            <TreeRow guides={[lastProject ? 'elbow-last' : 'elbow']}>
              <InlineIcon icon={projectIcon} width="14px" height="14px" color="inactive" />
              <Typography.Caption color="inactive">{project.name}</Typography.Caption>
            </TreeRow>
            {project.services.map((service, serviceIndex) => (
              <TreeRow
                key={service.name}
                guides={[
                  lastProject ? 'empty' : 'through',
                  serviceIndex === project.services.length - 1 ? 'elbow-last' : 'elbow',
                ]}
              >
                {/* Greyed out: these services don't exist yet. */}
                <Box style={{ opacity: 0.4, filter: 'grayscale(1)' }}>
                  <ServiceIcon serviceTypeId={service.typeId} size={16} alt="" />
                </Box>
                <Typography.Caption color="inactive">{service.name}</Typography.Caption>
              </TreeRow>
            ))}
          </Box>
        )
      })}
    </Box>
  )
}

/**
 * Service-type tile copied from the Console "Select service type" screen: 48px logo,
 * name, one-line description, muted border that turns primary on hover.
 */
function ServiceTypeTile({
  typeId,
  name,
  description,
  serviceName,
  selected,
  onSelect,
}: {
  typeId: ServiceTypeId
  name: string
  description: string
  serviceName: string
  selected: boolean
  onSelect: () => void
}) {
  const selectedBorder = 'var(--aquarium-border-color-primary-default)'
  const restingBorder = 'var(--aquarium-border-color-muted)'
  return (
    <Box
      component="button"
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        display: 'flex',
        gap: 16,
        width: '100%',
        alignItems: 'flex-start',
        textAlign: 'left',
        padding: 16,
        border: `1px solid ${selected ? selectedBorder : restingBorder}`,
        borderRadius: 'var(--aquarium-border-radius-default, 8px)',
        backgroundColor: selected
          ? 'var(--aquarium-background-color-primary-muted)'
          : 'var(--aquarium-background-color-layer)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = selectedBorder
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = selected ? selectedBorder : restingBorder
      }}
    >
      <ServiceIcon serviceTypeId={typeId} size={48} alt="" />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Typography.DefaultStrong>{name}</Typography.DefaultStrong>
        <Box marginTop="1">
          <Typography.Caption color="muted">{description}</Typography.Caption>
        </Box>
        <Box marginTop="2">
          <Typography.Caption color="inactive">creates {serviceName}</Typography.Caption>
        </Box>
      </Box>
    </Box>
  )
}

export function CreateServiceTopologyModal({
  open,
  onClose,
  projectName,
}: {
  open: boolean
  onClose: () => void
  projectName: string
}) {
  const [step, setStep] = useState<FlowStep>('topology')
  const [selected, setSelected] = useState<ServiceTopologyId>('environment')
  /** Either a proposed service id, or `type:<serviceTypeId>` from the explore-more grid. */
  const [serviceId, setServiceId] = useState('postgres-prod')
  const theme = useResolvedTheme()
  const placements = useMemo(() => placementsFor(projectName), [projectName])
  const topology = TOPOLOGIES.find((item) => item.id === selected) ?? TOPOLOGIES[1]
  const placement = placements[selected]

  const exploreName = (slug: string) => `${slug}-${placement.nameSuffix}`
  const proposedTypes = new Set(placement.services.map((item) => item.typeId))
  const exploreMore = EXPLORE_MORE.filter((item) => !proposedTypes.has(item.id))
  const exploredId = serviceId.startsWith(EXPLORE_PREFIX) ? serviceId.slice(EXPLORE_PREFIX.length) : null
  const explored = exploreMore.find((item) => item.id === exploredId)

  const service: FirstService = explored
    ? {
        id: serviceId,
        name: exploreName(explored.slug),
        typeLabel: getServiceTypeDisplayName(explored.id),
        typeId: explored.id,
      }
    : (placement.services.find((item) => item.id === serviceId) ?? placement.services[0])

  useEffect(() => {
    if (!open) return
    setStep('topology')
    setSelected('environment')
    setServiceId('postgres-prod')
  }, [open])

  function selectTopology(id: ServiceTopologyId) {
    setSelected(id)
    setServiceId(placements[id].services[0].id)
  }

  function goNext() {
    if (step === 'topology') setStep('service')
    else if (step === 'service') setStep('review')
    else onClose()
  }

  function goBack() {
    if (step === 'review') setStep('service')
    else if (step === 'service') setStep('topology')
  }

  const subtitle =
    step === 'topology'
      ? '1 / 3 · Choose a topology'
      : step === 'service'
        ? `2 / 3 · Create in ${placement.project}`
        : '3 / 3 · Review and create'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title="Create your first service"
      subtitle={subtitle}
      primaryAction={{
        text: step === 'review' ? 'Create service' : 'Next',
        onClick: goNext,
      }}
      secondaryActions={
        step === 'topology'
          ? { text: 'Cancel', onClick: onClose }
          : [
              { text: 'Back', onClick: goBack },
              { text: 'Cancel', onClick: onClose },
            ]
      }
    >
      {step === 'topology' ? (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert type="information" title="Nothing is created yet">
            Each card shows how projects and services would be laid out under this template. Your
            organization still has no projects or services — the first one is created at the end of
            this flow.
          </Alert>
          <Card.Group
            name="service-topology"
            checked={selected}
            onCheckedChange={({ value }) => selectTopology((value as ServiceTopologyId) ?? 'environment')}
          >
            <Grid gap="4" alignItems="stretch">
              {TOPOLOGIES.map((item) => (
                <Grid.Item key={item.id} xs={12} sm={6} md={4}>
                  {/* Flex wrapper so every card fills its grid row and the rows line up. */}
                  <Box height="full" style={{ display: 'flex' }}>
                    <Card
                      fullWidth
                      checkable
                      value={item.id}
                      checked={selected === item.id}
                      title={item.title}
                      chips={[
                        item.recommended
                          ? { text: 'Recommended', status: 'success' }
                          : { text: 'Alternative', status: 'neutral' },
                      ]}
                    >
                      <Typography.Small color="muted">{item.description}</Typography.Small>
                      <TopologyTree projects={item.projects} />
                    </Card>
                  </Box>
                </Grid.Item>
              ))}
            </Grid>
          </Card.Group>
        </Box>
      ) : null}

      {step === 'service' ? (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert type={placement.matchesCurrent ? 'information' : 'warning'} title={topology.title}>
            {placement.hint}
          </Alert>
          <Card.Group
            /* Card.Group keeps its own radio state, so remount it to drop the mark
               when an explore-more tile takes over the selection. */
            key={explored ? 'explored' : 'proposed'}
            name="first-service"
            checked={explored ? '' : serviceId}
            onCheckedChange={({ value }) => setServiceId(value)}
          >
            <Grid gap="4" alignItems="stretch">
              {placement.services.map((item) => (
                <Grid.Item key={item.id} xs={12} sm={6}>
                  <Box height="full" style={{ display: 'flex' }}>
                    <Card.Compact
                      fullWidth
                      checkable
                      value={item.id}
                      checked={!explored && serviceId === item.id}
                      title={item.name}
                      chips={[item.typeLabel]}
                      icon={getServiceIconUrl(item.typeId, theme)}
                    >
                      Created in {placement.project}
                    </Card.Compact>
                  </Box>
                </Grid.Item>
              ))}
            </Grid>
          </Card.Group>

          <Divider />

          <Box>
            <Typography.SmallStrong>Explore more services</Typography.SmallStrong>
            <Box marginTop="1">
              <Typography.Small color="muted">
                Any service type can go in {placement.project}. Names follow the project convention —
                &lt;type&gt;-{placement.nameSuffix}.
              </Typography.Small>
            </Box>
            <Box marginTop="4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {exploreMore.map((item) => (
                <ServiceTypeTile
                  key={item.id}
                  typeId={item.id}
                  name={getServiceTypeDisplayName(item.id)}
                  description={item.description}
                  serviceName={exploreName(item.slug)}
                  selected={exploredId === item.id}
                  onSelect={() => setServiceId(`${EXPLORE_PREFIX}${item.id}`)}
                />
              ))}
            </Box>
          </Box>
        </Box>
      ) : null}

      {step === 'review' ? (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert type="information" title={topology.title}>
            {placement.matchesCurrent
              ? `${service.name} will be created in ${projectName}. Staging and Development stay empty until you add matching services there.`
              : `${service.name} follows the ${topology.title.toLowerCase()} template and would be created in ${placement.project}, not ${projectName}.`}
          </Alert>
          <Card title={service.name} chips={[service.typeLabel]} fullWidth>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Typography.Small color="muted">Project · {placement.project}</Typography.Small>
              <Typography.Small color="muted">
                Topology · {topology.title}
                {topology.recommended ? ' (recommended)' : ''}
              </Typography.Small>
              <Typography.Small color="muted">Empty-state path · first service in this project</Typography.Small>
            </Box>
          </Card>
        </Box>
      ) : null}
    </Modal>
  )
}

CreateServiceTopologyModal.displayName = 'CreateServiceTopologyModal'
TopologyTree.displayName = 'TopologyTree'
TreeRow.displayName = 'TreeRow'
TreeGuide.displayName = 'TreeGuide'
ServiceTypeTile.displayName = 'ServiceTypeTile'
