# Contribution guide

## Minimal Gitflow for a first experiment

You do **not** need GitFlow with `develop` / `release` branches. Collision avoidance comes from **owner folders + short-lived feature branches + PRs to `main`**.

Owner slugs live in [`src/data/design-team-owners.json`](../src/data/design-team-owners.json) (e.g. `elena`, `kate`). Experiment folder names are URL-safe slugs (e.g. `org-event-logs`).

### Collision model

```txt
main (shared app)
  ↑ PR merge
  ├── experiment/alice/foo  →  experiments/alice/foo/
  └── experiment/bob/bar    →  experiments/bob/bar/
```

Two designers rarely collide if each only touches `experiments/<their-owner>/<slug>/`. Conflicts usually happen when someone edits shared shell / `src/` or forgets to pull `main` before opening a PR.

### Steps

1. **Sync**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Branch** (one experiment per branch)

   ```bash
   git checkout -b experiment/<owner>/<slug>
   ```

   Example: `experiment/elena/org-event-logs`

3. **Scaffold only under your owner folder**

   ```bash
   node scripts/create-experiment.mjs --owner <owner> --name <slug> --template <templateSlug>
   ```

   Edit **only** `experiments/<owner>/<slug>/` (and the auto-generated preview under `public/experiment-previews/<owner>/` if the hook runs). Do not touch reusable scenarios in `src/registry/scenarios.ts` or other designers' folders.

4. **Commit + push**

   ```bash
   git add experiments/<owner>/<slug> public/experiment-previews/<owner>/<slug>.png
   git commit -m "Add <owner>/<slug> experiment"
   git push -u origin HEAD
   ```

   In Cursor Source Control, **Commit & Create Pull Request** is the best default for a first publish.

5. **PR → `main`** (lightweight review)

   - Title: what is being tested
   - Wait for the **`experiment-scope`** CI check to pass (see below)
   - Checklist below before merge

6. **Merge + redeploy** the shared Aiven Application from `main` — see [how-to-deploy.md](./how-to-deploy.md)

Optional WIP share without touching the team app: push the feature branch and deploy a **branch preview** Application instead of merging yet.

### Hard rules

| Do | Don't |
|----|--------|
| Own folder `experiments/<you>/<slug>/` | Edit `experiments/<someone-else>/` |
| Short-lived `experiment/<owner>/<slug>` branch | Commit straight to `main` |
| PR to merge | Long-lived personal forks of the whole app |
| Pull / rebase `main` before merge if PR is stale | Change shared shell / `src/` without asking |
| One experiment = one PR when possible | Bundle unrelated experiments in one PR |

### CI path guard (`experiment-scope`)

Every PR to `main` runs [`.github/workflows/pr-experiment-scope.yml`](../.github/workflows/pr-experiment-scope.yml).

**Always blocked** (unless escape hatch): edits under `experiments/_templates/`.

**When the PR touches** `experiments/` or `public/experiment-previews/`, it must:

- Stay under a **single** known owner folder (`design-team-owners.json`)
- Not touch `experiments/_shared/`
- Not mix in `src/` or other shared/app paths

**Infra / docs-only PRs** (no experiment paths) pass without a label.

Allowed on a normal experiment PR: `experiments/<owner>/**` and matching `public/experiment-previews/<owner>/**`.

**Local dry-run** (before opening a PR):

```bash
git fetch origin main
npm run check:experiment-scope
```

**Maintainer escape hatch:** add the PR label `allow-shared-paths` (or run with `ALLOW_SHARED_PATHS=1`) for intentional template / `_shared` / mixed shared changes. Those PRs still need human review.

**Repo setting (once):** GitHub → Settings → Branches → protect `main` → require status check **`experiment-scope`** so the guard cannot be ignored on merge.

### What this flow skips

- No `develop` branch or release trains
- No required CI auto-deploy (redeploy is manual today)
- No force-push to `main`

**One-liner:** Pull `main` → branch `experiment/<your-name>/<slug>` → scaffold under `experiments/<your-name>/<slug>/` only → PR → CI `experiment-scope` must pass → merge → redeploy shared app.

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
- [ ] `experiment-scope` CI check is green (or PR has `allow-shared-paths` for intentional shared edits)
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
