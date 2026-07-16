# Console Prototype Lab — Setup Guide (macOS)

A step-by-step guide for designers who have **never installed dev tools** on a Mac. By the end you will run the Design Police playground locally in your browser at `http://localhost:5173`.

**Time estimate:** 45–90 minutes (mostly waiting for downloads).

> **Repo:** [`Aiven-Labs/console-prototype-lab`](https://github.com/Aiven-Labs/console-prototype-lab) — a shared Console-like prototyping playground built with **Next.js + React + Aquarium**. Mock data only, never production Console.

---

## What you are setting up

| Piece | What it does |
|-------|----------------|
| **Terminal** | Where you type commands to install and run the app |
| **Git** | Downloads the project code from GitHub |
| **Node.js + npm** | Runs JavaScript tooling; **npm** installs packages (including Aquarium) |
| **Next.js** | The React framework this project runs on — dev server + static build (arrives via `npm install`, no global install needed) |
| **@aivenio/aquarium** | Aiven Design System React components (installed from **public npm**) |
| **Playwright** *(optional)* | Headless browser used to auto-capture experiment preview thumbnails |
| **Cursor** *(optional)* | Code editor with AI + Figma MCP integration |

The app is a Next.js prototype of Aiven Console screens. It uses Aquarium components and design tokens so the UI matches the design system.

---

## Reference links (bookmark these)

| Resource | URL | Notes |
|----------|-----|-------|
| **This playground repo** | https://github.com/Aiven-Labs/console-prototype-lab | The project you are cloning |
| **Aquarium source repo** | https://github.com/aiven/aiven-design | Internal Aiven repo — request access from your team. Contains DS docs, tokens, and component source. |
| **Aquarium on npm** | https://www.npmjs.com/package/@aivenio/aquarium | Public package — no special login needed to install in this project |
| **Aquarium Storybook** | https://aquarium.aiven.io | Live component gallery |
| **Aquarium component docs** | https://aquarium-library.aiven.io | Detailed props and usage |
| **Project rules** | `.cursor/rules/` in the repo | `playground-rules.mdc`, `experiment-previews.md` |
| **Agent / workflow rules** | [`AGENTS.md`](../AGENTS.md) in the repo | Design Police persona + how AI assistants audit and build against the DS (Figma file keys, 8px grid, token rules) |
| **Designer docs** | [`docs/`](./README.md) in the repo | Overview, how-to-run, how-to-create-prototype, how-to-deploy, contribution guide |

> **Note:** `@aivenio/aquarium` installs from the **public npm registry**. You do **not** need an npm token or private registry to run this playground. The [aiven-design](https://github.com/aiven/aiven-design) repo is only needed if you want to read full DS documentation or contribute to the library itself.

---

## Part 1 — Open Terminal

1. Press **⌘ + Space**, type **Terminal**, press **Enter**.
2. A window with a prompt like `yourname@MacBook ~ %` appears. You will paste commands here.

**Tip:** Terminal only runs a command after you press **Enter**.

---

## Part 2 — Install Apple command-line tools

Git and other tools need Apple's developer utilities.

```bash
xcode-select --install
```

1. A dialog appears → click **Install**.
2. Wait until it finishes (can take 10–20 minutes).

Verify Git works:

```bash
git --version
```

You should see something like `git version 2.x.x`.

---

## Part 3 — Install Homebrew (package manager for Mac)

Homebrew makes installing Node and other tools easier.

1. Go to https://brew.sh
2. Copy the install command from the site (it starts with `/bin/bash -c`…).
3. Paste it into Terminal and press **Enter**.
4. Follow the on-screen prompts (you may need your Mac password).

Verify:

```bash
brew --version
```

---

## Part 4 — Install Node.js (includes npm)

Node runs the app tooling. **npm** (Node Package Manager) installs Aquarium, Next.js, and everything else.

Next.js 15 requires **Node.js 20 or newer**. We recommend **nvm** (Node Version Manager) so you can switch Node versions safely — the same approach used in the [aiven-design](https://github.com/aiven/aiven-design) repo.

### 4a. Install nvm

```bash
brew install nvm
```

Then create the nvm folder and add it to your shell (copy all lines, paste once, press Enter):

```bash
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
```

> On Intel Macs, Homebrew lives in `/usr/local` instead of `/opt/homebrew`. If nvm is not found, run `brew --prefix nvm` and use that path in the line above.

### 4b. Install Node.js LTS

```bash
nvm install --lts
nvm use --lts
```

Verify both Node and npm:

```bash
node --version    # v20.x.x or v22.x.x (must be 20+)
npm --version     # e.g. 10.x.x
```

---

## Part 5 — Install GitHub access (to clone the project)

The playground lives at: **https://github.com/Aiven-Labs/console-prototype-lab**

### Option A — HTTPS (simplest for beginners)

1. Ask your team for access to the `Aiven-Labs` GitHub org.
2. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) (classic, `repo` scope).
3. Clone (Terminal will ask for username + token as password):

```bash
cd ~
git clone https://github.com/Aiven-Labs/console-prototype-lab.git
cd console-prototype-lab
```

### Option B — SSH (if your team already set this up)

```bash
cd ~
git clone git@github.com:Aiven-Labs/console-prototype-lab.git
cd console-prototype-lab
```

---

## Part 6 — Install project dependencies

Inside the project folder:

```bash
npm install
```

This downloads everything listed in `package.json`, including:

- **`@aivenio/aquarium`** — Design System components (public npm)
- **`next`** / **`react`** / **`react-dom`** — framework and UI runtime
- TypeScript, ESLint, Vitest (tests), Playwright, Husky, etc.

**First run takes a few minutes.** You should end with a `node_modules/` folder (do not edit it manually). Husky git hooks are installed automatically via the `prepare` script.

### Optional — experiment preview thumbnails

Commits that touch `experiments/<owner>/<slug>/` auto-capture a screenshot via a pre-commit hook. To enable it, install the Playwright Chromium browser once:

```bash
npx playwright install chromium
```

If you skip this, commits still succeed — thumbnail capture just no-ops. See [how-to-deploy.md](./how-to-deploy.md#experiment-preview-thumbnails-on-commit).

If install fails, see [Troubleshooting](#troubleshooting) below.

---

## Part 7 — Run the app

```bash
npm run dev
```

Expected output:

```
  ▲ Next.js 15.x.x
  - Local:   http://localhost:5173
```

1. Open **Chrome** or **Safari**.
2. Go to **http://localhost:5173**
3. You should see the **Prototype Hub** — browse and launch scenarios from there.

**To stop the server:** click the Terminal window and press **Ctrl + C**.

### Other useful commands

| Command | What it does |
|---------|----------------|
| `npm run dev` | Start dev server on port 5173 (hot reload on save) |
| `npm run dev:clean` | Clear the `.next` cache, then start the dev server |
| `npm run build` | Production static export to `out/` (build check before deploy) |
| `npm run start` | Serve the production build |
| `npm test` | Run automated tests (Vitest) |
| `npm run lint` | Run ESLint |

See [how-to-run.md](./how-to-run.md) for routes and deep links (e.g. `?scenario=onboarding-test-env`).

---

## Part 8 — How Aquarium is wired (understand the stack)

This is already done in the cloned repo. Read this section to understand *how* DS components connect — or to rebuild from scratch later.

Official installation steps come from [aiven-design / npm](https://www.npmjs.com/package/@aivenio/aquarium).

### 8a. The package

Already pinned in `package.json` as `"@aivenio/aquarium": "^6.0.1"`. To add it to a fresh project you would run `npm install --save @aivenio/aquarium`.

### 8b. Aquarium CSS + app entry

In the App Router, the root layout `src/app/layout.tsx` imports the Aquarium stylesheet and wraps the app in the shared providers:

```tsx
import '@aivenio/aquarium/dist/styles.css'
import '../index.css'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

The stylesheet loads design tokens as CSS variables (`--aquarium-*`).

### 8c. Providers (Aquarium `Context` + theme)

`src/app/providers.tsx` is a client component that wraps the app in Aquarium's `Context` (required for modals, toasts, and other providers), the scenario provider, and the theme provider:

```tsx
'use client'
import { Context } from '@aivenio/aquarium'
import { ScenarioProvider } from '../scenarios/ScenarioContext'
import { ThemeProvider } from '../theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Context>
      <ScenarioProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ScenarioProvider>
    </Context>
  )
}
```

### 8d. Use components and icons

```tsx
import { Box, Button, Typography } from '@aivenio/aquarium'
import helpIcon from '@aivenio/aquarium/icons/help'

<Button icon={helpIcon}>Help</Button>
```

Browse all components at https://aquarium.aiven.io — names match Figma (`Inputs/Button`, `Data display/Chip`, etc.).

### 8e. Use design tokens (not hex colors)

```tsx
<Box style={{
  padding: 24,
  gap: 16,
  backgroundColor: 'var(--aquarium-background-color-layer)',
  border: '1px solid var(--aquarium-border-color-muted)',
  color: 'var(--aquarium-text-color-default)',
}} />
```

### 8f. Font (Inter)

Aquarium recommends [Inter](https://fonts.google.com/specimen/Inter). Global styles live in `src/index.css`.

### 8g. Dark mode

The project includes `src/theme/ThemeProvider.tsx` (exported from `src/theme`). It toggles the class `aquarium-theme-dark` on `<html>` for dark theme tokens.

---

## Part 9 — How Next.js fits in

You do **not** install Next.js globally. It arrives via `npm install` as a dependency.

| File | Role |
|------|------|
| `next.config.ts` | Next config — static export (`output: 'export'` → `out/`), SVG loader rules |
| `src/app/layout.tsx` | Root layout — imports Aquarium CSS + `Providers` |
| `src/app/providers.tsx` | Client providers — Aquarium `Context`, scenario + theme providers |
| `src/app/page.tsx` | Prototype Hub homepage (`/`) |
| `src/app/console/**` | Console routes (services, billing, org, onboarding) |
| `src/app/experiments/[owner]/[slug]/page.tsx` | Experiment launcher |
| `package.json` → `"dev": "next dev --port 5173"` | Script that starts the dev server on port 5173 |

> The project is configured for **static export**, so `npm run build` produces a fully static `out/` folder (no Node server needed at runtime). Tests use **Vitest**, which is why `vite`/`vitest` still appear in `devDependencies`.

### Starting from zero (optional — not needed if you cloned)

If you ever need a fresh Next.js + TypeScript app:

```bash
npx create-next-app@latest my-prototype --typescript
cd my-prototype
npm install @aivenio/aquarium
```

Then wire Aquarium as described in Part 8.

---

## Part 10 — Project rules & DS documentation in this repo

Read these **before** building new screens or asking AI to implement UI:

| File | Purpose |
|------|---------|
| [`AGENTS.md`](../AGENTS.md) | Design Police persona + full AI workflow (read Figma → audit → plan → execute → verify), Figma file keys, 8px grid, token rules |
| [`.cursor/rules/playground-rules.mdc`](../.cursor/rules/playground-rules.mdc) | Edit-scope safety, experiment structure, reuse rules, deployment |
| [`.cursor/rules/experiment-previews.md`](../.cursor/rules/experiment-previews.md) | How experiment preview thumbnails are generated |
| [`docs/README.md`](./README.md) | Playground overview and architecture |

### Figma libraries

| Library | Link |
|---------|------|
| Aquarium UI | https://www.figma.com/design/3qYM1KjFtzlqq6ddBpFUtB/ |
| Icon library | https://www.figma.com/design/2pRI39z7PZ39vrZ0uvJGLJ/ |

### Deeper Aquarium docs (aiven-design repo)

If you have access to https://github.com/aiven/aiven-design, read the root `README.md` there for:

- Design token pipeline (Figma → `tokens.json`)
- Local development with `npm link`
- Building the library (`npm ci`, `npm run build`)

For day-to-day prototyping in *this* playground, Storybook + `.cursor/rules/` + `AGENTS.md` is usually enough.

---

## Part 11 — Prototype Hub, scenarios & experiments

Once the app runs at `http://localhost:5173`:

- The homepage (`/`) is the **Prototype Hub** — browse and launch reusable scenarios, prototypes, templates, and experiments.
- Inside a scenario, use the **scenario trigger** in the playground header or press **Shift+S** to switch product states.

Scenario types:

- **Reusable scenarios** — stable team starting points (Create test environment, Empty project, Existing customer)
- **Prototype scenarios** — exploratory ideas, usually owned by one designer
- **Experiments** — isolated designer-owned copies under `experiments/<owner>/<name>/`

Reusable and prototype scenarios are registered in `src/registry/`; experiments and templates are discovered from the filesystem.

### Create a new experiment

Do **not** edit shared reusable scenarios directly. Instead, copy a template into your own experiment folder:

```bash
node scripts/create-experiment.mjs --owner <your-name> --name <slug> --template <templateSlug>
```

The entry file for an experiment is `index.tsx`, and by default you should modify **only** that experiment folder. See [how-to-create-prototype.md](./how-to-create-prototype.md).

---

## Part 12 — Figma + MCP setup (optional, for Design Police AI workflow)

Skip this section if you only need to **view and edit** the prototype in the browser.

### 12a. Figma Desktop

1. Install **Figma Desktop** (not just the browser tab): https://www.figma.com/downloads/
2. Open the Aquarium UI library (link above).

### 12b. MCP servers in Cursor

Ask your team which MCP servers are configured. This project's Design Police workflow expects:

| Server | Purpose |
|--------|---------|
| `plugin-figma-figma` | Read designs, screenshots, Code Connect |
| `user-figma-console` | Write to Figma (variables, components) |
| `user-aiven-storybook` | Query Aquarium component props from Storybook |
| `cursor-ide-browser` | Test the running app in a browser |

See [`AGENTS.md`](../AGENTS.md) for the full list and the audit → plan → execute → verify workflow.

---

## Part 13 — Deploying (when you're ready to share)

This project does **not** use Vercel. It deploys as a static site via **Aiven Application** (Docker multi-stage build → nginx serving `out/` on **port 8080**).

- **Local only** — just run `npm run dev`, no branch needed.
- **Branch preview** — push your feature branch and deploy it to a preview Application service.
- **Shared team app** — merge to `main` and (re)deploy the shared Aiven Application service.

Full instructions: [how-to-deploy.md](./how-to-deploy.md).

---

## Part 14 — Install Cursor (optional, for AI-assisted design work)

1. Download **Cursor** from https://cursor.com
2. Install and open it.
3. **File → Open Folder** → select your `console-prototype-lab` folder.

Cursor reads `AGENTS.md` and `.cursor/rules/*` automatically as project rules.

---

## Part 15 — Daily workflow (cheat sheet)

```bash
# 1. Open Terminal
cd ~/console-prototype-lab    # or wherever you cloned

# 2. Pull latest changes (when collaborating)
git pull

# 3. Install any new packages (after pull)
npm install

# 4. Start the app
npm run dev

# 5. Open http://localhost:5173 in your browser
# 6. Edit files in Cursor — browser updates automatically
# 7. Ctrl+C in Terminal when done
```

---

## Troubleshooting

### `command not found: git` / `node` / `npm`

- Close Terminal, open a new window, try again.
- For nvm: run `source ~/.zshrc` then `nvm use --lts`.

### `npm install` fails with permission errors

Do **not** use `sudo npm install`. Fix npm permissions:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

Then run `npm install` again inside the project.

### Port 5173 already in use

Another dev server is running. Either close it, or find and stop the process:

```bash
lsof -i :5173
```

### `npm run dev` works but page is blank

1. Open browser DevTools (⌘ + Option + I) → **Console** tab.
2. Look for red errors.
3. Common fixes: `npm run dev:clean` (clears the `.next` cache), or `rm -rf node_modules && npm install`.

### Aquarium components look unstyled

Check that `src/app/layout.tsx` imports:

```tsx
import '@aivenio/aquarium/dist/styles.css'
```

and that `Providers` (which wraps `<Context>`) is present in the layout.

### Cannot clone the GitHub repo

You need access to the `Aiven-Labs` organization. Ask a teammate to add you.

### Cannot open aiven-design on GitHub

That repo is internal. Use public alternatives:

- https://www.npmjs.com/package/@aivenio/aquarium
- https://aquarium.aiven.io
- https://aquarium-library.aiven.io

---

## Quick verification checklist

- [ ] `git --version` prints a version
- [ ] `node --version` prints v20+ (or v22+)
- [ ] `npm --version` prints 10+
- [ ] Project cloned to `console-prototype-lab/`
- [ ] `npm install` completed without errors
- [ ] `npm run dev` shows `▲ Next.js` and `http://localhost:5173`
- [ ] Browser shows the Prototype Hub at `/`
- [ ] Scenario panel opens (Shift+S) and switches views
- [ ] Bookmarked Storybook + `AGENTS.md` + `.cursor/rules/`

---

## What to read next

1. [`docs/README.md`](./README.md) — playground overview and architecture
2. [`docs/how-to-create-prototype.md`](./how-to-create-prototype.md) — create experiments from reusable scenarios
3. https://aquarium.aiven.io — pick a component, copy usage patterns from existing screens in `src/screens/`
4. [`AGENTS.md`](../AGENTS.md) — Design Police persona + AI design-audit workflow

Welcome to the playground. 👮
