'use client'

import { Box, Icon, Typography } from '@aivenio/aquarium'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'

const SECTION_ICON_WIDTH = 32
const SECTION_LINE_WIDTH = 1

const SECTION_ENTER_MS = 840
const CONNECTOR_GROW_MS = 1280
const BODY_ENTER_MS = 960
const STAGGER_MS = 720
const HEADER_LEAD_MS = 120
const CONNECTOR_LEAD_MS = 400
const BODY_LEAD_MS = 360

/** Visible skeleton hold after the plan section body has entered. */
export const PLAN_SKELETON_HOLD_MS = 1600

export const SECTION_CONTENT_OFFSET_PX = SECTION_ICON_WIDTH + 16
export const SECTION_GAP_PX = 40

/** Fallback if body `animationend` never fires (compile overlay / reduced motion). Plan section is index 2. */
export function planCardsRevealDelayMs(): number {
  return HEADER_LEAD_MS + 2 * STAGGER_MS + BODY_LEAD_MS + BODY_ENTER_MS + PLAN_SKELETON_HOLD_MS
}

export const ONBOARDING_FLOW_MOTION_CSS = `
@keyframes onboarding-flow-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes onboarding-flow-connector-grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.onboarding-flow-enter {
  animation: onboarding-flow-enter ${SECTION_ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.onboarding-flow-body-enter {
  animation: onboarding-flow-enter ${BODY_ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.onboarding-flow-connector {
  transform-origin: top center;
  animation: onboarding-flow-connector-grow ${CONNECTOR_GROW_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.onboarding-plan-skeleton {
  animation: onboarding-plan-skeleton-hold ${PLAN_SKELETON_HOLD_MS}ms linear both;
}

@keyframes onboarding-plan-skeleton-hold {
  from { opacity: 1; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .onboarding-flow-enter,
  .onboarding-flow-body-enter,
  .onboarding-flow-connector,
  .onboarding-plan-skeleton {
    animation: none;
  }
}

body:has(.onboarding-apps-root) footer {
  display: none;
}
`

function delayStyle(delayMs: number): CSSProperties {
  return { animationDelay: `${delayMs}ms` }
}

export function AnimatedCreationFlowSection({
  icon,
  title,
  children,
  showConnector = true,
  index,
  onBodyAnimationEnd,
}: {
  icon: ComponentProps<typeof Icon>['icon']
  title: string
  children: ReactNode
  showConnector?: boolean
  /** 0-based order on the page; drives stagger. */
  index: number
  onBodyAnimationEnd?: () => void
}) {
  const headerDelay = HEADER_LEAD_MS + index * STAGGER_MS
  const connectorDelay = headerDelay + CONNECTOR_LEAD_MS
  const bodyDelay = headerDelay + BODY_LEAD_MS

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: `${SECTION_ICON_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: 'auto auto',
        columnGap: 16,
        minWidth: 0,
        alignItems: 'start',
      }}
    >
      <Box
        className="onboarding-flow-enter"
        style={{
          width: SECTION_ICON_WIDTH,
          height: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          ...delayStyle(headerDelay),
        }}
      >
        <Icon aria-hidden icon={icon} color="muted" style={{ width: 20, height: 20 }} />
      </Box>

      <Box
        className="onboarding-flow-enter"
        style={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 4,
          ...delayStyle(headerDelay),
        }}
      >
        <Typography.Subheading color="intense" htmlTag="h3">
          {title}
        </Typography.Subheading>
      </Box>

      <Box
        style={{
          paddingTop: 16,
          width: SECTION_ICON_WIDTH,
          minWidth: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        {showConnector ? (
          <Box
            aria-hidden="true"
            className="onboarding-flow-connector"
            style={{
              width: SECTION_LINE_WIDTH,
              minWidth: SECTION_LINE_WIDTH,
              height: '100%',
              minHeight: 40,
              backgroundColor: 'var(--aquarium-border-color-muted)',
              alignSelf: 'stretch',
              ...delayStyle(connectorDelay),
            }}
          />
        ) : null}
      </Box>

      <Box
        className="onboarding-flow-body-enter"
        style={{ paddingTop: 16, minWidth: 0, ...delayStyle(bodyDelay) }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === 'onboarding-flow-enter') {
            onBodyAnimationEnd?.()
          }
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

AnimatedCreationFlowSection.displayName = 'AnimatedCreationFlowSection'
