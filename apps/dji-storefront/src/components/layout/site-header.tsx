"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart, Search, Menu, User, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BRAND_LOGO_URL, BRAND_LOGO_URL_DARK, BRAND_NAME } from "@/lib/constants"

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "All Products", href: "/products" },
  { name: "Post", href: "/announcements/latest" },
  { name: "Software", href: "/software" },
  { name: "Blog", href: "/blog" },
  { name: "Community", href: "/community" },
  { name: "FAQ", href: "/faq" },
]

export function SiteHeader({ cartItemCount = 0 }: { cartItemCount?: number }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return
      setCondensed(window.scrollY > 64)
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
        "sticky top-0 z-50 w-full border-b border-border-primary bg-background-primary/95 backdrop-blur-md transition-all duration-300",
        condensed ? "shadow-lg" : "shadow-sm"
      )}
    >
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 lg:px-12">
        <div className={cn("flex items-center justify-between transition-all duration-300", condensed ? "h-14" : "h-16")}>
          <Link href="/" className="inline-flex items-center" aria-label={BRAND_NAME}>
            <div className="relative w-[144px]" style={{ height: condensed ? 48 : 56 }}>
              <Image
                src={BRAND_LOGO_URL}
                alt={BRAND_NAME}
                fill
                priority
                className={cn("object-contain transition-opacity duration-300", isDarkMode ? "opacity-0" : "opacity-100")}
                sizes="(max-width: 768px) 40vw, 144px"
              />
              <Image
                src={BRAND_LOGO_URL_DARK}
                alt={`${BRAND_NAME} dark logo`}
                fill
                priority
                className={cn("object-contain transition-opacity duration-300", isDarkMode ? "opacity-100" : "opacity-0")}
                sizes="(max-width: 768px) 40vw, 144px"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-primary-400 ${isActive(item.href)
                  ? "text-primary-500 border-b-2 border-primary-500 pb-1"
                  : "text-foreground-primary"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Theme toggle - temporarily hidden */}
            {/* <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="touch-target h-12 w-12 flex items-center justify-center p-0"
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button> */}
            {/* Search button - temporarily hidden */}
            {/* <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              className="hidden md:flex touch-target h-12 w-12 items-center justify-center p-0"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <Search className="h-4 w-4" />
            </Button> */}
            <Link href="/account" aria-label="Account">
              <Button variant="ghost" size="icon" className="touch-target h-12 w-12 flex items-center justify-center p-0">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative">
              <Button variant="ghost" size="icon" className="touch-target h-12 w-12 flex items-center justify-center p-0">
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-primary-500 text-neutral-50 text-xs flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden touch-target"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {condensed && <div className="h-0.5 bg-primary-500/80" />}
      {searchOpen && (
        <div className="relative z-50">
          <div className="container mx-auto px-4 lg:px-12 py-3 animate-scale-in origin-top">
            <Input type="search" placeholder="Search products..." className="max-w-md" autoFocus />
          </div>
          <button
            aria-label="Close search overlay"
            className="fixed inset-0 z-40 bg-background-overlay/60 lg:hidden"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      )}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-primary bg-background-primary animate-slide-up">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-base px-4 py-3 text-sm font-medium transition-colors duration-300 hover:bg-background-secondary ${isActive(item.href) ? "text-primary-500 bg-background-secondary" : "text-foreground-primary"
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
