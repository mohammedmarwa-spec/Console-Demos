'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  FileInput,
  Grid,
  Stepper,
  Typography,
} from '@aivenio/aquarium'
import {
  DATA_TEMPLATES,
  UPLOAD_ACCEPT,
  UPLOAD_EXTENSIONS,
  UPLOAD_MAX_BYTES,
  type DemoDataSource,
} from './ragDemo'

type Selection = string | 'upload' | null
type UploadError = 'type' | 'size' | 'empty' | null

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (fromName) return fromName
  if (file.type === 'text/plain') return 'txt'
  return ''
}

function validateFile(file: File | null): { error: UploadError; file: File | null } {
  if (!file) return { error: null, file: null }
  if (file.size === 0) return { error: 'empty', file: null }
  if (file.size > UPLOAD_MAX_BYTES) return { error: 'size', file: null }
  const ext = extensionOf(file)
  if (!(UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) return { error: 'type', file: null }
  return { error: null, file }
}

const ERROR_COPY: Record<Exclude<UploadError, null>, string> = {
  type: 'Use a .txt file.',
  size: 'That file is larger than 10 MB. Choose a smaller file.',
  empty: 'That file is empty. Choose a file with content.',
}

/**
 * Screen 3 — choose a data source (templates or upload) inside the OpenSearch shell.
 */
export function ChooseDataSource({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: (source: DemoDataSource) => void
}) {
  const [selection, setSelection] = useState<Selection>(DATA_TEMPLATES[0]?.id ?? null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<UploadError>(null)

  const template = DATA_TEMPLATES.find((item) => item.id === selection)
  const canContinue =
    Boolean(template) || (selection === 'upload' && uploadFile !== null && uploadError === null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null
    const result = validateFile(next)
    setUploadFile(result.file)
    setUploadError(result.error)
  }

  function handleContinue() {
    if (template) {
      onContinue({ kind: 'template', id: template.id, title: template.title })
      return
    }
    if (selection === 'upload' && uploadFile) {
      onContinue({ kind: 'upload', fileName: uploadFile.name })
    }
  }

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
          Data ingestion required. Pick a sample template or upload a file — models are already
          chosen.
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
                Templates use mock documents. Upload accepts a .txt file up to 10 MB.
              </Typography.Small>
            </Box>
          </Box>

          <Card.Group
            name="rag-data-source"
            checked={selection ?? ''}
            onCheckedChange={({ value }) => {
              setSelection((value as Selection) ?? null)
              if (value !== 'upload') {
                setUploadFile(null)
                setUploadError(null)
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
                      Import a file to try vector search on your own content. Nothing is sent to a
                      real cluster in this prototype.
                    </Typography.Small>
                  </Card>
                </Box>
              </Grid.Item>
            </Grid>
          </Card.Group>

          {selection === 'upload' ? (
            <FileInput
              labelText="File"
              accept={UPLOAD_ACCEPT}
              description="TXT only. Maximum 10 MB."
              helperText={uploadError ? ERROR_COPY[uploadError] : undefined}
              valid={uploadError === null}
              onChange={handleFileChange}
            />
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
