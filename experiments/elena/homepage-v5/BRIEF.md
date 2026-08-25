# Console Homepage experiment brief: org operational home

> **Experiment variant:** `homepage-v5` (`Homepage V5`) — org-level operational homepage. Layout follows `homepage-v2` (ConsoleHeader, OrgSidebar, main column + sticky MCP and product-updates rail), with greeting, projects/resources plus last invoice and users cards, recent projects, attention needed, and reliability. The right column is `HomeRightColumn`, also used by `homepage-v4`. `homepage-v1`–`v3` stay unchanged for comparison.

## Problem

V2 keeps posture insights in a per-project health block with a sticky MCP/updates rail. A fleet-scale org home needs a greeting, org metrics, recent projects as rows, a filterable attention list, and reliability in the main column — without inventing custom chrome.

## Hypothesis

If Home uses Aquarium page, list, and promo primitives for this org layout, users can scan fleet health and act on attention items without a custom dashboard kit, and the experiment stays comparable to V2’s information architecture.

## Design → Aquarium mapping

| Mock region | Aquarium | Why this, not a custom surface |
| --- | --- | --- |
| “Good morning, Irene” | `PageHeader` + subtitle | Standard page title region |
| “Developer tools” | `Typography.LargeStrong` | Right-rail subheader above MCP, same type as Product updates |
| “Build with Aiven MCP” | `Banner` outlined + image + Get started | Promo in the V2 right rail — `Card.primaryAction` is Secondary dense |
| CLI quick start | `Banner` outlined + `CodeSmall` + `$` prompt + copy | Same outlined Banner as MCP; Aquarium has no CodeBlock |
| Projects / Resources | `Card` + `Typography.LargeHeading` | Fleet counts. Aquarium has no StatCard |
| Last invoice | `Card` + `StatusChip` + `Link` | Replaces Need attention KPI — amount, period, Paid, View invoice |
| Users | `Card` + `Button.Ghost` dense | Replaces Updates available KPI — count with Add user CTA. `Card.primaryAction` is Secondary dense |
| Colored metric glyphs | `Icon` on token background | `Card.icons` is 32px images only — no tone tile |
| “Recent projects” | `Section` + subtitle + `View all projects` action | Titled region with supporting copy and a secondary action |
| Project rows | `DataList` `hideHeader` | Multi-row list, no column headers in the mock |
| PostgreSQL / Agent / MCP chips | `Chip` dense | Service type labels beside Resources, not under the project name |
| Healthy / Paid / 1 update / 1 issue | `StatusChip` | Resource health and last invoice Paid |
| Overlapping service logos | Prototype `ServiceIconStack` | `Card.icons` crops logos as 32px avatars |
| “Attention needed” | `Section` | Titled region, not a raised action surface |
| Search | `SearchInput` | Search field, not `InputBase` chrome |
| All / Incidents / EOL / … | `ChoiceChip` dense in `ChoiceChipGroup` | Category filter aligned with `SearchInput`; not Tabs |
| Attention rows | `DataList` `hideHeader` | Actionable list; `Alert` is page-level, not a list |
| Review / Configure buttons | `Button.Ghost` dense | Teal outlined row actions — Secondary is too muted for this mock |
| Reliability overview | `Card` | Raised summary, not a coverage table |
| “Product updates” + RSS Feed | `Typography.LargeStrong` + `Link` | Right-column section header under MCP, not a Card title |
| Service filter | `Select` | Service-specific changelog — mock used ChoiceChip; Select is the DS dropdown |
| Update rows | Bordered `Box` + `Divider` + `Typography` | Date // service, then title. Preview is 3 items for the selected service. `Link` would teal the headlines |
| View all (N) | `Link` | Count of matching notes for the selected service |
| Documentation / Ask AI | `Link` + `Icon` | External help destinations |

## Out of scope

- Per-project posture drill-down from V1–V3
- First-project empty home from V4
- Real create-service, MCP setup, or upgrade flows

## Non-goals

- No production integration
- No change to global scenario runtime or shared shell behavior
