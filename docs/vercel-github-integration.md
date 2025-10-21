# Vercel GitHub 集成工作原理与价值说明

本文整理 Vercel 与 GitHub 完成集成后的作用、底层逻辑，以及团队在本项目里的具体收益，帮助首次使用者建立完整认知。

## 1. 集成带来的能力

1. **自动部署 PR**  
   - GitHub 的每个 Pull Request 推送后，Vercel 会自动创建 Preview Deployment，提供临时访问链接。  
   - 合并到主分支（如 `main`、`production`）时触发正式部署，实现持续交付。

2. **环境变量与构建设置复用**  
   - 项目级配置（Build 命令、Output 目录、环境变量）在 Vercel 控制台维护，一次配置即可覆盖所有部署。  
   - Pulumi 还能把这些配置转成基础设施代码，保持环境一致。

3. **Git Checks 与评论回传**  
   - 部署完成后，Vercel 会在 PR 页展示 “Preview available” 等状态检查，便于审查者及时访问预览环境。  
   - 若构建失败，GitHub 状态会标红，推动开发者尽快修复。

## 2. 底层逻辑拆解

1. **安装 GitHub App**  
   - `https://github.com/apps/vercel` 上的 Vercel GitHub App 获取访问所选仓库的权限。  
   - 它监听 GitHub Webhook 事件（push、pull_request），再把事件转发给 Vercel 平台。

2. **Vercel 项目与仓库绑定**  
   - 通过 Vercel 控制台或 Pulumi 指定仓库路径、部署分支。  
   - Vercel 保存该映射后，只要仓库有变动，就能抓取代码并触发部署。

3. **构建流程**  
   - Vercel 拉取指定 commit → 安装依赖 → 执行 Build 命令 → 把产物部署到 CDN。  
   - Preview 会使用 `vercel.app` 域名，生产环境可绑定自定义域名。

4. **状态回传**  
   - 构建完成后，Vercel 调用 GitHub Status API，把部署结果写到对应的 commit/PR。  
   - PR 页面上即可看到 “Vercel — Preview ready” 或错误提示。

## 3. 在本仓库的落地方式

1. **Pulumi 管理项目**  
   - 代码位于 `infra/pulumi/vercel.ts`，声明 `cs-staging` 和 `cs-production` 两个 Vercel 项目。  
   - Pulumi 配置文件 `Pulumi.staging.yaml` / `Pulumi.production.yaml` 中记录了仓库信息、域名、环境变量等。

2. **运行流程**  
   1. 开发者安装 GitHub App 并授予仓库访问权限。  
   2. 在仓库根目录执行 `~/.pulumi/bin/pulumi up --stack staging`（或 production），Pulumi 调用 Vercel API 创建项目并绑定仓库。  
   3. 之后的代码提交、PR 会自动触发 Vercel 部署，无需额外脚本。

3. **日常协作收益**  
   - 产品/设计可以直接打开 Preview 链接体验功能。  
   - QA 可以针对特定 PR 做冒烟测试。  
   - 运维只需关注 Pulumi 代码与 Vercel 面板即可掌握部署状态。

## 4. 常见问题与排查

- **Pulumi 提示需要 GitHub 集成**：说明尚未安装 GitHub App，或未授予当前仓库访问权限。返回 GitHub 安装页面勾选仓库即可。  
- **Preview 一直排队或失败**：检查 Vercel 项目配置（Build 命令、环境变量）是否正确，或查看 Vercel Dashboard 的构建日志。  
- **环境变量缺失**：Pulumi 里新增 `ProjectEnvironmentVariable` 并 `pulumi up`，或在 Vercel 控制台直接补充。

## 5. 小结

完成 GitHub 集成后，Vercel 会：

1. 自动拉取仓库代码并部署；  
2. 在 PR 中展示预览链接和部署状态；  
3. 结合 Pulumi 实现环境配置的可追踪、可复用。

因此，Pulumi 负责声明式配置、统一管理，Vercel GitHub 集成负责侦听仓库事件并完成部署，两者结合就实现了“提交即部署、配置即代码”的现代化前端发布流程。
