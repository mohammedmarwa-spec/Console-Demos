'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  ChoiceChip,
  ChoiceChipGroup,
  Drawer,
  Link,
  Select,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import clipboardIcon from '@aivenio/aquarium/icons/clipboard'
import clipboardCheckIcon from '@aivenio/aquarium/icons/clipboardCheck'
import plusIcon from '@aivenio/aquarium/icons/plus'
import { aquariumSelectValue } from '@/lib/aquariumSelect'
import {
  API_SNIPPET,
  CLI_QUICK_START,
  DEV_TOOL_CHIPS,
  DEV_TOOLS_DOCS,
  MCP_CLIENT_OPTIONS,
  TERRAFORM_SNIPPET,
  getCursorMcpInstallDeeplink,
  getMcpServerUrl,
  getMcpSnippet,
  type DevToolId,
  type McpClientId,
} from './devToolsData'
import styles from './DevToolsDrawer.module.css'

const COPY_FEEDBACK_MS = 1200
const HEADER_OFFSET_PX = 114

type DevToolsDrawerContextValue = {
  open: boolean
  tab: DevToolId
  setTab: (tab: DevToolId) => void
  openDrawer: (tab?: DevToolId) => void
  closeDrawer: () => void
}

const DevToolsDrawerContext = createContext<DevToolsDrawerContextValue | null>(null)

export function useDevToolsDrawer(): DevToolsDrawerContextValue {
  const value = useContext(DevToolsDrawerContext)
  if (!value) {
    throw new Error('useDevToolsDrawer must be used within DevToolsDrawerProvider')
  }
  return value
}

export function DevToolsDrawerProvider({ children }: { children: ReactNode }) {
  const existing = useContext(DevToolsDrawerContext)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<DevToolId>('mcp')

  const value = useMemo<DevToolsDrawerContextValue>(
    () => ({
      open,
      tab,
      setTab,
      openDrawer: (nextTab: DevToolId = 'mcp') => {
        setTab(nextTab)
        setOpen(true)
      },
      closeDrawer: () => setOpen(false),
    }),
    [open, tab],
  )

  if (existing) return children

  return (
    <DevToolsDrawerContext.Provider value={value}>
      {children}
      <DevToolsDrawer />
    </DevToolsDrawerContext.Provider>
  )
}

function copyText(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return
  void navigator.clipboard.writeText(value)
}

function isDevToolId(value: string): value is DevToolId {
  return DEV_TOOL_CHIPS.some((chip) => chip.id === value)
}

function DevToolsDrawer() {
  const { open, tab, setTab, closeDrawer } = useDevToolsDrawer()

  return (
    <>
      <style>{`
        .Aquarium-Drawer:has(.dev-tools-drawer) {
          top: ${HEADER_OFFSET_PX}px !important;
          pointer-events: none !important;
        }
        .Aquarium-Drawer:has(.dev-tools-drawer) .bg-backdrop {
          display: none !important;
        }
        .Aquarium-Drawer:has(.dev-tools-drawer) .react-aria-Modal {
          pointer-events: auto !important;
        }
        .Aquarium-Drawer:has(.dev-tools-drawer) .react-aria-Modal > div {
          height: calc(100vh - ${HEADER_OFFSET_PX}px) !important;
          max-height: calc(100vh - ${HEADER_OFFSET_PX}px) !important;
          border-left: 1px solid var(--aquarium-border-color-muted) !important;
        }
      `}</style>
      <Drawer open={open} onClose={closeDrawer} title="Connect with Dev Tools" size="md" closeOnEsc>
        <Box className={`${styles.drawerBody} dev-tools-drawer`}>
          <Typography.Default color="muted">
            Create and manage Aiven services from your editor — without leaving it.
          </Typography.Default>
          <ChoiceChipGroup
            name="dev-tools-tab"
            selectionMode="radio"
            dense
            value={tab}
            onChange={(value) => {
              const id = String(value)
              if (isDevToolId(id)) setTab(id)
            }}
            aria-label="Developer tool"
          >
            {DEV_TOOL_CHIPS.map((chip) => (
              <ChoiceChip key={chip.id} value={chip.id} dense>
                {chip.label}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
          {tab === 'mcp' ? <McpConfigurator /> : null}
          {tab === 'cli' ? (
            <SnippetPanel
              filename="Terminal"
              code={CLI_QUICK_START.command}
              docsHref={DEV_TOOLS_DOCS.cli}
              docsLabel="Aiven CLI docs"
            />
          ) : null}
          {tab === 'terraform' ? (
            <SnippetPanel
              filename="providers.tf"
              code={TERRAFORM_SNIPPET}
              docsHref={DEV_TOOLS_DOCS.terraform}
              docsLabel="Aiven Terraform docs"
            />
          ) : null}
          {tab === 'api' ? (
            <SnippetPanel
              filename="Terminal"
              code={API_SNIPPET}
              docsHref={DEV_TOOLS_DOCS.api}
              docsLabel="Aiven API docs"
            />
          ) : null}
        </Box>
      </Drawer>
    </>
  )
}

DevToolsDrawer.displayName = 'DevToolsDrawer'

function McpConfigurator() {
  const [client, setClient] = useState<McpClientId>('cursor')
  const [readOnly, setReadOnly] = useState(true)
  const mcpUrl = getMcpServerUrl(readOnly)
  const snippet = getMcpSnippet(client, mcpUrl)

  return (
    <Box className={styles.tabBody}>
      <Select
        labelText="Code editor / MCP client"
        options={MCP_CLIENT_OPTIONS}
        value={client}
        onChange={(selected) => setClient(aquariumSelectValue(selected, client) as McpClientId)}
        reserveSpaceForError={false}
      />
      <Switch checked={readOnly} onChange={(event) => setReadOnly(event.target.checked)}>
        Read-only mode — no create, update or delete
      </Switch>
      {!readOnly ? (
        <Alert type="warning" title="Write mode lets agents create, modify, and delete services and data.">
          <Link href={DEV_TOOLS_DOCS.mcpSecurity} target="_blank" rel="noopener noreferrer">
            Review security and responsibility
          </Link>
        </Alert>
      ) : null}
      <CodeSnippet filename={snippet.filename} code={snippet.code} />
      {client === 'cursor' ? (
        <Button.Primary
          icon={plusIcon}
          onClick={() => {
            window.location.href = getCursorMcpInstallDeeplink(mcpUrl)
          }}
        >
          One-click: Add to Cursor
        </Button.Primary>
      ) : null}
      <Typography.Default>
        <Link href={DEV_TOOLS_DOCS.mcp} target="_blank" rel="noopener noreferrer">
          Aiven MCP docs
        </Link>
      </Typography.Default>
    </Box>
  )
}

McpConfigurator.displayName = 'McpConfigurator'

function SnippetPanel({
  filename,
  code,
  docsHref,
  docsLabel,
}: {
  filename: string
  code: string
  docsHref: string
  docsLabel: string
}) {
  return (
    <Box className={styles.tabBody}>
      <CodeSnippet filename={filename} code={code} />
      <Typography.Default>
        <Link href={docsHref} target="_blank" rel="noopener noreferrer">
          {docsLabel}
        </Link>
      </Typography.Default>
    </Box>
  )
}

SnippetPanel.displayName = 'SnippetPanel'

function CodeSnippet({ filename, code }: { filename: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    copyText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
  }, [code])

  return (
    <Box className={styles.snippet}>
      <Box className={styles.snippetHeader}>
        <Typography.Small>{filename}</Typography.Small>
        <Button.Icon
          type="button"
          dense
          icon={copied ? clipboardCheckIcon : clipboardIcon}
          aria-label={copied ? 'Copied' : 'Copy'}
          tooltip={copied ? 'Copied' : 'Copy'}
          onClick={handleCopy}
        />
      </Box>
      <pre className={styles.snippetBody}>
        <Typography.CodeSmall>{code}</Typography.CodeSmall>
      </pre>
    </Box>
  )
}

CodeSnippet.displayName = 'CodeSnippet'
