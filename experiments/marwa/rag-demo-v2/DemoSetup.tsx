'use client'

import { useState, type ReactNode } from 'react'
import { Alert, Box, Button, Card, FileInput, Grid, Link, Section, Tabs, Template, Typography } from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import crossIcon from '@aivenio/aquarium/icons/cross'
import linkExternalIcon from '@aivenio/aquarium/icons/linkExternal'
import { StepWrapper } from './StepWrapper'
import { PipelineIllustration } from './PipelineIllustration'
// import { ModelRequest } from './ModelRequest' // hidden for now
import {
  CHUNK_SIZES,
  DATA_TEMPLATES,
  DEMO_DOC_LINKS,
  DEMO_RESOURCES,
  draftToSource,
  formatCount,
  indexMappingJson,
  ingestPipelineJson,
  planFor,
  RAG_EMBEDDING_MODEL,
  RAG_LLM_MODEL,
  UPLOAD_ACCEPT,
  UPLOAD_EXTENSIONS,
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_FILES,
  type DemoDraft,
} from './ragDemo'

type UploadErrorKind = 'type' | 'size' | 'empty' | 'duplicate' | 'limit'
type RejectedFile = { name: string; reason: UploadErrorKind }

const REJECT_COPY: Record<UploadErrorKind, string> = {
  type: 'is not a .txt file.',
  size: 'is larger than 10 MB.',
  empty: 'is empty.',
  duplicate: 'was already added.',
  limit: `was skipped — the limit is ${UPLOAD_MAX_FILES} files.`,
}

const BYTES_PER_MB = 1024 * 1024

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (fromName) return fromName
  if (file.type === 'text/plain') return 'txt'
  return ''
}

function validateFile(file: File): UploadErrorKind | null {
  if (file.size === 0) return 'empty'
  if (file.size > UPLOAD_MAX_BYTES) return 'size'
  if (!(UPLOAD_EXTENSIONS as readonly string[]).includes(extensionOf(file))) return 'type'
  return null
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < BYTES_PER_MB) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / BYTES_PER_MB).toFixed(bytes < 10 * BYTES_PER_MB ? 1 : 0)} MB`
}

const PANEL = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 16,
  borderRadius: 'var(--aquarium-border-radius-default)',
  backgroundColor: 'var(--aquarium-background-color-body)',
  border: '1px solid var(--aquarium-border-color-muted)',
} as const

// ─── Step 1 ────────────────────────────────────────────────────────────────────

export function ChooseDataStep({
  draft,
  onDraftChange,
}: {
  draft: DemoDraft
  onDraftChange: (draft: DemoDraft) => void
}) {
  return (
    <StepWrapper>
      <Box.Flex flexDirection="column" gap="3">
        <Typography.DefaultStrong color="intense">Choose sample data or upload your own</Typography.DefaultStrong>
        <Card.Group
          name="rag-data-source"
          checked={draft.selection ?? ''}
          onCheckedChange={({ value }) => onDraftChange({ ...draft, selection: value || null })}
        >
          <Box.Flex flexDirection="column" gap="8">
            <Box.Flex flexDirection="column" gap="4">
              <Typography.SmallStrong color="muted">
                Sample datasets · Ready to search, no setup needed
              </Typography.SmallStrong>
              <Template columns={3} columnGap="l2">
                {DATA_TEMPLATES.map((item) => (
                  <Card
                    key={item.id}
                    fullWidth
                    checkable
                    value={item.id}
                    checked={draft.selection === item.id}
                    title={item.title}
                    chips={item.chips}
                  >
                    {item.description} {formatCount(item.documents)} documents.
                  </Card>
                ))}
              </Template>
            </Box.Flex>
            <Box.Flex flexDirection="column" gap="4">
              <Typography.SmallStrong color="muted">Your own data</Typography.SmallStrong>
              <Template columns={3} columnGap="l2">
                <Card
                  fullWidth
                  checkable
                  value="upload"
                  checked={draft.selection === 'upload'}
                  title="Upload your own data"
                >
                  Up to {UPLOAD_MAX_FILES} .txt files, 10 MB each.
                </Card>
              </Template>
            </Box.Flex>
          </Box.Flex>
        </Card.Group>
        {draft.selection === 'upload' ? (
          <Box paddingTop="4">
            <FileUploadField draft={draft} onDraftChange={onDraftChange} />
          </Box>
        ) : null}
      </Box.Flex>
      {/* <ModelRequest /> hidden for now */}
    </StepWrapper>
  )
}

function HowItWorksCard() {
  return (
    <Box.Flex
      flexDirection="column"
      gap="5"
      borderRadius={4}
      padding="4"
      style={{ backgroundColor: 'var(--aquarium-background-color-muted)' }}
    >
      <Box.Flex flexDirection="column" gap="1">
        <Typography.DefaultStrong color="white">How the RAG demo works</Typography.DefaultStrong>
        <Typography.Small color="muted">
          Your data sample is embedded and indexed in OpenSearch. A question retrieves the closest passages, and the
          model writes the answer.
        </Typography.Small>
      </Box.Flex>
      <PipelineIllustration />
    </Box.Flex>
  )
}

/** File picker shown on Choose data as soon as Upload your own data is selected. */
function FileUploadField({ draft, onDraftChange }: { draft: DemoDraft; onDraftChange: (draft: DemoDraft) => void }) {
  const [rejected, setRejected] = useState<RejectedFile[]>([])
  const totalBytes = draft.files.reduce((sum, file) => sum + file.size, 0)

  function update(patch: Partial<DemoDraft>) {
    onDraftChange({ ...draft, ...patch })
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return
    const accepted: File[] = [...draft.files]
    const skipped: RejectedFile[] = []
    const seen = new Set(accepted.map((file) => `${file.name}::${file.size}`))

    for (const file of Array.from(incoming)) {
      const key = `${file.name}::${file.size}`
      if (accepted.length >= UPLOAD_MAX_FILES) {
        skipped.push({ name: file.name, reason: 'limit' })
      } else if (seen.has(key)) {
        skipped.push({ name: file.name, reason: 'duplicate' })
      } else {
        const error = validateFile(file)
        if (error) {
          skipped.push({ name: file.name, reason: error })
        } else {
          seen.add(key)
          accepted.push(file)
        }
      }
    }

    update({ files: accepted })
    setRejected(skipped)
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FileInput
        labelText="Files"
        accept={UPLOAD_ACCEPT}
        multiple
        description={`TXT only. Up to ${UPLOAD_MAX_FILES} files · 10 MB each.`}
        helperText={
          rejected.length > 0
            ? `${rejected.length} file${rejected.length === 1 ? '' : 's'} skipped — see below.`
            : undefined
        }
        valid={rejected.length === 0 ? undefined : false}
        onChange={(event) => addFiles(event.target.files)}
      />

      {draft.files.length > 0 ? (
        <Box style={PANEL}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Typography.SmallStrong color="intense">
              {draft.files.length} of {UPLOAD_MAX_FILES} files · {formatBytes(totalBytes)}
            </Typography.SmallStrong>
            <Button.Ghost
              dense
              type="button"
              onClick={() => {
                update({ files: [] })
                setRejected([])
              }}
            >
              Remove all
            </Button.Ghost>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column', maxHeight: 220, overflow: 'auto' }}>
            {draft.files.map((file) => (
              <Box
                key={`${file.name}-${file.size}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 0',
                  borderTop: '1px solid var(--aquarium-border-color-muted)',
                }}
              >
                <Box style={{ minWidth: 0, flex: 1 }}>
                  <Typography.Small color="intense">{file.name}</Typography.Small>
                </Box>
                <Typography.Caption color="muted">{formatBytes(file.size)}</Typography.Caption>
                <Button.Icon
                  dense
                  type="button"
                  icon={crossIcon}
                  tooltip="Remove"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => update({ files: draft.files.filter((item) => item !== file) })}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      {rejected.length > 0 ? (
        <Alert type="warning" title={`${rejected.length} file${rejected.length === 1 ? '' : 's'} skipped`}>
          <Box component="ul" style={{ margin: 0, paddingLeft: 20 }}>
            {rejected.slice(0, 5).map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <Typography.Small>
                  <strong>{file.name}</strong> {REJECT_COPY[file.reason]}
                </Typography.Small>
              </li>
            ))}
            {rejected.length > 5 ? (
              <li>
                <Typography.Small color="muted">+{rejected.length - 5} more</Typography.Small>
              </li>
            ) : null}
          </Box>
        </Alert>
      ) : null}
    </Box>
  )
}

// ─── Step 2 (flow B only) ──────────────────────────────────────────────────────

export function IndexingStep({
  draft,
  onDraftChange,
}: {
  draft: DemoDraft
  onDraftChange: (draft: DemoDraft) => void
}) {
  return (
    <StepWrapper description="Documents are split into passages before they are embedded. Medium works for most data.">
      <Box.Flex flexDirection="column" gap="4">
        <Typography.DefaultStrong color="intense">Choose a chunk size</Typography.DefaultStrong>
        <Card.Group
          name="rag-chunk-size"
          checked={draft.chunkSizeId}
          onCheckedChange={({ value }) => {
            const option = CHUNK_SIZES.find((item) => item.id === value)
            if (option) onDraftChange({ ...draft, chunkSizeId: option.id })
          }}
        >
          <Template columns={3} columnGap="l2">
            {CHUNK_SIZES.map((option) => (
              <Card
                key={option.id}
                fullWidth
                checkable
                value={option.id}
                checked={draft.chunkSizeId === option.id}
                title={option.title}
                chips={option.chip ? [option.chip] : undefined}
              >
                {option.tokens}. {option.description}
              </Card>
            ))}
          </Template>
        </Card.Group>
        <Typography.Small color="muted">
          Fixed-size chunking with overlap. Embedding model and LLM are predefined for this demo.
        </Typography.Small>
      </Box.Flex>
    </StepWrapper>
  )
}

// ─── Step 3 ────────────────────────────────────────────────────────────────────

function ReviewRow({ label, first = false, children }: { label: string; first?: boolean; children: ReactNode }) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(140px, 200px) minmax(0, 1fr)',
        gap: 16,
        padding: first ? '0 0 10px' : '10px 0 0',
        borderTop: first ? undefined : '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Typography.Small color="muted">{label}</Typography.Small>
      <Box style={{ minWidth: 0 }}>
        <Typography.Small color="intense">{children}</Typography.Small>
      </Box>
    </Box>
  )
}

export function ReviewStep({ draft, chunkSizeChosen }: { draft: DemoDraft; chunkSizeChosen: boolean }) {
  const [preview, setPreview] = useState<string | number>('mapping')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const isUpload = draft.selection === 'upload'
  const template = DATA_TEMPLATES.find((item) => item.id === draft.selection)
  const chunkSize = CHUNK_SIZES.find((option) => option.id === draft.chunkSizeId)
  const source = draftToSource(draft)
  const plan = source ? planFor(source) : null
  const chunkSizeText = chunkSize ? `${chunkSize.title} · ${chunkSize.tokens}` : '—'
  const estimatedChunks = plan ? `~${formatCount(plan.chunks)}` : '—'

  return (
    <StepWrapper description="Check your choices. Nothing is created on your service until you select Generate demo.">
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid gap="6">
          <Grid.Item xs={12} md={7}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Section title="Data">
                <ReviewRow first label="Source">
                  {isUpload ? 'Uploaded files' : (template?.title ?? '—')}
                </ReviewRow>
                <ReviewRow label={isUpload ? 'Files' : 'Documents'}>
                  {plan
                    ? `${formatCount(plan.documents)} ${isUpload ? (plan.documents === 1 ? 'file' : 'files') : 'sample documents'} · ${formatBytes(plan.totalBytes)}`
                    : '—'}
                </ReviewRow>
              </Section>

              {chunkSizeChosen ? (
                <>
                  <Section title="Chunking">
                    <ReviewRow first label="Method">
                      Fixed-size with overlap
                    </ReviewRow>
                    <ReviewRow label="Chunk size">{chunkSizeText}</ReviewRow>
                    <ReviewRow label="Estimated chunks">{estimatedChunks}</ReviewRow>
                  </Section>
                  <Section title="Models" subtitle="Predefined for this demo">
                    <ReviewRow first label="Embedding model">
                      {RAG_EMBEDDING_MODEL}
                    </ReviewRow>
                    <ReviewRow label="LLM">{RAG_LLM_MODEL}</ReviewRow>
                  </Section>
                </>
              ) : (
                <Section title="Models and chunking" subtitle="Predefined for this demo">
                  <ReviewRow first label="Embedding model">
                    {RAG_EMBEDDING_MODEL}
                  </ReviewRow>
                  <ReviewRow label="LLM">{RAG_LLM_MODEL}</ReviewRow>
                  <ReviewRow label="Chunking method">Fixed-size with overlap</ReviewRow>
                  <ReviewRow label="Chunk size">{chunkSizeText}</ReviewRow>
                  <ReviewRow label="Estimated chunks">{estimatedChunks}</ReviewRow>
                </Section>
              )}
            </Box>
          </Grid.Item>
          <Grid.Item xs={12} md={5}>
            <HowItWorksCard />
          </Grid.Item>
        </Grid>

        <Box>
          <Button.Text
            type="button"
            icon={advancedOpen ? chevronUpIcon : chevronDownIcon}
            iconPlacement="right"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            Advanced
          </Button.Text>
        </Box>

        {advancedOpen ? (
          <>
            <Section
              title="Created on your service"
              switch={{
                checked: showCode,
                onChange: (event) => setShowCode(event.target.checked),
                children: 'Show in code',
                labelPlacement: 'left',
              }}
            >
              {showCode ? (
                <Tabs value={preview} onChange={setPreview}>
                  <Tabs.Tab title="Index mapping" value="mapping">
                    <CodePreview code={indexMappingJson()} />
                  </Tabs.Tab>
                  <Tabs.Tab title="Ingest pipeline" value="pipeline">
                    <CodePreview code={ingestPipelineJson(draft.chunkSizeId)} />
                  </Tabs.Tab>
                </Tabs>
              ) : (
                <>
                  <ReviewRow first label="Index">
                    <Mono>{DEMO_RESOURCES.indexName}</Mono>
                  </ReviewRow>
                  <ReviewRow label="Vector field">
                    <Mono>{DEMO_RESOURCES.vectorField}</Mono> · knn_vector, {formatCount(DEMO_RESOURCES.dimension)}{' '}
                    dimensions
                  </ReviewRow>
                  <ReviewRow label="Ingest pipeline">
                    <Mono>{DEMO_RESOURCES.pipelineName}</Mono> · text chunking, then text embedding
                  </ReviewRow>
                  <ReviewRow label="Estimated storage">
                    {plan ? `~${formatBytes(plan.storageBytes)} of service disk, including vectors` : '—'}
                  </ReviewRow>
                </>
              )}
            </Section>

            <Box.Flex alignItems="center" gap="5" flexWrap="wrap">
              <Typography.Small color="muted">Learn more in the OpenSearch docs:</Typography.Small>
              {DEMO_DOC_LINKS.map((link) => (
                <Typography.Small key={link.href}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={linkExternalIcon}
                    iconPlacement="right"
                  >
                    {link.text}
                  </Link>
                </Typography.Small>
              ))}
            </Box.Flex>
          </>
        ) : null}
      </Box>
    </StepWrapper>
  )
}

function Mono({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: 'var(--aquarium-font-family-mono, monospace)' }}>{children}</span>
}

function CodePreview({ code }: { code: string }) {
  return (
    <Box
      component="pre"
      aria-readonly
      style={{
        margin: '12px 0 0',
        padding: 12,
        maxHeight: 240,
        overflow: 'auto',
        fontSize: 12,
        lineHeight: 1.5,
        fontFamily: 'var(--aquarium-font-family-mono, monospace)',
        borderRadius: 'var(--aquarium-border-radius-default)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        border: '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      {code}
    </Box>
  )
}
