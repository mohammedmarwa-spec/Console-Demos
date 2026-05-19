/**
 * Prepare Brand 2.0 service icon PNGs for the app:
 * - Strip Figma export matte (#f5f5f5)
 * - Dark variants: remove black inner fill (white logomark on muted token bg)
 * - Light (blk) variants: remove white inner fill (black logomark on muted token bg)
 */
import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'

const ICON_DIR = path.resolve('src/assets/service-icons')

function isMatte(r, g, b) {
  return (
    r >= 242 &&
    g >= 242 &&
    b >= 242 &&
    r <= 248 &&
    g <= 248 &&
    b <= 248 &&
    Math.max(r, g, b) - Math.min(r, g, b) <= 3
  )
}

/** Black circle fill in dark-mode exports (logomark stays white). */
function isDarkInnerFill(r, g, b) {
  return r >= 3 && r <= 8 && g >= 6 && g <= 11 && b >= 11 && b <= 17
}

/** White circle fill in light-mode (blk) exports (logomark stays black). */
function isLightInnerFill(r, g, b) {
  return r >= 248 && g >= 248 && b >= 248
}

function processPng(filePath, variant) {
  const png = PNG.sync.read(fs.readFileSync(filePath))
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] === 0) continue
    const r = png.data[i]
    const g = png.data[i + 1]
    const b = png.data[i + 2]
    const strip =
      isMatte(r, g, b) ||
      (variant === 'dark' ? isDarkInnerFill(r, g, b) : isLightInnerFill(r, g, b))
    if (strip) png.data[i + 3] = 0
  }
  fs.writeFileSync(filePath, PNG.sync.write(png))
}

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node scripts/process-service-icons.mjs <dark|light> <file.png> [...]')
  process.exit(1)
}

const [variant, ...files] = args
if (variant !== 'dark' && variant !== 'light') {
  console.error('Variant must be "dark" or "light"')
  process.exit(1)
}

for (const file of files) {
  const filePath = path.join(ICON_DIR, file)
  processPng(filePath, variant)
  console.log(`processed ${file} (${variant})`)
}
