'use client'

import { Funnel_Display, Inter } from 'next/font/google'
import { Box, Icon, Typography } from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import searchIcon from '@aivenio/aquarium/icons/search'
import userIcon from '@aivenio/aquarium/icons/user'
import { getAivenIcon } from '@experiments/_shared/lib/aivenIcon'
import { MorphingShapesCanvas } from './MorphingShapesCanvas'
import styles from './WebsiteHero.module.css'

const funnelDisplay = Funnel_Display({
  subsets: ['latin'],
  weight: '800',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const NAV_ITEMS = ['Products', 'Solutions', 'Developers', 'Pricing', 'Blog'] as const
const PARTNERS = ['TOYOTA', 'DOORDASH', 'WAYVE', 'ICEYE', 'PRICELINE', 'DECATHLON'] as const

export function WebsiteHero() {
  return (
    <Box
      className={`${styles.page} ${inter.className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 48px)',
        minHeight: 640,
        overflow: 'hidden',
        backgroundColor: '#05080f',
        color: '#ffffff',
      }}
    >
      <MorphingShapesCanvas />
      <Box className={styles.scrim} aria-hidden />

      <Box className={styles.content}>
        <Box className={styles.nav} component="header">
          <Box className={styles.brand} aria-label="Aiven">
            <Icon
              icon={getAivenIcon('dark')}
              style={{ width: 28, height: 24, display: 'block', flexShrink: 0, color: '#ffffff' }}
            />
            <span className={styles.brandName}>aiven</span>
          </Box>

          <Box className={styles.navLinks} component="nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <button key={item} className={styles.navLink} type="button">
                {item}
                {item !== 'Pricing' && item !== 'Blog' ? (
                  <Icon icon={chevronDownIcon} style={{ width: 16, height: 16, color: '#ffffff' }} />
                ) : null}
              </button>
            ))}
          </Box>

          <Box className={styles.navEnd}>
            <button className={styles.iconButton} type="button" aria-label="Account">
              <Icon icon={userIcon} style={{ width: 20, height: 20, color: '#ffffff' }} />
            </button>
            <button className={styles.iconButton} type="button" aria-label="Search">
              <Icon icon={searchIcon} style={{ width: 20, height: 20, color: '#ffffff' }} />
            </button>
            <button className={`${styles.pill} ${styles.pillGhost} ${styles.pillNavGhost}`} type="button">
              Book a demo
            </button>
            <button className={`${styles.pill} ${styles.pillNavSolid}`} type="button">
              Get building
            </button>
          </Box>
        </Box>

        <Box className={styles.hero} component="main">
          <Box className={styles.copy}>
            <h1 className={`${styles.headline} ${funnelDisplay.className}`}>
              <span className={styles.highlight}>Open source</span> data infrastructure, made simple.
            </h1>
            <Typography.Default className={styles.subhead}>
              Get production-ready Kafka, PostgreSQL, ClickHouse, OpenSearch, and more — on any cloud, in
              minutes, with no infra ops required — all backed by Aiven&apos;s 99.99% SLA.
            </Typography.Default>
            <Box className={styles.actions}>
              <button className={`${styles.pill} ${styles.pillGhost}`} type="button">
                Book a demo
              </button>
              <button className={`${styles.pill} ${styles.pillSolid}`} type="button">
                Get building
              </button>
            </Box>
          </Box>
        </Box>

        <Box className={styles.partners} aria-label="Customers">
          {PARTNERS.map((name) => (
            <span key={name} className={styles.partner}>
              {name}
            </span>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

WebsiteHero.displayName = 'WebsiteHero'
