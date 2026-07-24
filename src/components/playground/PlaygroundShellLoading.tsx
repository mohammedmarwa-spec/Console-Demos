'use client'

import Link from 'next/link'
import { Box, Skeleton, Typography } from '@aivenio/aquarium'
import { ROUTES } from '../../lib/navigation'
import './playground-header.css'

/** Shown while the client-only PlaygroundShell chunk downloads. */
export function PlaygroundShellLoading() {
  return (
    <div className="playground-shell-loading">
      <header className="playground-header">
        <div className="playground-header__inner">
          <div className="playground-header__start">
            <Link href={ROUTES.hub} className="playground-header__back">
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <Box
        className="playground-shell-loading__body"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Skeleton width={40} height={40} rounded />
        <Typography.Small color="muted">Loading prototype…</Typography.Small>
      </Box>
    </div>
  )
}

PlaygroundShellLoading.displayName = 'PlaygroundShellLoading'
