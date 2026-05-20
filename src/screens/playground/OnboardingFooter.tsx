import { Box, Icon, Typography } from '@aivenio/aquarium'
import containerIcon from '@aivenio/aquarium/icons/container'
import terraformIcon from '@aivenio/aquarium/icons/terraform'
import type lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'

const FOOTER_BUTTON_STYLE = {
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--aquarium-border-color-muted)',
  borderRadius: 4,
  backgroundColor: 'var(--aquarium-background-color-layer)',
  cursor: 'default',
  color: 'var(--aquarium-text-color-muted)',
} as const

function FooterIconButton({ icon, label }: { icon: typeof lightbulbIcon; label: string }) {
  return (
    <Box component="button" type="button" aria-label={label} style={FOOTER_BUTTON_STYLE}>
      <Icon icon={icon} style={{ width: 16, height: 16 }} />
    </Box>
  )
}

FooterIconButton.displayName = 'FooterIconButton'

function FooterTextButton({ label }: { label: string }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      style={{
        ...FOOTER_BUTTON_STYLE,
        fontFamily: '"Roboto Mono", monospace',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.4px',
      }}
    >
      {label}
    </Box>
  )
}

FooterTextButton.displayName = 'FooterTextButton'

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
      <Box style={{ textAlign: 'center', maxWidth: 338, padding: '0 8px' }}>
        <Typography.Small color="muted">
          Start with Console, manage with Aiven developer tools later
        </Typography.Small>
      </Box>
      <Box style={{ display: 'flex', gap: 10 }}>
        <FooterIconButton icon={containerIcon} label="Kubernetes" />
        <FooterIconButton icon={terraformIcon} label="Terraform" />
        <FooterTextButton label="API" />
        <FooterTextButton label="MCP" />
      </Box>
    </Box>
  )
}

OnboardingFooter.displayName = 'OnboardingFooter'
