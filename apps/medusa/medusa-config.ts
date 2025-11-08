import path from "path"
import { Modules, defineConfig, loadEnv } from "@medusajs/framework/utils"

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
const AWS_ACCESS_KEY_ID =
  process.env.MEDUSA_FILE_ACCESS_KEY_ID ??
  process.env.AWS_ACCESS_KEY_ID ??
  process.env.R2_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY =
  process.env.MEDUSA_FILE_SECRET_ACCESS_KEY ??
  process.env.AWS_SECRET_ACCESS_KEY ??
  process.env.AWS_ACCESS_SECRET ??
  process.env.R2_SECRET_ACCESS_KEY
const AWS_BUCKET_NAME =
  process.env.MEDUSA_FILE_BUCKET ??
  process.env.AWS_BUCKET_NAME ??
  process.env.R2_BUCKET_NAME ??
  "cstrapi"
const AWS_REGION =
  process.env.MEDUSA_FILE_REGION ?? process.env.AWS_REGION ?? "auto"
const AWS_ENDPOINT =
  process.env.MEDUSA_FILE_ENDPOINT ??
  process.env.AWS_ENDPOINT ??
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined)
const AWS_PUBLIC_URL = (
  process.env.MEDUSA_FILE_PUBLIC_URL ??
  process.env.AWS_PUBLIC_URL ??
  process.env.R2_PUBLIC_URL ??
  "https://img.aidenlux.com"
).replace(/\/+$/, "")
const FILE_PREFIX_RAW =
  process.env.MEDUSA_FILE_PREFIX ?? "medusa-uploads/"
const FILE_PREFIX = FILE_PREFIX_RAW.endsWith("/")
  ? FILE_PREFIX_RAW
  : `${FILE_PREFIX_RAW}/`
const DOWNLOAD_TTL = process.env.MEDUSA_FILE_DOWNLOAD_TTL
  ? Number(process.env.MEDUSA_FILE_DOWNLOAD_TTL)
  : undefined
const CACHE_CONTROL = process.env.MEDUSA_FILE_CACHE_CONTROL
const FORCE_PATH_STYLE =
  (
    process.env.MEDUSA_FILE_FORCE_PATH_STYLE ??
    process.env.AWS_FORCE_PATH_STYLE ??
    "true"
  ).toLowerCase() === "true"

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
  modules: {
    [Modules.FILE]: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            id: "r2-file-storage",
            resolve: "@medusajs/file-s3",
            options: {
              access_key_id: AWS_ACCESS_KEY_ID,
              secret_access_key: AWS_SECRET_ACCESS_KEY,
              bucket: AWS_BUCKET_NAME,
              region: AWS_REGION,
              endpoint: AWS_ENDPOINT,
              file_url: AWS_PUBLIC_URL,
              prefix: FILE_PREFIX,
              cache_control: CACHE_CONTROL,
              download_file_duration: DOWNLOAD_TTL,
              additional_client_config: {
                forcePathStyle: FORCE_PATH_STYLE,
              },
            },
          },
        ],
      },
    },
  },
})
