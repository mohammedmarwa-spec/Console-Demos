'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { useRouter } from 'next/navigation'
import { Box, Modal, Typography, useToast } from '@aivenio/aquarium'
import tickIcon from '@aivenio/aquarium/icons/tick'
import CreateService, { type CreatedServicePayload } from '../screens/CreateService'
import CreateReadReplicaModal from '../screens/CreateReadReplicaModal'
import CreateForkModal from '../screens/CreateForkModal'
import type { ServiceRow } from '../screens/ProjectServices'
import ServiceTypeSelectModal, { getServiceTypeDisplayName, type ServiceTypeId } from '../screens/ServiceTypeSelectModal'
import { getConsoleContext, useScenario } from '../scenarios'
import {
  getInitialServicesForScenario,
  getRuntimeFlags,
  initialOverviewServiceIdForScenario,
  initialOverviewServiceTypeForScenario,
  resolveRuntime,
} from '../scenarios/scenarioRuntime'
import { PlaygroundPgStudioWelcomeModal, showPlaygroundToast } from '../screens/playground'
import type { OnboardingTestEnvCreatePayload } from '../screens/playground'
import { MysqlAcuRolloutModal } from '../screens/MysqlAcuRolloutModal'
import { UPGRADE_PLAN_SERVICE_DATA, type UpgradeTier } from '../screens/UpgradeServiceModal'
import { UpgradeServiceModalV2 } from '../screens/UpgradeServiceModalV2'
import { PLAYGROUND_SAMPLE_SERVICE_ID } from '../utils/pgStudioPlaygroundSample'
import {
  getInitialPathForScenario,
  ROUTES,
  serviceOverviewPath,
} from '../lib/navigation'

type PlaygroundStateContextValue = {
  services: ServiceRow[]
  overviewServiceId: string | null
  overviewServiceType: ServiceTypeId | null
  overviewInitialSidebarItem: string | undefined
  runtimeFlags: ReturnType<typeof getRuntimeFlags>
  consoleContext: ReturnType<typeof getConsoleContext>
  navigateToOrg: () => void
  navigateToServices: () => void
  navigateToBilling: () => void
  navigateToServiceOverview: (serviceId: string, serviceTypeId?: ServiceTypeId | null) => void
  navigateToTestEnv: () => void
  navigateToPlayground: () => void
  openServiceTypeModal: () => void
  openCreationModal: (serviceType: ServiceTypeId) => void
  handleTestEnvCreate: (payload: OnboardingTestEnvCreatePayload) => void
  handlePlaygroundSampleReady: () => void
  handleDeleteService: () => void
  handleDeleteServiceFromList: (serviceId: string) => void
  handleChangePlan: () => void
  handlePlanActionFromList: (serviceId: string) => void
  handleReplicaClick: (replicaId: string) => void
  setCreateReplicaModalOpen: (open: boolean) => void
  setCreateForkModalOpen: (open: boolean) => void
  syncOverviewFromRoute: (serviceId: string) => void
}

const PlaygroundStateContext = createContext<PlaygroundStateContextValue | null>(null)

function applyScenarioState(
  scenarioId: string | null,
  setters: {
    setServices: (s: ServiceRow[]) => void
    setOverviewServiceId: (id: string | null) => void
    setOverviewServiceType: (t: ServiceTypeId | null) => void
    setOverviewInitialSidebarItem: (item: string | undefined) => void
    setServiceTypeModalOpen: (open: boolean) => void
    setCreationModalOpen: (open: boolean) => void
  },
) {
  const runtime = resolveRuntime(scenarioId)
  const flags = runtime.flags ?? {}
  setters.setServices(runtime.getInitialServices())
  setters.setServiceTypeModalOpen(false)
  setters.setCreationModalOpen(false)
  setters.setOverviewServiceId(runtime.initialOverviewServiceId ?? null)
  setters.setOverviewServiceType(runtime.initialOverviewServiceType ?? null)
  setters.setOverviewInitialSidebarItem(flags.initialSidebarItem)
}

export function PlaygroundStateProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const addToast = useToast()
  const { activeScenarioId } = useScenario()
  const consoleContext = getConsoleContext(activeScenarioId)
  const runtimeFlags = getRuntimeFlags(activeScenarioId)

  const [serviceTypeModalOpen, setServiceTypeModalOpen] = useState(false)
  const [creationModalOpen, setCreationModalOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceTypeId | null>(null)
  const [overviewServiceType, setOverviewServiceType] = useState<ServiceTypeId | null>(() =>
    initialOverviewServiceTypeForScenario(activeScenarioId),
  )
  const [overviewServiceId, setOverviewServiceId] = useState<string | null>(() =>
    initialOverviewServiceIdForScenario(activeScenarioId),
  )
  const [overviewInitialSidebarItem, setOverviewInitialSidebarItem] = useState<string | undefined>()
  const [services, setServices] = useState<ServiceRow[]>(() => getInitialServicesForScenario(activeScenarioId))
  const [mysqlRolloutModalOpen, setMysqlRolloutModalOpen] = useState(false)
  const [createReplicaModalOpen, setCreateReplicaModalOpen] = useState(false)
  const [createForkModalOpen, setCreateForkModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [upgradeV2ModalOpen, setUpgradeV2ModalOpen] = useState(false)
  const [pgStudioWelcomeOpen, setPgStudioWelcomeOpen] = useState(false)
  const [routeServiceId, setRouteServiceId] = useState<string | null>(null)
  const [clientReady, setClientReady] = useState(false)

  const kafkaCreationCount = useRef(0)
  const createServiceSubmitRef = useRef<(() => void) | undefined>(undefined)
  const editSubmitRef = useRef<(() => void) | undefined>(undefined)
  const prevScenarioId = useRef(activeScenarioId)

  const navigateToOrg = useCallback(() => router.push(ROUTES.consoleOrg), [router])
  const navigateToServices = useCallback(() => router.push(ROUTES.consoleServices), [router])
  const navigateToBilling = useCallback(() => router.push(ROUTES.consoleBilling), [router])
  const navigateToTestEnv = useCallback(() => router.push(ROUTES.consoleTestEnv), [router])
  const navigateToPlayground = useCallback(() => router.push(ROUTES.consolePlayground), [router])
  const navigateToServiceOverview = useCallback(
    (serviceId: string, serviceTypeId?: ServiceTypeId | null) => {
      setRouteServiceId(serviceId)
      if (serviceTypeId !== undefined) setOverviewServiceType(serviceTypeId)
      setOverviewServiceId(serviceId)
      router.push(serviceOverviewPath(serviceId))
    },
    [router],
  )

  // Aquarium modals use document (portals) — skip SSR to avoid ReferenceError.
  useEffect(() => {
    setClientReady(true)
  }, [])

  // Defer auto-open modals until after mount — Aquarium Modal uses document (portals).
  useEffect(() => {
    setMysqlRolloutModalOpen(getRuntimeFlags(activeScenarioId).autoOpenMysqlRolloutModal ?? false)
  }, [activeScenarioId])

  useEffect(() => {
    if (activeScenarioId === prevScenarioId.current) return
    prevScenarioId.current = activeScenarioId
    applyScenarioState(activeScenarioId, {
      setServices,
      setOverviewServiceId,
      setOverviewServiceType,
      setOverviewInitialSidebarItem,
      setServiceTypeModalOpen,
      setCreationModalOpen,
    })
    const path = getInitialPathForScenario(activeScenarioId)
    const scenarioParam = activeScenarioId ? `?scenario=${encodeURIComponent(activeScenarioId)}` : ''
    const target = activeScenarioId ? `${path}${scenarioParam}` : path
    if (typeof window !== 'undefined' && `${window.location.pathname}${window.location.search}` !== target) {
      router.push(target)
    }
  }, [activeScenarioId, router])

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

  function handleCreationModalCancel() {
    setCreationModalOpen(false)
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/onboarding/test-env')) {
      setServiceTypeModalOpen(true)
    }
  }

  function handlePlaygroundSampleReady() {
    const serviceName = PLAYGROUND_SAMPLE_SERVICE_ID
    setServices((prev) => {
      if (prev.some((s) => s.id === serviceName)) return prev
      return [
        ...prev,
        {
          id: serviceName,
          serviceName,
          serviceType: 'PostgreSQL',
          serviceTypeId: 'postgresql',
          status: 'Running',
          nodes: 'Nodes 1',
          nodeCount: 1,
          planName: 'Free',
          planDetails: '1 CPU / 1 GB RAM / 1 GB storage',
          cloudRegion: 'AWS: eu-west-1',
          location: 'Europe, Ireland',
          created: 'Just now',
          createdByInitials: 'ME',
          createdByFullName: 'You',
          iconLetter: 'P',
          playgroundSampleLoaded: true,
          cpuCount: 1,
          ramCapacity: '1 GB',
          storageCapacity: '1 GB',
        },
      ]
    })
    setOverviewServiceId(serviceName)
    setOverviewServiceType('postgresql')
    setOverviewInitialSidebarItem('pg-studio')
    router.push(serviceOverviewPath(serviceName))
    setPgStudioWelcomeOpen(true)
  }

  function handleTestEnvCreate(payload: OnboardingTestEnvCreatePayload) {
    const displayName = getServiceTypeDisplayName(payload.serviceTypeId)
    const iconLetter =
      payload.serviceTypeId === 'mysql'
        ? 'M'
        : payload.serviceTypeId === 'postgresql'
          ? 'P'
          : displayName.charAt(0)
    setServices((prev) => {
      if (prev.some((s) => s.id === payload.serviceName)) return prev
      return [
        ...prev,
        {
          id: payload.serviceName,
          serviceName: payload.serviceName,
          serviceType: displayName,
          serviceTypeId: payload.serviceTypeId,
          status: 'Running',
          nodes: 'Nodes 1',
          nodeCount: 1,
          planName: 'Free',
          planDetails: '1 vCPU / 1 GB RAM / 1 GB storage',
          cloudRegion: 'AWS: eu-west-1',
          location: 'Europe, Ireland',
          created: 'Just now',
          createdByInitials: 'ME',
          createdByFullName: 'You',
          iconLetter,
          cpuCount: 1,
          ramCapacity: '1 GB',
          storageCapacity: '1 GB',
          userCreated: true,
        },
      ]
    })
    setOverviewServiceId(payload.serviceName)
    setOverviewServiceType(payload.serviceTypeId)
    setOverviewInitialSidebarItem(undefined)
    router.push(serviceOverviewPath(payload.serviceName))
    showPlaygroundToast(addToast, `${displayName} service created`)
  }

  function handleCreateSuccess(data?: CreatedServicePayload) {
    setCreationModalOpen(false)
    if (data) {
      const displayName = getServiceTypeDisplayName(data.serviceTypeId)
      const iconLetter = data.serviceTypeId === 'mysql' ? 'M' : data.serviceTypeId === 'postgresql' ? 'P' : displayName.charAt(0)
      const KAFKA_PRICING_ROTATION = ['Inkless', 'Classic'] as const
      const pricingType = data.serviceTypeId === 'kafka'
        ? KAFKA_PRICING_ROTATION[kafkaCreationCount.current++ % KAFKA_PRICING_ROTATION.length]
        : data.pricingModel === 'acu'
        ? 'ACU'
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
          createdByInitials: 'ME',
          createdByFullName: 'You',
          iconLetter,
          serviceTypeId: data.serviceTypeId,
          pricingType,
          cpuCount: data.cpuCount,
          ramCapacity: data.ramCapacity,
          storageCapacity: data.storageCapacity,
          serviceTier: data.serviceTier,
          computeType: data.computeType,
          monthlyPrice: data.monthlyPrice,
          userCreated: true,
        },
      ])
      setOverviewServiceId(data.serviceName)
      setOverviewServiceType(data.serviceTypeId)
      setOverviewInitialSidebarItem(undefined)
      navigateToServiceOverview(data.serviceName, data.serviceTypeId)
    } else {
      setOverviewServiceType(selectedServiceType)
      setOverviewInitialSidebarItem(undefined)
      if (overviewServiceId) router.push(serviceOverviewPath(overviewServiceId))
    }
  }

  function handleChangePlan() {
    const currentService = services.find((s) => s.id === overviewServiceId)
    const isSimple = ['free', 'developer'].includes((currentService?.planName ?? '').toLowerCase())
    if (isSimple) {
      setUpgradeV2ModalOpen(true)
    } else {
      setEditModalOpen(true)
    }
  }

  function handlePlanActionFromList(serviceId: string) {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return
    setOverviewServiceId(service.id)
    setOverviewServiceType(service.serviceTypeId ?? 'mysql')
    const isSimple = ['free', 'developer'].includes((service.planName ?? '').toLowerCase())
    if (isSimple) {
      setUpgradeV2ModalOpen(true)
    } else {
      setEditModalOpen(true)
    }
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
              ...(data.pricingModel != null
                ? {
                    pricingType: data.pricingModel === 'acu' ? 'ACU' : undefined,
                    serviceTier: data.pricingModel === 'acu' ? data.serviceTier : undefined,
                    computeType: data.pricingModel === 'acu' ? data.computeType : undefined,
                  }
                : {}),
              ...(data.monthlyPrice != null ? { monthlyPrice: data.monthlyPrice } : {}),
            }
          : s,
      ),
    )
  }

  function handleDeleteService() {
    if (overviewServiceId) {
      setServices((prev) => prev.filter((s) => s.id !== overviewServiceId))
      setOverviewServiceId(null)
      setOverviewServiceType(null)
    }
    router.push(ROUTES.consoleServices)
  }

  function handleDeleteServiceFromList(serviceId: string) {
    setServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  function handleCreateReplica(replicaName: string, useAcuPricing: boolean) {
    const sourceServiceId = overviewServiceId ?? routeServiceId
    const resolvedType =
      overviewServiceType ??
      services.find((s) => s.id === sourceServiceId)?.serviceTypeId ??
      null
    if (!sourceServiceId || !resolvedType) return
    const displayName = getServiceTypeDisplayName(resolvedType)
    const iconLetter = resolvedType === 'mysql' ? 'M' : resolvedType === 'postgresql' ? 'P' : displayName.charAt(0)
    setServices((prev) => [
      ...prev,
      {
        id: replicaName,
        serviceName: replicaName,
        serviceType: displayName,
        serviceTypeId: resolvedType,
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
        pricingType: useAcuPricing ? 'ACU' : undefined,
      },
    ])
    setCreateReplicaModalOpen(false)
  }

  function handleCreateFork(forkName: string, useAcuPricing: boolean) {
    const sourceServiceId = overviewServiceId ?? routeServiceId
    const resolvedType =
      overviewServiceType ??
      services.find((s) => s.id === sourceServiceId)?.serviceTypeId ??
      null
    if (!sourceServiceId || !resolvedType) return
    const displayName = getServiceTypeDisplayName(resolvedType)
    const iconLetter = resolvedType === 'mysql' ? 'M' : resolvedType === 'postgresql' ? 'P' : displayName.charAt(0)
    const sourceService = services.find((s) => s.id === sourceServiceId)
    setServices((prev) => [
      ...prev,
      {
        id: forkName,
        serviceName: forkName,
        serviceType: displayName,
        serviceTypeId: resolvedType,
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
        pricingType: useAcuPricing ? 'ACU' : undefined,
      },
    ])
    setCreateForkModalOpen(false)
  }

  function syncOverviewFromRoute(serviceId: string) {
    setRouteServiceId(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (!service) return
    setOverviewServiceId(service.id)
    setOverviewServiceType(service.serviceTypeId ?? null)
  }

  function handleReplicaClick(replicaId: string) {
    const replica = services.find((s) => s.id === replicaId)
    if (replica) {
      navigateToServiceOverview(replica.id, replica.serviceTypeId ?? 'postgresql')
    }
  }

  const modalSubtitle = (
    <Box style={{ color: '#4a4b57' }}>
      <Typography.Small>
        Project: {consoleContext.projectName} · Organization: {consoleContext.orgName}
      </Typography.Small>
    </Box>
  )

  const createModalTitle = selectedServiceType
    ? `Create ${getServiceTypeDisplayName(selectedServiceType)} service`
    : 'Create service'

  const editOverviewService = services.find((s) => s.id === overviewServiceId)
  const isSimpleTierEdit = ['free', 'developer'].includes((editOverviewService?.planName ?? '').toLowerCase())
  const editVerb = isSimpleTierEdit ? 'Upgrade' : 'Change'
  const editModalTitle = `${editVerb} ${overviewServiceType ? getServiceTypeDisplayName(overviewServiceType) : 'service'} plan`

  const value: PlaygroundStateContextValue = {
    services,
    overviewServiceId,
    overviewServiceType,
    overviewInitialSidebarItem,
    runtimeFlags,
    consoleContext,
    navigateToOrg,
    navigateToServices,
    navigateToBilling,
    navigateToServiceOverview,
    navigateToTestEnv,
    navigateToPlayground,
    openServiceTypeModal,
    openCreationModal,
    handleTestEnvCreate,
    handlePlaygroundSampleReady,
    handleDeleteService,
    handleDeleteServiceFromList,
    handleChangePlan,
    handlePlanActionFromList,
    handleReplicaClick,
    setCreateReplicaModalOpen,
    setCreateForkModalOpen,
    syncOverviewFromRoute,
  }

  return (
    <PlaygroundStateContext.Provider value={value}>
      {clientReady ? (
        <>
      <MysqlAcuRolloutModal
        open={mysqlRolloutModalOpen}
        onClose={() => setMysqlRolloutModalOpen(false)}
        onCreateService={() => {
          setMysqlRolloutModalOpen(false)
          setSelectedServiceType('mysql')
          setCreationModalOpen(true)
        }}
      />

      <PlaygroundPgStudioWelcomeModal
        open={pgStudioWelcomeOpen}
        onClose={() => setPgStudioWelcomeOpen(false)}
      />

      <CreateForkModal
        key={`fork-modal:${overviewServiceId ?? ''}`}
        open={createForkModalOpen}
        sourceService={services.find((s) => s.id === (overviewServiceId ?? routeServiceId)) ?? null}
        onClose={() => setCreateForkModalOpen(false)}
        onCreateFork={handleCreateFork}
      />

      <CreateReadReplicaModal
        key={`replica-modal:${overviewServiceId ?? ''}`}
        open={createReplicaModalOpen}
        sourceService={services.find((s) => s.id === (overviewServiceId ?? routeServiceId)) ?? null}
        onClose={() => setCreateReplicaModalOpen(false)}
        onCreateReplica={handleCreateReplica}
      />

      <UpgradeServiceModalV2
        open={upgradeV2ModalOpen}
        onClose={() => setUpgradeV2ModalOpen(false)}
        currentTier={((editOverviewService?.planName ?? '').toLowerCase() === 'free' ? 'free' : 'developer') as UpgradeTier}
        planVariant={runtimeFlags.upgradePlanVariant ?? 'startup-business'}
        onUpgrade={(planId) => {
          setUpgradeV2ModalOpen(false)
          const planData = UPGRADE_PLAN_SERVICE_DATA[planId]
          if (planData && overviewServiceId) {
            setServices((prev) =>
              prev.map((s) =>
                s.id === overviewServiceId
                  ? {
                      ...s,
                      planName: planData.planName,
                      planDetails: planData.planDetails,
                      nodeCount: planData.nodeCount,
                      nodes: `Nodes ${planData.nodeCount}`,
                      cpuCount: planData.cpuCount,
                      ramCapacity: planData.ramCapacity,
                      storageCapacity: planData.storageCapacity,
                    }
                  : s,
              ),
            )
          }
          addToast({
            message: `Service upgraded to ${planData?.planName ?? planId} plan`,
            icon: tickIcon,
            duration: 4000,
            position: 'top-right',
          })
        }}
        onCustomize={() => {
          setEditModalOpen(true)
        }}
      />

      <Modal
        title={editModalTitle}
        subtitle={modalSubtitle}
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
            submitRef={editSubmitRef as RefObject<(() => void) | undefined>}
          />
        )}
      </Modal>

      <ServiceTypeSelectModal
        open={serviceTypeModalOpen}
        onClose={() => setServiceTypeModalOpen(false)}
        onSelectService={openCreationModal}
        subtitle={modalSubtitle}
      />
      <Modal
        title={createModalTitle}
        subtitle={modalSubtitle}
        open={creationModalOpen}
        onClose={closeCreationModal}
        size="full"
        primaryAction={{
          text: createModalTitle,
          onClick: () => createServiceSubmitRef.current?.(),
        }}
        secondaryActions={{
          text: 'Cancel',
          onClick: handleCreationModalCancel,
        }}
      >
        {creationModalOpen && (
          <CreateService
            key={selectedServiceType ?? 'create'}
            embedded
            serviceTypeId={selectedServiceType ?? undefined}
            serviceDisplayName={selectedServiceType ? getServiceTypeDisplayName(selectedServiceType) : undefined}
            onClose={handleCreationModalCancel}
            onCreateSuccess={handleCreateSuccess}
            submitRef={createServiceSubmitRef as RefObject<(() => void) | undefined>}
          />
        )}
      </Modal>
        </>
      ) : null}

      {children}
    </PlaygroundStateContext.Provider>
  )
}

export function usePlaygroundState(): PlaygroundStateContextValue {
  const ctx = useContext(PlaygroundStateContext)
  if (!ctx) throw new Error('usePlaygroundState must be used within <PlaygroundStateProvider>')
  return ctx
}
