#!/usr/bin/env node
/**
 * Scaffold a new experiment by copying a template or another experiment folder.
 *
 * Usage:
 *   node scripts/create-experiment.mjs --owner elena --name my-experiment --template onboarding-starter
 *   node scripts/create-experiment.mjs --owner elena --name my-experiment --from kate/homepage-v1
 */

import { cpSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EXPERIMENTS_ROOT = join(ROOT, 'experiments')
const TEMPLATES_ROOT = join(EXPERIMENTS_ROOT, '_templates')
const OWNERS_FILE = join(ROOT, 'src/data/design-team-owners.json')

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

function listAvailableTemplates() {
  if (!existsSync(TEMPLATES_ROOT)) return []
  return readdirSync(TEMPLATES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function listKnownOwnerSlugs() {
  const owners = JSON.parse(readFileSync(OWNERS_FILE, 'utf8'))
  return Object.keys(owners).sort()
}

function resolveSourceDir({ template, from }) {
  if (template && from) {
    console.error('Use either --template <templateSlug> or --from <owner>/<slug>, not both.')
    process.exit(1)
  }

  if (template) {
    const availableTemplates = listAvailableTemplates()
    if (!availableTemplates.includes(template)) {
      console.error(`Unknown template: "${template}"`)
      console.error(`Available templates: ${availableTemplates.join(', ') || '(none found)'}`)
      process.exit(1)
    }
    return {
      sourceDir: join(TEMPLATES_ROOT, template),
      sourceLabel: `template ${template}`,
    }
  }

  if (from) {
    const parts = from.split('/').filter(Boolean)
    if (parts.length !== 2) {
      console.error(`Invalid --from value: "${from}"`)
      console.error('Expected format: --from <ownerSlug>/<experimentSlug>')
      process.exit(1)
    }
    const [sourceOwner, sourceSlug] = parts
    const sourceDir = join(EXPERIMENTS_ROOT, sourceOwner, sourceSlug)
    if (!existsSync(sourceDir)) {
      console.error(`Unknown experiment source: "${from}"`)
      console.error(`Expected folder: experiments/${sourceOwner}/${sourceSlug}/`)
      process.exit(1)
    }
    return {
      sourceDir,
      sourceLabel: `experiment ${sourceOwner}/${sourceSlug}`,
    }
  }

  console.error(
    'Usage: node scripts/create-experiment.mjs --owner <ownerSlug> --name <slug> (--template <templateSlug> | --from <owner>/<slug>)',
  )
  process.exit(1)
}

const { owner, name, template, from } = parseArgs(process.argv)

if (!owner || !name) {
  console.error(
    'Usage: node scripts/create-experiment.mjs --owner <ownerSlug> --name <slug> (--template <templateSlug> | --from <owner>/<slug>)',
  )
  process.exit(1)
}

const knownOwners = listKnownOwnerSlugs()
if (!knownOwners.includes(owner)) {
  console.error(`Unknown owner slug: "${owner}"`)
  console.error(`Known owners: ${knownOwners.join(', ')}`)
  process.exit(1)
}

const { sourceDir, sourceLabel } = resolveSourceDir({ template, from })
const slug = slugify(name)
const targetDir = join(EXPERIMENTS_ROOT, owner, slug)

if (existsSync(targetDir)) {
  console.error(`Experiment folder already exists: ${targetDir}`)
  process.exit(1)
}

cpSync(sourceDir, targetDir, { recursive: true })

console.log(`Created experiment: ${owner}/${slug}`)
console.log(`Copied from: ${sourceLabel}`)
console.log(`Folder: experiments/${owner}/${slug}/`)
console.log(`Update pageMeta (title, description) in ${join('experiments', owner, slug, 'index.tsx')}`)
console.log(
  `Update component-manifest.ts (Aquarium vs prototype) — see .cursor/rules/component-map.md`,
)
console.log(`Open: /experiments/${owner}/${slug}`)
