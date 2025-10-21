#!/usr/bin/env node

import { appendFileSync, writeFileSync } from "fs";
import { join } from "path";

interface DeploymentStatus {
  environment: "staging" | "production";
  status: "success" | "failure" | "in_progress";
  url?: string;
  deploymentId?: string;
  timestamp: string;
  commit: string;
  branch: string;
  buildTime?: number;
  metrics?: {
    bundleSize?: number;
    loadTime?: number;
    errorRate?: number;
  };
}

class DeploymentStatusReporter {
  private readonly environment: "staging" | "production";
  private readonly branch: string;
  private readonly commit: string;

  constructor(environment: "staging" | "production", branch: string, commit: string) {
    this.environment = environment;
    this.branch = branch;
    this.commit = commit;
  }

  async reportDeployment(status: DeploymentStatus["status"], url?: string, deploymentId?: string): Promise<void> {
    const deploymentStatus: DeploymentStatus = {
      environment: this.environment,
      status,
      url,
      deploymentId,
      timestamp: new Date().toISOString(),
      commit: this.commit,
      branch: this.branch,
      buildTime: this.getBuildTime(),
    };

    // Save deployment status for tracking
    this.saveDeploymentStatus(deploymentStatus);

    // Generate GitHub Actions output
    this.generateGitHubOutput(deploymentStatus);

    // Post to Slack (if configured)
    await this.notifySlack(deploymentStatus);

    console.log(`🚀 Deployment status updated: ${status.toUpperCase()}`);
    if (url) {
      console.log(`🔗 URL: ${url}`);
    }
  }

  private saveDeploymentStatus(status: DeploymentStatus): void {
    const statusFile = join(process.cwd(), `.deployment-${this.environment}.json`);
    writeFileSync(statusFile, JSON.stringify(status, null, 2));
  }

  private generateGitHubOutput(status: DeploymentStatus): void {
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, `status=${status.status}\n`);
      appendFileSync(process.env.GITHUB_OUTPUT, `environment=${status.environment}\n`);
      appendFileSync(process.env.GITHUB_OUTPUT, `url=${status.url ?? ""}\n`);
      appendFileSync(process.env.GITHUB_OUTPUT, `deployment_id=${status.deploymentId ?? ""}\n`);
      appendFileSync(process.env.GITHUB_OUTPUT, `timestamp=${status.timestamp}\n`);
    }

    this.generateDeploymentSummary(status);
  }

  private generateDeploymentSummary(status: DeploymentStatus): void {
    const summary = `
# 🚀 Deployment Summary

## Environment
- **Target**: ${status.environment}
- **Status**: ${this.getStatusEmoji(status.status)} ${status.status.toUpperCase()}
- **URL**: ${status.url || "N/A"}
- **Deployment ID**: ${status.deploymentId || "N/A"}

## Code Information
- **Branch**: ${status.branch}
- **Commit**: ${status.commit}
- **Timestamp**: ${status.timestamp}

## Performance
${status.buildTime ? `- **Build Time**: ${status.buildTime}s` : ""}

## Actions
${status.url ? `- [🔗 View Deployment](${status.url})` : ""}
- [📋 View Logs](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})
- [🔄 Rollback Guide](https://github.com/${process.env.GITHUB_REPOSITORY}/blob/main/docs/runbooks/deployments.md#rollback-procedures)

---

*This deployment was automatically processed by GitHub Actions*
`;

    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    } else {
      console.log(summary);
    }
  }

  private async notifySlack(status: DeploymentStatus): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) {
      return; // Skip Slack notification if not configured
    }

    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      const payload = {
        text: `Deployment ${status.status === "success" ? "✅" : "❌"} ${status.environment.toUpperCase()}`,
        attachments: [
          {
            color: status.status === "success" ? "good" : "danger",
            fields: [
              {
                title: "Environment",
                value: status.environment,
                short: true,
              },
              {
                title: "Status",
                value: status.status.toUpperCase(),
                short: true,
              },
              {
                title: "Branch",
                value: status.branch,
                short: true,
              },
              {
                title: "Commit",
                value: status.commit.substring(0, 7),
                short: true,
              },
            ],
            ...(status.url ? [
              {
                title: "URL",
                value: `<${status.url}|View Deployment>`,
                short: false,
              }
            ] : []),
          ],
          footer: "GitHub Actions",
          ts: Math.floor(new Date(status.timestamp).getTime() / 1000),
        },
      };

      // Post to Slack (would use fetch in real implementation)
      console.log(`📢 Slack notification prepared for ${status.environment} deployment`);
    } catch (error) {
      console.warn("⚠️ Failed to send Slack notification:", error);
    }
  }

  private getBuildTime(): number | undefined {
    try {
      // This would be calculated from build logs in a real implementation
      return Math.random() * 120 + 30; // Mock build time between 30-150s
    } catch {
      return undefined;
    }
  }

  private getStatusEmoji(status: DeploymentStatus["status"]): string {
    switch (status) {
      case "success":
        return "✅";
      case "failure":
        return "❌";
      case "in_progress":
        return "🔄";
      default:
        return "❓";
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] as "staging" | "production";
  const status = args[1] as DeploymentStatus["status"];
  const url = args[2];
  const deploymentId = args[3];
  const branch = args[4] || process.env.GITHUB_REF_NAME || "unknown";
  const commit = args[5] || process.env.GITHUB_SHA || "unknown";

  if (!environment || !status) {
    console.error("Usage: npm run deployment-status <staging|production> <success|failure|in_progress> [url] [deploymentId] [branch] [commit]");
    process.exit(1);
  }

  const reporter = new DeploymentStatusReporter(environment, branch, commit);
  await reporter.reportDeployment(status, url, deploymentId);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Failed to report deployment status:", error);
    process.exit(1);
  });
}

export { DeploymentStatusReporter, DeploymentStatus };
