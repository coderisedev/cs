import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b ">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted transition-colors hover:text-foreground-base small:block">
              Back to shopping cart
            </span>
            <span className="mt-px block text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted transition-colors hover:text-foreground-base small:hidden">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="text-2xl font-semibold uppercase tracking-tight text-foreground-muted hover:text-foreground-base"
            data-testid="store-link"
          >
            Medusa Store
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
    </div>
  )
}
