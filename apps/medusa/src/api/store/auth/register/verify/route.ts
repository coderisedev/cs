import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import Redis from "ioredis"
import {
  getOTPKey,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_SECONDS,
  type PendingVerification,
} from "../../../../../utils/otp"

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

    // Get pending verification from Redis
    const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
    const redis = new Redis(redisUrl)
    const cachedData = await redis.get(redisKey)

    if (!cachedData) {
      await redis.quit()
      return res.status(400).json({
        error: "Verification code expired or invalid. Please request a new code.",
      })
    }

    const pendingData: PendingVerification = JSON.parse(cachedData)

    // Check if already verified
    if (pendingData.verified) {
      await redis.quit()
      return res.status(200).json({
        success: true,
        verified: true,
        message: "Email already verified. Please complete your registration.",
      })
    }

    // Check attempts
    if (pendingData.attempts >= MAX_OTP_ATTEMPTS) {
      await redis.del(redisKey)
      await redis.quit()
      return res.status(400).json({
        error: "Too many failed attempts. Please request a new code.",
      })
    }

    // Verify OTP
    if (pendingData.otp !== otp) {
      // Increment attempts
      pendingData.attempts += 1

      // Calculate remaining TTL
      const ttl = await redis.ttl(redisKey)
      await redis.setex(redisKey, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))
      await redis.quit()

      const remaining = MAX_OTP_ATTEMPTS - pendingData.attempts
      return res.status(400).json({
        error: `Invalid verification code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      })
    }

    // OTP verified - mark as verified and keep for completion step
    pendingData.verified = true

    // Keep data for 30 more minutes for profile completion
    await redis.setex(redisKey, 1800, JSON.stringify(pendingData))
    await redis.quit()

    console.log(`Email verified for ${normalizedEmail}`)

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Email verified successfully. Please complete your registration.",
    })
  } catch (error: unknown) {
    console.error("Registration verify error:", error)
    const message = error instanceof Error ? error.message : "Verification failed"
    return res.status(500).json({ error: message })
  }
}
