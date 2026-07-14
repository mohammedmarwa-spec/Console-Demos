#!/usr/bin/env node
/**
 * Scaffold a new experiment by copying a template folder.
 *
 * Usage:
 *   node scripts/create-experiment.mjs --owner elena --name my-experiment --template onboarding-starter
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

const { owner, name, template } = parseArgs(process.argv)

if (!owner || !name || !template) {
  console.error(
    'Usage: node scripts/create-experiment.mjs --owner <ownerSlug> --name <slug> --template <templateSlug>',
  )
  process.exit(1)
}

const knownOwners = listKnownOwnerSlugs()
if (!knownOwners.includes(owner)) {
  console.error(`Unknown owner slug: "${owner}"`)
  console.error(`Known owners: ${knownOwners.join(', ')}`)
  process.exit(1)
}

const availableTemplates = listAvailableTemplates()
if (!availableTemplates.includes(template)) {
  console.error(`Unknown template: "${template}"`)
  console.error(`Available templates: ${availableTemplates.join(', ') || '(none found)'}`)
  process.exit(1)
}

const slug = slugify(name)
const sourceDir = join(TEMPLATES_ROOT, template)
const targetDir = join(EXPERIMENTS_ROOT, owner, slug)

if (existsSync(targetDir)) {
  console.error(`Experiment folder already exists: ${targetDir}`)
  process.exit(1)
}

cpSync(sourceDir, targetDir, { recursive: true })

console.log(`Created experiment: ${owner}/${slug}`)
console.log(`Folder: experiments/${owner}/${slug}/`)
console.log(`Update pageMeta (title, description) in ${join('experiments', owner, slug, 'index.tsx')}`)
console.log(`Open: /experiments/${owner}/${slug}`)
