import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { ICustomerModuleService, IAuthModuleService } from "@medusajs/framework/types"
import Redis from "ioredis"
import crypto from "crypto"
import { getOTPKey, type PendingVerification } from "../../../../../utils/otp"

interface CompleteBody {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

async function signJwtHS256(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" }
  const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url")
  const data = `${encode(header)}.${encode(payload)}`
  const signature = crypto.createHmac("sha256", secret).update(data).digest().toString("base64url")
  return `${data}.${signature}`
}

// Hash password using scrypt-kdf (same as Medusa's emailpass provider)
async function hashPasswordScrypt(password: string): Promise<string> {
  // Dynamic import for ESM module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scryptModule: any = await import("scrypt-kdf")
  // Use the same params as Medusa: logN=15, r=8, p=1
  const hash = await scryptModule.default.kdf(password, { logN: 15, r: 8, p: 1 })
  return Buffer.from(hash).toString("base64")
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as CompleteBody
    const { email, password, first_name, last_name, phone } = body

    // Validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        error: "Email, password, first name, and last name are required",
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const redisKey = getOTPKey(normalizedEmail)

    // Check if email was verified
    const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
    const redis = new Redis(redisUrl)
    const cachedData = await redis.get(redisKey)

    if (!cachedData) {
      await redis.quit()
      return res.status(400).json({
        error: "Email not verified or verification expired. Please start registration again.",
      })
    }

    const pendingData: PendingVerification = JSON.parse(cachedData)

    if (!pendingData.verified) {
      await redis.quit()
      return res.status(400).json({
        error: "Email not verified. Please verify your email first.",
      })
    }

    // Double-check email doesn't exist in customers
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const [existingCustomer] = await customerService.listCustomers(
      { email: normalizedEmail },
      { take: 1 }
    )

    if (existingCustomer) {
      await redis.del(redisKey)
      await redis.quit()
      return res.status(409).json({
        error: "An account with this email already exists.",
      })
    }

    // Create customer profile
    const customer = await customerService.createCustomers({
      email: normalizedEmail,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone?.trim() || undefined,
    })

    // Create auth identity and provider identity for emailpass login
    const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

    // Hash password in scrypt format
    const hashedPassword = await hashPasswordScrypt(password)

    // Create auth identity with customer_id in app_metadata
    const authIdentity = await authService.createAuthIdentities({
      app_metadata: {
        customer_id: customer.id,
      },
      provider_identities: [
        {
          entity_id: normalizedEmail,
          provider: "emailpass",
          provider_metadata: {
            password: hashedPassword,
          },
        },
      ],
    })

    // Clean up Redis data
    await redis.del(redisKey)
    await redis.quit()

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "supersecret"
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 7 // 7 days

    const token = await signJwtHS256(
      {
        actor_type: "customer",
        actor_id: customer.id,
        auth_identity_id: authIdentity.id,
        iat: now,
        exp,
        provider: "emailpass",
        email: normalizedEmail,
      },
      jwtSecret
    )

    console.log(`Account created for ${normalizedEmail} with auth identity ${authIdentity.id}`)

    return res.status(200).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    })
  } catch (error: unknown) {
    console.error("Registration complete error:", error)
    const message = error instanceof Error ? error.message : "Failed to complete registration"
    return res.status(500).json({ error: message })
  }
}
