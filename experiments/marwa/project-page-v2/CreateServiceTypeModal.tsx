'use client'

import { Box, Chip, Modal, Typography } from '@aivenio/aquarium'
import { ServiceIcon } from '@/components/ServiceIcon'
import { imageSrc, type ImageSource } from '@/lib/image'
import type { ServiceTypeId } from '@/screens/ServiceTypeSelectModal'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import datahubIconDark from './assets/icon-datahub.dark.svg'
import datahubIconLight from './assets/icon-datahub.svg'

type CatalogEntry = {
  id: string
  name: string
  description: string
  iconId?: ServiceTypeId
  /** Full circular Console service logo (light/dark), used when ServiceIcon has no type. */
  themedLogo?: { light: ImageSource; dark: ImageSource }
  isNew?: boolean
}

/** Catalog and copy aligned to Console ServiceTypeSelectionModal / ServiceTypeOption. */
const SERVICE_TYPES: CatalogEntry[] = [
  {
    id: 'postgresql',
    name: 'PostgreSQL®',
    description: 'PostgreSQL - High-performance relational database with advanced extensions',
    iconId: 'postgresql',
  },
  {
    id: 'kafka',
    name: 'Apache Kafka®',
    description: 'Kafka - Distributed event streaming platform for high-throughput data pipelines',
    iconId: 'kafka',
  },
  {
    id: 'opensearch',
    name: 'OpenSearch®',
    description: 'OpenSearch - Distributed real-time search and analytics',
    iconId: 'opensearch',
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse®',
    description: 'ClickHouse - Fast resource-effective data warehouse for analytical workloads',
    iconId: 'clickhouse',
  },
  {
    id: 'valkey',
    name: 'Valkey',
    description: 'Valkey - High-performance key/value datastore',
    iconId: 'valkey',
  },
  {
    id: 'dragonfly',
    name: 'Dragonfly',
    description: 'Dragonfly - Scalable in-memory data store for high-performance workloads',
    iconId: 'dragonfly',
  },
  {
    id: 'metrics',
    name: 'Aiven for Metrics',
    description: 'Thanos Metrics - Scalable Prometheus query solution',
    iconId: 'metrics',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: 'MySQL - Popular general-purpose easy-to-use relational database',
    iconId: 'mysql',
  },
  {
    id: 'grafana',
    name: 'Grafana®',
    description: 'Grafana - Data visualization and analytics platform',
    iconId: 'grafana',
  },
  {
    id: 'alert-triage',
    name: 'Alert Triage',
    description: 'Alert Triage - AI-assisted triage of critical Aiven alerts',
  },
  {
    id: 'alertmanager',
    name: 'Alertmanager',
    description: 'Alertmanager - Alerting service',
  },
  {
    id: 'datahub',
    name: 'DataHub',
    description: 'DataHub - Unified governance tool for data discovery, documentation, and lineage',
    themedLogo: { light: datahubIconLight, dark: datahubIconDark },
    isNew: true,
  },
]

function CatalogTypeIcon({ service }: { service: CatalogEntry }) {
  const theme = useResolvedTheme()
  if (service.themedLogo) {
    return (
      <img
        src={imageSrc(theme === 'light' ? service.themedLogo.light : service.themedLogo.dark)}
        width={40}
        height={40}
        alt=""
        style={{ display: 'block', flexShrink: 0 }}
      />
    )
  }
  return <ServiceIcon serviceTypeId={service.iconId} size={40} alt="" />
}

const LEGAL_FOOTER =
  'Apache, Apache Kafka, Kafka, Apache Flink, and Flink are either registered trademarks or trademarks of the Apache Software Foundation in the United States and/or other countries. ClickHouse, OpenSearch, PostgreSQL, MySQL, Grafana, Dragonfly, Valkey, Terraform, and Kubernetes are trademarks and property of their respective owners. All product and service names used in this website are for identification purposes only and do not imply endorsement.'

export function CreateServiceTypeModal({
  open,
  onClose,
  projectName,
  orgName,
}: {
  open: boolean
  onClose: () => void
  projectName: string
  orgName: string
}) {
  return (
    <Modal
      title="Create service"
      subtitle={
        <>
          Project: <Typography.Strong>{projectName}</Typography.Strong>
          {'  '}
          Organization: <Typography.Strong>{orgName}</Typography.Strong>
        </>
      }
      open={open}
      onClose={onClose}
      size="full"
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <Box style={{ marginBottom: 24 }}>
        <Typography.Large>Select service type</Typography.Large>
      </Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {SERVICE_TYPES.map((service) => (
          <Box
            key={service.id}
            component="button"
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              textAlign: 'left',
              padding: 16,
              border: '1px solid var(--aquarium-border-color-muted)',
              borderRadius: 8,
              backgroundColor: 'var(--aquarium-background-color-layer)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--aquarium-border-color-primary-default)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(53, 69, 190, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--aquarium-border-color-muted)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <CatalogTypeIcon service={service} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography.SmallStrong color="intense">{service.name}</Typography.SmallStrong>
                {service.isNew ? <Chip.Inverse dense status="danger" text="New" /> : null}
              </Box>
              <Box style={{ marginTop: 4 }}>
                <Typography.Small color="muted">{service.description}</Typography.Small>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Box style={{ marginTop: 24 }}>
        <Typography.Small color="muted">{LEGAL_FOOTER}</Typography.Small>
      </Box>
    </Modal>
  )
}

CreateServiceTypeModal.displayName = 'CreateServiceTypeModal'
