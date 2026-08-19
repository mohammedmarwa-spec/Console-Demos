# Console Homepage experiment brief: project posture summary

> **Experiment variant:** `homepage-insights` — clipped Project health layout: dual insight cards (Attention required / Improve your project), Protection coverage strip, and Services requiring review table. Copied from `homepage`; original left unchanged for comparison.

## Problem

The current homepage prototype is mostly reactive. It shows services that already have alerts, but it does not summarize whether a project is configured to prevent incidents before they happen.

In the current implementation:
- `ProjectHealth` in `HomePageContent.tsx` is scoped to a selected project and renders an attention list.
- `AttentionRequiredServiceList` shows `Service`, `Status`, `Maintenance schedule`, and `Alerts/Notifications`.
- `mockData.ts` only models alert-driven rows (`HomeServiceAlert`), with no posture fields like failover coverage, public exposure, or alert destination coverage.

Result: users can see current pain, but not their preventive posture.

## Hypothesis

If we add a small, per-project posture summary on homepage using clear "N of M" coverage statements and direct drill-down to affected services, users will find and fix risky gaps faster than with alert-only views, and will trust recommendation surfaces more because they are operational and explainable.

## Primary scope (2-3 weeks, 1 FE)

Build a **per-project posture summary** on top of the existing homepage experiment, not an org-wide rollup.

### In scope signals

- Automatic failover coverage (for example, "6 of 8 services protected by automatic failover")
- Public network exposure (for example, "2 services accessible from any IP")
- Alert destination coverage (for example, "3 services without alert destinations")
- Backup coverage (positive trust anchor, for example, "8 of 8 services backed up")
- Maintenance and version/EOL readiness
- Node-level status in drill-down list (replacing service-level status emphasis)

### Out of scope (for this experiment)

- Fleet performance rollups across projects
- Saturation/usage-derived signals (CPU, disk, GC, storage headroom trends)
- Error/warning logs summary (depends on Observability project)
- Org-wide posture default experience
- Access/permissions friction flows

## Why this scope

Each included signal must pass four filters:
- Derivable from configuration-oriented APIs (no metrics pipeline dependency)
- Expressible as coverage ("N of M")
- Drillable to exact affected services
- Actionable from that list (clear fix path)

Signals that fail these constraints are intentionally deferred to keep feasibility inside the 2-3 week window.

## Target users

- Project users (primary in this scope)
- Org admins who inspect one project at a time

Persona note: this experiment explicitly optimizes for project-level operational ownership (tech leads, architects, senior developers). Org-wide fleet governance personas are deferred to a follow-up.

## Interaction model

- Keep existing project selector (`currentProjectId`) as the scope control.
- Add a posture summary section with 4-6 statements; each includes:
  - Coverage fraction (`N of M`)
  - Plain-language risk or coverage text
  - Visual tone (`success`, `warning`, `danger`, `neutral`)
- Clicking a posture statement filters the service table to only affected services.
- The selected statement appears as an active filter chip.
- Drill-down table shows node-level status and a clear "Fix" action target.
- Each posture statement has:
  - "Why this matters" explainability popover
  - Dismiss action with captured reason
- Add production/development scope awareness so development services do not dominate risk posture by default.

## UX and component direction

Reuse existing patterns already present in the repo:
- Tone-based card and icon treatment from `experiments/_shared/project-page/OverviewContent.tsx` (`METRIC_ICON_TONE`, `MetricCard` structure)
- Search/filter strip pattern from `experiments/_shared/project-page/ServicesListContent.tsx`
- Status chip mapping from `src/components/ServiceStatusChip.tsx`

Adapt the current homepage `ProjectHealth` list from "current alert rows" to "posture-driven drill-down list", while preserving existing project selection behavior.

## Data model additions (prototype mock level)

Extend the homepage mock layer from alert-only rows to posture-capable rows. Proposed per-service fields:
- `environment`: `production | development`
- `nodeStatus`: node health summary for display
- `hasAutomaticFailover`
- `isPubliclyAccessible`
- `hasAlertDestination`
- `isBackedUp`
- `maintenanceWindowState` (for example, valid/missing/review-needed)
- `versionEolState` (for example, supported/approaching-eol/eol)

Then derive posture statements via pure functions from the selected project's service set.

## Delivery plan by week

### Week 1

- Extend homepage mock data model and fixtures with posture fields.
- Implement posture derivation utilities (`N of M` summaries + affected service IDs).
- Build posture summary UI section with visual tones and copy scaffolding.

### Week 2

- Implement drill-down behavior from posture statements to filtered service rows.
- Add node-status column treatment and fix-action affordances.
- Add explainability popover and dismiss-with-reason interaction state.

### Week 3

- Add prod/dev scope behavior and empty/all-good states.
- Polish wording, spacing, edge cases, and interaction consistency.
- Validate with stakeholder walkthroughs and capture findings.

## Stakeholders and key questions

- Eero + Ville: Which posture gaps appear most often in customer evidence, and what order should signals follow?
- Henri Kestiö + Jeff Held: Can required posture fields be retrieved project-wide without expensive per-service fan-out?
- Samuli Suortti: Does this explainable, dismissible, environment-aware framing address prior concerns and decision history?
- Cédric Bertrand: Is per-project posture sufficient for enterprise users now, or is org-level summary needed sooner?

Supporting thread:
- [Slack thread](https://aiven-io.slack.com/archives/C01TJT75R4M/p1740726355488399?thread_ts=1740726355.488399&cid=C01TJT75R4M)

## Success measures

- Posture statement click-through rate
- Gap closure rate within 14 days (services moving from uncovered to covered)
- Dismissal rate and dismissal reasons
- Follow-through to fix destinations from drill-down rows
- Relative attach/engagement for posture-led recommendations vs generic homepage promotions

## Validation approach

- Prototype-first validation in this experiment branch
- Stakeholder review and customer evidence pass before committing implementation estimate
- Quick qualitative sessions around:
  - clarity of "N of M" statements
  - trust in signal correctness
  - usefulness of drill-down and explainability

## Open risks and dependencies

- API/data availability risk: if posture fields require many per-service calls, estimate may exceed 2-3 weeks.
- Semantic risk: failover and backup definitions must be explicit to avoid misleading statements.
- Signal trust risk: without environment awareness and explainability, users may treat recommendations as noisy upsell.
- Dependency risk: Observability-derived log signals are intentionally deferred and should not block this phase.

## Non-goals

- No production integration in this experiment phase
- No org-wide homepage redesign
- No change to global scenario runtime or shared shell behavior
