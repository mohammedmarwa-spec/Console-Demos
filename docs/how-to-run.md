# How to run locally

## Prerequisites

Follow [SETUP.md](./SETUP.md) if this is your first time (Node.js, git, `npm install`).

## Start the dev server

```bash
cd console-prototype-lab
npm install   # after pull, if dependencies changed
npm run dev
```

Open **http://localhost:5173** in your browser.

## Routes

| URL | What you get |
|-----|----------------|
| `/` | **Prototype Hub** — browse and launch scenarios |
| `/console/project/services` | Project services list |
| `/console/project/services/[id]` | Service overview |
| `/console/org` | Organization home |
| `/console/billing` | Billing invoice |
| `/console/onboarding/test-env` | Test environment onboarding |
| `/console/onboarding/playground` | Playground onboarding |
| `/experiments/[owner]/[slug]` | Experiment launcher |

## Launching scenarios

- Open `/` (**Prototype Hub**) to browse reusable scenarios, prototypes, templates, and experiments
- Click a card to launch — each scenario deep-links to the correct console route with `?scenario=<id>`
- Use **Back** in the playground header to return to the hub

## Deep links

Scenarios still support query params:

```txt
/console/project/services?scenario=onboarding-test-env
/console/project/services?scenario=existing-customer
/experiments/elena/shorter-create-service
```

## Other commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production static export (`out/`) |
| `npm test` | Run tests |

## Stop the server

Press **Ctrl+C** in the terminal.
