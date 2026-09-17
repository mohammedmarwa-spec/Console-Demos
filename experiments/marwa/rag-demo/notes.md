# RAG demo

Copied from `marwa/ProjectList` ("Free & Dev: Quick Upgrade V4").

## Hypothesis

Create service on the project services list should open the same Console modal shell as production Console — not a no-op. Creating an OpenSearch Free/Dev service is the start of the RAG demo.

## What changed

- **Create service** (PageHeader primary action) opens the Console two-step flow:
  1. `ServiceTypeSelectModal` (`size="full"`, title "Select service type")
  2. Full `Modal` wrapping shared `CreateService` (`embedded`) with the Console title, subtitle, Create + Cancel footer
- **Screen 1:** OpenSearch create shows an "Includes vector search demo" alert and a Search demo card group (None / Vector & Semantic Search) under Service tier. After creating OpenSearch on Free/Dev with Vector selected, a dialog offers Start demo or Skip.
- **Screen 2:** Start demo (or the skip-path sidebar/banner) opens the existing OpenSearch service shell on **Vector search demo** — title, locked embedding/LLM pills, explanation, Choose a data source CTA.
- **Screen 3:** Choose a data source — sample templates (e-commerce, DevOps runbook, Support FAQ, technical docs) or upload up to 50 .txt files (10 MB each). Selected files list with per-file remove and Remove all; rejected files roll up into a warning Alert. Chunking method is predefined ("Fixed-size chunking with overlap") and shown read-only; Chunk size is a Card.Group of Small / Medium (Recommended) / Large. Start demo continues to processing.
- **Screen 4:** Preparing your data… ProgressBar, then auto-advance to query. Fail (upload name contains `fail`) → Retry.
- **Screen 5:** Query + results — Keyword / Semantic / Hybrid (mode change re-runs), example chips, LLM answer card, ranked sources Accordion, High / Medium / Low. See explanation opens a separate view.
- **Screen 6:** Results explained — why this mode matched, how High / Medium / Low was set, matched text + chunk. Back to results restores the last query and mode. End of demo: Back to service details returns to the created OpenSearch Overview.
- After a search on Screen 5, the same Back to service details CTA appears so users can finish without opening the explanation.
- Skip stays on the services list with a persistent banner; the demo remains in the OpenSearch sidebar and Overview alert.
- Cancel / Back on the create form returns to the type picker.
- Creating a service prepends a row to the local list and keeps existing upgrade price/plan logic.
