# Lumora Shop: 多租户扩容与隔离技术详案

> **目标：** 支持 1000+ 店铺的高效运行。
> **核心挑战：** 在成本（Cost）、隔离性（Isolation）和可维护性（Maintainability）之间找到平衡。

## 1. 前端架构：Vercel "Platforms" 模式

对于前端，**不要**为每个店铺创建一个 Vercel Project。

### 架构模式：单体代码库 + 动态路由 (One Codebase, Infinite Domains)
*   **部署：** 只部署一个 Next.js 应用。
*   **域名管理：** 使用 Vercel API 动态绑定域名。
    *   API: `POST https://api.vercel.com/v9/projects/{id}/domains`
*   **路由逻辑 (Middleware):**
    利用 Next.js Edge Middleware 在请求到达页面之前重写路径。

    ```typescript
    // middleware.ts 伪代码
    export default function middleware(req) {
      const hostname = req.headers.get("host"); // e.g., "nike.lumora.com"
      
      // 1. 解析租户 ID
      const tenant = getTenantFromHost(hostname);
      
      // 2. 重写 URL (用户看不到 url 变化)
      // 用户访问 /products -> 系统内部重写为 /_sites/nike/products
      return NextResponse.rewrite(new URL(`/_sites/${tenant}${req.nextUrl.pathname}`, req.url));
    }
    ```
*   **数据获取：**
    在 `src/app/_sites/[site]/page.tsx` 中，根据 `params.site` 去获取该店铺的特有数据（Logo, Theme, Products）。

---

## 2. 后端架构：Cloud Run "混合细胞" 模式

对于后端，Cloud Run 允许我们灵活选择隔离级别。

### 策略 A：共享细胞 (Shared Cell) - 适合 Standard Plan
*   **架构：** 多个店铺共享同一个 Cloud Run Service 实例。
*   **隔离：** **逻辑隔离**。
    *   应用层：通过 HTTP Header `x-store-id` 识别租户。
    *   数据层：在 Service 内部切换 Postgres `search_path`。
*   **优势：**
    *   **高密度：** 一个容器可以服务几百个低频访问的小店。
    *   **零冷启动：** 流量汇聚，容器常驻。
*   **劣势：** 邻居干扰 (Noisy Neighbor)。

### 策略 B：独立细胞 (Dedicated Cell) - 适合 Enterprise Plan
*   **架构：** 为每个店铺部署一个独立的 Cloud Run Service (`medusa-store-101`)。
*   **隔离：** **物理隔离** (进程级 + 环境变量级)。
    *   Env: `DATABASE_URL=postgres://...?search_path=store_101`
*   **优势：**
    *   **极致安全：** 进程独立，互不影响。
    *   **定制化：** 可以为 VIP 客户单独升级版本或安装私有插件。
*   **管理成本：** 需要 Control Plane 自动化管理生命周期。

---

## 3. 控制面 (The Control Plane) 自动化逻辑

我们需要开发一个后台服务（Manager），负责指挥 GCP 和 Vercel。

### 场景一：新店开张 (Provisioning)
1.  **用户动作：** 注册成功，店铺名 "MyStore"。
2.  **Manager 动作：**
    *   **DB:** 在 Postgres 中创建新的 Schema `store_mystore`。
    *   **Vercel:** 调用 API 绑定域名 `mystore.lumora.com`。
    *   **GCP:** (如果是企业版) 调用 Cloud Run API 创建新服务 `medusa-mystore`。

### 场景二：平台升级 (Rolling Update)
1.  **开发者动作：** Push 代码到 Main 分支，构建新 Docker 镜像 `tag:v2.0`。
2.  **Manager 动作：**
    *   **共享集群：** 直接更新 Shared Cloud Run Service (一次更新覆盖 90% 店铺)。
    *   **独立集群：** 启动异步任务队列，逐批次更新 VIP 店铺的 Service (灰度发布)。

---

## 4. 结论

*   **Vercel** 负责统一的流量入口和路由分发，利用其 Edge 能力处理无限域名。
*   **Cloud Run** 提供了弹性的计算资源池，配合我们的 **混合策略**，既能吃下长尾市场（低成本），又能服务头部客户（高隔离）。

这是一套可进可退、极具弹性的**工程化解决方案**。
