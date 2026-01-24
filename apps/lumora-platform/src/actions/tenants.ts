"use server";

import { createClient } from "@/lib/supabase/server";
import { validateSlug, suggestSlug } from "@/lib/validators/slug";
import { PLAN_LIMITS } from "@/lib/constants";
import { redirect } from "next/navigation";
import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().min(2).max(64),
  slug: z.string().min(3).max(50),
});

export async function createTenant(formData: FormData) {
  const parsed = createTenantSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: "invalid_name" as const };
  }

  const slugValidation = validateSlug(parsed.data.slug);
  if (!slugValidation.valid) {
    return { error: "slug_reserved" as const, message: slugValidation.error };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  // Check store limit
  const { count } = await supabase
    .from("tenant_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "owner");

  if ((count ?? 0) >= PLAN_LIMITS.free.maxStores) {
    return { error: "limit_reached" as const };
  }

  // Check slug availability
  const { data: existing } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", parsed.data.slug)
    .single();

  if (existing) {
    return { error: "slug_taken" as const };
  }

  // Create tenant + membership in transaction
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: parsed.data.name, slug: parsed.data.slug })
    .select()
    .single();

  if (tenantError || !tenant) {
    return { error: "unknown_error" as const };
  }

  const { error: memberError } = await supabase
    .from("tenant_members")
    .insert({ user_id: user.id, tenant_id: tenant.id, role: "owner" });

  if (memberError) {
    // Rollback: delete orphaned tenant
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return { error: "unknown_error" as const };
  }

  redirect(`/store/${tenant.slug}/admin`);
}

export async function checkSlugAvailability(slug: string) {
  const validation = validateSlug(slug);
  if (!validation.valid) {
    return { available: false, error: validation.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return {
      available: false,
      suggestion: suggestSlug(slug),
    };
  }

  return { available: true };
}
