import path from "path"
import { defineConfig, loadEnv } from "@medusajs/framework/utils"

const projectRoot = path.resolve(__dirname, "..")

loadEnv(process.env.NODE_ENV || "development", projectRoot)

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://cs:cs@127.0.0.1:5432/medusa_local"
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
const STORE_CORS =
  process.env.STORE_CORS ??
  "http://localhost:8000,https://docs.medusajs.com"
const ADMIN_CORS =
  process.env.ADMIN_CORS ??
  "http://localhost:5173,http://localhost:9000,https://docs.medusajs.com"
const AUTH_CORS =
  process.env.AUTH_CORS ??
  "http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com"
const JWT_SECRET = process.env.JWT_SECRET ?? "supersecret"
const COOKIE_SECRET = process.env.COOKIE_SECRET ?? "supersecret"

export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },
})
