# GCE 服务器迁移完整指南 (Zero Trust 架构版)

**最后更新**: 2026-01-13
**适用场景**: 将当前 Medusa + Strapi 系统平滑迁移至全新的 GCE 实例。
**预计耗时**: 30-60 分钟

---

## 第一阶段：新服务器准备 (New GCE)

在开始迁移数据前，先确保新环境就绪。

### 1. 基础环境配置
SSH 登录新 GCE 实例。

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装基础工具
sudo apt install -y git curl wget unzip build-essential

# 3. 安装 Node.js (v20 LTS 推荐)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 安装包管理器
sudo npm install -g pnpm pm2 pm2-logrotate
```

### 2. 安装数据库 (Postgres & Redis)
保持与旧服务器版本一致。

```bash
# 安装 Postgres 16 (示例)
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 redis-server

# 启动服务
sudo systemctl enable --now postgresql
sudo systemctl enable --now redis-server
```

### 3. 配置数据库用户
```bash
# 创建应用用户 (密码需与 .env 保持一致)
sudo -u postgres psql -c "CREATE USER cs WITH PASSWORD '你的旧密码' CREATEDB;"
```

### 4. 安装 Cloudflare Tunnel
这是 Zero Trust 架构的关键。

```bash
# 下载 cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 验证安装
cloudflared --version
```

---

## 第二阶段：数据备份与传输 (Old GCE)

在旧服务器上操作。

### 1. 停止服务 (防止数据写入)
```bash
pm2 stop all
```

### 2. 备份数据库
使用我们现有的备份脚本。

```bash
# 运行手动备份
/backup/scripts/backup-daily.sh

# 确认备份文件生成
ls -lh /backup/postgres/daily/
```

### 3. 打包代码与数据
虽然代码在 Git 里，但 `.env` 文件和 Strapi 的本地上传图片（如果没用 R2）需要迁移。

```bash
# 打包项目配置和上传文件
tar -czvf project_migration.tar.gz \
  /home/coderisedev/cs/.env \
  /home/coderisedev/cs/apps/dji-storefront/.env.local \
  /home/coderisedev/cs/apps/medusa/.env \
  /home/coderisedev/cs/apps/strapi/.env \
  /home/coderisedev/cs/apps/strapi/public/uploads

# 传输到新服务器 (假设新服务器 IP 为 NEW_IP)
scp /backup/postgres/daily/medusa_production_*.dump user@NEW_IP:/tmp/medusa.dump
scp /backup/postgres/daily/strapi_production_*.dump user@NEW_IP:/tmp/strapi.dump
scp project_migration.tar.gz user@NEW_IP:/tmp/
```

---

## 第三阶段：新服务器部署 (New GCE)

回到新服务器。

### 1. 拉取代码
```bash
git clone https://github.com/你的用户名/cs.git /home/coderisedev/cs
cd /home/coderisedev/cs
pnpm install
```

### 2. 恢复配置文件与资源
```bash
# 解压配置
tar -xzvf /tmp/project_migration.tar.gz -C /
```

### 3. 恢复数据库
```bash
# 恢复 Medusa
createdb -U cs -h localhost medusa_production
pg_restore -U cs -h localhost -d medusa_production /tmp/medusa.dump

# 恢复 Strapi
createdb -U cs -h localhost strapi_production
pg_restore -U cs -h localhost -d strapi_production /tmp/strapi.dump
```

### 4. 启动应用
```bash
# 首次构建
pnpm build

# 启动 PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 第四阶段：流量切换 (Cloudflare)

这是最无缝的一步，因为我们用的是 Tunnel。

### 1. 配置 Tunnel (新服务器)
不需要在 Cloudflare 后台删掉旧 Tunnel，我们可以复用同一个 Tunnel ID（实现高可用），或者创建一个新的 Replica。

**推荐方式：复用 Token (零停机)**
找到旧服务器的 Token（在 systemctl status cloudflared 中能看到，或者 Cloudflare Dashboard）。

```bash
# 在新服务器安装服务
sudo cloudflared service install <YOUR_TOKEN>
sudo systemctl start cloudflared
```

### 2. 验证
*   Cloudflare Dashboard 会显示该 Tunnel 现在有两个 Connectors (Old IP & New IP)。
*   此时流量会自动负载均衡到两台机器。

### 3. 下线旧服务器
1.  确认新服务器日志有流量进入 (`pm2 logs`)。
2.  在旧服务器执行 `sudo systemctl stop cloudflared`。
3.  Cloudflare 会自动把流量全部切给新服务器。

---

## 检查清单

*   [ ] Postgres 数据行数是否一致？
*   [ ] Strapi 图片是否能加载？
*   [ ] Medusa 订单流程是否通畅？
*   [ ] `pm2-logrotate` 是否安装？
*   [ ] 旧服务器的 Cron Job (备份脚本) 是否已迁移？

## 附录：备份脚本迁移
别忘了把 `/backup` 目录下的脚本也迁移过去，并设置 crontab。

```bash
# 新服务器
sudo mkdir -p /backup/scripts /backup/postgres/daily /backup/logs
sudo chown -R coderisedev:coderisedev /backup
# 从旧服务器拷贝脚本...
```

