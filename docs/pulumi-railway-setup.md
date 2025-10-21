# Pulumi + Railway Setup Guide

## Prerequisites
- **Pulumi CLI** ≥ 3.x installed and logged in (`pulumi login`).
- **Node.js** 20.x (already used in this repository).
- **Railway CLI** (`npm install -g railway`) with an authenticated session:
  ```bash
  railway login
  railway init --token    # generate a long-lived token for automation
  ```
- Operating from `infra/pulumi/` within the repository.

## Step 1: Install Pulumi Command Provider
```bash
cd infra/pulumi
npm install @pulumi/command@^0.10.0 @pulumi/pulumi@^3 --save
npm install @types/node@^20 typescript@^5 --save-dev
```

## Step 2: Store Railway Credentials in Pulumi Config
Set stack-specific secrets for staging and production:
```bash
# Staging
pulumi config set --secret railway:apiToken "<staging-api-token>" -s staging
pulumi config set railway:projectId "<railway-project-id-staging>" -s staging

# Production
pulumi config set --secret railway:apiToken "<production-api-token>" -s production
pulumi config set railway:projectId "<railway-project-id-production>" -s production
```
*Tip:* Pre-create Railway projects via the dashboard and copy their IDs.

## Step 3: Create a Railway Component Wrapper
Add a helper (e.g., `infra/pulumi/apps/railway.ts`) that calls the Railway CLI through the command provider:
```ts
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";

const cfg = new pulumi.Config("railway");
const apiToken = cfg.requireSecret("apiToken");
const projectId = cfg.require("projectId");

const baseEnv = {
  RAILWAY_TOKEN: apiToken,
  RAILWAY_PROJECT: projectId,
};

export function deployService(args: {
  serviceName: string;
  sourcePath: string;
  environment: "staging" | "production";
}) {
  return new command.local.Command(
    `${args.serviceName}-${args.environment}-deploy`,
    {
      create: `railway up --service ${args.serviceName} --branch ${args.environment}`,
      environment: {
        ...baseEnv,
        RAILWAY_SERVICE_ENVIRONMENT: args.environment,
      },
      dir: args.sourcePath,
    },
  );
}
```
Extend with additional commands (variables sync, status checks, rollbacks) as needed.

## Step 4: Wire Into the Stack Program
In your Pulumi stack (e.g., `vercel.ts` or `index.ts`):
```ts
import { deployService } from "./apps/railway";

const stack = pulumi.getStack(); // staging or production

deployService({
  serviceName: "medusa",
  sourcePath: "../..",     // repo root
  environment: stack,
});

deployService({
  serviceName: "strapi",
  sourcePath: "../..",
  environment: stack,
});
```
Add supplementary commands for provisioning database add-ons (`railway addon connect`) or linking services as required.

## Step 5: Sync Environment Variables
Example command to push secrets sourced from Story 1.2 templates:
```ts
new command.local.Command("medusa-secrets", {
  create: `railway variables set --service medusa --env ${stack} $(cat scripts/env/medusa-${stack}.env)`,
  environment: baseEnv,
  dir: "../../", // repo root containing env templates
});
```
Ensure sensitive values come from Pulumi config or pipeline secrets; never commit real credentials.

## Step 6: Update CI Workflow
Create or extend `.github/workflows/deploy-services.yml`:
```yaml
- name: Install Railway CLI
  run: npm install -g railway

- name: Pulumi Up (staging)
  env:
    PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_STAGING_TOKEN }}
  run: |
    cd infra/pulumi
    npm ci
    pulumi stack select staging
    pulumi up --yes
```
Repeat for production (branch filter `main`). Append steps to call `railway status` and upload logs so GitHub checks show pass/fail.

## Step 7: Validation
1. Run `pulumi preview -s staging` locally to confirm commands execute and show expected diffs.
2. Execute `pulumi up -s staging` to provision resources.
3. Push a test branch—CI should run the workflow, surface Railway deployment logs, and gate merges on failures.

## Alternative: Script Bridge
If you prefer TypeScript scripts:
1. Implement provisioning logic in `scripts/deploy-railway.ts`.
2. Use the command provider to invoke it:
   ```ts
   new command.local.Command("deploy-railway", {
     create: "node ../../scripts/deploy-railway.js",
     environment: baseEnv,
     dir: "infra/pulumi",
   });
   ```
This keeps orchestration declarative while encapsulating CLI logic in a dedicated script.

---
Once these steps are in place, the developer workflow can perform Story 1.6 tasks end-to-end (Pulumi provisioning, deployment automation, secrets synchronization, and testing). Run `pulumi preview` regularly and ensure tokens stay encrypted via Pulumi config secrets.

> **Known issue (Oct 2025):** The Railway CLI occasionally returns `404 Not Found` while uploading build archives via `railway up`. When this happens, confirm that project deploy tokens have `Deploy` scope and retry. If the error persists, fall back to the Railway web UI or raise a support ticket before re-running Pulumi.

## Step 8: Configure Strapi for PostgreSQL
- In the Railway console, add a PostgreSQL database and capture its credentials (host, port, database, user, password, connection string).
- Set these variables on the Strapi service (staging/production as appropriate):
  - `DATABASE_CLIENT=postgres`
  - `DATABASE_URL` (full Railway connection string) or individual values (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`)
  - Optional SSL controls (default: enabled when `DATABASE_URL` exists): `DATABASE_SSL=true`, `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
  - Provide `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, and other Strapi secrets per Story 1.2 templates.
- The Strapi config now defaults to PostgreSQL whenever `DATABASE_URL` is present, so no additional code changes are required after environment variables are set.
- **Medusa Scripts:**  
  - Build: `./scripts/railway-medusa-build.sh` (installs pnpm if needed, then runs `pnpm --filter medusa build`)  
  - Start: `./scripts/railway-medusa-start.sh` (changes into `apps/medusa` and executes `npx medusa start`)  
  Set these in Railway so Medusa uses the same monorepo tooling.
