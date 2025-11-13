# Google OAuth Login Failure – 2025-11-13

## Incident Summary
- **Symptom**: Clicking “Continue with Google” opened the Google consent screen but, after granting access, users returned to `/us/login` still unauthenticated. The popup showed “Google sign-in successful” with no lasting session.
- **Impact**: Storefront shoppers and admins could not use Google SSO in production or via the Cloudflare tunnel dev domain.
- **Duration**: Approximately 24 hours (2025-11-12 17:00 UTC – 2025-11-13 17:30 UTC) while we iterated on the new OAuth flow.

## Timeline
1. **11/12 17:00 UTC** – First production test of the new Google button failed; Medusa returned 500 during `/auth/customer/google/callback`.
2. **11/12 18:30 UTC** – Added extensive debug endpoints (`/api/debug/token|session|me`) in the Next.js storefront and confirmed Medusa was issuing JWTs without `actor_id`, leading to `/store/customers/me` 401.
3. **11/12 20:00 UTC** – Medusa container kept crashing with `Cannot find module '@medusajs/customer'`; traced to the Docker image not hoisting PNPM modules and missing `NODE_PATH`.
4. **11/13 00:30 UTC** – Rebuilt Dockerfile with hoisted linker, explicit `NODE_PATH`, and `CI=true`; container stayed up but the custom callback still used TypeORM imports that are unavailable in v2.
5. **11/13 02:30 UTC** – Replaced TypeORM repository usage with the Medusa Customer module service, added defensive param parsing, and instrumented error logs.
6. **11/13 03:30 UTC** – Rebuilt image + redeployed. Dev domain began receiving JWTs with valid `actor_id`, but production still failed because the callback response was not saving the session cookie consistently.
7. **11/13 04:00 UTC** – Ensured frontend popup flow POSTS the token to `/api/auth/session`, revalidates cart, and clears the state cookie. After redeploy, both dev and prod reported success.

## Root Cause
- The custom Medusa OAuth callback attempted to reach directly into `@medusajs/medusa/dist/models/customer` through TypeORM. The Docker image no longer bundles those legacy models, so the import failed at runtime. Even after shimming, the repository path bypassed the module system, causing empty `actor_id` fields.
- Docker image layout: PNPM’s default isolated linker meant `@medusajs/customer` lived under `.pnpm/node_modules`, outside Node’s module resolution path inside the production container. Without `NODE_PATH` + hoisting, Medusa never loaded the package.
- Frontend assumed the callback would set cookies directly; in popup mode it needs an explicit `/api/auth/session` write before the opener reloads. Without it, the session cleared as soon as the popup closed.

## Fixes Implemented
1. **Docker hardening**
   - Switched both builder and runner stages to `PNPM_NODE_LINKER=hoisted`, exported the correct `NODE_PATH`, and set `CI=true` so `pnpm install --prod` can run non-interactively.
   - Removed brittle manual copying of nested `.pnpm` folders; `pnpm install --filter medusa --prod` now populates `node_modules/@medusajs/*` correctly.
2. **Callback rewrite**
   - Callback now resolves the Medusa customer service via `req.scope.resolve(Modules.CUSTOMER)` and uses `listCustomers`/`createCustomers` APIs.
   - JWT payload includes `actor_id`, `actor_type`, provider metadata, and we log structured errors for both GET/POST handlers.
3. **Frontend session flow**
   - Popup callback sets `_medusa_jwt`, posts the token to `/api/auth/session`, revalidates the “customers” cache tag, and transfers the cart before redirecting.
   - Added `/api/debug/token|session|me` helpers to quickly inspect JWT contents and Medusa responses from any environment.

## Lessons / Follow-ups
1. **Always prefer Medusa modules over manual repositories** – The new v2 modules already expose `create/list` helpers; skipping them caused both build failures and missing data in JWTs. When touching core data, resolve via `Modules.*`.
2. **Docker images need explicit module paths** – PNPM’s default “isolated” layout breaks `require()` unless `NODE_PATH` includes `.pnpm/node_modules`. Template this in all backend Dockerfiles to avoid future “Cannot find module” incidents.
3. **Instrument OAuth flows up front** – The popup sequence only became debuggable after we added `/api/debug/*` endpoints and postMessage logging. Make this a standard checklist item whenever introducing a new auth provider.
4. **Document dev/prod parity steps** – The Cloudflare tunnel uncovered the missing session write before production did. Keep the dev playbook (docs/basic/local-dev-with-cloudflare-tunnel.md) updated and link it from onboarding so others can reproduce issues locally.
5. **Regression guard** – Add an automated smoke test (Playwright) that exercises Google login end-to-end against the staging environment, asserting that `_medusa_jwt` includes a non-empty `actor_id` and `/store/customers/me` returns 200.

With these fixes deployed, both prod (`prd.aidenlux.com`) and tunnel (`dev.aidenlux.com`) domains now complete Google SSO and load `/us/account` without manual refreshes.
