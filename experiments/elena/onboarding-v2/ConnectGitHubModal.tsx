'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, Button, EmptyState, Icon, Modal, Typography } from '@aivenio/aquarium'
import githubLogoIcon from '@aivenio/aquarium/icons/githubLogo'
import smallTickIcon from '@aivenio/aquarium/icons/smallTick'
import { getAivenIcon } from '@experiments/_shared/lib/aivenIcon'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import headerBanner from './assets/scan-application-source-modal-header-banner.svg'

type ModalPhase = 'connect' | 'waiting' | 'success'

export type ConnectGitHubModalProps = {
  open: boolean
  onClose: () => void
  onConnected: () => void
}

function GitHubAivenConnectionGraphic() {
  const theme = useResolvedTheme()
  const aivenIcon = getAivenIcon(theme)

  return (
    <Box
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        width: '100%',
        paddingBlock: 8,
      }}
    >
      <Box
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon icon={githubLogoIcon} style={{ width: 28, height: 28 }} />
      </Box>

      <Box style={{ position: 'relative', width: 72, height: 24, flexShrink: 0 }}>
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            borderTop: '2px dashed var(--aquarium-border-color-muted)',
            transform: 'translateY(-50%)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: 'var(--aquarium-background-color-success-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Icon icon={smallTickIcon} color="success" style={{ width: 12, height: 12 }} />
        </Box>
      </Box>

      <Box
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon icon={aivenIcon} style={{ width: 32, height: 28 }} />
      </Box>
    </Box>
  )
}

GitHubAivenConnectionGraphic.displayName = 'GitHubAivenConnectionGraphic'

/**
 * Mock of Console `ScanApplicationSourceModal` empty state (no VCS integrations).
 * Source: aiven-core SelectSourceEmptyState + Deploy from GitHub modal.
 */
export function ConnectGitHubModal({ open, onClose, onConnected }: ConnectGitHubModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('connect')
  const [isConnecting, setIsConnecting] = useState(false)
  const onCloseRef = useRef(onClose)
  const onConnectedRef = useRef(onConnected)

  useEffect(() => {
    onCloseRef.current = onClose
    onConnectedRef.current = onConnected
  })

  useEffect(() => {
    if (!open) {
      setPhase('connect')
      setIsConnecting(false)
    }
  }, [open])

  useEffect(() => {
    if (phase !== 'waiting') return
    const timer = window.setTimeout(() => {
      setPhase('success')
    }, 1600)
    return () => window.clearTimeout(timer)
  }, [phase])

  // Keep deps to `phase` only — parent often passes inline/unstable callbacks.
  useEffect(() => {
    if (phase !== 'success') return
    const timer = window.setTimeout(() => {
      onConnectedRef.current()
      onCloseRef.current()
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [phase])

  function handleConnect() {
    setIsConnecting(true)
    window.setTimeout(() => {
      setIsConnecting(false)
      setPhase('waiting')
    }, 700)
  }

  function handleClose() {
    if (phase === 'waiting' || phase === 'success') return
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title="Deploy from GitHub"
      headerImage={headerBanner}
    >
      <Box style={{ minHeight: 320, display: 'flex', flexDirection: 'column' }}>
        {phase === 'connect' ? (
          <EmptyState
            title="Connect your GitHub account"
            fullHeight
            image={GitHubAivenConnectionGraphic}
            primaryAction={{
              text: 'Connect GitHub account',
              onClick: handleConnect,
              loading: isConnecting,
            }}
            secondaryAction={{
              text: 'Learn more',
              href: 'https://aiven.io/docs/products/apps/deploy-apps',
              target: '_blank',
            }}
          >
            Give Aiven access to deploy your GitHub repositories. When you connect your account, all users in this
            organization can deploy the selected repositories.
          </EmptyState>
        ) : null}

        {phase === 'waiting' ? (
          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              textAlign: 'center',
              padding: 24,
            }}
          >
            <Typography.DefaultStrong color="intense">
              Waiting for you to finish the setup in the other tab that was opened
            </Typography.DefaultStrong>
            <Typography.Small color="muted">
              This prototype simulates a successful GitHub authorization — no other tab is required.
            </Typography.Small>
            <Button.Ghost dense type="button" onClick={() => setPhase('connect')}>
              Cancel
            </Button.Ghost>
          </Box>
        ) : null}

        {phase === 'success' ? (
          <EmptyState title="GitHub successfully connected" fullHeight borderStyle="none">
            Your organization can now deploy selected repositories on Aiven Runtime.
          </EmptyState>
        ) : null}
      </Box>
    </Modal>
  )
}

ConnectGitHubModal.displayName = 'ConnectGitHubModal'
