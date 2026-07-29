# Setup technical reference

Optional background for how this playground is wired. You do **not** need this to run the app or create experiments — start with [SETUP.md](./SETUP.md).

---

## How Aquarium is wired

This is already done in the cloned repo. Official installation steps come from [aiven-design / npm](https://www.npmjs.com/package/@aivenio/aquarium).

### The package

Already pinned in `package.json` as `"@aivenio/aquarium": "^6.0.1"`. To add it to a fresh project you would run `npm install --save @aivenio/aquarium`.

### Aquarium CSS + app entry

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

### Providers (Aquarium `Context` + theme)

`src/app/providers.tsx` is a client component that wraps the app in Aquarium's `Context` (required for modals, toasts, and other providers), the scenario provider, and the theme provider:

```tsx
'use client'
import { Suspense } from 'react'
import { Context } from '@aivenio/aquarium'
import { ScenarioProvider } from '../scenarios/ScenarioContext'
import { ThemeProvider } from '../theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Context>
      <Suspense fallback={null}>
        <ScenarioProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ScenarioProvider>
      </Suspense>
    </Context>
  )
}
```

### Use components and icons

```tsx
import { Box, Button, Typography } from '@aivenio/aquarium'
import helpIcon from '@aivenio/aquarium/icons/help'

<Button icon={helpIcon}>Help</Button>
```

Browse all components at https://aquarium.aiven.io — names match Figma (`Inputs/Button`, `Data display/Chip`, etc.).

### Use design tokens (not hex colors)

```tsx
<Box style={{
  padding: 24,
  gap: 16,
  backgroundColor: 'var(--aquarium-background-color-layer)',
  border: '1px solid var(--aquarium-border-color-muted)',
  color: 'var(--aquarium-text-color-default)',
}} />
```

### Font

Aquarium recommends [Inter](https://fonts.google.com/specimen/Inter). This playground currently uses **system fonts** in `src/index.css` (`system-ui, Avenir, Helvetica, Arial, sans-serif`). That is enough for prototyping; add Inter only if you need closer parity with production Console.

### Dark mode

The project includes `src/theme/ThemeProvider.tsx` (exported from `src/theme`). It toggles the class `aquarium-theme-dark` on `<html>` for dark theme tokens.

---

## How Next.js fits in

You do **not** install Next.js globally. It arrives via `npm install` as a dependency. This project uses **Next.js 16**.

| File | Role |
|------|------|
| `next.config.ts` | Next config — static export (`output: 'export'` → `out/`), SVG loader rules |
| `src/app/layout.tsx` | Root layout — imports Aquarium CSS + `Providers` |
| `src/app/providers.tsx` | Client providers — Aquarium `Context`, scenario + theme providers |
| `src/app/page.tsx` | Prototype Hub homepage (`/`) |
| `src/app/console/**` | Console routes (services, billing, org, onboarding) |
| `src/app/experiments/[owner]/[slug]/page.tsx` | Experiment launcher |
| `package.json` → `"dev": "next dev --port 5173"` | Script that starts the dev server on port 5173 |

> The project is configured for **static export**, so `npm run build` produces a fully static `out/` folder (no Node server needed at runtime). Tests use **Vitest**, which is why `vite`/`vitest` still appear in `devDependencies`. Production is served by nginx in Aiven Application on port **8080**.

### Starting from zero (optional — not needed if you cloned)

If you ever need a fresh Next.js + TypeScript app:

```bash
npx create-next-app@latest my-prototype --typescript
cd my-prototype
npm install @aivenio/aquarium
```

Then wire Aquarium as described above.

---

## Project rules & DS documentation

Read these **before** building new screens or asking AI to implement UI:

| File | Purpose |
|------|---------|
| [`AGENTS.md`](../AGENTS.md) | Design Police persona + full AI workflow (read Figma → audit → plan → execute → verify), Figma file keys, 8px grid, token rules |
| [`.cursor/rules/playground-rules.mdc`](../.cursor/rules/playground-rules.mdc) | Edit-scope safety, experiment structure, reuse rules, deployment |
| [`.cursor/rules/experiment-previews.md`](../.cursor/rules/experiment-previews.md) | How experiment preview thumbnails are generated |
| [`.cursor/rules/component-map.md`](../.cursor/rules/component-map.md) | Console → Aquarium component mapping reference |
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

> **Note:** `@aivenio/aquarium` installs from the **public npm registry**. You do **not** need an npm token or private registry to run this playground. The [aiven-design](https://github.com/aiven/aiven-design) repo is only needed if you want to read full DS documentation or contribute to the library itself.
