# DJI Storefront Branching & Validation Guide

## Deployment Context
- `main` is wired to Vercel production. Anything merged deploys automatically.
- Team size: two engineers. Favor lightweight flow over full Gitflow.

## Recommended Branching Model
1. Keep `main` protected and always releasable.
2. For each task, branch directly from `main` (`git checkout -b feature/<slug>`).
3. Open a PR targeting `main`, get review + checks, then squash/rebase merge.
4. Vercel auto‑deploys a preview per PR and production on merge.
5. If you want an extra buffer, optionally add a shared `staging` branch and point a Vercel Preview env to it. Developers still branch from `main`, but PRs merge into `staging`, and you fast-forward `main` once staging looks good. Only add this if you need manual release control; full Gitflow (`develop`, release branches, hotfix branches) is overkill for this repo.

## Validation Checklist for PRs
1. **Vercel Preview**
   - Every PR gets an automatic preview URL once the build finishes (shown on the PR page).
   - Open the link, navigate key pages (`/`, `/products`, `/collections/...`) and ensure UI/UX matches expectations.
   - Note the result in the PR body, e.g., `Vercel preview: ✅ https://cs-feature-xyz.vercel.app`.
2. **Local Lint/Sanity Checks**
   - Run required commands before requesting review. Typical set:
     ```bash
     # YAML workflows
     yamllint bmad/bmm/workflows

     # Task XML definitions (scope down to changed files when possible)
     xmllint --noout bmad/bmm/tasks/<file>.xml

     # Frontend code checks when touching the storefront
     pnpm --filter apps/dji-storefront lint
     pnpm --filter apps/dji-storefront test   # optional but recommended for logic changes
     ```
   - Fix any errors and rerun until clean.
   - Document the results in the PR description, e.g.:
     ```
     Validation:
     - [x] Vercel preview: https://cs-feature-xyz.vercel.app
     - [x] yamllint bmad/bmm/workflows
     - [x] xmllint --noout bmad/bmm/tasks/new-task.xml
     - [x] pnpm --filter apps/dji-storefront lint
     ```

Following this loop keeps production stable while maintaining fast iteration for the two-person team.
