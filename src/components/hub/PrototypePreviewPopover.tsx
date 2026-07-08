'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Typography } from '@aivenio/aquarium'
import type { PlaygroundEntry } from '../../registry/types'
import { checkPreviewImageAvailable, getPrototypePreviewUrl } from '../../lib/prototypePreview'

const PREVIEW_WIDTH = 640
const PREVIEW_HEIGHT = 360
const OPEN_DELAY_MS = 250
const CLOSE_DELAY_MS = 120

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

type PrototypePreviewPopoverProps = {
  entry: PlaygroundEntry
  children: ReactNode
}

export function PrototypePreviewPopover({ entry, children }: PrototypePreviewPopoverProps) {
  const previewUrl = getPrototypePreviewUrl(entry)
  const reducedMotion = usePrefersReducedMotion()
  const openDelay = reducedMotion ? 0 : OPEN_DELAY_MS

  const [open, setOpen] = useState(false)
  const [imageAvailable, setImageAvailable] = useState<boolean | null>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const updatePlacement = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    setPlacement(spaceAbove >= PREVIEW_HEIGHT + 16 || spaceAbove >= spaceBelow ? 'top' : 'bottom')
  }, [])

  const scheduleOpen = useCallback(() => {
    clearTimers()
    openTimerRef.current = setTimeout(() => {
      updatePlacement()
      setOpen(true)
      if (imageAvailable === null) {
        void checkPreviewImageAvailable(previewUrl).then(setImageAvailable)
      }
    }, openDelay)
  }, [clearTimers, imageAvailable, openDelay, previewUrl, updatePlacement])

  const scheduleClose = useCallback(() => {
    clearTimers()
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }, [clearTimers])

  const handlePointerEnter = useCallback(() => {
    scheduleOpen()
  }, [scheduleOpen])

  const handlePointerLeave = useCallback(() => {
    scheduleClose()
  }, [scheduleClose])

  useEffect(() => clearTimers, [clearTimers])

  const showImage = imageAvailable === true
  const showPlaceholder = open && imageAvailable === false

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'block', height: '100%' }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      {open && (
        <Box
          role="tooltip"
          aria-live="polite"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(placement === 'top'
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
            zIndex: 20,
            borderRadius: 8,
            border: '1px solid var(--aquarium-border-color-muted)',
            backgroundColor: 'var(--aquarium-background-color-layer)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          {showImage && (
            <img
              src={previewUrl}
              alt={`Preview of ${entry.title}`}
              role="img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}
          {showPlaceholder && (
            <Box
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                textAlign: 'center',
                backgroundColor: 'var(--aquarium-background-color-muted)',
              }}
            >
              <Typography.Small color="muted">Preview coming soon</Typography.Small>
            </Box>
          )}
          {open && imageAvailable === null && (
            <Box
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--aquarium-background-color-muted)',
              }}
              aria-hidden
            />
          )}
        </Box>
      )}
    </div>
  )
}

PrototypePreviewPopover.displayName = 'PrototypePreviewPopover'
