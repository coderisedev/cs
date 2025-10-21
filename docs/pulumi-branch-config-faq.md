# Pulumi Branch Configuration FAQ

## 问题
Pulumi 为什么在 `Pulumi.staging.yaml` 里看不到 `cs-infrastructure:stagingBranch`，却仍然让 staging 项目监听 `staging` 分支？若我想改成监听 `main`，需要怎样操作？

## 解答
1. **默认值来自代码**  
   - 在 `infra/pulumi/vercel.ts` 中，Pulumi 通过如下语句读取配置：  
     ```ts
     const stagingBranch = projectConfig.get("stagingBranch") ?? "staging";
     const productionBranch = projectConfig.get("productionBranch") ?? "main";
     ```  
   - `projectConfig.get(...)` 会尝试从 `Pulumi.<stack>.yaml` 中读取键值；若找不到，对应分支就使用 `??` 后面的默认值。因此，即使配置文件里没有 `stagingBranch`，Pulumi 仍会把 staging 栈的默认分支设为 `"staging"`。

2. **如何覆盖默认分支**  
   - 如果实际仓库没有 `staging` 分支，可以显式写入配置，让 Pulumi 使用 `main`：  
     ```bash
     cd infra/pulumi
     ~/.pulumi/bin/pulumi config set cs-infrastructure:stagingBranch main --stack staging
     ~/.pulumi/bin/pulumi up --stack staging
     ```  
   - 这会在 `Pulumi.staging.yaml` 添加对应键值，之后 staging 环境就会监听 `main` 分支。

3. **保留默认 “staging → staging 分支” 的做法**  
   - 如果希望 staging 环境独立于生产，只需在 GitHub 创建 `staging` 分支并推送，Pulumi 会自动沿用默认值。此时 push 到 `staging` 才触发 staging 部署，`main` 仍专用于生产环境。

4. **总结**  
   - Pulumi 配置 = “代码默认值 + 配置文件覆盖”。  
   - `Pulumi.<stack>.yaml` 不存在的键，会退回到 `vercel.ts` 中定义的默认值。  
   - 通过 `pulumi config set … --stack <stack>` 可覆盖默认值并同步到配置文件，满足不同环境的部署策略。
