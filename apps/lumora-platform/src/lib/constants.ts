export const PLAN_LIMITS = {
  free: {
    maxStores: 3,
    aiImagesPerMonth: 10,
    aiTokensPerMonth: 50_000,
  },
  pro: {
    maxStores: 20,
    aiImagesPerMonth: 100,
    aiTokensPerMonth: 500_000,
  },
  enterprise: {
    maxStores: Infinity,
    aiImagesPerMonth: Infinity,
    aiTokensPerMonth: Infinity,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export const ERROR_MESSAGES = {
  email_taken: "An account with this email already exists",
  weak_password: "Password must be at least 8 characters with uppercase, lowercase, and a number",
  invalid_credentials: "Invalid email or password",
  email_not_confirmed: "Please verify your email address first",
  rate_limited: "Too many attempts. Please try again later.",
  slug_taken: "This store address is already taken",
  slug_reserved: "This address is reserved by the system",
  invalid_name: "Store name must be 2-64 characters",
  limit_reached: "You've reached the maximum number of stores for your plan. Upgrade to create more.",
  network_error: "Network error. Please try again.",
  unknown_error: "Something went wrong. Please try again.",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;
