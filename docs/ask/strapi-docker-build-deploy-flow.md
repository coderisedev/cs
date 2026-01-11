# Strapi 自定义模型修改后的构建部署流程

## 概述

当你修改 Strapi 自定义模型代码（如 `apps/strapi/src/api/` 下的内容类型、控制器、服务等）后，需要重新构建 Docker 镜像并重启容器才能生效。

## 完整流程图

```mermaid
flowchart TD
    subgraph 开发阶段
        A[修改 Strapi 代码] --> B[本地测试<br/>pnpm --filter strapi develop]
        B --> C{测试通过?}
        C -->|否| A
        C -->|是| D[提交代码]
    end

    subgraph 构建阶段
        D --> E[执行 docker build]
        E --> F[Builder Stage]

        subgraph F[Builder Stage - node:20-bookworm-slim]
            F1[安装系统依赖<br/>build-essential, python3, git] --> F2[启用 pnpm]
            F2 --> F3[复制 package.json 等配置文件]
            F3 --> F4[复制完整源代码]
            F4 --> F5[pnpm install --filter strapi...]
            F5 --> F6[pnpm --filter strapi build<br/>构建 Admin UI]
        end

        F --> G[Runner Stage]

        subgraph G[Runner Stage - node:20-bookworm-slim]
            G1[安装运行时依赖<br/>libpq5, curl] --> G2[复制构建产物]
            G2 --> G3[设置 NODE_ENV=production]
            G3 --> G4[暴露端口 1337]
        end
    end

    subgraph 部署阶段
        G --> H[镜像构建完成<br/>cs-strapi:prod]
        H --> I[停止旧容器<br/>make prod-down]
        I --> J[启动新容器<br/>make prod-up]
        J --> K[容器启动]

        subgraph K[容器运行时]
            K1[加载环境变量<br/>.env.prod] --> K2[连接 PostgreSQL]
            K2 --> K3[执行 pnpm --filter strapi start]
            K3 --> K4[Strapi 服务就绪<br/>:1337]
        end
    end

    style A fill:#e1f5fe
    style H fill:#c8e6c9
    style K4 fill:#a5d6a7
```

## 执行命令详解

### 1. 构建镜像

```bash
# 在项目根目录执行（必须在根目录，因为需要 monorepo 上下文）
docker build -t cs-strapi:prod -f apps/strapi/Dockerfile .
```

**构建过程分解：**

```mermaid
sequenceDiagram
    participant Dev as 开发者
    participant Docker as Docker Engine
    participant Builder as Builder Stage
    participant Runner as Runner Stage
    participant Registry as 本地镜像仓库

    Dev->>Docker: docker build -t cs-strapi:prod -f apps/strapi/Dockerfile .

    Docker->>Builder: 创建临时容器
    Builder->>Builder: apt-get install (build-essential, python3)
    Builder->>Builder: corepack enable && prepare pnpm
    Builder->>Builder: COPY 源代码
    Builder->>Builder: pnpm install --filter strapi... --frozen-lockfile
    Builder->>Builder: pnpm --filter strapi build
    Note over Builder: 生成 dist/ 和 build/ 目录

    Docker->>Runner: 创建最终镜像层
    Runner->>Runner: apt-get install (libpq5, curl)
    Runner->>Runner: COPY --from=builder 构建产物
    Runner->>Runner: 设置 CMD ["pnpm", "--filter", "strapi", "start"]

    Runner->>Registry: 保存镜像 cs-strapi:prod
    Registry->>Dev: 构建完成
```

### 2. 部署容器

```bash
# 停止并移除旧容器
make prod-down

# 启动新容器
make prod-up

# 或者一步完成（推荐）
make prod-down && make prod-up

# 查看日志确认启动成功
make prod-logs SERVICE=strapi
```

**部署过程分解：**

```mermaid
sequenceDiagram
    participant Dev as 开发者
    participant Make as Makefile
    participant Compose as Docker Compose
    participant Container as Strapi Container
    participant DB as PostgreSQL

    Dev->>Make: make prod-down
    Make->>Compose: docker compose -p cs-prod down --remove-orphans
    Compose->>Container: 停止 strapi 容器
    Container-->>Compose: 容器已停止

    Dev->>Make: make prod-up
    Make->>Compose: docker compose -p cs-prod up -d
    Compose->>Container: 创建新容器 (cs-strapi:prod)
    Container->>Container: 加载 .env.prod 环境变量
    Container->>Container: 挂载 strapi_uploads_prod 卷
    Container->>DB: 连接 PostgreSQL (host.docker.internal)
    DB-->>Container: 连接成功
    Container->>Container: pnpm --filter strapi start
    Container-->>Dev: 服务就绪 http://localhost:1337
```

## Dockerfile 多阶段构建详解

```mermaid
graph LR
    subgraph "Builder Stage (~2GB)"
        B1[node:20-bookworm-slim] --> B2[build-essential]
        B2 --> B3[python3]
        B3 --> B4[完整 node_modules]
        B4 --> B5[源代码 + 构建产物]
    end

    subgraph "Runner Stage (~500MB)"
        R1[node:20-bookworm-slim] --> R2[libpq5 运行时]
        R2 --> R3[精简 node_modules]
        R3 --> R4[仅构建产物]
    end

    B5 -.->|COPY --from=builder| R4

    style B1 fill:#ffcdd2
    style R1 fill:#c8e6c9
```

**为什么使用多阶段构建？**

| 阶段 | 内容 | 作用 |
|------|------|------|
| Builder | build-essential, python3, 完整 devDependencies | 编译原生模块、构建 Admin UI |
| Runner | 仅运行时依赖 | 最小化镜像体积，减少攻击面 |

## 常用操作快速参考

```mermaid
flowchart LR
    subgraph 日常操作
        A[修改代码] --> B[构建镜像]
        B --> C[重启容器]
        C --> D[查看日志]
    end

    B -.- B1["docker build -t cs-strapi:prod -f apps/strapi/Dockerfile ."]
    C -.- C1["make prod-down && make prod-up"]
    D -.- D1["make prod-logs SERVICE=strapi"]
```

### 完整命令序列

```bash
# 1. 构建新镜像
docker build -t cs-strapi:prod -f apps/strapi/Dockerfile .

# 2. 重启容器（使用新镜像）
make prod-down && make prod-up

# 3. 验证服务状态
make prod-logs SERVICE=strapi

# 4. 检查容器健康
docker ps | grep strapi
curl http://localhost:1337/_health
```

## 注意事项

1. **必须在项目根目录构建** - Dockerfile 需要访问 monorepo 的 `pnpm-workspace.yaml` 和 `packages/`
2. **环境变量来源** - 容器从 `deploy/gce/.env.prod` 读取配置
3. **数据库连接** - 容器内使用 `host.docker.internal` 访问主机 PostgreSQL
4. **uploads 持久化** - `strapi_uploads_prod` 卷保证上传文件不丢失
5. **构建缓存** - Docker 会缓存未变更的层，加速后续构建
