#!/usr/bin/env node
/**
 * Capture hub card preview screenshots for all playground entries.
 *
 * Usage:
 *   npm run dev          # in another terminal
 *   npm run capture-previews
 *
 * Env:
 *   PREVIEW_BASE_URL   default http://localhost:5173
 *   PREVIEW_ONLY       comma-separated entry ids to capture (optional)
 */

import { mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { REUSABLE_SCENARIOS, PROTOTYPE_SCENARIOS } from '../src/registry/scenarios.ts'
import caioOwnershipTest from '../src/experiments/caio/ownership-test/prototype.config.ts'
import elenaShorterCreateService from '../src/experiments/elena/shorter-create-service/prototype.config.ts'
import { previewIdForEntry, slugifyPreviewId } from '../src/lib/prototypePreview.ts'

const PLAYGROUND_ENTRIES = [
  ...REUSABLE_SCENARIOS,
  ...PROTOTYPE_SCENARIOS,
  caioOwnershipTest,
  elenaShorterCreateService,
]

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'previews')
const BASE_URL = process.env.PREVIEW_BASE_URL ?? 'http://localhost:5173'
const THEME_STORAGE_KEY = 'design-police-playground:aquarium-appearance'

const VIEWPORT = { width: 1280, height: 800 }
const CLIP = { x: 0, y: 0, width: 1280, height: 450 }
const STYLE_WAIT_TIMEOUT_MS = 45_000

/** Console paths used when experiment launcher routes via runtimeKey. */
const RUNTIME_CAPTURE_PATHS = {
  'onboarding-test-env': '/console/onboarding/test-env',
  'empty-state': '/console/project/services',
  'existing-customer': '/console/project/services',
  'many-services': '/console/project/services',
  'onboarding-playground': '/console/onboarding/playground',
  'mysql-acu-rollout': '/console/project/services',
  'invoice-mixed-services': '/console/billing',
  'invoice-plan-acumixed': '/console/billing',
  'replica-mixed-pricing': '/console/project/services',
  'free-dev-upgrade-v2': '/console/project/services',
  'free-dev-upgrade-v3': '/console/project/services',
  'free-dev-upgrade-v4': '/console/project/services',
  'deeptrace-demo': '/console/project/services/pg-deeptrace-demo',
}

/** Per-route wait hints when styled UI is not enough. */
const ROUTE_WAIT_SELECTORS = {
  '/console/billing': 'text=Billing',
  '/console/project/services/pg-deeptrace-demo': 'text=Logs',
}

function outputPathForEntry(entry) {
  const slug = slugifyPreviewId(previewIdForEntry(entry))
  return join(OUT_DIR, `${slug}.png`)
}

function entriesToCapture() {
  const only = process.env.PREVIEW_ONLY?.split(',').map((s) => s.trim()).filter(Boolean)
  if (!only?.length) return PLAYGROUND_ENTRIES

  const wanted = new Set(only)
  return PLAYGROUND_ENTRIES.filter((e) => wanted.has(e.id))
}

function captureUrlForEntry(entry) {
  const base = BASE_URL.replace(/\/$/, '')
  let path = entry.route.startsWith('/') ? entry.route : `/${entry.route}`

  if (entry.id.startsWith('experiment/')) {
    const runtimePath = RUNTIME_CAPTURE_PATHS[entry.runtimeKey]
    if (!runtimePath) {
      throw new Error(`No capture path mapped for runtimeKey: ${entry.runtimeKey}`)
    }
    path = `${runtimePath}?scenario=${encodeURIComponent(entry.id)}`
  }

  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

async function hideChrome(page) {
  await page.evaluate(() => {
    document.querySelector('.scenario-panel')?.remove()
    document.querySelector('.scenario-trigger')?.remove()
    document.querySelector('.prototype-banner')?.remove()
  })
}

/** Wait until Aquarium CSS, dark theme, and client hydration have applied. */
async function waitForStyledPage(page) {
  await page.waitForFunction(
    () => {
      const html = document.documentElement
      const body = document.body
      if (!body) return false

      const font = getComputedStyle(body).fontFamily.toLowerCase()
      const bg = getComputedStyle(body).backgroundColor
      const hasTheme = html.classList.contains('aquarium-theme-dark')
      const hasAquariumUi =
        document.querySelector(
          '.Aquarium-Button, .Aquarium-Card, nav.Aquarium-Navigation, .Aquarium-Typography',
        ) !== null
      const stylesheetsLoaded = [...document.styleSheets].some((sheet) => {
        try {
          return sheet.cssRules.length > 0
        } catch {
          return Boolean(sheet.href)
        }
      })
      const notTimes = !font.includes('times')
      const notWhiteBg = bg !== 'rgb(255, 255, 255)' && bg !== 'white'

      return hasTheme && stylesheetsLoaded && notTimes && notWhiteBg && hasAquariumUi
    },
    undefined,
    { timeout: STYLE_WAIT_TIMEOUT_MS },
  )

  await page.evaluate(() => document.fonts?.ready)
  await page.waitForTimeout(300)
}

async function waitForRoute(page, route) {
  const path = route.split('?')[0]
  const selector = Object.entries(ROUTE_WAIT_SELECTORS).find(([prefix]) => path.startsWith(prefix))?.[1]
  if (selector) {
    await page.waitForSelector(selector, { timeout: 15_000 }).catch(() => {})
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const entries = entriesToCapture()
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: 'dark',
  })
  await context.addInitScript((key) => {
    localStorage.setItem(key, 'dark')
    document.documentElement.classList.add('aquarium-theme-dark')
  }, THEME_STORAGE_KEY)

  const page = await context.newPage()

  // Warm up dev server + CSS bundles before capturing routes.
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60_000 })
  await waitForStyledPage(page).catch(() => {})

  let captured = 0
  let failed = 0
  const skipped = []

  for (const entry of entries) {
    const outPath = outputPathForEntry(entry)
    const url = captureUrlForEntry(entry)

    try {
      const response = await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status() ?? 'no response'}`)
      }
      await waitForStyledPage(page)
      await hideChrome(page)
      await waitForRoute(page, entry.route)
      await page.screenshot({ path: outPath, clip: CLIP, type: 'png' })
      captured++
      console.log(`✓ ${entry.id} → ${outPath.replace(ROOT, '')}`)
    } catch (error) {
      failed++
      console.error(`✗ ${entry.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  await browser.close()

  // Deduplicate alias targets — note when alias shares preview file
  for (const entry of entries) {
    if (entry.aliasOf) {
      const aliasPath = outputPathForEntry(entry)
      const sourcePath = join(OUT_DIR, `${slugifyPreviewId(entry.aliasOf)}.png`)
      if (existsSync(sourcePath) && aliasPath !== sourcePath && !existsSync(aliasPath)) {
        skipped.push(entry.id)
      }
    }
  }

  console.log(`\nDone: ${captured} captured, ${failed} failed`)
  if (skipped.length) {
    console.log(`Aliases reuse source previews: ${skipped.join(', ')}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
