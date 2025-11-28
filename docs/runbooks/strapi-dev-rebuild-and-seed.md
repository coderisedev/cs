---
last_updated: 2025-11-27
status: ✅ Active
related_docs:
  - docs/basic/strapi-deployment-logic.md
  - docs/runbooks/dev-stack-bringup-with-manual-db.md
  - docs/runbooks/strapi-content-model-maintenance.md
---

# Strapi Dev 重建镜像 + 首页种子

## 场景
- 新增或修改 Strapi 内容模型后，需要刷新 dev 环境镜像并重新填充首页示例数据。

## 前置
- dev DB/Redis 可访问（`host.docker.internal` 指向 172.31.0.1）。
- `deploy/gce/.env.dev` 已更新且指向 dev 资源（不要误用 prod）。

## 步骤
1) 构建 dev Strapi 镜像  
```bash
docker build -t cs-strapi:dev -f apps/strapi/Dockerfile .
```
2) 仅重启 Strapi dev 容器（保持 Medusa 运行）  
```bash
docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d --force-recreate --no-deps strapi_dev
```
3) 在容器内执行首页种子  
```bash
docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml exec strapi_dev sh -lc "cd /srv/app/apps/strapi && npm run seed:homepage"
```
4) 验证  
- `docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml logs -f strapi_dev` 无错误。
- 前台访问 dev 站点首页内容正常。

## 注意
- 仅在 dev 环境执行；prod 仍遵循“禁止自动 migrate/seed”策略。
- 如网络网段或网关变更，确保 `cs-dev-net` 的 172.31.0.0/16 与 `host.docker.internal` 映射仍正确。
