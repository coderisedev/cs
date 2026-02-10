import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { ICustomerModuleService, IAuthModuleService } from "@medusajs/framework/types"
import crypto from "crypto"
import {
  getAuthOTPKey,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_SECONDS,
  type PendingAuthVerification,
} from "../../../../../utils/otp"
import { withDedicatedRedis, safeJsonParse } from "../../../../../utils/redis"
import { logger, getClientErrorMessage } from "../../../../../utils/logger"
import { getJwtSecret } from "../../../../../utils/env"

interface VerifyBody {
  email: string
  otp: string
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
    const body = req.body as VerifyBody
    const { email, otp } = body

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and verification code are required",
      })
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "Please enter a valid 6-digit code",
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const redisKey = getAuthOTPKey(normalizedEmail)

    const result = await withDedicatedRedis(async (redis) => {
      const cachedData = await redis.get(redisKey)

      if (!cachedData) {
        return {
          status: 400,
          body: { error: "Verification code expired or invalid. Please request a new code." },
        }
      }

      const pendingData = safeJsonParse<PendingAuthVerification>(cachedData)
      if (!pendingData) {
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Verification data corrupted. Please request a new code." },
        }
      }

      // Check attempts
      if (pendingData.attempts >= MAX_OTP_ATTEMPTS) {
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Too many failed attempts. Please request a new code." },
        }
      }

      // Verify OTP
      if (pendingData.otp !== otp) {
        pendingData.attempts += 1

        if (pendingData.attempts >= MAX_OTP_ATTEMPTS) {
          await redis.del(redisKey)
          return {
            status: 400,
            body: { error: "Too many failed attempts. Please request a new code." },
          }
        }

        const ttl = await redis.ttl(redisKey)
        await redis.setex(redisKey, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))

        const remaining = MAX_OTP_ATTEMPTS - pendingData.attempts
        return {
          status: 400,
          body: { error: `Invalid verification code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        }
      }

      // OTP verified — handle existing vs new user
      if (!pendingData.isNewUser) {
        // Existing user: find customer, ensure auth_identity, return JWT
        const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
        const [customer] = await customerService.listCustomers(
          { email: normalizedEmail },
          { take: 1 }
        )

        if (!customer) {
          await redis.del(redisKey)
          return {
            status: 400,
            body: { error: "Account not found. Please try again." },
          }
        }

        // Find or create auth_identity for email-otp provider
        const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
        let authIdentityId: string

        const providerIdentities = await authService.listProviderIdentities(
          { provider: "email-otp", entity_id: normalizedEmail },
          { take: 1 }
        )

        if (providerIdentities.length > 0) {
          authIdentityId = providerIdentities[0].auth_identity_id
        } else {
          // Create auth_identity for migrated customer (no existing email-otp identity)
          const newAuthIdentity = await authService.createAuthIdentities({
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
          authIdentityId = newAuthIdentity.id
        }

        // Generate JWT
        const jwtSecret = getJwtSecret()
        const now = Math.floor(Date.now() / 1000)
        const exp = now + 60 * 60 * 24 * 7 // 7 days

        const token = await signJwtHS256(
          {
            actor_type: "customer",
            actor_id: customer.id,
            auth_identity_id: authIdentityId,
            iat: now,
            exp,
            provider: "email-otp",
            email: normalizedEmail,
          },
          jwtSecret
        )

        // Clean up Redis
        await redis.del(redisKey)

        logger.debug("Existing user logged in via OTP", { customerId: customer.id })

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
            requiresProfile: false,
          },
        }
      } else {
        // New user: mark verified, extend TTL for profile completion
        pendingData.verified = true
        await redis.setex(redisKey, 1800, JSON.stringify(pendingData))

        logger.debug("New user email verified via OTP", { email: normalizedEmail })

        return {
          status: 200,
          body: {
            success: true,
            verified: true,
            requiresProfile: true,
          },
        }
      }
    })

    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    logger.error("Auth OTP verify error", error)
    return res.status(500).json({
      error: getClientErrorMessage(error, "Verification failed"),
    })
  }
}
