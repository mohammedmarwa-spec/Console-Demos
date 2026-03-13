// Service icon assets — raw SVG strings for inline compositing
import pgRaw from '../assets/service-icons/pg.svg?raw'
import kafkaRaw from '../assets/service-icons/kafka.svg?raw'
import opensearchRaw from '../assets/service-icons/opensearch.svg?raw'
import clickhouseRaw from '../assets/service-icons/clickhouse.svg?raw'
import mysqlRaw from '../assets/service-icons/mysql.svg?raw'

// Multi-layer composite parts
import dragonflyBgRaw from '../assets/service-icons/dragonfly-bg.svg?raw'
import dragonflyLogoRaw from '../assets/service-icons/dragonfly-logo.svg?raw'
import valkeyBgRaw from '../assets/service-icons/valkey-bg.svg?raw'
import valkeyLayer2Raw from '../assets/service-icons/valkey-layer2.svg?raw'
import valkeyPathRaw from '../assets/service-icons/valkey-path.svg?raw'
import metricsSymbolRaw from '../assets/service-icons/metrics-symbol.svg?raw'
import grafanaBgRaw from '../assets/service-icons/grafana-bg.svg?raw'
import grafanaLogoRaw from '../assets/service-icons/grafana-logo.svg?raw'

import type { ServiceTypeId } from '../screens/ServiceTypeSelectModal'

// ─── SVG compositing helpers ──────────────────────────────────────────────────

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Strip the outer <svg> wrapper to get the inner content. */
function unwrap(svgStr: string): string {
  return svgStr
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim()
}

/**
 * Prefix all id= and url(#...) references to avoid gradient ID collisions
 * when multiple SVG layers are inlined into a single document.
 */
function prefixIds(svgContent: string, prefix: string): string {
  return svgContent
    .replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
}

type Overlay = {
  raw: string
  /** viewBox of the logo SVG (e.g. "0 0 43.9999 33.1333"). Derived from Figma. */
  viewBox: string
  /** Inset percentages (top/right/bottom/left) as in Figma's CSS inset. */
  inset?: { top: number; right: number; bottom: number; left: number }
}

function makeComposite(bgRaw: string, overlays: Overlay[]): string {
  const SIZE = 56

  const bgContent = prefixIds(unwrap(bgRaw), 'bg_')

  const overlayEls = overlays.map(({ raw, viewBox, inset }, i) => {
    const content = prefixIds(unwrap(raw), `o${i}_`)
    if (!inset) {
      // Full-size overlay (same circle, different gradient on top)
      return `<svg x="0" y="0" width="${SIZE}" height="${SIZE}" viewBox="${viewBox}">${content}</svg>`
    }
    const x = (inset.left / 100) * SIZE
    const y = (inset.top / 100) * SIZE
    const w = SIZE * (1 - (inset.left + inset.right) / 100)
    const h = SIZE * (1 - (inset.top + inset.bottom) / 100)
    return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}">${content}</svg>`
  })

  return svgToDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">${bgContent}${overlayEls.join('')}</svg>`
  )
}

// ─── Pre-computed icon data URIs (module-level, computed once) ────────────────

// Inset values from Figma, logo viewBox dims verified to match exactly.
const ICON_DATA_URIS: Record<ServiceTypeId, string> = {
  postgresql: svgToDataUri(pgRaw),
  kafka:      svgToDataUri(kafkaRaw),
  opensearch: svgToDataUri(opensearchRaw),
  clickhouse: svgToDataUri(clickhouseRaw),
  mysql:      svgToDataUri(mysqlRaw),

  dragonfly: makeComposite(dragonflyBgRaw, [
    { raw: dragonflyLogoRaw, viewBox: '0 0 43.9999 33.1333', inset: { top: 22.42, right: 10.71, bottom: 18.41, left: 10.71 } },
  ]),

  valkey: makeComposite(valkeyBgRaw, [
    { raw: valkeyLayer2Raw, viewBox: '0 0 56 56' },
    { raw: valkeyPathRaw, viewBox: '0 0 36 41.5916', inset: { top: 12.5, right: 17.86, bottom: 13.23, left: 17.86 } },
  ]),

  // Thanos/Metrics shares the Valkey gradient background
  metrics: makeComposite(valkeyBgRaw, [
    { raw: metricsSymbolRaw, viewBox: '0 0 32 30', inset: { top: 26.79, right: 21.43, bottom: 19.64, left: 21.43 } },
  ]),

  grafana: makeComposite(grafanaBgRaw, [
    { raw: grafanaLogoRaw, viewBox: '0 0 39.9406 39.1386', inset: { top: 10.5, right: 11.7, bottom: 19.61, left: 16.98 } },
  ]),
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the data URI for a service type icon.
 * Safe to use as <img src>, PageHeader image, or DataTable image prop.
 */
export function getServiceIconUrl(serviceTypeId: ServiceTypeId | null | undefined): string {
  if (serviceTypeId && serviceTypeId in ICON_DATA_URIS) {
    return ICON_DATA_URIS[serviceTypeId]
  }
  return ICON_DATA_URIS.postgresql
}

type ServiceIconProps = {
  serviceTypeId: ServiceTypeId | null | undefined
  size?: number
  /** Override alt text; defaults to the service type id. */
  alt?: string
  style?: React.CSSProperties
}

/** Renders a service icon as an <img> element. Drop-in for any JSX context. */
export function ServiceIcon({ serviceTypeId, size = 40, alt, style }: ServiceIconProps) {
  return (
    <img
      src={getServiceIconUrl(serviceTypeId)}
      width={size}
      height={size}
      alt={alt ?? (serviceTypeId ?? 'service icon')}
      style={{ display: 'block', flexShrink: 0, borderRadius: '50%', ...style }}
    />
  )
}

ServiceIcon.displayName = 'ServiceIcon'
