import type { ReactNode } from 'react'
import { Box, Button, Link } from '@aivenio/aquarium'
import helpIcon from '@aivenio/aquarium/icons/help'
import { AivenConsoleLogo } from '../../components/ConsoleHeader'
import { OnboardingFooter } from './OnboardingFooter'

export type OnboardingTestEnvShellProps = {
  children: ReactNode
  userInitials: string
  onSkip: () => void
}

function HeaderIconButton({ label, icon }: { label: string; icon: typeof helpIcon }) {
  return (
    <Button.Icon
      type="button"
      dense
      aria-label={label}
      icon={icon}
      style={{ flexShrink: 0 }}
    />
  )
}

HeaderIconButton.displayName = 'HeaderIconButton'

function UserAvatar({ initials }: { initials: string }) {
  return (
    <Box
      aria-hidden
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--aquarium-text-color-opposite-default)',
        fontSize: 10,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  )
}

UserAvatar.displayName = 'UserAvatar'

/** Onboarding shell with skip, help, and user actions in the header. */
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
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          padding: '8px 16px',
          borderBottom: '1px solid var(--aquarium-border-color-muted)',
        }}
      >
        <AivenConsoleLogo />
        <Box style={{ flex: 1 }} />
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Link href="#" onClick={(e) => { e.preventDefault(); onSkip() }}>
            Skip and set up later
          </Link>
          <HeaderIconButton label="Help" icon={helpIcon} />
          <UserAvatar initials={userInitials} />
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
