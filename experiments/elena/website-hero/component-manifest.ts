import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      storybookUrl: aquariumStorybookLinks.Box,
      usage: 'Page shell, scrim, header, hero, and partner-bar layout containers',
    },
    {
      name: 'Icon',
      storybookUrl: aquariumStorybookLinks.Icon,
      usage: 'Aiven crab mark, nav chevrons, account, and search',
    },
    {
      name: 'Typography',
      storybookUrl: aquariumStorybookLinks.Typography,
      usage: 'Hero supporting copy at Typography.Default',
    },
  ],
  prototypeComponents: [
    {
      name: 'WebsiteHero',
      reason: 'Marketing landing layout — Aiven copy overlaid on an isometric hive; not a Console screen',
    },
    {
      name: 'MorphingShapesCanvas',
      reason:
        'True 2:1 isometric hive: raised human cylinders, agent boxes, axis-routed links, and packets in Aiven website colors',
    },
    {
      name: 'Website CTAs',
      reason:
        'Pill buttons from the website (green solid / white outline). Aquarium Button is Console-styled and does not match this marketing treatment.',
    },
  ],
  notes: [
    'Custom-UI experiment. Aiven.io hero with an isometric hive background (humans ↔ agents); does not launch a Console scenario.',
    'Isometric accents use Aiven website tokens (teal, purple, green, yellow, light blue) on near-black.',
    'Storybook MCP was queried for Box, Typography, Button, Link, and Icon before the original implementation. Website CTAs stay custom.',
  ],
}
