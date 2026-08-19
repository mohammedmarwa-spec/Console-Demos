import type { Edge, Node } from '@xyflow/react'
import type { ArchitectureEdgeMock, ArchitectureNodeData, ServiceListRow } from './types'

const GRID_COLS = 4
const NODE_WIDTH = 260
const GAP_X = 72
const GAP_Y = 88
const ORIGIN_X = 32
const ORIGIN_Y = 32
const NODE_HEIGHT = 96

function gridPosition(index: number): { x: number; y: number } {
  const col = index % GRID_COLS
  const row = Math.floor(index / GRID_COLS)
  return {
    x: ORIGIN_X + col * (NODE_WIDTH + GAP_X),
    y: ORIGIN_Y + row * (NODE_HEIGHT + GAP_Y),
  }
}

export function buildArchitectureNodes(
  services: ServiceListRow[],
): Node<ArchitectureNodeData>[] {
  return services.map((service, index) => ({
    id: service.id,
    type: 'architectureService',
    position: gridPosition(index),
    data: { service },
    style: { width: NODE_WIDTH },
  }))
}

export function buildArchitectureEdges(edges: ArchitectureEdgeMock[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    type: edge.type ?? 'architectureLabeled',
  }))
}

export function getConnectedServiceIds(edges: ArchitectureEdgeMock[]): Set<string> {
  const ids = new Set<string>()
  for (const edge of edges) {
    ids.add(edge.source)
    ids.add(edge.target)
  }
  return ids
}

export type ArchitectureView = 'all' | 'integrated' | 'standalone'

export function filterArchitecture(
  services: ServiceListRow[],
  edges: ArchitectureEdgeMock[],
  view: ArchitectureView,
): { services: ServiceListRow[]; edges: ArchitectureEdgeMock[] } {
  if (view === 'all') {
    return { services, edges }
  }

  const connectedIds = getConnectedServiceIds(edges)

  if (view === 'integrated') {
    return {
      services: services.filter((service) => connectedIds.has(service.id)),
      edges,
    }
  }

  return {
    services: services.filter((service) => !connectedIds.has(service.id)),
    edges: [],
  }
}
