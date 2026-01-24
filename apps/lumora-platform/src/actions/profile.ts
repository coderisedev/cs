"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(64).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function updateProfile(formData: FormData) {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { _form: ["Not authenticated"] } };
  }

  const updates: Record<string, string> = {};
  if (parsed.data.fullName) updates.full_name = parsed.data.fullName;
  if (parsed.data.avatarUrl) updates.avatar_url = parsed.data.avatarUrl;

  if (Object.keys(updates).length === 0) {
    return { error: { _form: ["No changes provided"] } };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { error: { _form: ["Failed to update profile"] } };
  }

  return { success: true };
}
