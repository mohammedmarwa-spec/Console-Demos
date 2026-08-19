// Build-time filesystem discovery of experiments and templates.
//
// This module must only be imported from Server Components / build-time code
// (e.g. app/page.tsx, app/experiments/[owner]/[slug]/page.tsx). It uses
// node:fs and is not safe to bundle into client components.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentType } from 'react'
import type { DiscoveredPage, PageMeta } from './types'
import { getPrototypeScenarioOrNull } from '@/content/prototype-scenarios'

const EXPERIMENTS_ROOT = join(process.cwd(), 'experiments')
const PREVIEWS_ROOT = join(process.cwd(), 'public', 'experiment-previews')
const TEMPLATES_DIR = '_templates'
const RESERVED = new Set([TEMPLATES_DIR])
const PAGE_EXTENSIONS = ['tsx', 'ts']

/** Avoid re-spawning git on every homepage render during `next dev`. */
const lastCommitCache = new Map<string, string | undefined>()

function getLastCommitIso(relativePath: string): string | undefined {
  if (lastCommitCache.has(relativePath)) {
    return lastCommitCache.get(relativePath)
  }

  let iso: string | undefined
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relativePath], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    iso = out || undefined
  } catch {
    iso = undefined
  }

  lastCommitCache.set(relativePath, iso)
  return iso
}

function listSubdirectories(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function findPageFile(dir: string): string | null {
  for (const ext of PAGE_EXTENSIONS) {
    const candidate = join(dir, `index.${ext}`)
    if (existsSync(candidate)) return candidate
  }
  return null
}

/**
 * Extracts the exported `pageMeta` title/description via lightweight source
 * parsing (no module execution) — keeps discovery fast, synchronous, and
 * side-effect free even though page.tsx files import client UI.
 */
function readPageMeta(pageFilePath: string, slug: string): PageMeta {
  const source = readFileSync(pageFilePath, 'utf8')
  const titleMatch = source.match(/title:\s*(['"`])([\s\S]*?)\1/)
  const descriptionMatch = source.match(/description:\s*(['"`])([\s\S]*?)\1/)

  const parsed: PageMeta = {
    title: titleMatch?.[2] ?? '(untitled)',
    description: descriptionMatch?.[2] ?? '',
  }

  const prototype = getPrototypeScenarioOrNull(slug)
  if (!prototype) return parsed

  return {
    title: parsed.title !== '(untitled)' ? parsed.title : prototype.title,
    description: parsed.description || prototype.description,
  }
}

function previewThumbnail(ownerSlug: string, slug: string): string | undefined {
  const previewPath = join(PREVIEWS_ROOT, ownerSlug, `${slug}.png`)
  if (!existsSync(previewPath)) return undefined
  return `/experiment-previews/${ownerSlug}/${slug}.png`
}

export function discoverTemplates(): DiscoveredPage[] {
  const templatesRoot = join(EXPERIMENTS_ROOT, TEMPLATES_DIR)
  const pages: DiscoveredPage[] = []

  for (const slug of listSubdirectories(templatesRoot)) {
    const pageFile = findPageFile(join(templatesRoot, slug))
    if (!pageFile) continue

    pages.push({
      ...readPageMeta(pageFile, slug),
      id: `template/${slug}`,
      slug,
      kind: 'template',
      route: `/experiments/${TEMPLATES_DIR}/${slug}`,
      thumbnail: previewThumbnail(TEMPLATES_DIR, slug),
      updatedAt: getLastCommitIso(`experiments/${TEMPLATES_DIR}/${slug}`),
    })
  }

  return pages
}

export function discoverExperiments(): DiscoveredPage[] {
  const ownerSlugs = listSubdirectories(EXPERIMENTS_ROOT).filter(
    (name) => !RESERVED.has(name) && !name.startsWith('_'),
  )
  const pages: DiscoveredPage[] = []

  for (const ownerSlug of ownerSlugs) {
    const ownerDir = join(EXPERIMENTS_ROOT, ownerSlug)

    for (const slug of listSubdirectories(ownerDir)) {
      const pageFile = findPageFile(join(ownerDir, slug))
      if (!pageFile) continue

      pages.push({
        ...readPageMeta(pageFile, slug),
        id: `experiment/${ownerSlug}/${slug}`,
        slug,
        kind: 'experiment',
        ownerSlug,
        route: `/experiments/${ownerSlug}/${slug}`,
        thumbnail: previewThumbnail(ownerSlug, slug),
        updatedAt: getLastCommitIso(`experiments/${ownerSlug}/${slug}`),
      })
    }
  }

  return pages
}

/** Merged list of { owner, slug } pairs for generateStaticParams. */
export function discoverAllRoutes(): { owner: string; slug: string }[] {
  const templates = discoverTemplates().map((page) => ({ owner: TEMPLATES_DIR, slug: page.slug }))
  const experiments = discoverExperiments().map((page) => ({
    owner: page.ownerSlug as string,
    slug: page.slug,
  }))
  return [...templates, ...experiments]
}

/**
 * Dynamically imports the default export of the colocated index.tsx for a
 * given route. `owner` is either an owner slug or the literal `_templates`.
 */
export async function loadPage(owner: string, slug: string): Promise<ComponentType> {
  const relPath = `${owner}/${slug}`
  const mod = (await import(
    /* webpackChunkName: "experiment-[request]" */
    `../../../experiments/${relPath}/index`
  )) as { default: ComponentType }
  return mod.default
}
