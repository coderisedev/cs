import { ReactNode } from "react"
import { WishlistProvider } from "@/lib/context/wishlist-context"

export default function CountryLayout({
  children,
}: {
  children: ReactNode
  params: { countryCode: string }
}) {
  // Plan A: countryCode is always "us" due to middleware
  return <WishlistProvider>{children}</WishlistProvider>
}
