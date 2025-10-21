import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";

/**
 * Railway deployment helpers executed via Pulumi.
 * Uses the Railway CLI behind the command provider so IaC runs declaratively.
 */

const railwayConfig = new pulumi.Config("railway");
const projectId = railwayConfig.require("projectId");
const defaultToken = railwayConfig.requireSecret("apiToken");

function tokenForEnvironment(env: "staging" | "production"): Output<string> {
  const specific = railwayConfig.getSecret(`${env}Token`);
  return secret(
    specific ?? defaultToken,
  );
}

export interface DeployServiceArgs {
  serviceName: string;
  environment: "staging" | "production";
  sourcePath?: string;
  additionalEnv?: Record<string, pulumi.Input<string>>;
}

/**
 * Deploys a Railway service by invoking `railway up` for the target branch.
 * The command resource gives Pulumi dependency tracking and log capture.
 */
export function deployService(
  args: DeployServiceArgs,
  opts?: pulumi.CustomResourceOptions,
) {
  return new command.local.Command(
    `${args.serviceName}-${args.environment}-deploy`,
    {
      create: interpolate`RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway up --service ${args.serviceName} --environment ${args.environment} --ci`,
      update: interpolate`RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway up --service ${args.serviceName} --environment ${args.environment} --ci`,
      delete: interpolate`RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway down --service ${args.serviceName} --environment ${args.environment}`,
      dir: args.sourcePath ?? ".",
      triggers: [args.serviceName, args.environment],
    },
    opts,
  );
}

export interface SyncVariablesArgs {
  serviceName: string;
  environment: "staging" | "production";
  variables: pulumi.Input<Record<string, pulumi.Input<string>>>;
}

/**
 * Synchronises environment variables to Railway using `railway variables set`.
 * Values should come from Pulumi config or other managed secrets.
 */
export function syncVariables(
  args: SyncVariablesArgs,
  opts?: pulumi.CustomResourceOptions,
) {
  const flattened = pulumi
    .all([pulumi.output(args.variables)])
    .apply(([vars]) => {
      const entries = Object.entries(vars ?? {}).map(
        ([key, value]) => `${key}=${value}`,
      );
      return entries.join(" ");
    });

  return new command.local.Command(
    `${args.serviceName}-${args.environment}-variables`,
    {
      create: interpolate`RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway variables set --service ${args.serviceName} --environment ${args.environment} ${flattened}`,
      update: interpolate`RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway variables set --service ${args.serviceName} --environment ${args.environment} ${flattened}`,
    },
    opts,
  );
}
import { interpolate, Output, secret } from "@pulumi/pulumi";
