import {
  Box,
  Breadcrumbs,
  DropdownMenu,
  PageHeader,
  StatusChip,
} from '@aivenio/aquarium'
import { CompactServiceHeader } from './CompactServiceHeader'
import { ServicePgStudioEditor } from './ServicePgStudioEditor'
import { ServicePgStudioGettingStarted } from './ServicePgStudioGettingStarted'
import { ServicePgStudioPlaygroundSample } from './ServicePgStudioPlaygroundSample'
import { getServiceIconUrl } from './ServiceIcon'
import { useResolvedTheme } from '../theme/ThemeProvider'
import type { ServiceTypeId } from '../screens/ServiceTypeSelectModal'

const PROJECT_NAME = 'UI-TESTS'

export type ServicePgStudioBodyProps = {
  serviceName: string
  serviceTypeId?: ServiceTypeId | null
  serviceVersion: string
  nodeCount: number
  serviceStatus?: string
  /** Onboarding sample-data PG Studio (schemas + AI shortcuts). */
  showPlaygroundSample?: boolean
  /** Show first-run setup instead of the SQL editor workspace. */
  showGettingStarted?: boolean
  onCompleteGettingStarted?: () => void
  onBackToProject?: () => void
  onDeleteService?: () => void
}

export function ServicePgStudioBody({
  serviceName,
  serviceTypeId = null,
  serviceVersion,
  nodeCount,
  serviceStatus = 'Running',
  showPlaygroundSample = false,
  showGettingStarted = false,
  onCompleteGettingStarted,
  onBackToProject,
  onDeleteService,
}: ServicePgStudioBodyProps) {
  const theme = useResolvedTheme()

  const breadcrumbTrail = showGettingStarted ? (
    <Breadcrumbs.Crumb key="pg-studio">
      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span>PG Studio</span>
        <StatusChip text="Early availability" status="info" dense />
      </Box>
    </Breadcrumbs.Crumb>
  ) : (
    <Breadcrumbs.Crumb key="studio">Studio</Breadcrumbs.Crumb>
  )

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box style={{ padding: '24px 24px 16px', flexShrink: 0 }}>
        <CompactServiceHeader
          serviceName={serviceName}
          iconUrl={getServiceIconUrl(serviceTypeId ?? null, theme)}
          version={serviceVersion}
          statusText={serviceStatus}
          nodeCount={nodeCount}
          serviceStatus={serviceStatus}
        />
        <PageHeader
          title=""
          breadcrumbs={[
            <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
              My Organization
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="projects" href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
              Projects
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="project" href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
              {PROJECT_NAME}
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="service">{serviceName}</Breadcrumbs.Crumb>,
            breadcrumbTrail,
          ]}
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={(key) => { if (key === 'delete') onDeleteService?.() }}
        />
      </Box>

      {showPlaygroundSample ? (
        <ServicePgStudioPlaygroundSample />
      ) : showGettingStarted ? (
        <ServicePgStudioGettingStarted
          serviceTypeId={serviceTypeId}
          onSetupPathChosen={() => onCompleteGettingStarted?.()}
        />
      ) : (
        <ServicePgStudioEditor serviceTypeId={serviceTypeId} />
      )}
    </Box>
  )
}

ServicePgStudioBody.displayName = 'ServicePgStudioBody'
