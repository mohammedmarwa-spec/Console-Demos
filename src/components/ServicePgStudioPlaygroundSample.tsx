import { useState } from 'react'
import { Box, Button, Icon, Typography } from '@aivenio/aquarium'
import attachmentIcon from '@aivenio/aquarium/icons/attachment'
import bookmarkIcon from '@aivenio/aquarium/icons/bookmark'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import collapsePanelIcon from '@aivenio/aquarium/icons/collapsePanel'
import eyeOpenIcon from '@aivenio/aquarium/icons/eyeOpen'
import historyIcon from '@aivenio/aquarium/icons/history'
import lockIcon from '@aivenio/aquarium/icons/lock'
import mapIcon from '@aivenio/aquarium/icons/map'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import runQueryIcon from '@aivenio/aquarium/icons/runQuery'
import sendIcon from '@aivenio/aquarium/icons/send'
import smallCrossIcon from '@aivenio/aquarium/icons/smallCross'
import tableIcon from '@aivenio/aquarium/icons/table'
import timeIcon from '@aivenio/aquarium/icons/time'
import addIcon from '@aivenio/aquarium/icons/add'
import {
  PLAYGROUND_SAMPLE_AI_PROMPTS,
  PLAYGROUND_SAMPLE_DEFAULT_SQL,
  PLAYGROUND_SAMPLE_SAVED_QUERIES,
  PLAYGROUND_SAMPLE_TABLES,
  PLAYGROUND_SAMPLE_VIEWS,
} from '../utils/pgStudioPlaygroundSample'

const CODE_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace'

function ExplorerGroupHeader({
  expanded,
  label,
  icon,
  onToggle,
}: {
  expanded: boolean
  label: string
  icon: typeof tableIcon
  onToggle?: () => void
}) {
  const content = (
    <>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon
          icon={expanded ? chevronDownIcon : chevronRightIcon}
          style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--aquarium-text-color-muted)' }}
        />
        <Icon icon={icon} style={{ width: 16, height: 16, flexShrink: 0 }} />
        <Typography.Small>{label}</Typography.Small>
      </Box>
      <Icon icon={addIcon} style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--aquarium-text-color-muted)' }} />
    </>
  )
  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    borderTop: label === 'Tables' || label === 'Views' ? '1px solid var(--aquarium-border-color-muted)' : undefined,
  } as const

  if (onToggle) {
    return (
      <button type="button" onClick={onToggle} style={{ ...style, border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}>
        {content}
      </button>
    )
  }

  return <Box style={style}>{content}</Box>
}

function ExplorerEntry({ label }: { label: string }) {
  return (
    <Box
      component="button"
      type="button"
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '4px 24px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--aquarium-text-color-default)',
      }}
    >
      <Typography.Small>{label}</Typography.Small>
    </Box>
  )
}

function SchemaTableCard({ name, columns }: { name: string; columns: string }) {
  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-default)',
        borderRadius: 4,
        padding: 12,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        minWidth: 140,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Icon icon={tableIcon} style={{ width: 14, height: 14 }} />
        <Box component="span" style={{ fontWeight: 500, fontSize: 12 }}>
          <Typography.Small>{name}</Typography.Small>
        </Box>
      </Box>
      <Typography.Caption color="muted">{columns}</Typography.Caption>
    </Box>
  )
}

export function ServicePgStudioPlaygroundSample() {
  const [chatDraft, setChatDraft] = useState('')
  const [aiPanelOpen, setAiPanelOpen] = useState(true)
  const [tablesExpanded, setTablesExpanded] = useState(true)
  const [viewsExpanded, setViewsExpanded] = useState(true)

  return (
    <Box
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        borderTop: '1px solid var(--aquarium-border-color-default)',
      }}
    >
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
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon icon={queriesEditorIcon} style={{ width: 16, height: 16 }} />
            <Box component="span" style={{ fontWeight: 500, fontSize: 12 }}>
              <Typography.Small>Studio</Typography.Small>
            </Box>
          </Box>
        </Box>

        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', backgroundColor: 'var(--aquarium-background-color-layer)' }}>
          <ExplorerGroupHeader expanded label="Saved queries" icon={codeBlockIcon} />
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8 }}>
            {PLAYGROUND_SAMPLE_SAVED_QUERIES.map((query) => (
              <ExplorerEntry key={query} label={query} />
            ))}
          </Box>
          <ExplorerGroupHeader
            expanded={tablesExpanded}
            label="Tables"
            icon={tableIcon}
            onToggle={() => setTablesExpanded((v) => !v)}
          />
          {tablesExpanded && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8 }}>
              {PLAYGROUND_SAMPLE_TABLES.map((table) => (
                <ExplorerEntry key={table} label={table} />
              ))}
            </Box>
          )}
          <ExplorerGroupHeader
            expanded={viewsExpanded}
            label="Views"
            icon={eyeOpenIcon}
            onToggle={() => setViewsExpanded((v) => !v)}
          />
          {viewsExpanded && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8 }}>
              {PLAYGROUND_SAMPLE_VIEWS.map((view) => (
                <ExplorerEntry key={view} label={view} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 44,
              padding: '0 12px',
              borderRight: '1px solid var(--aquarium-border-color-default)',
              borderBottom: '1px solid var(--aquarium-border-color-default)',
            }}
          >
            <Icon icon={queriesEditorIcon} style={{ width: 16, height: 16 }} />
            <Typography.Small>orders_overview</Typography.Small>
            <Icon icon={smallCrossIcon} style={{ width: 16, height: 16, color: 'var(--aquarium-text-color-muted)' }} />
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
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
          <Typography.Small color="muted">
            <Box component="span" style={{ color: 'var(--aquarium-text-color-default)' }}>Dataset:</Box> ecommerce sample
          </Typography.Small>
        </Box>

        <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box
            style={{
              flex: '0 0 auto',
              padding: 16,
              borderBottom: '1px solid var(--aquarium-border-color-muted)',
              overflow: 'auto',
            }}
          >
            <Box style={{ marginBottom: 12 }}>
              <Typography.Small color="muted">Schema map · public</Typography.Small>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
              <SchemaTableCard name="customers" columns="id, name, email" />
              <SchemaTableCard name="orders" columns="id, customer_id, total, status" />
              <SchemaTableCard name="products" columns="id, name, price, stock" />
              <SchemaTableCard name="order_items" columns="order_id, product_id, qty" />
            </Box>
          </Box>

          <Box style={{ flex: 1, minHeight: 120, display: 'flex', padding: '16px', overflow: 'auto' }}>
            <Box
              component="pre"
              style={{
                margin: 0,
                fontFamily: CODE_FONT,
                fontSize: 14,
                lineHeight: 1.42,
                color: 'var(--aquarium-text-color-default)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {PLAYGROUND_SAMPLE_DEFAULT_SQL}
            </Box>
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            height: 48,
            padding: '8px 16px',
            borderTop: '1px solid var(--aquarium-border-color-default)',
            backgroundColor: 'var(--aquarium-background-color-layer)',
            flexShrink: 0,
          }}
        >
          <Button.Icon type="button" dense aria-label="Bookmark query" icon={bookmarkIcon} />
          <Button.Ghost type="button" dense icon={proPlansIcon}>
            <Typography.Default color="primary-default">Analyze</Typography.Default>
          </Button.Ghost>
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid var(--aquarium-border-color-default)',
              backgroundColor: 'var(--aquarium-background-color-body)',
            }}
          >
            <Icon icon={timeIcon} style={{ width: 12, height: 12, color: 'var(--aquarium-text-color-muted)' }} />
            <Typography.Caption>00:00:12</Typography.Caption>
          </Box>
          <Button.Icon type="button" dense aria-label="Query history" icon={historyIcon} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon icon={lockIcon} style={{ width: 16, height: 16, color: 'var(--aquarium-text-color-primary-default)' }} />
            <Button.Ghost type="button" dense>
              <Typography.Default color="primary-default">read-only</Typography.Default>
              <Icon icon={chevronDownIcon} style={{ width: 16, height: 16, marginLeft: 4 }} />
            </Button.Ghost>
          </Box>
          <Button.Primary type="button" dense icon={runQueryIcon}>
            Run
          </Button.Primary>
        </Box>
      </Box>

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

          <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
            <Box style={{ marginBottom: 12 }}>
              <Typography.Small color="muted">Ask about the ecommerce sample dataset</Typography.Small>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PLAYGROUND_SAMPLE_AI_PROMPTS.map((prompt) => (
                <Box key={prompt} style={{ display: 'flex' }}>
                  <Button.Ghost type="button" dense onClick={() => setChatDraft(prompt)}>
                    {prompt}
                  </Button.Ghost>
                </Box>
              ))}
            </Box>
          </Box>

          <Box style={{ padding: 24, flexShrink: 0, borderTop: '1px solid var(--aquarium-border-color-muted)' }}>
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
                placeholder="Chat with your sample data…"
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

ServicePgStudioPlaygroundSample.displayName = 'ServicePgStudioPlaygroundSample'
