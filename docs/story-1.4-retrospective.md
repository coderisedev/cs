# Story 1.4 复盘总结（用于 YouTube 视频脚本参考）

## 1. 项目背景
- **目标**：完成 Story 1.4——让基础设施自动化地创建/维护 Vercel 项目，并确保 `apps/storefront` 前端可在多环境中持续部署。
- **上下文**：仓库是一个 Turborepo monorepo，前端放在 `apps/storefront`，使用 Pulumi 管理 Vercel。Story 1.4 的核心是把 Pulumi/Vercel 配置跑通，并教会团队后续如何扩展。

## 2. 初始状态
- 已有 Pulumi 脚本但缺少关键配置：Git 仓库未授权给 Vercel，Pulumi 里没有指向正确的 monorepo 子目录。
- Vercel CLI 与 GitHub 集成尚未正确安装；执行 `pulumi up` 首次遇到缺少 login connection 和 project name 冲突。
- Staging/Production 的 Pulumi 栈中 `stagingBranch`、`productionBranch` 仍使用代码默认值（`staging`、`main`），仓库尚未创建同名分支。

## 3. 关键实施步骤
1. **GitHub ↔ Vercel 授权打通**
   - 登录 Vercel Dashboard → Team Settings → Integrations → 安装 GitHub App。
   - 在 GitHub `https://github.com/apps/vercel` 授权 `coderisedev` 账号，并勾选仓库 `cs`。
   - 核对 Vercel 的 Team Git Settings，确认 Login Connection 成功建立。

2. **Pulumi 配置补全**
   - `Pulumi.staging.yaml` / `Pulumi.production.yaml` 添加 `cs-infrastructure:repoOwner: "coderisedev"`、`repoName: "cs"`。
   - 通过 `pulumi config set` 写入 `vercel:token`，保持加密存储。
   - 新建文档 `docs/pulumi-vercel-guide.md`、`docs/vercel-github-integration.md` 等作为操作手册。

3. **monorepo 路径修正**
   - 在 `infra/pulumi/vercel.ts` 中为 `vercel.Project` 添加入参 `rootDirectory: "apps/storefront"`、`buildCommand: "pnpm run build"`，确保 Vercel 在子目录构建 Next.js。

4. **处理 Vercel 项目冲突与分支问题**
   - 删除手动创建的旧 `cs-staging` 项目，避免名称冲突。
   - 解释 Pulumi 默认分支逻辑（`projectConfig.get("stagingBranch") ?? "staging"`），并在 FAQ 文档中记录如何覆盖成 `main` 或创建真实 `staging` 分支。

5. **执行 Pulumi**
   - 依次运行：
     ```bash
     ~/.pulumi/bin/pulumi preview --stack staging
     ~/.pulumi/bin/pulumi up --stack staging
     ~/.pulumi/bin/pulumi up --stack production
     ```
   - 确认输出 `stagingProjectId`、`productionProjectId`、`*.vercel.app` 域名与自定义域名全部生成。
   - 再次 `pulumi up` 显示 “Resources: 6 unchanged”，证明状态一致。

6. **知识沉淀**
   - 编写 `docs/pulumi-overview-and-alicloud.md`，解释 Pulumi 底层逻辑及其对阿里云的适配。
   - 编写 `docs/pulumi-branch-config-faq.md`，记录 staging/production 分支配置的常见疑问。

## 4. 遇到的挑战与解决方案
| 问题 | 解决办法 |
| --- | --- |
| Vercel API 报 “To link a GitHub repository, you need to install the GitHub integration” | 安装 Vercel GitHub App，并在 GitHub settings → Installed GitHub Apps 中授权 `cs` 仓库 |
| Vercel 项目已存在导致 Pulumi 报 `conflict - Project "cs-staging" already exists` | 直接在 Vercel 控制台删除旧项目，再运行 `pulumi up` |
| Staging 无法找到 `staging` 分支 | 提供两套策略：创建 `staging` 分支，或通过 `pulumi config set cs-infrastructure:stagingBranch main` 将默认分支改成 `main` |
| Pulumi 输出中 `vercel:index:Project` 出现一次 “errored” 日志 | 实际资源已创建成功（ID 已输出），重复执行 `pulumi up` 验证状态即可 |

## 5. 最终成果
- Pulumi 可以一键为 staging 和 production 创建 Vercel 项目、域名、环境变量，并绑定 GitHub 仓库。
- 文档体系完善：有操作指南、集成原理、常见问题、复盘总结，方便新成员和后续录制分享。
- 仓库结构保持清晰，monorepo 下的 Next.js 前端通过 `rootDirectory` 正确构建。

## 6. 视频展示建议
1. **章节结构**：背景 → 授权与配置 → Pulumi 修改 → 运行演示 → 最终效果 → 教训总结。
2. **演示镜头**：
   - Vercel 集成界面和 GitHub 授权页面（手动操作）。
   - `infra/pulumi/vercel.ts` 中对 `rootDirectory`、`buildCommand` 的代码修改。
   - 终端执行 `pulumi up`，展示第一次失败（缺集成/冲突）与第二次成功的对比。
   - Pulumi Stack 输出和 Vercel Dashboard 的最终项目截图。
3. **可提炼金句**：
   - “Pulumi 是基础设施的 Git，它提供可追踪、可回滚的环境变更记录。”
   - “monorepo 场景下，记得在 IaC 层指明 rootDirectory，让部署引擎知道真正的前端位置。”
   - “配置分支要么覆盖默认值，要么在 GitHub 创建真实分支，Pulumi 只是执行你写下的期望。”

## 7. 后续工作
- 若希望 staging 和 production 使用不同分支，记得在 GitHub 上创建并维护 `staging` 分支，再执行 `pulumi up`。
- 将本次更改 `git commit`、`git push` 到 `origin`，确保团队共享 Pulumi 配置与文档。
- 继续完善 CI/CD：可以给 `pulumi up` 写自动化流程，或在 PR 里强制运行 `pulumi preview` 做基础设施审查。

---
以上内容可直接作为拍摄 YouTube 视频的剧本大纲，也可用于内部分享会的回顾材料。*** End Patch
