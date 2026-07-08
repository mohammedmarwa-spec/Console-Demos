# Scaffold prototype experiment

Create a new experiment folder from a reusable scenario in Console Prototype Lab.

## What to ask the user

If not already provided, ask for:

1. **Owner slug** — lowercase folder name, e.g. `elena`
2. **Experiment slug** — e.g. `shorter-create-service`
3. **Source scenario id** — e.g. `onboarding-test-env`

## Steps

1. Run:

```bash
node scripts/create-experiment.mjs --owner <owner> --name <experiment-slug> --from <source-scenario-id>
```

2. Edit only `src/experiments/<owner>/<experiment-slug>/` unless the user explicitly asks otherwise.

3. Update `notes.md` with the design hypothesis and what changed.

4. Confirm the experiment appears in the hub and opens at `/experiments/<owner>/<experiment-slug>`.

## Rules

- Do not edit reusable scenarios in `src/registry/scenarios.ts`.
- Reuse mock data from `src/mocks/`.
- Keep the Console-like shell intact.
- Follow `cursor/rules/` and `docs/agent-rules.md`.
