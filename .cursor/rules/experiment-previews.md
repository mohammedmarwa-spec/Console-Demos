# Experiment preview thumbnails

When you edit an experiment under `experiments/<owner>/<slug>/`, regenerate its hub thumbnail before finishing.

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

## Notes

- Pre-commit hook also runs this automatically for staged experiment changes.
- Use `git commit --no-verify` to skip preview generation when needed.
- One-time setup: `npx playwright install chromium` (after `npm install`).
