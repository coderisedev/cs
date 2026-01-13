# 数据库备份策略

**最后更新**: 2026-01-13

## 备份架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              备份流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │ PostgreSQL  │────▶│  本地备份   │────▶│  R2 云端    │                   │
│  │  数据库     │     │ /backup/    │     │ cs-backups/ │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│        │                   │                   │                            │
│        ▼                   ▼                   ▼                            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  每日逻辑   │     │  每周物理   │     │  健康检查   │                   │
│  │  备份 00:00 │     │  备份 周日  │     │  每6小时    │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 备份类型

### 1. 每日逻辑备份 (pg_dump)

| 配置项 | 值 |
|--------|-----|
| 执行时间 | 每天 00:00 |
| 格式 | PostgreSQL custom format (.dump) |
| 压缩 | 级别 6 |
| 保留期 | 30 天 |
| 存储位置 | `/backup/postgres/daily/` |
| 云同步 | `r2:cs-backups/postgres/daily/` |

**备份的数据库**：
- `medusa_production` (~420KB)
- `strapi_production` (~340KB)

**优点**：
- 可选择性恢复（单表、单 schema）
- 支持并行恢复
- 文件小，便于传输

### 2. 每周物理备份 (pg_basebackup)

| 配置项 | 值 |
|--------|-----|
| 执行时间 | 每周日 02:00 |
| 格式 | tar.gz 归档 |
| 保留期 | 4 周 |
| 存储位置 | `/backup/postgres/weekly/` |
| 云同步 | `r2:cs-backups/postgres/weekly/` |

**优点**：
- 完整集群备份
- 支持 PITR (Point-in-Time Recovery)
- 恢复速度快

### 3. 健康检查

| 配置项 | 值 |
|--------|-----|
| 执行频率 | 每 6 小时 |
| 检查项 | 备份时效性、完整性、大小变化 |
| 告警 | Discord Webhook |

## 目录结构

```
/backup/
├── postgres/
│   ├── daily/                          # 每日备份
│   │   ├── medusa_production_YYYYMMDD_HHMMSS.dump
│   │   ├── medusa_production_YYYYMMDD_HHMMSS.dump.sha256
│   │   ├── strapi_production_YYYYMMDD_HHMMSS.dump
│   │   └── strapi_production_YYYYMMDD_HHMMSS.dump.sha256
│   └── weekly/                         # 周备份
│       └── base_YYYYMMDD_HHMMSS.tar.gz
├── scripts/
│   ├── backup-daily.sh                 # 每日备份脚本
│   ├── backup-weekly.sh                # 周备份脚本
│   ├── health-check.sh                 # 健康检查脚本
│   ├── restore.sh                      # 恢复脚本
│   └── postgres-backup.cron            # Cron 配置
└── logs/
    ├── backup-daily.log
    ├── backup-weekly.log
    ├── health-check.log
    └── cron.log
```

## 常用命令

### 查看备份状态

```bash
# 查看最新备份
ls -lht /backup/postgres/daily/ | head -10

# 查看备份日志
tail -50 /backup/logs/backup-daily.log

# 查看健康检查
tail -30 /backup/logs/health-check.log

# 查看 R2 云端备份
rclone ls r2:cs-backups/postgres/daily/ | tail -10
```

### 手动执行备份

```bash
# 执行每日备份
/backup/scripts/backup-daily.sh

# 执行周备份
/backup/scripts/backup-weekly.sh

# 执行健康检查
/backup/scripts/health-check.sh
```

### 恢复操作

```bash
# 列出可用备份
/backup/scripts/restore.sh list

# 列出特定数据库的备份
/backup/scripts/restore.sh list medusa_production

# 验证备份完整性
/backup/scripts/restore.sh verify /backup/postgres/daily/medusa_production_20260113_000001.dump

# 恢复到新数据库
/backup/scripts/restore.sh restore /backup/postgres/daily/medusa_production_20260113_000001.dump medusa_restore

# 恢复单个表
/backup/scripts/restore.sh restore-table /backup/postgres/daily/medusa_production_20260113_000001.dump medusa_production product

# 从 R2 下载备份
/backup/scripts/restore.sh download medusa_production 20260113
```

## 灾难恢复流程

### 场景 1：恢复单个数据库

```bash
# 1. 停止应用
pm2 stop medusa-backend

# 2. 选择备份文件
BACKUP="/backup/postgres/daily/medusa_production_20260113_000001.dump"

# 3. 验证备份
/backup/scripts/restore.sh verify $BACKUP

# 4. 恢复（会先删除原数据库，谨慎操作！）
# 方法 A: 恢复到原数据库
dropdb -U cs medusa_production
createdb -U cs medusa_production
pg_restore -U cs -d medusa_production $BACKUP

# 方法 B: 恢复到临时数据库后切换
/backup/scripts/restore.sh restore $BACKUP medusa_restore
# 验证数据后再切换

# 5. 重启应用
pm2 start medusa-backend
```

### 场景 2：从 R2 恢复

```bash
# 1. 下载备份
/backup/scripts/restore.sh download medusa_production 20260113

# 2. 按场景 1 步骤恢复
```

### 场景 3：完整集群恢复 (使用周备份)

```bash
# 1. 停止 PostgreSQL
sudo systemctl stop postgresql

# 2. 备份当前数据目录
sudo mv /var/lib/postgresql/18/main /var/lib/postgresql/18/main.old

# 3. 解压周备份
sudo tar -xzf /backup/postgres/weekly/base_XXXXXX.tar.gz -C /var/lib/postgresql/18/

# 4. 修复权限
sudo chown -R postgres:postgres /var/lib/postgresql/18/main

# 5. 启动 PostgreSQL
sudo systemctl start postgresql
```

## 监控与告警

### Discord 通知配置

在 cron 环境中设置：

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxx/yyy"
```

### 告警触发条件

| 条件 | 级别 |
|------|------|
| 备份失败 | 🔴 CRITICAL |
| R2 同步失败 | 🟡 WARNING |
| 备份大小变化 >50% | 🟡 WARNING |
| 备份超过 24 小时未更新 | 🔴 CRITICAL |
| 磁盘使用率 >80% | 🟡 WARNING |

## 最佳实践检查清单

- [x] 每日自动备份
- [x] 云端异地备份 (Cloudflare R2)
- [x] 备份完整性校验 (SHA256)
- [x] 定期健康检查
- [x] 恢复脚本就绪
- [x] 备份轮转清理 (30天/4周)
- [ ] 定期恢复演练 (建议每月一次)
- [ ] 备份加密 (如需合规)

## 2026-01-13 修复记录

**问题**：周备份失败，`cs` 用户缺少 REPLICATION 权限

**修复**：
```sql
ALTER USER cs WITH REPLICATION;
```

## 相关文档

- [PM2 运行指南](./README.md)
- [生产环境配置分析](./production-setup-analysis.md)
- [PostgreSQL 官方备份文档](https://www.postgresql.org/docs/current/backup.html)
