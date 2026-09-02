# Console Prototype Lab — Setup Guide (macOS)

A first-run guide for designers. By the end you will:

1. Open the **Prototype Hub** in your browser
2. Create a **personal experiment**
3. Change one element in **Cursor**
4. See the browser update automatically

**Time estimate:** 45–90 minutes the first time (mostly waiting for downloads). Later days take a few minutes.

> **Repo:** [`Aiven-Labs/console-prototype-lab`](https://github.com/Aiven-Labs/console-prototype-lab) — a shared Console-like prototyping playground. Mock data only, never production Console.

---

## Before you start

### Pick your track

| Track | What you need | Cursor? |
|-------|----------------|---------|
| **View only** | The shared hosted Prototype Hub URL from a teammate | Not required |
| **Create prototypes** | This local setup | **Required** (recommended for AI-assisted edits) |

**View only:** ask a teammate for the shared Aiven Application URL, then open it in your browser. See [how-to-deploy.md](./how-to-deploy.md) for how the team hosts it. You can stop here.

**Create prototypes:** continue below.

### Confirm GitHub access

1. Open https://github.com/Aiven-Labs/console-prototype-lab in your browser while signed into your work GitHub account.
2. If you cannot see the repo, ask a teammate to add you to `Aiven-Labs` before continuing.

### Already have the repo?

| Situation | What to do |
|-----------|------------|
| `console-prototype-lab` is **already open** in Cursor | Skip cloning. Use Cursor’s Terminal and jump to [Install project dependencies](#6-install-project-dependencies). |
| Cursor has a **different** project open | Clone this playground as its own folder, then **File → Open Folder** on that folder. |
| Nothing local yet | Clone in the steps below. |

Managed Macs may need admin rights (or IT help) to install developer tools.

---

## Quick setup

Use **Cursor’s integrated Terminal** for every command (`` Ctrl+` `` or **View → Terminal**). Press **Enter** after each command.

### 1. Install or open Cursor

1. Download from https://cursor.com if you do not have it yet.
2. Open Cursor.
3. You will open the project folder after cloning (or open it now if it already exists).

### 2. Check what you already have

In Cursor’s Terminal:

```bash
git --version
node --version
npm --version
```

| Result | Action |
|--------|--------|
| All three print a version, and Node is **v20 or newer** | Skip to [Clone or open the repo](#5-clone-or-open-the-repo). |
| `git` missing | [Install Git (Apple tools)](#3-install-only-what-is-missing). |
| `node` / `npm` missing, or Node older than 20 | [Install Node with nvm](#4-install-node-with-nvm). |

### 3. Install only what is missing

#### Git missing — Apple command-line tools

```bash
xcode-select --install
```

Click **Install**, wait until it finishes, then run `git --version` again.

#### Homebrew (needed only if you must install nvm)

1. Go to https://brew.sh and copy the install command.
2. Paste into Terminal, press **Enter**, follow prompts.
3. Verify with `brew --version`.

### 4. Install Node with nvm

Only if Node/npm is missing or below v20.

```bash
brew install nvm
```

Then load nvm in your shell (**run once**; do not repeat if already configured):

```bash
mkdir -p ~/.nvm
NVM_PREFIX="$(brew --prefix nvm)"
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo "[ -s \"$NVM_PREFIX/nvm.sh\" ] && . \"$NVM_PREFIX/nvm.sh\"" >> ~/.zshrc
source ~/.zshrc
```

From the project folder (after clone), install the version pinned in `.nvmrc`:

```bash
nvm install
nvm use
```

Verify:

```bash
node --version    # should be v20.x.x
npm --version
```

If you are not in the project yet, `nvm install 20` then `nvm use 20` also works until you clone.

### 5. Clone or open the repo

Prefer a visible folder you can find later:

```bash
mkdir -p ~/Projects
cd ~/Projects
```

**HTTPS (recommended):** GitHub will use your browser or credential helper when needed. Prefer company sign-in over creating a Personal Access Token. Use a token only if Git asks for a password and browser login is not available.

```bash
git clone https://github.com/Aiven-Labs/console-prototype-lab.git
cd console-prototype-lab
```

**SSH** (if your team already set SSH keys up):

```bash
git clone git@github.com:Aiven-Labs/console-prototype-lab.git
cd console-prototype-lab
```

Then in Cursor: **File → Open Folder** → select `~/Projects/console-prototype-lab`.

Enable these **required MCPs** for AI-assisted UI. Cursor Settings → **MCP** → turn on both until they show as connected:

| Server | What it is |
|--------|------------|
| **aiven-storybook** | Aquarium component props |
| **figma** | Official Figma MCP (`https://mcp.figma.com/mcp`) — Aquarium visual specs, tokens, library |

This repo ships both in `.cursor/mcp.json`. If Cursor asks you to authenticate Figma, complete that flow. If the agent says Storybook or Figma MCP is missing, do not continue UI work until both are green.

Use the project Node version:

```bash
nvm install
nvm use
```

### 6. Install project dependencies

Inside the project folder:

```bash
npm install
```

First run takes a few minutes. You should get a `node_modules/` folder (do not edit it).

If install fails, see [Troubleshooting](#troubleshooting).

### 7. Start the app

```bash
npm run dev
```

Success looks like:

- Terminal says the server is ready
- A local URL appears (usually `http://localhost:5173`)
- Opening that URL shows the **Prototype Hub**

Exact wording of the Terminal banner may change between Next.js versions — the URL and Hub are what matter.

**Stop the server later:** click the Terminal and press **Ctrl + C**.

---

## Create your first experiment

### Where it is safe to edit

| Area | Safe? |
|------|--------|
| `experiments/<your-owner>/<your-experiment>/` | **Yes** — your personal work |
| Shared reusable scenarios / templates | **No** — do not edit directly |
| Global app code under `src/` (outside your experiment) | **Advanced** — ask before changing |

If you will share work, create a personal branch first — see [contribution-guide.md](./contribution-guide.md). Do not edit shared work on `main`.

### Recommended: Start in Cursor

1. With `npm run dev` running, open http://localhost:5173.
2. Open a **template** from the Prototype Hub.
3. In the playground header, click **Start in Cursor**.
4. Enter your owner slug and experiment name when asked.
5. Confirm the prompt in Cursor so it scaffolds your experiment folder.

**Prerequisites:** Cursor installed as a deeplink handler; this repo open as your Cursor workspace; Node.js available. If the browser does not open Cursor, use **Copy prompt** and paste into Cursor chat.

Your owner slug must exist in `src/data/design-team-owners.json` (examples: `elena`, `kate`, `robin`). Ask a teammate to add you if you are missing.

### Fallback: Terminal command

From the project root (replace `elena` with **your** owner slug):

```bash
node scripts/create-experiment.mjs \
  --owner elena \
  --name pricing-plan-test \
  --template project-services-list
```

Available templates live under `experiments/_templates/` (for example `onboarding-starter`, `project-services-list`).

### Confirm the loop works

1. Open your new experiment folder in Cursor (entry file is usually `index.tsx`).
2. Change one heading or button label.
3. Save — the browser should update without a full restart.

More detail: [how-to-create-prototype.md](./how-to-create-prototype.md).

---

## Daily workflow

```bash
cd ~/Projects/console-prototype-lab   # or wherever you cloned
git pull
nvm use                               # if Node version drifts
npm run dev
```

- Work only inside your personal experiment folder.
- Run `npm install` **only** when `git pull` brought dependency changes, or when install/start fails after a pull — not every day.
- If `git pull` reports a **conflict**, stop and ask a teammate for help. Do not resolve conflicts blindly.
- Press **Ctrl + C** in Terminal when finished.

---

## Troubleshooting

If a fix below does not work, copy the **complete Terminal output** and ask a teammate who already runs the playground.

### Cannot access or clone the repository

1. Confirm https://github.com/Aiven-Labs/console-prototype-lab opens in your browser.
2. Ask a teammate to grant `Aiven-Labs` access.
3. Prefer browser/credential-helper sign-in; create a Personal Access Token only if Git still asks for a password and your team confirms that approach.

### Git, Node, or npm is missing

- Close and reopen Cursor’s Terminal, then retry the version commands.
- For nvm: `source ~/.zshrc`, then from the project folder run `nvm use`.
- Revisit [Install only what is missing](#3-install-only-what-is-missing).

### `npm install` fails

- Confirm you are inside `console-prototype-lab` (`pwd` should end with that folder name).
- Do **not** use `sudo npm install`.
- If you use nvm, stay on the project Node version (`nvm use`) and retry.
- Still stuck? Share the full Terminal output with a teammate.

### Development server does not start / port 5173 in use

Another process may already be using the port:

```bash
lsof -i :5173
```

In the output, find the **PID** column (a number). Stop that process:

```bash
kill <PID>
```

Example: if PID is `12345`, run `kill 12345`. Then run `npm run dev` again.

### Browser does not load / blank page

1. Confirm Terminal still shows the server running and you opened the URL it printed.
2. Try `npm run dev:clean` (clears the Next.js cache, then starts again).
3. Last resort — deletes **only** downloaded dependencies in this project, not your code. From the **repo root**:

```bash
rm -rf node_modules
npm install
npm run dev
```

### Start in Cursor does not open the experiment

- Confirm Cursor is installed and this repo is the open workspace.
- Use **Copy prompt** on the modal and paste into Cursor chat.
- See [how-to-create-prototype.md](./how-to-create-prototype.md#prerequisites-for-start-in-cursor).

### Agent says Storybook or Figma MCP is missing

Both are required for AI UI work. In Cursor: **Settings → MCP** → enable **aiven-storybook** and **figma** and wait until they are connected. Figma uses `https://mcp.figma.com/mcp` (complete auth if Cursor prompts). Start a **new agent chat** after enabling. Servers are defined in `.cursor/mcp.json`.

### Git pull or push fails

- If there is a conflict or auth error, stop and ask a teammate.
- Do not force-push or delete branches unless someone experienced walks you through it.

---

## Optional setup

Skip these until you need them.

### Write to Figma (Figma Console MCP)

Storybook and official Figma MCP are **required** for AI UI work (see Quick setup). `user-figma-console` is only needed when the agent **writes** into a Figma file. Enable it in Cursor Settings → MCP with a personal token — never commit tokens to the repo.

`cursor-ide-browser` is optional for testing the running app.

See [`AGENTS.md`](../AGENTS.md).

### Experiment preview thumbnails

Once, after `npm install`:

```bash
npx playwright install chromium
```

Details: [how-to-deploy.md](./how-to-deploy.md#experiment-preview-thumbnails-on-commit).

### Deploy and share

Static site via Aiven Application (port 8080). Full steps: [how-to-deploy.md](./how-to-deploy.md).

### Bookmarks

| Resource | URL |
|----------|-----|
| This repo | https://github.com/Aiven-Labs/console-prototype-lab |
| Aquarium Storybook | https://aquarium.aiven.io |
| Aquarium component docs | https://aquarium-library.aiven.io |
| Aquarium on npm | https://www.npmjs.com/package/@aivenio/aquarium |

---

## Technical reference

Architecture, Aquarium wiring, Next.js file map, and project rule links live in [setup-technical-reference.md](./setup-technical-reference.md). Read that when you want to understand the stack — not required for first-run success.

---

## Completion checklist

- [ ] Prototype Hub opens at http://localhost:5173
- [ ] You created a personal experiment (Start in Cursor or the scaffold command)
- [ ] The experiment opens in Cursor
- [ ] You changed a heading or button label
- [ ] The browser updated automatically

## What to read next

1. [how-to-create-prototype.md](./how-to-create-prototype.md) — full experiment workflow
2. [contribution-guide.md](./contribution-guide.md) — branch, PR, share with the team
3. [README.md](./README.md) — playground overview
4. [`AGENTS.md`](../AGENTS.md) — AI design-audit workflow

Welcome to the playground. 👮
