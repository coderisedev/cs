import { Link } from 'react-router-dom'
import { User, Package, MapPin, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function AccountPage() {
  const user = {
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  }

  const stats = [
    { label: '待付款', value: 2, icon: Package },
    { label: '待收货', value: 3, icon: Package },
    { label: '愿望清单', value: 12, icon: Heart },
    { label: '收货地址', value: 2, icon: MapPin },
  ]

  const recentOrders = [
    {
      id: '1',
      orderNumber: 'ORD-20251028-001',
      date: '2025-10-28',
      total: 599.99,
      status: '已发货',
      items: 2,
    },
    {
      id: '2',
      orderNumber: 'ORD-20251025-002',
      date: '2025-10-25',
      total: 299.99,
      status: '已完成',
      items: 1,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">快捷入口</h2>
              <nav className="space-y-2">
                <Link to="/account/orders" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span>我的订单</span>
                  </div>
                </Link>
                <Link to="/account/profile" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <span>个人资料</span>
                  </div>
                </Link>
                <Link to="/account/addresses" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span>收货地址</span>
                  </div>
                </Link>
                <Link to="/wishlist" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span>愿望清单</span>
                  </div>
                </Link>
              </nav>
            </Card>
          </div>

          {/* Recent Orders */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">最近订单</h2>
                <Link to="/account/orders">
                  <Button variant="ghost" size="sm">查看全部</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === '已完成' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{order.items} 件商品</p>
                      <p className="font-bold">¥{order.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
