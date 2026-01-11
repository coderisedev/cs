# Docker 部署必要性分析

> 问题：前端部署在 Vercel，后端部署在 GCE，是否有必要采用 Docker 部署？

## 当前架构

| 组件 | 部署位置 | 方式 |
|------|----------|------|
| dji-storefront | Vercel | 托管平台 |
| Medusa | GCE VM | Docker |
| Strapi | GCE VM | Docker |
| PostgreSQL | GCE VM | 主机直接运行 |
| Redis | GCE VM | 主机直接运行 |

## Docker 在单 VM 场景的利弊分析

### 继续使用 Docker 的理由

1. **Dev/Prod 环境隔离** - 当前在同一台机器运行两套环境（端口 9000/9001, 1337/1338），Docker 让这变得简单
2. **版本回滚** - 镜像打标签后可以快速回滚到之前版本
3. **依赖隔离** - Medusa 和 Strapi 可能需要不同的 Node 版本或依赖
4. **一致性** - 本地开发和生产环境一致，减少"我本地没问题"的情况

### 不使用 Docker 的理由

1. **网络复杂性** - 容器内需要用 `host.docker.internal` 而非 `localhost` 访问主机服务
2. **调试稍麻烦** - 需要 `docker exec` 进入容器
3. **单机无需编排** - 没有 K8s/Swarm，Docker Compose 的优势有限
4. **资源开销** - 虽然小，但确实存在

## 建议

**对于当前场景，Docker 是合理的选择，但不是必须的。**

### 关键考量

| 如果... | 建议 |
|---------|------|
| 需要同时运行 dev + prod | 保持 Docker |
| 只运行 prod，dev 在本地 | 可以考虑去掉 Docker，用 PM2/systemd 直接运行 |
| 团队多人维护 | 保持 Docker（环境一致性重要） |
| 只有你一个人维护 | 两种都可以 |

### 简化方案（如果想去掉 Docker）

```bash
# 用 PM2 管理 Node 进程
pm2 start "pnpm --filter medusa start" --name medusa
pm2 start "pnpm --filter strapi start" --name strapi
pm2 save
pm2 startup
```

但会失去 dev/prod 隔离能力，除非用不同端口手动配置。

## 结论

当前的 Docker 方案是合理的。如果觉得维护复杂，可以简化为：

- **只保留 prod 环境的 Docker**
- **dev 环境在本地机器用 `pnpm dev` 运行**

这样减少一半的 Docker 配置复杂度，同时保留生产环境的隔离和版本管理优势。
