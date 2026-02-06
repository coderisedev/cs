"use client"

import { useState, useActionState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/number"
import { placeOrderAction, preparePayPalCheckoutAction, completePayPalOrderAction, calculateShippingAction } from "@/lib/actions/checkout"
import { getRegionConfigById, COUNTRY_NAMES, isCountryInRegion, getCountriesByGeographicRegion } from "@/lib/config/regions"
import { ShoppingBag, ArrowLeft, Package, CreditCard, MapPin, AlertCircle, CheckCircle2, Loader2, Tag } from "lucide-react"
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

// Field validation types
type FieldError = {
  field: string
  message: string
}

type ValidationState = {
  errors: FieldError[]
  touched: Set<string>
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
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingCalculated, setShippingCalculated] = useState(false)

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    errors: [],
    touched: new Set<string>(),
  })

  const [orderMessage, orderFormAction, orderPending] = useActionState(placeOrderAction, null)

  // Email validation helper
  const isValidEmail = useCallback((emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }, [])

  // Validate all fields and return errors
  const validateFields = useCallback((): FieldError[] => {
    const errors: FieldError[] = []

    if (!email.trim()) {
      errors.push({ field: "email", message: "Email is required" })
    } else if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" })
    }

    if (!shippingAddress.first_name.trim()) {
      errors.push({ field: "first_name", message: "First name is required" })
    }

    if (!shippingAddress.last_name.trim()) {
      errors.push({ field: "last_name", message: "Last name is required" })
    }

    if (!shippingAddress.address_1.trim()) {
      errors.push({ field: "address_1", message: "Address is required" })
    }

    if (!shippingAddress.city.trim()) {
      errors.push({ field: "city", message: "City is required" })
    }

    if (!shippingAddress.postal_code.trim()) {
      errors.push({ field: "postal_code", message: "Postal code is required" })
    }

    if (!shippingAddress.province.trim()) {
      errors.push({ field: "province", message: "State / Province is required" })
    }

    if (!shippingAddress.country_code) {
      errors.push({ field: "country_code", message: "Country is required" })
    } else if (!isCountryInRegion(regionConfig, shippingAddress.country_code)) {
      const countryName = COUNTRY_NAMES[shippingAddress.country_code.toLowerCase()] || shippingAddress.country_code.toUpperCase()
      errors.push({ field: "country_code", message: `Shipping to ${countryName} is not available. Please select a supported country.` })
    }

    return errors
  }, [email, isValidEmail, shippingAddress, regionConfig])

  // Get error for a specific field
  const getFieldError = useCallback((field: string): string | null => {
    if (!validation.touched.has(field)) return null
    const error = validation.errors.find(e => e.field === field)
    return error?.message || null
  }, [validation])

  // Mark field as touched (on blur)
  const markFieldTouched = useCallback((field: string) => {
    setValidation(prev => ({
      ...prev,
      touched: new Set([...prev.touched, field]),
      errors: validateFields(),
    }))
  }, [validateFields])

  // Update validation when fields change
  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      errors: validateFields(),
    }))
  }, [validateFields])

  const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
  // Use item_subtotal for products only (subtotal includes shipping in Medusa)
  const subtotal = cart.item_subtotal || 0
  const shipping = cart.shipping_total || 0
  const tax = cart.tax_total || 0
  const total = cart.total || 0
  // Check if prices are tax inclusive
  const isTaxInclusive = cart.items?.some(item => item.is_tax_inclusive) ?? false
  // Discount and promotions
  const discountTotal = cart.discount_total || 0
  const appliedPromotions = (cart as { promotions?: Array<{ code?: string; id: string }> }).promotions || []

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

  const applySavedAddress = useCallback((address: AccountAddress) => {
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
  }, [])

  const defaultSavedAddress = customerAddresses.find((addr) => addr.isDefaultShipping) || customerAddresses[0]

  useEffect(() => {
    if (!defaultSavedAddress || selectedAddressId) {
      return
    }
    setSelectedAddressId(defaultSavedAddress.id)
    applySavedAddress(defaultSavedAddress)
  }, [defaultSavedAddress, selectedAddressId, applySavedAddress])

  const handleSelectAddress = (address: AccountAddress) => {
    setSelectedAddressId(address.id)
    applySavedAddress(address)
  }

  // Check if address is complete for shipping calculation (basic fields filled)
  const isAddressComplete = Boolean(
    shippingAddress.first_name.trim() &&
    shippingAddress.last_name.trim() &&
    shippingAddress.address_1.trim() &&
    shippingAddress.city.trim() &&
    shippingAddress.postal_code.trim() &&
    shippingAddress.province.trim() &&
    shippingAddress.country_code
  )

  // Check if form is fully valid (including email and country validation)
  const isFormValid = useMemo(() => {
    return validation.errors.length === 0 && isAddressComplete && email.trim() !== ""
  }, [validation.errors, isAddressComplete, email])

  // Check if ready for payment (form valid AND shipping calculated)
  const isReadyForPayment = useMemo(() => {
    return isFormValid && shippingCalculated && !shippingError
  }, [isFormValid, shippingCalculated, shippingError])

  // Calculate shipping when address changes
  useEffect(() => {
    // Reset shipping state when address changes
    setShippingCalculated(false)
    setShippingError(null)

    // Only calculate if address is complete
    if (!isAddressComplete) {
      return
    }

    // Check if country is supported
    if (!isCountryInRegion(regionConfig, shippingAddress.country_code)) {
      const countryName = COUNTRY_NAMES[shippingAddress.country_code.toLowerCase()] || shippingAddress.country_code.toUpperCase()
      setShippingError(`Shipping to ${countryName} is not available in your current region.`)
      return
    }

    const calculateShipping = async () => {
      setIsCalculatingShipping(true)
      setShippingError(null)
      try {
        const result = await calculateShippingAction({
          email: email || undefined,
          shippingAddress,
        })
        if (result.error) {
          setShippingError(result.error)
          setShippingCalculated(false)
        } else if (result.cart) {
          setCart(result.cart)
          setShippingCalculated(true)
        }
      } catch (error) {
        console.error("Shipping calculation error:", error)
        setShippingError("Unable to calculate shipping. Please check your address and try again.")
        setShippingCalculated(false)
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
    regionConfig,
  ])

  // Validate shipping form before PayPal payment
  const validateShippingForm = (): boolean => {
    // Mark all fields as touched to show errors
    const allFields = ["email", "first_name", "last_name", "address_1", "city", "postal_code", "country_code"]
    setValidation(prev => ({
      ...prev,
      touched: new Set([...prev.touched, ...allFields]),
      errors: validateFields(),
    }))

    const errors = validateFields()
    if (errors.length > 0) {
      // Show the first error as paypal error
      setPaypalError(errors[0].message)
      return false
    }

    if (!shippingCalculated) {
      setPaypalError("Please wait for shipping to be calculated before proceeding.")
      return false
    }

    if (shippingError) {
      setPaypalError(shippingError)
      return false
    }

    return true
  }

  // Get missing fields for display
  const getMissingFields = useCallback((): string[] => {
    const missing: string[] = []
    if (!email.trim()) missing.push("Email")
    if (!shippingAddress.first_name.trim()) missing.push("First Name")
    if (!shippingAddress.last_name.trim()) missing.push("Last Name")
    if (!shippingAddress.address_1.trim()) missing.push("Address")
    if (!shippingAddress.city.trim()) missing.push("City")
    if (!shippingAddress.postal_code.trim()) missing.push("Postal Code")
    return missing
  }, [email, shippingAddress])

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
    <div className="container mx-auto px-3 xs:px-4 py-6 xs:py-8">
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
                <Label htmlFor="email" className={cn(getFieldError("email") && "text-red-600")}>
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markFieldTouched("email")}
                  placeholder="you@example.com"
                  required
                  disabled={orderPending}
                  className={cn(getFieldError("email") && "border-red-500 focus-visible:ring-red-500")}
                />
                {getFieldError("email") ? (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("email")}
                  </p>
                ) : (
                  <p className="text-xs text-foreground-muted">
                    Order confirmation will be sent to this email
                  </p>
                )}
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
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className={cn(getFieldError("first_name") && "text-red-600")}>
                    First Name *
                  </Label>
                  <Input
                    id="first_name"
                    value={shippingAddress.first_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                    onBlur={() => markFieldTouched("first_name")}
                    required
                    disabled={orderPending}
                    className={cn(getFieldError("first_name") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("first_name") && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("first_name")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className={cn(getFieldError("last_name") && "text-red-600")}>
                    Last Name *
                  </Label>
                  <Input
                    id="last_name"
                    value={shippingAddress.last_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                    onBlur={() => markFieldTouched("last_name")}
                    required
                    disabled={orderPending}
                    className={cn(getFieldError("last_name") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("last_name") && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("last_name")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_1" className={cn(getFieldError("address_1") && "text-red-600")}>
                  Address *
                </Label>
                <Input
                  id="address_1"
                  value={shippingAddress.address_1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address_1: e.target.value })}
                  onBlur={() => markFieldTouched("address_1")}
                  placeholder="123 Main St"
                  required
                  disabled={orderPending}
                  className={cn(getFieldError("address_1") && "border-red-500 focus-visible:ring-red-500")}
                />
                {getFieldError("address_1") && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("address_1")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className={cn(getFieldError("city") && "text-red-600")}>
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    onBlur={() => markFieldTouched("city")}
                    required
                    disabled={orderPending}
                    className={cn(getFieldError("city") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("city") && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("city")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_code" className={cn(getFieldError("country_code") && "text-red-600")}>
                    Country *
                  </Label>
                  <select
                    id="country_code"
                    value={shippingAddress.country_code}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country_code: e.target.value })}
                    onBlur={() => markFieldTouched("country_code")}
                    className={cn(
                      "flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-[16px] sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      getFieldError("country_code") && "border-red-500 focus-visible:ring-red-500"
                    )}
                    required
                    disabled={orderPending}
                  >
                    {getCountriesByGeographicRegion().map((region) => (
                      <optgroup key={region.code} label={region.name}>
                        {region.countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {getFieldError("country_code") ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("country_code")}
                    </p>
                  ) : (
                    <p className="text-xs text-foreground-muted">
                      Currency will be based on shipping destination
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className={cn(getFieldError("province") && "text-red-600")}>
                    State / Province *
                  </Label>
                  <Input
                    id="province"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    onBlur={() => markFieldTouched("province")}
                    placeholder="CA"
                    required
                    disabled={orderPending}
                    className={cn(getFieldError("province") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("province") ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("province")}
                    </p>
                  ) : (
                    <p className="text-xs text-foreground-muted">
                      If no State/Province is applicable, fill in N/A.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code" className={cn(getFieldError("postal_code") && "text-red-600")}>
                    Postal Code *
                  </Label>
                  <Input
                    id="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                    onBlur={() => markFieldTouched("postal_code")}
                    placeholder="12345"
                    required
                    disabled={orderPending}
                    className={cn(getFieldError("postal_code") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("postal_code") && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("postal_code")}
                    </p>
                  )}
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
              {/* Status indicator */}
              {!isReadyForPayment && (
                <div className={cn(
                  "p-3 rounded-lg border text-sm",
                  shippingError
                    ? "bg-red-50 border-red-200 text-red-700"
                    : isCalculatingShipping
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                )}>
                  {shippingError ? (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Shipping unavailable</p>
                        <p className="text-xs mt-1">{shippingError}</p>
                      </div>
                    </div>
                  ) : isCalculatingShipping ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Calculating shipping costs...</span>
                    </div>
                  ) : !isAddressComplete ? (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Complete your shipping address</p>
                        <p className="text-xs mt-1">
                          Missing: {getMissingFields().join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : !isValidEmail(email) ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please enter a valid email address</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please complete all required fields above</span>
                    </div>
                  )}
                </div>
              )}

              {/* Ready for payment indicator */}
              {isReadyForPayment && (
                <div className="p-3 rounded-lg border bg-green-50 border-green-200 text-green-700 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Ready for payment - Click PayPal to continue</span>
                  </div>
                </div>
              )}

              {/* PayPal Button */}
              <div className="paypal-payment-section">
                <p className="text-sm text-foreground-secondary mb-3">
                  Pay securely with PayPal
                </p>
                <div className={cn(!isReadyForPayment && "opacity-60 pointer-events-none")}>
                  <PayPalButton
                    currency={regionConfig.currency}
                    disabled={orderPending || isPaypalProcessing || !isReadyForPayment}
                    onCreateOrder={handleCreatePayPalOrder}
                    onApprove={handlePayPalApprove}
                    onError={handlePayPalError}
                  />
                </div>
                {!isReadyForPayment && (
                  <p className="text-xs text-foreground-muted mt-2 text-center">
                    Complete your shipping address to enable payment
                  </p>
                )}
              </div>

              {/* PayPal Error Message */}
              {paypalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{paypalError}</span>
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
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(discountTotal, cart)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Shipping</span>
                  <span className={cn(
                    "font-medium",
                    isCalculatingShipping && "text-blue-600",
                    shippingError && "text-red-600"
                  )}>
                    {isCalculatingShipping ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Calculating...
                      </span>
                    ) : shippingError ? (
                      "Unavailable"
                    ) : shippingCalculated ? (
                      shipping > 0 ? formatPrice(shipping, cart) : "Free"
                    ) : !isAddressComplete ? (
                      <span className="text-foreground-muted">Enter address</span>
                    ) : (
                      <span className="text-foreground-muted">Pending</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Tax</span>
                  <span className="font-medium">
                    {tax > 0
                      ? formatPrice(tax, cart)
                      : isTaxInclusive
                        ? "Included"
                        : shippingCalculated
                          ? "Included"
                          : <span className="text-foreground-muted">Pending</span>}
                  </span>
                </div>
              </div>

              {appliedPromotions.length > 0 && (
                <div className="space-y-1">
                  {appliedPromotions.map((promo) => (
                    <div key={promo.id} className="flex items-center gap-2 text-xs text-green-600">
                      <Tag className="h-3 w-3" />
                      <span>{promo.code || "Promotion applied"}</span>
                    </div>
                  ))}
                </div>
              )}

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
