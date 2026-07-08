import { parseExperimentId } from './navigation'
import type { PlaygroundEntry } from '../registry/types'

/** Cursor deeplink URL length limit (https://cursor.com/docs/reference/deeplinks). */
export const CURSOR_DEEPLINK_MAX_LENGTH = 8000

const CURSOR_WEB_PROMPT_BASE = 'https://cursor.com/link/prompt'

const OWNER_STORAGE_KEY = 'prototype-lab:owner-slug'

export const DESIGN_TEAM_OWNERS = [
  'Brian',
  'Caio',
  'Elena',
  'Ioan',
  'Irene',
  'Kate',
  'Marwa',
  'Robin',
  'Yaesul',
] as const

export type DesignTeamOwner = (typeof DESIGN_TEAM_OWNERS)[number]

export type CursorPromptIntent = 'fork' | 'edit'

export type ForkCursorPromptInput = {
  entry: PlaygroundEntry
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

export function ownerSlugFromDisplayName(name: string): string {
  return slugify(name)
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

export function getCursorPromptIntent(entry: PlaygroundEntry): CursorPromptIntent {
  if (entry.id.startsWith('experiment/')) return 'edit'
  return 'fork'
}

export function getSourceScenarioId(entry: PlaygroundEntry): string {
  return entry.sourceScenarioId ?? entry.aliasOf ?? entry.runtimeKey
}

function playgroundRulesBlock(): string {
  return `- Do not edit reusable scenarios in src/registry/scenarios.ts unless explicitly asked.
- Modify only the experiment folder for new work.
- Reuse existing mock data from src/mocks/.
- Keep the Console-like shell and existing price calculation logic.
- Update notes.md with what you are testing.
- Follow cursor/rules/ and docs/agent-rules.md.`
}

export function buildForkCursorPrompt({
  entry,
  ownerSlug,
  experimentSlug,
}: ForkCursorPromptInput): string {
  const sourceScenarioId = getSourceScenarioId(entry)
  const experimentId = `experiment/${ownerSlug}/${experimentSlug}`
  const folder = `src/experiments/${ownerSlug}/${experimentSlug}`

  return `Use the existing "${entry.title}" scenario (${sourceScenarioId}) as the base.

Create a new experiment in Console Prototype Lab.

Run (or replicate exactly):
node scripts/create-experiment.mjs --owner ${ownerSlug} --name ${experimentSlug} --from ${sourceScenarioId}

Target folder: ${folder}/
Registry id: ${experimentId}
Preview route: /experiments/${ownerSlug}/${experimentSlug}

Goal:
Describe your design hypothesis in notes.md, then implement changes only inside ${folder}/.

Rules:
${playgroundRulesBlock()}`
}

export function buildEditCursorPrompt(entry: PlaygroundEntry): string {
  const experiment = parseExperimentId(entry.id)
  if (!experiment) {
    throw new Error(`Entry is not an experiment: ${entry.id}`)
  }

  const folder = `src/experiments/${experiment.owner}/${experiment.slug}`
  const sourceScenarioId = getSourceScenarioId(entry)

  return `Continue work on the "${entry.title}" experiment in Console Prototype Lab.

Experiment folder: ${folder}/
Registry id: ${entry.id}
Source scenario: ${sourceScenarioId}
Preview route: ${entry.route}

Goal:
Read notes.md first, then implement design changes only inside ${folder}/.

Rules:
${playgroundRulesBlock()}`
}

export function buildCursorPrompt(
  entry: PlaygroundEntry,
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

export function suggestExperimentSlug(entry: PlaygroundEntry): string {
  if (entry.id.startsWith('experiment/')) {
    const parsed = parseExperimentId(entry.id)
    return parsed?.slug ?? slugify(entry.title)
  }
  return slugify(entry.title)
}

export function ownerNameFromSlug(slug: string): DesignTeamOwner | '' {
  const match = DESIGN_TEAM_OWNERS.find((name) => slugify(name) === slug)
  return match ?? ''
}

export function suggestOwnerSlug(entry: PlaygroundEntry): string {
  const stored = getStoredOwnerSlug()
  if (stored) return stored

  const parsed = parseExperimentId(entry.id)
  if (parsed) return parsed.owner

  return ownerSlugFromDisplayName(entry.owner)
}

export function suggestOwnerName(entry: PlaygroundEntry): DesignTeamOwner | '' {
  return ownerNameFromSlug(suggestOwnerSlug(entry))
}
