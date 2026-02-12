# 生产环境发布指南：cockpit-simulator.com 域名迁移

> 从 aidenlux.com 迁移到 cockpit-simulator.com 的完整流程，后端采用 PM2 宿主机部署

---

## 域名规划

| 服务 | 新域名 | 当前域名 |
|------|--------|----------|
| **前端 (Next.js)** | `https://cockpit-simulator.com` | `prd.aidenlux.com` |
| **后端 API (Medusa)** | `https://api.cockpit-simulator.com` | `api.aidenlux.com` |
| **CMS (Strapi)** | 待定（建议 `content.cockpit-simulator.com`） | `content.aidenlux.com` |
| **CDN/图片** | `img.aidenlux.com`（保持不变？） | `img.aidenlux.com` |
| **社区论坛** | `community.cockpit-simulator.com`（已有） | 同 |

> **需要确认**：Strapi 和 CDN 域名是否也要迁移到 `cockpit-simulator.com` 下？

---

## 一、需要修改域名的地方（完整清单）

### 1. 环境变量文件（最核心）

**`apps/medusa/.env`（生产用，宿主机上）：**

```bash
# CORS — 必须包含前端域名
STORE_CORS=https://cockpit-simulator.com,https://www.cockpit-simulator.com
ADMIN_CORS=https://api.cockpit-simulator.com
AUTH_CORS=https://cockpit-simulator.com,https://www.cockpit-simulator.com

# 前端 URL（邮件中的链接用）
STORE_URL=https://cockpit-simulator.com

# OAuth 回调（前端处理回调，不是 Medusa）
GOOGLE_OAUTH_CALLBACK_URL=https://cockpit-simulator.com/auth/google/callback
GOOGLE_ALLOWED_ORIGINS=https://cockpit-simulator.com,https://www.cockpit-simulator.com
DISCORD_OAUTH_CALLBACK_URL=https://cockpit-simulator.com/auth/discord/callback
FACEBOOK_OAUTH_CALLBACK_URL=https://cockpit-simulator.com/auth/facebook/callback

# 邮件发件地址
RESEND_FROM_EMAIL=noreply@cockpit-simulator.com

# Discourse 论坛
DISCOURSE_URL=https://community.cockpit-simulator.com
```

**`apps/dji-storefront/.env.production`（Vercel 环境变量）：**

```bash
MEDUSA_BACKEND_URL=https://api.cockpit-simulator.com
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.cockpit-simulator.com
STOREFRONT_BASE_URL=https://cockpit-simulator.com
AUTH_COOKIE_DOMAIN=.cockpit-simulator.com   # 跨子域共享 cookie
STRAPI_API_URL=https://content.cockpit-simulator.com  # 或保持 content.aidenlux.com
DISCOURSE_URL=https://community.cockpit-simulator.com
```

**`deploy/gce/.env.prod`（如果仍用于参考）：**

```
STORE_CORS=https://cockpit-simulator.com,https://www.cockpit-simulator.com
AUTH_CORS=https://cockpit-simulator.com,https://www.cockpit-simulator.com
ADMIN_CORS=https://api.cockpit-simulator.com
GOOGLE_OAUTH_CALLBACK_URL=https://cockpit-simulator.com/auth/google/callback
DISCORD_OAUTH_CALLBACK_URL=https://cockpit-simulator.com/auth/discord/callback
STORE_URL=https://cockpit-simulator.com
RESEND_FROM_EMAIL=noreply@cockpit-simulator.com
```

### 2. 源码中需要修改的硬编码域名

**`apps/medusa/medusa-config.ts:173`** — Admin Vite 允许的主机名：

```typescript
// 当前
allowedHosts: [".aidenlux.com"],
// 改为
allowedHosts: [".aidenlux.com", ".cockpit-simulator.com"],
```

**`apps/dji-storefront/next.config.ts:36`** — 开发域名白名单：

```typescript
// 当前
allowedDevOrigins: ["dev.aidenlux.com"],
// 改为（如果保留开发环境）
allowedDevOrigins: ["dev.aidenlux.com", "cockpit-simulator.com"],
```

**`apps/dji-storefront/next.config.ts:49`** — 图片远程模式（如果 CDN 域名变了）：

```typescript
// 当前硬编码
hostname: "img.aidenlux.com",
// 如果 CDN 换域名，需要加新域名
```

**7 个 BASE_URL 硬编码回退值**（建议统一改为生产域名）：

| 文件 | 行号 | 当前值 |
|------|------|--------|
| `src/app/robots.ts` | 3 | `"https://dev.aidenlux.com"` |
| `src/app/sitemap.ts` | 7 | `"https://dev.aidenlux.com"` |
| `src/app/[countryCode]/products/[handle]/page.tsx` | 9 | `"https://dev.aidenlux.com"` |
| `src/app/[countryCode]/blog/[slug]/page.tsx` | 12 | `"https://dev.aidenlux.com"` |
| `src/app/[countryCode]/guides/[slug]/page.tsx` | 13 | `"https://dev.aidenlux.com"` |
| `src/app/[countryCode]/announcement/[slug]/page.tsx` | 12 | `"https://dev.aidenlux.com"` |
| `src/app/[countryCode]/news/[slug]/page.tsx` | 12 | `"https://dev.aidenlux.com"` |

> 虽然 `STOREFRONT_BASE_URL` 环境变量优先，但回退值应改为 `"https://cockpit-simulator.com"`，避免环境变量缺失时 sitemap/robots 指向开发域名。

### 3. 第三方平台需要更新的回调 URL

| 平台 | 配置项 | 新值 |
|------|--------|------|
| **Google Cloud Console** | Authorized redirect URIs | `https://cockpit-simulator.com/auth/google/callback` |
| **Google Cloud Console** | Authorized JavaScript origins | `https://cockpit-simulator.com` |
| **Discord Developer Portal** | Redirects | `https://cockpit-simulator.com/auth/discord/callback` |
| **Facebook Developers** | Valid OAuth Redirect URIs | `https://cockpit-simulator.com/auth/facebook/callback` |
| **PayPal Developer** | Return URL (如有) | `https://cockpit-simulator.com` |
| **Discourse Admin** | SSO Settings → sso url | `https://cockpit-simulator.com/api/discourse/sso` |
| **Sentry** | Allowed Domains | 添加 `cockpit-simulator.com` |
| **Cloudflare R2** | CORS Policy (如有) | 添加 `cockpit-simulator.com` |

---

## 二、PM2 宿主机部署流程

### Step 1：基础设施确认

```bash
# 确认 PostgreSQL 和 Redis 运行中
sudo systemctl status postgresql
sudo systemctl status redis

# 确认 Node.js 版本
node -v  # 需要 v22+
```

### Step 2：代码更新和构建

```bash
cd /home/coderisedev/cs

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install

# 构建 Medusa
pnpm --filter medusa build

# 构建 Strapi
pnpm --filter strapi build
```

### Step 3：Medusa 环境变量

在 `apps/medusa/.env` 中设置生产环境变量（参见上方"环境变量文件"部分），关键项：

```bash
NODE_ENV=production
DATABASE_URL=postgres://cs:<password>@localhost:5432/medusa_production
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=<强随机字符串>
COOKIE_SECRET=<强随机字符串>
STORE_CORS=https://cockpit-simulator.com,https://www.cockpit-simulator.com
ADMIN_CORS=https://api.cockpit-simulator.com
AUTH_CORS=https://cockpit-simulator.com,https://www.cockpit-simulator.com
STORE_URL=https://cockpit-simulator.com
```

> **注意**：宿主机直接用 `localhost`，不用 `host.docker.internal`

### Step 4：PM2 启动

```bash
cd /home/coderisedev/cs

# 启动 Medusa + Strapi
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status

# 查看日志
pm2 logs medusa-backend
pm2 logs strapi-cms

# 保存进程列表（开机自启）
pm2 save
pm2 startup  # 按提示执行生成的命令
```

当前 `ecosystem.config.cjs` 配置已就绪：

- `medusa-backend`: port 9000, fork 模式, 800M 内存限制
- `strapi-cms`: port 1337, fork 模式, 800M 内存限制

### Step 5：Nginx 反向代理

需要 Nginx 将 `api.cockpit-simulator.com` 代理到 `localhost:9000`。

```nginx
# /etc/nginx/sites-available/api.cockpit-simulator.com
server {
    listen 80;
    server_name api.cockpit-simulator.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cockpit-simulator.com;

    ssl_certificate     /etc/letsencrypt/live/api.cockpit-simulator.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cockpit-simulator.com/privkey.pem;

    # 安全头
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 请求体大小（文件上传）
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

如果 Strapi 也需要独立域名（如 `content.cockpit-simulator.com`），类似配置指向 `localhost:1337`。

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/api.cockpit-simulator.com /etc/nginx/sites-enabled/

# 申请 SSL 证书
sudo certbot --nginx -d api.cockpit-simulator.com

# 测试并重载
sudo nginx -t && sudo systemctl reload nginx
```

### Step 6：DNS 配置

| 记录类型 | 名称 | 值 |
|---------|------|---|
| A | `cockpit-simulator.com` | Vercel IP（或用 CNAME → `cname.vercel-dns.com`） |
| CNAME | `www` | `cname.vercel-dns.com` |
| A | `api` | GCE VM 公网 IP |
| A | `content`（如需） | GCE VM 公网 IP |
| 保持 | `community` | Discourse 服务器 IP |
| 保持 | `img` | Cloudflare R2 CDN |

### Step 7：Vercel 前端部署

在 Vercel Dashboard 中：

1. **Settings → Domains**：添加 `cockpit-simulator.com` 和 `www.cockpit-simulator.com`
2. **Settings → Environment Variables**（Production）：

```
MEDUSA_BACKEND_URL=https://api.cockpit-simulator.com
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.cockpit-simulator.com
STOREFRONT_BASE_URL=https://cockpit-simulator.com
AUTH_COOKIE_DOMAIN=.cockpit-simulator.com
NEXT_PUBLIC_DEFAULT_REGION=us
STRAPI_API_URL=https://content.cockpit-simulator.com
DISCOURSE_URL=https://community.cockpit-simulator.com
```

3. 触发重新部署

---

## 三、验证清单（按顺序）

```bash
# 1. 健康检查
curl https://api.cockpit-simulator.com/health

# 2. Store API
curl https://api.cockpit-simulator.com/store/products

# 3. 前端首页
curl -I https://cockpit-simulator.com

# 4. Sitemap 域名是否正确
curl https://cockpit-simulator.com/sitemap.xml | head -20

# 5. Robots.txt
curl https://cockpit-simulator.com/robots.txt

# 6. 检查 CORS（应返回正确的 Access-Control-Allow-Origin）
curl -I -H "Origin: https://cockpit-simulator.com" \
  https://api.cockpit-simulator.com/store/products

# 7. OAuth 测试（手动在浏览器中测试）
# - Google 登录
# - Discord 登录
# - 密码重置邮件中的链接域名

# 8. Discourse SSO
# 访问社区，点击登录，应跳转到 cockpit-simulator.com/api/discourse/sso

# 9. PM2 健康
pm2 status
pm2 logs medusa-backend --lines 20
```

---

## 四、容易遗漏的坑

| 坑 | 说明 | 影响 |
|----|------|------|
| **CORS 漏配** | `STORE_CORS`/`AUTH_CORS` 未包含新域名 | 前端所有 API 请求 403 |
| **OAuth 回调域名不匹配** | Google/Discord 控制台未更新 | 登录报 `redirect_uri_mismatch` |
| **Cookie Domain 冲突** | 旧 `.aidenlux.com` cookie 残留 | 登录状态紊乱，需清除浏览器 cookie |
| **密码重置邮件链接** | `STORE_URL` 未改 | 邮件中的链接指向旧域名 |
| **Medusa Admin allowedHosts** | `medusa-config.ts` 未加新域名 | Admin UI 在新域名下无法访问 |
| **sitemap/robots 回退值** | 源码中硬编码 `dev.aidenlux.com` | 环境变量缺失时 SEO 灾难 |
| **`www` 未加入 CORS** | 只加了裸域 | 用户从 www 访问时 API 不通 |
| **SSL 证书** | api 子域名没申请证书 | HTTPS 握手失败 |
| **PM2 日志轮转** | 未配置 pm2-logrotate | 磁盘空间耗尽 |

---

## 五、推荐的发布顺序

1. **DNS 先行**：添加 `api.cockpit-simulator.com` A 记录 → GCE IP
2. **Nginx + SSL**：配置反向代理，certbot 签发证书
3. **Medusa .env**：更新环境变量
4. **源码修改**：`medusa-config.ts` allowedHosts + BASE_URL 回退值
5. **构建 + PM2 重启**：`pnpm --filter medusa build && pm2 restart medusa-backend`
6. **第三方平台**：Google/Discord/Facebook 控制台更新回调 URL
7. **Vercel 环境变量**：更新 + 重新部署前端
8. **Vercel 域名**：添加 `cockpit-simulator.com`
9. **全链路验证**：按上方检查清单逐项验证
10. **Discourse Admin**：更新 SSO endpoint URL
