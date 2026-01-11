# GCE 单机架构分析与优化指南

*文档版本: 2025-12-06*

## 当前架构概览

本服务器同时运行 Dev 和 Prod 环境，采用 Docker 容器 + 宿主机数据库的混合部署模式。

### 服务部署情况

| 组件 | 部署方式 | Dev | Prod |
|------|----------|-----|------|
| **Medusa** | Docker 容器 | :9001 | :9000 |
| **Strapi** | Docker 容器 | :1338 | :1337 |
| **PostgreSQL** | 宿主机服务 | medusa_dev, strapi_dev | medusa_production, strapi_production |
| **Redis** | 宿主机服务 | DB 1 | DB 0 |
| **Storefront** | Vercel | - | - |

### 服务器资源 (2025-12-06)

- **CPU**: 4 核
- **内存**: 16GB
- **磁盘**: 96GB
- **容器内存占用**: ~1.2GB (4 个容器共计)

---

## 架构评估

### 优点

1. **简单易管理** - 单机部署，运维复杂度低
2. **成本效益** - 一台机器承载 dev + prod，节省成本
3. **资源利用率高** - 当前负载下资源充足
4. **数据库隔离良好** - 不同环境使用独立数据库和 Redis DB

### 风险与问题

| 风险 | 严重程度 | 说明 |
|------|----------|------|
| **单点故障** | 高 | 服务器宕机，dev 和 prod 同时不可用 |
| **资源争用** | 中 | dev 的重负载操作可能影响 prod 性能 |
| **安全隔离不足** | 中 | dev 容器可访问 prod 数据库 (仅凭密码隔离) |
| **磁盘空间紧张** | 中 | 76% 使用率，Docker 镜像/日志会持续增长 |
| **无备份容灾** | 高 | PostgreSQL 在宿主机，无自动备份 |
| **Redis 无持久化/限制** | 低 | maxmemory=0 可能导致 OOM |

---

## 短期优化措施 (已实施)

### 1. Redis 内存限制

```bash
# 设置 1GB 内存限制和 LRU 淘汰策略
redis-cli CONFIG SET maxmemory 1gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 持久化配置到文件
sudo tee -a /etc/redis/redis.conf << 'EOF'
maxmemory 1gb
maxmemory-policy allkeys-lru
EOF
```

### 2. PostgreSQL 自动备份

备份脚本: `/opt/scripts/backup-postgres.sh`

```bash
#!/bin/bash
# PostgreSQL 每日备份脚本
BACKUP_DIR="/var/backups/postgres"
GCS_BUCKET="gs://your-bucket/postgres-backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# 备份所有数据库
sudo -u postgres pg_dumpall | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# 上传到 GCS (可选)
# gsutil cp "$BACKUP_DIR/postgres_$DATE.sql.gz" "$GCS_BUCKET/"

# 清理旧备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: postgres_$DATE.sql.gz"
```

Cron 配置:
```bash
# 每天凌晨 3 点执行备份
0 3 * * * /opt/scripts/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1
```

### 3. 磁盘空间清理

```bash
# 清理未使用的 Docker 资源
docker system prune -a --volumes -f

# 清理旧日志
sudo journalctl --vacuum-time=7d

# 清理 apt 缓存
sudo apt clean
```

---

## 中期改进建议

| 改进项 | 说明 | 优先级 |
|--------|------|--------|
| **分离 prod 数据库** | 使用 Cloud SQL 托管 prod PostgreSQL，自动备份+高可用 | 高 |
| **添加监控告警** | 部署 Prometheus + Grafana 或使用 Cloud Monitoring | 中 |
| **容器资源限制** | 在 docker-compose 中设置 memory limits 防止单容器耗尽资源 | 中 |
| **日志轮转** | 配置 Docker 和应用日志轮转，防止磁盘占满 | 中 |

### Docker Compose 资源限制示例

```yaml
services:
  medusa:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 512M
```

---

## 长期改进建议 (规模增长后)

| 改进项 | 说明 |
|--------|------|
| **环境分离** | Dev 和 Prod 使用独立 VM 或 K8s namespace |
| **使用托管服务** | Cloud SQL, Cloud Memorystore (Redis) |
| **负载均衡** | 多实例 + Load Balancer 实现高可用 |
| **CDN 优化** | 静态资源全部走 Cloudflare CDN |

---

## 监控检查清单

日常检查:
```bash
# 磁盘使用
df -h /

# 内存使用
free -h

# Docker 容器状态
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Docker 资源占用
docker stats --no-stream

# PostgreSQL 连接数
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Redis 内存使用
redis-cli INFO memory | grep used_memory_human
```

---

## 相关文档

- [Redis 启动失败修复](../fix/2025-12-06-redis-startup-failure-after-reboot.md)
- [GCE 后端部署手册](./gce-backend-playbook.md)
- [PostgreSQL 宿主机操作](./postgres-host-cli-ops.md)

---

## 结论

**当前架构适合**: 早期项目、低流量、预算有限的场景

**需要尽快处理**:
1. ✅ Redis 内存限制
2. ✅ PostgreSQL 备份策略
3. ✅ 磁盘空间监控和清理

**流量增长后考虑**: 将 prod 数据库迁移到托管服务，实现 dev/prod 物理隔离
