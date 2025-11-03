import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const { collections } = await listCollections()
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-border w-full bg-background-secondary">
      <div className="content-container flex flex-col w-full">
        {/* Main Footer Content */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between py-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-4 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="text-2xl font-bold text-foreground-primary hover:text-primary transition-colors"
            >
              CockpitSim
            </LocalizedClientLink>
            <p className="text-sm text-foreground-secondary">
              Professional flight simulation hardware for enthusiasts and professionals.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
            {/* Shop Section */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground-primary mb-1">Shop</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    All Products
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/collections"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Collections
                  </LocalizedClientLink>
                </li>
                {collections?.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Section */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground-primary mb-1">Support</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    My Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Order Status
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contact"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Contact Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground-primary mb-1">Company</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <LocalizedClientLink
                    href="/blog"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Blog
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/about"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    About Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/privacy"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/terms"
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 border-t border-border gap-4">
          <Text className="text-sm text-foreground-secondary">
            © {new Date().getFullYear()} CockpitSim. All rights reserved.
          </Text>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-primary transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-primary transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-primary transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
