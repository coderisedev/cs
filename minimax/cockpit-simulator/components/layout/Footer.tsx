import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cockpit Simulator
            </h3>
            <p className="text-sm mb-4">
              Professional flight simulation hardware for serious enthusiasts. 
              Build your dream cockpit with authentic aircraft controls.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/collections/a320-series" className="hover:text-white transition-colors">A320 Series</Link></li>
              <li><Link href="/collections/737-series" className="hover:text-white transition-colors">Boeing 737 Series</Link></li>
              <li><Link href="/collections/777-series" className="hover:text-white transition-colors">Boeing 777 Series</Link></li>
              <li><Link href="/collections/accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support/installation" className="hover:text-white transition-colors">Installation Guides</Link></li>
              <li><Link href="/support/compatibility" className="hover:text-white transition-colors">Compatibility</Link></li>
              <li><Link href="/support/drivers" className="hover:text-white transition-colors">Driver Downloads</Link></li>
              <li><Link href="/support/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@cockpit-simulator.com" className="hover:text-white transition-colors">
                  support@cockpit-simulator.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>123 Aviation Way<br />Flight Sim City, FS 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {currentYear} Cockpit Simulator. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
