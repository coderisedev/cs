---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/medusa-prod-db-manual-ops.md
  - docs/runbooks/2025-11-26-prod-db-redis-recovery.md
---

# Medusa 生产库恢复（/tmp/medusa.dump）– 2025-11-26

## 背景
- 需要用新提供的 `/tmp/medusa.dump` 恢复生产 `medusa_production`，并保留可回滚的备份。
- 目标：清空现有 schema，导入 dump，确保容器启动正常，数据可用。

## 步骤
1. **停应用**：`docker stop cs-prod-medusa-1`
2. **备份当前库**：`sudo -u postgres pg_dump -Fc medusa_production > /tmp/medusa_before_restore_20251126_2.dump`
3. **清空 schema**：
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public AUTHORIZATION cs;
   ```
4. **恢复新 dump**：
   ```bash
   sudo -u postgres pg_restore --clean --if-exists --no-owner --role=cs \
     -d medusa_production /tmp/medusa.dump
   ```
5. **权限修复**：
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cs;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cs;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cs;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cs;
   ```
6. **启动 Medusa**：
   `docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml up -d medusa`

## 结果
- Medusa容器正常启动（端口 9000 ready）。
- 数据行数：product 8、product_variant 24、customer 3、api_key 1。
- Publishable key：`pk_4fc684418178eb1f16f669b02173bca57419199da894356d9779db20966b3253`

## 回滚
- 使用备份 `/tmp/medusa_before_restore_20251126_2.dump`：
  ```bash
  sudo -u postgres pg_restore --clean --if-exists --no-owner --role=cs \
    -d medusa_production /tmp/medusa_before_restore_20251126_2.dump
  ```
  然后重启 Medusa 容器。

## 注意
- 生产环境已禁用自动 migrate/seed（见 `docs/runbooks/medusa-prod-db-manual-ops.md`），后续如需迁移请手工执行。
- 前端访问需配置上方 publishable key。
