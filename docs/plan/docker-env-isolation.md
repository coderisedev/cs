---
last_updated: 2025-11-17
status: ✅ Approved
related_docs:
  - docs/done/docker-env-best-practices.md
  - docs/fix/2025-11-17-docker-db-access.md
---

## Docker 环境隔离实施计划

### 背景与目标
- 生产与开发此前复用单一的 `deploy/gce/docker-compose.yml`，服务名、容器名、端口与镜像标签容易冲突，导致互相抢占端口或覆盖容器。
- 最佳实践要求两个环境在 Docker 维度彻底隔离：独立 Compose 配置、独立 `.env`、独立镜像标签与项目名，确保任一环境的发布/调试不会影响另一环境。
- 目标：提供清晰的目录结构与操作手册，使 prod/dev 各自有固定命令、容器名、网络、卷和镜像约定。

### 架构与规范
1. **目录布局**
   - `deploy/gce/prod/docker-compose.yml`：仅包含生产服务 (`medusa`, `strapi`, 未来扩展)。
   - `deploy/gce/dev/docker-compose.yml`：仅包含开发服务 (`medusa-dev`, `strapi-dev`)。
   - `deploy/gce/.env.prod` 与 `deploy/gce/.env.dev`：分别存储环境变量，生产 `.env` 不再被开发 Compose 引用。
   - 公共的 `docker-compose.base.yml`（可选）只定义共享的卷/网络/额外服务，供 prod/dev 通过 `-f base -f prod` 方式叠加。

2. **镜像与标签**
   - 统一遵循 `cs-<service>:prod` / `cs-<service>:dev` 命名，构建命令写入 `docs/fix/dev-env-bringup-retro.md` 与新 Makefile/脚本。
   - CI/CD：生产镜像由 main 分支构建推送，开发镜像支持本地 `pnpm turbo run build --filter=<service>` + `docker build ... -t cs-*-:dev`。

3. **Compose 运行规范**
   - 生产：`docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml up -d`.
   - 开发：`docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d`.
   - 每个 Compose 文件内部的 `container_name` 仅在调试需要时设置；推荐依赖 `-p` 生成的 `cs-dev_medusa`、`cs-prod_medusa`，避免名称冲突。
   - `ports` 显式声明：生产 (`9000`,`1337`)，开发 (`9001`,`1338`)；必要时再挂一个 `localhost` 限制避免误暴露。

4. **网络、卷与数据**
   - `cs-prod-net` / `cs-dev-net` 独立定义，防止跨环境容器互通。
   - 卷名遵循 `<project>-<env>-<service>-data`，例如 `cs-prod-medusa-db`, `cs-dev-strapi-uploads`，避免复用宿主目录。
   - 对 Postgres/Redis 等外部依赖，开发环境优先使用独立数据库/命名空间（已创建 `medusa_dev`, `strapi_dev`）；在 Compose 文档内注明连接字符串。

5. **DNS 与入口**
   - 生产：`api.aidenlux.com`、`content.aidenlux.com`。
   - 开发：`dev-api.aidenlux.com`、`dev-content.aidenlux.com` 指向 `localhost`，在文档中记录 hosts/DNS 设置，确保仅开发端使用。

6. **文档与脚本**
   - 更新 `docs/fix/dev-env-bringup-retro.md` 与 `docs/basic/dev-db-clone.md`，增加新的 Compose 路径及命令。
   - 在仓库根目录提供 `Makefile`/`scripts/docker-prod.sh`、`scripts/docker-dev.sh`，封装 `docker compose` 命令，避免人工输入错误。

### 实施步骤
1. **重构 Compose 文件**
   - 新建 `deploy/gce/{base,prod,dev}/docker-compose*.yml`，将现有 prod 配置迁移至 prod 目录，将 dev 专用配置（端口 9001/1338、dev 镜像）迁移至 dev 目录。
   - 验证两个文件都可以独立 `docker compose config`，保证 `env_file` 指向正确 `.env.*`。

2. **更新环境变量文件**
   - 拆分 `.env` → `.env.prod`，`.env.dev` 已存在但需校对变量、确保只包含 dev 值。
   - 根目录 `.env` 仅用于本地脚本（可选）；Compose 不再默认读取根 `.env`。

3. **调整脚本与文档**
   - 修改 `docs/fix/dev-env-bringup-retro.md`、`docs/basic/dev-db-clone.md` 等引用，使读者按照新命令启动。
   - 新增 Makefile 目标 `make prod-up`, `make dev-up`, `make prod-logs`, `make dev-logs`。

4. **验收清单**
   - 同时运行 `make prod-up` 与 `make dev-up` 时，`docker ps` 应显示四个容器，端口互不冲突，容器名形如 `cs-prod-medusa-1` 与 `cs-dev-medusa-1`。
   - `docker network ls` 出现 `cs-prod-net`, `cs-dev-net`。
   - `docker volume ls` 显示独立卷，且 `docker inspect` 证明互不共享。
   - 访问 `https://api.aidenlux.com` 与 `https://dev-api.aidenlux.com` 可并行工作。

### 后续扩展
- 若未来引入 staging，可复制 dev 模板，使用 `cs-staging` 项目名与 `.env.staging`。
- 评估在 CI 中使用 `docker compose --profile` 对多环境构建/测试进行自动化。
- 长期可迁移到 Kubernetes 或 Nomad，但当前计划确保 Docker Compose 层面的隔离最佳实践。
