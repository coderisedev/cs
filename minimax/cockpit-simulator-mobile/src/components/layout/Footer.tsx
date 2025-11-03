import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background-primary border-t border-border-primary transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-foreground-primary text-lg font-bold mb-4 text-gradient transition-colors duration-300">
              Cockpit Simulator
            </h3>
            <p className="text-sm mb-4 text-foreground-secondary transition-colors duration-300">
              Professional flight simulation hardware for serious enthusiasts. 
              Build your dream cockpit with authentic aircraft controls.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-foreground-primary font-semibold mb-4 transition-colors duration-300">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/collections/a320-series" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">A320 Series</Link></li>
              <li><Link to="/collections/737-series" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Boeing 737 Series</Link></li>
              <li><Link to="/collections/777-series" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Boeing 777 Series</Link></li>
              <li><Link to="/collections/accessories" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Accessories</Link></li>
              <li><Link to="/products" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">All Products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-foreground-primary font-semibold mb-4 transition-colors duration-300">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support/installation" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Installation Guides</Link></li>
              <li><Link to="/support/compatibility" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Compatibility</Link></li>
              <li><Link to="/support/drivers" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Driver Downloads</Link></li>
              <li><Link to="/support/faq" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">FAQ</Link></li>
              <li><Link to="/contact" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground-primary font-semibold mb-4 transition-colors duration-300">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary-400" />
                <a href="mailto:support@cockpit-simulator.com" className="text-foreground-secondary hover:text-primary-400 transition-colors duration-300">
                  support@cockpit-simulator.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary-400" />
                <span className="text-foreground-secondary transition-colors duration-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary-400" />
                <span className="text-foreground-secondary transition-colors duration-300">123 Aviation Way<br />Flight Sim City, FS 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-primary pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm transition-colors duration-300">
          <p className="text-foreground-muted transition-colors duration-300">&copy; {currentYear} Cockpit Simulator. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">Terms of Service</Link>
            <Link to="/shipping" className="text-foreground-muted hover:text-primary-400 transition-colors duration-300">Shipping Info</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
