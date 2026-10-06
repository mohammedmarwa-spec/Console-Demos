'use client'

import { useState, type ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  FileInput,
  Grid,
  Link,
  Section,
  StatusChip,
  Tabs,
  Typography,
} from '@aivenio/aquarium'
import crossIcon from '@aivenio/aquarium/icons/cross'
import linkExternalIcon from '@aivenio/aquarium/icons/linkExternal'
import { StepWrapper } from './StepWrapper'
import { PipelineIllustration } from './PipelineIllustration'
// import { ModelRequest } from './ModelRequest' // hidden for now
import {
  CHUNK_SIZES,
  CHUNKING_METHOD,
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
  type ChunkSizeId,
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
    <StepWrapper description="Pick a sample dataset with mock documents, or upload your own .txt files.">
      <Box.Flex flexDirection="column" gap="6">
        <PipelineIllustration />
        <Card.Group
          name="rag-data-source"
          checked={draft.selection ?? ''}
          onCheckedChange={({ value }) => onDraftChange({ ...draft, selection: value || null })}
        >
          <Grid gap="4">
            {DATA_TEMPLATES.map((item) => (
              <Grid.Item key={item.id} xs={12} md={4}>
                <Box style={{ display: 'flex', height: '100%' }}>
                  <Card
                    fullWidth
                    checkable
                    value={item.id}
                    checked={draft.selection === item.id}
                    title={item.title}
                    chips={item.chips}
                  >
                    {item.description}
                  </Card>
                </Box>
              </Grid.Item>
            ))}
            <Grid.Item xs={12} md={4}>
              <Box style={{ display: 'flex', height: '100%' }}>
                <Card
                  fullWidth
                  checkable
                  value="upload"
                  checked={draft.selection === 'upload'}
                  title="Upload your own data"
                  chips={[{ text: 'TXT', status: 'neutral' }]}
                >
                  Up to {UPLOAD_MAX_FILES} .txt files, 10 MB each. You add the files in the next step.
                </Card>
              </Box>
            </Grid.Item>
          </Grid>
        </Card.Group>
        {/* <ModelRequest /> hidden for now */}
      </Box.Flex>
    </StepWrapper>
  )
}

// ─── Step 2 ────────────────────────────────────────────────────────────────────

export function ConfigureStep({
  draft,
  onDraftChange,
}: {
  draft: DemoDraft
  onDraftChange: (draft: DemoDraft) => void
}) {
  const [rejected, setRejected] = useState<RejectedFile[]>([])
  const isUpload = draft.selection === 'upload'
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
    <StepWrapper
      description={
        isUpload
          ? 'Add your files and choose how they are split into chunks before embedding.'
          : 'Sample documents use a predefined chunking configuration — no setup needed. Continue to review.'
      }
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {isUpload ? (
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
        ) : null}

        {isUpload ? (
          <>
            <Box.Flex alignItems="center" gap="3" flexWrap="wrap">
              <Typography.SmallStrong color="intense">Chunking method</Typography.SmallStrong>
              <Typography.Small>{CHUNKING_METHOD.name}</Typography.Small>
              <StatusChip dense text="Predefined" status="neutral" />
            </Box.Flex>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Box>
                <Typography.SmallStrong color="intense">Chunk size</Typography.SmallStrong>
                <Box style={{ marginTop: 4 }}>
                  <Typography.Small color="muted">
                    Smaller chunks give tighter matches; larger chunks give more context per hit.
                  </Typography.Small>
                </Box>
              </Box>
              <Card.Group
                name="rag-chunk-size"
                checked={draft.chunkSizeId}
                onCheckedChange={({ value }) => update({ chunkSizeId: value as ChunkSizeId })}
              >
                <Grid gap="4">
                  {CHUNK_SIZES.map((option) => (
                    <Grid.Item key={option.id} xs={12} md={4}>
                      <Box style={{ display: 'flex', height: '100%' }}>
                        <Card
                          fullWidth
                          checkable
                          value={option.id}
                          checked={draft.chunkSizeId === option.id}
                          title={option.title}
                          chips={option.chip ? [option.chip] : undefined}
                        >
                          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Typography.SmallStrong color="intense">{option.tokens}</Typography.SmallStrong>
                            <Typography.Small color="muted">{option.description}</Typography.Small>
                          </Box>
                        </Card>
                      </Box>
                    </Grid.Item>
                  ))}
                </Grid>
              </Card.Group>
            </Box>
          </>
        ) : null}
      </Box>
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

export function ReviewStep({
  draft,
  onEditData,
  onEditConfiguration,
}: {
  draft: DemoDraft
  onEditData: () => void
  onEditConfiguration: () => void
}) {
  const [preview, setPreview] = useState<string | number>('mapping')
  const isUpload = draft.selection === 'upload'
  const template = DATA_TEMPLATES.find((item) => item.id === draft.selection)
  const chunkSize = CHUNK_SIZES.find((option) => option.id === draft.chunkSizeId)
  const source = draftToSource(draft)
  const plan = source ? planFor(source) : null

  return (
    <StepWrapper description="This is what the demo creates on your service. Nothing is created until you select Generate demo.">
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="Data" actions={{ text: 'Edit', onClick: onEditData }}>
          <ReviewRow first label="Source">
            {isUpload ? 'Uploaded files' : template?.title ?? '—'}
          </ReviewRow>
          <ReviewRow label={isUpload ? 'Files' : 'Documents'}>
            {plan
              ? `${formatCount(plan.documents)} ${isUpload ? (plan.documents === 1 ? 'file' : 'files') : 'sample documents'} · ${formatBytes(plan.totalBytes)}`
              : '—'}
          </ReviewRow>
        </Section>

        <Section title="Chunking" actions={{ text: 'Edit', onClick: onEditConfiguration }}>
          <ReviewRow first label="Method">
            Fixed-size with overlap
          </ReviewRow>
          <ReviewRow label="Chunk size">
            {chunkSize ? `${chunkSize.title} · ${chunkSize.tokens}` : '—'}
          </ReviewRow>
          <ReviewRow label="Estimated chunks">{plan ? `~${formatCount(plan.chunks)}` : '—'}</ReviewRow>
        </Section>

        <Section title="Created on your service">
          <ReviewRow first label="Index">
            <Mono>{DEMO_RESOURCES.indexName}</Mono>
          </ReviewRow>
          <ReviewRow label="Vector field">
            <Mono>{DEMO_RESOURCES.vectorField}</Mono> · knn_vector, {formatCount(DEMO_RESOURCES.dimension)} dimensions
          </ReviewRow>
          <ReviewRow label="Ingest pipeline">
            <Mono>{DEMO_RESOURCES.pipelineName}</Mono> · text chunking, then text embedding
          </ReviewRow>
          <ReviewRow label="Estimated storage">
            {plan ? `~${formatBytes(plan.storageBytes)} of service disk, including vectors` : '—'}
          </ReviewRow>
        </Section>

        <Section title="Models" subtitle="Predefined for this demo">
          <ReviewRow first label="Embedding model">
            {RAG_EMBEDDING_MODEL}
          </ReviewRow>
          <ReviewRow label="LLM">{RAG_LLM_MODEL}</ReviewRow>
        </Section>

        <Section title="Configuration preview" subtitle="Read-only">
          <Tabs value={preview} onChange={setPreview}>
            <Tabs.Tab title="Index mapping" value="mapping">
              <CodePreview code={indexMappingJson()} />
            </Tabs.Tab>
            <Tabs.Tab title="Ingest pipeline" value="pipeline">
              <CodePreview code={ingestPipelineJson(draft.chunkSizeId)} />
            </Tabs.Tab>
          </Tabs>
        </Section>

        <Box.Flex alignItems="center" gap="5" flexWrap="wrap">
          <Typography.Small color="muted">Learn more in the OpenSearch docs:</Typography.Small>
          {DEMO_DOC_LINKS.map((link) => (
            <Typography.Small key={link.href}>
              <Link href={link.href} target="_blank" rel="noopener noreferrer" icon={linkExternalIcon} iconPlacement="right">
                {link.text}
              </Link>
            </Typography.Small>
          ))}
        </Box.Flex>
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
