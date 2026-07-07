# How to deploy (Aiven Application)

Console Prototype Lab deploys as a **static SPA** via **Aiven Application** (Product app runtime). There is no Vercel configuration in this project.

## What gets deployed

- Docker multi-stage build: `npm ci` → `npm run build` → nginx serves `out/`
- Container listens on **port 8080**
- SPA routing via nginx `try_files` → `index.html`

## Before deploying

```bash
npm run build
```

Build must pass without errors.

## Shared team app (main branch)

1. Merge your changes to `main` via a lightweight PR
2. Deploy or redeploy the shared Aiven Application service from `main`
3. Team opens the Application public URL
4. Deep-link scenarios: `https://<app-url>/console/project/services?scenario=onboarding-test-env`
5. Prototype hub: `https://<app-url>/`

### Deploy parameters

| Parameter | Value |
|-----------|-------|
| Repository | `Aiven-Labs/console-prototype-lab` |
| Branch | `main` (or feature branch for preview) |
| Build path | `.` (repo root) |
| Port | `8080` |
| Env vars | None required for MVP |

Deploy via Aiven Console or ask a teammate with Application deploy access.

## Branch preview (work in progress)

1. Push your feature branch to GitHub
2. Deploy the branch to a preview Application service (or redeploy an existing preview service)
3. Share the preview URL + `?scenario=<id>` with reviewers

Naming convention: confirm with your team (e.g. one shared preview service redeployed on demand).

## Verify after deploy

- [ ] App loads at the Application URL
- [ ] Scenario panel opens (Shift+S)
- [ ] `?scenario=onboarding-test-env` deep link works on console routes
- [ ] Prototype hub loads at `/`
- [ ] Theme switcher works

## Redeploy

After pushing changes to the deployed branch, trigger a redeploy in Aiven Console.

## Non-goals (MVP)

- Custom domains
- Auth gate on the Application URL
- CI auto-deploy on every push
