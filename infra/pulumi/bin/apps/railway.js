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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployService = deployService;
exports.syncVariables = syncVariables;
const pulumi = __importStar(require("@pulumi/pulumi"));
const command = __importStar(require("@pulumi/command"));
/**
 * Railway deployment helpers executed via Pulumi.
 * Uses the Railway CLI behind the command provider so IaC runs declaratively.
 */
const railwayConfig = new pulumi.Config("railway");
const projectId = railwayConfig.require("projectId");
const defaultToken = railwayConfig.requireSecret("apiToken");
function tokenForEnvironment(env) {
    const specific = railwayConfig.getSecret(`${env}Token`);
    return (0, pulumi_1.secret)(specific !== null && specific !== void 0 ? specific : defaultToken);
}
/**
 * Deploys a Railway service by invoking `railway up` for the target branch.
 * The command resource gives Pulumi dependency tracking and log capture.
 */
function deployService(args, opts) {
    var _a;
    return new command.local.Command(`${args.serviceName}-${args.environment}-deploy`, {
        create: (0, pulumi_1.interpolate) `RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway up --service ${args.serviceName} --environment ${args.environment} --ci`,
        update: (0, pulumi_1.interpolate) `RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway up --service ${args.serviceName} --environment ${args.environment} --ci`,
        delete: (0, pulumi_1.interpolate) `RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway down --service ${args.serviceName} --environment ${args.environment}`,
        dir: (_a = args.sourcePath) !== null && _a !== void 0 ? _a : ".",
        triggers: [args.serviceName, args.environment],
    }, opts);
}
/**
 * Synchronises environment variables to Railway using `railway variables set`.
 * Values should come from Pulumi config or other managed secrets.
 */
function syncVariables(args, opts) {
    const flattened = pulumi
        .all([pulumi.output(args.variables)])
        .apply(([vars]) => {
        const entries = Object.entries(vars !== null && vars !== void 0 ? vars : {}).map(([key, value]) => `${key}=${value}`);
        return entries.join(" ");
    });
    return new command.local.Command(`${args.serviceName}-${args.environment}-variables`, {
        create: (0, pulumi_1.interpolate) `RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway variables set --service ${args.serviceName} --environment ${args.environment} ${flattened}`,
        update: (0, pulumi_1.interpolate) `RAILWAY_TOKEN=${tokenForEnvironment(args.environment)} RAILWAY_PROJECT=${projectId} railway variables set --service ${args.serviceName} --environment ${args.environment} ${flattened}`,
    }, opts);
}
const pulumi_1 = require("@pulumi/pulumi");
//# sourceMappingURL=railway.js.map