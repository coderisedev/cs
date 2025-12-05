---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/2025-11-26-prod-db-redis-recovery.md
  - docs/runbooks/medusa-db-analysis.md
---

# Medusa 生产库手工维护指引（禁用自动 migrate/seed）

## 背景
- 生产环境希望由 DB 管理员手动控制 DDL/DML，避免容器启动时自动执行 `medusa db:migrate` 或 demo seed。
- `scripts/gce/deploy.sh` 之前会在 `docker compose up` 前自动运行迁移，现已停用。

## 原则
1. **不自动迁移**：部署/重启时不跑 `medusa db:migrate`。需要变更时，由 DB 管理员在维护窗口手动执行。
2. **不自动 seed**：禁止在生产跑 `medusa exec ./src/scripts/seed.ts` 或类似 demo 数据脚本。
3. **变更前备份**：任何手工迁移/DDL 需先备份生产库。

## 手工操作步骤
### 仅当确认需要迁移时
```bash
# 进入宿主机
cd /srv/cs  # 或对应工作目录
docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml run --rm medusa \
  bash -lc "cd apps/medusa && pnpm medusa db:migrate"
```
- 运行后检查日志，确认无失败；如失败，立即回滚或修复后重试。
- 若不需要迁移，直接跳过。

### 禁止 seed
- 不要在生产执行 `medusa exec ./src/scripts/seed.ts`。该脚本会写入 demo 商品、库存和发布用 key。
- 如需导入业务数据，请使用独立的受控脚本/ETL。

## 验证
- `curl http://localhost:9000/health` 应为 OK。
- 若手工迁移后需验证 schema，可用 `psql` 或 Medusa Admin 检查表结构、商品、API Key 等。

## 变更记录
- 2025-11-26：`scripts/gce/deploy.sh` 移除自动 `medusa db:migrate`，改为手工流程；seed 禁止在生产使用。
