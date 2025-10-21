#!/usr/bin/env tsx

/**
 * Environment Bootstrap Script
 *
 * Generates environment-specific configuration files from templates.
 *
 * Usage:
 *   tsx scripts/bootstrap.ts --env <target>
 *
 * Targets:
 *   - local: Local development environment
 *   - preview: Vercel preview deployments
 *   - staging: Staging environment
 *   - production: Production environment
 *
 * Examples:
 *   tsx scripts/bootstrap.ts --env local
 *   tsx scripts/bootstrap.ts --env preview
 *   tsx scripts/bootstrap.ts --env staging
 *   tsx scripts/bootstrap.ts --env production
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface EnvironmentConfig {
  name: string;
  storefront: {
    medusaUrl: string;
    strapiUrl: string;
    nextAuthUrl: string;
    paypalEnv: string;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enableDebugMode: boolean;
  };
  medusa: {
    databaseUrl: string;
    redisUrl: string;
    cors: {
      store: string[];
      admin: string[];
      auth: string[];
    };
    paypalEnv: string;
    enableStripe: boolean;
    enablePaymentProcessing: boolean;
    enableEmailNotifications: boolean;
    enableSwaggr: boolean;
  };
  strapi: {
    databaseUrl: string;
    url: string;
    adminUrl: string;
    uploadProvider: string;
    r2PublicUrl: string;
    enableCommunityIntegrations: boolean;
    enableEmailNotifications: boolean;
    enableSwagger: boolean;
  };
}

// Environment configurations
const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'Local Development',
    storefront: {
      medusaUrl: 'http://localhost:9000',
      strapiUrl: 'http://localhost:1337',
      nextAuthUrl: 'http://localhost:3000',
      paypalEnv: 'sandbox',
      enableAnalytics: false,
      enableErrorReporting: false,
      enableDebugMode: false,
    },
    medusa: {
      databaseUrl: 'postgres://cs:cs@127.0.0.1:5432/medusa_local',
      redisUrl: 'redis://127.0.0.1:6379',
      cors: {
        store: ['http://localhost:3000'],
        admin: ['http://localhost:7000', 'http://localhost:9000'],
        auth: ['http://localhost:3000', 'http://localhost:9000'],
      },
      paypalEnv: 'sandbox',
      enableStripe: false,
      enablePaymentProcessing: false,
      enableEmailNotifications: false,
      enableSwaggr: true,
    },
    strapi: {
      databaseUrl: 'postgres://cs:cs@127.0.0.1:5432/strapi_local',
      url: 'http://localhost:1337',
      adminUrl: 'http://localhost:1337',
      uploadProvider: 'local',
      r2PublicUrl: 'http://localhost:1337/uploads',
      enableCommunityIntegrations: false,
      enableEmailNotifications: false,
      enableSwagger: true,
    },
  },
  preview: {
    name: 'Preview Environment',
    storefront: {
      medusaUrl: 'https://api-preview.cs.com',
      strapiUrl: 'https://content-preview.cs.com',
      nextAuthUrl: 'https://cs-preview.vercel.app',
      paypalEnv: 'sandbox',
      enableAnalytics: true,
      enableErrorReporting: true,
      enableDebugMode: false,
    },
    medusa: {
      databaseUrl: '${DATABASE_URL}', // From Pulumi/Railway (staging database)
      redisUrl: '${REDIS_URL}', // From Pulumi/Railway (staging redis)
      cors: {
        store: ['https://cs-preview.vercel.app'],
        admin: ['https://medusa-preview.cs.com'],
        auth: ['https://cs-preview.vercel.app'],
      },
      paypalEnv: 'sandbox',
      enableStripe: false, // Disabled in preview for security
      enablePaymentProcessing: false, // Disabled in preview - use test mode only
      enableEmailNotifications: false, // Disabled in preview to avoid spam
      enableSwaggr: false,
    },
    strapi: {
      databaseUrl: '${DATABASE_URL}', // From Pulumi/Railway (staging database)
      url: 'https://content-preview.cs.com',
      adminUrl: 'https://content-preview.cs.com',
      uploadProvider: 'local', // Use local storage in preview
      r2PublicUrl: 'https://media-preview.cs.com',
      enableCommunityIntegrations: false, // Disabled in preview
      enableEmailNotifications: false, // Disabled in preview to avoid spam
      enableSwagger: false,
    },
  },
  staging: {
    name: 'Staging Environment',
    storefront: {
      medusaUrl: 'https://api-staging.cs.com',
      strapiUrl: 'https://content-staging.cs.com',
      nextAuthUrl: 'https://cs-staging.vercel.app',
      paypalEnv: 'sandbox',
      enableAnalytics: true,
      enableErrorReporting: true,
      enableDebugMode: false,
    },
    medusa: {
      databaseUrl: '${DATABASE_URL}', // From Pulumi/Railway
      redisUrl: '${REDIS_URL}', // From Pulumi/Railway
      cors: {
        store: ['https://cs-staging.vercel.app'],
        admin: ['https://medusa-staging.cs.com'],
        auth: ['https://cs-staging.vercel.app'],
      },
      paypalEnv: 'sandbox',
      enableStripe: true,
      enablePaymentProcessing: true,
      enableEmailNotifications: true,
      enableSwaggr: false,
    },
    strapi: {
      databaseUrl: '${DATABASE_URL}', // From Pulumi/Railway
      url: 'https://content-staging.cs.com',
      adminUrl: 'https://content-staging.cs.com',
      uploadProvider: 'r2',
      r2PublicUrl: 'https://media-staging.cs.com',
      enableCommunityIntegrations: true,
      enableEmailNotifications: true,
      enableSwagger: false,
    },
  },
  production: {
    name: 'Production Environment',
    storefront: {
      medusaUrl: 'https://api.cs.com',
      strapiUrl: 'https://content.cs.com',
      nextAuthUrl: 'https://cs.com',
      paypalEnv: 'live',
      enableAnalytics: true,
      enableErrorReporting: true,
      enableDebugMode: false,
    },
    medusa: {
      databaseUrl: '${DATABASE_URL}', // From Pulumi/Railway
      redisUrl: '${REDIS_URL}', // From Pulumi/Railway
      cors: {
        store: ['https://cs.com'],
        admin: ['https://medusa.cs.com'],
        auth: ['https://cs.com'],
      },
      paypalEnv: 'live',
      enableStripe: true,
      enablePaymentProcessing: true,
      enableEmailNotifications: true,
      enableSwaggr: false,
    },
    strapi: {
      databaseUrl: '${DATABASE_URL}', // From Pulumi/Railway
      url: 'https://content.cs.com',
      adminUrl: 'https://content.cs.com',
      uploadProvider: 'r2',
      r2PublicUrl: 'https://media.cs.com',
      enableCommunityIntegrations: true,
      enableEmailNotifications: true,
      enableSwagger: false,
    },
  },
};

function parseArguments(): { env: string } {
  const args = process.argv.slice(2);
  const envIndex = args.findIndex(arg => arg === '--env');

  if (envIndex === -1 || args.length <= envIndex + 1) {
    console.error('❌ Error: --env argument is required');
    console.error('\nUsage: tsx scripts/bootstrap.ts --env <target>');
    console.error('\nTargets: local, preview, staging, production');
    process.exit(1);
  }

  const env = args[envIndex + 1];
  if (!environments[env]) {
    console.error(`❌ Error: Unknown environment "${env}"`);
    console.error('\nValid targets: local, preview, staging, production');
    process.exit(1);
  }

  return { env };
}

function replaceEnvironmentVariables(content: string, config: EnvironmentConfig): string {
  let result = content;

  // Storefront replacements
  result = result.replace(/NEXT_PUBLIC_MEDUSA_URL=.*/g, `NEXT_PUBLIC_MEDUSA_URL=${config.storefront.medusaUrl}`);
  result = result.replace(/NEXT_PUBLIC_STRAPI_URL=.*/g, `NEXT_PUBLIC_STRAPI_URL=${config.storefront.strapiUrl}`);
  result = result.replace(/NEXTAUTH_URL=.*/g, `NEXTAUTH_URL=${config.storefront.nextAuthUrl}`);
  result = result.replace(/NEXT_PUBLIC_PAYPAL_ENVIRONMENT=.*/g, `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=${config.storefront.paypalEnv}`);
  result = result.replace(/NEXT_PUBLIC_ENABLE_ANALYTICS=.*/g, `NEXT_PUBLIC_ENABLE_ANALYTICS=${config.storefront.enableAnalytics}`);
  result = result.replace(/NEXT_PUBLIC_ENABLE_ERROR_REPORTING=.*/g, `NEXT_PUBLIC_ENABLE_ERROR_REPORTING=${config.storefront.enableErrorReporting}`);
  result = result.replace(/NEXT_PUBLIC_DEBUG_MODE=.*/g, `NEXT_PUBLIC_DEBUG_MODE=${config.storefront.enableDebugMode}`);

  // Medusa replacements
  result = result.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${config.medusa.databaseUrl}`);
  result = result.replace(/REDIS_URL=.*/g, `REDIS_URL=${config.medusa.redisUrl}`);
  result = result.replace(/STORE_CORS=.*/g, `STORE_CORS=${config.medusa.cors.store.join(',')}`);
  result = result.replace(/ADMIN_CORS=.*/g, `ADMIN_CORS=${config.medusa.cors.admin.join(',')}`);
  result = result.replace(/AUTH_CORS=.*/g, `AUTH_CORS=${config.medusa.cors.auth.join(',')}`);
  result = result.replace(/PAYPAL_ENVIRONMENT=.*/g, `PAYPAL_ENVIRONMENT=${config.medusa.paypalEnv}`);
  result = result.replace(/ENABLE_PAYMENT_PROCESSING=.*/g, `ENABLE_PAYMENT_PROCESSING=${config.medusa.enablePaymentProcessing}`);
  result = result.replace(/ENABLE_EMAIL_NOTIFICATIONS=.*/g, `ENABLE_EMAIL_NOTIFICATIONS=${config.medusa.enableEmailNotifications}`);
  result = result.replace(/ENABLE_SWAGGER=.*/g, `ENABLE_SWAGGER=${config.medusa.enableSwaggr}`);

  // Strapi replacements
  result = result.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${config.strapi.databaseUrl}`);
  result = result.replace(/URL=.*/g, `URL=${config.strapi.url}`);
  result = result.replace(/ADMIN_URL=.*/g, `ADMIN_URL=${config.strapi.adminUrl}`);
  result = result.replace(/UPLOAD_PROVIDER=.*/g, `UPLOAD_PROVIDER=${config.strapi.uploadProvider}`);
  result = result.replace(/R2_PUBLIC_URL=.*/g, `R2_PUBLIC_URL=${config.strapi.r2PublicUrl}`);
  result = result.replace(/ENABLE_COMMUNITY_INTEGRATIONS=.*/g, `ENABLE_COMMUNITY_INTEGRATIONS=${config.strapi.enableCommunityIntegrations}`);
  result = result.replace(/ENABLE_EMAIL_NOTIFICATIONS=.*/g, `ENABLE_EMAIL_NOTIFICATIONS=${config.strapi.enableEmailNotifications}`);
  result = result.replace(/ENABLE_SWAGGER=.*/g, `ENABLE_SWAGGER=${config.strapi.enableSwagger}`);

  return result;
}

function generateEnvironmentFile(targetEnv: string): void {
  const config = environments[targetEnv];
  console.log(`🚀 Bootstrapping ${config.name}...`);

  // Generate storefront environment file
  const storefrontTemplate = readFileSync(join(projectRoot, 'apps/storefront/.env.local.example'), 'utf8');
  const storefrontContent = replaceEnvironmentVariables(storefrontTemplate, config);
  const storefrontOutput = join(projectRoot, 'apps/storefront', `.env.${targetEnv === 'local' ? 'local' : targetEnv}`);
  writeFileSync(storefrontOutput, storefrontContent);
  console.log(`✅ Created: ${storefrontOutput}`);

  // Generate Medusa environment file
  const medusaTemplate = readFileSync(join(projectRoot, 'apps/medusa/.env.template'), 'utf8');
  const medusaContent = replaceEnvironmentVariables(medusaTemplate, config);
  const medusaOutput = join(projectRoot, 'apps/medusa', '.env');
  writeFileSync(medusaOutput, medusaContent);
  console.log(`✅ Created: ${medusaOutput}`);

  // Generate Strapi environment file
  const strapiTemplate = readFileSync(join(projectRoot, 'apps/strapi/.env.example'), 'utf8');
  const strapiContent = replaceEnvironmentVariables(strapiTemplate, config);
  const strapiOutput = join(projectRoot, 'apps/strapi', '.env');
  writeFileSync(strapiOutput, strapiContent);
  console.log(`✅ Created: ${strapiOutput}`);

  console.log(`\n🎉 ${config.name} bootstrap complete!`);
  console.log('\n📋 Next steps:');
  console.log('1. Update sensitive values (secrets, API keys) in the generated files');
  console.log('2. Store secrets in your secret manager (1Password, Pulumi config, etc.)');
  console.log('3. Configure CI/CD pipelines to inject secrets during deployment');

  if (targetEnv === 'local') {
    console.log('\n🔧 Local development:');
    console.log('   - Start databases: docker compose -f docker-compose.local.yml up -d');
    console.log('   - Install dependencies: pnpm install');
    console.log('   - Start services: pnpm --filter storefront dev');
  }
}

function main(): void {
  try {
    const { env } = parseArguments();

    // Validate template files exist
    const requiredTemplates = [
      'apps/storefront/.env.local.example',
      'apps/medusa/.env.template',
      'apps/strapi/.env.example',
    ];

    for (const template of requiredTemplates) {
      if (!existsSync(join(projectRoot, template))) {
        console.error(`❌ Error: Template file not found: ${template}`);
        process.exit(1);
      }
    }

    generateEnvironmentFile(env);

  } catch (error) {
    console.error('❌ Bootstrap failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}