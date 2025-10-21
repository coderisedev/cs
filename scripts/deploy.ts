#!/usr/bin/env node

import { execSync } from "child_process";
import { appendFileSync } from "fs";
import { join } from "path";

interface DeploymentConfig {
  projectId: string;
  projectName: string;
  environment: "staging" | "production";
  branch: string;
  domain?: string;
}

interface PulumiStackOutput {
  stagingProjectId?: string;
  stagingProjectName?: string;
  productionProjectId?: string;
  productionProjectName?: string;
  stagingUrl?: string;
  productionUrl?: string;
  stagingDomainUrl?: string;
  productionDomainUrl?: string;
}

function main() {
  const args = process.argv.slice(2);
  const environment = args[0] as "staging" | "production";
  const branch = args[1];

  if (!environment || !branch) {
    console.error("Usage: npm run deploy <staging|production> <branch>");
    process.exit(1);
  }

  console.log(`🚀 Starting deployment to ${environment} from branch: ${branch}`);

  try {
    // Get Pulumi stack outputs
    const pulumiOutput = getPulumiStackOutput(environment);

    const config: DeploymentConfig = {
      projectId: environment === "staging"
        ? pulumiOutput.stagingProjectId
        : pulumiOutput.productionProjectId,
      projectName: environment === "staging"
        ? pulumiOutput.stagingProjectName
        : pulumiOutput.productionProjectName,
      environment,
      branch,
      domain: environment === "staging"
        ? pulumiOutput.stagingDomainUrl
        : pulumiOutput.productionDomainUrl,
    };

    if (!config.projectId || !config.projectName) {
      throw new Error(`Project configuration not found for ${environment} environment`);
    }

    console.log(`📦 Deploying to project: ${config.projectId}`);

    // Deploy using Vercel CLI and capture JSON output
    console.log(`🚀 Deploying to ${environment}...`);
    const vercelArgs = [
      "npx",
      "vercel",
      "deploy",
      "--prod",
      "--json",
      "--yes",
      `--project=${config.projectName}`,
      process.env.VERCEL_TEAM_ID ? `--scope=${process.env.VERCEL_TEAM_ID}` : undefined,
      process.env.VERCEL_TOKEN ? `--token=${process.env.VERCEL_TOKEN}` : undefined,
    ].filter(Boolean) as string[];

    const vercelOutput = execSync(vercelArgs.join(" "), {
      cwd: "apps/web",
      stdio: "pipe",
      env: {
        ...process.env,
        VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
        VERCEL_PROJECT_ID: config.projectId,
        NODE_ENV: environment,
      },
      encoding: "utf-8",
    });

    const deploymentResult = JSON.parse(vercelOutput.trim());
    const deploymentUrl: string = deploymentResult.url || config.domain || "";
    const deploymentId: string | undefined = deploymentResult.id || deploymentResult.deploymentId;

    console.log(`✅ Deployment completed successfully!`);
    console.log(`🌐 Environment: ${environment}`);
    console.log(`🔗 URL: ${deploymentUrl}`);
    console.log(`📋 Branch: ${branch}`);

    writeGitHubOutput("url", deploymentUrl);
    writeGitHubOutput("environment", environment);
    writeGitHubOutput("project_id", config.projectId);
    if (deploymentId) {
      writeGitHubOutput("deployment_id", deploymentId);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

function getPulumiStackOutput(environment: "staging" | "production"): PulumiStackOutput {
  try {
    const stackName = process.env.PULUMI_STACK_NAME
      ? process.env.PULUMI_STACK_NAME
      : environment === "staging" ? "staging" : "production";
    const pulumiDir = join(process.cwd(), "infra/pulumi");
    const outputJson = execSync(`pulumi stack output --stack ${stackName} --json`, {
      cwd: pulumiDir,
      stdio: "pipe",
      encoding: "utf-8",
    });
    return JSON.parse(outputJson) as PulumiStackOutput;
  } catch (error) {
    console.warn("⚠️ Could not read Pulumi stack outputs, falling back to environment variables", error);
    return {
      stagingProjectId: process.env.VERCEL_STAGING_PROJECT_ID,
      stagingProjectName: process.env.VERCEL_STAGING_PROJECT_NAME,
      productionProjectId: process.env.VERCEL_PRODUCTION_PROJECT_ID,
      productionProjectName: process.env.VERCEL_PRODUCTION_PROJECT_NAME,
      stagingUrl: process.env.VERCEL_STAGING_URL,
      productionUrl: process.env.VERCEL_PRODUCTION_URL,
      stagingDomainUrl: process.env.VERCEL_STAGING_DOMAIN_URL,
      productionDomainUrl: process.env.VERCEL_PRODUCTION_DOMAIN_URL,
    };
  }
}

function writeGitHubOutput(name: string, value?: string) {
  if (!value || !process.env.GITHUB_OUTPUT) {
    return;
  }
  appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

if (require.main === module) {
  main();
}
