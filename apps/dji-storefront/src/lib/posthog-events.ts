/**
 * PostHog E-commerce Event Tracking
 *
 * Standard e-commerce events for product analytics.
 * These events follow common e-commerce tracking patterns.
 */

import { trackEvent, identifyUser, setUserProperties } from "./posthog"

// ==========================================
// User Events
// ==========================================

/**
 * Track user sign up
 */
export function trackSignUp(method: "email" | "google" | "discord"): void {
  trackEvent("user_signed_up", { method })
}

/**
 * Track user login
 */
export function trackLogin(
  userId: string,
  email?: string,
  method?: "email" | "google" | "discord"
): void {
  identifyUser(userId, { email })
  trackEvent("user_logged_in", { method })
}

/**
 * Track user logout
 */
export function trackLogout(): void {
  trackEvent("user_logged_out")
}

// ==========================================
// Product Events
// ==========================================

interface ProductInfo {
  id: string
  name: string
  price?: number
  currency?: string
  category?: string
  variant?: string
}

/**
 * Track product view
 */
export function trackProductViewed(product: ProductInfo): void {
  trackEvent("product_viewed", {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    currency: product.currency,
    category: product.category,
    variant: product.variant,
  })
}

/**
 * Track product added to cart
 */
export function trackAddToCart(product: ProductInfo, quantity: number): void {
  trackEvent("product_added_to_cart", {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    currency: product.currency,
    quantity,
    value: (product.price || 0) * quantity,
  })
}

/**
 * Track product removed from cart
 */
export function trackRemoveFromCart(
  product: ProductInfo,
  quantity: number
): void {
  trackEvent("product_removed_from_cart", {
    product_id: product.id,
    product_name: product.name,
    quantity,
  })
}

// ==========================================
// Cart Events
// ==========================================

interface CartInfo {
  cartId: string
  itemCount: number
  totalValue: number
  currency: string
}

/**
 * Track cart viewed
 */
export function trackCartViewed(cart: CartInfo): void {
  trackEvent("cart_viewed", {
    cart_id: cart.cartId,
    item_count: cart.itemCount,
    total_value: cart.totalValue,
    currency: cart.currency,
  })
}

// ==========================================
// Checkout Events
// ==========================================

interface CheckoutInfo {
  cartId: string
  step: number
  stepName: string
  totalValue: number
  currency: string
  itemCount: number
}

/**
 * Track checkout step
 */
export function trackCheckoutStep(checkout: CheckoutInfo): void {
  trackEvent("checkout_step_completed", {
    cart_id: checkout.cartId,
    step: checkout.step,
    step_name: checkout.stepName,
    total_value: checkout.totalValue,
    currency: checkout.currency,
    item_count: checkout.itemCount,
  })
}

/**
 * Track checkout started
 */
export function trackCheckoutStarted(cart: CartInfo): void {
  trackEvent("checkout_started", {
    cart_id: cart.cartId,
    item_count: cart.itemCount,
    total_value: cart.totalValue,
    currency: cart.currency,
  })
}

/**
 * Track payment info entered
 */
export function trackPaymentInfoEntered(paymentMethod: string): void {
  trackEvent("payment_info_entered", {
    payment_method: paymentMethod,
  })
}

// ==========================================
// Order Events
// ==========================================

interface OrderInfo {
  orderId: string
  totalValue: number
  currency: string
  itemCount: number
  paymentMethod?: string
  shippingMethod?: string
}

/**
 * Track order completed (purchase)
 */
export function trackOrderCompleted(order: OrderInfo): void {
  trackEvent("order_completed", {
    order_id: order.orderId,
    total_value: order.totalValue,
    currency: order.currency,
    item_count: order.itemCount,
    payment_method: order.paymentMethod,
    shipping_method: order.shippingMethod,
  })

  // Also set user property for total purchases
  setUserProperties({
    last_purchase_date: new Date().toISOString(),
  })
}

// ==========================================
// Search Events
// ==========================================

/**
 * Track product search
 */
export function trackProductSearch(
  query: string,
  resultsCount: number
): void {
  trackEvent("product_searched", {
    search_query: query,
    results_count: resultsCount,
  })
}

// ==========================================
// Blog/Content Events
// ==========================================

/**
 * Track blog article viewed
 */
export function trackArticleViewed(
  articleId: string,
  title: string,
  category?: string
): void {
  trackEvent("article_viewed", {
    article_id: articleId,
    title,
    category,
  })
}

// ==========================================
// Newsletter Events
// ==========================================

/**
 * Track newsletter subscription
 */
export function trackNewsletterSubscribed(source?: string): void {
  trackEvent("newsletter_subscribed", {
    source,
  })
}
