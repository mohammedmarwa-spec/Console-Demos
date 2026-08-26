'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Banner,
  Button,
  Divider,
  EmptyState,
  Link,
  Select,
  Typography,
} from '@aivenio/aquarium'
import clipboardIcon from '@aivenio/aquarium/icons/clipboard'
import clipboardCheckIcon from '@aivenio/aquarium/icons/clipboardCheck'
import { imageSrc } from '@experiments/_shared/lib/image'
import { aquariumSelectValue } from '@/lib/aquariumSelect'
import { DevToolsDrawerProvider, useDevToolsDrawer } from './DevToolsDrawer'
import { CLI_QUICK_START, DEV_TOOLS_PROMO } from './devToolsData'
import {
  PRODUCT_UPDATES_DOCS,
  PRODUCT_UPDATES_PREVIEW_COUNT,
  PRODUCT_UPDATE_SERVICE_OPTIONS,
  RELEASE_NOTES,
  filterReleaseNotes,
  type ProductUpdateServiceFilter,
} from './productUpdatesData'
import devToolsBanner from './assets/home-page-dev-tools-banner.svg'
import styles from './HomeRightColumn.module.css'

export { DevToolsDrawerProvider, useDevToolsDrawer } from './DevToolsDrawer'

export function HomeRightColumn() {
  return (
    <DevToolsDrawerProvider>
      <HomeRightColumnRail />
    </DevToolsDrawerProvider>
  )
}

HomeRightColumn.displayName = 'HomeRightColumn'

function HomeRightColumnRail() {
  const { openDrawer } = useDevToolsDrawer()

  return (
    <Box className={styles.rail}>
      <Box className={styles.devTools}>
        <Typography.LargeStrong>Dev tools</Typography.LargeStrong>
        <DevToolsPromo onGetStarted={() => openDrawer()} />
        <CliQuickStart onOpenCli={() => openDrawer('cli')} />
      </Box>
      <ProductUpdates />
    </Box>
  )
}

HomeRightColumnRail.displayName = 'HomeRightColumnRail'

function DevToolsPromo({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <Banner
      variant="outlined"
      title={DEV_TOOLS_PROMO.title}
      image={imageSrc(devToolsBanner)}
      action={{
        text: DEV_TOOLS_PROMO.actionLabel,
        onClick: onGetStarted,
      }}
    >
      {DEV_TOOLS_PROMO.description}
    </Banner>
  )
}

DevToolsPromo.displayName = 'DevToolsPromo'

function CliQuickStart({ onOpenCli }: { onOpenCli: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyCommand = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return
    void navigator.clipboard.writeText(CLI_QUICK_START.command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <Banner
      variant="outlined"
      title={CLI_QUICK_START.title}
      action={{
        text: 'Open CLI setup',
        onClick: onOpenCli,
      }}
    >
      <Box className={styles.codeBlock}>
        <Typography.Small color="muted">$</Typography.Small>
        <Box className={styles.codeText}>
          <Typography.CodeSmall>{CLI_QUICK_START.command}</Typography.CodeSmall>
        </Box>
        <Button.Icon
          type="button"
          dense
          icon={copied ? clipboardCheckIcon : clipboardIcon}
          aria-label={copied ? 'Copied' : 'Copy command'}
          tooltip={copied ? 'Copied' : 'Copy'}
          onClick={copyCommand}
        />
      </Box>
    </Banner>
  )
}

CliQuickStart.displayName = 'CliQuickStart'

function ProductUpdates() {
  const [serviceFilter, setServiceFilter] = useState<ProductUpdateServiceFilter>('all')
  const matchingNotes = useMemo(
    () => filterReleaseNotes(RELEASE_NOTES, serviceFilter),
    [serviceFilter],
  )
  const previewNotes = matchingNotes.slice(0, PRODUCT_UPDATES_PREVIEW_COUNT)

  return (
    <Box className={styles.updatesPanel}>
      <Box className={styles.updatesHeader}>
        <Typography.LargeStrong>Product updates</Typography.LargeStrong>
        <Typography.Default>
          <Link href={PRODUCT_UPDATES_DOCS.changelogRss} target="_blank">
            RSS Feed
          </Link>
        </Typography.Default>
      </Box>
      <Box className={styles.serviceSelect}>
        <Select
          labelText="Service"
          options={PRODUCT_UPDATE_SERVICE_OPTIONS}
          value={serviceFilter}
          onChange={(selected) =>
            setServiceFilter(aquariumSelectValue(selected, 'all') as ProductUpdateServiceFilter)
          }
          reserveSpaceForError={false}
        />
      </Box>
      {previewNotes.length === 0 ? (
        <EmptyState title="No updates for this service">
          Try another service, or view the full changelog.
        </EmptyState>
      ) : (
        <Box className={styles.updatesList}>
          {previewNotes.map((note, index) => (
            <Box key={note.id}>
              {index > 0 ? <Divider /> : null}
              <Box
                component="a"
                href={note.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.updateItem}
              >
                <Typography.Small color="muted">
                  {note.date} // {note.tag}
                </Typography.Small>
                <Typography.DefaultStrong>{note.title}</Typography.DefaultStrong>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Typography.Default>
        <Link href={PRODUCT_UPDATES_DOCS.changelog} target="_blank">
          View all ({matchingNotes.length})
        </Link>
      </Typography.Default>
    </Box>
  )
}

ProductUpdates.displayName = 'ProductUpdates'
