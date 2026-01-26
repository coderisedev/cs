# Task S1-01: Supabase 项目配置

> **Sprint:** 1 - Auth Foundation
> **Priority:** P0 | **Points:** 2
> **Prerequisites:** 无
> **Blocks:** S1-02, S1-03, S1-04, S1-05, S1-06

---

## 目标

配置 Supabase 本地开发环境（或 Cloud Free Tier），获取 API 凭证，写入环境变量文件。

---

## 操作步骤

### 方案 A：本地 Supabase（推荐开发环境）

```bash
# 1. 安装 Supabase CLI（如未安装）
brew install supabase/tap/supabase
# 或
npm install -g supabase

# 2. 在项目中初始化 Supabase（已有 supabase/ 目录则跳过）
cd apps/lumora-platform
supabase init  # 如果 supabase/ 目录已存在则不需要

# 3. 启动本地 Supabase（需要 Docker 运行中）
supabase start

# 4. 输出中会显示：
#   API URL: http://localhost:54321
#   anon key: eyJhbGciOiJIUzI1NiIs...
#   service_role key: eyJhbGciOiJIUzI1NiIs...
#   Studio URL: http://localhost:54323
```

### 方案 B：Supabase Cloud Free Tier（备用）

1. 访问 https://supabase.com/dashboard 创建新项目
2. 项目名称：`lumora-platform-dev`
3. 选择离你最近的 Region
4. 记录 Project URL 和 `anon` API Key

### 配置 Auth Providers

**通过 Supabase Dashboard（本地为 http://localhost:54323）：**

1. **Email/Password 认证：**
   - Authentication → Providers → Email → 确保 Enable 开启
   - 关闭 "Confirm email"（开发阶段简化流程，Sprint 3 再启用）
   - 设置 Minimum password length = 8

2. **Google OAuth（可延迟至 S1-05）：**
   - Authentication → Providers → Google → Enable
   - 需要 Google Cloud Console 的 OAuth Client ID 和 Secret
   - 暂时跳过，S1-05 任务中详细配置

3. **Auth URL Configuration：**
   - Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs 添加: `http://localhost:3000/auth/callback`

### 创建环境变量文件

**创建文件：** `apps/lumora-platform/.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**注意：** `.env.local` 已在 `.gitignore` 中，不会被提交。

### 验证 Supabase 服务

```bash
# 检查所有服务状态
supabase status

# 预期输出包含：
#   supabase local development setup is running.
#   API URL: http://localhost:54321
#   GraphQL URL: http://localhost:54321/graphql/v1
#   DB URL: postgresql://postgres:postgres@localhost:54322/postgres
#   Studio URL: http://localhost:54323
#   Inbucket URL: http://localhost:54324  ← 本地邮件捕获
```

---

## 验收标准

| # | 条件 | 验证方式 |
|---|------|---------|
| 1 | Supabase 服务运行中 | `supabase status` 显示所有服务 running |
| 2 | `.env.local` 存在且包含正确变量 | `cat apps/lumora-platform/.env.local` |
| 3 | Email/Password 认证已启用 | Dashboard → Authentication → Providers |
| 4 | Site URL 配置正确 | Dashboard → Authentication → URL Configuration |
| 5 | Next.js 可读取环境变量 | `pnpm dev:lumora` 启动无报错 |

---

## 完成后

本任务完成后，S1-02（数据库 Migration）可以开始执行。
