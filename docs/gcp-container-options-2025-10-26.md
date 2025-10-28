# GCP 容器化上线方式选型与落地（2025-10-26）

本稿对比 GCP 上与阿里云 SAE 类似或可替代的容器上线方式，并结合当前项目（Medusa + Strapi，外接 PG/Redis，R2）给出最佳选择与迁移要点。

## 一图速览（按“省运维”→“可控度”）
- Cloud Run（托管无服务器容器）→ 最像 SAE（强烈推荐）
- GKE Autopilot（无节点 K8s）→ 更可控、略复杂
- GKE Standard（自管节点 K8s）→ 最大可控、运维最高
- App Engine Flexible → 老牌 PaaS，新增不再首选
- Compute Engine + MIG + LB（VM+容器）→ 与现状最接近但需自管
- Cloud Functions 2nd gen（容器函数）→ 适合函数式，不适合长驻 Web

## 方案特性与场景
1) Cloud Run（推荐）
- 零节点、按量、内建滚更/流量分配/域名证书/日志监控；容器需监听 `$PORT`。
- 私网用 Serverless VPC Access，Cloud SQL 用 Connector；非常适合无状态 Web。

2) GKE Autopilot
- 全托管 K8s，只写 Deployment/Ingress；具备 K8s 全能力（HPA/Sidecar/策略/网格）。
- 适合已有 K8s 经验、服务规模更大时。

3) GKE Standard
- 自管节点池，最大可控度；平台工程/大规模场景适用；当前阶段不建议。

4) App Engine Flexible
- 容器化运行时的老牌 PaaS，能力被 Cloud Run/GKE 覆盖，除存量项目一般不选。

5) Compute Engine + MIG + LB
- 沿用 VM，但配镜像模板 + MIG + 全局 LB + Cloud Armor；与 GCE+compose 最接近。
- 运维量高于 Cloud Run，适合必须自管主机的场景。

6) Cloud Functions 2nd gen
- 容器函数，HTTP 触发；适合短生命周期函数，不适合 Strapi/Medusa 这类长驻后台。

## 当前项目最佳选择与原因
- 首选 Cloud Run：服务无状态、外接 PG/Redis/R2；上线、回滚、灰度与观测都更省心。
- 备选 GKE Autopilot：当需要 K8s 治理/网格/多服务编排时。
- 规范化 VM 路线：Compute Engine + MIG + LB，迁移成本低但运维较重。

## Cloud Run 落地要点
- 镜像：GAR（Artifact Registry）或保留 GHCR；可用 WIF 推 GAR。
- 服务：为 medusa/strapi 各建 Cloud Run Service；应用读取 `$PORT`，`HOST=0.0.0.0`。
- 环境：把 `/srv/cs/env/*.env` 迁为 Cloud Run 环境变量。
- 私网：Serverless VPC Access；Cloud SQL 推荐 Connector。
- 域名/证书：自定义域 `api.aidenlux.com` 与 `content.aidenlux.com`（托管证书），或用 Cloudflare 代理。
- 访问控制：Medusa GUI `/app/admin`；健康探针 `Medusa /health`、`Strapi /health` 或 `/_health`。

## 最小迁移路径（GCE → Cloud Run）
1)（可选）迁 PG/Redis 至 Cloud SQL/Memorystore；否则建 VPC 连接器。
2) CI 镜像推 GAR（或保留 GHCR）。
3) `gcloud run deploy` 两个服务（镜像/环境/配额/最小实例数）。
4) 绑定自定义域与证书（或 Cloudflare 继续代理）。
5) 先灰度少量流量验证，再全量；保留上一修订可一键回滚。

## 对比摘要
- Cloud Run：零节点、按量、原生流量分配/回滚、域名证书内建。
- GKE Autopilot：K8s 全能力，无节点管理；复杂度中等。
- GKE Standard：最大可控；维护成本最高。
- App Engine Flex：新增不推荐。
- GCE + MIG + LB：最接近现状；需自管 VM/LB/健康检查。
- Functions 2nd：适合函数式 API，非长驻 Web。

## 下一步可交付
- Cloud Run 版 CI/CD（推 GAR + `gcloud run deploy`）示例与变量映射表。
- GKE Autopilot 与 GCE+MIG 的模板与选型清单。
- “Cloud Run 迁移指南”（含 VPC 连接器、Cloud SQL Connector、回滚与验收清单）。

