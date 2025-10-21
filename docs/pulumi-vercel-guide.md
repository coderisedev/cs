# Pulumi 管理 Vercel 项目的整体逻辑与操作指引

本文档从零开始梳理如何在本仓库中使用 Pulumi 基础设施代码自动化管理 Vercel 项目，并解释相关配置的来龙去脉，帮助第一次接触 Pulumi 与 Vercel 的伙伴快速上手。

## 1. 背景概览

- **Pulumi**：基础设施即代码（IaC）工具，我们在 `infra/pulumi` 目录编写 TypeScript 程序（`vercel.ts`）来声明需要的 Vercel 项目。
- **Vercel provider**：Pulumi 通过 `@pulumiverse/vercel` provider 调用 Vercel API，在 `pulumi up` 时自动创建或更新项目、域名、环境变量等。
- **Stacks（环境栈）**：我们维护 `staging` 与 `production` 两个 Pulumi 栈，分别对应 `Pulumi.staging.yaml` 与 `Pulumi.production.yaml`，每个栈都会创建一个独立的 Vercel 项目（命名为 `cs-staging` 和 `cs-production`）。
- **Git 集成**：Pulumi 创建项目后，会把 Git 仓库信息写入 Vercel。只要 GitHub 账号授权给 Vercel，项目就能自动触发部署。若需在本地使用 Vercel CLI 进行调试，可在 Pulumi 运行完成后用 `vercel link` 绑定本地目录。

## 2. 环境准备

1. **安装依赖**
   ```bash
   pnpm install --filter @cs/infrastructure
   ```
   该命令会在 `infra/pulumi` 下拉取 Pulumi 程序所需的 NPM 依赖。

2. **确保 Pulumi CLI 可用**
   - 本仓库默认把 CLI 安装在 `~/.pulumi/bin/pulumi`。
   - 可通过 `~/.pulumi/bin/pulumi version` 验证，必要时把该目录加入 `PATH`。

3. **准备 Vercel API Token**
   - 登录 vercel.com → Account Settings → Git → 确保已链接 GitHub 账号。
   - 在 Account Settings → Tokens 创建一个具备部署权限的 token（已示例：`W1QHk9LItehXMyoYeWQ9WPNu`）。
   - 建议在终端导出环境变量，便于后续命令复用：
     ```bash
     export VERCEL_TOKEN=W1QHk9LItehXMyoYeWQ9WPNu
     ```

## 3. 理解 Pulumi 配置文件

Pulumi 使用 `Pulumi.<stack>.yaml` 保存每个环境栈的配置项（Config）。关键字段如下（路径：`infra/pulumi`）：

- `cs-infrastructure:projectName`：Vercel 项目名前缀（默认 `cs`）。
- `cs-infrastructure:domainName`：自定义域名根域，例如 `cockpitsimulator.com`。
- `cs-infrastructure:repoOwner` / `repoName`：GitHub 仓库信息。首次使用时务必把 `repoOwner` 改成你自己的 GitHub 账号（例如 `coderisedev`）。
- `vercel:token`：Pulumi 访问 Vercel API 的机密值，推荐通过命令设置为 Secret，Pulumi 会在 YAML 中加密存储。

### 3.1 推荐的配置命令

在首次初始化或更新配置时，从 `infra/pulumi` 目录执行以下命令（两个栈都需要）：

```bash
cd infra/pulumi

~/.pulumi/bin/pulumi config set cs-infrastructure:repoOwner coderisedev --stack staging
~/.pulumi/bin/pulumi config set cs-infrastructure:repoOwner coderisedev --stack production

~/.pulumi/bin/pulumi config set vercel:token $VERCEL_TOKEN --secret --stack staging
~/.pulumi/bin/pulumi config set vercel:token $VERCEL_TOKEN --secret --stack production
```

若要修改域名、仓库名等字段，也可以用同样的 `pulumi config set` 命令；Pulumi 会把值写入对应的 `Pulumi.<stack>.yaml`。

## 4. 运行 Pulumi 工作流

1. **预览变更**
   ```bash
   ~/.pulumi/bin/pulumi preview --stack staging
   ~/.pulumi/bin/pulumi preview --stack production
   ```
   预览阶段不会真正对 Vercel 进行变更，主要用于确认 Pulumi 将要创建或修改的资源列表。

2. **应用变更**
   ```bash
   ~/.pulumi/bin/pulumi up --stack staging
   ~/.pulumi/bin/pulumi up --stack production
   ```
   - 首次执行会创建 `cs-staging`、`cs-production` 项目，写入 Git 仓库信息、默认分支、环境变量和自定义域名。
   - 之后再次执行会进行增量更新，例如修改环境变量、域名或 Git 分支配置。
   - `pulumi up` 成功后，会输出项目 ID、自定义域名等信息，也会同步写入 Pulumi Stack 状态。

3. **检查结果**
   - 使用 CLI 验证项目是否已创建：
     ```bash
     npx vercel project list --token $VERCEL_TOKEN
     ```
   - 登录 vercel.com → Projects，也能看到新建的 `cs-staging` / `cs-production`。

> **提示**：如果 `pulumi up` 报 “Failed to link repository … add a Login Connection”，说明 Vercel 账号尚未链接 GitHub，需要回到 Account Settings → Git 里先完成授权。

## 5. （可选）使用 Vercel CLI 链接本地仓库

Pulumi 已经为项目配置好 Git 仓库，但若你希望在本地使用 `vercel deploy`、`vercel logs` 等命令调试，可在 Pulumi 执行完后额外做一次 CLI 绑定。

```bash
cd /home/coderisedev/code/cs/apps/storefront  # 例：Next.js 前端所在目录

npx vercel link --project cs-staging --token $VERCEL_TOKEN
# CLI 提示关键选项：
# - Link to existing project? -> 选择 Yes
# - Project name -> 直接使用 cs-staging
# - Directory -> 保持 ./

npx vercel git connect https://github.com/coderisedev/cs.git --token $VERCEL_TOKEN
```

如需绑定生产项目，只需将 `--project` 改为 `cs-production`。运行 `npx vercel git connect --token $VERCEL_TOKEN` 不带参数即可查看当前目录连接的仓库。

## 6. 常见问题排查

- **CLI 找不到 Vercel 项目**  
  Pulumi 未执行 `pulumi up`，或配置项中的 `repoOwner` / `repoName` 与实际仓库不一致，导致项目创建失败。先检查 `Pulumi.<stack>.yaml`，再重新 `pulumi up`。

- **`vercel link` 进入新建流程**  
  当 Vercel 端不存在所填的项目名称时 CLI 会尝试新建项目。Pulumi 已负责创建项目，所以看到此提示应 `Ctrl+C` 退出，确认 Pulumi 已执行成功且项目名称无误。

- **API Token 或 Scope 报错**  
  - 确认 `VERCEL_TOKEN` 拥有访问目标账号/团队的权限。
  - CLI 多次提示 Scope 时，请选择和 token 对应的账号或团队。

- **Pulumi 配置被误改**  
  如果直接编辑 `Pulumi.<stack>.yaml` 导致格式错误，可删除敏感字段后重新使用 `pulumi config set --secret` 写入；Pulumi 会保持加密存储。

## 7. 后续步骤建议

1. 将 `pulumi up --stack staging` / `production` 纳入发布流程，确保基础设施变更可追踪。
2. 若要为项目补充环境变量，可在 `vercel.ts` 中追加配置，然后运行 `pulumi up`。
3. 结合 GitHub Actions 或其他 CI，在合并后自动执行 `pulumi preview`/`up`，避免手动执行遗漏。

通过以上步骤，即使是第一次接触 Pulumi 和 Vercel，也能理解仓库的基础设施代码如何创建和维护 Vercel 项目，并掌握本地环境的日常操作流程。
