import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react'

export function Footer() {
  const footerLinks = {
    shop: [
      { name: '全部商品', href: '/products' },
      { name: '新品上市', href: '/collections/new-arrivals' },
      { name: '促销活动', href: '/collections/sale' },
      { name: '精选推荐', href: '/collections/featured' },
    ],
    help: [
      { name: '配送信息', href: '/help/shipping' },
      { name: '退换货政策', href: '/help/returns' },
      { name: '常见问题', href: '/help/faq' },
      { name: '联系我们', href: '/contact' },
    ],
    account: [
      { name: '我的账户', href: '/account' },
      { name: '订单追踪', href: '/account/orders' },
      { name: '愿望清单', href: '/wishlist' },
    ],
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-4">
              MiniShop
            </h3>
            <p className="text-sm mb-4">
              您值得信赖的在线购物平台，为您提供优质产品和卓越服务。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">购物指南</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">帮助中心</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">订阅资讯</h4>
            <p className="text-sm mb-4">订阅即可获得专属优惠和最新资讯</p>
            <div className="flex">
              <input
                type="email"
                placeholder="输入邮箱地址"
                className="flex-1 px-4 py-2 rounded-l-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-600 transition-colors">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2025 MiniShop. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  )
}
