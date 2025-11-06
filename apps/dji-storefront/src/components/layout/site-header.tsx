"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart, Search, Menu, User, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "All Products", href: "/products" },
  { name: "A320 Series", href: "/collections/a320-series" },
  { name: "737 Series", href: "/collections/737-series" },
  { name: "Accessories", href: "/collections/accessories" },
  { name: "Software", href: "/software" },
  { name: "Blog", href: "/blog" },
]

export function SiteHeader({ cartItemCount = 0 }: { cartItemCount?: number }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return
      setScrolled(window.scrollY > 40)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
    document.documentElement.classList.toggle("dark")
  }

  const isActive = (href: string) => pathname === href

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-border-primary bg-background-primary/90 backdrop-blur-md shadow-sm"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className={cn(
              "text-lg font-semibold transition-colors duration-300",
              scrolled ? "text-gradient" : "text-white"
            )}
          >
            DJI Storefront
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-300 border-b-2 border-transparent pb-1",
                  scrolled ? "text-foreground-primary hover:text-primary-500" : "text-white/85 hover:text-white",
                  isActive(item.href)
                    ? scrolled
                      ? "text-primary-500 border-primary-500"
                      : "text-white border-white/80"
                    : undefined
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className={cn(
                "touch-target transition-colors duration-300",
                scrolled ? "" : "text-white hover:bg-white/10"
              )}
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              className={cn(
                "hidden md:flex touch-target transition-colors duration-300",
                scrolled ? "" : "text-white hover:bg-white/10"
              )}
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/account" aria-label="Account">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "touch-target transition-colors duration-300",
                  scrolled ? "" : "text-white hover:bg-white/10"
                )}
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "touch-target transition-colors duration-300",
                  scrolled ? "" : "text-white hover:bg-white/10"
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-500 text-neutral-50 text-xs flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden touch-target transition-colors duration-300",
                scrolled ? "" : "text-white hover:bg-white/10"
              )}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {searchOpen && (
          <div className="py-3 animate-fade-in">
            <Input type="search" placeholder="Search products..." className="max-w-md" autoFocus />
          </div>
        )}
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-primary bg-background-primary animate-slide-up">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-base px-4 py-3 text-sm font-medium transition-colors duration-300 hover:bg-background-secondary ${
                  isActive(item.href) ? "text-primary-500 bg-background-secondary" : "text-foreground-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-border-primary">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setSearchOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
              <Link href="/account" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  <User className="h-4 w-4 mr-2" /> Account
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
