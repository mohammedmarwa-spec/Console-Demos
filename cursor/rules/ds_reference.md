# Design System reference

This document provides the AI with the specific entry points for our Figma Design System.

## Critical File Links
- **Aquarium UI Library (Figma):** https://www.figma.com/design/3qYM1KjFtzlqq6ddBpFUtB/App-UI---Templates--WIP-?node-id=0-1&t=Xe81lpfP9pCysEeE-1
  - `fileKey = 3qYM1KjFtzlqq6ddBpFUtB`
- **Icon Library (Figma):** https://www.figma.com/design/2pRI39z7PZ39vrZ0uvJGLJ/Icon-library?node-id=181-128951
  - `fileKey = 2pRI39z7PZ39vrZ0uvJGLJ`
- **Console Header / Service logos:** https://www.figma.com/design/3qYM1KjFtzlqq6ddBpFUtB/App-UI---Templates--WIP-?node-id=0-1&t=Xe81lpfP9pCysEeE-1
- **Aquarium Storybook (live component reference):** https://aquarium.aiven.io

## Component Naming Conventions
- Components in Figma are named using the pattern: `Category/ComponentName` (e.g. `Inputs/Button`, `Data display/TagLabel`)
- Never rename DS component instances — use `figma_update_component_properties` to change variants only
- All Aquarium component names match the Storybook `storybook_list_components` IDs exactly

## Layout Standards
- **Grid:** 8px Base Unit — all spacing and sizing must be multiples of 8
- **Breakpoints:** Mobile (375px), Tablet (768px), Desktop (1440px)
- **Default Padding:** Container padding is always 24px on Desktop
- **Column layout:** Left content column ~984px, Right sidebar 456px (total 1440px)
- **Inner content width:** Left col inner = 984 − 48 (padding) = **936px**
- **Sidebar inner width:** 456 − 48 (padding) = **408px**

## Token & Color Rules
- Never use hex codes directly — always apply design tokens via `figma_set_variable_on_node`
- Use `figma_get_variables` to discover token IDs before applying fills or strokes
- Typography must use defined Text Styles only — never override font-family/size manually
