'use client'

import { useEffect, useRef, useState } from 'react'
import { Modal, Typography } from '@aivenio/aquarium'
import CreateService, { type CreatedServicePayload } from '@/screens/CreateService'
import ServiceTypeSelectModal, {
  getServiceTypeDisplayName,
  type ServiceTypeId,
} from '@/screens/ServiceTypeSelectModal'
import type { ServiceRow } from '@/screens/ProjectServices'
import { OpenSearchDemoCallout } from './OpenSearchDemoCallout'

/**
 * Console Create service shell: Select service type (full Modal) → Create {type}
 * service (full Modal wrapping the shared CreateService form).
 *
 * Matches the playground Console flow in PlaygroundStateContext — type picker,
 * then the priced create form, with Cancel returning to the type picker.
 */

function iconLetterFor(serviceTypeId: ServiceTypeId, displayName: string): string {
  if (serviceTypeId === 'mysql') return 'M'
  if (serviceTypeId === 'postgresql') return 'P'
  if (serviceTypeId === 'opensearch') return 'O'
  if (serviceTypeId === 'kafka') return 'K'
  return displayName.charAt(0)
}

function payloadToRow(data: CreatedServicePayload): ServiceRow {
  const displayName = getServiceTypeDisplayName(data.serviceTypeId)
  const pricingType =
    data.serviceTypeId === 'kafka' ? 'Classic' : data.pricingModel === 'acu' ? 'ACU' : undefined

  return {
    id: data.serviceName,
    serviceName: data.serviceName,
    serviceType: displayName,
    status: 'Running',
    nodes: `Nodes ${data.nodeCount}`,
    nodeCount: data.nodeCount,
    planName: data.planName,
    planDetails: data.planDetails,
    cloudRegion: `${data.cloud}: ${data.region}`,
    location: data.location,
    created: 'Just now',
    createdByInitials: 'ME',
    createdByFullName: 'You',
    iconLetter: iconLetterFor(data.serviceTypeId, displayName),
    serviceTypeId: data.serviceTypeId,
    pricingType,
    cpuCount: data.cpuCount,
    ramCapacity: data.ramCapacity,
    storageCapacity: data.storageCapacity,
    serviceTier: data.serviceTier,
    computeType: data.computeType,
    monthlyPrice: data.monthlyPrice,
    userCreated: true,
  }
}

export function CreateServiceShell({
  open,
  onClose,
  onCreated,
  projectName,
  orgName,
}: {
  open: boolean
  onClose: () => void
  onCreated: (row: ServiceRow, options: { includeVectorDemo: boolean }) => void
  projectName: string
  orgName: string
}) {
  const [step, setStep] = useState<'type' | 'create'>('type')
  const [selectedType, setSelectedType] = useState<ServiceTypeId | null>(null)
  const submitRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    setStep('type')
    setSelectedType(null)
  }, [open])

  const subtitle = (
    <Typography.Small color="muted">
      Project: {projectName} · Organization: {orgName}
    </Typography.Small>
  )

  const createTitle = selectedType
    ? `Create ${getServiceTypeDisplayName(selectedType)} service`
    : 'Create service'

  function handleSelectType(serviceType: ServiceTypeId) {
    setSelectedType(serviceType)
    setStep('create')
  }

  function handleCancelCreate() {
    setStep('type')
    setSelectedType(null)
  }

  function handleCreateSuccess(data?: CreatedServicePayload) {
    if (data) {
      // Vector search demo is auto-included for Free/Developer OpenSearch —
      // no user choice at create time. Users are offered Start / Skip in a
      // post-create Dialog, and can always launch it from the Overview card.
      const includeVectorDemo =
        data.serviceTypeId === 'opensearch' &&
        (data.tier === 'free' || data.tier === 'developer')
      onCreated(payloadToRow(data), { includeVectorDemo })
    }
    onClose()
  }

  const showDemoCallout = selectedType === 'opensearch'

  return (
    <>
      <ServiceTypeSelectModal
        open={open && step === 'type'}
        onClose={onClose}
        onSelectService={handleSelectType}
        subtitle={subtitle}
      />
      <Modal
        title={createTitle}
        subtitle={subtitle}
        open={open && step === 'create'}
        onClose={handleCancelCreate}
        size="full"
        primaryAction={{
          text: createTitle,
          onClick: () => submitRef.current?.(),
        }}
        secondaryActions={{
          text: 'Cancel',
          onClick: handleCancelCreate,
        }}
      >
        {open && step === 'create' ? (
          <CreateService
            key={selectedType ?? 'create'}
            embedded
            serviceTypeId={selectedType ?? undefined}
            serviceDisplayName={selectedType ? getServiceTypeDisplayName(selectedType) : undefined}
            onClose={handleCancelCreate}
            onCreateSuccess={handleCreateSuccess}
            submitRef={submitRef}
            afterServiceTier={showDemoCallout ? <OpenSearchDemoCallout /> : null}
          />
        ) : null}
      </Modal>
    </>
  )
}

CreateServiceShell.displayName = 'CreateServiceShell'
