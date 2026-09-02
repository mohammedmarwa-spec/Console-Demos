import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 * Update when Aquarium or prototype UI usage changes.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Blank page canvas and vertical form stack inside the modal',
    },
    {
      name: 'Button',
      usage: 'Reopen the modal from the blank page after it is dismissed',
    },
    {
      name: 'Modal',
      usage: 'Centered overlay with title, subtitle, and primary/secondary actions',
    },
    {
      name: 'Input',
      usage: 'Name, email, and description fields',
    },
    {
      name: 'Select',
      usage: 'Environment and region fields',
    },
  ],

  prototypeComponents: [],

  notes: [
    'Custom-UI experiment: blank page with a centered Aquarium modal.',
    'No Console shell — Modal is the primary surface.',
  ],
}
