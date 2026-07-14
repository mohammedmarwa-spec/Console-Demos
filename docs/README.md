# Console Prototype Lab

A shared design playground for the Aiven design team — a Console-like browser environment for interactive prototypes with mock data and lightweight logic.

## What it is

- A faster layer between Figma and production Console
- A shared scenario switch panel for browsing product states and design experiments
- Reusable starting scenarios plus designer-owned prototype experiments
- Mock data only — no production APIs

## What it is not

- Not production Aiven Console code
- Not a pixel-perfect Console clone
- Not connected to real customer data or production APIs

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — browse scenarios from the hub or use deep links (see [how-to-run.md](./how-to-run.md)).

See [how-to-run.md](./how-to-run.md) for full setup (designers: start with [SETUP.md](./SETUP.md)).

## Documentation

| Doc | Purpose |
|-----|---------|
| [how-to-run.md](./how-to-run.md) | Local development |
| [how-to-create-prototype.md](./how-to-create-prototype.md) | Create experiments from reusable scenarios |
| [how-to-deploy.md](./how-to-deploy.md) | Deploy to Aiven Application |
| [contribution-guide.md](./contribution-guide.md) | Share work with the team |
| [agent-rules.md](./agent-rules.md) | Cursor Agent prompts and safety rules |

## Experiment preview thumbnails

Commits that touch `experiments/<owner>/<slug>/` auto-generate a screenshot thumbnail (pre-commit hook). Cards on the Prototype Hub show the image when `public/experiment-previews/<owner>/<slug>.png` exists.

Setup: `npx playwright install chromium` after `npm install`. See [how-to-deploy.md](./how-to-deploy.md#experiment-preview-thumbnails-on-commit).

## Scenario types

- **Reusable scenarios** — stable team starting points (Create test environment, Empty project, Existing customer)
- **Prototype scenarios** — exploratory ideas, usually owned by one designer
- **Experiments** — isolated copies under `experiments/<owner>/<name>/`

## Architecture

The repo is split into two layers with a single contract seam:

### Layer A — App shell

- `src/app/` — Next.js routes (hub `/`, console `/console/*`, experiments `/experiments/*`)
- `src/components/hub/` — Prototype Hub homepage UI
- `src/components/playground/` — PlaygroundHeader and chrome
- `src/contexts/PlaygroundStateContext.tsx` — console mock state orchestration
- `src/lib/experiments/` — filesystem discovery for templates and experiments

### Layer B — Content

- `src/registry/` — reusable and prototype scenario catalog
- `src/scenarios/` — scenario runtime (`ScenarioRuntime`) and context
- `src/mocks/` — centralized mock data
- `src/screens/` — domain UI (services list, billing, onboarding, etc.)
- `experiments/` — designer experiment folders (entry: `index.tsx`)

### Contract (`src/lib/playground-contract.ts`)

Shell imports content only through this module:

| Direction | Imports |
|-----------|---------|
| Shell → content | `resolveRuntime`, `ScenarioRuntime`, registry helpers, `ROUTES` / navigation |
| Experiments → shell | `PlaygroundStateProvider`, `ThemeProvider`, `ExperimentPageShell`, `PageMeta` |

Content must **not** import from `src/app/`, `src/components/hub/`, or `PlaygroundStateContext`.
