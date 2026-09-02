'use client'

import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Divider,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import linkExternalIcon from '@aivenio/aquarium/icons/linkExternal'
import { getServiceIconUrl } from '@experiments/_shared/components/ServiceIcon'
import type { ServiceTypeId } from '@experiments/_shared/lib/serviceTypes'
import { DevToolsDrawerProvider, HomeRightColumn, useDevToolsDrawer } from '@experiments/_shared/home/HomeRightColumn'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import {
  DOCS,
  FIRST_RESOURCE_ACTIONS,
  GETTING_STARTED_STEPS,
  LEARN_LINKS,
  ORG_NAME,
  PROJECT,
  USER_NAME,
  type FirstResourceAction,
  type GettingStartedStep,
  type IconTone,
} from './mockData'
import styles from './HomePageContent.module.css'

const SERVICE_ICON_STACK_SIZE = 40
const SERVICE_ICON_STACK_OVERLAP = 8

const ICON_TONE: Record<IconTone, { iconColor: string; iconBg: string }> = {
  primary: {
    iconColor: 'var(--aquarium-text-color-primary-graphic)',
    iconBg: 'var(--aquarium-background-color-primary-muted)',
  },
  info: {
    iconColor: 'var(--aquarium-text-color-info-intense)',
    iconBg: 'var(--aquarium-background-color-info-muted)',
  },
  success: {
    iconColor: 'var(--aquarium-text-color-success-intense)',
    iconBg: 'var(--aquarium-background-color-success-muted)',
  },
}

export function HomePageContent() {
  const router = useRouter()

  return (
    <DevToolsDrawerProvider>
      <Box
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <OrgSidebar
          orgName={ORG_NAME}
          activeItem="overview"
          onItemClick={(id) => {
            if (id === 'projects') router.push(ROUTES.projectsPage)
            if (id === 'data-flow') router.push(ROUTES.dataFlow)
          }}
        />
        <Box className={styles.overviewGrid}>
          <Box className={styles.page}>
            <PageHeader
              title={`Welcome to Aiven Platform, ${USER_NAME}`}
              subtitle="Your first project is ready. Choose what you want to build."
            />
            <CreateFirstResource />
            <YourProject />
            <Box className={styles.bottomGrid}>
              <GettingStartedCard />
              <WhatHappensNextCard />
            </Box>
            <LearnAboutAiven />
          </Box>

          <Divider direction="vertical" />

          <HomeRightColumn />
        </Box>
      </Box>
    </DevToolsDrawerProvider>
  )
}

HomePageContent.displayName = 'HomePageContent'

function IconTile({
  icon,
  tone,
  size = 40,
}: {
  icon: IconifyIcon
  tone: IconTone
  size?: number
}) {
  const { iconColor, iconBg } = ICON_TONE[tone]
  return (
    <Box
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--aquarium-border-radius-default)',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon icon={icon} style={{ width: 20, height: 20, color: iconColor }} />
    </Box>
  )
}

IconTile.displayName = 'IconTile'

function CreateFirstResource() {
  return (
    <Card
      fullWidth
      title={
        <Card.Title>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography.DefaultStrong>Create your first resource</Typography.DefaultStrong>
            <Typography.Small color="muted">
              Start with a managed data service, deploy an application, or connect your AI tools.
            </Typography.Small>
          </Box>
        </Card.Title>
      }
    >
      <Box className={styles.resourceGrid}>
        {FIRST_RESOURCE_ACTIONS.map((action) => (
          <ResourceActionCard key={action.id} action={action} />
        ))}
      </Box>
    </Card>
  )
}

CreateFirstResource.displayName = 'CreateFirstResource'

function ResourceAction({ action }: { action: FirstResourceAction }) {
  const { openDrawer } = useDevToolsDrawer()

  if (action.id === 'setup-mcp') {
    return (
      <Button.Secondary type="button" onClick={() => openDrawer('mcp')}>
        {action.actionLabel}
      </Button.Secondary>
    )
  }

  if (action.actionKind === 'primary') {
    return (
      <Button.Primary type="button" onClick={() => undefined}>
        {action.actionLabel}
      </Button.Primary>
    )
  }

  if (action.href) {
    return (
      <Link.Button.Secondary href={action.href} target="_blank">
        {action.actionLabel}
      </Link.Button.Secondary>
    )
  }

  return (
    <Button.Secondary type="button" onClick={() => undefined}>
      {action.actionLabel}
    </Button.Secondary>
  )
}

function ServiceIconStack({ serviceTypeIds }: { serviceTypeIds: ServiceTypeId[] }) {
  return (
    <Box className={styles.serviceIconStack} aria-hidden>
      {serviceTypeIds.map((serviceTypeId, index) => (
        <Box
          key={serviceTypeId}
          className={styles.serviceIconStackItem}
          style={{
            marginLeft: index === 0 ? 0 : -SERVICE_ICON_STACK_OVERLAP,
            zIndex: serviceTypeIds.length - index,
          }}
        >
          <img
            src={getServiceIconUrl(serviceTypeId, 'dark')}
            width={SERVICE_ICON_STACK_SIZE}
            height={SERVICE_ICON_STACK_SIZE}
            alt=""
          />
        </Box>
      ))}
    </Box>
  )
}

function ResourceActionCard({ action }: { action: FirstResourceAction }) {
  const leading =
    action.serviceTypes && action.serviceTypes.length > 0 ? (
      <ServiceIconStack serviceTypeIds={action.serviceTypes} />
    ) : action.icon && action.tone ? (
      <IconTile icon={action.icon} tone={action.tone} />
    ) : null

  return (
    <Box className={styles.resourceCard}>
      <Card
        fullWidth
        title={
          <Card.Title style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
            {leading}
            {action.title}
          </Card.Title>
        }
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <Typography.Small color="muted">{action.description}</Typography.Small>
          <ResourceAction action={action} />
        </Box>
      </Card>
    </Box>
  )
}

ResourceAction.displayName = 'ResourceAction'
ServiceIconStack.displayName = 'ServiceIconStack'
ResourceActionCard.displayName = 'ResourceActionCard'

function YourProject() {
  const router = useRouter()

  return (
    <Section title="Your project">
      <Card
        fullWidth
        title={
          <Card.Title>
            <Box className={styles.projectRow}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                <IconTile icon={folderCloseIcon} tone="primary" />
                <Box style={{ minWidth: 0 }}>
                  <Typography.DefaultStrong>{PROJECT.name}</Typography.DefaultStrong>
                  <Typography.Small color="muted">{PROJECT.caption}</Typography.Small>
                </Box>
              </Box>
              <Typography.Small color="muted">{PROJECT.resourceCountLabel}</Typography.Small>
              <StatusChip dense text={PROJECT.statusLabel} status="neutral" />
              <Typography.Small color="muted">{PROJECT.createdLabel}</Typography.Small>
              <Button.Secondary type="button" onClick={() => router.push(ROUTES.projectPage)}>
                Open project
              </Button.Secondary>
            </Box>
          </Card.Title>
        }
      />
    </Section>
  )
}

YourProject.displayName = 'YourProject'

function GettingStartedCard() {
  return (
    <Box className={styles.bottomCard}>
      <Card fullWidth title="Get started with Aiven Platform">
        <Box className={styles.gettingStartedBody}>
          <GettingStartedSteps steps={GETTING_STARTED_STEPS} />
          <Typography.Default>
            <Link href={DOCS.gettingStarted} target="_blank" icon={linkExternalIcon} iconPlacement="right">
              View getting started guide
            </Link>
          </Typography.Default>
        </Box>
      </Card>
    </Box>
  )
}

GettingStartedCard.displayName = 'GettingStartedCard'

function GettingStartedSteps({ steps }: { steps: GettingStartedStep[] }) {
  return (
    <Box className={styles.steps}>
      {steps.map((step, index) => {
        const isCurrent = step.status === 'current'
        const isLast = index === steps.length - 1
        return (
          <Box key={step.id} className={styles.step}>
            <Box className={styles.stepMarker}>
              <Box
                aria-hidden
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: isCurrent
                    ? 'var(--aquarium-background-color-primary-graphic)'
                    : 'transparent',
                  border: isCurrent ? undefined : '1px solid var(--aquarium-border-color-muted)',
                  color: isCurrent
                    ? 'var(--aquarium-text-color-opposite-default)'
                    : 'var(--aquarium-text-color-muted)',
                  fontSize: 12,
                  lineHeight: '16px',
                  fontWeight: 600,
                }}
              >
                {index + 1}
              </Box>
              {isLast ? null : <Box className={styles.stepLine} />}
            </Box>
            <Box className={styles.stepCopy}>
              {isCurrent ? (
                <Typography.DefaultStrong>{step.label}</Typography.DefaultStrong>
              ) : (
                <Typography.Default color="muted">{step.label}</Typography.Default>
              )}
            </Box>
            <Box className={styles.stepCopy}>
              {isCurrent ? (
                <Box style={{ color: 'var(--aquarium-text-color-primary-default)' }}>
                  <Typography.SmallStrong>Current</Typography.SmallStrong>
                </Box>
              ) : (
                <Typography.Small color="muted">Next</Typography.Small>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

GettingStartedSteps.displayName = 'GettingStartedSteps'

function WhatHappensNextCard() {
  return (
    <Box className={styles.bottomCard}>
      <Card fullWidth title="What happens next?">
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Typography.Small color="muted">
            Once you create a resource, this homepage will show its status, updates, and recommendations.
          </Typography.Small>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <Typography.Default>
              <Link href={DOCS.documentation} target="_blank" icon={linkExternalIcon} iconPlacement="right">
                Explore documentation
              </Link>
            </Typography.Default>
            <Typography.Default>
              <Link href={DOCS.askAi} target="_blank" icon={linkExternalIcon} iconPlacement="right">
                Ask AI
              </Link>
            </Typography.Default>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

WhatHappensNextCard.displayName = 'WhatHappensNextCard'

function LearnAboutAiven() {
  return (
    <Section title="Learn about Aiven" collapsible defaultCollapsed={false}>
      <Box className={styles.learnLinks}>
        {LEARN_LINKS.map((item) => (
          <Typography.Default key={item.id}>
            <Link href={item.href} target="_blank" icon={linkExternalIcon} iconPlacement="right">
              {item.label}
            </Link>
          </Typography.Default>
        ))}
      </Box>
    </Section>
  )
}

LearnAboutAiven.displayName = 'LearnAboutAiven'
