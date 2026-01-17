"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/number"
import { placeOrderAction, preparePayPalCheckoutAction, completePayPalOrderAction, calculateShippingAction } from "@/lib/actions/checkout"
import { getRegionConfigById, COUNTRY_NAMES, isCountryInRegion, REGIONS, getCountryFlag } from "@/lib/config/regions"
import { ShoppingBag, ArrowLeft, Package, CreditCard, MapPin } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import type { AccountAddress } from "@/lib/data/account"
import { cn } from "@/lib/utils"
import { PayPalButton } from "./paypal-button"

type CheckoutClientProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
  customerAddresses: AccountAddress[]
}

export function CheckoutClient({ cart: initialCart, customer, countryCode, customerAddresses }: CheckoutClientProps) {
  const router = useRouter()
  const [cart, setCart] = useState(initialCart)
  const [email, setEmail] = useState(customer?.email || initialCart.email || "")

  // Get region config based on cart's region
  const regionConfig = getRegionConfigById(cart.region_id)

  const [shippingAddress, setShippingAddress] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: countryCode || "us",
    phone: customer?.phone || "",
  })
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const [isPaypalProcessing, setIsPaypalProcessing] = useState(false)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)

  const [orderMessage, orderFormAction, orderPending] = useActionState(placeOrderAction, null)

  const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
  // Use item_subtotal for products only (subtotal includes shipping in Medusa)
  const subtotal = cart.item_subtotal || 0
  const shipping = cart.shipping_total || 0
  const tax = cart.tax_total || 0
  const total = cart.total || 0
  // Check if prices are tax inclusive
  const isTaxInclusive = cart.items?.some(item => item.is_tax_inclusive) ?? false

  const handleSubmit = async (formData: FormData) => {
    // Add shipping address to form data
    formData.append("email", email)
    formData.append("shipping_address.first_name", shippingAddress.first_name)
    formData.append("shipping_address.last_name", shippingAddress.last_name)
    formData.append("shipping_address.address_1", shippingAddress.address_1)
    formData.append("shipping_address.city", shippingAddress.city)
    formData.append("shipping_address.province", shippingAddress.province)
    formData.append("shipping_address.postal_code", shippingAddress.postal_code)
    formData.append("shipping_address.country_code", shippingAddress.country_code)
    formData.append("shipping_address.phone", shippingAddress.phone)
    formData.append("same_as_billing", sameAsBilling ? "on" : "off")
    formData.append("country_code", countryCode)

    await orderFormAction(formData)
  }

  const applySavedAddress = (address: AccountAddress) => {
    setShippingAddress({
      first_name: address.firstName,
      last_name: address.lastName,
      address_1: address.address1,
      city: address.city,
      province: address.province || "",
      postal_code: address.postalCode,
      country_code: address.countryCode || "us",
      phone: address.phone || "",
    })
  }

  const defaultSavedAddress = customerAddresses.find((addr) => addr.isDefaultShipping) || customerAddresses[0]

  useEffect(() => {
    if (!defaultSavedAddress || selectedAddressId) {
      return
    }
    setSelectedAddressId(defaultSavedAddress.id)
    applySavedAddress(defaultSavedAddress)
  }, [defaultSavedAddress, selectedAddressId])

  const handleSelectAddress = (address: AccountAddress) => {
    setSelectedAddressId(address.id)
    applySavedAddress(address)
  }

  // Check if address is complete for shipping calculation
  const isAddressComplete = Boolean(
    shippingAddress.first_name &&
    shippingAddress.last_name &&
    shippingAddress.address_1 &&
    shippingAddress.city &&
    shippingAddress.postal_code &&
    shippingAddress.country_code
  )

  // Calculate shipping when address changes
  useEffect(() => {
    // Only calculate if address is complete and country is supported in region
    if (!isAddressComplete || !isCountryInRegion(regionConfig, shippingAddress.country_code)) {
      return
    }

    const calculateShipping = async () => {
      setIsCalculatingShipping(true)
      try {
        const result = await calculateShippingAction({
          email: email || undefined,
          shippingAddress,
        })
        if (result.cart) {
          setCart(result.cart)
        }
      } finally {
        setIsCalculatingShipping(false)
      }
    }

    // Debounce the calculation to avoid too many API calls
    const timeoutId = setTimeout(calculateShipping, 500)
    return () => clearTimeout(timeoutId)
  }, [
    isAddressComplete,
    shippingAddress.first_name,
    shippingAddress.last_name,
    shippingAddress.address_1,
    shippingAddress.city,
    shippingAddress.postal_code,
    shippingAddress.country_code,
    email,
  ])

  // Validate shipping form before PayPal payment
  const validateShippingForm = (): boolean => {
    if (!email || !shippingAddress.first_name || !shippingAddress.last_name ||
        !shippingAddress.address_1 || !shippingAddress.city ||
        !shippingAddress.postal_code || !shippingAddress.country_code) {
      setPaypalError("Please fill in all required shipping fields before proceeding with payment.")
      return false
    }
    if (!isCountryInRegion(regionConfig, shippingAddress.country_code)) {
      const countryName = COUNTRY_NAMES[shippingAddress.country_code.toLowerCase()] || shippingAddress.country_code.toUpperCase()
      setPaypalError(`Shipping to ${countryName} is not available for your region. Please select a different country.`)
      return false
    }
    return true
  }

  // Create PayPal order via Medusa backend when user clicks PayPal button
  const handleCreatePayPalOrder = async (): Promise<string | null> => {
    if (!validateShippingForm()) {
      return null
    }

    setPaypalError(null)
    setIsPaypalProcessing(true)

    try {
      const result = await preparePayPalCheckoutAction({
        email,
        shippingAddress,
        sameAsBilling,
      })

      if (result.error) {
        setPaypalError(result.error)
        setIsPaypalProcessing(false)
        return null
      }

      // Update cart state with refreshed data (includes calculated tax)
      if (result.cart) {
        setCart(result.cart)
      }

      // Return the PayPal order ID created by Medusa
      return result.paypalOrderId || null
    } catch (error) {
      console.error("Error creating PayPal order:", error)
      setPaypalError("Failed to create PayPal order. Please try again.")
      setIsPaypalProcessing(false)
      return null
    }
  }

  // Handle PayPal payment approval - user has authorized the payment
  const handlePayPalApprove = async () => {
    setPaypalError(null)

    try {
      const result = await completePayPalOrderAction(countryCode)

      if (result.error) {
        setPaypalError(result.error)
        setIsPaypalProcessing(false)
        return
      }

      // Redirect to order confirmation page using client-side navigation
      if (result.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } catch (error: unknown) {
      console.error("PayPal order error:", error)
      setPaypalError("Failed to complete order. Please try again.")
      setIsPaypalProcessing(false)
    }
  }

  const handlePayPalError = (error: unknown) => {
    console.error("PayPal error:", error)
    setPaypalError("PayPal payment failed. Please try again or use a different payment method.")
    setIsPaypalProcessing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary mb-2">Checkout</h1>
          <p className="text-foreground-secondary">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your order
          </p>
        </div>
        <Link href={`/${countryCode}/cart`}>
          <Button variant="outline" disabled={orderPending}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customerAddresses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground-primary">Saved addresses</p>
                    <Link className="text-xs text-primary-500" href={`/${countryCode}/account?tab=addresses`}>
                      Manage
                    </Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    {customerAddresses.map((address) => (
                      <button
                        type="button"
                        key={address.id}
                        className={cn(
                          "text-left border rounded-lg p-3 transition-colors",
                          selectedAddressId === address.id
                            ? "border-primary-500 bg-primary-500/5"
                            : "border-border-primary hover:border-border-secondary"
                        )}
                        onClick={() => handleSelectAddress(address)}
                        disabled={orderPending}
                      >
                        <div className="flex items-center justify-between text-sm font-medium text-foreground-primary">
                          <span>
                            {address.firstName} {address.lastName}
                          </span>
                          {address.isDefaultShipping && <span className="text-xs text-primary-500">Default</span>}
                        </div>
                        <p className="text-xs text-foreground-secondary mt-1">
                          {address.address1}, {address.city}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={orderPending}
                />
                <p className="text-xs text-foreground-muted">
                  Order confirmation will be sent to this email
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={shippingAddress.first_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                    required
                    disabled={orderPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={shippingAddress.last_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                    required
                    disabled={orderPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_1">Address *</Label>
                <Input
                  id="address_1"
                  value={shippingAddress.address_1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address_1: e.target.value })}
                  placeholder="123 Main St"
                  required
                  disabled={orderPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    required
                    disabled={orderPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_code">Country *</Label>
                  <select
                    id="country_code"
                    value={shippingAddress.country_code}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country_code: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={orderPending}
                  >
                    <optgroup label={`${REGIONS.us.name} (${REGIONS.us.currency})`}>
                      {REGIONS.us.countries.map((code) => (
                        <option key={code} value={code}>
                          {getCountryFlag(code)} {COUNTRY_NAMES[code] || code.toUpperCase()}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={`${REGIONS.eu.name} (${REGIONS.eu.currency})`}>
                      {REGIONS.eu.countries.map((code) => (
                        <option key={code} value={code}>
                          {getCountryFlag(code)} {COUNTRY_NAMES[code] || code.toUpperCase()}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-xs text-foreground-muted">
                    Currency will be based on shipping destination
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">State / Province</Label>
                  <Input
                    id="province"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    placeholder="CA"
                    disabled={orderPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                    placeholder="12345"
                    required
                    disabled={orderPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  disabled={orderPending}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="same_as_billing"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="rounded"
                  disabled={orderPending}
                />
                <Label htmlFor="same_as_billing" className="cursor-pointer">
                  Billing address same as shipping
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PayPal Button */}
              <div className="paypal-payment-section">
                <p className="text-sm text-foreground-secondary mb-3">
                  Pay securely with PayPal
                </p>
                <PayPalButton
                  currency={regionConfig.currency}
                  disabled={orderPending || isPaypalProcessing}
                  onCreateOrder={handleCreatePayPalOrder}
                  onApprove={handlePayPalApprove}
                  onError={handlePayPalError}
                />
              </div>

              {/* PayPal Error Message */}
              {paypalError && (
                <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                  {paypalError}
                </div>
              )}

              <div className="text-xs text-foreground-muted text-center pt-2 border-t border-border-secondary">
                Your payment is processed securely through PayPal. We never store your payment details.
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {orderMessage && (
            <div className="p-4 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
              {orderMessage}
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="bg-background-secondary">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items?.map((item) => {
                  const thumbnail = item.thumbnail || item.product?.thumbnail
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-base bg-background-elevated flex items-center justify-center overflow-hidden">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={item.title || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-foreground-muted" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-foreground-muted">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatPrice((item.unit_price || 0) * (item.quantity || 1), cart)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Price Summary */}
              <div className="space-y-2 pt-4 border-t border-border-primary">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal, cart)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Shipping</span>
                  <span className="font-medium">
                    {isCalculatingShipping
                      ? "Calculating..."
                      : shipping > 0
                        ? formatPrice(shipping, cart)
                        : isAddressComplete && isCountryInRegion(regionConfig, shippingAddress.country_code)
                          ? "Free"
                          : "Calculated at next step"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Tax</span>
                  <span className="font-medium">
                    {tax > 0
                      ? formatPrice(tax, cart)
                      : isTaxInclusive
                        ? "Included"
                        : "Calculated at next step"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border-primary">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">{formatPrice(total, cart)}</span>
              </div>

              <p className="text-xs text-foreground-muted text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
