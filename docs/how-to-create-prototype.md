# How to create a prototype experiment

## 1. Pick a reusable starting scenario

Open the app and use the scenario panel (**Shift+S**). Filter by **Reusable**.

Recommended starters:

- **Create test environment** — onboarding + service create flow
- **Empty project** — no services, empty states
- **Existing customer** — one MySQL service

## 2. Scaffold an experiment folder

**From an open experiment or template:** click **Start in Cursor** in the top playground bar. For templates, enter your owner slug and experiment name; Cursor opens with a pre-filled agent prompt. Use **Copy prompt** if the deeplink does not open Cursor.

**From the terminal:**

```bash
node scripts/create-experiment.mjs --owner your-name --name my-experiment --template onboarding-starter
```

**From Cursor:** run the `/scaffold-prototype` command (see `.cursor/commands/scaffold-prototype.md`).

### Prerequisites for Start in Cursor

- [Cursor](https://cursor.com) installed and registered as a deeplink handler
- This repo cloned locally (`console-prototype-lab`)
- Open the repo as your Cursor workspace before confirming the agent prompt
- Node.js installed (for `create-experiment.mjs`)

If the browser does not open Cursor, use **Copy prompt** on the modal and paste into Cursor chat manually.

This creates:

```txt
experiments/your-name/my-experiment/
  prototype.config.ts
  notes.md
```

And registers the experiment in `src/registry/experiments.ts`.

## 3. Ask Cursor Agent to modify only the experiment

Example prompt:

```txt
Use the existing "Create test environment" scenario as the base.

Create a new experiment for me under my owner folder.

Goal:
Test a shorter create service flow where advanced settings are hidden by default.

Rules:
- Do not edit the original reusable scenario.
- Modify only my new experiment folder.
- Reuse existing mock data.
- Keep existing price calculation logic.
- Keep the Console-like shell.
- Add or update prototype metadata.
- Add a short notes file explaining what changed.
```

## 4. Preview locally

```bash
npm run dev
```

Open `?scenario=experiment/your-name/my-experiment` or select it in the scenario panel.

## 5. Share with the team

Follow the minimal Gitflow in [contribution-guide.md](./contribution-guide.md#minimal-gitflow-for-a-first-experiment): branch `experiment/<owner>/<slug>` → edit only your folder → PR → merge → redeploy.

Deploy details: [how-to-deploy.md](./how-to-deploy.md).

## Rules

- **Never edit reusable scenarios** during normal prototyping
- Work inside `experiments/<owner>/<name>/`
- Update `notes.md` with what you are testing
- Use mock data from `src/mocks/` only
