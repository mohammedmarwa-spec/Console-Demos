/**
 * Icon + title header with a vertical connector line above the content body.
 * Copied from src/screens/ServiceCreationShared.tsx for experiment reuse.
 */
import { Box, Icon, Typography } from '@aivenio/aquarium'
import type { ComponentProps, ReactNode } from 'react'

const SECTION_ICON_WIDTH = 32
const SECTION_LINE_WIDTH = 1

export function CreationFlowSection({
  icon,
  title,
  children,
  showConnector = true,
}: {
  icon: ComponentProps<typeof Icon>['icon']
  title: string
  children: ReactNode
  /** When false, hides the vertical line under the icon (last section). */
  showConnector?: boolean
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: `${SECTION_ICON_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: 'auto auto',
        columnGap: 16,
        marginBottom: showConnector ? 40 : 0,
        minWidth: 0,
        alignItems: 'start',
      }}
    >
      <Box
        style={{
          width: SECTION_ICON_WIDTH,
          height: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon aria-hidden icon={icon} color="muted" style={{ width: 20, height: 20 }} />
      </Box>

      <Box style={{ minWidth: 0, display: 'flex', alignItems: 'center', paddingTop: 4 }}>
        <Typography.Subheading color="intense" htmlTag="h3">
          {title}
        </Typography.Subheading>
      </Box>

      <Box
        style={{
          paddingTop: 16,
          width: SECTION_ICON_WIDTH,
          minWidth: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        {showConnector ? (
          <Box
            aria-hidden="true"
            style={{
              width: SECTION_LINE_WIDTH,
              minWidth: SECTION_LINE_WIDTH,
              backgroundColor: 'var(--aquarium-border-color-muted)',
              alignSelf: 'stretch',
              minHeight: 40,
            }}
          />
        ) : null}
      </Box>

      <Box style={{ paddingTop: 16, minWidth: 0 }}>{children}</Box>
    </Box>
  )
}

CreationFlowSection.displayName = 'CreationFlowSection'
