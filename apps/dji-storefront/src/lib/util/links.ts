/**
 * Utility functions for handling internal links with country code prefixes.
 *
 * This module provides a consistent way to handle links that come from
 * external sources like Strapi CMS, where links are stored without
 * country code prefixes.
 *
 * Convention:
 * - Strapi stores internal links as relative paths WITHOUT country code
 *   Example: "/products/cs-737x-tq" or "/collections/accessories"
 * - External links start with "http://" or "https://"
 * - This utility automatically prepends the country code to internal links
 */

/**
 * Builds an internal link with the appropriate country code prefix.
 *
 * @param path - The path to process (can be internal or external)
 * @param countryCode - The country code to prepend to internal links
 * @returns The processed URL with country code prefix for internal links,
 *          or the original URL for external links
 *
 * @example
 * // Internal links get country code prefix
 * buildInternalLink("/products/cs-737x-tq", "cl")
 * // Returns: "/cl/products/cs-737x-tq"
 *
 * @example
 * // External links are returned unchanged
 * buildInternalLink("https://example.com/page", "cl")
 * // Returns: "https://example.com/page"
 *
 * @example
 * // Already prefixed links are returned unchanged
 * buildInternalLink("/us/products/item", "cl")
 * // Returns: "/us/products/item" (no double prefix)
 */
export function buildInternalLink(path: string, countryCode: string): string {
  // Return empty string as-is
  if (!path) {
    return path
  }

  // External URLs are returned unchanged
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Protocol-relative URLs are returned unchanged
  if (path.startsWith("//")) {
    return path
  }

  // Mailto and tel links are returned unchanged
  if (path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path
  }

  // Hash-only links are returned unchanged
  if (path.startsWith("#")) {
    return path
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  // Check if path already has a country code prefix (2-letter code after first /)
  // Pattern: /xx/ where xx is a 2-letter country code
  const countryCodePattern = /^\/[a-z]{2}\//i
  if (countryCodePattern.test(normalizedPath)) {
    // Already has a country code prefix, return as-is
    return normalizedPath
  }

  // Prepend country code
  return `/${countryCode}${normalizedPath}`
}

/**
 * Type for link objects that may need country code processing
 */
export interface ProcessableLink {
  url: string
  [key: string]: unknown
}

/**
 * Processes an array of link objects, adding country code to internal URLs.
 *
 * @param links - Array of objects containing url property
 * @param countryCode - The country code to prepend
 * @returns New array with processed URLs
 *
 * @example
 * const ctaButtons = [
 *   { label: "Buy", url: "/products/item", style: "primary" },
 *   { label: "Learn", url: "https://docs.example.com", style: "secondary" }
 * ]
 * processLinks(ctaButtons, "de")
 * // Returns:
 * // [
 * //   { label: "Buy", url: "/de/products/item", style: "primary" },
 * //   { label: "Learn", url: "https://docs.example.com", style: "secondary" }
 * // ]
 */
export function processLinks<T extends ProcessableLink>(
  links: T[],
  countryCode: string
): T[] {
  return links.map((link) => ({
    ...link,
    url: buildInternalLink(link.url, countryCode),
  }))
}
