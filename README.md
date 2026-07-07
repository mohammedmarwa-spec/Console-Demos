# Console Prototype Lab

Shared design playground for the Aiven design team — interactive Console-like prototypes with mock data, scenario switching, and experiment folders for safe AI-assisted exploration.

**Not production Console.** Mock data only. Deployed via [Aiven Application](docs/how-to-deploy.md).

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — **Prototype Hub** at `/`, console at `/console/*`. Press **Shift+S** for the scenario panel inside console routes.

## Docs

- [Playground overview](docs/README.md)
- [Setup guide for designers](docs/SETUP.md)
- [Create a prototype experiment](docs/how-to-create-prototype.md)
- [Deploy to Aiven Application](docs/how-to-deploy.md)
- [Contribution guide](docs/contribution-guide.md)

## Stack

- Next.js App Router (static export) + React + TypeScript
- [@aivenio/aquarium](https://www.npmjs.com/package/@aivenio/aquarium) design system
- Scenario registry + experiment folders
- Docker/nginx static deploy on port 8080
