import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { BRAND_LOGO_URL, BRAND_NAME } from "@/lib/constants"

// Discord icon (not available in lucide-react)
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

const socialLinks = [
  { Icon: Facebook, name: "Facebook", href: "https://www.facebook.com/cs.simulator" },
  { Icon: Twitter, name: "Twitter", href: "https://x.com/cockpitsimulat1" },
  { Icon: Instagram, name: "Instagram", href: "https://www.instagram.com/cockpit_simulator/" },
  { Icon: Youtube, name: "Youtube", href: "https://www.youtube.com/@Cockpit-Simulator" },
  { Icon: DiscordIcon, name: "Discord", href: "https://discord.gg/S9QDBMsTde" },
]

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background-primary border-t border-border-primary mt-16">
      <div className="container mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center mb-4" aria-label={BRAND_NAME}>
              <Image
                src={BRAND_LOGO_URL}
                alt={BRAND_NAME}
                width={200}
                height={48}
                className="h-14 w-auto dark:invert dark:brightness-150"
                sizes="200px"
              />
            </Link>
            <p className="text-sm text-foreground-secondary mb-4">
              Professional flight simulation hardware inspired by the Cockpit Simulator system.
            </p>
            <div className="flex gap-3 text-foreground-muted">
              {socialLinks.map(({ Icon, name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors"
                  aria-label={name}
                >
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
              <li><Link href="/faq" className="text-foreground-secondary hover:text-primary-400">FAQ</Link></li>
              <li><Link href="/blog" className="text-foreground-secondary hover:text-primary-400">Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-foreground-secondary">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary-400 mt-0.5" />
                <a href="mailto:support@cockpit-simulator.com" className="hover:text-primary-400">support@cockpit-simulator .com</a>
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
          <p>&copy; {currentYear} Cockpit Simulator. All rights reserved.</p>
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
