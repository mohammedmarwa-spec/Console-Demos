/** Predefined RAG demo models — read-only in the prototype. No Bedrock cost UI. */
export const RAG_EMBEDDING_MODEL = 'Amazon Titan Text Embeddings V2'
export const RAG_LLM_MODEL = 'Anthropic Claude 3.5 Sonnet'

export type DemoStep = 'landing' | 'choose-data' | 'processing' | 'query' | 'explained'

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

const DEVOPS_SOURCES: Omit<QuerySource, 'rank' | 'relevance'>[] = [
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

function cloneWithRelevance(
  rows: Omit<QuerySource, 'rank' | 'relevance'>[],
  relevances: Relevance[],
): QuerySource[] {
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    relevance: relevances[index] ?? 'low',
  }))
}

function orderForMode(
  rows: Omit<QuerySource, 'rank' | 'relevance'>[],
  mode: SearchMode,
): QuerySource[] {
  if (mode === 'keyword') {
    return cloneWithRelevance([rows[3], rows[0], rows[4], rows[1], rows[2]], [
      'high',
      'medium',
      'medium',
      'low',
      'low',
    ])
  }
  if (mode === 'hybrid') {
    return cloneWithRelevance([rows[0], rows[3], rows[1], rows[2], rows[4]], [
      'high',
      'high',
      'medium',
      'medium',
      'low',
    ])
  }
  return cloneWithRelevance(rows, ['high', 'high', 'medium', 'medium', 'low'])
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
  | { kind: 'template'; id: string; title: string }
  | UploadDemoSource

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
  chips?: { text: string; status: 'success' | 'info' | 'neutral' }[]
}[] = [
  {
    id: 'ecommerce',
    title: 'E-commerce catalog',
    description: 'Product names, descriptions, and FAQs from a sample store catalog.',
    chips: [{ text: 'Sample', status: 'info' }],
  },
  {
    id: 'devops',
    title: 'DevOps runbook',
    description: 'Incident playbooks, alerts, and on-call notes for a typical service.',
  },
  {
    id: 'faq',
    title: 'Support FAQ',
    description: 'Customer questions and answers from a support knowledge base.',
  },
  {
    id: 'docs',
    title: 'Technical docs',
    description: 'API reference snippets and how-to pages from a product manual.',
  },
]

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
export const UPLOAD_ACCEPT = '.txt,text/plain'
export const UPLOAD_EXTENSIONS = ['txt'] as const

export type SearchDemoOption = 'none' | 'vector'

export const SEARCH_DEMO_OPTIONS: {
  id: SearchDemoOption
  title: string
  description: string
  chips?: { text: string; status: 'success' | 'info' | 'neutral' }[]
}[] = [
  {
    id: 'none',
    title: 'None',
    description: 'Create the service without a pre-configured search environment.',
  },
  {
    id: 'vector',
    title: 'Vector & Semantic Search',
    description:
      'Includes a pre-configured embedding model and LLM so you can try vector search in a few minutes.',
    chips: [{ text: 'Demo', status: 'info' }],
  },
]
