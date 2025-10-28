## Summary

- CI: adds Quick Check gate to lint/typecheck only changed packages before heavy jobs.
- Developer perf runbook added.

## Developer Performance

- See docs/runbooks/developer-performance.md for:
  - pnpm quick-check (fast lint/typecheck on changed packages)
  - pnpm build:quick (low-concurrency build on changed packages)
  - Local resource limit tips (TURBO_CONCURRENCY, NODE_OPTIONS)

## Validation Notes

- Quick Check passes locally: `pnpm quick-check`.
- Lint/typecheck warnings only; no blocking errors expected.

