import * as pulumi from "@pulumi/pulumi";
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
export declare function deployService(args: DeployServiceArgs, opts?: pulumi.CustomResourceOptions): import("@pulumi/command/local/command").Command;
export interface SyncVariablesArgs {
    serviceName: string;
    environment: "staging" | "production";
    variables: pulumi.Input<Record<string, pulumi.Input<string>>>;
}
/**
 * Synchronises environment variables to Railway using `railway variables set`.
 * Values should come from Pulumi config or other managed secrets.
 */
export declare function syncVariables(args: SyncVariablesArgs, opts?: pulumi.CustomResourceOptions): import("@pulumi/command/local/command").Command;
//# sourceMappingURL=railway.d.ts.map