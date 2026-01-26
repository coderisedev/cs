import { Modules, defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://lumora:lumora@127.0.0.1:5433/lumora_medusa"
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6380"
const STORE_CORS = process.env.STORE_CORS ?? "http://localhost:3000"
const ADMIN_CORS =
  process.env.ADMIN_CORS ?? "http://localhost:9002,http://dev.aidenlux.com"
const AUTH_CORS = process.env.AUTH_CORS ?? "http://localhost:3000"
const JWT_SECRET = process.env.JWT_SECRET ?? "lumora-jwt-secret-dev"
const COOKIE_SECRET = process.env.COOKIE_SECRET ?? "lumora-cookie-secret-dev"

const STRIPE_API_KEY = process.env.STRIPE_API_KEY

export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      port: Number(process.env.PORT) || 9002,
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },
  admin: {
    backendUrl: "http://localhost:9002",
  },
  modules: {
    tenant: {
      resolve: "./src/modules/tenant",
    },
    [Modules.AUTH]: {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth/providers/emailpass",
            id: "emailpass",
            options: {},
          },
          {
            resolve: "./src/modules/auth-supabase",
            id: "supabase",
            options: {
              jwtSecret: process.env.SUPABASE_JWT_SECRET,
            },
          },
        ],
      },
    },
    [Modules.FULFILLMENT]: {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
            options: {},
          },
        ],
      },
    },
    ...(STRIPE_API_KEY
      ? {
          [Modules.PAYMENT]: {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: STRIPE_API_KEY,
                  },
                },
              ],
            },
          },
        }
      : {}),
  },
})
