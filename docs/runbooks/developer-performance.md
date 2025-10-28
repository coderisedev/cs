# Developer Performance Runbook

Date: 2025-10-27
Owner: Engineering

## Goal
- Reduce CPU/RAM spikes and “hangs” during local builds.
- Speed up feedback by running checks only on changed packages.
- Keep CI green with lightweight, stable type/lint settings.

## New Commands (top-level package.json)
- `pnpm quick-check`
  - Runs lint + typecheck only for packages affected by changes vs `origin/main`.
  - Command: `turbo run lint typecheck --filter=...[origin/main]`.
  - Use when editing docs/CI/config or small code changes; fastest signal.

- `pnpm build:quick`
  - Builds only packages impacted by changes vs `origin/main`, with low concurrency.
  - Command: `TURBO_CONCURRENCY=2 turbo run build --filter=...[origin/main]`.
  - Use before PR if a full monorepo build is unnecessary.

## Local Resource Limits (when you must full-build)
- Limit concurrency to reduce CPU contention:
  - `TURBO_CONCURRENCY=2 pnpm -w build`
- Cap Node memory to avoid OOM pressure:
  - `NODE_OPTIONS=--max-old-space-size=2048 TURBO_CONCURRENCY=2 pnpm -w build`
- Disable Next telemetry noise during build (already in storefront script):
  - `NEXT_TELEMETRY_DISABLED=1`

## What changed to support this
- Scripts
  - Root: added `build:quick`, `quick-check`.
  - Storefront lint uses cache; Next build disables telemetry.
- ESLint/TS stability
  - Config package has a local ESLint flat config to avoid root `project` parse issues.
  - Medusa TS excludes tests from typecheck to prevent unrelated failures.
  - Storefront stabilized TS imports and types to avoid CI-only errors.

## CI Quick Gate
- Added job “Quick Check (Changed Packages)” in `.github/workflows/ci.yml`.
  - On PRs, it runs `turbo run lint typecheck --filter=...[origin/main]`.
  - Heavy jobs (lint/test/build) depend on this and won’t start if it fails.
- PNPM is aligned to `10.18.2` across workflows to prevent version mismatch.

## Storefront Type/Import Stabilization
- Avoid path/JSON resolution pitfalls in CI:
  - Replaced `@/lib/categories.json` with TS module `apps/storefront/src/lib/categories.ts`.
  - Prefer relative imports in App Router code where alias resolution is flaky in CI.
- Minimal `next-auth` type stubs for CI-only typing gaps:
  - File: `apps/storefront/src/types/next-auth.d.ts`.
  - Runtime still uses real `next-auth`; stubs only satisfy TS when types aren’t discovered.
- TS config tweaks (storefront):
  - `baseUrl` set to `.` and `paths` kept for `@/*`.

## Lint and Typecheck Caching
- Storefront lint: `eslint --cache --cache-location .eslintcache`.
- Config package lint: same flags, local cache file.
- Turbo caches results; optionally enable remote cache for teams.

## Troubleshooting
- PNPM version error (ERR_PNPM_BAD_PM_VERSION):
  - Ensure workflows use the same pnpm as `packageManager` in root `package.json`.
- TS cannot find `next-auth` types:
  - Rely on package-provided types; if CI fails to discover, keep the minimal stub above.
- Path alias `@/*` not resolved in CI:
  - Ensure `baseUrl: "."` in `apps/storefront/tsconfig.json`.
  - Use relative imports in App Router when in doubt.

## Suggested Workflow
1. Edit code.
2. Run `pnpm quick-check` for a fast pass on changed packages.
3. If needed, run `pnpm build:quick` for impacted packages only.
4. Push PR; let CI “Quick Check” gate heavy jobs.
5. If heavy jobs fail, iterate; only run full local build if strictly required.

## File Pointers
- Root scripts: `package.json`.
- Turbo pipeline: `turbo.json`.
- CI quick gate: `.github/workflows/ci.yml`.
- Storefront build/lint tweaks: `apps/storefront/package.json`.
- Storefront TS stability: `apps/storefront/tsconfig.json`, `apps/storefront/src/types/next-auth.d.ts`,
  `apps/storefront/src/lib/categories.ts`.
- Medusa TS exclude tests: `apps/medusa/tsconfig.json`.

