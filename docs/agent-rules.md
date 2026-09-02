# Agent rules for designers

These rules guide Cursor Agent when prototyping in Console Prototype Lab. The same rules live in `.cursor/rules/playground-rules.mdc`.

## Core principles

1. This is a **design playground**, not production Console
2. Use **mock data only** — never production APIs or real customer data
3. **Do not edit reusable scenarios** unless explicitly asked
4. **Work in experiment folders** for new explorations

## Default edit scope

When creating a new design exploration:

```txt
Modify only: experiments/<owner>/<experiment-name>/
Do not modify: src/registry/scenarios.ts (reusable entries)
Do not modify: unrelated experiments or shared shell
```

## Example: create experiment from reusable scenario

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

## Scaffold command

```bash
node scripts/create-experiment.mjs --owner elena --name first-time-user --from onboarding-test-env
```

## What to update

| File | When |
|------|------|
| `prototype.config.ts` | New or changed experiment metadata |
| `notes.md` | Hypothesis and what changed |
| `src/registry/experiments.ts` | Register new experiment (script may auto-add) |

## Ask before changing

- Shared shell components (`ConsoleHeader`, sidebars)
- Global mock data structure (`src/mocks/`)
- `scenarioRuntime.ts` base configs
- Shared screen components used by multiple scenarios

## Required MCPs

- **Storybook** — query before using `@aivenio/aquarium` components. See `.cursor/rules/aquarium-storybook-mcp.mdc`.
- **Figma** (`plugin-figma-figma` / `figma` at `https://mcp.figma.com/mcp`) — required before implementing or auditing UI. See `.cursor/rules/figma-mcp.mdc`.

If either server is not connected, stop and enable it in **Cursor Settings → MCP**. Servers are defined in `.cursor/mcp.json`.

## Figma / design system rules

For Figma audits and DS enforcement, see `AGENTS.md` and `cursor/rules/*.md`.
