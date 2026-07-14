'use client'

import ProjectServices from '../../../../screens/ProjectServices'
import { usePlaygroundState } from '../../../../contexts/PlaygroundStateContext'

export default function ProjectServicesPage() {
  const {
    services,
    openServiceTypeModal,
    navigateToServiceOverview,
    handleDeleteServiceFromList,
    handlePlanActionFromList,
    navigateToBilling,
    navigateToOrg,
  } = usePlaygroundState()

  return (
    <ProjectServices
      services={services}
      onCreateServiceClick={openServiceTypeModal}
      onServiceClick={(serviceId) => {
        const service = services.find((s) => s.id === serviceId)
        if (service) {
          navigateToServiceOverview(service.id, service.serviceTypeId ?? 'mysql')
        }
      }}
      onDeleteService={handleDeleteServiceFromList}
      onPlanAction={handlePlanActionFromList}
      onBillingClick={navigateToBilling}
      onOrgHomeClick={navigateToOrg}
    />
  )
}
