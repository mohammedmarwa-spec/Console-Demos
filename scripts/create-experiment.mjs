#!/usr/bin/env node
/**
 * Scaffold a new experiment from a reusable scenario.
 *
 * Usage:
 *   node scripts/create-experiment.mjs --owner elena --name shorter-create-service --from onboarding-test-env
 */

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '')
    const value = argv[i + 1]
    if (key && value) args[key] = value
  }
  return args
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const { owner, name, from } = parseArgs(process.argv)

if (!owner || !name || !from) {
  console.error('Usage: node scripts/create-experiment.mjs --owner <name> --name <slug> --from <scenarioId>')
  process.exit(1)
}

const slug = slugify(name)
const experimentId = `experiment/${owner}/${slug}`
const targetDir = join(ROOT, 'src/experiments', owner, slug)
const templateDir = join(ROOT, 'src/experiments/_template')

if (existsSync(targetDir)) {
  console.error(`Experiment folder already exists: ${targetDir}`)
  process.exit(1)
}

mkdirSync(targetDir, { recursive: true })
cpSync(join(templateDir, 'notes.md'), join(targetDir, 'notes.md'))

const config = `import type { PlaygroundEntry } from '../../../registry/types'

const config: PlaygroundEntry = {
  id: '${experimentId}',
  title: '${name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}',
  description: 'Experiment based on ${from}',
  category: 'onboarding',
  type: 'prototype',
  status: 'rough',
  owner: '${owner.charAt(0).toUpperCase() + owner.slice(1)}',
  reusable: false,
  tags: ['experiment'],
  route: '/experiments/${owner}/${slug}',
  runtimeKey: '${from}',
  sourceScenarioId: '${from}',
}

export default config
`

writeFileSync(join(targetDir, 'prototype.config.ts'), config)

const notes = readFileSync(join(targetDir, 'notes.md'), 'utf8')
  .replace('**Owner:**', `**Owner:** ${owner}`)
  .replace('**Source scenario:**', `**Source scenario:** \`${from}\``)
writeFileSync(join(targetDir, 'notes.md'), notes)

const experimentsFile = join(ROOT, 'src/registry/experiments.ts')
let experimentsSrc = readFileSync(experimentsFile, 'utf8')
const importLine = `import ${owner}${slug.replace(/-/g, '')} from '../experiments/${owner}/${slug}/prototype.config'`

if (!experimentsSrc.includes(importLine)) {
  experimentsSrc = experimentsSrc.replace(
    '// Run: node scripts/create-experiment.mjs',
    `import ${owner}${slug.replace(/-/g, '')} from '../experiments/${owner}/${slug}/prototype.config'\n// Run: node scripts/create-experiment.mjs`,
  )
  experimentsSrc = experimentsSrc.replace(
    'export const EXPERIMENT_ENTRIES: PlaygroundEntry[] = [',
    `export const EXPERIMENT_ENTRIES: PlaygroundEntry[] = [\n  ${owner}${slug.replace(/-/g, '')},`,
  )
  writeFileSync(experimentsFile, experimentsSrc)
}

console.log(`Created experiment: ${experimentId}`)
console.log(`Folder: src/experiments/${owner}/${slug}/`)
console.log(`Register in src/registry/experiments.ts if not auto-added.`)
console.log(`Open: /experiments/${owner}/${slug}`)
