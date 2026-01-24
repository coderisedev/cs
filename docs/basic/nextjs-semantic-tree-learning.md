# 用马斯克“语义树”学习法掌握 Next.js：以本项目为例

> **核心理念 (First Principles)：**
> 不要一上来就背 API（什么 `getStaticProps`, `useEffect`），那些是树叶。
> 先搞懂 Next.js 到底解决了什么**根本问题**（树干），再看它是**怎么解决的**（树枝），最后才是**代码怎么写**（树叶）。

本文将以你的 `dji-storefront` 应用为例，带你构建 Next.js 的知识树。

---

## 第一层：树根 (The Root) - 为什么我们需要 Next.js？

React 本身只是一个**UI 库**（画界面的）。如果你只用 React，你会面临三个根本痛点：
1.  **SEO 差：** 浏览器拿到的全是 JS，搜索引擎爬虫看不懂（也就是“白屏”问题）。
2.  **慢：** 用户要等 JS 下载、解析、执行完才能看到内容。
3.  **路由麻烦：** 你得自己装 `react-router`，自己配路径。

**Next.js 的本质 (First Principle)：**
它是一个**全栈框架**，核心任务是**把 React 组件在服务器上先画好（渲染）**，再发给浏览器。
*   *目的：* 让用户打开网页就能看到内容（快），让爬虫能读懂内容（SEO）。

---

## 第二层：树干 (The Trunk) - 核心机制：渲染与路由

Next.js 这棵大树的主干只有两个概念：**怎么画页面 (Rendering)** 和 **怎么找页面 (Routing)**。

### 1. 怎么画页面？(Rendering)
在 Next.js 13+ (App Router) 中，这是一场“服务器”与“浏览器”的接力赛。

*   **Server Components (服务端组件 - 默认):**
    *   *原理：* 在服务器上运行，直接读数据库/API，生成静态 HTML。
    *   *优势：* 数据获取快，不暴露 API 密钥，发给浏览器的 JS 包很小。
    *   *标志：* 也就是普通的 React 组件，**没有** `'use client'` 指令。
*   **Client Components (客户端组件):**
    *   *原理：* 在浏览器里运行，处理 `onClick`, `useState`, `useEffect`。
    *   *优势：* 只有它能跟用户互动。
    *   *标志：* 文件顶部写了 `'use client'`。

### 2. 怎么找页面？(Routing)
*   **文件即路由 (File-system Routing):**
    *   你不需要写路由配置文件。文件夹的结构就是 URL 的结构。

---

## 第三层：树枝 (The Branches) - 本项目的四大支柱

看看你的 `apps/dji-storefront` 目录，每一根树枝都清晰可见。

### 树枝 1：动态路由 (Dynamic Routing)
*   **原理：** 用方括号 `[]` 表示“这里是变量”。
*   **项目案例：** `src/app/[countryCode]/page.tsx`
    *   这个文件夹叫 `[countryCode]`。
    *   所以用户访问 `/us`，`countryCode` 就是 `us`。
    *   用户访问 `/cn`，`countryCode` 就是 `cn`。
    *   Next.js 自动把这个参数传给页面组件。

### 树枝 2：服务端数据获取 (Server Data Fetching)
*   **原理：** 直接在组件里写 `async/await`。
*   **项目案例：** `src/app/[countryCode]/page.tsx`
    ```typescript
    // 这是一个 Server Component (树干)
    export default async function Homepage({ params }: HomepageProps) {
        const { countryCode } = params
        
        // 直接在服务器端获取数据 (树枝)
        // 这一步是在服务器上完成的，浏览器根本不知道你调了什么 API
        const collections = await getCollectionsList(0, 3)
        const region = await getRegion(countryCode)
        
        return <div>...</div>
    }
    ```

### 树枝 3：客户端交互 (Client Interactivity)
*   **原理：** 当需要点击、输入时，把接力棒交给客户端组件。
*   **项目案例：** `src/components/auth/login-client.tsx`
    *   **为什么是 Client Component？** 因为你要处理 `useState` (存用户输入的邮箱)，要处理 `formAction` (点击提交)。
    *   **代码特征：** 顶部第一行必须是 `'use client'`。

### 树枝 4：服务器端操作 (Server Actions)
*   **原理：** 以前前端调后端要写 API Route (`/api/login`)，现在直接写个函数就能由前端调后端逻辑。
*   **项目案例：** `src/lib/actions/auth.ts`
    *   这里面的 `initiateOTPLoginAction` 就是一个 Server Action。
    *   虽然它在前端组件里被调用，但它**其实是在服务器上运行的**。
    *   **核心价值：** 让你在写前端代码时，像调用本地函数一样调用后端逻辑，不用管 HTTP 请求的细节。

---

## 第四层：树叶 (The Leaves) - 代码细节与最佳实践

有了骨架，现在看你项目里的具体代码（树叶），就懂了。

### 🍂 案例一：`page.tsx` vs `layout.tsx`
*   **树枝位置：** **Routing**。
*   **细节：**
    *   `layout.tsx` (布局)：是**壳子**。比如导航栏、Footer。切换页面时，壳子不重新加载（省性能）。
    *   `page.tsx` (页面)：是**内容**。每次切换路径，内容会变。
*   **你的项目：** `src/app/[countryCode]/layout.tsx` 定义了全局的导航栏（Nav），这样不管你去首页还是商品页，导航栏都在。

### 🍂 案例二：OTP 登录功能的实现
*   **树枝位置：** **Server Actions + Client Components**。
*   **流程解析：**
    1.  **用户在浏览器 (Client):** 在 `login-client.tsx` 输入邮箱，点击“发送”。
    2.  **Next.js (Bridge):** 自动把请求打包，发给服务器。
    3.  **服务器 (Server):** 执行 `initiateOTPLoginAction` (在 `actions/auth.ts`)。
        *   这个函数在服务器跑，所以能直接连 Medusa 后端，不怕暴露 API Key。
    4.  **返回 (Response):** 服务器把结果（“成功/失败”）还给浏览器。
    5.  **浏览器 (Client):** `login-client.tsx` 根据结果，切换 UI 到“输入验证码”界面。

### 🍂 案例三：Image Optimization
*   **树枝位置：** **Performance**。
*   **细节：** 你的代码里大量使用了 `<Image />` 组件而不是 `<img>` 标签。
*   **原理：** Next.js 会自动把大图压缩、转格式（WebP）、按需加载。这就是为什么你的商城图片多但加载不慢的原因。

---

## 总结：如何用这棵树写代码？

当你接到一个新需求（比如“加一个商品评论功能”）时，按树的生长顺序思考：

1.  **定路由 (Routing)：** 这个功能要在哪个 URL 展示？（新建文件夹/page.tsx）
2.  **定数据 (Rendering)：** 数据从哪来？
    *   如果是一打开就要有的数据（如评论列表） -> **Server Component (`page.tsx`)** 里直接 fetch。
    *   如果是用户点击后才有的数据（如提交评论） -> **Client Component** + **Server Action**。
3.  **写交互 (Leaves)：** 需要用户填表单吗？
    *   需要 -> 创建一个 `xxx-client.tsx`，写上 `'use client'`，嵌入到 `page.tsx` 里。

通过这棵语义树，Next.js 不再是零散的 API 集合，而是一套逻辑严密的**服务器-客户端协作体系**。
