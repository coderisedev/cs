import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Check, CreditCard, Truck, Package, CheckCircle } from 'lucide-react'

export function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: '中国',
    phone: '',
    paymentMethod: 'card',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOrderPlaced(true)
    clearCart()
    setTimeout(() => {
      navigate('/')
    }, 5000)
  }

  const freeShippingThreshold = 299
  const shippingFee = total >= freeShippingThreshold ? 0 : 15
  const finalTotal = total + shippingFee

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart')
    return null
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6 animate-zoom-in">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">订单提交成功！</h2>
            <p className="text-gray-600">订单编号: #{Date.now().toString().slice(-8)}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            我们已向您的邮箱发送确认邮件。预计3-5个工作日内送达。
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            返回首页
          </Button>
        </Card>
      </div>
    )
  }

  const steps = [
    { id: 1, name: '配送信息', icon: Truck },
    { id: 2, name: '支付方式', icon: CreditCard },
    { id: 3, name: '确认订单', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step >= s.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs text-center font-medium">{s.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      step > s.id ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <Card className="p-6 mb-4">
                  <h2 className="text-xl font-bold mb-6">配送信息</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">电子邮箱</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">收件人姓名</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">手机号码</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">详细地址</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">城市</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">邮政编码</Label>
                        <Input
                          id="postalCode"
                          required
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-6 mb-4">
                  <h2 className="text-xl font-bold mb-6">支付方式</h2>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg mb-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        信用卡/借记卡
                      </Label>
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="alipay" id="alipay" />
                      <Label htmlFor="alipay" className="flex-1 cursor-pointer">
                        支付宝
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg mt-3">
                      <RadioGroupItem value="wechat" id="wechat" />
                      <Label htmlFor="wechat" className="flex-1 cursor-pointer">
                        微信支付
                      </Label>
                    </div>
                  </RadioGroup>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-6 mb-4">
                  <h2 className="text-xl font-bold mb-6">确认订单</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">配送信息</h3>
                      <p className="text-sm text-gray-600">
                        {formData.name}<br />
                        {formData.phone}<br />
                        {formData.address}, {formData.city}, {formData.postalCode}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">支付方式</h3>
                      <p className="text-sm text-gray-600">
                        {formData.paymentMethod === 'card' && '信用卡/借记卡'}
                        {formData.paymentMethod === 'alipay' && '支付宝'}
                        {formData.paymentMethod === 'wechat' && '微信支付'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    上一步
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
                    下一步
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1">
                    确认并支付
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="font-bold text-lg mb-4">订单摘要</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500">数量: {item.quantity}</p>
                      <p className="text-sm font-semibold">¥{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">小计</span>
                  <span>¥{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">配送费</span>
                  <span>{shippingFee === 0 ? <span className="text-success">免费</span> : `¥${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>总计</span>
                  <span className="text-primary">¥{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
