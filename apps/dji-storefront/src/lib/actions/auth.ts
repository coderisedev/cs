"use server"

import { sdk } from "@/lib/medusa"
import { setAuthToken, removeAuthToken, getCacheTag, getCartId, getAuthHeaders } from "@/lib/server/cookies"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

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
  try {
    await sdk.auth.logout()
  } catch (error) {
    console.error("Logout error:", error)
  }

  await removeAuthToken()

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
