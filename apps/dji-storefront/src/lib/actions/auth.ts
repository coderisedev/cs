"use server"

import { sdk, MEDUSA_BACKEND_URL } from "@/lib/medusa"
import { getMedusaPublishableKey } from "@/lib/publishable-key"
import { setAuthToken, removeAuthToken, getCacheTag, getCartId, getAuthHeaders } from "@/lib/server/cookies"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"
import { logoutDiscourseUser } from "@/lib/util/discourse-sso"
import { HttpTypes } from "@medusajs/types"

export async function loginAction(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fallbackRedirect = buildDefaultAccountPath()
  const requestedRedirect = sanitizeRedirectPath(formData.get("returnTo"), fallbackRedirect)

  if (!email || !password) {
    return "Email and password are required"
  }

  try {
    const token = await sdk.auth.login("customer", "emailpass", { 
      email, 
      password 
    })

    if (!token) {
      return "Invalid credentials"
    }

    await setAuthToken(token as string)
    
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    // Transfer anonymous cart to logged in user if exists
    await transferCart()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed. Please check your credentials."
    console.error("Login error:", error)
    return message
  }

  redirect(requestedRedirect)
}

export async function registerAction(_currentState: unknown, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  const fallbackRedirect = buildDefaultAccountPath()
  const requestedRedirect = sanitizeRedirectPath(formData.get("returnTo"), fallbackRedirect)

  if (!firstName || !lastName || !email || !password) {
    return "All required fields must be filled"
  }

  try {
    // Register with Medusa auth
    const token = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })

    if (!token) {
      return "Registration failed"
    }

    await setAuthToken(token as string)

    const authHeaders = {
      authorization: `Bearer ${token}`,
    }

    // Create customer profile
    const customerData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || undefined,
    }

    await sdk.store.customer.create(customerData, {}, authHeaders)

    // Login to get fresh token
    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed. Please try again."
    console.error("Registration error:", error)
    return message
  }

  redirect(requestedRedirect)
}

export async function signoutAction(countryCode: string = "us") {
  // Retrieve customer ID before logout so we can sync Discourse
  let customerId: string | null = null
  try {
    const headers = await getAuthHeaders()
    if (headers.authorization) {
      const { customer } = await sdk.client.fetch<{
        customer: HttpTypes.StoreCustomer
      }>("/store/customers/me", {
        method: "GET",
        headers,
        cache: "no-store",
      })
      customerId = customer?.id ?? null
    }
  } catch {
    // Non-critical — proceed with logout even if we can't get customer ID
  }

  try {
    await sdk.auth.logout()
  } catch (error) {
    console.error("Logout error:", error)
  }

  await removeAuthToken()

  // Sync logout to Discourse (fire-and-forget, must not block storefront logout)
  if (customerId) {
    logoutDiscourseUser(customerId).catch((err) => {
      console.error("[discourse] logout sync error:", err)
    })
  }

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  redirect(`/${countryCode}`)
}

export async function requestPasswordResetAction(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    // Request password reset token from Medusa
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })

    return { success: true, message: "If an account exists with this email, you will receive a password reset link." }
  } catch (error: unknown) {
    console.error("Password reset request error:", error)
    // Always return success message to prevent email enumeration
    return { success: true, message: "If an account exists with this email, you will receive a password reset link." }
  }
}

export async function resetPasswordAction(_currentState: unknown, formData: FormData) {
  const token = formData.get("token") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !email) {
    return { error: "Invalid reset link. Please request a new password reset." }
  }

  if (!password || !confirmPassword) {
    return { error: "Password and confirmation are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  try {
    // Update password using the reset token
    await sdk.auth.updateProvider("customer", "emailpass", {
      password,
    }, token)

    return { success: true, message: "Your password has been reset successfully. You can now sign in with your new password." }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset password. The link may have expired."
    console.error("Password reset error:", error)
    return { error: message }
  }
}

// ============================================
// OTP Registration Actions
// ============================================

export interface InitiateRegistrationResult {
  success?: boolean
  error?: string
  email?: string
}

export interface VerifyOTPResult {
  success?: boolean
  error?: string
  verified?: boolean
}

export interface CompleteRegistrationResult {
  success?: boolean
  error?: string
  token?: string
  customer?: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
}

export interface ResendOTPResult {
  success?: boolean
  error?: string
  retry_after?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error("Non-JSON response from backend:", text.slice(0, 200))
    return { error: `Server error (${response.status})` }
  }
}

function getOTPHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const publishableKey = getMedusaPublishableKey()
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }
  return headers
}

export async function initiateRegistrationAction(
  _currentState: unknown,
  formData: FormData
): Promise<InitiateRegistrationResult> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/register/initiate`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({ email }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Failed to send verification code" }
    }

    return { success: true, email: data.email }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initiate registration"
    console.error("Initiate registration error:", error)
    return { error: message }
  }
}

export async function verifyOTPAction(
  _currentState: unknown,
  formData: FormData
): Promise<VerifyOTPResult> {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string

  if (!email || !otp) {
    return { error: "Email and verification code are required" }
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { error: "Please enter a valid 6-digit code" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/register/verify`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({ email, otp }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Verification failed" }
    }

    return { success: true, verified: data.verified }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed"
    console.error("Verify OTP error:", error)
    return { error: message }
  }
}

export async function completeRegistrationAction(
  _currentState: unknown,
  formData: FormData
): Promise<CompleteRegistrationResult | string> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const returnTo = formData.get("returnTo") as string

  const fallbackRedirect = buildDefaultAccountPath()
  const requestedRedirect = sanitizeRedirectPath(returnTo, fallbackRedirect)

  if (!email || !password || !firstName || !lastName) {
    return { error: "All required fields must be filled" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/register/complete`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Registration failed" }
    }

    if (data.token) {
      await setAuthToken(data.token)

      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)

      await transferCart(data.token)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed"
    console.error("Complete registration error:", error)
    return { error: message }
  }

  redirect(requestedRedirect)
}

export async function resendOTPAction(email: string): Promise<ResendOTPResult> {
  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/register/resend`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({ email }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Failed to resend code", retry_after: data.retry_after }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend code"
    console.error("Resend OTP error:", error)
    return { error: message }
  }
}

// ============================================
// OTP Login Actions (Unified Login/Register Flow)
// ============================================

export interface InitiateOTPLoginResult {
  success?: boolean
  error?: string
  email?: string
  isNewUser?: boolean
}

export interface VerifyOTPLoginResult {
  success?: boolean
  error?: string
  token?: string
  requiresProfile?: boolean
  customer?: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
}

export interface CompleteOTPProfileResult {
  success?: boolean
  error?: string
  token?: string
  customer?: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
}

export async function initiateOTPLoginAction(
  _currentState: unknown,
  formData: FormData
): Promise<InitiateOTPLoginResult> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/otp/initiate`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({ email }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Failed to send verification code" }
    }

    return { success: true, email: data.email, isNewUser: data.isNewUser }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send verification code"
    console.error("Initiate OTP login error:", error)
    return { error: message }
  }
}

export async function verifyOTPLoginAction(
  _currentState: unknown,
  formData: FormData
): Promise<VerifyOTPLoginResult | string> {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string
  const returnTo = formData.get("returnTo") as string

  const fallbackRedirect = buildDefaultAccountPath()
  const requestedRedirect = sanitizeRedirectPath(returnTo, fallbackRedirect)

  if (!email || !otp) {
    return { error: "Email and verification code are required" }
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { error: "Please enter a valid 6-digit code" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/otp/verify`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({ email, otp }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Verification failed" }
    }

    // Existing user: token returned, log in and redirect
    if (data.token) {
      await setAuthToken(data.token)

      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)

      await transferCart(data.token)
    } else {
      // New user: requiresProfile true, stay on page
      return {
        success: true,
        requiresProfile: data.requiresProfile,
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed"
    console.error("Verify OTP login error:", error)
    return { error: message }
  }

  redirect(requestedRedirect)
}

export async function completeOTPProfileAction(
  _currentState: unknown,
  formData: FormData
): Promise<CompleteOTPProfileResult | string> {
  const email = formData.get("email") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const returnTo = formData.get("returnTo") as string

  const fallbackRedirect = buildDefaultAccountPath()
  const requestedRedirect = sanitizeRedirectPath(returnTo, fallbackRedirect)

  if (!email || !firstName || !lastName) {
    return { error: "Email, first name, and last name are required" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/otp/complete`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Failed to create account" }
    }

    if (data.token) {
      await setAuthToken(data.token)

      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)

      await transferCart(data.token)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create account"
    console.error("Complete OTP profile error:", error)
    return { error: message }
  }

  redirect(requestedRedirect)
}

export async function resendOTPLoginAction(email: string): Promise<ResendOTPResult> {
  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/otp/resend`, {
      method: "POST",
      headers: getOTPHeaders(),
      body: JSON.stringify({ email }),
    })

    const data = await safeJsonParse(response)

    if (!response.ok) {
      return { error: data.error || "Failed to resend code", retry_after: data.retry_after }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend code"
    console.error("Resend OTP login error:", error)
    return { error: message }
  }
}

export async function transferCart(authToken?: string) {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      return
    }

    let headers = await getAuthHeaders()
    if (authToken) {
      headers = {
        ...headers,
        authorization: `Bearer ${authToken}`,
      }
    }
    if (!headers.authorization) {
      return
    }

    await sdk.store.cart.transferCart(cartId, {}, headers)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  } catch (error) {
    console.error("Cart transfer error:", error)
  }
}
