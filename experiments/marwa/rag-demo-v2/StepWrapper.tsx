'use client'

import type { ReactNode } from 'react'
import { Box, Typography } from '@aivenio/aquarium'

/**
 * Step body under `Modal.Stepper`. The step `title` is already the modal heading,
 * so this only keeps the description and the content.
 */
export function StepWrapper({
  description,
  children,
}: {
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <Box.Flex flexDirection="column" gap="l2">
      {description ? <Typography.Default color="muted">{description}</Typography.Default> : null}
      {children}
    </Box.Flex>
  )
}

StepWrapper.displayName = 'StepWrapper'
