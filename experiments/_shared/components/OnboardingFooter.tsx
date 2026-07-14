import { Box, Icon, Link, Typography } from '@aivenio/aquarium'
import containerIcon from '@aivenio/aquarium/icons/container'
import terraformIcon from '@aivenio/aquarium/icons/terraform'
import type lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'

const AIVEN_DEV_TOOL_LINKS = {
  kubernetes: 'https://aiven.io/docs/tools/aiven-kubernetes-operator',
  terraform: 'https://aiven.io/docs/tools/terraform',
  api: 'https://aiven.io/docs/tools/api',
  mcp: 'https://aiven.io/docs/tools/mcp-server',
} as const

const FOOTER_LINK_STYLE = {
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--aquarium-border-color-muted)',
  borderRadius: 4,
  backgroundColor: 'var(--aquarium-background-color-layer)',
  color: 'var(--aquarium-text-color-muted)',
  textDecoration: 'none',
  flexShrink: 0,
} as const

function FooterIconLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: typeof lightbulbIcon
  label: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={FOOTER_LINK_STYLE}
    >
      <Icon icon={icon} style={{ width: 16, height: 16 }} />
    </Link>
  )
}

FooterIconLink.displayName = 'FooterIconLink'

function FooterTextLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        ...FOOTER_LINK_STYLE,
        fontFamily: '"Roboto Mono", monospace',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.4px',
      }}
    >
      {label}
    </Link>
  )
}

FooterTextLink.displayName = 'FooterTextLink'

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
      <Box style={{ textAlign: 'center', padding: '0 8px', whiteSpace: 'nowrap' }}>
        <Typography.Small color="muted">
          Start with Console, manage with Aiven developer tools later
        </Typography.Small>
      </Box>
      <Box style={{ display: 'flex', gap: 10 }}>
        <FooterIconLink href={AIVEN_DEV_TOOL_LINKS.kubernetes} icon={containerIcon} label="Aiven Kubernetes Operator" />
        <FooterIconLink href={AIVEN_DEV_TOOL_LINKS.terraform} icon={terraformIcon} label="Aiven Terraform Provider" />
        <FooterTextLink href={AIVEN_DEV_TOOL_LINKS.api} label="API" />
        <FooterTextLink href={AIVEN_DEV_TOOL_LINKS.mcp} label="MCP" />
      </Box>
    </Box>
  )
}

OnboardingFooter.displayName = 'OnboardingFooter'
