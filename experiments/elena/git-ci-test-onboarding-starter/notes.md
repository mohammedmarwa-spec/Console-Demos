# Git CI test — onboarding starter

## Hypothesis

Hiding plan/cloud customization behind **Show advanced settings** (collapsed by default) makes the create-test-environment path feel shorter without removing power-user options.

## What changed

- Scaffolded from `onboarding-starter` template
- Updated `pageMeta` title/description
- Custom `ShortOnboarding` screen in this folder only:
  - Shorter headline + supporting copy
  - Recommended Free plan + create CTA stay primary
  - “Customize plan and cloud” (opens existing creation modal / price logic) lives under advanced settings
- Reuses `_shared` onboarding shell + catalog; playground create/skip/modal wiring unchanged

## Out of scope

- No edits to reusable scenarios or shared shell
- Price calculation still uses existing playground/create-service logic
