# Pulumi 概念与阿里云适用性说明

## 1. Pulumi 是什么
- 基础设施即代码（IaC）平台，可使用 TypeScript/JavaScript、Python、Go 等通用语言定义云资源。
- 运行 `pulumi up` 时，Pulumi 会解释执行你的代码，通过对应 provider 调用云厂商 API 创建或更新资源。
- 使用 **Stack（栈）** 区分环境（如 staging、production），每个栈有自己的状态文件，保证变更可追踪、可回滚。

## 2. 本仓库的 Pulumi 方案
- 在 `infra/pulumi/vercel.ts` 编写 TypeScript：
  - 声明 `cs-staging`、`cs-production` 两个 Vercel 项目。
  - 指定仓库 `coderisedev/cs`、部署分支、环境变量、自定义域名。
  - 设置 `rootDirectory: "apps/storefront"` 和 `buildCommand: "pnpm run build"`，让 Vercel 部署 monorepo 子目录的 Next.js 前端。
- `Pulumi.staging.yaml` / `Pulumi.production.yaml` 记录环境差异（域名、仓库 owner、Vercel token 等）。
- 运行流程：
  1. `pulumi preview --stack staging` 预演计划。
  2. `pulumi up --stack staging` 真正创建或更新 Vercel 项目。
  3. `pulumi stack output --stack staging` 查看项目 ID、域名等结果。
  4. 后续改动只需更新 `vercel.ts` 或配置，再执行 `pulumi up`，Pulumi 会做增量更新。

## 3. 底层逻辑拆解
1. Pulumi CLI 执行 TypeScript 代码，读取 `Pulumi.<stack>.yaml` 配置。
2. 通过 `@pulumiverse/vercel` provider 把声明转换成 Vercel API 请求。
3. Pulumi 保存状态文件（记录项目 ID、配置），下次运行时对比代码与状态决定增量变更。

## 4. Pulumi 与阿里云
- 官方提供 `@pulumi/alicloud` provider，可声明 VPC、ECS、RDS 等阿里云资源。示例：
  ```ts
  import * as alicloud from "@pulumi/alicloud";

  const vpc = new alicloud.vpc.Network("mainVpc", {
    cidrBlock: "10.0.0.0/16",
  });
  ```
- 运行 `pulumi up` 需要能访问 Pulumi Registry 与阿里云 API；在中国大陆执行时请确保网络畅通、配置好 Access Key。

## 5. 若 Pulumi 不适用的替代方案
- **Terraform**：成熟度最高的 IaC 工具，阿里云有官方 provider（`alicloud`），社区也有 Vercel provider。语法是 HCL，无法直接复用 TypeScript。
- **Crossplane**：Kubernetes 原生 IaC，若已有 K8s 集群，可使用阿里云 Crossplane provider 统一管理云资源。
- **CDK / CDKTF**：AWS CDK 或 Terraform CDK 也支持 TypeScript，但要确认阿里云 provider 支持。
- **云厂商原生工具**：阿里云 ROS 等，语法固定但集成度高。

## 6. 建议
1. 在本项目继续采用 Pulumi 管理 Vercel，保持配置与代码同步。
2. 若未来需要管理阿里云资源，可在 `infra/pulumi` 下新增对应的 Pulumi 脚本，统一 `pulumi up`。
3. 若团队已有既定 IaC 标准（如 Terraform），可评估迁移；核心思路仍是通过代码管理基础设施，确保环境一致与可复现。
