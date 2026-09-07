'use client'

import { useEffect, useRef } from 'react'
import { aivenWeb } from './colors'
import styles from './WebsiteHero.module.css'

type CellKind = 'human' | 'agent'

type Cell = {
  id: number
  kind: CellKind
  /** Isometric grid coords */
  gx: number
  gy: number
  /** Platform height in grid units */
  gz: number
  size: number
  color: string
  phase: number
}

type Link = {
  from: number
  to: number
  /** Route in grid space: along X then Y, Y then X, or curved */
  bend: 'xy' | 'yx' | 'curve'
  color: string
}

type Packet = {
  link: number
  t: number
  speed: number
  color: string
  radius: number
}

type Pt = { x: number; y: number }
type World = { x: number; y: number; z: number }

const CELL_COLORS = [
  aivenWeb.teal,
  aivenWeb.purple,
  aivenWeb.green,
  aivenWeb.yellow,
  aivenWeb.lightBlue,
  aivenWeb.deepBlue30,
]

/** Hive laid out on an isometric grid (right-weighted). */
const CELLS: Cell[] = [
  { id: 0, kind: 'human', gx: 0.4, gy: 0.2, gz: 0.35, size: 1.05, color: aivenWeb.teal, phase: 0.2 },
  { id: 1, kind: 'agent', gx: 1.6, gy: 0.1, gz: 0.55, size: 0.95, color: aivenWeb.purple, phase: 0.8 },
  { id: 2, kind: 'human', gx: 2.8, gy: 0.35, gz: 0.3, size: 1.1, color: aivenWeb.green, phase: 1.4 },
  { id: 3, kind: 'agent', gx: 4.0, gy: 0.15, gz: 0.65, size: 0.9, color: aivenWeb.yellow, phase: 0.5 },
  { id: 4, kind: 'agent', gx: 0.8, gy: 1.3, gz: 0.45, size: 1.0, color: aivenWeb.deepBlue30, phase: 1.1 },
  { id: 5, kind: 'human', gx: 2.1, gy: 1.2, gz: 0.4, size: 1.15, color: aivenWeb.lightBlue, phase: 0.3 },
  { id: 6, kind: 'agent', gx: 3.4, gy: 1.4, gz: 0.7, size: 1.0, color: aivenWeb.purple, phase: 1.7 },
  { id: 7, kind: 'human', gx: 0.2, gy: 2.5, gz: 0.25, size: 0.95, color: aivenWeb.green, phase: 0.9 },
  { id: 8, kind: 'agent', gx: 1.5, gy: 2.6, gz: 0.5, size: 1.05, color: aivenWeb.teal, phase: 1.5 },
  { id: 9, kind: 'human', gx: 2.7, gy: 2.4, gz: 0.35, size: 1.0, color: aivenWeb.yellow, phase: 0.1 },
  { id: 10, kind: 'agent', gx: 4.0, gy: 2.55, gz: 0.6, size: 1.1, color: aivenWeb.green, phase: 1.2 },
  { id: 11, kind: 'agent', gx: 2.2, gy: 3.5, gz: 0.55, size: 0.9, color: aivenWeb.purple, phase: 0.6 },
]

const LINKS: Link[] = [
  { from: 0, to: 1, bend: 'xy', color: aivenWeb.teal },
  { from: 1, to: 2, bend: 'yx', color: aivenWeb.purple },
  { from: 2, to: 3, bend: 'xy', color: aivenWeb.green },
  { from: 0, to: 4, bend: 'yx', color: aivenWeb.lightBlue },
  { from: 1, to: 5, bend: 'curve', color: aivenWeb.purple },
  { from: 2, to: 6, bend: 'yx', color: aivenWeb.green },
  { from: 3, to: 6, bend: 'xy', color: aivenWeb.yellow },
  { from: 4, to: 5, bend: 'xy', color: aivenWeb.deepBlue30 },
  { from: 5, to: 6, bend: 'curve', color: aivenWeb.teal },
  { from: 4, to: 7, bend: 'yx', color: aivenWeb.green },
  { from: 5, to: 8, bend: 'xy', color: aivenWeb.lightBlue },
  { from: 5, to: 9, bend: 'yx', color: aivenWeb.yellow },
  { from: 6, to: 10, bend: 'xy', color: aivenWeb.purple },
  { from: 7, to: 8, bend: 'curve', color: aivenWeb.teal },
  { from: 8, to: 9, bend: 'xy', color: aivenWeb.green },
  { from: 9, to: 10, bend: 'yx', color: aivenWeb.yellow },
  { from: 8, to: 11, bend: 'curve', color: aivenWeb.purple },
  { from: 9, to: 11, bend: 'xy', color: aivenWeb.green },
  { from: 10, to: 11, bend: 'yx', color: aivenWeb.teal },
]

function rgba(hex: string, alpha: number): string {
  const n = hex.replace('#', '')
  const r = Number.parseInt(n.slice(0, 2), 16)
  const g = Number.parseInt(n.slice(2, 4), 16)
  const b = Number.parseInt(n.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type IsoSpace = {
  originX: number
  originY: number
  scale: number
}

function makeIso(width: number, height: number): IsoSpace {
  const scale = Math.min(width, height) * 0.105
  return {
    originX: width * 0.5,
    originY: height * 0.14,
    scale,
  }
}

/** Classic 2:1 isometric: +x east, +y south-west on screen. */
function iso(wx: number, wy: number, wz: number, space: IsoSpace): Pt {
  return {
    x: space.originX + (wx - wy) * space.scale,
    y: space.originY + (wx + wy) * space.scale * 0.5 - wz * space.scale,
  }
}

function pathLength(points: Pt[]): number {
  let length = 0
  for (let i = 1; i < points.length; i += 1) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return length
}

function pointAlong(points: Pt[], length: number, t: number): Pt {
  const target = Math.max(0, Math.min(1, t)) * length
  let walked = 0
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    const seg = Math.hypot(dx, dy)
    if (walked + seg >= target || i === points.length - 1) {
      const local = seg < 0.0001 ? 0 : (target - walked) / seg
      return {
        x: points[i - 1].x + dx * local,
        y: points[i - 1].y + dy * local,
      }
    }
    walked += seg
  }
  return points[points.length - 1]
}

/** Build an isometric route between two cells in world space, then project. */
function linkPath(
  a: Cell,
  b: Cell,
  bend: Link['bend'],
  space: IsoSpace,
): { points: Pt[]; length: number } {
  const az = a.gz
  const bz = b.gz
  const midZ = (az + bz) / 2
  const world: World[] = []

  if (bend === 'xy') {
    world.push({ x: a.gx, y: a.gy, z: az })
    world.push({ x: b.gx, y: a.gy, z: midZ })
    world.push({ x: b.gx, y: b.gy, z: bz })
  } else if (bend === 'yx') {
    world.push({ x: a.gx, y: a.gy, z: az })
    world.push({ x: a.gx, y: b.gy, z: midZ })
    world.push({ x: b.gx, y: b.gy, z: bz })
  } else {
    const cx = (a.gx + b.gx) / 2 + (b.gy - a.gy) * 0.35
    const cy = (a.gy + b.gy) / 2 - (b.gx - a.gx) * 0.35
    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10
      const omt = 1 - t
      world.push({
        x: omt * omt * a.gx + 2 * omt * t * cx + t * t * b.gx,
        y: omt * omt * a.gy + 2 * omt * t * cy + t * t * b.gy,
        z: az + (bz - az) * t + Math.sin(t * Math.PI) * 0.12,
      })
    }
  }

  const points = world.map((w) => iso(w.x, w.y, w.z, space))
  return { points, length: pathLength(points) }
}

function drawIsoEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
}

/** Raised cylindrical human platform with isometric ellipse top. */
function drawHumanCell(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  space: IsoSpace,
  time: number,
) {
  const pulse = 0.94 + 0.06 * Math.sin(time * 1.3 + cell.phase)
  const r = 0.42 * cell.size * pulse
  const top = iso(cell.gx, cell.gy, cell.gz, space)
  const base = iso(cell.gx, cell.gy, 0, space)
  const rx = r * space.scale * 1.15
  const ry = rx * 0.5
  const rim = Math.max(4, (top.y - base.y) * 0.35 + space.scale * 0.12)

  ctx.save()

  // Side wall (cylinder band)
  ctx.fillStyle = rgba(cell.color, 0.12)
  ctx.beginPath()
  ctx.moveTo(top.x - rx, top.y)
  ctx.ellipse(top.x, top.y, rx, ry, 0, Math.PI, 0, true)
  ctx.lineTo(top.x + rx, top.y + rim)
  ctx.ellipse(top.x, top.y + rim, rx, ry, 0, 0, Math.PI, false)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = rgba(cell.color, 0.35)
  ctx.lineWidth = 1
  ctx.stroke()

  // Top face
  ctx.fillStyle = rgba(aivenWeb.black, 0.72)
  drawIsoEllipse(ctx, top.x, top.y, rx, ry)
  ctx.fill()
  ctx.strokeStyle = rgba(cell.color, 0.9)
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.strokeStyle = rgba(cell.color, 0.45)
  ctx.lineWidth = 1
  drawIsoEllipse(ctx, top.x, top.y, rx * 0.68, ry * 0.68)
  ctx.stroke()
  drawIsoEllipse(ctx, top.x, top.y, rx * 0.36, ry * 0.36)
  ctx.stroke()

  // Isometric crosshair (along projected axes)
  const ax = iso(cell.gx + r * 0.85, cell.gy, cell.gz, space)
  const bx = iso(cell.gx - r * 0.85, cell.gy, cell.gz, space)
  const ay = iso(cell.gx, cell.gy + r * 0.85, cell.gz, space)
  const by = iso(cell.gx, cell.gy - r * 0.85, cell.gz, space)
  ctx.beginPath()
  ctx.moveTo(ax.x, ax.y)
  ctx.lineTo(bx.x, bx.y)
  ctx.moveTo(ay.x, ay.y)
  ctx.lineTo(by.x, by.y)
  ctx.stroke()

  // Rotating ticks on the rim
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + time * 0.2 + cell.phase
    const ix = Math.cos(a)
    const iy = Math.sin(a)
    const p0 = iso(cell.gx + ix * r * 0.72, cell.gy + iy * r * 0.72, cell.gz, space)
    const p1 = iso(cell.gx + ix * r * 0.95, cell.gy + iy * r * 0.95, cell.gz, space)
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
  }

  ctx.fillStyle = rgba(cell.color, 0.95)
  ctx.beginPath()
  ctx.arc(top.x, top.y, 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** Raised isometric box (agent chip) with grid top. */
function drawAgentCell(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  space: IsoSpace,
  time: number,
) {
  const pulse = 0.96 + 0.04 * Math.sin(time * 1.1 + cell.phase)
  const half = 0.38 * cell.size * pulse
  const h = cell.gz

  const corners = [
    { x: cell.gx - half, y: cell.gy - half },
    { x: cell.gx + half, y: cell.gy - half },
    { x: cell.gx + half, y: cell.gy + half },
    { x: cell.gx - half, y: cell.gy + half },
  ]

  const top = corners.map((c) => iso(c.x, c.y, h, space))
  const bottom = corners.map((c) => iso(c.x, c.y, 0, space))

  ctx.save()

  // Left face
  ctx.fillStyle = rgba(cell.color, 0.1)
  ctx.beginPath()
  ctx.moveTo(top[3].x, top[3].y)
  ctx.lineTo(top[2].x, top[2].y)
  ctx.lineTo(bottom[2].x, bottom[2].y)
  ctx.lineTo(bottom[3].x, bottom[3].y)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = rgba(cell.color, 0.3)
  ctx.lineWidth = 1
  ctx.stroke()

  // Right face
  ctx.fillStyle = rgba(cell.color, 0.16)
  ctx.beginPath()
  ctx.moveTo(top[1].x, top[1].y)
  ctx.lineTo(top[2].x, top[2].y)
  ctx.lineTo(bottom[2].x, bottom[2].y)
  ctx.lineTo(bottom[1].x, bottom[1].y)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Top face
  ctx.fillStyle = rgba(aivenWeb.black, 0.75)
  ctx.beginPath()
  ctx.moveTo(top[0].x, top[0].y)
  for (let i = 1; i < 4; i += 1) ctx.lineTo(top[i].x, top[i].y)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = rgba(cell.color, 0.92)
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Inner diamond
  const inset = half * 0.55
  const inner = [
    iso(cell.gx - inset, cell.gy - inset, h, space),
    iso(cell.gx + inset, cell.gy - inset, h, space),
    iso(cell.gx + inset, cell.gy + inset, h, space),
    iso(cell.gx - inset, cell.gy + inset, h, space),
  ]
  ctx.strokeStyle = rgba(cell.color, 0.4)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(inner[0].x, inner[0].y)
  for (let i = 1; i < 4; i += 1) ctx.lineTo(inner[i].x, inner[i].y)
  ctx.closePath()
  ctx.stroke()

  // Grid dots in world space → iso
  const grid = 4
  for (let gy = 0; gy < grid; gy += 1) {
    for (let gx = 0; gx < grid; gx += 1) {
      const wx = cell.gx - inset + (gx / (grid - 1)) * inset * 2
      const wy = cell.gy - inset + (gy / (grid - 1)) * inset * 2
      const p = iso(wx, wy, h, space)
      const on = (Math.sin(time * 2.2 + gx * 1.7 + gy * 2.1 + cell.phase) + 1) * 0.5
      ctx.fillStyle = rgba(cell.color, 0.25 + on * 0.7)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.5 + on * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Axis cross on top
  const cx0 = iso(cell.gx - inset, cell.gy, h, space)
  const cx1 = iso(cell.gx + inset, cell.gy, h, space)
  const cy0 = iso(cell.gx, cell.gy - inset, h, space)
  const cy1 = iso(cell.gx, cell.gy + inset, h, space)
  ctx.strokeStyle = rgba(cell.color, 0.5)
  ctx.beginPath()
  ctx.moveTo(cx0.x, cx0.y)
  ctx.lineTo(cx1.x, cx1.y)
  ctx.moveTo(cy0.x, cy0.y)
  ctx.lineTo(cy1.x, cy1.y)
  ctx.stroke()

  ctx.restore()
}

function drawLink(ctx: CanvasRenderingContext2D, points: Pt[], color: string, dim: boolean) {
  ctx.save()
  ctx.strokeStyle = rgba(color, dim ? 0.16 : 0.48)
  ctx.lineWidth = dim ? 1 : 1.35
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.setLineDash(dim ? [3, 7] : [])
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y)
  ctx.stroke()
  ctx.restore()
}

function drawPacket(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number) {
  ctx.save()
  ctx.fillStyle = rgba(color, 0.22)
  ctx.beginPath()
  ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = rgba(color, 0.95)
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = rgba(aivenWeb.white, 0.85)
  ctx.beginPath()
  ctx.arc(x - radius * 0.25, y - radius * 0.3, radius * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function buildPackets(): Packet[] {
  const packets: Packet[] = []
  for (let i = 0; i < LINKS.length; i += 1) {
    const count = 1 + (i % 3 === 0 ? 1 : 0)
    for (let p = 0; p < count; p += 1) {
      packets.push({
        link: i,
        t: (i * 0.17 + p * 0.41) % 1,
        speed: 0.14 + (i % 5) * 0.025 + p * 0.03,
        color: CELL_COLORS[(i + p) % CELL_COLORS.length],
        radius: 2.4 + (i % 3) * 0.5,
      })
    }
  }
  for (let i = 0; i < 8; i += 1) {
    packets.push({
      link: i % LINKS.length,
      t: (0.55 + i * 0.11) % 1,
      speed: 0.16 + (i % 4) * 0.03,
      color: CELL_COLORS[(i + 2) % CELL_COLORS.length],
      radius: 2.2,
    })
  }
  return packets
}

/**
 * True isometric hive: human (cylinder) and agent (box) platforms on a 2:1
 * iso grid, with axis-aligned / curved links and moving packets.
 */
export function MorphingShapesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = media.matches
    const onMotion = () => {
      reduced = media.matches
    }
    media.addEventListener('change', onMotion)

    const packets = buildPackets()
    let frame = 0
    let running = true
    const start = performance.now()
    let last = start

    const paint = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const cssW = Math.max(1, canvas.clientWidth)
      const cssH = Math.max(1, canvas.clientHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.floor(cssW * dpr))
      const height = Math.max(1, Math.floor(cssH * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const time = reduced ? 1.8 : (now - start) / 1000
      const space = makeIso(cssW, cssH)

      ctx.fillStyle = aivenWeb.black
      ctx.fillRect(0, 0, cssW, cssH)

      const glowCenter = iso(2.4, 1.8, 0, space)
      const glow = ctx.createRadialGradient(
        glowCenter.x,
        glowCenter.y,
        30,
        glowCenter.x,
        glowCenter.y,
        Math.max(cssW, cssH) * 0.5,
      )
      glow.addColorStop(0, rgba(aivenWeb.deepBlue, 0.14))
      glow.addColorStop(0.45, rgba(aivenWeb.purple, 0.05))
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, cssW, cssH)

      // Faint isometric ground grid
      ctx.save()
      ctx.strokeStyle = rgba(aivenWeb.white, 0.04)
      ctx.lineWidth = 1
      for (let g = -1; g <= 6; g += 1) {
        const a = iso(g, -0.5, 0, space)
        const b = iso(g, 4.2, 0, space)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        const c = iso(-0.5, g, 0, space)
        const d = iso(5.0, g, 0, space)
        ctx.beginPath()
        ctx.moveTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
        ctx.stroke()
      }
      ctx.restore()

      const paths = LINKS.map((link) => ({
        link,
        ...linkPath(CELLS[link.from], CELLS[link.to], link.bend, space),
      }))

      for (const path of paths) drawLink(ctx, path.points, path.link.color, true)
      for (const path of paths) drawLink(ctx, path.points, path.link.color, false)

      for (const path of paths) {
        for (const pt of path.points) {
          ctx.fillStyle = rgba(aivenWeb.white, 0.3)
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 1.3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (!reduced) {
        for (const packet of packets) {
          packet.t = (packet.t + packet.speed * dt) % 1
        }
      }
      for (const packet of packets) {
        const path = paths[packet.link]
        const pos = pointAlong(path.points, path.length, packet.t)
        drawPacket(ctx, pos.x, pos.y, packet.color, packet.radius)
      }

      // Depth sort by isometric depth (wx + wy), then height
      const sorted = [...CELLS].sort((a, b) => a.gx + a.gy - (b.gx + b.gy) || a.gz - b.gz)
      for (const cell of sorted) {
        if (cell.kind === 'human') drawHumanCell(ctx, cell, space, time)
        else drawAgentCell(ctx, cell, space, time)
      }

      const fade = ctx.createLinearGradient(0, 0, cssW * 0.46, 0)
      fade.addColorStop(0, aivenWeb.black)
      fade.addColorStop(0.55, rgba(aivenWeb.black, 0.7))
      fade.addColorStop(1, 'rgba(5, 8, 15, 0)')
      ctx.fillStyle = fade
      ctx.fillRect(0, 0, cssW * 0.46, cssH)
    }

    paint(start)
    const loop = (now: number) => {
      if (!running) return
      paint(now)
      if (!reduced) frame = requestAnimationFrame(loop)
    }
    if (!reduced) frame = requestAnimationFrame(loop)

    const observer = new ResizeObserver(() => paint(performance.now()))
    observer.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      media.removeEventListener('change', onMotion)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}

MorphingShapesCanvas.displayName = 'MorphingShapesCanvas'
