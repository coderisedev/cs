export const RESERVED_SLUGS = new Set([
  "app",
  "api",
  "www",
  "admin",
  "store",
  "help",
  "support",
  "blog",
  "docs",
  "status",
  "billing",
  "login",
  "register",
  "onboarding",
  "dashboard",
  "settings",
  "new",
  "create",
]);

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function validateSlug(slug: string): {
  valid: boolean;
  error?: string;
} {
  if (!slug) {
    return { valid: false, error: "Slug is required" };
  }

  if (slug.length < 3) {
    return { valid: false, error: "At least 3 characters" };
  }

  if (slug.length > 50) {
    return { valid: false, error: "Maximum 50 characters" };
  }

  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      error: "Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.",
    };
  }

  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: "This address is reserved" };
  }

  return { valid: true };
}

export function suggestSlug(slug: string, attempt = 1): string {
  return `${slug}-${attempt}`;
}
