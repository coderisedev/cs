# 服务器迁移指南（PM2 + 宿主机 PostgreSQL/Redis）

## 架构概览

```
┌─────────────────────────────────────────────┐
│                   新服务器                     │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Medusa   │  │  Strapi  │  │ Storefront│ │
│  │  :9000    │  │  :1337   │  │ (Vercel)  │ │
│  └────┬─────┘  └────┬─────┘  └───────────┘ │
│       │              │                      │
│  ┌────┴──────────────┴─────┐                │
│  │        PM2 管理          │                │
│  └────┬──────────────┬─────┘                │
│       │              │                      │
│  ┌────┴─────┐  ┌─────┴────┐                │
│  │PostgreSQL│  │  Redis   │                │
│  │  :5432   │  │  :6379   │                │
│  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────┘
```

---

## 第一步：新服务器基础环境

```bash
# 1. 系统更新
sudo apt update && sudo apt upgrade -y

# 2. 安装基础工具
sudo apt install -y curl git build-essential

# 3. 安装 Node.js 20 (Medusa 要求 >=20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 安装 pnpm (版本需与项目一致: 10.18.2)
corepack enable
corepack prepare pnpm@10.18.2 --activate
pnpm --version  # 确认 10.18.2

# 5. 安装 PM2
npm install -g pm2
```

---

## 第二步：安装 PostgreSQL

```bash
# 1. 安装
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 2. 创建数据库用户和数据库
sudo -u postgres psql <<EOF
CREATE USER cs WITH PASSWORD '你的新密码';
ALTER USER cs CREATEDB;
CREATE DATABASE medusa_production OWNER cs;
CREATE DATABASE strapi_production OWNER cs;
GRANT ALL PRIVILEGES ON DATABASE medusa_production TO cs;
GRANT ALL PRIVILEGES ON DATABASE strapi_production TO cs;
EOF

# 3. 确认连接
psql -U cs -h localhost -d medusa_production -c "SELECT 1;"
```

---

## 第三步：安装 Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 确认
redis-cli ping  # 应返回 PONG
```

---

## 第四步：从旧服务器导出数据库

**在旧服务器上执行：**

```bash
# 导出 Medusa 数据库
pg_dump -U cs -h localhost -d medusa_production -F c -f medusa_production.dump

# 导出 Strapi 数据库
pg_dump -U cs -h localhost -d strapi_production -F c -f strapi_production.dump

# 传输到新服务器
scp medusa_production.dump strapi_production.dump 新用户@新服务器IP:/tmp/
```

---

## 第五步：在新服务器导入数据库

```bash
# 导入 Medusa
pg_restore -U cs -h localhost -d medusa_production -c --if-exists /tmp/medusa_production.dump

# 导入 Strapi
pg_restore -U cs -h localhost -d strapi_production -c --if-exists /tmp/strapi_production.dump

# 验证
psql -U cs -h localhost -d medusa_production -c "SELECT count(*) FROM public.product;"
psql -U cs -h localhost -d strapi_production -c "SELECT count(*) FROM strapi_core_store_settings;"
```

---

## 第六步：拉取项目代码

```bash
# 1. 创建项目目录（与旧服务器保持一致）
mkdir -p /home/coderisedev
cd /home/coderisedev

# 2. 克隆仓库
git clone <你的仓库地址> cs
cd cs

# 3. 安装依赖
pnpm install --frozen-lockfile
```

---

## 第七步：配置环境变量

从旧服务器复制 `.env` 文件，然后修改必要的值。

### Medusa (`apps/medusa/.env`)

```bash
NODE_ENV=production
PORT=9000

# 数据库 - 修改为新服务器的密码
DATABASE_URL=postgres://cs:你的新密码@localhost:5432/medusa_production
REDIS_URL=redis://localhost:6379/0

# CORS - 这些域名不变，保持和旧服务器一致
STORE_CORS=https://prd.aidenlux.com,https://cs-preview.vercel.app,https://cs-staging.vercel.app,https://dev.aidenlux.com
ADMIN_CORS=https://medusa-preview.cs.com
AUTH_CORS=https://prd.aidenlux.com,https://cs-preview.vercel.app,https://cs-staging.vercel.app,https://dev.aidenlux.com

# 安全密钥 - 直接从旧服务器复制，不要重新生成（否则现有会话/token 全部失效）
JWT_SECRET=<从旧服务器复制>
COOKIE_SECRET=<从旧服务器复制>

# Strapi webhook 密钥
STRAPI_WEBHOOK_SECRET=<从旧服务器复制>

# Cloudflare R2 文件存储 - 不变
MEDUSA_FILE_ACCESS_KEY_ID=<从旧服务器复制>
MEDUSA_FILE_SECRET_ACCESS_KEY=<从旧服务器复制>
MEDUSA_FILE_BUCKET=cstrapi
MEDUSA_FILE_REGION=auto
MEDUSA_FILE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
MEDUSA_FILE_PUBLIC_URL=https://img.aidenlux.com
MEDUSA_FILE_PREFIX=medusa-uploads/
MEDUSA_FILE_FORCE_PATH_STYLE=true
MEDUSA_FILE_CACHE_CONTROL="public, max-age=31536000"
MEDUSA_FILE_DOWNLOAD_TTL=3600

# OAuth - 不变
GOOGLE_CLIENT_ID=<从旧服务器复制>
GOOGLE_CLIENT_SECRET=<从旧服务器复制>
GOOGLE_OAUTH_CALLBACK_URL=https://prd.aidenlux.com/auth/google/callback
GOOGLE_ALLOWED_ORIGINS=<从旧服务器复制>
DISCORD_CLIENT_ID=<从旧服务器复制>
DISCORD_CLIENT_SECRET=<从旧服务器复制>
DISCORD_OAUTH_CALLBACK_URL=https://prd.aidenlux.com/auth/discord/callback

# PayPal - 不变
PAYPAL_CLIENT_ID=<从旧服务器复制>
PAYPAL_CLIENT_SECRET=<从旧服务器复制>
PAYPAL_IS_SANDBOX=false

# 邮件 - 不变
RESEND_API_KEY=<从旧服务器复制>
RESEND_FROM_EMAIL=noreply@aidenlux.com
RESEND_FROM_NAME=Cockpit Simulator

STORE_URL=https://prd.aidenlux.com
MEDUSA_PUBLISHABLE_KEY=<从旧服务器复制>
```

### Strapi (`apps/strapi/.env`)

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# 安全密钥 - 全部从旧服务器复制
APP_KEYS=<从旧服务器复制>
API_TOKEN_SALT=<从旧服务器复制>
ADMIN_JWT_SECRET=<从旧服务器复制>
TRANSFER_TOKEN_SALT=<从旧服务器复制>
ADMIN_AUTH_SECRET=<从旧服务器复制>
JWT_SECRET=<从旧服务器复制>

ADMIN_COOKIE_SECURE=false
STRAPI_ADMIN_BACKEND_URL=https://content.aidenlux.com
STRAPI_TELEMETRY_DISABLED=true

# 数据库 - 修改为新服务器的密码
DATABASE_CLIENT=postgres
DATABASE_URL=postgres://cs:你的新密码@localhost:5432/strapi_production
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi_production
DATABASE_USERNAME=cs
DATABASE_PASSWORD=你的新密码

# Cloudflare R2 - 不变
AWS_ACCESS_KEY_ID=<从旧服务器复制>
AWS_ACCESS_SECRET=<从旧服务器复制>
AWS_BUCKET_NAME=cstrapi
AWS_REGION=auto
AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_PUBLIC_URL=https://img.aidenlux.com
AWS_FORCE_PATH_STYLE=true
```

> **重要提示：** 如果数据库密码不变（即新旧服务器使用相同密码），可以直接 `scp` 复制 `.env` 文件，无需修改。唯一需要改的是 `DATABASE_URL` 中的密码（如果更换了密码）。

---

## 第八步：构建项目

```bash
cd /home/coderisedev/cs

# 构建 Medusa
cd apps/medusa && pnpm build && cd ../..

# 构建 Strapi
cd apps/strapi && pnpm build && cd ../..
```

---

## 第九步：运行数据库迁移（如有需要）

```bash
# Medusa 迁移（如果代码版本有更新）
cd /home/coderisedev/cs/apps/medusa
pnpm exec medusa db:migrate
pnpm exec medusa db:sync-links
cd ../..
```

> 如果是同版本代码 + 同数据库 dump，通常不需要迁移。但建议运行一次确保一致。

---

## 第十步：启动 PM2

```bash
cd /home/coderisedev/cs

# 启动所有服务
pnpm pm2:start

# 查看状态
pnpm pm2:status

# 查看日志确认启动成功
pnpm pm2:logs
```

预期输出：

```
┌─────┬──────────────────┬──────┬──────┬───────────┬──────────┐
│ id  │ name             │ mode │ ↺    │ status    │ cpu      │
├─────┼──────────────────┼──────┼──────┼───────────┼──────────┤
│ 0   │ medusa-backend   │ fork │ 0    │ online    │ 0%       │
│ 1   │ strapi-cms       │ fork │ 0    │ online    │ 0%       │
└─────┴──────────────────┴──────┴──────┴───────────┴──────────┘
```

```bash
# 设置 PM2 开机自启
pm2 startup
# 按提示执行输出的命令（通常是 sudo env PATH=... pm2 startup ...）

# 保存当前进程列表
pm2 save
```

---

## 第十一步：验证服务

```bash
# 测试 Medusa API
curl -s http://localhost:9000/health | head
curl -s http://localhost:9000/store/products | head

# 测试 Strapi API
curl -s http://localhost:1337/_health | head
curl -s http://localhost:1337/api/content-types | head
```

---

## 第十二步：切换 DNS / 反向代理

如果使用 Cloudflare Tunnel 或 Nginx 反向代理：

### Cloudflare Tunnel 方式

```bash
# 在新服务器安装 cloudflared 并登录
# 将隧道指向新服务器
cloudflared tunnel route dns <tunnel-name> content.aidenlux.com
```

### Nginx 方式

```nginx
# /etc/nginx/sites-available/medusa
server {
    listen 80;
    server_name medusa.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# /etc/nginx/sites-available/strapi
server {
    listen 80;
    server_name content.aidenlux.com;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 快速迁移检查清单

| 步骤 | 操作 | 状态 |
|------|------|------|
| 1 | Node.js 20 + pnpm 10.18.2 + PM2 已安装 | ☐ |
| 2 | PostgreSQL 已安装并运行 | ☐ |
| 3 | Redis 已安装并运行 | ☐ |
| 4 | 数据库已从旧服务器导出 | ☐ |
| 5 | 数据库已导入新服务器 | ☐ |
| 6 | 项目代码已克隆 | ☐ |
| 7 | `apps/medusa/.env` 已配置 | ☐ |
| 8 | `apps/strapi/.env` 已配置 | ☐ |
| 9 | `pnpm install --frozen-lockfile` 成功 | ☐ |
| 10 | Medusa `pnpm build` 成功 | ☐ |
| 11 | Strapi `pnpm build` 成功 | ☐ |
| 12 | Medusa 数据库迁移完成 | ☐ |
| 13 | `pm2 start` 两个服务均 online | ☐ |
| 14 | `pm2 startup` + `pm2 save` 已执行 | ☐ |
| 15 | `curl localhost:9000/health` 正常 | ☐ |
| 16 | `curl localhost:1337/_health` 正常 | ☐ |
| 17 | DNS / 反向代理已切换到新服务器 | ☐ |
| 18 | 旧服务器已停止服务（确认无问题后） | ☐ |

---

## 常用排错命令

```bash
# 查看 PM2 日志
pm2 logs medusa-backend --lines 100
pm2 logs strapi-cms --lines 100

# 重启单个服务
pm2 restart medusa-backend
pm2 restart strapi-cms

# 检查端口占用
ss -tlnp | grep -E '9000|1337|5432|6379'

# 检查 PostgreSQL 连接
psql -U cs -h localhost -d medusa_production -c "\dt" | head

# 检查 Redis
redis-cli info server | head
```
