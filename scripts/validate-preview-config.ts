#!/usr/bin/env tsx

/**
 * Preview Environment Configuration Validator
 *
 * Validates that preview environments don't contain production-only secrets
 * or configurations that could be dangerous in preview deployments.
 *
 * Usage:
 *   tsx scripts/validate-preview-config.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const PRODUCTION_ONLY_PATTERNS = [
  // PayPal live environment
  /PAYPAL_ENVIRONMENT=live/i,
  /NEXT_PUBLIC_PAYPAL_ENVIRONMENT=live/i,

  // Production API keys/tokens
  /API_KEY.*=.*sk_live_/i,
  /SECRET_KEY.*=.*sk_live_/i,
  /WEBHOOK_SECRET.*=whsec_[a-zA-Z0-9_]{32,}/i,

  // Production database URLs
  /DATABASE_URL=.*prod.*database/i,
  /DATABASE_URL=.*production/i,

  // Production URLs
  /.*URL=.*\.com\/(?!staging|preview)/i,
  /.*URL=https:\/\/cs\.com/i,

  // Production credentials
  /CREDENTIALS=.*prod/i,
  /PASSWORD=.*prod/i,
  /TOKEN=.*prod/i,
];

const REQUIRED_PREVIEW_VARS = [
  'NEXT_PUBLIC_MEDUSA_URL',
  'NEXT_PUBLIC_STRAPI_URL',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_PAYPAL_ENVIRONMENT',
];

function validateEnvironmentFile(filePath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`Environment file not found: ${filePath}`);
    return result;
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check for production-only patterns
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      for (const pattern of PRODUCTION_ONLY_PATTERNS) {
        if (pattern.test(line)) {
          result.valid = false;
          result.errors.push(`Production-only configuration found: ${line.trim()}`);
        }
      }
    }
  }

  // Check for required preview variables
  const foundVars = new Set<string>();
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        foundVars.add(key.trim());
      }
    }
  }

  for (const requiredVar of REQUIRED_PREVIEW_VARS) {
    if (!foundVars.has(requiredVar)) {
      result.warnings.push(`Missing recommended variable: ${requiredVar}`);
    }
  }

  return result;
}

function main(): void {
  console.log('🔍 Validating preview environment configuration...\n');

  const environmentFiles = [
    join(projectRoot, 'apps/storefront/.env.preview'),
    join(projectRoot, 'apps/medusa/.env'),
    join(projectRoot, 'apps/strapi/.env'),
  ];

  let hasErrors = false;
  let hasWarnings = false;

  for (const filePath of environmentFiles) {
    const relativePath = filePath.replace(projectRoot + '/', '');
    console.log(`📁 Checking: ${relativePath}`);

    const result = validateEnvironmentFile(filePath);

    if (result.errors.length > 0) {
      hasErrors = true;
      console.log('  ❌ Errors:');
      result.errors.forEach(error => console.log(`    - ${error}`));
    }

    if (result.warnings.length > 0) {
      hasWarnings = true;
      console.log('  ⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`    - ${warning}`));
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('  ✅ No issues found');
    }

    console.log('');
  }

  if (hasErrors) {
    console.log('❌ **Validation Failed**');
    console.log('Production-only configurations found in preview environment.');
    console.log('Please remove or replace these with preview-safe values.');
    process.exit(1);
  }

  if (hasWarnings) {
    console.log('⚠️ **Validation Complete with Warnings**');
    console.log('Some recommended variables are missing, but configuration is safe.');
  } else {
    console.log('✅ **Validation Passed**');
    console.log('Preview environment configuration is safe and complete.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}