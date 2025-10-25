# GCE部署所需Tokens和配置清单

本文件列出了在GCE上部署后端服务所需的所有tokens、密钥和配置信息。

## 🔐 必需的Tokens和配置

### 1. **GitHub容器注册表**
- **GitHub Personal Access Token** (如果 `GITHUB_TOKEN` 权限不足)
  - 用途：推送Docker镜像到GHCR
  - 权限：`write:packages`
  - 配置位置：GitHub Secrets → `GHCR_WRITE_TOKEN`
  - 获取方式：
    1. 访问 GitHub Settings → Developer settings → Personal access tokens
    2. 生成新token，选择 `write:packages` 权限
    3. 复制token并添加到仓库secrets

### 2. **GCE SSH访问**
- **SSH密钥对**
  - 用途：GitHub Actions部署时SSH连接到GCE实例
  - 生成命令：`ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key`
  - 配置位置：
    - 公钥：添加到GCE实例的 `~/.ssh/authorized_keys`
    - 私钥：GitHub Secrets → `GCE_SSH_KEY`

- **GCE实例信息**
  - `GCE_HOST`：GCE实例的外部IP地址
  - `GCE_USER`：SSH用户名 (建议使用 `deploy`)

### 3. **数据库连接**
- **PostgreSQL凭据**
  - 用户名：`cs` (或自定义)
  - 密码：强密码 (至少16位，包含字母、数字、特殊字符)
  - 主机：`host.docker.internal` (如果Docker在主机上)
  - 端口：`5432`
  - 数据库名：`medusa_production`, `strapi_production`

- **Redis凭据**
  - 密码：强密码 (可选但建议)
  - 主机：`host.docker.internal`
  - 端口：`6379`

### 4. **应用密钥**
脚本会自动生成以下安全密钥，但你可能需要自定义：

- **Medusa配置**
  - `JWT_SECRET` - JWT令牌签名密钥 (32位base64)
  - `COOKIE_SECRET` - Cookie加密密钥 (32位base64)

- **Strapi配置**
  - `APP_KEYS` - 4个应用密钥 (每个32位base64)
  - `API_TOKEN_SALT` - API令牌盐值 (32位base64)
  - `ADMIN_JWT_SECRET` - 管理员JWT密钥 (32位base64)
  - `TRANSFER_TOKEN_SALT` - 传输令牌盐值 (32位base64)
  - `JWT_SECRET` - JWT密钥 (32位base64)

### 5. **域名配置**
- **主域名** (如：`cockpitsimulator.com`)
- **API子域名** (如：`api.cockpitsimulator.com`)
- **内容子域名** (如：`content.cockpitsimulator.com`)
- **管理员子域名** (如：`dashboard.cockpitsimulator.com`)
- **Staging子域名** (如：`staging.cockpitsimulator.com`)

## 🌐 可选的集成Tokens

### 6. **Cloudflare配置**
- **Zero Trust 隧道 Token（推荐）**
  - 用途：让 GCE 实例以 systemd 服务形式持续运行 Cloudflare Tunnel
  - 获取方式：Cloudflare Zero Trust 控制台 → Access → Tunnels → Add connector → 复制 `cloudflared service install --token ...` 中的 token
  - 使用方式：在 GCE 主机执行 `sudo cloudflared service install --token <token>`，随后在控制台“Public Hostnames”面板维护 `hostname → service` 映射
- **Origin 证书（可选备用）**
  - 仅在使用老流程（`cloudflared tunnel login` + 本地 `config.yml`）时需要
  - 浏览器完成登录后下载 `cert.pem`，复制到目标用户的 `~/.cloudflared/cert.pem`
  - 使用场景：需要离线创建隧道或不依赖 Zero Trust 托管配置时

### 7. **文件上传** (Strapi)
- **Cloudflare R2配置**
  - R2访问密钥ID
  - R2秘密访问密钥
  - R2公共URL (如：`https://assets.cockpitsimulator.com`)
  - 存储桶名称

### 8. **通知集成** (可选)
- **SendGrid API Key** - 邮件发送功能
- **Discord Webhook URL** - Discord通知
- **Slack Webhook URL** - Slack通知

## 📋 获取清单

### 🔴 必须获取的项目

```
□ GitHub Personal Access Token (检查GITHUB_TOKEN权限)
□ SSH密钥对 (用于部署)
□ GCE实例外部IP地址
□ GCE SSH用户名
□ PostgreSQL用户名和密码
□ Redis密码 (强烈建议)
□ 主域名
□ API子域名
□ 内容子域名
□ 管理员子域名
```

### 🟡 建议获取的项目

```
□ Cloudflare R2访问密钥 (文件上传)
□ SendGrid API Key (邮件功能)
□ Discord Webhook URL (通知)
□ Slack Webhook URL (通知)
□ GitHub仓库的组织/用户名
```

## 🚀 快速准备步骤

### 第1步：创建SSH密钥
```bash
# 在本地机器上生成SSH密钥对
ssh-keygen -t rsa -b 4096 -C "deploy@cs-tw" -f ~/.ssh/deploy_key

# 这会生成：
# ~/.ssh/deploy_key     (私钥 - 添加到GitHub Secrets)
# ~/.ssh/deploy_key.pub (公钥 - 添加到GCE实例)
```

### 第2步：准备GCE实例
1. 创建Ubuntu 22.04+的GCE实例
2. 记录外部IP地址
3. 创建部署用户：`sudo useradd -m -s /bin/bash deploy`
4. 添加SSH公钥：`sudo -u deploy mkdir -p /home/deploy/.ssh && sudo -u deploy chmod 700 /home/deploy/.ssh`
5. 添加公钥到authorized_keys：`sudo -u deploy sh -c 'echo "ssh-rsa AAAA..." >> /home/deploy/.ssh/authorized_keys'`

### 第3步：准备域名
1. 确保域名已添加到Cloudflare账户
2. 准备好子域名配置
3. 确保可以管理DNS记录

### 第4步：GitHub配置
1. 确认仓库权限
2. 检查GITHUB_TOKEN是否有足够的GHCR权限
3. 如需要，创建Personal Access Token

### 第5步：数据库准备
1. 安装PostgreSQL和Redis (脚本会自动安装)
2. 准备强密码
3. 记录连接信息

### 第6步：配置Cloudflare隧道
1. 在Cloudflare Zero Trust → Access → Tunnels创建或选择隧道
2. 生成连接器命令，复制 `cloudflared service install --token ...`
3. 在GCE主机执行命令，确认 `systemctl status cloudflared` 为 active
4. 在“Public Hostnames”中为 `api/content` 等子域配置指向 `http://127.0.0.1:9000/1337`
5. 若需本地配置，改用 `cloudflared tunnel login` + `/etc/cloudflared/config.yml` 并上传 `cert.pem`

## 🔧 配置位置总结

### GitHub Secrets (仓库设置)
```
GCE_HOST = GCE实例外部IP
GCE_USER = SSH用户名 (deploy)
GCE_SSH_KEY = 私钥内容 (完整，包括-----BEGIN/END行)
GHCR_WRITE_TOKEN = Personal Access Token (可选)
```

### 脚本会自动创建的文件
```
/srv/cs/.env                 - 主要环境配置
/srv/cs/env/medusa.env       - Medusa配置
/srv/cs/env/strapi.env       - Strapi配置
```

### Cloudflare 配置位置
- **Token 模式（默认推荐）**：Cloudflare 控制台 → Access → Tunnels → 选择隧道 → Public Hostnames（维护域名和本地服务映射）
- **本地配置模式（可选）**：在服务器创建 `/etc/cloudflared/config.yml` 并使用 `cloudflared tunnel run --config ...`，需要配合 `cert.pem` 或 JSON 凭据

## ⚠️ 安全注意事项

1. **密钥管理**：
   - 将所有生产密钥存储在安全的密码管理器中
   - 使用强密码和长随机字符串
   - 定期轮换密钥

2. **SSH安全**：
   - 使用专用的SSH密钥对，不要使用个人密钥
   - 考虑使用GitHub OIDC替代静态密钥
   - 限制SSH访问的源IP

3. **网络安全**：
   - 确保防火墙只开放必要端口 (22, 80, 443)
   - 使用Cloudflare隧道避免直接暴露服务端口
   - 定期更新系统包和依赖

## 📝 获取帮助

如果在获取这些配置时遇到问题：

1. **查看详细文档**：
   - `docs/runbooks/gce-backend-playbook.md`
   - `docs/runbooks/github-secrets-guide.md`
   - `scripts/gce/README.md`

2. **运行干运行模式**：
   ```bash
   sudo scripts/gce/deploy-backend.sh setup --dry-run
   ```

3. **分步执行**：
   ```bash
   sudo scripts/gce/deploy-backend.sh deps      # 先安装依赖
   sudo scripts/gce/deploy-backend.sh secrets   # 再配置密钥
   ```

有了这些配置信息，脚本会引导你完成整个部署过程！
