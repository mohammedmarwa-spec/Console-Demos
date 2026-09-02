# Component map

Manual, educational listing of Aquarium vs prototype UI for experiments and templates.

## When to update

When creating or editing an experiment under `experiments/<owner>/<slug>/` (or a template under `experiments/_templates/<slug>/`):

1. Create or update `component-manifest.ts` in that folder.
2. Export `componentManifest` matching `ComponentManifest` in `src/lib/experiments/types.ts`.
3. List Aquarium components used and Storybook links only when known.
4. List prototype (custom) components and reasons.
5. If custom UI replaces a likely Aquarium component, add a note.
6. Do **not** block custom UI — make DS usage visible.

## Prefer Aquarium

- Prefer Aquarium components where available (`@aivenio/aquarium`).
- **Must** query Storybook MCP (`user-aiven-storybook` / `aiven-storybook`) before using an Aquarium component. In-repo screens are not the source of truth. If the MCP is missing, stop — see `.cursor/rules/aquarium-storybook-mcp.mdc`.
- **Must** have Figma MCP (`plugin-figma-figma` / `figma`) connected for UI and DS work. If it is missing, stop — see `.cursor/rules/figma-mcp.mdc`.
- Resolve docs URLs via Storybook MCP first, then `src/lib/experiments/aquariumStorybookLinks.ts` or verified library paths.
- Never invent Storybook URLs — leave `storybookUrl` unset if unresolved.

## Scope

- Every experiment and template folder should export `component-manifest.ts` so the header map button can appear.
- **Custom-UI experiments** (UI defined in this folder): document Aquarium and prototype components used **in this folder**.
- **Thin `ExperimentPageShell` launchers** (redirect into shared console screens): document the **shared screen they open**, not an empty list. Prefer spreading a shared map from `src/lib/experiments/sharedScreenManifests.ts` and add launcher-specific notes (scenario id + any overlay/fixture differences).
- Do not auto-scan, score coverage, or block merges based on the map.

## Shared screen maps

Reusable manifests live in `src/lib/experiments/sharedScreenManifests.ts`:

| Export | Shared screen |
|--------|----------------|
| `projectServicesScreenManifest` | `src/screens/ProjectServices.tsx` |
| `billingInvoiceScreenManifest` | `src/screens/BillingInvoiceDetail.tsx` |
| `serviceOverviewScreenManifest` | `src/screens/ServiceOverview.tsx` |
| `playgroundOnboardingScreenManifest` | `src/screens/playground/*` onboarding |
| `onboardingTestEnvScreenManifest` | `src/screens/playground/OnboardingTestEnv.tsx` |

Example thin launcher:

```ts
import type { ComponentManifest } from '@/lib/experiments/types'
import { billingInvoiceScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...billingInvoiceScreenManifest,
  notes: [
    'ExperimentPageShell launcher for a billing invoice scenario.',
    'Map describes shared BillingInvoiceDetail (src/screens), not this folder.',
  ],
}
```

## File location

```txt
experiments/<owner>/<slug>/component-manifest.ts
experiments/_templates/<slug>/component-manifest.ts
```

The playground header shows a **View DS components** button when a valid manifest is available for the current experiment (including after redirect into `/console` via `fromExperiment`).
