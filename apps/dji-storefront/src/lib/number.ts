import type { CurrencyCode } from './config/regions'

/**
 * Currency formatters for supported currencies
 */
const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  EUR: new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
  }),
}

/**
 * Format a price value to currency string
 * @param value - Price in cents (e.g., 2999 = $29.99)
 * @param currency - Currency code (USD or EUR), defaults to USD
 * @returns Formatted currency string (e.g., "$29.99" or "€29.99")
 */
export const currencyFormatter = (value: number, currency: CurrencyCode = 'USD') => {
  const formatter = formatters[currency] || formatters.USD
  return formatter.format(value / 100)
}

/**
 * Format a price value using cart's region currency
 * Extracts currency from cart.region.currency_code
 * @param amount - Price in cents
 * @param cart - Cart object with optional region.currency_code
 * @returns Formatted currency string
 */
export const formatPrice = (
  amount: number,
  cart?: { region?: { currency_code?: string } } | null
) => {
  const currencyCode = cart?.region?.currency_code?.toUpperCase() as CurrencyCode
  const currency = currencyCode && formatters[currencyCode] ? currencyCode : 'USD'
  return formatters[currency].format(amount / 100)
}

/**
 * Format a price value using a currency code string
 * @param amount - Price in cents
 * @param currencyCode - Currency code string (case-insensitive)
 * @returns Formatted currency string
 */
export const formatPriceWithCurrency = (amount: number, currencyCode?: string | null) => {
  const normalizedCurrency = currencyCode?.toUpperCase() as CurrencyCode
  const currency = normalizedCurrency && formatters[normalizedCurrency] ? normalizedCurrency : 'USD'
  return formatters[currency].format(amount / 100)
}
