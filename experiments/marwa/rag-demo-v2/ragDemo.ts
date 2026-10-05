/** Predefined RAG demo models — read-only in the prototype. No Bedrock cost UI. */
export const RAG_EMBEDDING_MODEL = 'Amazon Titan Text Embeddings V2'
export const RAG_LLM_MODEL = 'Anthropic Claude 3.5 Sonnet'
export const RAG_EMBEDDING_MODEL_SHORT = 'Titan Embeddings V2'
export const RAG_LLM_MODEL_SHORT = 'Claude 3.5 Sonnet'

/** Steps inside the setup modal. Search lives on the demo page, not in the modal. */
export type DemoStep = 'choose-data' | 'configure' | 'review' | 'processing'

export type DemoView = 'query' | 'explained'

export type SearchMode = 'keyword' | 'semantic' | 'hybrid'
export type Relevance = 'high' | 'medium' | 'low'

export type QuerySource = {
  id: string
  rank: number
  title: string
  snippet: string
  chunk: string
  matchedText: string
  relevance: Relevance
  score: number
}

export type QueryBundle = {
  answer: string
  modeSummary: string
  sources: QuerySource[]
}

export const SEARCH_MODES: { id: SearchMode; label: string }[] = [
  { id: 'keyword', label: 'Keyword' },
  { id: 'semantic', label: 'Semantic' },
  { id: 'hybrid', label: 'Hybrid' },
]

export const QUERY_EXAMPLES: Record<string, string[]> = {
  ecommerce: ['out of stock', 'shipping delay', 'return policy'],
  devops: ['system bottlenecks', 'speed', 'responsiveness'],
  faq: ['password reset', 'billing charge', 'cancel subscription'],
  docs: ['authentication', 'rate limits', 'webhooks'],
  upload: ['system bottlenecks', 'speed', 'responsiveness'],
}

const DEVOPS_SOURCES: Omit<QuerySource, 'rank' | 'relevance' | 'score'>[] = [
  {
    id: '552',
    title: 'Requests failing under high concurrency due to connection pool exhaustion #552',
    snippet: 'The API starts returning 503s when more than ~80 clients share one pool.',
    chunk:
      'When traffic spikes, checkout and search share a single connection pool. Threads wait on checkout, then time out. Raising max connections without bounding idle time made saturation worse. Cap pool size per service and fail fast with a retry budget.',
    matchedText: 'connection pool exhaustion, 503s, concurrency',
  },
  {
    id: '108',
    title: 'Event loop blocked by heavy synchronous JSON parsing in main thread #108',
    snippet: 'Large payloads are parsed on the event loop and stall unrelated requests.',
    chunk:
      'Synchronous JSON.parse on 2–5 MB bodies blocks the event loop for tens of milliseconds. Move parsing to a worker and stream the body. This shows up as high p99 latency with low CPU, which people read as a “mystery bottleneck”.',
    matchedText: 'event loop, JSON parsing, p99 latency',
  },
  {
    id: '442',
    title: "I/O threads permanently stuck in 'Waiting' state under heavy write load #442",
    snippet: 'Disk fsync on the leader stalls replica acknowledgements.',
    chunk:
      'Heavy write batches fsync on every commit. I/O threads sit in Waiting while the volume queue grows. Batch commits and use group flush. Symptom: saturation with almost no CPU, same family as pool exhaustion.',
    matchedText: 'I/O threads Waiting, write load, fsync',
  },
  {
    id: '912',
    title: 'Elevated API response times coinciding with Git clone surges #912',
    snippet: 'CI clone storms compete with the app for disk and network.',
    chunk:
      'Nightly CI clones saturate the shared volume. API p95 climbs in the same window even though app code did not change. Isolate CI disk or cache objects. Adjacent to bottlenecks, weaker overlap.',
    matchedText: 'API response times, Git clone, disk saturation',
  },
  {
    id: '24594',
    title: 'Worker saturation caused by non-indexed sequential scans on large collections #24594',
    snippet: 'A reporting query scans the full orders collection during peak hours.',
    chunk:
      'The daily report does a collection scan with no index on created_at. Workers pile up behind it. Add the index or move the job off peak. Related capacity issue, not the same failure mode as pool exhaustion.',
    matchedText: 'worker saturation, sequential scans',
  },
]

/** Scores are normalized to 0–1 per mode; the tier only picks the chip color. */
function relevanceForScore(score: number): Relevance {
  if (score >= 0.8) return 'high'
  if (score >= 0.6) return 'medium'
  return 'low'
}

function cloneWithScores(rows: Omit<QuerySource, 'rank' | 'relevance' | 'score'>[], scores: number[]): QuerySource[] {
  return rows.map((row, index) => {
    const score = scores[index] ?? 0.3
    return { ...row, rank: index + 1, score, relevance: relevanceForScore(score) }
  })
}

function orderForMode(rows: Omit<QuerySource, 'rank' | 'relevance' | 'score'>[], mode: SearchMode): QuerySource[] {
  if (mode === 'keyword') {
    return cloneWithScores([rows[3], rows[0], rows[4], rows[1], rows[2]], [0.84, 0.71, 0.66, 0.48, 0.41])
  }
  if (mode === 'hybrid') {
    return cloneWithScores([rows[0], rows[3], rows[1], rows[2], rows[4]], [0.93, 0.86, 0.74, 0.68, 0.52])
  }
  return cloneWithScores(rows, [0.92, 0.88, 0.76, 0.69, 0.55])
}

export function formatScore(score: number): string {
  return score.toFixed(2)
}

export function examplesFor(source: DemoDataSource): string[] {
  if (source.kind === 'upload') return QUERY_EXAMPLES.upload
  return QUERY_EXAMPLES[source.id] ?? QUERY_EXAMPLES.devops
}

export function defaultQueryFor(source: DemoDataSource): string {
  return examplesFor(source)[0] ?? 'system bottlenecks'
}

export function runMockQuery(source: DemoDataSource, mode: SearchMode, query: string): QueryBundle {
  const label = sourceLabel(source)
  const q = query.trim() || defaultQueryFor(source)
  const sources = orderForMode(DEVOPS_SOURCES, mode)

  const answers: Record<SearchMode, string> = {
    keyword: `Keyword search over ${label} looked for the words in “${q}”. Top hits mention those terms directly (response times, Git clone, scans) rather than the broader idea of a bottleneck.`,
    semantic: `The main bottlenecks in ${label} are connection pool exhaustion under concurrency, a blocked event loop from synchronous JSON parsing, and I/O threads stuck waiting on heavy writes. Those match the meaning of “${q}”, not just the words.`,
    hybrid: `Hybrid search mixed exact terms from “${q}” with meaning. Pool exhaustion and clone-storm latency both rank highly: one matches the concept, the other matches the words “response times”.`,
  }

  const summaries: Record<SearchMode, string> = {
    keyword: `${sources.length} results found via keyword: exact terms matching “${q}”`,
    semantic: `${sources.length} results found via semantic vector: conceptually similar to “${q}”`,
    hybrid: `${sources.length} results found via hybrid search: terms and meaning for “${q}”`,
  }

  return {
    answer: answers[mode],
    modeSummary: summaries[mode],
    sources,
  }
}

export function relevanceLabel(relevance: Relevance): string {
  if (relevance === 'high') return 'High'
  if (relevance === 'medium') return 'Medium'
  return 'Low'
}

export function relevanceStatus(relevance: Relevance): 'success' | 'warning' | 'neutral' {
  if (relevance === 'high') return 'success'
  if (relevance === 'medium') return 'warning'
  return 'neutral'
}

export type ChunkSizeId = 'small' | 'medium' | 'large'

export type UploadDemoSource = {
  kind: 'upload'
  fileNames: string[]
  totalBytes: number
  chunkSizeId: ChunkSizeId
}

export type DemoDataSource =
  | { kind: 'template'; id: string; title: string; chunkSizeId: ChunkSizeId }
  | UploadDemoSource

/** In-progress setup choices, kept by the shell so Back from Prepare restores them. */
export type DemoDraft = {
  selection: string | null
  files: File[]
  chunkSizeId: ChunkSizeId
}

export const INITIAL_DEMO_DRAFT: DemoDraft = {
  selection: null,
  files: [],
  chunkSizeId: 'medium',
}

export function draftToSource(draft: DemoDraft): DemoDataSource | null {
  if (draft.selection === 'upload') {
    if (draft.files.length === 0) return null
    return {
      kind: 'upload',
      fileNames: draft.files.map((file) => file.name),
      totalBytes: draft.files.reduce((sum, file) => sum + file.size, 0),
      chunkSizeId: draft.chunkSizeId,
    }
  }
  const template = DATA_TEMPLATES.find((item) => item.id === draft.selection)
  if (!template) return null
  return { kind: 'template', id: template.id, title: template.title, chunkSizeId: draft.chunkSizeId }
}

/**
 * Human-friendly label for a data source — used in status copy and mock answers.
 * Uploads collapse to a file count when multiple files are selected.
 */
export function sourceLabel(source: DemoDataSource): string {
  if (source.kind === 'template') return source.title
  if (source.fileNames.length === 1) return source.fileNames[0]
  return `${source.fileNames.length} uploaded files`
}

/** Predefined chunking method — read-only in the prototype (no Bedrock UI). */
export const CHUNKING_METHOD = {
  name: 'Fixed-size chunking with overlap',
  description:
    'Text is split into fixed-length passages with a small overlap so sentences that span chunk boundaries still retrieve well. Overlap is 10% of the chunk size.',
} as const

export const CHUNK_SIZES: {
  id: ChunkSizeId
  title: string
  tokens: string
  description: string
  chip?: { text: string; status: 'info' | 'neutral' | 'success' }
}[] = [
  {
    id: 'small',
    title: 'Small',
    tokens: '256 tokens · 26 token overlap',
    description:
      'Tighter passages. Best for FAQ-style questions where the answer sits in one sentence.',
  },
  {
    id: 'medium',
    title: 'Medium',
    tokens: '512 tokens · 51 token overlap',
    description:
      'Balanced default. Good for runbooks and documentation with short paragraphs.',
    chip: { text: 'Recommended', status: 'info' },
  },
  {
    id: 'large',
    title: 'Large',
    tokens: '1024 tokens · 102 token overlap',
    description:
      'Wider context per chunk. Best for long-form docs where the answer needs multiple sentences.',
  },
]

export const DEFAULT_CHUNK_SIZE: ChunkSizeId = 'medium'
export const UPLOAD_MAX_FILES = 50

export const DATA_TEMPLATES: {
  id: string
  title: string
  description: string
  documents: number
  bytes: number
  chips?: { text: string; status: 'success' | 'info' | 'neutral' }[]
}[] = [
  {
    id: 'ecommerce',
    title: 'E-commerce catalog',
    description: 'Product names, descriptions, and FAQs from a sample store catalog.',
    documents: 180,
    bytes: 2.4 * 1024 * 1024,
    chips: [{ text: 'Sample', status: 'info' }],
  },
  {
    id: 'devops',
    title: 'DevOps runbook',
    description: 'Incident playbooks, alerts, and on-call notes for a typical service.',
    documents: 120,
    bytes: 1.6 * 1024 * 1024,
  },
  {
    id: 'faq',
    title: 'Support FAQ',
    description: 'Customer questions and answers from a support knowledge base.',
    documents: 300,
    bytes: 0.9 * 1024 * 1024,
  },
  {
    id: 'docs',
    title: 'Technical docs',
    description: 'API reference snippets and how-to pages from a product manual.',
    documents: 150,
    bytes: 3.1 * 1024 * 1024,
  },
]

// ─── What the demo creates on the service ─────────────────────────────────────

export const DEMO_RESOURCES = {
  indexName: 'rag-demo-docs',
  vectorField: 'passage_embedding',
  textField: 'passage_text',
  pipelineName: 'rag-demo-ingest',
  embeddingModelId: 'amazon.titan-embed-text-v2:0',
  dimension: 1024,
} as const

export const DEMO_DOC_LINKS = [
  { text: 'Vector search', href: 'https://docs.opensearch.org/latest/vector-search/' },
  { text: 'Neural search and ingest pipelines', href: 'https://docs.opensearch.org/latest/vector-search/ai-search/' },
] as const

const CHUNK_TOKENS: Record<ChunkSizeId, number> = { small: 256, medium: 512, large: 1024 }
const BYTES_PER_TOKEN = 4

export type DemoPlan = {
  documents: number
  totalBytes: number
  chunks: number
  storageBytes: number
}

/** Rough sizing for the Review step and progress counts. Mock numbers, not a real estimator. */
export function planFor(source: DemoDataSource): DemoPlan {
  const template = source.kind === 'template' ? DATA_TEMPLATES.find((item) => item.id === source.id) : undefined
  const documents = source.kind === 'upload' ? source.fileNames.length : template?.documents ?? 0
  const totalBytes = source.kind === 'upload' ? source.totalBytes : template?.bytes ?? 0
  const chunkTokens = CHUNK_TOKENS[source.chunkSizeId]
  const stride = chunkTokens * 0.9
  const chunks = Math.max(documents, Math.ceil(totalBytes / BYTES_PER_TOKEN / stride))
  const bytesPerChunk = DEMO_RESOURCES.dimension * 4 + chunkTokens * BYTES_PER_TOKEN + 512
  return { documents, totalBytes, chunks, storageBytes: Math.round(chunks * bytesPerChunk * 1.3) }
}

export function indexMappingJson(): string {
  return JSON.stringify(
    {
      settings: { 'index.knn': true, default_pipeline: DEMO_RESOURCES.pipelineName },
      mappings: {
        properties: {
          [DEMO_RESOURCES.textField]: { type: 'text' },
          [DEMO_RESOURCES.vectorField]: {
            type: 'knn_vector',
            dimension: DEMO_RESOURCES.dimension,
            method: { name: 'hnsw', engine: 'faiss', space_type: 'l2' },
          },
          source_file: { type: 'keyword' },
        },
      },
    },
    null,
    2,
  )
}

export function ingestPipelineJson(chunkSizeId: ChunkSizeId): string {
  const tokens = CHUNK_TOKENS[chunkSizeId]
  return JSON.stringify(
    {
      description: 'Vector search demo: chunk text, then embed each chunk with Titan',
      processors: [
        {
          text_chunking: {
            algorithm: { fixed_token_length: { token_limit: tokens, overlap_rate: 0.1 } },
            field_map: { body: DEMO_RESOURCES.textField },
          },
        },
        {
          text_embedding: {
            model_id: DEMO_RESOURCES.embeddingModelId,
            field_map: { [DEMO_RESOURCES.textField]: DEMO_RESOURCES.vectorField },
          },
        },
      ],
    },
    null,
    2,
  )
}

// ─── Preparing: named stages ──────────────────────────────────────────────────

export type PrepStageId = 'upload' | 'chunking' | 'embedding' | 'indexing'

export const PREP_STAGES: PrepStageId[] = ['upload', 'chunking', 'embedding', 'indexing']

export function stageLabel(stage: PrepStageId, source: DemoDataSource): string {
  if (stage === 'upload') return source.kind === 'upload' ? 'Uploading files' : 'Loading sample documents'
  if (stage === 'chunking') return 'Chunking documents'
  if (stage === 'embedding') return 'Generating embeddings'
  return 'Indexing in OpenSearch'
}

export function stageDoneLabel(stage: PrepStageId, source: DemoDataSource): string {
  if (stage === 'upload') return source.kind === 'upload' ? 'Files uploaded' : 'Sample documents loaded'
  if (stage === 'chunking') return 'Documents chunked'
  if (stage === 'embedding') return 'Embeddings generated'
  return 'Chunks indexed'
}

export function stageTotal(stage: PrepStageId, plan: DemoPlan): number {
  return stage === 'upload' ? plan.documents : plan.chunks
}

export function stageUnit(stage: PrepStageId, source: DemoDataSource, total: number): string {
  const one = total === 1
  if (stage !== 'upload') return one ? 'chunk' : 'chunks'
  if (source.kind === 'upload') return one ? 'file' : 'files'
  return one ? 'document' : 'documents'
}

/** Prototype hook: uploads with "fail" in a file name fail once while generating embeddings. */
export function shouldFailAt(source: DemoDataSource): PrepStageId | null {
  if (source.kind !== 'upload') return null
  return source.fileNames.some((name) => name.toLowerCase().includes('fail')) ? 'embedding' : null
}

export const REQUESTABLE_MODELS = [
  'OpenAI text-embedding-3',
  'Cohere Embed v3',
  'Anthropic Claude 3.7 Sonnet',
  'Meta Llama 3',
] as const

export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
export const UPLOAD_ACCEPT = '.txt,text/plain'
export const UPLOAD_EXTENSIONS = ['txt'] as const

/**
 * Vector search demo is auto-included for Free/Developer OpenSearch services.
 * Users no longer pick None vs Vector at create time — the demo is announced
 * by an information Alert on the create form and launched later from the
 * "Try the vector search demo" Card on the service Overview.
 */
