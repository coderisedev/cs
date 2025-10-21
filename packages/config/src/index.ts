/**
 * Environment Configuration Loader and Validator
 *
 * Provides utilities for loading and validating environment variables across all services.
 * Ensures services fail fast with helpful errors when required variables are missing.
 */

import { z } from 'zod';
import {
  storefrontEnvironmentSchema,
  medusaEnvironmentSchema,
  strapiEnvironmentSchema,
  type StorefrontEnvironment,
  type MedusaEnvironment,
  type StrapiEnvironment,
} from './schemas';

/**
 * Configuration validation error class
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly service: string,
    public readonly missing: string[],
    public readonly invalid: string[]
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Validates environment variables against a schema
 */
function validateEnvironment<T>(
  schema: z.ZodSchema<T>,
  env: Record<string, string | undefined>,
  serviceName: string
): T {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues
        .filter((err: any) => err.code === 'invalid_type' && err.received === 'undefined')
        .map((err: any) => err.path.join('.'));

      const invalid = error.issues
        .filter((err: any) => err.code !== 'invalid_type' || err.received !== 'undefined')
        .map((err: any) => `${err.path.join('.')}: ${err.message}`);

      const message = `❌ ${serviceName} configuration validation failed:\n` +
        (missing.length > 0 ? `\nMissing variables:\n${missing.map(v => `  - ${v}`).join('\n')}` : '') +
        (invalid.length > 0 ? `\nInvalid variables:\n${invalid.map(v => `  - ${v}`).join('\n')}` : '') +
        `\n\nPlease check your environment configuration and try again.`;

      throw new ConfigurationError(message, serviceName, missing, invalid);
    }
    throw error;
  }
}

/**
 * Loads and validates storefront environment variables
 */
export function loadStorefrontConfig(env: Record<string, string | undefined> = process.env): StorefrontEnvironment {
  console.log('🔧 Loading storefront configuration...');

  try {
    const config = validateEnvironment(storefrontEnvironmentSchema, env, 'Storefront');
    console.log('✅ Storefront configuration loaded successfully');
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      console.error('\n💡 Tip: Copy apps/storefront/.env.local.example to .env.local and update the values');
    }
    throw error;
  }
}

/**
 * Loads and validates Medusa environment variables
 */
export function loadMedusaConfig(env: Record<string, string | undefined> = process.env): MedusaEnvironment {
  console.log('🔧 Loading Medusa configuration...');

  try {
    const config = validateEnvironment(medusaEnvironmentSchema, env, 'Medusa');
    console.log('✅ Medusa configuration loaded successfully');
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      console.error('\n💡 Tip: Copy apps/medusa/.env.template to .env and update the values');
      console.error('💡 Or run: tsx scripts/bootstrap.ts --env local');
    }
    throw error;
  }
}

/**
 * Loads and validates Strapi environment variables
 */
export function loadStrapiConfig(env: Record<string, string | undefined> = process.env): StrapiEnvironment {
  console.log('🔧 Loading Strapi configuration...');

  try {
    const config = validateEnvironment(strapiEnvironmentSchema, env, 'Strapi');
    console.log('✅ Strapi configuration loaded successfully');
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      console.error('\n💡 Tip: Copy apps/strapi/.env.example to .env and update the values');
      console.error('💡 Or run: tsx scripts/bootstrap.ts --env local');
    }
    throw error;
  }
}

/**
 * Validates critical security variables
 */
export function validateSecurityConfig(config: {
  jwtSecret?: string;
  cookieSecret?: string;
  nextAuthSecret?: string;
  encryptionKeys?: string[];
}, serviceName: string): void {
  const issues: string[] = [];

  if (config.jwtSecret && config.jwtSecret.length < 32) {
    issues.push('JWT_SECRET must be at least 32 characters');
  }

  if (config.cookieSecret && config.cookieSecret.length < 32) {
    issues.push('COOKIE_SECRET must be at least 32 characters');
  }

  if (config.nextAuthSecret && config.nextAuthSecret.length < 32) {
    issues.push('NEXTAUTH_SECRET must be at least 32 characters');
  }

  if (config.encryptionKeys && config.encryptionKeys.some(key => key.length < 16)) {
    issues.push('All APP_KEYS must be at least 16 characters');
  }

  if (issues.length > 0) {
    const message = `🔒 ${serviceName} security configuration issues:\n${issues.map(issue => `  - ${issue}`).join('\n')}\n\n` +
      'Generate secure secrets with:\n' +
      '  openssl rand -base64 32\n' +
      '  openssl rand -hex 32\n' +
      '  or use your password manager';

    console.error(message);
    throw new ConfigurationError(message, serviceName, [], issues);
  }
}

/**
 * Checks if we're in a development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
}

/**
 * Checks if we're in a production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Gets the current environment name with fallback
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Validates required database connection variables
 */
export function validateDatabaseConfig(config: {
  databaseUrl?: string;
  databaseHost?: string;
  databasePort?: number;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
}, serviceName: string): void {
  const missing: string[] = [];

  if (!config.databaseUrl) {
    if (!config.databaseHost) missing.push('DATABASE_HOST');
    if (!config.databasePort) missing.push('DATABASE_PORT');
    if (!config.databaseName) missing.push('DATABASE_NAME');
    if (!config.databaseUser) missing.push('DATABASE_USER');
    if (!config.databasePassword) missing.push('DATABASE_PASSWORD');
  }

  if (missing.length > 0) {
    const message = `🗄️ ${serviceName} database configuration incomplete:\nMissing: ${missing.join(', ')}\n\n` +
      'Provide either DATABASE_URL or individual database parameters.';

    console.error(message);
    throw new ConfigurationError(message, serviceName, missing, []);
  }
}

/**
 * Export all utilities and schemas
 */
export * from './schemas';