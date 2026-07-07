# Shorter create service flow

**Owner:** Elena  
**Source scenario:** `onboarding-test-env` (Create test environment)  
**Status:** Rough experiment

## Hypothesis

A shorter create-service flow where advanced settings are hidden by default will feel faster for first-time users without losing necessary control.

## What changed

- Experiment registered in the playground registry
- Uses the same runtime as Create test environment (`onboarding-test-env`)
- Future UI overrides should live in `overrides/` within this folder only

## How to iterate

Ask Cursor Agent to modify only files under `src/experiments/elena/shorter-create-service/`.

Do not edit the reusable `onboarding-test-env` scenario.
