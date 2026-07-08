# Workspace ownership during test environment setup

**Owner:** Caio  
**Source scenario:** `onboarding-test-env` (Create test environment)  
**Status:** Rough experiment

## Hypothesis

Making workspace ownership explicit during test environment creation (personal vs organization) will reduce post-signup confusion about billing responsibility and who can manage the project.

The reusable scenario shows `Acme Corp` with a `Personal` sublabel — an ambiguous mix. This experiment tests whether an upfront **Workspace ownership** choice plus a summary sidebar clarifies intent before the user provisions their first service.

## What changed

- Added **Workspace ownership** section with two checkable cards: Personal workspace vs Acme Corp (organization)
- Project name helper text updates based on the selected workspace
- Summary sidebar includes a **Workspace** block: organization, owned-by, and billing notes
- Kept the Console onboarding shell, service catalog, free-tier pricing, and create flow from the base scenario
- Reused mock labels from `src/mocks/console-context.ts`

## Files

| File | Purpose |
|------|---------|
| `OwnershipTestEnv.tsx` | Experiment UI (fork of test-env onboarding with ownership controls) |
| `OwnershipTestEnvPage.tsx` | Wires experiment UI to playground state |
| `workspaceOptions.ts` | Mock workspace ownership options |
| `experimentView.ts` | Export for registry view map |

## How to preview

```bash
npm run dev
```

Open `/experiments/caio/ownership-test` or select **Ownership Test** in the scenario panel (Shift+S).

## Rules

- Modify only this experiment folder for design iterations
- Do not edit the reusable `onboarding-test-env` scenario
