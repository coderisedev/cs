/**
 * Configuration Loader Tests
 *
 * Tests environment validation and loading functionality across all services.
 * Ensures services fail fast with helpful error messages when required variables are missing.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  loadStorefrontConfig,
  loadMedusaConfig,
  loadStrapiConfig,
  validateSecurityConfig,
  validateDatabaseConfig,
  ConfigurationError,
  isDevelopment,
  isProduction,
  getEnvironment,
} from '../index';

describe('Configuration Validation', () => {
  beforeEach(() => {
    // Store original environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = 'test';
  });

  describe('Storefront Configuration', () => {
    it('should load valid storefront configuration', () => {
      const env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_MEDUSA_URL: 'http://localhost:9000',
        NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'a'.repeat(32),
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client-id',
        NEXT_PUBLIC_PAYPAL_ENVIRONMENT: 'sandbox',
        NEXT_PUBLIC_DEFAULT_CURRENCY: 'USD',
        NEXT_PUBLIC_SUPPORTED_CURRENCIES: 'USD,EUR,GBP',
        NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
        NEXT_PUBLIC_ENABLE_ERROR_REPORTING: 'true',
        NEXT_PUBLIC_ENABLE_COMMUNITY_FEATURES: 'true',
        NEXT_PUBLIC_ENABLE_DARK_MODE: 'true',
        NEXT_PUBLIC_DEBUG_MODE: 'false',
        NEXT_PUBLIC_DEV_TOOLS: 'false',
      };

      const config = loadStorefrontConfig(env);
      expect(config.NEXT_PUBLIC_MEDUSA_URL).toBe('http://localhost:9000');
      expect(config.NEXTAUTH_SECRET).toBe('a'.repeat(32));
      expect(config.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
      expect(config.NEXT_PUBLIC_DEBUG_MODE).toBe(false);
    });

    it('should fail with missing required variables', () => {
      const env = {
        NODE_ENV: 'development',
        // Missing NEXT_PUBLIC_MEDUSA_URL
        NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'a'.repeat(32),
      };

      expect(() => loadStorefrontConfig(env)).toThrow(ConfigurationError);
    });

    it('should fail with invalid URLs', () => {
      const env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_MEDUSA_URL: 'invalid-url',
        NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'a'.repeat(32),
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client-id',
      };

      expect(() => loadStorefrontConfig(env)).toThrow(ConfigurationError);
    });

    it('should fail with short NEXTAUTH_SECRET', () => {
      const env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_MEDUSA_URL: 'http://localhost:9000',
        NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'short', // Too short
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client-id',
      };

      expect(() => loadStorefrontConfig(env)).toThrow(ConfigurationError);
    });

    it('should accept optional OAuth variables', () => {
      const env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_MEDUSA_URL: 'http://localhost:9000',
        NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'a'.repeat(32),
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
        NEXT_PUBLIC_SENTRY_DSN: 'https://test@sentry.io/123',
      };

      const config = loadStorefrontConfig(env);
      expect(config.GOOGLE_CLIENT_ID).toBe('google-client-id');
      expect(config.GOOGLE_CLIENT_SECRET).toBe('google-client-secret');
      expect(config.NEXT_PUBLIC_SENTRY_DSN).toBe('https://test@sentry.io/123');
    });
  });

  describe('Medusa Configuration', () => {
    it('should load valid Medusa configuration', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/medusa',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'a'.repeat(32),
        COOKIE_SECRET: 'a'.repeat(32),
        STORE_CORS: 'http://localhost:3000',
        ADMIN_CORS: 'http://localhost:7000,http://localhost:9000',
        AUTH_CORS: 'http://localhost:3000,http://localhost:9000',
        PAYPAL_CLIENT_ID: 'paypal-client-id',
        PAYPAL_CLIENT_SECRET: 'paypal-client-secret',
        ENABLE_PAYMENT_PROCESSING: 'true',
        ENABLE_EMAIL_NOTIFICATIONS: 'true',
      };

      const config = loadMedusaConfig(env);
      expect(config.DATABASE_URL).toBe('postgres://user:pass@localhost:5432/medusa');
      expect(config.JWT_SECRET).toBe('a'.repeat(32));
      expect(config.STORE_CORS).toEqual(['http://localhost:3000']);
      expect(config.ENABLE_PAYMENT_PROCESSING).toBe(true);
    });

    it('should fail with missing database configuration', () => {
      const env = {
        NODE_ENV: 'development',
        JWT_SECRET: 'a'.repeat(32),
        COOKIE_SECRET: 'a'.repeat(32),
        // Missing DATABASE_URL
      };

      expect(() => loadMedusaConfig(env)).toThrow(ConfigurationError);
    });

    it('should fail with insufficient CORS origins', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/medusa',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'a'.repeat(32),
        COOKIE_SECRET: 'a'.repeat(32),
        // Missing CORS origins
      };

      expect(() => loadMedusaConfig(env)).toThrow(ConfigurationError);
    });

    it('should fail with short security secrets', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/medusa',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'short', // Too short
        COOKIE_SECRET: 'short', // Too short
        STORE_CORS: 'http://localhost:3000',
        ADMIN_CORS: 'http://localhost:7000',
        AUTH_CORS: 'http://localhost:3000',
        PAYPAL_CLIENT_ID: 'paypal-client-id',
        PAYPAL_CLIENT_SECRET: 'paypal-client-secret',
      };

      expect(() => loadMedusaConfig(env)).toThrow(ConfigurationError);
    });
  });

  describe('Strapi Configuration', () => {
    it('should load valid Strapi configuration', () => {
      const env = {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '1337',
        APP_KEYS: `${'a,'.repeat(5)}a`, // 6 keys
        API_TOKEN_SALT: 'a'.repeat(16),
        ADMIN_JWT_SECRET: 'a'.repeat(32),
        TRANSFER_TOKEN_SALT: 'a'.repeat(16),
        JWT_SECRET: 'a'.repeat(32),
        ENCRYPTION_KEY: 'a'.repeat(32),
        DATABASE_CLIENT: 'postgres',
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: '5432',
        DATABASE_NAME: 'strapi',
        DATABASE_USERNAME: 'user',
        DATABASE_PASSWORD: 'pass',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/strapi',
        URL: 'http://localhost:1337',
        ADMIN_URL: 'http://localhost:1337',
        UPLOAD_PROVIDER: 'local',
        ENABLE_COMMUNITY_INTEGRATIONS: 'true',
        ENABLE_EMAIL_NOTIFICATIONS: 'true',
        ENABLE_SWAGGER: 'true',
      };

      const config = loadStrapiConfig(env);
      expect(config.APP_KEYS).toHaveLength(6);
      expect(config.ADMIN_JWT_SECRET).toBe('a'.repeat(32));
      expect(config.DATABASE_URL).toBe('postgres://user:pass@localhost:5432/strapi');
      expect(config.ENABLE_COMMUNITY_INTEGRATIONS).toBe(true);
    });

    it('should fail with insufficient APP_KEYS', () => {
      const env = {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '1337',
        APP_KEYS: 'a,b,c', // Only 3 keys, need 6
        API_TOKEN_SALT: 'a'.repeat(16),
        ADMIN_JWT_SECRET: 'a'.repeat(32),
        TRANSFER_TOKEN_SALT: 'a'.repeat(16),
        JWT_SECRET: 'a'.repeat(32),
        ENCRYPTION_KEY: 'a'.repeat(32),
        DATABASE_CLIENT: 'postgres',
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: '5432',
        DATABASE_NAME: 'strapi',
        DATABASE_USERNAME: 'user',
        DATABASE_PASSWORD: 'pass',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/strapi',
        URL: 'http://localhost:1337',
        ADMIN_URL: 'http://localhost:1337',
        UPLOAD_PROVIDER: 'local',
      };

      expect(() => loadStrapiConfig(env)).toThrow(ConfigurationError);
    });

    it('should fail with short security keys', () => {
      const env = {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '1337',
        APP_KEYS: `${'a,'.repeat(5)}a`, // 6 keys
        API_TOKEN_SALT: 'short', // Too short
        ADMIN_JWT_SECRET: 'short', // Too short
        TRANSFER_TOKEN_SALT: 'short', // Too short
        JWT_SECRET: 'short', // Too short
        ENCRYPTION_KEY: 'short', // Too short
        DATABASE_CLIENT: 'postgres',
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: '5432',
        DATABASE_NAME: 'strapi',
        DATABASE_USERNAME: 'user',
        DATABASE_PASSWORD: 'pass',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/strapi',
        URL: 'http://localhost:1337',
        ADMIN_URL: 'http://localhost:1337',
        UPLOAD_PROVIDER: 'local',
      };

      expect(() => loadStrapiConfig(env)).toThrow(ConfigurationError);
    });
  });

  describe('Security Validation', () => {
    it('should pass with valid security configuration', () => {
      const config = {
        jwtSecret: 'a'.repeat(32),
        cookieSecret: 'a'.repeat(32),
        nextAuthSecret: 'a'.repeat(32),
        encryptionKeys: ['a'.repeat(16), 'b'.repeat(16), 'c'.repeat(16)],
      };

      expect(() => validateSecurityConfig(config, 'TestService')).not.toThrow();
    });

    it('should fail with short JWT secret', () => {
      const config = {
        jwtSecret: 'short', // Too short
        cookieSecret: 'a'.repeat(32),
        nextAuthSecret: 'a'.repeat(32),
        encryptionKeys: ['a'.repeat(16)],
      };

      expect(() => validateSecurityConfig(config, 'TestService')).toThrow(ConfigurationError);
    });

    it('should fail with short encryption keys', () => {
      const config = {
        jwtSecret: 'a'.repeat(32),
        cookieSecret: 'a'.repeat(32),
        nextAuthSecret: 'a'.repeat(32),
        encryptionKeys: ['short', 'also-short'], // Too short
      };

      expect(() => validateSecurityConfig(config, 'TestService')).toThrow(ConfigurationError);
    });
  });

  describe('Database Validation', () => {
    it('should pass with complete DATABASE_URL', () => {
      const config = {
        databaseUrl: 'postgres://user:pass@localhost:5432/database',
      };

      expect(() => validateDatabaseConfig(config, 'TestService')).not.toThrow();
    });

    it('should pass with individual database parameters', () => {
      const config = {
        databaseHost: 'localhost',
        databasePort: 5432,
        databaseName: 'database',
        databaseUser: 'user',
        databasePassword: 'pass',
      };

      expect(() => validateDatabaseConfig(config, 'TestService')).not.toThrow();
    });

    it('should fail with incomplete database configuration', () => {
      const config = {
        databaseHost: 'localhost',
        databasePort: 5432,
        // Missing databaseName, databaseUser, databasePassword
      };

      expect(() => validateDatabaseConfig(config, 'TestService')).toThrow(ConfigurationError);
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('development');
    });

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(getEnvironment()).toBe('production');
    });

    it('should default to development when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('development');
    });

    it('should handle test environment', () => {
      process.env.NODE_ENV = 'test';
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('test');
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with service and validation details', () => {
      const error = new ConfigurationError(
        'Test error message',
        'TestService',
        ['MISSING_VAR1', 'MISSING_VAR2'],
        ['INVALID_VAR1: Invalid format']
      );

      expect(error.name).toBe('ConfigurationError');
      expect(error.message).toBe('Test error message');
      expect(error.service).toBe('TestService');
      expect(error.missing).toEqual(['MISSING_VAR1', 'MISSING_VAR2']);
      expect(error.invalid).toEqual(['INVALID_VAR1: Invalid format']);
    });
  });

  describe('Error Message Formatting', () => {
    it('should provide helpful error messages for missing storefront variables', () => {
      const env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'a'.repeat(32),
        // Missing NEXT_PUBLIC_MEDUSA_URL and other required variables
      };

      try {
        loadStorefrontConfig(env);
        fail('Expected ConfigurationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error.message).toContain('Storefront configuration validation failed');
        expect(error.message).toContain('Missing variables');
        expect(error.message).toContain('NEXT_PUBLIC_MEDUSA_URL');
        expect(error.message).toContain('💡 Tip: Copy apps/storefront/.env.local.example to .env.local');
      }
    });

    it('should provide helpful error messages for missing Medusa variables', () => {
      const env = {
        NODE_ENV: 'development',
        JWT_SECRET: 'a'.repeat(32),
        COOKIE_SECRET: 'a'.repeat(32),
        // Missing DATABASE_URL and CORS configuration
      };

      try {
        loadMedusaConfig(env);
        fail('Expected ConfigurationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error.message).toContain('Medusa configuration validation failed');
        expect(error.message).toContain('💡 Tip: Copy apps/medusa/.env.template to .env');
        expect(error.message).toContain('💡 Or run: tsx scripts/bootstrap.ts --env local');
      }
    });

    it('should provide helpful error messages for missing Strapi variables', () => {
      const env = {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '1337',
        // Missing APP_KEYS and security configuration
      };

      try {
        loadStrapiConfig(env);
        fail('Expected ConfigurationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error.message).toContain('Strapi configuration validation failed');
        expect(error.message).toContain('💡 Tip: Copy apps/strapi/.env.example to .env');
      }
    });
  });
});