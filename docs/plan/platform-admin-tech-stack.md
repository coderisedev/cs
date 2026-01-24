# Lumora Platform Admin 技术栈决策与演进战略

> **决策背景：** 
> 针对 Lumora Shop 的“母体”系统（Platform Admin），我们需要在研发效率、系统稳定性与未来可扩展性之间取得平衡。
> **核心原则：** 延迟引入复杂性 (Defer Complexity)。

## 1. 核心决策：初期采用 Next.js 全栈架构

**结论：** 弃用独立的 FastAPI 或 NestJS 后端，直接利用 **Next.js (App Router) + Supabase** 实现全栈逻辑。

### 为什么这是 CTO 级的选择？
1.  **统一上下文 (Unified Context):** 前后端共享 TypeScript 类型。通过 **Server Actions**，前端可以直接调用后端业务函数，开发效率提升 300%，彻底消除 API 文档维护和 CORS 跨域问题。
2.  **极低运维成本:** 不需要维护独立的后端服务镜像和 CI/CD。Next.js 的路由处理（Route Handlers）足以替代 FastAPI 进行基础的 CRUD 和 Webhook 处理。
3.  **开发极速:** 利用 Vercel + Supabase 的生态，开发者只需关注业务逻辑，基础设施由平台托管。

---

## 2. 架构分层演进路线 (Evolutionary Roadmap)

我们不追求一步到位的“完美”，而是根据业务压力动态调整技术栈。

### 第一阶段：MVP (当前) —— 极简主义
*   **技术栈：** Next.js + TypeScript + Supabase Auth/DB。
*   **后端实现：** Next.js Server Actions (逻辑处理) + Route Handlers (外部回调)。
*   **目标：** 快速验证“一键开店”和“租户管理”逻辑。

### 第二阶段：AI 增强 (下一步) —— 引入 Python
*   **场景：** 涉及大规模图片生成、复杂的 NLP 任务、向量计算。
*   **技术栈：** **Python (FastAPI)**。
*   **集成方式：**
    *   Next.js 依然作为控制面。
    *   Python 作为 **AI Worker** 部署在独立的 Cloud Run 容器中。
    *   两者通过 **Upstash Redis** (消息队列) 或 内部 API 进行通信。
*   **价值：** 拥抱 Python 最强的 AI 生态 (PyTorch, LangChain, Diffusers)。

### 第三阶段：规模化爆发 (B 轮以后) —— 引入 Rust
*   **场景：** 全局超级 Agent 处理百万级并发搜索、极高性能的订单路由拆分。
*   **技术栈：** **Rust**。
*   **部署位置：** 核心引擎 (Core Engine) 或 边缘网关 (Edge Gateway)。
*   **价值：** 极致的内存安全与零成本抽象，将云基础设施成本降至最低。

---

## 3. 核心原则总结

1.  **不要为了架构而架构：** 在用户量没过万之前，一个 Next.js 项目能解决 99% 的问题。
2.  **类型安全是第一生产力：** 维持全栈 TypeScript 是防止线上 Bug 最廉价的方式。
3.  **按需解耦：** 只有当某个模块的性能或生态需求（如 AI 库）在 Node.js 中无法满足时，才将其拆分为独立微服务。
