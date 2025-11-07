"use client"

import Link from "next/link"
import { useEffect, useState, useActionState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { currencyFormatter } from "@/lib/number"
import type { AccountOrder, AccountUser, WishlistItem } from "@/lib/data/account"
import { updateCustomerProfile } from "@/lib/actions/account"
import { Loader2 } from "lucide-react"

type EditableProfileField = "firstName" | "lastName" | "phone"

type AccountOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

type AccountClientProps = {
  user: AccountUser | null
  orders: AccountOrder[]
  wishlist: WishlistItem[]
}

const STATUS_STYLES: Record<AccountOrderStatus, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
}

const STATUS_LABELS: Record<AccountOrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

const getSeriesLabel = (handle: string) => handle.split("-")[0]?.toUpperCase() ?? "DJI"

export function AccountClient({ user, orders, wishlist }: AccountClientProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [mutableUser, setMutableUser] = useState(user)
  const [isEditing, setIsEditing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [updateResult, updateAction, isPending] = useActionState(updateCustomerProfile, null)
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null)

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
            <Link href="/us/login">
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

  useEffect(() => {
    const id = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (updateResult?.success) {
      setIsEditing(false)
      // Refresh user data
      if (mutableUser) {
        setMutableUser({ ...mutableUser })
      }
    }
  }, [updateResult])

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
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground-muted">Account</p>
        <h1 className="text-4xl font-semibold text-foreground-primary">My Account</h1>
        <p className="text-foreground-secondary max-w-2xl">
          Manage your personal information, review orders, maintain addresses, and control storefront preferences – fully
          aligned with the cockpit simulator experience.
        </p>
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
              <form ref={setFormRef} id="profile-form" action={updateAction} className="space-y-8">
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
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-base bg-background-elevated text-xs text-foreground-muted">
                            Product Image
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground-primary">{item.title}</p>
                            <p className="text-sm text-foreground-secondary">
                              {item.variant_title || "Default"} · Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground-primary">{currencyFormatter(item.unit_price ?? 0)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/us/order/${order.id}/confirmed`}>
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
                <Button>Add New Address</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hydrated ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={`address-skeleton-${index}`} className="rounded-base border border-border-primary p-6 animate-pulse space-y-3">
                    <div className="h-4 w-1/3 rounded bg-foreground-muted/20" />
                    <div className="h-3 w-2/3 rounded bg-foreground-muted/10" />
                    <div className="h-3 w-1/2 rounded bg-foreground-muted/10" />
                  </div>
                ))
              ) : mutableUser.addresses.length === 0 ? (
                <p className="text-sm text-foreground-secondary">No addresses on file.</p>
              ) : (
                mutableUser.addresses.map((address) => (
                  <div key={address.id} className="rounded-base border border-border-primary p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground-primary">
                          {address.firstName} {address.lastName}
                        </h3>
                        <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white capitalize">
                          {address.type}
                        </span>
                        {address.isDefault && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">Default</span>}
                      </div>
                      <p className="mt-2 text-sm text-foreground-secondary">
                        {address.address1}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                        <br />
                        {address.country}
                      </p>
                      {address.phone && <p className="mt-2 text-sm text-foreground-secondary">{address.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
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
              ) : wishlist.length === 0 ? (
                <p className="text-sm text-foreground-secondary">No items saved yet.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {wishlist.map((item) => (
                    <div key={item.id} className="rounded-base border border-border-primary p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div
                        className="mb-4 h-48 w-full rounded-base bg-cover bg-center bg-background-elevated"
                      >
                        <div className="flex h-full w-full items-center justify-center text-sm text-foreground-muted">Product Image</div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground-primary">{item.product.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold px-3 py-1 mt-1">
                        {getSeriesLabel(item.product.handle || "")} SERIES
                      </span>
                      <p className="mt-2 line-clamp-2 text-sm text-foreground-secondary">{item.product.description}</p>
                      <div className="mt-4 border-t border-border-secondary pt-3 space-y-3">
                        <span className="text-lg font-semibold text-foreground-primary">$0.00</span>
                        <Button size="sm" className="w-full justify-center">
                          Add to Cart
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-foreground-muted">Added on {formatDate(item.addedDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Matches cockpit settings structure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PreferenceRow
                  title="Email Notifications"
                  description="Receive order updates and cockpit news"
                  value={mutableUser.preferences.notifications ? "Enabled" : "Disabled"}
                />
                <PreferenceRow
                  title="Newsletter Subscription"
                  description="Stay up to date with launch content"
                  value={mutableUser.preferences.newsletter ? "Subscribed" : "Not Subscribed"}
                />
                <PreferenceRow title="Language" description="Preferred storefront language" value={mutableUser.preferences.language} />
                <PreferenceRow title="Currency" description="Preferred storefront currency" value={mutableUser.preferences.currency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage authentication and audit preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="justify-start">
                  Login Activity
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

type PreferenceRowProps = {
  title: string
  description: string
  value: string
}

function PreferenceRow({ title, description, value }: PreferenceRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border-secondary pb-5 last:border-b-0 last:pb-0 lg:flex-row lg:items-center">
      <div className="flex-1">
        <h4 className="text-base font-medium text-foreground-primary">{title}</h4>
        <p className="text-sm text-foreground-secondary">{description}</p>
      </div>
      <Button variant="outline" size="sm" className="self-start lg:self-auto">
        {value}
      </Button>
    </div>
  )
}
