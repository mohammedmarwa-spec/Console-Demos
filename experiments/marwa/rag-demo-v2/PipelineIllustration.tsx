'use client'

import { Fragment, type ReactNode } from 'react'
import { Box, Chip, Icon, Typography } from '@aivenio/aquarium'
import documentIcon from '@aivenio/aquarium/icons/document'
import databaseIcon from '@aivenio/aquarium/icons/database'
import searchIcon from '@aivenio/aquarium/icons/search'
import lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import {
  RAG_EMBEDDING_MODEL,
  RAG_EMBEDDING_MODEL_SHORT,
  RAG_LLM_MODEL,
  RAG_LLM_MODEL_SHORT,
} from './ragDemo'

const COLOR = {
  teal: 'var(--aquarium-chart-colors-primary-categorical-0)',
  magenta: 'var(--aquarium-chart-colors-primary-categorical-1)',
  yellow: 'var(--aquarium-chart-colors-primary-categorical-3)',
  lilac: 'var(--aquarium-chart-colors-primary-categorical-4)',
} as const

type Node = {
  icon: typeof documentIcon
  color: string
  label: string
  detail?: ReactNode
}

const CIRCLE = 32

function PipelineNode({ icon, color, label, detail }: Node) {
  return (
    <Box.Flex alignItems="center" gap="3" style={{ minWidth: 0 }}>
      <Box.Flex
        alignItems="center"
        justifyContent="center"
        style={{
          width: CIRCLE,
          height: CIRCLE,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: color,
          color: 'var(--aquarium-colors-white)',
        }}
      >
        <Icon icon={icon} width={16} height={16} />
      </Box.Flex>
      <Box.Flex alignItems="center" flexWrap="wrap" gap="3" style={{ minWidth: 0 }}>
        <Typography.SmallStrong color="white">{label}</Typography.SmallStrong>
        {detail}
      </Box.Flex>
    </Box.Flex>
  )
}

function Connector() {
  return (
    <Box
      aria-hidden
      style={{ height: 10, marginLeft: CIRCLE / 2 - 0.75, borderLeft: `1.5px dashed ${COLOR.teal}` }}
    />
  )
}

const NODES: Node[] = [
  { icon: documentIcon, color: COLOR.yellow, label: 'Your documents' },
  {
    icon: databaseIcon,
    color: COLOR.lilac,
    label: 'Embedded',
    detail: <Chip dense text={RAG_EMBEDDING_MODEL_SHORT} />,
  },
  { icon: searchIcon, color: COLOR.teal, label: 'Indexed in OpenSearch' },
  {
    icon: lightbulbIcon,
    color: COLOR.magenta,
    label: 'Answer with sources',
    detail: <Chip dense text={RAG_LLM_MODEL_SHORT} />,
  },
]

/** How the demo works in four stages, top to bottom. Locked model chips sit at the stage that uses each model. */
export function PipelineIllustration() {
  return (
    <Box.Flex
      flexDirection="column"
      gap="1"
      role="img"
      aria-label={`Your documents are split into chunks, embedded with ${RAG_EMBEDDING_MODEL} and indexed in OpenSearch. Your question retrieves the closest chunks and ${RAG_LLM_MODEL} writes the answer with sources.`}
    >
      {NODES.map((node, index) => (
        <Fragment key={node.label}>
          {index > 0 ? <Connector /> : null}
          <PipelineNode {...node} />
        </Fragment>
      ))}
    </Box.Flex>
  )
}

PipelineIllustration.displayName = 'PipelineIllustration'
