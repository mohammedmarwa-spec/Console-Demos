import { Box, Icon } from '@aivenio/aquarium'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import { getAivenIcon } from '../lib/aivenIcon'

const CRAB_ASPECT = 230 / 202

export function AivenConsoleLogo({ width = 32 }: { width?: number }) {
  const theme = useResolvedTheme()
  const height = Math.round(width / CRAB_ASPECT)

  return (
    <Box
      aria-label="Aiven"
      style={{
        flexShrink: 0,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon
        icon={getAivenIcon(theme)}
        style={{ width, height, display: 'block', flexShrink: 0 }}
      />
    </Box>
  )
}

AivenConsoleLogo.displayName = 'AivenConsoleLogo'
