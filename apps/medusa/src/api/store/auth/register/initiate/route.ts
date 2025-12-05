import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { ICustomerModuleService, INotificationModuleService } from "@medusajs/framework/types"
import Redis from "ioredis"
import {
  generateOTP,
  getOTPKey,
  OTP_EXPIRY_SECONDS,
  type PendingVerification,
} from "../../../../../utils/otp"

interface InitiateBody {
  email: string
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as InitiateBody
    const { email } = body

    // Validation
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      })
    }

    // Check if email already exists
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const [existingCustomer] = await customerService.listCustomers(
      { email: normalizedEmail },
      { take: 1 }
    )

    if (existingCustomer) {
      return res.status(409).json({
        error: "An account with this email already exists. Please sign in instead.",
      })
    }

    // Generate OTP
    const otp = generateOTP()
    const redisKey = getOTPKey(normalizedEmail)

    // Store pending verification in Redis
    const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
    const redis = new Redis(redisUrl)

    const pendingData: PendingVerification = {
      email: normalizedEmail,
      otp,
      verified: false,
      attempts: 0,
      createdAt: Date.now(),
    }

    await redis.setex(redisKey, OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))
    await redis.quit()

    // Send OTP email
    const notificationService = req.scope.resolve<INotificationModuleService>(Modules.NOTIFICATION)
    await notificationService.createNotifications({
      to: normalizedEmail,
      channel: "email",
      template: "otp-verification",
      data: {
        email: normalizedEmail,
        otp_code: otp,
      },
    })

    console.log(`OTP sent to ${normalizedEmail} for registration`)

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      email: normalizedEmail,
    })
  } catch (error: unknown) {
    console.error("Registration initiate error:", error)
    const message = error instanceof Error ? error.message : "Failed to initiate registration"
    return res.status(500).json({ error: message })
  }
}
