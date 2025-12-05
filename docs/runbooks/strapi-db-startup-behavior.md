---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/fix/2025-11-17-docker-db-access.md
---

# Strapi 容器启动时的数据库行为与现有库使用指南

## 启动机制
- 镜像构建：`apps/strapi/Dockerfile`，最终 CMD 为 `pnpm --filter strapi start`，Compose 未追加迁移/seed 步骤。
- 连接配置：从 `.env.prod` / `.env.dev` 注入 `STRAPI_DATABASE_URL/…HOST/PORT/NAME/USER/PASSWORD`，容器内 `config/database` 读取。
- 迁移行为：启动时 Strapi 会检查并应用未记录的迁移，使用 `strapi_migrations`、`strapi_migrations_internal` 等表做幂等控制；默认不 seed 业务数据。
- 失败场景：DB 不可达会重启；若 schema 不完整或 `strapi_migrations*` 记录缺失/不一致，可能出现 “relation … already exists” 等错误。
- 权限需求：迁移阶段需要 CREATE/ALTER；若仅读取现有库，可收紧权限至查询/必要写权限。

## 使用现成数据库的要求
1) 备份/恢复时包含完整 schema + `strapi_migrations*` 记录，保持与表结构一致。  
2) 环境变量指向该数据库，保证账号可访问。  
3) 不需要额外改动 Dockerfile/Compose；已有库且迁移记录齐全时，启动不会重复建表。

## 何时需要人工介入
- 仅当变更内容模型/插件且需要新迁移时，才在维护窗口运行 Strapi 生成/应用迁移；否则保持现状。
- 如遇迁移记录缺失导致启动失败，可用完整备份恢复，或清理 schema+迁移表后重新导入一致的备份。
