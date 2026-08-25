# Console Homepage experiment brief: first-project empty home

> **Experiment variant:** `homepage-v4` (`Homepage V4`) — first-time empty homepage. A new user has an organization and one empty project, and needs a clear first action. `homepage-v1`–`v3` stay unchanged for comparison (operational / posture-led homes).

## Problem

Homepage V1–V3 assume the org already has projects and services. A first-time user landing on Home sees operational chrome (health, insights, product updates) before they have anything to operate.

The current empty-project experience lives on the services list (`No services yet`), not on Home — so Home is not a useful starting point.

## Hypothesis

If Home welcomes the user, offers three first actions (service, app, MCP), shows the empty project, and spells out what happens next, first-time users will create a resource from Home instead of hunting through navigation.

## Design → Aquarium mapping

| Mock region | Aquarium | Why this, not a custom surface |
| --- | --- | --- |
| “Welcome to Aiven Platform, Elena” | `PageHeader` + subtitle | Standard page title region |
| “Create your first resource” panel | `Card` wrapping three `Card`s | Raised group of related first actions |
| Service / app / MCP tiles | `Card` + `Button.Primary` / `Button.Secondary` | Card action slots render Secondary + Ghost, not Primary |
| Colored icon tiles | `Icon` on token background (`primary` / `info` / `success`) | `Card.icons` is 32px images only — no tone tile |
| “Your project” heading | `Section` | Titled page region, not a raised action surface |
| Empty project row | `Card` + `StatusChip` + `Button.Secondary` | Single summary row, not a sortable `DataList` |
| Getting started list | Prototype steps inside a `Card` titled “Get started with Aiven Platform” | `Stepper` is horizontal / wizard-only |
| “Current” / “Next” | `Typography` | Not status of a resource — skip `StatusChip` |
| “What happens next?” | `Card` + `Link` | Raised help surface with external docs links |
| “Learn about Aiven” | `Section` `collapsible` + `Link` | Collapsible titled region; `Link` with `linkExternal` |
| Right column | `HomeRightColumn` from homepage-v5 | Same Developer tools + Product updates rail as V5 |

## Out of scope

- Populated-home / posture insights (V1–V3)
- Real create-service, deploy-app, or MCP setup flows
- Org-wide empty state when the user has no project yet

## Non-goals

- No production integration
- No change to global scenario runtime or shared shell behavior
