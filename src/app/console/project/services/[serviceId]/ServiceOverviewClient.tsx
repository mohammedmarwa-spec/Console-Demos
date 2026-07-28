'use client'

import { useEffect, useLayoutEffect } from 'react'
import { useParams } from 'next/navigation'
import ServiceOverview from '../../../../../screens/ServiceOverview'
import { usePlaygroundState } from '../../../../../contexts/PlaygroundStateContext'
import { SERVICE_OVERVIEW_CATCHALL_ID } from '../../../../../lib/serviceIds'

export default function ServiceOverviewClient() {
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
    if (serviceId && serviceId !== SERVICE_OVERVIEW_CATCHALL_ID) {
      syncOverviewFromRoute(serviceId)
    }
  }, [serviceId, syncOverviewFromRoute])

  useEffect(() => {
    if (serviceId === SERVICE_OVERVIEW_CATCHALL_ID || serviceId === overviewServiceId) return
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      navigateToServiceOverview(service.id, service.serviceTypeId ?? 'mysql')
    }
  }, [serviceId, services, overviewServiceId, navigateToServiceOverview])

  const activeId = serviceId !== SERVICE_OVERVIEW_CATCHALL_ID ? serviceId : overviewServiceId
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
