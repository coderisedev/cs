import crypto from "crypto"

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Get Redis key for storing OTP verification data
 */
export function getOTPKey(email: string): string {
  return `otp:register:${email.toLowerCase().trim()}`
}

/**
 * Pending verification data stored in Redis
 */
export interface PendingVerification {
  email: string
  otp: string
  verified: boolean
  attempts: number
  createdAt: number
}

// OTP expires after 10 minutes
export const OTP_EXPIRY_SECONDS = 600

// Maximum verification attempts before requiring new OTP
export const MAX_OTP_ATTEMPTS = 5

// Minimum seconds between resend requests
export const RESEND_COOLDOWN_SECONDS = 60

/**
 * Get Redis key for storing auth OTP verification data (login/unified flow)
 */
export function getAuthOTPKey(email: string): string {
  return `otp:auth:${email.toLowerCase().trim()}`
}

/**
 * Pending auth verification data stored in Redis (unified login/register flow)
 */
export interface PendingAuthVerification {
  email: string
  otp: string
  verified: boolean
  attempts: number
  createdAt: number
  isNewUser: boolean
}
