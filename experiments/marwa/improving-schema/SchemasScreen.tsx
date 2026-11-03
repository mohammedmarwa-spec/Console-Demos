'use client'

import { useMemo, useRef, useState, type ReactElement } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  DataTable,
  Dialog,
  DropdownMenu,
  EmptyState,
  Input,
  Link,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import gitBranchIcon from '@aivenio/aquarium/icons/gitBranch'
import moreIcon from '@aivenio/aquarium/icons/more'
import plusCircleIcon from '@aivenio/aquarium/icons/plusCircle'
import {
  COMPATIBILITY_LEVELS,
  DEFAULT_GLOBAL_COMPATIBILITY,
  ORG_NAME,
  PROJECT_NAME,
  SERVICE_NAME,
  createDefaultSubjects,
  latestVersion,
  nextSchemaId,
  schemaDocument,
  type CompatibilityLevel,
  type SchemaSubject,
  type SchemaVersion,
} from './schemaData'

const PAGE_SIZE = 10

type SchemaCrumb = ReactElement<React.ComponentProps<typeof Breadcrumbs.Crumb>>

type SubjectRow = {
  id: string
  name: string
  compatibility: CompatibilityLevel | null
  versions: SchemaVersion[]
  versionCount: number
  latest: string
}

type DialogState =
  | { kind: 'closed' }
  | { kind: 'create-subject' }
  | { kind: 'global-compatibility' }
  | { kind: 'subject-compatibility'; name: string }
  | { kind: 'add-version'; name: string }
  | { kind: 'delete-subject'; name: string; returnToList: boolean }
  | { kind: 'delete-version'; name: string; versionId: string; version: number }

function stay(event: { preventDefault: () => void }) {
  event.preventDefault()
}

function effectiveLevel(subject: SchemaSubject, globalLevel: CompatibilityLevel): CompatibilityLevel {
  return subject.compatibility ?? globalLevel
}

function toRow(subject: SchemaSubject): SubjectRow {
  const latest = latestVersion(subject)
  return {
    id: subject.name,
    name: subject.name,
    compatibility: subject.compatibility,
    versions: subject.versions,
    versionCount: subject.versions.length,
    latest: latest == null ? '—' : String(latest),
  }
}

export function SchemasScreen({
  initialSubjects = createDefaultSubjects(),
}: {
  initialSubjects?: SchemaSubject[]
}) {
  const [subjects, setSubjects] = useState(initialSubjects)
  const [globalLevel, setGlobalLevel] = useState<CompatibilityLevel>(DEFAULT_GLOBAL_COMPATIBILITY)
  const [query, setQuery] = useState('')
  const [openName, setOpenName] = useState<string | null>(null)
  const [comparing, setComparing] = useState(false)
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' })
  const returnFocusLabel = useRef<string | null>(null)

  const openSubject = subjects.find((subject) => subject.name === openName) ?? null
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = needle ? subjects.filter((subject) => subject.name.toLowerCase().includes(needle)) : subjects
    return list.map(toRow)
  }, [query, subjects])

  function openDialog(next: DialogState, focusLabel?: string) {
    returnFocusLabel.current = focusLabel ?? null
    setDialog(next)
  }

  function closeDialog() {
    const label = returnFocusLabel.current
    setDialog({ kind: 'closed' })
    if (!label || typeof document === 'undefined') return
    window.setTimeout(() => {
      const match = Array.from(document.querySelectorAll<HTMLElement>('[aria-label]')).find(
        (node) => node.getAttribute('aria-label') === label,
      )
      match?.focus()
    }, 0)
  }

  function updateSubject(name: string, change: (subject: SchemaSubject) => SchemaSubject) {
    setSubjects((current) => current.map((subject) => (subject.name === name ? change(subject) : subject)))
  }

  function showList() {
    setComparing(false)
    setOpenName(null)
  }

  function showDetail() {
    setComparing(false)
  }

  const crumbs = (page: 'list' | 'detail' | 'compare', subjectName?: string): SchemaCrumb[] => [
    <Breadcrumbs.Crumb key="org" href="#" onClick={stay}>
      {ORG_NAME}
    </Breadcrumbs.Crumb>,
    <Breadcrumbs.Crumb key="project" href="#" onClick={stay}>
      {PROJECT_NAME}
    </Breadcrumbs.Crumb>,
    <Breadcrumbs.Crumb key="service" href="#" onClick={stay}>
      {SERVICE_NAME}
    </Breadcrumbs.Crumb>,
    page === 'list' ? (
      <Breadcrumbs.Crumb key="schemas">Schemas</Breadcrumbs.Crumb>
    ) : (
      <Breadcrumbs.Crumb
        key="schemas"
        href="#"
        onClick={(event) => {
          stay(event)
          showList()
        }}
      >
        Schemas
      </Breadcrumbs.Crumb>
    ),
    ...(subjectName && page !== 'list'
      ? [
          page === 'compare' ? (
            <Breadcrumbs.Crumb key="subject" href="#" onClick={(event) => { stay(event); showDetail() }}>
              {`Subject: ${subjectName}`}
            </Breadcrumbs.Crumb>
          ) : (
            <Breadcrumbs.Crumb key="subject">{subjectName}</Breadcrumbs.Crumb>
          ),
        ]
      : []),
    ...(page === 'compare' ? [<Breadcrumbs.Crumb key="compare">compare versions</Breadcrumbs.Crumb>] : []),
  ]

  return (
    <Box>
      {openSubject && comparing ? (
        <CompareVersions subject={openSubject} crumbs={crumbs('compare', openSubject.name)} />
      ) : openSubject ? (
        <SubjectDetail
          subject={openSubject}
          globalLevel={globalLevel}
          crumbs={crumbs('detail', openSubject.name)}
          onAddVersion={() => openDialog({ kind: 'add-version', name: openSubject.name })}
          onCompare={() => setComparing(true)}
          onCompatibility={() =>
            openDialog({ kind: 'subject-compatibility', name: openSubject.name }, `Actions for ${openSubject.name}`)
          }
          onDelete={() =>
            openDialog(
              { kind: 'delete-subject', name: openSubject.name, returnToList: true },
              `Actions for ${openSubject.name}`,
            )
          }
          onDeleteVersion={(version) =>
            openDialog(
              {
                kind: 'delete-version',
                name: openSubject.name,
                versionId: version.id,
                version: version.version,
              },
              `Actions for version ${version.version}`,
            )
          }
        />
      ) : (
        <SubjectList
          rows={filtered}
          hasSubjects={subjects.length > 0}
          globalLevel={globalLevel}
          query={query}
          onQuery={setQuery}
          crumbs={crumbs('list')}
          onOpen={(name) => {
            setComparing(false)
            setOpenName(name)
          }}
          onCreate={() => openDialog({ kind: 'create-subject' })}
          onEditGlobal={() => openDialog({ kind: 'global-compatibility' }, 'Global compatibility level')}
          onCompatibility={(name) => openDialog({ kind: 'subject-compatibility', name }, `Actions for ${name}`)}
          onDelete={(name) => openDialog({ kind: 'delete-subject', name, returnToList: false }, `Actions for ${name}`)}
        />
      )}

      <SchemaDialogs
        dialog={dialog}
        subjects={subjects}
        globalLevel={globalLevel}
        onClose={closeDialog}
        onCreate={(name) => {
          setSubjects((current) => [...current, { name, compatibility: null, versions: [] }])
          closeDialog()
        }}
        onGlobalLevel={(level) => {
          setGlobalLevel(level)
          closeDialog()
        }}
        onSubjectLevel={(name, level) => {
          updateSubject(name, (subject) => ({ ...subject, compatibility: level }))
          closeDialog()
        }}
        onAddVersion={(name) => {
          updateSubject(name, (subject) => {
            const version = (latestVersion(subject) ?? 0) + 1
            return {
              ...subject,
              versions: [
                ...subject.versions,
                { id: String(version), version, schemaId: nextSchemaId(subjects), softDeleted: false },
              ],
            }
          })
          closeDialog()
        }}
        onDeleteSubject={(name, returnToList) => {
          setSubjects((current) => current.filter((subject) => subject.name !== name))
          if (returnToList) setOpenName(null)
          closeDialog()
        }}
        onDeleteVersion={(name, versionId) => {
          updateSubject(name, (subject) => ({
            ...subject,
            versions: subject.versions.map((version) =>
              version.id === versionId ? { ...version, softDeleted: true } : version,
            ),
          }))
          closeDialog()
        }}
      />
    </Box>
  )
}

function SubjectList({
  rows,
  hasSubjects,
  globalLevel,
  query,
  onQuery,
  crumbs,
  onOpen,
  onCreate,
  onEditGlobal,
  onCompatibility,
  onDelete,
}: {
  rows: SubjectRow[]
  hasSubjects: boolean
  globalLevel: CompatibilityLevel
  query: string
  onQuery: (value: string) => void
  crumbs: SchemaCrumb[]
  onOpen: (name: string) => void
  onCreate: () => void
  onEditGlobal: () => void
  onCompatibility: (name: string) => void
  onDelete: (name: string) => void
}) {
  return (
    <Box>
      <PageHeader
        title="Schemas"
        primaryAction={{ text: 'Create new schema', onClick: onCreate }}
        breadcrumbs={crumbs}
      />
      <Box.Flex alignItems="center" justifyContent="space-between" gap="4" marginTop="5" flexWrap="wrap">
        <Box style={{ width: 280, maxWidth: '100%' }}>
          <SearchInput
            aria-label="Search subjects"
            placeholder="Search subjects"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
        </Box>
        <Box.Flex alignItems="center" gap="3">
          <Link
            href="#"
            aria-label="Global compatibility level"
            onClick={(event) => {
              stay(event)
              onEditGlobal()
            }}
          >
            Global compatibility level
          </Link>
          <StatusChip dense status="success" text={globalLevel} />
        </Box.Flex>
      </Box.Flex>

      {!hasSubjects ? (
        <Box marginTop="6">
          <EmptyState title="No subjects yet" fullHeight={false}>
            Create a subject to register a schema.
          </EmptyState>
        </Box>
      ) : rows.length === 0 ? (
        <Box marginTop="6">
          <Typography.Small color="muted">No subjects match that name.</Typography.Small>
        </Box>
      ) : (
        <Box marginTop="5">
          <DataTable
            ariaLabel="Schema subjects"
            rows={rows.slice(0, PAGE_SIZE)}
            sticky={false}
            columns={[
              {
                type: 'custom',
                headerName: 'Subject',
                width: '36%',
                UNSAFE_render: (row) => (
                  <Link
                    href="#"
                    onClick={(event) => {
                      stay(event)
                      onOpen(row.name)
                    }}
                  >
                    {row.name}
                  </Link>
                ),
              },
              { type: 'number', field: 'versionCount', headerName: 'Versions', width: '14%' },
              { type: 'text', field: 'latest', headerName: 'Latest', width: '14%' },
              {
                type: 'custom',
                headerName: 'Compatibility',
                width: '28%',
                UNSAFE_render: (row) => (
                  <Box.Flex alignItems="center" gap="2">
                    <StatusChip dense status="neutral" text={effectiveLevel(row, globalLevel)} />
                    {row.compatibility == null ? <Typography.Small color="muted">inherited</Typography.Small> : null}
                  </Box.Flex>
                ),
              },
              {
                type: 'custom',
                headerName: 'Actions',
                headerInvisible: true,
                width: 56,
                align: 'right',
                UNSAFE_render: (row) => (
                  <DropdownMenu
                    minWidth={280}
                    placement="bottom-right"
                    onAction={(action) => {
                      if (String(action) === 'compatibility') onCompatibility(row.name)
                      if (String(action) === 'delete') onDelete(row.name)
                    }}
                  >
                    <DropdownMenu.Trigger>
                      <Button.Icon type="button" icon={moreIcon} aria-label={`Actions for ${row.name}`} />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Items>
                      <DropdownMenu.Item id="compatibility">Set compatibility level</DropdownMenu.Item>
                      <DropdownMenu.Section>
                        <DropdownMenu.Item id="delete" kind="danger">
                          Delete subject
                        </DropdownMenu.Item>
                      </DropdownMenu.Section>
                    </DropdownMenu.Items>
                  </DropdownMenu>
                ),
              },
            ]}
          />
        </Box>
      )}
    </Box>
  )
}

function SubjectDetail({
  subject,
  globalLevel,
  crumbs,
  onAddVersion,
  onCompare,
  onCompatibility,
  onDelete,
  onDeleteVersion,
}: {
  subject: SchemaSubject
  globalLevel: CompatibilityLevel
  crumbs: SchemaCrumb[]
  onAddVersion: () => void
  onCompare: () => void
  onCompatibility: () => void
  onDelete: () => void
  onDeleteVersion: (version: SchemaVersion) => void
}) {
  const inherited = subject.compatibility == null
  const canCompare = subject.versions.length >= 2

  return (
    <Box>
      <Breadcrumbs>{crumbs}</Breadcrumbs>
      <Box.Flex alignItems="flex-start" justifyContent="space-between" gap="4" marginTop="4" flexWrap="wrap">
        <Box>
          <Typography.Heading color="intense" htmlTag="h1">
            {subject.name}
          </Typography.Heading>
          <Box.Flex alignItems="center" gap="2" marginTop="2">
            <StatusChip dense status="neutral" text={effectiveLevel(subject, globalLevel)} />
            {inherited ? <Typography.Small color="muted">inherited</Typography.Small> : null}
          </Box.Flex>
        </Box>
        <Box.Flex alignItems="center" gap="3">
          <Button type="button" icon={plusCircleIcon} onClick={onAddVersion}>
            Add version
          </Button>
          <Button.Secondary
            type="button"
            icon={gitBranchIcon}
            onClick={onCompare}
            disabled={!canCompare}
            tooltip={canCompare ? undefined : 'Needs at least 2 versions'}
          >
            Compare schemas
          </Button.Secondary>
          <DropdownMenu
            minWidth={280}
            placement="bottom-right"
            onAction={(action) => {
              if (String(action) === 'compatibility') onCompatibility()
              if (String(action) === 'delete') onDelete()
            }}
          >
            <DropdownMenu.Trigger>
              <Button.Icon type="button" icon={moreIcon} aria-label={`Actions for ${subject.name}`} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              <DropdownMenu.Item id="compatibility">Set compatibility level</DropdownMenu.Item>
              <DropdownMenu.Section>
                <DropdownMenu.Item id="delete" kind="danger">
                  Delete subject
                </DropdownMenu.Item>
              </DropdownMenu.Section>
            </DropdownMenu.Items>
          </DropdownMenu>
        </Box.Flex>
      </Box.Flex>

      <Box marginTop="5">
        <DataTable
          ariaLabel={`Versions of ${subject.name}`}
          rows={subject.versions}
          sticky={false}
          columns={[
            {
              type: 'custom',
              headerName: 'Version',
              width: '30%',
              UNSAFE_render: (row) => (
                <Box.Flex alignItems="center" gap="2">
                  <Link href="#" onClick={stay}>
                    {row.version}
                  </Link>
                  {row.softDeleted ? <StatusChip dense status="neutral" text="Soft deleted" /> : null}
                </Box.Flex>
              ),
            },
            { type: 'number', field: 'schemaId', headerName: 'Schema ID', width: '30%' },
            {
              type: 'custom',
              headerName: 'Actions',
              headerInvisible: true,
              width: 56,
              align: 'right',
              UNSAFE_render: (row) => (
                <DropdownMenu
                  minWidth={220}
                  placement="bottom-right"
                  onAction={(action) => String(action) === 'delete' && onDeleteVersion(row)}
                >
                  <DropdownMenu.Trigger>
                    <Button.Icon type="button" icon={moreIcon} aria-label={`Actions for version ${row.version}`} />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Items>
                    <DropdownMenu.Item id="delete" kind="danger">
                      Delete version
                    </DropdownMenu.Item>
                  </DropdownMenu.Items>
                </DropdownMenu>
              ),
            },
          ]}
        />
      </Box>
    </Box>
  )
}

function SchemaDialogs({
  dialog,
  subjects,
  globalLevel,
  onClose,
  onCreate,
  onGlobalLevel,
  onSubjectLevel,
  onAddVersion,
  onDeleteSubject,
  onDeleteVersion,
}: {
  dialog: DialogState
  subjects: SchemaSubject[]
  globalLevel: CompatibilityLevel
  onClose: () => void
  onCreate: (name: string) => void
  onGlobalLevel: (level: CompatibilityLevel) => void
  onSubjectLevel: (name: string, level: CompatibilityLevel | null) => void
  onAddVersion: (name: string) => void
  onDeleteSubject: (name: string, returnToList: boolean) => void
  onDeleteVersion: (name: string, versionId: string) => void
}) {
  return (
    <>
      {dialog.kind === 'create-subject' ? (
        <CreateSubjectDialog subjects={subjects} onClose={onClose} onCreate={onCreate} />
      ) : null}
      {dialog.kind === 'global-compatibility' ? (
        <CompatibilityDialog
          mode="global"
          globalLevel={globalLevel}
          current={globalLevel}
          onClose={onClose}
          onSave={(level) => level && onGlobalLevel(level)}
        />
      ) : null}
      {dialog.kind === 'subject-compatibility' ? (
        <CompatibilityDialog
          mode="subject"
          subjectName={dialog.name}
          globalLevel={globalLevel}
          current={subjects.find((subject) => subject.name === dialog.name)?.compatibility ?? null}
          onClose={onClose}
          onSave={(level) => level && onSubjectLevel(dialog.name, level)}
        />
      ) : null}
      {dialog.kind === 'add-version' ? (
        <AddVersionDialog subjectName={dialog.name} onClose={onClose} onAdd={() => onAddVersion(dialog.name)} />
      ) : null}
      <Dialog
        type="danger"
        open={dialog.kind === 'delete-subject'}
        title="Danger"
        onClose={onClose}
        primaryAction={{
          text: 'Delete subject',
          onClick: () => dialog.kind === 'delete-subject' && onDeleteSubject(dialog.name, dialog.returnToList),
        }}
        secondaryAction={{ text: 'Cancel', onClick: onClose }}
      >
        {dialog.kind === 'delete-subject' ? `Delete subject ${dialog.name}?` : ''}
      </Dialog>
      <Dialog
        type="danger"
        open={dialog.kind === 'delete-version'}
        title="Danger"
        onClose={onClose}
        primaryAction={{
          text: 'Delete version',
          onClick: () => dialog.kind === 'delete-version' && onDeleteVersion(dialog.name, dialog.versionId),
        }}
        secondaryAction={{ text: 'Cancel', onClick: onClose }}
      >
        {dialog.kind === 'delete-version' ? `Delete version ${dialog.version} of ${dialog.name}?` : ''}
      </Dialog>
    </>
  )
}

function CreateSubjectDialog({
  subjects,
  onClose,
  onCreate,
}: {
  subjects: SchemaSubject[]
  onClose: () => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  const trimmed = name.trim()
  const duplicate = subjects.some((subject) => subject.name === trimmed)

  return (
    <Modal
      open
      onClose={() => {
        setName('')
        onClose()
      }}
      title="Create subject"
      size="sm"
      primaryAction={{
        text: 'Create subject',
        disabled: trimmed.length === 0 || duplicate,
        onClick: () => {
          onCreate(trimmed)
          setName('')
        },
      }}
      secondaryActions={{
        text: 'Cancel',
        onClick: () => {
          setName('')
          onClose()
        },
      }}
    >
      <Input
        labelText="Subject"
        value={name}
        placeholder="orders-value"
        valid={!duplicate}
        helperText={duplicate ? 'A subject with this name already exists' : undefined}
        onChange={(event) => setName(event.target.value)}
      />
    </Modal>
  )
}

function CompatibilityDialog({
  mode,
  subjectName,
  globalLevel,
  current,
  onClose,
  onSave,
}: {
  mode: 'global' | 'subject'
  subjectName?: string
  globalLevel: CompatibilityLevel
  current: CompatibilityLevel | null
  onClose: () => void
  onSave: (level: CompatibilityLevel | null) => void
}) {
  const [value, setValue] = useState<CompatibilityLevel>(current ?? globalLevel)

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === 'subject' ? `Set ${subjectName} compatibility level` : 'Set global compatibility'}
      size="sm"
      primaryAction={{ text: mode === 'global' ? 'Set compatibility' : 'Save', onClick: () => onSave(value) }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <Select
        labelText="Compatibility level"
        description={
          mode === 'subject'
            ? 'Set the subjects compatibility level. This will override the global compatibility for this subject. If no compatibility is set, the global will apply.'
            : 'Set the global compatibility for all the subjects. If compatibility is not set for subject, the global compatibility will apply.'
        }
        options={[...COMPATIBILITY_LEVELS]}
        value={value}
        onChange={(next) => {
          if (typeof next === 'string' && COMPATIBILITY_LEVELS.includes(next as CompatibilityLevel)) {
            setValue(next as CompatibilityLevel)
          }
        }}
      />
    </Modal>
  )
}

function AddVersionDialog({
  subjectName,
  onClose,
  onAdd,
}: {
  subjectName: string
  onClose: () => void
  onAdd: () => void
}) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Add version"
      subtitle={subjectName}
      size="sm"
      primaryAction={{ text: 'Add version', onClick: onAdd }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <Typography.Small>Adds the next version for this subject.</Typography.Small>
    </Modal>
  )
}

const COMPARE_VIEWS = ['side by side'] as const

function CompareVersions({ subject, crumbs }: { subject: SchemaSubject; crumbs: SchemaCrumb[] }) {
  const versionOptions = subject.versions.map((version) => String(version.version))
  const [left, setLeft] = useState(versionOptions[0] ?? '1')
  const [right, setRight] = useState(versionOptions[0] ?? '1')
  const [view, setView] = useState<(typeof COMPARE_VIEWS)[number]>('side by side')

  return (
    <Box>
      <Breadcrumbs>{crumbs}</Breadcrumbs>
      <Box marginTop="4">
        <Typography.Heading color="intense" htmlTag="h1">
          Compare schema versions
        </Typography.Heading>
      </Box>
      <Box.Flex alignItems="flex-end" justifyContent="space-between" gap="4" marginTop="5" flexWrap="wrap">
        <Box.Flex alignItems="flex-end" gap="4" flexWrap="wrap">
          <Box style={{ width: 160 }}>
            <Select
              labelText="Compare Version"
              options={versionOptions}
              value={left}
              onChange={(next) => typeof next === 'string' && setLeft(next)}
            />
          </Box>
          <Box style={{ width: 160 }}>
            <Select
              labelText="To Version"
              options={versionOptions}
              value={right}
              onChange={(next) => typeof next === 'string' && setRight(next)}
            />
          </Box>
        </Box.Flex>
        <Box style={{ width: 180 }}>
          <Select
            labelText="View"
            options={[...COMPARE_VIEWS]}
            value={view}
            onChange={(next) => {
              if (next === 'side by side') setView(next)
            }}
          />
        </Box>
      </Box.Flex>
      {view === 'side by side' ? (
        <Box.Flex gap="4" marginTop="5" alignItems="stretch">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <SchemaCode source={schemaDocument(subject.name, Number(left))} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <SchemaCode source={schemaDocument(subject.name, Number(right))} />
          </Box>
        </Box.Flex>
      ) : null}
    </Box>
  )
}

function SchemaCode({ source }: { source: string }) {
  const lines = source.split('\n')
  return (
    <Box
      className="font-mono"
      padding="4"
      style={{
        overflow: 'auto',
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        background: 'var(--aquarium-code-background)',
        maxHeight: 560,
      }}
    >
      {lines.map((line, index) => (
        <Box.Flex key={`${index}-${line}`} gap="4">
          <span style={{ width: 28, textAlign: 'right', color: 'var(--aquarium-code-comment)', flexShrink: 0 }}>
            {index + 1}
          </span>
          <span style={{ whiteSpace: 'pre', color: 'var(--aquarium-code-text)' }}>{highlightSchemaLine(line)}</span>
        </Box.Flex>
      ))}
    </Box>
  )
}

function highlightSchemaLine(line: string) {
  const parts = line.split(/("(?:\\.|[^"\\])*")/g)
  return parts.map((part, index) => {
    if (part.startsWith('"')) {
      return (
        <span key={index} style={{ color: 'var(--aquarium-code-string)' }}>
          {part}
        </span>
      )
    }
    const bits = part.split(/(\d+)/g)
    return bits.map((bit, bitIndex) =>
      /^\d+$/.test(bit) ? (
        <span key={`${index}-${bitIndex}`} style={{ color: 'var(--aquarium-code-number)' }}>
          {bit}
        </span>
      ) : (
        <span key={`${index}-${bitIndex}`}>{bit}</span>
      ),
    )
  })
}
