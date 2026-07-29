# How to run locally

## Prerequisites

First-time designers: follow [SETUP.md](./SETUP.md) (Cursor, tools check, clone, first experiment).

This repo pins Node via [`.nvmrc`](../.nvmrc) (Node 20). If you use nvm:

```bash
nvm install
nvm use
```

## Start the dev server

```bash
cd console-prototype-lab
npm install   # after pull, only if dependencies changed
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
/experiments/elena/first-time-user
```

## Other commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production static export (`out/`) |
| `npm test` | Run tests |

## Stop the server

Press **Ctrl+C** in the terminal.
