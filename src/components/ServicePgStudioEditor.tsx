import { useState } from 'react'
import { Box, Button, Chip, Icon, Typography } from '@aivenio/aquarium'
import attachmentIcon from '@aivenio/aquarium/icons/attachment'
import bookmarkIcon from '@aivenio/aquarium/icons/bookmark'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import collapsePanelIcon from '@aivenio/aquarium/icons/collapsePanel'
import databaseIcon from '@aivenio/aquarium/icons/database'
import eyeOpenIcon from '@aivenio/aquarium/icons/eyeOpen'
import historyIcon from '@aivenio/aquarium/icons/history'
import homeIcon from '@aivenio/aquarium/icons/home'
import lockIcon from '@aivenio/aquarium/icons/lock'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import runQueryIcon from '@aivenio/aquarium/icons/runQuery'
import sendIcon from '@aivenio/aquarium/icons/send'
import smallCrossIcon from '@aivenio/aquarium/icons/smallCross'
import smallPlusIcon from '@aivenio/aquarium/icons/smallPlus'
import tableIcon from '@aivenio/aquarium/icons/table'
import timeIcon from '@aivenio/aquarium/icons/time'
import toolsIcon from '@aivenio/aquarium/icons/tools'
import addIcon from '@aivenio/aquarium/icons/add'
import type { ServiceTypeId } from '../screens/ServiceTypeSelectModal'

const CODE_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace'

const SAVED_QUERIES = [
  'test_join_customers_orders',
  'User_permissions_check',
  'API_Response_Test',
  'migration_script_v2',
] as const

type EditorTabId = 'signups' | 'new-query'

function StudioGroupHeader({
  expanded,
  label,
  icon,
}: {
  expanded: boolean
  label: string
  icon: typeof codeBlockIcon
}) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 12,
        borderTop: label === 'Tables' || label === 'Views' ? '1px solid var(--aquarium-border-color-muted)' : undefined,
        borderBottom: label === 'Saved queries' ? undefined : '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon
          icon={expanded ? chevronDownIcon : chevronRightIcon}
          style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--aquarium-text-color-muted)' }}
        />
        <Icon icon={icon} style={{ width: 16, height: 16, flexShrink: 0 }} />
        <Typography.Small>{label}</Typography.Small>
      </Box>
      <Icon icon={addIcon} style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--aquarium-text-color-muted)' }} />
    </Box>
  )
}

function EditorTab({
  active,
  label,
  onSelect,
}: {
  active?: boolean
  label: string
  onSelect?: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 44,
        padding: '0 12px',
        border: 'none',
        borderRight: '1px solid var(--aquarium-border-color-default)',
        borderBottom: active ? '2px solid var(--aquarium-border-color-primary-default)' : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: active
          ? 'var(--aquarium-background-color-primary-muted)'
          : 'var(--aquarium-background-color-layer)',
        color: active
          ? 'var(--aquarium-text-color-primary-default)'
          : 'var(--aquarium-text-color-default)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Icon icon={queriesEditorIcon} style={{ width: 16, height: 16, flexShrink: 0 }} />
      <Box component="span" style={{ fontWeight: 500, fontSize: 12 }}>
        <Typography.Small>{label}</Typography.Small>
      </Box>
      <Icon
        icon={smallCrossIcon}
        style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--aquarium-text-color-muted)' }}
        aria-hidden
      />
    </Box>
  )
}

export type ServicePgStudioEditorProps = {
  serviceTypeId?: ServiceTypeId | null
}

export function ServicePgStudioEditor({ serviceTypeId = null }: ServicePgStudioEditorProps) {
  const isPostgres = serviceTypeId === 'postgresql'
  const [activeTab, setActiveTab] = useState<EditorTabId>('new-query')
  const [chatDraft, setChatDraft] = useState('')
  const [aiChatOpen, setAiChatOpen] = useState(true)
  const chatPlaceholder = isPostgres
    ? 'Chat with your PG service'
    : 'Chat with your MySQL service'

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

        <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', backgroundColor: 'var(--aquarium-background-color-layer)' }}>
            <StudioGroupHeader expanded label="Saved queries" icon={codeBlockIcon} />
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8 }}>
              {SAVED_QUERIES.map((query) => (
                <Box
                  key={query}
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
                  <Typography.Small>{query}</Typography.Small>
                </Box>
              ))}
            </Box>
          </Box>
          <StudioGroupHeader expanded={false} label="Tables" icon={tableIcon} />
          <StudioGroupHeader expanded={false} label="Views" icon={eyeOpenIcon} />
        </Box>

        <Box
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderTop: '1px solid var(--aquarium-border-color-default)',
            flexShrink: 0,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon icon={toolsIcon} style={{ width: 16, height: 16 }} />
            <Typography.Small>Editor settings</Typography.Small>
          </Box>
        </Box>
      </Box>

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--aquarium-background-color-body)',
          borderRight: aiChatOpen ? '1px solid var(--aquarium-border-color-default)' : undefined,
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
            component="button"
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              padding: 12,
              border: 'none',
              borderRight: '1px solid var(--aquarium-border-color-default)',
              borderBottom: '1px solid var(--aquarium-border-color-default)',
              backgroundColor: 'var(--aquarium-background-color-layer)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon icon={homeIcon} style={{ width: 16, height: 16 }} />
          </Box>
          <EditorTab label="signups" active={activeTab === 'signups'} onSelect={() => setActiveTab('signups')} />
          <EditorTab label="New query" active={activeTab === 'new-query'} onSelect={() => setActiveTab('new-query')} />
          <Box
            component="button"
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              padding: 16,
              border: 'none',
              borderRight: '1px solid var(--aquarium-border-color-muted)',
              backgroundColor: 'var(--aquarium-background-color-layer)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon icon={smallPlusIcon} style={{ width: 16, height: 16 }} />
          </Box>
        </Box>

        <Box style={{ flex: 1, minHeight: 0, display: 'flex', padding: '24px 16px', overflow: 'auto' }}>
          <Box style={{ display: 'flex', gap: 16, width: '100%', minHeight: 120 }}>
            <Box
              component="span"
              style={{
                fontFamily: CODE_FONT,
                fontSize: 14,
                lineHeight: 1.42,
                color: 'var(--aquarium-text-color-muted)',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              1
            </Box>
            <Box
              component="textarea"
              value=""
              readOnly
              aria-label="SQL editor"
              style={{
                flex: 1,
                minHeight: 200,
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 0,
                margin: 0,
                background: 'transparent',
                fontFamily: CODE_FONT,
                fontSize: 14,
                lineHeight: 1.42,
                color: 'var(--aquarium-text-color-default)',
              }}
            />
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 40,
            padding: '0 8px',
            borderTop: '1px solid var(--aquarium-border-color-muted)',
            flexShrink: 0,
          }}
        >
          <Icon icon={proPlansIcon} style={{ width: 16, height: 16, color: 'var(--aquarium-text-color-muted)' }} />
          <Box component="span" style={{ fontWeight: 500, fontSize: 12 }}>
            <Typography.Small>
              Ready for analysis: Run the optimization check for performance insights.
            </Typography.Small>
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
          <Box style={{ width: 1, height: 23, backgroundColor: 'var(--aquarium-border-color-default)', flexShrink: 0 }} />
          <Button.Ghost type="button" dense icon={proPlansIcon}>
            <Box component="span" style={{ fontWeight: 500 }}>
              <Typography.Default color="primary-default">Analyze</Typography.Default>
            </Box>
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
            <Typography.Caption>00:00:00</Typography.Caption>
          </Box>
          <Box style={{ width: 1, height: 23, backgroundColor: 'var(--aquarium-border-color-default)', flexShrink: 0 }} />
          <Button.Icon type="button" dense aria-label="Query history" icon={historyIcon} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon icon={lockIcon} style={{ width: 16, height: 16, color: 'var(--aquarium-text-color-primary-default)' }} />
            <Button.Ghost type="button" dense>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Box component="span" style={{ fontWeight: 500 }}>
                  <Typography.Default color="primary-default">read-only</Typography.Default>
                </Box>
                <Icon icon={chevronDownIcon} style={{ width: 16, height: 16 }} />
              </Box>
            </Button.Ghost>
          </Box>
          <Chip text="default" icon={databaseIcon} />
          <Button.Primary type="button" dense icon={runQueryIcon}>
            Run
          </Button.Primary>
        </Box>
      </Box>

      {aiChatOpen && (
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
              <Button.Ghost type="button" dense>
                Your new chat
                <Icon icon={chevronDownIcon} style={{ width: 16, height: 16, marginLeft: 4 }} />
              </Button.Ghost>
            </Box>
            <Button.Icon
              type="button"
              dense
              aria-label="Collapse AI chat"
              icon={collapsePanelIcon}
              onClick={() => setAiChatOpen(false)}
            />
          </Box>
          <Box style={{ flex: 1, minHeight: 0 }} />
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
                placeholder={chatPlaceholder}
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

ServicePgStudioEditor.displayName = 'ServicePgStudioEditor'
