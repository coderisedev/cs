import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useCart } from '../../contexts/CartContext'
import { ThemeToggle } from '../ui/theme-toggle'
import { useTheme } from '../../contexts/ThemeContext'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const { itemCount } = useCart()
  const { isDark } = useTheme()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/products' },
    { name: 'A320 Series', href: '/collections/a320-series' },
    { name: '737 Series', href: '/collections/737-series' },
    { name: 'Accessories', href: '/collections/accessories' },
    { name: 'Software', href: '/software' },
    { name: 'Blog', href: '/blog' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-primary bg-background-primary/95 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl lg:text-2xl font-semibold text-gradient">
            Cockpit Simulator
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-primary-400 hover:transform hover:-translate-y-0.5 ${
                  isActive(item.href) ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-foreground-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`hidden md:flex touch-target transition-colors duration-300 ${
                isDark 
                  ? 'text-foreground-primary hover:text-primary-400 hover:bg-background-elevated' 
                  : 'text-foreground-primary hover:text-primary-500 hover:bg-background-elevated border border-border-primary'
              }`}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link to="/account">
              <Button variant="ghost" size="icon" className={`touch-target transition-colors duration-300 ${
                isDark 
                  ? 'text-foreground-primary hover:text-primary-400 hover:bg-background-elevated' 
                  : 'text-foreground-primary hover:text-primary-500 hover:bg-background-elevated border border-border-primary'
              }`}>
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className={`relative touch-target transition-colors duration-300 ${
                isDark 
                  ? 'text-foreground-primary hover:text-primary-400 hover:bg-background-elevated' 
                  : 'text-foreground-primary hover:text-primary-500 hover:bg-background-elevated border border-border-primary'
              }`}>
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-500 text-neutral-50 text-xs flex items-center justify-center font-bold transition-colors duration-300">
                  {itemCount}
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden touch-target text-foreground-primary hover:text-primary-400 hover:bg-background-elevated transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 animate-fade-in">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full max-w-md touch-target bg-background-elevated border-border-primary text-foreground-primary placeholder:text-foreground-muted focus:border-primary-500 focus:ring-primary-500 transition-colors duration-300"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-primary animate-slide-up bg-background-primary transition-colors duration-300">
          <nav className="container mx-auto px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-base px-4 py-3 transition-colors duration-300 hover:bg-background-elevated ${
                  isActive(item.href) ? 'text-primary-500 bg-background-elevated' : 'text-foreground-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile-only actions */}
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border-primary transition-colors duration-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchOpen(!searchOpen)
                  setMobileMenuOpen(false)
                }}
                className="flex-1 touch-target text-foreground-primary hover:text-primary-400 hover:bg-background-elevated transition-colors duration-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Link to="/account" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full touch-target text-foreground-primary hover:text-primary-400 hover:bg-background-elevated transition-colors duration-300">
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
