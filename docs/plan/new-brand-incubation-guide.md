# 基于现有架构快速孵化新 DTC 品牌指南

**最后更新**: 2026-01-13
**策略**: "Clone & Trim" (克隆与裁剪)
**目标**: 在 24 小时内启动一个具备支付、物流、内容管理能力的全新 DTC 品牌独立站。

---

## 第一阶段：克隆与重命名 (Clone & Rename)

不要重新 `create-next-app`，直接复用当前工程的工业级配置。

### 1. 建立新仓库
```bash
# 1. 克隆当前项目
git clone https://github.com/your-org/current-repo.git new-brand-repo

# 2. 切断 git 历史 (作为全新起点)
cd new-brand-repo
rm -rf .git
git init
git add .
git commit -m "init: scaffold from dji-storefront architecture"
```

### 2. 全局替换 (Search & Replace)
使用 IDE 全局替换关键标识符：
*   **组织名**: `dji-storefront` -> `new-brand-storefront`
*   **域名**: `aidenlux.com` -> `newbrand.com`
*   **数据库名**: `medusa_production` -> `newbrand_medusa`

### 3. 清理 Monorepo
保留架构骨架，删除业务特定的代码。

*   **保留**: `apps/medusa`, `apps/strapi`, `packages/medusa-client`
*   **清理**:
    *   `apps/dji-storefront/src/app/[countryCode]/...` (保留目录结构，删除具体页面内容)
    *   `apps/medusa/src/subscribers` (如果有特定业务逻辑)

---

## 第二阶段：核心配置复位 (Reset Configuration)

### 1. Medusa 后端复位
Medusa 是无状态的，只需重置数据。

```bash
# 1. 重新生成数据库
dropdb medusa_newbrand
createdb medusa_newbrand

# 2. 运行迁移
cd apps/medusa
npm run migrations

# 3. 播种新数据 (Seeding)
# 这一步很关键：创建一个全新的 Admin 用户和空的 Store 配置
npm run seed -- --seed-file=data/seed-newbrand.json
```

### 2. Strapi CMS 复位
Strapi 的 Content Type (模型) 可以复用，但内容数据要清空。

*   **保留**: `src/api/*/content-types` (文章、产品增强字段的模型定义保留，这能省几天开发时间)。
*   **清空**: 数据库中的 `posts`, `products` 表数据。

### 3. UI 主题定制 (Theming)
利用 Tailwind CSS 的配置优势。

*   修改 `tailwind.config.ts`:
    ```typescript
    theme: {
      extend: {
        colors: {
          primary: "#NEW_COLOR", // 替换品牌色
          accent: "#NEW_ACCENT",
        }
      }
    }
    ```
*   替换 `public/logo.png` 和 `favicon.ico`。

---

## 第三阶段：基础设施复用 (Infrastructure Reuse)

### 1. 部署配置
*   **PM2**: 复用 `ecosystem.config.cjs`，只需修改 `name` 和 `PORT` (例如新项目用 9001/1338)。
*   **Cloudflare Tunnel**:
    *   如果部署在同一台 GCE：只需在 CF Dashboard 为该 Tunnel 增加新的 Public Hostname (Ingress Rule)。
    *   **优势**: 一台服务器可以跑 N 个品牌的后端，资源最大化利用。

### 2. 支付与物流
*   **Stripe/PayPal**: 只需在 `.env` 更换 API Key，代码逻辑（Checkout Flow）完全通用。
*   **物流**: 复用我们在 `medusa-fulfillment-yunexpress` 中开发的插件逻辑。

---

## 第四阶段：差异化开发 (Differentiation)

做好了上面这些，你就已经拥有了一个“能跑”的空壳电商网站。接下来只做三件事：

1.  **产品录入**: 在 Medusa Admin 上架新商品。
2.  **内容填充**: 在 Strapi 写几篇新品牌的博客，配置首页 Banner。
3.  **页面微调**: 根据新品牌调性调整 `apps/storefront/src/app/page.tsx` (首页布局)。

---

## 总结：为什么这是最优解？

| 从零开发 | 基于现有架构克隆 |
| :--- | :--- |
| 配置 ESLint/TypeScript/Jest (2天) | **0 分钟** (现成的) |
| 搭建 Medusa+Strapi 通信 (3天) | **0 分钟** (现成的) |
| 写支付/结账流程 (1周) | **0 分钟** (现成的) |
| 配置 PM2/Docker/CI/CD (2天) | **0 分钟** (现成的) |
| **总计: 2周+** | **总计: 2-4 小时** |

您现在拥有的不仅仅是一个网站，而是一套**“DTC 品牌孵化工厂”**。
