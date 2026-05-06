import { Alert, Box, Link, Modal, StatusChip } from '@aivenio/aquarium'
import type { ServiceRow } from './ProjectServices'

type ComparePricingModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  service?: ServiceRow | null
}

function specLine(service?: ServiceRow | null): string {
  const nodes = service?.nodeCount ?? 3
  const cpu = service?.cpuCount ?? 4
  const ram = service?.ramCapacity ?? '16 GB'
  const storage = service?.storageCapacity ?? '480 GB'
  return `${nodes} nodes · ${cpu} vCPU · ${ram} RAM · ${storage} disk`
}

function BulletRow({ text }: { text: string }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 14, lineHeight: '20px', color: '#4a4b57', flexShrink: 0 }}>•</span>
      <span style={{ fontSize: 14, lineHeight: '20px', color: '#4a4b57' }}>{text}</span>
    </Box>
  )
}

export function ComparePricingModal({ open, onClose, onConfirm, service }: ComparePricingModalProps) {
  const spec = specLine(service)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Compare pricing models"
      subtitle={
        <>
          We introduce new flexible pricing, allowing to fine-tune amount of CPU/RAM and storage.{' '}
          <Link href="#">Learn more</Link>
        </>
      }
      primaryAction={{ text: 'Switch to new pricing', onClick: onConfirm }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Comparison columns ── */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Left: Fixed plan */}
          <Box style={{ border: '1px solid var(--aquarium-border-color-muted)', borderRadius: 8, overflow: 'hidden' }}>
            {/* Header */}
            <Box style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--aquarium-border-color-muted)',
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, lineHeight: '24px' }}>{spec}</span>
              <Box style={{ flexShrink: 0 }}>
                <StatusChip text="Fixed plan" status="neutral" dense />
              </Box>
            </Box>

            {/* Body */}
            <Box style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Fixed plan resources', 'Network egress included'].map((item) => (
                  <BulletRow key={item} text={item} />
                ))}
              </Box>
              <Box style={{ marginTop: 24 }}>
                <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>$360 USD/month</span>
              </Box>
            </Box>
          </Box>

          {/* Right: New pricing */}
          <Box style={{ border: '1px solid var(--aquarium-border-color-muted)', borderRadius: 8, overflow: 'hidden' }}>
            {/* Header */}
            <Box style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--aquarium-border-color-muted)',
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, lineHeight: '24px' }}>{spec}</span>
              <Box style={{ flexShrink: 0 }}>
                <StatusChip text="New pricing" status="success" dense />
              </Box>
            </Box>

            {/* Body */}
            <Box style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Flexible CPU/RAM ratios to match your workload type',
                  'Configurable disk storage',
                  'Configurable disk type',
                ].map((item) => (
                  <BulletRow key={item} text={item} />
                ))}
              </Box>
              <Box style={{ marginTop: 24 }}>
                <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>$320 USD/month + network egress</span>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Info alert ── */}
        <Alert type="information">
          Migration to the new pricing will not cause any service downtime and does not require node rebuilding.
        </Alert>

      </Box>
    </Modal>
  )
}
