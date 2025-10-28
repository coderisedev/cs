export function getPaypalCheckoutLink(): string | null {
  const link = process.env.NEXT_PUBLIC_PAYPAL_LINK || process.env.PAYPAL_PAYMENT_LINK
  if (!link) return null
  return link
}

