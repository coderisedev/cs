# Docker vs PM2 运行环境下 PayPal 支付问题分析

**日期**: 2026-01-13
**问题**: Docker 容器运行 Medusa 时 PayPal 生产支付失败，切换到 PM2 后正常

## 问题现象

- Docker 部署：PayPal 生产环境支付失败
- PM2 部署：PayPal 生产环境支付成功
- 其他功能（API、数据库、Redis）均正常

## 根本原因分析

### 1. 最可能的原因：PayPal 环境变量未传递到 Docker 容器 🔴

对比 `deploy/gce/prod/docker-compose.yml` 的配置：

```yaml
services:
  medusa:
    env_file: ../.env.prod
    environment:
      NODE_ENV: production
      PORT: ${MEDUSA_PORT:-9000}
      DATABASE_URL: ${MEDUSA_DATABASE_URL}
      REDIS_URL: ${MEDUSA_REDIS_URL}
      STORE_CORS: ${STORE_CORS}
      # ... 其他变量
      # ❌ 缺少 PAYPAL_* 变量！
```

#### 问题分析

虽然使用了 `env_file: ../.env.prod` 加载环境变量，但存在以下问题：

| 变量 | `.env.prod` 中存在 | `environment` 显式传递 | 实际状态 |
|------|-------------------|----------------------|---------|
| `DATABASE_URL` | ✅ `MEDUSA_DATABASE_URL` | ✅ `${MEDUSA_DATABASE_URL}` | ✅ 正常 |
| `REDIS_URL` | ✅ `MEDUSA_REDIS_URL` | ✅ `${MEDUSA_REDIS_URL}` | ✅ 正常 |
| `PAYPAL_CLIENT_ID` | ✅ 存在 | ❌ 未传递 | ⚠️ 依赖 env_file |
| `PAYPAL_CLIENT_SECRET` | ✅ 存在 | ❌ 未传递 | ⚠️ 依赖 env_file |
| `PAYPAL_IS_SANDBOX` | ✅ 存在 | ❌ 未传递 | ⚠️ 依赖 env_file |

#### Docker Compose env_file 的行为

1. `env_file` 会加载文件中的所有变量
2. `environment` 块中的变量会**覆盖** `env_file` 中的同名变量
3. 但 `environment` 块使用 `${VAR}` 语法时，会从 **shell 环境**或 `.env` 文件读取

**潜在问题**：如果 `environment` 块的变量插值失败或为空，可能导致部分变量未正确设置。

### 2. Docker 网络 DNS 解析差异

```
Docker 容器:  容器 DNS → Docker DNS → 宿主机 DNS → 外网
PM2 进程:     直接使用宿主机 DNS → 外网
```

Docker 的多层 DNS 解析可能导致：
- PayPal API 端点 (`api.paypal.com`) 解析延迟或失败
- TLS/SSL 证书验证问题

### 3. 出站网络路径差异

```
Docker:  应用 → 容器网络 → NAT → 宿主机网卡 → 外网
PM2:     应用 → 直接 → 宿主机网卡 → 外网
```

可能影响：
- 请求源 IP 不同
- 某些 PayPal 安全检查可能对 NAT 请求更严格

### 4. TLS/CA 证书差异

Docker 镜像可能使用不同的 CA 证书集：
- 基础镜像的证书可能过期或不完整
- PayPal 要求严格的 TLS 验证

## 对比配置

### PM2 环境 (apps/medusa/.env)

```bash
# 直接在宿主机运行，所有变量正常加载
PAYPAL_CLIENT_ID=Adb44FjOiZLEJHqv-...
PAYPAL_CLIENT_SECRET=EGwwzDtq7eK1UAa...
PAYPAL_IS_SANDBOX=false
```

### Docker 环境 (deploy/gce/.env.prod)

```bash
# 变量存在，但需要通过 docker-compose 正确传递
PAYPAL_CLIENT_ID=Adb44FjOiZLEJHqv-...
PAYPAL_CLIENT_SECRET=EGwwzDtq7eK1UAa...
PAYPAL_IS_SANDBOX=false
```

## 验证方法

如果需要验证 Docker 容器的环境变量：

```bash
# 检查容器内的 PayPal 变量
docker exec cs-prod-medusa-1 printenv | grep PAYPAL

# 预期输出（如果正常）：
# PAYPAL_CLIENT_ID=Adb44FjOiZLEJHqv-...
# PAYPAL_CLIENT_SECRET=EGwwzDtq7eK1UAa...
# PAYPAL_IS_SANDBOX=false

# 如果输出为空，说明变量未正确传递
```

## 修复方案

### 方案 1：显式传递 PayPal 变量（推荐）

修改 `deploy/gce/prod/docker-compose.yml`：

```yaml
services:
  medusa:
    environment:
      # ... 现有变量

      # PayPal Payment
      PAYPAL_CLIENT_ID: ${PAYPAL_CLIENT_ID}
      PAYPAL_CLIENT_SECRET: ${PAYPAL_CLIENT_SECRET}
      PAYPAL_IS_SANDBOX: ${PAYPAL_IS_SANDBOX}

      # 同时添加其他可能缺失的变量
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_OAUTH_CALLBACK_URL: ${GOOGLE_OAUTH_CALLBACK_URL}
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      DISCORD_CLIENT_SECRET: ${DISCORD_CLIENT_SECRET}
      DISCORD_OAUTH_CALLBACK_URL: ${DISCORD_OAUTH_CALLBACK_URL}
      RESEND_API_KEY: ${RESEND_API_KEY}
      RESEND_FROM_EMAIL: ${RESEND_FROM_EMAIL}
      RESEND_FROM_NAME: ${RESEND_FROM_NAME}
      STORE_URL: ${STORE_URL}
```

### 方案 2：移除 environment 块，完全依赖 env_file

```yaml
services:
  medusa:
    env_file: ../.env.prod
    # 移除 environment 块，让所有变量从 env_file 加载
```

**注意**：需要确保 `.env.prod` 中的变量名与应用期望的完全一致。

### 方案 3：使用 PM2（当前方案）

继续使用 PM2 运行，避免 Docker 的复杂性：
- 更简单的部署流程
- 更直接的环境变量管理
- 更好的调试能力

## 经验总结

1. **Docker 环境变量传递需要显式配置**
   - `env_file` 和 `environment` 的交互可能导致意外行为
   - 关键变量应在 `environment` 中显式列出

2. **支付系统对环境敏感**
   - PayPal SDK 需要正确的凭证才能初始化
   - 生产/沙箱模式切换依赖 `PAYPAL_IS_SANDBOX` 变量

3. **调试建议**
   - 部署前验证容器内的环境变量
   - 检查应用启动日志中的 PayPal 初始化信息
   - 使用 `printenv` 确认变量正确传递

## 相关文档

- [PayPal 配置指南](./paypal-config.md)
- [PayPal 设置指南](./paypal-setup-guide.md)
- [PM2 本地运行指南](../pm2/README.md)
