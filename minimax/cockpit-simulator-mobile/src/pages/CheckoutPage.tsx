import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Truck, Shield, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useCart } from '../contexts/CartContext'

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
}

export function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  })

  const shippingThreshold = 299
  const shippingCost = total >= shippingThreshold ? 0 : 25
  const tax = total * 0.08 // 8% tax
  const finalTotal = total + shippingCost + tax

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitOrder = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate order number
    const orderNum = 'CS' + Date.now().toString().slice(-8)
    setOrderNumber(orderNum)
    
    // Clear cart and show success
    clearCart()
    setOrderComplete(true)
    setIsProcessing(false)
  }

  const isStep1Valid = form.email && form.firstName && form.lastName && form.address && form.city && form.state && form.zipCode && form.country
  const isStep2Valid = form.cardNumber && form.expiryDate && form.cvv && form.nameOnCard

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-foreground-primary mb-4 transition-colors duration-300">No Items to Checkout</h1>
          <p className="text-foreground-secondary mb-8 transition-colors duration-300">Your cart is empty. Add some products before proceeding to checkout.</p>
          <Link to="/products">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-semantic-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-foreground-primary transition-colors duration-300" />
            </div>
            <h1 className="text-3xl font-bold text-foreground-primary mb-4 transition-colors duration-300">Order Confirmed!</h1>
            <p className="text-foreground-secondary mb-6 transition-colors duration-300">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-background-secondary rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground-primary mb-2 transition-colors duration-300">Order Number</h2>
              <p className="text-2xl font-bold text-primary-400">{orderNumber}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-foreground-secondary transition-colors duration-300">
              A confirmation email has been sent to <strong>{form.email}</strong>
            </p>
            <p className="text-foreground-muted transition-colors duration-300">
              You will receive shipping updates and tracking information within 24 hours.
            </p>
          </div>
          
          <div className="mt-8 space-x-4">
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
            <Link to="/account">
              <Button variant="outline">View Order History</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary mb-2 transition-colors duration-300">Checkout</h1>
          <p className="text-foreground-secondary transition-colors duration-300">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your order</p>
        </div>
        <Link to="/cart">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step 
                  ? 'bg-primary-500 text-foreground-primary' 
                  : 'bg-background-elevated text-foreground-muted'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary-500' : 'bg-background-elevated'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-16 text-sm">
          <span className={currentStep >= 1 ? 'text-primary-400 font-medium' : 'text-foreground-muted transition-colors duration-300'}>
            Shipping Information
          </span>
          <span className={currentStep >= 2 ? 'text-primary-400 font-medium' : 'text-foreground-muted transition-colors duration-300'}>
            Payment Method
          </span>
          <span className={currentStep >= 3 ? 'text-primary-400 font-medium' : 'text-foreground-muted transition-colors duration-300'}>
            Review Order
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card className="bg-background-secondary border-0 shadow-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground-primary mb-6 transition-colors duration-300">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="New York"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="NY"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={form.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="10001"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={form.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Valid}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <Card className="bg-background-secondary border-0 shadow-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground-primary mb-6 transition-colors duration-300">Payment Method</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      value={form.nameOnCard}
                      onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={form.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={form.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={form.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back to Shipping
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStep2Valid}
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <Card className="bg-background-secondary border-0 shadow-card">
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground-primary mb-6 transition-colors duration-300">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-background-elevated rounded-md">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground-primary transition-colors duration-300">{item.title}</h3>
                        <p className="text-sm text-foreground-muted transition-colors duration-300">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Payment
                  </Button>
                  <Button 
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="min-w-[140px]"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground-primary mr-2 transition-colors duration-300"></div>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-background-secondary border-0 shadow-card sticky top-24">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground-primary mb-6 transition-colors duration-300">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary transition-colors duration-300">Subtotal ({itemCount} items)</span>
                  <span className="text-foreground-primary font-medium transition-colors duration-300">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-foreground-secondary transition-colors duration-300">Shipping</span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-semantic-success' : 'text-foreground-primary'} transition-colors duration-300`}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-foreground-secondary transition-colors duration-300">Tax</span>
                  <span className="text-foreground-primary font-medium transition-colors duration-300">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-border-primary pt-4 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground-primary transition-colors duration-300">Total</span>
                    <span className="text-xl font-bold text-primary-400">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-3 pt-4 border-t border-border-primary transition-colors duration-300">
                <div className="flex items-center space-x-2 text-sm text-foreground-muted transition-colors duration-300">
                  <Shield className="h-4 w-4" />
                  <span>SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground-muted transition-colors duration-300">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders over $299</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground-muted transition-colors duration-300">
                  <CreditCard className="h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
