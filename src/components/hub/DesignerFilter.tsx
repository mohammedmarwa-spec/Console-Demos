'use client'

import { useMemo } from 'react'
import { Box, Icon, Label, Tooltip } from '@aivenio/aquarium'
import peopleIcon from '@aivenio/aquarium/icons/people'
import { getOwnerDisplayName, listOwnerSlugs } from '../../lib/designTeamOwners'
import { DesignerAvatar } from './DesignerAvatar'
import styles from './DesignerFilter.module.css'

export const ALL_DESIGNERS_VALUE = 'all'

const AVATAR_SIZE = 40

export type DesignerFilterProps = {
  value: string
  onChange: (value: string) => void
}

export function DesignerFilter({ value, onChange }: DesignerFilterProps) {
  const owners = useMemo(() => listOwnerSlugs(), [])

  return (
    <Box className={styles.root}>
      <Label labelText="Designer" id="designer-filter-label" />
      <Box
        role="radiogroup"
        aria-labelledby="designer-filter-label"
        className={styles.row}
      >
        <Tooltip content="Everyone" placement="bottom" delay={100}>
          <button
            type="button"
            role="radio"
            aria-checked={value === ALL_DESIGNERS_VALUE}
            aria-label="Everyone"
            className={[styles.option, value === ALL_DESIGNERS_VALUE ? styles.selected : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(ALL_DESIGNERS_VALUE)}
          >
            <span className={`${styles.face} ${styles.faceEveryone}`}>
              <Icon icon={peopleIcon} color="muted" style={{ width: 20, height: 20 }} />
            </span>
          </button>
        </Tooltip>

        {owners.map((slug) => {
          const name = getOwnerDisplayName(slug)
          const selected = value === slug

          return (
            <Tooltip key={slug} content={`from ${name}`} placement="bottom" delay={100}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={name}
                className={[styles.option, selected ? styles.selected : ''].filter(Boolean).join(' ')}
                onClick={() => onChange(slug)}
              >
                <span className={`${styles.face} ${styles.faceAvatar}`}>
                  <DesignerAvatar ownerSlug={slug} size={AVATAR_SIZE} />
                </span>
              </button>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

DesignerFilter.displayName = 'DesignerFilter'
