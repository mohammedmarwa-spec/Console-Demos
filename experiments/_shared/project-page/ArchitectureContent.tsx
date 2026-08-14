'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
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
import { Box, Button } from '@aivenio/aquarium'
import downloadIcon from '@aivenio/aquarium/icons/download'
import refreshIcon from '@aivenio/aquarium/icons/refresh'
import maximizeIcon from '@aivenio/aquarium/icons/maximize'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import { buildArchitectureEdges, buildArchitectureNodes } from './architectureGraph'
import { useProjectPageData } from './ProjectPageDataContext'
import { ArchitectureServiceNode } from './ArchitectureServiceNode'
import { ArchitectureLabeledEdge } from './ArchitectureLabeledEdge'

const nodeTypes = {
  architectureService: ArchitectureServiceNode,
}

const edgeTypes = {
  architectureLabeled: ArchitectureLabeledEdge,
}

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

function ArchitectureFlowInner() {
  const { services, architectureEdges } = useProjectPageData()
  const resolvedTheme = useResolvedTheme()

  const initialNodes = useMemo(() => buildArchitectureNodes(services), [services])
  const initialEdges = useMemo(
    () => buildArchitectureEdges(architectureEdges),
    [architectureEdges],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onRefresh = useCallback(() => {
    setNodes(buildArchitectureNodes(services))
    setEdges(buildArchitectureEdges(architectureEdges))
  }, [architectureEdges, services, setEdges, setNodes])

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

/** Project Architecture tab — React Flow canvas with services on a grid + mock integrations. */
export function ArchitectureContent() {
  return (
    <Box style={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ReactFlowProvider>
        <ArchitectureFlowInner />
      </ReactFlowProvider>
    </Box>
  )
}

ArchitectureContent.displayName = 'ArchitectureContent'
