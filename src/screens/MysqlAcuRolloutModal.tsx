import { Modal } from '@aivenio/aquarium'

const HEADER_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180"><rect width="600" height="180" fill="#818eec"/></svg>`)}`

type MysqlAcuRolloutModalProps = {
  open: boolean
  onClose: () => void
  onCreateService: () => void
}

export function MysqlAcuRolloutModal({ open, onClose, onCreateService }: MysqlAcuRolloutModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Introducing new pricing for MySQL"
      subtitle={
        <>
          We made it easier to choose the right sized service for your needs.{' '}
          <a href="#" style={{ color: '#3545be' }}>Learn more</a>
        </>
      }
      headerImage={HEADER_IMAGE}
      primaryAction={{ text: 'Create MySQL service', onClick: onCreateService }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <ol style={{ margin: 0, padding: 0, listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Simple service tiers:', detail: '  service configuration is now grouped into Free, Developer, and Professional tiers for easier comparison' },
          { label: 'Familial compute types:', detail: ' select resource ratio to match your workload' },
          { label: 'Fine-grained configuration:', detail: ' flexible compute and storage options' },
        ].map(({ label, detail }) => (
          <li key={label} style={{ color: '#4a4b57', fontSize: 14, lineHeight: '24px' }}>
            <strong>{label}</strong>{detail}
          </li>
        ))}
      </ol>
    </Modal>
  )
}

MysqlAcuRolloutModal.displayName = 'MysqlAcuRolloutModal'
