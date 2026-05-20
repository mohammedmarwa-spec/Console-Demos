import type { ReactNode } from 'react'
import { Box } from '@aivenio/aquarium'
import { AivenConsoleLogo } from '../../components/ConsoleHeader'
import { OnboardingFooter } from './OnboardingFooter'

export type PlaygroundShellProps = {
  children: ReactNode
}

/**
 * Minimal onboarding shell: logo header + scrollable body + unified footer.
 */
export function PlaygroundShell({ children }: PlaygroundShellProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box
        component="header"
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '14px 24px 15px',
          borderBottom: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
        }}
      >
        <AivenConsoleLogo />
      </Box>

      <Box style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</Box>

      <Box
        component="footer"
        style={{
          flexShrink: 0,
          padding: '0 24px 16px',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <OnboardingFooter />
      </Box>
    </Box>
  )
}

PlaygroundShell.displayName = 'PlaygroundShell'
