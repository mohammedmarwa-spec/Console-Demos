import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Icon,
  Link,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import arrowRightIcon from '@aivenio/aquarium/icons/arrowRight'
import attachmentIcon from '@aivenio/aquarium/icons/attachment'
import cloudUploadIcon from '@aivenio/aquarium/icons/cloudUpload'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import collapsePanelIcon from '@aivenio/aquarium/icons/collapsePanel'
import databaseIcon from '@aivenio/aquarium/icons/database'
import mapIcon from '@aivenio/aquarium/icons/map'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import sendIcon from '@aivenio/aquarium/icons/send'
import smallPlusIcon from '@aivenio/aquarium/icons/smallPlus'
import type { ServiceTypeId } from '../screens/ServiceTypeSelectModal'

const AI_QUICK_ACTIONS = [
  'Load ecommerce sample data',
  'Create a starter schema',
  'Import CSV data',
] as const

type SetupPath = 'sample' | 'import' | 'editor'

function SetupOptionCard({
  icon,
  title,
  description,
  actionLabel,
  recommended,
  onAction,
}: {
  icon: typeof databaseIcon
  title: string
  description: string
  actionLabel: string
  recommended?: boolean
  onAction: () => void
}) {
  return (
    <Card
      fullWidth
      onClick={onAction}
      title={
        <Card.Title>
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                border: '1px solid var(--aquarium-border-color-muted)',
                backgroundColor: 'var(--aquarium-background-color-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon={icon} style={{ width: 20, height: 20 }} />
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <Typography.DefaultStrong>{title}</Typography.DefaultStrong>
              {recommended ? <StatusChip text="Recommended" status="success" dense /> : null}
            </Box>
          </Box>
        </Card.Title>
      }
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 100 }}>
        <Typography.Small color="muted">{description}</Typography.Small>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onAction()
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}
        >
          {actionLabel}
          <Icon icon={arrowRightIcon} style={{ width: 14, height: 14 }} />
        </Link>
      </Box>
    </Card>
  )
}

function EditorNavItem({
  active,
  label,
  icon,
  onClick,
}: {
  active?: boolean
  label: string
  icon: typeof mapIcon
  onClick?: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 20px',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        backgroundColor: active ? 'var(--aquarium-background-color-primary-muted)' : 'transparent',
        color: active
          ? 'var(--aquarium-text-color-primary-default)'
          : 'var(--aquarium-text-color-default)',
      }}
    >
      <Icon icon={icon} style={{ width: 16, height: 16, flexShrink: 0 }} />
      <Typography.Small>{label}</Typography.Small>
    </Box>
  )
}

export type ServicePgStudioGettingStartedProps = {
  serviceTypeId?: ServiceTypeId | null
  onSetupPathChosen: (path: SetupPath) => void
}

export function ServicePgStudioGettingStarted({
  serviceTypeId = null,
  onSetupPathChosen,
}: ServicePgStudioGettingStartedProps) {
  const isPostgres = serviceTypeId === 'postgresql'
  const engineLabel = isPostgres ? 'PostgreSQL' : 'MySQL'
  const [chatDraft, setChatDraft] = useState('')
  const [aiPanelOpen, setAiPanelOpen] = useState(true)

  return (
    <Box
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        borderTop: '1px solid var(--aquarium-border-color-default)',
      }}
    >
      {/* Editor sidebar */}
      <Box
        style={{
          width: 200,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--aquarium-background-color-body)',
          borderRight: '1px solid var(--aquarium-border-color-default)',
        }}
      >
        <Box
          style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '2px solid var(--aquarium-border-color-default)',
            flexShrink: 0,
          }}
        >
          <Box component="span" style={{ fontWeight: 500, fontSize: 12 }}>
            <Typography.Small>Editor</Typography.Small>
          </Box>
        </Box>
        <Box style={{ padding: '8px 0', flex: 1 }}>
          <EditorNavItem active label="Open schema map" icon={mapIcon} />
          <EditorNavItem label="Saved queries" icon={queriesEditorIcon} />
        </Box>
      </Box>

      {/* Main workspace */}
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--aquarium-background-color-body)',
          borderRight: aiPanelOpen ? '1px solid var(--aquarium-border-color-default)' : undefined,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'stretch',
            backgroundColor: 'var(--aquarium-background-color-layer)',
            borderBottom: '1px solid var(--aquarium-border-color-default)',
            flexShrink: 0,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 44,
              padding: '0 12px',
              borderRight: '1px solid var(--aquarium-border-color-default)',
              borderBottom: '2px solid var(--aquarium-border-color-primary-default)',
              backgroundColor: 'var(--aquarium-background-color-primary-muted)',
              color: 'var(--aquarium-text-color-primary-default)',
            }}
          >
            <Icon icon={mapIcon} style={{ width: 16, height: 16 }} />
            <Typography.Small>Schema map</Typography.Small>
          </Box>
          <Box
            component="button"
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              border: 'none',
              borderRight: '1px solid var(--aquarium-border-color-muted)',
              backgroundColor: 'var(--aquarium-background-color-layer)',
              cursor: 'pointer',
            }}
          >
            <Icon icon={smallPlusIcon} style={{ width: 16, height: 16 }} />
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            gap: 16,
            padding: '8px 16px',
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
            flexShrink: 0,
          }}
        >
          <Typography.Small color="muted">
            <Box component="span" style={{ color: 'var(--aquarium-text-color-default)' }}>Source:</Box> defaultdb
          </Typography.Small>
          <Typography.Small color="muted">
            <Box component="span" style={{ color: 'var(--aquarium-text-color-default)' }}>Schema:</Box> public
          </Typography.Small>
        </Box>

        <Box
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <Box
            style={{
              width: '100%',
              maxWidth: 960,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <StatusChip text={`${engineLabel} service is running`} status="success" dense />
            <Box style={{ textAlign: 'center', maxWidth: 560 }}>
              <Typography.Heading>Set up your database</Typography.Heading>
              <Box style={{ marginTop: 8 }}>
                <Typography.Default color="muted">
                  Add data to start using the schema map, saved queries, and the AI Assistant. Choose the path that
                  matches your workflow.
                </Typography.Default>
              </Box>
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
                width: '100%',
              }}
            >
              <SetupOptionCard
                icon={databaseIcon}
                title="Load sample data"
                description="Start with a ready-made dataset so schema map, saved queries, and the AI Assistant are useful immediately."
                actionLabel="Choose sample"
                recommended
                onAction={() => onSetupPathChosen('sample')}
              />
              <SetupOptionCard
                icon={cloudUploadIcon}
                title="Import your data"
                description="Upload a CSV or SQL dump, or bring data from another database when you already know what you want to inspect."
                actionLabel="Import data"
                onAction={() => onSetupPathChosen('import')}
              />
              <SetupOptionCard
                icon={codeBlockIcon}
                title="Start from scratch"
                description="Open an empty SQL editor and create tables manually. Best for advanced users or custom schemas."
                actionLabel="Open editor"
                onAction={() => onSetupPathChosen('editor')}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* AI Assistant */}
      {aiPanelOpen && (
        <Box
          style={{
            width: 360,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--aquarium-background-color-layer)',
            borderLeft: '1px solid var(--aquarium-border-color-default)',
          }}
        >
          <Box
            style={{
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              borderBottom: '1px solid var(--aquarium-border-color-default)',
              flexShrink: 0,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon icon={proPlansIcon} style={{ width: 24, height: 24, color: 'var(--aquarium-text-color-primary-default)' }} />
              <Typography.DefaultStrong>AI Assistant</Typography.DefaultStrong>
            </Box>
            <Button.Icon
              type="button"
              dense
              aria-label="Collapse AI Assistant"
              icon={collapsePanelIcon}
              onClick={() => setAiPanelOpen(false)}
            />
          </Box>

          <Box
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <Box
              style={{
                border: '1px solid var(--aquarium-border-color-default)',
                borderRadius: 8,
                padding: 16,
                backgroundColor: 'var(--aquarium-background-color-body)',
              }}
            >
              <Box style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Icon icon={proPlansIcon} style={{ width: 20, height: 20, color: 'var(--aquarium-text-color-primary-default)' }} />
                <Typography.DefaultStrong>Your schema is empty</Typography.DefaultStrong>
              </Box>
              <Typography.Small color="muted">
                {`I can help you create tables, import data, or load a sample dataset to explore ${isPostgres ? 'PG' : 'MySQL'} Studio.`}
              </Typography.Small>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {AI_QUICK_ACTIONS.map((action) => (
                  <Box key={action} style={{ display: 'flex' }}>
                    <Button.Ghost type="button" dense onClick={() => onSetupPathChosen('sample')}>
                      {action}
                    </Button.Ghost>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box style={{ padding: 24, flexShrink: 0 }}>
            <Box
              style={{
                border: '1px solid var(--aquarium-border-color-default)',
                borderRadius: 4,
                padding: 16,
                backgroundColor: 'var(--aquarium-background-color-layer)',
              }}
            >
              <textarea
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                rows={3}
                placeholder="Ask a question or describe what you need..."
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
                  color: 'var(--aquarium-text-color-default)',
                }}
              />
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Button.Icon type="button" dense aria-label="Attach file" icon={attachmentIcon} />
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
        </Box>
      )}
    </Box>
  )
}

ServicePgStudioGettingStarted.displayName = 'ServicePgStudioGettingStarted'
