# Medusa Admin 白屏问题修复记录

**日期**: 2026-01-13
**问题**: 通过 Cloudflare 访问 `https://api.aidenlux.com/app` 时 Admin 面板显示白屏

## 问题现象

- API 端点正常工作 (`/store/*`, `/admin/*`)
- Admin 面板 (`/app`) 返回 HTML 但页面白屏
- 浏览器控制台显示 404 错误：`/entry.jsx` 找不到

## 诊断过程

### 1. 检查 PM2 日志

```bash
npx pm2 logs medusa-backend --lines 100 --nostream
```

发现关键日志：
```
GET /app        status:200  response_size:473
GET /entry.jsx  status:404
```

### 2. 分析根本原因

问题在于**相对路径解析**：

| 访问路径 | HTML 中的引用 | 浏览器解析结果 | 状态 |
|---------|--------------|---------------|------|
| `/app` (无尾部斜杠) | `./entry.jsx` | `/entry.jsx` | 404 |
| `/app/` (有尾部斜杠) | `./entry.jsx` | `/app/entry.jsx` | 200 |

### 3. 发现路径不一致

检查发现两个不同的 admin 目录：

```bash
# 开发模式文件 (旧)
ls apps/medusa/public/admin/
# index.html (473 bytes) - 使用相对路径 ./entry.jsx

# 生产构建文件 (新)
ls apps/medusa/.medusa/server/public/admin/
# index.html (581 bytes) - 使用绝对路径 /app/assets/index-xxx.js
```

**核心问题**：`medusa start` 从 `./public/admin/` 读取文件，但 `medusa build` 输出到 `.medusa/server/public/admin/`

## 解决方案

### 步骤 1: 更新 Vite base 配置

编辑 `apps/medusa/medusa-config.ts`：

```typescript
admin: {
  vite: () => ({
    base: "/app/",  // 添加此行
    server: {
      allowedHosts: [".aidenlux.com"],
    },
  }),
},
```

### 步骤 2: 重新构建

```bash
cd apps/medusa
pnpm build
```

### 步骤 3: 同步生产构建文件

```bash
rm -rf public/admin
cp -r .medusa/server/public/admin public/
```

### 步骤 4: 重启服务

```bash
npx pm2 restart medusa-backend
```

## 验证修复

```bash
# 检查 HTML 内容 - 应该看到绝对路径
curl -s http://localhost:9000/app | grep "src="
# 预期: src="/app/assets/index-xxx.js"

# 检查资源加载 - 应该返回 JavaScript
curl -sI http://localhost:9000/app/assets/index-xxx.js | head -5
# 预期: Content-Type: application/javascript
```

## 后续维护

每次执行 `pnpm build` 后，需要同步 admin 文件：

```bash
cd apps/medusa
pnpm build
rm -rf public/admin
cp -r .medusa/server/public/admin public/
npx pm2 restart medusa-backend
```

建议将此流程添加到部署脚本中。

## 技术细节

### Medusa Admin 加载流程

1. `medusa start` 根据 `NODE_ENV` 决定模式：
   - `development`: 使用 Vite 开发服务器 (从 `.medusa/admin/` 提供)
   - `production`: 使用 Express 静态服务 (从 `./public/admin/` 提供)

2. 生产模式下 `serveProductionBuild()` 函数：
   - 从 `options.outDir` 读取 `index.html`
   - 使用 `express.static()` 提供静态资源
   - SPA 回退：所有未匹配路由返回 `index.html`

### 相关源码位置

- Admin 加载器: `@medusajs/medusa/dist/loaders/admin.js`
- Admin 构建器: `@medusajs/admin-bundler/dist/index.js`
- 路径常量: `@medusajs/medusa/dist/utils/admin-consts.js`
  - `ADMIN_RELATIVE_OUTPUT_DIR = "./public/admin"`
  - `ADMIN_ONLY_OUTPUT_DIR = ".medusa/admin"`

## 相关链接

- [Medusa Admin Configuration](https://docs.medusajs.com/admin-configuration)
- [PM2 本地运行指南](./README.md)
