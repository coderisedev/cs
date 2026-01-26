# Task S1-02: 执行数据库 Migration

> **Sprint:** 1 - Auth Foundation
> **Priority:** P0 | **Points:** 1
> **Prerequisites:** S1-01 (Supabase 服务运行中)
> **Blocks:** S1-03, S1-04, S1-05, S1-06

---

## 目标

执行已准备好的 SQL Migration 文件，创建 profiles、tenants、tenant_members、reserved_slugs 四张表，配置 RLS 策略和 trigger。

---

## Migration 文件位置

```
apps/lumora-platform/supabase/migrations/20260124000001_initial_schema.sql
```

---

## 操作步骤

### 执行 Migration

```bash
cd apps/lumora-platform

# 方法 1：推送所有 pending migrations
supabase db push

# 方法 2：如果方法 1 失败，手动执行
supabase db reset  # 重置并重新执行所有 migrations
```

### 验证表创建

在 Supabase Studio（http://localhost:54323）的 SQL Editor 中执行：

```sql
-- 检查所有 public 表
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- 预期：profiles, reserved_slugs, tenant_members, tenants
```

### 验证 RLS 策略

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**预期输出（6 条策略）：**

| tablename | policyname | cmd |
|-----------|-----------|-----|
| profiles | Users read own profile | SELECT |
| profiles | Users update own profile | UPDATE |
| tenant_members | Members see co-members | SELECT |
| tenant_members | Owner/admin manage members | ALL |
| tenants | Authenticated users create tenants | INSERT |
| tenants | Members read own tenants | SELECT |
| tenants | Owner/admin update tenant | UPDATE |

### 验证 Trigger

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- 预期：on_auth_user_created | INSERT | EXECUTE FUNCTION public.handle_new_user()
```

### 验证 Function

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';
-- 预期：handle_new_user | FUNCTION
```

### 验证 Reserved Slugs 数据

```sql
SELECT count(*) FROM reserved_slugs;
-- 预期：18

SELECT slug FROM reserved_slugs ORDER BY slug;
-- 预期列表：admin, api, app, billing, blog, create, dashboard, docs, help,
--          login, new, onboarding, register, settings, status, store, support, www
```

### 验证索引

```sql
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY indexname;
-- 预期：
-- idx_tenant_members_tenant | tenant_members
-- idx_tenant_members_user   | tenant_members
-- idx_tenants_custom_domain | tenants
-- idx_tenants_slug          | tenants
```

### 验证 Trigger 实际工作

```sql
-- 模拟 auth.users 插入（通过 Supabase Auth API 注册一个测试用户更好）
-- 使用 Supabase Dashboard → Authentication → Users → Create User
-- 创建后检查 profiles 表是否自动插入记录
```

或通过 curl 测试：

```bash
curl -X POST "http://localhost:54321/auth/v1/signup" \
  -H "apikey: <YOUR_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "data": { "full_name": "Test User" }
  }'

# 然后检查 profiles 表
```

```sql
SELECT id, email, full_name FROM profiles;
-- 预期：包含 test@example.com, full_name = "Test User"
```

---

## 完整 Schema 参考

以下是 Migration 文件的完整内容，确认与实际文件一致：

```sql
-- profiles: extends auth.users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- tenants: stores
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 64),
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings jsonb NOT NULL DEFAULT '{}',
  custom_domain text,
  domain_verified boolean NOT NULL DEFAULT false,
  domain_verified_at timestamptz,
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- tenant_members: user-store association
CREATE TABLE public.tenant_members (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  PRIMARY KEY (user_id, tenant_id)
);

-- reserved_slugs: system-reserved addresses
CREATE TABLE public.reserved_slugs (
  slug text PRIMARY KEY
);
```

---

## 验收标准

| # | 条件 | 验证方式 |
|---|------|---------|
| 1 | 4 张表创建成功 | `pg_tables` 查询返回 4 行 |
| 2 | 7 条 RLS 策略激活 | `pg_policies` 查询 |
| 3 | Trigger 存在且可执行 | 注册测试用户后 profiles 自动创建 |
| 4 | 18 条保留 slug 插入 | `SELECT count(*) FROM reserved_slugs` = 18 |
| 5 | 4 个自定义索引存在 | `pg_indexes` 查询 |
| 6 | RLS 已在所有表启用 | 每张表的 `rowsecurity` = true |

---

## 清理（可选）

如果创建了测试用户，在后续开发前清理：

```sql
-- 通过 Dashboard → Authentication → Users 删除 test@example.com
-- 或
DELETE FROM auth.users WHERE email = 'test@example.com';
```

---

## 完成后

本任务完成后，S1-03（注册页面）、S1-04（登录页面）、S1-06（Middleware 验证）可以并行开始。
