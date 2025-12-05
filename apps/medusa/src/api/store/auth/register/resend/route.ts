import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { INotificationModuleService } from "@medusajs/framework/types"
import Redis from "ioredis"
import {
  generateOTP,
  getOTPKey,
  OTP_EXPIRY_SECONDS,
  RESEND_COOLDOWN_SECONDS,
  type PendingVerification,
} from "../../../../../utils/otp"

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

    // Get pending verification from Redis
    const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
    const redis = new Redis(redisUrl)
    const cachedData = await redis.get(redisKey)

    if (!cachedData) {
      await redis.quit()
      return res.status(400).json({
        error: "No pending registration found. Please start registration again.",
      })
    }

    const pendingData: PendingVerification = JSON.parse(cachedData)

    // Check cooldown (prevent spam)
    const elapsedSeconds = (Date.now() - pendingData.createdAt) / 1000
    const remainingCooldown = RESEND_COOLDOWN_SECONDS - elapsedSeconds

    if (remainingCooldown > 0) {
      await redis.quit()
      return res.status(429).json({
        error: `Please wait ${Math.ceil(remainingCooldown)} seconds before requesting a new code.`,
        retry_after: Math.ceil(remainingCooldown),
      })
    }

    // Generate new OTP
    const newOtp = generateOTP()
    pendingData.otp = newOtp
    pendingData.attempts = 0
    pendingData.createdAt = Date.now()
    pendingData.verified = false

    // Update Redis with new OTP
    await redis.setex(redisKey, OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))
    await redis.quit()

    // Send new OTP email
    const notificationService = req.scope.resolve<INotificationModuleService>(Modules.NOTIFICATION)
    await notificationService.createNotifications({
      to: normalizedEmail,
      channel: "email",
      template: "otp-verification",
      data: {
        email: normalizedEmail,
        otp_code: newOtp,
      },
    })

    console.log(`OTP resent to ${normalizedEmail}`)

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email",
    })
  } catch (error: unknown) {
    console.error("OTP resend error:", error)
    const message = error instanceof Error ? error.message : "Failed to resend verification code"
    return res.status(500).json({ error: message })
  }
}
