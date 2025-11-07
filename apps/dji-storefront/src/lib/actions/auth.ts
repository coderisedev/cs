"use server"

import { sdk } from "@/lib/medusa"
import { setAuthToken, removeAuthToken, getCacheTag, getCartId, getAuthHeaders } from "@/lib/server/cookies"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function loginAction(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

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

  redirect("/us/account")
}

export async function registerAction(_currentState: unknown, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

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

  redirect("/us/account")
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

async function transferCart() {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      return
    }

    const headers = await getAuthHeaders()
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
