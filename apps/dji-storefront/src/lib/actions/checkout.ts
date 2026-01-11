"use server"

import { updateCart, retrieveCart, setShippingMethod, initiatePaymentSession, listCartOptions } from "@/lib/data/cart"
import { placeOrder, placeOrderAndGetId } from "@/lib/data/checkout"
import { HttpTypes } from "@medusajs/types"
import { logger } from "@/lib/logger"

// PayPal provider ID format: pp_{id}_{module_name}
const PAYPAL_PROVIDER_ID = "pp_paypal_paypal"

// Prepare cart for PayPal checkout (set address and shipping)
interface PreparePayPalCheckoutInput {
  email: string
  shippingAddress: {
    first_name: string
    last_name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
  }
  sameAsBilling: boolean
}

export async function preparePayPalCheckoutAction(
  input: PreparePayPalCheckoutInput
): Promise<{ paypalOrderId?: string; error?: string }> {
  const { email, shippingAddress, sameAsBilling } = input

  // Validate required fields
  if (!email || !shippingAddress.first_name || !shippingAddress.last_name ||
      !shippingAddress.address_1 || !shippingAddress.city ||
      !shippingAddress.postal_code || !shippingAddress.country_code) {
    return { error: "Please fill in all required fields" }
  }

  if (shippingAddress.country_code !== "us") {
    return { error: "Currently, only US addresses are supported." }
  }

  try {
    // Step 1: Retrieve cart
    const cart = await retrieveCart()
    if (!cart) {
      return { error: "Failed to retrieve cart" }
    }

    // Step 2: Update cart with shipping information
    const cartData: HttpTypes.StoreUpdateCart = {
      email,
      shipping_address: shippingAddress,
    }

    if (sameAsBilling) {
      cartData.billing_address = shippingAddress
    }

    await updateCart(cartData)

    // Step 3: Retrieve cart with address
    const cartWithAddress = await retrieveCart()
    if (!cartWithAddress || !cartWithAddress.shipping_address) {
      return { error: "Failed to set shipping address. Please try again." }
    }

    // Step 4: Get and set shipping options
    const shippingOptions = await listCartOptions()
    if (!shippingOptions?.shipping_options || shippingOptions.shipping_options.length === 0) {
      return { error: "No shipping options available for your address." }
    }

    const firstShippingOption = shippingOptions.shipping_options[0]
    if (!firstShippingOption?.id) {
      return { error: "Invalid shipping option. Please try again." }
    }

    await setShippingMethod({
      cartId: cartWithAddress.id,
      shippingMethodId: firstShippingOption.id,
    })

    // Step 5: Retrieve cart with shipping method
    const cartWithShipping = await retrieveCart()
    if (!cartWithShipping) {
      return { error: "Failed to retrieve cart" }
    }

    // Step 6: Initialize PayPal payment session - this creates the PayPal order on the backend
    const paymentSession = await initiatePaymentSession(cartWithShipping, {
      provider_id: PAYPAL_PROVIDER_ID,
    })

    // Debug: log the response to understand the structure
    const allSessions = paymentSession?.payment_collection?.payment_sessions || []
    logger.info("PayPal payment session response", {
      hasPaymentCollection: !!paymentSession?.payment_collection,
      paymentSessionsCount: allSessions.length,
      sessionProviders: allSessions.map((s) => s.provider_id),
      sessionDataKeys: allSessions.map((s) => Object.keys(s.data || {})),
    })

    // Find the PayPal session by provider_id (more reliable than assuming it's the first one)
    const paypalSession = paymentSession?.payment_collection?.payment_sessions?.find(
      (session) => session.provider_id === PAYPAL_PROVIDER_ID
    )
    const paypalOrderId = paypalSession?.data?.id as string | undefined

    if (!paypalOrderId) {
      // Log more details about what we received
      logger.error("PayPal order ID not found in response", {
        payment_collection: paymentSession?.payment_collection,
      })
      return { error: "Failed to create PayPal order. Please try again." }
    }

    return { paypalOrderId }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : null
    logger.error("Error preparing PayPal checkout", error)
    return { error: message || "Failed to prepare checkout. Please try again." }
  }
}

// Complete PayPal order after user authorization
// Returns redirect URL for client-side navigation
export async function completePayPalOrderAction(
  countryCode: string
): Promise<{ redirectUrl?: string; error?: string }> {
  try {
    // Place the order and get redirect URL (no server-side redirect)
    const result = await placeOrderAndGetId(countryCode)
    return { redirectUrl: result.redirectUrl }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : null
    logger.error("Error completing PayPal order", error)
    return { error: message || "Failed to complete order. Please try again." }
  }
}

export async function updateCartEmailAction(email: string) {
  try {
    await updateCart({ email })
  } catch (error) {
    logger.error("Error updating cart email", error)
    throw error
  }
}

export async function placeOrderAction(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const countryCode = formData.get("country_code") as string || "us"

  const shippingAddress = {
    first_name: formData.get("shipping_address.first_name") as string,
    last_name: formData.get("shipping_address.last_name") as string,
    address_1: formData.get("shipping_address.address_1") as string,
    city: formData.get("shipping_address.city") as string,
    province: formData.get("shipping_address.province") as string,
    postal_code: formData.get("shipping_address.postal_code") as string,
    country_code: formData.get("shipping_address.country_code") as string || "us",
    phone: formData.get("shipping_address.phone") as string || "",
  }

  const sameAsBilling = formData.get("same_as_billing") === "on"

  // Validate required fields
  if (!email || !shippingAddress.first_name || !shippingAddress.last_name || 
      !shippingAddress.address_1 || !shippingAddress.city || 
      !shippingAddress.postal_code || !shippingAddress.country_code) {
    return "Please fill in all required fields"
  }

  try {
    // Step 1: First, update the cart region if needed based on the country
    // Medusa requires the cart region to match the shipping address country
    const cart = await retrieveCart()
    if (!cart) {
      return "Failed to retrieve cart"
    }

    // For now, let's use US addresses only since our cart is configured for US region
    // In the future, you may want to change the cart region based on the country selected
    if (shippingAddress.country_code !== "us") {
      return "Currently, only US addresses are supported. Please select United States as your country."
    }

    // Step 2: Update cart with shipping information
    const cartData: HttpTypes.StoreUpdateCart = {
      email,
      shipping_address: shippingAddress,
    }

    if (sameAsBilling) {
      cartData.billing_address = shippingAddress
    }

    await updateCart(cartData)

    // Step 2b: Retrieve the cart again to ensure address is fully processed by Medusa
    // This is critical - Medusa needs the address to be set before it can calculate shipping options
    const cartWithAddress = await retrieveCart()
    
    if (!cartWithAddress || !cartWithAddress.shipping_address) {
      return "Failed to set shipping address. Please try again."
    }

    // Step 3: Now get available shipping options (cart must have complete address)
    const shippingOptions = await listCartOptions()
    
    if (!shippingOptions?.shipping_options || shippingOptions.shipping_options.length === 0) {
      return "No shipping options available for your address. Please check your shipping information."
    }

    // Step 4: Set the first available shipping method
    const firstShippingOption = shippingOptions.shipping_options[0]
    if (!firstShippingOption?.id) {
      return "Invalid shipping option. Please try again."
    }

    await setShippingMethod({
      cartId: cartWithAddress.id,
      shippingMethodId: firstShippingOption.id,
    })

    // Step 5: Retrieve the updated cart with shipping method
    const cartWithShipping = await retrieveCart()
    
    if (!cartWithShipping) {
      return "Failed to retrieve cart"
    }

    // Step 6: Initiate payment session with manual payment provider
    await initiatePaymentSession(cartWithShipping, {
      provider_id: "pp_system_default",
    })

    // Step 7: Place the order - redirect will happen in placeOrder function
    await placeOrder(countryCode)

    // This line should never be reached due to redirect in placeOrder
    return "Order placement failed. Please try again."
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : null
    logger.error("Error placing order", error)
    return message || "Failed to place order. Please check your information and try again."
  }
}

// PayPal-specific order placement
interface PlaceOrderWithPayPalInput {
  paypalOrderId: string
  email: string
  shippingAddress: {
    first_name: string
    last_name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
  }
  sameAsBilling: boolean
  countryCode: string
}

export async function placeOrderWithPayPalAction(
  input: PlaceOrderWithPayPalInput
): Promise<{ error?: string } | undefined> {
  const { paypalOrderId, email, shippingAddress, sameAsBilling, countryCode } = input

  // Validate required fields
  if (!email || !shippingAddress.first_name || !shippingAddress.last_name ||
      !shippingAddress.address_1 || !shippingAddress.city ||
      !shippingAddress.postal_code || !shippingAddress.country_code) {
    return { error: "Please fill in all required fields" }
  }

  if (!paypalOrderId) {
    return { error: "PayPal order ID is required" }
  }

  try {
    // Step 1: Retrieve cart
    const cart = await retrieveCart()
    if (!cart) {
      return { error: "Failed to retrieve cart" }
    }

    // Step 2: Validate US-only for now
    if (shippingAddress.country_code !== "us") {
      return { error: "Currently, only US addresses are supported." }
    }

    // Step 3: Update cart with shipping information
    const cartData: HttpTypes.StoreUpdateCart = {
      email,
      shipping_address: shippingAddress,
    }

    if (sameAsBilling) {
      cartData.billing_address = shippingAddress
    }

    await updateCart(cartData)

    // Step 4: Retrieve cart with address
    const cartWithAddress = await retrieveCart()
    if (!cartWithAddress || !cartWithAddress.shipping_address) {
      return { error: "Failed to set shipping address. Please try again." }
    }

    // Step 5: Get and set shipping options
    const shippingOptions = await listCartOptions()
    if (!shippingOptions?.shipping_options || shippingOptions.shipping_options.length === 0) {
      return { error: "No shipping options available for your address." }
    }

    const firstShippingOption = shippingOptions.shipping_options[0]
    if (!firstShippingOption?.id) {
      return { error: "Invalid shipping option. Please try again." }
    }

    await setShippingMethod({
      cartId: cartWithAddress.id,
      shippingMethodId: firstShippingOption.id,
    })

    // Step 6: Retrieve cart with shipping method
    const cartWithShipping = await retrieveCart()
    if (!cartWithShipping) {
      return { error: "Failed to retrieve cart" }
    }

    // Step 7: Initiate payment session with PayPal provider
    // Pass the PayPal order ID as context data for the provider to capture
    await initiatePaymentSession(cartWithShipping, {
      provider_id: PAYPAL_PROVIDER_ID,
      data: {
        paypal_order_id: paypalOrderId,
      },
    })

    // Step 8: Place the order
    await placeOrder(countryCode)

    // If we reach here, redirect failed - but placeOrder should redirect
    return undefined
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : null
    logger.error("Error placing PayPal order", error)
    return { error: message || "Failed to process PayPal payment. Please try again." }
  }
}
