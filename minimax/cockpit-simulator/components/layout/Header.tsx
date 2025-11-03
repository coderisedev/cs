'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Search, Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/products' },
    { name: 'A320 Series', href: '/collections/a320-series' },
    { name: '737 Series', href: '/collections/737-series' },
    { name: 'Accessories', href: '/collections/accessories' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mobile-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cockpit Simulator
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex touch-target"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/account">
              <Button variant="ghost" size="icon" className="touch-target">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative touch-target">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden touch-target"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-3 sm:py-4 animate-fade-in">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full max-w-md touch-target"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t animate-slide-in bg-white">
          <nav className="mobile-container py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-item block rounded-lg transition-colors hover:bg-gray-50 ${
                  isActive(item.href) ? 'text-primary bg-primary/5' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile-only actions */}
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchOpen(!searchOpen)
                  setMobileMenuOpen(false)
                }}
                className="flex-1 touch-target"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Link href="/account" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full touch-target">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
