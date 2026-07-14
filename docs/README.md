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

Open http://localhost:5173 and press **Shift+S** to open the scenario panel.

See [how-to-run.md](./how-to-run.md) for full setup (designers: start with [SETUP.md](./SETUP.md)).

## Documentation

| Doc | Purpose |
|-----|---------|
| [how-to-run.md](./how-to-run.md) | Local development |
| [how-to-create-prototype.md](./how-to-create-prototype.md) | Create experiments from reusable scenarios |
| [how-to-deploy.md](./how-to-deploy.md) | Deploy to Aiven Application |
| [contribution-guide.md](./contribution-guide.md) | Share work with the team |
| [agent-rules.md](./agent-rules.md) | Cursor Agent prompts and safety rules |

## Scenario types

- **Reusable scenarios** — stable team starting points (Create test environment, Empty project, Existing customer)
- **Prototype scenarios** — exploratory ideas, usually owned by one designer
- **Experiments** — isolated copies under `experiments/<owner>/<name>/`

## Architecture

- `src/registry/` — scenario and experiment metadata
- `src/scenarios/` — scenario panel, runtime, context
- `src/mocks/` — centralized mock data
- `experiments/` — designer experiment folders (entry: `index.tsx`)
