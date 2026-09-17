'use client'

import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  FileInput,
  Grid,
  StatusChip,
  Stepper,
  Typography,
} from '@aivenio/aquarium'
import crossIcon from '@aivenio/aquarium/icons/cross'
import {
  CHUNK_SIZES,
  CHUNKING_METHOD,
  DATA_TEMPLATES,
  DEFAULT_CHUNK_SIZE,
  UPLOAD_ACCEPT,
  UPLOAD_EXTENSIONS,
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_FILES,
  type ChunkSizeId,
  type DemoDataSource,
} from './ragDemo'

type Selection = string | 'upload' | null
type UploadErrorKind = 'type' | 'size' | 'empty' | 'duplicate' | 'limit'

type RejectedFile = { name: string; reason: UploadErrorKind }

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (fromName) return fromName
  if (file.type === 'text/plain') return 'txt'
  return ''
}

function validateFile(file: File): UploadErrorKind | null {
  if (file.size === 0) return 'empty'
  if (file.size > UPLOAD_MAX_BYTES) return 'size'
  const ext = extensionOf(file)
  if (!(UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) return 'type'
  return null
}

const REJECT_COPY: Record<UploadErrorKind, string> = {
  type: 'is not a .txt file.',
  size: 'is larger than 10 MB.',
  empty: 'is empty.',
  duplicate: 'was already added.',
  limit: `was skipped — the limit is ${UPLOAD_MAX_FILES} files.`,
}

const BYTES_PER_MB = 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < BYTES_PER_MB) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / BYTES_PER_MB).toFixed(bytes < 10 * BYTES_PER_MB ? 1 : 0)} MB`
}

/**
 * Screen 3 — choose a data source (templates or upload) inside the OpenSearch shell.
 * Upload accepts up to 50 .txt files with a predefined chunking method and a
 * chunk-size option (Small / Medium / Large).
 */
export function ChooseDataSource({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: (source: DemoDataSource) => void
}) {
  const [selection, setSelection] = useState<Selection>(DATA_TEMPLATES[0]?.id ?? null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [rejected, setRejected] = useState<RejectedFile[]>([])
  const [chunkSizeId, setChunkSizeId] = useState<ChunkSizeId>(DEFAULT_CHUNK_SIZE)

  const template = DATA_TEMPLATES.find((item) => item.id === selection)
  const totalBytes = useMemo(
    () => uploadFiles.reduce((sum, file) => sum + file.size, 0),
    [uploadFiles],
  )
  const canContinue =
    Boolean(template) || (selection === 'upload' && uploadFiles.length > 0)

  function resetUploadState() {
    setUploadFiles([])
    setRejected([])
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return
    const nextAccepted: File[] = [...uploadFiles]
    const nextRejected: RejectedFile[] = []
    const seen = new Set(nextAccepted.map((file) => `${file.name}::${file.size}`))

    for (const file of Array.from(incoming)) {
      if (nextAccepted.length >= UPLOAD_MAX_FILES) {
        nextRejected.push({ name: file.name, reason: 'limit' })
        continue
      }
      const key = `${file.name}::${file.size}`
      if (seen.has(key)) {
        nextRejected.push({ name: file.name, reason: 'duplicate' })
        continue
      }
      const error = validateFile(file)
      if (error) {
        nextRejected.push({ name: file.name, reason: error })
        continue
      }
      seen.add(key)
      nextAccepted.push(file)
    }

    setUploadFiles(nextAccepted)
    setRejected(nextRejected)
  }

  function removeFile(name: string, size: number) {
    setUploadFiles((prev) =>
      prev.filter((file) => !(file.name === name && file.size === size)),
    )
  }

  function handleContinue() {
    if (template) {
      onContinue({ kind: 'template', id: template.id, title: template.title })
      return
    }
    if (selection === 'upload' && uploadFiles.length > 0) {
      onContinue({
        kind: 'upload',
        fileNames: uploadFiles.map((file) => file.name),
        totalBytes,
        chunkSizeId,
      })
    }
  }

  const uploadHelper = rejected.length > 0
    ? `${rejected.length} file${rejected.length === 1 ? '' : 's'} skipped — see below.`
    : undefined

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Stepper activeIndex={0}>
        <Stepper.Step>Choose data</Stepper.Step>
        <Stepper.Step>Prepare</Stepper.Step>
        <Stepper.Step>Search</Stepper.Step>
      </Stepper>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography.Heading color="intense">Choose a data source</Typography.Heading>
        <Typography.Default color="muted">
          Data ingestion required. Pick a sample template or upload up to {UPLOAD_MAX_FILES} .txt
          files — models are already chosen.
        </Typography.Default>
      </Box>

      <Box
        style={{
          padding: 24,
          borderRadius: 'var(--aquarium-border-radius-lg, 6px)',
          border: '1px dashed var(--aquarium-border-color-default)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box>
            <Typography.LargeStrong color="intense">Which data do you want to search?</Typography.LargeStrong>
            <Box style={{ marginTop: 8 }}>
              <Typography.Small color="muted">
                Templates use mock documents. Upload accepts .txt files up to 10 MB each,
                {' '}
                {UPLOAD_MAX_FILES} files max.
              </Typography.Small>
            </Box>
          </Box>

          <Card.Group
            name="rag-data-source"
            checked={selection ?? ''}
            onCheckedChange={({ value }) => {
              setSelection((value as Selection) ?? null)
              if (value !== 'upload') {
                resetUploadState()
              }
            }}
          >
            <Grid gap="4">
              {DATA_TEMPLATES.map((item) => (
                <Grid.Item key={item.id} xs={12} sm={6}>
                  <Box style={{ display: 'flex', height: '100%' }}>
                    <Card
                      fullWidth
                      checkable
                      value={item.id}
                      checked={selection === item.id}
                      title={item.title}
                      chips={item.chips}
                    >
                      <Typography.Small color="muted">{item.description}</Typography.Small>
                    </Card>
                  </Box>
                </Grid.Item>
              ))}
              <Grid.Item xs={12} sm={6}>
                <Box style={{ display: 'flex', height: '100%' }}>
                  <Card
                    fullWidth
                    checkable
                    value="upload"
                    checked={selection === 'upload'}
                    title="Upload your own data"
                    chips={[{ text: 'TXT', status: 'neutral' }]}
                  >
                    <Typography.Small color="muted">
                      Import up to {UPLOAD_MAX_FILES} .txt files to try vector search on your own
                      content. Nothing is sent to a real cluster in this prototype.
                    </Typography.Small>
                  </Card>
                </Box>
              </Grid.Item>
            </Grid>
          </Card.Group>

          {selection === 'upload' ? (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FileInput
                labelText="Files"
                accept={UPLOAD_ACCEPT}
                multiple
                description={`TXT only. Up to ${UPLOAD_MAX_FILES} files · 10 MB each.`}
                helperText={uploadHelper}
                valid={rejected.length === 0 ? undefined : false}
                onChange={(event) => addFiles(event.target.files)}
              />

              {uploadFiles.length > 0 ? (
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: 16,
                    borderRadius: 'var(--aquarium-border-radius-default)',
                    backgroundColor: 'var(--aquarium-background-color-body)',
                    border: '1px solid var(--aquarium-border-color-muted)',
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <Typography.SmallStrong color="intense">
                      {uploadFiles.length} of {UPLOAD_MAX_FILES} files · {formatBytes(totalBytes)}
                    </Typography.SmallStrong>
                    <Button.Ghost dense type="button" onClick={resetUploadState}>
                      Remove all
                    </Button.Ghost>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column', maxHeight: 220, overflow: 'auto' }}>
                    {uploadFiles.map((file) => (
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
                          onClick={() => removeFile(file.name, file.size)}
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
                        <Typography.Small color="muted">
                          +{rejected.length - 5} more
                        </Typography.Small>
                      </li>
                    ) : null}
                  </Box>
                </Alert>
              ) : null}

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 16,
                  borderRadius: 'var(--aquarium-border-radius-default)',
                  backgroundColor: 'var(--aquarium-background-color-body)',
                  border: '1px solid var(--aquarium-border-color-muted)',
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Typography.SmallStrong color="intense">Chunking method</Typography.SmallStrong>
                  <StatusChip dense text="Predefined" status="neutral" />
                </Box>
                <Typography.Default color="intense">{CHUNKING_METHOD.name}</Typography.Default>
                <Typography.Small color="muted">{CHUNKING_METHOD.description}</Typography.Small>
              </Box>

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
                  checked={chunkSizeId}
                  onCheckedChange={({ value }) => setChunkSizeId((value as ChunkSizeId) ?? DEFAULT_CHUNK_SIZE)}
                >
                  <Grid gap="4">
                    {CHUNK_SIZES.map((option) => (
                      <Grid.Item key={option.id} xs={12} sm={4}>
                        <Box style={{ display: 'flex', height: '100%' }}>
                          <Card
                            fullWidth
                            checkable
                            value={option.id}
                            checked={chunkSizeId === option.id}
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
            </Box>
          ) : null}
        </Box>
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button.Ghost type="button" onClick={onBack}>
          Back
        </Button.Ghost>
        <Button type="button" disabled={!canContinue} onClick={handleContinue}>
          Start demo
        </Button>
      </Box>
    </Box>
  )
}

ChooseDataSource.displayName = 'ChooseDataSource'
