'use client'

import { useMemo, useState, type Key } from 'react'
import {
  Box,
  Banner,
  Button,
  Divider,
  DropdownMenu,
  EmptyState,
  Link,
  Typography,
} from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import { imageSrc } from '@experiments/_shared/lib/image'
import { DevToolsDrawerProvider, useDevToolsDrawer } from './DevToolsDrawer'
import { DEV_TOOLS_PROMO } from './devToolsData'
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

function isProductUpdateServiceFilter(value: string): value is ProductUpdateServiceFilter {
  return PRODUCT_UPDATE_SERVICE_OPTIONS.some((option) => option.value === value)
}

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

function ProductUpdates() {
  const [serviceFilter, setServiceFilter] = useState<ProductUpdateServiceFilter>('all')
  const matchingNotes = useMemo(
    () => filterReleaseNotes(RELEASE_NOTES, serviceFilter),
    [serviceFilter],
  )
  const previewNotes = matchingNotes.slice(0, PRODUCT_UPDATES_PREVIEW_COUNT)
  const filterLabel =
    serviceFilter === 'all'
      ? 'All services'
      : (PRODUCT_UPDATE_SERVICE_OPTIONS.find((option) => option.value === serviceFilter)?.label ??
        'All services')

  return (
    <Box className={styles.updatesPanel}>
      <Box className={styles.updatesHeader}>
        <Box className={styles.updatesHeaderStart}>
          <Typography.LargeStrong>Product updates</Typography.LargeStrong>
          <DropdownMenu
            placement="bottom-start"
            onAction={(key: Key) => {
              const value = String(key)
              if (isProductUpdateServiceFilter(value)) setServiceFilter(value)
            }}
          >
            <DropdownMenu.Trigger>
              <Button.Ghost
                type="button"
                dense
                icon={chevronDownIcon}
                iconPlacement="right"
                aria-label="Filter product updates by service"
              >
                {filterLabel}
              </Button.Ghost>
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              {PRODUCT_UPDATE_SERVICE_OPTIONS.map((option) => (
                <DropdownMenu.Item
                  key={option.value}
                  id={option.value}
                  textValue={option.label === 'All' ? 'All services' : option.label}
                >
                  {option.label === 'All' ? 'All services' : option.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Items>
          </DropdownMenu>
        </Box>
        <Typography.Default>
          <Link href={PRODUCT_UPDATES_DOCS.changelogRss} target="_blank">
            RSS Feed
          </Link>
        </Typography.Default>
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
