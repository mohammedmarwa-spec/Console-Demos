'use client'

import { useEffect, useLayoutEffect } from 'react'
import { useParams } from 'next/navigation'
import ServiceOverview from '../../../../../screens/ServiceOverview'
import { usePlaygroundState } from '../../../../../contexts/PlaygroundStateContext'

export default function ServiceOverviewPage() {
  const params = useParams<{ serviceId: string }>()
  const serviceId = decodeURIComponent(params.serviceId)
  const {
    services,
    overviewServiceId,
    overviewServiceType,
    overviewInitialSidebarItem,
    runtimeFlags,
    navigateToServices,
    handleDeleteService,
    handleChangePlan,
    setCreateReplicaModalOpen,
    setCreateForkModalOpen,
    navigateToBilling,
    navigateToOrg,
    handleReplicaClick,
    navigateToServiceOverview,
    syncOverviewFromRoute,
  } = usePlaygroundState()

  useLayoutEffect(() => {
    if (serviceId && serviceId !== '_') {
      syncOverviewFromRoute(serviceId)
    }
  }, [serviceId, syncOverviewFromRoute])

  // Sync URL param into context when landing directly on a service route
  useEffect(() => {
    if (serviceId === '_' || serviceId === overviewServiceId) return
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      navigateToServiceOverview(service.id, service.serviceTypeId ?? 'mysql')
    }
  }, [serviceId, services, overviewServiceId, navigateToServiceOverview])

  const activeId = serviceId !== '_' ? serviceId : overviewServiceId
  const activeService = services.find((s) => s.id === activeId)

  return (
    <ServiceOverview
      key={`overview:${activeId ?? ''}`}
      serviceId={activeId}
      serviceTypeId={activeService?.serviceTypeId ?? overviewServiceType}
      initialSidebarItem={runtimeFlags.initialSidebarItem ?? overviewInitialSidebarItem}
      hideSwitchToNewPricingAlert={runtimeFlags.hideSwitchToNewPricingAlert ?? false}
      services={services}
      onBackToProject={() => navigateToServices()}
      onDeleteService={handleDeleteService}
      onChangePlan={handleChangePlan}
      onCreateReplica={() => setCreateReplicaModalOpen(true)}
      onCreateFork={() => setCreateForkModalOpen(true)}
      onBillingClick={navigateToBilling}
      onOrgHomeClick={navigateToOrg}
      onReplicaClick={handleReplicaClick}
    />
  )
}
