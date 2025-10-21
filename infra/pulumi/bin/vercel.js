"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionCustomDomain = exports.stagingCustomDomain = exports.productionDeploymentUrl = exports.stagingDeploymentUrl = exports.productionProjectName = exports.stagingProjectName = exports.productionProjectId = exports.stagingProjectId = void 0;
const pulumi = __importStar(require("@pulumi/pulumi"));
const vercel = __importStar(require("@pulumiverse/vercel"));
const path_1 = require("path");
const railway_1 = require("./apps/railway");
const projectConfig = new pulumi.Config();
const baseProjectName = (_a = projectConfig.get("projectName")) !== null && _a !== void 0 ? _a : "cs";
const domainName = projectConfig.require("domainName");
const repoOwner = (_b = projectConfig.get("repoOwner")) !== null && _b !== void 0 ? _b : "cockpitsimulator";
const repoName = (_c = projectConfig.get("repoName")) !== null && _c !== void 0 ? _c : "cs";
const productionBranch = (_d = projectConfig.get("productionBranch")) !== null && _d !== void 0 ? _d : "main";
const stagingBranch = (_e = projectConfig.get("stagingBranch")) !== null && _e !== void 0 ? _e : "staging";
const vercelConfig = new pulumi.Config("vercel");
const apiToken = vercelConfig.requireSecret("token");
const teamId = vercelConfig.get("teamId");
const provider = new vercel.Provider("vercel-provider", {
    apiToken,
    team: teamId,
});
const stackName = pulumi.getStack();
const railwayConfig = new pulumi.Config("railway");
const repoRoot = (0, path_1.join)(__dirname, "..", "..", "..");
function createProject(args) {
    var _a, _b;
    const project = new vercel.Project(`${args.displayName}-project`, {
        name: args.displayName,
        framework: "nextjs",
        rootDirectory: (_a = args.rootDirectory) !== null && _a !== void 0 ? _a : "apps/storefront",
        buildCommand: (_b = args.buildCommand) !== null && _b !== void 0 ? _b : "pnpm run build",
        gitRepository: {
            type: "github",
            repo: `${repoOwner}/${repoName}`,
            productionBranch: args.branch,
        },
    }, { provider });
    const envVars = args.env.map((variable, index) => {
        var _a;
        return new vercel.ProjectEnvironmentVariable(`${args.displayName}-env-${index}`, {
            projectId: project.id,
            key: variable.key,
            value: variable.value,
            targets: (_a = variable.targets) !== null && _a !== void 0 ? _a : ["production"],
        }, { provider });
    });
    const domain = args.domain
        ? new vercel.ProjectDomain(`${args.displayName}-domain`, {
            projectId: project.id,
            domain: args.domain,
        }, { provider })
        : undefined;
    return { project, envVars, domain };
}
let staging;
let production;
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
}
else if (stackName === "production") {
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
else {
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
const empty = pulumi.output(null);
exports.stagingProjectId = staging ? staging.project.id : empty;
exports.productionProjectId = production ? production.project.id : empty;
exports.stagingProjectName = staging ? staging.project.name : empty;
exports.productionProjectName = production ? production.project.name : empty;
exports.stagingDeploymentUrl = staging
    ? pulumi.interpolate `https://${staging.project.name}.vercel.app`
    : empty;
exports.productionDeploymentUrl = production
    ? pulumi.interpolate `https://${production.project.name}.vercel.app`
    : empty;
exports.stagingCustomDomain = staging
    ? pulumi.output(`https://staging.${domainName}`)
    : empty;
exports.productionCustomDomain = production
    ? pulumi.output(`https://${domainName}`)
    : empty;
function getVariables(service, environment) {
    const key = `${service}Variables-${environment}`;
    const vars = railwayConfig.getObject(key);
    if (!vars || Object.keys(vars).length === 0) {
        return undefined;
    }
    return vars;
}
function configureRailway(environment) {
    const medusaVars = getVariables("medusa", environment);
    const strapiVars = getVariables("strapi", environment);
    const medusaVarSync = medusaVars
        ? (0, railway_1.syncVariables)({
            serviceName: "medusa",
            environment,
            variables: medusaVars,
        })
        : undefined;
    const strapiVarSync = strapiVars
        ? (0, railway_1.syncVariables)({
            serviceName: "strapi",
            environment,
            variables: strapiVars,
        })
        : undefined;
    (0, railway_1.deployService)({
        serviceName: "medusa",
        sourcePath: (0, path_1.join)(repoRoot, "apps", "medusa"),
        environment,
    }, medusaVarSync ? { dependsOn: [medusaVarSync] } : undefined);
    (0, railway_1.deployService)({
        serviceName: "strapi",
        sourcePath: (0, path_1.join)(repoRoot, "apps", "strapi"),
        environment,
    }, strapiVarSync ? { dependsOn: [strapiVarSync] } : undefined);
}
if (stackName === "staging" || stackName === "production") {
    configureRailway(stackName);
}
else {
    configureRailway("staging");
    configureRailway("production");
}
//# sourceMappingURL=vercel.js.map