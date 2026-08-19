'use client'

import { Box } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { HomePageContent } from './HomePageContent'
import { ORG_NAME, USER_INITIALS } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Homepage',
  description:
    'Console Home for an organization — recent projects, project health, platform status, and product updates.',
}

export default function Page() {
  const headerStatus = (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Box
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--aquarium-background-color-success-graphic)',
          flexShrink: 0,
        }}
      />
      <Box style={{ fontSize: 12, lineHeight: '16px', color: 'var(--aquarium-text-color-muted)' }}>
        All systems operational
      </Box>
    </Box>
  )

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 48px)',
        minHeight: 0,
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <ConsoleHeader
        activeNav="home"
        orgName={ORG_NAME}
        orgSublabel="Organization"
        userInitials={USER_INITIALS}
        beforeOrganizationSelector={headerStatus}
        showPrimaryNav={false}
      />
      <HomePageContent />
    </Box>
  )
}
