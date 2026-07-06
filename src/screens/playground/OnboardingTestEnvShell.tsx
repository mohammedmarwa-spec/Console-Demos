import type { ReactNode } from 'react'
import { Box, Button, Divider } from '@aivenio/aquarium'
import helpIcon from '@aivenio/aquarium/icons/help'
import { AivenConsoleLogo } from '../../components/ConsoleHeader'
import { OnboardingFooter } from './OnboardingFooter'

export type OnboardingTestEnvShellProps = {
  children: ReactNode
  userInitials: string
  onSkip: () => void
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <Box
      aria-hidden
      style={{
        width: 35,
        height: 35,
        borderRadius: '50%',
        backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--aquarium-text-color-opposite-default)',
        fontSize: 13,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  )
}

UserAvatar.displayName = 'UserAvatar'

/** Onboarding shell — Console Header (New) from Figma node 20687:6769. */
export function OnboardingTestEnvShell({ children, userInitials, onSkip }: OnboardingTestEnvShellProps) {
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
          height: 66,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 24,
          borderBottom: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <AivenConsoleLogo />
        <Box style={{ flex: 1 }} />
        <Box style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <Button.Ghost type="button" onClick={onSkip}>
            Skip and setup later
          </Button.Ghost>
          <Box
            aria-hidden
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'stretch',
              paddingBlock: 11,
            }}
          >
            <Divider direction="vertical" />
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Button.Icon type="button" aria-label="Help" icon={helpIcon} />
            <UserAvatar initials={userInitials} />
          </Box>
        </Box>
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

OnboardingTestEnvShell.displayName = 'OnboardingTestEnvShell'
