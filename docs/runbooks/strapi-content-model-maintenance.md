---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/strapi-db-startup-behavior.md
---

# Strapi 自定义内容模型维护（代码定义 & 自动迁移）

## 核心机制
- 内容类型 schema 位于 `src/api/<type>/content-types/<name>/schema.json`；组件在 `src/components/<category>/<component>.json`。
- 启动时 Strapi 读取这些 JSON，生成/更新表结构，并记录在 `strapi_migrations*` 以确保幂等。默认不 seed 数据。
- Admin UI 也是写这些 JSON；通过代码修改后重启（必要时重建 Admin 前端）即可，无需手工改表。

## 修改现有模型的做法
1) **直接改 schema JSON/组件 JSON**，纳入版本控制。
2) 重启 Strapi，查看启动日志（迁移阶段无报错为佳）。
3) **不手动改表结构**；仅在需要时用 SQL 处理数据行（清理/迁移），表结构由 Strapi 自动调整。

## 变更注意事项
- 字段/组件重命名或删除前备份数据，避免旧数据违反新约束。
- 类型/必填变更可能因历史数据不符合而报错，必要时先清理数据。
- 确保 `strapi_migrations*` 与表结构一致；跨环境保持 schema JSON 和 DB 一致，避免“relation already exists”类错误。

## 何时需要人工介入
- 仅当模型/组件变更需要新迁移时（启动即自动应用），或数据不符合新约束需手工清理。
- 若迁移记录缺失导致启动失败，可恢复完整备份或清空 schema 后重新导入一致的备份。
