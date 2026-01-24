"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { currencyFormatter } from "@/lib/number"
import type { AccountOrder, AccountUser, WishlistItem as AccountWishlistItem } from "@/lib/data/account"
import { REGIONS, getCountryName, getCountryFlag } from "@/lib/config/regions"
import {
  addCustomerAddress,
  deleteCustomerAddress,
  updateCustomerAddress,
  updateCustomerPreferences,
  updateCustomerProfile,
} from "@/lib/actions/account"
import { Loader2 } from "lucide-react"
import { useWishlist, WishlistItem as LocalWishlistItem } from "@/lib/context/wishlist-context"

type EditableProfileField = "firstName" | "lastName" | "phone"

type AccountClientProps = {
  user: AccountUser | null
  orders: AccountOrder[]
  wishlist: AccountWishlistItem[]
  onSignOut: (formData: FormData) => Promise<void>
  defaultTab?: string
  countryCode: string
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

const getSeriesLabel = (handle: string) => handle.split("-")[0]?.toUpperCase() ?? "DJI"

const resolveImageUrl = (image: unknown): string | null => {
  if (typeof image === "string") {
    return image || null
  }

  if (image && typeof image === "object") {
    const { url } = image as { url?: unknown }
    return typeof url === "string" && url.length > 0 ? url : null
  }

  return null
}

const VALID_TABS = ["profile", "orders", "addresses", "wishlist", "settings"]

export function AccountClient({ user, orders, wishlist, onSignOut, defaultTab, countryCode }: AccountClientProps) {
  const router = useRouter()
  const initialTab = defaultTab && VALID_TABS.includes(defaultTab) ? defaultTab : "profile"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [mutableUser, setMutableUser] = useState(user)
  const [isEditing, setIsEditing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [updateResult, updateAction, isPending] = useActionState(updateCustomerProfile, null)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [preferencesState, preferencesAction, preferencesPending] = useActionState(updateCustomerPreferences, {
    success: false,
    error: null,
  })
  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlist()
  const fallbackWishlist = useMemo<LocalWishlistItem[]>(
    () =>
      wishlist.map((item) => {
        const productThumbnail = resolveImageUrl(item.product.thumbnail)
        const firstImage = resolveImageUrl(item.product.images?.[0])

        return {
          id: item.product.id,
          title: item.product.title,
          handle: item.product.handle ?? item.product.id,
          thumbnail: productThumbnail ?? firstImage,
          description: item.product.description ?? "",
          price: 0,
          addedAt: item.addedDate,
        }
      }),
    [wishlist]
  )
  const displayedWishlist = hydrated ? wishlistItems : fallbackWishlist

  useEffect(() => {
    const id = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (updateResult?.success) {
      setIsEditing(false)
      router.refresh()
    }
  }, [router, updateResult?.success])

  useEffect(() => {
    setMutableUser(user)
  }, [user])

  // If user is not authenticated, show login prompt
  if (!mutableUser) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground-secondary">
              You need to be signed in to access your account page.
            </p>
            <Link href={`/${countryCode}/login`}>
              <Button className="w-full">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = `${mutableUser.firstName.charAt(0) ?? ""}${mutableUser.lastName.charAt(0) ?? ""}`.toUpperCase()
  const addresses = mutableUser.addresses ?? []

  const handleFieldChange = (field: EditableProfileField, value: string) => {
    if (!mutableUser) return
    setMutableUser({ ...mutableUser, [field]: value })
  }

  const handleCancelEdit = () => {
    setMutableUser(user)
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-16 space-y-10">
      <header className="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-foreground-muted">Account</p>
          <h1 className="text-4xl font-semibold text-foreground-primary">My Account</h1>
          <p className="text-foreground-secondary">
            Manage your personal information, review orders, maintain addresses, and control storefront preferences – fully
            aligned with the cockpit simulator experience.
          </p>
        </div>
        <form action={onSignOut} className="flex justify-end">
          <SignOutButton />
        </form>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-2 rounded-2xl bg-background-secondary p-1 h-full min-h-[3.5rem]">
          <TabsTrigger value="profile" className="rounded-xl py-3 text-sm font-medium w-full h-full justify-center">
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl py-3 text-sm font-medium w-full h-full justify-center">
            Orders
          </TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-xl py-3 text-sm font-medium w-full h-full justify-center">
            Addresses
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-xl py-3 text-sm font-medium w-full h-full justify-center">
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl py-3 text-sm font-medium w-full h-full justify-center">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Mirror of the cockpit simulator profile layout.</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isPending}>
                      Cancel
                    </Button>
                  )}
                  {!isEditing && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form id="profile-form" action={updateAction} className="space-y-8">
              {updateResult?.error && (
                <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                  {updateResult.error}
                </div>
              )}
              {updateResult?.success && (
                <div className="p-3 rounded-base bg-green-50 border border-green-200 text-sm text-green-600">
                  Profile updated successfully!
                </div>
              )}

              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500 text-2xl font-semibold text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground-primary">
                    {mutableUser.firstName} {mutableUser.lastName}
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    Member since {formatDate(mutableUser.dateJoined)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={mutableUser.firstName}
                    onChange={(event) => handleFieldChange("firstName", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={mutableUser.lastName}
                    onChange={(event) => handleFieldChange("lastName", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={mutableUser.email}
                    disabled={true}
                  />
                  <p className="text-xs text-foreground-muted">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={mutableUser.phone}
                    onChange={(event) => handleFieldChange("phone", event.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </Button>
                </div>
              )}
            </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>All cockpit mock orders with delivery status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hydrated ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={`order-skeleton-${index}`} className="rounded-base border border-border-primary p-6 animate-pulse space-y-4">
                    <div className="h-4 w-1/3 rounded bg-foreground-muted/20" />
                    <div className="h-3 w-1/4 rounded bg-foreground-muted/10" />
                    <div className="h-24 rounded bg-background-elevated" />
                  </div>
                ))
              ) : orders.length === 0 ? (
                <p className="text-sm text-foreground-secondary">No orders found.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-base border border-border-primary p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground-primary">Order #{order.display_id}</h3>
                        <p className="text-sm text-foreground-secondary">{formatDate(order.created_at ?? "")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={cn("rounded-full px-3 py-1 text-sm font-medium text-white bg-blue-500")}>
                          {order.fulfillment_status || "Pending"}
                        </span>
                        <p className="text-lg font-semibold text-foreground-primary">{currencyFormatter(order.total ?? 0)}</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {order.items?.map((item) => {
                        const itemThumbnail = resolveImageUrl(item.thumbnail)
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 flex-shrink-0 rounded-base bg-background-elevated overflow-hidden">
                              {itemThumbnail ? (
                                <Image
                                  src={itemThumbnail}
                                  alt={item.title || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-foreground-muted">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground-primary">{item.title}</p>
                              <p className="text-sm text-foreground-secondary">
                                {item.variant_title || "Default"} · Qty {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-foreground-primary">{currencyFormatter(item.unit_price ?? 0)}</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/${countryCode}/order/${order.id}/confirmed`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Address Management</CardTitle>
                  <CardDescription>Shipping and billing cards mirrored from the cockpit simulator.</CardDescription>
                </div>
                <Button
                  variant={isAddingAddress ? "outline" : "default"}
                  onClick={() => {
                    setIsAddingAddress((prev) => !prev)
                    setEditingAddressId(null)
                  }}
                >
                  {isAddingAddress ? "Close Form" : "Add New Address"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAddingAddress && (
                <div className="rounded-base border border-border-primary bg-background-secondary/40 p-6">
                  <div className="mb-4 space-y-1">
                    <h3 className="text-lg font-semibold text-foreground-primary">New address</h3>
                    <p className="text-sm text-foreground-secondary">
                      Save a shipping or billing destination for faster checkout.
                    </p>
                  </div>
                  <AddressForm
                    mode="create"
                    action={addCustomerAddress}
                    defaultBilling={addresses.length === 0}
                    defaultShipping={addresses.length === 0}
                    onCancel={() => setIsAddingAddress(false)}
                    onSuccess={() => {
                      setIsAddingAddress(false)
                      router.refresh()
                    }}
                  />
                </div>
              )}
              {!hydrated ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={`address-skeleton-${index}`} className="rounded-base border border-border-primary p-6 animate-pulse space-y-3">
                    <div className="h-4 w-1/3 rounded bg-foreground-muted/20" />
                    <div className="h-3 w-2/3 rounded bg-foreground-muted/10" />
                    <div className="h-3 w-1/2 rounded bg-foreground-muted/10" />
                  </div>
                ))
              ) : addresses.length === 0 ? (
                <p className="text-sm text-foreground-secondary">No addresses on file.</p>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="rounded-base border border-border-primary p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {editingAddressId === address.id ? (
                      <div>
                        <div className="mb-4 space-y-1">
                          <h3 className="text-lg font-semibold text-foreground-primary">Edit address</h3>
                          <p className="text-sm text-foreground-secondary">
                            Update the details for {address.firstName} {address.lastName}.
                          </p>
                        </div>
                        <AddressForm
                          mode="edit"
                          action={updateCustomerAddress}
                          address={address}
                          onCancel={() => setEditingAddressId(null)}
                          onSuccess={() => {
                            setEditingAddressId(null)
                            router.refresh()
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground-primary">
                              {address.firstName} {address.lastName}
                            </h3>
                            {address.isDefaultShipping && (
                              <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
                                Default Shipping
                              </span>
                            )}
                            {address.isDefaultBilling && (
                              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                                Default Billing
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-foreground-secondary">
                            {address.address1}
                            {address.address2 && (
                              <>
                                <br />
                                {address.address2}
                              </>
                            )}
                            <br />
                            {address.city}
                            {address.province ? `, ${address.province}` : ""} {address.postalCode}
                            <br />
                            {address.country || address.countryCode?.toUpperCase() || ""}
                          </p>
                          {address.phone && <p className="mt-2 text-sm text-foreground-secondary">{address.phone}</p>}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAddressId(address.id)
                              setIsAddingAddress(false)
                            }}
                          >
                            Edit
                          </Button>
                          <DeleteAddressButton
                            addressId={address.id}
                            onSuccess={() => {
                              if (editingAddressId === address.id) {
                                setEditingAddressId(null)
                              }
                              router.refresh()
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Saved cockpit simulator products.</CardDescription>
            </CardHeader>
          <CardContent>
              {!hydrated ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`wishlist-skeleton-${index}`} className="rounded-base border border-border-primary p-5 animate-pulse space-y-3">
                      <div className="h-48 w-full rounded-base bg-background-elevated" />
                      <div className="h-4 w-2/3 rounded bg-foreground-muted/20" />
                      <div className="h-3 w-1/3 rounded bg-foreground-muted/10" />
                      <div className="h-3 w-full rounded bg-foreground-muted/10" />
                    </div>
                  ))}
                </div>
              ) : displayedWishlist.length === 0 ? (
                <p className="text-sm text-foreground-secondary">No items saved yet.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {displayedWishlist.map((item) => (
                    <div key={item.id} className="rounded-base border border-border-primary p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="mb-4 h-48 w-full rounded-base bg-background-elevated overflow-hidden relative">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-foreground-muted">Product Image</div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground-primary">{item.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold px-3 py-1 mt-1">
                        {getSeriesLabel(item.handle || "")} SERIES
                      </span>
                      <p className="mt-2 line-clamp-2 text-sm text-foreground-secondary">{item.description || "Saved for later"}</p>
                      <div className="mt-4 border-t border-border-secondary pt-3 space-y-3">
                        <span className="text-lg font-semibold text-foreground-primary">{currencyFormatter(item.price)}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 justify-center" asChild>
                            <Link href={`/${countryCode}/products/${item.handle}`}>
                              View Product
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeWishlistItem(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-foreground-muted">Added on {formatDate(item.addedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive updates from us.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={preferencesAction} className="space-y-6">
                {preferencesState?.error && (
                  <div className="rounded-base border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {preferencesState.error}
                  </div>
                )}
                {preferencesState?.success && (
                  <div className="rounded-base border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    Preferences updated successfully
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-border-secondary pb-4">
                  <div>
                    <p className="font-medium text-foreground-primary">Email Notifications</p>
                    <p className="text-sm text-foreground-secondary">Receive order updates and important announcements</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifications"
                    defaultChecked={mutableUser.preferences.notifications}
                    className="h-5 w-5 rounded border-border-primary"
                  />
                </div>
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <p className="font-medium text-foreground-primary">Newsletter Subscription</p>
                    <p className="text-sm text-foreground-secondary">Stay up to date with new products and promotions</p>
                  </div>
                  <input
                    type="checkbox"
                    name="newsletter"
                    defaultChecked={mutableUser.preferences.newsletter}
                    className="h-5 w-5 rounded border-border-primary"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={preferencesPending}>
                    {preferencesPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SignOutButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="outline" disabled={pending} className="min-w-[8rem]">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        "Sign Out"
      )}
    </Button>
  )
}

type AddressActionState = { success: boolean; error: string | null }
type AddressServerAction = (
  state: AddressActionState,
  formData: FormData
) => Promise<AddressActionState>

type AddressFormProps = {
  mode: "create" | "edit"
  action: AddressServerAction
  onCancel: () => void
  onSuccess: () => void
  address?: AccountUser["addresses"][number]
  defaultShipping?: boolean
  defaultBilling?: boolean
}

function AddressForm({
  mode,
  action,
  address,
  onCancel,
  onSuccess,
  defaultShipping = false,
  defaultBilling = false,
}: AddressFormProps) {
  const [state, formAction, isSubmitting] = useActionState(action, {
    success: false,
    error: null,
  })

  useEffect(() => {
    if (state?.success) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  const defaultCountryCode = (address?.countryCode || "us").toLowerCase() || "us"

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && address && (
        <input type="hidden" name="address_id" value={address.id} />
      )}
      {mode === "create" && (
        <>
          <input type="hidden" name="is_default_shipping" value={defaultShipping ? "true" : "false"} />
          <input type="hidden" name="is_default_billing" value={defaultBilling ? "true" : "false"} />
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`address-first-name-${address?.id || "new"}`}>First Name *</Label>
          <Input
            id={`address-first-name-${address?.id || "new"}`}
            name="first_name"
            defaultValue={address?.firstName ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`address-last-name-${address?.id || "new"}`}>Last Name *</Label>
          <Input
            id={`address-last-name-${address?.id || "new"}`}
            name="last_name"
            defaultValue={address?.lastName ?? ""}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`address-company-${address?.id || "new"}`}>Company</Label>
        <Input
          id={`address-company-${address?.id || "new"}`}
          name="company"
          defaultValue={address?.company ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`address-line1-${address?.id || "new"}`}>Address *</Label>
        <Input
          id={`address-line1-${address?.id || "new"}`}
          name="address_1"
          defaultValue={address?.address1 ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`address-line2-${address?.id || "new"}`}>Apartment, suite, etc.</Label>
        <Input
          id={`address-line2-${address?.id || "new"}`}
          name="address_2"
          defaultValue={address?.address2 ?? ""}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`address-city-${address?.id || "new"}`}>City *</Label>
          <Input
            id={`address-city-${address?.id || "new"}`}
            name="city"
            defaultValue={address?.city ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`address-province-${address?.id || "new"}`}>State / Province</Label>
          <Input
            id={`address-province-${address?.id || "new"}`}
            name="province"
            defaultValue={address?.province ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`address-postal-${address?.id || "new"}`}>Postal Code *</Label>
          <Input
            id={`address-postal-${address?.id || "new"}`}
            name="postal_code"
            defaultValue={address?.postalCode ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`address-country-${address?.id || "new"}`}>Country *</Label>
          <select
            id={`address-country-${address?.id || "new"}`}
            name="country_code"
            defaultValue={defaultCountryCode}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <optgroup label={`${REGIONS.us.name} (${REGIONS.us.currency})`}>
              {REGIONS.us.countries.map((code) => (
                <option key={code} value={code}>
                  {getCountryFlag(code)} {getCountryName(code)}
                </option>
              ))}
            </optgroup>
            <optgroup label={`${REGIONS.eu.name} (${REGIONS.eu.currency})`}>
              {REGIONS.eu.countries.map((code) => (
                <option key={code} value={code}>
                  {getCountryFlag(code)} {getCountryName(code)}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`address-phone-${address?.id || "new"}`}>Phone</Label>
        <Input
          id={`address-phone-${address?.id || "new"}`}
          name="phone"
          type="tel"
          defaultValue={address?.phone ?? ""}
        />
      </div>

      {state?.error && (
        <div className="rounded-base border border-red-200 bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Save Address"
          ) : (
            "Update Address"
          )}
        </Button>
      </div>
    </form>
  )
}

function DeleteAddressButton({ addressId, onSuccess }: { addressId: string; onSuccess: () => void }) {
  const [state, formAction, isDeleting] = useActionState(deleteCustomerAddress, {
    success: false,
    error: null,
  })

  useEffect(() => {
    if (state?.success) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction} className="flex">
        <input type="hidden" name="address_id" value={addressId} />
        <Button variant="outline" size="sm" type="submit" disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </form>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  )
}
