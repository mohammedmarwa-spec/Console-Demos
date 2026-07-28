# Experiment preview thumbnails

When you edit an experiment under `experiments/<owner>/<slug>/` (or a template under `experiments/_templates/<slug>/`), regenerate its hub thumbnail before finishing.

## After editing an experiment

1. Run:
   ```bash
   npm run preview:shot -- <owner>/<slug>
   ```
2. Stage the generated PNG:
   ```bash
   git add public/experiment-previews/<owner>/<slug>.png
   ```

Example:
```bash
npm run preview:shot -- elena/first-time-user
git add public/experiment-previews/elena/first-time-user.png
```

Templates use the same flow with owner `_templates`:
```bash
npm run preview:shot -- _templates/onboarding-starter
git add public/experiment-previews/_templates/onboarding-starter.png
```

## Notes

- Previews are captured in **light mode** by default (Playwright sets theme preference + `colorScheme`).
- Pre-commit hook also runs this automatically for staged experiment/template changes.
- Use `git commit --no-verify` to skip preview generation when needed.
- One-time setup: `npx playwright install chromium` (after `npm install`).
