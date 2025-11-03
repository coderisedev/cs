import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Order, Address, WishlistItem } from '@/types'
import { useTheme } from '../contexts/ThemeContext'

// Mock data - 在实际应用中这些会从 API 或状态管理中获取
const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  phone: '+1 (555) 123-4567',
  dateJoined: '2023-01-15',
  preferences: {
    newsletter: true,
    notifications: true,
    language: 'en',
    currency: 'USD'
  },
  addresses: [
    {
      id: '1',
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true
    }
  ]
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-10-15',
    status: 'delivered',
    total: 1249.97,
    subtotal: 1149.97,
    shipping: 50.00,
    tax: 50.00,
    items: [
      {
        id: '1',
        product: {
          id: 'cdu',
          handle: 'a320-cdu',
          title: 'A320 CDU Display',
          description: 'Control Display Unit for Airbus A320',
          price: 499.99,
          images: ['/api/placeholder/300/300'],
          category: 'avionics',
          collection: 'a320-series',
          variants: [],
          tags: ['a320', 'cdu', 'display'],
          rating: 4.8,
          reviewCount: 24,
          inStock: true
        },
        variant: {
          id: 'default',
          title: 'Standard',
          price: 499.99,
          inStock: true
        },
        quantity: 1,
        price: 499.99
      },
      {
        id: '2',
        product: {
          id: 'fcu',
          handle: 'a320-fcu',
          title: 'A320 FCU Panel',
          description: 'Flight Control Unit for Airbus A320',
          price: 749.99,
          images: ['/api/placeholder/300/300'],
          category: 'avionics',
          collection: 'a320-series',
          variants: [],
          tags: ['a320', 'fcu', 'control'],
          rating: 4.9,
          reviewCount: 18,
          inStock: true
        },
        variant: {
          id: 'default',
          title: 'Standard',
          price: 749.99,
          inStock: true
        },
        quantity: 1,
        price: 749.99
      }
    ],
    shippingAddress: mockUser.addresses[0],
    billingAddress: mockUser.addresses[0],
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-10-20'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-09-28',
    status: 'shipped',
    total: 899.99,
    subtotal: 849.99,
    shipping: 50.00,
    tax: 0.00,
    items: [
      {
        id: '3',
        product: {
          id: 'overhead',
          handle: 'a320-overhead',
          title: 'A320 Overhead Panel',
          description: 'Complete overhead control panel for Airbus A320',
          price: 899.99,
          images: ['/api/placeholder/300/300'],
          category: 'avionics',
          collection: 'a320-series',
          variants: [],
          tags: ['a320', 'overhead', 'panel'],
          rating: 4.7,
          reviewCount: 12,
          inStock: true
        },
        variant: {
          id: 'default',
          title: 'Standard',
          price: 899.99,
          inStock: true
        },
        quantity: 1,
        price: 899.99
      }
    ],
    shippingAddress: mockUser.addresses[0],
    billingAddress: mockUser.addresses[0],
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-11-05'
  }
]

const mockWishlist: WishlistItem[] = [
  {
    id: '1',
    product: {
      id: '737-fcu',
      handle: '737-fcu',
      title: 'Boeing 737 FCU Panel',
      description: 'Flight Control Unit for Boeing 737 series',
      price: 799.99,
      images: ['/api/placeholder/300/300'],
      category: 'avionics',
      collection: '737-series',
      variants: [],
      tags: ['737', 'fcu', 'control'],
      rating: 4.6,
      reviewCount: 8,
      inStock: true
    },
    addedDate: '2024-10-01'
  }
]

const statusColors = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500'
}

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

export function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const { isDark } = useTheme()

  const handleSaveProfile = () => {
    // 在实际应用中，这里会保存到后端
    setIsEditing(false)
  }

  const getStatusColor = (status: Order['status']) => {
    return statusColors[status]
  }

  const getStatusLabel = (status: Order['status']) => {
    return statusLabels[status]
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>
          My Account
        </h1>
        <p className={`transition-colors duration-300 ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>
          Manage your personal information, orders, and preferences
        </p>
      </div>

      {/* Account Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-background-secondary">
          <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
          <TabsTrigger value="orders" className="text-sm">Orders</TabsTrigger>
          <TabsTrigger value="addresses" className="text-sm">Addresses</TabsTrigger>
          <TabsTrigger value="wishlist" className="text-sm">Wishlist</TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your profile and contact information</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className={isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}>Member since {new Date(user.dateJoined).toLocaleDateString('en-US')}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user.firstName}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user.lastName}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={user.phone || ''}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View all your orders and delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockOrders.map((order) => (
                  <div key={order.id} className="border border-border rounded-base p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="mb-2 md:mb-0">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>
                          Order #{order.orderNumber}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>
                          {new Date(order.date).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-background-elevated rounded-base flex items-center justify-center">
                            <span className={`text-xs ${isDark ? 'text-foreground-muted' : 'text-foreground-muted'}`}>Product Image</span>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>{item.product.title}</h4>
                            <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="bg-background-elevated rounded-base p-4 mb-4">
                        <h4 className={`font-medium mb-2 ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>Shipping Information</h4>
                        <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>
                          Tracking Number: {order.trackingNumber}
                        </p>
                        {order.estimatedDelivery && (
                          <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>
                            Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Review Products
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button variant="outline" size="sm">
                          Track Package
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Address Management</CardTitle>
                  <CardDescription>Manage your shipping and billing addresses</CardDescription>
                </div>
                <Button>
                  Add New Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.addresses.map((address) => (
                  <div key={address.id} className="border border-border rounded-base p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>
                            {address.firstName} {address.lastName}
                          </h3>
                          <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                            {address.type === 'shipping' ? 'Shipping' : 'Billing'}
                          </span>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className={isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}>
                          {address.address1}<br />
                          {address.city}, {address.state} {address.zipCode}<br />
                          {address.country}
                        </p>
                        {address.phone && (
                          <p className={`mt-2 ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>{address.phone}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Your saved products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockWishlist.map((item) => (
                  <div key={item.id} className="border border-border rounded-base p-4 hover:shadow-md transition-all duration-300">
                    <div className="w-full h-48 bg-background-elevated rounded-base mb-4 flex items-center justify-center">
                      <span className={isDark ? 'text-foreground-muted' : 'text-foreground-muted'}>Product Image</span>
                    </div>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>{item.product.title}</h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>{item.product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>${item.product.price.toFixed(2)}</span>
                      <Button size="sm">
                        Add to Cart
                      </Button>
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? 'text-foreground-muted' : 'text-foreground-muted'}`}>
                      Added on {new Date(item.addedDate).toLocaleDateString('en-US')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your notifications and language preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>Email Notifications</h4>
                    <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>Receive order updates and promotional information</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>Newsletter Subscription</h4>
                    <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>Subscribe to our newsletter</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {user.preferences.newsletter ? 'Subscribed' : 'Not Subscribed'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>Language</h4>
                    <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>Choose your preferred language</p>
                  </div>
                  <Button variant="outline" size="sm">
                    English (US)
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-foreground-primary' : 'text-foreground-primary'}`}>Currency</h4>
                    <p className={`text-sm ${isDark ? 'text-foreground-secondary' : 'text-foreground-secondary'}`}>Choose your preferred currency</p>
                  </div>
                  <Button variant="outline" size="sm">
                    USD ($)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Login Activity
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
