# Lumora 综合中台 (Platform Admin) PRD

> **定义：**
> 这是 Lumora 的“母体”系统。
> 它的职责不是卖货，而是**孵化和管理**那些卖货的店铺 (Tenants)。
> 它是用户接触 Lumora 的第一站。

## 1. 核心功能范围

1.  **全局身份认证 (Global Identity):** 用户只需注册一次，即可管理名下的多个店铺。
2.  **店铺孵化 (Provisioning):** 一键创建新店铺，分配唯一的 `slug` (子域名)。
3.  **租户路由 (Tenant Routing):** 智能判断用户权限，将其安全导向对应的店铺控制台。

---

## 2. 数据库模型设计 (Supabase Schema)

我们需要在 Supabase 的 `public` schema 中建立以下核心表，用于 SaaS 层面的管理。

### A. `profiles` (用户表)
*   *说明：* 扩展 Supabase Auth 的 `auth.users` 表。
*   **字段：**
    *   `id`: uuid (PK, references auth.users)
    *   `email`: text
    *   `full_name`: text
    *   `avatar_url`: text
    *   `created_at`: timestamp

### B. `tenants` (租户/店铺表)
*   *说明：* 每一个记录代表一家“店铺”。
*   **字段：**
    *   `id`: uuid (PK)
    *   `name`: text (e.g., "Nike Official")
    *   `slug`: text (Unique, e.g., "nike") -> 对应 `nike.lumora.shop`
    *   `custom_domain`: text (Optional, e.g., "nike.com")
    *   `plan`: text (enum: 'free', 'pro', 'enterprise')
    *   `created_at`: timestamp

### C. `tenant_members` (成员关联表)
*   *说明：* 多对多关系。一个用户可以拥有多个店铺，一个店铺可以有多个员工。
*   **字段：**
    *   `user_id`: uuid (FK -> profiles.id)
    *   `tenant_id`: uuid (FK -> tenants.id)
    *   `role`: text (enum: 'owner', 'admin', 'editor')
    *   **Primary Key:** (user_id, tenant_id)

---

## 3. 用户旅程 (The "Genesis" Flow)

### 阶段一：注册与登陆
1.  **入口:** 用户访问 `app.lumora.shop/login`.
2.  **动作:** 输入邮箱/密码，或点击 "Sign in with Google".
3.  **系统:**
    *   在 Supabase `auth.users` 创建账户。
    *   触发 Trigger 自动在 `public.profiles` 创建记录。
    *   **检查:** 该用户是否已有店铺？
        *   **无:** 跳转至 `/onboarding` (开店向导)。
        *   **有:** 跳转至 `/dashboard` (店铺列表)。

### 阶段二：开店向导 (Onboarding)
1.  **界面:** 极简风格。文案："Let's build your AI commerce empire."
2.  **输入:**
    *   **Store Name:** "My Awesome Shop"
    *   **Store URL:** `my-awesome-shop`.lumora.shop (系统自动根据 Name 生成 Slug，并检测可用性)。
3.  **提交:** 点击 **"Create Store"**。
4.  **后台处理 (Transaction):**
    *   Insert into `tenants`.
    *   Insert into `tenant_members` (Role = 'owner').
5.  **完成:** 烟花特效。跳转至该店铺的**AI 指挥舱**。

---

## 4. 关键技术细节

### A. 路由策略 (Routing Strategy)
我们采用 **Path-based Routing** (初期) + **Subdomain Routing** (后期) 的混合策略。

*   **Platform Console:** `app.lumora.shop`
    *   `/dashboard`: 列出所有店铺。
    *   `/settings`: 个人账号设置。
*   **Store Console:** `app.lumora.shop/store/[slug]`
    *   这是最简单的实现方式，不需要处理复杂的跨域 Cookie 问题。
    *   用户在 `app.lumora.shop` 登录后，Cookie 对所有路径有效。

### B. 安全策略 (RLS - Row Level Security)
Supabase 的核心优势。我们必须在数据库层锁死权限。

*   **策略:** `tenant_members` 表是关键钥匙。
*   **规则:**
    *   用户只能 `SELECT` `tenants` 表中 `id` 存在于 `tenant_members` (where user_id = auth.uid()) 的记录。
    *   这确保了 User A 即使知道 User B 的店铺 ID，也无法读取其数据，因为 RLS 会返回空。

---

## 5. MVP 开发清单

1.  [ ] **初始化 Next.js 项目** (安装 Supabase SDK, Shadcn UI)。
2.  [ ] **配置 Supabase Auth** (开启 Email/Password 登录)。
3.  [ ] **创建数据库表** (`profiles`, `tenants`, `tenant_members`) 并配置 RLS 策略。
4.  [ ] **开发 `/onboarding` 页面** (开店表单)。
5.  [ ] **开发 `/dashboard` 页面** (店铺列表卡片)。
