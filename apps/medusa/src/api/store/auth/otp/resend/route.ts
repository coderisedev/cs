import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  generateOTP,
  getAuthOTPKey,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_SECONDS,
  RESEND_COOLDOWN_SECONDS,
  type PendingAuthVerification,
} from "../../../../../utils/otp"
import { withDedicatedRedis, safeJsonParse } from "../../../../../utils/redis"
import { logger, getClientErrorMessage } from "../../../../../utils/logger"

interface ResendBody {
  email: string
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as ResendBody
    const { email } = body

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const redisKey = getAuthOTPKey(normalizedEmail)

    const result = await withDedicatedRedis(async (redis) => {
      const cachedData = await redis.get(redisKey)

      if (!cachedData) {
        return {
          status: 400,
          body: { error: "No pending verification found. Please start again." },
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

      // Check if locked out due to too many failed attempts
      if (pendingData.attempts >= MAX_OTP_ATTEMPTS) {
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Too many failed attempts. Please start again." },
        }
      }

      // Check cooldown
      const elapsedSeconds = (Date.now() - pendingData.createdAt) / 1000
      const remainingCooldown = RESEND_COOLDOWN_SECONDS - elapsedSeconds

      if (remainingCooldown > 0) {
        return {
          status: 429,
          body: {
            error: `Please wait ${Math.ceil(remainingCooldown)} seconds before requesting a new code.`,
            retry_after: Math.ceil(remainingCooldown),
          },
        }
      }

      // Generate new OTP
      const newOtp = generateOTP()
      pendingData.otp = newOtp
      pendingData.attempts = 0
      pendingData.createdAt = Date.now()
      pendingData.verified = false

      await redis.setex(redisKey, OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))

      return {
        status: 200,
        body: { success: true },
        newOtp,
        email: normalizedEmail,
      }
    })

    if (result.status !== 200) {
      return res.status(result.status).json(result.body)
    }

    // Send new OTP email
    const notificationService = req.scope.resolve<INotificationModuleService>(Modules.NOTIFICATION)
    await notificationService.createNotifications({
      to: result.email!,
      channel: "email",
      template: "otp-verification",
      data: {
        email: result.email,
        otp_code: result.newOtp,
      },
    })

    logger.debug("Auth OTP resent", { email: normalizedEmail })

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email",
    })
  } catch (error: unknown) {
    logger.error("Auth OTP resend error", error)
    return res.status(500).json({
      error: getClientErrorMessage(error, "Failed to resend verification code"),
    })
  }
}
