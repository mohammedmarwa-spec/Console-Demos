'use client'

import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import './hub-mascot.css'

const MASCOT_HEIGHT = 90
const MASCOT_WIDTH = (91 / 100) * MASCOT_HEIGHT

export function HubMascot() {
  const [jumping, setJumping] = useState(false)

  const triggerJump = useCallback(() => {
    setJumping(true)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      triggerJump()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [triggerJump])

  return (
    <div className="hub-mascot" aria-hidden="true">
      <div className="hub-mascot__track">
        <div
          className="hub-mascot__walker"
          style={{ '--hub-mascot-width': `${MASCOT_WIDTH}px` } as CSSProperties}
        >
          <div
            className={`hub-mascot__figure${jumping ? ' hub-mascot__figure--jump' : ''}`}
            onAnimationEnd={() => setJumping(false)}
          >
            <svg
              className="hub-mascot__svg"
              viewBox="0 0 91 100"
              height={MASCOT_HEIGHT}
              width={MASCOT_WIDTH}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="hub-mascot__body"
                d="M57.4172 24.5132L77.7567 10.2873L91.3947 34.2127L69.1153 44.5L91.3947 54.7873L77.7567 78.7127L57.4172 64.4868L59.651 89H32.2573L34.4911 64.4868L14.1516 78.7127L0.454812 54.8461L22.7342 44.5588L0.454812 34.2127L14.0929 10.2873L34.4324 24.5132L32.2573 0H59.651L57.4172 24.5132Z"
                fill="#DF56F2"
              />

              <g transform="translate(26 62)">
                <g className="hub-mascot__leg hub-mascot__leg--left">
                  <path
                    d="M10.8968 0.3457C7.89676 13.0124 1.89676 38.3457 1.89676 38.3457H16.8968"
                    stroke="#B5B5B7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              </g>

              <g transform="translate(48 56)">
                <g className="hub-mascot__leg hub-mascot__leg--right">
                  <path
                    d="M10.8379 0.300594C7.83788 14.9673 1.83788 44.3006 1.83788 44.3006H16.8379"
                    stroke="#B5B5B7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              </g>

              <g className="hub-mascot__eyes">
                <g transform="translate(24 16)">
                  <ellipse cx="10" cy="16" rx="9" ry="14" fill="#FFFFFF" />
                  <g className="hub-mascot__pupil">
                    <ellipse cx="10" cy="16" rx="5.5" ry="8.5" fill="#8B5E3C" />
                    <circle cx="10" cy="16" r="3.5" fill="#1A1A1A" />
                    <circle cx="11.8" cy="13.8" r="1.6" fill="#FFFFFF" />
                  </g>
                </g>
                <g transform="translate(48 16)">
                  <ellipse cx="10" cy="16" rx="9" ry="14" fill="#FFFFFF" />
                  <g className="hub-mascot__pupil">
                    <ellipse cx="10" cy="16" rx="5.5" ry="8.5" fill="#8B5E3C" />
                    <circle cx="10" cy="16" r="3.5" fill="#1A1A1A" />
                    <circle cx="11.8" cy="13.8" r="1.6" fill="#FFFFFF" />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

HubMascot.displayName = 'HubMascot'
