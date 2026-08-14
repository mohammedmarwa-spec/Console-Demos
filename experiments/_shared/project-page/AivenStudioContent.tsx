'use client'

import {
  Box,
  Button,
  Icon,
  InputBase,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import arrowRightIcon from '@aivenio/aquarium/icons/arrowRight'
import attachmentIcon from '@aivenio/aquarium/icons/attachment'
import githubLogoIcon from '@aivenio/aquarium/icons/githubLogo'
import lockIcon from '@aivenio/aquarium/icons/lock'
import { ServiceIcon } from '@/components/ServiceIcon'
import gitlabLogoIcon from './icons/gitlabLogoIcon'

const SERVICE_SHOWCASE = [
  { id: 'postgresql' as const, label: 'PostgreSQL' },
  { id: 'kafka' as const, label: 'Apache Kafka' },
  { id: 'opensearch' as const, label: 'OpenSearch' },
  { id: 'clickhouse' as const, label: 'ClickHouse' },
]

/** Static Aiven Studio landing — centered composition, no interactions. */
export function AivenStudioContent() {
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {SERVICE_SHOWCASE.map(({ id, label }) => (
            <ServiceIcon key={id} serviceTypeId={id} size={48} alt={label} />
          ))}
        </Box>

        <Box style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography.LargeHeading>What do you want to build?</Typography.LargeHeading>
          <Typography.Default color="muted">
            Connect an existing repo or describe your idea. Studio will provision the right managed
            open-source services.
          </Typography.Default>
        </Box>

        <Box
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 20,
            borderRadius: 12,
            border: '1px solid var(--aquarium-border-color-muted)',
            backgroundColor: 'var(--aquarium-background-color-layer)',
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <Typography.DefaultStrong>Connect a Git repo</Typography.DefaultStrong>
            <StatusChip text="Recommended" status="success" dense />
          </Box>

          <Box style={{ display: 'flex', gap: 12 }}>
            <Button.Secondary type="button" icon={githubLogoIcon} style={{ flex: 1 }}>
              GitHub
            </Button.Secondary>
            <Button.Secondary type="button" icon={gitlabLogoIcon} style={{ flex: 1 }}>
              GitLab
            </Button.Secondary>
          </Box>

          <InputBase
            readOnly
            defaultValue="git github.com/acme/orders-api"
            aria-label="Repository URL"
            endAdornment={
              <Button.Primary type="button" dense icon={arrowRightIcon} iconPlacement="right">
                Scan repo
              </Button.Primary>
            }
          />

          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              color: 'var(--aquarium-text-color-muted)',
            }}
          >
            <Icon
              icon={lockIcon}
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                marginTop: 2,
                color: 'var(--aquarium-text-color-success)',
              }}
            />
            <Typography.Caption color="muted">
              Read-only. Studio reads your repo to understand infrastructure. It never writes to or
              edits your application code.
            </Typography.Caption>
          </Box>
        </Box>

        <Box
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Box
            style={{
              flex: 1,
              height: 1,
              backgroundColor: 'var(--aquarium-border-color-muted)',
            }}
          />
          <Typography.Caption color="muted">or build from scratch</Typography.Caption>
          <Box
            style={{
              flex: 1,
              height: 1,
              backgroundColor: 'var(--aquarium-border-color-muted)',
            }}
          />
        </Box>

        <Box style={{ width: '100%' }}>
          <InputBase
            readOnly
            placeholder="Describe your idea or drop a file..."
            aria-label="Describe your idea"
            endAdornment={
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Button.Icon type="button" dense aria-label="Attach file" icon={attachmentIcon} />
                <Button.Icon type="button" dense aria-label="Submit idea" icon={arrowRightIcon} />
              </Box>
            }
          />
        </Box>
      </Box>
    </Box>
  )
}

AivenStudioContent.displayName = 'AivenStudioContent'
