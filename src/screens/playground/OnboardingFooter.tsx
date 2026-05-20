import { Box, Icon } from '@aivenio/aquarium'
import helpIcon from '@aivenio/aquarium/icons/help'
import settingsIcon from '@aivenio/aquarium/icons/settings'

function FooterIconButton({ icon, label }: { icon: typeof helpIcon; label: string }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      style={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 4,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        cursor: 'pointer',
        color: 'var(--aquarium-text-color-muted)',
      }}
    >
      <Icon icon={icon} style={{ width: 16, height: 16 }} />
    </Box>
  )
}

FooterIconButton.displayName = 'FooterIconButton'

function FooterPlaceholderButton() {
  return (
    <Box
      aria-hidden
      style={{
        width: 36,
        height: 36,
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 4,
        backgroundColor: 'var(--aquarium-background-color-layer)',
      }}
    />
  )
}

FooterPlaceholderButton.displayName = 'FooterPlaceholderButton'

/** Shared footer for all onboarding / playground shell screens. */
export function OnboardingFooter() {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        borderTop: '1px solid var(--aquarium-border-color-muted)',
        paddingTop: 12,
      }}
    >
      <Box
        aria-hidden
        style={{
          height: 14,
          width: 338,
          maxWidth: '100%',
          borderRadius: 4,
          backgroundColor: 'var(--aquarium-background-color-muted)',
          opacity: 0.6,
        }}
      />
      <Box style={{ display: 'flex', gap: 10 }}>
        <FooterIconButton icon={helpIcon} label="Help" />
        <FooterIconButton icon={settingsIcon} label="Settings" />
        <FooterPlaceholderButton />
        <FooterPlaceholderButton />
      </Box>
    </Box>
  )
}

OnboardingFooter.displayName = 'OnboardingFooter'
