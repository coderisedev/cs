import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  getOTPKey,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_SECONDS,
  type PendingVerification,
} from "../../../../../utils/otp"
import { withDedicatedRedis, safeJsonParse } from "../../../../../utils/redis"
import { logger, getClientErrorMessage } from "../../../../../utils/logger"

interface VerifyBody {
  email: string
  otp: string
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as VerifyBody
    const { email, otp } = body

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and verification code are required",
      })
    }

    // Validate OTP format
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "Please enter a valid 6-digit code",
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const redisKey = getOTPKey(normalizedEmail)

    // Get and verify OTP with proper Redis connection management
    const result = await withDedicatedRedis(async (redis) => {
      const cachedData = await redis.get(redisKey)

      if (!cachedData) {
        return {
          status: 400,
          body: { error: "Verification code expired or invalid. Please request a new code." }
        }
      }

      const pendingData = safeJsonParse<PendingVerification>(cachedData)
      if (!pendingData) {
        // Corrupted data, delete and ask for new code
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Verification data corrupted. Please request a new code." }
        }
      }

      // Check if already verified
      if (pendingData.verified) {
        return {
          status: 200,
          body: {
            success: true,
            verified: true,
            message: "Email already verified. Please complete your registration.",
          }
        }
      }

      // Check attempts
      if (pendingData.attempts >= MAX_OTP_ATTEMPTS) {
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Too many failed attempts. Please request a new code." }
        }
      }

      // Verify OTP
      if (pendingData.otp !== otp) {
        // Increment attempts
        pendingData.attempts += 1

        // Calculate remaining TTL
        const ttl = await redis.ttl(redisKey)
        await redis.setex(redisKey, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))

        const remaining = MAX_OTP_ATTEMPTS - pendingData.attempts
        return {
          status: 400,
          body: { error: `Invalid verification code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` }
        }
      }

      // OTP verified - mark as verified and keep for completion step
      pendingData.verified = true

      // Keep data for 30 more minutes for profile completion
      await redis.setex(redisKey, 1800, JSON.stringify(pendingData))

      logger.debug("Email verified for registration", { email: normalizedEmail })

      return {
        status: 200,
        body: {
          success: true,
          verified: true,
          message: "Email verified successfully. Please complete your registration.",
        }
      }
    })

    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    logger.error("Registration verify error", error)
    return res.status(500).json({
      error: getClientErrorMessage(error, "Verification failed")
    })
  }
}
