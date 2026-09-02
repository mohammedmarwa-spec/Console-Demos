# Scaffold prototype experiment

Create a new experiment folder from a template in Console Prototype Lab.

## What to ask the user

If not already provided, ask for:

1. **Owner slug** — lowercase folder name, e.g. `elena`
2. **Experiment slug** — e.g. `first-time-user`
3. **Template slug** — e.g. `onboarding-starter`

## Steps

1. Run:

```bash
node scripts/create-experiment.mjs --owner <owner> --name <experiment-slug> --template <template-slug>
```

2. Edit only `experiments/<owner>/<experiment-slug>/` unless the user explicitly asks otherwise.

3. Update `pageMeta` (title, description) in `index.tsx`.

4. Confirm Storybook MCP and Figma MCP are connected. Query Storybook for each Aquarium component, and Figma for visual/DS specs, before implementing. Then create or update `component-manifest.ts`. See `.cursor/rules/component-map.md`, `.cursor/rules/aquarium-storybook-mcp.mdc`, and `.cursor/rules/figma-mcp.mdc`. If either MCP is missing, stop.

5. Confirm the experiment appears in the hub and opens at `/experiments/<owner>/<experiment-slug>`.

## Rules

- Do not edit reusable scenarios in `src/registry/scenarios.ts`.
- Reuse domain code from `experiments/_shared/` first; copy from `src/` into `_shared` if missing.
- Keep the app-shell contract on `@/` (`PlaygroundStateContext`, `ThemeProvider`, `ExperimentPageShell`).
- Follow `.cursor/rules/` and `docs/agent-rules.md`.
