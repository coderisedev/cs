---
title: GCE 降配后服务恢复指南
last_updated: 2026-02-12
status: ✅ Verified
related_docs:
  - docs/runbooks/gce-backend-playbook.md
  - docs/runbooks/postgres-host-cli-ops.md
  - docs/runbooks/gce-architecture-review.md
---

# GCE 降配后服务恢复指南

当 GCE 实例降低配置（如 4c8g → 2c4g）后，依赖服务可能因内存不足无法启动，导致 PM2 管理的应用反复崩溃。本文档记录完整的诊断与修复流程。

## 故障链路

```
GCE 降配 (RAM 减少)
  → PostgreSQL shared_buffers 超过可用内存 → PG 启动失败
    → Medusa 连接 PG 失败 (ECONNREFUSED :5432) → 反复崩溃重启
    → Strapi 连接 PG 失败 (ECONNREFUSED :5432) → 反复崩溃重启
```

## 1. 快速诊断

### 1.1 检查系统资源

```bash
free -h          # 确认当前内存总量
nproc            # 确认 CPU 核心数
df -h /          # 确认磁盘空间
```

### 1.2 检查 PM2 应用状态

```bash
# PM2 通过 pnpm 安装在项目中，需要先设置 PATH
export PATH="/home/coderisedev/.nvm/versions/node/v24.11.1/bin:$PATH"
cd /home/coderisedev/cs

npx pm2 list                    # 查看进程状态
npx pm2 logs --lines 50        # 查看最近日志
```

如果看到应用状态为 `online` 但 restart count 持续增长，说明应用在反复崩溃重启。

### 1.3 检查依赖服务

```bash
# PostgreSQL
sudo systemctl status postgresql@18-main

# Redis
sudo systemctl status redis-server
```

### 1.4 查看应用错误日志

```bash
# Medusa 日志
tail -50 /home/coderisedev/.pm2/logs/medusa-backend-error.log
tail -50 /home/coderisedev/.pm2/logs/medusa-backend-out.log

# Strapi 日志
tail -50 /home/coderisedev/.pm2/logs/strapi-cms-error.log
tail -50 /home/coderisedev/.pm2/logs/strapi-cms-out.log
```

**关键错误特征：**

| 错误信息 | 含义 |
|----------|------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL 未运行 |
| `ECONNREFUSED 127.0.0.1:6379` | Redis 未运行 |
| `could not map anonymous shared memory: Cannot allocate memory` | PG 内存配置超出系统可用内存 |

### 1.5 确认 PostgreSQL 启动失败原因

```bash
sudo systemctl status postgresql@18-main
# 或查看 PG 日志
sudo tail -20 /var/log/postgresql/postgresql-18-main.log
```

典型输出：
```
FATAL: could not map anonymous shared memory: Cannot allocate memory
HINT: ... reduce "shared_buffers" or "max_connections".
```

## 2. 修复 PostgreSQL 内存配置

### 2.1 定位配置文件

PostgreSQL 主配置文件在 `/etc/postgresql/18/main/postgresql.conf`，但可能被 `conf.d/` 下的文件覆盖。

```bash
# 查找所有 shared_buffers 配置
sudo grep -rn "shared_buffers" /etc/postgresql/18/main/
```

本项目的覆盖文件位于：
```
/etc/postgresql/18/main/conf.d/performance.conf
```

### 2.2 按内存调整参数

参考值（按总 RAM 计算）：

| 参数 | 4GB RAM | 8GB RAM | 16GB RAM |
|------|---------|---------|----------|
| `shared_buffers` | 512MB | 2GB | 4GB |
| `effective_cache_size` | 2GB | 6GB | 12GB |
| `work_mem` | 16MB | 32MB | 64MB |
| `maintenance_work_mem` | 128MB | 256MB | 512MB |
| `wal_buffers` | 16MB | 32MB | 64MB |

### 2.3 修改配置

```bash
sudo tee /etc/postgresql/18/main/conf.d/performance.conf > /dev/null << 'EOF'
# PostgreSQL Performance Tuning for 4GB RAM (2c4g GCE)
# Updated: 2026-02-12

# =============================================================================
# Memory Configuration
# =============================================================================
shared_buffers = 512MB                  # ~12% of 4GB RAM
effective_cache_size = 2GB              # ~50% of RAM
work_mem = 16MB                         # Per-operation memory
maintenance_work_mem = 128MB            # Maintenance operations
wal_buffers = 16MB                      # WAL buffer size

# =============================================================================
# SSD Optimization
# =============================================================================
random_page_cost = 1.1                  # SSD has low random read cost
effective_io_concurrency = 200          # SSD can handle concurrent I/O

# =============================================================================
# WAL Configuration
# =============================================================================
checkpoint_completion_target = 0.9      # Spread checkpoint writes
max_wal_size = 2GB                      # Maximum WAL size before checkpoint
min_wal_size = 1GB                      # Minimum WAL size to retain

# =============================================================================
# Query Planner
# =============================================================================
default_statistics_target = 100         # Statistics sampling

# =============================================================================
# Logging (for debugging slow queries)
# =============================================================================
log_min_duration_statement = 1000       # Log queries taking > 1 second
EOF
```

### 2.4 重启 PostgreSQL

```bash
sudo systemctl restart postgresql@18-main
sudo systemctl status postgresql@18-main    # 确认 active (running)
```

## 3. 重启应用服务

```bash
export PATH="/home/coderisedev/.nvm/versions/node/v24.11.1/bin:$PATH"
cd /home/coderisedev/cs

npx pm2 restart all
```

### 3.1 验证服务

等待 1-2 分钟让应用完成初始化，然后检查：

```bash
npx pm2 list                    # 确认 status=online, uptime 持续增长

# 检查应用日志确认启动成功
tail -5 ~/.pm2/logs/medusa-backend-out.log
# 期望看到: "Server is ready on port: 9000"

tail -5 ~/.pm2/logs/strapi-cms-out.log
# 期望看到: "Strapi started successfully"
```

### 3.2 端口验证

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/health    # Medusa
curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/_health   # Strapi
```

## 4. 配置 Swap（强烈推荐）

小内存机器建议配置 swap 防止 OOM Killer 杀进程。

### 4.1 创建 Swap 文件

```bash
# 建议大小：2x RAM（4GB RAM → 8GB swap）
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 4.2 持久化配置

```bash
# 写入 fstab，开机自动挂载
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 设置 swappiness=10（优先使用物理内存，仅在紧张时使用 swap）
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 4.3 验证

```bash
free -h
# 期望看到 Swap 行显示正确大小
```

## 5. 降配注意事项清单

在降低 GCE 实例配置前，检查以下项目：

- [ ] PostgreSQL `conf.d/performance.conf` 中的内存参数是否适配新的 RAM 大小
- [ ] 系统是否配置了 swap
- [ ] Redis `maxmemory` 是否需要调整（`/etc/redis/redis.conf`）
- [ ] PM2 管理的 Node.js 进程是否设置了 `--max-old-space-size` 限制
- [ ] 降配后执行 `free -h` 确认内存余量 > 500MB

## 6. 服务启动顺序

降配或重启后，服务需要按依赖顺序启动：

```
1. PostgreSQL  →  2. Redis  →  3. PM2 (Medusa + Strapi)
```

systemd 会自动处理 PostgreSQL 和 Redis 的启动。PM2 通过 `pm2 startup` 配置的 systemd 服务自动恢复保存的进程列表。如果 PM2 进程先于 PostgreSQL 启动，应用会因连接失败而反复重启，直到 PG 就绪后自然恢复（前提是 PG 能正常启动）。
