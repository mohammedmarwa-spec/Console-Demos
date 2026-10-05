# RAG demo

Copied from `marwa/ProjectList` ("Free & Dev: Quick Upgrade V4").

## Hypothesis

Create service on the project services list should open the same Console modal shell as production Console — not a no-op. Creating an OpenSearch Free/Dev service is the start of the RAG demo.

## What changed

- **Create service** (PageHeader primary action) opens the Console two-step flow:
  1. `ServiceTypeSelectModal` (`size="full"`, title "Select service type")
  2. Full `Modal` wrapping shared `CreateService` (`embedded`) with the Console title, subtitle, Create + Cancel footer
- **Screen 1:** OpenSearch create shows a single "Includes vector search demo" information Alert under Service tier — no user choice. The demo is auto-included on Free/Dev OpenSearch.
- **v2 — demo offered once Running, not during creation:** no Start/Skip dialog after Create. The new row starts as **Rebuilding** and flips to **Running** after 15 s (prototype timer). The services list shows an `Alert.Banner` — information "is being created" while building, success "is running" + Open service once Running. While Rebuilding, the Overview shows a "Vector search demo" Card with an "Available once running" chip and no action. Once Running it becomes the illustrated "Try the vector search demo" card (port of Console's Kafka `KafkaStartStreamCardWrapper`, image `assets/vector-demo-card.svg`) with a ghost **Generate demo →** action. No model chips on the card.
- **v2 — Aquarium `Modal` + dense `Stepper`:** Generate demo opens a `Modal` titled "Generate vector search demo" with a dense `Stepper` at the top of the body. Footer is Cancel on every step, Back from the second step, and that step's Next (Generate demo, then View demo). State lives in `useVectorDemo` on the service shell, so closing never loses progress.
  1. **Choose data:** pipeline illustration first (documents → chunks → embedded with Titan → indexed in OpenSearch; question → closest chunks → Claude writes the answer), with the locked model chips at the stage where each model is used. Then the dataset cards, nothing preselected, and an inline "Request a different model" form. Footer: Close / Continue.
  2. **Configure:** follows the dataset type. Templates only pick chunk size. Upload adds up to 50 .txt files (10 MB each) with per-file remove, Remove all, and a skipped-files warning Alert; Continue needs at least one file. Chunking method is predefined and read-only.
  3. **Review:** what the demo creates — Data (file count and size), Chunking (fixed-size with overlap, chunk size, estimated chunks), Created on your service (index `rag-demo-docs`, vector field `passage_embedding`, pipeline `rag-demo-ingest`, estimated storage), Models, a read-only index mapping / ingest pipeline JSON preview in Tabs, and links to the OpenSearch vector search and neural search docs. Footer primary: Generate demo.
  4. **Prepare:** named stages with counts (uploading files, chunking, generating embeddings, indexing), e.g. "462 of 911 chunks". Footer: **Continue in background** closes the modal; setup keeps running and shows on the Overview card and the sidebar **Vector search demo** item (notification badge while setting up). Fail (upload name contains `fail`) fails once at Generating embeddings; Retry resumes that stage. Footer then offers Back to review. **The modal ends here:** when loading finishes it shows "Your demo is ready" and waits — footer Close / **View demo**. No auto-advance.
- **Demo page** (View demo, the sidebar item, or the Overview shortcuts): Section "Vector search demo" (source · index · documents · chunks) with **Stop demo**, and two Tabs — **Search your data** (Keyword / Semantic / Hybrid, example chips, LLM answer card, ranked sources) and **Results explained** (for the latest search; See explanation switches tabs).
- **Demo running on the Overview:** status card ported from Console's `KafkaDataGeneratorCardWrapper`: Setting up (overall % + current stage), Error (Retry), Running (index, documents, chunks, storage; Search your data, Results explained, Stop demo). The sidebar item opens the same card with every stage listed.
- **Stop demo** (Overview card, demo page): confirmation lists what stays on the service (index, pipeline, files), says the service keeps running, and asks for a rating plus optional comment. Stopping **does not delete** anything yet; the sidebar item goes away and the setup card returns saying the index is still there.
- Cancel / Back on the create form returns to the type picker.
- Creating a service prepends a row to the local list and keeps existing upgrade price/plan logic.
