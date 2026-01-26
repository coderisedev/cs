-- ============================================================
-- 1. Create all tables first
-- ============================================================

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

-- ============================================================
-- 2. Create indexes
-- ============================================================

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE UNIQUE INDEX idx_tenants_custom_domain
  ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);

-- ============================================================
-- 3. Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Helper functions (SECURITY DEFINER to bypass RLS)
-- ============================================================

-- Returns tenant IDs for a given user, bypassing RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(uid uuid)
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.tenant_members WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns tenant IDs where user has owner/admin role
CREATE OR REPLACE FUNCTION public.get_user_admin_tenant_ids(uid uuid)
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.tenant_members
  WHERE user_id = uid AND role IN ('owner', 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 5. Create RLS policies (using helper functions)
-- ============================================================

-- profiles policies
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- tenants policies
CREATE POLICY "Members read own tenants"
  ON tenants FOR SELECT
  USING (id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Authenticated users create tenants"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner/admin update tenant"
  ON tenants FOR UPDATE
  USING (id IN (SELECT public.get_user_admin_tenant_ids(auth.uid())));

-- tenant_members policies
CREATE POLICY "Members see co-members"
  ON tenant_members FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Owner/admin manage members"
  ON tenant_members FOR ALL
  USING (tenant_id IN (SELECT public.get_user_admin_tenant_ids(auth.uid())));

-- ============================================================
-- 6. Trigger: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. Seed reserved slugs
-- ============================================================

INSERT INTO reserved_slugs (slug) VALUES
  ('app'), ('api'), ('www'), ('admin'), ('store'),
  ('help'), ('support'), ('blog'), ('docs'), ('status'),
  ('billing'), ('login'), ('register'), ('onboarding'),
  ('dashboard'), ('settings'), ('new'), ('create');
