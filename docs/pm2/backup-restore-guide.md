# 数据库备份与恢复操作指南

**适用场景**：手动备份、数据恢复、灾难恢复

## 快速参考

```bash
# 查看备份列表
/backup/scripts/restore.sh list

# 手动执行备份
/backup/scripts/backup-daily.sh

# 恢复数据库
/backup/scripts/restore.sh restore <备份文件> <目标数据库>
```

---

## 一、查看备份状态

### 1.1 查看本地备份

```bash
# 列出所有可用备份
/backup/scripts/restore.sh list

# 列出 Medusa 数据库的备份
/backup/scripts/restore.sh list medusa_production

# 列出 Strapi 数据库的备份
/backup/scripts/restore.sh list strapi_production
```

**输出示例**：
```
Available backups in /backup/postgres/daily/:
medusa_production_20260113_000001.dump (420K) - 2026-01-13 00:00
medusa_production_20260112_000001.dump (418K) - 2026-01-12 00:00
strapi_production_20260113_000001.dump (340K) - 2026-01-13 00:00
strapi_production_20260112_000001.dump (335K) - 2026-01-12 00:00
```

### 1.2 查看云端备份 (R2)

```bash
# 列出 R2 上的备份
rclone ls r2:cs-backups/postgres/daily/ | grep medusa | tail -5

# 查看备份大小
rclone size r2:cs-backups/postgres/daily/
```

### 1.3 查看备份日志

```bash
# 最近备份执行情况
tail -30 /backup/logs/backup-daily.log

# 健康检查状态
tail -20 /backup/logs/health-check.log
```

---

## 二、手动执行备份

### 2.1 执行完整备份（推荐）

```bash
# 执行每日备份（备份所有数据库并同步到 R2）
/backup/scripts/backup-daily.sh
```

**执行过程**：
1. 备份 medusa_production
2. 备份 strapi_production
3. 生成 SHA256 校验文件
4. 同步到 Cloudflare R2
5. 清理过期备份

### 2.2 备份单个数据库

```bash
# 备份 Medusa 数据库
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U cs -h localhost -d medusa_production \
  --format=custom --compress=6 \
  --file="/backup/postgres/daily/medusa_production_${TIMESTAMP}.dump"

# 生成校验文件
sha256sum "/backup/postgres/daily/medusa_production_${TIMESTAMP}.dump" \
  > "/backup/postgres/daily/medusa_production_${TIMESTAMP}.dump.sha256"

# 验证备份
pg_restore --list "/backup/postgres/daily/medusa_production_${TIMESTAMP}.dump" > /dev/null && echo "✓ 备份有效"
```

### 2.3 备份到指定位置

```bash
# 备份到当前目录
pg_dump -U cs -h localhost -d medusa_production \
  --format=custom --compress=6 \
  --file="./medusa_backup_$(date +%Y%m%d).dump"

# 备份为 SQL 文本格式（可读）
pg_dump -U cs -h localhost -d medusa_production \
  --format=plain \
  --file="./medusa_backup_$(date +%Y%m%d).sql"
```

---

## 三、恢复数据库

### 3.1 恢复前检查

```bash
# 1. 验证备份文件完整性
/backup/scripts/restore.sh verify /backup/postgres/daily/medusa_production_20260113_000001.dump

# 2. 查看备份内容（不执行恢复）
pg_restore --list /backup/postgres/daily/medusa_production_20260113_000001.dump | head -30

# 3. 检查目标数据库连接数
psql -U cs -d medusa_production -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'medusa_production';"
```

### 3.2 恢复到新数据库（安全方式）

**推荐此方式**：先恢复到临时数据库，验证后再切换。

```bash
# 1. 停止应用
pm2 stop medusa-backend

# 2. 创建临时数据库
createdb -U cs medusa_restore

# 3. 恢复数据
pg_restore -U cs -d medusa_restore \
  /backup/postgres/daily/medusa_production_20260113_000001.dump

# 4. 验证恢复的数据
psql -U cs -d medusa_restore -c "SELECT count(*) FROM product;"
psql -U cs -d medusa_restore -c "SELECT count(*) FROM \"order\";"

# 5. 确认无误后，切换数据库
psql -U cs -c "
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'medusa_production';
"
dropdb -U cs medusa_production
psql -U cs -c "ALTER DATABASE medusa_restore RENAME TO medusa_production;"

# 6. 重启应用
pm2 start medusa-backend
```

### 3.3 直接恢复（覆盖原数据库）

**⚠️ 警告**：此操作会删除原数据库所有数据！

```bash
# 1. 停止应用
pm2 stop medusa-backend

# 2. 断开所有连接并删除数据库
psql -U cs -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'medusa_production';"
dropdb -U cs medusa_production

# 3. 创建空数据库
createdb -U cs medusa_production

# 4. 恢复数据
pg_restore -U cs -d medusa_production \
  /backup/postgres/daily/medusa_production_20260113_000001.dump

# 5. 重启应用
pm2 start medusa-backend
```

### 3.4 恢复单个表

```bash
# 恢复 product 表到 medusa_production
/backup/scripts/restore.sh restore-table \
  /backup/postgres/daily/medusa_production_20260113_000001.dump \
  medusa_production \
  product

# 或手动执行
pg_restore -U cs -d medusa_production \
  --table=product \
  --data-only \
  /backup/postgres/daily/medusa_production_20260113_000001.dump
```

### 3.5 从 R2 云端恢复

```bash
# 1. 下载备份文件
/backup/scripts/restore.sh download medusa_production 20260113

# 或手动下载
rclone copy r2:cs-backups/postgres/daily/medusa_production_20260113_000001.dump /backup/postgres/daily/

# 2. 按上述步骤恢复
```

---

## 四、Strapi 数据库操作

### 4.1 备份 Strapi

```bash
# 使用统一备份脚本
/backup/scripts/backup-daily.sh

# 或单独备份
pg_dump -U cs -h localhost -d strapi_production \
  --format=custom --compress=6 \
  --file="/backup/postgres/daily/strapi_production_$(date +%Y%m%d_%H%M%S).dump"
```

### 4.2 恢复 Strapi

```bash
# 1. 停止 Strapi
pm2 stop strapi-cms

# 2. 恢复数据库
psql -U cs -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'strapi_production';"
dropdb -U cs strapi_production
createdb -U cs strapi_production
pg_restore -U cs -d strapi_production \
  /backup/postgres/daily/strapi_production_20260113_000001.dump

# 3. 重启 Strapi
pm2 start strapi-cms
```

---

## 五、常见场景

### 场景 1：回滚到昨天的数据

```bash
# 1. 查找昨天的备份
/backup/scripts/restore.sh list medusa_production

# 2. 停止服务
pm2 stop medusa-backend

# 3. 恢复昨天的备份
BACKUP="/backup/postgres/daily/medusa_production_20260112_000001.dump"
psql -U cs -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'medusa_production';"
dropdb -U cs medusa_production
createdb -U cs medusa_production
pg_restore -U cs -d medusa_production $BACKUP

# 4. 重启服务
pm2 start medusa-backend
```

### 场景 2：迁移数据库到新服务器

```bash
# 在原服务器：导出备份
pg_dump -U cs -h localhost -d medusa_production \
  --format=custom --compress=9 \
  --file="medusa_migration.dump"

# 传输到新服务器
scp medusa_migration.dump user@new-server:/tmp/

# 在新服务器：恢复
createdb -U cs medusa_production
pg_restore -U cs -d medusa_production /tmp/medusa_migration.dump
```

### 场景 3：克隆生产数据到测试环境

```bash
# 创建测试数据库
createdb -U cs medusa_test

# 从最新备份恢复
pg_restore -U cs -d medusa_test \
  /backup/postgres/daily/medusa_production_20260113_000001.dump

# 清理敏感数据（可选）
psql -U cs -d medusa_test -c "
  UPDATE customer SET email = 'test_' || id || '@example.com';
  UPDATE customer SET phone = NULL;
"
```

### 场景 4：导出特定表数据

```bash
# 导出单个表为 CSV
psql -U cs -d medusa_production -c "\COPY product TO '/tmp/products.csv' WITH CSV HEADER;"

# 导出单个表为 SQL
pg_dump -U cs -d medusa_production \
  --table=product \
  --data-only \
  --file="/tmp/products.sql"
```

---

## 六、故障排查

### 问题 1：备份失败

```bash
# 检查磁盘空间
df -h /backup

# 检查数据库连接
psql -U cs -h localhost -d medusa_production -c "SELECT 1;"

# 查看详细错误日志
tail -50 /backup/logs/backup-daily.log
```

### 问题 2：恢复失败

```bash
# 常见错误：数据库已存在
dropdb -U cs target_database  # 先删除

# 常见错误：权限不足
psql -U cs -c "GRANT ALL PRIVILEGES ON DATABASE medusa_production TO cs;"

# 常见错误：外键约束
pg_restore -U cs -d medusa_production --disable-triggers backup.dump
```

### 问题 3：R2 同步失败

```bash
# 检查 rclone 配置
rclone config show r2

# 测试连接
rclone lsd r2:cs-backups/

# 手动同步
rclone sync /backup/postgres/daily/ r2:cs-backups/postgres/daily/ -v
```

---

## 七、备份文件说明

| 文件类型 | 扩展名 | 说明 |
|---------|--------|------|
| Custom 格式 | `.dump` | pg_dump 自定义格式，支持并行恢复 |
| 校验文件 | `.dump.sha256` | SHA256 校验和 |
| SQL 文本 | `.sql` | 纯文本 SQL，可读但较大 |
| 压缩归档 | `.tar.gz` | 物理备份归档 |

### 文件命名规则

```
{数据库名}_{日期}_{时间}.dump
medusa_production_20260113_000001.dump
└─────┬─────────┘ └───┬───┘ └──┬──┘
   数据库名        日期     时间
```

---

## 八、快速命令速查

```bash
# ==================== 备份 ====================
/backup/scripts/backup-daily.sh              # 执行完整备份
/backup/scripts/restore.sh list              # 列出所有备份

# ==================== 恢复 ====================
pm2 stop medusa-backend                      # 停止服务
/backup/scripts/restore.sh restore <备份> <数据库>  # 恢复
pm2 start medusa-backend                     # 启动服务

# ==================== 验证 ====================
/backup/scripts/restore.sh verify <备份>     # 验证备份
tail -20 /backup/logs/backup-daily.log       # 查看日志

# ==================== R2 云端 ====================
rclone ls r2:cs-backups/postgres/daily/      # 列出云端备份
/backup/scripts/restore.sh download <db> <date>  # 下载备份
```

---

## 相关文档

- [数据库备份策略](./database-backup-strategy.md) - 自动备份系统详解
- [生产环境配置分析](./production-setup-analysis.md) - 整体架构分析
- [PM2 运行指南](./README.md) - 服务管理
