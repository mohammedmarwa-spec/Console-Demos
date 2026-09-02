'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Box, Button, ChoiceChip, ChoiceChipGroup } from '@aivenio/aquarium'
import downloadIcon from '@aivenio/aquarium/icons/download'
import refreshIcon from '@aivenio/aquarium/icons/refresh'
import maximizeIcon from '@aivenio/aquarium/icons/maximize'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import {
  buildArchitectureEdges,
  buildArchitectureNodes,
  filterArchitecture,
  type ArchitectureView,
} from './architectureGraph'
import { useProjectPageData } from './ProjectPageDataContext'
import { ArchitectureServiceNode } from './ArchitectureServiceNode'
import { ArchitectureLabeledEdge } from './ArchitectureLabeledEdge'

const nodeTypes = {
  architectureService: ArchitectureServiceNode,
}

const edgeTypes = {
  architectureLabeled: ArchitectureLabeledEdge,
}

const VIEW_OPTIONS: { id: ArchitectureView; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'integrated', label: 'Integrated' },
  { id: 'standalone', label: 'Standalone' },
]

function LayoutButtonWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 4,
        backgroundColor: 'var(--aquarium-background-color-layer)',
      }}
    >
      {children}
    </Box>
  )
}

LayoutButtonWrapper.displayName = 'LayoutButtonWrapper'

function ArchitectureFlowInner({
  view,
  showAlerts,
}: {
  view: ArchitectureView
  showAlerts: boolean
}) {
  const { services, architectureEdges } = useProjectPageData()
  const resolvedTheme = useResolvedTheme()

  const filtered = useMemo(
    () => filterArchitecture(services, architectureEdges, view),
    [architectureEdges, services, view],
  )

  const initialNodes = useMemo(
    () => buildArchitectureNodes(filtered.services, { showAlerts }),
    [filtered.services, showAlerts],
  )
  const initialEdges = useMemo(
    () => buildArchitectureEdges(filtered.edges),
    [filtered.edges],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onRefresh = useCallback(() => {
    setNodes(buildArchitectureNodes(filtered.services, { showAlerts }))
    setEdges(buildArchitectureEdges(filtered.edges))
  }, [filtered.edges, filtered.services, setEdges, setNodes, showAlerts])

  return (
    <Box
      className="architecture-flow"
      style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        overflow: 'hidden',
        backgroundColor: 'var(--aquarium-background-color-body)',
        position: 'relative',
        ['--xy-controls-button-background-color' as string]:
          'var(--aquarium-background-color-layer)',
        ['--xy-controls-button-background-color-hover' as string]:
          'var(--aquarium-background-color-body)',
        ['--xy-controls-button-color' as string]: 'var(--aquarium-text-color-default)',
        ['--xy-controls-button-color-hover' as string]: 'var(--aquarium-text-color-default)',
        ['--xy-controls-button-border-color' as string]: 'var(--aquarium-border-color-muted)',
        ['--xy-controls-box-shadow' as string]: 'none',
      }}
    >
      <style>{`
        .architecture-flow .react-flow__controls {
          border: 1px solid var(--aquarium-border-color-muted);
          border-radius: 4px;
          overflow: hidden;
          background: var(--aquarium-background-color-layer);
        }
        .architecture-flow .react-flow__controls-button {
          background: var(--aquarium-background-color-layer);
          color: var(--aquarium-text-color-default);
          border-bottom-color: var(--aquarium-border-color-muted);
        }
        .architecture-flow .react-flow__controls-button:hover {
          background: var(--aquarium-background-color-body);
          color: var(--aquarium-text-color-default);
        }
        .architecture-flow .react-flow__controls-button svg {
          fill: currentColor;
        }
      `}</style>
      <ReactFlow
        style={{ width: '100%', height: '100%' }}
        colorMode={resolvedTheme}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'architectureLabeled',
          style: {
            stroke: 'var(--aquarium-border-color-primary-default)',
            strokeWidth: 2,
          },
        }}
      >
        <Background color="var(--aquarium-border-color-muted)" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="var(--aquarium-border-color-primary-muted)"
          maskColor="color-mix(in srgb, var(--aquarium-background-color-body) 70%, transparent)"
          pannable
          zoomable
          style={{
            border: '1px solid var(--aquarium-border-color-muted)',
            borderRadius: 8,
            backgroundColor: 'var(--aquarium-background-color-body)',
          }}
        />
        <Panel position="top-right">
          <Box style={{ display: 'flex', gap: 8 }}>
            <LayoutButtonWrapper>
              <Button.Icon
                type="button"
                icon={downloadIcon}
                aria-label="Download image"
                tooltip="Download the diagram as image"
                onClick={() => {
                  /* stub */
                }}
              />
            </LayoutButtonWrapper>
            <LayoutButtonWrapper>
              <Button.Icon
                type="button"
                icon={refreshIcon}
                aria-label="Reset layout"
                tooltip="Reset layout"
                onClick={onRefresh}
              />
            </LayoutButtonWrapper>
            <LayoutButtonWrapper>
              <Button.Icon
                type="button"
                icon={maximizeIcon}
                aria-label="Toggle fullscreen"
                tooltip="Toggle fullscreen"
                onClick={() => {
                  /* stub */
                }}
              />
            </LayoutButtonWrapper>
          </Box>
        </Panel>
      </ReactFlow>
    </Box>
  )
}

ArchitectureFlowInner.displayName = 'ArchitectureFlowInner'

export type ArchitectureContentProps = {
  /** When false, hides All / Integrated / Standalone chips (e.g. org Data flow page). Default true. */
  showViewFilter?: boolean
  /** Controlled view. When omitted, uses internal state from `defaultView`. */
  view?: ArchitectureView
  defaultView?: ArchitectureView
  onViewChange?: (view: ArchitectureView) => void
  /** When true, nodes with `hasAlerts` show warning border + icon. */
  showAlerts?: boolean
}

/** Project Architecture tab — React Flow canvas with services on a grid + mock integrations. */
export function ArchitectureContent({
  showViewFilter = true,
  view: controlledView,
  defaultView = 'integrated',
  onViewChange,
  showAlerts = false,
}: ArchitectureContentProps = {}) {
  const [uncontrolledView, setUncontrolledView] = useState<ArchitectureView>(defaultView)
  const view = controlledView ?? uncontrolledView

  const setView = (next: ArchitectureView) => {
    if (controlledView === undefined) setUncontrolledView(next)
    onViewChange?.(next)
  }

  return (
    <Box
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {showViewFilter ? (
        <Box style={{ flexShrink: 0 }}>
          <ChoiceChipGroup
            name="architecture-view"
            selectionMode="radio"
            value={view}
            onChange={(value) => setView(value as ArchitectureView)}
            aria-label="Architecture view"
          >
            {VIEW_OPTIONS.map((option) => (
              <ChoiceChip key={option.id} value={option.id} dense>
                {option.label}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
        </Box>
      ) : null}
      <ReactFlowProvider>
        <ArchitectureFlowInner key={`${view}-${showAlerts}`} view={view} showAlerts={showAlerts} />
      </ReactFlowProvider>
    </Box>
  )
}

ArchitectureContent.displayName = 'ArchitectureContent'
