'use client'

import { Box, Skeleton, Typography } from '@aivenio/aquarium'

/** Route-level fallback while an experiment page chunk loads (shell already mounted). */
export default function ExperimentsLoading() {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        minHeight: '50vh',
        padding: '48px 24px',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Skeleton width={40} height={40} rounded />
      <Typography.Small color="muted">Loading prototype…</Typography.Small>
    </Box>
  )
}
