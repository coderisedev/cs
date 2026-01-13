# PM2 本地运行指南

使用 PM2 在本机以 production 模式运行 Medusa 和 Strapi。

## 前置条件

- PostgreSQL 运行中 (端口 5432)
- Redis 运行中 (端口 6379)
- 数据库已创建: `medusa_production`, `strapi_production`
- 各应用 `.env` 文件已配置

## 常用命令

```bash
# 启动所有服务
pnpm pm2:start

# 查看状态
pnpm pm2:status

# 查看日志
pnpm pm2:logs              # 所有日志
pnpm pm2:logs:medusa       # Medusa 日志
pnpm pm2:logs:strapi       # Strapi 日志

# 重启服务
pnpm pm2:restart

# 停止服务
pnpm pm2:stop

# 删除进程
pnpm pm2:delete
```

## 服务端口

| 服务 | 端口 | 地址 |
|------|------|------|
| Medusa | 9000 | http://localhost:9000 |
| Strapi | 1337 | http://localhost:1337 |

## 日志文件

日志保存在各应用目录下的 `logs/` 文件夹:
- `apps/medusa/logs/medusa-out.log`
- `apps/strapi/logs/strapi-out.log`

## 首次部署注意事项

### Medusa 构建

构建后需要复制 admin 文件:

```bash
cd apps/medusa
pnpm build
mkdir -p public
cp -r .medusa/client public/admin
```

### Strapi 构建

如遇 `new-release` 相关错误，重命名 seeder 文件:

```bash
mv apps/strapi/src/bootstrap/new-release-seeder.ts \
   apps/strapi/src/bootstrap/new-release-seeder.ts.disabled
```

## 开机自启 (可选)

```bash
pm2 startup
pnpm pm2:start
pm2 save
```
