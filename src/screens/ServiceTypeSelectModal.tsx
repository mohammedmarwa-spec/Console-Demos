import { Box, Modal, StatusChip, Typography } from '@aivenio/aquarium'

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

type ServiceTypeOption = {
  id: ServiceTypeId
  name: string
  description: string
  iconColor: string
  iconLetter: string
}

const SERVICE_TYPES: ServiceTypeOption[] = [
  {
    id: 'postgresql',
    name: 'PostgreSQL®',
    description: 'PostgreSQL - High-performance relational database with advanced extensions',
    iconColor: '#b8d4e8',
    iconLetter: 'P',
  },
  {
    id: 'kafka',
    name: 'Apache Kafka®',
    description: 'Kafka - Distributed event streaming platform for high-throughput data pipelines',
    iconColor: '#f5c6e0',
    iconLetter: 'K',
  },
  {
    id: 'valkey',
    name: 'Valkey',
    description: 'Valkey - High-performance key/value datastore',
    iconColor: '#b8c9dc',
    iconLetter: 'V',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: 'MySQL - Popular general-purpose easy-to-use relational database',
    iconColor: '#b0d0e8',
    iconLetter: 'M',
  },
  {
    id: 'opensearch',
    name: 'OpenSearch®',
    description: 'OpenSearch - Distributed real-time search and analytics',
    iconColor: '#a8d0f0',
    iconLetter: 'O',
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse®',
    description: 'ClickHouse - Fast resource-effective data warehouse for analytical workloads',
    iconColor: '#faf0c8',
    iconLetter: 'C',
  },
  {
    id: 'dragonfly',
    name: 'Dragonfly',
    description: 'Dragonfly - Scalable in-memory data store for high-performance workloads',
    iconColor: '#d4c4e8',
    iconLetter: 'D',
  },
  {
    id: 'metrics',
    name: 'Aiven for Metrics',
    description: 'Thanos Metrics - Scalable Prometheus query solution',
    iconColor: '#c9b8e8',
    iconLetter: 'T',
  },
  {
    id: 'grafana',
    name: 'Grafana®',
    description: 'Grafana - Data visualization and analytics platform',
    iconColor: '#fae0c8',
    iconLetter: 'G',
  },
]

export function getServiceTypeDisplayName(id: ServiceTypeId): string {
  return SERVICE_TYPES.find((s) => s.id === id)?.name ?? id
}

const LEGAL_FOOTER =
  'Apache, Apache Kafka, Kafka, Apache Flink, Flink, Apache Cassandra, and Cassandra are either registered trademarks or trademarks of the Apache Software Foundation in the United States and/or other countries. ClickHouse, OpenSearch, AlloyDB Omni, PostgreSQL, MySQL, Grafana, Dragonfly, Valkey, Terraform, and Kubernetes are trademarks and property of their respective owners. All product and service names used in this website are for identification purposes only and do not imply endorsement.'

type ServiceTypeSelectModalProps = {
  open: boolean
  onClose: () => void
  onSelectService: (serviceType: ServiceTypeId) => void
}

function ServiceIcon({ color, letter }: { color: string; letter: string }) {
  return (
    <Box
      aria-hidden="true"
      style={{
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: color,
        color: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {letter}
    </Box>
  )
}

ServiceIcon.displayName = 'ServiceIcon'

function ServiceTypeSelectModal({
  open,
  onClose,
  onSelectService,
}: ServiceTypeSelectModalProps) {
  return (
    <Modal
      title="Select service type"
      subtitle={
        <Box style={{ color: '#4a4b57' }}>
          <Typography.Small>Project: ux-tests · Organization: BigCo Ltd.</Typography.Small>
        </Box>
      }
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
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3545be'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(53, 69, 190, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <ServiceIcon color={service.iconColor} letter={service.iconLetter} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Typography.DefaultStrong>{service.name}</Typography.DefaultStrong>
                  {service.id === 'mysql' && (
                    <StatusChip text="New flexible pricing" status="success" />
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
      <Box style={{ paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
        <Box style={{ color: '#787885' }}>
          <Typography.Caption>{LEGAL_FOOTER}</Typography.Caption>
        </Box>
      </Box>
    </Modal>
  )
}

ServiceTypeSelectModal.displayName = 'ServiceTypeSelectModal'

export default ServiceTypeSelectModal
