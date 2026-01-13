# 生产环境配置分析与优化

**日期**: 2026-01-13
**环境**: GCE VM (4核/16GB/96GB SSD)

## 当前架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ prd.aidenlux │  │ api.aidenlux │  │content.aiden │           │
│  │   (Vercel)   │  │  (CF Tunnel) │  │ (CF Tunnel)  │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────────────────────────────────┐
│     Vercel      │  │              GCE VM (本机)                   │
│ ┌─────────────┐ │  │  ┌─────────────┐     ┌─────────────┐        │
│ │ dji-store-  │ │  │  │   Medusa    │     │   Strapi    │        │
│ │   front     │ │  │  │  (PM2:9000) │     │ (PM2:1337)  │        │
│ └─────────────┘ │  │  └──────┬──────┘     └──────┬──────┘        │
└─────────────────┘  │         │                   │               │
                     │         ▼                   ▼               │
                     │  ┌─────────────┐     ┌─────────────┐        │
                     │  │ PostgreSQL  │     │    Redis    │        │
                     │  │   (:5432)   │     │   (:6379)   │        │
                     │  └─────────────┘     └─────────────┘        │
                     └─────────────────────────────────────────────┘
```

## 资源使用情况

| 资源 | 总量 | 已用 | 可用 |
|------|------|------|------|
| CPU | 4 核 | ~5% | 95% |
| 内存 | 16 GB | 2.9 GB | 12 GB |
| 磁盘 | 96 GB | 32 GB | 65 GB |

### 服务内存占用

| 服务 | 内存 | 重启次数 |
|------|------|---------|
| Medusa | 68 MB | 84 (历史) |
| Strapi | 32 MB | 0 |
| PostgreSQL | ~200 MB | - |
| Redis | 1 MB | - |

## 配置分析

### 1. PM2 配置 ✅ 已优化

**之前的问题**：
- ❌ 无 `min_uptime` 配置，短时间崩溃计入重启
- ❌ 无日志轮转
- ❌ 无优雅关闭配置
- ❌ 内存限制过高 (1G)

**已优化**：
- ✅ 添加 `min_uptime: 30s`
- ✅ 安装 pm2-logrotate (50MB/文件, 保留7天, 压缩)
- ✅ 添加 `kill_timeout: 10000` 优雅关闭
- ✅ 调整内存限制为 800MB

### 2. PostgreSQL 配置 ⚠️ 需要优化

**当前配置** (默认值，未针对 16GB 内存优化)：

| 参数 | 当前值 | 建议值 | 说明 |
|------|--------|--------|------|
| `shared_buffers` | 128MB | **4GB** | 内存的 25% |
| `effective_cache_size` | 4GB | **12GB** | 内存的 75% |
| `work_mem` | 4MB | **64MB** | 排序/哈希操作内存 |
| `maintenance_work_mem` | 64MB | **512MB** | 维护操作内存 |
| `wal_buffers` | 4MB | **64MB** | WAL 缓冲 |
| `max_connections` | 100 | 100 | 保持不变 |

**优化命令**：

```bash
# 编辑 PostgreSQL 配置
sudo nano /etc/postgresql/16/main/postgresql.conf

# 添加/修改以下配置
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 512MB
wal_buffers = 64MB
random_page_cost = 1.1          # SSD 优化
effective_io_concurrency = 200  # SSD 优化
checkpoint_completion_target = 0.9

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

### 3. Redis 配置 ✅ 合理

**当前配置**：

| 参数 | 值 | 评价 |
|------|-----|------|
| `maxmemory` | 1GB | ✅ 适中 |
| `maxmemory-policy` | allkeys-lru | ✅ 正确 |

Redis 配置合理，用于缓存和队列场景。

### 4. Cloudflare Tunnel ✅ 正常

- 服务运行正常 (systemd 管理)
- 自动重连机制
- 日志中有一些 404 错误是正常的（扫描流量）

## 架构评估

### 优点 ✅

1. **前后端分离**
   - 前端部署在 Vercel (CDN + 边缘渲染)
   - 后端服务本地运行，完全控制

2. **成本效益**
   - 单机部署，无需多台服务器
   - Vercel 免费层足够使用
   - Cloudflare Tunnel 免费

3. **安全性**
   - 无公网 IP 暴露
   - 所有流量通过 Cloudflare
   - DDoS 保护

4. **简单性**
   - PM2 管理简单，易于维护
   - 单机故障排查方便

### 风险点 ⚠️

1. **单点故障**
   - 服务器宕机 = 全站不可用
   - 建议：设置监控告警

2. **无自动扩展**
   - 流量激增时无法自动扩容
   - 当前配置可承受中小型流量

3. **备份策略**
   - 需确保数据库定期备份
   - 建议：每日备份到外部存储

## 是否符合生产最佳实践？

| 方面 | 评估 | 说明 |
|------|------|------|
| 可用性 | ⚠️ 中等 | 单点故障风险 |
| 性能 | ✅ 良好 | 资源充足，可优化 PG |
| 安全性 | ✅ 良好 | CF 保护，无直接暴露 |
| 可维护性 | ✅ 良好 | PM2 + systemd 易管理 |
| 成本 | ✅ 优秀 | 单机 + 免费服务 |
| 扩展性 | ⚠️ 有限 | 垂直扩展为主 |

**结论**：对于**中小型电商项目**，当前架构是**合理且经济**的选择。

## 推荐优化清单

### 立即执行 🔴

1. [x] ~~优化 PM2 配置~~ (已完成)
2. [x] ~~安装 pm2-logrotate~~ (已完成)
3. [ ] 优化 PostgreSQL 配置
4. [ ] 设置 PM2 开机自启

### 短期优化 🟡

5. [ ] 配置数据库自动备份
6. [ ] 设置 Uptime 监控 (UptimeRobot/Better Stack)
7. [ ] 配置告警通知 (邮件/Slack)

### 长期考虑 🟢

8. [ ] 如流量增长，考虑数据库分离到独立服务器
9. [ ] 如需高可用，考虑多节点部署

## 快速执行脚本

### PostgreSQL 优化

```bash
# 创建优化配置文件
sudo tee /etc/postgresql/16/main/conf.d/performance.conf << 'EOF'
# 内存优化 (16GB RAM)
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 512MB
wal_buffers = 64MB

# SSD 优化
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL 优化
checkpoint_completion_target = 0.9
max_wal_size = 2GB
min_wal_size = 1GB

# 日志
log_min_duration_statement = 1000  # 记录超过1秒的慢查询
EOF

# 重启生效
sudo systemctl restart postgresql
```

### PM2 开机自启

```bash
# 生成 startup 脚本
pm2 startup

# 保存当前进程列表
pm2 save
```

### 数据库备份脚本

```bash
# 创建备份脚本
mkdir -p ~/backups
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups

# 备份 Medusa 数据库
pg_dump -U cs medusa_production | gzip > $BACKUP_DIR/medusa_$DATE.sql.gz

# 备份 Strapi 数据库
pg_dump -U cs strapi_production | gzip > $BACKUP_DIR/strapi_$DATE.sql.gz

# 保留最近 7 天
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x ~/backup-db.sh

# 添加到 crontab (每天凌晨 3 点)
(crontab -l 2>/dev/null; echo "0 3 * * * ~/backup-db.sh") | crontab -
```

## 相关文档

- [PM2 本地运行指南](./README.md)
- [Medusa Admin 白屏修复](./medusa-admin-white-screen-fix.md)
- [Docker vs PM2 PayPal 问题](../pay/docker-vs-pm2-paypal-fix.md)
