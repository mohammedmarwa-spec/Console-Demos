# Contribution guide

## Publishing levels

### Local only

```txt
npm run dev
No branch or deploy needed.
```

### Branch preview

```txt
Push feature branch → deploy to preview Application → share URL + ?scenario=<id>
```

### Main playground (team shared)

```txt
Open PR → lightweight review → merge to main → redeploy shared Application
```

## Merge checklist

Before merging a prototype to `main`:

- [ ] Working route / scenario registry entry
- [ ] `prototype.config.ts` metadata (owner, status, type)
- [ ] `notes.md` or description explaining what is being tested
- [ ] `sourceScenarioId` if copied from a reusable scenario
- [ ] No production data or API dependencies
- [ ] No accidental edits to unrelated prototypes or reusable scenarios
- [ ] `npm run build` passes
- [ ] Shared shell still works

Review is **lightweight** — this is a design sandbox, not production software.

## Reusable vs prototype

| Type | Who edits | Purpose |
|------|-----------|---------|
| Reusable scenario | Elena, explicit request only | Stable starting points |
| Prototype | Owner designer | Exploratory ideas |
| Experiment | Owner designer | Isolated working copy |

## File locations

- Reusable + prototype metadata: `src/registry/scenarios.ts`
- Experiments: `experiments/<owner>/<name>/`
- Mock data: `src/mocks/`
- Runtime logic: `src/scenarios/scenarioRuntime.ts`

## Getting help

- Setup issues: [SETUP.md](./SETUP.md)
- Cursor Agent rules: [agent-rules.md](./agent-rules.md)
- Deploy: [how-to-deploy.md](./how-to-deploy.md)
