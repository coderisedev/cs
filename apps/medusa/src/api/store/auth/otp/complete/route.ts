import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { ICustomerModuleService, IAuthModuleService } from "@medusajs/framework/types"
import crypto from "crypto"
import { getAuthOTPKey, type PendingAuthVerification } from "../../../../../utils/otp"
import { withDedicatedRedis, safeJsonParse } from "../../../../../utils/redis"
import { logger, getClientErrorMessage } from "../../../../../utils/logger"
import { getJwtSecret } from "../../../../../utils/env"

interface CompleteBody {
  email: string
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

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as CompleteBody
    const { email, first_name, last_name, phone } = body

    if (!email || !first_name || !last_name) {
      return res.status(400).json({
        error: "Email, first name, and last name are required",
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const redisKey = getAuthOTPKey(normalizedEmail)

    const result = await withDedicatedRedis(async (redis) => {
      const cachedData = await redis.get(redisKey)

      if (!cachedData) {
        return {
          status: 400,
          body: { error: "Verification expired. Please start again." },
        }
      }

      const pendingData = safeJsonParse<PendingAuthVerification>(cachedData)
      if (!pendingData) {
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Verification data corrupted. Please start again." },
        }
      }

      if (!pendingData.verified || !pendingData.isNewUser) {
        return {
          status: 400,
          body: { error: "Email not verified or not a new user. Please start again." },
        }
      }

      // Double-check no customer exists with this email
      const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
      const [existingCustomer] = await customerService.listCustomers(
        { email: normalizedEmail },
        { take: 1 }
      )

      if (existingCustomer) {
        await redis.del(redisKey)
        return {
          status: 409,
          body: { error: "An account with this email already exists." },
        }
      }

      // Create customer (no password)
      const customer = await customerService.createCustomers({
        email: normalizedEmail,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone: phone?.trim() || undefined,
      })

      // Create auth_identity with email-otp provider (no password)
      const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

      const authIdentity = await authService.createAuthIdentities({
        app_metadata: {
          customer_id: customer.id,
        },
        provider_identities: [
          {
            entity_id: normalizedEmail,
            provider: "email-otp",
            provider_metadata: {},
          },
        ],
      })

      // Clean up Redis
      await redis.del(redisKey)

      // Generate JWT
      const jwtSecret = getJwtSecret()
      const now = Math.floor(Date.now() / 1000)
      const exp = now + 60 * 60 * 24 * 7 // 7 days

      const token = await signJwtHS256(
        {
          actor_type: "customer",
          actor_id: customer.id,
          auth_identity_id: authIdentity.id,
          iat: now,
          exp,
          provider: "email-otp",
          email: normalizedEmail,
        },
        jwtSecret
      )

      logger.debug("New account created via OTP", { customerId: customer.id })

      return {
        status: 200,
        body: {
          success: true,
          token,
          customer: {
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
          },
        },
      }
    })

    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    logger.error("Auth OTP complete error", error)
    return res.status(500).json({
      error: getClientErrorMessage(error, "Failed to complete profile"),
    })
  }
}
