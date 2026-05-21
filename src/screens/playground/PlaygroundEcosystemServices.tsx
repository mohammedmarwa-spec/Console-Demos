import { useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Icon,
  Link,
  PageHeader,
  Tabs,
  Typography,
} from '@aivenio/aquarium'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import attachmentIcon from '@aivenio/aquarium/icons/attachment'
import exportIcon from '@aivenio/aquarium/icons/export'
import integrationsIcon from '@aivenio/aquarium/icons/integrations'
import mapIcon from '@aivenio/aquarium/icons/map'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import sendIcon from '@aivenio/aquarium/icons/send'
import toolsIcon from '@aivenio/aquarium/icons/tools'
import type { IconProps } from '@aivenio/aquarium'
import aivenStudioBannerUrl from '../../assets/playground/aiven-studio-banner.svg'

type EcosystemAction = {
  id: string
  title: string
  description: string
  icon: IconProps['icon']
}

const ECOSYSTEM_ACTIONS: EcosystemAction[] = [
  {
    id: 'deploy-ai',
    title: 'Deploy AI Stack',
    description: 'Provision PostgreSQL (Vector) and OpenSearch for RAG applications.',
    icon: proPlansIcon,
  },
  {
    id: 'stream-analytics',
    title: 'Stream to Analytics',
    description: 'Connect an existing PostgreSQL source to ClickHouse via Kafka.',
    icon: sendIcon,
  },
  {
    id: 'new-sandbox',
    title: 'New Project Sandbox',
    description: 'Spin up a fresh project with Free-Tier PG and Redis for rapid prototyping.',
    icon: toolsIcon,
  },
  {
    id: 'import-data',
    title: 'Import Data Source',
    description: 'Migrate an external database (AWS, GCP, or On-prem) into your ecosystem.',
    icon: exportIcon,
  },
  {
    id: 'audit-security',
    title: 'Audit Fleet Security',
    description: 'Run a global AI scan across all services to identify open ports or version lags.',
    icon: integrationsIcon,
  },
]

function StudioBannerGraphic() {
  return (
    <Box
      aria-hidden
      component="img"
      src={aivenStudioBannerUrl}
      alt=""
      width={119}
      height={100}
      style={{ width: 119, height: 100, flexShrink: 0, display: 'block' }}
    />
  )
}

StudioBannerGraphic.displayName = 'StudioBannerGraphic'

function EcosystemActionCard({ action, onClick }: { action: EcosystemAction; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '0 16px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 6,
        backgroundColor: 'var(--aquarium-background-color-layer)',
      }}
    >
      <Box
        style={{
          paddingTop: 16,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
        }}
      >
        <Icon icon={action.icon} style={{ width: 28, height: 28 }} />
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16, minWidth: 0 }}>
        <Typography.DefaultStrong>{action.title}</Typography.DefaultStrong>
        <Typography.Small color="muted">{action.description}</Typography.Small>
      </Box>
    </Box>
  )
}

EcosystemActionCard.displayName = 'EcosystemActionCard'

type StudioTab = 'aiven-studio' | 'services'

function ServicesEmptyTab({ onCreateServiceClick }: { onCreateServiceClick: () => void }) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <Box
        aria-hidden
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background:
            'linear-gradient(135deg, var(--aquarium-background-color-primary-muted) 0%, var(--aquarium-background-color-muted) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Box component="span" style={{ fontSize: 36 }}>
          ☁
        </Box>
      </Box>
      <Typography.LargeHeading>No services yet</Typography.LargeHeading>
      <Box style={{ maxWidth: 360 }}>
        <Typography.Default color="muted">
          Create your first service to get started. Choose from databases, streaming platforms, and more.
        </Typography.Default>
      </Box>
      <Box style={{ marginTop: 8 }}>
        <Button.Primary type="button" onClick={onCreateServiceClick}>
          Create service
        </Button.Primary>
      </Box>
    </Box>
  )
}

ServicesEmptyTab.displayName = 'ServicesEmptyTab'

export type PlaygroundEcosystemServicesProps = {
  onCreateServiceClick: () => void
  projectName: string
  onOrgHomeClick?: () => void
}

export function PlaygroundEcosystemServices({
  onCreateServiceClick,
  projectName,
  onOrgHomeClick,
}: PlaygroundEcosystemServicesProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('aiven-studio')
  const [chatDraft, setChatDraft] = useState('')

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <style>{`
        .playground-ecosystem-tabs [role="tabpanel"] {
          display: none;
        }
      `}</style>

      {/* Studio workspace */}
      <Box
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--aquarium-border-color-default)',
        }}
      >
        <Box
          style={{
            flexShrink: 0,
            padding: '24px 24px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <PageHeader
            title="Project overview"
            breadcrumbs={[
              <Breadcrumbs.Crumb key="org">
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onOrgHomeClick?.()
                  }}
                >
                  Aiven
                </Link>
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="project">{projectName}</Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="page">Project overview</Breadcrumbs.Crumb>,
            ]}
            secondaryAction={{ text: 'Deploy app', onClick: () => {} }}
            primaryAction={{ text: 'Create service', onClick: onCreateServiceClick }}
          />
          <Box className="playground-ecosystem-tabs">
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value as StudioTab)}>
              <Tabs.Tab title="Aiven Studio" value="aiven-studio" />
              <Tabs.Tab title="Services" value="services" />
            </Tabs>
          </Box>
        </Box>

        {/* Tab panels */}
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            padding: activeTab === 'aiven-studio' ? '24px 16px' : 0,
          }}
        >
          {activeTab === 'services' ? (
            <ServicesEmptyTab onCreateServiceClick={onCreateServiceClick} />
          ) : (
            <Box
              style={{
                maxWidth: 982,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                padding: '0 16px',
              }}
            >
              <StudioBannerGraphic />

              {/* Let's get you building */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Typography.LargeHeading>Let&apos;s get you building</Typography.LargeHeading>
                <Box
                  style={{
                    border: '1px solid var(--aquarium-border-color-default)',
                    borderRadius: 4,
                    padding: 16,
                    backgroundColor: 'var(--aquarium-background-color-layer)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <textarea
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    rows={2}
                    placeholder="Chat with your Aiven ecosystem..."
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      padding: 0,
                      margin: 0,
                      background: 'transparent',
                      fontFamily: 'inherit',
                      fontSize: 14,
                      lineHeight: 1.42,
                      color: 'var(--aquarium-text-color-muted)',
                    }}
                  />
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Box
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 9999,
                          backgroundColor: 'var(--aquarium-background-color-muted)',
                        }}
                      >
                        <Icon icon={applicationsIcon} style={{ width: 14, height: 14 }} />
                        <Typography.Small>All projects</Typography.Small>
                      </Box>
                      <Button.Icon type="button" dense aria-label="Attach file" icon={attachmentIcon} />
                    </Box>
                    <Button.Icon
                      type="button"
                      dense
                      aria-label="Send message"
                      icon={sendIcon}
                      disabled={!chatDraft.trim()}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Actions */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Typography.Subheading>Actions to get you started</Typography.Subheading>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Box style={{ display: 'flex', gap: 24 }}>
                    {ECOSYSTEM_ACTIONS.slice(0, 3).map((action) => (
                      <EcosystemActionCard key={action.id} action={action} onClick={() => {}} />
                    ))}
                  </Box>
                  <Box style={{ display: 'flex', gap: 24, maxWidth: 625 }}>
                    {ECOSYSTEM_ACTIONS.slice(3).map((action) => (
                      <EcosystemActionCard key={action.id} action={action} onClick={() => {}} />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Ecosystem topology */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Typography.Subheading>Ecosystem topology</Typography.Subheading>
                <Box
                  style={{
                    border: '1px solid var(--aquarium-border-color-default)',
                    borderRadius: 4,
                    padding: '24px 16px',
                    backgroundColor: 'var(--aquarium-background-color-layer)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'center',
                  }}
                >
                  <Icon icon={mapIcon} style={{ width: 60, height: 60, color: 'var(--aquarium-text-color-muted)' }} />
                  <Typography.DefaultStrong color="muted">You have no services yet</Typography.DefaultStrong>
                  <Typography.Small color="muted">
                    We&apos;ll map your ecosystem here when there&apos;s data flowing.
                  </Typography.Small>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

PlaygroundEcosystemServices.displayName = 'PlaygroundEcosystemServices'
