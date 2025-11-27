# 项目开发环境规则

## 本地开发环境配置

### 宿主机运行的服务
以下服务直接在宿主机（macOS）上运行，不使用 Docker：

1. **Next.js 前端** (`apps/web`)
   - 运行端口: 8000
   - 启动命令: `npm run dev`

2. **Medusa 后端** (`apps/medusa`)
   - 启动命令: `npm run dev`

3. **Strapi CMS** (`apps/strapi`)
   - 运行端口: 1337
   - 启动命令: `npm run dev`

### Docker 运行的服务
以下服务通过 Docker 容器运行：

1. **PostgreSQL**
   - 数据库服务
   - 用于 Medusa 和 Strapi

2. **Redis**
   - 缓存服务
   - 用于 Medusa

## 开发工作流

### 启动顺序

1. 确保 Docker 服务运行:
   ```bash
   docker-compose up -d
   ```

2. 启动各个应用:
   ```bash
   # Strapi
   cd apps/strapi
   npm run dev
   
   # Medusa (if needed)
   cd apps/medusa
   npm run dev
   
   # Next.js Frontend
   cd apps/web
   npm run dev
   ```

### 虚拟环境

项目使用 Python 虚拟环境进行某些开发任务。在执行开发或安装任务前，需要激活虚拟环境：

```bash
source venv/bin/activate
```

## 注意事项

- ✅ 所有 Node.js 应用直接运行在宿主机
- ✅ 数据库和缓存服务使用 Docker
- ✅ 开发时无需构建 Docker 镜像
- ✅ 热重载和开发工具直接可用
