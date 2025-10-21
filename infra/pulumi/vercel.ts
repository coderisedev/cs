import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { join } from "path";

import { deployService, syncVariables } from "./apps/railway";

const projectConfig = new pulumi.Config();
const baseProjectName = projectConfig.get("projectName") ?? "cs";
const domainName = projectConfig.require("domainName");
const repoOwner = projectConfig.get("repoOwner") ?? "cockpitsimulator";
const repoName = projectConfig.get("repoName") ?? "cs";
const productionBranch = projectConfig.get("productionBranch") ?? "main";
const stagingBranch = projectConfig.get("stagingBranch") ?? "staging";

const vercelConfig = new pulumi.Config("vercel");
const apiToken = vercelConfig.requireSecret("token");
const teamId = vercelConfig.get("teamId");

const provider = new vercel.Provider("vercel-provider", {
  apiToken,
  team: teamId,
});

const stackName = pulumi.getStack();
const railwayConfig = new pulumi.Config("railway");
const repoRoot = join(__dirname, "..", "..", "..");

interface EnvironmentVariableSpec {
  key: string;
  value: pulumi.Input<string>;
  targets?: pulumi.Input<pulumi.Input<string>[]>;
}

function createProject(args: {
  displayName: string;
  branch: string;
  env: EnvironmentVariableSpec[];
  domain?: pulumi.Input<string>;
  rootDirectory?: string;
  buildCommand?: string;
}) {
  const project = new vercel.Project(`${args.displayName}-project`, {
    name: args.displayName,
    framework: "nextjs",
    rootDirectory: args.rootDirectory ?? "apps/storefront",
    buildCommand: args.buildCommand ?? "pnpm run build",
    gitRepository: {
      type: "github",
      repo: `${repoOwner}/${repoName}`,
      productionBranch: args.branch,
    },
  }, { provider });

  const envVars = args.env.map((variable, index) =>
    new vercel.ProjectEnvironmentVariable(`${args.displayName}-env-${index}`, {
      projectId: project.id,
      key: variable.key,
      value: variable.value,
      targets: variable.targets ?? ["production"],
    }, { provider })
  );

  const domain = args.domain
    ? new vercel.ProjectDomain(`${args.displayName}-domain`, {
        projectId: project.id,
        domain: args.domain,
      }, { provider })
    : undefined;

  return { project, envVars, domain };
}

let staging: ReturnType<typeof createProject> | undefined;
let production: ReturnType<typeof createProject> | undefined;

if (stackName === "staging") {
  staging = createProject({
    displayName: `${baseProjectName}-staging`,
    branch: stagingBranch,
    domain: `staging.${domainName}`,
    rootDirectory: "apps/storefront",
    buildCommand: "pnpm run build",
    env: [
      { key: "NODE_ENV", value: "staging" },
      { key: "NEXT_PUBLIC_API_URL", value: `https://staging-api.${domainName}` },
    ],
  });
} else if (stackName === "production") {
  production = createProject({
    displayName: `${baseProjectName}-production`,
    branch: productionBranch,
    domain: domainName,
    rootDirectory: "apps/storefront",
    buildCommand: "pnpm run build",
    env: [
      { key: "NODE_ENV", value: "production" },
      { key: "NEXT_PUBLIC_API_URL", value: `https://api.${domainName}` },
    ],
  });
} else {
  staging = createProject({
    displayName: `${baseProjectName}-staging`,
    branch: stagingBranch,
    domain: `staging.${domainName}`,
    rootDirectory: "apps/storefront",
    buildCommand: "pnpm run build",
    env: [
      { key: "NODE_ENV", value: "staging" },
      { key: "NEXT_PUBLIC_API_URL", value: `https://staging-api.${domainName}` },
    ],
  });

  production = createProject({
    displayName: `${baseProjectName}-production`,
    branch: productionBranch,
    domain: domainName,
    rootDirectory: "apps/storefront",
    buildCommand: "pnpm run build",
    env: [
      { key: "NODE_ENV", value: "production" },
      { key: "NEXT_PUBLIC_API_URL", value: `https://api.${domainName}` },
    ],
  });
}

const empty = pulumi.output<string | null>(null);

export const stagingProjectId = staging ? staging.project.id : empty;
export const productionProjectId = production ? production.project.id : empty;
export const stagingProjectName = staging ? staging.project.name : empty;
export const productionProjectName = production ? production.project.name : empty;

export const stagingDeploymentUrl = staging
  ? pulumi.interpolate`https://${staging.project.name}.vercel.app`
  : empty;
export const productionDeploymentUrl = production
  ? pulumi.interpolate`https://${production.project.name}.vercel.app`
  : empty;
export const stagingCustomDomain = staging
  ? pulumi.output(`https://staging.${domainName}`)
  : empty;
export const productionCustomDomain = production
  ? pulumi.output(`https://${domainName}`)
  : empty;

type RuntimeEnvironment = "staging" | "production";

function getVariables(
  service: string,
  environment: RuntimeEnvironment,
): Record<string, pulumi.Input<string>> | undefined {
  const key = `${service}Variables-${environment}`;
  const vars = railwayConfig.getObject<Record<string, string>>(key);
  if (!vars || Object.keys(vars).length === 0) {
    return undefined;
  }
  return vars;
}

function configureRailway(environment: RuntimeEnvironment) {
  const medusaVars = getVariables("medusa", environment);
  const strapiVars = getVariables("strapi", environment);

  const medusaVarSync = medusaVars
    ? syncVariables({
        serviceName: "medusa",
        environment,
        variables: medusaVars,
      })
    : undefined;

  const strapiVarSync = strapiVars
    ? syncVariables({
        serviceName: "strapi",
        environment,
        variables: strapiVars,
      })
    : undefined;

  deployService(
    {
      serviceName: "medusa",
      sourcePath: join(repoRoot, "apps", "medusa"),
      environment,
    },
    medusaVarSync ? { dependsOn: [medusaVarSync] } : undefined,
  );

  deployService(
    {
      serviceName: "strapi",
      sourcePath: join(repoRoot, "apps", "strapi"),
      environment,
    },
    strapiVarSync ? { dependsOn: [strapiVarSync] } : undefined,
  );
}

if (stackName === "staging" || stackName === "production") {
  configureRailway(stackName);
} else {
  configureRailway("staging");
  configureRailway("production");
}
