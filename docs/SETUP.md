# Design Police Playground — Setup Guide (macOS)

A step-by-step guide for designers who have **never installed dev tools** on a Mac. By the end you will run the same prototype locally in your browser at `http://localhost:5173`.

**Time estimate:** 45–90 minutes (mostly waiting for downloads).

---

## What you are setting up

| Piece | What it does |
|-------|----------------|
| **Terminal** | Where you type commands to install and run the app |
| **Git** | Downloads the project code from GitHub |
| **Node.js + npm** | Runs JavaScript tooling; **npm** installs packages (including Aquarium) |
| **Vite** | Fast dev server — bundled with the project, starts when you run `npm run dev` |
| **@aivenio/aquarium** | Aiven Design System React components (installed from **public npm**) |
| **Cursor** *(optional)* | Code editor with AI + Figma MCP integration |

The app is a React prototype of Aiven Console screens. It uses Aquarium components and design tokens so UI matches the design system.

---

## Reference links (bookmark these)

| Resource | URL | Notes |
|----------|-----|-------|
| **Aquarium source repo** | https://github.com/aiven/aiven-design | Internal Aiven repo — request access from your team. Contains DS docs, tokens, and component source. |
| **Aquarium on npm** | https://www.npmjs.com/package/@aivenio/aquarium | Public package — no special login needed to install in this project |
| **Aquarium Storybook** | https://aquarium.aiven.io | Live component gallery |
| **Aquarium component docs** | https://aquarium-library.aiven.io | Detailed props and usage |
| **This project's DS rules** | `cursor/rules/` in the repo | `ds_reference.md`, `figma-design.md`, `senior-designer.md` |
| **Agent / workflow rules** | `AGENTS.md` in the repo | How AI assistants should audit and build against the DS |

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

Node runs the app tooling. **npm** (Node Package Manager) installs Aquarium, Vite, and everything else.

We recommend **nvm** (Node Version Manager) so you can switch Node versions safely — same approach used in the [aiven-design](https://github.com/aiven/aiven-design) repo.

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
node --version    # e.g. v22.x.x
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
- **`vite`** — dev server and build tool
- **`react`** / **`react-dom`** — UI framework
- TypeScript, ESLint, test tools, etc.

**First run takes a few minutes.** You should end with a `node_modules/` folder (do not edit it manually).

If install fails, see [Troubleshooting](#troubleshooting) below.

---

## Part 7 — Run the app

```bash
npm run dev
```

Expected output:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

1. Open **Chrome** or **Safari**.
2. Go to **http://localhost:5173**
3. You should see the Aiven Console prototype.

**To stop the server:** click the Terminal window and press **Ctrl + C**.

### Other useful commands

| Command | What it does |
|---------|----------------|
| `npm run dev` | Start dev server (hot reload on save) |
| `npm run build` | Production build check |
| `npm run preview` | Preview production build locally |
| `npm test` | Run automated tests |

---

## Part 8 — How Aquarium is wired (understand the stack)

This is already done in the cloned repo. Read this section to understand *how* DS components connect — or to rebuild from scratch later.

Official installation steps from [aiven-design / npm](https://www.npmjs.com/package/@aivenio/aquarium):

### 8a. Install the package

```bash
npm install --save @aivenio/aquarium
```

In this project it is already pinned in `package.json` as `"@aivenio/aquarium": "^6.0.1"`.

### 8b. Import Aquarium CSS

In `src/main.tsx` (already present):

```tsx
import '@aivenio/aquarium/dist/styles.css'
```

This loads design tokens as CSS variables (`--aquarium-*`).

### 8c. Wrap the app in Aquarium `Context`

Required for modals, toasts, and other providers:

```tsx
import { Context } from '@aivenio/aquarium'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Context>
      <App />
    </Context>
  </StrictMode>,
)
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

Aquarium recommends [Inter](https://fonts.google.com/specimen/Inter). The playground currently uses system fonts in `src/index.css`. For pixel-perfect parity with production Console, add Inter via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

And in CSS: `font-family: 'Inter', system-ui, sans-serif;`

### 8g. Dark mode

The project includes `src/theme/ThemeProvider.tsx`. It toggles the class `aquarium-theme-dark` on `<html>` for dark theme tokens.

---

## Part 9 — How Vite fits in

You do **not** install Vite globally. It arrives via `npm install` as a dev dependency.

| File | Role |
|------|------|
| `vite.config.ts` | Dev server config (port **5173**, `strictPort: true`) |
| `index.html` | HTML shell — loads `src/main.tsx` |
| `src/main.tsx` | App entry — Aquarium Context + React root |
| `package.json` → `"dev": "vite"` | Script that starts the server |

### Starting from zero (optional — not needed if you cloned)

If you ever need a fresh Vite + React + TypeScript app:

```bash
npm create vite@latest my-prototype -- --template react-ts
cd my-prototype
npm install
npm install @aivenio/aquarium
```

Then wire Aquarium as described in Part 8.

---

## Part 10 — Design System documentation in this repo

Read these **before** building new screens or asking AI to implement UI:

| File | Purpose |
|------|---------|
| [`cursor/rules/ds_reference.md`](../cursor/rules/ds_reference.md) | Figma file links, 8px grid, layout widths, token rules |
| [`cursor/rules/figma-design.md`](../cursor/rules/figma-design.md) | Figma MCP rules: auto-layout, variables, no hex, no detach |
| [`cursor/rules/senior-designer.md`](../cursor/rules/senior-designer.md) | Design Police persona: system-first, component integrity |
| [`AGENTS.md`](../AGENTS.md) | Full AI workflow: read Figma → audit → plan → execute → verify |

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

For day-to-day prototyping in *this* playground, Storybook + `cursor/rules/` is usually enough.

---

## Part 11 — Install Cursor (optional, for AI-assisted design work)

1. Download **Cursor** from https://cursor.com
2. Install and open it.
3. **File → Open Folder** → select your `console-prototype-lab` folder.

Cursor reads `AGENTS.md` and `cursor/rules/*.md` automatically as project rules.

### Scenario panel

Once the app runs, use the **scenario trigger** (top-right) or **Shift+S** to switch between prototype states.

The panel supports:

- **Reusable scenarios** — stable team starting points (green badge)
- **Prototype scenarios** — exploratory ideas (owner, status badges)
- **Experiments** — designer-owned copies under `src/experiments/`

Scenarios are registered in `src/registry/`. See [docs/README.md](docs/README.md) and [docs/how-to-create-prototype.md](docs/how-to-create-prototype.md).

---

## Part 12 — Figma + MCP setup (optional, for Design Police AI workflow)

Skip this section if you only need to **view and edit** the prototype in the browser.

### 12a. Figma Desktop

1. Install **Figma Desktop** (not just the browser tab): https://www.figma.com/downloads/
2. Open the Aquarium UI library (link above).

### 12b. Figma Desktop Bridge plugin

The repo includes a local plugin at `figma-desktop-bridge/`. It lets AI tools read Figma variables and component descriptions.

1. Open **Figma Desktop**
2. **Plugins → Development → Import plugin from manifest…**
3. Select `figma-desktop-bridge/manifest.json` from this project
4. Run the plugin: **Plugins → Development → Figma Desktop Bridge**
5. Wait for **✓ Desktop Bridge active**

Full details: [`figma-desktop-bridge/README.md`](../figma-desktop-bridge/README.md)

### 12c. MCP servers in Cursor

Ask your team which MCP servers are configured. This project expects:

| Server | Purpose |
|--------|---------|
| `plugin-figma-figma` | Read designs, screenshots, Code Connect |
| `user-figma-console` | Write to Figma (variables, components) |
| `user-aiven-storybook` | Query Aquarium component props from Storybook |
| `cursor-ide-browser` | Test the running app in a browser |

---

## Part 13 — Daily workflow (cheat sheet)

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
3. Common fix: `rm -rf node_modules && npm install`

### Aquarium components look unstyled

Check that `src/main.tsx` imports:

```tsx
import '@aivenio/aquarium/dist/styles.css'
```

and that `<Context>` wraps `<App />`.

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
- [ ] `node --version` prints v20+ or v22+
- [ ] `npm --version` prints 10+
- [ ] Project cloned to `console-prototype-lab/`
- [ ] `npm install` completed without errors
- [ ] `npm run dev` shows `http://localhost:5173/`
- [ ] Browser shows the Console prototype
- [ ] Scenario panel opens and switches views
- [ ] Bookmarked Storybook + `cursor/rules/ds_reference.md`

---

## What to read next

1. [`cursor/rules/ds_reference.md`](../cursor/rules/ds_reference.md) — layout and Figma links
2. https://aquarium.aiven.io — pick a component, copy usage patterns from existing screens in `src/screens/`
3. [`AGENTS.md`](../AGENTS.md) — if using Cursor AI for design audits

Welcome to the playground. 👮
