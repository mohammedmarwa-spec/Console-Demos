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
import {
  CLI_QUICK_START,
  DOCS,
  PRODUCT_UPDATES_PREVIEW_COUNT,
  PRODUCT_UPDATE_SERVICE_OPTIONS,
  RELEASE_NOTES,
  filterReleaseNotes,
  type ProductUpdateServiceFilter,
} from './mockData'
import mcpBanner from './assets/home-page-mcp-banner.svg'
import styles from './HomeRightColumn.module.css'

export function HomeRightColumn() {
  return (
    <Box className={styles.rail}>
      <Box className={styles.developerTools}>
        <Typography.LargeStrong>Developer tools</Typography.LargeStrong>
        <AivenMcpPromo />
        <CliQuickStart />
      </Box>
      <ProductUpdates />
    </Box>
  )
}

HomeRightColumn.displayName = 'HomeRightColumn'

function AivenMcpPromo() {
  return (
    <Banner
      variant="outlined"
      title="Build with Aiven MCP"
      image={imageSrc(mcpBanner)}
      action={{
        href: DOCS.mcp,
        target: '_blank',
        text: 'Get started',
      }}
    >
      Connect your AI assistant to Aiven
    </Banner>
  )
}

AivenMcpPromo.displayName = 'AivenMcpPromo'

function CliQuickStart() {
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
        href: CLI_QUICK_START.docsHref,
        target: '_blank',
        text: 'Aiven CLI docs',
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
          <Link href={DOCS.changelogRss} target="_blank">
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
        <Link href={DOCS.changelog} target="_blank">
          View all ({matchingNotes.length})
        </Link>
      </Typography.Default>
    </Box>
  )
}

ProductUpdates.displayName = 'ProductUpdates'
