import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useCart } from '../contexts/CartContext'

export function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()

  const shippingThreshold = 299
  const shippingCost = total >= shippingThreshold ? 0 : 25
  const finalTotal = total + shippingCost

  const progressPercentage = Math.min((total / shippingThreshold) * 100, 100)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-foreground-muted mx-auto mb-6 transition-colors duration-300" />
          <h1 className="text-3xl font-bold text-foreground-primary mb-4 transition-colors duration-300">Your Cart is Empty</h1>
          <p className="text-foreground-secondary mb-8 transition-colors duration-300">Add some products to get started with your cockpit simulator setup.</p>
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

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary mb-2 transition-colors duration-300">Shopping Cart</h1>
          <p className="text-foreground-secondary transition-colors duration-300">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        <Link to="/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Free Shipping Progress */}
      {total < shippingThreshold && (
        <Card className="bg-background-secondary border-0 shadow-card mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-foreground-primary font-medium transition-colors duration-300">Add ${(shippingThreshold - total).toFixed(2)} more for free shipping</span>
              <span className="text-primary-400 font-bold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-background-elevated rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-background-secondary border-0 shadow-card">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 bg-background-elevated rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground-primary mb-1 line-clamp-2 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-foreground-muted text-sm mb-3 transition-colors duration-300">{item.variant}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border-primary rounded-md transition-colors duration-300">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-background-elevated transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4 text-foreground-primary transition-colors duration-300" />
                          </button>
                          <span className="px-3 py-1 text-foreground-primary font-medium min-w-[3rem] text-center transition-colors duration-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-background-elevated transition-colors"
                          >
                            <Plus className="h-4 w-4 text-foreground-primary transition-colors duration-300" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-foreground-muted hover:text-semantic-error transition-colors duration-300"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-foreground-muted transition-colors duration-300">
                            ${item.price.toFixed(2)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Clear Cart Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-semantic-error border-semantic-error hover:bg-semantic-error hover:text-foreground-primary transition-colors duration-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
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
                
                {total < shippingThreshold && (
                  <div className="text-sm text-foreground-muted transition-colors duration-300">
                    Free shipping on orders over ${shippingThreshold}
                  </div>
                )}
                
                <div className="border-t border-border-primary pt-4 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground-primary transition-colors duration-300">Total</span>
                    <span className="text-xl font-bold text-primary-400">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout">
                <Button className="w-full h-12 text-lg mb-4" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              
              {/* Security Info */}
              <div className="text-center text-sm text-foreground-muted transition-colors duration-300">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <p>Your payment information is protected with SSL encryption</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground-primary mb-6 transition-colors duration-300">You might also like</h2>
        <div className="text-center py-8">
          <p className="text-foreground-secondary transition-colors duration-300">Recommended products will be displayed here</p>
          <Link to="/products">
            <Button className="mt-4" variant="outline">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
