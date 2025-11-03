import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  const freeShippingThreshold = 299
  const shippingProgress = Math.min((total / freeShippingThreshold) * 100, 100)
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center p-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">购物车是空的</h2>
            <p className="text-gray-600 mb-6">还没有添加任何商品</p>
            <Link to="/products">
              <Button>
                开始购物
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">购物车</h1>
          <p className="text-gray-600">共 {items.length} 件商品</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress */}
            {shippingProgress < 100 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    再消费 ¥{remainingForFreeShipping.toFixed(2)} 即可享受免费配送
                  </span>
                  <span className="text-sm text-primary font-semibold">
                    {shippingProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={shippingProgress} className="h-2" />
              </Card>
            )}

            {/* Cart Items */}
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-600 mb-2">
                      {item.variant.size && <span>尺寸: {item.variant.size}</span>}
                      {item.variant.color && <span className="ml-2">颜色: {item.variant.color}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">¥{(item.price * item.quantity).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-error hover:text-error hover:bg-error/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="font-bold text-lg mb-4">订单摘要</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">小计</span>
                  <span className="font-medium">¥{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">配送费</span>
                  <span className="font-medium">
                    {total >= freeShippingThreshold ? (
                      <span className="text-success">免费</span>
                    ) : (
                      '¥15.00'
                    )}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>总计</span>
                    <span className="text-primary">
                      ¥{(total >= freeShippingThreshold ? total : total + 15).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="w-full" size="lg">
                  前往结算
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="w-full mt-3">
                  继续购物
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
