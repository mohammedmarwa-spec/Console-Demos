# Console Homepage V6: context Page header

Duplicate of **Homepage V1** content, with a slash-separated **context Page header** that replaces content-area breadcrumbs (especially for PG user convenience).

## What changed from V1

- **No organization sidebar.** Navigation context lives in the top Page header trail.
- **Homepage trail:** Logo · Org selector (single-line).
- **Project trail:** Logo · Org / Project — shown when opening `online-store-prod` from recent projects.
- Logo or Org label returns to Homepage; project segment opens the project switcher.
- Right-side utilities: Ask AI, Tools, Help, User (no Home / Tools / Billing text nav, no systems-status chip).
- Project view reuses shared `ProjectPageShell` with `hideHeader` so content-area breadcrumbs are omitted.
- Extra trail segments (service + status + page) are supported via `extraSegments` but not rendered in these two states yet.

## Why this variant

Content breadcrumbs compete with page titles and are easy to miss. A persistent header trail keeps org → project scope visible for power users switching context often.
