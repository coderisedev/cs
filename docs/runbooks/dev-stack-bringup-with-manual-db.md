---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/medusa-dev-db-manual-ops.md
  - docs/runbooks/strapi-db-startup-behavior.md
---

# Dev 栈启动（含镜像构建，DB 手工维护）

## 前置
- `deploy/gce/.env.dev` 配置完整（DB/Redis/File storage/CORS 等）。
- 可选备份：`sudo -u postgres pg_dump -Fc medusa_dev > /tmp/medusa_dev_$(date +%F).dump`，`sudo -u postgres pg_dump -Fc strapi_dev > /tmp/strapi_dev_$(date +%F).dump`。

## DB/Redis 允许 dev 网段
- Postgres：`pg_hba.conf` 含 `172.31.0.0/16`，`listen_addresses='*'`，`sudo systemctl reload postgresql`。
- Redis：`bind 127.0.0.1 172.30.0.1 172.31.0.1 ::1`、`protected-mode no`，`sudo systemctl restart redis-server`。

## 构建 dev 镜像
```bash
docker build -t cs-medusa:dev -f apps/medusa/Dockerfile .
docker build -t cs-strapi:dev -f apps/strapi/Dockerfile .
```

## 启动 dev 容器
```bash
# 推荐
make dev-up
# 或
docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d
# 如需重建容器
docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d --force-recreate
```

## 验证
- `docker ps` 应见 `cs-dev-medusa_dev-1`（9001:9000）、`cs-dev-strapi_dev-1`（1338:1337）。
- 健康检查：
  - `curl -sSf http://localhost:9001/health`
  - `curl -sSf http://localhost:1338/health`
- 如需要 Medusa publishable key，确认 dev 库已有或手工创建。

## 数据库操作提示
- 遵循 `docs/runbooks/medusa-dev-db-manual-ops.md`：默认不自动迁移/seed，确需时手工运行 `medusa db:migrate`。
- Strapi 读取现有表，确保 `strapi_migrations*` 完整，避免重复建表。

## 常见故障排查
- 连接被拒：检查 pg_hba/Redis bind、dev 网关 `extra_hosts`（172.31.0.1）。
- “relation already exists” 类错误：检查迁移记录与表结构一致性，必要时用备份恢复或清空 schema 后导入一致的备份。
