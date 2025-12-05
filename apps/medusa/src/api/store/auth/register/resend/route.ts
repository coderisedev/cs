import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  generateOTP,
  getOTPKey,
  OTP_EXPIRY_SECONDS,
  RESEND_COOLDOWN_SECONDS,
  type PendingVerification,
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

    // Validation
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const redisKey = getOTPKey(normalizedEmail)

    // Get and update pending verification with proper Redis connection management
    const result = await withDedicatedRedis(async (redis) => {
      const cachedData = await redis.get(redisKey)

      if (!cachedData) {
        return {
          status: 400,
          body: { error: "No pending registration found. Please start registration again." }
        }
      }

      const pendingData = safeJsonParse<PendingVerification>(cachedData)
      if (!pendingData) {
        // Corrupted data, delete and ask to restart
        await redis.del(redisKey)
        return {
          status: 400,
          body: { error: "Registration data corrupted. Please start registration again." }
        }
      }

      // Check cooldown (prevent spam)
      const elapsedSeconds = (Date.now() - pendingData.createdAt) / 1000
      const remainingCooldown = RESEND_COOLDOWN_SECONDS - elapsedSeconds

      if (remainingCooldown > 0) {
        return {
          status: 429,
          body: {
            error: `Please wait ${Math.ceil(remainingCooldown)} seconds before requesting a new code.`,
            retry_after: Math.ceil(remainingCooldown),
          }
        }
      }

      // Generate new OTP
      const newOtp = generateOTP()
      pendingData.otp = newOtp
      pendingData.attempts = 0
      pendingData.createdAt = Date.now()
      pendingData.verified = false

      // Update Redis with new OTP
      await redis.setex(redisKey, OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))

      // Return success with new OTP for email sending
      return {
        status: 200,
        body: { success: true },
        newOtp,
        email: normalizedEmail,
      }
    })

    // If not success, return the error response
    if (result.status !== 200) {
      return res.status(result.status).json(result.body)
    }

    // Send new OTP email (outside Redis transaction)
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

    logger.debug("OTP resent", { email: normalizedEmail })

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email",
    })
  } catch (error: unknown) {
    logger.error("OTP resend error", error)
    return res.status(500).json({
      error: getClientErrorMessage(error, "Failed to resend verification code")
    })
  }
}
