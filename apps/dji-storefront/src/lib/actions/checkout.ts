"use server"

import { redirect } from "next/navigation"
import { updateCart, retrieveCart, setShippingMethod, initiatePaymentSession, listCartOptions } from "@/lib/data/cart"
import { placeOrder } from "@/lib/data/checkout"
import { HttpTypes } from "@medusajs/types"

export async function updateCartEmailAction(email: string) {
  try {
    await updateCart({ email })
  } catch (error) {
    console.error("Error updating cart email:", error)
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
  } catch (error: any) {
    console.error("Error placing order:", error)
    return error.message || "Failed to place order. Please check your information and try again."
  }
}
