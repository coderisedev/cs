import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { ICustomerModuleService, INotificationModuleService } from "@medusajs/framework/types"
import {
  generateOTP,
  getOTPKey,
  OTP_EXPIRY_SECONDS,
  type PendingVerification,
} from "../../../../../utils/otp"
import { withDedicatedRedis } from "../../../../../utils/redis"
import { logger, getClientErrorMessage } from "../../../../../utils/logger"

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

    const pendingData: PendingVerification = {
      email: normalizedEmail,
      otp,
      verified: false,
      attempts: 0,
      createdAt: Date.now(),
    }

    // Store pending verification in Redis with proper connection management
    await withDedicatedRedis(async (redis) => {
      await redis.setex(redisKey, OTP_EXPIRY_SECONDS, JSON.stringify(pendingData))
    })

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

    logger.debug("OTP sent for registration", { email: normalizedEmail })

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      email: normalizedEmail,
    })
  } catch (error: unknown) {
    logger.error("Registration initiate error", error)
    return res.status(500).json({
      error: getClientErrorMessage(error, "Failed to initiate registration")
    })
  }
}
