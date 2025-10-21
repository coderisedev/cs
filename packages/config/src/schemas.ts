/**
 * Environment Configuration Schemas
 *
 * Defines Zod schemas for validating environment variables across all services.
 * These schemas ensure required variables are present and properly formatted.
 */

import { z } from 'zod';

/**
 * Base environment schema with common validations
 */
const baseEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DEBUG_MODE: z.string().transform((val) => val === 'true').default(false),
  ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default(true),
  ENABLE_ERROR_REPORTING: z.string().transform((val) => val === 'true').default(true),
});

/**
 * Storefront environment schema
 */
export const storefrontEnvironmentSchema = baseEnvironmentSchema.extend({
  // Service URLs
  NEXT_PUBLIC_MEDUSA_URL: z.string().url('Invalid MEDUSA_URL format'),
  NEXT_PUBLIC_STRAPI_URL: z.string().url('Invalid STRAPI_URL format'),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL format'),

  // Optional OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Analytics (optional)
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Invalid Sentry DSN format').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().optional(),

  // E-commerce
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().length(3, 'Invalid currency code').default('USD'),
  NEXT_PUBLIC_SUPPORTED_CURRENCIES: z.string().transform((val) => val.split(',')).default(['USD', 'EUR', 'GBP']),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().min(1, 'PayPal Client ID is required'),
  NEXT_PUBLIC_PAYPAL_ENVIRONMENT: z.enum(['sandbox', 'live']).default('sandbox'),

  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default(true),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform((val) => val === 'true').default(true),
  NEXT_PUBLIC_ENABLE_COMMUNITY_FEATURES: z.string().transform((val) => val === 'true').default(true),
  NEXT_PUBLIC_ENABLE_DARK_MODE: z.string().transform((val) => val === 'true').default(true),
  NEXT_PUBLIC_DEBUG_MODE: z.string().transform((val) => val === 'true').default(false),
  NEXT_PUBLIC_DEV_TOOLS: z.string().transform((val) => val === 'true').default(false),
});

/**
 * Medusa environment schema
 */
export const medusaEnvironmentSchema = baseEnvironmentSchema.extend({
  // Application
  MEDUSA_ADMIN_ONBOARDING_TYPE: z.string().default('default'),

  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),
  PGHOST: z.string().min(1, 'Database host is required'),
  PGPORT: z.string().default('5432'),
  PGUSER: z.string().min(1, 'Database user is required'),
  PGPASSWORD: z.string().min(1, 'Database password is required'),
  PGDATABASE: z.string().min(1, 'Database name is required'),
  DB_NAME: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url('Invalid REDIS_URL format'),

  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),

  // CORS
  STORE_CORS: z.string().min(1, 'Store CORS is required'),
  ADMIN_CORS: z.string().min(1, 'Admin CORS is required'),
  AUTH_CORS: z.string().min(1, 'Auth CORS is required'),

  // Payment providers
  PAYPAL_CLIENT_ID: z.string().min(1, 'PayPal Client ID is required'),
  PAYPAL_CLIENT_SECRET: z.string().min(1, 'PayPal Client Secret is required'),
  PAYPAL_ENVIRONMENT: z.enum(['sandbox', 'live']).default('sandbox'),
  STRIPE_API_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email('Invalid SendGrid from email').optional(),
  SENDGRID_FROM_NAME: z.string().optional(),

  // Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url('Invalid R2 public URL format').optional(),

  // Monitoring
  SENTRY_DSN: z.string().url('Invalid Sentry DSN format').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Feature flags
  ENABLE_PAYMENT_PROCESSING: z.string().transform((val) => val === 'true').default(true),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform((val) => val === 'true').default(true),
  ENABLE_SWAGGER: z.string().transform((val) => val === 'true').default(false),
});

/**
 * Strapi environment schema
 */
export const strapiEnvironmentSchema = baseEnvironmentSchema.extend({
  // Server
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().default('1337'),

  // Security (critical)
  APP_KEYS: z.string().min(1, 'APP_KEYS are required'),
  API_TOKEN_SALT: z.string().min(16, 'API_TOKEN_SALT must be at least 16 characters'),
  ADMIN_JWT_SECRET: z.string().min(32, 'ADMIN_JWT_SECRET must be at least 32 characters'),
  TRANSFER_TOKEN_SALT: z.string().min(16, 'TRANSFER_TOKEN_SALT must be at least 16 characters'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),

  // Database
  DATABASE_CLIENT: z.string().default('postgres'),
  DATABASE_HOST: z.string().min(1, 'Database host is required'),
  DATABASE_PORT: z.string().default('5432'),
  DATABASE_NAME: z.string().min(1, 'Database name is required'),
  DATABASE_USERNAME: z.string().min(1, 'Database user is required'),
  DATABASE_PASSWORD: z.string().min(1, 'Database password is required'),
  DATABASE_SSL: z.string().transform((val) => val === 'true').default(false),
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),

  // CORS
  URL: z.string().url('Invalid Strapi URL format'),
  ADMIN_URL: z.string().url('Invalid admin URL format'),

  // Storage
  UPLOAD_PROVIDER: z.enum(['local', 'r2', 's3']).default('local'),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url('Invalid R2 public URL format').optional(),

  // Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email('Invalid SendGrid from email').optional(),
  SENDGRID_FROM_NAME: z.string().optional(),
  EMAIL_DEFAULT_FROM: z.string().email('Invalid default from email').optional(),
  EMAIL_DEFAULT_FROM_NAME: z.string().optional(),
  EMAIL_DEFAULT_REPLY_TO: z.string().email('Invalid reply-to email').optional(),

  // Integrations
  DISCORD_WEBHOOK_URL: z.string().url('Invalid Discord webhook URL').optional(),
  SLACK_WEBHOOK_URL: z.string().url('Invalid Slack webhook URL').optional(),

  // Monitoring
  SENTRY_DSN: z.string().url('Invalid Sentry DSN format').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Feature flags
  ENABLE_COMMUNITY_INTEGRATIONS: z.string().transform((val) => val === 'true').default(true),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform((val) => val === 'true').default(true),
  ENABLE_SWAGGER: z.string().transform((val) => val === 'true').default(false),
});

/**
 * Environment types
 */
export type StorefrontEnvironment = z.infer<typeof storefrontEnvironmentSchema>;
export type MedusaEnvironment = z.infer<typeof medusaEnvironmentSchema>;
export type StrapiEnvironment = z.infer<typeof strapiEnvironmentSchema>;