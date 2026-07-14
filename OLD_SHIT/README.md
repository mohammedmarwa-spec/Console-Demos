# OLD_SHIT

Files removed from active use during the July 2026 architecture cleanup. Nothing here is imported by the app, experiments, or console routes. The folder is excluded from `tsconfig.json` so TypeScript does not type-check archived files during `next build`.

## Restore a file

```bash
git mv OLD_SHIT/<original-path> <original-path>
```

Then restore any imports that referenced it.

## Moved items

| Original path | Reason |
| --- | --- |
| `src/stories/` | Storybook scaffold — no `.storybook/` config in this repo, zero importers *(already absent from working tree at sweep time)* |
| `src/App.css` | Legacy Vite app stylesheet — no importers |
| `src/screens/EditService.tsx` | Unused screen — excluded from tsconfig, zero importers |
| `src/assets/aiven-console-logo.svg` | Unused asset |
| `src/assets/cloud-aws-smile.svg` | Unused asset |
| `src/assets/cloud-aws-vector.svg` | Unused asset |
| `src/assets/create-kafka-service.png` | Unused asset |
| `src/assets/react.svg` | Unused Vite scaffold asset |
| `src/assets/icons/aws-chip.svg` | Unused asset |
| `src/assets/icons/aws-logo.svg` | Unused asset |
| `src/assets/icons/gcp-chip.svg` | Unused asset |
| `src/assets/icons/digital-ocean.svg` | Unused asset |
| `src/assets/icons/aiven-crab.svg` | Unused asset |
| `src/assets/service-icons/aiven-apps.png` | Unused service icon |
| `src/assets/service-icons/aiven-apps-blk.png` | Unused service icon |
| `src/assets/service-icons/datahub.png` | Unused service icon |
| `src/assets/service-icons/datahub-blk.png` | Unused service icon |
| `src/assets/upgrade-plan-illus/developer-icon.svg` | Unused illustration |
| `src/assets/upgrade-plan-illus/hobbyist-icon.svg` | Unused illustration |
| `src/assets/upgrade-plan-illus/startup-icon.svg` | Unused illustration |
| `aiven-services.md` | Orphan markdown — no references in repo |
| `tsconfig.app.json` | Vite-era config — not referenced by Next/Vitest |
| `tsconfig.node.json` | Vite-era config — self-referencing only |

## Deliberately not moved

These look prototype-adjacent but are **load-bearing** for console routes and experiments that redirect into the console:

- `src/screens/`, `src/mocks/`, `src/scenarios/`, `src/registry/`
- Non-hub `src/components/` (ServiceIcon, ConsoleHeader, etc.)
- `src/app/console/**`

Relocating those into experiments is a separate future effort (requires the `experiments/_shared/` migration to land first).

Also left in place: `src/App.tsx`, `src/test/ConsoleTestApp.tsx`, `src/test/read-replica.test.tsx` (test harness), `.venv-avatars/` (avatar processing script).

## Deleted outright (not in OLD_SHIT)

Screenshot / preview pipeline removed in the same cleanup:

- `src/lib/prototypePreview.ts`
- `scripts/capture-prototype-previews.mjs`
- `src/components/hub/PrototypePreviewPopover.tsx`
- `src/test/prototype-preview.test.ts`
- `public/previews/`
- `capture-aiven-page.mjs`
- `vitest.shims.d.ts`
