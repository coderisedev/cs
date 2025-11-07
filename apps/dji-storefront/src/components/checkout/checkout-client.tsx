"use client"

import { useState, useActionState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { currencyFormatter } from "@/lib/number"
import { placeOrderAction } from "@/lib/actions/checkout"
import { Loader2, ShoppingBag, ArrowLeft, Package, CreditCard, MapPin } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import type { AccountAddress } from "@/lib/data/account"
import { cn } from "@/lib/utils"

type CheckoutClientProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
  customerAddresses: AccountAddress[]
}

export function CheckoutClient({ cart, customer, countryCode, customerAddresses }: CheckoutClientProps) {
  const [email, setEmail] = useState(customer?.email || cart.email || "")
  const [shippingAddress, setShippingAddress] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "us",
    phone: customer?.phone || "",
  })
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  
  const [orderMessage, orderFormAction, orderPending] = useActionState(placeOrderAction, null)

  const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
  const subtotal = cart.subtotal || 0
  const shipping = cart.shipping_total || 0
  const tax = cart.tax_total || 0
  const total = cart.total || 0

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
                    <Link className="text-xs text-primary-500" href={`/${countryCode}/account`}>
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
                    <option value="us">United States</option>
                  </select>
                  <p className="text-xs text-foreground-muted">
                    Currently, only US shipping is supported
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
            <CardContent>
              <div className="p-4 bg-background-elevated rounded-base border border-border-secondary">
                <p className="text-sm text-foreground-secondary mb-2">
                  💳 Manual Payment
                </p>
                <p className="text-xs text-foreground-muted">
                  This is a test checkout. Payment processing is handled manually.
                </p>
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
                          {currencyFormatter((item.unit_price || 0) * (item.quantity || 1))}
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
                  <span className="font-medium">{currencyFormatter(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Shipping</span>
                  <span className="font-medium">
                    {shipping > 0 ? currencyFormatter(shipping) : "Calculated at next step"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Tax</span>
                  <span className="font-medium">
                    {tax > 0 ? currencyFormatter(tax) : "Calculated at next step"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border-primary">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">{currencyFormatter(total)}</span>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={orderPending}>
                {orderPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

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
