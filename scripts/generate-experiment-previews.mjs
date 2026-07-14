#!/usr/bin/env node
/**
 * Capture experiment preview thumbnails with Playwright.
 *
 * Usage:
 *   node scripts/generate-experiment-previews.mjs --staged
 *   node scripts/generate-experiment-previews.mjs elena/first-time-user
 *   npm run preview:shot -- elena/first-time-user
 */

import { execSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EXPERIMENTS_ROOT = join(ROOT, 'experiments')
const PREVIEWS_ROOT = join(ROOT, 'public', 'experiment-previews')
const DEV_URL = 'http://localhost:5173'
const VIEWPORT = { width: 1280, height: 800 }
const DEVICE_SCALE_FACTOR = 2
const READY_SELECTOR = '.playground-header'
const READY_TIMEOUT_MS = 45_000
const SETTLE_MS = 1_500

const RESERVED_OWNERS = new Set(['_templates', '_shared'])

function log(message) {
  console.log(`[preview] ${message}`)
}

function warn(message) {
  console.warn(`[preview] warning: ${message}`)
}

function parseExperimentPath(filePath) {
  const match = filePath.match(/^experiments\/([^/]+)\/([^/]+)\//)
  if (!match) return null

  const [, owner, slug] = match
  if (RESERVED_OWNERS.has(owner) || owner.startsWith('_')) return null
  if (!existsSync(join(EXPERIMENTS_ROOT, owner, slug, 'index.tsx'))) return null

  return { owner, slug }
}

function listStagedExperiments() {
  let output = ''
  try {
    output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return []
  }

  const seen = new Set()
  const experiments = []

  for (const line of output.split('\n')) {
    const parsed = parseExperimentPath(line.trim())
    if (!parsed) continue

    const key = `${parsed.owner}/${parsed.slug}`
    if (seen.has(key)) continue
    seen.add(key)
    experiments.push(parsed)
  }

  return experiments
}

function listExplicitExperiments(args) {
  const experiments = []

  for (const arg of args) {
    const [owner, slug] = arg.split('/')
    if (!owner || !slug) {
      warn(`invalid experiment path "${arg}" (expected owner/slug)`)
      continue
    }

    if (RESERVED_OWNERS.has(owner) || owner.startsWith('_')) {
      warn(`skipping reserved owner "${owner}"`)
      continue
    }

    if (!existsSync(join(EXPERIMENTS_ROOT, owner, slug, 'index.tsx'))) {
      warn(`experiment not found: experiments/${owner}/${slug}/index.tsx`)
      continue
    }

    experiments.push({ owner, slug })
  }

  return experiments
}

async function isServerUp() {
  try {
    const response = await fetch(DEV_URL, { signal: AbortSignal.timeout(2_000) })
    return response.status < 500
  } catch {
    return false
  }
}

async function waitForServer(timeoutMs = 90_000) {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    if (await isServerUp()) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`dev server did not become ready at ${DEV_URL}`)
}

function startDevServer() {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  })

  child.stdout?.on('data', (chunk) => {
    const text = chunk.toString()
    if (text.includes('Ready') || text.includes('started server')) {
      log('dev server starting…')
    }
  })

  child.stderr?.on('data', (chunk) => {
    const text = chunk.toString()
    if (text.toLowerCase().includes('error')) {
      warn(text.trim())
    }
  })

  return child
}

async function stopDevServer(child) {
  if (!child || child.killed) return

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      try {
        child.kill('SIGKILL')
      } catch {
        // ignore
      }
      resolve()
    }, 5_000)

    child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })

    try {
      child.kill('SIGTERM')
    } catch {
      clearTimeout(timeout)
      resolve()
    }
  })
}

async function captureExperiment(page, { owner, slug }) {
  const route = `/experiments/${owner}/${slug}`
  const outputDir = join(PREVIEWS_ROOT, owner)
  const outputPath = join(outputDir, `${slug}.png`)

  mkdirSync(outputDir, { recursive: true })

  await page.goto(`${DEV_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: READY_TIMEOUT_MS })
  await page.waitForURL(
    (url) => url.pathname.startsWith('/experiments/') || url.pathname.startsWith('/console/'),
    { timeout: READY_TIMEOUT_MS },
  )
  await page.waitForSelector(READY_SELECTOR, { state: 'visible', timeout: READY_TIMEOUT_MS })
  await new Promise((resolve) => setTimeout(resolve, SETTLE_MS))

  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: 'png',
  })

  log(`saved ${outputPath.replace(`${ROOT}/`, '')}`)
}

async function generatePreviews(experiments) {
  if (experiments.length === 0) {
    log('no experiments to preview')
    return
  }

  let devServer = null
  let spawnedServer = false

  try {
    const { chromium } = await import('playwright')

    if (!(await isServerUp())) {
      log(`starting dev server at ${DEV_URL}`)
      devServer = startDevServer()
      spawnedServer = true
      await waitForServer()
    } else {
      log(`reusing dev server at ${DEV_URL}`)
    }

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
    })
    const page = await context.newPage()

    for (const experiment of experiments) {
      try {
        await captureExperiment(page, experiment)
      } catch (error) {
        const label = `${experiment.owner}/${experiment.slug}`
        warn(`failed to capture ${label}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    await browser.close()
  } catch (error) {
    warn(error instanceof Error ? error.message : String(error))
  } finally {
    if (spawnedServer && devServer) {
      log('stopping dev server')
      await stopDevServer(devServer)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const useStaged = args.includes('--staged')
  const explicitArgs = args.filter((arg) => arg !== '--staged')

  const experiments = useStaged
    ? listStagedExperiments()
    : listExplicitExperiments(explicitArgs)

  await generatePreviews(experiments)
}

main().catch((error) => {
  warn(error instanceof Error ? error.message : String(error))
})
