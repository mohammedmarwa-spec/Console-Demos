'use client'

import { useState } from 'react'
import { Box, Button, Input, Modal, Select } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { aquariumSelectValue } from '@/lib/aquariumSelect'

export const pageMeta: PageMeta = {
  title: 'Centered modal',
  description: 'Blank page with a centered modal containing three inputs and two selects.',
}

const ENVIRONMENT_OPTIONS = [
  { label: 'Development', value: 'development' },
  { label: 'Staging', value: 'staging' },
  { label: 'Production', value: 'production' },
]

const REGION_OPTIONS = [
  { label: 'Europe', value: 'europe' },
  { label: 'United States', value: 'united-states' },
  { label: 'Asia Pacific', value: 'asia-pacific' },
]

export default function Page() {
  const [open, setOpen] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [environment, setEnvironment] = useState(ENVIRONMENT_OPTIONS[0]!.value)
  const [region, setRegion] = useState(REGION_OPTIONS[0]!.value)

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 48px)',
        minHeight: 0,
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      {!open && (
        <Button.Primary type="button" onClick={() => setOpen(true)}>
          Open modal
        </Button.Primary>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="md"
        title="Create resource"
        subtitle="Fill in the details below."
        primaryAction={{
          text: 'Create',
          onClick: () => setOpen(false),
        }}
        secondaryActions={{ text: 'Cancel', onClick: () => setOpen(false) }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            labelText="Name"
            placeholder="Resource name"
            reserveSpaceForError={false}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            labelText="Email"
            placeholder="name@example.com"
            reserveSpaceForError={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            labelText="Description"
            placeholder="Optional description"
            reserveSpaceForError={false}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            labelText="Environment"
            options={ENVIRONMENT_OPTIONS}
            value={environment}
            reserveSpaceForError={false}
            onChange={(selected) => setEnvironment(aquariumSelectValue(selected, environment))}
          />
          <Select
            labelText="Region"
            options={REGION_OPTIONS}
            value={region}
            reserveSpaceForError={false}
            onChange={(selected) => setRegion(aquariumSelectValue(selected, region))}
          />
        </Box>
      </Modal>
    </Box>
  )
}
