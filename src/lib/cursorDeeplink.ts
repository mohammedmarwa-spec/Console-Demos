import type { DiscoveredPage } from '@/lib/experiments/types'
import { listOwnerSlugs } from './designTeamOwners'

/** Cursor deeplink URL length limit (https://cursor.com/docs/reference/deeplinks). */
export const CURSOR_DEEPLINK_MAX_LENGTH = 8000

const CURSOR_WEB_PROMPT_BASE = 'https://cursor.com/link/prompt'

const OWNER_STORAGE_KEY = 'prototype-lab:owner-slug'

export type CursorPromptIntent = 'fork' | 'edit'

export type ForkCursorPromptInput = {
  entry: DiscoveredPage
  ownerSlug: string
  experimentSlug: string
}

export type CursorPromptResult = {
  prompt: string
  url: string
  intent: CursorPromptIntent
  withinLimit: boolean
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getStoredOwnerSlug(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(OWNER_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function storeOwnerSlug(ownerSlug: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OWNER_STORAGE_KEY, ownerSlug)
  } catch {
    /* private mode or blocked storage */
  }
}

/**
 * Start in Cursor always forks into a new experiment folder —
 * from a template or by copying someone else's experiment.
 */
export function getCursorPromptIntent(_entry: DiscoveredPage): CursorPromptIntent {
  return 'fork'
}

function playgroundRulesBlock(): string {
  return `- Modify only the experiment folder for new work.
- Reuse existing mock data from src/mocks/.
- Keep the Console-like shell and existing price calculation logic.
- Create or update component-manifest.ts when Aquarium or prototype UI changes.
- Follow .cursor/rules/ and docs/agent-rules.md.`
}

function scaffoldCommand(
  entry: DiscoveredPage,
  ownerSlug: string,
  experimentSlug: string,
): string {
  if (entry.kind === 'experiment' && entry.ownerSlug) {
    return `node scripts/create-experiment.mjs --owner ${ownerSlug} --name ${experimentSlug} --from ${entry.ownerSlug}/${entry.slug}`
  }
  return `node scripts/create-experiment.mjs --owner ${ownerSlug} --name ${experimentSlug} --template ${entry.slug}`
}

export function buildForkCursorPrompt({
  entry,
  ownerSlug,
  experimentSlug,
}: ForkCursorPromptInput): string {
  const folder = `experiments/${ownerSlug}/${experimentSlug}`
  const sourceKind = entry.kind === 'experiment' ? 'experiment' : 'template'
  const sourcePath =
    entry.kind === 'experiment' && entry.ownerSlug
      ? ` (${entry.ownerSlug}/${entry.slug})`
      : ''

  return `Use the "${entry.title}" ${sourceKind}${sourcePath} as the base.

Create a new experiment in Console Prototype Lab.

Run (or replicate exactly):
${scaffoldCommand(entry, ownerSlug, experimentSlug)}

Target folder: ${folder}/
Preview route: /experiments/${ownerSlug}/${experimentSlug}

Goal:
Update pageMeta (title, description) in ${folder}/index.tsx, then implement your design changes only inside ${folder}/.
Create or update ${folder}/component-manifest.ts for Aquarium vs prototype components.

Rules:
${playgroundRulesBlock()}`
}

export function buildEditCursorPrompt(entry: DiscoveredPage): string {
  const folder = `experiments/${entry.ownerSlug}/${entry.slug}`

  return `Continue work on the "${entry.title}" experiment in Console Prototype Lab.

Experiment folder: ${folder}/
Preview route: ${entry.route}

Goal:
Implement design changes only inside ${folder}/.
Create or update ${folder}/component-manifest.ts for Aquarium vs prototype components.

Rules:
${playgroundRulesBlock()}`
}

export function buildCursorPrompt(
  entry: DiscoveredPage,
  forkInput?: Pick<ForkCursorPromptInput, 'ownerSlug' | 'experimentSlug'>,
): CursorPromptResult {
  const intent = getCursorPromptIntent(entry)
  const prompt =
    intent === 'edit'
      ? buildEditCursorPrompt(entry)
      : buildForkCursorPrompt({
          entry,
          ownerSlug: forkInput?.ownerSlug ?? 'your-name',
          experimentSlug: forkInput?.experimentSlug ?? slugify(entry.title),
        })

  const url = buildCursorPromptUrl(prompt)
  return {
    prompt,
    url,
    intent,
    withinLimit: url.length <= CURSOR_DEEPLINK_MAX_LENGTH,
  }
}

export function buildCursorPromptUrl(prompt: string): string {
  const url = new URL(CURSOR_WEB_PROMPT_BASE)
  url.searchParams.set('text', prompt)
  return url.toString()
}

export function suggestExperimentSlug(entry: DiscoveredPage): string {
  return slugify(entry.title) || entry.slug
}

/** Prefer the designer's saved owner — never default to the source experiment's owner. */
export function suggestOwnerSlug(_entry?: DiscoveredPage): string {
  const stored = getStoredOwnerSlug()
  if (stored) return stored
  return listOwnerSlugs()[0] ?? ''
}
