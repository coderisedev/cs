# PM2 本地运行指南

使用 PM2 在本机以 production 模式运行 Medusa 和 Strapi。

## 前置条件

- PostgreSQL 运行中 (端口 5432)
- Redis 运行中 (端口 6379)
- 数据库已创建: `medusa_production`, `strapi_production`
- 各应用 `.env` 文件已配置

## 运行模式

### Fork 模式（Medusa 和 Strapi 均使用）

由于 Medusa CLI 不支持 PM2 的 cluster 模式，两个服务都使用 **fork 模式**运行单实例。

配置文件位置：`apps/medusa/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: "medusa-backend",
      cwd: "/home/coderisedev/cs/apps/medusa",
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      // ...
    },
  ],
};
```

### 为什么不用 Cluster 模式？

Medusa CLI (`medusa start`) 是一个 shell wrapper 脚本，PM2 的 cluster 模式无法正确处理：

1. **Shell 脚本问题**：`node_modules/.bin/medusa` 是 shell 脚本，不是 JS 文件
2. **端口绑定**：Medusa 内部管理 HTTP 服务器，不兼容 Node.js cluster 模块
3. **状态管理**：多实例可能导致后台任务重复执行

**如需水平扩展**，建议使用：
- Docker/Kubernetes 多容器部署
- Nginx 负载均衡多个独立 PM2 进程（不同端口）

## 常用命令

```bash
# ============ 使用 ecosystem.config.js ============

# 启动服务
cd apps/medusa
npx pm2 start ecosystem.config.js

# 或使用 pnpm 脚本（如已配置）
pnpm pm2:start

# 查看状态
npx pm2 list

# 重启服务
npx pm2 restart medusa-backend

# 停止服务
npx pm2 stop medusa-backend

# 删除进程
npx pm2 delete medusa-backend

# 保存当前进程列表
npx pm2 save

# ============ 通用命令 ============

# 查看状态
pnpm pm2:status

# 查看日志
pnpm pm2:logs              # 所有日志
pnpm pm2:logs:medusa       # Medusa 日志
pnpm pm2:logs:strapi       # Strapi 日志

# 实时日志
npx pm2 logs medusa-backend --lines 100
```

## 服务端口

| 服务 | 端口 | 地址 |
|------|------|------|
| Medusa | 9000 | http://localhost:9000 |
| Strapi | 1337 | http://localhost:1337 |

## 日志文件

日志保存在 PM2 默认目录：
- `~/.pm2/logs/medusa-backend-out.log`
- `~/.pm2/logs/medusa-backend-error.log`
- `~/.pm2/logs/strapi-cms-out.log`
- `~/.pm2/logs/strapi-cms-error.log`

查看实时日志：
```bash
npx pm2 logs medusa-backend --lines 100
```

## 监控

```bash
# 实时监控面板
npx pm2 monit

# 查看详细信息
npx pm2 show medusa-backend

# 查看指标
npx pm2 info medusa-backend
```

## 首次部署注意事项

### Medusa 构建

构建后需要同步 admin 生产文件:

```bash
cd apps/medusa
pnpm build
rm -rf public/admin
cp -r .medusa/server/public/admin public/
```

> **注意**: 如遇 Admin 白屏问题，参见 [medusa-admin-white-screen-fix.md](./medusa-admin-white-screen-fix.md)

### Strapi 构建

如遇 `new-release` 相关错误，重命名 seeder 文件:

```bash
mv apps/strapi/src/bootstrap/new-release-seeder.ts \
   apps/strapi/src/bootstrap/new-release-seeder.ts.disabled
```

## 开机自启 (可选)

```bash
pm2 startup
npx pm2 start ecosystem.config.js
npx pm2 save
```

## 故障排除

### 进程频繁重启

检查日志查找原因：
```bash
npx pm2 logs medusa-backend --lines 50
```

常见原因：
- 数据库连接失败
- 端口被占用
- 内存不足

### 无法启动

1. 确保使用 `npm run start` 而不是直接调用 `./node_modules/.bin/medusa`
2. 检查 `ecosystem.config.js` 配置中的 `script` 和 `args`

## 相关文件

- Medusa PM2 配置: `apps/medusa/ecosystem.config.js`
- PM2 文档: [medusa-admin-white-screen-fix.md](./medusa-admin-white-screen-fix.md)
