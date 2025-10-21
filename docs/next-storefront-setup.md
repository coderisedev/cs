# Next.js 15 Storefront Setup

This document captures the agreed workflow for scaffolding a custom Next 15 storefront that aligns with the
solution architecture.

## 1. Scaffold Application

- Run `pnpm dlx create-next-app@latest apps/storefront --typescript --app --src-dir --tailwind --eslint --use-pnpm --import-alias "@/*"`.
- Accept defaults, decline the example API route, and ensure the App Router scaffold is created.
- Pin framework versions in `apps/storefront/package.json`: `"next": "15.0.0-canary"`, `"react": "18.3.1"`, `"react-dom": "18.3.1"`.

## 2. Workspace Wiring

- Execute `pnpm install` from the repo root so the new app participates in the monorepo lockfile.
- Update `pnpm-workspace.yaml` and `turbo.json` to include `apps/storefront` in lint/build/dev pipelines.
- Add `apps/storefront/.env.local` with:
  ```
  NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
  NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
  ```

## 3. Verify Baseline

- From `apps/storefront`, run `pnpm lint` and `pnpm dev` to confirm the scaffold compiles under Next 15.
- Test Tailwind by editing `src/app/page.tsx` and verifying utility classes render as expected.

## 4. Medusa & Strapi Integration

- Install core dependencies: `pnpm add @medusajs/medusa-js @tanstack/react-query zustand` within `apps/storefront`.
- Choose the Strapi client strategy:
  - REST: `pnpm add axios zod`
  - GraphQL: `pnpm add graphql-request`
- Create API wrappers under `src/lib/medusa.ts` and `src/lib/strapi.ts` that read `NEXT_PUBLIC_*` env variables.
- Add server actions or route handlers (for example `src/app/api/medusa/products/route.ts`) to proxy Medusa requests through the Next BFF layer.
- Introduce a query provider (for example `src/providers/query-provider.tsx`) to hydrate React Query in client components.

## 5. Design System Foundation

- Initialize Shadcn UI via `pnpm dlx shadcn-ui@latest init`.
- Align Tailwind tokens and global styles with the UX specification.
- Scaffold layout directories (`src/app/(marketing)`, `src/app/(commerce)`) and shared components (`src/components/layouts`).

## 6. Ongoing Validation

- Re-run `pnpm lint` and `pnpm dev` after major changes to catch regressions early.
- Optionally configure Turborepo tasks so `pnpm dev --filter storefront` bootstraps the Next app alongside Medusa and Strapi.

Following these steps keeps the storefront implementation in lockstep with the architectural decisions documented in
`docs/solution-architecture.md` while leaving room to iterate on commerce, content, and shared design system features.
