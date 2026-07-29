'use client'

import { useState } from 'react'
import { Alert, Box, Typography } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { FreeTierServiceSidebar } from './FreeTierServiceSidebar'
import { OverviewContent } from './OverviewContent'
import { ORG_NAME, WEBINAR_ANNOUNCEMENT } from './overviewData'

export const pageMeta: PageMeta = {
  title: 'PG — Free tier — Webinar announcement',
  description:
    'Free-tier PostgreSQL service overview with an Alert.Banner (information) webinar promo under the top header.',
}

export default function Page() {
  const [activeItem, setActiveItem] = useState('overview')
  const [showWebinarBanner, setShowWebinarBanner] = useState(true)

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
        activeNav="projects"
        orgName={ORG_NAME}
        orgSublabel="Organization"
        userInitials="EI"
      />

      {showWebinarBanner ? (
        <Alert.Banner
          type="information"
          title={`🐘 ${WEBINAR_ANNOUNCEMENT.title}`}
          action={{
            text: WEBINAR_ANNOUNCEMENT.registerCta,
            href: WEBINAR_ANNOUNCEMENT.href,
          }}
          onDismiss={() => setShowWebinarBanner(false)}
        >
          {WEBINAR_ANNOUNCEMENT.description} {WEBINAR_ANNOUNCEMENT.schedule}
        </Alert.Banner>
      ) : null}

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <FreeTierServiceSidebar activeItem={activeItem} onNavigate={setActiveItem} />

        {activeItem === 'overview' ? (
          <OverviewContent />
        ) : (
          <Box style={{ flex: 1, padding: 36, overflow: 'auto' }}>
            <Typography.LargeHeading>
              {activeItem.replace(/-/g, ' ')}
            </Typography.LargeHeading>
            <Box style={{ marginTop: 8 }}>
              <Typography.Default color="muted">
                Placeholder — this template focuses on the Free-tier Overview.
              </Typography.Default>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
