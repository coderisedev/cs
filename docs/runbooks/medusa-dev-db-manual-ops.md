---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/medusa-prod-db-manual-ops.md
  - docs/runbooks/2025-11-26-medusa-prod-restore.md
---

# Medusa 开发环境数据库手工维护指引

## 背景
- 开发环境的 Postgres 由人工维护，禁止容器或脚本自动执行 `medusa db:migrate` / seed。
- `scripts/railway-medusa-start.sh` 已调整为不再自动迁移/同步链接。

## 原则
1. **不自动迁移/seed**：启动/重启 dev 栈时不跑 `medusa db:migrate`、`medusa exec ./src/scripts/seed.ts`。
2. **需迁移时手工执行**：仅在确认为必需的变更窗口手工跑迁移。
3. **操作前备份**：任何 DDL/迁移前，先备份 dev 库。

## 手工迁移（仅需时）
```bash
# 进入代码目录
cd /srv/cs  # 或你的工作目录
# 运行迁移（需要时才执行）
docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml run --rm medusa_dev \
  bash -lc "cd apps/medusa && pnpm medusa db:migrate"
```

## 禁止 seed
- 不要在 dev 跑 `medusa exec ./src/scripts/seed.ts` 或 demo 数据脚本。
- 如需导入测试数据，请使用受控脚本/备份恢复。

## 验证
- `curl http://localhost:9001/health`（dev 端口）应返回 OK。
- 如迁移后需验证表/数据，可用 `psql` 检查相关表。

## 相关提示
- 如果在 Railway 或其他托管环境启动 Medusa，记得手工迁移，脚本已默认跳过自动迁移/同步链接。
