# PM2 服务维护指南

本文档记录了使用 PM2 管理项目服务的常用命令。本项目在根目录使用 `ecosystem.config.cjs` 统一管理 Medusa 和 Strapi 服务。

## 快速参考表

| 操作 | 命令 | 说明 |
|------|------|------|
| **启动所有服务** | `pnpm pm2:start` | 使用根目录配置启动 Medusa 和 Strapi |
| **停止所有服务** | `pnpm pm2:stop` | 停止所有 PM2 管理的进程 |
| **重启所有服务** | `pnpm pm2:restart` | 重启所有进程 |
| **查看状态** | `pnpm pm2:status` | 显示进程列表、状态、内存占用等 |
| **删除所有进程** | `pnpm pm2:delete` | 停止并从 PM2 列表中删除所有进程 |

## 详细命令说明

所有命令均可在项目根目录下执行。如果未安装全局 PM2，建议使用 `npx pm2` 或 `pnpm` 脚本。

### 1. 服务启动与管理

使用根目录的 `ecosystem.config.cjs` 配置文件：

```bash
# 启动 (使用 package.json 脚本)
pnpm pm2:start

# 手动启动
npx pm2 start ecosystem.config.cjs
```

该配置包含以下服务：
- `medusa-backend`: Medusa 后端服务 (端口 9000)
- `strapi-cms`: Strapi CMS 服务 (端口 1337)

### 2. 单个服务控制

针对特定服务进行操作：

**Medusa Backend**
```bash
# 重启 Medusa
npx pm2 restart medusa-backend

# 停止 Medusa
npx pm2 stop medusa-backend

# 查看 Medusa 详情
npx pm2 show medusa-backend
```

**Strapi CMS**
```bash
# 重启 Strapi
npx pm2 restart strapi-cms

# 停止 Strapi
npx pm2 stop strapi-cms

# 查看 Strapi 详情
npx pm2 show strapi-cms
```

### 3. 日志查看

查看实时日志输出，用于调试和监控：

```bash
# 查看所有服务日志 (流式)
pnpm pm2:logs

# 仅查看 Medusa 日志
pnpm pm2:logs:medusa
# 或
npx pm2 logs medusa-backend

# 仅查看 Strapi 日志
pnpm pm2:logs:strapi
# 或
npx pm2 logs strapi-cms

# 查看特定行数 (例如最后 100 行)
npx pm2 logs medusa-backend --lines 100
```

### 4. 监控与维护

```bash
# 终端实时监控面板 (CPU, 内存, 日志)
npx pm2 monit

# 保存当前进程列表 (用于开机自启恢复)
npx pm2 save

# 清空日志文件
npx pm2 flush
```

## 配置文件说明

根目录 `ecosystem.config.cjs` 关键配置：

- **模式**: `fork` (单实例模式，避免 Medusa/Strapi 的端口冲突)
- **内存限制**: `800M` (超过限制自动重启)
- **崩溃重启**: 启动后 30s 内崩溃不计入重启次数，重启间隔 5s
- **日志**: 自动合并日志，时间戳格式 `YYYY-MM-DD HH:mm:ss`

## 常见问题

**Q: 为什么提示 `pm2: command not found`?**
A: 本项目将 PM2 作为 `devDependencies` 安装。请使用 `npx pm2` 或 `pnpm pm2:...` 脚本，或者全局安装 PM2 (`npm install -g pm2`)。

**Q: 服务状态显示 `errored`?**
A: 检查日志 `npx pm2 logs <app-name>`。常见原因包括：
   - 端口被占用 (9000 或 1337)
   - 数据库未启动
   - `.env` 环境变量配置错误

**Q: 代码修改后未生效?**
A: 生产模式 (`NODE_ENV=production`) 下，通常需要重启服务才能生效：
   `npx pm2 restart <app-name>`