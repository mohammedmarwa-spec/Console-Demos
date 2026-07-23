#!/usr/bin/env node
/**
 * Guard experiment PRs: only one known owner folder (+ matching previews).
 * Blocks experiments/_templates on all PRs.
 * When a PR touches experiments/<owner>/ or public/experiment-previews/,
 * it must stay scoped to a single known owner (no _shared, src/, etc.).
 * Pure infra/docs PRs (no experiment paths) pass without a label.
 *
 * Escape hatch: ALLOW_SHARED_PATHS=1 or PR label allow-shared-paths.
 *
 * Usage:
 *   BASE_REF=main node scripts/check-experiment-pr-scope.mjs
 *   ALLOW_SHARED_PATHS=1 node scripts/check-experiment-pr-scope.mjs
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OWNERS_FILE = join(ROOT, 'src/data/design-team-owners.json')

const allowShared =
  process.env.ALLOW_SHARED_PATHS === '1' || process.env.ALLOW_SHARED_PATHS === 'true'

const baseRef = process.env.BASE_REF || process.env.GITHUB_BASE_REF || 'main'
const base = baseRef.startsWith('origin/') ? baseRef : `origin/${baseRef}`

function loadKnownOwners() {
  return new Set(Object.keys(JSON.parse(readFileSync(OWNERS_FILE, 'utf8'))))
}

function gitLines(args) {
  const out = execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function listChangedFiles() {
  try {
    // CI / committed PR range
    const committed = gitLines(['diff', '--name-only', `${base}...HEAD`])

    // Local dry-run: also include working tree + untracked (designers often check before commit)
    if (process.env.GITHUB_ACTIONS === 'true') {
      return committed
    }

    const vsBase = gitLines(['diff', '--name-only', base])
    const untracked = gitLines(['ls-files', '--others', '--exclude-standard'])
    return [...new Set([...committed, ...vsBase, ...untracked])].sort()
  } catch (err) {
    console.error(`Failed to diff against ${base}.`)
    console.error('Fetch the base branch first, e.g. `git fetch origin main`.')
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

function isExperimentSurface(file) {
  return (
    file.startsWith('experiments/') || file.startsWith('public/experiment-previews/')
  )
}

function classifyExperimentPath(file, knownOwners) {
  if (file.startsWith('experiments/_templates/')) {
    return { kind: 'blocked', reason: 'templates must not change on experiment PRs' }
  }
  if (file.startsWith('experiments/_shared/')) {
    return {
      kind: 'blocked',
      reason: 'shared experiment code — use a separate PR with allow-shared-paths',
    }
  }
  if (file.startsWith('experiments/')) {
    const owner = file.split('/')[1]
    if (!owner) {
      return { kind: 'blocked', reason: 'invalid experiments/ path' }
    }
    if (!knownOwners.has(owner)) {
      return {
        kind: 'blocked',
        reason: `"${owner}" is not a known owner (see src/data/design-team-owners.json)`,
      }
    }
    return { kind: 'owner', owner }
  }
  if (file.startsWith('public/experiment-previews/')) {
    const owner = file.split('/')[2]
    if (!owner) {
      return { kind: 'blocked', reason: 'invalid experiment-previews path' }
    }
    if (!knownOwners.has(owner)) {
      return {
        kind: 'blocked',
        reason: `preview owner "${owner}" is not a known owner`,
      }
    }
    return { kind: 'owner', owner }
  }
  return {
    kind: 'blocked',
    reason: 'outside owner experiment scope — split shared changes or use allow-shared-paths',
  }
}

function main() {
  if (allowShared) {
    console.log('ALLOW_SHARED_PATHS is set — skipping experiment path scope check.')
    process.exit(0)
  }

  const knownOwners = loadKnownOwners()
  const files = listChangedFiles()

  if (files.length === 0) {
    console.log(`No changed files vs ${base}.`)
    process.exit(0)
  }

  const templateHits = files.filter((f) => f.startsWith('experiments/_templates/'))
  if (templateHits.length > 0) {
    console.error('Experiment PR scope check failed:\n')
    for (const file of templateHits) {
      console.error(`  Blocked: ${file} — templates must not change without allow-shared-paths`)
    }
    console.error('\nMaintainer escape hatch: PR label `allow-shared-paths` or ALLOW_SHARED_PATHS=1.')
    process.exit(1)
  }

  const experimentFiles = files.filter(isExperimentSurface)
  if (experimentFiles.length === 0) {
    console.log(
      `OK: ${files.length} file(s) changed vs ${base}, none under experiments/ or experiment-previews — scope check skipped.`,
    )
    process.exit(0)
  }

  const errors = []
  const owners = new Set()

  for (const file of files) {
    if (!isExperimentSurface(file)) {
      errors.push(
        `Blocked: ${file} — experiment PRs may not mix in shared/app paths (use a separate PR or allow-shared-paths)`,
      )
      continue
    }
    const result = classifyExperimentPath(file, knownOwners)
    if (result.kind === 'blocked') {
      errors.push(`Blocked: ${file} — ${result.reason}`)
      continue
    }
    owners.add(result.owner)
  }

  if (owners.size > 1) {
    errors.push(
      `Blocked: PR touches multiple owners (${[...owners].sort().join(', ')}) — one owner per PR`,
    )
  }

  if (errors.length > 0) {
    console.error('Experiment PR scope check failed:\n')
    for (const line of errors) console.error(`  ${line}`)
    console.error('\nFix: keep changes under experiments/<your-owner>/<slug>/ only.')
    console.error(
      'Maintainer escape hatch: add PR label `allow-shared-paths` or run with ALLOW_SHARED_PATHS=1.',
    )
    process.exit(1)
  }

  const owner = [...owners][0]
  console.log(`OK: ${files.length} file(s) scoped to owner "${owner}" (vs ${base}).`)
}

main()
