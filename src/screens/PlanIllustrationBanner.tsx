import { useMemo } from 'react'
import developerBanner from '../assets/upgrade-plan-illus/developer-banner.svg?raw'
import hobbyistBanner from '../assets/upgrade-plan-illus/hobbyist-banner.svg?raw'
import startupBanner from '../assets/upgrade-plan-illus/startup-banner.svg?raw'
import {
  type IllustrationKey,
  resolvePlanIllustrationKey,
} from './upgradePlanIllustrations'

const BANNER_SVG: Record<IllustrationKey, string> = {
  developer: developerBanner,
  hobbyist: hobbyistBanner,
  startup: startupBanner,
}

/** Figma 2565:23856 / 23859 / 23862 — native 275×120 banner art. */
const BANNER_HEIGHT = 120

type PlanIllustrationBannerProps = {
  planId: string
}

export function PlanIllustrationBanner({ planId }: PlanIllustrationBannerProps) {
  const markup = useMemo(() => {
    const variant = resolvePlanIllustrationKey(planId)
    return BANNER_SVG[variant]
  }, [planId])

  return (
    <span
      className="plan-illustration-banner"
      aria-hidden
      style={{
        display: 'block',
        width: '100%',
        height: BANNER_HEIGHT,
        flexShrink: 0,
        lineHeight: 0,
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

PlanIllustrationBanner.displayName = 'PlanIllustrationBanner'
