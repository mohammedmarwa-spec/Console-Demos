import { Box } from '@aivenio/aquarium'
import kafkaIcon from '../assets/service-icons/kafka.png'
import kafkaIconLight from '../assets/service-icons/kafka-blk.png'
import postgresqlIcon from '../assets/service-icons/postgresql.png'
import postgresqlIconLight from '../assets/service-icons/postgresql-blk.png'
import clickhouseIcon from '../assets/service-icons/clickhouse.png'
import clickhouseIconLight from '../assets/service-icons/clickhouse-blk.png'
import opensearchIcon from '../assets/service-icons/opensearch.png'
import opensearchIconLight from '../assets/service-icons/opensearch-blk.png'
import valkeyIcon from '../assets/service-icons/valkey.png'
import valkeyIconLight from '../assets/service-icons/valkey-blk.png'
import mysqlIcon from '../assets/service-icons/mysql.png'
import mysqlIconLight from '../assets/service-icons/mysql-blk.png'
import metricsIcon from '../assets/service-icons/metrics.png'
import metricsIconLight from '../assets/service-icons/metrics-blk.png'
import grafanaIcon from '../assets/service-icons/grafana.png'
import grafanaIconLight from '../assets/service-icons/grafana-blk.png'
import genericIcon from '../assets/service-icons/generic.png'
import genericIconLight from '../assets/service-icons/generic-blk.png'

import { imageSrc, type ImageSource } from '../lib/image'
import type { ServiceTypeId } from '../lib/serviceTypes'
import { useResolvedTheme, type ResolvedTheme } from '@/theme/ThemeProvider'

/** Circular icon fill — lighter grey surface token from Aquarium. */
export const SERVICE_ICON_BACKGROUND = 'var(--aquarium-background-color-muted)'

type IconSource = ImageSource

function iconSrc(icon: IconSource): string {
  return imageSrc(icon)
}

const ICON_URLS_DARK: Record<ServiceTypeId, IconSource> = {
  postgresql: postgresqlIcon,
  kafka: kafkaIcon,
  valkey: valkeyIcon,
  mysql: mysqlIcon,
  opensearch: opensearchIcon,
  clickhouse: clickhouseIcon,
  dragonfly: genericIcon,
  metrics: metricsIcon,
  grafana: grafanaIcon,
  redis: valkeyIcon,
  flink: kafkaIcon,
  m3db: metricsIcon,
}

const ICON_URLS_LIGHT: Record<ServiceTypeId, IconSource> = {
  postgresql: postgresqlIconLight,
  kafka: kafkaIconLight,
  valkey: valkeyIconLight,
  mysql: mysqlIconLight,
  opensearch: opensearchIconLight,
  clickhouse: clickhouseIconLight,
  dragonfly: genericIconLight,
  metrics: metricsIconLight,
  grafana: grafanaIconLight,
  redis: valkeyIconLight,
  flink: kafkaIconLight,
  m3db: metricsIconLight,
}

function iconMapForTheme(theme: ResolvedTheme): Record<ServiceTypeId, IconSource> {
  return theme === 'light' ? ICON_URLS_LIGHT : ICON_URLS_DARK
}

/**
 * Returns the URL for a service type icon for the given theme.
 * Dark mode: white logomark; light mode: black logomark (Figma blk variants).
 */
export function getServiceIconUrl(
  serviceTypeId: ServiceTypeId | null | undefined,
  theme: ResolvedTheme = 'dark',
): string {
  const map = iconMapForTheme(theme)
  if (serviceTypeId && serviceTypeId in map) {
    return iconSrc(map[serviceTypeId])
  }
  return iconSrc(theme === 'light' ? genericIconLight : genericIcon)
}

type ServiceIconProps = {
  serviceTypeId: ServiceTypeId | null | undefined
  size?: number
  /** Override alt text; defaults to the service type id. */
  alt?: string
  style?: React.CSSProperties
}

/** Renders a service icon with a muted grey circular background. */
export function ServiceIcon({ serviceTypeId, size = 40, alt, style }: ServiceIconProps) {
  const resolved = useResolvedTheme()

  return (
    <Box
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: SERVICE_ICON_BACKGROUND,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={getServiceIconUrl(serviceTypeId, resolved)}
        width={size}
        height={size}
        alt={alt ?? (serviceTypeId ?? 'service icon')}
        style={{ display: 'block', ...style }}
      />
    </Box>
  )
}

ServiceIcon.displayName = 'ServiceIcon'
