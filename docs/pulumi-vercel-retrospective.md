# Pulumi × Vercel 集成复盘

## 背景
- 目标：通过 Pulumi 管理 Vercel 项目，使 monorepo 中的 `apps/storefront` Next.js 前端能自动部署。
- 前置：已完成 GitHub 集成授权，Pulumi 栈配置补全（域名、仓库信息、Vercel token）。

## 主要动作
1. **Vercel 项目定位调整**  
   - 在 `infra/pulumi/vercel.ts` 中为 `vercel.Project` 增加 `rootDirectory: "apps/storefront"`，指向 monorepo 子目录。  
   - 同步指定 `buildCommand: "pnpm run build"`，确保 Vercel 使用子项目自身脚本构建。
2. **配置验证**（计划执行）  
   - `pulumi preview/up --stack staging` / `production` 将创建或更新项目，生成对应的域名、环境变量。

## 收获
- Pulumi 代码显式反映 monorepo 结构，避免 Vercel 默认以仓库根目录构建。
- 构建命令集中在基础设施代码，便于审计与环境一致性。
- 为后续新增环境变量、域名等配置留下统一入口。

## 后续建议
1. 执行 `pulumi up` 并确认 Vercel 项目下的 Root Directory、Build Command 成功更新。
2. 结合 PR 开启自动 Preview 部署，验证 `apps/storefront` 可以通过 Git 流水线独立发布。
3. 若引入更多子项目，可复用同样模式（新增配置项而非 UI 手动修改）。
