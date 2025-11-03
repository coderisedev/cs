"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ShoppingCart, Search, Menu, User, X } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SearchModal from "@modules/layout/components/search-modal"

interface NavProps {
  cart?: any
}

export default function Nav({ cart }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "All Products", href: "/store" },
    { name: "Collections", href: "/collections" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ]

  // Extract country code from pathname (e.g., /dk/store -> /store)
  const getCleanPath = (path: string) => {
    const pathParts = path.split("/").filter(Boolean)
    if (pathParts.length > 0 && pathParts[0].length === 2) {
      // Remove country code
      return "/" + pathParts.slice(1).join("/")
    }
    return path
  }

  const isActive = (itemHref: string) => {
    const cleanPathname = getCleanPath(pathname)
    if (itemHref === "/") {
      return cleanPathname === "/" || cleanPathname === ""
    }
    return cleanPathname.startsWith(itemHref)
  }

  const totalItems = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="mobile-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            data-testid="nav-store-link"
          >
            Cockpit Simulator
          </LocalizedClientLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <LocalizedClientLink
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? "text-primary" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.name}
              </LocalizedClientLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
            >
              <Search className="h-5 w-5" />
            </button>

            <LocalizedClientLink href="/account">
              <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target">
                <User className="h-5 w-5" />
              </button>
            </LocalizedClientLink>

            <LocalizedClientLink href="/cart">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </LocalizedClientLink>

            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t animate-slide-in bg-white dark:bg-gray-900">
          <nav className="mobile-container py-2">
            {navigation.map((item) => (
              <LocalizedClientLink
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-item block rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isActive(item.href) ? "text-primary bg-primary/5" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.name}
              </LocalizedClientLink>
            ))}

            {/* Mobile-only actions */}
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen)
                  setMobileMenuOpen(false)
                }}
                className="flex-1 h-10 px-4 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
              <LocalizedClientLink href="/account" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-10 px-4 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </button>
              </LocalizedClientLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
