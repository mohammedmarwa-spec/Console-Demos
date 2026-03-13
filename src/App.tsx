import { useRef, useState } from 'react'
import { Box, Modal, ToastProvider, Typography, useToast } from '@aivenio/aquarium'
import tickIcon from '@aivenio/aquarium/icons/tick'
import CreateService, { type CreatedServicePayload } from './screens/CreateService'
import CreateReadReplicaModal from './screens/CreateReadReplicaModal'
import CreateForkModal from './screens/CreateForkModal'
import ProjectServices, { INITIAL_SERVICES, type ServiceRow } from './screens/ProjectServices'
import ServiceOverview from './screens/ServiceOverview'
import ServiceTypeSelectModal, { getServiceTypeDisplayName, type ServiceTypeId } from './screens/ServiceTypeSelectModal'

type View = 'project-services' | 'service-overview'

const SUBTITLE = (
  <Box style={{ color: '#4a4b57' }}>
    <Typography.Small>Project: ux-tests · Organization: BigCo Ltd.</Typography.Small>
  </Box>
)

function AppContent() {
  const addToast = useToast()
  const [view, setView] = useState<View>('project-services')
  const [serviceTypeModalOpen, setServiceTypeModalOpen] = useState(false)
  const [creationModalOpen, setCreationModalOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceTypeId | null>(null)
  /** Service type for the overview page (set when navigating from create success or clicking a service). */
  const [overviewServiceType, setOverviewServiceType] = useState<ServiceTypeId | null>(null)
  /** Service id for the overview page (which service we're viewing; used for delete). */
  const [overviewServiceId, setOverviewServiceId] = useState<string | null>(null)
  /** List of services shown on the Services page (newly created ones are appended). */
  const [services, setServices] = useState<ServiceRow[]>(INITIAL_SERVICES)
  /** Tracks how many Kafka services have been created, used to rotate pricingType. */
  const kafkaCreationCount = useRef(0)
  /** Holds the current submit function exposed by CreateService via submitRef. */
  const createServiceSubmitRef = useRef<(() => void) | undefined>(undefined)
  /** Controls visibility of the Create read-replica modal. */
  const [createReplicaModalOpen, setCreateReplicaModalOpen] = useState(false)
  /** Controls visibility of the Create fork modal. */
  const [createForkModalOpen, setCreateForkModalOpen] = useState(false)
  /** Controls visibility of the Edit / Change plan modal. */
  const [editModalOpen, setEditModalOpen] = useState(false)
  /** Holds the current submit function exposed by CreateService (edit mode). */
  const editSubmitRef = useRef<(() => void) | undefined>(undefined)

  function openServiceTypeModal() {
    setServiceTypeModalOpen(true)
  }

  function openCreationModal(serviceType: ServiceTypeId) {
    setSelectedServiceType(serviceType)
    setServiceTypeModalOpen(false)
    setCreationModalOpen(true)
  }

  function closeCreationModal() {
    setCreationModalOpen(false)
  }

  /** Back from create form: close create modal and show Select service type again. */
  function handleBackToServiceTypeSelect() {
    setCreationModalOpen(false)
    setServiceTypeModalOpen(true)
  }

  function handleCreateSuccess(data?: CreatedServicePayload) {
    setCreationModalOpen(false)
    if (data) {
      const displayName = getServiceTypeDisplayName(data.serviceTypeId)
      const iconLetter = data.serviceTypeId === 'mysql' ? 'M' : data.serviceTypeId === 'postgresql' ? 'P' : displayName.charAt(0)
      const KAFKA_PRICING_ROTATION = ['Inkless', 'Classic'] as const
      const pricingType = data.serviceTypeId === 'kafka'
        ? KAFKA_PRICING_ROTATION[kafkaCreationCount.current++ % KAFKA_PRICING_ROTATION.length]
        : undefined
      setServices((prev) => [
        ...prev,
        {
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
          iconLetter,
          serviceTypeId: data.serviceTypeId,
          pricingType,
          cpuCount: data.cpuCount,
          ramCapacity: data.ramCapacity,
          storageCapacity: data.storageCapacity,
        },
      ])
      setOverviewServiceId(data.serviceName)
      setOverviewServiceType(data.serviceTypeId)
    } else {
      setOverviewServiceType(selectedServiceType)
    }
    setView('service-overview')
  }

  function handleChangePlan() {
    setEditModalOpen(true)
  }

  function handleEditSuccess(data?: CreatedServicePayload) {
    setEditModalOpen(false)
    if (!data || !overviewServiceId) return

    const currentService = services.find((s) => s.id === overviewServiceId)
    const wasSimpleTier = ['free', 'developer'].includes((currentService?.planName ?? '').toLowerCase())
    const verb = wasSimpleTier ? 'upgraded' : 'changed'
    const nodeText = `${data.nodeCount} ${data.nodeCount === 1 ? 'node' : 'nodes'}`
    addToast({
      message: `The service has been ${verb} to ${data.planName} · ${nodeText} · ${data.planDetails}`,
      icon: tickIcon,
      duration: 6000,
      position: 'top-right',
    })

    setServices((prev) =>
      prev.map((s) =>
        s.id === overviewServiceId
          ? {
              ...s,
              planName: data.planName,
              planDetails: data.planDetails,
              nodeCount: data.nodeCount,
              nodes: `Nodes ${data.nodeCount}`,
              cloudRegion: `${data.cloud}: ${data.region}`,
              location: data.location,
              cpuCount: data.cpuCount,
              ramCapacity: data.ramCapacity,
              storageCapacity: data.storageCapacity,
            }
          : s,
      ),
    )
  }

  /** Delete triggered from the service overview page (⋯ menu). */
  function handleDeleteService() {
    if (overviewServiceId) {
      setServices((prev) => prev.filter((s) => s.id !== overviewServiceId))
      setOverviewServiceId(null)
      setOverviewServiceType(null)
    }
    setView('project-services')
  }

  /** Delete triggered from the project services table row menu. */
  function handleDeleteServiceFromList(serviceId: string) {
    setServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  function handleCreateReplica(replicaName: string) {
    if (!overviewServiceId || !overviewServiceType) return
    const displayName = getServiceTypeDisplayName(overviewServiceType)
    const iconLetter = overviewServiceType === 'mysql' ? 'M' : overviewServiceType === 'postgresql' ? 'P' : displayName.charAt(0)
    const sourceServiceId = overviewServiceId
    setServices((prev) => [
      ...prev,
      {
        id: replicaName,
        serviceName: replicaName,
        serviceType: displayName,
        serviceTypeId: overviewServiceType,
        status: 'Running',
        nodes: 'Nodes 1',
        planName: 'Startup',
        planDetails: '1 CPU / 4 GB RAM',
        cloudRegion: 'Google Cloud: asia-east1',
        location: 'Asia, Taiwan',
        created: 'Just now',
        iconLetter,
        replicationRole: 'read_replica',
        sourceServiceId,
      },
    ])
    setCreateReplicaModalOpen(false)
    // Stay on the primary service overview so the new replica appears in the Read replica section.
    // (The user can click the replica link there to navigate to the replica's own overview.)
  }

  function handleCreateFork(forkName: string) {
    if (!overviewServiceId || !overviewServiceType) return
    const displayName = getServiceTypeDisplayName(overviewServiceType)
    const iconLetter = overviewServiceType === 'mysql' ? 'M' : overviewServiceType === 'postgresql' ? 'P' : displayName.charAt(0)
    const sourceServiceId = overviewServiceId
    const sourceService = services.find((s) => s.id === overviewServiceId)
    setServices((prev) => [
      ...prev,
      {
        id: forkName,
        serviceName: forkName,
        serviceType: displayName,
        serviceTypeId: overviewServiceType,
        status: 'Running',
        nodes: sourceService?.nodes ?? 'Nodes 1',
        planName: sourceService?.planName ?? 'Startup',
        planDetails: sourceService?.planDetails ?? '1 CPU / 2 GB RAM',
        cloudRegion: sourceService?.cloudRegion ?? 'Google Cloud: asia-east1',
        location: sourceService?.location ?? 'Asia, Taiwan',
        created: 'Just now',
        iconLetter,
        replicationRole: 'fork',
        sourceServiceId,
      },
    ])
    setCreateForkModalOpen(false)
    // Stay on the source service overview so the user sees context; they can navigate to the fork via the services list.
  }

  const createModalTitle = selectedServiceType
    ? `Create ${getServiceTypeDisplayName(selectedServiceType)} service`
    : 'Create service'

  const editOverviewService = services.find((s) => s.id === overviewServiceId)
  const isSimpleTierEdit = ['free', 'developer'].includes((editOverviewService?.planName ?? '').toLowerCase())
  const editVerb = isSimpleTierEdit ? 'Upgrade' : 'Change'
  const editModalTitle = `${editVerb} ${overviewServiceType ? getServiceTypeDisplayName(overviewServiceType) : 'service'} plan`

  return (
    <>
      {view === 'service-overview' && (
        <ServiceOverview
          key={`overview:${overviewServiceId ?? ''}`}
          serviceId={overviewServiceId}
          serviceTypeId={overviewServiceType}
          services={services}
          onBackToProject={() => setView('project-services')}
          onDeleteService={handleDeleteService}
          onChangePlan={handleChangePlan}
          onCreateReplica={() => setCreateReplicaModalOpen(true)}
          onCreateFork={() => setCreateForkModalOpen(true)}
          onReplicaClick={(replicaId) => {
            const replica = services.find((s) => s.id === replicaId)
            if (replica) {
              setOverviewServiceId(replica.id)
              setOverviewServiceType(replica.serviceTypeId ?? 'postgresql')
              setView('service-overview')
            }
          }}
        />
      )}

      {view === 'project-services' && (
        <ProjectServices
          services={services}
          onCreateServiceClick={openServiceTypeModal}
          onServiceClick={(serviceId) => {
            const service = services.find((s) => s.id === serviceId)
            if (service) {
              setOverviewServiceId(service.id)
              setOverviewServiceType(service.serviceTypeId ?? 'mysql')
              setView('service-overview')
            }
          }}
          onDeleteService={handleDeleteServiceFromList}
        />
      )}

      {/* Create fork modal — opened from ServiceOverview's Backups overview section */}
      <CreateForkModal
        key={`fork-modal:${overviewServiceId ?? ''}`}
        open={createForkModalOpen}
        sourceService={services.find((s) => s.id === overviewServiceId) ?? null}
        onClose={() => setCreateForkModalOpen(false)}
        onCreateFork={handleCreateFork}
      />

      {/* Create read-replica modal — opened from ServiceOverview's Read replica section */}
      <CreateReadReplicaModal
        key={`replica-modal:${overviewServiceId ?? ''}`}
        open={createReplicaModalOpen}
        sourceService={services.find((s) => s.id === overviewServiceId) ?? null}
        onClose={() => setCreateReplicaModalOpen(false)}
        onCreateReplica={handleCreateReplica}
      />

      {/* Edit / Upgrade plan modal — opened from ServiceOverview "Change" / "Upgrade" button */}
      <Modal
        title={editModalTitle}
        subtitle={SUBTITLE}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        size="full"
        primaryAction={{
          text: isSimpleTierEdit ? 'Upgrade plan' : 'Apply changes',
          onClick: () => editSubmitRef.current?.(),
        }}
        secondaryActions={{
          text: 'Cancel',
          onClick: () => setEditModalOpen(false),
        }}
      >
        {editModalOpen && overviewServiceId && (
          <CreateService
            key={`edit:${overviewServiceId}`}
            embedded
            editMode
            serviceTypeId={overviewServiceType}
            serviceDisplayName={overviewServiceType ? getServiceTypeDisplayName(overviewServiceType) : undefined}
            initialValues={services.find((s) => s.id === overviewServiceId)}
            onClose={() => setEditModalOpen(false)}
            onCreateSuccess={handleEditSuccess}
            submitRef={editSubmitRef}
          />
        )}
      </Modal>

      {/* Same modal flow for all entry points: select type (full) then create (full) */}
      <ServiceTypeSelectModal
        open={serviceTypeModalOpen}
        onClose={() => setServiceTypeModalOpen(false)}
        onSelectService={openCreationModal}
      />
      <Modal
        title={createModalTitle}
        subtitle={SUBTITLE}
        open={creationModalOpen}
        onClose={closeCreationModal}
        size="full"
        primaryAction={{
          text: createModalTitle,
          onClick: () => createServiceSubmitRef.current?.(),
        }}
        secondaryActions={{
          text: 'Cancel',
          onClick: handleBackToServiceTypeSelect,
        }}
      >
        {creationModalOpen && (
          <CreateService
            key={selectedServiceType ?? 'create'}
            embedded
            serviceTypeId={selectedServiceType ?? undefined}
            serviceDisplayName={selectedServiceType ? getServiceTypeDisplayName(selectedServiceType) : undefined}
            onClose={handleBackToServiceTypeSelect}
            onCreateSuccess={handleCreateSuccess}
            submitRef={createServiceSubmitRef}
          />
        )}
      </Modal>
    </>
  )
}

AppContent.displayName = 'AppContent'

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

App.displayName = 'App'

export default App
