import type { ReactNode } from 'react'
import { Box, Modal, StatusChip, Typography } from '@aivenio/aquarium'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import { ServiceIcon } from '../components/ServiceIcon'

export type ServiceTypeId =
  | 'postgresql'
  | 'kafka'
  | 'valkey'
  | 'mysql'
  | 'opensearch'
  | 'clickhouse'
  | 'dragonfly'
  | 'metrics'
  | 'grafana'
  | 'redis'
  | 'flink'
  | 'm3db'

type ServiceTypeOption = {
  id: ServiceTypeId
  name: string
  description: string
}

const SERVICE_TYPES: ServiceTypeOption[] = [
  { id: 'postgresql', name: 'PostgreSQL®',      description: 'PostgreSQL - High-performance relational database with advanced extensions' },
  { id: 'kafka',      name: 'Apache Kafka®',    description: 'Kafka - Distributed event streaming platform for high-throughput data pipelines' },
  { id: 'valkey',     name: 'Valkey',           description: 'Valkey - High-performance key/value datastore' },
  { id: 'mysql',      name: 'MySQL',            description: 'MySQL - Popular general-purpose easy-to-use relational database' },
  { id: 'opensearch', name: 'OpenSearch®',      description: 'OpenSearch - Distributed real-time search and analytics' },
  { id: 'clickhouse', name: 'ClickHouse®',      description: 'ClickHouse - Fast resource-effective data warehouse for analytical workloads' },
  { id: 'dragonfly',  name: 'Dragonfly',        description: 'Dragonfly - Scalable in-memory data store for high-performance workloads' },
  { id: 'metrics',    name: 'Aiven for Metrics', description: 'Thanos Metrics - Scalable Prometheus query solution' },
  { id: 'grafana',    name: 'Grafana®',         description: 'Grafana - Data visualization and analytics platform' },
]

export function getServiceTypeDisplayName(id: ServiceTypeId): string {
  return SERVICE_TYPES.find((s) => s.id === id)?.name ?? id
}

/**
 * Service types that support ACU (flexible) pricing mode.
 * Update this set when more services gain ACU support — no other changes needed.
 */
const ACU_CAPABLE_SERVICE_IDS = new Set<ServiceTypeId>(['postgresql', 'mysql'])

const LEGAL_FOOTER =
  'Apache, Apache Kafka, Kafka, Apache Flink, Flink, Apache Cassandra, and Cassandra are either registered trademarks or trademarks of the Apache Software Foundation in the United States and/or other countries. ClickHouse, OpenSearch, AlloyDB Omni, PostgreSQL, MySQL, Grafana, Dragonfly, Valkey, Terraform, and Kubernetes are trademarks and property of their respective owners. All product and service names used in this website are for identification purposes only and do not imply endorsement.'

type ServiceTypeSelectModalProps = {
  open: boolean
  onClose: () => void
  onSelectService: (serviceType: ServiceTypeId) => void
  /** Project and org line under the modal title (defaults to ux-tests / BigCo Ltd.). */
  subtitle?: ReactNode
}


function ServiceTypeSelectModal({
  open,
  onClose,
  onSelectService,
  subtitle,
}: ServiceTypeSelectModalProps) {
  const defaultSubtitle = (
    <Box style={{ color: '#4a4b57' }}>
      <Typography.Small>Project: ux-tests · Organization: BigCo Ltd.</Typography.Small>
    </Box>
  )

  return (
    <Modal
      title="Select service type"
      subtitle={subtitle ?? defaultSubtitle}
      open={open}
      onClose={onClose}
      size="full"
    >
      <Box style={{ marginBottom: 24 }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {SERVICE_TYPES.map((service) => (
            <Box
              key={service.id}
              component="button"
              type="button"
              onClick={() => onSelectService(service.id)}
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: 24,
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
              <ServiceIcon serviceTypeId={service.id} size={48} alt="" />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Typography.DefaultStrong>{service.name}</Typography.DefaultStrong>
                  {ACU_CAPABLE_SERVICE_IDS.has(service.id) && (
                    <StatusChip text="New pricing" status="success" icon={applicationsIcon} />
                  )}
                </Box>
                <Box style={{ color: '#787885', marginTop: 4 }}>
                  <Typography.Caption>{service.description}</Typography.Caption>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box style={{ paddingTop: 24, borderTop: '1px solid var(--aquarium-border-color-muted)' }}>
        <Box style={{ color: '#787885' }}>
          <Typography.Caption>{LEGAL_FOOTER}</Typography.Caption>
        </Box>
      </Box>
    </Modal>
  )
}

ServiceTypeSelectModal.displayName = 'ServiceTypeSelectModal'

export default ServiceTypeSelectModal
