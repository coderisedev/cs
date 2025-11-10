import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { BRAND_LOGO_URL, BRAND_NAME } from "@/lib/constants"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background-primary border-t border-border-primary mt-16">
      <div className="container mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center mb-4" aria-label={BRAND_NAME}>
              <Image src={BRAND_LOGO_URL} alt={BRAND_NAME} width={160} height={40} className="h-10 w-auto" sizes="160px" />
            </Link>
            <p className="text-sm text-foreground-secondary mb-4">
              Professional flight simulation hardware inspired by the DJI design system.
            </p>
            <div className="flex gap-3 text-foreground-muted">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon) => (
                <a key={Icon.name} href="#" className="hover:text-primary-400 transition-colors" aria-label={Icon.name}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground-primary">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/collections/a320-series" className="text-foreground-secondary hover:text-primary-400">A320 Series</Link></li>
              <li><Link href="/collections/737-series" className="text-foreground-secondary hover:text-primary-400">737 Series</Link></li>
              <li><Link href="/collections/accessories" className="text-foreground-secondary hover:text-primary-400">Accessories</Link></li>
              <li><Link href="/products" className="text-foreground-secondary hover:text-primary-400">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground-primary">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support" className="text-foreground-secondary hover:text-primary-400">Support Center</Link></li>
              <li><Link href="/support/compatibility" className="text-foreground-secondary hover:text-primary-400">Compatibility</Link></li>
              <li><Link href="/support/faq" className="text-foreground-secondary hover:text-primary-400">FAQ</Link></li>
              <li><Link href="/blog" className="text-foreground-secondary hover:text-primary-400">Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-foreground-secondary">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary-400 mt-0.5" />
                <a href="mailto:support@dji-storefront.com" className="hover:text-primary-400">support@dji-storefront.com</a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-primary-400 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary-400 mt-0.5" />
                <span>123 Flight Deck Blvd<br />San Jose, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-primary pt-6 flex flex-col md:flex-row justify-between text-sm text-foreground-muted gap-4">
          <p>&copy; {currentYear} DJI Storefront. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary-400">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-400">Terms</Link>
            <Link href="/shipping" className="hover:text-primary-400">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
