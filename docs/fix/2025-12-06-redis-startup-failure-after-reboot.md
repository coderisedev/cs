# Redis 服务器重启后启动失败问题

## 问题描述

每次 GCE 服务器重启后，Redis 服务无法正常启动，导致 Medusa 容器报错：

```
[ioredis] Unhandled error event: Error: connect ECONNREFUSED 172.30.0.1:6379
```

## 根本原因

Redis 配置绑定到 Docker 网桥 IP 地址（`172.30.0.1`, `172.31.0.1`），但服务器重启时：

1. systemd 按依赖顺序启动服务
2. Redis 服务启动时，Docker 服务可能还没完全启动
3. Docker 网桥 IP 地址尚未创建
4. Redis 尝试绑定到不存在的 IP 地址，启动失败

### 错误日志

```
# /var/log/redis/redis-server.log
Warning: Could not create server TCP listening socket 172.31.0.1:6379: bind: Cannot assign requested address
Failed listening on port 6379 (TCP), aborting.
```

### 网络配置

Docker 创建的网桥网络：
- `cs-prod_cs-prod-net`: Gateway `172.30.0.1` (prod 环境)
- `cs-dev_cs-dev-net`: Gateway `172.31.0.1` (dev 环境)

Redis 需要绑定到这些 IP 才能让 Docker 容器访问。

## 解决方案

### 1. 更新 Redis 绑定配置

编辑 `/etc/redis/redis.conf`，绑定到所有需要的 IP：

```conf
bind 127.0.0.1 172.30.0.1 172.31.0.1 ::1
```

### 2. 创建 systemd 服务依赖

创建 override 文件确保 Redis 在 Docker 启动后再启动：

```bash
sudo mkdir -p /etc/systemd/system/redis-server.service.d
sudo tee /etc/systemd/system/redis-server.service.d/override.conf << 'EOF'
[Unit]
After=docker.service network-online.target
Wants=docker.service
Requires=network-online.target

[Service]
Restart=on-failure
RestartSec=10
EOF

sudo systemctl daemon-reload
```

### 配置说明

| 配置项 | 作用 |
|--------|------|
| `After=docker.service` | 确保 Docker 服务先启动 |
| `Wants=docker.service` | 弱依赖 Docker 服务 |
| `Requires=network-online.target` | 强依赖网络就绪 |
| `Restart=on-failure` | 启动失败时自动重试 |
| `RestartSec=10` | 重试间隔 10 秒 |

## 验证步骤

```bash
# 1. 重启 Redis 服务
sudo systemctl restart redis-server

# 2. 检查服务状态
systemctl status redis-server

# 3. 测试 Redis 连接
redis-cli -h 127.0.0.1 ping      # 本地
redis-cli -h 172.30.0.1 ping     # prod 网桥
redis-cli -h 172.31.0.1 ping     # dev 网桥

# 4. 从容器内测试
docker exec cs-prod-medusa-1 nc -zv 172.30.0.1 6379
```

## 相关文件

- Redis 配置: `/etc/redis/redis.conf`
- systemd override: `/etc/systemd/system/redis-server.service.d/override.conf`
- Redis 日志: `/var/log/redis/redis-server.log`

## 环境变量配置

确保 Docker 容器使用正确的 Redis URL：

```bash
# deploy/gce/.env.prod
MEDUSA_REDIS_URL=redis://host.docker.internal:6379/0

# deploy/gce/.env.dev
MEDUSA_REDIS_URL=redis://host.docker.internal:6379/1
```

`host.docker.internal` 会自动解析到 Docker 网桥的 Gateway IP。

## 预防措施

1. 服务器重启后，检查 Redis 状态：`systemctl status redis-server`
2. 如果 Redis 启动失败，等待 Docker 完全启动后手动重启：`sudo systemctl restart redis-server`
3. 监控 Medusa 日志中的 Redis 连接错误

## 总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Redis 启动失败 | Docker 网桥 IP 未就绪 | 添加 systemd 依赖 |
| 连接被拒绝 | Redis 未绑定到网桥 IP | 更新 bind 配置 |
| 间歇性失败 | 启动顺序竞争 | 添加自动重试机制 |
